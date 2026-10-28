import { describe, expect, it } from 'vitest'
import { CURRENT_SCHEMA_VERSION, DEFAULT_TASKS } from '../src/shared/constants'
import {
  migrateStoreData,
  validateAndSanitizeTask,
  validateImportJson
} from '../src/shared/migrations'

describe('Storage Migrations & Validation', () => {
  it('migrates empty or undefined data to default schema', () => {
    const { data, migrated, toVersion } = migrateStoreData(null)
    expect(migrated).toBe(true)
    expect(toVersion).toBe(CURRENT_SCHEMA_VERSION)
    expect(data.schemaVersion).toBe(CURRENT_SCHEMA_VERSION)
    expect(data.tasks.length).toBe(DEFAULT_TASKS.length)
    expect(data.settings.theme).toBe('system')
  })

  it('preserves user settings and tasks when migrating', () => {
    const rawOld = {
      schemaVersion: 0,
      settings: {
        theme: 'dark',
        language: 'en',
        soundEnabled: false
      },
      tasks: [
        {
          id: 'custom-task',
          name: { ar: 'مهمة مخصصة', en: 'Custom Task' },
          enabled: true,
          startTime: '06:00',
          endTime: '08:00',
          repeatIntervalMinutes: 10,
          snoozeDurationMinutes: 10,
          daysOfWeek: [1, 2, 3]
        }
      ],
      completions: {
        'custom-task:2026-10-28': {
          occurrenceId: 'custom-task:2026-10-28',
          taskId: 'custom-task',
          cycleDate: '2026-10-28',
          completedAt: 12345678,
          completedLate: false
        }
      }
    }

    const { data, toVersion } = migrateStoreData(rawOld)
    expect(toVersion).toBe(CURRENT_SCHEMA_VERSION)
    expect(data.settings.theme).toBe('dark')
    expect(data.settings.language).toBe('en')
    expect(data.settings.soundEnabled).toBe(false)
    expect(data.tasks[0].id).toBe('custom-task')
    expect(data.tasks[0].daysOfWeek).toEqual([1, 2, 3])
    expect(data.completions['custom-task:2026-10-28']).toBeDefined()
  })

  it('sanitizes tasks with invalid parameters', () => {
    const invalidTask = {
      id: 'bad-task',
      name: { ar: 'تست', en: 'Test' },
      startTime: 'invalid-time',
      endTime: '25:99',
      repeatIntervalMinutes: -5,
      snoozeDurationMinutes: 0,
      daysOfWeek: [1, 99, -2]
    }

    const sanitized = validateAndSanitizeTask(invalidTask)
    expect(sanitized).not.toBeNull()
    if (sanitized) {
      expect(sanitized.startTime).toBe('05:30') // fallback
      expect(sanitized.endTime).toBe('11:00') // fallback
      expect(sanitized.repeatIntervalMinutes).toBe(15) // fallback
      expect(sanitized.snoozeDurationMinutes).toBe(15) // fallback
      expect(sanitized.daysOfWeek).toEqual([0, 1, 2, 3, 4, 5, 6]) // fallback
    }
  })

  describe('Import JSON validation', () => {
    it('validates a correct import payload', () => {
      const validPayload = JSON.stringify({
        exportedAt: '2026-10-28T12:00:00Z',
        version: '1.0.0',
        data: {
          schemaVersion: 1,
          tasks: DEFAULT_TASKS,
          completions: {
            'morning-adhkar:2026-10-28': {
              occurrenceId: 'morning-adhkar:2026-10-28',
              taskId: 'morning-adhkar',
              cycleDate: '2026-10-28',
              completedAt: 1700000000,
              completedLate: false
            }
          }
        }
      })

      const result = validateImportJson(validPayload)
      expect(result.valid).toBe(true)
      expect(result.taskCount).toBe(DEFAULT_TASKS.length)
      expect(result.completionCount).toBe(1)
    })

    it('rejects invalid JSON syntax', () => {
      const result = validateImportJson('{ broken json')
      expect(result.valid).toBe(false)
      expect(result.error).toContain('JSON')
    })

    it('rejects payload missing tasks array', () => {
      const result = validateImportJson(JSON.stringify({ someField: 123 }))
      expect(result.valid).toBe(false)
      expect(result.error).toBeDefined()
    })
  })
})
