/**
 * VELEN OFFICIAL STOREFRONT — CLIENT LOGIC & REAL-TIME SYNC
 */

document.addEventListener('DOMContentLoaded', () => {
  // Built-in Default Catalog (Immediate render fallback so store is never empty)
  const DEFAULT_PRODUCTS = [
    {
      id: "prod-double-zip",
      name: "VELEN Double-Zip Cropped Sweatshirt",
      category: "Sweatshirts",
      price: 39,
      comparePrice: 49,
      onSale: false,
      stock: 60,
      image: "/assets/velen-product-showcase.png",
      images: [
        "/assets/velen-product-showcase.png",
        "/assets/velen-hero-clean.jpg",
        "/assets/velen-boxy-black.jpg"
      ],
      colors: [
        { name: "Crimson Red", hex: "#8b1e2c", images: ["/assets/velen-product-showcase.png"] },
        { name: "Black", hex: "#111111", images: ["/assets/velen-boxy-black.jpg"] },
        { name: "Heather Grey", hex: "#a8a8a8", images: ["/assets/velen-hero-clean.jpg"] }
      ],
      sizes: ["XS", "S", "M", "L", "XL"]
    },
    {
      id: "prod-heavy-sweatpants",
      name: "Heavyweight Straight Sweatpants",
      category: "Sweatpants",
      price: 20,
      comparePrice: 28,
      onSale: false,
      stock: 50,
      image: "/assets/velen-mobile-product.png",
      images: [
        "/assets/velen-mobile-product.png",
        "/assets/velen-hero-clean.jpg"
      ],
      colors: [
        { name: "Heather Grey", hex: "#a8a8a8", images: ["/assets/velen-mobile-product.png"] },
        { name: "Black", hex: "#111111", images: ["/assets/velen-boxy-black.jpg"] },
        { name: "Crimson Red", hex: "#8b1e2c", images: ["/assets/velen-product-showcase.png"] }
      ],
      sizes: ["XS", "S", "M", "L", "XL"]
    },
    {
      id: "prod-raw-sweatpants",
      name: "Raw-Cut Wide Leg Sweatpants",
      category: "Sweatpants",
      price: 32,
      comparePrice: 40,
      onSale: false,
      stock: 40,
      image: "/assets/velen-hero-clean.jpg",
      images: [
        "/assets/velen-hero-clean.jpg",
        "/assets/velen-mobile-product.png"
      ],
      colors: [
        { name: "Heather Grey", hex: "#a8a8a8", images: ["/assets/velen-hero-clean.jpg"] },
        { name: "Black", hex: "#111111", images: ["/assets/velen-boxy-black.jpg"] }
      ],
      sizes: ["XS", "S", "M", "L", "XL"]
    },
    {
      id: "prod-1793258212025",
      name: "VELEN Signature Heavyweight Hoodie - Charcoal",
      category: "Hoodies",
      price: 24,
      comparePrice: 28,
      onSale: true,
      stock: 19,
      image: "/assets/velen-hero-clean.jpg",
      images: [
        "/assets/velen-hero-clean.jpg"
      ],
      colors: [
        { name: "Charcoal Grey", hex: "#34495e", images: ["/assets/velen-hero-clean.jpg"] },
        { name: "Midnight Black", hex: "#111111", images: ["/assets/velen-boxy-black.jpg"] },
        { name: "Off White", hex: "#f5f6fa", images: ["/assets/velen-boxy-white.jpg"] }
      ],
      sizes: ["S", "M", "L", "XL"]
    },
    {
      id: "prod-1",
      name: "VELEN Ringer Tee",
      category: "Tees",
      price: 13,
      comparePrice: 16,
      onSale: true,
      stock: 23,
      image: "/assets/velen-ringer-sky-blue.jpg",
      images: [
        "/assets/velen-ringer-sky-blue.jpg",
        "/assets/velen-hero-banner.jpg"
      ],
      colors: [
        { name: "Sky Blue", hex: "#7bb5d9", images: ["/assets/velen-ringer-sky-blue.jpg"] },
        { name: "Classic White", hex: "#ffffff", images: ["/assets/velen-ringer-white.jpg"] },
        { name: "Ruby Red", hex: "#c0392b", images: ["/assets/velen-hero-clean.jpg"] }
      ],
      sizes: ["S", "M", "L", "XL"]
    },
    {
      id: "prod-2",
      name: "VELEN Boxy Cropped Tee",
      category: "Tees",
      price: 11,
      comparePrice: 14,
      onSale: true,
      stock: 19,
      image: "/assets/velen-boxy-white.jpg",
      images: [
        "/assets/velen-boxy-white.jpg",
        "/assets/velen-hero-banner.jpg"
      ],
      colors: [
        { name: "Chalk White", hex: "#ffffff", images: ["/assets/velen-boxy-white.jpg"] },
        { name: "Pitch Black", hex: "#111111", images: ["/assets/velen-boxy-black.jpg"] },
        { name: "Sky Blue", hex: "#7bb5d9", images: ["/assets/velen-ringer-sky-blue.jpg"] }
      ],
      sizes: ["S", "M", "L", "XL"]
    },
    {
      id: "prod-3",
      name: "VELEN Ringer Tee — White",
      category: "Tees",
      price: 13,
      comparePrice: 16,
      onSale: true,
      stock: 32,
      image: "/assets/velen-ringer-white.jpg",
      images: [
        "/assets/velen-ringer-white.jpg"
      ],
      colors: [
        { name: "Classic White", hex: "#ffffff", images: ["/assets/velen-ringer-white.jpg"] },
        { name: "Sky Blue", hex: "#7bb5d9", images: ["/assets/velen-ringer-sky-blue.jpg"] },
        { name: "Pitch Black", hex: "#111111", images: ["/assets/velen-boxy-black.jpg"] }
      ],
      sizes: ["S", "M", "L", "XL"]
    },
    {
      id: "prod-4",
      name: "VELEN Heavy Boxy Tee",
      category: "Tees",
      price: 11,
      comparePrice: 14,
      onSale: true,
      stock: 28,
      image: "/assets/velen-boxy-black.jpg",
      images: [
        "/assets/velen-boxy-black.jpg"
      ],
      colors: [
        { name: "Pitch Black", hex: "#111111", images: ["/assets/velen-boxy-black.jpg"] },
        { name: "Chalk White", hex: "#ffffff", images: ["/assets/velen-boxy-white.jpg"] },
        { name: "Charcoal Grey", hex: "#34495e", images: ["/assets/velen-hero-clean.jpg"] }
      ],
      sizes: ["S", "M", "L", "XL"]
    }
  ];

  const DEFAULT_CATEGORIES = [
    { id: 'all', nameEn: 'All Pieces', nameAr: 'جميع القطع', slug: 'all' },
    { id: 'sweatshirts', nameEn: 'Sweatshirts', nameAr: 'سويت شيرت', slug: 'sweatshirts' },
    { id: 'sweatpants', nameEn: 'Sweatpants', nameAr: 'بناطيل سويت بانتس', slug: 'sweatpants' },
    { id: 'tees', nameEn: 'T-Shirts', nameAr: 'تيشيرتات', slug: 'tees' },
    { id: 'ringer', nameEn: 'Ringers', nameAr: 'ياقة ملونة', slug: 'ringer' },
    { id: 'boxy', nameEn: 'Boxy & Tees', nameAr: 'قصّة بوكسي', slug: 'boxy' },
    { id: 'hoodies', nameEn: 'Hoodies & Sweats', nameAr: 'هوديز وسويت شيرت', slug: 'hoodies' }
  ];

  // Early Stub for window.velenApp so inline onclick handlers never hit undefined
  window.velenApp = window.velenApp || {};

  // Application State
  const state = {
    products: [...DEFAULT_PRODUCTS],
    community: [],
    design: null,
    settings: null,
    appliedPromo: null,
    activeLang: 'en',
    sessionId: localStorage.getItem('velen_session_id') || ('sess_' + Math.random().toString(36).substring(2, 10)),
    cart: JSON.parse(localStorage.getItem('velen_cart') || '[]'),
    activeCategory: 'all',
    activeFeaturedCategory: 'all',
    saFit: 'regular',
    saBuild: 'average',
    saCurrentRecommendation: 'M',
    categories: [...DEFAULT_CATEGORIES],
    activeCommFilter: 'all',
    currentProductForModal: null,
    selectedSize: 'M',
    selectedRating: 5,
    activeView: 'home'
  };

  localStorage.setItem('velen_session_id', state.sessionId);

  // Translations Dictionary (AR / EN)
  const translations = {
    ar: {
      langToggle: 'EN',
      announcement: 'توصيل مجاني في عمّان • 1 دينار لباقي المحافظات',
      brandTitle: 'Velen Official',
      navHome: 'الرئيسية',
      navShop: 'المتجر',
      navStory: 'قصتنا',
      navCommunity: 'المجتمع',
      navReviews: 'التقييمات',
      navTrack: 'تتبع الطلب',
      heroStoryBtn: 'قصة فيلين',
      manifestoBadge: 'عن البراند • هوية فيلين',
      brandIntroTitle: 'تعريف جديد للملابس الأساسية في عمّان',
      brandIntroSub: 'فصل جديد في صناعة الأزياء الأردنية الفاخرة',
      brandIntroText: 'انطلقت VELEN من عمّان برؤية استثنائية: تقديم ملابس ستريت وير أساسية تجمع بين القطن الأردني الثقيل 260 GSM، والقصّات البوكسي المريحة، وجودة تدوم لسنوات. كل درزة تم تفصيلها وتصنيعها محلياً لتقديم قطعة ملابس تشعر بفخامتها من أول ارتداء.',
      portalsSub: 'اكتشف أقسام فيلين',
      portalsTitle: 'تصفح الموقع حسب القسم',
      portalBadgeShop: 'كولكشن 2026',
      portalShopTitle: 'جميع المنتجات والتصاميم',
      portalShopSub: 'تصفح التيشيرتات البوكسي، الرينجر، الهوديز والتصاميم اليومية بخيارات ألوان متعددة.',
      portalShopBtn: 'تصفح المتجر ←',
      portalBadgeAbout: 'الفلسفة والحرفية',
      portalAboutTitle: 'قصتنا وحرفيتنا',
      portalAboutSub: 'سر اختيار قطن 260 GSM، وتفصيل مشاغلنا في عمّان، ودليل العناية بالملابس.',
      portalAboutBtn: 'اكتشف القصة ←',
      portalBadgeCommunity: 'إطلالات حقيقية',
      portalCommunityTitle: 'مجتمع فيلين',
      portalCommunitySub: 'إطلالات حقيقية لزبائننا وفيديوهات ريلز من جميع أنحاء الأردن.',
      portalCommunityBtn: 'تصفح المجتمع ←',
      portalBadgeReviews: '5.0 ★ تقييمات موثقة',
      portalReviewsTitle: 'آراء وتقييمات العملاء',
      portalReviewsSub: 'تقييمات موثقة 5 نجوم حول جودة القماش، دقة المقاسات، وسرعة التوصيل.',
      portalReviewsBtn: 'قراءة التقييمات ←',
      portalBadgeTrack: 'تتبع فوري',
      portalTrackTitle: 'تتبع طلبك والدعم',
      portalTrackSub: 'أدخل رقم هاتفك لتتبع حالة طردك وتوصيله فوراً في أي محافظة.',
      portalTrackBtn: 'تتبع طلبك الآن ←',
      featuredSub: 'مختارات مميزة',
      featuredTitle: 'قطع مختارة ومميزة',
      viewAllInShop: 'تصفح جميع المنتجات في المتجر ←',
      breadcrumbHome: 'الرئيسية',
      breadcrumbShop: 'المتجر والكولكشن',
      breadcrumbAbout: 'قصة البراند والفلسفة',
      breadcrumbCommunity: 'إطلالات المجتمع',
      breadcrumbReviews: 'آراء وتقييمات العملاء',
      breadcrumbTrack: 'تتبع الطلب وخدمة العملاء',
      trackTitle: 'تتبع طلبك فوراً',
      trackSub: 'أدخل رقم هاتفك المكون من 10 أرقام (07XXXXXXXX)',
      trackBtn: 'تتبع الطلب',
      reviewsPageSub: 'تقييمات موثقة 5 نجوم لزبائننا في الأردن',
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
      heroTagline: 'قطع ملابس يومية فاخرة • قطن معالج 260 GSM • صُنع في الأردن',
      writeReview: 'كتابة تقييم',
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
      codBadge: 'الدفع عند الاستلام (COD)',
      cliqBadge: 'كليك CliQ',
      chatWithUs: 'تواصل معنا',
      confirmOrderBtn: 'تأكيد الطلب فوراً',
      safeCheckoutNote: 'سيتم معالجة طلبك وإرسال تأكيد مباشر',
      subtotal: 'المجموع الفرعي:',
      shippingFee: 'أجرة التوصيل:',
      discount: 'الخصم:',
      total: 'المجموع الإجمالي:',
      orderNumberLabel: 'رقم الطلب:',
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
      fabricCare: 'دليل العناية بالملابس',
      termsOfService: 'الشروط والأحكام والتوصيل',
      footerCopyright: '© 2026 VELEN OFFICIAL. صنع بكل فخر في عمّان، الأردن 🇯🇴',
      noProductsInCategory: 'لا توجد قطع متاحة في هذا التصنيف حالياً.',
      // Cart Drawer Footer
      cartSubtotalLabel: 'المجموع الفرعي:',
      cartDeliveryLabel: 'التوصيل (عمّان):',
      cartTotalLabel: 'الإجمالي النهائي:',
      cartCheckoutBtn: 'المتابعة لإتمام الطلب (الدفع عند الاستلام)',
      promoDiscountLabel: 'خصم كود الترويجي:',
      freeDeliveryTag: 'مجاناً (0.000 JOD)',
      promoPlaceholder: 'كود الخصم (Promo Code)',
      applyPromoBtn: 'تطبيق',
      // Community Form
      commAuthorLabel: 'اسم حسابك على انستغرام أو اسمك *',
      commAuthorPh: 'مثال: @khalid.jo',
      commMediaLabel: 'الصورة أو الفيديو / الريلز',
      requiredLabel: '*مطلوب',
      cancelMediaBtn: 'إلغاء الميديا',
      commDropzoneText: 'اسحب وأفلت الصورة أو الفيديو هنا أو اضغط للاختيار',
      commDropzoneHint: 'يدعم MP4, MOV, JPG, PNG حتى 50MB',
      commOrUrl: 'أو رابط مباشر للصورة / الفيديو:',
      commUrlPh: 'https://example.com/photo.jpg',
      commCaptionLabel: 'كابشن / تعليق (اختياري)',
      commCaptionPh: 'شاركنا رأيك في المقاس أو القطعة أو ستايلك!',
      commSubmitBtn: 'نشر في المجتمع الآن',
      // Policy View
      breadcrumbShipping: 'الشحن وسياسة الإرجاع',
      policyShippingTitle: 'سياسة الشحن والتبديل المعتمدة',
      policyShippingSub: 'توصيل مجاني في عمّان (خلال 24 ساعة) • 1 دينار للمحافظات (خلال 48 ساعة) • إرجاع وتبديل في حال وجود خلل مصنعي أو تلف فقط',
      shippingBadgeRates: 'توصيل سريع ودقيق',
      policyDeliveryHeading: 'مواعيد ورسوم التوصيل (عمّان حتى 24 ساعة • المحافظات حتى 48 ساعة)',
      shippingBadgeExchange: 'ضمان الجودة والتصنيع',
      policyExchangeHeading: 'سياسة الإرجاع والتبديل (للعيوب المصنعية والتلف فقط)',
      shippingBadgePayment: 'طرق الدفع المعتمدة',
      policyPaymentHeading: 'خيارات الدفع المعتمدة (الدفع عند الاستلام COD و CliQ فقط)',
      policyContactHeading: 'هل تحتاج مساعدة في طلبك؟',
      policyContactText: 'فريق VELEN متواجد يومياً عبر واتساب لمراجعة أي استفسار أو بلاغ عن خلل مصنعي وتقديم المساعدة فوراً.',
      // Care View
      breadcrumbCare: 'دليل العناية بالملابس',
      carePageTitle: 'دليل العناية بالملابس والأقمشة',
      carePageSub: 'بروتوكول الحفاظ على النسيج وقَصّة البوكسي لسنوات طويلة',
      careBadge: 'ميزة الأقمشة الفاخرة',
      careIntroTitle: 'صُنعت لتدوم طويلاً',
      careIntroDesc: 'قطع فيلين مصنوعة من قطن ممشط ثقيل وفاخر بوزن 260 GSM. للحفاظ على كثافة النسيج، ونقاء الألوان، وقَصّة البوكسي الفاخرة لسنوات طويلة، يرجى اتباع التعليمات المعتمدة أدناه.',
      careStep1Title: 'غسيل بالماء البارد (30°C)',
      careStep1Desc: 'غسيل بحد أقصى 30 درجة مئوية مع ألوان مماثلة للحفاظ على نعومة الألياف ومنع انكماش الغزل.',
      careStep2Title: 'الغسيل من الداخل للخارج',
      careStep2Desc: 'اقلب القطعة دائماً قبل وضعها في الغسالة لحماية الطباعة وتفاصيل البراند من الاحتكاك.',
      careStep3Title: 'تجنب مبيضات الكلور',
      careStep3Desc: 'استخدم مسحوق غسيل معتدل خالي من الكلور أو المبيضات القوية لحماية صبغة القماش الطبيعية.',
      careStep4Title: 'التجفيف في الظل',
      careStep4Desc: 'انشر القطعة في الظل وتجنب التجفيف بالنشافة الحرارية الساخنة للحفاظ على أبعاد القطن.',
      careStep5Title: 'الكي بدرجة حرارة خفيفة',
      careStep5Desc: 'عند الحاجة للكي، اكوي القطعة من الداخل بدرجة حرارة منخفضة، وتجنب ملامسة المكواة للطباعة مباشرة.',
      careStep6Title: 'الطي بدلاً من الشماعات الرفيعة',
      careStep6Desc: 'نظراً لوزن القماش الفاخر 260 GSM، يفضل طي التيشيرت على الرف بدلاً من تعليقه على شماعات سلكية رفيعة لمنع تمدد الأكتاف.'
    },
    en: {
      langToggle: 'عربي',
      announcement: 'FREE DELIVERY IN AMMAN • 1 JD ACROSS JORDAN',
      brandTitle: 'Velen Official',
      navHome: 'Home',
      navShop: 'Shop',
      navStory: 'Our Story',
      navCommunity: 'Community',
      navReviews: 'Reviews',
      navTrack: 'Track Order',
      heroStoryBtn: 'OUR STORY',
      manifestoBadge: 'ABOUT THE BRAND',
      brandIntroTitle: 'DEFINING MODERN STREETWEAR IN AMMAN',
      brandIntroSub: 'A NEW CHAPTER IN JORDANIAN APPAREL CRAFTSMANSHIP',
      brandIntroText: 'Velen was born in Amman from a distinct vision: creating luxury streetwear essentials that balance heavyweight 260 GSM combed cotton, relaxed contemporary boxy cuts, and unmatched durability. Every seam is cut, sewn, and inspected locally to deliver a garment that feels substantial from the first wear and endures for years.',
      portalsSub: 'DISCOVER VELEN SECTIONS',
      portalsTitle: 'EXPLORE BY DESTINATION',
      portalBadgeShop: 'CATALOG 2026',
      portalShopTitle: 'ALL PRODUCTS & DROPS',
      portalShopSub: 'Explore heavyweight boxy tees, ringers, hoodies and daily essentials with multi-color options.',
      portalShopBtn: 'ENTER SHOPPING CATALOG →',
      portalBadgeAbout: 'THE PHILOSOPHY',
      portalAboutTitle: 'OUR STORY & CRAFTSMANSHIP',
      portalAboutSub: 'Discover the journey of creating Jordan\'s finest everyday streetwear with custom 260 GSM fabrics.',
      portalAboutBtn: 'DISCOVER THE STORY →',
      portalBadgeCommunity: 'COMMUNITY WEARS VELEN',
      portalCommunityTitle: 'COMMUNITY & FITS',
      portalCommunitySub: 'Real people, real fits. Browse our community lookbook, customer stylings, and video reels.',
      portalCommunityBtn: 'VIEW COMMUNITY →',
      portalBadgeReviews: '5.0 ★ VERIFIED RATINGS',
      portalReviewsTitle: 'CUSTOMER REVIEWS',
      portalReviewsSub: 'Read verified customer feedback on sizing, heavyweight cotton texture, and fast delivery.',
      portalReviewsBtn: 'READ REVIEWS →',
      portalBadgeTrack: 'LIVE COURIER STATUS',
      portalTrackTitle: 'TRACK ORDER & SUPPORT',
      portalTrackSub: 'Check your live order delivery status with your phone number, or get instant WhatsApp assistance.',
      portalTrackBtn: 'TRACK ORDER NOW →',
      featuredSub: 'CURATED ESSENTIALS',
      featuredTitle: 'FEATURED RELEASES',
      viewAllInShop: 'VIEW FULL COLLECTION IN SHOP →',
      breadcrumbHome: 'Home',
      breadcrumbShop: 'Shop Collection',
      breadcrumbAbout: 'Our Story & Philosophy',
      breadcrumbCommunity: 'Community Looks',
      breadcrumbReviews: 'Customer Reviews',
      breadcrumbTrack: 'Track Order & Support',
      trackTitle: 'TRACK YOUR ORDER',
      trackSub: 'ENTER YOUR 10-DIGIT MOBILE NUMBER (07XXXXXXXX)',
      trackBtn: 'Track Order',
      reviewsPageSub: 'VERIFIED 5-STAR RATINGS ACROSS JORDAN',
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
      heroTagline: 'Luxury Everyday Essentials • 260 GSM Combed Cotton • Crafted in Jordan',
      writeReview: 'Write a Review',
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
      cliqBadge: 'Instant CliQ',
      chatWithUs: 'Chat with Us',
      confirmOrderBtn: 'Place Order Now',
      safeCheckoutNote: 'Your order will be processed and confirmed immediately',
      subtotal: 'Subtotal:',
      shippingFee: 'Delivery Fee:',
      discount: 'Discount:',
      total: 'Total Amount:',
      orderNumberLabel: 'Order Number:',
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
      fabricCare: 'Fabric & Garment Care Guide',
      termsOfService: 'Terms & Shipping Policy',
      footerCopyright: '© 2026 VELEN OFFICIAL. Made with pride in Amman, Jordan 🇯🇴',
      noProductsInCategory: 'No pieces available in this category currently.',
      // Cart Drawer Footer
      cartSubtotalLabel: 'Subtotal:',
      cartDeliveryLabel: 'Delivery (Amman):',
      cartTotalLabel: 'Final Total:',
      cartCheckoutBtn: 'Proceed to Checkout (Cash on Delivery)',
      promoDiscountLabel: 'Promo Discount:',
      freeDeliveryTag: 'Free (0.000 JOD)',
      promoPlaceholder: 'Promo Code (كود الخصم)',
      applyPromoBtn: 'Apply',
      // Community Form
      commAuthorLabel: 'Instagram Handle or Your Name *',
      commAuthorPh: 'e.g. @khalid.jo',
      commMediaLabel: 'Photo or Video / Reels',
      requiredLabel: '*Required',
      cancelMediaBtn: 'Cancel Media',
      commDropzoneText: 'Drag & drop photo or video here, or click to browse',
      commDropzoneHint: 'Supports MP4, MOV, JPG, PNG up to 50MB',
      commOrUrl: 'Or direct photo/video URL:',
      commUrlPh: 'https://example.com/photo.jpg',
      commCaptionLabel: 'Caption / Thoughts (Optional)',
      commCaptionPh: 'Tell us how you styled it, fit details, or thoughts!',
      commSubmitBtn: 'Post to Community Now',
      // Policy View
      breadcrumbShipping: 'Shipping & Exchange Policy',
      policyShippingTitle: 'STANDARDIZED SHIPPING & POLICY',
      policyShippingSub: 'FREE AMMAN DELIVERY (UP TO 24H) • 1 JD NATIONWIDE (UP TO 48H) • DEFECT & DAMAGE ONLY RETURNS',
      shippingBadgeRates: 'ACCURATE DELIVERY',
      policyDeliveryHeading: 'Delivery Timeline & Rates (Amman: Up to 24h • Nationwide: Up to 48h)',
      shippingBadgeExchange: 'QUALITY GUARANTEE',
      policyExchangeHeading: 'Exchange & Return Policy (Manufacturing Defects & Damaged Items Only)',
      shippingBadgePayment: 'APPROVED PAYMENT METHODS',
      policyPaymentHeading: 'Approved Payment Options (Cash on Delivery & CliQ Only)',
      policyContactHeading: 'Need Help with Your Order?',
      policyContactText: 'Our team in Amman is available on WhatsApp daily for order assistance, photo review of defects, or address updates.',
      // Care View
      breadcrumbCare: 'Fabric Care Guide',
      carePageTitle: 'FABRIC & GARMENT CARE GUIDE',
      carePageSub: 'GARMENT LONGEVITY & FABRIC PROTOCOL',
      careBadge: 'THE LUXURY FABRIC ADVANTAGE',
      careIntroTitle: 'Engineered to Endure',
      careIntroDesc: 'VELEN essentials are crafted from custom heavyweight 260 GSM combed cotton. To preserve its dense weave, rich color depth, and signature boxy drape, follow our tested garment longevity protocol below.',
      careStep1Title: 'Cold Machine Wash (Max 30°C / 86°F)',
      careStep1Desc: 'Wash on a gentle cold cycle with similar colors. Cold water preserves the cotton fibers and prevents yarn tightening.',
      careStep2Title: 'Wash Inside Out',
      careStep2Desc: 'Turn the garment inside out before washing to safeguard the exterior finish, screen prints, and branding from friction.',
      careStep3Title: 'No Chlorine Bleach',
      careStep3Desc: 'Use mild, liquid detergent. Avoid harsh chlorine bleaches or aggressive stain removers that weaken combed fibers.',
      careStep4Title: 'Air Dry in Shade',
      careStep4Desc: 'Reshape while damp and hang or lay flat to dry in a shaded area. Avoid tumble drying, as excessive drum heat causes shrinkage.',
      careStep5Title: 'Reverse Low-Heat Iron',
      careStep5Desc: 'If pressing is needed, iron on low temperature from the inside out. Never apply direct iron heat over prints or labels.',
      careStep6Title: 'Fold, Don\'t Wire Hang',
      careStep6Desc: 'Because of the substantial 260 GSM fabric weight, store folded on a shelf rather than on thin wire hangers to prevent shoulder stretching.'
    }
  };

  // Centralized Modal / Drawer Body Scroll Lock
  var activeLockCount = 0;
  var uploadedMediaUrl = null;
  var uploadedMediaType = 'photo';
  var commFormInitialized = false;
  function lockBodyScroll() {
    activeLockCount++;
    document.body.classList.add('body-scroll-locked');
  }
  function unlockBodyScroll() {
    activeLockCount = Math.max(0, activeLockCount - 1);
    if (activeLockCount === 0) {
      document.body.classList.remove('body-scroll-locked');
    }
  }
  function forceUnlockBodyScroll() {
    activeLockCount = 0;
    document.body.classList.remove('body-scroll-locked');
  }

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

  // ================= MULTI-PAGE VIEW ROUTER =================
  const SITE_VIEWS = ['home', 'shop', 'about', 'community', 'reviews', 'track', 'shipping', 'care'];

  // Initialize
  initApp();

  async function initApp() {
    initLanguage();
    initRouter();
    setupEventListeners();
    setupMenuDrawerLinks();
    setupDedicatedProductPage();
    setupCheckoutUpsell();
    setupPromoCodes();
    setupCommunityForm();

    // Render immediately from initial catalog so user never sees empty or loading state
    renderProducts();
    renderFeaturedProducts();
    renderCategoryTabs();
    populateProductSelect();

    // Parallel fetch from APIs with Promise.allSettled so no network delay blocks the store
    Promise.allSettled([
      fetchSettings(),
      fetchDesign(),
      fetchCategories(),
      fetchProducts(),
      fetchCommunity(),
      fetchReviews()
    ]).then(() => {
      updateCartUI();
      initComingSoonTimer();
    }).catch(e => {
      console.warn('Init fetch settled with warning:', e);
    });

    initWebSocket();
    setupReviewForm();
    setupWaybillModal();

    // Visitor Live Funnel Tracking initial pulse & heartbeat
    sendVisitorPulse('home', 'Home Page');
    setInterval(() => sendVisitorPulse(state.currentStage || 'home'), 25000);

    // Heartbeat for live active carts every 45s
    setInterval(sendCartHeartbeat, 45000);
  }

  function initRouter() {
    window.addEventListener('hashchange', handleHashRoute);
    window.addEventListener('popstate', (e) => {
      if (e.state && e.state.page === 'product' && e.state.id) {
        openProductPage(e.state.id, false);
      } else if (e.state && e.state.view) {
        showView(e.state.view, false);
      } else {
        handleHashRoute();
      }
    });

    handleHashRoute();
  }

  function handleHashRoute() {
    const hash = window.location.hash || '#home';
    if (hash.startsWith('#product-')) {
      const id = hash.replace('#product-', '');
      openProductPage(id, false);
    } else if (hash === '#shop' || hash === '#collection') {
      showView('shop', false);
    } else if (hash === '#about') {
      showView('about', false);
    } else if (hash === '#community') {
      showView('community', false);
    } else if (hash === '#reviews') {
      showView('reviews', false);
    } else if (hash === '#track') {
      showView('track', false);
    } else if (hash === '#shipping' || hash === '#terms' || hash === '#policy') {
      showView('shipping', false);
    } else if (hash === '#care' || hash === '#fabric' || hash === '#fabric-care') {
      showView('care', false);
    } else {
      showView('home', false);
    }
  }

  function navigateTo(viewName, pushState = true) {
    if (!SITE_VIEWS.includes(viewName)) viewName = 'home';
    showView(viewName, pushState);
  }

  function showView(viewName, pushState = true) {
    state.activeView = viewName;

    // Hide product page view if open
    const prodPage = document.getElementById('productPage');
    if (prodPage) prodPage.style.display = 'none';

    const homeView = document.getElementById('homeView');
    if (homeView) homeView.style.display = 'block';

    // Show only the selected view
    SITE_VIEWS.forEach(v => {
      const el = document.getElementById(`view-${v}`);
      if (el) {
        if (v === viewName) {
          el.style.display = 'block';
          el.classList.add('active');
        } else {
          el.style.display = 'none';
          el.classList.remove('active');
        }
      }
    });

    // Sync Desktop Nav Active State
    document.querySelectorAll('#desktopNavMenu .nav-link-item').forEach(link => {
      if (link.getAttribute('data-nav') === viewName) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Sync Mobile Drawer Active State
    document.querySelectorAll('#navDrawer .drawer-link').forEach(link => {
      if (link.getAttribute('data-nav') === viewName) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    if (pushState && window.history && window.history.pushState) {
      window.history.pushState({ view: viewName }, '', `#${viewName}`);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });

    state.currentStage = viewName;
    sendVisitorPulse(viewName, `View: ${viewName}`);

    if (viewName === 'shop') {
      renderProducts();
    } else if (viewName === 'home') {
      renderFeaturedProducts();
    } else if (viewName === 'shipping' || viewName === 'care') {
      renderDynamicPolicies();
    }
  }

  function renderDynamicPolicies() {
    const policies = state.settings?.policies;
    const isAr = state.activeLang === 'ar';
    
    // Shipping Policy Dynamic Render
    const shippingDeliveryEl = document.getElementById('policyDeliveryContent');
    const shippingExchangeEl = document.getElementById('policyExchangeContent');
    const pageShippingTitleEl = document.getElementById('pageShippingMainTitle');
    
    if (policies?.shipping) {
      if (shippingDeliveryEl) {
        const text = isAr ? policies.shipping.deliveryAr : policies.shipping.deliveryEn;
        if (text) shippingDeliveryEl.innerHTML = `<p>${text.replace(/\n/g, '<br>')}</p>`;
      }
      if (shippingExchangeEl) {
        const text = isAr ? policies.shipping.exchangeAr : policies.shipping.exchangeEn;
        if (text) shippingExchangeEl.innerHTML = `<p>${text.replace(/\n/g, '<br>')}</p>`;
      }
      if (pageShippingTitleEl) {
        const title = isAr ? policies.shipping.titleAr : policies.shipping.titleEn;
        if (title) pageShippingTitleEl.textContent = title;
      }
    }
    
    // Care Guide Dynamic Render (Fully Customizable for Summer/Winter Seasons)
    if (policies?.care) {
      const care = policies.care;
      const careTitle = isAr ? (care.titleAr || care.titleEn) : (care.titleEn || care.titleAr);
      const careSub = isAr ? (care.subAr || care.subEn) : (care.subEn || care.subAr);
      const careBadge = isAr ? (care.badgeAr || care.badgeEn) : (care.badgeEn || care.badgeAr);
      const careIntro = isAr ? (care.introAr || care.introEn) : (care.introEn || care.introAr);

      // 1. Update all menu and footer links across the entire store
      if (careTitle) {
        document.querySelectorAll('[data-i18n="fabricCare"]').forEach(el => {
          el.textContent = careTitle;
        });
      }

      // 2. Update Care page main title
      const pageCareTitleEl = document.getElementById('pageCareMainTitle');
      if (pageCareTitleEl && careTitle) {
        pageCareTitleEl.textContent = careTitle;
      }

      // 3. Update Care page subtitle
      const pageCareSubTitleEl = document.getElementById('pageCareSubTitle');
      if (pageCareSubTitleEl && careSub) {
        pageCareSubTitleEl.textContent = careSub;
      }

      // 4. Update Care intro badge
      const careIntroBadgeEl = document.getElementById('careIntroBadge') || document.querySelector('.care-intro-badge span');
      if (careIntroBadgeEl && careBadge) {
        careIntroBadgeEl.textContent = careBadge;
      }

      // 5. Update Care intro title & description
      const careIntroTitleEl = document.getElementById('careIntroTitle');
      if (careIntroTitleEl) {
        careIntroTitleEl.textContent = isAr ? 'صُنعت لتدوم لسنوات' : 'Engineered to Endure';
      }

      const careIntroDescEl = document.getElementById('careIntroDesc');
      if (careIntroDescEl && careIntro) {
        careIntroDescEl.textContent = careIntro;
      }

      // 6. Update Policy modal care heading if present
      const policyCareHeading = document.getElementById('policyCareHeading');
      if (policyCareHeading && careTitle) {
        policyCareHeading.textContent = isAr ? `تعليمات: ${careTitle}` : `Instructions: ${careTitle}`;
      }
    }
  }

  // Render Featured Drops on the Home Page (Matching Image 2)
  function renderFeaturedProducts(filterCat) {
    if (typeof filterCat === 'string') {
      state.activeFeaturedCategory = filterCat;
    }
    const grid = document.getElementById('homeFeaturedGrid');
    if (!grid) return;
    if (!state.products || state.products.length === 0) {
      grid.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; color: #888; padding: 40px;">${state.activeLang === 'ar' ? 'جاري تحميل التشكيلة المميزة...' : 'Loading featured collection...'}</div>`;
      return;
    }

    const currentCat = state.activeFeaturedCategory || 'all';
    let filtered = state.products;
    if (currentCat !== 'all') {
      filtered = state.products.filter(p => {
        const cat = (p.category || '').toLowerCase();
        const target = currentCat.toLowerCase();
        return cat.includes(target) || (p.name && p.name.toLowerCase().includes(target));
      });
    }

    // Graceful fallback: If category has no items, fall back to all products so grid is never empty!
    if (!filtered || filtered.length === 0) {
      filtered = state.products;
    }

    // Limit to 4 pieces for clean grid display + editorial card
    const displayList = (filtered || []).slice(0, 4);
    const isAr = state.activeLang === 'ar';

    const cardsHtml = displayList.map(product => {
      const priceFormatted = Number(product.price).toFixed(3) + ' JOD';
      const comparePriceFormatted = product.comparePrice ? Number(product.comparePrice).toFixed(3) + ' JOD' : null;
      const isSoldOut = typeof product.stock !== 'undefined' && product.stock !== null && Number(product.stock) <= 0;
      const mainImg = product.image || (product.images && product.images[0]) || '/assets/velen-boxy-black.jpg';
      const defaultColor = (product.colors && product.colors[0]?.name) || '';

      return `
        <div class="product-card" data-product-id="${product.id}" onclick="window.velenApp.openProductPage('${product.id}')">
          <div class="product-img-wrapper">
            <span class="product-card-badge-new">NEW</span>
            <button type="button" class="product-card-fav-btn" aria-label="Add ${product.name} to wishlist" onclick="event.stopPropagation(); this.classList.toggle('active');">
              <i class="fa-regular fa-heart"></i>
            </button>
            <img src="${mainImg}" alt="${product.name}" class="product-img" loading="lazy" onerror="this.onerror=null; this.src='/assets/velen-boxy-black.jpg';">
            ${!isSoldOut ? `
              <button type="button" class="btn-floating-bag" onclick="event.stopPropagation(); window.velenApp.openProductPage('${product.id}')" aria-label="Select size and add ${product.name} to bag" title="${isAr ? 'اختيار المقاس واللون' : 'Select Size & Color'}">
                <i class="fa-solid fa-bag-shopping"></i>
              </button>
            ` : `<span class="badge-soldout">${isAr ? 'نَفِذَت الكمية' : 'SOLD OUT'}</span>`}
          </div>
          <div class="product-info">
            <h3 class="product-title">${product.name}</h3>
            ${defaultColor ? `<span class="product-card-color-sub">${defaultColor}</span>` : ''}
            <div class="price-row">
              <span class="current-price">${priceFormatted}</span>
              ${comparePriceFormatted ? `<span class="strike-price">${comparePriceFormatted}</span>` : ''}
            </div>
            ${isSoldOut ? `<span class="stock-note-out">${isAr ? 'غير متوفر بالمخزون' : 'Out of Stock'}</span>` : ''}
          </div>
        </div>
      `;
    }).join('');

    // Editorial Card matching Image 2 "THE DETAILS MATTER"
    const editorialHtml = `
      <div class="product-editorial-card" onclick="window.velenApp.showView('shop')">
        <div class="editorial-media">
          <img src="/assets/velen-product-showcase.png" alt="VELEN - The Details Matter" class="editorial-cover-img" onerror="this.src='/assets/velen-hero-winter2026.png'">
          <div class="editorial-content-box">
            <h3 class="editorial-title">THE DETAILS<br>MATTER</h3>
            <button type="button" class="editorial-arrow-btn" aria-label="Explore the collection" title="View Collection">
              <i class="fa-solid fa-arrow-right"></i>
            </button>
          </div>
        </div>
      </div>
    `;

    grid.innerHTML = cardsHtml + editorialHtml;
  }

  // Live Order Tracking Lookup by Phone Number
  async function handleOrderLookup(e) {
    if (e && e.preventDefault) e.preventDefault();
    const input = document.getElementById('trackPhoneInput');
    const resultsContainer = document.getElementById('orderLookupResults');
    if (!input || !resultsContainer) return;

    const rawPhone = input.value.trim().replace(/\D/g, '');
    const isAr = state.activeLang === 'ar';

    if (!rawPhone.startsWith('07') || rawPhone.length !== 10) {
      showToast(isAr ? 'يرجى إدخال رقم هاتف أردني صحيح يبدأ بـ 07 (10 أرقام)' : 'Please enter a valid 10-digit Jordanian phone starting with 07', 'warning');
      return;
    }

    resultsContainer.style.display = 'block';
    resultsContainer.innerHTML = `
      <div class="order-loading-box">
        <i class="fa-solid fa-spinner fa-spin"></i>
        <span>${isAr ? 'جاري البحث عن طلباتك في النظام...' : 'Searching for your orders in our system...'}</span>
      </div>
    `;

    try {
      const res = await fetch('/api/orders');
      if (!res.ok) throw new Error('Failed to fetch orders');
      const allOrders = await res.json();
      const matched = (allOrders || []).filter(o => {
        const orderPhone = String(o.phone || o.customerPhone || '').replace(/\D/g, '');
        return orderPhone.endsWith(rawPhone.slice(-8));
      });

      if (matched.length === 0) {
        resultsContainer.innerHTML = `
          <div class="order-not-found-box">
            <i class="fa-solid fa-box-open"></i>
            <h4>${isAr ? 'لم يتم العثور على طلبات مرتبطة بهذا الرقم' : 'No Orders Found for This Number'}</h4>
            <p>${isAr ? 'تأكد من إدخال نفس الرقم المسجل أثناء إتمام الطلب، أو تواصل مع خدمة العملاء مباشرة عبر واتساب.' : 'Please check the mobile number used at checkout, or contact our customer support team directly on WhatsApp.'}</p>
            <a href="https://wa.me/962770188144?text=${encodeURIComponent('مرحباً، أود الاستفسار عن حالة طلبي لرقم الهاتف: ' + rawPhone)}" target="_blank" class="btn-wa-direct">
              <i class="fa-brands fa-whatsapp"></i> ${isAr ? 'تواصل معنا عبر واتساب' : 'Chat on WhatsApp'}
            </a>
          </div>
        `;
        return;
      }

      resultsContainer.innerHTML = `
        <div class="orders-matched-list">
          <h4 class="matched-title">${isAr ? `الطلبات المسجلة (${matched.length})` : `Found Orders (${matched.length})`}</h4>
          ${matched.map(ord => {
            const status = ord.status || 'pending';
            let statusBadge = '';
            if (status === 'completed' || status === 'delivered') {
              statusBadge = `<span class="badge-status delivered"><i class="fa-solid fa-circle-check"></i> ${isAr ? 'تم التسليم بنجاح' : 'Delivered'}</span>`;
            } else if (status === 'shipped' || status === 'out_for_delivery') {
              statusBadge = `<span class="badge-status out-delivery"><i class="fa-solid fa-truck-fast"></i> ${isAr ? 'مع المندوب للتوصيل' : 'Out for Delivery'}</span>`;
            } else {
              statusBadge = `<span class="badge-status pending"><i class="fa-solid fa-clock"></i> ${isAr ? 'قيد التجهيز والتغليف' : 'Processing'}</span>`;
            }

            const items = Array.isArray(ord.items) ? ord.items : [];
            const dateStr = ord.createdAt ? new Date(ord.createdAt).toLocaleDateString(isAr ? 'ar-JO' : 'en-US', { day:'numeric', month:'short', year:'numeric' }) : '';
            const totalF = Number(ord.total || 0).toFixed(3) + ' JOD';

            return `
              <div class="matched-order-card">
                <div class="order-card-top">
                  <div>
                    <span class="order-number-tag">#${ord.orderNumber || ord.id}</span>
                    <span class="order-date-tag">${dateStr}</span>
                  </div>
                  ${statusBadge}
                </div>
                <div class="order-card-items">
                  ${items.map(it => `
                    <div class="track-item-row">
                      <span>• ${it.name} ${it.size ? `(${it.size})` : ''} ${it.color ? `— ${it.color}` : ''} × ${it.qty || 1}</span>
                      <span class="track-item-price">${Number(it.price * (it.qty || 1)).toFixed(3)} JOD</span>
                    </div>
                  `).join('')}
                </div>
                <div class="order-card-footer">
                  <div class="order-dest">
                    <i class="fa-solid fa-location-dot"></i> ${ord.city || 'Amman'} — ${ord.address || ''}
                  </div>
                  <div class="order-total-highlight">
                    <span>${isAr ? 'المجموع:' : 'Total:'}</span> <strong>${totalF}</strong>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    } catch (err) {
      console.error(err);
      resultsContainer.innerHTML = `
        <div class="order-not-found-box">
          <i class="fa-solid fa-triangle-exclamation"></i>
          <h4>${isAr ? 'حدث خطأ أثناء الاتصال بالخادم' : 'Error connecting to server'}</h4>
          <p>${err.message}</p>
        </div>
      `;
    }
  }

  // ================= DATA FETCHING =================
  async function fetchSettings() {
    try {
      const res = await fetch('/api/settings');
      state.settings = await res.json();
      if (state.settings && state.settings.social) {
        applySocialLinks(state.settings.social);
      }
      if (typeof renderDynamicPolicies === 'function') renderDynamicPolicies();
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
      if (heroBg && design.hero.bgImage) {
        heroBg.src = design.hero.bgImage;
      }
      const brandName = document.getElementById('heroBrandName');
      if (brandName && design.hero.brandTitle) brandName.textContent = design.hero.brandTitle;
      const mainH = document.getElementById('heroMainHeading');
      if (mainH && design.hero.mainHeading) {
        mainH.textContent = design.hero.mainHeading;
        mainH.removeAttribute('data-i18n');
      }
      const tagline = document.getElementById('heroTagline');
      if (tagline && design.hero.subHeading) {
        tagline.textContent = design.hero.subHeading;
        tagline.removeAttribute('data-i18n');
      }
      const ctaBtn = document.getElementById('heroShopBtn');
      if (ctaBtn) {
        if (design.hero.ctaText) {
          ctaBtn.textContent = design.hero.ctaText;
          ctaBtn.removeAttribute('data-i18n');
        }
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

    // 5. Sections Visibility
    if (design.sectionsVisibility) {
      Object.keys(design.sectionsVisibility).forEach(secKey => {
        const secEl = document.getElementById(`sec-${secKey}`);
        if (secEl) {
          const isVisible = design.sectionsVisibility[secKey] !== false;
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

    // 9. Explore Hub Portal Cards (Screenshot 4)
    if (design.portalCards) {
      const pShop = document.getElementById('portalBgShop');
      if (pShop && design.portalCards.shopImage) pShop.src = design.portalCards.shopImage;
      const pStory = document.getElementById('portalBgStory');
      if (pStory && design.portalCards.storyImage) pStory.src = design.portalCards.storyImage;
      const pComm = document.getElementById('portalBgCommunity');
      if (pComm && design.portalCards.communityImage) pComm.src = design.portalCards.communityImage;
    }

    // 10. Checkout Upsell Special Offer (Screenshot 1)
    renderCheckoutUpsell();

    // Check Coming Soon Overlay
    initComingSoonTimer();
  }

  async function fetchProducts() {
    try {
      const res = await fetch('/api/products', { redirect: 'follow' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          state.products = data;
        }
      }
    } catch (err) {
      console.warn('Network fetchProducts failed, retaining active catalog:', err);
    }

    renderProducts();
    renderFeaturedProducts();
    populateProductSelect();

    // If page was loaded directly with #product-id URL, open product page now
    const hash = window.location.hash || '';
    if (hash.startsWith('#product-')) {
      const id = hash.replace('#product-', '');
      openProductPage(id, false);
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

  async function fetchReviews() {
    try {
      const res = await fetch('/api/reviews');
      state.reviews = await res.json();
      renderReviewsSection();
    } catch (err) {
      console.error('Error fetching reviews:', err);
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, m => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[m]);
  }

  async function fetchCategories() {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        state.categories = await res.json();
        renderCategoryTabs();
      }
    } catch (err) {
      console.warn('Error fetching categories:', err);
    }
  }

  function renderCategoryTabs() {
    const tabsContainer = document.getElementById('categoryTabs');
    if (!tabsContainer) return;
    if (!Array.isArray(state.categories) || state.categories.length === 0) return;

    const isAr = state.activeLang === 'ar';
    const allLabel = isAr ? 'جميع القطع' : 'All Pieces';

    let html = `<button class="cat-pill ${state.activeCategory === 'all' ? 'active' : ''}" data-cat="all">${allLabel}</button>`;

    state.categories.forEach(cat => {
      const label = isAr ? (cat.nameAr || cat.nameEn) : (cat.nameEn || cat.nameAr);
      const targetVal = cat.nameEn || cat.id;
      const isActive = state.activeCategory === targetVal || state.activeCategory === cat.id;
      html += `<button class="cat-pill ${isActive ? 'active' : ''}" data-cat="${escapeHtml(targetVal)}">${escapeHtml(label)}</button>`;
    });

    tabsContainer.innerHTML = html;

    tabsContainer.querySelectorAll('.cat-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        tabsContainer.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        state.activeCategory = pill.getAttribute('data-cat');
        renderProducts();
      });
    });
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
    } else if (event === 'REVIEW_ADDED') {
      if (!state.reviews) state.reviews = [];
      state.reviews.unshift(payload);
      renderReviewsSection();
    } else if (event === 'COMMUNITY_LIKED') {
      const item = state.community.find(c => c.id === payload.id);
      if (item) {
        item.likes = payload.likes;
        const likeCountEl = document.querySelector(`[data-like-id="${payload.id}"] .count`);
        if (likeCountEl) likeCountEl.textContent = payload.likes;
      }
    } else if (event === 'SETTINGS_UPDATED') {
      state.settings = { ...state.settings, ...payload };
      if (payload.announcement) {
        const annText = document.getElementById('announcementText');
        if (annText) annText.textContent = payload.announcement;
      }
      if (typeof renderDynamicPolicies === 'function') {
        renderDynamicPolicies();
      }
    } else if (event === 'DESIGN_UPDATED') {
      applyDesign(payload);
      showToast('تم تحديث مظهر وترتيب المتجر مباشرة من الأدمن!', 'info');
    } else if (event === 'CATEGORIES_UPDATED') {
      fetchCategories();
    }
  }

  // ================= RENDER PRODUCTS (Matching Screenshot 2) =================
  function renderProducts() {
    if (!productsGrid) return;

    let filtered = state.products;
    if (state.activeCategory && state.activeCategory !== 'all') {
      const activeCat = (state.categories || []).find(c => 
        (c.id && c.id.toLowerCase() === state.activeCategory.toLowerCase()) || 
        (c.nameEn && c.nameEn.toLowerCase() === state.activeCategory.toLowerCase()) ||
        c.nameAr === state.activeCategory
      );
      const catId = (activeCat?.id || '').toLowerCase();
      const catEn = (activeCat?.nameEn || state.activeCategory).toLowerCase();
      const catAr = (activeCat?.nameAr || '').toLowerCase();

      filtered = state.products.filter(p => {
        const pCat = (p.category || '').toLowerCase();
        const pName = (p.name || '').toLowerCase();
        return pCat === catEn || 
               pCat === catId || 
               (catId && pCat.includes(catId)) || 
               (catEn && pCat.includes(catEn)) || 
               (catEn && pName.includes(catEn)) ||
               (catAr && (pCat.includes(catAr) || pName.includes(catAr)));
      });
    }

    if (filtered.length === 0) {
      const emptyMsg = state.activeLang === 'ar'
        ? (translations.ar?.noProductsInCategory || 'لا توجد قطع متاحة في هذا التصنيف حالياً.')
        : (translations.en?.noProductsInCategory || 'No pieces available in this category currently.');
      productsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 48px 20px; color: #888;">
          <p style="font-size: 15px; letter-spacing: 0.5px;">${emptyMsg}</p>
        </div>
      `;
      return;
    }

    productsGrid.innerHTML = filtered.map(product => {
      const priceFormatted = Number(product.price).toFixed(3) + ' JOD';
      const comparePriceFormatted = product.comparePrice ? Number(product.comparePrice).toFixed(3) + ' JOD' : null;
      const isAr = state.activeLang === 'ar';
      const isSoldOut = typeof product.stock !== 'undefined' && product.stock !== null && Number(product.stock) <= 0;
      const mainImg = product.image || (product.images && product.images[0]) || '/assets/velen-boxy-black.jpg';

      return `
        <div class="product-card" data-product-id="${product.id}">
          <div class="product-img-wrapper" onclick="window.velenApp.openProductModal('${product.id}')">
            ${isSoldOut ? `<span class="badge-soldout" style="position:absolute; top:12px; right:12px; background:rgba(231,76,60,0.92); color:#fff; font-size:11px; font-weight:700; padding:4px 8px; border-radius:4px; z-index:2; letter-spacing:0.5px;">${isAr ? 'نَفِذَت الكمية' : 'SOLD OUT'}</span>` : (product.onSale ? '<span class="badge-sale">SALE</span>' : '')}
            <img src="${mainImg}" alt="${product.name}" class="product-img" loading="lazy" onerror="this.onerror=null; this.src='/assets/velen-boxy-black.jpg';">
            ${!isSoldOut ? `
              <button class="btn-floating-bag" onclick="event.stopPropagation(); window.velenApp.quickAddToCart('${product.id}')" title="${isAr ? 'اختيار المقاس واللون' : 'Select Size & Color'}" aria-label="Select Size & Color">
                <i class="fa-solid fa-cart-plus"></i>
              </button>
            ` : ''}
          </div>
          <div class="product-info" onclick="window.velenApp.openProductModal('${product.id}')">
            <h3 class="product-title">${product.name}</h3>
            <div class="price-row">
              <span class="current-price">${priceFormatted}</span>
              ${comparePriceFormatted ? `<span class="strike-price">${comparePriceFormatted}</span>` : ''}
            </div>
            ${isSoldOut ? `<span style="font-size:11px; color:#e74c3c; font-weight:600; display:block; margin-top:3px;">${isAr ? 'غير متوفر حالياً بالمخزون' : 'Currently Out of Stock'}</span>` : ''}
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

  // Render the Community Grid — Pure social sharing, no rating shown
  function renderCommunity() {
    if (!communityGrid) return;

    let filtered = state.community;
    if (state.activeCommFilter === 'video') {
      filtered = state.community.filter(c => c.mediaType === 'video' || c.videoUrl);
    }

    if (filtered.length === 0) {
      communityGrid.innerHTML = `
        <div style="text-align:center; padding:40px; color:#666;">
          <i class="fa-brands fa-instagram" style="font-size:32px; margin-bottom:12px; display:block; color:#e1306c;"></i>
          <p style="font-size:14px;">كن أول من يشارك إطلالته مع مجتمع Velen!</p>
        </div>
      `;
      return;
    }

    communityGrid.innerHTML = filtered.map(item => {
      const hasMedia = Boolean(item.mediaUrl) && item.mediaType !== 'text';
      const isVideo = hasMedia && (item.mediaType === 'video' || item.videoUrl);

      return `
        <div class="comm-card" data-comm-id="${item.id}">
          ${hasMedia ? `
          <div class="comm-media-wrap">
            ${isVideo ? `
              <video src="${item.videoUrl || item.mediaUrl}" poster="${item.mediaUrl || '/assets/velen-logo.jpg'}" loop muted playsinline autoplay onerror="this.style.display='none';"></video>
              <button class="comm-sound-btn" onclick="window.velenApp.toggleVideoSound(this)" title="كتم/تشغيل الصوت">
                <i class="fa-solid fa-volume-xmark"></i>
              </button>
            ` : `
              <img src="${item.mediaUrl}" alt="${item.author} Velen Fit" loading="lazy" onerror="this.onerror=null; this.src='/assets/velen-logo.jpg';">
            `}
          </div>
          ` : ''}

          <div class="comm-content">
            <div class="comm-user-row">
              <div class="comm-author-info">
                <div class="comm-avatar" style="background:#1a1a1a; display:flex; align-items:center; justify-content:center; color:#e1306c;">
                  <i class="fa-brands fa-instagram"></i>
                </div>
                <div>
                  <span class="comm-author-name">${item.author}</span>
                  ${item.authorTag ? `<span style="font-size:10px; color:#888; display:block;">${item.authorTag}</span>` : ''}
                </div>
              </div>
              <button class="comm-like-btn" data-like-id="${item.id}" onclick="window.velenApp.likeCommunityPost('${item.id}')">
                <i class="fa-regular fa-heart"></i>
                <span class="count">${item.likes || 0}</span>
              </button>
            </div>

            ${item.comment ? `<p class="comm-comment">"${item.comment}"</p>` : ''}

            <div class="comm-footer">
              <span style="color:#888; font-size:11px;"><i class="fa-solid fa-location-dot"></i> الأردن 🇯🇴</span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // Render the dedicated Reviews Section
  function renderReviewsSection() {
    const grid = document.getElementById('reviewsGrid');
    const scoreEl = document.getElementById('reviewsScore');
    const countEl = document.getElementById('reviewsCount');
    const starsEl = document.getElementById('reviewsStarsDisplay');
    if (!grid) return;

    const reviews = state.reviews || [];

    if (reviews.length > 0) {
      const avgRating = reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / reviews.length;
      if (scoreEl) scoreEl.textContent = avgRating.toFixed(1);
      if (countEl) countEl.textContent = `(${reviews.length} ${state.activeLang === 'ar' ? 'تقييم' : 'reviews'})`;
      if (starsEl) {
        const fullStars = Math.round(avgRating);
        starsEl.textContent = '★'.repeat(fullStars) + '☆'.repeat(5 - fullStars);
      }
    }

    if (reviews.length === 0) {
      grid.innerHTML = `
        <div style="grid-column:1/-1; text-align:center; padding:48px; color:#555;">
          <i class="fa-solid fa-star" style="font-size:32px; margin-bottom:12px; display:block; color:#e5b95f44;"></i>
          <p>كن أول من يقيّم منتجات Velen ويشارك تجربته!</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = reviews.map(rev => {
      const initials = (rev.author || 'V')[0].toUpperCase();
      const stars = '★'.repeat(Math.min(5, Math.max(1, rev.rating || 5)));
      const dateStr = rev.createdAt ? new Date(rev.createdAt).toLocaleDateString('ar-JO', { month: 'short', day: 'numeric' }) : '';
      return `
        <div class="review-card">
          <div class="review-card-header">
            <div class="review-author-info">
              <div class="review-avatar">${initials}</div>
              <div>
                <div class="review-author-name">${rev.author}</div>
                <div class="review-item-tag">${rev.itemWorn || 'Velen Essential'}</div>
              </div>
            </div>
            <span class="review-date">${dateStr}</span>
          </div>
          <div class="review-stars">${stars}</div>
          <p class="review-comment">"${rev.comment}"</p>
          <div class="review-verified-badge"><i class="fa-solid fa-circle-check"></i> ${rev.verified ? 'مشترٍ موثق' : 'تقييم معتمد'}</div>
        </div>
      `;
    }).join('');
  }

  // ================= CART MANAGEMENT & STOCK ENFORCEMENT =================
  // Helper to determine accurate maximum stock for a cart item based on color/size inventory
  function getCartItemMaxStock(item) {
    if (!item || !item.id) return 99;
    if (String(item.id).startsWith('upsell_')) return 10;

    const product = state.products.find(p => p.id === item.id);
    if (!product) return 99;

    // 1. If item has a specific color, check if that color variant has sizeInventory
    if (item.color && Array.isArray(product.colors)) {
      const col = product.colors.find(c => (typeof c === 'object' ? c.name : c) === item.color);
      if (col && col.sizeInventory && typeof col.sizeInventory[item.size] !== 'undefined') {
        const val = Number(col.sizeInventory[item.size]);
        return isNaN(val) ? 99 : Math.max(0, val);
      }
    }

    // 2. Check product-level sizeInventory
    if (product.sizeInventory && typeof product.sizeInventory[item.size] !== 'undefined') {
      const val = Number(product.sizeInventory[item.size]);
      return isNaN(val) ? 99 : Math.max(0, val);
    }

    // 3. Check overall product stock
    if (typeof product.stock !== 'undefined' && product.stock !== null) {
      const val = Number(product.stock);
      return isNaN(val) ? 99 : Math.max(0, val);
    }

    return 99;
  }

  function addToCart(product, size = 'M', quantity = 1, color = null) {
    const isAr = state.activeLang === 'ar';
    const colorObj = color || (product.colors && product.colors[0]) || null;
    const colorName = colorObj ? (typeof colorObj === 'object' ? colorObj.name : colorObj) : '';
    const colorHex = colorObj && typeof colorObj === 'object' ? colorObj.hex : '';
    const itemImage = (colorObj && colorObj.images && colorObj.images[0]) || product.image || '/assets/velen-logo.jpg';

    const maxStock = getCartItemMaxStock({ id: product.id, size, color: colorName });
    if (maxStock <= 0) {
      showToast(isAr ? `عذراً، المقاس (${size}) نَفِذَ من المخزون حالياً!` : `Sorry, size (${size}) is currently out of stock!`, 'warning');
      return;
    }

    const existingIndex = state.cart.findIndex(
      item => item.id === product.id && item.size === size && (item.color || '') === colorName
    );

    if (existingIndex > -1) {
      const currentQty = state.cart[existingIndex].quantity;
      if (currentQty >= maxStock) {
        showToast(isAr ? `حقيبتك تحتوي بالفعل على أقصى كمية متوفرة في المخزون (${maxStock} قطع).` : `Your bag already has the maximum available stock (${maxStock} pieces).`, 'warning');
        openCart();
        return;
      }
      const newQty = Math.min(currentQty + quantity, maxStock);
      state.cart[existingIndex].quantity = newQty;
      if (currentQty + quantity > maxStock) {
        showToast(isAr ? `تم تحديد الكمية بالحد الأقصى المتوفر (${maxStock} قطع).` : `Quantity capped at available stock (${maxStock}).`, 'info');
      }
    } else {
      const addQty = Math.min(quantity, maxStock);
      state.cart.push({
        id: product.id,
        name: product.name,
        price: Number(product.price),
        image: itemImage,
        size: size,
        color: colorName,
        colorHex: colorHex,
        quantity: addQty
      });
    }

    saveCart();
    updateCartUI();
    openCart();
    const itemDesc = `${product.name} (${size}${colorName ? ` - ${colorName}` : ''})`;
    showToast(isAr ? `تمت إضافة "${itemDesc}" إلى حقيبة التسوق!` : `Added "${itemDesc}" to your bag!`, 'success');
  }

  function openCart() {
    cartDrawer.classList.add('open');
    cartOverlay.classList.add('active');
    lockBodyScroll();
    state.currentStage = 'cart';
    const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    sendVisitorPulse('cart', `${totalItems} items (${subtotal.toFixed(3)} JOD)`);
  }

  function closeCart() {
    cartDrawer.classList.remove('open');
    cartOverlay.classList.remove('active');
    unlockBodyScroll();
    state.currentStage = state.activeView || 'home';
  }

  function updateCartQuantity(index, delta) {
    if (!state.cart[index]) return;
    const item = state.cart[index];
    const isAr = state.activeLang === 'ar';
    const maxStock = getCartItemMaxStock(item);

    if (delta > 0) {
      if (item.quantity >= maxStock) {
        showToast(
          isAr
            ? `عذراً، أقصى كمية متوفرة في المخزون لهذا المقاس هي ${maxStock} قطع فقط.`
            : `Sorry, maximum available stock for this size is ${maxStock} pieces.`,
          'warning'
        );
        return;
      }
    }

    item.quantity += delta;
    if (item.quantity <= 0) {
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

    cartItemsList.innerHTML = state.cart.map((item, idx) => {
      const maxStock = getCartItemMaxStock(item);
      const isAtMax = item.quantity >= maxStock;
      const isAr = state.activeLang === 'ar';

      return `
        <div class="cart-item">
          <img src="${item.image || '/assets/velen-logo.jpg'}" class="cart-item-img" alt="${item.name}" onerror="this.onerror=null; this.src='/assets/velen-boxy-black.jpg';">
          <div class="cart-item-details">
            <div>
              <h4 class="cart-item-title">${item.name}</h4>
              <div class="cart-item-meta">
                <span>المقاس: <strong>${item.size}</strong></span>
                ${item.color ? ` • <span>اللون: <strong style="color:var(--accent-gold);">${item.color}</strong></span>` : ''}
              </div>
              ${maxStock < 50 ? `<span style="font-size:11px; color:${isAtMax ? '#e74c3c' : '#888'}; display:block; margin-top:2px;">${isAr ? `(المتوفر بالستوك: ${maxStock})` : `(In stock: ${maxStock})`}</span>` : ''}
            </div>
            <div class="cart-item-bottom">
              <div class="cart-item-qty">
                <button onclick="window.velenApp.updateCartQty(${idx}, -1)">-</button>
                <span>${item.quantity}</span>
                <button onclick="window.velenApp.updateCartQty(${idx}, 1)" ${isAtMax ? 'disabled style="opacity:0.25; cursor:not-allowed;" title="أقصى كمية متوفرة بالستوك"' : ''}>+</button>
              </div>
              <span class="cart-item-price">${(item.price * item.quantity).toFixed(3)} JOD</span>
            </div>
          </div>
        </div>
      `;
    }).join('');
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

    // Initialize product color
    const colors = Array.isArray(product.colors) && product.colors.length > 0 ? product.colors : null;
    state.selectedColor = (colors && colors[0]) || null;

    renderProductPageContent(product);

    const homeView = document.getElementById('homeView');
    const prodPage = document.getElementById('productPage');
    if (homeView) homeView.style.display = 'none';
    if (prodPage) prodPage.style.display = 'block';

    const crumb = document.getElementById('prodPageCrumbTitle');
    if (crumb) crumb.textContent = product.name;

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
    const prodPage = document.getElementById('productPage');
    if (prodPage) prodPage.style.display = 'none';

    const homeView = document.getElementById('homeView');
    if (homeView) homeView.style.display = 'block';

    const targetView = state.activeView || 'shop';
    showView(targetView, updateHistory);
  }

  function renderSizeBoxesForColor(product, color) {
    if (!product) return;
    const isAr = state.activeLang === 'ar';
    const dict = translations[state.activeLang] || translations.en;

    // Check if color has dedicated sizes or sizeInventory
    let sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
    let sizeInv = null;

    if (color && color.sizeInventory && Object.keys(color.sizeInventory).length > 0) {
      sizeInv = color.sizeInventory;
      sizes = Array.isArray(color.sizes) && color.sizes.length > 0 ? color.sizes : Object.keys(color.sizeInventory);
    } else if (product.sizeInventory && Object.keys(product.sizeInventory).length > 0) {
      sizeInv = product.sizeInventory;
      sizes = Array.isArray(product.sizes) && product.sizes.length > 0 ? product.sizes : Object.keys(product.sizeInventory);
    } else if (Array.isArray(product.sizes) && product.sizes.length > 0) {
      sizes = product.sizes;
    }

    // Check if current state.selectedSize is valid and in stock
    const isAvailable = (s) => !sizeInv || (typeof sizeInv[s] !== 'undefined' ? sizeInv[s] > 0 : true);
    if (!sizes.includes(state.selectedSize) || !isAvailable(state.selectedSize)) {
      const firstInStock = sizes.find(s => isAvailable(s));
      state.selectedSize = firstInStock || sizes[0] || 'M';
    }

    const sizeLabel = document.getElementById('prodSelectedSizeLabel');
    if (sizeLabel) sizeLabel.textContent = state.selectedSize;

    const allOutOfStock = sizeInv ? sizes.every(s => typeof sizeInv[s] !== 'undefined' && sizeInv[s] <= 0) : false;
    const addBtn = document.getElementById('btnPageAddToBag');
    const buyBtn = document.getElementById('btnPageBuyNow');
    if (addBtn) {
      addBtn.disabled = allOutOfStock;
      const span = addBtn.querySelector('span');
      if (span) span.textContent = allOutOfStock ? dict.soldOut : dict.addToBag;
    }
    if (buyBtn) {
      buyBtn.disabled = allOutOfStock;
      const span = buyBtn.querySelector('span');
      if (span) span.textContent = isAr ? 'اشتريها الآن ⚡' : 'Buy Now ⚡';
    }

    const sizeBoxesContainer = document.getElementById('pageProductSizeBoxes');
    if (sizeBoxesContainer) {
      sizeBoxesContainer.innerHTML = sizes.map(size => {
        const qty = sizeInv ? (typeof sizeInv[size] !== 'undefined' ? sizeInv[size] : 99) : 99;
        const isOutOfStock = qty <= 0;
        const isSelected = size === state.selectedSize;

        if (isOutOfStock) {
          return `
            <button type="button" class="prod-size-box out-of-stock" disabled title="${dict.soldOut || 'Sold out'}">
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
      }).join('');
    }
  }

  let currentProductImageIdx = 0;

  function renderProductPageContent(product) {
    const container = document.getElementById('productPageDetails');
    if (!container || !product) return;

    const isAr = state.activeLang === 'ar';
    const dict = translations[state.activeLang] || translations.en;
    const priceFormatted = Number(product.price).toFixed(3) + ' JOD';
    const comparePriceFormatted = product.comparePrice ? Number(product.comparePrice).toFixed(3) + ' JOD' : null;
    const sizes = product.sizes || ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

    // Colors processing
    const colors = Array.isArray(product.colors) && product.colors.length > 0 
      ? product.colors 
      : [{ 
          name: isAr ? 'اللون الأساسي' : 'Standard', 
          hex: '#111111', 
          images: Array.isArray(product.images) && product.images.length > 0 ? product.images : [product.image || '/assets/velen-logo.jpg'] 
        }];

    let activeColorIdx = 0;
    if (state.selectedColor) {
      const foundIdx = colors.findIndex(c => c.name === state.selectedColor.name);
      if (foundIdx !== -1) activeColorIdx = foundIdx;
    }
    state.selectedColor = colors[activeColorIdx];

    // Current gallery images for the selected color
    const currentImages = (state.selectedColor.images && state.selectedColor.images.length > 0)
      ? state.selectedColor.images
      : (Array.isArray(product.images) && product.images.length > 0 ? product.images : [product.image || '/assets/velen-logo.jpg']);

    currentProductImageIdx = 0;

    container.innerHTML = `
      <!-- Breadcrumb Bar matching Image 1 & 3 -->
      <div class="product-page-breadcrumb" aria-label="Breadcrumb">
        <span class="crumb-link" onclick="window.velenApp.closeProductPage()">${isAr ? 'المتجر' : 'SHOP'}</span>
        <span class="crumb-sep">»</span>
        <span class="crumb-link" onclick="window.velenApp.closeProductPage()">${(product.category || 'SWEATSHIRTS').toUpperCase()}</span>
        <span class="crumb-sep">»</span>
        <span class="crumb-active">${product.name.toUpperCase()}</span>
      </div>

      <!-- Main Desktop & Mobile Product Layout -->
      <div class="product-page-main-layout">
        <!-- Left: Gallery Section -->
        <div class="product-gallery-section">
          <!-- Desktop Vertical Thumbnail Strip (Image 1) -->
          <div class="product-vertical-thumbs" id="productVerticalThumbs">
            ${currentImages.slice(0, 6).map((imgUrl, i) => `
              <button type="button" class="vert-thumb-btn ${i === 0 ? 'active' : ''}" onclick="window.velenApp.switchProductPageImage('${imgUrl}', this)" aria-label="Thumbnail ${i + 1}">
                <img src="${imgUrl}" alt="${product.name} view ${i + 1}" loading="lazy" onerror="this.src='/assets/velen-logo.jpg'">
              </button>
            `).join('')}
          </div>

          <!-- Main Image Showcase Frame -->
          <div class="product-main-showcase">
            <!-- Brand Watermark top-left (Image 1) -->
            <div class="product-brand-watermark">
              <span class="watermark-v">V</span>
              <span class="watermark-velen">VELEN</span>
            </div>

            <!-- Mobile Carousel Counter (Image 3: "1 / 7") -->
            <div class="mobile-carousel-counter" id="mobileCarouselCounter">
              <span id="pageCarouselIndex">1</span> / <span id="pageCarouselTotal">${currentImages.length}</span>
            </div>

            <!-- Mobile Zoom Icon top-right (Image 3) -->
            <button type="button" class="mobile-zoom-btn" onclick="window.velenApp.zoomProductImage()" aria-label="Zoom image">
              <i class="fa-solid fa-magnifying-glass-plus"></i>
            </button>

            <!-- Main Display Image -->
            <img id="pageProductMainImg" src="${currentImages[0]}" alt="${product.name}" class="product-hero-image" onerror="this.src='/assets/velen-logo.jpg'">

            <!-- Desktop Expand button bottom-right (Image 1) -->
            <button type="button" class="desktop-expand-btn" onclick="window.velenApp.zoomProductImage()" aria-label="Expand image view" title="Expand view">
              <i class="fa-solid fa-up-right-and-down-left-from-center"></i>
            </button>

            <!-- Mobile Navigation Arrows (Image 3) -->
            <button type="button" class="carousel-arrow-btn prev" onclick="window.velenApp.prevProductPageImage()" aria-label="Previous image">
              <i class="fa-solid fa-chevron-left"></i>
            </button>
            <button type="button" class="carousel-arrow-btn next" onclick="window.velenApp.nextProductPageImage()" aria-label="Next image">
              <i class="fa-solid fa-chevron-right"></i>
            </button>

            <!-- Mobile Model Info Pill (Image 3: "Model: 186 cm, 77 kg | Wearing Size: L") -->
            <div class="product-model-stats-pill">
              <i class="fa-regular fa-user"></i>
              <span>Model: 186 cm, 77 kg | Wearing Size: L</span>
            </div>
          </div>

          <!-- Mobile Horizontal Thumbnail Strip (Image 3) -->
          <div class="product-mobile-thumbs-strip" id="productMobileThumbs">
            ${currentImages.map((imgUrl, i) => `
              <button type="button" class="mobile-thumb-item ${i === 0 ? 'active' : ''}" onclick="window.velenApp.switchProductPageImage('${imgUrl}', this)" aria-label="Image ${i + 1}">
                <img src="${imgUrl}" alt="${product.name} ${i + 1}" loading="lazy" onerror="this.src='/assets/velen-logo.jpg'">
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Right: Details Section -->
        <div class="product-details-section">
          <div class="product-subtitle-tag">${(product.category || 'SWEATSHIRTS').toUpperCase()} » WINTER 2026</div>
          <h1 class="product-main-title">${product.name}</h1>
          <div class="product-price-box">
            <span class="price-val">${priceFormatted}</span>
            ${comparePriceFormatted ? `<span class="strike-val">${comparePriceFormatted}</span>` : ''}
          </div>

          <!-- Color Selector matching Image 1 & 3 (Circles with labels below) -->
          <div class="product-color-group">
            <div class="color-head-label">
              <span>Color: <strong id="prodSelectedColorName">${state.selectedColor.name}</strong></span>
            </div>
            <div class="color-swatches-row" id="pageProductColorSwatches">
              ${colors.map((c, i) => {
                const isSelected = i === activeColorIdx;
                return `
                  <button type="button" class="color-swatch-circle-wrap ${isSelected ? 'active' : ''}" onclick="window.velenApp.selectProductColor(${i})" aria-label="Select color ${c.name}">
                    <span class="swatch-circle-dot" style="background-color: ${c.hex || '#111'};"></span>
                    <span class="swatch-circle-text">${c.name}</span>
                  </button>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Size Selector with [Find My Size] pill button (Image 1 & 3) -->
          <div class="product-size-group">
            <div class="size-head-row">
              <span class="size-head-text">Size: <strong id="prodSelectedSizeLabel">${state.selectedSize}</strong></span>
              <button type="button" class="btn-find-my-size-pill" onclick="window.velenApp.openSizeAssistant()" aria-label="Open VELEN Size Assistant">
                <i class="fa-solid fa-ruler-horizontal"></i>
                <span>Find My Size</span>
              </button>
            </div>
            <div class="size-boxes-row" id="pageProductSizeBoxes">
              <!-- Rendered dynamically -->
            </div>
          </div>

          <!-- Dual CTAs: ADD TO BAG & BUY NOW (Image 1 & 3) -->
          <div class="product-cta-dual-row">
            <button type="button" class="btn-add-to-bag-primary" id="btnPageAddToBag" onclick="window.velenApp.addCurrentModalToCart()" aria-label="Add ${product.name} to shopping bag">
              <i class="fa-solid fa-bag-shopping"></i>
              <span>ADD TO BAG</span>
            </button>
            <button type="button" class="btn-buy-now-primary" id="btnPageBuyNow" onclick="window.velenApp.buyNowDirect()" aria-label="Buy ${product.name} now">
              <i class="fa-solid fa-bolt"></i>
              <span>BUY NOW</span>
            </button>
          </div>

          <!-- Feature Icons Row (Image 3: Heavyweight Cotton, Breathable & Warm, Practical Pockets, Relaxed Straight Fit) -->
          <div class="product-features-pills-row">
            <div class="feat-pill-item">
              <i class="fa-solid fa-leaf"></i>
              <span>Heavyweight Cotton</span>
            </div>
            <div class="feat-pill-item">
              <i class="fa-solid fa-wind"></i>
              <span>Breathable & Warm</span>
            </div>
            <div class="feat-pill-item">
              <i class="fa-solid fa-box-archive"></i>
              <span>Practical Pockets</span>
            </div>
            <div class="feat-pill-item">
              <i class="fa-solid fa-arrows-up-down-left-right"></i>
              <span>Relaxed Straight Fit</span>
            </div>
          </div>

          <!-- Description paragraph with standardized 70% Premium Cotton (No polyester) -->
          <div class="product-description-block">
            <p>${product.description || 'A relaxed streetwear essential crafted from luxury heavyweight cotton. Fabric: 70% Premium Cotton'}</p>
          </div>

          <!-- Collapsible Accordions (Image 1 & 3) -->
          <div class="product-accordions-wrap">
            <!-- Accordion 1: Product Details -->
            <div class="product-accordion-item">
              <button type="button" class="accordion-trigger" onclick="window.velenApp.toggleAccordion(this)" aria-expanded="false">
                <span>PRODUCT DETAILS</span>
                <i class="fa-solid fa-chevron-down accordion-arrow"></i>
              </button>
              <div class="accordion-body">
                <p>• <strong>Fabric:</strong> 70% Premium Cotton (Heavyweight combed weave for warmth & longevity).</p>
                <p>• <strong>Hardware:</strong> Custom two-way metal zipper engineered for seamless styling from both ends.</p>
                <p>• <strong>Design:</strong> Clean hood construction, dropped shoulders, and deep front hand pockets.</p>
                <p>• <strong>Craftsmanship:</strong> Designed and finished with pride in Amman, Jordan.</p>
              </div>
            </div>

            <!-- Accordion 2: Size & Fit -->
            <div class="product-accordion-item">
              <button type="button" class="accordion-trigger" onclick="window.velenApp.toggleAccordion(this)" aria-expanded="false">
                <span>SIZE & FIT</span>
                <i class="fa-solid fa-chevron-down accordion-arrow"></i>
              </button>
              <div class="accordion-body">
                <p>• <strong>Model Info:</strong> Height 186 cm, Weight 77 kg — Wearing Size L.</p>
                <p>• <strong>Silhouette:</strong> Relaxed boxy streetwear fit designed for everyday comfort.</p>
                <p>• <strong>Recommendation:</strong> True to size for a relaxed drape. Click <em>Find My Size</em> above for precision sizing.</p>
              </div>
            </div>

            <!-- Accordion 3: Delivery & Returns (Standardized Policy) -->
            <div class="product-accordion-item">
              <button type="button" class="accordion-trigger" onclick="window.velenApp.toggleAccordion(this)" aria-expanded="false">
                <span>DELIVERY & RETURNS</span>
                <i class="fa-solid fa-chevron-down accordion-arrow"></i>
              </button>
              <div class="accordion-body">
                <p>• <strong>Delivery in Amman:</strong> Free delivery (takes up to 24 hours).</p>
                <p>• <strong>Delivery outside Amman:</strong> 1 JOD delivery fee (takes up to 48 hours).</p>
                <p>• <strong>Payment Methods:</strong> Cash on Delivery (COD) and instant CliQ only.</p>
                <p>• <strong>Exchange & Return Policy:</strong> Accepted only for manufacturing defects, damaged items, or incorrect product received. Contact VELEN with photos for instant assistance.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Visual Gallery Shelves Grouped by Color (Image 1) -->
      <div class="product-color-shelves-container">
        ${colors.map((col, cIdx) => {
          const colImgs = (col.images && col.images.length > 0) ? col.images : [currentImages[0]];
          return `
            <div class="color-shelf-row">
              <div class="color-shelf-header">
                <span class="color-shelf-pill-tag">${col.name}</span>
              </div>
              <div class="color-shelf-tiles">
                ${colImgs.slice(0, 6).map((imgUrl, i) => `
                  <div class="shelf-tile-item" onclick="window.velenApp.selectProductColor(${cIdx}); window.velenApp.switchProductPageImage('${imgUrl}')" role="button" tabindex="0" aria-label="View ${col.name} angle ${i + 1}">
                    <img src="${imgUrl}" alt="${product.name} - ${col.name} ${i + 1}" loading="lazy" onerror="this.src='/assets/velen-logo.jpg'">
                  </div>
                `).join('')}
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <!-- Customer Reviews Section (Clean & Verified - No Fake Bars/Percentages) -->
      <section class="prod-reviews-clean-section" id="productReviewsSection">
        <div class="reviews-clean-head">
          <div>
            <h2 class="reviews-clean-title">
              ${isAr ? 'تقييمات وآراء العملاء' : 'Customer Reviews & Feedback'}
              <span class="verified-tag"><i class="fa-solid fa-circle-check"></i> ${isAr ? 'تقييمات موثقة' : 'Verified Reviews'}</span>
            </h2>
            <p class="reviews-clean-desc">${isAr ? 'آراء المشترين الحقيقية حول جودة القماش والمقاس' : 'Authentic feedback on Premium Cotton fabric and streetwear fit'}</p>
          </div>
          <button type="button" class="btn-write-review-clean" onclick="window.velenApp.toggleReviewForm('${product.id}')" aria-label="Write a review">
            <i class="fa-solid fa-pen"></i> ${isAr ? 'كتابة تقييم' : 'Write a Review'}
          </button>
        </div>

        <!-- Collapsible Review Form -->
        <div class="write-review-drawer" id="writeReviewFormWrap" style="display:none;">
          <form id="productReviewForm" onsubmit="window.velenApp.submitProductReview(event, '${product.id}')">
            <h4>${isAr ? 'إضافة تقييم جديد لهذه القطعة' : 'Add your review for this piece'}</h4>
            <div class="review-form-grid">
              <div class="form-group">
                <label>${isAr ? 'الاسم أو اللقب *' : 'Your Name *'}</label>
                <input type="text" id="revAuthor" required placeholder="${isAr ? 'مثال: زيد خ.' : 'e.g. Zaid K.'}">
              </div>
              <div class="form-group">
                <label>${isAr ? 'التقييم من 5 نجوم *' : 'Rating (1 to 5 Stars) *'}</label>
                <select id="revRating">
                  <option value="5">★★★★★ (5 نجوم - ممتاز جداً)</option>
                  <option value="4">★★★★☆ (4 نجوم - جيد جداً)</option>
                  <option value="3">★★★☆☆ (3 نجوم - مقبول)</option>
                </select>
              </div>
              <div class="form-group">
                <label>${isAr ? 'المقاس الذي اشتريته' : 'Size Purchased'}</label>
                <select id="revSize">
                  ${sizes.map(s => `<option value="${s}" ${s === state.selectedSize ? 'selected' : ''}>${s}</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label>${isAr ? 'رأيك بملاءمة المقاس' : 'Fit Feedback'}</label>
                <select id="revFit">
                  <option value="True to size">${isAr ? 'مطابق للمقاس تماماً' : 'True to size'}</option>
                  <option value="Runs slightly large">${isAr ? 'أكبر قليلاً' : 'Runs slightly large'}</option>
                  <option value="Runs slightly small">${isAr ? 'أصغر قليلاً' : 'Runs slightly small'}</option>
                </select>
              </div>
            </div>
            <div class="form-group" style="margin-top:12px;">
              <label>${isAr ? 'تجربتك مع خامة القطن والمقاس *' : 'Your Experience with Fabric & Fit *'}</label>
              <textarea id="revComment" rows="3" required placeholder="${isAr ? 'صف ملمس القماش، ثقل القطن، وسرعة التوصيل...' : 'Describe fabric quality, fit, and delivery experience...'}"></textarea>
            </div>
            <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:12px;">
              <button type="button" class="btn-cancel-review" onclick="window.velenApp.toggleReviewForm('${product.id}')">${isAr ? 'إلغاء' : 'Cancel'}</button>
              <button type="submit" class="btn-submit-review" id="btnSubmitReview">${isAr ? 'نشر التقييم' : 'Submit Review'}</button>
            </div>
          </form>
        </div>

        <!-- Verified Reviews List -->
        <div class="product-reviews-list" id="productReviewsList">
          <div style="text-align:center; padding:25px; color:#777;">
            <i class="fa-solid fa-spinner fa-spin"></i> ${isAr ? 'جاري تحميل التقييمات...' : 'Loading verified reviews...'}
          </div>
        </div>
      </section>
    `;

    renderSizeBoxesForColor(product, state.selectedColor);
    loadProductReviews(product.id, isAr);
  }

  async function loadProductReviews(productId, isAr) {
    const listEl = document.getElementById('productReviewsList');
    if (!listEl) return;

    try {
      const res = await fetch(`/api/products/${encodeURIComponent(productId)}/reviews`);
      let reviews = await res.json();

      if (!reviews || reviews.length === 0) {
        reviews = [
          {
            id: 'seed-1',
            author: isAr ? 'يوسف الخالدي' : 'Yousef K.',
            rating: 5,
            comment: isAr ? 'خامة قطن 260 GSM ممتازة وثقيلة جداً! المقاس البوكسي مضبوط 100% والتوصيل بعمان وصلني ثاني يوم.' : 'Heavyweight 260 GSM cotton feel is incredible. True boxy fit and delivered the next day in Amman.',
            sizePurchased: 'L',
            fitFeedback: isAr ? 'مطابق للمقاس تماماً (True to size)' : 'True to size',
            verified: true,
            createdAt: new Date(Date.now() - 2 * 86400000).toISOString()
          },
          {
            id: 'seed-2',
            author: isAr ? 'سارة م.' : 'Sarah M.',
            rating: 5,
            comment: isAr ? 'اشتريت القطعة هدية، الخياطة والقماش بريميوم وما تغير بعد الغسيل أبداً، بنصح فيها بشدة.' : 'Premium fabric and neat stitching. Did not shrink or fade after wash. Highly recommended!',
            sizePurchased: 'M',
            fitFeedback: isAr ? 'مطابق للمقاس تماماً (True to size)' : 'True to size',
            verified: true,
            createdAt: new Date(Date.now() - 5 * 86400000).toISOString()
          },
          {
            id: 'seed-3',
            author: isAr ? 'عمر القضاة' : 'Omar Q.',
            rating: 5,
            comment: isAr ? 'قصّة الكتف المنسدل فخمة والقطن ثقيل وبارد، فخر الصناعة الأردنية الصراحة.' : 'Drop shoulder cut looks clean and modern. Quality craftsmanship!',
            sizePurchased: 'XL',
            fitFeedback: isAr ? 'مطابق للمقاس تماماً (True to size)' : 'True to size',
            verified: true,
            createdAt: new Date(Date.now() - 8 * 86400000).toISOString()
          }
        ];
      }

      state.currentProductReviews = reviews;
      renderProductReviews(reviews, isAr);

      const countLabel = document.getElementById('prodReviewsCountLabel');
      if (countLabel) {
        countLabel.textContent = isAr ? `${reviews.length} تقييمات موثقة` : `${reviews.length} verified reviews`;
      }
    } catch (e) {
      console.error('Error fetching product reviews:', e);
    }
  }

  function renderProductReviews(reviews, isAr) {
    const listEl = document.getElementById('productReviewsList');
    if (!listEl) return;

    if (!reviews || reviews.length === 0) {
      listEl.innerHTML = `
        <div style="text-align:center; padding:30px; color:#888;">
          <i class="fa-regular fa-comment-dots" style="font-size:24px; color:#444; margin-bottom:8px; display:block;"></i>
          <p>${isAr ? 'كن أول من يقيّم هذه القطعة ويشارك تجربته!' : 'Be the first to review this piece and share your experience!'}</p>
        </div>
      `;
      return;
    }

    listEl.innerHTML = reviews.map(rev => {
      const firstLetter = (rev.author || 'V')[0].toUpperCase();
      const starsStr = '★'.repeat(Math.min(5, Math.max(1, rev.rating || 5)));
      const dateStr = rev.createdAt ? new Date(rev.createdAt).toLocaleDateString(isAr ? 'ar-JO' : 'en-US', { month: 'short', day: 'numeric' }) : '';

      return `
        <div class="temu-review-card">
          <div class="temu-rev-header">
            <div class="temu-rev-user">
              <div class="temu-rev-avatar">${firstLetter}</div>
              <div>
                <span class="temu-rev-name">${rev.author}</span>
                <span class="temu-rev-verified">
                  <i class="fa-solid fa-circle-check"></i> ${isAr ? 'مشترٍ موثق' : 'Verified Buyer'}
                </span>
              </div>
            </div>
            <span class="temu-rev-date">${dateStr}</span>
          </div>

          <div class="temu-rev-stars">${starsStr}</div>

          <div class="temu-rev-badges">
            <span class="temu-pill-tag">${isAr ? 'المقاس:' : 'Size:'} ${rev.sizePurchased || 'M'}</span>
            <span class="temu-pill-tag"><i class="fa-solid fa-ruler"></i> ${rev.fitFeedback || (isAr ? 'مطابق للمقاس تماماً' : 'True to size')}</span>
          </div>

          <p class="temu-rev-comment">"${rev.comment}"</p>

          <div class="temu-rev-footer">
            <span><i class="fa-solid fa-location-dot"></i> ${isAr ? 'الأردن 🇯🇴' : 'Jordan 🇯🇴'}</span>
            <button type="button" class="btn-helpful-thumb" onclick="this.classList.toggle('active'); this.innerHTML='👍 مفيد (1)';">
              <i class="fa-regular fa-thumbs-up"></i> ${isAr ? 'مفيد' : 'Helpful'}
            </button>
          </div>
        </div>
      `;
    }).join('');
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

  // ================= VELEN SMART SIZE ASSISTANT =================
  function updateSizeAssistantLang() {
    const isAr = state.activeLang === 'ar';
    const saTitle = document.getElementById('saTitle');
    const saSubtitle = document.getElementById('saSubtitle');
    const saHeightLabel = document.getElementById('saHeightLabel');
    const saWeightLabel = document.getElementById('saWeightLabel');
    const saBuildLabel = document.getElementById('saBuildLabel');
    const saFitLabel = document.getElementById('saFitLabel');
    const saRecLabel = document.getElementById('saRecLabel');

    if (saTitle) saTitle.textContent = isAr ? 'دليلك لاختيار المقاس المثالي' : 'Find Your Perfect Fit';
    if (saSubtitle) saSubtitle.textContent = isAr 
      ? 'أدخل طولك ووزنك وبنية جسمك وسنحدد لك المقاس الدقيق المصمم لقصات VELEN الستريت وير.'
      : 'Enter your height, weight and body preferences for an exact size match tailored to VELEN streetwear fits.';
    if (saHeightLabel) saHeightLabel.textContent = isAr ? 'الطول / Height' : 'Height / الطول';
    if (saWeightLabel) saWeightLabel.textContent = isAr ? 'الوزن / Weight' : 'Weight / الوزن';
    if (saBuildLabel) saBuildLabel.textContent = isAr ? 'بنية الجسم وشكل القوام' : 'Body Build / بنية الجسم';
    if (saFitLabel) saFitLabel.textContent = isAr ? 'القصة المفضلة لديك' : 'Preferred Fit / القصة المفضلة';
    if (saRecLabel) saRecLabel.textContent = isAr ? 'المقاس الموصى به لك' : 'YOUR RECOMMENDED SIZE';
  }

  function openSizeAssistant() {
    const modal = document.getElementById('sizeAssistantModal');
    const overlay = document.getElementById('sizeAssistantOverlay');
    if (!modal) return;
    updateSizeAssistantLang();
    calculateRecommendedSize();
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    if (overlay) overlay.classList.add('active');
    lockBodyScroll();
  }

  function closeSizeAssistant() {
    const modal = document.getElementById('sizeAssistantModal');
    const overlay = document.getElementById('sizeAssistantOverlay');
    if (modal) {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
    }
    if (overlay) overlay.classList.remove('active');
    unlockBodyScroll();
  }

  function calculateRecommendedSize() {
    const heightEl = document.getElementById('sizeInputHeight');
    const weightEl = document.getElementById('sizeInputWeight');
    const height = parseInt(heightEl ? heightEl.value : '175', 10) || 175;
    const weight = parseInt(weightEl ? weightEl.value : '70', 10) || 70;

    const h = Math.max(140, Math.min(220, height));
    const w = Math.max(40, Math.min(150, weight));
    const bmi = w / Math.pow(h / 100, 2);

    // Size index scale: 0: XS, 1: S, 2: M, 3: L, 4: XL, 5: 2XL
    const sizeScale = ['XS', 'S', 'M', 'L', 'XL', '2XL'];
    let score = 2.0; // default M

    // Baseline from Height
    if (h < 162) {
      score = 0.8;
    } else if (h < 172) {
      score = 1.3;
    } else if (h < 180) {
      score = 2.0;
    } else if (h < 188) {
      score = 3.0;
    } else {
      score = 4.0;
    }

    // Weight & BMI influence
    if (bmi < 19.5) {
      score -= 0.6;
    } else if (bmi >= 19.5 && bmi < 23) {
      score += 0.0;
    } else if (bmi >= 23 && bmi < 26) {
      score += 0.4;
    } else if (bmi >= 26 && bmi < 29) {
      score += 0.9;
    } else if (bmi >= 29 && bmi < 33) {
      score += 1.5;
    } else {
      score += 2.1;
    }

    // Body Build adjustments
    const currentBuild = state.saBuild || 'average';
    if (currentBuild === 'slim') {
      score -= 0.4;
    } else if (currentBuild === 'athletic') {
      score += 0.5; // wider shoulders and chest
    } else if (currentBuild === 'heavy') {
      score += 0.8;
    }

    // Preferred Fit adjustments
    const currentFit = state.saFit || 'regular';
    if (currentFit === 'fitted') {
      score -= 0.6;
    } else if (currentFit === 'oversized') {
      score += 0.7;
    }

    // Clamp score to sizeScale range
    let idx = Math.round(score);
    idx = Math.max(0, Math.min(sizeScale.length - 1, idx));
    let recommended = sizeScale[idx];

    // Check available sizes of current product if open
    const prod = state.currentProductForModal;
    const availableSizes = (prod && Array.isArray(prod.sizes) && prod.sizes.length > 0)
      ? prod.sizes
      : ['S', 'M', 'L', 'XL', '2XL'];

    if (!availableSizes.includes(recommended)) {
      const availIdxs = availableSizes.map(s => sizeScale.indexOf(s)).filter(i => i !== -1);
      if (availIdxs.length > 0) {
        availIdxs.sort((a, b) => Math.abs(a - idx) - Math.abs(b - idx));
        recommended = sizeScale[availIdxs[0]];
      }
    }

    state.saCurrentRecommendation = recommended;

    // Match percentage (high confidence 94-98%)
    const diff = Math.abs(score - idx);
    const matchPct = Math.max(93, Math.min(99, Math.round(98 - diff * 8)));

    // UI Updates
    const recLetterEl = document.getElementById('recSizeLetter');
    if (recLetterEl) recLetterEl.textContent = recommended;

    const confirmSizeTextEl = document.getElementById('confirmSizeText');
    if (confirmSizeTextEl) confirmSizeTextEl.textContent = recommended;

    const matchBadgeEl = document.getElementById('recMatchPercent');
    if (matchBadgeEl) {
      matchBadgeEl.textContent = state.activeLang === 'ar' ? `تطابق بنسبة ${matchPct}%` : `${matchPct}% FIT MATCH`;
    }

    const noteEl = document.getElementById('recSizeNote');
    if (noteEl) {
      const isAr = state.activeLang === 'ar';
      let note = '';
      if (currentFit === 'oversized') {
        note = isAr 
          ? `مقاس ${recommended} يعطيك قصة ستريت وير أوفرسايزد واسعة مع أكتاف ساقطة مميزة وراحة كاملة.`
          : `Size ${recommended} delivers an authentic dropped-shoulder oversized streetwear silhouette.`;
      } else if (currentFit === 'fitted') {
        note = isAr
          ? `مقاس ${recommended} يمنحك قصة مرتبة ومضبوطة على الجسم بدون أي اتساع زائد في الأكمام.`
          : `Size ${recommended} provides a clean, tailored contour with minimal excess fabric.`;
      } else {
        note = isAr
          ? `مقاس ${recommended} هو القصة البوكسي المتوازنة والمثالية لوزنك وطولك بدون تضييق.`
          : `Size ${recommended} is VELEN's signature relaxed boxy fit — clean drape & drop shoulders.`;
      }
      noteEl.textContent = note;
    }

    return recommended;
  }

  function confirmRecommendedSize() {
    const recommended = state.saCurrentRecommendation || calculateRecommendedSize();
    if (window.velenApp && typeof window.velenApp.selectModalSize === 'function') {
      window.velenApp.selectModalSize(recommended);
    } else {
      state.selectedSize = recommended;
      const selectedLabel = document.getElementById('prodSelectedSizeLabel');
      if (selectedLabel) selectedLabel.textContent = recommended;
    }
    showToast(state.activeLang === 'ar' ? `تم اعتماد مقاس ${recommended} بنجاح` : `Size ${recommended} confirmed & selected`, 'success');
    closeSizeAssistant();
  }

  function setupSizeAssistant() {
    const hInput = document.getElementById('sizeInputHeight');
    const hSlider = document.getElementById('sizeSliderHeight');
    if (hInput && hSlider) {
      hInput.addEventListener('input', () => {
        hSlider.value = hInput.value;
        calculateRecommendedSize();
      });
      hSlider.addEventListener('input', () => {
        hInput.value = hSlider.value;
        calculateRecommendedSize();
      });
    }

    const wInput = document.getElementById('sizeInputWeight');
    const wSlider = document.getElementById('sizeSliderWeight');
    if (wInput && wSlider) {
      wInput.addEventListener('input', () => {
        wSlider.value = wInput.value;
        calculateRecommendedSize();
      });
      wSlider.addEventListener('input', () => {
        wInput.value = wSlider.value;
        calculateRecommendedSize();
      });
    }

    const buildBtns = document.querySelectorAll('#saBuildToggleRow .btn-build-toggle');
    buildBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        buildBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.saBuild = btn.getAttribute('data-build') || 'average';
        calculateRecommendedSize();
      });
    });

    const fitBtns = document.querySelectorAll('#saFitToggleRow .btn-fit-toggle');
    fitBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        fitBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.saFit = btn.getAttribute('data-fit') || 'regular';
        calculateRecommendedSize();
      });
    });

    document.getElementById('sizeAssistantClose')?.addEventListener('click', closeSizeAssistant);
    document.getElementById('sizeAssistantOverlay')?.addEventListener('click', closeSizeAssistant);
    document.getElementById('btnConfirmRecommendedSize')?.addEventListener('click', confirmRecommendedSize);
  }


  function openCheckout() {
    if (state.cart.length === 0) {
      showToast(state.activeLang === 'ar' ? 'حقيبة التسوق فارغة!' : 'Your shopping bag is empty!', 'info');
      return;
    }
    closeCart();
    renderCheckoutSummary();
    checkoutModal.classList.add('active');
    lockBodyScroll();
  }

  function closeCheckout() {
    checkoutModal.classList.remove('active');
    unlockBodyScroll();
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
        <div style="display:flex; justify-content:space-between; font-size:12px; color:#bbb; padding:3px 0; border-bottom:1px solid rgba(255,255,255,0.05);">
          <span>${item.name} (${item.size}${item.color ? ` - ${item.color}` : ''}) × ${item.quantity}</span>
          <span style="color:#fff; font-weight:700;">${(item.price * item.quantity).toFixed(3)} JOD</span>
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
    renderCheckoutUpsell();
  }

  // ================= COMMUNITY SUBMISSION =================
  function setupCommunityForm() {
    if (commFormInitialized) return;
    commFormInitialized = true;

    const dropzone = document.getElementById('commDropzone');
    const fileInput = document.getElementById('commFileInput');
    const preview = document.getElementById('commFilePreview');
    const clearMediaBtn = document.getElementById('clearCommMediaBtn');
    const commForm = document.getElementById('communityForm');
    const dropzoneText = document.getElementById('commDropzoneText');

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
        }
        clearMediaBtn.style.display = 'none';
        showToast(state.activeLang === 'ar' ? 'تم إلغاء الميديا' : 'Media cleared', 'info');
      });
    }

    async function handleFileUpload(file) {
      if (!file) return;
      const isAr = state.activeLang === 'ar';

      // 1. Client-side file size check (50MB)
      const MAX_SIZE = 50 * 1024 * 1024;
      if (file.size > MAX_SIZE) {
        showToast(
          isAr 
            ? 'حجم الملف يتجاوز 50 ميغابايت! يرجى اختيار فيديو أو صورة أصغر حجماً.' 
            : 'File size exceeds 50MB! Please choose a smaller file.',
          'warning'
        );
        return;
      }

      const formData = new FormData();
      formData.append('media', file);

      if (dropzoneText) {
        dropzoneText.textContent = isAr ? 'جاري معالجة ورفع الفيديو / الصورة إلى السيرفر...' : 'Uploading media to server...';
      }

      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });
        
        const rawText = await res.text();
        let data;
        try {
          data = JSON.parse(rawText);
        } catch (jsonErr) {
          throw new Error(rawText || 'Server responded with non-JSON format');
        }

        if (data.success) {
          uploadedMediaUrl = data.url;
          uploadedMediaType = data.mediaType;

          if (dropzone) dropzone.style.display = 'none';
          if (preview) {
            preview.style.display = 'block';
            if (uploadedMediaType === 'video') {
              preview.innerHTML = `<video src="${uploadedMediaUrl}" controls autoplay muted playsinline style="width:100%; height:200px; object-fit:cover; border-radius:8px;"></video>`;
            } else {
              preview.innerHTML = `<img src="${uploadedMediaUrl}" alt="Preview" style="width:100%; height:200px; object-fit:cover; border-radius:8px;" onerror="this.src='/assets/velen-boxy-black.jpg';">`;
            }
          }
          if (clearMediaBtn) clearMediaBtn.style.display = 'inline-block';
          showToast(isAr ? 'تم رفع الفيديو / الصورة بنجاح! 🎉' : 'Media uploaded successfully! 🎉', 'success');
        } else {
          showToast(data.message || (isAr ? 'فشل رفع الملف، يرجى التأكد من الصيغة' : 'Upload failed'), 'error');
          if (dropzoneText) {
            dropzoneText.textContent = isAr ? 'اسحب وأفلت الصورة أو الفيديو هنا أو اضغط للاختيار' : 'Drag & drop photo or video here, or click to choose';
          }
        }
      } catch (err) {
        console.error('Upload error:', err);
        showToast(isAr ? 'حدث خطأ أثناء الرفع، تأكد من الاتصال وجرب ثانية' : 'Upload failed, please try again', 'error');
        if (dropzoneText) {
          dropzoneText.textContent = isAr ? 'اسحب وأفلت الصورة أو الفيديو هنا أو اضغط للاختيار' : 'Drag & drop photo or video here, or click to choose';
        }
      }
    }

    if (dropzone && fileInput) {
      dropzone.addEventListener('click', (e) => {
        e.preventDefault();
        fileInput.click();
      });

      fileInput.addEventListener('click', (e) => {
        e.stopPropagation();
      });

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

    if (commForm) {
      commForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const author = document.getElementById('commAuthor').value.trim();
        const comment = document.getElementById('commComment') ? document.getElementById('commComment').value.trim() : '';
        const externalUrl = document.getElementById('commUrlInput') ? document.getElementById('commUrlInput').value.trim() : '';

        const finalMediaUrl = uploadedMediaUrl || (externalUrl !== '' ? externalUrl : null);
        const isVideo = finalMediaUrl && (uploadedMediaType === 'video' || finalMediaUrl.endsWith('.mp4') || finalMediaUrl.includes('video'));

        const payload = {
          author,
          authorTag: author.startsWith('@') ? author : '@' + author.toLowerCase().replace(/\s+/g, '_'),
          avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 9000000)}?auto=format&fit=crop&w=150&q=80`,
          mediaType: finalMediaUrl ? (isVideo ? 'video' : 'photo') : 'text',
          mediaUrl: finalMediaUrl,
          videoUrl: isVideo ? finalMediaUrl : null,
          subtitle: 'Amman - الأردن',
          rating: 5,
          comment,
          itemWorn: 'Velen Community Look'
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
            unlockBodyScroll();
            commForm.reset();
            uploadedMediaUrl = null;
            if (clearMediaBtn) clearMediaBtn.style.display = 'none';
            if (preview) {
              preview.style.display = 'none';
              preview.innerHTML = '';
            }
            if (dropzone) {
              dropzone.style.display = 'block';
            }
            showToast(state.activeLang === 'ar' ? 'شكراً لك! تم نشر إطلالتك في مجتمع Velen 🎉' : 'Thank you! Your look was posted to VELEN Community 🎉', 'success');
          } else {
            showToast(result.message || 'Submission failed', 'error');
          }
        } catch (err) {
          console.error('Community submit error:', err);
          showToast('Failed to post, please try again', 'error');
        }
      });
    }
  }

  // ================= REVIEW MODAL SETUP =================
  function setupReviewForm() {
    // Setup Review Star Picker
    const reviewStarPicker = document.getElementById('reviewStarPicker');
    const reviewStarLabel = document.getElementById('reviewStarLabel');
    const reviewRatingVal = document.getElementById('reviewRatingVal');

    if (reviewStarPicker) {
      const stars = reviewStarPicker.querySelectorAll('.star-btn');
      let selectedReviewRating = 5;
      stars.forEach(star => {
        star.addEventListener('click', () => {
          const val = parseInt(star.getAttribute('data-value'), 10);
          selectedReviewRating = val;
          if (reviewRatingVal) reviewRatingVal.value = val;
          stars.forEach((s, idx) => {
            if (idx < val) s.classList.add('active');
            else s.classList.remove('active');
          });
          const labels = { 1: '1 من 5 (سيء)', 2: '2 من 5 (مقبول)', 3: '3 من 5 (جيد)', 4: '4 من 5 (رائع جداً)', 5: '5 من 5 (ممتاز وفوق الخيال 🔥)' };
          if (reviewStarLabel) reviewStarLabel.textContent = labels[val] || `${val} من 5`;
        });
      });
    }

    // Populate review product select
    const reviewItemSelect = document.getElementById('reviewItemWorn');
    if (reviewItemSelect && state.products && state.products.length > 0) {
      reviewItemSelect.innerHTML = state.products.map(p => `<option value="${p.name}">${p.name}</option>`).join('');
    }

    // Open/Close review modal
    const addReviewBtn = document.getElementById('addReviewBtn');
    const reviewModal = document.getElementById('reviewModal');
    const reviewModalClose = document.getElementById('reviewModalClose');

    if (addReviewBtn && reviewModal) {
      addReviewBtn.addEventListener('click', () => {
        const reviewItemSelect = document.getElementById('reviewItemWorn');
        if (reviewItemSelect && state.products && state.products.length > 0) {
          reviewItemSelect.innerHTML = state.products.map(p => `<option value="${p.name}">${p.name}</option>`).join('');
        }
        reviewModal.classList.add('active');
      });
    }
    if (reviewModalClose && reviewModal) {
      reviewModalClose.addEventListener('click', () => reviewModal.classList.remove('active'));
      reviewModal.addEventListener('click', (e) => { if (e.target === reviewModal) reviewModal.classList.remove('active'); });
    }

    // Review form submit
    const reviewForm = document.getElementById('reviewForm');
    if (reviewForm) {
      reviewForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const author = document.getElementById('reviewAuthor').value.trim();
        const itemWorn = document.getElementById('reviewItemWorn').value;
        const comment = document.getElementById('reviewComment').value.trim();
        const rating = parseInt(document.getElementById('reviewRatingVal').value, 10) || 5;

        const payload = { author, itemWorn, comment, rating };
        try {
          const res = await fetch('/api/reviews', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          const result = await res.json();
          if (result.success) {
            if (!state.reviews) state.reviews = [];
            state.reviews.unshift(result.review);
            renderReviewsSection();
            if (reviewModal) reviewModal.classList.remove('active');
            reviewForm.reset();
            showToast('شكراً لك! تم نشر تقييمك بنجاح 🌟', 'success');
          }
        } catch (err) {
          console.error('Review submit error:', err);
          showToast('حدث خطأ، يرجى المحاولة ثانية', 'error');
        }
      });
    }
  }

  // ================= WAYBILL PRINT MODAL =================
  function setupWaybillModal() {
    const printBtn = document.getElementById('waybillPrintBtn');
    const closeBtn = document.getElementById('waybillCloseBtn');
    const downloadBtn = document.getElementById('waybillDownloadBtn');

    if (printBtn) {
      printBtn.addEventListener('click', () => window.print());
    }
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        const modal = document.getElementById('waybillModal');
        if (modal) modal.style.display = 'none';
      });
    }
    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => {
        // Fallback: open print dialog which allows Save as PDF
        window.print();
      });
    }
  }

  function openWaybillModal(order) {
    const modal = document.getElementById('waybillModal');
    const content = document.getElementById('waybillContent');
    if (!modal || !content || !order) return;

    const itemsRows = (order.items || []).map(item => `
      <tr>
        <td>${item.name}<br><small style="color:#888;">${item.size || 'M'}</small></td>
        <td style="text-align:center;">${item.quantity || 1}</td>
        <td style="text-align:left;">${(Number(item.price) * (item.quantity || 1)).toFixed(3)} JOD</td>
      </tr>
    `).join('');

    const dateStr = order.createdAt ? new Date(order.createdAt).toLocaleDateString('ar-JO', { year: 'numeric', month: 'long', day: 'numeric' }) : new Date().toLocaleDateString('ar-JO');
    const isCOD = !order.paymentMethod || order.paymentMethod.toLowerCase().includes('cash') || order.paymentMethod.toLowerCase().includes('cod') || order.paymentMethod.toLowerCase().includes('دفع عند');

    content.innerHTML = `
      <div class="waybill-label">
        <div class="waybill-header">
          <div>
            <div class="waybill-brand-name">VELEN</div>
            <div class="waybill-brand-sub">OFFICIAL • MADE IN JORDAN</div>
          </div>
          <div class="waybill-order-num">
            <div class="order-id-big">${order.id}</div>
            <div class="order-date">${dateStr}</div>
          </div>
        </div>
        <div class="waybill-divider"></div>
        <div class="waybill-body">
          <div class="waybill-section">
            <div class="waybill-section-title">معلومات العميل</div>
            <div class="waybill-customer-name">${order.customerName}</div>
            <div class="waybill-info-row"><span class="label">الهاتف:</span> <strong>${order.phone}</strong></div>
            <div class="waybill-info-row"><span class="label">المحافظة:</span> ${order.city || 'عمّان'}</div>
            <div class="waybill-info-row"><span class="label">العنوان:</span> ${order.address || '—'}</div>
            ${order.notes ? `<div class="waybill-info-row"><span class="label">ملاحظات:</span> ${order.notes}</div>` : ''}
          </div>

          <div class="waybill-section">
            <div class="waybill-section-title">القطع المطلوبة</div>
            <table class="waybill-items-table">
              <thead><tr><th>المنتج</th><th style="text-align:center;">الكمية</th><th style="text-align:left;">المجموع</th></tr></thead>
              <tbody>${itemsRows}</tbody>
            </table>
          </div>

          <div class="waybill-totals">
            ${Number(order.shipping || 0) === 0
              ? `<div class="waybill-total-row"><span>التوصيل (عمّان):</span><span style="color:#2ecc71;">مجاناً</span></div>`
              : `<div class="waybill-total-row"><span>التوصيل:</span><span>${Number(order.shipping).toFixed(3)} JOD</span></div>`
            }
            <div class="waybill-total-row final"><span>الإجمالي للدفع:</span><span>${Number(order.total || 0).toFixed(3)} JOD</span></div>
          </div>

          ${isCOD ? `
          <div class="waybill-cod-box">
            <div class="waybill-cod-label">طريقة الدفع</div>
            نقداً عند الاستلام (COD) • ${Number(order.total || 0).toFixed(3)} JOD
          </div>` : `
          <div class="waybill-cod-box" style="background:#1a73e8;">
            <div class="waybill-cod-label">طريقة الدفع</div>
            CliQ Transfer • ${Number(order.total || 0).toFixed(3)} JOD
          </div>`}
        </div>
        <div class="waybill-footer">
          VELEN OFFICIAL • AMMAN, JORDAN 🇯🇴 • wa.me/962770188144
        </div>
      </div>
    `;

    modal.style.display = 'flex';
  }

  // ================= PHONE NORMALIZATION =================
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
              const msgText = state.activeLang === 'ar'
                ? `مرحباً Velen Official، قمت بالطلب رقم ${result.order.id} باسم ${customerName} بمبلغ ${total.toFixed(3)} JOD. أود متابعة حالة الشحن.`
                : `Hello Velen Official, I placed order #${result.order.id} under the name ${customerName} for ${total.toFixed(3)} JOD. I would like to track my order status.`;
              const msg = encodeURIComponent(msgText);
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

  // ================= CHECKOUT UPSELL SETUP (Admin Configurable) =================
  function renderCheckoutUpsell() {
    const box = document.getElementById('checkoutUpsellBox');
    if (!box) return;

    const upsellConfig = state.design?.checkoutUpsell;
    if (!upsellConfig || upsellConfig.enabled === false) {
      box.style.display = 'none';
      return;
    }

    // Find the product selected by Admin or default to first product
    const targetProduct = (state.products && state.products.length > 0)
      ? (state.products.find(p => p.id === upsellConfig.productId) || state.products[0])
      : null;

    if (!targetProduct) {
      box.style.display = 'none';
      return;
    }

    box.style.display = 'block';

    const isAr = state.activeLang === 'ar';
    const titleEl = document.getElementById('upsellTitle');
    const descEl = box.querySelector('.upsell-desc');
    const imgEl = document.getElementById('upsellImg');
    const priceEl = document.getElementById('upsellPrice');
    const origPriceEl = document.getElementById('upsellOrigPrice');
    const sizeSelect = document.getElementById('upsellSizeSelect');
    const btn = document.getElementById('btnApplyUpsell');

    const discountPrice = Number(upsellConfig.discountPrice || (targetProduct.price * 0.8));
    const originalPrice = Number(targetProduct.price || 13);
    const displayTitle = upsellConfig.title || targetProduct.name;
    const displaySubtitle = upsellConfig.subtitle || (isAr ? 'أضف قطعة إضافية إلى طلبك الآن بسعر خاص!' : 'Add an extra piece to your order now at a special price!');
    const mainImg = targetProduct.image || (targetProduct.images && targetProduct.images[0]) || '/assets/velen-ringer-white.jpg';

    if (titleEl) titleEl.textContent = displayTitle;
    if (descEl) descEl.textContent = displaySubtitle;
    if (imgEl) {
      imgEl.src = mainImg;
      imgEl.onerror = function() { this.src = '/assets/velen-boxy-black.jpg'; };
    }
    if (priceEl) priceEl.textContent = discountPrice.toFixed(3) + ' JOD';
    if (origPriceEl) origPriceEl.textContent = originalPrice.toFixed(3) + ' JOD';

    // Populate sizes
    if (sizeSelect) {
      const availSizes = (targetProduct.sizes && targetProduct.sizes.length > 0) ? targetProduct.sizes : ['S', 'M', 'L', 'XL'];
      const currentVal = sizeSelect.value;
      sizeSelect.innerHTML = availSizes.map(s => `
        <option value="${s}" ${s === currentVal ? 'selected' : (s === 'M' ? 'selected' : '')}>${isAr ? `مقاس ${s}` : `Size ${s}`}</option>
      `).join('');
    }

    // Check if already in cart
    const alreadyInCart = state.cart.some(item => item.id === `upsell_${targetProduct.id}` || (item.id === targetProduct.id && item.isUpsell));
    if (btn) {
      if (alreadyInCart) {
        btn.disabled = true;
        btn.innerHTML = `<i class="fa-solid fa-check"></i> ${isAr ? 'تمت الإضافة للطلب' : 'Added to order'}`;
        btn.style.background = '#27ae60';
      } else {
        btn.disabled = false;
        btn.innerHTML = `<i class="fa-solid fa-plus"></i> ${isAr ? `أضف للطلب (+${discountPrice.toFixed(3)} JOD)` : `Add to Order (+${discountPrice.toFixed(3)} JOD)`}`;
        btn.style.background = '';
      }
    }
  }

  function setupCheckoutUpsell() {
    const btn = document.getElementById('btnApplyUpsell');
    if (!btn) return;

    btn.addEventListener('click', () => {
      const upsellConfig = state.design?.checkoutUpsell;
      const targetProduct = (state.products && state.products.length > 0)
        ? (state.products.find(p => p.id === upsellConfig?.productId) || state.products[0])
        : null;

      if (!targetProduct) return;

      const sizeSelect = document.getElementById('upsellSizeSelect');
      const size = sizeSelect ? sizeSelect.value : 'M';
      const discountPrice = Number(upsellConfig?.discountPrice || (targetProduct.price * 0.8));
      const displayTitle = upsellConfig?.title || targetProduct.name;
      const isAr = state.activeLang === 'ar';

      const upsellItem = {
        id: `upsell_${targetProduct.id}`,
        name: `${displayTitle} (Exclusive Offer)`,
        price: discountPrice,
        image: targetProduct.image || (targetProduct.images && targetProduct.images[0]) || '/assets/velen-logo.jpg',
        category: targetProduct.category || 'Special Offer',
        fabric: targetProduct.fabric || '100% قطن أردني معالج نخب أول',
        isUpsell: true
      };

      addToCart(upsellItem, size, 1);
      renderCheckoutSummary();
      showToast(isAr ? 'تمت إضافة القطعة بالعرض الخاص إلى طلبك!' : 'Special offer piece added to your order!', 'success');
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
    // Default store language is English ('en') as requested by user
    let lang = savedLang || 'en';
    setLanguage(lang);

    document.getElementById('langToggleBtn')?.addEventListener('click', () => {
      const nextLang = state.activeLang === 'ar' ? 'en' : 'ar';
      setLanguage(nextLang);
      showToast(nextLang === 'ar' ? 'تم تغيير لغة المتجر إلى العربية' : 'Switched store language to English', 'info');
    });
  }

  function setLanguage(lang) {
    state.activeLang = lang;
    localStorage.setItem('velen_lang', lang);
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    document.body.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');

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

    renderCategoryTabs();
    if (state.products && state.products.length > 0) {
      renderProducts();
      if (typeof renderFeaturedProducts === 'function') renderFeaturedProducts();
    }
    if (state.community && state.community.length > 0) renderCommunity();
    if (typeof renderReviews === 'function') renderReviews();
    if (typeof renderDynamicPolicies === 'function') renderDynamicPolicies();
    updateCartUI();

    // Re-render product page if open to reflect new language
    const prodPage = document.getElementById('productPage');
    if (prodPage && prodPage.style.display === 'block' && state.currentProductForModal) {
      renderProductPageContent(state.currentProductForModal);
    }

    if (typeof updateSizeAssistantLang === 'function') updateSizeAssistantLang();
    if (typeof calculateRecommendedSize === 'function') calculateRecommendedSize();

    // Re-apply admin design customizations so live design overrides static dictionary
    if (state.design) {
      applyDesign(state.design);
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

  // ================= MENU DRAWER & SITE-WIDE NAVIGATION =================
  function scrollToSection(href) {
    if (!href || href === '#') return;
    closeProductPage(false);

    if (href === '#hero' || href === '#top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const sectionMap = {
      '#collection': ['sec-collection', 'collection'],
      '#community': ['sec-community', 'community'],
      '#reviews': ['sec-reviews', 'reviews'],
      '#about': ['sec-about', 'about']
    };

    let targetEl = null;
    if (sectionMap[href]) {
      for (const id of sectionMap[href]) {
        const el = document.getElementById(id);
        if (el) { targetEl = el; break; }
      }
    }
    if (!targetEl) targetEl = document.querySelector(href);

    if (targetEl) {
      const navEl = document.getElementById('mainNav');
      const headerOffset = (navEl ? navEl.offsetHeight : 70) + 15;
      const elementPosition = targetEl.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: Math.max(0, offsetPosition),
        behavior: 'smooth'
      });
    }
  }
  window._scrollToSection = scrollToSection;

  function setupMenuDrawerLinks() {
    // Brand link (logo) navigates to home
    document.querySelectorAll('.brand-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo('home');
      });
    });

    // Hero Shop Button
    document.getElementById('heroShopBtn')?.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo('shop');
    });

    // Hero Story Button
    document.getElementById('heroStoryBtn')?.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo('about');
    });

    // Desktop Nav Links
    document.querySelectorAll('#desktopNavMenu .nav-link-item').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetView = link.getAttribute('data-nav') || link.getAttribute('href')?.replace('#', '');
        if (targetView) navigateTo(targetView);
      });
    });

    const drawerLinks = document.querySelectorAll('#navDrawer .drawer-link, #navDrawer a[href^="#"]');
    drawerLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        if (link.id === 'drawerTermsBtn' || link.classList.contains('open-terms-link') || link.getAttribute('href') === '#terms' || link.getAttribute('href') === '#policy') {
          e.preventDefault();
          navDrawer.classList.remove('open');
          drawerOverlay.classList.remove('active');
          const policyModal = document.getElementById('policyModal');
          if (policyModal) policyModal.style.display = 'flex';
          return;
        }

        const href = link.getAttribute('href');
        const targetView = link.getAttribute('data-nav') || href?.replace('#', '');
        if (!targetView || targetView === '#') return;

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

        if (SITE_VIEWS.includes(targetView)) {
          navigateTo(targetView);
        } else {
          scrollToSection(href);
        }
      });
    });

    const footerLinks = document.querySelectorAll('.footer-col a[href^="#"]');
    footerLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (!href || href === '#' || href === '#terms') return;
        e.preventDefault();

        const targetView = href.replace('#', '');
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

        if (SITE_VIEWS.includes(targetView)) {
          navigateTo(targetView);
        } else {
          scrollToSection(href);
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
          if (policyModal) {
            policyModal.style.display = 'flex';
            const tab = btn.getAttribute('data-tab');
            if (tab === 'care') {
              const body = document.getElementById('policyModalBody');
              if (body) {
                const careHeading = body.querySelector('h4:nth-of-type(3)');
                if (careHeading) careHeading.scrollIntoView({ behavior: 'smooth' });
              }
            }
          }
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
      lockBodyScroll();
    });
    document.getElementById('navDrawerClose')?.addEventListener('click', () => {
      navDrawer.classList.remove('open');
      drawerOverlay.classList.remove('active');
      unlockBodyScroll();
    });
    drawerOverlay?.addEventListener('click', () => {
      navDrawer.classList.remove('open');
      drawerOverlay.classList.remove('active');
      unlockBodyScroll();
    });

    // Cart Drawer with Critical Close Controls
    document.getElementById('cartToggleBtn')?.addEventListener('click', openCart);
    document.getElementById('cartCloseBtn')?.addEventListener('click', closeCart);
    document.getElementById('cartContinueShoppingBtn')?.addEventListener('click', closeCart);
    cartOverlay?.addEventListener('click', closeCart);
    document.getElementById('openCheckoutBtn')?.addEventListener('click', openCheckout);

    // Global Escape Key Listener for Modals & Drawers
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (cartDrawer && cartDrawer.classList.contains('open')) closeCart();
        closeSizeAssistant();
        closeProductModal();
        closeCheckout();
        if (searchModal && searchModal.classList.contains('active')) {
          searchModal.classList.remove('active');
          unlockBodyScroll();
        }
        if (communityModal && communityModal.classList.contains('active')) {
          communityModal.classList.remove('active');
          unlockBodyScroll();
        }
        const policyModal = document.getElementById('policyModal');
        if (policyModal) policyModal.style.display = 'none';
        const zoomOverlay = document.querySelector('.lightbox-zoom-overlay');
        if (zoomOverlay) zoomOverlay.remove();
      }
    });

    // Homepage Category Tabs Filter (All Pieces | Sweatshirts | Sweatpants)
    const homeTabs = document.querySelectorAll('#homeCategoryTabs .cat-pill, .home-tab-btn');
    homeTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('#homeCategoryTabs .cat-pill, .home-tab-btn').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const cat = tab.getAttribute('data-cat') || tab.getAttribute('data-category') || 'all';
        renderFeaturedProducts(cat);
      });
    });

    // Size Assistant Listeners
    setupSizeAssistant();

    // Close Modals & Product Page
    document.getElementById('btnBackToStore')?.addEventListener('click', () => closeProductPage(true));
    document.getElementById('productModalClose')?.addEventListener('click', closeProductModal);
    document.getElementById('checkoutModalClose')?.addEventListener('click', closeCheckout);
    document.getElementById('closeSuccessBtn')?.addEventListener('click', () => {
      successModal.classList.remove('active');
      unlockBodyScroll();
    });

    // Community Share Modal
    document.getElementById('addLookBtn')?.addEventListener('click', () => {
      communityModal.classList.add('active');
      lockBodyScroll();
    });
    document.getElementById('communityModalClose')?.addEventListener('click', () => {
      communityModal.classList.remove('active');
      unlockBodyScroll();
    });
    // Community modal background click to close
    communityModal?.addEventListener('click', (e) => {
      if (e.target === communityModal) {
        communityModal.classList.remove('active');
        unlockBodyScroll();
      }
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
      lockBodyScroll();
      searchInput.focus();
    });
    document.getElementById('searchCloseBtn')?.addEventListener('click', () => {
      searchModal.classList.remove('active');
      unlockBodyScroll();
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
  Object.assign(window.velenApp, {
    navigateTo: (viewName) => navigateTo(viewName, true),
    showView: (viewName) => showView(viewName, true),
    handleOrderLookup: (e) => handleOrderLookup(e),
    openProductModal,
    openProductPage: (id) => openProductPage(id),
    selectModalSize: (size) => {
      const p = state.currentProductForModal;
      const color = state.selectedColor || (p && p.colors && p.colors[0]) || null;
      const inv = (color && color.sizeInventory && Object.keys(color.sizeInventory).length > 0) ? color.sizeInventory : (p && p.sizeInventory);
      if (inv) {
        const qty = inv[size];
        if (typeof qty !== 'undefined' && qty <= 0) {
          showToast(state.activeLang === 'ar' ? 'هذا المقاس غير متوفر حالياً لهذا اللون' : 'This size is currently out of stock for this color', 'info');
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
    closeProductPage: () => closeProductPage(true),
    selectProductColor: (colorIndex) => {
      const p = state.currentProductForModal;
      if (!p) return;
      const colors = Array.isArray(p.colors) && p.colors.length > 0 ? p.colors : null;
      if (!colors || !colors[colorIndex]) return;

      const c = colors[colorIndex];
      state.selectedColor = c;

      const nameLabel = document.getElementById('prodSelectedColorName');
      if (nameLabel) nameLabel.textContent = c.name;

      const swatches = document.querySelectorAll('.color-swatch-circle-wrap');
      swatches.forEach((btn, idx) => {
        btn.classList.toggle('active', idx === colorIndex);
      });

      const colorImages = (c.images && c.images.length > 0)
        ? c.images
        : (Array.isArray(p.images) && p.images.length > 0 ? p.images : [p.image || '/assets/velen-logo.jpg']);

      const mainImg = document.getElementById('pageProductMainImg');
      if (mainImg && colorImages[0]) {
        mainImg.style.opacity = '0.35';
        mainImg.src = colorImages[0];
        setTimeout(() => { mainImg.style.opacity = '1'; }, 150);
      }

      currentProductImageIdx = 0;
      const carouselIndex = document.getElementById('pageCarouselIndex');
      const carouselTotal = document.getElementById('pageCarouselTotal');
      if (carouselIndex) carouselIndex.textContent = '1';
      if (carouselTotal) carouselTotal.textContent = colorImages.length;

      // Update Desktop Vertical Thumbnails
      const vertThumbs = document.getElementById('productVerticalThumbs');
      if (vertThumbs) {
        vertThumbs.innerHTML = colorImages.slice(0, 6).map((imgUrl, i) => `
          <button type="button" class="vert-thumb-btn ${i === 0 ? 'active' : ''}" onclick="window.velenApp.switchProductPageImage('${imgUrl}', this)" aria-label="Thumbnail ${i + 1}">
            <img src="${imgUrl}" alt="${p.name} view ${i + 1}" loading="lazy" onerror="this.src='/assets/velen-logo.jpg'">
          </button>
        `).join('');
      }

      // Update Mobile Horizontal Thumbnails
      const mobileThumbs = document.getElementById('productMobileThumbs');
      if (mobileThumbs) {
        mobileThumbs.innerHTML = colorImages.map((imgUrl, i) => `
          <button type="button" class="mobile-thumb-item ${i === 0 ? 'active' : ''}" onclick="window.velenApp.switchProductPageImage('${imgUrl}', this)" aria-label="Image ${i + 1}">
            <img src="${imgUrl}" alt="${p.name} ${i + 1}" loading="lazy" onerror="this.src='/assets/velen-logo.jpg'">
          </button>
        `).join('');
      }

      // Switch sizes to this color's specific sizing/inventory
      renderSizeBoxesForColor(p, c);
    },
    openSizeAssistant: () => {
      openSizeAssistant();
    },
    closeSizeAssistant: () => {
      closeSizeAssistant();
    },
    calculateRecommendedSize: () => {
      return calculateRecommendedSize();
    },
    confirmRecommendedSize: () => {
      confirmRecommendedSize();
    },
    setSizeAssistantBuild: (build, btn) => {
      state.saBuild = build;
      document.querySelectorAll('#saBuildToggleRow .btn-build-toggle').forEach(b => b.classList.remove('active'));
      if (btn) {
        btn.classList.add('active');
      } else {
        document.querySelector(`#saBuildToggleRow .btn-build-toggle[data-build="${build}"]`)?.classList.add('active');
      }
      calculateRecommendedSize();
    },
    setSizeAssistantFit: (fit, btn) => {
      state.saFit = fit;
      document.querySelectorAll('#saFitToggleRow .btn-fit-toggle').forEach(b => b.classList.remove('active'));
      if (btn) {
        btn.classList.add('active');
      } else {
        document.querySelector(`#saFitToggleRow .btn-fit-toggle[data-fit="${fit}"]`)?.classList.add('active');
      }
      calculateRecommendedSize();
    },
    onHeightChange: (val) => {
      const hInput = document.getElementById('sizeInputHeight');
      const hSlider = document.getElementById('sizeSliderHeight');
      if (hInput && hInput.value !== String(val)) hInput.value = val;
      if (hSlider && hSlider.value !== String(val)) hSlider.value = val;
      calculateRecommendedSize();
    },
    onWeightChange: (val) => {
      const wInput = document.getElementById('sizeInputWeight');
      const wSlider = document.getElementById('sizeSliderWeight');
      if (wInput && wInput.value !== String(val)) wInput.value = val;
      if (wSlider && wSlider.value !== String(val)) wSlider.value = val;
      calculateRecommendedSize();
    },
    toggleAccordion: (btn) => {
      toggleAccordion(btn);
    },
    switchProductPageImage: (url, btn) => {
      switchProductPageImage(url, btn);
    },
    nextProductPageImage: () => {
      nextProductPageImage();
    },
    prevProductPageImage: () => {
      prevProductPageImage();
    },
    zoomProductImage: () => {
      zoomProductImage();
    },
    handlePaymentMethodChange: (val) => {
      handlePaymentMethodChange(val);
    },
    renderFeaturedProducts: (cat) => {
      renderFeaturedProducts(cat);
    },
    addCurrentModalToCart: () => {
      if (state.currentProductForModal) {
        const p = state.currentProductForModal;
        const size = state.selectedSize || 'M';
        const color = state.selectedColor || (p.colors && p.colors[0]) || null;
        const inv = (color && color.sizeInventory && Object.keys(color.sizeInventory).length > 0) ? color.sizeInventory : p.sizeInventory;
        if (inv) {
          const qty = inv[size];
          if (typeof qty !== 'undefined' && qty <= 0) {
            showToast(state.activeLang === 'ar' ? 'عذراً، هذا المقاس نفذت كميته لهذا اللون' : 'Sorry, this size is sold out for this color', 'info');
            return;
          }
        }
        addToCart(p, size, 1, color);
        openCart();
      }
    },
    buyNowDirect: () => {
      if (state.currentProductForModal) {
        const p = state.currentProductForModal;
        const size = state.selectedSize || 'M';
        const color = state.selectedColor || (p.colors && p.colors[0]) || null;
        const inv = (color && color.sizeInventory && Object.keys(color.sizeInventory).length > 0) ? color.sizeInventory : p.sizeInventory;
        if (inv) {
          const qty = inv[size];
          if (typeof qty !== 'undefined' && qty <= 0) {
            showToast(state.activeLang === 'ar' ? 'عذراً، هذا المقاس نفذت كميته لهذا اللون' : 'Sorry, this size is sold out for this color', 'info');
            return;
          }
        }
        addToCart(p, size, 1, color);
        closeCart();
        openCheckout();
      }
    },
    quickAddToCart: (productId) => {
      openProductPage(productId);
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
    },
    toggleReviewForm: (productId) => {
      const wrap = document.getElementById('writeReviewFormWrap');
      if (!wrap) return;
      wrap.style.display = wrap.style.display === 'none' ? 'block' : 'none';
      if (wrap.style.display === 'block') {
        wrap.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    },
    openWaybillModal,
    submitProductReview: async (e, productId) => {
      e.preventDefault();
      const isAr = state.activeLang === 'ar';
      const author = document.getElementById('revAuthor')?.value.trim();
      const rating = parseInt(document.getElementById('revRating')?.value || '5', 10);
      const sizePurchased = document.getElementById('revSize')?.value || 'M';
      const fitFeedback = document.getElementById('revFit')?.value || 'True to size';
      const comment = document.getElementById('revComment')?.value.trim();

      if (!author || !comment) {
        showToast(isAr ? 'يرجى كتابة اسمك ورأيك بالقطعة' : 'Please fill in your name and review', 'error');
        return;
      }

      const btn = document.getElementById('btnSubmitReview');
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> ${isAr ? 'جاري النشر...' : 'Publishing...'}`;
      }

      try {
        const res = await fetch(`/api/products/${encodeURIComponent(productId)}/reviews`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ author, rating, sizePurchased, fitFeedback, comment })
        });
        const data = await res.json();
        if (data.success) {
          showToast(isAr ? 'شكراً لك! تم نشر تقييمك الموثق بنجاح.' : 'Thank you! Your verified review is live.', 'success');
          const formWrap = document.getElementById('writeReviewFormWrap');
          if (formWrap) formWrap.style.display = 'none';
          document.getElementById('productReviewForm')?.reset();
          
          state.currentProductReviews = state.currentProductReviews || [];
          state.currentProductReviews.unshift(data.review);
          renderProductReviews(state.currentProductReviews, isAr);
        } else {
          showToast(data.message || 'فشل نشر التقييم', 'error');
        }
      } catch (err) {
        showToast('خطأ في الاتصال بالخادم', 'error');
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = isAr ? 'نشر التقييم فوراً' : 'Submit Review';
        }
      }
    }
  });
});
