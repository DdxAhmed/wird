import { CURRENT_SCHEMA_VERSION, DEFAULT_SETTINGS, DEFAULT_TASKS } from './constants'
import { ImportValidationResult, TaskDefinition, TaskTarget, WirdStoreData } from './types'

export type MigrationFn = (oldData: Record<string, unknown>) => Record<string, unknown>

export const migrations: Record<number, MigrationFn> = {
  // Migration from v1 to v2: Focus session, targets, custom tasks, mini reminder settings
  1: (data) => {
    const rawSettings = (data.settings as Record<string, unknown>) || {}
    data.settings = {
      ...DEFAULT_SETTINGS,
      ...rawSettings,
      miniReminderEnabled: rawSettings.miniReminderEnabled ?? true,
      miniReminderPosition: rawSettings.miniReminderPosition ?? 'bottom-right',
      hideWeeklyHistory: rawSettings.hideWeeklyHistory ?? false,
      githubRepoUrl: DEFAULT_SETTINGS.githubRepoUrl,
      issuesUrl: DEFAULT_SETTINGS.issuesUrl,
      licenseUrl: DEFAULT_SETTINGS.licenseUrl,
      schemaVersion: 2
    }

    if (!data.progress || typeof data.progress !== 'object') {
      data.progress = {}
    }
    if (data.activeSession === undefined) {
      data.activeSession = null
    }

    // Update tasks with default focus duration if missing
    if (Array.isArray(data.tasks)) {
      data.tasks = data.tasks.map((task: unknown) => {
        const t = task as Record<string, unknown>
        return {
          ...t,
          defaultFocusDurationMinutes: typeof t.defaultFocusDurationMinutes === 'number' ? t.defaultFocusDurationMinutes : 15
        }
      })
    }

    data.schemaVersion = 2
    return data
  }
}

/**
 * Validates and sanitizes a TaskDefinition.
 */
export function validateAndSanitizeTask(task: unknown): TaskDefinition | null {
  if (!task || typeof task !== 'object') return null
  const t = task as Record<string, unknown>

  if (typeof t.id !== 'string' || !t.id.trim()) return null
  if (!t.name || typeof t.name !== 'object') return null
  const name = t.name as Record<string, unknown>
  if (typeof name.ar !== 'string' || typeof name.en !== 'string') return null

  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/
  const startTime = typeof t.startTime === 'string' && timeRegex.test(t.startTime) ? t.startTime : '05:30'
  const endTime = typeof t.endTime === 'string' && timeRegex.test(t.endTime) ? t.endTime : '11:00'

  const repeatIntervalMinutes =
    typeof t.repeatIntervalMinutes === 'number' && t.repeatIntervalMinutes > 0
      ? Math.round(t.repeatIntervalMinutes)
      : 15

  const snoozeDurationMinutes =
    typeof t.snoozeDurationMinutes === 'number' && t.snoozeDurationMinutes > 0
      ? Math.round(t.snoozeDurationMinutes)
      : 15

  const defaultFocusDurationMinutes =
    typeof t.defaultFocusDurationMinutes === 'number' && t.defaultFocusDurationMinutes > 0
      ? Math.min(180, Math.max(1, Math.round(t.defaultFocusDurationMinutes)))
      : 15

  const daysOfWeek =
    Array.isArray(t.daysOfWeek) && t.daysOfWeek.every((d) => typeof d === 'number' && d >= 0 && d <= 6)
      ? t.daysOfWeek
      : [0, 1, 2, 3, 4, 5, 6]

  let target: TaskTarget | undefined
  if (t.target && typeof t.target === 'object') {
    const rawTarget = t.target as Record<string, unknown>
    target = {
      enabled: Boolean(rawTarget.enabled),
      total: typeof rawTarget.total === 'number' && rawTarget.total > 0 ? Math.round(rawTarget.total) : 10,
      unit: typeof rawTarget.unit === 'string' && rawTarget.unit.trim() ? rawTarget.unit.trim() : 'صفحات'
    }
  }

  return {
    id: t.id,
    name: {
      ar: name.ar,
      en: name.en
    },
    description:
      t.description && typeof t.description === 'object'
        ? {
            ar: String((t.description as Record<string, unknown>).ar || ''),
            en: String((t.description as Record<string, unknown>).en || '')
          }
        : undefined,
    enabled: typeof t.enabled === 'boolean' ? t.enabled : true,
    daysOfWeek,
    startTime,
    endTime,
    repeatIntervalMinutes,
    snoozeDurationMinutes,
    defaultFocusDurationMinutes,
    isCustom: Boolean(t.isCustom),
    target
  }
}

