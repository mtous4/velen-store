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
      fabricCare: 'دليل العناية بالملابس (260 GSM)',
      termsOfService: 'الشروط والأحكام والتوصيل',
      footerCopyright: '© 2026 VELEN OFFICIAL. صنع بكل فخر في عمّان، الأردن 🇯🇴',
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
      breadcrumbShipping: 'الشحن والتبديل',
      policyShippingTitle: 'سياسة الشحن والتبديل',
      policyShippingSub: 'معاينة المقاس عند الاستلام • توصيل مجاني في عمّان • 1 دينار للمحافظات',
      shippingBadgeRates: 'توصيل سريع وموثوق',
      policyDeliveryHeading: 'مواعيد وأسعار التوصيل',
      shippingBadgeExchange: 'بدون أي مخاطرة',
      policyExchangeHeading: 'التبديل الفوري عند باب البيت',
      shippingBadgePayment: 'مرونة الدفع',
      policyPaymentHeading: 'خيارات الدفع المتاحة',
      policyContactHeading: 'هل تحتاج مساعدة في طلبك؟',
      policyContactText: 'فريق فيلين متواجد يومياً عبر واتساب لمساعدتك في اختيار المقاس أو تعديل العنوان فوراً.',
      // Care View
      breadcrumbCare: 'دليل العناية بالملابس',
      carePageTitle: 'دليل العناية بالقطن الثقيل 260 GSM',
      carePageSub: 'بروتوكول الحفاظ على النسيج وقَصّة البوكسي لسنوات طويلة',
      careBadge: 'ميزات قطن 260 GSM',
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
      fabricCare: 'Fabric & Garment Care Guide (260 GSM)',
      termsOfService: 'Terms & Shipping Policy',
      footerCopyright: '© 2026 VELEN OFFICIAL. Made with pride in Amman, Jordan 🇯🇴',
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
      breadcrumbShipping: 'Shipping & Policy',
      policyShippingTitle: 'SHIPPING & EXCHANGE POLICY',
      policyShippingSub: 'DOORSTEP SIZE INSPECTION • FREE AMMAN DELIVERY • 1 JD GOVERNORATES',
      shippingBadgeRates: 'FAST & RELIABLE',
      policyDeliveryHeading: 'Delivery Timeline & Rates',
      shippingBadgeExchange: 'ZERO RISK',
      policyExchangeHeading: 'Instant Doorstep Size Exchange',
      shippingBadgePayment: 'PAYMENT FLEXIBILITY',
      policyPaymentHeading: 'Flexible Payment Options',
      policyContactHeading: 'Need Help with Your Order?',
      policyContactText: 'Our team in Amman is available on WhatsApp daily for instant size recommendations, address adjustments, or order questions.',
      // Care View
      breadcrumbCare: 'Fabric Care Guide',
      carePageTitle: 'FABRIC & GARMENT CARE GUIDE (260 GSM)',
      carePageSub: 'HEAVYWEIGHT COMBED COTTON LONGEVITY PROTOCOL',
      careBadge: 'THE 260 GSM ADVANTAGE',
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
  let activeLockCount = 0;
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

    await fetchSettings();
    await fetchDesign();
    await fetchProducts();
    await fetchCommunity();
    await fetchReviews();
    updateCartUI();
    initWebSocket();
    initComingSoonTimer();
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
    
    // Care Guide Dynamic Render
    const careIntroDescEl = document.getElementById('careIntroDesc');
    const careIntroTitleEl = document.getElementById('careIntroTitle');
    const pageCareTitleEl = document.getElementById('pageCareMainTitle');
    
    if (policies?.care) {
      if (careIntroDescEl) {
        const text = isAr ? policies.care.introAr : policies.care.introEn;
        if (text) careIntroDescEl.textContent = text;
      }
      if (careIntroTitleEl) {
        const title = isAr ? (policies.care.titleAr || 'دليل العناية بالقطن') : (policies.care.titleEn || 'Engineered to Endure');
        if (title) careIntroTitleEl.textContent = title;
      }
      if (pageCareTitleEl) {
        const title = isAr ? policies.care.titleAr : policies.care.titleEn;
        if (title) pageCareTitleEl.textContent = title;
      }
    }
  }

  // Render Featured Drops on the Home Page
  function renderFeaturedProducts() {
    const grid = document.getElementById('homeFeaturedGrid');
    if (!grid) return;
    if (!state.products || state.products.length === 0) {
      grid.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; color: #888; padding: 30px;">Loading featured pieces...</div>';
      return;
    }

    const featured = state.products.slice(0, 4);
    const isAr = state.activeLang === 'ar';
    const dict = translations[state.activeLang] || translations.en;

    grid.innerHTML = featured.map(product => {
      const priceFormatted = Number(product.price).toFixed(3) + ' JOD';
      const comparePriceFormatted = product.comparePrice ? Number(product.comparePrice).toFixed(3) + ' JOD' : null;
      const mainImg = product.image || (product.images && product.images[0]) || '/assets/velen-hero-clean.jpg';

      return `
        <div class="product-card" data-product-id="${product.id}">
          <div class="product-img-wrapper" onclick="window.velenApp.openProductModal('${product.id}')">
            ${product.onSale ? '<span class="badge-sale">SALE</span>' : ''}
            <img src="${mainImg}" alt="${product.name}" class="product-img" loading="lazy" onerror="this.src='/assets/velen-hero-clean.jpg'">
            <button class="btn-floating-bag" onclick="event.stopPropagation(); window.velenApp.quickAddToCart('${product.id}')" title="${dict.addToBag}" aria-label="Add to bag">
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

    // Check Coming Soon Overlay
    initComingSoonTimer();
  }

  async function fetchProducts() {
    try {
      const res = await fetch('/api/products');
      state.products = await res.json();
      renderProducts();
      renderFeaturedProducts();
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

  async function fetchReviews() {
    try {
      const res = await fetch('/api/reviews');
      state.reviews = await res.json();
      renderReviewsSection();
    } catch (err) {
      console.error('Error fetching reviews:', err);
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

  // ================= CART MANAGEMENT =================
  function addToCart(product, size = 'M', quantity = 1, color = null) {
    const colorObj = color || (product.colors && product.colors[0]) || null;
    const colorName = colorObj ? (typeof colorObj === 'object' ? colorObj.name : colorObj) : '';
    const colorHex = colorObj && typeof colorObj === 'object' ? colorObj.hex : '';
    const itemImage = (colorObj && colorObj.images && colorObj.images[0]) || product.image || '/assets/velen-logo.jpg';

    const existingIndex = state.cart.findIndex(
      item => item.id === product.id && item.size === size && (item.color || '') === colorName
    );

    if (existingIndex > -1) {
      state.cart[existingIndex].quantity += quantity;
    } else {
      state.cart.push({
        id: product.id,
        name: product.name,
        price: Number(product.price),
        image: itemImage,
        size: size,
        color: colorName,
        colorHex: colorHex,
        quantity: quantity
      });
    }

    saveCart();
    updateCartUI();
    openCart();
    const itemDesc = `${product.name} (${size}${colorName ? ` - ${colorName}` : ''})`;
    showToast(state.activeLang === 'ar' ? `تمت إضافة "${itemDesc}" إلى حقيبة التسوق!` : `Added "${itemDesc}" to your bag!`, 'success');
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
            <div class="cart-item-meta">
              <span>المقاس: <strong>${item.size}</strong></span>
              ${item.color ? ` • <span>اللون: <strong style="color:var(--accent-gold);">${item.color}</strong></span>` : ''}
            </div>
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

    container.innerHTML = `
      <div class="prod-page-grid">
        <div class="prod-page-gallery">
          <div class="gallery-main-frame">
            <img id="pageProductMainImg" src="${currentImages[0]}" alt="${product.name}" class="prod-page-main-img" onerror="this.src='/assets/velen-logo.jpg'">
          </div>
          <div class="prod-page-thumbs-strip" id="pageProductThumbsContainer" style="${currentImages.length > 1 ? 'display:flex;' : 'display:none;'} gap:8px; margin-top:12px; overflow-x:auto; padding-bottom:4px;">
            ${currentImages.map((imgUrl, i) => `
              <button type="button" class="prod-thumb-btn ${i === 0 ? 'active' : ''}" onclick="window.velenApp.switchProductPageImage('${imgUrl}', this)" style="width:62px; height:62px; border-radius:8px; overflow:hidden; border:${i === 0 ? '2px solid #e5b95f' : '1.5px solid #333'}; background:#111; padding:0; cursor:pointer; flex-shrink:0;">
                <img src="${imgUrl}" alt="${product.name} ${i + 1}" style="width:100%; height:100%; object-fit:cover;" onerror="this.src='/assets/velen-logo.jpg'">
              </button>
            `).join('')}
          </div>
        </div>
        <div class="prod-page-info">
          <span class="prod-page-cat">${product.category || 'ESSENTIALS'} • MADE IN JORDAN</span>
          <h1 class="prod-page-title">${product.name}</h1>
          <div class="prod-page-price-row">
            <span class="prod-page-price-current">${priceFormatted}</span>
            ${comparePriceFormatted ? `<span class="prod-page-price-strike">${comparePriceFormatted}</span>` : ''}
          </div>

          <!-- Color Swatches (Shown when 2 or more colors exist) -->
          ${colors.length > 1 ? `
            <div class="prod-colors-section">
              <div class="prod-colors-header">
                <span class="prod-colors-label">${isAr ? 'اللون المختار:' : 'Selected Color:'} <strong id="prodSelectedColorName">${state.selectedColor.name}</strong></span>
                <span class="prod-color-hint">${isAr ? `${colors.length} ألوان متوفرة` : `${colors.length} colors available`}</span>
              </div>
              <div class="prod-color-swatches" id="pageProductColorSwatches">
                ${colors.map((c, i) => {
                  const isLight = c.hex && ['#fff', '#ffffff', '#f5f5f5', '#eee', '#e8e8e8', '#fafafa'].includes(c.hex.toLowerCase());
                  const isSelected = i === activeColorIdx;
                  return `
                    <button type="button" 
                      class="color-swatch-btn ${isLight ? 'light-swatch' : ''} ${isSelected ? 'active' : ''}" 
                      style="background-color: ${c.hex || '#111'};"
                      title="${c.name}"
                      aria-label="${c.name}"
                      onclick="window.velenApp.selectProductColor(${i})">
                      <i class="fa-solid fa-check swatch-check" style="color: ${isLight ? '#000' : '#fff'};"></i>
                    </button>
                  `;
                }).join('')}
              </div>
            </div>
          ` : ''}

          <!-- Prominent Size Selection Buttons -->
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

          <!-- Dual CTAs: Add to Bag AND Buy Now Direct -->
          <div class="prod-page-cta-row">
            <button type="button" class="btn-add-to-bag-page" id="btnPageAddToBag" onclick="window.velenApp.addCurrentModalToCart()" ${allOutOfStock ? 'disabled' : ''}>
              <i class="fa-solid fa-bag-shopping"></i>
              <span>${allOutOfStock ? dict.soldOut : `${dict.addToBag}`}</span>
            </button>
            <button type="button" class="btn-buy-now-direct" id="btnPageBuyNow" onclick="window.velenApp.buyNowDirect()" ${allOutOfStock ? 'disabled' : ''}>
              <i class="fa-solid fa-bolt"></i>
              <span>${isAr ? 'اشتريها الآن ⚡' : 'Buy Now ⚡'}</span>
            </button>
          </div>

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

      <!-- Temu-Style Product Customer Reviews Section (Separate from Velen Community) -->
      <section class="prod-reviews-section" id="productReviewsSection">
        <div class="prod-reviews-header">
          <div class="reviews-header-top">
            <div>
              <h2 class="reviews-main-title">
                ${isAr ? 'تقييمات وآراء المشترين الموثقة' : 'Customer Reviews & Ratings'}
                <span class="temu-verified-badge"><i class="fa-solid fa-circle-check"></i> ${isAr ? 'مشترون موثقون' : 'Verified Purchases'}</span>
              </h2>
              <p class="reviews-sub-title">${isAr ? 'تقييمات حقيقية من زبائن اشتروا هذه القطعة وجربوها' : 'Real reviews from customers who purchased and wore this piece'}</p>
            </div>
            <button type="button" class="btn-write-review" onclick="window.velenApp.toggleReviewForm('${product.id}')">
              <i class="fa-solid fa-pen"></i> ${isAr ? 'كتابة تقييم للقطعة' : 'Write a Review'}
            </button>
          </div>

          <!-- Overall Score & Rating Stats (Temu Style) -->
          <div class="reviews-score-card">
            <div class="score-big-box">
              <div class="score-num">4.9</div>
              <div class="score-stars">★★★★★</div>
              <div class="score-count" id="prodReviewsCountLabel">${isAr ? '48 تقييم موثق' : '48 verified ratings'}</div>
            </div>

            <div class="score-bars-box">
              <div class="score-bar-row">
                <span>5 ★</span>
                <div class="bar-track"><div class="bar-fill" style="width: 94%;"></div></div>
                <span class="bar-pct">94%</span>
              </div>
              <div class="score-bar-row">
                <span>4 ★</span>
                <div class="bar-track"><div class="bar-fill" style="width: 6%;"></div></div>
                <span class="bar-pct">6%</span>
              </div>
              <div class="score-bar-row">
                <span>3 ★</span>
                <div class="bar-track"><div class="bar-fill" style="width: 0%;"></div></div>
                <span class="bar-pct">0%</span>
              </div>
            </div>

            <div class="score-consensus-box">
              <div class="consensus-item">
                <i class="fa-solid fa-thumbs-up"></i>
                <div>
                  <strong>${isAr ? '98% قالوا: المقاس مطابق تماماً' : '98% say: True to size'}</strong>
                  <small>${isAr ? 'قصّة بوكسي مريحة مناسبة للارتداء اليومي' : 'Comfortable boxy everyday fit'}</small>
                </div>
              </div>
              <div class="consensus-item">
                <i class="fa-solid fa-shield-halved"></i>
                <div>
                  <strong>${isAr ? '99% راضون عن ثقل وجودة القماش 260 GSM' : '99% satisfied with 260 GSM cotton quality'}</strong>
                  <small>${isAr ? 'قطن أردني محبوك لا ينكمش' : 'Combed durable heavyweight cotton'}</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Write Review Form (Collapsible) -->
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
                <label>${isAr ? 'رأيك بملاءمة المقاس (Fit Feedback)' : 'Fit Consensus'}</label>
                <select id="revFit">
                  <option value="True to size (مطابق للمقاس تماماً)">${isAr ? 'مطابق للمقاس تماماً (True to size)' : 'True to size'}</option>
                  <option value="Runs slightly large (أكبر قليلاً)">${isAr ? 'أكبر قليلاً (Runs slightly large)' : 'Runs slightly large'}</option>
                  <option value="Runs slightly small (أصغر قليلاً)">${isAr ? 'أصغر قليلاً (Runs slightly small)' : 'Runs slightly small'}</option>
                </select>
              </div>
            </div>
            <div class="form-group" style="margin-top:12px;">
              <label>${isAr ? 'تجربتك مع القطعة والقماش *' : 'Your Review & Quality Experience *'}</label>
              <textarea id="revComment" rows="3" required placeholder="${isAr ? 'صف ملمس القماش، المقاس، وسرعة التوصيل...' : 'Describe fabric quality, fit, and delivery experience...'}"></textarea>
            </div>
            <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:12px;">
              <button type="button" class="btn-cancel-review" onclick="window.velenApp.toggleReviewForm('${product.id}')">${isAr ? 'إلغاء' : 'Cancel'}</button>
              <button type="submit" class="btn-submit-review" id="btnSubmitReview">${isAr ? 'نشر التقييم فوراً' : 'Submit Review'}</button>
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
  }

  // ================= COMMUNITY SUBMISSION =================
  let uploadedMediaUrl = null;
  let uploadedMediaType = 'photo';
  let commFormInitialized = false;

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
      const formData = new FormData();
      formData.append('media', file);

      if (dropzoneText) {
        dropzoneText.textContent = state.activeLang === 'ar' ? 'جاري رفع الملف إلى السيرفر...' : 'Uploading file to server...';
      }

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
              preview.innerHTML = `<video src="${uploadedMediaUrl}" controls autoplay muted style="width:100%; height:200px; object-fit:cover; border-radius:8px;"></video>`;
            } else {
              preview.innerHTML = `<img src="${uploadedMediaUrl}" alt="Preview" style="width:100%; height:200px; object-fit:cover; border-radius:8px;">`;
            }
          }
          if (clearMediaBtn) clearMediaBtn.style.display = 'inline-block';
          showToast(state.activeLang === 'ar' ? 'تم رفع الصورة / الفيديو بنجاح! 🎉' : 'Photo/video uploaded successfully! 🎉', 'success');
        } else {
          showToast(data.message || 'Upload failed', 'error');
          if (dropzoneText) {
            dropzoneText.textContent = state.activeLang === 'ar' ? 'اسحب وأفلت الصورة أو الفيديو هنا أو اضغط للاختيار' : 'Drag & drop photo or video here, or click to choose';
          }
        }
      } catch (err) {
        console.error('Upload error:', err);
        showToast(state.activeLang === 'ar' ? 'فشل الرفع، يرجى المحاولة ثانية' : 'Upload failed, please try again', 'error');
        if (dropzoneText) {
          dropzoneText.textContent = state.activeLang === 'ar' ? 'اسحب وأفلت الصورة أو الفيديو هنا أو اضغط للاختيار' : 'Drag & drop photo or video here, or click to choose';
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

    // Cart Drawer
    document.getElementById('cartToggleBtn')?.addEventListener('click', openCart);
    document.getElementById('cartCloseBtn')?.addEventListener('click', closeCart);
    cartOverlay?.addEventListener('click', closeCart);
    document.getElementById('openCheckoutBtn')?.addEventListener('click', openCheckout);

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
  window.velenApp = {
    navigateTo: (viewName) => navigateTo(viewName, true),
    showView: (viewName) => showView(viewName, true),
    handleOrderLookup: (e) => handleOrderLookup(e),
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

      const swatches = document.querySelectorAll('.color-swatch-btn');
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

      const thumbsContainer = document.getElementById('pageProductThumbsContainer');
      if (thumbsContainer) {
        if (colorImages.length > 1) {
          thumbsContainer.style.display = 'flex';
          thumbsContainer.innerHTML = colorImages.map((imgUrl, i) => `
            <button type="button" class="prod-thumb-btn ${i === 0 ? 'active' : ''}" onclick="window.velenApp.switchProductPageImage('${imgUrl}', this)" style="width:62px; height:62px; border-radius:8px; overflow:hidden; border:${i === 0 ? '2px solid #e5b95f' : '1.5px solid #333'}; background:#111; padding:0; cursor:pointer; flex-shrink:0;">
              <img src="${imgUrl}" alt="${c.name} ${i + 1}" style="width:100%; height:100%; object-fit:cover;" onerror="this.src='/assets/velen-logo.jpg'">
            </button>
          `).join('');
        } else {
          thumbsContainer.style.display = 'none';
          thumbsContainer.innerHTML = '';
        }
      }
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
        const color = state.selectedColor || (p.colors && p.colors[0]) || null;
        addToCart(p, size, 1, color);
        openCart();
      }
    },
    buyNowDirect: () => {
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
        const color = state.selectedColor || (p.colors && p.colors[0]) || null;
        addToCart(p, size, 1, color);
        closeCart();
        openCheckout();
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
    switchProductPageImage: (url, btn) => {
      const mainImg = document.getElementById('pageProductMainImg');
      if (mainImg) mainImg.src = url;
      document.querySelectorAll('.prod-thumb-btn').forEach(b => {
        b.style.border = '1px solid #333';
      });
      if (btn) btn.style.border = '2px solid #e5b95f';
    },
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
  };
});
