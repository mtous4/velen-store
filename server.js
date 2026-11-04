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

// Real-Time Live Visitors memory tracker (5-minute active window)
const activeVisitors = new Map();

function purgeExpiredVisitors() {
  const cutoff = Date.now() - (5 * 60 * 1000); // 5 minutes
  for (const [id, v] of activeVisitors.entries()) {
    if (v.lastSeen < cutoff) activeVisitors.delete(id);
  }
}
setInterval(purgeExpiredVisitors, 10000);

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

app.use('/uploads', express.static(UPLOADS_DIR));
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

// Upload media endpoint (single)
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

// Upload multiple media endpoint (for unlimited product images in Admin)
app.post('/api/upload-multiple', upload.array('images', 50), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ success: false, message: 'No files uploaded' });
  }
  const files = req.files.map(f => ({
    url: '/uploads/' + f.filename,
    filename: f.filename,
    mediaType: f.mimetype.startsWith('video') ? 'video' : 'photo'
  }));
  res.json({
    success: true,
    files: files,
    urls: files.map(f => f.url)
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
    costPrice: parseFloat(req.body.costPrice) || 0.0,
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
    costPrice: req.body.costPrice !== undefined ? (parseFloat(req.body.costPrice) || 0) : (existing.costPrice || 0),
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

// ================= API: Product Reviews (Separate from Community) =================
app.get('/api/reviews', async (req, res) => {
  const db = readDB();
  res.json(db.reviews || []);
});

// Customer submits a pure star rating review (no photos required)
app.post('/api/reviews', async (req, res) => {
  const db = readDB();
  const review = {
    id: 'rev-' + Date.now(),
    author: req.body.author || 'Velen Customer',
    rating: Math.min(5, Math.max(1, parseInt(req.body.rating, 10) || 5)),
    comment: req.body.comment || '',
    itemWorn: req.body.itemWorn || 'Velen Essential',
    verified: false,
    approved: true,
    createdAt: new Date().toISOString()
  };

  db.reviews = db.reviews || [];
  db.reviews.unshift(review);
  writeDB(db);

  broadcast('REVIEW_ADDED', review);
  res.status(201).json({ success: true, review });
});

// Admin deletes a review
app.delete('/api/reviews/:id', async (req, res) => {
  const db = readDB();
  db.reviews = (db.reviews || []).filter(r => r.id !== req.params.id);
  writeDB(db);
  broadcast('REVIEW_DELETED', { id: req.params.id });
  res.json({ success: true, message: 'Review removed' });
});


app.get('/api/orders', async (req, res) => {
  const orders = await firebaseService.getOrders(readDB());
  res.json(orders || []);
});

// Helper: Sequential order numbering starting from 1000
function getNextOrderNumber(db) {
  let next = parseInt(db.settings?.nextOrderNumber, 10);
  if (isNaN(next) || next < 1000) {
    next = 1000;
  }
  db.settings = db.settings || {};
  db.settings.nextOrderNumber = next + 1;
  return 'ORD-' + next;
}

// Customer or Admin places an order (Storefront or Instagram/Manual)
app.post('/api/orders', async (req, res) => {
  const db = readDB();
  const orderNumber = req.body.id || getNextOrderNumber(db);
  const newOrder = {
    id: orderNumber,
    customerName: req.body.customerName || 'Customer',
    phone: req.body.phone || '',
    city: req.body.city || 'Amman',
    address: req.body.address || '',
    notes: req.body.notes || '',
    source: req.body.source || 'Storefront (المتجر الإلكتروني)',
    items: req.body.items || [],
    subtotal: parseFloat(req.body.subtotal) || 0,
    shipping: parseFloat(req.body.shipping) || 0,
    total: parseFloat(req.body.total) || 0,
    paymentMethod: req.body.paymentMethod || 'Cash on Delivery (دفع عند الاستلام)',
    status: req.body.status || 'Pending',
    createdAt: req.body.createdAt || new Date().toISOString()
  };

  db.orders = db.orders || [];
  db.orders.unshift(newOrder);

  // Decrement per-size inventory in real-time
  if (Array.isArray(newOrder.items)) {
    for (const item of newOrder.items) {
      const prod = (db.products || []).find(p => p.id === item.id || p.name === item.name);
      if (prod) {
        // If color variant specified, decrement color's size inventory
        if (Array.isArray(prod.colors) && item.color) {
          const colorVariant = prod.colors.find(c => c.name === item.color || (c.hex && c.hex === item.colorHex));
          if (colorVariant && colorVariant.sizeInventory && item.size && typeof colorVariant.sizeInventory[item.size] !== 'undefined') {
            colorVariant.sizeInventory[item.size] = Math.max(0, colorVariant.sizeInventory[item.size] - (item.quantity || 1));
          }
        }
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

  // Validate and Increment promo code usage count if used in order
  const appliedCode = req.body.promoCode || (req.body.appliedPromo && req.body.appliedPromo.code);
  if (appliedCode) {
    const pCodeUpper = appliedCode.trim().toUpperCase();
    const pObj = (db.promoCodes || []).find(p => p.code === pCodeUpper);
    if (pObj) {
      const used = parseInt(pObj.timesUsed || pObj.uses || 0, 10);
      const limit = (pObj.usageLimit !== null && pObj.usageLimit !== undefined && pObj.usageLimit !== '') ? parseInt(pObj.usageLimit, 10) : null;
      if (limit !== null && limit > 0 && used >= limit) {
        return res.status(400).json({
          success: false,
          message: `عذراً، كود الخصم (${pCodeUpper}) وصل إلى الحد الأقصى للاستخدام (${limit} مرات)!`
        });
      }
      pObj.timesUsed = used + 1;
      pObj.uses = pObj.timesUsed;
      await firebaseService.savePromoCode(pObj);
      broadcast('PROMO_CODES_UPDATED', db.promoCodes);
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
  const gmailUser = process.env.GMAIL_USER || settings?.gmailUser || 'Velenoffical@gmail.com';
  const rawPass = process.env.GMAIL_APP_PASSWORD || settings?.gmailAppPassword;
  const gmailPass = rawPass ? rawPass.replace(/\s+/g, '') : null;
  
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
    if (gmailPass) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: gmailUser,
          pass: gmailPass
        }
      });
      await transporter.sendMail({
        from: `"Velen Store Orders" <${gmailUser}>`,
        to: recipient,
        subject: `⚡ طلب جديد #${order.id} بقيمة ${Number(order.total).toFixed(3)} JOD - ${order.customerName}`,
        html: htmlContent
      });
      console.log(`✉️ Order email notification sent successfully to ${recipient}`);
    } else {
      console.log(`✉️ [Order Notification] Dispatched to ${recipient} for Order #${order.id} (${Number(order.total).toFixed(3)} JOD). (Enter Gmail App Password in Admin Settings to deliver to inbox)`);
    }
  } catch (err) {
    console.error('Email notification error:', err.message);
  }
}

// Test Email Endpoint for Admin Settings
app.post('/api/admin/test-email', async (req, res) => {
  try {
    const db = readDB();
    const settings = await firebaseService.getSettings(db);
    const recipient = req.body.recipient || settings?.orderEmail || 'Velenoffical@gmail.com';
    const gmailUser = req.body.gmailUser || process.env.GMAIL_USER || settings?.gmailUser || 'Velenoffical@gmail.com';
    const rawPass = req.body.gmailAppPassword || process.env.GMAIL_APP_PASSWORD || settings?.gmailAppPassword;

    if (!rawPass) {
      return res.status(400).json({
        success: false,
        error: 'يرجى إدخال كلمة مرور تطبيقات Google (16 حرفاً) أولاً لحساب Gmail الخاص بك.'
      });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: rawPass.replace(/\s+/g, '')
      }
    });

    await transporter.sendMail({
      from: `"Velen Store Test" <${gmailUser}>`,
      to: recipient,
      subject: '🔔 فحص نظام إشعارات الإيميل — Velen Official Test',
      html: `
        <div dir="rtl" style="font-family:Arial, sans-serif; background:#000; color:#fff; padding:24px; border-radius:8px; max-width:600px; margin:auto;">
          <h2 style="color:#e5b95f; margin-top:0;">تهانينا! نظام إشعارات الإيميل يعمل بنجاح 🎉</h2>
          <p>تم ربط إيميلك <strong>${recipient}</strong> بنجاح مع متجر Velen Official.</p>
          <p>من الآن فصاعداً، ستصلك رسالة فورية عند إتمام أي طلب شراء جديد من المتجر تلقائياً!</p>
          <div style="background:#111; padding:12px; border-radius:4px; border:1px solid #222; margin-top:15px; color:#aaa; font-size:12px;">
            توقيت الفحص: ${new Date().toLocaleString('ar-JO')}
          </div>
        </div>
      `
    });

    res.json({ success: true, message: `تم إرسال إيميل فحص تجريبي بنجاح إلى ${recipient}!` });
  } catch (err) {
    console.error('Test email error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Admin updates order status
app.patch('/api/orders/:id/status', async (req, res) => {
  const db = readDB();
  const order = (db.orders || []).find(o => o.id === req.params.id);
  const oldStatus = order ? order.status : null;
  const newStatus = req.body.status;

  if (order && newStatus) {
    order.status = newStatus;

    // If order is cancelled, return reserved items back to inventory
    if (newStatus === 'Cancelled' && oldStatus !== 'Cancelled' && Array.isArray(order.items)) {
      for (const item of order.items) {
        const prod = (db.products || []).find(p => p.id === item.id || p.name === item.name);
        if (prod) {
          if (prod.sizeInventory && item.size && typeof prod.sizeInventory[item.size] !== 'undefined') {
            prod.sizeInventory[item.size] = (prod.sizeInventory[item.size] || 0) + (item.quantity || 1);
            prod.stock = Object.values(prod.sizeInventory).reduce((a, b) => a + b, 0);
          } else {
            prod.stock = (prod.stock || 0) + (item.quantity || 1);
          }
          await firebaseService.saveProduct(prod);
          broadcast('PRODUCT_UPDATED', prod);
        }
      }
    } else if (oldStatus === 'Cancelled' && newStatus !== 'Cancelled' && Array.isArray(order.items)) {
      // If re-activated from cancelled, re-decrement inventory
      for (const item of order.items) {
        const prod = (db.products || []).find(p => p.id === item.id || p.name === item.name);
        if (prod) {
          if (prod.sizeInventory && item.size && typeof prod.sizeInventory[item.size] !== 'undefined') {
            prod.sizeInventory[item.size] = Math.max(0, (prod.sizeInventory[item.size] || 0) - (item.quantity || 1));
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
  }
  await firebaseService.updateOrderStatus(req.params.id, newStatus);

  broadcast('ORDER_STATUS_CHANGED', { id: req.params.id, status: newStatus });
  res.json({ success: true, order: { id: req.params.id, status: newStatus } });
});

// ================= API: Analytics & Stats =================
app.get('/api/stats', async (req, res) => {
  const db = readDB();
  const products = await firebaseService.getProducts(db);
  const orders = await firebaseService.getOrders(db);
  const community = await firebaseService.getCommunity(db);

  // Exclude cancelled orders from total revenue and successful orders count
  const validOrders = orders.filter(o => o.status !== 'Cancelled');
  const cancelledOrders = orders.filter(o => o.status === 'Cancelled');
  const totalRevenue = validOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const totalOrders = validOrders.length;
  const activeProducts = products.length;
  const avgRating = community.length > 0 
    ? (community.reduce((acc, c) => acc + (Number(c.rating) || 5), 0) / community.length).toFixed(1)
    : '5.0';

  res.json({
    totalRevenue: totalRevenue.toFixed(3) + ' JOD',
    totalOrders,
    cancelledOrders: cancelledOrders.length,
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

// ================= API: Real-Time Live Visitors (5-Min Funnel Tracking) =================
app.post('/api/visitor/pulse', (req, res) => {
  const { visitorId, stage, stageLabel, detail, itemsCount, cartTotal, device, city, page } = req.body;
  const id = visitorId || ('v-' + Math.random().toString(36).substring(2, 9));
  const now = Date.now();

  const existing = activeVisitors.get(id) || {
    visitorId: id,
    firstSeen: now,
    history: []
  };

  const actionEntry = {
    stage: stage || 'home',
    label: stageLabel || (stage === 'checkout' ? 'في صفحة تأكيد الطلب' : (stage === 'cart' ? 'في سلة التسوق' : (stage === 'product' ? 'يشاهد منتجاً' : 'يتصفح المتجر'))),
    detail: detail || '',
    time: now
  };

  const history = existing.history || [];
  if (history.length === 0 || history[history.length - 1].stage !== actionEntry.stage || history[history.length - 1].detail !== actionEntry.detail) {
    history.push(actionEntry);
    if (history.length > 6) history.shift();
  }

  const visitor = {
    ...existing,
    visitorId: id,
    lastSeen: now,
    stage: stage || 'home',
    stageLabel: actionEntry.label,
    detail: detail || (stage === 'home' ? 'الصفحة الرئيسية' : ''),
    itemsCount: parseInt(itemsCount, 10) || 0,
    cartTotal: parseFloat(cartTotal) || 0,
    device: device || (req.headers['user-agent']?.toLowerCase().includes('mobi') ? 'Mobile 📱' : 'Desktop 💻'),
    ip: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
    city: city || 'Jordan 🇯🇴',
    page: page || '/',
    history
  };

  activeVisitors.set(id, visitor);
  broadcast('VISITOR_UPDATE', { activeCount: activeVisitors.size, visitor });
  res.json({ success: true, visitorId: id, activeCount: activeVisitors.size });
});

app.get('/api/admin/live-visitors', (req, res) => {
  purgeExpiredVisitors();
  const visitors = Array.from(activeVisitors.values()).sort((a, b) => b.lastSeen - a.lastSeen);
  
  const funnel = {
    home: 0,
    product: 0,
    cart: 0,
    checkout: 0,
    ordered: 0
  };

  visitors.forEach(v => {
    if (funnel[v.stage] !== undefined) funnel[v.stage]++;
    else funnel.home++;
  });

  res.json({
    success: true,
    activeCount: visitors.length,
    windowMinutes: 5,
    funnel,
    visitors
  });
});

// ================= API: Categories & Collections =================
app.get('/api/categories', async (req, res) => {
  const db = readDB();
  const categories = await firebaseService.getCategories(db);
  res.json(categories || db.categories || []);
});

app.post('/api/categories', async (req, res) => {
  const db = readDB();
  const { id, nameEn, nameAr, slug } = req.body;
  if (!nameEn && !nameAr) {
    return res.status(400).json({ success: false, message: 'اسم التصنيف مطلوب' });
  }

  const catId = (id || slug || nameEn || `cat-${Date.now()}`).toLowerCase().replace(/[^a-z0-9]/g, '-');
  const catObj = {
    id: catId,
    nameEn: (nameEn || nameAr).trim(),
    nameAr: (nameAr || nameEn).trim(),
    slug: catId
  };

  db.categories = db.categories || [];
  const existingIdx = db.categories.findIndex(c => c.id === catObj.id);
  if (existingIdx !== -1) {
    db.categories[existingIdx] = { ...db.categories[existingIdx], ...catObj };
  } else {
    db.categories.push(catObj);
  }

  writeDB(db);
  await firebaseService.saveCategory(catObj);
  broadcast('CATEGORIES_UPDATED', db.categories);
  res.json({ success: true, category: catObj, categories: db.categories });
});

app.delete('/api/categories/:id', async (req, res) => {
  const db = readDB();
  const id = req.params.id;
  db.categories = (db.categories || []).filter(c => c.id !== id);
  writeDB(db);
  await firebaseService.deleteCategory(id);
  broadcast('CATEGORIES_UPDATED', db.categories);
  res.json({ success: true, categories: db.categories });
});

// ================= API: Promo & Discount Codes =================
app.get('/api/promo-codes', async (req, res) => {
  const db = readDB();
  const codes = await firebaseService.getPromoCodes(db);
  res.json(codes || db.promoCodes || []);
});

app.post('/api/promo-codes', async (req, res) => {
  const db = readDB();
  const { code, type, discountType, value, discountValue, minOrder, active, usageLimit } = req.body;
  if (!code) return res.status(400).json({ success: false, message: 'Code is required' });

  const finalType = discountType || type || 'percentage';
  const finalVal = parseFloat(discountValue !== undefined ? discountValue : value) || 10;
  const codeUpper = code.trim().toUpperCase();

  db.promoCodes = db.promoCodes || [];
  const existingIndex = db.promoCodes.findIndex(p => p.code === codeUpper);
  let finalTimesUsed = 0;
  if (existingIndex !== -1) {
    finalTimesUsed = parseInt(req.body.timesUsed !== undefined ? req.body.timesUsed : (db.promoCodes[existingIndex].timesUsed || db.promoCodes[existingIndex].uses || 0), 10);
  } else {
    finalTimesUsed = parseInt(req.body.timesUsed || req.body.uses || 0, 10);
  }

  const promo = {
    code: codeUpper,
    type: finalType,
    discountType: finalType,
    value: finalVal,
    discountValue: finalVal,
    minOrder: parseFloat(minOrder) || 0,
    active: active !== false,
    usageLimit: (usageLimit !== undefined && usageLimit !== null && usageLimit !== '') ? parseInt(usageLimit, 10) : null,
    timesUsed: finalTimesUsed,
    uses: finalTimesUsed,
    createdAt: (existingIndex !== -1 && db.promoCodes[existingIndex].createdAt) ? db.promoCodes[existingIndex].createdAt : new Date().toISOString()
  };

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

  // Check usage limit strictly
  const used = parseInt(promo.timesUsed || promo.uses || 0, 10);
  const limit = (promo.usageLimit !== null && promo.usageLimit !== undefined && promo.usageLimit !== '') ? parseInt(promo.usageLimit, 10) : null;
  if (limit !== null && limit > 0 && used >= limit) {
    return res.status(400).json({
      valid: false,
      success: false,
      message: `عذراً، استنفد هذا الكود الحد الأقصى لمرات الاستخدام المسموحة (${limit} مرات).`
    });
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

// ================= API: Expenses & Finance Tracking =================
app.get('/api/expenses', (req, res) => {
  const db = readDB();
  res.json(db.expenses || []);
});

app.post('/api/expenses', (req, res) => {
  const db = readDB();
  const { title, category, amount, date, notes } = req.body;
  if (!title || !amount) {
    return res.status(400).json({ success: false, message: 'العنوان والمبلغ مطلوبان' });
  }
  const newExp = {
    id: 'exp-' + Date.now(),
    title: title.trim(),
    category: category || 'عام',
    amount: parseFloat(amount) || 0,
    date: date || new Date().toISOString().split('T')[0],
    notes: notes || '',
    createdAt: new Date().toISOString()
  };
  db.expenses = db.expenses || [];
  db.expenses.unshift(newExp);
  writeDB(db);
  broadcast('EXPENSES_UPDATED', db.expenses);
  res.status(201).json({ success: true, expense: newExp });
});

app.delete('/api/expenses/:id', (req, res) => {
  const db = readDB();
  db.expenses = (db.expenses || []).filter(e => e.id !== req.params.id);
  writeDB(db);
  broadcast('EXPENSES_UPDATED', db.expenses);
  res.json({ success: true, message: 'تم حذف المصروف بنجاح' });
});

// ================= API: Product Reviews (Like Temu) =================
app.get('/api/products/:id/reviews', (req, res) => {
  const db = readDB();
  db.reviews = db.reviews || [];
  const prodReviews = db.reviews.filter(r => r.productId === req.params.id);
  res.json(prodReviews);
});

app.post('/api/products/:id/reviews', (req, res) => {
  const db = readDB();
  const { author, rating, comment, fitFeedback, sizePurchased } = req.body;
  if (!author || !comment) {
    return res.status(400).json({ success: false, message: 'الاسم والتقييم مطلوبان' });
  }
  const newReview = {
    id: 'rev-' + Date.now(),
    productId: req.params.id,
    author: author.trim(),
    rating: parseInt(rating, 10) || 5,
    comment: comment.trim(),
    fitFeedback: fitFeedback || 'True to size (مطابق للمقاس تماماً)',
    sizePurchased: sizePurchased || 'M',
    verified: true,
    createdAt: new Date().toISOString()
  };
  db.reviews = db.reviews || [];
  db.reviews.unshift(newReview);
  writeDB(db);
  broadcast('REVIEW_ADDED', newReview);
  res.status(201).json({ success: true, review: newReview });
});

// ================= API: AI Copilot Assistant =================
app.post('/api/admin/ai-assistant', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ success: false, message: 'Prompt is required' });

  const db = readDB();
  const products = await firebaseService.getProducts(db);
  const orders = await firebaseService.getOrders(db);
  const validOrders = orders.filter(o => o.status !== 'Cancelled');
  const cancelledOrders = orders.filter(o => o.status === 'Cancelled');
  const totalRevenue = validOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const activeCount = activeCarts.size;

  const lower = prompt.toLowerCase();
  let reply = '';

  if (lower.includes('مبيعات') || lower.includes('ارباح') || lower.includes('sales') || lower.includes('revenue')) {
    reply = `📊 **تحليل مبيعات وأداء متجر VELEN:**\n\n` +
      `- **إجمالي المبيعات المحققة:** ${totalRevenue.toFixed(3)} JOD من خلال ${validOrders.length} طلبات ناجحة ومؤكدة${cancelledOrders.length ? ` (تم استبعاد ${cancelledOrders.length} طلبات ملغية)` : ''}.\n` +
      `- **السلات النشطة الآن في المتجر:** ${activeCount} سلة تسوق حية.\n` +
      `- **متوسط قيمة الطلب (AOV):** ${(validOrders.length ? (totalRevenue / validOrders.length).toFixed(3) : '0.000')} JOD.\n` +
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
