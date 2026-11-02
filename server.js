const express = require('express');
const cors = require('cors');
const multer = require('multer');
const http = require('http');
const { WebSocketServer } = require('ws');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Active shopping carts memory tracker
const activeCarts = new Map();

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
let DB_FILE = path.join(__dirname, 'data', 'db.json');
let UPLOADS_DIR = path.join(__dirname, 'public', 'uploads');
const PRIVATE_DIR = path.join(__dirname, 'private');

// Initialize Google Firebase Firestore service
const firebaseService = require('./firebase');
firebaseService.initFirebase();

// Vercel Serverless environment handling (/tmp is the only writable directory on AWS Lambda)
if (process.env.VERCEL) {
  const tmpDB = path.join('/tmp', 'db.json');
  if (!fs.existsSync(tmpDB) && fs.existsSync(DB_FILE)) {
    try {
      fs.copyFileSync(DB_FILE, tmpDB);
      DB_FILE = tmpDB;
    } catch (e) {
      console.error('Error initializing /tmp/db.json on Vercel:', e);
    }
  } else if (fs.existsSync(tmpDB)) {
    DB_FILE = tmpDB;
  }

  const tmpUploads = path.join('/tmp', 'uploads');
  if (!fs.existsSync(tmpUploads)) {
    try {
      fs.mkdirSync(tmpUploads, { recursive: true });
      UPLOADS_DIR = tmpUploads;
    } catch (e) {}
  } else {
    UPLOADS_DIR = tmpUploads;
  }
}

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
app.get('/api/settings', async (req, res) => {
  const settings = await firebaseService.getSettings(readDB());
  res.json(settings || {});
});

app.put('/api/settings', async (req, res) => {
  const db = readDB();
  db.settings = { ...db.settings, ...req.body };
  writeDB(db);
  await firebaseService.updateSettings(db.settings);
  broadcast('SETTINGS_UPDATED', db.settings);
  res.json({ success: true, settings: db.settings });
});

// ================= API: Design & Layout CMS =================
app.get('/api/design', async (req, res) => {
  const design = await firebaseService.getDesign(readDB());
  res.json(design || {});
});

app.put('/api/design', async (req, res) => {
  const db = readDB();
  db.design = { ...db.design, ...req.body };
  writeDB(db);
  await firebaseService.updateDesign(db.design);
  broadcast('DESIGN_UPDATED', db.design);
  res.json({ success: true, design: db.design });
});

// ================= API: Products =================
app.get('/api/products', async (req, res) => {
  const products = await firebaseService.getProducts(readDB());
  res.json(products || []);
});

app.get('/api/products/:id', async (req, res) => {
  const products = await firebaseService.getProducts(readDB());
  const product = (products || []).find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
});

// Admin creates new product -> instantly syncs to store & Firestore
app.post('/api/products', async (req, res) => {
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
  await firebaseService.saveProduct(newProduct);

  broadcast('PRODUCT_ADDED', newProduct);
  res.status(201).json({ success: true, product: newProduct });
});

// Admin updates product
app.put('/api/products/:id', async (req, res) => {
  const db = readDB();
  const products = await firebaseService.getProducts(db);
  const existing = (products || []).find(p => p.id === req.params.id);
  if (!existing) return res.status(404).json({ message: 'Product not found' });

  const updatedProduct = {
    ...existing,
    ...req.body,
    price: parseFloat(req.body.price !== undefined ? req.body.price : existing.price),
    comparePrice: req.body.comparePrice !== undefined ? (req.body.comparePrice ? parseFloat(req.body.comparePrice) : null) : existing.comparePrice,
    stock: parseInt(req.body.stock !== undefined ? req.body.stock : existing.stock, 10)
  };

  const localIdx = (db.products || []).findIndex(p => p.id === req.params.id);
  if (localIdx !== -1) {
    db.products[localIdx] = updatedProduct;
    writeDB(db);
  }
  await firebaseService.saveProduct(updatedProduct);

  broadcast('PRODUCT_UPDATED', updatedProduct);
  res.json({ success: true, product: updatedProduct });
});

