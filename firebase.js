/**
 * VELEN OFFICIAL — FIREBASE FIRESTORE DATABASE SERVICE
 * Seamlessly integrates Google Cloud Firestore with automatic local fallback & auto-migration
 */

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

let db = null;
let isFirebaseReady = false;

// Initialize Firebase Admin SDK
function initFirebase() {
  if (isFirebaseReady) return db;

  try {
    let credential = null;
    const keyFilePath = path.join(__dirname, 'firebase-key.json');

    // 1. Check local key file
    if (fs.existsSync(keyFilePath)) {
      const keyData = JSON.parse(fs.readFileSync(keyFilePath, 'utf8'));
      credential = admin.credential.cert(keyData);
      console.log('🔥 Initializing Firebase from local firebase-key.json');
    }
    // 2. Check full JSON environment variable
    else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      const keyData = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      credential = admin.credential.cert(keyData);
      console.log('🔥 Initializing Firebase from FIREBASE_SERVICE_ACCOUNT env');
    }
    // 3. Check individual environment variables
    else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      credential = admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      });
      console.log('🔥 Initializing Firebase from individual env credentials');
    }

    if (credential) {
      if (!admin.apps.length) {
        admin.initializeApp({ credential });
      }
      db = admin.firestore();
      isFirebaseReady = true;
      console.log('✅ Google Firebase Firestore Connected Successfully!');
      
      // Auto-migrate local data if Firestore is empty
      migrateLocalDataToFirestore();
    } else {
      console.log('ℹ️ Firebase credentials not provided yet. Using local database fallback.');
    }
  } catch (err) {
    console.error('❌ Error initializing Firebase:', err.message);
    isFirebaseReady = false;
    db = null;
  }

  return db;
}

// Migrate initial data from db.json into Firestore
async function migrateLocalDataToFirestore() {
  if (!db) return;
  try {
    const productsSnap = await db.collection('products').limit(1).get();
    if (productsSnap.empty) {
      console.log('📦 Firestore is empty, auto-migrating initial data from db.json...');
      const localFile = path.join(__dirname, 'data', 'db.json');
      if (fs.existsSync(localFile)) {
        const local = JSON.parse(fs.readFileSync(localFile, 'utf8'));
        
        // Products
        if (Array.isArray(local.products)) {
          const batch = db.batch();
          local.products.forEach(p => {
            const ref = db.collection('products').doc(p.id);
            batch.set(ref, p);
          });
          await batch.commit();
        }

        // Orders
        if (Array.isArray(local.orders)) {
          const batch = db.batch();
          local.orders.forEach(o => {
            const ref = db.collection('orders').doc(o.id);
            batch.set(ref, o);
          });
          await batch.commit();
        }

        // Community
        if (Array.isArray(local.community)) {
          const batch = db.batch();
          local.community.forEach(c => {
            const ref = db.collection('community').doc(c.id);
            batch.set(ref, c);
          });
          await batch.commit();
        }

        // Settings & Design in config collection
        if (local.settings) {
          await db.collection('config').doc('settings').set(local.settings);
        }
        if (local.design) {
          await db.collection('config').doc('design').set(local.design);
        }

        console.log('🎉 Successfully migrated all products, orders, and design to Firebase Firestore!');
      }
    }
  } catch (err) {
    console.error('Migration notice:', err.message);
  }
}

// ================= CRUD REPOSITORY =================
module.exports = {
  initFirebase,
  isReady: () => isFirebaseReady,

  // Settings
  async getSettings(localFallback) {
    if (!isFirebaseReady) return localFallback?.settings || {};
    try {
      const doc = await db.collection('config').doc('settings').get();
      return doc.exists ? doc.data() : (localFallback?.settings || {});
    } catch (e) {
      return localFallback?.settings || {};
    }
  },

  async updateSettings(newSettings) {
    if (!isFirebaseReady) return;
    try {
      await db.collection('config').doc('settings').set(newSettings, { merge: true });
    } catch (e) {
      console.error('Firestore updateSettings error:', e);
    }
  },

  // Design
  async getDesign(localFallback) {
    if (!isFirebaseReady) return localFallback?.design || {};
    try {
      const doc = await db.collection('config').doc('design').get();
      return doc.exists ? doc.data() : (localFallback?.design || {});
    } catch (e) {
      return localFallback?.design || {};
    }
  },

  async updateDesign(newDesign) {
    if (!isFirebaseReady) return;
    try {
      await db.collection('config').doc('design').set(newDesign);
    } catch (e) {
      console.error('Firestore updateDesign error:', e);
    }
  },

  // Products
  async getProducts(localFallback) {
    if (!isFirebaseReady) return localFallback?.products || [];
    try {
      const snap = await db.collection('products').get();
      if (snap.empty) return localFallback?.products || [];
      return snap.docs.map(doc => doc.data());
    } catch (e) {
      return localFallback?.products || [];
    }
  },

  async saveProduct(product) {
    if (!isFirebaseReady) return;
    try {
      await db.collection('products').doc(product.id).set(product);
    } catch (e) {
      console.error('Firestore saveProduct error:', e);
    }
  },

  async deleteProduct(productId) {
    if (!isFirebaseReady) return;
    try {
      await db.collection('products').doc(productId).delete();
    } catch (e) {
      console.error('Firestore deleteProduct error:', e);
    }
  },

  // Orders
  async getOrders(localFallback) {
    if (!isFirebaseReady) return localFallback?.orders || [];
    try {
      const snap = await db.collection('orders').get();
      if (snap.empty) return localFallback?.orders || [];
      const orders = snap.docs.map(doc => doc.data());
      // Sort newest first
      return orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (e) {
      return localFallback?.orders || [];
    }
  },

  async saveOrder(order) {
    if (!isFirebaseReady) return;
    try {
      await db.collection('orders').doc(order.id).set(order);
    } catch (e) {
      console.error('Firestore saveOrder error:', e);
    }
  },

  async updateOrderStatus(orderId, status) {
    if (!isFirebaseReady) return;
    try {
      await db.collection('orders').doc(orderId).update({ status });
    } catch (e) {
      console.error('Firestore updateOrderStatus error:', e);
    }
  },

  // Community
  async getCommunity(localFallback) {
    if (!isFirebaseReady) return localFallback?.community || [];
    try {
      const snap = await db.collection('community').get();
      if (snap.empty) return localFallback?.community || [];
      const posts = snap.docs.map(doc => doc.data());
      return posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (e) {
      return localFallback?.community || [];
    }
  },

  async saveCommunityPost(post) {
    if (!isFirebaseReady) return;
    try {
      await db.collection('community').doc(post.id).set(post);
    } catch (e) {
      console.error('Firestore saveCommunityPost error:', e);
    }
  },

  async deleteCommunityPost(postId) {
    if (!isFirebaseReady) return;
    try {
      await db.collection('community').doc(postId).delete();
    } catch (e) {
      console.error('Firestore deleteCommunityPost error:', e);
    }
  },

  async likeCommunityPost(postId) {
    if (!isFirebaseReady) return;
    try {
      const ref = db.collection('community').doc(postId);
      await ref.update({
        likes: admin.firestore.FieldValue.increment(1)
      });
    } catch (e) {
      console.error('Firestore likeCommunityPost error:', e);
    }
  }
};
