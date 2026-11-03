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
    activeLang: 'en',
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
      announcement: 'توصيل مجاني في عمّان • 1 دينار لباقي المحافظات',
      brandTitle: 'Velen Official',
      shop: 'تسوق الكولكشن',
      allProducts: 'جميع المنتجات',
      teesRingers: 'تيشيرتات & رينجر',
      community: 'المجتمع والريفيوز',
      aboutUs: 'عن البراند',
      whyVelen: 'لماذا فيلين؟',
      customerReviews: 'التقييمات وإطلالات الزبائن',
      policyAndShipping: 'الشحن وسياسة التبديل',
      stayConnected: 'تواصل معنا',
      stayConnectedNote: 'تابعنا على منصاتنا لتكون أول من يعرف عن الدروبات الجديدة والخصومات:',
      searchPlaceholder: 'ابحث عن التيشيرتات، المقاسات، الألوان...',
      heroShopBtn: 'تسوق الكولكشن الآن',
      heroSubHeading: 'قصات بوكسي ستريت وير عصرية مصممة يومياً لتلائم تفاصيل يومك بجودة أردنية تدوم.',
      heroMainHeading: 'THE NEW STANDARD OF STREETWEAR',
      prop1: 'توصيل مجاني في عمّان وبدينار لكافة المحافظات',
      prop2: 'قطن أردني فاخر 260 GSM معالج ومثبت',
      prop3: 'تبديل فوري للمقاس عند باب البيت',
      collectionSubtitle: 'VELEN APPAREL 2026',
      collectionTitle: 'DAILY ESSENTIALS DROP',
      catAll: 'جميع القطع',
      catTees: 'تيشيرتات',
      catRinger: 'رينجر',
      catBoxy: 'بوكسي وتيشيرتات',
      catHoodies: 'هوديز وسويت شيرت',
      communityTitle: 'COMMUNITY WEARS VELEN',
      communitySubtitle: 'أشخاص حقيقيون. ستايل حقيقي.',
      communityDesc: 'شاركنا لوكك اليومي وفيديوهاتك مع قطع Velen، وقيم تجربتك من 5 نجوم لتدخل السحب الأسبوعي على بوكس إسنشيلز كامل!',
      addLookBtn: 'شارك صورتك أو ريلز ستايلك + تقييم 5 نجوم',
      allPosts: 'جميع المشاركات',
      videoReels: 'فيديو ريلز',
      fiveStarsOnly: '★★★★★ (5 نجوم فقط)',
      aboutSub: 'THE VELEN PHILOSOPHY',
      aboutTitle: 'صنع في عمّان بمعايير عالمية',
      aboutP1: 'انطلقت VELEN من فكرة واضحة: تقديم قطع ملابس يومية بجودة تصنيع متفوقة وقصات مريحة تدوم لسنوات.',
      featTitle1: 'قطن معالج 260 GSM',
      featDesc1: 'نسيج قطني ثقيل يمنح القطعة قواماً ثابتاً ومظهراً فخماً لا يتغير مع الغسيل المتكرر.',
      featTitle2: 'قصّة Boxy Fit مثالية',
      featDesc2: 'أكتاف ساقطة ووسع متوازن يعطيك الراحة التامة والمظهر العصري في آن واحد.',
      featTitle3: 'صنع محلياً 100%',
      featDesc3: 'كل درزة تم تفصيلها وتصنيعها بأيدي أمهر الخياطين في الأردن مع رقابة جودة دقيقة.',
      cartTitle: 'حقيبة التسوق',
      cartEmptyTitle: 'حقيبة التسوق فارغة',
      cartEmptySub: 'تصفح المجموعة واكتشف ملابس Velen اليومية',
      cartPromoPlaceholder: 'رمز كود الخصم...',
      applyBtn: 'تطبيق',
      checkoutBtn: 'المتابعة لإتمام الطلب',
      checkoutTitle: 'تأكيد الطلب السريع — Velen Jordan',
      checkoutSub: 'التوصيل مجاناً في عمّان • 1 دينار لجميع المحافظات • الدفع عند الاستلام',
      orderSummary: 'ملخص مشترياتك:',
      upsellTitle: 'عرض خاص وحصري مع طلبك 🔥',
      upsellSub: 'أضف تيشيرت رينجر إضافي إلى طلبك الآن بخصم خاص (9.500 JOD بدل 13.000)!',
      addUpsellBtn: 'أضف للطلب (+9.500 JOD)',
      upsellAdded: '✓ تمت الإضافة للطلب',
      fullNameLabel: 'الاسم الكامل *',
      fullNamePlaceholder: 'مثال: يوسف الخالد',
      checkoutPhoneLabel: 'رقم الهاتف (07XXXXXXXX) *',
      phoneLabel: 'رقم الهاتف (07XXXXXXXX) *',
      phonePlaceholder: '07XXXXXXXX',
      phoneHelper: 'رقم هاتف أردني يتكون من 10 أرقام يبدأ بـ 07 (مثال: 0791234567)',
      cityLabel: 'المحافظة / المدينة *',
      addressLabel: 'العنوان بالتفصيل (المنطقة، الشارع، رقم البناية) *',
      addressPlaceholder: 'مثال: الصويفية، شارع باريس، عمارة 12، بجانب...',
      notesLabel: 'ملاحظات إضافية للتوصيل (اختياري)',
      notesPlaceholder: 'مثال: يرجى الاتصال قبل الوصول بنصف ساعة',
      paymentLabel: 'طريقة الدفع *',
      codOption: 'الدفع نقداً عند الاستلام (COD) — متاح لجميع مناطق المملكة',
      cliqOption: 'تحويل فوري عبر CliQ — الدفع عند استلام الطرد',
      codBadge: 'الدفع نقداً عند الاستلام (COD)',
      cliqBadge: 'تحويل CliQ عند الاستلام',
      confirmOrderBtn: 'تأكيد الطلب فوراً',
      safeCheckoutNote: 'سيتم معالجة طلبك وإرسال تأكيد مباشر',
      subtotal: 'المجموع الفرعي:',
      shippingFee: 'أجرة التوصيل:',
      discount: 'الخصم:',
      total: 'المجموع الإجمالي:',
      orderSuccessTitle: 'تم استلام طلبك بنجاح!',
      orderSuccessSub: 'شكراً لاختيارك Velen. فريق التوصيل سيتواصل معك هاتفياً لتسليم طلبك في أقرب وقت.',
      whatsappTrackBtn: 'متابعة الطلب عبر واتساب',
      continueShopping: 'متابعة التسوق',
      addToBag: 'أضف إلى الحقيبة',
      soldOut: 'نفد من المخزون',
      quickView: 'معاينة سريعة',
      sizeGuide: 'دليل المقاسات',
      selectSize: 'اختر المقاس:',
      careInstructions: 'تعليمات العناية',
      backToStore: 'العودة للمتجر',
      boxyRelaxedFit: '(قصّة Boxy مريحة)',
      fabricDetails: 'تفاصيل القماش:',
      description: 'الوصف:',
      freeDeliveryAmman: 'توصيل مجاني وسريع داخل عمّان • 1 دينار للمحافظات',
      fabricCare: 'دليل العناية بالأقمشة',
      termsOfService: 'الشروط والأحكام والتوصيل',
      footerCopyright: '© 2026 VELEN OFFICIAL. صنع بكل فخر في عمّان، الأردن 🇯🇴'
    },
    en: {
      langToggle: 'عربي',
      announcement: 'FREE DELIVERY IN AMMAN • 1 JD ACROSS JORDAN',
      brandTitle: 'Velen Official',
      shop: 'SHOP COLLECTION',
      allProducts: 'All Products',
      teesRingers: 'Tees & Ringers',
      community: 'COMMUNITY',
      aboutUs: 'About Us',
      whyVelen: 'Why Velen?',
      customerReviews: 'Customer Reviews & Fits',
      policyAndShipping: 'Shipping & Exchange Policy',
      stayConnected: 'STAY CONNECTED',
      stayConnectedNote: 'Follow our channels to be first to know about new drops and exclusive offers:',
      searchPlaceholder: 'Search tees, hoodies, sizes, colors...',
      heroShopBtn: 'SHOP THE COLLECTION',
      heroSubHeading: 'Relaxed boxy fits designed for everyday streetwear with durable Jordanian premium craftsmanship.',
      heroMainHeading: 'THE NEW STANDARD OF STREETWEAR',
      prop1: 'Free Delivery in Amman • 1 JD Jordan-wide',
      prop2: 'Jordanian Luxury Heavyweight Cotton 260 GSM',
      prop3: 'Hassle-free doorstep size exchange',
      collectionSubtitle: 'VELEN APPAREL 2026',
      collectionTitle: 'DAILY ESSENTIALS DROP',
      catAll: 'All Pieces',
      catTees: 'T-Shirts',
      catRinger: 'Ringers',
      catBoxy: 'Boxy & Tees',
      catHoodies: 'Hoodies & Sweats',
      communityTitle: 'COMMUNITY WEARS VELEN',
      communitySubtitle: 'Real people. Real style.',
      communityDesc: 'Share your everyday fit check with Velen pieces, review with 5 stars, and enter the weekly essential box draw!',
      addLookBtn: 'Share your look & 5-star review',
      allPosts: 'All Looks',
      videoReels: 'Reels Videos',
      fiveStarsOnly: '★★★★★ (5 Stars Only)',
      aboutSub: 'THE VELEN PHILOSOPHY',
      aboutTitle: 'Crafted in Amman to Global Standards',
      aboutP1: 'VELEN was founded on a simple vision: uncompromising heavyweight streetwear built with thoughtful everyday fits that last.',
      featTitle1: 'Heavyweight 260 GSM Cotton',
      featDesc1: 'Ultra-dense combed cotton structure that retains clean silhouette wash after wash.',
      featTitle2: 'Signature Boxy Fit',
      featDesc2: 'Relaxed drop-shoulders with balanced proportions for clean modern aesthetics.',
      featTitle3: '100% Ethically Made in Jordan',
      featDesc3: 'Handcrafted by expert local garment makers under rigorous quality control.',
      cartTitle: 'Shopping Bag',
      cartEmptyTitle: 'Your shopping bag is empty',
      cartEmptySub: 'Explore the collection and discover everyday Velen fits',
      cartPromoPlaceholder: 'Promo code...',
      applyBtn: 'Apply',
      checkoutBtn: 'Proceed to Checkout',
      checkoutTitle: 'Express Checkout — Velen Jordan',
      checkoutSub: 'Free Delivery in Amman • 1 JD Jordan-wide • Cash on Delivery',
      orderSummary: 'Order Summary:',
      upsellTitle: 'Exclusive Add-on Offer 🔥',
      upsellSub: 'Add an extra Ringer Tee to your order now at special discount (9.500 JOD instead of 13.000)!',
      addUpsellBtn: 'Add to Order (+9.500 JOD)',
      upsellAdded: '✓ Added to Order',
      fullNameLabel: 'Full Name *',
      fullNamePlaceholder: 'e.g. Yousef Al-Khaled',
      checkoutPhoneLabel: 'Phone Number (07XXXXXXXX) *',
      phoneLabel: 'Phone Number (07XXXXXXXX) *',
      phonePlaceholder: '07XXXXXXXX',
      phoneHelper: 'Jordanian 10-digit mobile number starting with 07 (e.g. 0791234567)',
      cityLabel: 'City / Governorate *',
      addressLabel: 'Delivery Address (Area, street, building number) *',
      addressPlaceholder: 'e.g. Sweifieh, Paris St, Building 12...',
      notesLabel: 'Delivery Notes (Optional)',
      notesPlaceholder: 'e.g. Please call 30 minutes before arrival',
      paymentLabel: 'Payment Method *',
      codOption: 'Cash on Delivery (COD) — Available across Jordan',
      cliqOption: 'Instant CliQ Transfer — Pay upon parcel arrival',
      codBadge: 'Cash on Delivery (COD)',
      cliqBadge: 'Instant CliQ Transfer',
      confirmOrderBtn: 'Place Order Now',
      safeCheckoutNote: 'Your order will be processed and confirmed immediately',
      subtotal: 'Subtotal:',
      shippingFee: 'Delivery Fee:',
      discount: 'Discount:',
      total: 'Total Amount:',
      orderSuccessTitle: 'Order Received Successfully!',
      orderSuccessSub: 'Thank you for choosing Velen. Delivery team will contact you shortly to deliver your order.',
      whatsappTrackBtn: 'Track Order via WhatsApp',
      continueShopping: 'Continue Shopping',
      addToBag: 'Add to Bag',
      soldOut: 'Sold Out',
      quickView: 'Quick View',
      sizeGuide: 'Size Guide',
      selectSize: 'Select Size:',
      careInstructions: 'Care Instructions',
      backToStore: 'Back to Store',
      boxyRelaxedFit: '(Boxy Relaxed Fit)',
      fabricDetails: 'Fabric Details:',
      description: 'Description:',
      freeDeliveryAmman: 'Fast & Free Delivery in Amman • 1 JD Jordan-wide',
      fabricCare: 'Fabric & Care Guide',
      termsOfService: 'Terms & Shipping Policy',
      footerCopyright: '© 2026 VELEN OFFICIAL. Made with pride in Amman, Jordan 🇯🇴'
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
    setupDedicatedProductPage();
    setupCheckoutUpsell();
    setupPromoCodes();
    setupCommunityForm();

    await fetchSettings();
    await fetchDesign();
    await fetchProducts();
    await fetchCommunity();
    updateCartUI();
    initWebSocket();
    initComingSoonTimer();

    // Visitor Live Funnel Tracking initial pulse & heartbeat
    sendVisitorPulse('home', 'الصفحة الرئيسية');
    setInterval(() => sendVisitorPulse(state.currentStage || 'home'), 25000);

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
              <video src="${item.videoUrl || item.mediaUrl}" poster="${item.mediaUrl || '/assets/velen-boxy-white.jpg'}" loop muted playsinline autoplay onerror="this.style.display='none';"></video>
              <button class="comm-sound-btn" onclick="window.velenApp.toggleVideoSound(this)" title="كتم/تشغيل الصوت">
                <i class="fa-solid fa-volume-xmark"></i>
              </button>
            ` : `
              <img src="${item.mediaUrl}" alt="${item.subtitle || 'Velen Fit'}" loading="lazy" onerror="this.onerror=null; this.src='/assets/velen-boxy-white.jpg';">
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

  function openCart() {
    cartDrawer.classList.add('open');
    cartOverlay.classList.add('active');
    state.currentStage = 'cart';
    const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    sendVisitorPulse('cart', `${totalItems} قطع (${subtotal.toFixed(3)} JOD)`);
  }

  function closeCart() {
    cartDrawer.classList.remove('open');
    cartOverlay.classList.remove('active');
    state.currentStage = 'home';
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
    const prodPageCartBadge = document.getElementById('prodPageCartBadge');
    if (prodPageCartBadge) prodPageCartBadge.textContent = totalItems;
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

  // ================= DEDICATED PRODUCT PAGE CONTROLLER (Fixes Mobile Freezing) =================
  function openProductPage(productId) {
    const product = state.products.find(p => p.id === productId);
    if (!product) return;
    state.currentProductForModal = product;
    state.currentStage = 'product';
    sendVisitorPulse('product', product.name);

    const sizes = product.sizes || ['S', 'M', 'L', 'XL'];
    const sizeInv = product.sizeInventory || null;

    let initialSize = 'M';
    if (sizeInv) {
      const available = sizes.find(s => typeof sizeInv[s] === 'undefined' || sizeInv[s] > 0);
      initialSize = available || sizes[0] || 'M';
    } else {
      initialSize = (product.sizes && product.sizes[0]) || 'M';
    }
    state.selectedSize = initialSize;

    renderProductPageContent(product);

    const homeView = document.getElementById('homeView');
    const prodPage = document.getElementById('productPage');
    if (homeView) homeView.style.display = 'none';
    if (prodPage) prodPage.style.display = 'block';

    if (cartDrawer) cartDrawer.classList.remove('open');
    if (cartOverlay) cartOverlay.classList.remove('active');
    if (navDrawer) navDrawer.classList.remove('open');
    if (drawerOverlay) drawerOverlay.classList.remove('active');
    if (searchModal) searchModal.classList.remove('active');

    window.scrollTo({ top: 0, behavior: 'instant' });

    if (window.history && window.history.pushState) {
      window.history.pushState({ page: 'product', id: productId }, '', `#product-${productId}`);
    }
  }

  function closeProductPage(updateHistory = true) {
    const homeView = document.getElementById('homeView');
    const prodPage = document.getElementById('productPage');
    if (prodPage) prodPage.style.display = 'none';
    if (homeView) homeView.style.display = 'block';

    state.currentStage = 'home';
    sendVisitorPulse('home', 'الصفحة الرئيسية');

    if (updateHistory && window.history && window.history.pushState && window.location.hash.startsWith('#product')) {
      window.history.pushState({ page: 'home' }, '', window.location.pathname);
    }
  }

  function renderProductPageContent(product) {
    const container = document.getElementById('productPageDetails');
    if (!container || !product) return;

    const isAr = state.activeLang === 'ar';
    const dict = translations[state.activeLang] || translations.en;
    const priceFormatted = Number(product.price).toFixed(3) + ' JOD';
    const comparePriceFormatted = product.comparePrice ? Number(product.comparePrice).toFixed(3) + ' JOD' : null;
    const sizes = product.sizes || ['S', 'M', 'L', 'XL'];
    const sizeInv = product.sizeInventory || null;

    let allOutOfStock = false;
    if (sizeInv) {
      allOutOfStock = sizes.every(s => typeof sizeInv[s] !== 'undefined' && sizeInv[s] <= 0);
    }

    container.innerHTML = `
      <div class="prod-page-grid">
        <div class="prod-page-gallery">
          <img src="${product.image || '/assets/velen-logo.jpg'}" alt="${product.name}" class="prod-page-main-img" onerror="this.src='/assets/velen-logo.jpg'">
        </div>
        <div class="prod-page-info">
          <span class="prod-page-cat">${product.category || 'ESSENTIALS'} • MADE IN JORDAN</span>
          <h1 class="prod-page-title">${product.name}</h1>
          <div class="prod-page-price-row">
            <span class="prod-page-price-current">${priceFormatted}</span>
            ${comparePriceFormatted ? `<span class="prod-page-price-strike">${comparePriceFormatted}</span>` : ''}
          </div>

          <div class="prod-size-section">
            <div class="prod-size-header">
              <span class="prod-size-label">${dict.selectSize || 'Select Size:'} <strong id="prodSelectedSizeLabel">${state.selectedSize}</strong></span>
              <span class="prod-fit-tag">${dict.boxyRelaxedFit || '(Boxy Relaxed Fit)'}</span>
            </div>
            <div class="prod-size-boxes" id="pageProductSizeBoxes">
              ${sizes.map(size => {
                const qty = sizeInv ? (typeof sizeInv[size] !== 'undefined' ? sizeInv[size] : 99) : 99;
                const isOutOfStock = qty <= 0;
                const isSelected = size === state.selectedSize;

                if (isOutOfStock) {
                  return `
                    <button type="button" class="prod-size-box out-of-stock" disabled title="${dict.soldOut}">
                      <span class="size-letter">${size}</span>
                      <span class="stock-badge">${isAr ? 'نفذ' : 'Out'}</span>
                    </button>
                  `;
                }

                return `
                  <button type="button" class="prod-size-box ${isSelected ? 'selected' : ''}" onclick="window.velenApp.selectModalSize('${size}')">
                    <span class="size-letter">${size}</span>
                  </button>
                `;
              }).join('')}
            </div>
          </div>

          <button type="button" class="btn-add-to-bag-page" id="btnPageAddToBag" onclick="window.velenApp.addCurrentModalToCart()" ${allOutOfStock ? 'disabled' : ''}>
            <i class="fa-solid fa-bag-shopping"></i>
            <span>${allOutOfStock ? dict.soldOut : `${dict.addToBag} (${priceFormatted})`}</span>
          </button>

          <div class="prod-page-specs">
            <div class="spec-item">
              <strong>${dict.fabricDetails || 'Fabric Details:'}</strong>
              <p>${product.fabric || (isAr ? '100% قطن أردني معالج نخب أول (260 GSM)' : '100% Luxury Combed Heavyweight Cotton (260 GSM)')}</p>
            </div>
            <div class="spec-item">
              <strong>${dict.description || 'Description:'}</strong>
              <p>${product.description || (isAr ? 'تصميم ستريت وير يومي يجمع بين الراحة والأناقة المينيمالية مع خياطة متينة.' : 'Everyday luxury streetwear crafted with precision fits and lasting durability.')}</p>
            </div>
            <div class="spec-delivery-perk">
              <i class="fa-solid fa-truck-fast"></i>
              <span>${dict.freeDeliveryAmman || 'Fast & Free Delivery in Amman • 1 JD Jordan-wide'}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function setupDedicatedProductPage() {
    const btnBack = document.getElementById('btnBackToStore');
    if (btnBack) {
      btnBack.addEventListener('click', () => closeProductPage(true));
    }
    const prodCartBtn = document.getElementById('prodPageCartBtn');
    if (prodCartBtn) {
      prodCartBtn.addEventListener('click', openCart);
    }
    window.addEventListener('popstate', () => {
      const prodPage = document.getElementById('productPage');
      if (prodPage && prodPage.style.display === 'block') {
        closeProductPage(false);
      }
    });
  }

  function openProductModal(productId) {
    openProductPage(productId);
  }

  function closeProductModal() {
    closeProductPage(true);
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

    async function handleFileUpload(file) {
      if (!file) return;
      const formData = new FormData();
      formData.append('media', file);

      if (dropzone) dropzone.innerHTML = `<i class="fa-solid fa-spinner fa-spin upload-icon"></i><p>جاري رفع الملف إلى السيرفر...</p>`;

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
              preview.innerHTML = `<video src="${uploadedMediaUrl}" controls autoplay muted style="width:100%; height:200px; object-fit:cover; border-radius:6px;"></video>`;
            } else {
              preview.innerHTML = `<img src="${uploadedMediaUrl}" style="width:100%; height:200px; object-fit:cover; border-radius:6px;">`;
            }
          }
          if (clearMediaBtn) clearMediaBtn.style.display = 'inline-block';
          showToast('تم رفع الصورة / الفيديو بنجاح! 🎉', 'success');
        } else {
          showToast('فشل رفع الملف', 'error');
        }
      } catch (err) {
        console.error('Upload error:', err);
        if (dropzone) dropzone.innerHTML = `<p style="color:#ff4757;">فشل الرفع، يرجى المحاولة ثانية</p>`;
      }
    }

    if (dropzone && fileInput) {
      dropzone.addEventListener('click', () => fileInput.click());

      dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.style.borderColor = 'var(--accent-gold)';
      });
      dropzone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropzone.style.borderColor = '';
      });
      dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.style.borderColor = '';
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          fileInput.files = e.dataTransfer.files;
          handleFileUpload(e.dataTransfer.files[0]);
        }
      });

      fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          handleFileUpload(e.target.files[0]);
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

  // Phone normalization for Jordan - strictly 07XXXXXXXX format
  function normalizeJordanPhone(phone) {
    let cleaned = (phone || '').replace(/[\s\-\(\)\+]/g, '');
    if (cleaned.startsWith('00962')) cleaned = cleaned.substring(5);
    if (cleaned.startsWith('962')) cleaned = cleaned.substring(3);
    if (cleaned.startsWith('7') && cleaned.length === 9) {
      cleaned = '0' + cleaned;
    }
    return cleaned;
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

    const phoneInput = document.getElementById('custPhone');
    if (phoneInput) {
      phoneInput.addEventListener('input', (e) => {
        let val = e.target.value.replace(/[^0-9]/g, '');
        if (val.length > 10) val = val.substring(0, 10);
        e.target.value = val;
      });
      phoneInput.addEventListener('blur', (e) => {
        if (e.target.value) {
          e.target.value = normalizeJordanPhone(e.target.value);
        }
      });
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

        if (!/^07\d{8}$/.test(phone)) {
          showToast('يرجى كتابة رقم الهاتف الأردني بصيغة 07XXXXXXXX (10 أرقام، مثال: 0791234567)', 'error');
          document.getElementById('custPhone').focus();
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
              const cleanWa = (state.settings?.social?.whatsapp || '962770188144').replace(/[^0-9]/g, '');
              whatsappBtn.href = `https://wa.me/${cleanWa}?text=${msg}`;
            }

            successModal.classList.add('active');
            sendVisitorPulse('ordered', `أتم الطلب بنجاح #${result.order.id}`);
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
    // Base language requested by user is English ('en')
    let lang = savedLang || 'en';
    setLanguage(lang);

    document.getElementById('langToggleBtn')?.addEventListener('click', () => {
      const nextLang = state.activeLang === 'ar' ? 'en' : 'ar';
      setLanguage(nextLang);
      showToast(nextLang === 'ar' ? 'تم تغيير لغة الموقع إلى العربية' : 'Switched store language to English', 'info');
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

    const dict = translations[lang] || translations.en;
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dict[key]) {
        el.textContent = dict[key];
      }
    });

    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
      const key = el.getAttribute('data-i18n-ph');
      if (dict[key]) {
        el.setAttribute('placeholder', dict[key]);
      }
    });

    if (state.products && state.products.length > 0) renderProducts();
    if (state.community && state.community.length > 0) renderCommunity();
    updateCartUI();

    // Re-render product page if open to reflect new language
    const prodPage = document.getElementById('productPage');
    if (prodPage && prodPage.style.display === 'block' && state.currentProductForModal) {
      renderProductPageContent(state.currentProductForModal);
    }
  }

  // ================= VISITOR TRACKING & LIVE FUNNEL (5-MIN WINDOW) =================
  function sendVisitorPulse(stage = 'home', detail = '') {
    try {
      const cartCount = state.cart.reduce((sum, i) => sum + (i.quantity || 1), 0);
      const cartTotal = state.cart.reduce((sum, i) => sum + ((i.price || 0) * (i.quantity || 1)), 0);
      
      const stageLabels = {
        home: 'يتصفح الصفحة الرئيسية',
        product: 'يشاهد تفاصيل منتج',
        cart: 'في سلة التسوق',
        checkout: 'في صفحة تأكيد الطلب',
        ordered: 'أتم الطلب بنجاح'
      };

      fetch('/api/visitor/pulse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitorId: state.sessionId,
          stage: stage,
          stageLabel: stageLabels[stage] || 'يتصفح المتجر',
          detail: detail,
          itemsCount: cartCount,
          cartTotal: cartTotal,
          device: /Mobi|Android|iPhone/i.test(navigator.userAgent) ? 'Mobile 📱' : 'Desktop 💻',
          city: 'Jordan 🇯🇴',
          page: window.location.pathname
        })
      }).catch(() => {});
    } catch (e) {}
  }

  // ================= DYNAMIC SOCIAL MEDIA LINKS =================
  function applySocialLinks(social) {
    if (!social) return;
    const insta = social.instagram || 'https://instagram.com/velenofficial';
    const tiktok = social.tiktok || 'https://tiktok.com/@velenofficial';
    const wa = social.whatsapp ? (social.whatsapp.startsWith('http') ? social.whatsapp : `https://wa.me/${social.whatsapp.replace(/[^0-9]/g, '')}`) : 'https://wa.me/962770188144';
    const fb = social.facebook || '#';

    document.querySelectorAll('a[id*="Insta"], a[href*="instagram"]').forEach(a => a.href = insta);
    document.querySelectorAll('a[id*="Tiktok"], a[href*="tiktok"]').forEach(a => a.href = tiktok);
    document.querySelectorAll('a[id*="Wa"], a[href*="wa.me"]').forEach(a => {
      if (!a.id.includes('whatsappTrackBtn')) {
        if (a.id === 'floatingWaBtn') {
          const defaultMsg = encodeURIComponent('مرحباً Velen Official، لدي استفسار بخصوص منتجاتكم.');
          const rawWa = wa.split('?')[0];
          a.href = `${rawWa}?text=${defaultMsg}`;
        } else {
          a.href = wa;
        }
      }
    });
    document.querySelectorAll('a[id*="Fb"], a[href*="facebook"]').forEach(a => a.href = fb);
  }

  // ================= MENU DRAWER & FOOTER NAVIGATION =================
  function setupMenuDrawerLinks() {
    const drawerLinks = document.querySelectorAll('#navDrawer .drawer-link, #navDrawer a[href^="#"]');
    drawerLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        if (link.id === 'drawerTermsBtn' || link.getAttribute('href') === '#terms' || link.getAttribute('href') === '#policy') {
          e.preventDefault();
          navDrawer.classList.remove('open');
          drawerOverlay.classList.remove('active');
          const policyModal = document.getElementById('policyModal');
          if (policyModal) policyModal.style.display = 'flex';
          return;
        }

        const href = link.getAttribute('href');
        if (!href || href === '#') return;

        e.preventDefault();
        navDrawer.classList.remove('open');
        drawerOverlay.classList.remove('active');

        // Close standalone product page if user was in it
        closeProductPage(false);

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
          let targetEl = document.querySelector(href);
          if (!targetEl && href === '#community') targetEl = document.getElementById('sec-community');
          if (!targetEl && href === '#about') targetEl = document.getElementById('sec-about');
          if (!targetEl && href === '#collection') targetEl = document.getElementById('sec-collection');

          if (targetEl) {
            const headerOffset = 70;
            const elementPosition = targetEl.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            window.scrollTo({
              top: Math.max(0, offsetPosition),
              behavior: 'smooth'
            });
          }
        }, 120);
      });
    });

    const footerLinks = document.querySelectorAll('.footer-col a[href^="#"]');
    footerLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (!href || href === '#') return;
        e.preventDefault();
        closeProductPage(false);

        const fFilter = link.getAttribute('data-footer-filter');
        if (fFilter) {
          state.activeCategory = fFilter;
          const catPills = document.querySelectorAll('.cat-pill');
          catPills.forEach(p => {
            if (p.getAttribute('data-cat') === fFilter) p.classList.add('active');
            else p.classList.remove('active');
          });
          renderProducts();
        }

        setTimeout(() => {
          let targetEl = document.querySelector(href);
          if (!targetEl && href === '#community') targetEl = document.getElementById('sec-community');
          if (!targetEl && href === '#about') targetEl = document.getElementById('sec-about');
          if (!targetEl && href === '#collection') targetEl = document.getElementById('sec-collection');

          if (targetEl) {
            const headerOffset = 70;
            const elementPosition = targetEl.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            window.scrollTo({
              top: Math.max(0, offsetPosition),
              behavior: 'smooth'
            });
          }
        }, 100);
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
      const commItemSelect = document.getElementById('commItemWorn');
      if (commItemSelect && state.products.length > 0) {
        commItemSelect.innerHTML = state.products.map(p => `
          <option value="${p.name}">${p.name} (${p.category})</option>
        `).join('') + '<option value="Velen Signature Piece">Velen Signature Piece</option>';
      }
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
          showToast(state.activeLang === 'ar' ? 'هذا المقاس غير متوفر حالياً' : 'This size is currently out of stock', 'info');
          return;
        }
      }
      state.selectedSize = size;
      const selectedLabel = document.getElementById('prodSelectedSizeLabel');
      if (selectedLabel) selectedLabel.textContent = size;
      const boxes = document.querySelectorAll('#pageProductSizeBoxes .prod-size-box, #modalSizeBoxes .size-box');
      boxes.forEach(b => {
        const letter = b.querySelector('.size-letter')?.textContent.trim() || b.textContent.trim();
        if (letter === size) b.classList.add('selected');
        else b.classList.remove('selected');
      });
    },
    addCurrentModalToCart: () => {
      if (state.currentProductForModal) {
        const p = state.currentProductForModal;
        const size = state.selectedSize || 'M';
        if (p.sizeInventory) {
          const qty = p.sizeInventory[size];
          if (typeof qty !== 'undefined' && qty <= 0) {
            showToast(state.activeLang === 'ar' ? 'عذراً، هذا المقاس نفذت كميته' : 'Sorry, this size is sold out', 'info');
            return;
          }
        }
        addToCart(p, size, 1);
        openCart();
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
