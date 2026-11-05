/**
 * VELEN OFFICIAL — ADMIN DASHBOARD JAVASCRIPT
 * Real-time control room for Products, Orders, Community, and Storefront Sync
 */

document.addEventListener('DOMContentLoaded', () => {
  // Admin State
  const state = {
    products: [],
    orders: [],
    community: [],
    settings: {},
    stats: {},
    design: null,
    promos: [],
    activeCarts: { activeCount: 0, totalValue: 0 },
    activeTab: 'dashboard',
    uploadedProductImageUrl: null,
    uploadedHeroBgUrl: null,
    uploadedLogoUrl: null,
    uploadedAboutImageUrl: null
  };

  // DOM Elements
  const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
  const tabPanes = document.querySelectorAll('.admin-tab-pane');
  const pageTitle = document.getElementById('pageTitle');
  const productEditModal = document.getElementById('productEditModal');
  const productForm = document.getElementById('productForm');
  const promoModal = document.getElementById('promoModal');
  const promoForm = document.getElementById('promoForm');
  const adminToastContainer = document.getElementById('adminToastContainer');
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const adminSidebar = document.getElementById('adminSidebar');

  // Init
  initAdmin();

  async function initAdmin() {
    setupEventListeners();
    setupAiChat();
    setupPromoCodes();
    setupManualOrders();
    setupLiveView();
    setupWaybillModal();
    setupAdminCommunityPost();
    setupFinanceTracker();
    await fetchAllData();
    initWebSocket();
    setInterval(fetchActiveCarts, 15000);
    setInterval(fetchLiveVisitors, 5000);
  }

  // ================= FETCH ALL DATA =================
  async function fetchAllData() {
    try {
      const [pRes, oRes, cRes, sRes, statsRes, dRes, promoRes, cartRes, expRes, catRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/orders'),
        fetch('/api/community'),
        fetch('/api/settings'),
        fetch('/api/stats'),
        fetch('/api/design'),
        fetch('/api/promo-codes'),
        fetch('/api/cart/active'),
        fetch('/api/expenses'),
        fetch('/api/categories')
      ]);

      state.products = await pRes.json();
      state.orders = await oRes.json();
      state.community = await cRes.json();
      state.settings = await sRes.json();
      state.stats = await statsRes.json();
      state.design = await dRes.json();
      state.promos = await promoRes.json();
      state.activeCarts = await cartRes.json();
      state.expenses = await expRes.json();
      state.categories = await catRes.json();

      renderDashboard();
      renderProducts();
      renderOrders();
      renderCommunity();
      renderPromoCodes();
      renderActiveCarts();
      populateSettings();
      populateDesignCustomizer();
      renderExpenses();
      renderFinanceStats();
      if (typeof renderCategoriesTable === 'function') renderCategoriesTable();
      if (typeof populateCategoryDropdowns === 'function') populateCategoryDropdowns();
      updateBadgeCounts();
    } catch (err) {
      console.error('Error fetching admin data:', err);
    }
  }

  // ================= REAL-TIME WEBSOCKET SYNC =================
  function initWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    let socket;

    try {
      socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        console.log('⚡ Admin connected to Live Store Sync');
      };

      socket.onmessage = (event) => {
        try {
          const { event: evType, payload } = JSON.parse(event.data);
          handleAdminRealtimeEvent(evType, payload);
        } catch (e) {
          console.error('Admin WS parse error:', e);
        }
      };

      socket.onclose = () => {
        setTimeout(initWebSocket, 3000);
      };
    } catch (e) {
      console.error(e);
    }
  }

  function handleAdminRealtimeEvent(evType, payload) {
    if (evType === 'ORDER_PLACED') {
      // Real-time new order from customer!
      state.orders.unshift(payload);
      renderOrders();
      renderDashboard();
      updateBadgeCounts();
      showAdminToast(`🔔 طلب جديد وارد: ${payload.id} من ${payload.customerName} بقيمة ${Number(payload.total).toFixed(3)} JOD`, 'success');
      playNotificationSound();
    } else if (evType === 'PRODUCT_ADDED') {
      const exists = state.products.some(p => p.id === payload.id);
      if (!exists) {
        state.products.unshift(payload);
        renderProducts();
        renderDashboard();
        updateBadgeCounts();
      }
    } else if (evType === 'COMMUNITY_NEW_POST') {
      const exists = state.community.some(c => c.id === payload.id);
      if (!exists) {
        state.community.unshift(payload);
        renderCommunity();
        renderDashboard();
        updateBadgeCounts();
        showAdminToast(`📸 إطلالة وتقييم جديد من ${payload.author} في المجتمع!`, 'info');
      }
    } else if (evType === 'DESIGN_UPDATED') {
      state.design = payload;
      populateDesignCustomizer();
      showAdminToast('🎨 تم تحديث تصميم وهيكلية المتجر من قِبل الإدارة!', 'info');
    } else if (evType === 'ORDER_STATUS_CHANGED') {
      const ord = state.orders.find(o => o.id === payload.id);
      if (ord) {
        ord.status = payload.status;
        renderOrders();
        renderDashboard();
        updateBadgeCounts();
      }
    } else if (evType === 'CATEGORIES_UPDATED') {
      state.categories = payload;
      if (typeof renderCategoriesTable === 'function') renderCategoriesTable();
      if (typeof populateCategoryDropdowns === 'function') populateCategoryDropdowns();
      showAdminToast('تم تحديث تصنيفات وكوليكشنز المتجر!', 'info');
    } else if (evType === 'PROMO_CODES_UPDATED') {
      state.promos = payload;
      renderPromoCodes();
      updateBadgeCounts();
    } else if (evType === 'VISITOR_UPDATE') {
      if (typeof fetchLiveVisitors === 'function') fetchLiveVisitors();
    }
  }

  function playNotificationSound() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880.00, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {}
  }

  // ================= BADGE COUNTS & STATS =================
  function updateBadgeCounts() {
    document.getElementById('navProdCount').textContent = state.products.length;
    document.getElementById('navCommCount').textContent = state.community.length;

    const promoBadge = document.getElementById('navPromosCount');
    if (promoBadge) promoBadge.textContent = state.promos ? state.promos.length : 0;

    const pendingOrders = state.orders.filter(o => o.status === 'Pending').length;
    document.getElementById('navOrdersCount').textContent = pendingOrders;

    // Filter out cancelled orders so cancelled orders do NOT count towards total sales
    const validOrders = state.orders.filter(o => o.status !== 'Cancelled');
    const cancelledOrders = state.orders.filter(o => o.status === 'Cancelled');
    const totalRevenue = validOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
    const revStr = totalRevenue.toFixed(3) + ' JOD';
    document.getElementById('topbarRevenue').textContent = revStr;
    document.getElementById('kpiRevenue').textContent = revStr;
    document.getElementById('kpiOrders').textContent = validOrders.length;
    document.getElementById('kpiPendingOrders').textContent = `${pendingOrders} قيد الانتظار${cancelledOrders.length ? ` • ${cancelledOrders.length} ملغي` : ''}`;
    document.getElementById('kpiProducts').textContent = state.products.length;

    const avg = state.community.length > 0 
      ? (state.community.reduce((acc, c) => acc + (Number(c.rating) || 5), 0) / state.community.length).toFixed(1)
      : '5.0';
    document.getElementById('kpiRating').textContent = `${avg} / 5`;
    document.getElementById('kpiCommunityCount').textContent = `${state.community.length} مشاركة وتقييم`;
  }

  function renderActiveCarts() {
    const countEl = document.getElementById('kpiActiveCarts');
    const valEl = document.getElementById('kpiActiveCartsValue');
    if (state.activeCarts) {
      if (countEl) countEl.textContent = `${state.activeCarts.activeCount || 0} متسوقين`;
      if (valEl) valEl.textContent = `إجمالي السلات: ${(state.activeCarts.totalValue || 0).toFixed(3)} JOD`;
    }
  }

  async function fetchActiveCarts() {
    try {
      const res = await fetch('/api/cart/active');
      state.activeCarts = await res.json();
      renderActiveCarts();
    } catch (e) {}
  }

  // ================= RENDER DASHBOARD =================
  function renderDashboard() {
    updateBadgeCounts();

    // Recent Orders Table
    const recentOrders = state.orders.slice(0, 5);
    const tbody = document.getElementById('dashRecentOrdersTable');
    if (tbody) {
      if (recentOrders.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#666;">لا توجد طلبات بعد</td></tr>`;
      } else {
        tbody.innerHTML = recentOrders.map(o => `
          <tr>
            <td><strong>${o.id}</strong></td>
            <td>${o.customerName}<br><small style="color:#777;">${o.phone}</small></td>
            <td>${o.city}</td>
            <td><strong>${Number(o.total).toFixed(3)} JOD</strong></td>
            <td><span class="status-pill status-${getStatusClass(o.status)}">${getStatusLabel(o.status)}</span></td>
            <td style="white-space:nowrap;">
              <button class="link-btn" onclick="window.velenAdmin.openWhatsApp('${o.phone}', '${o.id}', '${o.customerName}')" title="مراسلة عبر واتساب">
                <i class="fa-brands fa-whatsapp" style="color:#25d366; font-size:16px;"></i>
              </button>
              <button class="link-btn" onclick="window.velenAdmin.openWaybill('${o.id}')" title="طباعة بوليصة التوصيل" style="margin-right:4px;">
                <i class="fa-solid fa-print" style="color:#fff; font-size:14px;"></i>
              </button>
            </td>
          </tr>
        `).join('');
      }
    }

    // Recent Community
    const recentComm = state.community.slice(0, 3);
    const commList = document.getElementById('dashRecentCommunityList');
    if (commList) {
      if (recentComm.length === 0) {
        commList.innerHTML = `<p style="color:#666; font-size:12px;">لا توجد إطلالات بعد</p>`;
      } else {
        commList.innerHTML = recentComm.map(c => `
          <div class="dash-comm-item">
            <img src="${c.mediaUrl}" class="dash-comm-thumb">
            <div class="dash-comm-info">
              <h4>${c.author} <span style="color:#ffca28; font-size:11px;">${'★'.repeat(c.rating)}</span></h4>
              <p>"${c.comment}"</p>
              <small style="color:#666;">${c.itemWorn || 'Velen Piece'}</small>
            </div>
          </div>
        `).join('');
      }
    }
  }

  // ================= RENDER PRODUCTS =================
  function renderProducts() {
    const grid = document.getElementById('adminProductsGrid');
    if (!grid) return;

    const search = document.getElementById('productSearchInput')?.value.toLowerCase().trim() || '';
    const cat = document.getElementById('productCategoryFilter')?.value || 'all';

    let list = state.products;
    if (search) {
      list = list.filter(p => p.name.toLowerCase().includes(search) || p.category.toLowerCase().includes(search));
    }
    if (cat !== 'all') {
      list = list.filter(p => p.category === cat || p.name.includes(cat));
    }

    if (list.length === 0) {
      grid.innerHTML = `<p style="grid-column:1/-1; text-align:center; color:#777; padding:40px;">لا توجد منتجات مطابقة للبحث</p>`;
      return;
    }

    grid.innerHTML = list.map(p => `
      <div class="admin-product-card" data-id="${p.id}">
        <div class="admin-prod-img-wrap">
          <img src="${p.image || '/assets/velen-logo.jpg'}" alt="${p.name}">
          ${p.onSale ? '<span class="admin-sale-badge">SALE</span>' : ''}
          <span class="admin-stock-badge"><i class="fa-solid fa-box"></i> ${p.stock || 0} متوفر</span>
        </div>
        <div class="admin-prod-content">
          <span style="font-size:11px; color:#888;">${p.category}</span>
          <h4 class="admin-prod-title">${p.name}</h4>
          <div class="admin-prod-price-row">
            <strong style="color:#fff;">${Number(p.price).toFixed(3)} JOD</strong>
            ${p.comparePrice ? `<span style="color:#666; text-decoration:line-through; font-size:12px;">${Number(p.comparePrice).toFixed(3)} JOD</span>` : ''}
          </div>
          <div style="font-size:11px; color:#aaa; margin-top:4px;">
            ${p.sizeInventory 
              ? `<span style="color:#e5b95f; font-weight:600;">المخزون بالمقاس:</span> ` + Object.entries(p.sizeInventory).map(([s, q]) => `<span style="display:inline-block; margin-left:3px; padding:1px 5px; border-radius:3px; background:#1b1b1b; color:${q > 0 ? '#fff' : '#e74c3c'}; font-size:10px;">${s}:<strong>${q}</strong></span>`).join('')
              : `المقاسات: ${(p.sizes || []).join(', ')}`
            }
          </div>
          
          <div class="admin-prod-actions">
            <button class="btn-card-edit" onclick="window.velenAdmin.editProduct('${p.id}')">
              <i class="fa-solid fa-pen-to-square"></i> تعديل
            </button>
            <button class="btn-card-delete" onclick="window.velenAdmin.deleteProduct('${p.id}')">
              <i class="fa-solid fa-trash"></i> حذف
            </button>
          </div>
        </div>
      </div>
    `).join('');
  }

  // ================= RENDER ORDERS =================
  function renderOrders() {
    const tbody = document.getElementById('ordersFullTable');
    if (!tbody) return;

    const search = document.getElementById('orderSearchInput')?.value.toLowerCase().trim() || '';
    const status = document.getElementById('orderStatusFilter')?.value || 'all';

    let list = state.orders;
    if (search) {
      list = list.filter(o => 
        o.id.toLowerCase().includes(search) || 
        o.customerName.toLowerCase().includes(search) || 
        o.phone.includes(search)
      );
    }
    if (status !== 'all') {
      list = list.filter(o => o.status === status);
    }

    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; color:#666; padding:30px;">لا توجد طلبات مطابقة</td></tr>`;
      return;
    }

    tbody.innerHTML = list.map(o => {
      const itemsHtml = (o.items || []).map(item => `
        <div>• ${item.name} (${item.size}${item.color ? ` - ${item.color}` : ''}) × ${item.quantity} [${Number(item.price).toFixed(3)} JOD]</div>
      `).join('');

      return `
        <tr>
          <td><strong>${o.id}</strong></td>
          <td>${formatDate(o.createdAt)}</td>
          <td>
            <strong>${o.customerName}</strong><br>
            <span style="direction:ltr; display:inline-block; font-size:12px; color:#25d366;"><i class="fa-brands fa-whatsapp"></i> ${o.phone}</span>
          </td>
          <td style="max-width:180px;">
            <strong>${o.city}</strong><br>
            <small style="color:#aaa;">${o.address}</small>
            ${o.notes ? `<div style="font-size:11px; color:#ffca28; margin-top:2px;">ملاحظة: ${o.notes}</div>` : ''}
          </td>
          <td style="font-size:12px; max-width:200px;">${itemsHtml}</td>
          <td><small>${o.paymentMethod || 'الدفع عند الاستلام'}</small></td>
          <td><strong style="color:#ffca28; font-size:14px;">${Number(o.total).toFixed(3)} JOD</strong></td>
          <td>
            <select class="status-select" onchange="window.velenAdmin.changeOrderStatus('${o.id}', this.value)" style="padding:4px 8px; font-size:12px; background:#111; color:#fff; border-color:#333;">
              <option value="Pending" ${o.status === 'Pending' ? 'selected' : ''}>🟡 قيد الانتظار</option>
              <option value="Preparing" ${o.status === 'Preparing' ? 'selected' : ''}>🔵 جاري التجهيز</option>
              <option value="Out for Delivery" ${o.status === 'Out for Delivery' ? 'selected' : ''}>🚚 مع المندوب</option>
              <option value="Delivered" ${o.status === 'Delivered' ? 'selected' : ''}>🟢 تم التسليم</option>
              <option value="Cancelled" ${o.status === 'Cancelled' ? 'selected' : ''}>🔴 ملغي</option>
            </select>
          <td style="white-space:nowrap;">
            <button class="link-btn" onclick="window.velenAdmin.openWhatsApp('${o.phone}', '${o.id}', '${o.customerName}')" style="background:#25d366; color:#fff; padding:6px 10px; border-radius:4px; font-size:11px; font-weight:700;">
              <i class="fa-brands fa-whatsapp"></i> تواصل
            </button>
            <button class="link-btn" onclick="window.velenAdmin.openWaybill('${o.id}')" style="background:#fff; color:#000; padding:6px 10px; border-radius:4px; font-size:11px; font-weight:700; margin-right:4px;">
              <i class="fa-solid fa-print"></i> بوليصة
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  // ================= RENDER COMMUNITY =================
  function renderCommunity() {
    const grid = document.getElementById('adminCommunityGrid');
    if (!grid) return;

    if (state.community.length === 0) {
      grid.innerHTML = `<p style="grid-column:1/-1; text-align:center; color:#777; padding:40px;">لا توجد مشاركات بعد في المجتمع</p>`;
      return;
    }

    grid.innerHTML = state.community.map(c => `
      <div class="admin-comm-card">
        <div class="admin-comm-media">
          ${c.mediaType === 'video' || c.videoUrl ? `
            <video src="${c.videoUrl || c.mediaUrl}" poster="${c.mediaUrl || '/assets/velen-boxy-white.jpg'}" controls onerror="this.style.display='none';"></video>
          ` : `
            <img src="${c.mediaUrl}" onerror="this.onerror=null; this.src='/assets/velen-boxy-white.jpg';">
          `}
        </div>
        <div class="admin-comm-body">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <strong>${c.author}</strong>
            <span class="stars-rating-gold">${'★'.repeat(c.rating || 5)}</span>
          </div>
          <p style="font-size:12px; color:#ccc;">"${c.comment}"</p>
          <small style="color:#777;">يرتدي: ${c.itemWorn || 'Velen Essential'}</small>

          <button class="btn-card-delete" onclick="window.velenAdmin.deleteCommunityPost('${c.id}')" style="margin-top:10px;">
            <i class="fa-solid fa-trash"></i> حذف هذا المنشور
          </button>
        </div>
      </div>
    `).join('');
  }

  // ================= POPULATE SETTINGS =================
  function populateSettings() {
    if (!state.settings) return;
    if (state.settings.announcement && document.getElementById('setAnnouncement')) {
      document.getElementById('setAnnouncement').value = state.settings.announcement;
    }
    if (state.settings.brandName && document.getElementById('setBrandName')) {
      document.getElementById('setBrandName').value = state.settings.brandName;
    }
    if (state.settings.currency && document.getElementById('setCurrency')) {
      document.getElementById('setCurrency').value = state.settings.currency;
    }
    if (state.settings.slogan && document.getElementById('setSlogan')) {
      document.getElementById('setSlogan').value = state.settings.slogan;
    }
    if (state.settings.subSlogan && document.getElementById('setSubSlogan')) {
      document.getElementById('setSubSlogan').value = state.settings.subSlogan;
    }
    if (state.settings.orderEmail && document.getElementById('setOrderEmail')) {
      document.getElementById('setOrderEmail').value = state.settings.orderEmail;
    }
    if (document.getElementById('setGmailUser')) {
      document.getElementById('setGmailUser').value = state.settings.gmailUser || state.settings.orderEmail || 'Velenoffical@gmail.com';
    }
    if (document.getElementById('setGmailAppPassword')) {
      document.getElementById('setGmailAppPassword').value = state.settings.gmailAppPassword || '';
    }
    if (state.settings.social) {
      const s = state.settings.social;
      if (s.instagram && document.getElementById('setSocialInstagram')) document.getElementById('setSocialInstagram').value = s.instagram;
      if (s.tiktok && document.getElementById('setSocialTiktok')) document.getElementById('setSocialTiktok').value = s.tiktok;
      if (s.whatsapp && document.getElementById('setSocialWhatsapp')) document.getElementById('setSocialWhatsapp').value = s.whatsapp;
      if (s.facebook && document.getElementById('setSocialFacebook')) document.getElementById('setSocialFacebook').value = s.facebook;
    }
    if (state.settings.policies) {
      const p = state.settings.policies;
      if (p.shipping) {
        if (document.getElementById('polShippingTitleEn')) document.getElementById('polShippingTitleEn').value = p.shipping.titleEn || '';
        if (document.getElementById('polShippingTitleAr')) document.getElementById('polShippingTitleAr').value = p.shipping.titleAr || '';
        if (document.getElementById('polDeliveryEn')) document.getElementById('polDeliveryEn').value = p.shipping.deliveryEn || '';
        if (document.getElementById('polDeliveryAr')) document.getElementById('polDeliveryAr').value = p.shipping.deliveryAr || '';
        if (document.getElementById('polExchangeEn')) document.getElementById('polExchangeEn').value = p.shipping.exchangeEn || '';
        if (document.getElementById('polExchangeAr')) document.getElementById('polExchangeAr').value = p.shipping.exchangeAr || '';
      }
      if (p.care) {
        if (document.getElementById('polCareTitleEn')) document.getElementById('polCareTitleEn').value = p.care.titleEn || '';
        if (document.getElementById('polCareTitleAr')) document.getElementById('polCareTitleAr').value = p.care.titleAr || '';
        if (document.getElementById('polCareIntroEn')) document.getElementById('polCareIntroEn').value = p.care.introEn || '';
        if (document.getElementById('polCareIntroAr')) document.getElementById('polCareIntroAr').value = p.care.introAr || '';
      }
    }
  }

  // ================= PRODUCT FORM ACTIONS (UNLIMITED PRODUCT GALLERY & COLOR VARIANTS) =================
  state.productImages = [];
  state.productColors = [];

  function renderProductGalleryManager() {
    const grid = document.getElementById('prodGalleryGrid');
    const countBadge = document.getElementById('prodGalleryCount');
    if (!grid) return;

    if (countBadge) {
      countBadge.textContent = `${state.productImages.length} صور مضافة`;
    }

    if (state.productImages.length === 0) {
      grid.innerHTML = `<p style="font-size:12px; color:#888; margin:0; width:100%; text-align:center; padding:8px;">لم يتم إضافة أي صور بعد. ارفع عدة صور من جهازك أو أضف روابط مباشرة.</p>`;
      return;
    }

    grid.innerHTML = state.productImages.map((url, idx) => `
      <div style="position:relative; width:80px; height:80px; border-radius:6px; overflow:hidden; border:${idx === 0 ? '2px solid var(--gold-accent)' : '1px solid #333'}; background:#111; display:inline-block;">
        <img src="${url}" style="width:100%; height:100%; object-fit:cover;" onerror="this.src='/assets/velen-logo.jpg'">
        ${idx === 0 ? '<span style="position:absolute; top:2px; right:2px; background:var(--gold-accent); color:#000; font-size:9px; font-weight:800; padding:1px 4px; border-radius:3px;">★ رئيسية</span>' : `<button type="button" onclick="window.velenAdmin.setCoverImage(${idx})" title="تعيين كصورة رئيسية" style="position:absolute; top:2px; right:2px; background:rgba(0,0,0,0.7); color:#fff; font-size:9px; border:none; padding:1px 4px; border-radius:3px; cursor:pointer;">غلاف</button>`}
        <button type="button" onclick="window.velenAdmin.removeProductImage(${idx})" title="حذف الصورة" style="position:absolute; bottom:2px; left:2px; background:rgba(255,71,87,0.9); color:#fff; font-size:11px; border:none; width:20px; height:20px; border-radius:50%; cursor:pointer; display:flex; align-items:center; justify-content:center; line-height:1;">✕</button>
      </div>
    `).join('');
  }
  window._renderProductGalleryManager = renderProductGalleryManager;

  // ================= COLOR VARIANTS SYSTEM (Dedicated Photos & Size Inventories per Color) =================
  state.currentColorEditingImages = [];

  function renderColorVarImagesGrid() {
    const grid = document.getElementById('colorVarImagesGrid');
    const badge = document.getElementById('colorVarImagesCount');
    if (badge) badge.textContent = `${state.currentColorEditingImages.length} صور مضافة`;
    if (!grid) return;

    if (state.currentColorEditingImages.length === 0) {
      grid.innerHTML = `<span style="font-size:11px; color:#777; width:100%; text-align:center; padding:6px 0;">لم يتم رفع أي صور لهذا اللون بعد.</span>`;
      return;
    }

    grid.innerHTML = state.currentColorEditingImages.map((url, i) => `
      <div style="position:relative; width:65px; height:65px; border-radius:6px; overflow:hidden; border:${i === 0 ? '2px solid var(--gold-accent)' : '1px solid #444'}; background:#111;">
        <img src="${url}" style="width:100%; height:100%; object-fit:cover;" onerror="this.src='/assets/velen-logo.jpg'">
        ${i === 0 ? '<span style="position:absolute; top:2px; right:2px; background:var(--gold-accent); color:#000; font-size:8px; font-weight:800; padding:1px 3px; border-radius:2px;">غلاف</span>' : ''}
        <button type="button" onclick="window.velenAdmin.removeColorEditingImage(${i})" title="حذف الصورة" style="position:absolute; bottom:2px; left:2px; background:rgba(255,71,87,0.9); color:#fff; font-size:10px; border:none; width:18px; height:18px; border-radius:50%; cursor:pointer; display:flex; align-items:center; justify-content:center; line-height:1;">✕</button>
      </div>
    `).join('');
  }

  function recalculateColorVarStock() {
    const grid = document.getElementById('colorVarSizeGrid');
    if (!grid) return;
    let total = 0;
    const cards = grid.querySelectorAll('.size-stock-card');
    cards.forEach(card => {
      const check = card.querySelector('.color-size-enable-check');
      const input = card.querySelector('.color-size-qty-input');
      if (check && check.checked) {
        const qty = parseInt(input.value, 10) || 0;
        total += qty;
      }
    });
    const badge = document.getElementById('colorVarTotalStockBadge');
    if (badge) badge.textContent = total;
  }

  function openAddColorModal() {
    const modal = document.getElementById('colorVariantModal');
    if (!modal) return;
    document.getElementById('editColorVariantIndex').value = '-1';
    document.getElementById('colorVariantModalTitle').innerHTML = '<i class="fa-solid fa-palette" style="color:var(--gold-accent);"></i> إضافة لون جديد ومقاساته وصوره';
    document.getElementById('colorVarName').value = '';
    document.getElementById('colorVarPicker').value = '#000000';
    document.getElementById('colorVarHex').value = '#000000';
    state.currentColorEditingImages = [];
    renderColorVarImagesGrid();

    // Reset size grid to standard defaults
    const grid = document.getElementById('colorVarSizeGrid');
    if (grid) {
      const cards = grid.querySelectorAll('.size-stock-card');
      cards.forEach(card => {
        const size = card.getAttribute('data-size');
        const check = card.querySelector('.color-size-enable-check');
        const input = card.querySelector('.color-size-qty-input');
        const isDefault = ['S', 'M', 'L', 'XL'].includes(size);
        check.checked = isDefault;
        if (isDefault) {
          card.classList.add('active');
          input.value = 5;
        } else {
          card.classList.remove('active');
          input.value = 0;
        }
      });
      recalculateColorVarStock();
    }

    modal.classList.add('active');
  }

  function editColorVariant(idx) {
    const modal = document.getElementById('colorVariantModal');
    if (!modal || !state.productColors || !state.productColors[idx]) return;
    const col = state.productColors[idx];

    document.getElementById('editColorVariantIndex').value = idx;
    document.getElementById('colorVariantModalTitle').innerHTML = `<i class="fa-solid fa-palette" style="color:var(--gold-accent);"></i> تعديل لون: ${col.name}`;
    document.getElementById('colorVarName').value = col.name || '';
    document.getElementById('colorVarPicker').value = col.hex || '#000000';
    document.getElementById('colorVarHex').value = col.hex || '#000000';
    state.currentColorEditingImages = Array.isArray(col.images) ? [...col.images] : (col.image ? [col.image] : []);
    renderColorVarImagesGrid();

    // Populate sizes
    const grid = document.getElementById('colorVarSizeGrid');
    if (grid) {
      const cards = grid.querySelectorAll('.size-stock-card');
      cards.forEach(card => {
        const size = card.getAttribute('data-size');
        const check = card.querySelector('.color-size-enable-check');
        const input = card.querySelector('.color-size-qty-input');
        if (col.sizeInventory && typeof col.sizeInventory[size] !== 'undefined') {
          const qty = parseInt(col.sizeInventory[size], 10) || 0;
          check.checked = qty > 0 || (Array.isArray(col.sizes) && col.sizes.includes(size));
          if (check.checked) card.classList.add('active');
          else card.classList.remove('active');
          input.value = qty;
        } else if (Array.isArray(col.sizes) && col.sizes.includes(size)) {
          check.checked = true;
          card.classList.add('active');
          input.value = 5;
        } else {
          check.checked = false;
          card.classList.remove('active');
          input.value = 0;
        }
      });
      recalculateColorVarStock();
    }

    modal.classList.add('active');
  }

  function closeColorVariantModal() {
    const modal = document.getElementById('colorVariantModal');
    if (modal) modal.classList.remove('active');
  }

  function recalculateOverallProductStock() {
    if (Array.isArray(state.productColors) && state.productColors.length > 0) {
      let total = 0;
      state.productColors.forEach(c => {
        const cStock = c.stock !== undefined ? c.stock : Object.values(c.sizeInventory || {}).reduce((s, q) => s + (parseInt(q, 10) || 0), 0);
        total += cStock;
      });
      const prodStock = document.getElementById('prodStock');
      const badge = document.getElementById('totalCalculatedStockBadge');
      if (prodStock) prodStock.value = total;
      if (badge) badge.textContent = total;
    }
  }

  function renderProductColorsManager() {
    const list = document.getElementById('adminProductColorsList');
    if (!list) return;

    if (!Array.isArray(state.productColors) || state.productColors.length === 0) {
      list.innerHTML = `
        <div style="background:#1a1a1a; padding:18px; border-radius:6px; border:1px dashed #444; text-align:center;">
          <p style="font-size:12px; color:#aaa; margin:0 0 10px 0;">لم يتم إضافة أي لون للقطعة بعد. اضغط الزر أعلاه لإضافة ألوان وصور ومقاسات الموديل.</p>
        </div>
      `;
      return;
    }

    list.innerHTML = state.productColors.map((col, idx) => {
      const isLight = col.hex && ['#fff', '#ffffff', '#f5f5f5', '#eee', '#fafafa'].includes(col.hex.toLowerCase());
      const imgCount = Array.isArray(col.images) ? col.images.length : (col.image ? 1 : 0);
      const colStock = col.stock !== undefined ? col.stock : Object.values(col.sizeInventory || {}).reduce((a, b) => a + (parseInt(b, 10) || 0), 0);
      const sizeBreakdown = col.sizeInventory ? Object.entries(col.sizeInventory).filter(([s, q]) => q > 0).map(([s, q]) => `${s}: ${q}`).join(' | ') : (col.sizes || []).join(', ');

      return `
        <div style="background:#1a1a1a; padding:12px 14px; border-radius:8px; border:1px solid #333; display:flex; flex-direction:column; gap:10px;">
          <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px;">
            <div style="display:flex; align-items:center; gap:12px;">
              <span style="display:inline-block; width:30px; height:30px; border-radius:50%; background-color:${col.hex || '#000'}; border:2px solid ${isLight ? '#555' : 'rgba(255,255,255,0.3)'}; box-shadow:0 2px 6px rgba(0,0,0,0.5);"></span>
              <div>
                <strong style="color:#fff; font-size:14px;">${col.name}</strong>
                <span style="color:#aaa; font-size:11px; margin-right:6px; font-family:monospace;">${col.hex}</span>
                <span style="background:rgba(229,185,95,0.15); color:var(--gold-accent, #e5b95f); font-size:11px; font-weight:700; padding:2px 8px; border-radius:4px; margin-right:6px;">
                  المجموع: ${colStock} قطعة
                </span>
              </div>
            </div>
            <div style="display:flex; gap:6px;">
              <button type="button" onclick="window.velenAdmin.editColorVariant(${idx})" style="background:#262626; color:#fff; border:1px solid #555; padding:6px 12px; border-radius:4px; font-size:11px; font-weight:700; cursor:pointer; display:inline-flex; align-items:center; gap:5px;">
                <i class="fa-solid fa-pen" style="color:var(--gold-accent);"></i> تعديل اللون والمقاسات
              </button>
              <button type="button" onclick="window.velenAdmin.removeProductColor(${idx})" style="background:rgba(255,71,87,0.15); color:#ff4757; border:1px solid rgba(255,71,87,0.3); padding:6px 12px; border-radius:4px; font-size:11px; font-weight:700; cursor:pointer;">
                <i class="fa-solid fa-trash"></i> حذف
              </button>
            </div>
          </div>

          <!-- Sizes breakdown & photos preview for this color -->
          <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px; background:#141414; padding:8px 10px; border-radius:6px; border:1px solid #282828;">
            <div style="font-size:11px; color:#bbb;">
              <strong style="color:var(--gold-accent);">المقاسات:</strong> ${sizeBreakdown || 'لم يتم تحديد مقاسات'}
            </div>
            <div style="display:flex; align-items:center; gap:6px;">
              ${(col.images || []).map(img => `
                <img src="${img}" style="width:34px; height:34px; object-fit:cover; border-radius:4px; border:1px solid #444;" onerror="this.src='/assets/velen-logo.jpg'">
              `).join('')}
              <span style="font-size:11px; color:#888;">(${imgCount} صور)</span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }
  window._renderProductColorsManager = renderProductColorsManager;

  // ================= COLLECTIONS / CATEGORIES MANAGEMENT =================
  function populateCategoryDropdowns() {
    const prodCategorySelect = document.getElementById('prodCategory');
    const filterSelect = document.getElementById('productCategoryFilter');
    const categories = state.categories || [];

    if (prodCategorySelect && categories.length > 0) {
      const currentVal = prodCategorySelect.value;
      prodCategorySelect.innerHTML = categories.map(c => `
        <option value="${c.nameEn}">${c.nameEn} (${c.nameAr || c.nameEn})</option>
      `).join('');
      if (currentVal && categories.some(c => c.nameEn === currentVal)) {
        prodCategorySelect.value = currentVal;
      }
    }

    if (filterSelect && categories.length > 0) {
      const currentFilter = filterSelect.value || 'all';
      filterSelect.innerHTML = `<option value="all">جميع التصنيفات</option>` + categories.map(c => `
        <option value="${c.nameEn}">${c.nameEn} (${c.nameAr || c.nameEn})</option>
      `).join('');
      filterSelect.value = currentFilter;
    }
  }

  function renderCategoriesTable() {
    const tbody = document.getElementById('categoriesTableBody');
    if (!tbody) return;
    const categories = state.categories || [];

    if (categories.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:#888; padding:18px;">لا توجد كوليكشنز مضافة حالياً.</td></tr>`;
      return;
    }

    tbody.innerHTML = categories.map(c => `
      <tr>
        <td><strong>${c.nameEn}</strong></td>
        <td><strong>${c.nameAr || '—'}</strong></td>
        <td><code>${c.id || c.slug}</code></td>
        <td>
          <div style="display:flex; gap:6px;">
            <button class="link-btn" style="color:var(--gold-accent);" onclick="window.velenAdmin.editCategory('${c.id}')" title="تعديل الاسم">
              <i class="fa-solid fa-pen"></i> تعديل
            </button>
            <button class="link-btn" style="color:#ff6b6b;" onclick="window.velenAdmin.deleteCategory('${c.id}')" title="حذف الكوليكشن">
              <i class="fa-solid fa-trash"></i> حذف
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  function setupProductForm() {
    const dropzone = document.getElementById('prodDropzone');
    const fileInput = document.getElementById('prodFileInput');

    if (dropzone && fileInput) {
      dropzone.addEventListener('click', () => fileInput.click());

      fileInput.addEventListener('change', async (e) => {
        const files = Array.from(e.target.files);
        if (!files || files.length === 0) return;

        dropzone.innerHTML = `<i class="fa-solid fa-spinner fa-spin upload-icon"></i><p>جاري رفع ${files.length} صورة إلى المعرض...</p>`;

        const formData = new FormData();
        files.forEach(f => formData.append('images', f));

        try {
          const res = await fetch('/api/upload-multiple', { method: 'POST', body: formData });
          const data = await res.json();
          if (data.success && data.urls && data.urls.length > 0) {
            data.urls.forEach(u => state.productImages.push(u));
            showAdminToast(`تم رفع ${data.urls.length} صور بنجاح إلى المعرض!`, 'success');
          } else {
            // fallback: single upload
            for (const file of files) {
              const singleData = new FormData();
              singleData.append('media', file);
              const singleRes = await fetch('/api/upload', { method: 'POST', body: singleData });
              const sData = await singleRes.json();
              if (sData.success && sData.url) state.productImages.push(sData.url);
            }
            showAdminToast(`تم رفع ${files.length} صور إلى المعرض!`, 'success');
          }
        } catch (err) {
          showAdminToast('فشل في رفع بعض الصور، يرجى المحاولة ثانية', 'error');
        } finally {
          dropzone.innerHTML = `
            <i class="fa-solid fa-cloud-arrow-up upload-icon"></i>
            <p>اسحب صور الموديل هنا أو اضغط للاختيار (يمكنك اختيار عدة صور معاً دفعة واحدة)</p>
            <span class="upload-hint">يدعم JPG, PNG, WEBP — ارفع قد ما بدك من الصور</span>
            <input type="file" id="prodFileInput" accept="image/*" multiple style="display:none;">
          `;
          const newFileInput = document.getElementById('prodFileInput');
          if (newFileInput) {
            newFileInput.addEventListener('change', (ev) => {
              fileInput.dispatchEvent(new Event('change'));
            });
          }
          renderProductGalleryManager();
        }
      });
    }

    // Color Variant Modal Listeners
    document.getElementById('btnOpenAddColorModal')?.addEventListener('click', openAddColorModal);
    document.getElementById('closeColorVariantModal')?.addEventListener('click', closeColorVariantModal);
    document.getElementById('cancelColorVariantBtn')?.addEventListener('click', closeColorVariantModal);

    // Color Hex & Picker sync in Color Variant Modal
    const varPicker = document.getElementById('colorVarPicker');
    const varHex = document.getElementById('colorVarHex');
    if (varPicker && varHex) {
      varPicker.addEventListener('input', () => {
        varHex.value = varPicker.value.toUpperCase();
      });
      varHex.addEventListener('input', () => {
        let v = varHex.value.trim();
        if (!v.startsWith('#')) v = '#' + v;
        if (/^#[0-9A-Fa-f]{6}$/.test(v)) {
          varPicker.value = v;
        }
      });
    }

    // Color Variant Dedicated Photos Dropzone
    const colorDropzone = document.getElementById('colorVarDropzone');
    const colorFileInput = document.getElementById('colorVarFileInput');
    if (colorDropzone && colorFileInput) {
      colorDropzone.addEventListener('click', () => colorFileInput.click());

      colorFileInput.addEventListener('change', async (e) => {
        const files = Array.from(e.target.files);
        if (!files || files.length === 0) return;

        colorDropzone.innerHTML = `<i class="fa-solid fa-spinner fa-spin upload-icon" style="font-size:24px; color:var(--gold-accent);"></i><p style="margin:0; font-size:13px;">جاري رفع ${files.length} صورة لهذا اللون...</p>`;

        const formData = new FormData();
        files.forEach(f => formData.append('images', f));

        try {
          const res = await fetch('/api/upload-multiple', { method: 'POST', body: formData });
          const data = await res.json();
          if (data.success && data.urls && data.urls.length > 0) {
            data.urls.forEach(u => state.currentColorEditingImages.push(u));
            showAdminToast(`تم رفع ${data.urls.length} صور لهذا اللون!`, 'success');
          } else {
            for (const file of files) {
              const singleData = new FormData();
              singleData.append('media', file);
              const singleRes = await fetch('/api/upload', { method: 'POST', body: singleData });
              const sData = await singleRes.json();
              if (sData.success && sData.url) state.currentColorEditingImages.push(sData.url);
            }
            showAdminToast(`تم رفع ${files.length} صور لهذا اللون!`, 'success');
          }
        } catch (err) {
          showAdminToast('فشل في رفع صور اللون، يرجى المحاولة ثانية', 'error');
        } finally {
          colorDropzone.innerHTML = `
            <i class="fa-solid fa-cloud-arrow-up upload-icon" style="font-size:24px; color:var(--gold-accent); margin-bottom:6px;"></i>
            <p style="margin:0; font-size:13px; font-weight:600;">اضغط هنا لاختيار صور هذا اللون من جهازك</p>
            <span style="font-size:11px; color:#888;">يمكنك اختيار صورة أو عدة صور معاً دفعة واحدة</span>
            <input type="file" id="colorVarFileInput" accept="image/*" multiple style="display:none;">
          `;
          renderColorVarImagesGrid();
        }
      });
    }

    // Color Variant Size Grid Listeners
    const colorSizeGrid = document.getElementById('colorVarSizeGrid');
    if (colorSizeGrid) {
      colorSizeGrid.addEventListener('change', (e) => {
        if (e.target.classList.contains('color-size-enable-check')) {
          const card = e.target.closest('.size-stock-card');
          const input = card.querySelector('.color-size-qty-input');
          if (e.target.checked) {
            card.classList.add('active');
            if ((parseInt(input.value, 10) || 0) === 0) input.value = 5;
          } else {
            card.classList.remove('active');
          }
          recalculateColorVarStock();
        }
      });

      colorSizeGrid.addEventListener('input', (e) => {
        if (e.target.classList.contains('color-size-qty-input')) {
          const card = e.target.closest('.size-stock-card');
          const check = card.querySelector('.color-size-enable-check');
          const val = parseInt(e.target.value, 10) || 0;
          if (val > 0 && !check.checked) {
            check.checked = true;
            card.classList.add('active');
          }
          recalculateColorVarStock();
        }
      });
    }

    // Save Color Variant Button
    document.getElementById('colorVariantForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('colorVarName')?.value.trim();
      const hex = document.getElementById('colorVarHex')?.value.trim() || '#000000';
      const editIdx = parseInt(document.getElementById('editColorVariantIndex')?.value, 10);

      if (!name) {
        showAdminToast('يرجى كتابة اسم اللون', 'error');
        return;
      }

      // Collect sizes & size inventory for this color
      const sizeInventory = {};
      const sizes = [];
      let colorStock = 0;
      const sizeCards = document.querySelectorAll('#colorVarSizeGrid .size-stock-card');
      sizeCards.forEach(card => {
        const size = card.getAttribute('data-size');
        const check = card.querySelector('.color-size-enable-check');
        const input = card.querySelector('.color-size-qty-input');
        if (check && check.checked) {
          const qty = parseInt(input.value, 10) || 0;
          sizeInventory[size] = qty;
          sizes.push(size);
          colorStock += qty;
        }
      });

      const colorObj = {
        name,
        hex,
        images: [...state.currentColorEditingImages],
        image: state.currentColorEditingImages[0] || '',
        sizeInventory,
        sizes: sizes.length > 0 ? sizes : ['S', 'M', 'L', 'XL'],
        stock: colorStock
      };

      state.productColors = state.productColors || [];
      if (editIdx >= 0 && editIdx < state.productColors.length) {
        state.productColors[editIdx] = colorObj;
        showAdminToast(`تم تحديث اللون (${name}) بنجاح!`, 'success');
      } else {
        state.productColors.push(colorObj);
        showAdminToast(`تمت إضافة اللون (${name}) بنجاح!`, 'success');
      }

      // Sync color images to general gallery if empty
      if (state.productImages.length === 0 && colorObj.images.length > 0) {
        colorObj.images.forEach(u => state.productImages.push(u));
        renderProductGalleryManager();
      }

      closeColorVariantModal();
      renderProductColorsManager();
      recalculateOverallProductStock();
    });

    // Collections Management Listeners
    document.getElementById('openCollectionsModalBtn')?.addEventListener('click', () => {
      renderCategoriesTable();
      document.getElementById('collectionsModal')?.classList.add('active');
    });
    document.getElementById('closeCollectionsModal')?.addEventListener('click', () => {
      document.getElementById('collectionsModal')?.classList.remove('active');
    });

    // Category Form Submit
    document.getElementById('categoryForm')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const editId = document.getElementById('editCategoryId')?.value.trim();
      const nameEn = document.getElementById('catNameEn')?.value.trim();
      const nameAr = document.getElementById('catNameAr')?.value.trim();

      if (!nameEn && !nameAr) {
        showAdminToast('يرجى إدخال اسم الكوليكشن', 'error');
        return;
      }

      try {
        const res = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editId || undefined, nameEn, nameAr })
        });
        const data = await res.json();
        if (data.success) {
          state.categories = data.categories;
          document.getElementById('categoryForm').reset();
          document.getElementById('editCategoryId').value = '';
          document.getElementById('categoryFormTitle').textContent = '+ إضافة كوليكشن جديد:';
          renderCategoriesTable();
          populateCategoryDropdowns();
          showAdminToast('تم حفظ الكوليكشن وتحديث المتجر بالبث الحي!', 'success');
        } else {
          showAdminToast(data.message || 'فشل حفظ الكوليكشن', 'error');
        }
      } catch (err) {
        showAdminToast('حدث خطأ أثناء حفظ الكوليكشن', 'error');
      }
    });

    // Setup size inventory listeners
    const sizeGrid = document.getElementById('sizeInventoryGrid');
    if (sizeGrid) {
      function recalculateTotalStock() {
        let total = 0;
        const cards = sizeGrid.querySelectorAll('.size-stock-card');
        cards.forEach(card => {
          const check = card.querySelector('.size-enable-check');
          const input = card.querySelector('.size-qty-input');
          if (check && check.checked) {
            const qty = parseInt(input.value, 10) || 0;
            total += qty;
          }
        });
        const prodStock = document.getElementById('prodStock');
        const badge = document.getElementById('totalCalculatedStockBadge');
        if (prodStock) prodStock.value = total;
        if (badge) badge.textContent = total;
      }

      sizeGrid.addEventListener('change', (e) => {
        if (e.target.classList.contains('size-enable-check')) {
          const card = e.target.closest('.size-stock-card');
          const input = card.querySelector('.size-qty-input');
          if (e.target.checked) {
            card.classList.add('active');
            if ((parseInt(input.value, 10) || 0) === 0) {
              input.value = 5;
            }
          } else {
            card.classList.remove('active');
          }
          recalculateTotalStock();
        }
      });

      sizeGrid.addEventListener('input', (e) => {
        if (e.target.classList.contains('size-qty-input')) {
          const card = e.target.closest('.size-stock-card');
          const check = card.querySelector('.size-enable-check');
          const val = parseInt(e.target.value, 10) || 0;
          if (val > 0 && !check.checked) {
            check.checked = true;
            card.classList.add('active');
          }
          recalculateTotalStock();
        }
      });

      window._recalculateTotalStock = recalculateTotalStock;
    }

    productForm?.addEventListener('submit', async (e) => {
      e.preventDefault();

      const editId = document.getElementById('editProductId').value;
      const name = document.getElementById('prodName').value.trim();
      const price = parseFloat(document.getElementById('prodPrice').value);
      const comparePriceVal = document.getElementById('prodComparePrice').value;
      const comparePrice = comparePriceVal ? parseFloat(comparePriceVal) : null;
      const category = document.getElementById('prodCategory').value;
      const onSale = document.getElementById('prodOnSale').checked;
      const featured = document.getElementById('prodFeatured').checked;
      const fabric = document.getElementById('prodFabric').value.trim();
      const description = document.getElementById('prodDescription').value.trim();
      const imageUrlInput = document.getElementById('prodImageUrl')?.value?.trim() || '';

      // Collect sizeInventory and active sizes
      let sizeInventory = {};
      let sizes = [];
      let totalStock = 0;

      if (state.productColors && state.productColors.length > 0) {
        // Aggregate from color variants!
        state.productColors.forEach(col => {
          totalStock += (col.stock !== undefined ? col.stock : 0);
          if (col.sizeInventory) {
            Object.entries(col.sizeInventory).forEach(([s, q]) => {
              sizeInventory[s] = (sizeInventory[s] || 0) + (parseInt(q, 10) || 0);
              if (q > 0 && !sizes.includes(s)) sizes.push(s);
            });
          }
        });
      } else {
        const cards = document.querySelectorAll('#sizeInventoryGrid .size-stock-card');
        cards.forEach(card => {
          const size = card.getAttribute('data-size');
          const check = card.querySelector('.size-enable-check');
          const input = card.querySelector('.size-qty-input');
          if (check && check.checked) {
            const qty = parseInt(input.value, 10) || 0;
            sizeInventory[size] = qty;
            sizes.push(size);
            totalStock += qty;
          }
        });
      }

      // Collect all images from colors and gallery
      const colorImages = (state.productColors || []).flatMap(c => c.images || []);
      const combinedImages = Array.from(new Set([...(state.productImages || []), ...colorImages]));
      const primaryImage = combinedImages[0] || imageUrlInput || '/assets/velen-logo.jpg';
      const allImages = combinedImages.length > 0 ? combinedImages : [primaryImage];

      const costPriceVal = document.getElementById('prodCostPrice')?.value;
      const costPrice = costPriceVal !== '' && costPriceVal !== undefined ? parseFloat(costPriceVal) : 5.000;

      const payload = {
        name,
        price,
        comparePrice,
        costPrice,
        category,
        stock: totalStock,
        sizeInventory,
        onSale,
        featured,
        fabric,
        description,
        sizes: sizes.length > 0 ? sizes : ['S', 'M', 'L', 'XL'],
        colors: state.productColors && state.productColors.length > 0 ? state.productColors : [{ name: 'Default', hex: '#000000', images: allImages }],
        image: primaryImage,
        images: allImages
      };

      try {
        let res;
        if (editId) {
          res = await fetch(`/api/products/${editId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
        } else {
          res = await fetch('/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
        }

        const result = await res.json();
        if (result.success) {
          closeProductModal();
          await fetchAllData();
          showAdminToast(editId ? 'تم تحديث القطعة وتحديث المتجر بالبث الحي!' : 'تم إضافة القطعة الجديدة وظهرت فوراً عند الزبائن!', 'success');
        }
      } catch (err) {
        console.error(err);
        showAdminToast('حدث خطأ أثناء الحفظ', 'error');
      }
    });

    // Settings Submit
    document.getElementById('settingsForm')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const updatedSettings = {
        announcement: document.getElementById('setAnnouncement').value.trim(),
        brandName: document.getElementById('setBrandName').value.trim(),
        currency: document.getElementById('setCurrency').value.trim(),
        slogan: document.getElementById('setSlogan').value.trim(),
        subSlogan: document.getElementById('setSubSlogan').value.trim(),
        orderEmail: document.getElementById('setOrderEmail')?.value.trim() || 'Velenoffical@gmail.com',
        gmailUser: document.getElementById('setGmailUser')?.value.trim() || 'Velenoffical@gmail.com',
        gmailAppPassword: document.getElementById('setGmailAppPassword')?.value.trim() || '',
        social: {
          instagram: document.getElementById('setSocialInstagram')?.value.trim() || 'https://instagram.com/velenofficial',
          tiktok: document.getElementById('setSocialTiktok')?.value.trim() || 'https://tiktok.com/@velenofficial',
          whatsapp: document.getElementById('setSocialWhatsapp')?.value.trim() || '+962 7 7018 8144',
          facebook: document.getElementById('setSocialFacebook')?.value.trim() || 'https://facebook.com/velenofficial'
        },
        policies: {
          shipping: {
            titleEn: document.getElementById('polShippingTitleEn')?.value.trim() || 'Shipping & Exchange Policy',
            titleAr: document.getElementById('polShippingTitleAr')?.value.trim() || 'سياسة الشحن والتبديل',
            deliveryEn: document.getElementById('polDeliveryEn')?.value.trim() || '',
            deliveryAr: document.getElementById('polDeliveryAr')?.value.trim() || '',
            exchangeEn: document.getElementById('polExchangeEn')?.value.trim() || '',
            exchangeAr: document.getElementById('polExchangeAr')?.value.trim() || ''
          },
          care: {
            titleEn: document.getElementById('polCareTitleEn')?.value.trim() || 'Fabric & Garment Care Guide (260 GSM)',
            titleAr: document.getElementById('polCareTitleAr')?.value.trim() || 'دليل العناية بالقطن الثقيل 260 GSM',
            introEn: document.getElementById('polCareIntroEn')?.value.trim() || '',
            introAr: document.getElementById('polCareIntroAr')?.value.trim() || ''
          }
        }
      };

      try {
        const res = await fetch('/api/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedSettings)
        });
        const data = await res.json();
        if (data.success) {
          state.settings = data.settings;
          showAdminToast('تم حفظ الإعدادات وتحديث الموقع الرسمي فوراً!', 'success');
        }
      } catch (e) {
        showAdminToast('فشل حفظ الإعدادات', 'error');
      }
    });
  }

  function openNewProductModal() {
    productForm.reset();
    document.getElementById('editProductId').value = '';
    document.getElementById('productModalTitle').textContent = 'إضافة قطعة جديدة إلى Velen Collection';
    state.uploadedProductImageUrl = null;
    state.productImages = [];
    state.productColors = [];
    if (window._renderProductGalleryManager) window._renderProductGalleryManager();
    if (window._renderProductColorsManager) window._renderProductColorsManager();

    if (document.getElementById('prodCostPrice')) {
      document.getElementById('prodCostPrice').value = '5.000';
    }
    
    const dropzone = document.getElementById('prodDropzone');
    if (dropzone) {
      dropzone.style.display = 'block';
    }

    // Reset size inventory grid to standard defaults
    const sizeCards = document.querySelectorAll('#sizeInventoryGrid .size-stock-card');
    sizeCards.forEach(card => {
      const size = card.getAttribute('data-size');
      const check = card.querySelector('.size-enable-check');
      const input = card.querySelector('.size-qty-input');
      const isDefault = ['S', 'M', 'L', 'XL'].includes(size);
      check.checked = isDefault;
      if (isDefault) {
        card.classList.add('active');
        input.value = 5;
      } else {
        card.classList.remove('active');
        input.value = 0;
      }
    });
    if (window._recalculateTotalStock) window._recalculateTotalStock();

    productEditModal.classList.add('active');
  }

  function closeProductModal() {
    productEditModal.classList.remove('active');
  }

  // ================= EVENT LISTENERS =================
  function setupEventListeners() {
    // Navigation Tabs
    navItems.forEach(item => {
      item.addEventListener('click', () => {
        const tab = item.getAttribute('data-tab');
        switchTab(tab);
      });
    });

    // Mobile Sidebar Toggle
    mobileMenuBtn?.addEventListener('click', () => {
      adminSidebar.classList.toggle('open');
    });

    // Quick Add Product
    document.getElementById('quickAddProductBtn')?.addEventListener('click', openNewProductModal);
    document.getElementById('openNewProductModalBtn')?.addEventListener('click', openNewProductModal);
    document.getElementById('closeProductEditModal')?.addEventListener('click', closeProductModal);
    document.getElementById('cancelProductBtn')?.addEventListener('click', closeProductModal);

    // Filter Listeners
    document.getElementById('productSearchInput')?.addEventListener('input', renderProducts);
    document.getElementById('productCategoryFilter')?.addEventListener('change', renderProducts);
    document.getElementById('orderSearchInput')?.addEventListener('input', renderOrders);
    document.getElementById('orderStatusFilter')?.addEventListener('change', renderOrders);

    // Promo Codes Listeners
    document.getElementById('openNewPromoModalBtn')?.addEventListener('click', openPromoModal);
    document.getElementById('closePromoModal')?.addEventListener('click', closePromoModal);
    document.getElementById('cancelPromoBtn')?.addEventListener('click', closePromoModal);
    document.getElementById('promoSearchInput')?.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      const rows = document.querySelectorAll('#promoCodesTableBody tr');
      rows.forEach(r => {
        const text = r.textContent.toLowerCase();
        r.style.display = text.includes(q) ? '' : 'none';
      });
    });

    // Test Email Button
    document.getElementById('testEmailBtn')?.addEventListener('click', async () => {
      const btn = document.getElementById('testEmailBtn');
      const origHtml = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> جاري فحص الاتصال وإرسال إيميل تجريبي...`;

      const toEmail = document.getElementById('setOrderEmail')?.value.trim() || 'Velenoffical@gmail.com';
      const gmailUser = document.getElementById('setGmailUser')?.value.trim() || 'Velenoffical@gmail.com';
      const gmailAppPassword = document.getElementById('setGmailAppPassword')?.value.trim() || '';

      try {
        const res = await fetch('/api/admin/test-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ toEmail, gmailUser, gmailAppPassword })
        });
        const data = await res.json();
        if (data.success) {
          showAdminToast('✅ تم إرسال الإيميل التجريبي بنجاح عبر سيرفرات Gmail!', 'success');
          alert(`✅ نجح الإرسال!\n\nتم إرسال إيميل تجريبي إلى: ${toEmail}\nمرسلاً عبر: ${gmailUser}\nيرجى تفقد بريدك الوارد (Inbox) أو مجلد البريد غير المرغوب فيه (Spam).`);
        } else {
          showAdminToast(`❌ فشل إرسال الإيميل: ${data.message || 'خطأ في المصادقة'}`, 'error');
          alert(`❌ فشل إرسال الإيميل:\n\n${data.message}\n\nيرجى التأكد من إنشاء App Password مخصص من 16 حرفاً من حساب جوجل الخاص بك.`);
        }
      } catch (err) {
        showAdminToast('حدث خطأ أثناء فحص الإيميل', 'error');
      } finally {
        btn.disabled = false;
        btn.innerHTML = origHtml;
      }
    });

    // Toggle Gmail Password visibility
    document.getElementById('toggleGmailPassBtn')?.addEventListener('click', () => {
      const inp = document.getElementById('setGmailAppPassword');
      const btn = document.getElementById('toggleGmailPassBtn');
      if (!inp) return;
      if (inp.type === 'password') {
        inp.type = 'text';
        btn.innerHTML = '<i class="fa-solid fa-eye-slash"></i>';
      } else {
        inp.type = 'password';
        btn.innerHTML = '<i class="fa-solid fa-eye"></i>';
      }
    });

    // Forms
    setupProductForm();
    setupDesignCustomizer();
    setupMasterLock();
  }

  // ================= MASTER PIN LOCK SCREEN =================
  function setupMasterLock() {
    const lockOverlay = document.getElementById('adminLockOverlay');
    const lockForm = document.getElementById('adminLockForm');
    const pinInput = document.getElementById('adminPinInput');
    const toggleEye = document.getElementById('togglePinVisBtn');
    const errorMsg = document.getElementById('lockErrorMsg');
    const lockSidebarBtn = document.getElementById('lockAdminPortalBtn');

    if (!lockOverlay) return;

    // Check if session is already unlocked
    const isUnlocked = sessionStorage.getItem('velen_admin_unlocked') === 'true';
    if (!isUnlocked) {
      lockOverlay.classList.add('active');
      setTimeout(() => pinInput?.focus(), 300);
    } else {
      lockOverlay.classList.remove('active');
    }

    // Toggle Eye (show/hide password)
    toggleEye?.addEventListener('click', () => {
      if (pinInput.type === 'password') {
        pinInput.type = 'text';
        toggleEye.innerHTML = '<i class="fa-solid fa-eye-slash"></i>';
      } else {
        pinInput.type = 'password';
        toggleEye.innerHTML = '<i class="fa-solid fa-eye"></i>';
      }
    });

    // Form Submit
    lockForm?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const passcode = pinInput.value.trim();
      if (!passcode) return;

      try {
        const res = await fetch('/api/admin/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ passcode })
        });
        const data = await res.json();

        if (data.success) {
          sessionStorage.setItem('velen_admin_unlocked', 'true');
          lockOverlay.classList.remove('active');
          if (errorMsg) errorMsg.style.display = 'none';
          playNotificationSound();
          showAdminToast('تم فتح قفل لوحة التحكم بنجاح، أهلاً بك!', 'success');
        } else {
          if (errorMsg) {
            errorMsg.textContent = data.message || 'رمز الدخول غير صحيح، يرجى المحاولة ثانية';
            errorMsg.style.display = 'block';
          }
          pinInput.value = '';
          pinInput.focus();
        }
      } catch (err) {
        if (errorMsg) {
          errorMsg.textContent = 'حدث خطأ في الاتصال بالخادم';
          errorMsg.style.display = 'block';
        }
      }
    });

    // Sidebar Lock Button
    lockSidebarBtn?.addEventListener('click', async () => {
      sessionStorage.removeItem('velen_admin_unlocked');
      lockOverlay.classList.add('active');
      if (pinInput) {
        pinInput.value = '';
        setTimeout(() => pinInput.focus(), 300);
      }
      try {
        await fetch('/api/admin/logout', { method: 'POST' });
      } catch (e) {}
      showAdminToast('تم قفل لوحة التحكم', 'info');
    });
  }

  // ================= PROMO CODES MANAGEMENT =================
  // ================= PROMO CODES MANAGEMENT =================
  function openPromoModal() {
    if (promoForm) promoForm.reset();
    document.getElementById('editPromoCodeOriginal').value = '';
    document.getElementById('promoModalTitle').textContent = 'إنشاء كود خصم جديد (Promo Code)';
    document.getElementById('promoCodeInput').readOnly = false;
    document.getElementById('promoActiveCheck').checked = true;
    if (promoModal) promoModal.classList.add('active');
  }

  function editPromo(code) {
    const promo = (state.promos || []).find(p => p.code === code);
    if (!promo) return;

    document.getElementById('editPromoCodeOriginal').value = promo.code;
    document.getElementById('promoModalTitle').textContent = `تعديل كود الخصم: ${promo.code}`;
    document.getElementById('promoCodeInput').value = promo.code;
    document.getElementById('promoCodeInput').readOnly = true;
    document.getElementById('promoTypeSelect').value = promo.discountType || promo.type || 'percentage';
    document.getElementById('promoValueInput').value = promo.discountValue !== undefined ? promo.discountValue : promo.value;
    document.getElementById('promoMinOrderInput').value = promo.minOrder || 0;
    document.getElementById('promoUsageLimitInput').value = promo.usageLimit || '';
    document.getElementById('promoActiveCheck').checked = promo.active !== false;

    if (promoModal) promoModal.classList.add('active');
  }

  function closePromoModal() {
    if (promoModal) promoModal.classList.remove('active');
  }

  function setupPromoCodes() {
    promoForm?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const originalCode = document.getElementById('editPromoCodeOriginal')?.value.trim();
      const code = document.getElementById('promoCodeInput')?.value.trim().toUpperCase();
      const discountType = document.getElementById('promoTypeSelect')?.value;
      const discountValue = parseFloat(document.getElementById('promoValueInput')?.value) || 0;
      const minOrder = parseFloat(document.getElementById('promoMinOrderInput')?.value) || 0;
      const usageLimitVal = document.getElementById('promoUsageLimitInput')?.value;
      const usageLimit = usageLimitVal ? (parseInt(usageLimitVal, 10) || null) : null;
      const active = Boolean(document.getElementById('promoActiveCheck')?.checked);

      if (!code || discountValue <= 0) {
        showAdminToast('يرجى كتابة رمز الكود وقيمة الخصم بشكل صحيح', 'error');
        return;
      }

      // If editing existing, preserve current timesUsed
      const existingPromo = (state.promos || []).find(p => p.code === (originalCode || code));
      const timesUsed = existingPromo ? (existingPromo.timesUsed || existingPromo.uses || 0) : 0;

      try {
        const res = await fetch('/api/promo-codes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code,
            discountType,
            discountValue,
            minOrder,
            usageLimit,
            active,
            timesUsed
          })
        });
        const data = await res.json();
        if (data.success) {
          closePromoModal();
          await fetchPromoCodes();
          showAdminToast(originalCode ? `تم تعديل كود الخصم (${code}) وتحديث الليميت!` : `تم إنشاء وتفعيل كود الخصم (${code}) بنجاح!`, 'success');
        } else {
          showAdminToast(data.error || 'فشل حفظ كود الخصم', 'error');
        }
      } catch (err) {
        showAdminToast('حدث خطأ في الاتصال بالخادم', 'error');
      }
    });
  }

  async function fetchPromoCodes() {
    try {
      const res = await fetch('/api/promo-codes');
      state.promos = await res.json();
      renderPromoCodes();
      updateBadgeCounts();
    } catch (e) {
      console.error(e);
    }
  }

  function renderPromoCodes() {
    const tbody = document.getElementById('promoCodesTableBody');
    if (!tbody) return;

    if (!state.promos || state.promos.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:#777; padding:24px;">لا توجد كودات خصم مضافة حالياً. اضغط "إنشاء كود خصم جديد" لإضافة كود.</td></tr>`;
      return;
    }

    tbody.innerHTML = state.promos.map(p => {
      const used = parseInt(p.timesUsed || p.uses || 0, 10);
      const limit = p.usageLimit ? parseInt(p.usageLimit, 10) : null;
      const isExceeded = limit !== null && used >= limit;

      return `
        <tr>
          <td><strong style="color:var(--gold-accent, #e5b95f); letter-spacing:1px; font-size:14px;">${p.code}</strong></td>
          <td>${p.discountType === 'percentage' ? 'نسبة مئوية (%)' : 'مبلغ ثابت (JOD)'}</td>
          <td><strong>${p.discountType === 'percentage' ? `${p.discountValue}%` : `${Number(p.discountValue).toFixed(3)} JOD`}</strong></td>
          <td>${p.minOrder > 0 ? `${Number(p.minOrder).toFixed(3)} JOD` : 'بدون حد أدنى'}</td>
          <td>
            <span style="font-weight:700; color:${isExceeded ? '#ff6b6b' : '#fff'};">${used}</span> / 
            <span style="color:${isExceeded ? '#ff6b6b' : '#aaa'}; font-weight:${isExceeded ? '700' : 'normal'};">${limit ? `${limit} مرة` : 'غير محدود'}</span>
            ${isExceeded ? '<br><span style="color:#ff6b6b; font-size:10px; font-weight:700;">(استُنفد الحد الأقصى)</span>' : ''}
          </td>
          <td><span class="${p.active !== false && !isExceeded ? 'status-active-promo' : 'status-inactive-promo'}">${p.active !== false ? (isExceeded ? 'مكتمل' : 'فعال') : 'معطل'}</span></td>
          <td>
            <div style="display:flex; gap:6px;">
              <button class="link-btn" style="color:var(--gold-accent);" onclick="window.velenAdmin.editPromo('${p.code}')" title="تعديل الكود والليميت">
                <i class="fa-solid fa-pen"></i>
              </button>
              <button class="link-btn" style="color:#ff6b6b;" onclick="window.velenAdmin.deletePromo('${p.code}')" title="حذف الكود">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  // ================= AI COPILOT / CHATGPT INTEGRATION =================
  function setupAiChat() {
    const form = document.getElementById('aiChatForm');
    const input = document.getElementById('aiChatInput');
    const chips = document.querySelectorAll('.ai-prompt-chip');

    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        const prompt = chip.getAttribute('data-prompt');
        if (input && prompt) {
          input.value = prompt;
          form?.requestSubmit();
        }
      });
    });

    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const prompt = input.value.trim();
        if (!prompt) return;

        appendAiBubble('user', prompt);
        input.value = '';

        const loadingId = 'ai_loading_' + Date.now();
        appendAiBubble('bot', '<i class="fa-solid fa-spinner fa-spin"></i> جاري تحليل بيانات المتجر والتفكير...', loadingId);

        try {
          const res = await fetch('/api/admin/ai-assistant', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt })
          });
          const data = await res.json();
          const loadingEl = document.getElementById(loadingId);
          if (loadingEl) {
            loadingEl.innerHTML = formatAiResponse(data.reply || data.error || 'عذراً، لم أستطع إتمام الإجابة حالياً.');
          }
        } catch (err) {
          const loadingEl = document.getElementById(loadingId);
          if (loadingEl) {
            loadingEl.textContent = 'حدث خطأ في الاتصال بالمساعد الذكي.';
          }
        }
      });
    }
  }

  function appendAiBubble(sender, content, id = null) {
    const chatBox = document.getElementById('aiChatBox');
    if (!chatBox) return;

    const msgDiv = document.createElement('div');
    msgDiv.className = `ai-msg ${sender === 'user' ? 'ai-msg-user' : 'ai-msg-bot'}`;

    const avatarHtml = sender === 'user'
      ? `<div class="ai-avatar"><i class="fa-solid fa-user-tie" style="color:#e5b95f;"></i></div>`
      : `<div class="ai-avatar"><img src="/assets/velen-logo.jpg" alt="Velen AI"></div>`;

    msgDiv.innerHTML = `
      ${avatarHtml}
      <div class="ai-bubble" ${id ? `id="${id}"` : ''}>
        ${content}
      </div>
    `;

    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  function formatAiResponse(text) {
    let formatted = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>');

    return formatted.split('\n\n').map(p => {
      if (p.includes('\n•') || p.includes('\n-') || p.startsWith('•') || p.startsWith('-')) {
        const items = p.split(/\n[•\-]\s*/).filter(Boolean);
        return `<ul>${items.map(it => `<li>${it}</li>`).join('')}</ul>`;
      }
      return `<p>${p.replace(/\n/g, '<br>')}</p>`;
    }).join('');
  }

  function switchTab(tabId) {
    state.activeTab = tabId;
    navItems.forEach(n => {
      if (n.getAttribute('data-tab') === tabId) n.classList.add('active');
      else n.classList.remove('active');
    });

    tabPanes.forEach(p => {
      if (p.id === `tab-${tabId}`) p.classList.add('active');
      else p.classList.remove('active');
    });

    const titles = {
      dashboard: 'نظرة عامة والإحصائيات',
      products: 'إدارة المنتجات وكتالوج Velen',
      orders: 'الطلبات والمبيعات وإدارة التوصيل',
      community: 'مشاركات المجتمع وتقييمات الـ 5 نجوم',
      promos: 'إدارة كودات الخصم والعروض الترويجية',
      finance: 'المالية والأرباح وحساب التكاليف (Finance & P&L)',
      design: 'تخصيص التصميم والتركيبة وهيكلية المتجر',
      settings: 'إعدادات متجر Velen الرسمية',
      ai: 'Velen AI Copilot — مستشار الذكاء الاصطناعي'
    };
    if (pageTitle) pageTitle.textContent = titles[tabId] || 'لوحة التحكم';

    if (window.innerWidth <= 768) {
      adminSidebar.classList.remove('open');
    }
  }

  // Helpers
  function getStatusClass(status) {
    switch (status) {
      case 'Pending': return 'pending';
      case 'Preparing': return 'preparing';
      case 'Out for Delivery': return 'out';
      case 'Delivered': return 'delivered';
      default: return 'pending';
    }
  }

  function getStatusLabel(status) {
    switch (status) {
      case 'Pending': return 'قيد الانتظار';
      case 'Preparing': return 'جاري التجهيز';
      case 'Out for Delivery': return 'مع المندوب';
      case 'Delivered': return 'تم التسليم';
      case 'Cancelled': return 'ملغي';
      default: return status;
    }
  }

  function formatDate(dStr) {
    if (!dStr) return '';
    const d = new Date(dStr);
    return `${d.toLocaleDateString('ar-JO')} ${d.toLocaleTimeString('ar-JO', { hour: '2-digit', minute: '2-digit' })}`;
  }

  function showAdminToast(msg, type = 'info') {
    if (!adminToastContainer) return;
    const toast = document.createElement('div');
    toast.className = `admin-toast ${type}`;
    const icon = type === 'success' ? 'fa-circle-check' : 'fa-bell';
    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${msg}</span>`;
    adminToastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, 4500);
  }

  // ================= DESIGN & LAYOUT CUSTOMIZER =================
  const SECTION_METADATA = {
    hero: { title: 'البانر الترحيبي وصورة الغلاف الرئيسية', sub: 'Hero Cover & Title', icon: 'fa-image' },
    valueProps: { title: 'شريط المميزات والضمانات الفاخرة', sub: 'Value Proposition Badges', icon: 'fa-tags' },
    collection: { title: 'كتالوج وتشكيلة الملابس والمنتجات', sub: 'Velen Collection Grid', icon: 'fa-shirt' },
    community: { title: 'مشاركات المجتمع وتقييمات الـ 5 نجوم', sub: 'Community Looks & Reviews', icon: 'fa-users-viewfinder' },
    about: { title: 'قصة البراند وعن Velen في عمّان', sub: 'About Us & Story Section', icon: 'fa-book-open' }
  };

  function renderSectionsOrderList() {
    const listEl = document.getElementById('sectionsOrderList');
    if (!listEl || !state.design || !Array.isArray(state.design.sectionsOrder)) return;

    const order = state.design.sectionsOrder;
    const visibility = state.design.sectionsVisibility || {};

    listEl.innerHTML = order.map((key, idx) => {
      const meta = SECTION_METADATA[key] || { title: key, sub: '', icon: 'fa-layer-group' };
      const isVisible = visibility[key] !== false;
      const isFirst = idx === 0;
      const isLast = idx === order.length - 1;

      return `
        <div class="section-order-row ${isVisible ? '' : 'disabled-sec'}" data-key="${key}">
          <div class="section-order-info">
            <span class="order-badge">${idx + 1}</span>
            <i class="fa-solid ${meta.icon}" style="color:var(--gold-accent, #e5b95f);"></i>
            <div>
              <span class="section-order-title">${meta.title}</span>
              <span class="section-order-sub">(${meta.sub})</span>
            </div>
          </div>
          <div class="section-order-actions">
            <label class="toggle-switch-inline" title="إظهار أو إخفاء القسم">
              <input type="checkbox" ${isVisible ? 'checked' : ''} onchange="window.velenAdmin.toggleSectionVisibility('${key}', this.checked)">
              <span>${isVisible ? 'ظاهر' : 'مخفي'}</span>
            </label>
            <button type="button" class="btn-reorder" title="تقديم للأعلى" ${isFirst ? 'disabled' : ''} onclick="window.velenAdmin.moveSection(${idx}, -1)">
              <i class="fa-solid fa-arrow-up"></i>
            </button>
            <button type="button" class="btn-reorder" title="تأخير للأسفل" ${isLast ? 'disabled' : ''} onclick="window.velenAdmin.moveSection(${idx}, 1)">
              <i class="fa-solid fa-arrow-down"></i>
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  function populateDesignCustomizer() {
    if (!state.design) return;
    const d = state.design;

    // 0. Coming Soon
    if (d.comingSoon) {
      const csEnabled = document.getElementById('desComingSoonEnabled');
      if (csEnabled) csEnabled.checked = Boolean(d.comingSoon.enabled);
      const csDate = document.getElementById('desCsLaunchDate');
      if (csDate && d.comingSoon.launchDate) {
        try {
          const dt = new Date(d.comingSoon.launchDate);
          const pad = n => String(n).padStart(2, '0');
          csDate.value = `${dt.getFullYear()}-${pad(dt.getMonth()+1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
        } catch (e) {
          csDate.value = d.comingSoon.launchDate;
        }
      }
      const csTitle = document.getElementById('desCsTitle');
      if (csTitle) csTitle.value = d.comingSoon.title || '';
      const csSub = document.getElementById('desCsSub');
      if (csSub) csSub.value = d.comingSoon.subtitle || '';
      const csOffer = document.getElementById('desCsOffer');
      if (csOffer) csOffer.value = d.comingSoon.discountOffer || '';
    }

    // 1. Sections Order & Visibility
    renderSectionsOrderList();

    // 2. Hero
    if (d.hero) {
      const heroEnabled = document.getElementById('desHeroEnabled');
      if (heroEnabled) heroEnabled.checked = d.hero.enabled !== false;
      const heroBg = document.getElementById('desHeroBgImage');
      if (heroBg) heroBg.value = d.hero.bgImage || '';
      const heroBrand = document.getElementById('desHeroBrandTitle');
      if (heroBrand) heroBrand.value = d.hero.brandTitle || 'VELEN';
      const heroMain = document.getElementById('desHeroMainHeading');
      if (heroMain) heroMain.value = d.hero.mainHeading || '';
      const heroSub = document.getElementById('desHeroSubHeading');
      if (heroSub) heroSub.value = d.hero.subHeading || '';
      const heroCta = document.getElementById('desHeroCtaText');
      if (heroCta) heroCta.value = d.hero.ctaText || 'SHOP THE COLLECTION';

      updateHeroPreview(d.hero.bgImage);
    }

    // 3. Header & Identity
    if (d.header) {
      const showAnn = document.getElementById('desHeaderShowAnnouncement');
      if (showAnn) showAnn.checked = d.header.showAnnouncement !== false;
      const annText = document.getElementById('desHeaderAnnouncementText');
      if (annText) annText.value = d.header.announcementText || '';
      const logoUrl = document.getElementById('desHeaderLogoUrl');
      if (logoUrl) logoUrl.value = d.header.logoUrl || '';
      const brandName = document.getElementById('desHeaderBrandName');
      if (brandName) brandName.value = d.header.brandName || 'Velen Official';

      updateLogoPreview(d.header.logoUrl);
    }

    // 4. Value Props
    if (d.valueProps) {
      const vpEnabled = document.getElementById('desValuePropsEnabled');
      if (vpEnabled) vpEnabled.checked = d.valueProps.enabled !== false;
      const p1 = document.getElementById('desProp1');
      if (p1) p1.value = d.valueProps.prop1 || '';
      const p2 = document.getElementById('desProp2');
      if (p2) p2.value = d.valueProps.prop2 || '';
      const p3 = document.getElementById('desProp3');
      if (p3) p3.value = d.valueProps.prop3 || '';
    }

    // 5. Headings
    if (d.collectionSection) {
      const cSub = document.getElementById('desCollectionSubtitle');
      if (cSub) cSub.value = d.collectionSection.subtitle || '';
      const cTitle = document.getElementById('desCollectionTitle');
      if (cTitle) cTitle.value = d.collectionSection.title || '';
    }
    if (d.communitySection) {
      const commTitle = document.getElementById('desCommunityTitle');
      if (commTitle) commTitle.value = d.communitySection.title || '';
      const commSub = document.getElementById('desCommunitySubtitle');
      if (commSub) commSub.value = d.communitySection.subtitle || '';
      const commDesc = document.getElementById('desCommunityDesc');
      if (commDesc) commDesc.value = d.communitySection.desc || '';
    }

    // 6. About
    if (d.aboutSection) {
      const abEnabled = document.getElementById('desAboutEnabled');
      if (abEnabled) abEnabled.checked = d.aboutSection.enabled !== false;
      const abSub = document.getElementById('desAboutSub');
      if (abSub) abSub.value = d.aboutSection.sub || '';
      const abTitle = document.getElementById('desAboutTitle');
      if (abTitle) abTitle.value = d.aboutSection.title || '';
      const abP1 = document.getElementById('desAboutP1');
      if (abP1) abP1.value = d.aboutSection.p1 || '';
      const f1T = document.getElementById('desAboutF1Title');
      if (f1T) f1T.value = d.aboutSection.feature1Title || '';
      const f1D = document.getElementById('desAboutF1Desc');
      if (f1D) f1D.value = d.aboutSection.feature1Desc || '';
      const f2T = document.getElementById('desAboutF2Title');
      if (f2T) f2T.value = d.aboutSection.feature2Title || '';
      const f2D = document.getElementById('desAboutF2Desc');
      if (f2D) f2D.value = d.aboutSection.feature2Desc || '';
      const f3T = document.getElementById('desAboutF3Title');
      if (f3T) f3T.value = d.aboutSection.feature3Title || '';
      const f3D = document.getElementById('desAboutF3Desc');
      if (f3D) f3D.value = d.aboutSection.feature3Desc || '';
      const abImg = document.getElementById('desAboutImage');
      if (abImg) abImg.value = d.aboutSection.image || '';
      const abQuote = document.getElementById('desAboutQuote');
      if (abQuote) abQuote.value = d.aboutSection.quote || '';
    }

    // 7. Theme & Colors
    if (d.theme) {
      const accent = d.theme.accentColor || '#e5b95f';
      const bg = d.theme.bgColor || '#000000';
      const text = d.theme.primaryColor || '#ffffff';
      const sale = d.theme.saleBadgeText || 'SALE';

      const accentPicker = document.getElementById('desAccentColorPicker');
      const accentHex = document.getElementById('desAccentColorHex');
      if (accentPicker) accentPicker.value = accent;
      if (accentHex) accentHex.value = accent;

      const bgPicker = document.getElementById('desBgColorPicker');
      const bgHex = document.getElementById('desBgColorHex');
      if (bgPicker) bgPicker.value = bg;
      if (bgHex) bgHex.value = bg;

      const textPicker = document.getElementById('desTextColorPicker');
      const textHex = document.getElementById('desTextColorHex');
      if (textPicker) textPicker.value = text;
      if (textHex) textHex.value = text;

      const saleInput = document.getElementById('desSaleBadgeText');
      if (saleInput) saleInput.value = sale;
    }
  }

  function updateHeroPreview(url) {
    const img = document.getElementById('heroImagePreviewImg');
    if (img && url) img.src = url;
  }

  function updateLogoPreview(url) {
    const img = document.getElementById('logoPreviewImg');
    if (img && url) img.src = url;
  }

  function setupDesignCustomizer() {
    // 1. Color Pickers Sync
    syncColorInputs('desAccentColorPicker', 'desAccentColorHex');
    syncColorInputs('desBgColorPicker', 'desBgColorHex');
    syncColorInputs('desTextColorPicker', 'desTextColorHex');

    // 2. Setup Image Dropzones with /api/upload
    setupGenericDropzone('heroBgDropzone', 'heroBgFileInput', async (url) => {
      state.uploadedHeroBgUrl = url;
      const input = document.getElementById('desHeroBgImage');
      if (input) input.value = url;
      updateHeroPreview(url);
      // Auto-save hero banner immediately upon upload so it reflects on live store
      await saveDesignCustomizer();
    });

    setupGenericDropzone('logoDropzone', 'logoFileInput', async (url) => {
      state.uploadedLogoUrl = url;
      const input = document.getElementById('desHeaderLogoUrl');
      if (input) input.value = url;
      updateLogoPreview(url);
      await saveDesignCustomizer();
    });

    setupGenericDropzone('aboutDropzone', 'aboutFileInput', async (url) => {
      state.uploadedAboutImageUrl = url;
      const input = document.getElementById('desAboutImage');
      if (input) input.value = url;
      await saveDesignCustomizer();
    });

    // 3. Live URL inputs preview
    document.getElementById('desHeroBgImage')?.addEventListener('input', (e) => {
      updateHeroPreview(e.target.value.trim());
    });
    document.getElementById('desHeaderLogoUrl')?.addEventListener('input', (e) => {
      updateLogoPreview(e.target.value.trim());
    });

    // 4. Form Submit
    const designForm = document.getElementById('designCustomizerForm');
    designForm?.addEventListener('submit', async (e) => {
      e.preventDefault();
      await saveDesignCustomizer();
    });

    document.getElementById('saveDesignTopBtn')?.addEventListener('click', () => {
      designForm?.requestSubmit();
    });

    // 5. Reset to defaults
    document.getElementById('resetDesignDefaultsBtn')?.addEventListener('click', async () => {
      if (!confirm('هل أنت متأكد من استعادة التصميم والهيكلية الافتراضية لمتجر Velen؟')) return;
      state.design = {
        theme: {
          primaryColor: '#ffffff',
          accentColor: '#e5b95f',
          bgColor: '#000000',
          saleBadgeText: 'SALE'
        },
        header: {
          showAnnouncement: true,
          announcementText: 'FREE DELIVERY IN AMMAN • 1 JD ACROSS JORDAN',
          logoUrl: '/assets/velen-logo.jpg',
          brandName: 'Velen Official'
        },
        hero: {
          enabled: true,
          bgImage: '/assets/velen-hero-clean.jpg',
          brandTitle: 'VELEN',
          mainHeading: 'Premium Everyday Essentials. Made in Jordan.',
          subHeading: 'CLEAN FITS. PREMIUM FEEL. BUILT FOR EVERYDAY WEAR.',
          ctaText: 'SHOP THE COLLECTION',
          ctaLink: '#collection'
        },
        valueProps: {
          enabled: true,
          prop1: 'توصيل مجاني في عمّان وبدينار لكافة المحافظات',
          prop2: 'قطن أردني فاخر 260 GSM معالج ومثبت',
          prop3: 'تبديل فوري للمقاس عند باب البيت'
        },
        sectionsOrder: ['hero', 'valueProps', 'collection', 'community', 'about'],
        sectionsVisibility: { hero: true, valueProps: true, collection: true, community: true, about: true },
        collectionSection: {
          subtitle: 'AUTUMN / ESSENTIALS 2026',
          title: 'THE COLLECTION'
        },
        communitySection: {
          title: 'COMMUNITY WEARS VELEN',
          subtitle: 'Real people. Real style.',
          desc: 'شاركنا لوكك اليومي وفيديوهاتك مع قطع Velen، وقيم تجربتك من 5 نجوم لتدخل السحب الأسبوعي على بوكس إسنشيلز كامل!'
        },
        aboutSection: {
          enabled: true,
          sub: 'THE STORY',
          title: 'WHY VELEN?',
          p1: 'انطلقت Velen من عمّان لإعادة تعريف الملابس اليومية في الأردن. نركز على القصّات البوكسي المريحة (Boxy & Cropped Fit) والأقمشة القطنية الثقيلة 100% التي تحافظ على شكلها ونعومتها مع الاستخدام المتكرر.',
          feature1Title: 'قطن محلي نخب أول',
          feature1Desc: 'نسيج قطني محبوك بوزن 260 GSM معالجة ضد الانكماش والوبر.',
          feature2Title: 'قصّة بوكسي معاصرة',
          feature2Desc: 'تصميم أكتاف منسدلة وطول متناسق يعطي إطلالة ستريت وير نظيفة وفخمة.',
          feature3Title: 'فخر الصناعة الأردنية',
          feature3Desc: 'مُصمم ومُنتج بأيادٍ أردنية مبدعة لدعم الإنتاج المحلي بأعلى معايير العالمية.',
          image: '/assets/velen-logo.jpg',
          quote: 'Clean fits. Premium feel. Built for everyday wear.'
        }
      };
      populateDesignCustomizer();
      await saveDesignCustomizer();
    });
  }

  function syncColorInputs(pickerId, hexId) {
    const picker = document.getElementById(pickerId);
    const hex = document.getElementById(hexId);
    if (!picker || !hex) return;

    picker.addEventListener('input', () => {
      hex.value = picker.value.toUpperCase();
    });

    hex.addEventListener('input', () => {
      let val = hex.value.trim();
      if (!val.startsWith('#')) val = '#' + val;
      if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
        picker.value = val;
      }
    });
  }

  function setupGenericDropzone(dropzoneId, fileInputId, onUploadSuccess) {
    const dropzone = document.getElementById(dropzoneId);
    const fileInput = document.getElementById(fileInputId);
    if (!dropzone || !fileInput) return;

    dropzone.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('media', file);

      const originalHtml = dropzone.innerHTML;
      dropzone.innerHTML = `<i class="fa-solid fa-spinner fa-spin upload-icon"></i><p>جاري رفع الصورة...</p>`;

      try {
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        const data = await res.json();
        if (data.success) {
          dropzone.innerHTML = originalHtml;
          onUploadSuccess(data.url);
          showAdminToast('تم رفع الصورة بنجاح وتحديث المعاينة!', 'success');
        } else {
          dropzone.innerHTML = `<p style="color:#ff4757;">فشل الرفع: ${data.error || 'خطأ غير معروف'}</p>`;
        }
      } catch (err) {
        dropzone.innerHTML = `<p style="color:#ff4757;">فشل الرفع، يرجى المحاولة ثانية</p>`;
      }
    });
  }

  async function saveDesignCustomizer() {
    const heroBgInput = document.getElementById('desHeroBgImage')?.value.trim();
    const logoUrlInput = document.getElementById('desHeaderLogoUrl')?.value.trim();
    const aboutImgInput = document.getElementById('desAboutImage')?.value.trim();

    const currentHero = state.design?.hero || {};
    const finalHeroBg = heroBgInput || state.uploadedHeroBgUrl || currentHero.bgImage || '/assets/velen-hero-clean.jpg';

    const updatedDesign = {
      ...(state.design || {}),
      comingSoon: {
        ...(state.design?.comingSoon || {}),
        enabled: Boolean(document.getElementById('desComingSoonEnabled')?.checked),
        launchDate: document.getElementById('desCsLaunchDate')?.value ? new Date(document.getElementById('desCsLaunchDate').value).toISOString() : (state.design?.comingSoon?.launchDate || '2026-12-01T00:00:00.000Z'),
        title: document.getElementById('desCsTitle')?.value.trim() || 'THE NEW STANDARD IS COMING',
        subtitle: document.getElementById('desCsSub')?.value.trim() || 'استعد لتجربة ملابس يومية بأعلى معايير الفخامة والقصّات المعاصرة. مصنوعة في عمّان.',
        discountOffer: document.getElementById('desCsOffer')?.value.trim() || 'سجل للحصول على إشعار مسبق وخصم 15% على طلبك الأول'
      },
      theme: {
        ...(state.design?.theme || {}),
        primaryColor: document.getElementById('desTextColorHex')?.value.trim() || '#ffffff',
        accentColor: document.getElementById('desAccentColorHex')?.value.trim() || '#e5b95f',
        bgColor: document.getElementById('desBgColorHex')?.value.trim() || '#000000',
        saleBadgeText: document.getElementById('desSaleBadgeText')?.value.trim() || 'SALE'
      },
      header: {
        ...(state.design?.header || {}),
        showAnnouncement: Boolean(document.getElementById('desHeaderShowAnnouncement')?.checked),
        announcementText: document.getElementById('desHeaderAnnouncementText')?.value.trim() || '',
        logoUrl: logoUrlInput || state.uploadedLogoUrl || state.design?.header?.logoUrl || '/assets/velen-logo.jpg',
        brandName: document.getElementById('desHeaderBrandName')?.value.trim() || 'Velen Official'
      },
      hero: {
        ...(state.design?.hero || {}),
        enabled: Boolean(document.getElementById('desHeroEnabled')?.checked),
        bgImage: finalHeroBg,
        brandTitle: document.getElementById('desHeroBrandTitle')?.value.trim() || 'VELEN',
        mainHeading: document.getElementById('desHeroMainHeading')?.value.trim() || '',
        subHeading: document.getElementById('desHeroSubHeading')?.value.trim() || '',
        ctaText: document.getElementById('desHeroCtaText')?.value.trim() || 'SHOP THE COLLECTION',
        ctaLink: '#collection'
      },
      valueProps: {
        ...(state.design?.valueProps || {}),
        enabled: Boolean(document.getElementById('desValuePropsEnabled')?.checked),
        prop1: document.getElementById('desProp1')?.value.trim() || '',
        prop2: document.getElementById('desProp2')?.value.trim() || '',
        prop3: document.getElementById('desProp3')?.value.trim() || ''
      },
      sectionsOrder: state.design?.sectionsOrder || ['hero', 'valueProps', 'collection', 'community', 'about'],
      sectionsVisibility: state.design?.sectionsVisibility || { hero: true, valueProps: true, collection: true, community: true, about: true },
      collectionSection: {
        ...(state.design?.collectionSection || {}),
        subtitle: document.getElementById('desCollectionSubtitle')?.value.trim() || 'AUTUMN / ESSENTIALS 2026',
        title: document.getElementById('desCollectionTitle')?.value.trim() || 'THE COLLECTION'
      },
      communitySection: {
        ...(state.design?.communitySection || {}),
        title: document.getElementById('desCommunityTitle')?.value.trim() || 'COMMUNITY WEARS VELEN',
        subtitle: document.getElementById('desCommunitySubtitle')?.value.trim() || 'Real people. Real style.',
        desc: document.getElementById('desCommunityDesc')?.value.trim() || ''
      },
      aboutSection: {
        ...(state.design?.aboutSection || {}),
        enabled: Boolean(document.getElementById('desAboutEnabled')?.checked),
        sub: document.getElementById('desAboutSub')?.value.trim() || 'THE STORY',
        title: document.getElementById('desAboutTitle')?.value.trim() || 'WHY VELEN?',
        p1: document.getElementById('desAboutP1')?.value.trim() || '',
        feature1Title: document.getElementById('desAboutF1Title')?.value.trim() || '',
        feature1Desc: document.getElementById('desAboutF1Desc')?.value.trim() || '',
        feature2Title: document.getElementById('desAboutF2Title')?.value.trim() || '',
        feature2Desc: document.getElementById('desAboutF2Desc')?.value.trim() || '',
        feature3Title: document.getElementById('desAboutF3Title')?.value.trim() || '',
        feature3Desc: document.getElementById('desAboutF3Desc')?.value.trim() || '',
        image: aboutImgInput || state.uploadedAboutImageUrl || state.design?.aboutSection?.image || '/assets/velen-logo.jpg',
        quote: document.getElementById('desAboutQuote')?.value.trim() || ''
      }
    };

    try {
      const res = await fetch('/api/design', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedDesign)
      });
      const data = await res.json();
      if (data.success) {
        state.design = data.design;
        populateDesignCustomizer();
        showAdminToast('✨ تم حفظ وتطبيق جميع تعديلات التصميم والتركيبة فوراً بالبث المباشر!', 'success');
      } else {
        showAdminToast('فشل حفظ التصميم', 'error');
      }
    } catch (err) {
      console.error(err);
      showAdminToast('حدث خطأ في الاتصال بالخادم', 'error');
    }
  }

  // Global methods for window
  window.velenAdmin = {
    switchTab,
    moveSection: (fromIdx, direction) => {
      if (!state.design || !Array.isArray(state.design.sectionsOrder)) return;
      const order = [...state.design.sectionsOrder];
      const toIdx = fromIdx + direction;
      if (toIdx < 0 || toIdx >= order.length) return;
      const [item] = order.splice(fromIdx, 1);
      order.splice(toIdx, 0, item);
      state.design.sectionsOrder = order;
      renderSectionsOrderList();
      showAdminToast(`تم تغيير ترتيب قسم (${SECTION_METADATA[item]?.title || item})، اضغط "حفظ ونشر التعديلات" للتطبيق المباشر`, 'info');
    },
    toggleSectionVisibility: (key, isVisible) => {
      if (!state.design) return;
      if (!state.design.sectionsVisibility) state.design.sectionsVisibility = {};
      state.design.sectionsVisibility[key] = Boolean(isVisible);
      renderSectionsOrderList();
      showAdminToast(`${isVisible ? 'تم تفعيل' : 'تم إخفاء'} قسم (${SECTION_METADATA[key]?.title || key})`, 'info');
    },
    saveDesign: saveDesignCustomizer,
    editProduct: (id) => {
      const p = state.products.find(x => x.id === id);
      if (!p) return;

      document.getElementById('editProductId').value = p.id;
      document.getElementById('prodName').value = p.name;
      document.getElementById('prodPrice').value = p.price;
      document.getElementById('prodComparePrice').value = p.comparePrice || '';
      if (document.getElementById('prodCostPrice')) {
        document.getElementById('prodCostPrice').value = p.costPrice !== undefined ? p.costPrice : 5.000;
      }
      const catSelect = document.getElementById('prodCategory');
      if (catSelect) {
        catSelect.value = p.category;
        if (!catSelect.value && p.category) {
          const matchOpt = Array.from(catSelect.options).find(o => 
            o.value.toLowerCase() === p.category.toLowerCase() ||
            o.text.toLowerCase().includes(p.category.toLowerCase())
          );
          if (matchOpt) catSelect.value = matchOpt.value;
        }
      }

      document.getElementById('prodStock').value = p.stock || 20;
      document.getElementById('prodOnSale').checked = Boolean(p.onSale);
      document.getElementById('prodFeatured').checked = Boolean(p.featured);
      document.getElementById('prodFabric').value = p.fabric || '';
      document.getElementById('prodDescription').value = p.description || '';
      
      const prodImgInput = document.getElementById('prodImageUrl');
      if (prodImgInput) prodImgInput.value = p.image || '';

      state.productImages = Array.isArray(p.images) && p.images.length > 0 ? [...p.images] : (p.image ? [p.image] : []);
      if (window._renderProductGalleryManager) window._renderProductGalleryManager();

      state.productColors = Array.isArray(p.colors) ? JSON.parse(JSON.stringify(p.colors)) : [];
      if (window._renderProductColorsManager) window._renderProductColorsManager();

      // Set size breakdown
      const cards = document.querySelectorAll('#sizeInventoryGrid .size-stock-card');
      cards.forEach(card => {
        const size = card.getAttribute('data-size');
        const check = card.querySelector('.size-enable-check');
        const input = card.querySelector('.size-qty-input');
        
        if (p.sizeInventory && typeof p.sizeInventory[size] !== 'undefined') {
          const qty = parseInt(p.sizeInventory[size], 10) || 0;
          check.checked = true;
          card.classList.add('active');
          input.value = qty;
        } else if (Array.isArray(p.sizes) && p.sizes.includes(size)) {
          const approxQty = Math.max(1, Math.floor((p.stock || 20) / p.sizes.length));
          check.checked = true;
          card.classList.add('active');
          input.value = approxQty;
        } else {
          check.checked = false;
          card.classList.remove('active');
          input.value = 0;
        }
      });
      if (window._recalculateTotalStock) window._recalculateTotalStock();

      document.getElementById('productModalTitle').textContent = `تعديل قطعة: ${p.name}`;
      productEditModal.classList.add('active');
    },
    deleteProduct: async (id) => {
      if (!confirm('هل أنت متأكد من حذف هذه القطعة من المتجر؟ سيتم إزالتها فوراً عند الزبائن.')) return;
      try {
        const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
          state.products = state.products.filter(p => p.id !== id);
          renderProducts();
          renderDashboard();
          showAdminToast('تم حذف القطعة بنجاح', 'success');
        }
      } catch (e) {
        showAdminToast('فشل حذف القطعة', 'error');
      }
    },
    changeOrderStatus: async (orderId, newStatus) => {
      try {
        const res = await fetch(`/api/orders/${orderId}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus })
        });
        const data = await res.json();
        if (data.success) {
          const ord = state.orders.find(o => o.id === orderId);
          if (ord) ord.status = newStatus;
          renderOrders();
          renderDashboard();
          showAdminToast(`تم تحديث حالة الطلب ${orderId} إلى: ${getStatusLabel(newStatus)}`, 'success');
        }
      } catch (e) {
        showAdminToast('فشل تحديث حالة الطلب', 'error');
      }
    },
    deleteCommunityPost: async (id) => {
      if (!confirm('هل أنت متأكد من إزالة هذا المنشور والريفيو من المجتمع؟')) return;
      try {
        const res = await fetch(`/api/community/${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
          state.community = state.community.filter(c => c.id !== id);
          renderCommunity();
          renderDashboard();
          showAdminToast('تم حذف المنشور من المجتمع', 'success');
        }
      } catch (e) {
        showAdminToast('فشل حذف المنشور', 'error');
      }
    },
    openWhatsApp: (phone, orderId, name) => {
      let cleanPhone = phone.replace(/[^0-9]/g, '');
      if (cleanPhone.startsWith('07')) {
        cleanPhone = '962' + cleanPhone.substring(1);
      }
      const msg = encodeURIComponent(`مرحباً أستاذ ${name}، نتواصل معك من Velen Official بخصوص طلبك رقم ${orderId}. هل ترغب بتأكيد عنوان التوصيل؟`);
      window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank');
    },
    openWaybill: (orderId) => {
      const o = state.orders.find(ord => ord.id === orderId);
      if (!o) return;
      const area = document.getElementById('waybillPrintArea');
      if (!area) return;

      const itemsHtml = (o.items || []).map((item, idx) => `
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 8px 6px; font-weight: 700; width: 22px;">${idx + 1}</td>
          <td style="padding: 8px 6px;">
            <div style="font-weight: 800; font-size: 13px; color: #000;">${item.name}</div>
            <div style="display:inline-flex; gap:4px; margin-top:2px;">
              <span style="padding: 2px 8px; background: #000; color: #fff; border-radius: 3px; font-size: 11px; font-weight: 900;">المقاس: ${item.size || 'M'}</span>
              ${item.color ? `<span style="padding: 2px 8px; background: #f0f0f0; color: #000; border: 1px solid #ccc; border-radius: 3px; font-size: 11px; font-weight: 800;">اللون: ${item.color}</span>` : ''}
            </div>
          </td>
          <td style="padding: 8px 6px; text-align: center; font-weight: 800; font-size: 13px; width: 45px;">×${item.quantity || 1}</td>
          <td style="padding: 8px 6px; text-align: left; font-weight: 900; font-size: 13px; width: 75px; white-space:nowrap;">${(Number(item.price || 0) * (item.quantity || 1)).toFixed(3)} JOD</td>
        </tr>
      `).join('');

      area.innerHTML = `
        <div style="width: 100%; max-width: 460px; margin: 0 auto; box-sizing: border-box; border: 2px solid #000; border-radius: 8px; background: #fff; color: #000; padding: 14px; font-family: 'Tajawal', 'Segoe UI', Tahoma, Arial, sans-serif; direction: rtl;">
          <!-- Top Header -->
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 12px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <img src="/assets/velen-logo.jpg" alt="Velen" style="width: 44px; height: 44px; object-fit: cover; border-radius: 4px; border: 1px solid #000;" onerror="this.src='/assets/velen-logo.jpg'">
              <div>
                <h2 style="margin: 0; font-size: 18px; font-weight: 900; letter-spacing: 1px; color: #000;">VELEN OFFICIAL</h2>
                <p style="margin: 2px 0 0; font-size: 10px; color: #555;">Amman, Jordan • بوليصة توصيل رسمي</p>
              </div>
            </div>
            <div style="text-align: left;">
              <span style="font-size: 15px; font-weight: 900; background: #000; color: #fff; padding: 4px 10px; border-radius: 4px; display: inline-block;">
                ${o.id}
              </span>
              <div style="font-size: 10px; color: #666; margin-top: 3px;">${formatDate(o.createdAt)}</div>
            </div>
          </div>

          <!-- Recipient Box (Responsive Flex) -->
          <div style="background: #f8f8f8; padding: 10px 12px; border-radius: 6px; border: 1px solid #e0e0e0; margin-bottom: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
              <div>
                <span style="font-size: 10px; color: #666; font-weight: 600;">اسم العميل (المستلم):</span>
                <div style="font-size: 15px; font-weight: 900; color: #000;">${o.customerName}</div>
              </div>
              <div style="text-align: left;">
                <span style="font-size: 10px; color: #666; font-weight: 600;">المدينة:</span>
                <div style="font-size: 14px; font-weight: 900; color: #000;">${o.city}</div>
              </div>
            </div>

            <div style="margin-bottom: 6px;">
              <span style="font-size: 10px; color: #666; font-weight: 600;">رقم الهاتف للتوصيل:</span>
              <div style="font-size: 16px; font-weight: 900; color: #000; direction: ltr; text-align: right; display: flex; align-items: center; justify-content: flex-end; gap: 6px;">
                <span>${formatCleanPhone(o.phone)}</span>
                <i class="fa-brands fa-whatsapp" style="color: #25d366; font-size: 18px;"></i>
              </div>
            </div>

            <div style="font-size: 10px; color: #666; font-weight: 600;">العنوان بالتفصيل:</div>
            <div style="font-size: 12px; font-weight: 700; color: #111; line-height: 1.4; margin-top: 2px;">
              ${o.address}
            </div>

            ${o.notes ? `
              <div style="margin-top: 6px; padding: 4px 8px; background: #fff2f2; border-radius: 4px; font-size: 11px; color: #c0392b; font-weight: 700;">
                <i class="fa-solid fa-circle-exclamation"></i> ملاحظة: ${o.notes}
              </div>
            ` : ''}
          </div>

          <!-- Items Table (Guaranteed Mobile Fit) -->
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 12px;">
            <thead>
              <tr style="background: #000; color: #fff; text-align: right;">
                <th style="padding: 6px; width: 22px;">#</th>
                <th style="padding: 6px;">القطعة والمقاس</th>
                <th style="padding: 6px; text-align: center; width: 45px;">الكمية</th>
                <th style="padding: 6px; text-align: left; width: 75px;">المجموع</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <!-- Financial Breakdown -->
          <div style="border-top: 1px solid #ddd; padding-top: 6px; margin-bottom: 10px; font-size: 12px;">
            <div style="display: flex; justify-content: space-between; padding: 2px 0; color: #555;">
              <span>المجموع الفرعي:</span>
              <strong style="color: #000;">${Number(o.subtotal || o.total).toFixed(3)} JOD</strong>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 2px 0; color: #555;">
              <span>أجرة التوصيل:</span>
              <strong style="color: #000;">${Number(o.shipping || 0) === 0 ? 'مجاناً (عمّان)' : Number(o.shipping).toFixed(3) + ' JOD'}</strong>
            </div>
          </div>

          <!-- Total COD Box (Very prominent for the driver) -->
          <div style="border: 2px solid #000; background: #fff8e7; padding: 10px 12px; border-radius: 6px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
            <div style="font-size: 12px; font-weight: 800; color: #000;">
              المبلغ المطلوب تحصيله نقداً:
            </div>
            <div style="font-size: 18px; font-weight: 900; color: #000; letter-spacing: 0.5px;">
              ${Number(o.total).toFixed(3)} JOD
            </div>
          </div>

          <!-- Policy & Return note -->
          <div style="font-size: 9.5px; color: #777; line-height: 1.4; border-top: 1px dashed #ccc; padding-top: 8px; margin-bottom: 8px;">
            • الترجيع متاح فقط في حال وجود خلل مصنعي. التبديل متاح خلال 24 ساعة بنفس الحالة الأصلية.<br>
            • خدمة العملاء والواتساب: <strong>+962 7 7018 8144</strong>
          </div>

          <!-- Signature lines -->
          <div style="display: flex; justify-content: space-between; font-size: 10px; color: #444; border-top: 1px solid #eee; padding-top: 6px;">
            <div>توقيع المستلم: __________</div>
            <div>توقيع المندوب: __________</div>
          </div>
        </div>
      `;

      document.getElementById('waybillModal').classList.add('active');
    },
    printWaybill: () => {
      const area = document.getElementById('waybillPrintArea');
      if (!area || !area.innerHTML.trim()) {
        showAdminToast('يرجى فتح بوليصة طلب أولاً للطباعة', 'error');
        return;
      }
      window.print();
    },
    downloadWaybill: async () => {
      const area = document.getElementById('waybillPrintArea');
      if (!area || !area.innerHTML.trim()) {
        showAdminToast('يرجى فتح بوليصة طلب أولاً', 'error');
        return;
      }
      showAdminToast('جاري تجهيز صورة البوليصة بجودة عالية...', 'info');
      try {
        if (typeof html2canvas === 'function') {
          const canvas = await html2canvas(area, {
            scale: 2,
            backgroundColor: '#ffffff',
            useCORS: true
          });
          const a = document.createElement('a');
          a.download = `Velen-Waybill-${Date.now()}.png`;
          a.href = canvas.toDataURL('image/png');
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          showAdminToast('تم تنزيل البوليصة بنجاح! جاهزة للإرسال على واتساب 📦', 'success');
        } else {
          window.print();
        }
      } catch (e) {
        console.error(e);
        window.print();
      }
    },
    setCoverImage: (idx) => {
      if (state.productImages && state.productImages[idx]) {
        const [img] = state.productImages.splice(idx, 1);
        state.productImages.unshift(img);
        if (window._renderProductGalleryManager) window._renderProductGalleryManager();
        showAdminToast('تم تعيين الصورة كغلاف رئيسي للقطعة', 'info');
      }
    },
    removeProductImage: (idx) => {
      if (state.productImages) {
        state.productImages.splice(idx, 1);
        if (window._renderProductGalleryManager) window._renderProductGalleryManager();
        showAdminToast('تمت إزالة الصورة من المعرض', 'info');
      }
    },
    removeProductColor: (idx) => {
      if (state.productColors) {
        state.productColors.splice(idx, 1);
        if (window._renderProductColorsManager) window._renderProductColorsManager();
        if (typeof recalculateOverallProductStock === 'function') recalculateOverallProductStock();
        showAdminToast('تمت إزالة اللون بنجاح', 'info');
      }
    },
    editColorVariant: (idx) => {
      if (typeof editColorVariant === 'function') editColorVariant(idx);
    },
    removeColorEditingImage: (idx) => {
      if (state.currentColorEditingImages) {
        state.currentColorEditingImages.splice(idx, 1);
        if (typeof renderColorVarImagesGrid === 'function') renderColorVarImagesGrid();
        showAdminToast('تمت إزالة صورة اللون', 'info');
      }
    },
    editPromo: (code) => {
      if (typeof editPromo === 'function') editPromo(code);
    },
    deletePromo: async (code) => {
      if (!confirm(`هل أنت متأكد من حذف كود الخصم (${code})؟`)) return;
      try {
        const res = await fetch(`/api/promo-codes/${encodeURIComponent(code)}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
          state.promos = state.promos.filter(p => p.code !== code);
          renderPromoCodes();
          updateBadgeCounts();
          showAdminToast(`تم حذف كود الخصم (${code}) بنجاح`, 'success');
        } else {
          showAdminToast(data.error || 'فشل حذف كود الخصم', 'error');
        }
      } catch (e) {
        showAdminToast('حدث خطأ في الاتصال بالخادم', 'error');
      }
    },
    editCategory: (id) => {
      const cat = (state.categories || []).find(c => c.id === id);
      if (!cat) return;
      document.getElementById('editCategoryId').value = cat.id;
      document.getElementById('catNameEn').value = cat.nameEn || '';
      document.getElementById('catNameAr').value = cat.nameAr || '';
      document.getElementById('categoryFormTitle').textContent = `تعديل كوليكشن: ${cat.nameEn}`;
    },
    deleteCategory: async (id) => {
      if (!confirm('هل أنت متأكد من حذف هذا الكوليكشن؟')) return;
      try {
        const res = await fetch(`/api/categories/${encodeURIComponent(id)}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
          state.categories = data.categories;
          renderCategoriesTable();
          populateCategoryDropdowns();
          showAdminToast('تم حذف الكوليكشن بنجاح', 'success');
        } else {
          showAdminToast(data.message || 'فشل حذف الكوليكشن', 'error');
        }
      } catch (e) {
        showAdminToast('حدث خطأ أثناء الحذف', 'error');
      }
    },
    deleteExpense: async (id) => {
      if (!confirm('هل أنت متأكد من حذف هذا المصروف / التكلفة؟')) return;
      try {
        const res = await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
          state.expenses = (state.expenses || []).filter(e => e.id !== id);
          renderExpenses();
          renderFinanceStats();
          showAdminToast('تم حذف المصروف بنجاح', 'success');
        } else {
          showAdminToast(data.message || 'فشل حذف المصروف', 'error');
        }
      } catch (e) {
        showAdminToast('حدث خطأ في الاتصال بالخادم', 'error');
      }
    }
  };

  // ================= SETUP MANUAL ORDERS (INSTAGRAM / PHONE) =================
  function setupManualOrders() {
    const modal = document.getElementById('manualOrderModal');
    const openBtn = document.getElementById('btnOpenManualOrderModal');
    const closeBtn = document.getElementById('closeManualOrderModal');
    const cancelBtn = document.getElementById('cancelManualOrderBtn');
    const form = document.getElementById('manualOrderForm');
    const prodSelect = document.getElementById('manProdSelect');
    const sizeSelect = document.getElementById('manSizeSelect');
    const addItemBtn = document.getElementById('btnAddManualItem');
    const citySelect = document.getElementById('manCustCity');
    const shippingInput = document.getElementById('manShipping');
    const discountInput = document.getElementById('manDiscount');

    let currentManualItems = [];

    function updateCityShipping() {
      if (!shippingInput) return;
      if (citySelect.value === 'Amman') {
        shippingInput.value = '0.000';
      } else {
        shippingInput.value = '1.000';
      }
      recalculateManualTotals();
    }

    function recalculateManualTotals() {
      const subtotal = currentManualItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const shipping = parseFloat(shippingInput?.value || 0) || 0;
      const discount = parseFloat(discountInput?.value || 0) || 0;
      const total = Math.max(0, subtotal + shipping - discount);

      if (document.getElementById('manSubtotal')) document.getElementById('manSubtotal').value = subtotal.toFixed(3) + ' JOD';
      if (document.getElementById('manTotal')) document.getElementById('manTotal').value = total.toFixed(3) + ' JOD';
    }

    function populateProductsDropdown() {
      if (!prodSelect) return;
      prodSelect.innerHTML = state.products.map(p => `
        <option value="${p.id}">${p.name} — ${Number(p.price).toFixed(3)} JOD</option>
      `).join('');
      updateSizesDropdown();
    }

    function updateSizesDropdown() {
      if (!prodSelect || !sizeSelect) return;
      const prod = state.products.find(p => p.id === prodSelect.value);
      if (!prod) return;

      const sizes = prod.sizes || ['S', 'M', 'L', 'XL'];
      sizeSelect.innerHTML = sizes.map(s => {
        const stock = (prod.sizeInventory && prod.sizeInventory[s] !== undefined) ? prod.sizeInventory[s] : (prod.stock || 0);
        return `<option value="${s}">${s} (متوفر: ${stock} قطع)</option>`;
      }).join('');
    }

    function renderManualItemsTable() {
      const tbody = document.getElementById('manualItemsTableBody');
      const wrap = document.getElementById('manualItemsListWrap');
      if (!tbody || !wrap) return;

      if (currentManualItems.length === 0) {
        wrap.style.display = 'none';
        tbody.innerHTML = '';
        return;
      }

      wrap.style.display = 'block';
      tbody.innerHTML = currentManualItems.map((item, idx) => `
        <tr style="border-bottom:1px solid #222;">
          <td style="padding:8px 6px;"><strong>${item.name}</strong></td>
          <td style="padding:8px 6px;"><span style="background:#222; color:#fff; padding:2px 8px; border-radius:4px; font-weight:700;">${item.size}</span></td>
          <td style="padding:8px 6px;">${item.quantity}</td>
          <td style="padding:8px 6px;">${(item.price * item.quantity).toFixed(3)} JOD</td>
          <td style="padding:8px 6px; text-align:center;">
            <button type="button" class="del-manual-item" data-idx="${idx}" style="background:transparent; border:none; color:#ff4757; cursor:pointer;" title="حذف">
              <i class="fa-solid fa-trash"></i>
            </button>
          </td>
        </tr>
      `).join('');

      tbody.querySelectorAll('.del-manual-item').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.getAttribute('data-idx'), 10);
          currentManualItems.splice(idx, 1);
          renderManualItemsTable();
          recalculateManualTotals();
        });
      });
    }

    if (openBtn) {
      openBtn.addEventListener('click', () => {
        currentManualItems = [];
        populateProductsDropdown();
        renderManualItemsTable();
        updateCityShipping();
        modal.classList.add('active');
      });
    }

    if (closeBtn) closeBtn.addEventListener('click', () => modal.classList.remove('active'));
    if (cancelBtn) cancelBtn.addEventListener('click', () => modal.classList.remove('active'));

    if (prodSelect) prodSelect.addEventListener('change', updateSizesDropdown);
    if (citySelect) citySelect.addEventListener('change', updateCityShipping);
    if (shippingInput) shippingInput.addEventListener('input', recalculateManualTotals);
    if (discountInput) discountInput.addEventListener('input', recalculateManualTotals);

    if (addItemBtn) {
      addItemBtn.addEventListener('click', () => {
        const prod = state.products.find(p => p.id === prodSelect.value);
        if (!prod) return;
        const size = sizeSelect.value;
        const qty = parseInt(document.getElementById('manQty')?.value || '1', 10) || 1;

        currentManualItems.push({
          id: prod.id,
          name: prod.name,
          size: size,
          price: prod.price,
          quantity: qty,
          image: prod.image
        });

        renderManualItemsTable();
        recalculateManualTotals();
        showAdminToast(`تمت إضافة ${prod.name} (${size}) إلى الطلب`, 'success');
      });
    }

    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (currentManualItems.length === 0) {
          showAdminToast('يرجى إضافة قطعة واحدة على الأقل للطلب قبل الحفظ', 'error');
          return;
        }

        const custName = document.getElementById('manCustName').value.trim();
        const rawPhone = document.getElementById('manCustPhone').value.trim();
        let custPhone = rawPhone.replace(/[\s\-\(\)\+]/g, '');
        if (custPhone.startsWith('00962')) custPhone = custPhone.substring(5);
        if (custPhone.startsWith('962')) custPhone = custPhone.substring(3);
        if (custPhone.startsWith('7') && custPhone.length === 9) custPhone = '0' + custPhone;

        if (!/^07\d{8}$/.test(custPhone)) {
          showAdminToast('يرجى إدخال رقم هاتف يبدأ بـ 07 ويتكون من 10 أرقام (مثال: 0791234567)', 'error');
          document.getElementById('manCustPhone').focus();
          return;
        }

        const city = citySelect.value;
        const address = document.getElementById('manCustAddress').value.trim();
        const notes = document.getElementById('manCustNotes').value.trim();
        const source = document.getElementById('manCustSource').value;
        const subtotal = currentManualItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shipping = parseFloat(shippingInput?.value || 0) || 0;
        const discount = parseFloat(discountInput?.value || 0) || 0;
        const total = Math.max(0, subtotal + shipping - discount);

        const payload = {
          customerName: custName,
          phone: custPhone,
          city: city,
          address: address,
          notes: notes ? `${notes} • [${source}]` : `[${source}]`,
          source: source,
          items: currentManualItems,
          subtotal: subtotal,
          shipping: shipping,
          total: total,
          paymentMethod: 'Cash on Delivery (دفع عند الاستلام)'
        };

        try {
          const res = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          const data = await res.json();
          if (data.success) {
            modal.classList.remove('active');
            form.reset();
            currentManualItems = [];
            showAdminToast(`تم حفظ طلب انستغرام رقم ${data.order.id} بنجاح!`, 'success');
            await fetchAllData();
            window.velenAdmin.openWaybill(data.order.id);
          } else {
            showAdminToast('فشل حفظ الطلب، يرجى التحقق من المدخلات', 'error');
          }
        } catch (err) {
          showAdminToast('حدث خطأ في الاتصال بالسيرفر', 'error');
        }
      });
    }
  }

  // ================= SETUP LIVE VIEW (5-MINUTE VISITOR TRACKING) =================
  function setupLiveView() {
    const container = document.getElementById('liveVisitorsContainer');
    const refreshBtn = document.getElementById('btnRefreshLiveView');

    if (refreshBtn) refreshBtn.addEventListener('click', fetchLiveVisitors);

    async function fetchLiveVisitors() {
      try {
        const res = await fetch('/api/admin/live-visitors');
        const data = await res.json();
        if (!data.success) return;

        const activeCount = data.activeCount || 0;
        const activeEl = document.getElementById('liveActiveVisitorsCount');
        if (activeEl) activeEl.textContent = activeCount;

        const navLiveCount = document.getElementById('navLiveCount');
        if (navLiveCount) navLiveCount.textContent = activeCount;

        const funnel = data.funnel || {};
        if (document.getElementById('funnelHomeCount')) document.getElementById('funnelHomeCount').textContent = funnel.home || 0;
        if (document.getElementById('funnelProductCount')) document.getElementById('funnelProductCount').textContent = funnel.product || 0;
        if (document.getElementById('funnelCartCount')) document.getElementById('funnelCartCount').textContent = funnel.cart || 0;
        if (document.getElementById('funnelCheckoutCount')) document.getElementById('funnelCheckoutCount').textContent = funnel.checkout || 0;

        if (!container) return;

        if (!data.visitors || data.visitors.length === 0) {
          container.innerHTML = `
            <div style="text-align:center; padding:35px 20px; color:#666;">
              <i class="fa-solid fa-radar" style="font-size:24px; color:var(--admin-border); margin-bottom:10px;"></i>
              <p>لا يوجد زوار نشطين في آخر 5 دقائق. الزوار الجدد سيظهرون هنا لحظياً بمجرد فتح المتجر.</p>
            </div>
          `;
          return;
        }

        container.innerHTML = data.visitors.map(v => {
          const elapsedSec = Math.round((Date.now() - v.lastSeen) / 1000);
          let timeStr = elapsedSec < 15 ? 'نشط الآن 🟢' : (elapsedSec < 60 ? `منذ ${elapsedSec} ثانية` : `منذ ${Math.round(elapsedSec / 60)} دقيقة`);

          const isMobi = v.device?.includes('Mobile') || v.device?.includes('📱');
          const devIcon = isMobi ? 'fa-mobile-screen-button' : 'fa-laptop';

          let stageClass = 'stage-home';
          let stageIcon = 'fa-house';
          if (v.stage === 'product') { stageClass = 'stage-product'; stageIcon = 'fa-shirt'; }
          else if (v.stage === 'cart') { stageClass = 'stage-cart'; stageIcon = 'fa-cart-shopping'; }
          else if (v.stage === 'checkout') { stageClass = 'stage-checkout'; stageIcon = 'fa-cash-register'; }
          else if (v.stage === 'ordered') { stageClass = 'stage-ordered'; stageIcon = 'fa-circle-check'; }

          return `
            <div class="visitor-item-card">
              <div class="visitor-left-info">
                <div class="visitor-device-badge">
                  <i class="fa-solid ${devIcon}"></i>
                </div>
                <div class="visitor-meta">
                  <h4>
                    <span>${v.visitorId}</span>
                    <small style="color:#777; font-weight:normal;">• ${v.device || 'Mobile'}</small>
                    <small style="color:#888; font-weight:normal;">• ${v.city || 'Jordan'}</small>
                  </h4>
                  <p>
                    <strong>${v.stageLabel || 'يتصفح المتجر'}</strong>
                    ${v.detail ? ` <span style="color:var(--gold-accent);">(${v.detail})</span>` : ''}
                    ${v.itemsCount ? ` • سلة: ${v.itemsCount} قطع [${Number(v.cartTotal || 0).toFixed(3)} JOD]` : ''}
                  </p>
                </div>
              </div>

              <div style="display:flex; align-items:center; gap:12px;">
                <span class="visitor-stage-badge ${stageClass}">
                  <i class="fa-solid ${stageIcon}"></i> ${v.stage}
                </span>
                <span style="font-size:12px; color:#aaa; min-width:85px; text-align:left;">${timeStr}</span>
              </div>
            </div>
          `;
        }).join('');

      } catch (err) {
        console.error('Error fetching live visitors:', err);
      }
    }

    window.fetchLiveVisitors = fetchLiveVisitors;
  }

  // ================= SETUP WAYBILL MODAL =================
  function setupWaybillModal() {
    const modal = document.getElementById('waybillModal');
    const closeBtn = document.getElementById('closeWaybillModal');
    if (closeBtn) closeBtn.addEventListener('click', () => modal.classList.remove('active'));
  }

  function formatCleanPhone(phone) {
    let cleaned = (phone || '').replace(/[\s\-\(\)\+]/g, '');
    if (cleaned.startsWith('00962')) cleaned = cleaned.substring(5);
    if (cleaned.startsWith('962')) cleaned = cleaned.substring(3);
    if (cleaned.startsWith('7') && cleaned.length === 9) cleaned = '0' + cleaned;
    return cleaned;
  }

  // ================= SETUP ADMIN OFFICIAL COMMUNITY POST =================
  function setupAdminCommunityPost() {
    const openBtn = document.getElementById('adminAddCommunityLookBtn');
    const modal = document.getElementById('adminCommunityPostModal');
    const closeBtn = document.getElementById('closeAdminCommModal');
    const cancelBtn = document.getElementById('cancelAdminCommModal');
    const form = document.getElementById('adminCommPostForm');
    const dropzone = document.getElementById('adminCommDropzone');
    const fileInput = document.getElementById('adminCommFileInput');
    const preview = document.getElementById('adminCommFilePreview');
    const itemSelect = document.getElementById('adminCommItemWorn');
    const urlInput = document.getElementById('adminCommUrlInput');

    let uploadedMediaUrl = null;
    let uploadedMediaType = 'photo';

    if (!openBtn || !modal) return;

    function populateItemWornDropdown() {
      if (!itemSelect) return;
      itemSelect.innerHTML = (state.products || []).map(p => `
        <option value="${p.name}">${p.name} (${p.category})</option>
      `).join('');
    }

    openBtn.addEventListener('click', () => {
      populateItemWornDropdown();
      modal.classList.add('active');
    });

    const closeModal = () => {
      modal.classList.remove('active');
      form.reset();
      uploadedMediaUrl = null;
      if (preview) {
        preview.style.display = 'none';
        preview.innerHTML = '';
      }
      if (dropzone) {
        dropzone.style.display = 'block';
        dropzone.innerHTML = `
          <i class="fa-solid fa-cloud-arrow-up" style="font-size:28px; color:var(--gold-accent); margin-bottom:8px; display:block;"></i>
          <p style="margin:0; font-size:13px; color:#fff;">اسحب وأفلت الفيديو أو الصورة هنا أو اضغط للاختيار</p>
          <span style="font-size:11px; color:#777; display:block; margin-top:4px;">يدعم MP4, MOV, JPG, PNG حتى 50MB</span>
        `;
      }
    };

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

    async function handleAdminUpload(file) {
      if (!file) return;
      const formData = new FormData();
      formData.append('media', file);

      if (dropzone) dropzone.innerHTML = `<i class="fa-solid fa-spinner fa-spin" style="font-size:24px; color:var(--gold-accent);"></i><p style="margin-top:6px; color:#fff;">جاري رفع الملف للسيرفر...</p>`;

      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });
        const data = await res.json();
        if (data.success) {
          uploadedMediaUrl = data.url;
          uploadedMediaType = data.mediaType;

          if (dropzone) dropzone.style.display = 'none';
          if (preview) {
            preview.style.display = 'block';
            if (uploadedMediaType === 'video') {
              preview.innerHTML = `<video src="${uploadedMediaUrl}" controls autoplay muted style="width:100%; height:200px; object-fit:cover;"></video>`;
            } else {
              preview.innerHTML = `<img src="${uploadedMediaUrl}" style="width:100%; height:200px; object-fit:cover;">`;
            }
          }
          showAdminToast('تم رفع ملف الوسائط بنجاح!', 'success');
        } else {
          showAdminToast('فشل رفع الملف', 'error');
          closeModal();
        }
      } catch (err) {
        console.error('Admin comm upload error:', err);
        showAdminToast('خطأ في الاتصال أثناء الرفع', 'error');
      }
    }

    if (dropzone && fileInput) {
      dropzone.addEventListener('click', () => fileInput.click());
      dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.style.borderColor = 'var(--gold-accent)';
      });
      dropzone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropzone.style.borderColor = '#444';
      });
      dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.style.borderColor = '#444';
        const file = e.dataTransfer.files[0];
        if (file) handleAdminUpload(file);
      });
      fileInput.addEventListener('change', () => {
        const file = fileInput.files[0];
        if (file) handleAdminUpload(file);
      });
    }

    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const author = document.getElementById('adminCommAuthor').value.trim();
        const authorTag = document.getElementById('adminCommTag').value.trim();
        const itemWorn = itemSelect ? itemSelect.value : 'VELEN Essential';
        const rating = parseInt(document.getElementById('adminCommRating').value, 10) || 5;
        const comment = document.getElementById('adminCommComment').value.trim();
        const extUrl = urlInput ? urlInput.value.trim() : '';

        const finalMediaUrl = uploadedMediaUrl || (extUrl !== '' ? extUrl : '/assets/velen-boxy-white.jpg');
        const isVideo = finalMediaUrl && (uploadedMediaType === 'video' || finalMediaUrl.endsWith('.mp4') || finalMediaUrl.includes('video'));

        const payload = {
          author,
          authorTag,
          avatar: '/assets/velen-logo.jpg',
          mediaType: isVideo ? 'video' : 'photo',
          mediaUrl: finalMediaUrl,
          videoUrl: isVideo ? finalMediaUrl : null,
          subtitle: `${itemWorn} - VELEN Official`,
          rating,
          comment,
          itemWorn
        };

        try {
          const res = await fetch('/api/community', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          const data = await res.json();
          if (data.success) {
            closeModal();
            showAdminToast('تم نشر البوست الرسمي في مجتمع VELEN بنجاح!', 'success');
            state.community.unshift(data.post);
            renderCommunity();
          } else {
            showAdminToast(data.message || 'فشل نشر البوست', 'error');
          }
        } catch (err) {
          console.error('Post submit error:', err);
          showAdminToast('خطأ في الاتصال بالخادم', 'error');
        }
      });
    }
  }

  // ================= FINANCE & EXPENSES MANAGEMENT =================
  function setupFinanceTracker() {
    const openBtn = document.getElementById('openAddExpenseBtn');
    const modal = document.getElementById('expenseModal');
    const closeBtn = document.getElementById('closeExpenseModal');
    const cancelBtn = document.getElementById('cancelExpenseBtn');
    const form = document.getElementById('expenseForm');
    const dateInput = document.getElementById('expDate');

    if (dateInput && !dateInput.value) {
      dateInput.value = new Date().toISOString().split('T')[0];
    }

    const openModal = () => {
      if (form) form.reset();
      if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
      if (modal) modal.classList.add('active');
    };

    const closeModal = () => {
      if (modal) modal.classList.remove('active');
    };

    if (openBtn) openBtn.addEventListener('click', openModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const category = document.getElementById('expCategory')?.value || 'Manufacturing';
        const title = document.getElementById('expTitle')?.value.trim();
        const amount = parseFloat(document.getElementById('expAmount')?.value || 0);
        const date = document.getElementById('expDate')?.value || new Date().toISOString().split('T')[0];
        const notes = document.getElementById('expNotes')?.value.trim() || '';

        if (!title || !amount || amount <= 0) {
          showAdminToast('يرجى إدخال بند التكلفة والمبلغ بشكل صحيح', 'error');
          return;
        }

        try {
          const res = await fetch('/api/expenses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ category, title, amount, date, notes })
          });
          const data = await res.json();
          if (data.success) {
            closeModal();
            state.expenses = state.expenses || [];
            state.expenses.unshift(data.expense);
            renderExpenses();
            renderFinanceStats();
            showAdminToast(`تم تسجيل التكلفة "${title}" بقيمة ${amount.toFixed(3)} JOD بنجاح!`, 'success');
          } else {
            showAdminToast(data.message || 'فشل حفظ المصروف', 'error');
          }
        } catch (err) {
          console.error(err);
          showAdminToast('حدث خطأ في الاتصال بالخادم', 'error');
        }
      });
    }
  }

  function renderFinanceStats() {
    const validOrders = (state.orders || []).filter(o => o.status !== 'Cancelled');
    const totalRevenue = validOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);

    // Calculate COGS based on each item's costPrice in valid orders
    let totalCOGS = 0;
    validOrders.forEach(o => {
      (o.items || []).forEach(item => {
        const prod = (state.products || []).find(p => p.id === item.id || p.name === item.name);
        const unitCost = prod && prod.costPrice !== undefined ? Number(prod.costPrice) : 5.000;
        const qty = Number(item.quantity) || 1;
        totalCOGS += unitCost * qty;
      });
    });

    const expensesList = state.expenses || [];
    const totalExpenses = expensesList.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

    const grossProfit = totalRevenue - totalCOGS;
    const netProfit = grossProfit - totalExpenses;
    const netMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0.0';

    if (document.getElementById('finTotalRevenue')) document.getElementById('finTotalRevenue').textContent = totalRevenue.toFixed(3) + ' JOD';
    if (document.getElementById('finTotalCOGS')) document.getElementById('finTotalCOGS').textContent = totalCOGS.toFixed(3) + ' JOD';
    if (document.getElementById('finTotalExpenses')) document.getElementById('finTotalExpenses').textContent = totalExpenses.toFixed(3) + ' JOD';
    
    const netEl = document.getElementById('finNetProfit');
    if (netEl) {
      netEl.textContent = (netProfit >= 0 ? '+' : '') + netProfit.toFixed(3) + ' JOD';
      netEl.style.color = netProfit >= 0 ? 'var(--admin-success, #2ed573)' : '#ff4757';
    }

    if (document.getElementById('finNetMargin')) document.getElementById('finNetMargin').textContent = `${netMargin}% هامش الربح الصافي`;
    if (document.getElementById('finGrossProfit')) document.getElementById('finGrossProfit').textContent = grossProfit.toFixed(3) + ' JOD';
  }

  function renderExpenses() {
    const tbody = document.getElementById('expensesTableBody');
    if (!tbody) return;

    const list = state.expenses || [];
    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#777; padding:25px;">لا توجد مصاريف أو تكاليف مسجلة حتى الآن. اضغط على "+ تسجيل تكلفة / مصروف" للإضافة.</td></tr>`;
      return;
    }

    const categoryIcons = {
      Manufacturing: '<span class="status-pill" style="background:rgba(229,185,95,0.15); color:var(--gold-accent);"><i class="fa-solid fa-scissors"></i> تصنيع وقماش</span>',
      Packaging: '<span class="status-pill" style="background:rgba(52,152,219,0.15); color:#3498db;"><i class="fa-solid fa-box-open"></i> تغليف وأكياس</span>',
      Delivery: '<span class="status-pill" style="background:rgba(46,213,115,0.15); color:#2ed573;"><i class="fa-solid fa-truck-fast"></i> شحن وتوصيل</span>',
      Marketing: '<span class="status-pill" style="background:rgba(155,89,182,0.15); color:#9b59b6;"><i class="fa-solid fa-bullhorn"></i> تسويق وإعلانات</span>',
      Operations: '<span class="status-pill" style="background:rgba(230,126,34,0.15); color:#e67e22;"><i class="fa-solid fa-gears"></i> تشغيل وعام</span>'
    };

    tbody.innerHTML = list.map(exp => `
      <tr>
        <td>${categoryIcons[exp.category] || exp.category}</td>
        <td><strong>${exp.title}</strong></td>
        <td><strong style="color:#ff6b6b; font-size:14px;">${Number(exp.amount).toFixed(3)} JOD</strong></td>
        <td>${exp.date || '-'}</td>
        <td style="color:#aaa; font-size:12px;">${exp.notes || '-'}</td>
        <td>
          <button class="link-btn" style="color:#ff4757;" onclick="window.velenAdmin.deleteExpense('${exp.id}')" title="حذف هذا المصروف">
            <i class="fa-solid fa-trash"></i>
          </button>
        </td>
      </tr>
    `).join('');
  }
});
