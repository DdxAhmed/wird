import { CURRENT_SCHEMA_VERSION, DEFAULT_SETTINGS, DEFAULT_TASKS } from './constants'
import { ImportValidationResult, TaskDefinition, WirdStoreData } from './types'

export type MigrationFn = (oldData: Record<string, unknown>) => Record<string, unknown>

/**
 * Registry of schema migrations.
 * Each migration transforms data from version N to version N + 1.
 */
export const migrations: Record<number, MigrationFn> = {
  // Example future migration:
  // 1: (data) => {
  //   data.schemaVersion = 2
  //   // transform fields...
  //   return data
  // }
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

  const daysOfWeek =
    Array.isArray(t.daysOfWeek) && t.daysOfWeek.every((d) => typeof d === 'number' && d >= 0 && d <= 6)
      ? t.daysOfWeek
      : [0, 1, 2, 3, 4, 5, 6]

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
    snoozeDurationMinutes
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
        snoozes: {},
        lastNotified: {}
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
      // Direct jump to current version if no intermediate migration needed
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

  // Ensure default tasks exist if list was empty or corrupted
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

  const snoozes =
    currentData.snoozes && typeof currentData.snoozes === 'object'
      ? (currentData.snoozes as WirdStoreData['snoozes'])
      : {}

  const lastNotified =
    currentData.lastNotified && typeof currentData.lastNotified === 'object'
      ? (currentData.lastNotified as WirdStoreData['lastNotified'])
      : {}

  const finalData: WirdStoreData = {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    settings,
    tasks: sanitizedTasks,
    completions,
    snoozes,
    lastNotified
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

    const payload = parsed.data || parsed // Support both { data: {...} } and direct {...}

    if (!payload.tasks || !Array.isArray(payload.tasks)) {
      return { valid: false, error: 'الملف لا يحتوي على قائمة مهام صالحة | Missing or invalid tasks array' }
    }

    const validTasks = payload.tasks.map(validateAndSanitizeTask).filter(Boolean)
    if (validTasks.length === 0) {
      return { valid: false, error: 'لم يتم العثور على أي مهمة صالحة في الملف | No valid tasks found in import' }
    }

    const completionCount = payload.completions && typeof payload.completions === 'object'
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
