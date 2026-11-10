# BESTCAR FIXES – دليل التشغيل

الموقع مكتوب بـ HTML + CSS + JavaScript بسيط (بدون أي تثبيت أو build)، ويعمل مباشرة على GitHub Pages.

## 1) إعداد Firebase
1. ادخل https://console.firebase.google.com ← **Add project**.
2. **Build ← Firestore Database ← Create database** (Production mode).
3. **Build ← Authentication ← Get started ← Email/Password ← Enable**، ثم من تبويب Users اضغط **Add user** وأنشئ حساب المدير (بريد + كلمة مرور).
4. **Project settings ← Your apps ← Web (</>)** ← انسخ بيانات الإعداد والصقها داخل `firebase-config.js`.
5. **Firestore ← Rules** ← الصق القواعد التالية (غيّر البريد إلى بريد المدير) ثم Publish:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{db}/documents {
    function admin() { return request.auth != null && request.auth.token.email == "YOUR_ADMIN_EMAIL"; }
    match /orders/{id}       { allow create: if true; allow read, update, delete: if admin(); }
    match /appointments/{id} { allow create: if true; allow read, update, delete: if admin(); }
    match /{c}/{id} {
      allow read: if c in ["settings","services","products","categories","banners","videos"];
      allow write: if admin();
    }
  }
}
```

## 2) النشر على GitHub
1. أنشئ مستودعاً جديداً على GitHub وارفع الملفات الأربعة (index.html, admin.html, firebase-config.js, README.md).
2. **Settings ← Pages ← Branch: main / root ← Save**. سيظهر الرابط `https://USERNAME.github.io/REPO/`.
3. في Firebase: **Authentication ← Settings ← Authorized domains ← Add domain** وأضف `USERNAME.github.io`.

## 3) لوحة التحكم
- الرابط: `.../admin.html` (غير مرتبط بأي مكان في الموقع). يمكنك تغيير اسم الملف إلى اسم سري ثم استخدامه.
- أول خطوة: من **الإعدادات** أدخل الشعار ورقم واتساب (مثال 9665XXXXXXXX) وبيانات التواصل، ثم أضف الخدمات والمنتجات.

## ملاحظات
- الصور تُضغط تلقائياً وتُحفظ داخل Firestore (مجاناً)، لأن Firebase Storage يتطلب الآن خطة مدفوعة.
- الباقة المجانية من Firestore كافية لمتجر صغير/متوسط.
