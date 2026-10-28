import { Language } from './types'

export interface TranslationDictionary {
  appName: string
  appSubtitle: string
  footerTagline: string

  // Navigation
  tabs: {
    home: string
    history: string
    settings: string
    about: string
  }

  // Common actions
  actions: {
    startSession: string
    markDone: string
    markDoneLate: string
    snooze: string
    snoozeMinutes: string
    undo: string
    save: string
    cancel: string
    close: string
    confirm: string
    edit: string
    delete: string
    reset: string
    pause: string
    resume: string
    addTask: string
    exportData: string
    importData: string
    checkForUpdates: string
    downloadUpdate: string
    restartAndInstall: string
    testNotification: string
    testMiniReminder: string
    getStarted: string
    next: string
    back: string
    finish: string
    reportIssue: string
    viewLicense: string
    viewRepo: string
  }

  // Task statuses
  status: {
    upcoming: string
    due: string
    snoozed: string
    completed: string
    completedLate: string
    expired: string
    disabled: string
    paused: string
  }

  // Task card info
  taskCard: {
    windowPeriod: string
    repeatEvery: string
    snoozedUntil: string
    nextReminder: string
    completedAt: string
    windowEnded: string
    todayProgress: string
    defaultDuration: string
    progressLabel: string
    updateProgress: string
    targetReachedConfirm: string
    snoozePastWindowWarning: string
  }

  // History
  history: {
    title: string
    subtitle: string
    last7Days: string
    completedCount: string
    onTime: string
    late: string
    missed: string
    noHistory: string
    hideHistoryOption: string
  }

  // Focus Session («جلسة تفرّغ»)
  session: {
    title: string
    subtitle: string
    startTitle: string
    durationLabel: string
    minutesUnit: string
    timeRemaining: string
    alwaysOnTop: string
    toggleSeconds: string
    earlyExitButton: string
    earlyExitHint: string
    earlyExitConfirmTitle: string
    earlyExitConfirmDesc: string
    pausedDueToLockTitle: string
    pausedDueToLockDesc: string
    resumeButton: string
    crashRecoveryTitle: string
    crashRecoveryDesc: string
    timerFinishedQuestion: string
    yesCompleted: string
    needMoreTime: string
    finishWithoutConfirm: string
    extendSelectTitle: string
    postSessionSummaryTitle: string
    postSessionSummaryDesc: string
  }

  // Mini Reminder Window
  miniReminder: {
    dueTitle: string
    dueSummary: string
    dismiss: string
    enableLabel: string
    enableDesc: string
    positionLabel: string
    positions: {
      bottomRight: string
      topRight: string
      bottomLeft: string
      topLeft: string
    }
  }

  // Custom Task Modal
  customTask: {
    createTitle: string
    editTitle: string
    nameLabel: string
    startLabel: string
    endLabel: string
    intervalLabel: string
    durationLabel: string
    targetToggle: string
    targetAmount: string
    targetUnit: string
    unitPlaceholder: string
    deleteConfirmTitle: string
    deleteConfirmDesc: string
  }

  // Settings
  settings: {
    title: string
    general: string
    tasks: string
    notifications: string
    appearance: string
    updates: string
    dataManagement: string

    languageLabel: string
    themeLabel: string
    themes: {
      light: string
      dark: string
      system: string
    }

    autoStartLabel: string
    autoStartDesc: string
    minimizeToTrayLabel: string
    minimizeToTrayDesc: string
    soundLabel: string
    soundDesc: string

    taskNameLabel: string
    taskEnabledLabel: string
    startTimeLabel: string
    endTimeLabel: string
    repeatIntervalLabel: string
    repeatIntervalDesc: string
    snoozeDurationLabel: string
    daysScheduledLabel: string

    updateCheckLabel: string
    updateCheckDesc: string
    updateChannelLabel: string
    channels: {
      stable: string
      beta: string
    }
    currentVersion: string
    latestVersion: string
    checkingUpdates: string
    upToDate: string
    updateAvailable: string
    downloadingUpdate: string
    updateDownloaded: string
    updateError: string

    exportDesc: string
    importDesc: string
    importConfirmTitle: string
    importConfirmDesc: string
    importSuccess: string
    importError: string
    resetDefaultsLabel: string
    resetDefaultsDesc: string
    resetConfirmTitle: string
    resetConfirmDesc: string
    diagnosticsTitle: string
    dndHelp: string
  }

