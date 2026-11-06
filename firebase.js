/**
 * VELEN OFFICIAL — FIREBASE FIRESTORE DATABASE SERVICE
 * Seamlessly integrates Google Cloud Firestore with automatic local fallback & auto-migration
 */

const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
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
      credential = cert(keyData);
      console.log('🔥 Initializing Firebase from local firebase-key.json');
    }
    // 2. Check full JSON environment variable
    else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      const keyData = typeof process.env.FIREBASE_SERVICE_ACCOUNT === 'string'
        ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
        : process.env.FIREBASE_SERVICE_ACCOUNT;
      credential = cert(keyData);
      console.log('🔥 Initializing Firebase from FIREBASE_SERVICE_ACCOUNT env');
    }
    // 3. Check individual environment variables
    else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      credential = cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      });
      console.log('🔥 Initializing Firebase from individual env credentials');
    }

    if (credential) {
      let app;
      if (!getApps().length) {
        app = initializeApp({ credential });
      } else {
        app = getApps()[0];
      }
      db = getFirestore(app);
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
      if (doc.exists) {
        const firestoreData = doc.data() || {};
        return {
          ...(localFallback?.settings || {}),
          ...firestoreData,
          social: {
            ...(localFallback?.settings?.social || {}),
            ...(firestoreData?.social || {})
          },
          policies: {
            ...(localFallback?.settings?.policies || {}),
            ...(firestoreData?.policies || {}),
            shipping: {
              ...(localFallback?.settings?.policies?.shipping || {}),
              ...(firestoreData?.policies?.shipping || {})
            },
            care: {
              ...(localFallback?.settings?.policies?.care || {}),
              ...(firestoreData?.policies?.care || {})
            }
          }
        };
      }
      return localFallback?.settings || {};
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
      if (doc.exists) {
        const firestoreData = doc.data() || {};
        return {
          ...(localFallback?.design || {}),
          ...firestoreData,
          hero: {
            ...(localFallback?.design?.hero || {}),
            ...(firestoreData?.hero || {})
          },
          theme: {
            ...(localFallback?.design?.theme || {}),
            ...(firestoreData?.theme || {})
          },
          header: {
            ...(localFallback?.design?.header || {}),
            ...(firestoreData?.header || {})
          },
          comingSoon: {
            ...(localFallback?.design?.comingSoon || {}),
            ...(firestoreData?.comingSoon || {})
          },
          checkoutUpsell: {
            ...(localFallback?.design?.checkoutUpsell || {}),
            ...(firestoreData?.checkoutUpsell || {})
          },
          portalCards: {
            ...(localFallback?.design?.portalCards || {}),
            ...(firestoreData?.portalCards || {})
          }
        };
      }
      return localFallback?.design || {};
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
        likes: FieldValue.increment(1)
      });
    } catch (e) {
      console.error('Firestore likeCommunityPost error:', e);
    }
  },

  // Promo Codes
  async getPromoCodes(localFallback) {
    if (!isFirebaseReady) return localFallback?.promoCodes || [];
    try {
      const snap = await db.collection('promoCodes').get();
      if (snap.empty) return localFallback?.promoCodes || [];
      return snap.docs.map(doc => doc.data());
    } catch (e) {
      return localFallback?.promoCodes || [];
    }
  },

  async savePromoCode(promo) {
    if (!isFirebaseReady) return;
    try {
      await db.collection('promoCodes').doc(promo.code).set(promo);
    } catch (e) {
      console.error('Firestore savePromoCode error:', e);
    }
  },

  async deletePromoCode(code) {
    if (!isFirebaseReady) return;
    try {
      await db.collection('promoCodes').doc(code).delete();
    } catch (e) {
      console.error('Firestore deletePromoCode error:', e);
    }
  },

  async getCategories(localFallback) {
    if (!isFirebaseReady) return localFallback?.categories || [];
    try {
      const snap = await db.collection('categories').get();
      if (snap.empty) return localFallback?.categories || [];
      return snap.docs.map(doc => doc.data());
    } catch (e) {
      return localFallback?.categories || [];
    }
  },

  async saveCategory(cat) {
    if (!isFirebaseReady) return;
    try {
      await db.collection('categories').doc(cat.id).set(cat);
    } catch (e) {
      console.error('Firestore saveCategory error:', e);
    }
  },

  async deleteCategory(id) {
    if (!isFirebaseReady) return;
    try {
      await db.collection('categories').doc(id).delete();
    } catch (e) {
      console.error('Firestore deleteCategory error:', e);
    }
  },

  // Customer Reviews Persistence
  async getReviews(localFallback) {
    if (!isFirebaseReady) return localFallback?.reviews || [];
    try {
      const snap = await db.collection('reviews').orderBy('createdAt', 'desc').get();
      if (!snap.empty) {
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
      }
      return localFallback?.reviews || [];
    } catch (e) {
      console.error('Firestore getReviews error:', e);
      return localFallback?.reviews || [];
    }
  },

  async saveReview(review) {
    if (!isFirebaseReady || !review || !review.id) return;
    try {
      await db.collection('reviews').doc(review.id).set(review);
    } catch (e) {
      console.error('Firestore saveReview error:', e);
    }
  },

  async deleteReview(id) {
    if (!isFirebaseReady || !id) return;
    try {
      await db.collection('reviews').doc(id).delete();
    } catch (e) {
      console.error('Firestore deleteReview error:', e);
    }
  },

  // Media Storage in Firestore (Synchronizes across Localhost & Vercel Serverless)
  async saveMedia(filename, buffer, mimeType) {
    if (!isFirebaseReady || !filename || !buffer) return false;
    try {
      const base64 = buffer.toString('base64');
      const CHUNK_SIZE = 650000; // ~650KB per chunk to stay well under Firestore 1MB limit
      const totalChunks = Math.ceil(base64.length / CHUNK_SIZE);

      const docRef = db.collection('media').doc(filename);
      await docRef.set({
        filename,
        mimeType: mimeType || 'image/jpeg',
        totalChunks,
        totalSize: buffer.length,
        createdAt: new Date().toISOString()
      });

      // Commit in sub-batches of 400 to respect Firestore 500 writes per batch limit
      for (let i = 0; i < totalChunks; i += 400) {
        const batch = db.batch();
        const end = Math.min(i + 400, totalChunks);
        for (let j = i; j < end; j++) {
          const chunkData = base64.slice(j * CHUNK_SIZE, (j + 1) * CHUNK_SIZE);
          const chunkRef = docRef.collection('chunks').doc(String(j));
          batch.set(chunkRef, { index: j, data: chunkData });
        }
        await batch.commit();
      }
      console.log(`☁️ Media saved to Firestore: ${filename} (${totalChunks} chunks, ${(buffer.length / 1024).toFixed(1)} KB)`);
      return true;
    } catch (e) {
      console.error('Firestore saveMedia error:', e);
      return false;
    }
  },

  async getMedia(filename) {
    if (!isFirebaseReady || !filename) return null;
    try {
      const docRef = db.collection('media').doc(filename);
      const doc = await docRef.get();
      if (!doc.exists) return null;

      const meta = doc.data();
      const totalChunks = meta.totalChunks || 1;

      if (totalChunks === 1) {
        const chunkSnap = await docRef.collection('chunks').doc('0').get();
        if (chunkSnap.exists && chunkSnap.data().data) {
          return {
            mimeType: meta.mimeType || 'image/jpeg',
            buffer: Buffer.from(chunkSnap.data().data, 'base64')
          };
        }
      }

      const chunksSnap = await docRef.collection('chunks').orderBy('index').get();
      if (chunksSnap.empty) return null;

      const fullBase64 = chunksSnap.docs.map(d => d.data().data).join('');
      return {
        mimeType: meta.mimeType || 'image/jpeg',
        buffer: Buffer.from(fullBase64, 'base64')
      };
    } catch (e) {
      console.error('Firestore getMedia error:', e);
      return null;
    }
  }
};
