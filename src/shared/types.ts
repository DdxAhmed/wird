export type Language = 'ar' | 'en'
export type ThemeMode = 'light' | 'dark' | 'system'
export type UpdateChannel = 'stable' | 'beta'

export type TaskStatus = 'upcoming' | 'due' | 'snoozed' | 'completed' | 'expired'

export interface LocalizedString {
  ar: string
  en: string
}

export interface TaskTarget {
  enabled: boolean
  total: number // e.g. 10
  unit: string // e.g. "صفحات", "صفحة", "تسبيحة"
}

export interface TaskDefinition {
  id: string
  name: LocalizedString
  description?: LocalizedString
  enabled: boolean
  daysOfWeek: number[] // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  startTime: string // "HH:mm" in 24-hour format
  endTime: string // "HH:mm" in 24-hour format (supports overnight span, e.g. "22:00" to "02:00")
  repeatIntervalMinutes: number // default: 15 min
  snoozeDurationMinutes: number // default: 15 min
  defaultFocusDurationMinutes: number // default: 15 min
  isCustom?: boolean
  isDefault?: boolean
  target?: TaskTarget
}

export interface CompletionRecord {
  occurrenceId: string
  taskId: string
  cycleDate: string // YYYY-MM-DD
  completedAt: number // timestamp ms
  completedLate: boolean // true if confirmed after window closed
  progressCurrent?: number
  progressTarget?: number
}

export interface TaskProgress {
  current: number
  target: number
  unit: string
}

export interface FocusSession {
  sessionId: string
  taskId: string
  occurrenceId: string
  taskName: string
  durationMinutes: number
  totalDurationSeconds: number
  remainingSeconds: number
  status: 'active' | 'paused' | 'awaiting_confirmation' | 'completed' | 'abandoned'
  startTime: number // timestamp ms
  lastTickTime: number // timestamp ms
  pausedAt?: number
  isAlwaysOnTop: boolean
  showSeconds: boolean
  hasTarget?: boolean
  targetTotal?: number
  targetUnit?: string
}

export type MiniReminderPosition = 'bottom-right' | 'top-right' | 'bottom-left' | 'top-left'

export interface AppSettings {
  schemaVersion: number
  theme: ThemeMode
  language: Language
  autoStartOnBoot: boolean
  startMinimizedToTray: boolean
  hasCompletedOnboarding: boolean
  soundEnabled: boolean
  pausedUntil: number | null // timestamp ms or null
  autoCheckUpdates: boolean
  updateChannel: UpdateChannel
  lastUpdateCheck: number | null
  miniReminderEnabled: boolean
  miniReminderPosition: MiniReminderPosition
  hideWeeklyHistory: boolean
  githubRepoUrl: string
  issuesUrl: string
  licenseUrl: string
}

export interface BackupMetadata {
  id: string
  timestamp: number
  version: string
  filePath: string
  taskCount: number
  completionCount: number
}

export interface WirdStoreData {
  schemaVersion: number
  settings: AppSettings
  tasks: TaskDefinition[]
  completions: Record<string, CompletionRecord> // keyed by occurrenceId
  progress: Record<string, TaskProgress> // keyed by occurrenceId
  snoozes: Record<string, number> // keyed by occurrenceId -> snoozedUntil timestamp
  lastNotified: Record<string, number> // keyed by occurrenceId -> last notification timestamp
  activeSession: FocusSession | null
}

export interface TaskOccurrenceInfo {
  task: TaskDefinition
  occurrenceId: string
  cycleDate: string // YYYY-MM-DD
  windowStart: number // timestamp ms
  windowEnd: number // timestamp ms
  status: TaskStatus
  completionRecord?: CompletionRecord
  progress?: TaskProgress
  snoozedUntil?: number
  nextReminderTime: number | null // timestamp ms for next notification, or null
  isOvernight: boolean
}

export interface Clock {
  now(): number
}

export interface UpdateInfo {
  version: string
  releaseDate?: string
  releaseNotes?: string
  prerelease?: boolean
}

export interface UpdateProgress {
  bytesPerSecond: number
  percent: number
  transferred: number
  total: number
}

export type UpdateStatus =
  | { state: 'idle' }
  | { state: 'checking' }
  | { state: 'available'; info: UpdateInfo }
  | { state: 'not-available'; checkedAt: number }
  | { state: 'downloading'; progress: UpdateProgress; info: UpdateInfo }
  | { state: 'downloaded'; info: UpdateInfo }
  | { state: 'error'; message: string }

export interface SystemStatus {
  isAutoStartEnabled: boolean
  appVersion: string
  platform: string
  isPackaged: boolean
}

export interface ExportData {
  exportedAt: string
  version: string
  data: WirdStoreData
}

export interface ImportValidationResult {
  valid: boolean
  error?: string
  taskCount?: number
  completionCount?: number
  settingsPreview?: Partial<AppSettings>
}
