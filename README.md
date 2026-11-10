# BESTCAR FIXES – Backend (Java / Spring Boot)

خادم Java صغير يستقبل الطلبات والحجوزات من الموقع، ويفعل ما لا تستطيعه الصفحة الثابتة:
1. **يحسب الأسعار من Firestore** (لا يمكن للعميل التلاعب بالسعر).
2. **يحفظ الطلب في Firestore** (يظهر في لوحة التحكم كالمعتاد).
3. **يرسل إشعار واتساب تلقائياً** إلى رقمك عبر WhatsApp Cloud API دون أن يضغط العميل إرسال.

## 1) مفتاح Firebase للخادم
Firebase Console ← Project settings ← **Service accounts** ← **Generate new private key**.
افتح ملف JSON المحمّل وانسخ محتواه كاملاً: سيوضع في متغير البيئة `FIREBASE_CREDENTIALS_JSON`.
**لا ترفع هذا الملف إلى GitHub أبداً.**

## 2) واتساب Cloud API
1. https://developers.facebook.com ← Create app ← نوع Business ← أضف منتج **WhatsApp**.
2. من WhatsApp ← API Setup انسخ **Phone number ID**، وأنشئ **Access token** دائماً عبر System User (التوكن المؤقت ينتهي خلال ساعات).
3. أنشئ **Message template** اسمه `new_request` (Category: Utility، اللغة: Arabic) ونصه مثلاً: `طلب جديد: {{1}}` ثم انتظر الموافقة.
   - الرسائل التي يبدؤها النشاط التجاري تتطلب قالباً معتمداً، ولذلك يستخدم الخادم قالباً.
   - الرقم التجريبي من Meta يرسل فقط إلى أرقام مضافة ومؤكدة في لوحة التطبيق.
4. رقم المستلم يؤخذ من **إعدادات لوحة التحكم** (رقم طلبات المنتجات / رقم الصيانة / الرقم الرئيسي).
5. راجع صفحة أسعار واتساب لدى Meta لمعرفة رسوم المحادثات الحالية.

## 3) التشغيل محلياً
Java 17 و Maven، ثم:
```
export FIREBASE_CREDENTIALS_JSON='{...}'
export WHATSAPP_TOKEN=...
export WHATSAPP_PHONE_NUMBER_ID=...
mvn spring-boot:run
```
اختبر: `http://localhost:8080/api/health`

## 4) النشر (مثال: Render)
1. ارفع مجلد `bestcar-fixes-backend` إلى مستودع GitHub **منفصل**.
2. Render ← New ← **Web Service** ← اختر المستودع ← Runtime: **Docker**.
3. أضف متغيرات البيئة: `FIREBASE_CREDENTIALS_JSON`, `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`، واختيارياً `WHATSAPP_TEMPLATE` و `WHATSAPP_TEMPLATE_LANG` و `ALLOWED_ORIGINS`.
4. بعد النشر تحصل على رابط مثل `https://bestcar-backend.onrender.com`.
(بدائل: Google Cloud Run، Railway. راجع خطط الاستضافة الحالية، فقد تتوقف الخطط المجانية عند الخمول فيتأخر أول طلب.)

## 5) ربط الموقع
في ملف `firebase-config.js` في مشروع الموقع أضف سطراً:
```js
export const API = "https://bestcar-backend.onrender.com";
```
ثم ارفعه. إذا كان `API` فارغاً أو الخادم لا يعمل، يعود الموقع تلقائياً للطريقة القديمة (حفظ مباشر + رابط واتساب).

## 6) لاحقاً: تشديد الحماية
بعد التأكد أن الخادم يعمل، يمكنك في قواعد Firestore تعطيل `allow create` العام لـ `orders` و `appointments`، فلا يُنشئهما إلا الخادم (الذي يتجاوز القواعد). لكن هذا يُلغي الطريقة الاحتياطية.
