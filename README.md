# BESTCAR FIXES – الموقع

ملفات الموقع (HTML + CSS + JavaScript) جاهزة، وبيانات Firebase مضبوطة في `firebase-config.js`.

## الملفات
- `index.html` الموقع العام
- `admin.html` لوحة التحكم (الرابط: .../admin.html)
- `check.html` صفحة فحص تعرض بالعربية ما يعمل وما يفشل
- `firebase-config.js` إعدادات Firebase
- `firestore.rules` قواعد الحماية (تُلصق في Firebase)

## النشر على GitHub
1. ضع كل الملفات في مجلد المستودع (استبدل القديم).
2. `git add -A` ثم `git commit -m "site"` ثم `git push`.
3. GitHub ← Settings ← Pages ← Branch: main ← Folder: / (root) ← Save.

## إعداد Firebase (مرة واحدة)
1. **Firestore Database** ← Create database.
2. **Firestore ← Rules** ← الصق محتوى `firestore.rules` ← Publish.
3. **Authentication ← Sign-in method** ← فعّل Email/Password.
4. **Authentication ← Users ← Add user** ← أنشئ بريداً وكلمة مرور للمدير.
5. **Authentication ← Settings ← Authorized domains** ← أضف `hamedabdallamohamad-sudo.github.io`.
6. سجّل الدخول في `admin.html`؛ سيظهر أعلى الصفحة الـ UID الخاص بك. إن اختلف عن المكتوب في `firestore.rules` (`request.auth.uid`) فاستبدله ثم Publish.

## الفحص
افتح `check.html` على موقعك، فتظهر علامات ✔ و ✘ تبيّن السبب.
