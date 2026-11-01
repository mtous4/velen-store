# 👕 VELEN OFFICIAL — E-COMMERCE PLATFORM & ADMIN CONTROL PORTAL
### Premium Everyday Essentials • Made in Jordan 🇯🇴

منصة متكاملة لبراند الملابس الأردني **VELEN Official** مصممة بدقة متناهية ومطابقة 100% للتصميم المطلوب في الصور ومقاطع الريلز، مع موقع منفصل وخاص بلوحة تحكم الأدمن وبث مباشر فوري (Real-Time Live Sync عبر WebSocket).

---

## 🌟 الروابط المباشرة للمشروع (Live Links)

- 🛍️ **المتجر الرسمي للزبائن (Storefront)**:
  👉 [http://localhost:3000](http://localhost:3000)
- 🛡️ **لوحة تحكم الأدمن السرية والمحمية (Stealth Admin Portal)**:
  👉 [http://localhost:3000/admin?key=velen-adm-sec-962](http://localhost:3000/admin?key=velen-adm-sec-962)
  *(ملاحظة: الدخول المباشر بدون المفتاح السري يعطي صفحة 404 Not Found للتمويه التام ومنع وصول أي عميل، مع وجود رمز PIN رئيسي: `2026`)*

---

## 🔒 إعداد الدومينات المنفصلة وحماية لوحة الأدمن (Dual-Domain & Stealth Isolation)

### 1. كيف يعمل نظام الحماية التام؟
- **تمويه 404 كامل (Stealth Mode):** إذا حاول أي عميل أو متطفل الدخول إلى رابط الأدمن أو تخمين الرابط، يظهر له خطأ `404 Not Found` وكأن الصفحة أو الدومين غير موجود إطلاقاً!
- **الرابط السري الخاص (Authorized Secret Link):** لا تفتح لوحة الأدمن إلا لمن يملك الرابط السري المزود بمفتاح الأمان، مثال:
  `https://admin-domain.com/?key=velen-adm-sec-962`
- **رمز المرور الرئيسي (Master PIN Passcode):** شاشة قفل مشفرة تطالب برمز الدخول (الافتراضي: `2026`) لفتح صلاحيات التحكم والتعديل.
- **عزل دومين المتجر:** دومين المتجر العام محمي برمجياً بحيث يمنع أي طلب للوحة الأدمن ويعطي 404 نهائياً.

### 2. كيفية ربط دومين للمتجر ودومين للأدمن
في ملف `.env`:
```env
PORT=3000
ADMIN_SECRET_KEY=velen-adm-sec-962
ADMIN_PASSCODE=2026

# عند رفع المشروع على السيرفر، أدخل الدومينات الخاصة بك:
STORE_DOMAIN=velen.com
ADMIN_DOMAIN=admin.velen.com
```
- **دومين المتجر (`STORE_DOMAIN`):** يتم ربطه بسيرفرك، وعند الدخول إليه يظهر متجر الملابس فقط، ومسار الأدمن محجوب بـ 404.
- **دومين الأدمن (`ADMIN_DOMAIN`):** يمكن أن يكون Subdomain مجاني مثل `admin.velen.com` أو دومين خاص تماماً مثل `velen-manage.com`، ولا يفتح إلا بالرابط السري مع رمز الـ PIN.

---

## 🛠️ كيفية تشغيل المشروع

المشروع يعمل حالياً بالخلفية عبر Node.js Express. وفي حال أردت تشغيله مستقبلاً:

```bash
cd "C:\Users\Mahmoud Al-Tous\.gemini\antigravity-ide\scratch\velen-store"
node server.js
```
ثم افتح المتصفح على:
- المتجر: `http://localhost:3000`
- لوحة الأدمن السرية: `http://localhost:3000/admin?key=velen-adm-sec-962` (رمز الـ PIN: `2026`)

