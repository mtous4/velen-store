/**
 * VELEN OFFICIAL STOREFRONT — CLIENT LOGIC & REAL-TIME SYNC
 */

document.addEventListener('DOMContentLoaded', () => {
  // Application State
  const state = {
    products: [],
    community: [],
    design: null,
    settings: null,
    appliedPromo: null,
    activeLang: 'ar',
    sessionId: localStorage.getItem('velen_session_id') || ('sess_' + Math.random().toString(36).substring(2, 10)),
    cart: JSON.parse(localStorage.getItem('velen_cart') || '[]'),
    activeCategory: 'all',
    activeCommFilter: 'all',
    currentProductForModal: null,
    selectedSize: 'M',
    selectedRating: 5
  };

  localStorage.setItem('velen_session_id', state.sessionId);

  // Translations Dictionary (AR / EN)
  const translations = {
    ar: {
      langToggle: 'EN',
      shop: 'Shop / التسوق',
      allProducts: 'جميع المنتجات',
      teesRingers: 'Tees & Ringers',
      community: 'COMMUNITY',
      aboutUs: 'About us / عن البراند',
      whyVelen: 'Why Velen / لماذا فيلين',
      customerReviews: 'التقييمات وإطلالات الزبائن',
      policyAndShipping: 'الشحن وسياسة التبديل',
      stayConnected: 'STAY CONNECTED',
      newsletterPrompt: 'اشترك بالنشرة البريدية واحصل على كود خصم فوري',
      brandTitle: 'Velen Official',
      cartTitle: 'حقيبة التسوق',
      cartEmptyTitle: 'حقيبة التسوق فارغة',
      cartEmptySub: 'تصفح المجموعة واكتشف ملابس Velen اليومية',
      checkoutTitle: 'إتمام الطلب السريع',
      subtotal: 'المجموع الفرعي:',
      total: 'المجموع الإجمالي:'
    },
    en: {
      langToggle: 'عربي',
      shop: 'Shop',
      allProducts: 'All Products',
      teesRingers: 'Tees & Ringers',
      community: 'COMMUNITY',
      aboutUs: 'About us',
      whyVelen: 'Why Velen?',
      customerReviews: 'Reviews & Fit Checks',
      policyAndShipping: 'Shipping & Policy',
      stayConnected: 'STAY CONNECTED',
      newsletterPrompt: 'Sign up for our newsletter for instant promo code',
      brandTitle: 'Velen Official',
      cartTitle: 'Shopping Bag',
      cartEmptyTitle: 'Your shopping bag is empty',
      cartEmptySub: 'Explore the collection and discover everyday Velen fits',
      checkoutTitle: 'Express Checkout',
      subtotal: 'Subtotal:',
      total: 'Total Amount:'
    }
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
    initLanguage();
    setupEventListeners();
    setupMenuDrawerLinks();
    setupNewsletterForms();
    setupCheckoutUpsell();
    setupPromoCodes();

    await fetchSettings();
    await fetchDesign();
    await fetchProducts();
    await fetchCommunity();
    updateCartUI();
    initWebSocket();
    initComingSoonTimer();

    // Heartbeat for live active carts every 45s
    setInterval(sendCartHeartbeat, 45000);
  }

  // ================= DATA FETCHING =================
  async function fetchSettings() {
    try {
      const res = await fetch('/api/settings');
      state.settings = await res.json();
      if (state.settings && state.settings.social) {
        applySocialLinks(state.settings.social);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    }
  }

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
      const logoImgs = document.querySelectorAll('.hero-logo-img, .drawer-logo-img, .modal-logo, .checkout-logo, .nav-brand-logo');
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

    // Check Coming Soon Overlay
    initComingSoonTimer();
  }

  async function fetchProducts() {
    try {
      const res = await fetch('/api/products');
      state.products = await res.json();
      renderProducts();
      populateProductSelect();
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  }

  function populateProductSelect() {
    if (commItemWorn && Array.isArray(state.products)) {
      commItemWorn.innerHTML = state.products.map(p => `<option value="${p.name}">${p.name}</option>`).join('');
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
      filtered = state.products.filter(p => 
        (p.category && p.category.toLowerCase().includes('tee')) || 
        (p.name && p.name.toLowerCase().includes('tee'))
      );
    } else if (state.activeCategory === 'Ringer') {
      filtered = state.products.filter(p => 
        (p.name && p.name.toLowerCase().includes('ringer')) ||
        (p.category && p.category.toLowerCase().includes('ringer'))
      );
    } else if (state.activeCategory === 'Boxy') {
      filtered = state.products.filter(p => 
        (p.name && (p.name.toLowerCase().includes('boxy') || p.name.toLowerCase().includes('cropped'))) ||
        (p.category && (p.category.toLowerCase().includes('boxy') || p.category.toLowerCase().includes('cropped')))
      );
    } else if (state.activeCategory === 'Hoodies') {
      filtered = state.products.filter(p => 
        (p.name && p.name.toLowerCase().includes('hoodie')) ||
        (p.category && p.category.toLowerCase().includes('hoodie'))
      );
    } else if (state.activeCategory && state.activeCategory !== 'all') {
      filtered = state.products.filter(p => p.category === state.activeCategory);
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
    sendCartHeartbeat();
  }

  function updateCartUI() {
    const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    let promoDiscount = 0;
    if (state.appliedPromo && subtotal > 0) {
      if (state.appliedPromo.discountType === 'percentage') {
        promoDiscount = (subtotal * state.appliedPromo.discountValue) / 100;
      } else {
        promoDiscount = Math.min(subtotal, state.appliedPromo.discountValue);
      }
    }
    const finalCartTotal = Math.max(0, subtotal - promoDiscount);

    if (cartCountBadge) cartCountBadge.textContent = totalItems;
    if (cartTotalItems) cartTotalItems.textContent = totalItems;
    if (cartSubtotal) cartSubtotal.textContent = subtotal.toFixed(3) + ' JOD';
    if (cartTotal) cartTotal.textContent = finalCartTotal.toFixed(3) + ' JOD';

    const cartPromoMsg = document.getElementById('cartPromoMsg');
    if (cartPromoMsg) {
      if (promoDiscount > 0) {
        cartPromoMsg.style.display = 'block';
        cartPromoMsg.style.color = '#2ecc71';
        cartPromoMsg.textContent = `تم تطبيق الخصم: -${promoDiscount.toFixed(3)} JOD (${state.appliedPromo.code})`;
      } else {
        cartPromoMsg.style.display = 'none';
      }
    }

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
    const sizeInv = product.sizeInventory || null;

    // Pick initial selected size: first size that has stock > 0
    let initialSize = 'M';
    if (sizeInv) {
      const available = sizes.find(s => typeof sizeInv[s] === 'undefined' || sizeInv[s] > 0);
      initialSize = available || sizes[0] || 'M';
    } else {
      initialSize = (product.sizes && product.sizes[0]) || 'M';
    }
    state.selectedSize = initialSize;

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
              ${sizes.map(size => {
                const qty = sizeInv ? (typeof sizeInv[size] !== 'undefined' ? sizeInv[size] : 99) : 99;
                const isOutOfStock = qty <= 0;
                const isSelected = size === state.selectedSize;

                if (isOutOfStock) {
                  return `
                    <button class="size-box out-of-stock" disabled title="هذا المقاس نفذت كميته حالياً">
                      <span class="size-letter">${size}</span>
                      <span class="stock-sub-badge">نفذ</span>
                    </button>
                  `;
                }

                return `
                  <button class="size-box ${isSelected ? 'selected' : ''}" onclick="window.velenApp.selectModalSize('${size}')" title="${qty <= 5 ? `متبقي ${qty} فقط!` : 'متوفر'}">
                    <span class="size-letter">${size}</span>
                    ${qty <= 3 ? `<span class="stock-sub-badge low">بقي ${qty}</span>` : ''}
                  </button>
                `;
              }).join('')}
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
    const promoLine = document.getElementById('checkoutPromoLine');
    const promoDiscountEl = document.getElementById('checkoutPromoDiscount');

    const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = custCity && custCity.value === 'Amman' ? 0.0 : 1.0;

    let promoDiscount = 0;
    if (state.appliedPromo && subtotal > 0) {
      if (state.appliedPromo.discountType === 'percentage') {
        promoDiscount = (subtotal * state.appliedPromo.discountValue) / 100;
      } else {
        promoDiscount = Math.min(subtotal, state.appliedPromo.discountValue);
      }
    }

    const finalTotal = Math.max(0, subtotal - promoDiscount) + shipping;

    if (checkoutItemsList) {
      checkoutItemsList.innerHTML = state.cart.map(item => `
        <div style="display:flex; justify-content:space-between; font-size:12px; color:#bbb;">
          <span>${item.name} (${item.size}) × ${item.quantity}</span>
          <span>${(item.price * item.quantity).toFixed(3)} JOD</span>
        </div>
      `).join('');
    }

    if (checkoutSubtotal) checkoutSubtotal.textContent = subtotal.toFixed(3) + ' JOD';
    if (promoLine && promoDiscountEl) {
      if (promoDiscount > 0) {
        promoLine.style.display = 'flex';
        promoDiscountEl.textContent = `-${promoDiscount.toFixed(3)} JOD (${state.appliedPromo.code})`;
      } else {
        promoLine.style.display = 'none';
      }
    }
    if (checkoutShipping) checkoutShipping.textContent = shipping === 0 ? 'مجاناً (عمّان)' : '1.000 JOD';
    if (checkoutFinalTotal) checkoutFinalTotal.textContent = finalTotal.toFixed(3) + ' JOD';
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

  // Phone normalization for Jordan (+962, 962, 07, 7)
  function normalizeJordanPhone(phone) {
    let cleaned = phone.replace(/[\s\-\(\)]/g, '');
    if (cleaned.startsWith('+')) cleaned = cleaned.substring(1);
    if (cleaned.startsWith('00962')) cleaned = cleaned.substring(5);
    if (cleaned.startsWith('962')) {
      return '+' + cleaned;
    }
    if (cleaned.startsWith('07')) {
      return '+962' + cleaned.substring(1);
    }
    if (cleaned.startsWith('7') && cleaned.length === 9) {
      return '+962' + cleaned;
    }
    return '+' + cleaned;
  }

  // Active Cart Heartbeat to server
  function sendCartHeartbeat() {
    const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    fetch('/api/cart/active', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: state.sessionId,
        itemsCount: totalItems,
        totalValue: subtotal
      })
    }).catch(() => {});
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
        const rawPhone = document.getElementById('custPhone').value.trim();
        const phone = normalizeJordanPhone(rawPhone);
        const city = document.getElementById('custCity').value;
        const paymentMethod = document.getElementById('custPayment').value;
        const address = document.getElementById('custAddress').value.trim();
        const notes = document.getElementById('custNotes').value.trim();

        if (phone.replace(/[^0-9]/g, '').length < 8) {
          showToast('يرجى التأكد من كتابة رقم الهاتف الأردني بشكل صحيح', 'error');
          return;
        }

        const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shipping = city === 'Amman' ? 0.0 : 1.0;

        let promoDiscount = 0;
        if (state.appliedPromo && subtotal > 0) {
          if (state.appliedPromo.discountType === 'percentage') {
            promoDiscount = (subtotal * state.appliedPromo.discountValue) / 100;
          } else {
            promoDiscount = Math.min(subtotal, state.appliedPromo.discountValue);
          }
        }
        const total = Math.max(0, subtotal - promoDiscount) + shipping;

        const orderData = {
          customerName,
          phone,
          city: `${city} (الأردن)`,
          address,
          notes,
          paymentMethod,
          subtotal,
          discount: promoDiscount,
          promoCode: state.appliedPromo ? state.appliedPromo.code : null,
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
            state.cart = [];
            state.appliedPromo = null;
            saveCart();
            updateCartUI();

            closeCheckout();

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

  // ================= PROMO CODES SETUP =================
  function setupPromoCodes() {
    // Cart drawer promo
    const applyCartBtn = document.getElementById('applyCartPromoBtn');
    const cartInput = document.getElementById('cartPromoInput');
    applyCartBtn?.addEventListener('click', () => {
      const code = cartInput?.value.trim();
      applyPromoCode(code, 'cart');
    });

    // Checkout promo
    const applyCheckoutBtn = document.getElementById('applyCheckoutPromoBtn');
    const checkoutInput = document.getElementById('checkoutPromoInput');
    applyCheckoutBtn?.addEventListener('click', () => {
      const code = checkoutInput?.value.trim();
      applyPromoCode(code, 'checkout');
    });
  }

  async function applyPromoCode(code, source = 'cart') {
    if (!code) {
      showToast('يرجى إدخال كود الخصم', 'info');
      return;
    }
    const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if (subtotal <= 0) {
      showToast('حقيبة التسوق فارغة', 'info');
      return;
    }

    try {
      const res = await fetch('/api/promo-codes/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, orderTotal: subtotal })
      });
      const data = await res.json();
      if (data.valid) {
        state.appliedPromo = data.promo;
        showToast(`تم تفعيل كود الخصم (${data.promo.code}) بنجاح!`, 'success');
        updateCartUI();
        renderCheckoutSummary();
        const promoMsg = document.getElementById('checkoutPromoMsg');
        if (promoMsg) {
          promoMsg.style.display = 'block';
          promoMsg.style.color = '#2ecc71';
          promoMsg.textContent = `تم تطبيق الخصم: -${data.promo.discountAmount.toFixed(3)} JOD (${data.promo.code})`;
        }
      } else {
        showToast(data.message || 'كود الخصم غير صالح أو منتهي الصلاحية', 'error');
        const promoMsg = document.getElementById('checkoutPromoMsg');
        if (promoMsg) {
          promoMsg.style.display = 'block';
          promoMsg.style.color = '#ff4757';
          promoMsg.textContent = data.message || 'كود الخصم غير صالح';
        }
      }
    } catch (err) {
      showToast('حدث خطأ أثناء فحص كود الخصم', 'error');
    }
  }

  // ================= CHECKOUT UPSELL SETUP =================
  function setupCheckoutUpsell() {
    const btn = document.getElementById('btnApplyUpsell');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const size = document.getElementById('upsellSizeSelect')?.value || 'M';
      const upsellItem = {
        id: 'upsell_ringer_tee',
        name: 'VELEN Ringer Tee — Special Addon',
        price: 9.500,
        image: '/assets/velen-logo.jpg',
        category: 'Ringer Edition',
        fabric: '100% قطن أردني معالج نخب أول'
      };
      addToCart(upsellItem, size, 1);
      btn.disabled = true;
      btn.innerHTML = '<i class="fa-solid fa-check"></i> تمت الإضافة للطلب!';
      btn.style.background = '#27ae60';
      showToast('تمت إضافة القطعة بالعرض الخاص إلى طلبك!', 'success');
    });
  }

  // ================= COMING SOON COUNTDOWN TIMER =================
  function initComingSoonTimer() {
    const csScreen = document.getElementById('comingSoonScreen');
    if (!csScreen) return;

    const csData = state.design?.comingSoon;
    const urlParams = new URLSearchParams(window.location.search);
    const isBypass = urlParams.get('preview') === 'true' || sessionStorage.getItem('velen_admin_unlocked') === 'true';

    if (!csData || !csData.enabled || isBypass) {
      csScreen.style.display = 'none';
      return;
    }

    csScreen.style.display = 'flex';

    if (csData.title) {
      const csTitle = document.getElementById('csTitle');
      if (csTitle) csTitle.textContent = csData.title;
    }
    if (csData.subtitle) {
      const csSub = document.getElementById('csSubtitle');
      if (csSub) csSub.textContent = csData.subtitle;
    }

    function updateTicker() {
      const targetDate = new Date(csData.launchDate || '2026-12-01T00:00:00').getTime();
      const now = Date.now();
      const diff = Math.max(0, targetDate - now);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);

      const dEl = document.getElementById('csDays');
      const hEl = document.getElementById('csHours');
      const mEl = document.getElementById('csMinutes');
      const sEl = document.getElementById('csSeconds');

      if (dEl) dEl.textContent = String(days).padStart(2, '0');
      if (hEl) hEl.textContent = String(hours).padStart(2, '0');
      if (mEl) mEl.textContent = String(mins).padStart(2, '0');
      if (sEl) sEl.textContent = String(secs).padStart(2, '0');
    }

    updateTicker();
    if (window._csTimerInterval) clearInterval(window._csTimerInterval);
    window._csTimerInterval = setInterval(updateTicker, 1000);

    const notifyForm = document.getElementById('csNotifyForm');
    if (notifyForm) {
      notifyForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const contact = document.getElementById('csNotifyContact')?.value.trim();
        if (contact) {
          showToast('تم تسجيل بياناتك بنجاح! ستصلك رسالة فور فتح الموقع 🔥', 'success');
          notifyForm.reset();
        }
      });
    }
  }

  // ================= LANGUAGE CONTROLLER (AR / EN) =================
  function initLanguage() {
    const savedLang = localStorage.getItem('velen_lang');
    let lang = savedLang;
    if (!lang) {
      const phoneLang = (navigator.language || navigator.userLanguage || '').toLowerCase();
      lang = phoneLang.startsWith('ar') ? 'ar' : 'en';
    }
    setLanguage(lang);

    document.getElementById('langToggleBtn')?.addEventListener('click', () => {
      const nextLang = state.activeLang === 'ar' ? 'en' : 'ar';
      setLanguage(nextLang);
      showToast(nextLang === 'ar' ? 'تم تغيير اللغة إلى العربية' : 'Language switched to English', 'info');
    });
  }

  function setLanguage(lang) {
    state.activeLang = lang;
    localStorage.setItem('velen_lang', lang);
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');

    const langLabel = document.getElementById('langLabel');
    if (langLabel) {
      langLabel.textContent = lang === 'ar' ? 'EN' : 'عربي';
    }

    const dict = translations[lang] || translations.ar;
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dict[key]) {
        el.textContent = dict[key];
      }
    });
  }

  // ================= DYNAMIC SOCIAL MEDIA LINKS =================
  function applySocialLinks(social) {
    if (!social) return;
    const insta = social.instagram || 'https://instagram.com/velenofficial';
    const tiktok = social.tiktok || 'https://tiktok.com/@velenofficial';
    const wa = social.whatsapp ? (social.whatsapp.startsWith('http') ? social.whatsapp : `https://wa.me/${social.whatsapp.replace(/[^0-9]/g, '')}`) : 'https://wa.me/962790000000';
    const fb = social.facebook || '#';

    document.querySelectorAll('a[id*="Insta"], a[href*="instagram"]').forEach(a => a.href = insta);
    document.querySelectorAll('a[id*="Tiktok"], a[href*="tiktok"]').forEach(a => a.href = tiktok);
    document.querySelectorAll('a[id*="Wa"], a[href*="wa.me"]').forEach(a => {
      if (!a.id.includes('whatsappTrackBtn')) {
        a.href = wa;
      }
    });
    document.querySelectorAll('a[id*="Fb"], a[href*="facebook"]').forEach(a => a.href = fb);
  }

  // ================= MENU DRAWER & FOOTER LINKS =================
  function setupMenuDrawerLinks() {
    const drawerLinks = document.querySelectorAll('#navDrawer a[href^="#"]');
    drawerLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (!href || href === '#') return;

        e.preventDefault();
        navDrawer.classList.remove('open');
        drawerOverlay.classList.remove('active');

        const filter = link.getAttribute('data-filter');
        if (filter) {
          state.activeCategory = filter;
          const catPills = document.querySelectorAll('.cat-pill');
          catPills.forEach(p => {
            if (p.getAttribute('data-cat') === filter) p.classList.add('active');
            else p.classList.remove('active');
          });
          renderProducts();
        }

        setTimeout(() => {
          const targetEl = document.querySelector(href);
          if (targetEl) {
            targetEl.scrollIntoView({ behavior: 'smooth' });
          }
        }, 200);
      });
    });

    const footerLinks = document.querySelectorAll('.footer-col a[href^="#"]');
    footerLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (!href || href === '#') return;
        e.preventDefault();
        const targetEl = document.querySelector(href);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });

    // Policy & Terms Modal
    const openPolicyBtns = [
      document.getElementById('drawerTermsBtn'),
      ...document.querySelectorAll('.open-terms-link, .open-policy-btn')
    ];
    openPolicyBtns.forEach(btn => {
      if (btn) {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          navDrawer.classList.remove('open');
          drawerOverlay.classList.remove('active');
          const policyModal = document.getElementById('policyModal');
          if (policyModal) policyModal.style.display = 'flex';
        });
      }
    });

    document.getElementById('policyModalClose')?.addEventListener('click', () => {
      const policyModal = document.getElementById('policyModal');
      if (policyModal) policyModal.style.display = 'none';
    });

    const policyModal = document.getElementById('policyModal');
    if (policyModal) {
      policyModal.addEventListener('click', (e) => {
        if (e.target === policyModal) policyModal.style.display = 'none';
      });
    }
  }

  // ================= NEWSLETTER FORMS (STAY CONNECTED) =================
  function setupNewsletterForms() {
    const forms = [
      document.getElementById('drawerNewsletterForm'),
      document.getElementById('footerNewsletterForm')
    ];
    forms.forEach(form => {
      if (!form) return;
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = form.querySelector('input[type="email"]');
        const email = input?.value.trim();
        if (email) {
          showToast('شكراً لانضمامك إلى Velen! استخدم كود الخصم (VELEN10) للحصول على 10% خصم فوري 🎉', 'success');
          form.reset();
        }
      });
    });
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
      if (state.currentProductForModal?.sizeInventory) {
        const qty = state.currentProductForModal.sizeInventory[size];
        if (typeof qty !== 'undefined' && qty <= 0) {
          showToast('هذا المقاس غير متوفر حالياً', 'info');
          return;
        }
      }
      state.selectedSize = size;
      const boxes = document.querySelectorAll('#modalSizeBoxes .size-box');
      boxes.forEach(b => {
        const letter = b.querySelector('.size-letter')?.textContent.trim() || b.textContent.trim();
        if (letter === size) b.classList.add('selected');
        else b.classList.remove('selected');
      });
    },
    addCurrentModalToCart: () => {
      if (state.currentProductForModal) {
        if (state.currentProductForModal.sizeInventory) {
          const qty = state.currentProductForModal.sizeInventory[state.selectedSize];
          if (typeof qty !== 'undefined' && qty <= 0) {
            showToast('عذراً، هذا المقاس نفذت كميته', 'info');
            return;
          }
        }
        addToCart(state.currentProductForModal, state.selectedSize, 1);
        closeProductModal();
      }
    },
    quickAddToCart: (productId) => {
      const product = state.products.find(p => p.id === productId);
      if (product) {
        const sizes = product.sizes || ['S', 'M', 'L', 'XL'];
        const sizeInv = product.sizeInventory || null;
        let pickSize = 'M';
        if (sizeInv) {
          pickSize = sizes.find(s => typeof sizeInv[s] === 'undefined' || sizeInv[s] > 0) || 'M';
        }
        addToCart(product, pickSize, 1);
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
