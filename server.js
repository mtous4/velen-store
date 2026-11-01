const express = require('express');
const cors = require('cors');
const multer = require('multer');
const http = require('http');
const { WebSocketServer } = require('ws');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Load environment variables from .env file if it exists
const ENV_FILE = path.join(__dirname, '.env');
if (fs.existsSync(ENV_FILE)) {
  const envContent = fs.readFileSync(ENV_FILE, 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [k, ...v] = trimmed.split('=');
      const key = k?.trim();
      const val = v.join('=').trim().replace(/^["'](.*)["']$/, '$1');
      if (key && !process.env[key]) {
        process.env[key] = val;
      }
    }
  });
}

const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'data', 'db.json');
const UPLOADS_DIR = path.join(__dirname, 'public', 'uploads');
const PRIVATE_DIR = path.join(__dirname, 'private');

// Admin Security & Domain Stealth Configuration
const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY || 'velen-adm-sec-962';
const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE || '2026';
const STORE_DOMAIN = (process.env.STORE_DOMAIN || '').trim().toLowerCase();
const ADMIN_DOMAIN = (process.env.ADMIN_DOMAIN || '').trim().toLowerCase();

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Helpers for Database persistence
function readDB() {
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading DB:', err);
    return { settings: {}, products: [], community: [], orders: [] };
  }
}

function writeDB(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing DB:', err);
  }
}

// Helper to parse cookies from headers
function parseCookies(req) {
  const list = {};
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return list;
  cookieHeader.split(';').forEach(cookie => {
    let [name, ...rest] = cookie.split('=');
    name = name?.trim();
    if (!name) return;
    const value = rest.join('=').trim();
    list[name] = decodeURIComponent(value);
  });
  return list;
}

// WebSocket broadcast to all connected clients (real-time sync)
function broadcast(event, payload) {
  const message = JSON.stringify({ event, payload });
  wss.clients.forEach(client => {
    if (client.readyState === 1) { // OPEN
      client.send(message);
    }
  });
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ================= STEALTH ADMIN GUARD & DOMAIN ISOLATION =================
// Intercept admin requests BEFORE express.static serves anything publicly
app.use((req, res, next) => {
  const host = (req.hostname || req.headers.host || '').toLowerCase().split(':')[0];
  const cookies = parseCookies(req);
  const queryKey = req.query.key || req.query.secret;
  const isKeyAuthorized = queryKey === ADMIN_SECRET_KEY || cookies.velen_admin_key === ADMIN_SECRET_KEY;

  function serveAdminPage() {
    if (queryKey === ADMIN_SECRET_KEY) {
      res.setHeader('Set-Cookie', `velen_admin_key=${ADMIN_SECRET_KEY}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${30 * 24 * 3600}`);
    }
    const htmlPath = path.join(PRIVATE_DIR, 'admin.html');
    if (fs.existsSync(htmlPath)) {
      return res.type('html').send(fs.readFileSync(htmlPath, 'utf8'));
    }
    return res.status(500).send('Admin template missing');
  }

  // 1. If request is on the Public Store domain, 100% hide admin paths
  if (STORE_DOMAIN && host === STORE_DOMAIN) {
    if (req.path === '/admin' || req.path === '/admin/' || req.path === '/admin.html' || req.path === '/css/admin.css' || req.path === '/js/admin.js') {
      return res.status(404).send('<!DOCTYPE html><html><head><title>404 Not Found</title></head><body><h1>404 Not Found</h1><p>The requested URL was not found on this server.</p></body></html>');
    }
  }

  // 2. If request is on the dedicated Admin domain
  if (ADMIN_DOMAIN && host === ADMIN_DOMAIN) {
    // Root path on admin domain
    if (req.path === '/' || req.path === '/index.html') {
      if (isKeyAuthorized) {
        return serveAdminPage();
      } else {
        // Camouflage as 404: neither customer nor scanner knows the admin panel exists!
        return res.status(404).send('<!DOCTYPE html><html><head><title>404 Not Found</title></head><body><h1>404 Not Found</h1><p>The requested URL was not found on this server.</p></body></html>');
      }
    }
  }

  // 3. Admin routes (/admin, /admin/, /admin.html)
  if (req.path === '/admin' || req.path === '/admin/' || req.path === '/admin.html') {
    if (isKeyAuthorized) {
      return serveAdminPage();
    } else {
      // Complete camouflage: realistic 404 response
      return res.status(404).send('<!DOCTYPE html><html><head><title>404 Not Found</title></head><body><h1>404 Not Found</h1><p>The requested URL was not found on this server.</p></body></html>');
    }
  }

  // 4. Protect admin assets from direct public reconnaissance
  if (req.path === '/css/admin.css' || req.path === '/js/admin.js') {
    if (!isKeyAuthorized) {
      return res.status(404).send('Not Found');
    }
  }

  next();
});

app.use(express.static(path.join(__dirname, 'public')));

// Configure Multer for media uploads (Images and Videos)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    cb(null, 'velen-' + uniqueSuffix + ext);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB for photos & videos
});