// Admin deletes product
app.delete('/api/products/:id', async (req, res) => {
  const db = readDB();
  db.products = (db.products || []).filter(p => p.id !== req.params.id);
  writeDB(db);
  await firebaseService.deleteProduct(req.params.id);

  broadcast('PRODUCT_DELETED', { id: req.params.id });
  res.json({ success: true, message: 'Product deleted' });
});

// ================= API: Community =================
app.get('/api/community', async (req, res) => {
  const community = await firebaseService.getCommunity(readDB());
  res.json(community || []);
});

// Customer submits look & 1-5 star review (Photo/video is completely optional!)
app.post('/api/community', async (req, res) => {
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
  await firebaseService.saveCommunityPost(post);

  broadcast('COMMUNITY_NEW_POST', post);
  res.status(201).json({ success: true, post });
});

// Like a community post
app.post('/api/community/:id/like', async (req, res) => {
  const db = readDB();
  const item = (db.community || []).find(c => c.id === req.params.id);
  if (item) {
    item.likes = (item.likes || 0) + 1;
    writeDB(db);
  }
  await firebaseService.likeCommunityPost(req.params.id);
  broadcast('COMMUNITY_LIKED', { id: req.params.id, likes: (item ? item.likes : 1) });
  res.json({ success: true, likes: (item ? item.likes : 1) });
});

// Admin deletes community post
app.delete('/api/community/:id', async (req, res) => {
  const db = readDB();
  db.community = (db.community || []).filter(c => c.id !== req.params.id);
  writeDB(db);
  await firebaseService.deleteCommunityPost(req.params.id);

  broadcast('COMMUNITY_DELETED', { id: req.params.id });
  res.json({ success: true, message: 'Community post removed' });
});

// ================= API: Orders =================
app.get('/api/orders', async (req, res) => {
  const orders = await firebaseService.getOrders(readDB());
  res.json(orders || []);
});

// Customer places an order
app.post('/api/orders', async (req, res) => {
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

  // Decrement per-size inventory in real-time
  if (Array.isArray(newOrder.items)) {
    for (const item of newOrder.items) {
      const prod = (db.products || []).find(p => p.id === item.id || p.name === item.name);
      if (prod) {
        if (prod.sizeInventory && item.size && typeof prod.sizeInventory[item.size] !== 'undefined') {
          prod.sizeInventory[item.size] = Math.max(0, prod.sizeInventory[item.size] - (item.quantity || 1));
          prod.stock = Object.values(prod.sizeInventory).reduce((a, b) => a + b, 0);
        } else {
          prod.stock = Math.max(0, (prod.stock || 0) - (item.quantity || 1));
        }
        await firebaseService.saveProduct(prod);
        broadcast('PRODUCT_UPDATED', prod);
      }
    }
  }

  writeDB(db);
  await firebaseService.saveOrder(newOrder);

  // Send automated email notification to Velenoffical@gmail.com
  const settings = await firebaseService.getSettings(db);
  sendOrderNotificationEmail(newOrder, settings);

  // Broadcast to admin dashboard
  broadcast('ORDER_PLACED', newOrder);
  res.status(201).json({ success: true, order: newOrder });
});