  // Tray
  tray: {
    openApp: string
    dueTasks: string
    noDueTasks: string
    pauseReminders: string
    pause30m: string
    pause1h: string
    pause2h: string
    pauseToday: string
    resumeReminders: string
    settings: string
    checkUpdates: string
    quit: string
    runningInBackground: string
    minimizedNotification: string
  }

  // System Notifications
  notifications: {
    testTitle: string
    testBody: string
    dueSingleTitle: string
    dueSingleBody: string
    dueMultipleTitle: string
    dueMultipleBody: string
    actionStart: string
    actionDone: string
    actionSnooze: string
    actionOpen: string
    dndNote: string
  }

  // About
  about: {
    title: string
    version: string
    exactDescription: string
    privacyNote: string
    footerNote: string
  }

  onboarding: {
    welcomeTitle: string
    readyTitle: string
    testNotificationSuccess: string
    step1Title: string
    step1Desc: string
    autoStartLabel: string
    autoStartDesc: string
    step2Title: string
    step2Desc: string
    step3Title: string
    step3Desc: string
    step4Title: string
    step4Desc: string
  }

  // Days of week
  days: string[]
}

export const translations: Record<Language, TranslationDictionary> = {
  ar: {
    appName: 'وِرد',
    appSubtitle: 'رفيقك الهادئ للأذكار والورد اليومي',
    footerTagline: 'ابتغاء وجه الله، وعونًا على دوام الذكر.',

    tabs: {
      home: 'اليوم',
      history: 'السجل',
      settings: 'الإعدادات',
      about: 'حول التطبيق'
    },

    actions: {
      startSession: 'هبدأ دلوقتي',
      markDone: 'تمّت القراءة',
      markDoneLate: 'تأكيد الإنجاز (خارج الفترة)',
      snooze: 'تأجيل',
      snoozeMinutes: 'تأجيل {minutes} دقيقة',
      undo: 'تراجع عن التأكيد',
      save: 'حفظ التعديلات',
      cancel: 'إلغاء',
      close: 'إغلاق',
      confirm: 'تأكيد',
      edit: 'تعديل',
      delete: 'حذف',
      reset: 'استعادة الافتراضي',
      pause: 'إيقاف مؤقت',
      resume: 'استئناف التذكيرات',
      addTask: 'إضافة مهمة جديدة',
      exportData: 'تصدير نسخة احتياطية',
      importData: 'استيراد بيانات',
      checkForUpdates: 'البحث عن تحديث',
      downloadUpdate: 'تنزيل التحديث',
      restartAndInstall: 'إعادة التشغيل والتثبيت',
      testNotification: 'إرسال إشعار تجريبي',
      testMiniReminder: 'تجربة نافذة التذكير المصغّرة',
      getStarted: 'ابدأ الاستخدام',
      next: 'التالي',
      back: 'السابق',
      finish: 'إنهاء الإعداد',
      reportIssue: 'الإبلاغ عن مشكلة',
      viewLicense: 'الترخيص (MIT)',
      viewRepo: 'مستودع المشروع على GitHub'
    },

    status: {
      upcoming: 'قادمة',
      due: 'مستحقة الآن',
      snoozed: 'مؤجلة',
      completed: 'مكتملة بحمد الله',
      completedLate: 'أُنجزت بعد انقضاء الفترة',
      expired: 'انتهت الفترة دون تأكيد',
      disabled: 'معطلة',
      paused: 'التذكيرات متوقفة مؤقتًا'
    },

    taskCard: {
      windowPeriod: 'فترة التذكير:',
      repeatEvery: 'يتكرر كل:',
      snoozedUntil: 'مؤجلة حتى:',
      nextReminder: 'التذكير القادم:',
      completedAt: 'أُنجزت الساعة:',
      windowEnded: 'انتهت فترة التذكير لهذه الدورة',
      todayProgress: 'إنجاز اليوم',
      defaultDuration: 'مدة الجلسة:',
      progressLabel: 'التقدم:',
      updateProgress: 'تسجيل تقدم جزئي',
      targetReachedConfirm: 'تم بلوغ الهدف! اضغط لتأكيد إتمام الورد',
      snoozePastWindowWarning: 'تنبيه: وقت التأجيل المختار يتجاوز نهاية فترة المهمة ({endTime}). لن يتم إرسال تذكيرات بعد انتهاء الفترة.'
    },

    history: {
      title: 'سجل الإنجاز الأسبوعي',
      subtitle: 'متابعة هادئة لالتزامك خلال الأيام السبعة الماضية',
      last7Days: 'آخر 7 أيام',
      completedCount: 'إجمالي المكتمل',
      onTime: 'في موعدها',
      late: 'بعد انقضاء الفترة',
      missed: 'لم تؤكد',
      noHistory: 'لا توجد بيانات سابقة بعد. سيبدأ السجل بالظهور مع استمرارك في القراءة.',
      hideHistoryOption: 'إخفاء السجل الأسبوعي من الواجهة الرئيسية'
    },

    session: {
      title: 'جلسة تفرّغ',
      subtitle: 'مساحة هادئة وخالية من التشتيت لأداء وردك',
      startTitle: 'بدء جلسة تفرّغ',
      durationLabel: 'مدة الجلسة (بالدقائق):',
      minutesUnit: 'دقيقة',
      timeRemaining: 'الوقت المتبقي',
      alwaysOnTop: 'إبقاء النافذة فوق النوافذ الأخرى',
      toggleSeconds: 'إظهار / إخفاء الثواني',
      earlyExitButton: 'إنهاء الجلسة مبكرًا',
      earlyExitHint: 'اضغط مطولاً للإنهاء',
      earlyExitConfirmTitle: 'هل ترغب حقًا في إنهاء الجلسة مبكرًا؟',
      earlyExitConfirmDesc: 'الخروج المبكر لن يسجّل المهمة كمكتملة، وسيحتفظ بجدول التذكيرات المعتاد.',
      pausedDueToLockTitle: 'الجلسة متوقفة مؤقتًا',
      pausedDueToLockDesc: 'تم إيقاف العداد مؤقتًا بسبب قفل الشاشة أو سكون الجهاز. وقت السكون لا يُحتسب تلقائيًا كوقت قراءة.',
      resumeButton: 'استئناف الجلسة الآن',
      crashRecoveryTitle: 'استعادة جلسة سابقة',
      crashRecoveryDesc: 'تم العثور على جلسة تفرّغ لم تكتمل قبل إغلاق التطبيق. هل ترغب في استئناف الوقت المتبقي؟',
      timerFinishedQuestion: 'هل أتممت القراءة؟',
      yesCompleted: 'نعم، تمّت القراءة بحمد الله',
      needMoreTime: 'أحتاج وقتًا إضافيًا',
      finishWithoutConfirm: 'إنهاء دون تأكيد',
      extendSelectTitle: 'اختر مدة التمديد الإضافية:',
      postSessionSummaryTitle: 'تقبل الله طاعتكم',
      postSessionSummaryDesc: 'لديك {count} مهام أخرى مستحقة الآن.'
    },

    miniReminder: {
      dueTitle: 'تذكير وِرد',
      dueSummary: 'لديك {count} مهام مستحقة الآن',
      dismiss: 'إغلاق',
      enableLabel: 'تفعيل نافذة التذكير المصغّرة فوق النوافذ',
      enableDesc: 'نافذة خفيفة تظهر بهدوء دون سحب التركيز من لوحة المفاتيح أثناء عملك.',
      positionLabel: 'موضع نافذة التذكير على الشاشة',
      positions: {
        bottomRight: 'أسفل اليمين',
        topRight: 'أعلى اليمين',
        bottomLeft: 'أسفل اليسار',
        topLeft: 'أعلى اليسار'
      }
    },

    customTask: {
      createTitle: 'إضافة مهمة جديدة',
      editTitle: 'تعديل المهمة',
      nameLabel: 'اسم المهمة',
      startLabel: 'بداية فترة التذكير',
      endLabel: 'نهاية فترة التذكير',
      intervalLabel: 'فاصل إعادة التذكير (دقائق)',
      durationLabel: 'المدة الافتراضية لجلسة التفرغ (دقائق)',
      targetToggle: 'تحديد هدف عددي (اختياري)',
      targetAmount: 'العدد المستهدف',
      targetUnit: 'الوحدة',
      unitPlaceholder: 'مثل: صفحات، صفحة، تسبيحة، أجزاء',
      deleteConfirmTitle: 'تأكيد حذف المهمة',
      deleteConfirmDesc: 'هل أنت متأكد من رغبتك في حذف هذه المهمة وسجلاتها المرتبطة بها؟'
    },

    settings: {
      title: 'الإعدادات',
      general: 'عام',
      tasks: 'ضبط المهام',
      notifications: 'الإشعارات والأصوات',
      appearance: 'المظهر واللغة',
      updates: 'التحديثات',
      dataManagement: 'البيانات والنسخ الاحتياطي',

      languageLabel: 'لغة الواجهة',
      themeLabel: 'المظهر',
      themes: {
        light: 'فاتح',
        dark: 'داكن',
        system: 'تلقائي (حسب النظام)'
      },

      autoStartLabel: 'تشغيل التطبيق تلقائيًا عند بدء تشغيل Windows',
      autoStartDesc: 'يضمن استمرار التذكيرات اليومية حتى بعد إعادة تشغيل الجهاز.',
      minimizeToTrayLabel: 'الإغلاق إلى شريط المهام (System Tray)',
      minimizeToTrayDesc: 'عند النقر على زر الإغلاق، يظل التطبيق يعمل في الخلفية لمواصلة التذكير.',
      soundLabel: 'أصوات الإشعارات',
      soundDesc: 'تشغيل صوت ناعم مصاحب لإشعار التذكير.',

      taskNameLabel: 'اسم المهمة',
      taskEnabledLabel: 'تفعيل هذه المهمة',
      startTimeLabel: 'بداية فترة التذكير',
      endTimeLabel: 'نهاية فترة التذكير',
      repeatIntervalLabel: 'فاصل إعادة التذكير (بالدقائق)',
      repeatIntervalDesc: 'المدة بين كل إشعار وآخر أثناء سريان الفترة حتى تأكيد الإنجاز.',
      snoozeDurationLabel: 'مدة التأجيل الافتراضية (بالدقائق)',
      daysScheduledLabel: 'أيام التكرار',

      updateCheckLabel: 'البحث التلقائي عن التحديثات',
      updateCheckDesc: 'التحقق دوريًا من صدور إصدارات جديدة ومستقرة عبر GitHub Releases.',
      updateChannelLabel: 'قناة التحديثات',
      channels: {
        stable: 'مستقرة (موصى بها)',
        beta: 'تجريبية (Beta)'
      },
      currentVersion: 'الإصدار الحالي:',
      latestVersion: 'أحدث إصدار متاح:',
      checkingUpdates: 'جارٍ البحث عن تحديثات...',
      upToDate: 'أنت تستخدم أحدث إصدار متوفر بحمد الله.',
      updateAvailable: 'يتوفر إصدار جديد!',
      downloadingUpdate: 'جارٍ تنزيل التحديث...',
      updateDownloaded: 'تم تنزيل التحديث بنجاح. أعد تشغيل التطبيق للتطبيق.',
      updateError: 'تعذر التحقق من التحديثات. تأكد من اتصالك بالإنترنت.',

      exportDesc: 'تصدير جميع الإعدادات وسجلات الإنجاز السابقة في ملف JSON محلي آمن.',
      importDesc: 'استيراد بيانات ونسخة احتياطية سابقة بعد مراجعتها والتحقق من صحتها.',
      importConfirmTitle: 'تأكيد استبدال البيانات',
      importConfirmDesc: 'سيتم استبدال الإعدادات والمهام الحالية بالبيانات المستوردة. هل ترغب بالاستمرار؟',
      importSuccess: 'تم استيراد البيانات وتطبيقها بنجاح.',
      importError: 'الملف المختار غير صالح أو تالف.',
      resetDefaultsLabel: 'استعادة الإعدادات الأصلية',
      resetDefaultsDesc: 'إعادة ضبط أوقات المهام والإعدادات إلى القيم الافتراضية مع الاحتفاظ بسجل الإنجاز.',
      resetConfirmTitle: 'تأكيد استعادة الافتراضي',
      resetConfirmDesc: 'هل أنت متأكد من رغبتك في إعادة ضبط المهام والإعدادات؟',
      diagnosticsTitle: 'تشخيص التنبيهات وإعدادات النظام',
      dndHelp: 'إذا لم تظهر التنبيهات، يرجى التأكد من تفعيل الإشعارات لتطبيق «وِرد» في إعدادات Windows، والتحقق من إيقاف وضع «Focus Assist» أو «Do Not Disturb».'
    },

    tray: {
      openApp: 'فتح وِرد',
      dueTasks: 'المهام المستحقة:',
      noDueTasks: 'لا توجد مهام مستحقة الآن',
      pauseReminders: 'إيقاف التذكيرات مؤقتًا',
      pause30m: 'لمدة 30 دقيقة',
      pause1h: 'لمدة ساعة',
      pause2h: 'لمدة ساعتين',
      pauseToday: 'لبقية اليوم',
      resumeReminders: 'استئناف التذكيرات',
      settings: 'الإعدادات',
      checkUpdates: 'البحث عن تحديثات',
      quit: 'خروج نهائي من التطبيق',
      runningInBackground: 'يعمل «وِرد» الآن في الخلفية',
      minimizedNotification: 'أُخفي التطبيق إلى علبة النظام وسيواصل تذكيرك في المواعيد المحددة.'
    },

    notifications: {
      testTitle: 'وِرد | تجربة التنبيه',
      testBody: 'هذا إشعار تجريبي من تطبيق وِرد. نظام التنبيهات يعمل بنجاح.',
      dueSingleTitle: 'حان موعد: {taskName}',
      dueSingleBody: 'تذكير بـ {taskName}. انقر للبدء أو تأكيد الإنجاز.',
      dueMultipleTitle: 'مهام مستحقة في وِرد',
      dueMultipleBody: 'لديك {count} مهام مستحقة الآن: {taskNames}',
      actionStart: 'هبدأ دلوقتي',
      actionDone: 'تمّت القراءة',
      actionSnooze: 'تأجيل 15 دقيقة',
      actionOpen: 'فتح التطبيق',
      dndNote: 'ملاحظة: إذا كانت ميزة «Focus Assist» أو «Do Not Disturb» مفعلة في Windows، فقد تؤجل ظهور الإشعار.'
    },

    about: {
      title: 'حول التطبيق',
      version: 'رقم الإصدار:',
      exactDescription: `وِرد

تطبيق مجاني ومفتوح المصدر، يساعدك على المحافظة على أذكار الصباح والمساء والورد اليومي، بتذكيرات منتظمة ومتابعة بسيطة لإنجازك.

صُنع ابتغاء وجه الله، دون إعلانات أو اشتراكات، ودون جمع بياناتك الشخصية. تُحفظ بياناتك على جهازك، وتعمل التذكيرات دون اتصال بالإنترنت.

نسأل الله أن ينفع به، وأن يعيننا وإياكم على ذكره وشكره وحسن عبادته.`,
      privacyNote: 'معلومات الخصوصية والاتصال: يعمل التطبيق محليًا بالكامل دون حاجة للإنترنت. الاتصال الشبكي الوحيد المحدود هو الاستعلام الدوري عن التحديثات وتنزيلها من مستودع GitHub الرسمي عند تفعيل ذلك.',
      footerNote: 'ابتغاء وجه الله، وعونًا على دوام الذكر.'
    },

    onboarding: {
      welcomeTitle: 'مرحبًا بك في تطبيق وِرد',
      readyTitle: 'تم إعداد وِرد بنجاح! نسأل الله القبول والتوفيق.',
      testNotificationSuccess: 'تم إرسال الإشعار التجريبي بنجاح!',
      step1Title: 'التشغيل التلقائي مع النظام',
      step1Desc: 'هل ترغب في تشغيل وِرد تلقائيًا عند تسجيل الدخول إلى Windows لمساعدتك على استمرار الذكر؟',
      autoStartLabel: 'تشغيل وِرد تلقائيًا مع بدء تشغيل Windows',
      autoStartDesc: 'يضمن تذكيرك دون الحاجة لتذكر فتح التطبيق يدويًا كل يوم.',
      step2Title: 'فترات المهام الأساسية',
      step2Desc: 'اضبط مواعيد أذكار الصباح والمساء والورد اليومي بما يناسب جدولك اليومي:',
      step3Title: 'تجربة التنبيهات والأصوات',
      step3Desc: 'تأكد من قدرة وِرد على إرسال الإشعارات الصوتية بهدوء دون إزعاج:',
      step4Title: 'المظهر والسمة',
      step4Desc: 'اختر المظهر المريح لعينيك أثناء العمل على الجهاز:'
    },

    days: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
  },

  en: {
    appName: 'Wird',
    appSubtitle: 'Your calm companion for daily remembrance and Wird',
    footerTagline: 'Seeking the pleasure of Allah, and an aid for steadfast remembrance.',

    tabs: {
      home: 'Today',
      history: 'History',
      settings: 'Settings',
      about: 'About'
    },

    actions: {
      startSession: 'Start Now',
      markDone: 'Completed',
      markDoneLate: 'Confirm (Outside Window)',
      snooze: 'Snooze',
      snoozeMinutes: 'Snooze {minutes} min',
      undo: 'Undo Confirmation',
      save: 'Save Changes',
      cancel: 'Cancel',
      close: 'Close',
      confirm: 'Confirm',
      edit: 'Edit',
      delete: 'Delete',
      reset: 'Reset Defaults',
      pause: 'Pause Reminders',
      resume: 'Resume Reminders',
      addTask: 'Add New Task',
      exportData: 'Export Backup',
      importData: 'Import Data',
      checkForUpdates: 'Check for Updates',
      downloadUpdate: 'Download Update',
      restartAndInstall: 'Restart & Install',
      testNotification: 'Send Test Notification',
      testMiniReminder: 'Test Mini Reminder Window',
      getStarted: 'Get Started',
      next: 'Next',
      back: 'Back',
      finish: 'Finish Setup',
      reportIssue: 'Report an Issue',
      viewLicense: 'License (MIT)',
      viewRepo: 'GitHub Repository'
    },

    status: {
      upcoming: 'Upcoming',
      due: 'Due Now',
      snoozed: 'Snoozed',
      completed: 'Completed',
      completedLate: 'Completed Late',
      expired: 'Expired Without Confirmation',
      disabled: 'Disabled',
      paused: 'Reminders Paused'
    },

    taskCard: {
      windowPeriod: 'Reminder Window:',
      repeatEvery: 'Repeats Every:',
      snoozedUntil: 'Snoozed until:',
      nextReminder: 'Next Reminder:',
      completedAt: 'Completed at:',
      windowEnded: 'Window ended for this cycle',
      todayProgress: "Today's Progress",
      defaultDuration: 'Session Duration:',
      progressLabel: 'Progress:',
      updateProgress: 'Log Partial Progress',
      targetReachedConfirm: 'Goal reached! Click to confirm completion',
      snoozePastWindowWarning: 'Notice: Selected snooze duration exceeds window end ({endTime}). No reminders will be sent after window closes.'
    },

    history: {
      title: 'Weekly Accomplishment History',
      subtitle: 'A quiet view of your consistency over the past 7 days',
      last7Days: 'Past 7 Days',
      completedCount: 'Total Completed',
      onTime: 'On Time',
      late: 'After Window',
      missed: 'Missed',
      noHistory: 'No completion history yet. Your accomplishments will appear here as you read.',
      hideHistoryOption: 'Hide weekly history from home dashboard'
    },

    session: {
      title: 'Focus Session',
      subtitle: 'A quiet, distraction-free space for your wird',
      startTitle: 'Start Focus Session',
      durationLabel: 'Session Duration (Minutes):',
      minutesUnit: 'min',
      timeRemaining: 'Time Remaining',
      alwaysOnTop: 'Keep window always on top',
      toggleSeconds: 'Toggle seconds display',
      earlyExitButton: 'End Session Early',
      earlyExitHint: 'Press and hold to exit',
      earlyExitConfirmTitle: 'Are you sure you want to exit early?',
      earlyExitConfirmDesc: 'Exiting early will not mark the task as completed and normal schedule will resume.',
      pausedDueToLockTitle: 'Session Paused',
      pausedDueToLockDesc: 'Timer was paused due to screen lock or system sleep. Sleep time is not counted as reading time.',
      resumeButton: 'Resume Session Now',
      crashRecoveryTitle: 'Resume Prior Session',
      crashRecoveryDesc: 'An unfinished focus session was recovered from before the app closed. Would you like to resume remaining time?',
      timerFinishedQuestion: 'Did you finish reading?',
      yesCompleted: 'Yes, Completed',
      needMoreTime: 'Need More Time',
      finishWithoutConfirm: 'Finish Without Confirming',
      extendSelectTitle: 'Select additional extension duration:',
      postSessionSummaryTitle: 'Session Finished',
      postSessionSummaryDesc: 'You have {count} other tasks currently due.'
    },

    miniReminder: {
      dueTitle: 'Wird Reminder',
      dueSummary: 'You have {count} tasks due now',
      dismiss: 'Dismiss',
      enableLabel: 'Enable Floating Mini Reminder Window',
      enableDesc: 'A gentle non-intrusive floating window that never steals keyboard focus while you type.',
      positionLabel: 'Screen Position',
      positions: {
        bottomRight: 'Bottom Right',
        topRight: 'Top Right',
        bottomLeft: 'Bottom Left',
        topLeft: 'Top Left'
      }
    },

    customTask: {
      createTitle: 'Create Custom Task',
      editTitle: 'Edit Task',
      nameLabel: 'Task Name',
      startLabel: 'Window Start',
      endLabel: 'Window End',
      intervalLabel: 'Repeat Interval (Minutes)',
      durationLabel: 'Default Focus Duration (Minutes)',
      targetToggle: 'Set optional numeric goal',
      targetAmount: 'Target Goal',
      targetUnit: 'Unit',
      unitPlaceholder: 'e.g. pages, page, parts',
      deleteConfirmTitle: 'Confirm Delete Task',
      deleteConfirmDesc: 'Are you sure you want to delete this custom task and its history?'
    },

    settings: {
      title: 'Settings',
      general: 'General',
      tasks: 'Tasks Configuration',
      notifications: 'Notifications & Sounds',
      appearance: 'Appearance & Language',
      updates: 'Updates',
      dataManagement: 'Data & Backup',

      languageLabel: 'Interface Language',
      themeLabel: 'Theme',
      themes: {
        light: 'Light',
        dark: 'Dark',
        system: 'System Default'
      },

      autoStartLabel: 'Start Wird automatically with Windows',
      autoStartDesc: 'Ensures your reminders stay active across computer restarts.',
      minimizeToTrayLabel: 'Minimize to System Tray on close',
      minimizeToTrayDesc: 'Closing the window keeps the app running in the background for reminders.',
      soundLabel: 'Notification Sound',
      soundDesc: 'Play a gentle chime when a reminder is due.',

      taskNameLabel: 'Task Name',
      taskEnabledLabel: 'Enable this task',
      startTimeLabel: 'Reminder Window Start',
      endTimeLabel: 'Reminder Window End',
      repeatIntervalLabel: 'Repeat Interval (Minutes)',
      repeatIntervalDesc: 'Time between repeated reminders until confirmed or window ends.',
      snoozeDurationLabel: 'Default Snooze Duration (Minutes)',
      daysScheduledLabel: 'Repeat Days',

      updateCheckLabel: 'Automatically Check for Updates',
      updateCheckDesc: 'Periodically check GitHub Releases for new stable updates.',
      updateChannelLabel: 'Update Channel',
      channels: {
        stable: 'Stable (Recommended)',
        beta: 'Beta Releases'
      },
      currentVersion: 'Current Version:',
      latestVersion: 'Latest Available:',
      checkingUpdates: 'Checking for updates...',
      upToDate: 'You are on the latest version.',
      updateAvailable: 'New update available!',
      downloadingUpdate: 'Downloading update...',
      updateDownloaded: 'Update downloaded. Restart the app to apply.',
      updateError: 'Unable to check updates. Please check your internet connection.',

      exportDesc: 'Export all settings and completion logs into a secure local JSON file.',
      importDesc: 'Import previously exported data after validating structure and version.',
      importConfirmTitle: 'Confirm Data Replacement',
      importConfirmDesc: 'Existing settings and tasks will be replaced by the imported data. Proceed?',
      importSuccess: 'Data successfully imported and applied.',
      importError: 'The selected file is invalid or corrupted.',
      resetDefaultsLabel: 'Reset to Defaults',
      resetDefaultsDesc: 'Reset task windows and settings to defaults while preserving completion logs.',
      resetConfirmTitle: 'Confirm Reset',
      resetConfirmDesc: 'Are you sure you want to reset tasks and settings to default?',
      diagnosticsTitle: 'Alert Diagnostics & System Settings',
      dndHelp: 'If alerts do not appear, ensure notifications for "Wird" are enabled in Windows Settings, and check that Focus Assist / Do Not Disturb is off.'
    },

    tray: {
      openApp: 'Open Wird',
      dueTasks: 'Due Tasks:',
      noDueTasks: 'No tasks due right now',
      pauseReminders: 'Pause Reminders',
      pause30m: 'For 30 minutes',
      pause1h: 'For 1 hour',
      pause2h: 'For 2 hours',
      pauseToday: 'For the rest of today',
      resumeReminders: 'Resume Reminders',
      settings: 'Settings',
      checkUpdates: 'Check for Updates',
      quit: 'Quit Wird',
      runningInBackground: 'Wird is running in the background',
      minimizedNotification: 'Wird was hidden to the system tray and will notify you on schedule.'
    },

    notifications: {
      testTitle: 'Wird | Test Alert',
      testBody: 'This is a test notification from Wird. Alert system is active.',
      dueSingleTitle: 'Due: {taskName}',
      dueSingleBody: 'Reminder for {taskName}. Click to start or confirm.',
      dueMultipleTitle: 'Due Tasks in Wird',
      dueMultipleBody: 'You have {count} tasks due now: {taskNames}',
      actionStart: 'Start Now',
      actionDone: 'Completed',
      actionSnooze: 'Snooze 15m',
      actionOpen: 'Open App',
      dndNote: 'Note: If Windows Focus Assist / Do Not Disturb is enabled, notifications may be held by Windows.'
    },

    about: {
      title: 'About App',
      version: 'Version:',
      exactDescription: `Wird

A free and open-source desktop application that helps you maintain morning and evening remembrance and your daily Quran wird with consistent reminders and simple progress tracking.

Created seeking the pleasure of Allah, free of ads or subscriptions, and without collecting your personal data. Your data is stored locally on your device, and reminders work without an internet connection.

We ask Allah to make it beneficial, and to aid us and you in His remembrance, gratitude, and good worship.`,
      privacyNote: 'Privacy & Connectivity: The app operates entirely offline. The only network call is periodically checking for and downloading updates from the official GitHub Releases repository when enabled.',
      footerNote: 'Seeking the pleasure of Allah, and an aid for steadfast remembrance.'
    },

    onboarding: {
      welcomeTitle: 'Welcome to Wird',
      readyTitle: 'Wird setup is complete!',
      testNotificationSuccess: 'Test notification sent successfully!',
      step1Title: 'Auto-Start with System',
      step1Desc: 'Would you like Wird to start automatically when signing in to Windows?',
      autoStartLabel: 'Launch Wird automatically on Windows startup',
      autoStartDesc: 'Ensures you never miss reminders without needing manual launch.',
      step2Title: 'Daily Tasks Schedule',
      step2Desc: 'Adjust the window periods for your morning, evening adhkar, and wird:',
      step3Title: 'Notification Test',
      step3Desc: 'Test notifications and chimes to verify delivery on Windows:',
      step4Title: 'Appearance & Theme',
      step4Desc: 'Choose your preferred visual theme for comfortable viewing:'
    },

    days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  }
}
