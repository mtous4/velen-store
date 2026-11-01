/**
 * VELEN OFFICIAL STOREFRONT — CLIENT LOGIC & REAL-TIME SYNC
 */

document.addEventListener('DOMContentLoaded', () => {
  // Application State
  const state = {
    products: [],
    community: [],
    design: null,
    cart: JSON.parse(localStorage.getItem('velen_cart') || '[]'),
    activeCategory: 'all',
    activeCommFilter: 'all',
    currentProductForModal: null,
    selectedSize: 'M',
    selectedRating: 5
  };

  // DOM Elements
  const productsGrid = document.getElementById('productsGrid');
  const communityGrid = document.getElementById('communityGrid');
  const cartDrawer = document.getElementById('cartDrawer');
  const cartOverlay = document.getElementById('cartOverlay');
  const cartItemsList = document.getElementById('cartItemsList');
  const cartCountBadge = document.getElementById('cartCountBadge');
  const cartTotalItems = document.getElementById('cartTotalItems');
  const cartSubtotal = document.getElementById('cartSubtotal');
  const cartTotal = document.getElementById('cartTotal');
  const navDrawer = document.getElementById('navDrawer');
  const drawerOverlay = document.getElementById('drawerOverlay');
  const productModal = document.getElementById('productModal');
  const productModalDetails = document.getElementById('productModalDetails');
  const communityModal = document.getElementById('communityModal');
  const checkoutModal = document.getElementById('checkoutModal');
  const successModal = document.getElementById('successModal');
  const searchModal = document.getElementById('searchModal');
  const searchInput = document.getElementById('searchInput');
  const searchResults = document.getElementById('searchResults');
  const toastContainer = document.getElementById('toastContainer');
  const commItemWorn = document.getElementById('commItemWorn');

  // Initialize
  initApp();

  async function initApp() {
    setupEventListeners();
    await fetchDesign();
    await fetchProducts();
    await fetchCommunity();
    updateCartUI();
    initWebSocket();
  }

  // ================= DATA FETCHING =================
  async function fetchDesign() {
    try {
      const res = await fetch('/api/design');
      state.design = await res.json();
      applyDesign(state.design);
    } catch (err) {
      console.error('Error fetching design:', err);
    }
  }

  function applyDesign(design) {
    if (!design) return;
    state.design = design;

    // 1. Theme colors
    if (design.theme) {
      if (design.theme.accentColor) {
        document.documentElement.style.setProperty('--accent-gold', design.theme.accentColor);
      }
      if (design.theme.bgColor) {
        document.documentElement.style.setProperty('--bg-black', design.theme.bgColor);
        document.body.style.backgroundColor = design.theme.bgColor;
      }
    }

    // 2. Header & Announcement
    if (design.header) {
      const annBar = document.getElementById('announcementBar');
      if (annBar) {
        annBar.style.display = design.header.showAnnouncement !== false ? 'flex' : 'none';
      }
      const annText = document.getElementById('announcementText');
      if (annText && design.header.announcementText) {
        annText.textContent = design.header.announcementText;
      }
      const navBrand = document.getElementById('navBrandTitle') || document.querySelector('.brand-title');
      if (navBrand && design.header.brandName) {
        navBrand.textContent = design.header.brandName;
      }
      const logoImgs = document.querySelectorAll('.hero-logo-img, .drawer-logo-img, .modal-logo, .checkout-logo');
      if (design.header.logoUrl) {
        logoImgs.forEach(img => img.src = design.header.logoUrl);
      }
    }

    // 3. Hero Section
    const secHero = document.getElementById('sec-hero');
    if (secHero && design.hero) {
      secHero.style.display = design.hero.enabled !== false ? 'flex' : 'none';
      const heroBg = document.getElementById('heroBannerImg');
      if (heroBg && design.hero.bgImage) heroBg.src = design.hero.bgImage;
      const brandName = document.getElementById('heroBrandName');
      if (brandName && design.hero.brandTitle) brandName.textContent = design.hero.brandTitle;
      const mainH = document.getElementById('heroMainHeading');
      if (mainH && design.hero.mainHeading) mainH.textContent = design.hero.mainHeading;
      const tagline = document.getElementById('heroTagline');
      if (tagline && design.hero.subHeading) tagline.textContent = design.hero.subHeading;
      const ctaBtn = document.getElementById('heroShopBtn');
      if (ctaBtn) {
        if (design.hero.ctaText) ctaBtn.textContent = design.hero.ctaText;
        if (design.hero.ctaLink) ctaBtn.setAttribute('href', design.hero.ctaLink);
      }
    }

    // 4. Value Props
    const secValue = document.getElementById('sec-valueProps');
    if (secValue && design.valueProps) {
      secValue.style.display = design.valueProps.enabled !== false ? 'flex' : 'none';
      const p1 = document.getElementById('propText1');
      if (p1 && design.valueProps.prop1) p1.textContent = design.valueProps.prop1;
      const p2 = document.getElementById('propText2');
      if (p2 && design.valueProps.prop2) p2.textContent = design.valueProps.prop2;
      const p3 = document.getElementById('propText3');
      if (p3 && design.valueProps.prop3) p3.textContent = design.valueProps.prop3;
    }

    // 5. Sections Re-ordering & Visibility
    const container = document.getElementById('mainSectionsContainer');
    if (container && design.sectionsOrder && Array.isArray(design.sectionsOrder)) {
      design.sectionsOrder.forEach(secKey => {
        const secEl = document.getElementById(`sec-${secKey}`);
        if (secEl) {
          container.appendChild(secEl);
          const isVisible = design.sectionsVisibility ? (design.sectionsVisibility[secKey] !== false) : true;
          secEl.style.display = isVisible ? (secKey === 'hero' ? 'flex' : (secKey === 'valueProps' ? 'flex' : 'block')) : 'none';
        }
      });
    }

    // 6. Collection section texts
    if (design.collectionSection) {
      const sub = document.getElementById('collectionSubtitle');
      if (sub && design.collectionSection.subtitle) sub.textContent = design.collectionSection.subtitle;
      const title = document.getElementById('collectionTitle');
      if (title && design.collectionSection.title) title.textContent = design.collectionSection.title;
    }

    // 7. Community section texts
    if (design.communitySection) {
      const commT = document.getElementById('communityTitle');
      if (commT && design.communitySection.title) commT.textContent = design.communitySection.title;
      const commSub = document.getElementById('communitySubtitle');
      if (commSub && design.communitySection.subtitle) commSub.textContent = design.communitySection.subtitle;
      const commD = document.getElementById('communityDesc');
      if (commD && design.communitySection.desc) commD.textContent = design.communitySection.desc;
    }

    // 8. About section
    const secAbout = document.getElementById('sec-about');
    if (secAbout && design.aboutSection) {
      secAbout.style.display = design.aboutSection.enabled !== false ? 'block' : 'none';
      const aSub = document.getElementById('aboutSub');
      if (aSub && design.aboutSection.sub) aSub.textContent = design.aboutSection.sub;
      const aTitle = document.getElementById('aboutTitle');
      if (aTitle && design.aboutSection.title) aTitle.textContent = design.aboutSection.title;
      const aP = document.getElementById('aboutP1');
      if (aP && design.aboutSection.p1) aP.textContent = design.aboutSection.p1;
      const ft1 = document.getElementById('featTitle1');
      if (ft1 && design.aboutSection.feature1Title) ft1.textContent = design.aboutSection.feature1Title;
      const fd1 = document.getElementById('featDesc1');
      if (fd1 && design.aboutSection.feature1Desc) fd1.textContent = design.aboutSection.feature1Desc;
      const ft2 = document.getElementById('featTitle2');
      if (ft2 && design.aboutSection.feature2Title) ft2.textContent = design.aboutSection.feature2Title;
      const fd2 = document.getElementById('featDesc2');
      if (fd2 && design.aboutSection.feature2Desc) fd2.textContent = design.aboutSection.feature2Desc;
      const ft3 = document.getElementById('featTitle3');
      if (ft3 && design.aboutSection.feature3Title) ft3.textContent = design.aboutSection.feature3Title;
      const fd3 = document.getElementById('featDesc3');
      if (fd3 && design.aboutSection.feature3Desc) fd3.textContent = design.aboutSection.feature3Desc;
      const aImg = document.getElementById('aboutImg');
      if (aImg && design.aboutSection.image) aImg.src = design.aboutSection.image;
      const aQ = document.getElementById('aboutQuote');
      if (aQ && design.aboutSection.quote) aQ.textContent = `"${design.aboutSection.quote}"`;
    }
  }

  async function fetchCommunity() {
    try {
      const res = await fetch('/api/community');
      state.community = await res.json();
      renderCommunity();
    } catch (err) {
      console.error('Error fetching community:', err);
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
        console.log('⚡ Connected to Velen Realtime Sync');
        updateSyncBadge(true);
      };

      socket.onmessage = (event) => {
        try {
          const { event: evType, payload } = JSON.parse(event.data);
          handleRealtimeEvent(evType, payload);
        } catch (e) {
          console.error('WS Parse Error:', e);
        }
      };

      socket.onclose = () => {
        console.log('WS closed, retrying in 3s...');
        updateSyncBadge(false);
        setTimeout(initWebSocket, 3000);
      };

      socket.onerror = () => {
        updateSyncBadge(false);
      };
    } catch (e) {
      console.error('WebSocket error:', e);
    }
  }

  function updateSyncBadge(online) {
    const badge = document.getElementById('syncBadge');
    if (!badge) return;
    const dot = badge.querySelector('.pulse-dot');
    const text = badge.querySelector('.sync-text');
    if (online) {
      dot.style.background = '#2ecc71';
      dot.style.boxShadow = '0 0 10px #2ecc71';
      text.textContent = 'متصل مباشر';
    } else {
      dot.style.background = '#e74c3c';
      dot.style.boxShadow = 'none';
      text.textContent = 'إعادة الاتصال...';
    }
  }

  function handleRealtimeEvent(event, payload) {
    if (event === 'PRODUCT_ADDED') {
      // Admin added a new product!
      state.products.unshift(payload);
      renderProducts();
      populateProductSelect();
      showToast(`تمت إضافة منتج جديد: ${payload.name}`, 'info');
      
      const newToast = document.getElementById('newProductToast');
      if (newToast) {
        newToast.style.display = 'block';
        setTimeout(() => newToast.style.display = 'none', 6000);
      }
    } else if (event === 'PRODUCT_UPDATED') {
      const idx = state.products.findIndex(p => p.id === payload.id);
      if (idx !== -1) {
        state.products[idx] = payload;
        renderProducts();
      }
    } else if (event === 'PRODUCT_DELETED') {
      state.products = state.products.filter(p => p.id !== payload.id);
      renderProducts();
      populateProductSelect();
    } else if (event === 'COMMUNITY_NEW_POST') {
      state.community.unshift(payload);
      renderCommunity();
      showToast(`مشاركة جديدة من ${payload.author} في المجتمع!`, 'success');
    } else if (event === 'COMMUNITY_LIKED') {
      const item = state.community.find(c => c.id === payload.id);
      if (item) {
        item.likes = payload.likes;
        const likeCountEl = document.querySelector(`[data-like-id="${payload.id}"] .count`);
        if (likeCountEl) likeCountEl.textContent = payload.likes;
      }
    } else if (event === 'SETTINGS_UPDATED') {
      if (payload.announcement) {
        const annText = document.getElementById('announcementText');
        if (annText) annText.textContent = payload.announcement;
      }
    } else if (event === 'DESIGN_UPDATED') {
      applyDesign(payload);
      showToast('تم تحديث مظهر وترتيب المتجر مباشرة من الأدمن!', 'info');
    }
  }

  // ================= RENDER PRODUCTS (Matching Screenshot 2) =================
  function renderProducts() {
    if (!productsGrid) return;

    let filtered = state.products;
    if (state.activeCategory === 'Tees') {
      filtered = state.products.filter(p => p.category === 'Tees');
    } else if (state.activeCategory === 'Ringer') {
      filtered = state.products.filter(p => p.name.toLowerCase().includes('ringer'));
    } else if (state.activeCategory === 'Boxy') {
      filtered = state.products.filter(p => p.name.toLowerCase().includes('boxy') || p.name.toLowerCase().includes('cropped'));
    }

    if (filtered.length === 0) {
      productsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #666;">
          <p>لا توجد قطع متاحة في هذا التصنيف حالياً.</p>
        </div>
      `;
      return;
    }

    productsGrid.innerHTML = filtered.map(product => {
      const priceFormatted = Number(product.price).toFixed(3) + ' JOD';
      const comparePriceFormatted = product.comparePrice ? Number(product.comparePrice).toFixed(3) + ' JOD' : null;

      return `
        <div class="product-card" data-product-id="${product.id}">
          <div class="product-img-wrapper" onclick="window.velenApp.openProductModal('${product.id}')">
            ${product.onSale ? '<span class="badge-sale">SALE</span>' : ''}
            <img src="${product.image || '/assets/velen-logo.jpg'}" alt="${product.name}" class="product-img" loading="lazy">
            <button class="btn-floating-bag" onclick="event.stopPropagation(); window.velenApp.quickAddToCart('${product.id}')" title="إضافة للحقيبة" aria-label="Add to bag">
              <i class="fa-solid fa-cart-plus"></i>
            </button>
          </div>
          <div class="product-info" onclick="window.velenApp.openProductModal('${product.id}')">
            <h3 class="product-title">${product.name}</h3>
            <div class="price-row">
              <span class="current-price">${priceFormatted}</span>
              ${comparePriceFormatted ? `<span class="strike-price">${comparePriceFormatted}</span>` : ''}
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // Populate Product Selector in Community Modal
  function populateProductSelect() {
    if (!commItemWorn) return;
    commItemWorn.innerHTML = state.products.map(p => `
      <option value="${p.name}">${p.name}</option>
    `).join('') + '<option value="Velen Signature">Velen Signature Drop</option>';
  }

  // ================= RENDER COMMUNITY (Matching Screenshot 3) =================
  function renderCommunity() {
    if (!communityGrid) return;

    let filtered = state.community;
    if (state.activeCommFilter === 'video') {
      filtered = state.community.filter(c => c.mediaType === 'video' || c.videoUrl);
    } else if (state.activeCommFilter === '5star') {
      filtered = state.community.filter(c => Number(c.rating) === 5);
    }

    communityGrid.innerHTML = filtered.map(item => {
      const starsHtml = Array.from({ length: 5 }, (_, i) => 
        `<i class="fa-solid fa-star" style="color: ${i < item.rating ? '#ffca28' : '#333'}"></i>`
      ).join('');

      // Check if item has media (photo or video), or if it is a text-only review
      const hasMedia = Boolean(item.mediaUrl) && item.mediaType !== 'text';
      const isVideo = hasMedia && (item.mediaType === 'video' || item.videoUrl);

      if (!hasMedia) {
        // Luxury minimal text-only review card
        return `
          <div class="comm-card comm-card-text" data-comm-id="${item.id}">
            <div class="comm-text-header">
              <i class="fa-solid fa-quote-right quote-icon"></i>
              <span class="comm-verified-pill"><i class="fa-solid fa-circle-check"></i> تقييم معتمد</span>
            </div>
            <div class="comm-text-body">
              <div class="comm-stars">${starsHtml}</div>
              <p class="comm-text-comment">"${item.comment}"</p>
              <div class="comm-text-brand-watermark">VELEN ESSENTIALS • MADE IN JORDAN</div>
            </div>
            <div class="comm-content" style="padding-top:0;">
              <div class="comm-user-row">
                <div class="comm-author-info">
                  <img src="${item.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}" class="comm-avatar" alt="${item.author}">
                  <div>
                    <span class="comm-author-name">${item.author}</span>
                    <span style="font-size:10px; color:#888; display:block;">${item.authorTag || ''}</span>
                  </div>
                </div>
                <button class="comm-like-btn" data-like-id="${item.id}" onclick="window.velenApp.likeCommunityPost('${item.id}')">
                  <i class="fa-regular fa-heart"></i>
                  <span class="count">${item.likes || 0}</span>
                </button>
              </div>
              <div class="comm-footer">
                <span>يرتدي: <strong>${item.itemWorn || 'Velen Essential'}</strong></span>
                <span><i class="fa-solid fa-location-dot"></i> الأردن</span>
              </div>
            </div>
          </div>
        `;
      }

      return `
        <div class="comm-card" data-comm-id="${item.id}">
          <div class="comm-media-wrap">
            ${isVideo ? `
              <video src="${item.videoUrl || item.mediaUrl}" poster="${item.mediaUrl}" loop muted playsinline autoplay></video>
              <button class="comm-sound-btn" onclick="window.velenApp.toggleVideoSound(this)" title="كتم/تشغيل الصوت">
                <i class="fa-solid fa-volume-xmark"></i>
              </button>
            ` : `
              <img src="${item.mediaUrl}" alt="${item.subtitle || 'Velen Fit'}" loading="lazy">
            `}
            <span class="comm-tag-badge">${item.subtitle || 'ستايل Velen'}</span>
          </div>

          <div class="comm-content">
            <div class="comm-user-row">
              <div class="comm-author-info">
                <img src="${item.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}" class="comm-avatar" alt="${item.author}">
                <div>
                  <span class="comm-author-name">${item.author}</span>
                  <div class="comm-stars">${starsHtml}</div>
                </div>
              </div>
              <button class="comm-like-btn" data-like-id="${item.id}" onclick="window.velenApp.likeCommunityPost('${item.id}')">
                <i class="fa-regular fa-heart"></i>
                <span class="count">${item.likes || 0}</span>
              </button>
            </div>

            <p class="comm-comment">"${item.comment}"</p>

            <div class="comm-footer">
              <span>يرتدي: <strong>${item.itemWorn || 'Velen Essential'}</strong></span>
              <span><i class="fa-solid fa-location-dot"></i> الأردن</span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // ================= CART MANAGEMENT =================
  function addToCart(product, size = 'M', quantity = 1) {
    const existingIndex = state.cart.findIndex(
      item => item.id === product.id && item.size === size
    );

    if (existingIndex > -1) {
      state.cart[existingIndex].quantity += quantity;
    } else {
      state.cart.push({
        id: product.id,
        name: product.name,
        price: Number(product.price),
        image: product.image,
        size: size,
        quantity: quantity
      });
    }

    saveCart();
    updateCartUI();
    openCart();
    showToast(`تمت إضافة "${product.name}" إلى حقيبة التسوق!`, 'success');
  }

  function updateCartQuantity(index, delta) {
    if (!state.cart[index]) return;
    state.cart[index].quantity += delta;
    if (state.cart[index].quantity <= 0) {
      state.cart.splice(index, 1);
    }
    saveCart();
    updateCartUI();
  }

  function saveCart() {
    localStorage.setItem('velen_cart', JSON.stringify(state.cart));
  }

  function updateCartUI() {
    const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    if (cartCountBadge) cartCountBadge.textContent = totalItems;
    if (cartTotalItems) cartTotalItems.textContent = totalItems;
    if (cartSubtotal) cartSubtotal.textContent = subtotal.toFixed(3) + ' JOD';
    if (cartTotal) cartTotal.textContent = subtotal.toFixed(3) + ' JOD';

    if (state.cart.length === 0) {
      cartItemsList.innerHTML = `
        <div class="empty-cart-msg">
          <i class="fa-solid fa-bag-shopping"></i>
          <h4>حقيبة التسوق فارغة</h4>
          <p>تصفح المجموعة واكتشف ملابس Velen اليومية</p>
        </div>
      `;
      return;
    }

    cartItemsList.innerHTML = state.cart.map((item, idx) => `
      <div class="cart-item">
        <img src="${item.image || '/assets/velen-logo.jpg'}" class="cart-item-img" alt="${item.name}">
        <div class="cart-item-details">
          <div>
            <h4 class="cart-item-title">${item.name}</h4>
            <span class="cart-item-meta">المقاس: ${item.size}</span>
          </div>
          <div class="cart-item-bottom">
            <div class="cart-item-qty">
              <button onclick="window.velenApp.updateCartQty(${idx}, -1)">-</button>
              <span>${item.quantity}</span>
              <button onclick="window.velenApp.updateCartQty(${idx}, 1)">+</button>
            </div>
            <span class="cart-item-price">${(item.price * item.quantity).toFixed(3)} JOD</span>
          </div>
        </div>
      </div>
    `).join('');
  }

  function openCart() {
    cartDrawer.classList.add('open');
    cartOverlay.classList.add('active');
  }

  function closeCart() {
    cartDrawer.classList.remove('open');
    cartOverlay.classList.remove('active');
  }

  // ================= MODALS & DRAWERS TOGGLES =================
  function openProductModal(productId) {
    const product = state.products.find(p => p.id === productId);
    if (!product) return;
    state.currentProductForModal = product;
    state.selectedSize = (product.sizes && product.sizes[0]) || 'M';

    const priceFormatted = Number(product.price).toFixed(3) + ' JOD';
    const comparePriceFormatted = product.comparePrice ? Number(product.comparePrice).toFixed(3) + ' JOD' : null;
    const sizes = product.sizes || ['S', 'M', 'L', 'XL'];

    productModalDetails.innerHTML = `
      <div class="product-modal-grid">
        <div class="modal-gallery">
          <img src="${product.image || '/assets/velen-logo.jpg'}" alt="${product.name}" class="modal-gallery-main">
        </div>
        <div class="modal-info">
          <span class="section-sub">${product.category} • MADE IN JORDAN</span>
          <h2 class="modal-product-title">${product.name}</h2>
          <div class="modal-price-row">
            <span class="modal-price-current">${priceFormatted}</span>
            ${comparePriceFormatted ? `<span class="modal-price-strike">${comparePriceFormatted}</span>` : ''}
          </div>

          <div class="size-selector-wrap">
            <div class="size-selector-label">
              <span>اختر المقاس:</span>
              <span style="color:#aaa; font-weight:400;">(Boxy Relaxed Fit)</span>
            </div>
            <div class="size-boxes" id="modalSizeBoxes">
              ${sizes.map(size => `
                <button class="size-box ${size === state.selectedSize ? 'selected' : ''}" onclick="window.velenApp.selectModalSize('${size}')">
                  ${size}
                </button>
              `).join('')}
            </div>
          </div>

          <button class="btn-add-to-bag" onclick="window.velenApp.addCurrentModalToCart()">
            <i class="fa-solid fa-bag-shopping"></i> إضافة إلى الحقيبة (${priceFormatted})
          </button>

          <div class="product-specs">
            <p><strong>تفاصيل القماش:</strong> ${product.fabric || '100% قطن أردني معالج نخب أول (260 GSM)'}</p>
            <p style="margin-top:6px;"><strong>الوصف:</strong> ${product.description || 'تصميم ستريت وير يومي يجمع بين الراحة والأناقة المينيمالية.'}</p>
            <p style="margin-top:6px; color:#4cd137;"><i class="fa-solid fa-truck"></i> توصيل مجاني وسريع داخل عمّان.</p>
          </div>
        </div>
      </div>
    `;

    productModal.classList.add('active');
  }

  function closeProductModal() {
    productModal.classList.remove('active');
  }

  function openCheckout() {
    if (state.cart.length === 0) {
      showToast('حقيبة التسوق فارغة!', 'info');
      return;
    }
    closeCart();
    renderCheckoutSummary();
    checkoutModal.classList.add('active');
  }

  function closeCheckout() {
    checkoutModal.classList.remove('active');
  }

  function renderCheckoutSummary() {
    const checkoutItemsList = document.getElementById('checkoutItemsList');
    const checkoutSubtotal = document.getElementById('checkoutSubtotal');
    const checkoutShipping = document.getElementById('checkoutShipping');
    const checkoutFinalTotal = document.getElementById('checkoutFinalTotal');
    const custCity = document.getElementById('custCity');

    const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = custCity && custCity.value === 'Amman' ? 0.0 : 1.0;
    const finalTotal = subtotal + shipping;

    checkoutItemsList.innerHTML = state.cart.map(item => `
      <div style="display:flex; justify-content:space-between; font-size:12px; color:#bbb;">
        <span>${item.name} (${item.size}) × ${item.quantity}</span>
        <span>${(item.price * item.quantity).toFixed(3)} JOD</span>
      </div>
    `).join('');

    checkoutSubtotal.textContent = subtotal.toFixed(3) + ' JOD';
    checkoutShipping.textContent = shipping === 0 ? 'مجاناً (عمّان)' : '1.000 JOD';
    checkoutFinalTotal.textContent = finalTotal.toFixed(3) + ' JOD';
  }

  // ================= COMMUNITY SUBMISSION =================
  let uploadedMediaUrl = null;
  let uploadedMediaType = 'photo';

  function setupCommunityForm() {
    const dropzone = document.getElementById('commDropzone');
    const fileInput = document.getElementById('commFileInput');
    const preview = document.getElementById('commFilePreview');

    const clearMediaBtn = document.getElementById('clearCommMediaBtn');
    if (clearMediaBtn) {
      clearMediaBtn.addEventListener('click', () => {
        uploadedMediaUrl = null;
        uploadedMediaType = 'photo';
        if (fileInput) fileInput.value = '';
        const urlInput = document.getElementById('commUrlInput');
        if (urlInput) urlInput.value = '';
        if (preview) {
          preview.style.display = 'none';
          preview.innerHTML = '';
        }
        if (dropzone) {
          dropzone.style.display = 'block';
          dropzone.innerHTML = `<i class="fa-solid fa-cloud-arrow-up upload-icon"></i><p>اسحب وأفلت الفيديو أو الصورة هنا أو اضغط للاختيار (اختياري)</p><span class="upload-hint">يدعم MP4, MOV, JPG, PNG حتى 50MB</span>`;
        }
        clearMediaBtn.style.display = 'none';
        showToast('تم إلغاء الميديا، يمكنك إرسال التقييم بالكلام والنجوم فقط', 'info');
      });
    }

    if (dropzone && fileInput) {
      dropzone.addEventListener('click', () => fileInput.click());

      fileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('media', file);

        dropzone.innerHTML = `<i class="fa-solid fa-spinner fa-spin upload-icon"></i><p>جاري رفع الملف إلى السيرفر...</p>`;

        try {
          const res = await fetch('/api/upload', {
            method: 'POST',
            body: formData
          });
          const data = await res.json();
          if (data.success) {
            uploadedMediaUrl = data.url;
            uploadedMediaType = data.mediaType;

            dropzone.style.display = 'none';
            preview.style.display = 'block';
            if (clearMediaBtn) clearMediaBtn.style.display = 'inline-block';

            if (uploadedMediaType === 'video') {
              preview.innerHTML = `<video src="${uploadedMediaUrl}" controls autoplay muted style="width:100%; height:180px; object-fit:cover;"></video>`;
            } else {
              preview.innerHTML = `<img src="${uploadedMediaUrl}" style="width:100%; height:180px; object-fit:cover;">`;
            }
            showToast('تم رفع الميديا بنجاح!', 'success');
          }
        } catch (err) {
          console.error('Upload error:', err);
          dropzone.innerHTML = `<p style="color:#ff4757;">فشل الرفع، يرجى المحاولة ثانية</p>`;
        }
      });
    }

    // Star Rating Click Handlers
    const starPicker = document.getElementById('starRatingPicker');
    const starRatingLabel = document.getElementById('starRatingLabel');
    const ratingInput = document.getElementById('commRatingVal');

    if (starPicker) {
      const stars = starPicker.querySelectorAll('.star-btn');
      stars.forEach(star => {
        star.addEventListener('click', () => {
          const val = parseInt(star.getAttribute('data-value'), 10);
          state.selectedRating = val;
          ratingInput.value = val;

          stars.forEach((s, idx) => {
            if (idx < val) {
              s.classList.add('active');
            } else {
              s.classList.remove('active');
            }
          });

          const labels = {
            1: '1 من 5 (سيء)',
            2: '2 من 5 (مقبول)',
            3: '3 من 5 (جيد)',
            4: '4 من 5 (رائع جداً)',
            5: '5 من 5 (ممتاز وفوق الخيال 🔥)'
          };
          starRatingLabel.textContent = labels[val] || `${val} من 5`;
        });
      });
    }

    // Form Submit
    const commForm = document.getElementById('communityForm');
    if (commForm) {
      commForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const author = document.getElementById('commAuthor').value.trim();
        const itemWorn = document.getElementById('commItemWorn').value;
        const comment = document.getElementById('commComment').value.trim();
        const externalUrl = document.getElementById('commUrlInput').value.trim();
        const rating = parseInt(document.getElementById('commRatingVal').value, 10) || 5;

        // Photos/videos are completely optional!
        const finalMediaUrl = uploadedMediaUrl || (externalUrl !== '' ? externalUrl : null);
        const isVideo = finalMediaUrl && (uploadedMediaType === 'video' || finalMediaUrl.endsWith('.mp4') || finalMediaUrl.includes('video'));

        const payload = {
          author,
          authorTag: '@' + author.toLowerCase().replace(/\s+/g, '_'),
          avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 9000000)}?auto=format&fit=crop&w=150&q=80`,
          mediaType: finalMediaUrl ? (isVideo ? 'video' : 'photo') : 'text',
          mediaUrl: finalMediaUrl,
          videoUrl: isVideo ? finalMediaUrl : null,
          subtitle: `${itemWorn} - الأردن`,
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
          const result = await res.json();
          if (result.success) {
            communityModal.classList.remove('active');
            commForm.reset();
            uploadedMediaUrl = null;
            if (clearMediaBtn) clearMediaBtn.style.display = 'none';
            if (preview) {
              preview.style.display = 'none';
              preview.innerHTML = '';
            }
            if (dropzone) {
              dropzone.style.display = 'block';
              dropzone.innerHTML = `<i class="fa-solid fa-cloud-arrow-up upload-icon"></i><p>اسحب وأفلت الفيديو أو الصورة هنا أو اضغط للاختيار (اختياري)</p><span class="upload-hint">يدعم MP4, MOV, JPG, PNG حتى 50MB</span>`;
            }
            showToast('شكراً لك! تم نشر تقييمك وإطلالتك في مجتمع Velen 🎉', 'success');
          }
        } catch (err) {
          console.error('Community submit error:', err);
        }
      });
    }
  }

  // ================= CHECKOUT ORDER SUBMISSION =================
  function setupCheckoutForm() {
    const custCity = document.getElementById('custCity');
    if (custCity) {
      custCity.addEventListener('change', renderCheckoutSummary);
    }

    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) {
      checkoutForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const customerName = document.getElementById('custName').value.trim();
        const phone = document.getElementById('custPhone').value.trim();
        const city = document.getElementById('custCity').value;
        const paymentMethod = document.getElementById('custPayment').value;
        const address = document.getElementById('custAddress').value.trim();
        const notes = document.getElementById('custNotes').value.trim();

        const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shipping = city === 'Amman' ? 0.0 : 1.0;
        const total = subtotal + shipping;

        const orderData = {
          customerName,
          phone,
          city: `${city} (الأردن)`,
          address,
          notes,
          paymentMethod,
          subtotal,
          shipping,
          total,
          items: state.cart
        };

        try {
          const res = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
          });
          const result = await res.json();

          if (result.success) {
            // Clear cart
            state.cart = [];
            saveCart();
            updateCartUI();

            closeCheckout();

            // Show success modal
            const successOrderId = document.getElementById('successOrderId');
            if (successOrderId) successOrderId.textContent = result.order.id;

            const whatsappBtn = document.getElementById('whatsappTrackBtn');
            if (whatsappBtn) {
              const msg = encodeURIComponent(`مرحباً Velen Official، قمت بالطلب رقم ${result.order.id} باسم ${customerName} بمبلغ ${total.toFixed(3)} JOD. أود متابعة حالة الشحن.`);
              whatsappBtn.href = `https://wa.me/962790000000?text=${msg}`;
            }

            successModal.classList.add('active');
          }
        } catch (err) {
          console.error('Order submit error:', err);
          showToast('حدث خطأ أثناء إرسال الطلب، يرجى المحاولة ثانية', 'error');
        }
      });
    }
  }

  // ================= EVENT LISTENERS =================
  function setupEventListeners() {
    // Menu Drawer
    document.getElementById('menuToggleBtn')?.addEventListener('click', () => {
      navDrawer.classList.add('open');
      drawerOverlay.classList.add('active');
    });
    document.getElementById('navDrawerClose')?.addEventListener('click', () => {
      navDrawer.classList.remove('open');
      drawerOverlay.classList.remove('active');
    });
    drawerOverlay?.addEventListener('click', () => {
      navDrawer.classList.remove('open');
      drawerOverlay.classList.remove('active');
    });

    // Cart Drawer
    document.getElementById('cartToggleBtn')?.addEventListener('click', openCart);
    document.getElementById('cartCloseBtn')?.addEventListener('click', closeCart);
    cartOverlay?.addEventListener('click', closeCart);
    document.getElementById('openCheckoutBtn')?.addEventListener('click', openCheckout);

    // Close Modals
    document.getElementById('productModalClose')?.addEventListener('click', closeProductModal);
    document.getElementById('checkoutModalClose')?.addEventListener('click', closeCheckout);
    document.getElementById('closeSuccessBtn')?.addEventListener('click', () => successModal.classList.remove('active'));

    // Community Share Modal
    document.getElementById('addLookBtn')?.addEventListener('click', () => {
      communityModal.classList.add('active');
    });
    document.getElementById('communityModalClose')?.addEventListener('click', () => {
      communityModal.classList.remove('active');
    });

    // Category Filter Pills
    const catPills = document.querySelectorAll('.cat-pill');
    catPills.forEach(pill => {
      pill.addEventListener('click', () => {
        catPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        state.activeCategory = pill.getAttribute('data-cat');
        renderProducts();
      });
    });

    // Community Filter Pills
    const commPills = document.querySelectorAll('.comm-pill');
    commPills.forEach(pill => {
      pill.addEventListener('click', () => {
        commPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        state.activeCommFilter = pill.getAttribute('data-comm-filter');
        renderCommunity();
      });
    });

    // Search Modal
    document.getElementById('searchOpenBtn')?.addEventListener('click', () => {
      searchModal.classList.add('active');
      searchInput.focus();
    });
    document.getElementById('searchCloseBtn')?.addEventListener('click', () => {
      searchModal.classList.remove('active');
    });

    searchInput?.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      if (!q) {
        searchResults.innerHTML = '';
        return;
      }
      const results = state.products.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.category.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q))
      );

      if (results.length === 0) {
        searchResults.innerHTML = '<p style="grid-column: 1/-1; text-align:center; color:#777; padding:20px;">لم يتم العثور على قطع مطابقة</p>';
        return;
      }

      searchResults.innerHTML = results.map(p => `
        <div class="product-card" onclick="window.velenApp.openProductModal('${p.id}'); document.getElementById('searchModal').classList.remove('active');">
          <div class="product-img-wrapper">
            <img src="${p.image}" class="product-img">
          </div>
          <div class="product-info">
            <h4 class="product-title">${p.name}</h4>
            <span class="current-price">${Number(p.price).toFixed(3)} JOD</span>
          </div>
        </div>
      `).join('');
    });

    // Forms
    setupCommunityForm();
    setupCheckoutForm();
  }

  // Toast Helper
  function showToast(msg, type = 'info') {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icon = type === 'success' ? 'fa-circle-check' : 'fa-bell';
    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${msg}</span>`;
    toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  // Expose global helpers to window for inline onclick handlers
  window.velenApp = {
    openProductModal,
    selectModalSize: (size) => {
      state.selectedSize = size;
      const boxes = document.querySelectorAll('#modalSizeBoxes .size-box');
      boxes.forEach(b => {
        if (b.textContent.trim() === size) b.classList.add('selected');
        else b.classList.remove('selected');
      });
    },
    addCurrentModalToCart: () => {
      if (state.currentProductForModal) {
        addToCart(state.currentProductForModal, state.selectedSize, 1);
        closeProductModal();
      }
    },
    quickAddToCart: (productId) => {
      const product = state.products.find(p => p.id === productId);
      if (product) {
        addToCart(product, 'M', 1);
      }
    },
    updateCartQty: updateCartQuantity,
    likeCommunityPost: async (id) => {
      try {
        const res = await fetch(`/api/community/${id}/like`, { method: 'POST' });
        const data = await res.json();
        if (data.success) {
          const item = state.community.find(c => c.id === id);
          if (item) item.likes = data.likes;
          const likeCountEl = document.querySelector(`[data-like-id="${id}"] .count`);
          if (likeCountEl) likeCountEl.textContent = data.likes;
        }
      } catch (e) {
        console.error(e);
      }
    },
    toggleVideoSound: (btn) => {
      const video = btn.parentElement.querySelector('video');
      if (!video) return;
      video.muted = !video.muted;
      const icon = btn.querySelector('i');
      if (video.muted) {
        icon.className = 'fa-solid fa-volume-xmark';
      } else {
        icon.className = 'fa-solid fa-volume-high';
      }
    }
  };
});
