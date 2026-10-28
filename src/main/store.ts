import { app } from 'electron'
import { promises as fs } from 'fs'
import { join } from 'path'
import { CURRENT_SCHEMA_VERSION, DEFAULT_TASKS, INITIAL_STORE_DATA } from '../shared/constants'
import { migrateStoreData, validateImportJson } from '../shared/migrations'
import { AppSettings, TaskDefinition, WirdStoreData } from '../shared/types'

export class StoreManager {
  private filePath: string
  private backupPath: string
  private data: WirdStoreData = { ...INITIAL_STORE_DATA }
  private changeListeners: Array<(data: WirdStoreData) => void> = []

  constructor(customPath?: string) {
    const dir = customPath || (app ? app.getPath('userData') : process.cwd())
    this.filePath = join(dir, 'wird-store.json')
    this.backupPath = join(dir, 'wird-store.backup.json')
  }

  public async initialize(): Promise<void> {
    try {
      const fileExists = await fs
        .access(this.filePath)
        .then(() => true)
        .catch(() => false)

      if (!fileExists) {
        this.data = { ...INITIAL_STORE_DATA }
        await this.persist()
        return
      }

      const content = await fs.readFile(this.filePath, 'utf-8')
      let parsed: unknown

      try {
        parsed = JSON.parse(content)
      } catch (parseErr) {
        console.error('Store file corrupted, creating emergency backup:', parseErr)
        const corruptedPath = join(
          app ? app.getPath('userData') : process.cwd(),
          `wird-store.corrupted-${Date.now()}.json`
        )
        await fs.writeFile(corruptedPath, content, 'utf-8').catch(() => {})

        // Try restoring from recent backup if available
        const backupExists = await fs
          .access(this.backupPath)
          .then(() => true)
          .catch(() => false)

        if (backupExists) {
          try {
            const backupContent = await fs.readFile(this.backupPath, 'utf-8')
            parsed = JSON.parse(backupContent)
          } catch {
            parsed = null
          }
        }
      }

      const { data, migrated, fromVersion } = migrateStoreData(parsed)

      if (migrated && fromVersion > 0) {
        // Create backup of old version before saving migrated data
        await fs.writeFile(this.backupPath, content, 'utf-8').catch(() => {})
      }

      this.data = data
      await this.persist()
    } catch (err) {
      console.error('Failed to initialize store:', err)
      this.data = { ...INITIAL_STORE_DATA }
    }
  }

  public getData(): WirdStoreData {
    return this.data
  }

  public async updateSettings(partial: Partial<AppSettings>): Promise<WirdStoreData> {
    this.data.settings = {
      ...this.data.settings,
      ...partial,
      schemaVersion: CURRENT_SCHEMA_VERSION
    }
    await this.persist()
    this.emitChange()
    return this.data
  }

  public async updateTask(taskId: string, partial: Partial<TaskDefinition>): Promise<WirdStoreData> {
    const index = this.data.tasks.findIndex((t) => t.id === taskId)
    if (index !== -1) {
      this.data.tasks[index] = {
        ...this.data.tasks[index],
        ...partial
      }
      await this.persist()
      this.emitChange()
    }
    return this.data
  }

  public async resetTasksToDefault(): Promise<WirdStoreData> {
    this.data.tasks = [...DEFAULT_TASKS]
    await this.persist()
    this.emitChange()
    return this.data
  }

  public async recordCompletion(
    occurrenceId: string,
    taskId: string,
    cycleDate: string,
    completedLate: boolean
  ): Promise<WirdStoreData> {
    this.data.completions[occurrenceId] = {
      occurrenceId,
      taskId,
      cycleDate,
      completedAt: Date.now(),
      completedLate
    }
    // Remove snooze if active
    if (this.data.snoozes[occurrenceId]) {
      delete this.data.snoozes[occurrenceId]
    }
    await this.persist()
    this.emitChange()
    return this.data
  }

  public async undoCompletion(occurrenceId: string): Promise<WirdStoreData> {
    if (this.data.completions[occurrenceId]) {
      delete this.data.completions[occurrenceId]
      await this.persist()
      this.emitChange()
    }
    return this.data
  }

  public async snoozeTask(occurrenceId: string, minutes: number): Promise<WirdStoreData> {
    const snoozedUntil = Date.now() + Math.max(1, minutes) * 60 * 1000
    this.data.snoozes[occurrenceId] = snoozedUntil
    await this.persist()
    this.emitChange()
    return this.data
  }

  public async recordNotification(occurrenceId: string): Promise<void> {
    this.data.lastNotified[occurrenceId] = Date.now()
    await this.persist()
    this.emitChange()
  }

  public async pauseReminders(durationMinutes: number): Promise<WirdStoreData> {
    const pausedUntil = Date.now() + durationMinutes * 60 * 1000
    this.data.settings.pausedUntil = pausedUntil
    await this.persist()
    this.emitChange()
    return this.data
  }

  public async resumeReminders(): Promise<WirdStoreData> {
    this.data.settings.pausedUntil = null
    await this.persist()
    this.emitChange()
    return this.data
  }

  public async exportJson(): Promise<string> {
    const exportPayload = {
      exportedAt: new Date().toISOString(),
      version: app ? app.getVersion() : '1.0.0',
      data: this.data
    }
    return JSON.stringify(exportPayload, null, 2)
  }

  public validateImport(jsonString: string) {
    return validateImportJson(jsonString)
  }

  public async importJson(jsonString: string): Promise<boolean> {
    const validation = validateImportJson(jsonString)
    if (!validation.valid) {
      throw new Error(validation.error || 'Invalid import payload')
    }

    const parsed = JSON.parse(jsonString)
    const payload = parsed.data || parsed

    // Create safety backup before replacing
    await fs.writeFile(this.backupPath, JSON.stringify(this.data, null, 2), 'utf-8').catch(() => {})

    const { data } = migrateStoreData(payload)
    this.data = data
    await this.persist()
    this.emitChange()
    return true
  }

  public onChange(listener: (data: WirdStoreData) => void): () => void {
    this.changeListeners.push(listener)
    return () => {
      this.changeListeners = this.changeListeners.filter((l) => l !== listener)
    }
  }

  private emitChange(): void {
    for (const listener of this.changeListeners) {
      try {
        listener(this.data)
      } catch (err) {
        console.error('Error in store change listener:', err)
      }
    }
  }

  /**
   * Atomic file persistence via temp file rename
   */
  private async persist(): Promise<void> {
    const tempPath = `${this.filePath}.${Date.now()}.tmp`
    const json = JSON.stringify(this.data, null, 2)

    try {
      await fs.writeFile(tempPath, json, 'utf-8')
      await fs.rename(tempPath, this.filePath)
    } catch (err) {
      console.error('Failed to write store file atomically:', err)
      // Cleanup temp if it exists
      await fs.unlink(tempPath).catch(() => {})
      throw err
    }
  }
}
