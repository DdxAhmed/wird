# وِرد | Wird

<div align="center">
  <img src="resources/icon.png" width="128" height="128" alt="Wird Logo" />
  <h3>تطبيق مكتبي هادئ ومفتوح المصدر للتذكير بأذكار الصباح والمساء والورد اليومي</h3>
  <p><strong>A calm, open-source Windows desktop reminder for morning & evening remembrance and daily Quran wird.</strong></p>
</div>

---

## 📖 نظرة عامة | Overview

«وِرد» تطبيق سطح مكتب صُمم خصيصًا لمن يعمل على حاسوبه المحمول أو المكتبي وينسى أوراده اليومية بمجرد انشغاله بالعمل وتدفق المهام. 

التطبيق ليس قارئًا للقرآن أو مستودعًا للنصوص في نسخته الأولى، بل هو **أداة تذكير هادئة ومستقلة** تعمل في الخلفية بكفاءة عالية، تنبهك عند حلول وقت الورد، وتتيح لك تأكيد الإنجاز أو التأجيل، وتعمل بالكامل محليًا دون الحاجة إلى اتصال دائم بالإنترنت أو إنشاء حساب أو دفع اشتراكات.

---

## ✨ المميزات الرئيسية | Key Features

- **المهام الافتراضية الثلاث**: أذكار الصباح، أذكار المساء، والورد القرآني اليومي، مع فترات استحقاق مرنة قابلة للتعديل.
- **محرك جدولة حتمي وذاتي الاستقلال**:
  - معالجة دقيقة للفترات الزمنية العابرة لمنتصف الليل مع توليد معرّف دورة فريد (`occurrenceId`) لمنع التكرار أو فتح المهام المنجزة.
  - استمرار التذكيرات في الخلفية حتى بعد إغلاق نافذة التطبيق دون الاعتماد على بقاء واجهة React مفتوحة.
  - إعادة تقييم التذكيرات فور استيقاظ الجهاز من السكون (`powerMonitor.on('resume')`) أو فتح القفل دون إغراق المستخدم بالإشعارات المتأخرة.
- **إشعارات Windows المتوافقة والتفاعلية**:
  - تنبيهات واضحة باللغة العربية باسم المهمة، مع دعم تأكيد القراءة، والتأجيل، أو فتح التطبيق.
  - إمكانية كتم أصوات التنبيه، وإلغاء تكديس التنبيهات، ودمج المهام المتزامنة في إشعار ملخص ذكي.
- **علبة النظام (System Tray) والتشغيل التلقائي**:
  - بدء التشغيل التلقائي الهادئ عند تسجيل الدخول إلى Windows (`app.setLoginItemSettings`).
  - قائمة سريعة تتيح الاطلاع على المهام المستحقة، وإيقاف التذكيرات مؤقتًا (30 دقيقة، ساعة، ساعتان، بقية اليوم)، والبحث عن تحديثات.
  - قفل النسخة الواحدة (Single Instance Lock) لمنع تكرار التشغيل.
- **تخزين محلي ذري وحماية البيانات**:
  - حفظ البيانات في مجلد `userData` الخاص بالتطبيق باستقلالية عن ملفات التثبيت.
  - كتابة ذرية (Atomic Write via Temp File Rename) لمنع تلف البيانات عند انقطاع التيار الكهربائي.
  - نظام ترقيات Schema آمن مع نسخ احتياطي تلقائي قبل أي ترقية، وآلية إنقاذ للملفات التالفة.
  - تصدير واستيراد النسخ الاحتياطية بصيغة JSON مع معاينة التغييرات وتأكيد المستخدم.
  - **خصوصية مطلقة**: لا يتضمن التطبيق أي تتبع (Analytics) أو جمع بيانات شخصية.
- **تحديث تلقائي عبر GitHub Releases**:
  - تكامل متين مع `electron-updater` للبحث الدوري واليدوي عن التحديثات وتنزيلها وتطبيقها بنقرة زر.
- **واجهة مستخدم عصرية وهادئة**:
  - دعم كامل للغة العربية (RTL) مع إمكانية التبديل إلى الإنجليزية (LTR).
  - دعم المظهر الفاتح (Light) والداكن (Dark) أو التلقائي حسب مظهر نظام Windows.
  - سجل إنجاز أسبوعي لآخر 7 أيام لمتابعة التزامك بهدوء ودون إشعار بالذنب.
  - معالج إعداد أولي (Onboarding Wizard) لإرشادك في خطوات الإعداد الأولى.

---

## 🛠 التقنيات المستخدمة | Tech Stack

- **Electron**: منصة سطح المكتب الحديثة (الإصدار 33+).
- **React 18 + TypeScript**: واجهة مستخدم سريعة ومكتوبة الأنواع بدقة.
- **electron-vite & Vite 5**: أداة بناء وتطوير فائقة السرعة للمراحل الثلاث (Main, Preload, Renderer).
- **Tailwind CSS**: تصميم عصري متوافق مع Windows 11 ومبادئ التصميم الحديثة.
- **electron-builder**: لبناء حزم التثبيت NSIS لنظام Windows.
- **electron-updater**: لتنزيل التحديثات بأمان من GitHub Releases.
- **Vitest**: بيئة اختبارات مؤتمتة لمنطق الجدولة والترقيات والتخزين.

---

## 🚀 البدء والتشغيل محليًا | Getting Started