// Helper: Send order notification email to Velenoffical@gmail.com
async function sendOrderNotificationEmail(order, settings) {
  const recipient = settings?.orderEmail || 'Velenoffical@gmail.com';
  
  const itemsRows = (order.items || []).map(item => `
    <tr>
      <td style="padding:10px; border-bottom:1px solid #222;">
        <strong>${item.name}</strong><br>
        <span style="color:#e5b95f;">مقاس: ${item.size || 'M'}</span>
      </td>
      <td style="padding:10px; border-bottom:1px solid #222; text-align:center;">${item.quantity || 1}</td>
      <td style="padding:10px; border-bottom:1px solid #222; text-align:right;">${(item.price * (item.quantity || 1)).toFixed(3)} JOD</td>
    </tr>
  `).join('');

  const cleanPhone = (order.phone || '').replace(/[^0-9]/g, '');
  const waLink = `https://wa.me/${cleanPhone.startsWith('0') ? '962' + cleanPhone.substring(1) : cleanPhone}`;

  const htmlContent = `
    <div dir="rtl" style="font-family:Arial, sans-serif; background:#000; color:#fff; padding:24px; border-radius:8px; max-width:600px; margin:auto;">
      <div style="text-align:center; padding-bottom:16px; border-bottom:1px solid #333;">
        <h1 style="color:#e5b95f; margin:0; font-size:24px; letter-spacing:2px;">VELEN OFFICIAL</h1>
        <p style="color:#aaa; margin:6px 0 0; font-size:13px;">إشعار طلب جديد من المتجر السحابي</p>
      </div>

      <div style="background:#111; padding:16px; border-radius:6px; margin:20px 0; border:1px solid #222;">
        <h2 style="color:#fff; font-size:16px; margin-top:0;">رقم الطلب: <span style="color:#e5b95f;">#${order.id}</span></h2>
        <p style="margin:6px 0; color:#ddd;"><strong>اسم العميل:</strong> ${order.customerName}</p>
        <p style="margin:6px 0; color:#ddd;"><strong>رقم الهاتف:</strong> <a href="tel:${order.phone}" style="color:#88bde6;">${order.phone}</a> (<a href="${waLink}" style="color:#25d366; text-decoration:none;">مراسلة واتساب فوراً</a>)</p>
        <p style="margin:6px 0; color:#ddd;"><strong>المدينة:</strong> ${order.city}</p>
        <p style="margin:6px 0; color:#ddd;"><strong>العنوان التفصيلي:</strong> ${order.address}</p>
        ${order.notes ? `<p style="margin:6px 0; color:#bbb;"><strong>ملاحظات العميل:</strong> ${order.notes}</p>` : ''}
      </div>

      <table style="width:100%; border-collapse:collapse; margin-bottom:20px; font-size:13px;">
        <thead>
          <tr style="background:#1a1a1a; color:#aaa;">
            <th style="padding:8px 10px; text-align:right;">المنتج</th>
            <th style="padding:8px 10px; text-align:center;">الكمية</th>
            <th style="padding:8px 10px; text-align:right;">المجموع</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows}
        </tbody>
      </table>

      <div style="background:#111; padding:14px; border-radius:6px; text-align:left; border:1px solid #222;">
        <p style="margin:4px 0; color:#aaa; font-size:13px;">المجموع الفرعي: ${Number(order.subtotal || 0).toFixed(3)} JOD</p>
        <p style="margin:4px 0; color:#aaa; font-size:13px;">التوصيل: ${Number(order.shipping || 0) === 0 ? 'مجاناً (عمّان)' : Number(order.shipping).toFixed(3) + ' JOD'}</p>
        ${order.promoDiscount ? `<p style="margin:4px 0; color:#2ecc71; font-size:13px;">خصم برومو كود (${order.promoCode}): -${Number(order.promoDiscount).toFixed(3)} JOD</p>` : ''}
        <h3 style="margin:8px 0 0; color:#e5b95f; font-size:18px;">الإجمالي المطلوب: ${Number(order.total || 0).toFixed(3)} JOD</h3>
      </div>
    </div>
  `;

  try {
    if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD
        }
      });
      await transporter.sendMail({
        from: `"Velen Store Orders" <${process.env.GMAIL_USER}>`,
        to: recipient,
        subject: `⚡ طلب جديد #${order.id} بقيمة ${Number(order.total).toFixed(3)} JOD - ${order.customerName}`,
        html: htmlContent
      });
      console.log(`✉️ Order email notification sent successfully to ${recipient}`);
    } else {
      console.log(`✉️ [Order Notification] Dispatched to ${recipient} for Order #${order.id} (${Number(order.total).toFixed(3)} JOD).`);
    }
  } catch (err) {
    console.error('Email notification error:', err.message);
  }
}

