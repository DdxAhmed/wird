import { Language } from './types'

export interface TranslationDictionary {
  appName: string
  appSubtitle: string
  tagline: string

  // Navigation
  tabs: {
    home: string
    history: string
    settings: string
    about: string
  }

  // Common actions
  actions: {
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
    reset: string
    pause: string
    resume: string
    exportData: string
    importData: string
    checkForUpdates: string
    downloadUpdate: string
    restartAndInstall: string
    testNotification: string
    getStarted: string
    next: string
    back: string
    finish: string
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
  }

  // Onboarding
  onboarding: {
    welcomeTitle: string
    welcomeSubtitle: string
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
    testNotificationSuccess: string
    readyTitle: string
    readyDesc: string
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
    actionDone: string
    actionSnooze: string
    actionOpen: string
    dndNote: string
  }

  // About
  about: {
    title: string
    version: string
    description: string
    author: string
    license: string
    githubRepo: string
    roadmapTitle: string
    roadmapItems: string[]
    principlesTitle: string
    principles: string[]
  }

  // Days of week
  days: string[]
}

export const translations: Record<Language, TranslationDictionary> = {
  ar: {
    appName: 'وِرد',
    appSubtitle: 'رفيقك الهادئ للأذكار والورد اليومي',
    tagline: 'ألا بذكر الله تطمئن القلوب',

    tabs: {
      home: 'اليوم',
      history: 'السجل',
      settings: 'الإعدادات',
      about: 'حول التطبيق'
    },

    actions: {
      markDone: 'تمت القراءة بحمد الله',
      markDoneLate: 'تأكيد الإنجاز (خارج الفترة)',
      snooze: 'تأجيل',
      snoozeMinutes: 'تأجيل {minutes} دقيقة',
      undo: 'تراجع عن الإنجاز',
      save: 'حفظ التعديلات',
      cancel: 'إلغاء',
      close: 'إغلاق',
      confirm: 'تأكيد',
      edit: 'تعديل',
      reset: 'استعادة الافتراضي',
      pause: 'إيقاف مؤقت',
      resume: 'استئناف التذكيرات',
      exportData: 'تصدير نسخة احتياطية',
      importData: 'استيراد بيانات',
      checkForUpdates: 'البحث عن تحديثات',
      downloadUpdate: 'تنزيل التحديث',
      restartAndInstall: 'إعادة التشغيل والتثبيت',
      testNotification: 'تجربة إرسال إشعار',
      getStarted: 'ابدأ الاستخدام',
      next: 'التالي',
      back: 'السابق',
      finish: 'إنهاء الإعداد'
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
      todayProgress: 'إنجاز اليوم'
    },

    history: {
      title: 'سجل الإنجاز الأسبوعي',
      subtitle: 'متابعة هادئة لالتزامك خلال الأيام السبعة الماضية',
      last7Days: 'آخر 7 أيام',
      completedCount: 'إجمالي المكتمل',
      onTime: 'في موعدها',
      late: 'بعد الموعد',
      missed: 'لم تؤكد',
      noHistory: 'لا توجد بيانات سابقة بعد. سيبدأ السجل بالظهور مع استمرارك في القراءة.'
    },

    onboarding: {
      welcomeTitle: 'أهلاً بك في تطبيق «وِرد»',
      welcomeSubtitle: 'تطبيق هادئ ومستقل صُمم ليعينك على دوام ذكر الله وتلاوة كتابه أثناء انشغالك بالعمل على حاسوبك.',
      step1Title: 'التشغيل التلقائي',
      step1Desc: 'لكي لا تنسى أذكارك، يُفضل تشغيل التطبيق في الخلفية عند تسجيل دخولك إلى Windows.',
      autoStartLabel: 'تشغيل «وِرد» تلقائيًا مع بدء تشغيل Windows',
      autoStartDesc: 'يعمل التطبيق بخفة في علبة النظام (System Tray) دون إزعاج أو إبطاء للحاسوب.',
      step2Title: 'ضبط المهام الثلاث',
      step2Desc: 'راجع أوقات التذكير المقترحة؛ يمكنك تخصيص بداية ونهاية كل فترة بما يناسب جدولك اليومي.',
      step3Title: 'فواصل التكرار والإشعارات',
      step3Desc: 'يُكرر التطبيق التنبيه حتى تؤكد الإنجاز أو ينتهي الوقت المحدد لكل مهمة.',
      step4Title: 'المظهر وتجربة الإشعار',
      step4Desc: 'اختر مظهرك المفضل وتأكد من وصول إشعارات Windows بشكل سليم.',
      testNotificationSuccess: 'تم إرسال إشعار تجريبي! إذا لم تشاهده، يرجى مراجعة إعدادات الإشعارات في Windows.',
      readyTitle: 'أنت الآن جاهز!',
      readyDesc: 'سيبقى «وِرد» رفيقًا خفيفًا على جهازك. يمكنك دائمًا الوصول إليه من أيقونة شريط المهام بجانب الساعة.'
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
      resetConfirmDesc: 'هل أنت متأكد من رغبتك في إعادة ضبط المهام والإعدادات؟'
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
      dueSingleBody: 'تذكير بـ {taskName}. انقر لتأكيد الإنجاز أو التأجيل.',
      dueMultipleTitle: 'مهام مستحقة في وِرد',
      dueMultipleBody: 'لديك {count} مهام مستحقة الآن: {taskNames}',
      actionDone: 'تمت القراءة',
      actionSnooze: 'تأجيل 15 دقيقة',
      actionOpen: 'فتح التطبيق',
      dndNote: 'ملاحظة: إذا كانت ميزة «Focus Assist» أو «Do Not Disturb» مفعلة في Windows، فقد تؤجل ظهور الإشعار.'
    },

    about: {
      title: 'حول وِرد',
      version: 'الإصدار',
      description: '«وِرد» تطبيق مكتبي خفيف ومفتوح المصدر، مبني بأحدث تقنيات الويب وسطح المكتب، يهدف إلى مساعدة المسلم على المحافظة على أذكار الصباح والمساء والورد القرآني في بيئة عمله اليومية دون تشتيت أو إعلانات.',
      author: 'فريق وِرد ومجتمع البرمجيات الحرة',
      license: 'ترخيص MIT مفتوح المصدر',
      githubRepo: 'مستودع المشروع على GitHub',
      roadmapTitle: 'خارطة الطريق للإصدارات القادمة',
      roadmapItems: [
        'إضافة مهام وعادات مخصصة يحددها المستخدم.',
        'نافذة تذكير صغيرة وسريعة (Mini Quick Popup) تبقى فوق النوافذ.',
        'وضع تركيز ذكي (Focus Mode) يؤجل التذكيرات أثناء الاجتماعات.',
        'ملخص أسبوعي وإحصائيات تفاعلية مع إمكانية إخفائها.',
        'اختصارات لوحة مفاتيح شاملة للتأكيد السريع.'
      ],
      principlesTitle: 'مبادئ تصميم وِرد',
      principles: [
        'محلي بالكامل (Offline-first): لا يحتاج خوادم، ولا يرسل أي بيانات خاصة أو تتبع.',
        'لغة هادئة ورفيقة: تذكير محبب ومحفز دون إشعار بالذنب أو الإلحاح المزعج.',
        'احترام موارد الجهاز: خفيف وسريع ولا يستهلك المعالج أو الذاكرة في الخلفية.'
      ]
    },

    days: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
  },

  en: {
    appName: 'Wird',
    appSubtitle: 'Your calm companion for daily remembrance and Wird',
    tagline: 'Verily, in the remembrance of Allah do hearts find rest',

    tabs: {
      home: 'Today',
      history: 'History',
      settings: 'Settings',
      about: 'About'
    },

    actions: {
      markDone: 'Mark as Completed',
      markDoneLate: 'Confirm (Outside Window)',
      snooze: 'Snooze',
      snoozeMinutes: 'Snooze {minutes} min',
      undo: 'Undo Completion',
      save: 'Save Changes',
      cancel: 'Cancel',
      close: 'Close',
      confirm: 'Confirm',
      edit: 'Edit',
      reset: 'Reset Defaults',
      pause: 'Pause Reminders',
      resume: 'Resume Reminders',
      exportData: 'Export Backup',
      importData: 'Import Data',
      checkForUpdates: 'Check for Updates',
      downloadUpdate: 'Download Update',
      restartAndInstall: 'Restart & Install',
      testNotification: 'Send Test Notification',
      getStarted: 'Get Started',
      next: 'Next',
      back: 'Back',
      finish: 'Finish Setup'
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
      todayProgress: "Today's Progress"
    },

    history: {
      title: 'Weekly Accomplishment History',
      subtitle: 'A quiet view of your consistency over the past 7 days',
      last7Days: 'Past 7 Days',
      completedCount: 'Total Completed',
      onTime: 'On Time',
      late: 'Late',
      missed: 'Missed',
      noHistory: 'No completion history yet. Your accomplishments will appear here as you read.'
    },

    onboarding: {
      welcomeTitle: 'Welcome to Wird',
      welcomeSubtitle: 'A calm, standalone desktop app designed to help you maintain morning & evening remembrance and your daily Quran wird while busy working.',
      step1Title: 'Auto-Start',
      step1Desc: 'To ensure you never miss your wird, we recommend launching Wird silently on Windows startup.',
      autoStartLabel: 'Launch Wird automatically when Windows starts',
      autoStartDesc: 'Runs quietly in the System Tray with zero background lag or bloat.',
      step2Title: 'Configure Default Tasks',
      step2Desc: 'Review suggested windows; you can adjust start and end times to fit your daily schedule.',
      step3Title: 'Intervals & Reminders',
      step3Desc: 'Wird will repeat gentle reminders until you confirm or the cycle window ends.',
      step4Title: 'Appearance & Notifications',
      step4Desc: 'Select your preferred theme and send a test notification to verify Windows alerts.',
      testNotificationSuccess: 'Test notification sent! If not visible, please check Windows Notification settings.',
      readyTitle: "You're All Set!",
      readyDesc: 'Wird will accompany you quietly. You can always access it from the taskbar tray near the clock.'
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
      resetConfirmDesc: 'Are you sure you want to reset tasks and settings to default?'
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
      dueSingleBody: 'Reminder for {taskName}. Click to confirm or snooze.',
      dueMultipleTitle: 'Due Tasks in Wird',
      dueMultipleBody: 'You have {count} tasks due now: {taskNames}',
      actionDone: 'Completed',
      actionSnooze: 'Snooze 15m',
      actionOpen: 'Open App',
      dndNote: 'Note: If Windows Focus Assist / Do Not Disturb is enabled, notifications may be held by Windows.'
    },

    about: {
      title: 'About Wird',
      version: 'Version',
      description: 'Wird is a lightweight, open-source desktop app built with modern web and desktop technologies to help Muslims maintain their morning and evening remembrance and daily Quran portion without clutter, tracking, or distractions.',
      author: 'Wird Team & Open Source Contributors',
      license: 'MIT Open Source License',
      githubRepo: 'GitHub Repository',
      roadmapTitle: 'Future Roadmap',
      roadmapItems: [
        'Customizable user-defined tasks and habits.',
        'Optional always-on-top Mini Quick Action widget.',
        'Smart Focus Mode to quiet reminders during important meetings.',
        'Weekly reflection summaries and optional streak statistics.',
        'Global keyboard shortcuts for instant confirmation.'
      ],
      principlesTitle: 'Core Principles',
      principles: [
        'Offline-First: Completely private, no servers, no analytics, no tracking.',
        'Calm & Respectful: Gentle reminders without guilt-tripping or notification fatigue.',
        'Resource-Efficient: Lightweight and quiet in the background.'
      ]
    },

    days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  }
}