### 1. المتطلبات المسبقة
- تثبيت [Node.js](https://nodejs.org/) (إصدار 20 LTS أو أحدث).
- تثبيت [pnpm](https://pnpm.io/) (`npm install -g pnpm`).

### 2. تثبيت الحزم وإعداد المشروع
```bash
# استنساخ المستودع
git clone https://github.com/wird-app/wird.git
cd wird

# تثبيت الاعتماديات
pnpm install

# تنزيل وفحص ثنائيات Electron
node ./node_modules/electron/install.js
```

### 3. أوامر التطوير والفحص
```bash
# تشغيل التطبيق في وضع التطوير (Hot Module Replacement)
pnpm dev

# تشغيل اختبارات الوحدة المؤتمتة (Vitest)
pnpm test

# فحص صحة الأنواع البرمجية (TypeScript Typecheck)
pnpm run typecheck

# بناء ملفات الإنتاج (Production Build)
pnpm run build

# حزم مثبت Windows (NSIS Installer) محليًا
pnpm run dist
```

---

## 🔄 التحديث التلقائي وسير العمل عبر GitHub Releases | Auto-Updates

يستخدم التطبيق مكتبة `electron-updater` بالاتصال مع مستودع GitHub العام:

### آلية عمل التحديثات:
1. **البحث التلقائي واليدوي**: يتحقق التطبيق بعد 15 ثانية من التشغيل، ثم دوريًا كل 4 ساعات، أو يدويًا من شاشة الإعدادات أو علبة النظام.
2. **المستودع العام**: قراءة بيانات الإصدارات لا تتطلب أي توكن أو سر مضمن في التطبيق.
3. **التنزيل الآمن**: يتم تنزيل حزمة التحديث والمقارنة عبر ملف `latest.yml` وبصمات الـ hash (Blockmap).
4. **التطبيق الآمن**: يُعرض للمستخدم خيار «إعادة التشغيل والتثبيت» في الوقت الذي يناسبه، مع حفظ حالة البيانات بالكامل قبل الخروج.

### متطلبات التوقيع الرقمي لنظام Windows (Authenticode Signing):
لبناء نسخة موقعة رقميًا في سير عمل GitHub Actions، يلزم ضبط الأسرار التالية في إعدادات المستودع (**Settings > Secrets and variables > Actions**):
- `WIN_CSC_LINK`: رابط مشفر أو ملف بصيغة Base64 لشهادة توقيع البرمجيات (`.pfx`).
- `WIN_CSC_KEY_PASSWORD`: كلمة مرور الشهادة.

> [!NOTE]
> عند عدم توفر شهادة مدفوعة، يمكن بناء التطبيق كنسخة غير موقعة (Unsigned). سيعرض Windows رسالة فحص SmartScreen المعتادة للملفات المحملة لأول مرة حتى يكتسب الملف سمعة وثقة (Reputation).

---

## 🧪 خطوات تجربة التحديث بين نسختين | Testing Updates Workflow

لاختبار تدفق التحديث التلقائي بشكل عملي:
1. ابنِ وثبّت الإصدار `1.0.0` على جهاز Windows.
2. عدّل `package.json` إلى الإصدار `1.0.1`، وابنِ الحزمة (`pnpm run dist`).
3. انشر الإصدار `v1.0.1` على GitHub Releases وأرفق الملفات الثلاثة الناتجة في مجلد `dist`:
   - `Wird-Setup-1.0.1.exe`
   - `latest.yml`
   - `Wird-Setup-1.0.1.exe.blockmap`
4. افتح الإصدار `1.0.0` المثبت؛ سيتعرف التطبيق تلقائيًا على الإصدار `1.0.1`، ويعرض شريط التقدم، ثم يتيح إعادة التشغيل للتثبيت دون فقدان أي إعدادات أو سجلات سابقة.

---

## 🛡️ الأمان والخصوصية | Security & Privacy

- **Context Isolation**: معزول بالكامل لمنع أي تداخل بين واجهة الويب ونظام التشغيل.
- **Node Integration**: معطل في الواجهة (`nodeIntegration: false`).
- **No External CDN**: جميع الخطوط والأيقونات والأصول مدمجة محليًا.
- **Safe External Navigation**: تفتح جميع الروابط الخارجية في متصفح النظام الافتراضي بعد التحقق من عنوانها.

---

## 📄 الترخيص | License

هذا المشروع مرخص بموجب رخصة [MIT](LICENSE).

<div dir="ltr">

---

## English Summary

**Wird** is a calm, lightweight, and fully offline-first desktop application built with Electron, React, and TypeScript to help Muslims maintain their daily Morning and Evening Adhkar and Quran Wird while working on their PC.

### Features
- **3 Core Tasks**: Morning Adhkar, Evening Adhkar, and Daily Wird with customizable reminder windows and intervals.
- **Deterministic Scheduling**: Handles periods spanning past midnight with deterministic cycle occurrence IDs.
- **Windows Integration**: Native notifications, quiet startup to System Tray, auto-start on Windows login.
- **Offline & Private**: Atomic local JSON storage with automatic backup, schema migrations, and zero telemetry.
- **Seamless Updates**: Powered by `electron-updater` from GitHub Releases.
- **Modern Fluent UI**: Arabic (RTL) and English (LTR), Dark/Light/System theme modes, and 7-day accomplishment history.

</div>