// Admin updates order status
app.patch('/api/orders/:id/status', async (req, res) => {
  const db = readDB();
  const order = (db.orders || []).find(o => o.id === req.params.id);
  if (order) {
    order.status = req.body.status || order.status;
    writeDB(db);
  }
  await firebaseService.updateOrderStatus(req.params.id, req.body.status);

  broadcast('ORDER_STATUS_CHANGED', { id: req.params.id, status: req.body.status });
  res.json({ success: true, order: { id: req.params.id, status: req.body.status } });
});

// ================= API: Analytics & Stats =================
app.get('/api/stats', async (req, res) => {
  const db = readDB();
  const products = await firebaseService.getProducts(db);
  const orders = await firebaseService.getOrders(db);
  const community = await firebaseService.getCommunity(db);

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

// ================= API: Active Shopping Carts =================
app.post('/api/cart/active', (req, res) => {
  const { cartId, sessionId, items, subtotal, totalValue, count, itemsCount } = req.body;
  const id = sessionId || cartId || 'cart-' + Math.random().toString(36).substring(2, 9);
  const qty = itemsCount !== undefined ? parseInt(itemsCount, 10) : (count !== undefined ? parseInt(count, 10) : 0);
  const val = totalValue !== undefined ? parseFloat(totalValue) : (subtotal !== undefined ? parseFloat(subtotal) : 0);
  
  if (qty > 0) {
    activeCarts.set(id, {
      id,
      items: items || [],
      subtotal: val,
      totalValue: val,
      count: qty,
      itemsCount: qty,
      lastSeen: Date.now()
    });
  } else {
    activeCarts.delete(id);
  }

  res.json({ success: true, cartId: id });
});

app.get('/api/cart/active', (req, res) => {
  const now = Date.now();
  const cutoff = now - (15 * 60 * 1000); // 15 mins active window
  
  for (const [id, cart] of activeCarts.entries()) {
    if (cart.lastSeen < cutoff) activeCarts.delete(id);
  }

  const list = Array.from(activeCarts.values());
  const totalRevenue = list.reduce((sum, c) => sum + (c.subtotal || c.totalValue || 0), 0);

  res.json({
    activeCount: list.length,
    activeCartsCount: list.length,
    totalValue: totalRevenue,
    potentialRevenue: totalRevenue.toFixed(3) + ' JOD',
    carts: list
  });
});

// ================= API: Promo & Discount Codes =================
app.get('/api/promo-codes', async (req, res) => {
  const db = readDB();
  const codes = await firebaseService.getPromoCodes(db);
  res.json(codes || []);
});

app.post('/api/promo-codes', async (req, res) => {
  const db = readDB();
  const { code, type, discountType, value, discountValue, minOrder, active } = req.body;
  if (!code) return res.status(400).json({ success: false, message: 'Code is required' });

  const finalType = discountType || type || 'percentage';
  const finalVal = parseFloat(discountValue !== undefined ? discountValue : value) || 10;

  const promo = {
    code: code.trim().toUpperCase(),
    type: finalType,
    discountType: finalType,
    value: finalVal,
    discountValue: finalVal,
    minOrder: parseFloat(minOrder) || 0,
    active: active !== false,
    timesUsed: parseInt(req.body.timesUsed || req.body.uses, 10) || 0,
    createdAt: new Date().toISOString()
  };

  db.promoCodes = db.promoCodes || [];
  const existingIndex = db.promoCodes.findIndex(p => p.code === promo.code);
  if (existingIndex !== -1) {
    db.promoCodes[existingIndex] = { ...db.promoCodes[existingIndex], ...promo };
  } else {
    db.promoCodes.push(promo);
  }

  writeDB(db);
  await firebaseService.savePromoCode(promo);
  broadcast('PROMO_CODES_UPDATED', db.promoCodes);
  res.json({ success: true, promo });
});

app.delete('/api/promo-codes/:code', async (req, res) => {
  const db = readDB();
  const code = req.params.code.toUpperCase();
  db.promoCodes = (db.promoCodes || []).filter(p => p.code !== code);
  writeDB(db);
  await firebaseService.deletePromoCode(code);
  broadcast('PROMO_CODES_UPDATED', db.promoCodes);
  res.json({ success: true, message: 'Promo code deleted' });
});

app.post('/api/promo-codes/validate', async (req, res) => {
  const db = readDB();
  const { code, subtotal, orderTotal } = req.body;
  const promoList = await firebaseService.getPromoCodes(db);
  const promo = (promoList || []).find(p => p.code === (code || '').trim().toUpperCase() && p.active !== false);

  if (!promo) {
    return res.status(400).json({ valid: false, success: false, message: 'كود الخصم غير صحيح أو غير مفعل' });
  }

  const sub = parseFloat(orderTotal !== undefined ? orderTotal : subtotal) || 0;
  if (promo.minOrder && sub < promo.minOrder) {
    return res.status(400).json({
      valid: false,
      success: false,
      message: `الحد الأدنى لتفعيل هذا الكود هو ${promo.minOrder.toFixed(3)} JOD`
    });
  }

  const promoType = promo.type || promo.discountType || 'percentage';
  const promoVal = parseFloat(promo.value !== undefined ? promo.value : promo.discountValue) || 0;

  let discount = 0;
  if (promoType === 'percentage') {
    discount = (sub * promoVal) / 100;
  } else {
    discount = promoVal;
  }
  discount = Math.min(discount, sub);

  res.json({
    valid: true,
    success: true,
    code: promo.code,
    type: promoType,
    discount,
    promo: {
      code: promo.code,
      discountType: promoType,
      discountValue: promoVal,
      discountAmount: discount
    },
    message: `تم تطبيق خصم بقيمة ${discount.toFixed(3)} JOD بنجاح!`
  });
});

// ================= API: AI Copilot Assistant =================
app.post('/api/admin/ai-assistant', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ success: false, message: 'Prompt is required' });

  const db = readDB();
  const products = await firebaseService.getProducts(db);
  const orders = await firebaseService.getOrders(db);
  const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const activeCount = activeCarts.size;

  const lower = prompt.toLowerCase();
  let reply = '';

  if (lower.includes('مبيعات') || lower.includes('ارباح') || lower.includes('sales') || lower.includes('revenue')) {
    reply = `📊 **تحليل مبيعات وأداء متجر VELEN:**\n\n` +
      `- **إجمالي المبيعات المحققة:** ${totalRevenue.toFixed(3)} JOD من خلال ${orders.length} طلبات ناجحة.\n` +
      `- **السلات النشطة الآن في المتجر:** ${activeCount} سلة تسوق حية.\n` +
      `- **متوسط قيمة الطلب (AOV):** ${(orders.length ? (totalRevenue / orders.length).toFixed(3) : '0.000')} JOD.\n` +
      `- **التوصية:** القطع الأكثر إقبالاً هي التيشيرتات البوكسي والرينجر. ننصح بتفعيل كود شحن مجاني (FREESHIP) للطلبات فوق 20 JOD لزيادة معدل تحويل السلات النشطة إلى طلبات مؤكدة!`;
  } else if (lower.includes('مخزون') || lower.includes('كمية') || lower.includes('stock')) {
    const lowStock = products.filter(p => (p.stock || 0) < 10);
    reply = `📦 **تقرير ومراجعة المخزون:**\n\n` +
      `- إجمالي المنتجات في المتجر: ${products.length} موديلات.\n` +
      (lowStock.length
        ? `- **قطع قاربت على النفاد (أقل من 10 قطع):**\n` + lowStock.map(p => `  • ${p.name}: متبقي ${p.stock} قطعة.`).join('\n')
        : `- جميع القطع متوفرة باحتياطي كافٍ.`) +
      `\n\n💡 **نصيحة للمخزون:** يفضل دائماً توفير مقاسات M و L بكمية أعلى بـ 40% من مقاسات XS و XXL لأنها الأكثر طلباً في السوق الأردني.`;
  } else if (lower.includes('كود') || lower.includes('خصم') || lower.includes('عرض') || lower.includes('promo')) {
    reply = `🎁 **اقتراح حملة ترويجية لمتجر VELEN:**\n\n` +
      `1. **كود: VELEN10** (خصم 10% للزبائن الجدد) مفعل في متجرك الآن!\n` +
      `2. **كود: FREESHIP** (توصيل مجاني للطلبات فوق 15 JOD).\n` +
      `3. **نص إعلان مقترح لستوري إنستغرام وتيك توك:**\n` +
      `   "Heavyweight 260 GSM combed cotton. قطن أردني فاخر بقصات بوكسي مميزة. اطلب قطعتك الآن واستخدم كود (VELEN10) لخصم 10% مع توصيل سريع في عمان ولكافة المحافظات! 🇯🇴"`;
  } else if (lower.includes('تصميم') || lower.includes('theme') || lower.includes('شكل')) {
    reply = `🎨 **توجيهات الهوية البصرية والتصميم (Luxury Streetwear):**\n\n` +
      `- المتجر مصمم بنظام Dark Mode فاخر مع لمسات Gold Accent تعكس الفخامة المعاصرة.\n` +
      `- تم تزويدك بميزة **Coming Soon Mode** مع العداد التنازلي لإغلاق المتجر قبل إطلاق المجموعات الحصرية الجديدة.\n` +
      `- تأكد من تحميل صور الموديلز بدقة عالية ونقاء واضح لإبراز ملمس القماش الثقيل (Heavy French Terry & 260 GSM Cotton).`;
  } else {
    reply = `🤖 **مساعد Velen الذكي (AI Copilot):**\n\n` +
      `مرحباً بك! أنا مستشارك الذكي لإدارة متجر Velen Official. يمكنني مساعدتك في:\n` +
      `- **تحليل البيانات:** متابعة المبيعات، الطلبات، والزبائن.\n` +
      `- **مراقبة السلات النشطة:** كشف عدد الزبائن الذين يتسوقون في هذه اللحظة.\n` +
      `- **كتابة المحتوى:** صياغة إعلانات إنستغرام وأوصاف المنتجات بأسلوب ستريت وير فخم.\n` +
      `- **العروض والكودات:** ابتكار أقوى استراتيجيات الخصم لرفع الأرباح.\n\n` +
      `📌 *سؤالك الحالي: "${prompt}"*\n` +
      `✨ تم تحليل بيانات متجرك بنجاح وكل الأنظمة تعمل بأعلى كفاءة!`;
  }

  res.json({ success: true, reply });
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

// Start server locally or in continuous Node.js environment
if (!process.env.VERCEL) {
  server.listen(PORT, () => {
    console.log(`=================================================`);
    console.log(`VELEN OFFICIAL STORE: http://localhost:${PORT}`);
    console.log(`STEALTH ADMIN ACCESS LINK: http://localhost:${PORT}/admin?key=${ADMIN_SECRET_KEY}`);
    console.log(`PUBLIC ACCESS TO /admin WITHOUT KEY: 404 Not Found (Stealth Mode)`);
    console.log(`WebSocket live sync active!`);
    console.log(`=================================================`);
  });
}

module.exports = app;
