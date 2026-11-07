# تطبيق «دعوة» | Da'wah App
### رفيقك الإيماني اليومي المتكامل · مفتوح المصدر (Open Source)

[![License: MIT](https://img.shields.io/badge/License-MIT-teal.svg?style=flat-square)](LICENSE)
[![React](https://img.shields.io/badge/React-18.2-blue?style=flat-square&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.4-purple?style=flat-square&logo=vite)](https://vitejs.dev/)
[![PWA](https://img.shields.io/badge/PWA-Ready-success?style=flat-square)](https://web.dev/progressive-web-apps/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](CONTRIBUTING.md)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FAbdullahTamer47%2Fdaawa)

---

**«دعوة»** هو تطبيق إسلامي رقمي متطور ومفتوح المصدر، يجمع بين دقة العلوم الشرعية والفقهية وأحدث تقنيات الويب الحديثة، بتصميم مستوحى بالكامل من **الهوية البصرية الرقمية لشركة bedigital 2026** (الخط الكوفي المربع وشبكة البكسل 24×24)، وخالٍ تماماً من الإعلانات المزعجة أو الرموز التعبيرية (Emoji-Free).

التطبيق صُمم ليعمل بسلاسة وتوافق تام على **الحواسيب المكتبية (Desktop) وشاشات الهواتف الذكية (Mobile)** كتطبيق ويب تقدمي (PWA) يعمل بدون اتصال بالإنترنت (Offline-First).

---

## روابط مهمة والنشر المباشر

* **المستودع الرسمي على GitHub:** [https://github.com/AbdullahTamer47/daawa](https://github.com/AbdullahTamer47/daawa)
* **النشر المباشر بنقرة واحدة على Vercel:**  
  [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FAbdullahTamer47%2Fdaawa)

---

## أبرز ميزات تطبيق «دعوة»

### 1. واجهة مستخدم متكيفة بالكامل (Desktop & Mobile)
* **على أجهزة الكمبيوتر والمكتب:** شريط تنقل علوي فاخر ومثبت (`DesktopNavbar`) يضم شعار التطبيق، روابط التنقل السريعة، مؤشرات السلسلة الحية، زر تبديل الوضع النهاري والليلي، وتخطيطات شبكية متعددة الأعمدة (`responsive-grid`).
* **على الهواتف المحمولة:** شريط تنقل سفلي مرن ومريح (`BottomNav`) يتناسب مع الاستخدام بيد واحدة ويدعم مساحات الآيفون والأندرويد الآمنة (`safe-area-inset`).

### 2. نظام السلسلة الإيمانية المزدوجة والاستعادة (Dual Streaks)
* تتبع مستقل ويومي لسلسلة **الصلوات الخمس المفروضة** وسلسلة **ورد قراءة القرآن الكريم**.
* ميزة **إصلاح وترجيع الستريك المكسور بحد أقصى 3 مرات شهرياً**، مع إعادة تعيين الرصيد تلقائياً أول كل شهر ميلادي.

### 3. الدروع التكيفية الذكية لحماية السلسلة
* **وضع المسافر (Traveler Mode):** يفعّل أحكام القصر والجمع، ويجمّد السلسلة بأمان طوال فترة السفر دون كسرها ودون استهلاك محاولات الإصلاح.
* **وضع العذر الشرعي أو المرض (Exemption Shield):** يجمّد السلسلة لمن تعذر عليهم الأداء مع رسائل طمأنينة نبوية وتثبيت كامل للإنجاز السابق.

### 4. أدوات فقهية وعملية ذكية
* **مُنقذ سجود السهو:** شجرة قرارات فقهية تفاعلية بـ 3 نقرات فقط لمعرفة موضع السجود (قبل السلام أم بعده) والحكم الشرعي في حالات الشك والزيادة والنقصان.
* **مُجدول قضاء الفوائت:** نظام مرن لتسجيل ديون الصلوات والصيام القديمة ومتابعة نسبة سدادها بمرور الأيام حتى تبرأ الذمة.
* **التسبيح في الظلام (Blind OLED Tasbeeh):** وضع خاص يحول الشاشة لسطح لمسي أسود بالكامل (`#000000`) مع منع إغلاق الشاشة عبر `Wake Lock API` واهتزاز لمسي (Haptics) كل 33 و100 تسبيحة.
* **المزج الصوتي للخشوع:** توليد أصوات طبيعية نقية (مطر خفيف، نسيم الفجر، خرير الجدول) برمجياً عبر `Web Audio API` دون تحميل أي ملفات صوتية خارجية أو استهلاك لباقة الإنترنت.
* **دفتر التدبر المشفر:** مفكرة خاصة برمز سري PIN لتسجيل خواطر الآيات ومحاسبة النفس دون إمكانية الوصول إليها من أي طرف خارجي.
* **فسيفساء العام البكسلية (365-Day Mosaic Grid):** سجل سنوي متكامل شبيه بشبكة مساهمات GitHub يعرض التزامك طوال العام بلون التيل والذهب.
* **حلقات الصحبة المصغرة (Micro-Squads):** غرف تشجيعية خاصة تضم حتى 7 أصدقاء بكود دخول من 6 أرقام.
* **النسخ الاحتياطي الشامل (.daawa):** تصدير واسترجاع كل بياناتك وتقدمك وسلاسل الأيام في ملف واحد بضغطة زر.

---

## التشغيل والتطوير المحلي (Quick Start)

### المتطلبات الأساسية
* مثبت [Node.js](https://nodejs.org/) (الإصدار 18 أو أحدث).
* مدير الحزم `npm` أو `yarn` أو `pnpm`.

### خطوات التشغيل

```bash
# 1. استنساخ المستودع
git clone https://github.com/AbdullahTamer47/daawa.git

# 2. الدخول إلى مجلد المشروع
cd daawa

# 3. تثبيت الاعتماديات
npm install

# 4. تشغيل خادم التطوير المحلي
npm run dev
```

افتح المتصفح على العنوان التالي: **`http://localhost:5173/`**

---

## بناء نسخة الإنتاج والنشر على Vercel

```bash
# بناء نسخة الإنتاج المحسنة وتوليد ملفات PWA
npm run build

# معاينة نسخة الإنتاج محلياً
npm run preview
```

### النشر على منصة Vercel يدوياً:
1. اذهب إلى [Vercel Dashboard](https://vercel.com/dashboard).
2. انقر على **"Add New Project"** ثم اختر مستودع **`daawa`** من حساب GitHub الخاص بك: `AbdullahTamer47/daawa`.
3. اضغط على **"Deploy"** مباشرة؛ حيث يحتوي المشروع على ملف `vercel.json` المضبوط مسبقاً للتعامل مع التوجيه في تطبيقات الصفحة الواحدة (SPA Rewrites).

---

## التقنيات المستخدمة (Tech Stack)

* **الواجهة الأمامية:** [React 18](https://react.dev/) مع [Vite 5](https://vitejs.dev/)
* **التوجيه (Routing):** [React Router DOM v6](https://reactrouter.com/)
* **الحسابات الفلكية للمواقيت:** [Adhan.js](https://github.com/batoulapps/adhan-js) للحساب الدقيق محلياً دون الحاجة لاتصال بالإنترنت
* **الصوتيات والاهتزاز:** Web Audio API · Vibration API · Wake Lock API
* **التخزين دون اتصال:** PWA Service Worker (Workbox) · LocalStorage
* **نظام التصميم:** مبني بنسبة 100% وفق كود هوية شركة bedigital لعام 2026

---

## المساهمة في المشروع (Contributing)

نرحب بكافة المساهمات والاقتراحات البرمجية والشرعية. يرجى الاطلاع على دليل المساهمة [CONTRIBUTING.md](CONTRIBUTING.md) للتعرف على معايير الكود وتنسيق طلبات السحب (Pull Requests).

---

## الترخيص والحقوق (License)

هذا المشروع مرخص تحت رخصة **[MIT License](LICENSE)** — متاح ومجاني للجميع للاستخدام والتعديل والتطوير ونيل الأجر بإذن الله.

* **تطوير وإشراف:** [عبدالله تامر (Abdullah Tamer)](https://github.com/AbdullahTamer47)
* **الهوية البصرية:** مبنية استناداً إلى دليل الهوية الرقمية **bedigital Brand Guidelines 2026**
