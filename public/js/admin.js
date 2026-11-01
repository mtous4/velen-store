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
  const adminToastContainer = document.getElementById('adminToastContainer');
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const adminSidebar = document.getElementById('adminSidebar');

  // Init
  initAdmin();

  async function initAdmin() {
    setupEventListeners();
    await fetchAllData();
    initWebSocket();
  }

  // ================= FETCH ALL DATA =================
  async function fetchAllData() {
    try {
      const [pRes, oRes, cRes, sRes, statsRes, dRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/orders'),
        fetch('/api/community'),
        fetch('/api/settings'),
        fetch('/api/stats'),
        fetch('/api/design')
      ]);

      state.products = await pRes.json();
      state.orders = await oRes.json();
      state.community = await cRes.json();
      state.settings = await sRes.json();
      state.stats = await statsRes.json();
      state.design = await dRes.json();

      renderDashboard();
      renderProducts();
      renderOrders();
      renderCommunity();
      populateSettings();
      populateDesignCustomizer();
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

    const pendingOrders = state.orders.filter(o => o.status === 'Pending').length;
    document.getElementById('navOrdersCount').textContent = pendingOrders;

    const totalRevenue = state.orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
    const revStr = totalRevenue.toFixed(3) + ' JOD';
    document.getElementById('topbarRevenue').textContent = revStr;
    document.getElementById('kpiRevenue').textContent = revStr;
    document.getElementById('kpiOrders').textContent = state.orders.length;
    document.getElementById('kpiPendingOrders').textContent = `${pendingOrders} قيد الانتظار`;
    document.getElementById('kpiProducts').textContent = state.products.length;

    const avg = state.community.length > 0 
      ? (state.community.reduce((acc, c) => acc + (Number(c.rating) || 5), 0) / state.community.length).toFixed(1)
      : '5.0';
    document.getElementById('kpiRating').textContent = `${avg} / 5`;
    document.getElementById('kpiCommunityCount').textContent = `${state.community.length} مشاركة وتقييم`;
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
            <td>
              <button class="link-btn" onclick="window.velenAdmin.openWhatsApp('${o.phone}', '${o.id}', '${o.customerName}')" title="مراسلة عبر واتساب">
                <i class="fa-brands fa-whatsapp" style="color:#25d366; font-size:16px;"></i>
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
        <div>• ${item.name} (${item.size}) × ${item.quantity} [${Number(item.price).toFixed(3)} JOD]</div>
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
          </td>
          <td>
            <button class="link-btn" onclick="window.velenAdmin.openWhatsApp('${o.phone}', '${o.id}', '${o.customerName}')" style="background:#25d366; color:#fff; padding:6px 12px; border-radius:4px; font-size:11px; font-weight:700;">
              <i class="fa-brands fa-whatsapp"></i> تواصل
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
            <video src="${c.videoUrl || c.mediaUrl}" poster="${c.mediaUrl}" controls></video>
          ` : `
            <img src="${c.mediaUrl}">
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
    if (state.settings.announcement) {
      document.getElementById('setAnnouncement').value = state.settings.announcement;
    }
    if (state.settings.brandName) {
      document.getElementById('setBrandName').value = state.settings.brandName;
    }
    if (state.settings.currency) {
      document.getElementById('setCurrency').value = state.settings.currency;
    }
    if (state.settings.slogan) {
      document.getElementById('setSlogan').value = state.settings.slogan;
    }
    if (state.settings.subSlogan) {
      document.getElementById('setSubSlogan').value = state.settings.subSlogan;
    }
  }

  // ================= PRODUCT FORM ACTIONS =================
  function setupProductForm() {
    const dropzone = document.getElementById('prodDropzone');
    const fileInput = document.getElementById('prodFileInput');
    const previewArea = document.getElementById('prodPreviewArea');

    if (dropzone && fileInput) {
      dropzone.addEventListener('click', () => fileInput.click());

      fileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('media', file);

        dropzone.innerHTML = `<i class="fa-solid fa-spinner fa-spin upload-icon"></i><p>جاري رفع الصورة...</p>`;

        try {
          const res = await fetch('/api/upload', { method: 'POST', body: formData });
          const data = await res.json();
          if (data.success) {
            state.uploadedProductImageUrl = data.url;
            dropzone.style.display = 'none';
            previewArea.style.display = 'block';
            previewArea.innerHTML = `<img src="${data.url}">`;
            showAdminToast('تم رفع الصورة بنجاح!', 'success');
          }
        } catch (err) {
          dropzone.innerHTML = `<p style="color:#ff4757;">فشل الرفع، يرجى المحاولة ثانية</p>`;
        }
      });
    }

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
      const imageUrlInput = document.getElementById('prodImageUrl').value.trim();

      // Collect sizeInventory and active sizes
      const sizeInventory = {};
      const sizes = [];
      const cards = document.querySelectorAll('#sizeInventoryGrid .size-stock-card');
      cards.forEach(card => {
        const size = card.getAttribute('data-size');
        const check = card.querySelector('.size-enable-check');
        const input = card.querySelector('.size-qty-input');
        if (check && check.checked) {
          const qty = parseInt(input.value, 10) || 0;
          sizeInventory[size] = qty;
          sizes.push(size);
        }
      });

      const totalStock = Object.values(sizeInventory).reduce((acc, q) => acc + q, 0);
      const finalImage = state.uploadedProductImageUrl || imageUrlInput || '/assets/velen-logo.jpg';

      const payload = {
        name,
        price,
        comparePrice,
        category,
        stock: totalStock,
        sizeInventory,
        onSale,
        featured,
        fabric,
        description,
        sizes: sizes.length > 0 ? sizes : ['S', 'M', 'L', 'XL'],
        image: finalImage,
        images: [finalImage]
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
        subSlogan: document.getElementById('setSubSlogan').value.trim()
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
    
    const dropzone = document.getElementById('prodDropzone');
    const preview = document.getElementById('prodPreviewArea');
    if (dropzone) {
      dropzone.style.display = 'block';
      dropzone.innerHTML = `<i class="fa-solid fa-cloud-arrow-up upload-icon"></i><p>اسحب صورة الموديل هنا أو اضغط للاختيار</p><span class="upload-hint">PNG, JPG حتى 20MB</span>`;
    }
    if (preview) preview.style.display = 'none';

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
      design: 'تخصيص التصميم والتركيبة وهيكلية المتجر',
      settings: 'إعدادات متجر Velen'
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
    setupGenericDropzone('heroBgDropzone', 'heroBgFileInput', (url) => {
      state.uploadedHeroBgUrl = url;
      const input = document.getElementById('desHeroBgImage');
      if (input) input.value = url;
      updateHeroPreview(url);
    });

    setupGenericDropzone('logoDropzone', 'logoFileInput', (url) => {
      state.uploadedLogoUrl = url;
      const input = document.getElementById('desHeaderLogoUrl');
      if (input) input.value = url;
      updateLogoPreview(url);
    });

    setupGenericDropzone('aboutDropzone', 'aboutFileInput', (url) => {
      state.uploadedAboutImageUrl = url;
      const input = document.getElementById('desAboutImage');
      if (input) input.value = url;
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

    const updatedDesign = {
      theme: {
        primaryColor: document.getElementById('desTextColorHex')?.value.trim() || '#ffffff',
        accentColor: document.getElementById('desAccentColorHex')?.value.trim() || '#e5b95f',
        bgColor: document.getElementById('desBgColorHex')?.value.trim() || '#000000',
        saleBadgeText: document.getElementById('desSaleBadgeText')?.value.trim() || 'SALE'
      },
      header: {
        showAnnouncement: Boolean(document.getElementById('desHeaderShowAnnouncement')?.checked),
        announcementText: document.getElementById('desHeaderAnnouncementText')?.value.trim() || '',
        logoUrl: state.uploadedLogoUrl || logoUrlInput || '/assets/velen-logo.jpg',
        brandName: document.getElementById('desHeaderBrandName')?.value.trim() || 'Velen Official'
      },
      hero: {
        enabled: Boolean(document.getElementById('desHeroEnabled')?.checked),
        bgImage: state.uploadedHeroBgUrl || heroBgInput || '/assets/velen-hero-clean.jpg',
        brandTitle: document.getElementById('desHeroBrandTitle')?.value.trim() || 'VELEN',
        mainHeading: document.getElementById('desHeroMainHeading')?.value.trim() || '',
        subHeading: document.getElementById('desHeroSubHeading')?.value.trim() || '',
        ctaText: document.getElementById('desHeroCtaText')?.value.trim() || 'SHOP THE COLLECTION',
        ctaLink: '#collection'
      },
      valueProps: {
        enabled: Boolean(document.getElementById('desValuePropsEnabled')?.checked),
        prop1: document.getElementById('desProp1')?.value.trim() || '',
        prop2: document.getElementById('desProp2')?.value.trim() || '',
        prop3: document.getElementById('desProp3')?.value.trim() || ''
      },
      sectionsOrder: state.design?.sectionsOrder || ['hero', 'valueProps', 'collection', 'community', 'about'],
      sectionsVisibility: state.design?.sectionsVisibility || { hero: true, valueProps: true, collection: true, community: true, about: true },
      collectionSection: {
        subtitle: document.getElementById('desCollectionSubtitle')?.value.trim() || 'AUTUMN / ESSENTIALS 2026',
        title: document.getElementById('desCollectionTitle')?.value.trim() || 'THE COLLECTION'
      },
      communitySection: {
        title: document.getElementById('desCommunityTitle')?.value.trim() || 'COMMUNITY WEARS VELEN',
        subtitle: document.getElementById('desCommunitySubtitle')?.value.trim() || 'Real people. Real style.',
        desc: document.getElementById('desCommunityDesc')?.value.trim() || ''
      },
      aboutSection: {
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
        image: state.uploadedAboutImageUrl || aboutImgInput || '/assets/velen-logo.jpg',
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
      document.getElementById('prodCategory').value = p.category;
      document.getElementById('prodStock').value = p.stock || 20;
      document.getElementById('prodOnSale').checked = Boolean(p.onSale);
      document.getElementById('prodFeatured').checked = Boolean(p.featured);
      document.getElementById('prodFabric').value = p.fabric || '';
      document.getElementById('prodDescription').value = p.description || '';
      document.getElementById('prodImageUrl').value = p.image || '';

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
    }
  };
});