// Upload media endpoint
app.post('/api/upload', upload.single('media'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  const fileUrl = '/uploads/' + req.file.filename;
  const isVideo = req.file.mimetype.startsWith('video');
  res.json({
    success: true,
    url: fileUrl,
    filename: req.file.filename,
    mediaType: isVideo ? 'video' : 'photo'
  });
});

// ================= API: Settings =================
app.get('/api/settings', (req, res) => {
  const db = readDB();
  res.json(db.settings || {});
});

app.put('/api/settings', (req, res) => {
  const db = readDB();
  db.settings = { ...db.settings, ...req.body };
  writeDB(db);
  broadcast('SETTINGS_UPDATED', db.settings);
  res.json({ success: true, settings: db.settings });
});

// ================= API: Design & Layout CMS =================
app.get('/api/design', (req, res) => {
  const db = readDB();
  res.json(db.design || {});
});

app.put('/api/design', (req, res) => {
  const db = readDB();
  db.design = { ...db.design, ...req.body };
  writeDB(db);
  broadcast('DESIGN_UPDATED', db.design);
  res.json({ success: true, design: db.design });
});

// ================= API: Products =================
app.get('/api/products', (req, res) => {
  const db = readDB();
  res.json(db.products || []);
});

app.get('/api/products/:id', (req, res) => {
  const db = readDB();
  const product = (db.products || []).find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
});

// Admin creates new product -> instantly syncs to store
app.post('/api/products', (req, res) => {
  const db = readDB();
  const newProduct = {
    id: 'prod-' + Date.now(),
    name: req.body.name || 'Untitled Velen Piece',
    category: req.body.category || 'Tees',
    price: parseFloat(req.body.price) || 0.0,
    comparePrice: req.body.comparePrice ? parseFloat(req.body.comparePrice) : null,
    onSale: req.body.onSale !== undefined ? Boolean(req.body.onSale) : true,
    featured: req.body.featured !== undefined ? Boolean(req.body.featured) : false,
    image: req.body.image || '/assets/velen-logo.jpg',
    images: req.body.images && req.body.images.length > 0 ? req.body.images : [req.body.image || '/assets/velen-logo.jpg'],
    sizes: req.body.sizes && req.body.sizes.length > 0 ? req.body.sizes : ['S', 'M', 'L', 'XL'],
    colors: req.body.colors || [{ name: 'Default', hex: '#000000' }],
    stock: parseInt(req.body.stock, 10) || 20,
    description: req.body.description || 'Premium Everyday Essential designed by Velen.',
    fabric: req.body.fabric || '100% Premium Jordanian Cotton',
    createdAt: new Date().toISOString()
  };

  db.products = db.products || [];
  db.products.unshift(newProduct);
  writeDB(db);

  broadcast('PRODUCT_ADDED', newProduct);
  res.status(201).json({ success: true, product: newProduct });
});

// Admin updates product
app.put('/api/products/:id', (req, res) => {
  const db = readDB();
  const index = (db.products || []).findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: 'Product not found' });

  const updatedProduct = {
    ...db.products[index],
    ...req.body,
    price: parseFloat(req.body.price !== undefined ? req.body.price : db.products[index].price),
    comparePrice: req.body.comparePrice !== undefined ? (req.body.comparePrice ? parseFloat(req.body.comparePrice) : null) : db.products[index].comparePrice,
    stock: parseInt(req.body.stock !== undefined ? req.body.stock : db.products[index].stock, 10)
  };

  db.products[index] = updatedProduct;
  writeDB(db);

  broadcast('PRODUCT_UPDATED', updatedProduct);
  res.json({ success: true, product: updatedProduct });
});

// Admin deletes product
app.delete('/api/products/:id', (req, res) => {
  const db = readDB();
  const initialLen = (db.products || []).length;
  db.products = (db.products || []).filter(p => p.id !== req.params.id);

  if (db.products.length === initialLen) {
    return res.status(404).json({ message: 'Product not found' });
  }

  writeDB(db);
  broadcast('PRODUCT_DELETED', { id: req.params.id });
  res.json({ success: true, message: 'Product deleted' });
});

// ================= API: Community =================
app.get('/api/community', (req, res) => {
  const db = readDB();
  res.json(db.community || []);
});

// Customer submits look & 1-5 star review (Photo/video is completely optional!)
app.post('/api/community', (req, res) => {
  const db = readDB();
  const rawMediaUrl = req.body.mediaUrl && req.body.mediaUrl.trim() !== '' ? req.body.mediaUrl.trim() : null;
  const hasMedia = Boolean(rawMediaUrl);

  const post = {
    id: 'comm-' + Date.now(),
    author: req.body.author || 'Velen Community Member',
    authorTag: req.body.authorTag || '@' + (req.body.author || 'member').toLowerCase().replace(/\s+/g, '_'),
    avatar: req.body.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    mediaType: hasMedia ? (req.body.mediaType || 'photo') : 'text',
    mediaUrl: rawMediaUrl,
    videoUrl: hasMedia && (req.body.mediaType === 'video' || (rawMediaUrl && rawMediaUrl.includes('.mp4'))) ? rawMediaUrl : null,
    subtitle: req.body.subtitle || 'Velen Style',
    rating: Math.min(5, Math.max(1, parseInt(req.body.rating, 10) || 5)),
    comment: req.body.comment || 'Amazing quality and fit!',
    itemWorn: req.body.itemWorn || 'Velen Essential',
    likes: 0,
    approved: true,
    createdAt: new Date().toISOString()
  };

  db.community = db.community || [];
  db.community.unshift(post);
  writeDB(db);

  broadcast('COMMUNITY_NEW_POST', post);
  res.status(201).json({ success: true, post });
});

