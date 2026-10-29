# تشغيل BESTCAR FIXES على Windows وVS Code

## نسخ المستودع
من VS Code اضغط Ctrl+Shift+P، واكتب Git: Clone، والصق:

    https://github.com/hamedabdallamohamad-sudo/best-car-fixes.git

اختر مجلدًا جديدًا مستقلًا مثل `D:\hamed\store\best-car-fixes`، ثم اضغط Open. لا تستخدم مجلد zayna أو النابع.
إذا طلب GitHub تسجيل الدخول، استخدم حساب صاحب المستودع الخاص.

## التثبيت والتشغيل
افتح Terminal > New Terminal داخل VS Code. يلزم Node.js 24 وGit. شغّل كل سطر منفردًا:

    npx.cmd pnpm@11.25.0 install --frozen-lockfile
    npx.cmd pnpm@11.25.0 build

أول مرة في هذه النسخة المحلية فقط: جهّز جداول قاعدة D1 المحلية الخاصة بالتوافق مع الطلبات السابقة:

    node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_yellow_devos.sql

هذا الأمر يستخدم `--local` ولا يمس قاعدة الموقع المنشور أو Firebase. لا تكرره إذا كانت الجداول المحلية أُنشئت من قبل.

بعدها شغّل:

    npx.cmd pnpm@11.25.0 dev

افتح الرابط الذي يطبعه Terminal. من `/admin` ادخل بحساب Firebase الذي أنشأته. لا ترسل كلمة المرور لأي شخص ولا تضعها في ملفات المشروع.

**مهم:** النسخة المحلية متصلة بمشروع Firebase الحقيقي. حفظ المنتجات والإعدادات أو إرسال طلب منها سيؤثر في البيانات المشتركة الفعلية. قاعدة D1 المحلية وصور R2 المحلية منفصلتان عن الاستضافة، لذلك صور الموقع المخزنة في R2 قد لا تظهر محليًا؛ لا تحفظ أو تستبدل صور الموقع من البيئة المحلية دون قصد.

## ما الذي نعدله؟
- `public/style.css`: شكل واجهة المتجر.
- `public/app.js`: تفاعلات المتجر.
- `app/storefront.ts`: هيكل صفحة المتجر.
- `app/admin/Dashboard.tsx`: لوحة التحكم.
- `app/admin/FirebaseLogin.tsx`: تسجيل الدخول.
- `app/firebase-config.ts`: إعدادات Firebase العامة ومعرّف المدير.
- `firestore.rules`: قواعد حماية البيانات؛ تعديل الملف وحده لا ينشر القواعد تلقائيًا.

## حفظ تعديلاتك في GitHub
من Source Control راجع التغييرات، واكتب وصفًا لها، ثم Commit ثم Sync Changes. رفع الكود لا ينشر الموقع تلقائيًا؛ تُراجع النسخة وتُنشر عبر الاستضافة الحالية.

GitHub Pages وحده لا يشغل خادم هذا المشروع أو رفع صور R2. لا تُفعّل Pages لهذا المشروع باعتباره بديلًا كاملًا للاستضافة.

لا ترفع ملفات كلمات المرور أو `.env` أو `.dev.vars` أو مفاتيح Service Account. إعدادات تطبيق Firebase العامة ليست بديلًا عن قواعد الحماية.