/**
 * Runs all applicable migrations sequentially on the store data.
 */
export function migrateStoreData(raw: unknown): {
  data: WirdStoreData
  migrated: boolean
  fromVersion: number
  toVersion: number
} {
  if (!raw || typeof raw !== 'object') {
    return {
      data: {
        schemaVersion: CURRENT_SCHEMA_VERSION,
        settings: { ...DEFAULT_SETTINGS },
        tasks: [...DEFAULT_TASKS],
        completions: {},
        progress: {},
        snoozes: {},
        lastNotified: {},
        activeSession: null
      },
      migrated: true,
      fromVersion: 0,
      toVersion: CURRENT_SCHEMA_VERSION
    }
  }

  const rawObj = raw as Record<string, unknown>
  const fromVersion = typeof rawObj.schemaVersion === 'number' ? rawObj.schemaVersion : 0
  let currentVersion = fromVersion
  let currentData = { ...rawObj }

  while (currentVersion < CURRENT_SCHEMA_VERSION) {
    const migration = migrations[currentVersion]
    if (migration) {
      currentData = migration(currentData)
      currentVersion++
    } else {
      currentVersion = CURRENT_SCHEMA_VERSION
      currentData.schemaVersion = CURRENT_SCHEMA_VERSION
      break
    }
  }

  // Sanitize and validate complete structure
  const rawTasks = Array.isArray(currentData.tasks) ? currentData.tasks : []
  const sanitizedTasks: TaskDefinition[] = []

  for (const rawTask of rawTasks) {
    const valid = validateAndSanitizeTask(rawTask)
    if (valid) sanitizedTasks.push(valid)
  }

  if (sanitizedTasks.length === 0) {
    sanitizedTasks.push(...DEFAULT_TASKS)
  }

  const rawSettings = (currentData.settings as Record<string, unknown>) || {}
  const settings = {
    ...DEFAULT_SETTINGS,
    ...rawSettings,
    schemaVersion: CURRENT_SCHEMA_VERSION
  }

  const completions =
    currentData.completions && typeof currentData.completions === 'object'
      ? (currentData.completions as WirdStoreData['completions'])
      : {}

  const progress =
    currentData.progress && typeof currentData.progress === 'object'
      ? (currentData.progress as WirdStoreData['progress'])
      : {}

  const snoozes =
    currentData.snoozes && typeof currentData.snoozes === 'object'
      ? (currentData.snoozes as WirdStoreData['snoozes'])
      : {}

  const lastNotified =
    currentData.lastNotified && typeof currentData.lastNotified === 'object'
      ? (currentData.lastNotified as WirdStoreData['lastNotified'])
      : {}

  const activeSession =
    currentData.activeSession && typeof currentData.activeSession === 'object'
      ? (currentData.activeSession as WirdStoreData['activeSession'])
      : null

  const finalData: WirdStoreData = {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    settings,
    tasks: sanitizedTasks,
    completions,
    progress,
    snoozes,
    lastNotified,
    activeSession
  }

  return {
    data: finalData,
    migrated: fromVersion !== CURRENT_SCHEMA_VERSION,
    fromVersion,
    toVersion: CURRENT_SCHEMA_VERSION
  }
}

/**
 * Validates JSON data imported by the user before applying it.
 */
export function validateImportJson(rawContent: string): ImportValidationResult {
  try {
    const parsed = JSON.parse(rawContent)
    if (!parsed || typeof parsed !== 'object') {
      return { valid: false, error: 'الملف لا يحتوي على كائن JSON صالح | JSON must be a valid object' }
    }

    const payload = parsed.data || parsed

    if (!payload.tasks || !Array.isArray(payload.tasks)) {
      return { valid: false, error: 'الملف لا يحتوي على قائمة مهام صالحة | Missing or invalid tasks array' }
    }

    const validTasks = payload.tasks.map(validateAndSanitizeTask).filter(Boolean)
    if (validTasks.length === 0) {
      return { valid: false, error: 'لم يتم العثور على أي مهمة صالحة في الملف | No valid tasks found in import' }
    }

    const completionCount =
      payload.completions && typeof payload.completions === 'object'
        ? Object.keys(payload.completions).length
        : 0

    return {
      valid: true,
      taskCount: validTasks.length,
      completionCount,
      settingsPreview: payload.settings || {}
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    return { valid: false, error: `خطأ في قراءة صيغة JSON: ${msg}` }
  }
}
