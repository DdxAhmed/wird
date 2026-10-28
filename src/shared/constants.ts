import { AppSettings, TaskDefinition, WirdStoreData } from './types'

export const CURRENT_SCHEMA_VERSION = 2

export const APP_ID = 'com.wird.app'
export const APP_NAME = 'وِرد | Wird'

export const DEFAULT_TASKS: TaskDefinition[] = [
  {
    id: 'morning-adhkar',
    name: {
      ar: 'أذكار الصباح',
      en: 'Morning Adhkar'
    },
    description: {
      ar: 'حفظ وبركة لبداية يومك',
      en: 'Protection and blessings for the start of your day'
    },
    enabled: true,
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    startTime: '05:30',
    endTime: '11:00',
    repeatIntervalMinutes: 15,
    snoozeDurationMinutes: 15,
    defaultFocusDurationMinutes: 15
  },
  {
    id: 'evening-adhkar',
    name: {
      ar: 'أذكار المساء',
      en: 'Evening Adhkar'
    },
    description: {
      ar: 'سكينة وطمأنينة لختام نهارك',
      en: 'Peace and tranquility for your evening'
    },
    enabled: true,
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    startTime: '16:30',
    endTime: '20:30',
    repeatIntervalMinutes: 15,
    snoozeDurationMinutes: 15,
    defaultFocusDurationMinutes: 15
  },
  {
    id: 'daily-wird',
    name: {
      ar: 'الورد اليومي',
      en: 'Daily Wird'
    },
    description: {
      ar: 'نصيبك اليومي من كتاب الله تعالى وتدبره',
      en: 'Your daily portion of the Noble Quran'
    },
    enabled: true,
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    startTime: '20:30',
    endTime: '23:59',
    repeatIntervalMinutes: 20,
    snoozeDurationMinutes: 15,
    defaultFocusDurationMinutes: 20,
    target: {
      enabled: true,
      total: 10,
      unit: 'صفحات'
    }
  }
]

export const DEFAULT_SETTINGS: AppSettings = {
  schemaVersion: CURRENT_SCHEMA_VERSION,
  theme: 'system',
  language: 'ar',
  autoStartOnBoot: true,
  startMinimizedToTray: true,
  hasCompletedOnboarding: false,
  soundEnabled: true,
  pausedUntil: null,
  autoCheckUpdates: true,
  updateChannel: 'stable',
  lastUpdateCheck: null,
  miniReminderEnabled: true,
  miniReminderPosition: 'bottom-right',
  hideWeeklyHistory: false,
  githubRepoUrl: 'https://github.com/wird-app/wird',
  issuesUrl: 'https://github.com/wird-app/wird/issues',
  licenseUrl: 'https://github.com/wird-app/wird/blob/main/LICENSE'
}

export const INITIAL_STORE_DATA: WirdStoreData = {
  schemaVersion: CURRENT_SCHEMA_VERSION,
  settings: DEFAULT_SETTINGS,
  tasks: DEFAULT_TASKS,
  completions: {},
  progress: {},
  snoozes: {},
  lastNotified: {},
  activeSession: null
}

export const IPC_CHANNELS = {
  // Store & Data
  GET_STORE_DATA: 'wird:get-store-data',
  UPDATE_SETTINGS: 'wird:update-settings',
  UPDATE_TASK: 'wird:update-task',
  ADD_TASK: 'wird:add-task',
  DELETE_TASK: 'wird:delete-task',
  RESET_TASKS: 'wird:reset-tasks',
  COMPLETE_TASK: 'wird:complete-task',
  UNDO_COMPLETE_TASK: 'wird:undo-complete-task',
  UPDATE_PROGRESS: 'wird:update-progress',
  SNOOZE_TASK: 'wird:snooze-task',
  PAUSE_REMINDERS: 'wird:pause-reminders',
  RESUME_REMINDERS: 'wird:resume-reminders',
  EXPORT_DATA: 'wird:export-data',
  VALIDATE_IMPORT_DATA: 'wird:validate-import-data',
  IMPORT_DATA: 'wird:import-data',

  // Focus Session («جلسة تفرّغ»)
  START_SESSION: 'wird:start-session',
  GET_ACTIVE_SESSION: 'wird:get-active-session',
  PAUSE_SESSION: 'wird:pause-session',
  RESUME_SESSION: 'wird:resume-session',
  EXTEND_SESSION: 'wird:extend-session',
  CONFIRM_SESSION: 'wird:confirm-session',
  ABANDON_SESSION: 'wird:abandon-session',
  TOGGLE_SESSION_ALWAYS_ON_TOP: 'wird:toggle-session-always-on-top',
  TOGGLE_SESSION_SECONDS: 'wird:toggle-session-seconds',

  // System & Window
  GET_SYSTEM_STATUS: 'wird:get-system-status',
  SET_AUTO_START: 'wird:set-auto-start',
  TEST_NOTIFICATION: 'wird:test-notification',
  TEST_MINI_REMINDER: 'wird:test-mini-reminder',
  MINIMIZE_WINDOW: 'wird:minimize-window',
  CLOSE_WINDOW: 'wird:close-window',
  QUIT_APP: 'wird:quit-app',
  OPEN_EXTERNAL_URL: 'wird:open-external-url',

  // Updates
  CHECK_FOR_UPDATES: 'wird:check-for-updates',
  DOWNLOAD_UPDATE: 'wird:download-update',
  INSTALL_UPDATE: 'wird:install-update',
  GET_UPDATE_STATUS: 'wird:get-update-status',

  // Push events to Renderer
  EVENT_STORE_CHANGED: 'wird:event:store-changed',
  EVENT_UPDATE_STATUS_CHANGED: 'wird:event:update-status-changed',
  EVENT_TASK_STATUS_CHANGED: 'wird:event:task-status-changed',
  EVENT_SESSION_TICK: 'wird:event:session-tick'
} as const
