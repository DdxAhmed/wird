# دليل المساهمة في تطوير «وِرد» | Contributing to Wird

شكرًا لاهتمامك بالمساهمة في مشروع «وِرد | Wird»! هذا المشروع مفتوح المصدر ومبني ليكون رفيقًا هادئًا يعين المسلم على ذكر الله والارتباط بكتابه أثناء انشغاله بالعمل على حاسوبه.

---

## متطلبات التطوير | Prerequisites

- **Node.js**: الإصدار 20 LTS أو الأحدث.
- **pnpm**: الإصدار 10 أو الأحدث (`npm install -g pnpm`).
- **Git**.

---

## إعداد بيئة التطوير | Local Development Setup

1. **استنساخ المستودع**:
   ```bash
   git clone https://github.com/wird-app/wird.git
   cd wird
   ```

2. **تثبيت الحزم وتنزيل ثنائيات Electron**:
   ```bash
   pnpm install
   node ./node_modules/electron/install.js
   ```

3. **تشغيل التطبيق في وضع التطوير (Hot Reload)**:
   ```bash
   pnpm dev
   ```

4. **تشغيل الاختبارات (Vitest)**:
   ```bash
   pnpm test
   ```

5. **فحص الأنواع البرمجية (TypeScript Check)**:
   ```bash
   pnpm run typecheck
   ```

6. **بناء نسخة الإنتاج محليًا**:
   ```bash
   pnpm run build
   ```

---

## معمارية المشروع | Architecture Overview

- `src/shared/`:
  - `types.ts`: تعريفات البيانات (Data models)، حالات المهام، قنوات IPC.
  - `constants.ts`: المهام الافتراضية، الإعدادات المبدئية، إصدار الـ Schema.
  - `scheduler.ts`: الحسابات الزمنية الدقيقة، حساب دورات المهام العابرة لمنتصف الليل، تحديد أوقات التنبيه والاستحقاق والتأجيل.
  - `migrations.ts`: معالجة ترقيات البيانات بين الإصدارات، التحقق من ملفات النسخ الاحتياطي المستوردة.
  - `i18n.ts`: قواميس الترجمة للغتين العربية والإنجليزية.
- `src/main/`:
  - `index.ts`: دورة حياة التطبيق، قفل النسخة الواحدة (Single Instance Lock)، شريط النظام (System Tray).
  - `store.ts`: محرك التخزين الذري المحلي (Atomic JSON persistence) مع إدارة النسخ الاحتياطية واستعادة الملفات التالفة.
  - `schedulerManager.ts`: إدارة الجدولة الفعلية، مراقبة استيقاظ الجهاز من السكون (`powerMonitor.on('resume')`) وفتح القفل.
  - `notificationManager.ts`: إشعارات Windows، منع التكديس والتكرار، إدارة الأصوات.
  - `autoUpdater.ts`: التكامل مع `electron-updater` لإدارة تحديثات GitHub Releases.
  - `autoLauncher.ts`: ضبط التشغيل التلقائي مع Windows.
- `src/preload/`:
  - واجهة IPC محصورة ومكتوبة الأنواع (`contextBridge.exposeInMainWorld('wirdApi', ...)`).
- `src/renderer/`:
  - تطبيق React مبني بـ Tailwind CSS، يدعم النمطين الفاتح والداكن وRTL/LTR.

---

## معايير كتابة الكود والمساهمات | Guidelines

1. **الهدوء واحترام المستخدم**:
   - لا تضف أي كود تتبع أو جمع بيانات أو إعلانات.
   - حافظ على لغة محفزة وهادئة لا تُشعر المستخدم بالذنب.
2. **استقلالية الجدولة**:
   - لا تعتمد على بقاء واجهة React مفتوحة لحساب المواعيد؛ فالعملية الرئيسية (Main Process) هي المسؤولة عن الجدولة والتنبيهات.
3. **التغطية بالاختبارات**:
   - احرص على إضافة اختبارات في مجلد `tests/` لأي تعديل على منطق الجدولة أو التخزين أو الـ migrations.
4. **Semantic Commit Messages**:
   - `feat: ...` لميزة جديدة.
   - `fix: ...` لإصلاح خطأ.
   - `docs: ...` للتوثيق.
   - `test: ...` لإضافة اختبارات.
   - `refactor: ...` لإعادة تنظيم الكود دون تغيير السلوك.

---

## آلية الإصدار | Release Workflow

1. يتم تحديث رقم الإصدار في `package.json` وفق منهجية Semantic Versioning (مثل `1.0.1` أو `1.1.0`).
2. يتم توثيق التغييرات في `CHANGELOG.md`.
3. يتم دفع Git Tag بصيغة `vX.Y.Z` (مثال: `git tag v1.0.0 && git push origin v1.0.0`).
4. يقوم سير عمل GitHub Actions ببناء حزمة التثبيت لنظام Windows (NSIS)، توقيعها رقميًا (عند توفر الأسرار)، ونشر الـ Release وإرفاق ملفات `latest.yml` ومثبّت التطبيق تلقائيًا.