// Like a community post
app.post('/api/community/:id/like', (req, res) => {
  const db = readDB();
  const item = (db.community || []).find(c => c.id === req.params.id);
  if (!item) return res.status(404).json({ message: 'Post not found' });

  item.likes = (item.likes || 0) + 1;
  writeDB(db);
  broadcast('COMMUNITY_LIKED', { id: item.id, likes: item.likes });
  res.json({ success: true, likes: item.likes });
});

// Admin deletes community post
app.delete('/api/community/:id', (req, res) => {
  const db = readDB();
  db.community = (db.community || []).filter(c => c.id !== req.params.id);
  writeDB(db);
  broadcast('COMMUNITY_DELETED', { id: req.params.id });
  res.json({ success: true, message: 'Community post removed' });
});

// ================= API: Orders =================
app.get('/api/orders', (req, res) => {
  const db = readDB();
  res.json(db.orders || []);
});

// Customer places an order
app.post('/api/orders', (req, res) => {
  const db = readDB();
  const orderNumber = 'ORD-' + Math.floor(1000 + Math.random() * 9000);
  const newOrder = {
    id: orderNumber,
    customerName: req.body.customerName || 'Customer',
    phone: req.body.phone || '',
    city: req.body.city || 'Amman',
    address: req.body.address || '',
    notes: req.body.notes || '',
    items: req.body.items || [],
    subtotal: parseFloat(req.body.subtotal) || 0,
    shipping: parseFloat(req.body.shipping) || 0,
    total: parseFloat(req.body.total) || 0,
    paymentMethod: req.body.paymentMethod || 'Cash on Delivery (دفع عند الاستلام)',
    status: 'Pending',
    createdAt: new Date().toISOString()
  };

  db.orders = db.orders || [];
  db.orders.unshift(newOrder);
  writeDB(db);

  // Broadcast to admin dashboard
  broadcast('ORDER_PLACED', newOrder);
  res.status(201).json({ success: true, order: newOrder });
});

// Admin updates order status
app.patch('/api/orders/:id/status', (req, res) => {
  const db = readDB();
  const order = (db.orders || []).find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });

  order.status = req.body.status || order.status;
  writeDB(db);

  broadcast('ORDER_STATUS_CHANGED', order);
  res.json({ success: true, order });
});

// ================= API: Analytics & Stats =================
app.get('/api/stats', (req, res) => {
  const db = readDB();
  const products = db.products || [];
  const orders = db.orders || [];
  const community = db.community || [];

  const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const totalOrders = orders.length;
  const activeProducts = products.length;
  const avgRating = community.length > 0 
    ? (community.reduce((acc, c) => acc + (Number(c.rating) || 5), 0) / community.length).toFixed(1)
    : '5.0';

  res.json({
    totalRevenue: totalRevenue.toFixed(3) + ' JOD',
    totalOrders,
    activeProducts,
    communityPosts: community.length,
    avgRating
  });
});

// ================= API: Admin Authentication =================
app.post('/api/admin/verify', (req, res) => {
  const { passcode, key } = req.body;
  const isKeyValid = key && key === ADMIN_SECRET_KEY;
  const isPassValid = passcode && passcode === ADMIN_PASSCODE;

  if (isKeyValid || isPassValid) {
    res.setHeader('Set-Cookie', `velen_admin_key=${ADMIN_SECRET_KEY}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${30 * 24 * 3600}`);
    return res.json({ success: true, message: 'تم التحقق بنجاح، مرحباً بك في لوحة تحكم Velen' });
  }

  return res.status(401).json({ success: false, message: 'رمز الدخول الرئيسي (Passcode) غير صحيح' });
});

app.post('/api/admin/logout', (req, res) => {
  res.setHeader('Set-Cookie', `velen_admin_key=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
  res.json({ success: true, message: 'تم قفل لوحة التحكم' });
});

// Start server
server.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`VELEN OFFICIAL STORE: http://localhost:${PORT}`);
  console.log(`STEALTH ADMIN ACCESS LINK: http://localhost:${PORT}/admin?key=${ADMIN_SECRET_KEY}`);
  console.log(`PUBLIC ACCESS TO /admin WITHOUT KEY: 404 Not Found (Stealth Mode)`);
  console.log(`WebSocket live sync active!`);
  console.log(`=================================================`);
});
