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
    activeTab: 'dashboard',
    uploadedProductImageUrl: null
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
      const [pRes, oRes, cRes, sRes, statsRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/orders'),
        fetch('/api/community'),
        fetch('/api/settings'),
        fetch('/api/stats')
      ]);

      state.products = await pRes.json();
      state.orders = await oRes.json();
      state.community = await cRes.json();
      state.settings = await sRes.json();
      state.stats = await statsRes.json();

      renderDashboard();
      renderProducts();
      renderOrders();
      renderCommunity();
      populateSettings();
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
          <div style="font-size:11px; color:#aaa;">المقاسات: ${(p.sizes || []).join(', ')}</div>
          
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

    productForm?.addEventListener('submit', async (e) => {
      e.preventDefault();

      const editId = document.getElementById('editProductId').value;
      const name = document.getElementById('prodName').value.trim();
      const price = parseFloat(document.getElementById('prodPrice').value);
      const comparePriceVal = document.getElementById('prodComparePrice').value;
      const comparePrice = comparePriceVal ? parseFloat(comparePriceVal) : null;
      const category = document.getElementById('prodCategory').value;
      const stock = parseInt(document.getElementById('prodStock').value, 10);
      const onSale = document.getElementById('prodOnSale').checked;
      const featured = document.getElementById('prodFeatured').checked;
      const fabric = document.getElementById('prodFabric').value.trim();
      const description = document.getElementById('prodDescription').value.trim();
      const imageUrlInput = document.getElementById('prodImageUrl').value.trim();

      const sizeInputs = document.querySelectorAll('input[name="prodSizes"]:checked');
      const sizes = Array.from(sizeInputs).map(cb => cb.value);

      const finalImage = state.uploadedProductImageUrl || imageUrlInput || '/assets/velen-logo.jpg';

      const payload = {
        name,
        price,
        comparePrice,
        category,
        stock,
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

  // Global methods for window
  window.velenAdmin = {
    switchTab,
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

      const checkboxes = document.querySelectorAll('input[name="prodSizes"]');
      checkboxes.forEach(cb => {
        cb.checked = (p.sizes || []).includes(cb.value);
      });

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
