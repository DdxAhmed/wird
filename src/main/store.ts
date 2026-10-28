import { app } from 'electron'
import { promises as fs } from 'fs'
import { join } from 'path'
import { CURRENT_SCHEMA_VERSION, DEFAULT_TASKS, INITIAL_STORE_DATA } from '../shared/constants'
import { migrateStoreData, validateImportJson } from '../shared/migrations'
import { AppSettings, FocusSession, TaskDefinition, TaskProgress, WirdStoreData } from '../shared/types'

export class StoreManager {
  private filePath: string
  private backupDir: string
  private legacyBackupPath: string
  private data: WirdStoreData = { ...INITIAL_STORE_DATA }
  private changeListeners: Array<(data: WirdStoreData) => void> = []

  constructor(customPath?: string) {
    const dir = customPath || (app ? app.getPath('userData') : process.cwd())
    this.filePath = join(dir, 'wird-store.json')
    this.legacyBackupPath = join(dir, 'wird-store.backup.json')
    this.backupDir = join(dir, 'backups')
  }

  public async initialize(): Promise<void> {
    try {
      await fs.mkdir(this.backupDir, { recursive: true }).catch(() => {})

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
        parsed = await this.findLatestValidBackup()
      }

      const { data, migrated, fromVersion } = migrateStoreData(parsed)

      if (migrated && fromVersion > 0) {
        // Create backup of old version before saving migrated data
        await this.createRotatingBackup(content)
      }

      // Check if there was an active session that was interrupted by crash or reboot
      if (data.activeSession && (data.activeSession.status === 'active' || data.activeSession.status === 'paused')) {
        // Mark as paused so user can intentionally resume or finish; app downtime is NOT counted as reading time!
        data.activeSession.status = 'paused'
        data.activeSession.pausedAt = Date.now()
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

  public async addTask(taskData: Omit<TaskDefinition, 'id'> & { id?: string }): Promise<WirdStoreData> {
    // Prevent duplicate IDs
    const requestedId = taskData.id?.trim() || `task-${Date.now()}`
    const exists = this.data.tasks.some((t) => t.id === requestedId)
    const task: TaskDefinition = {
      ...taskData,
      id: exists ? `${requestedId}-${Date.now().toString().slice(-4)}` : requestedId,
      isCustom: true
    }
    this.data.tasks.push(task)
    await this.persist()
    this.emitChange()
    return this.data
  }

  public async deleteTask(taskId: string): Promise<WirdStoreData> {
    this.data.tasks = this.data.tasks.filter((t) => t.id !== taskId)
    await this.persist()
    this.emitChange()
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
    completedLate: boolean,
    progressCurrent?: number,
    progressTarget?: number
  ): Promise<WirdStoreData> {
    this.data.completions[occurrenceId] = {
      occurrenceId,
      taskId,
      cycleDate,
      completedAt: Date.now(),
      completedLate,
      progressCurrent,
      progressTarget
    }

    // Remove snooze if active
    if (this.data.snoozes[occurrenceId]) {
      delete this.data.snoozes[occurrenceId]
    }

    // If an active session for this occurrence is running, complete it
    if (this.data.activeSession && this.data.activeSession.occurrenceId === occurrenceId) {
      this.data.activeSession = null
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

  public async updateProgress(
    occurrenceId: string,
    current: number,
    target?: number,
    unit?: string
  ): Promise<WirdStoreData> {
    this.data.progress[occurrenceId] = {
      current,
      target: target ?? 10,
      unit: unit ?? 'صفحات'
    }
    await this.persist()
    this.emitChange()
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

  public async recordPrayerEvent(eventId: string): Promise<void> {
    this.data.prayerEvents[eventId] = Date.now()
    // Bound the persistent deduplication ledger without losing recent days.
    const cutoff = Date.now() - 45 * 24 * 60 * 60 * 1000
    for (const [id, at] of Object.entries(this.data.prayerEvents)) {
      if (at < cutoff) delete this.data.prayerEvents[id]
    }
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

  // Focus Session («جلسة تفرّغ»)
  public async setActiveSession(session: FocusSession | null): Promise<WirdStoreData> {
    this.data.activeSession = session
    await this.persist()
    this.emitChange()
    return this.data
  }

  public async updateActiveSession(partial: Partial<FocusSession>): Promise<WirdStoreData> {
    if (this.data.activeSession) {
      this.data.activeSession = {
        ...this.data.activeSession,
        ...partial
      }
      await this.persist()
      this.emitChange()
    }
    return this.data
  }

  // Backup & Restore
  public async exportJson(): Promise<string> {
    const exportPayload = {
      exportedAt: new Date().toISOString(),
      version: app ? app.getVersion() : '1.1.0',
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

    // Create rotating safety backup before replacing
    await this.createRotatingBackup(JSON.stringify(this.data, null, 2))

    const { data } = migrateStoreData(payload)
    this.data = data
    await this.persist()
    this.emitChange()
    return true
  }

  public async createRotatingBackup(rawContent?: string): Promise<void> {
    try {
      await fs.mkdir(this.backupDir, { recursive: true }).catch(() => {})
      const content = rawContent || JSON.stringify(this.data, null, 2)
      const now = new Date()
      const dateStr = now.toISOString().replace(/[:.]/g, '-').slice(0, 19)
      const fileName = `wird-backup-${dateStr}.json`
      const targetPath = join(this.backupDir, fileName)

      await fs.writeFile(targetPath, content, 'utf-8')
      // Also update legacy single backup path for backward compatibility
      await fs.writeFile(this.legacyBackupPath, content, 'utf-8').catch(() => {})

      // Prune old backups: keep maximum 5 most recent backups
      const files = await fs.readdir(this.backupDir).catch(() => [])
      const backupFiles = files
        .filter((f) => f.startsWith('wird-backup-') && f.endsWith('.json'))
        .sort()

      if (backupFiles.length > 5) {
        const toDelete = backupFiles.slice(0, backupFiles.length - 5)
        for (const oldFile of toDelete) {
          await fs.unlink(join(this.backupDir, oldFile)).catch(() => {})
        }
      }
    } catch (err) {
      console.error('Failed to create rotating backup:', err)
    }
  }

  private async findLatestValidBackup(): Promise<unknown> {
    try {
      const files = await fs.readdir(this.backupDir).catch(() => [])
      const backupFiles = files
        .filter((f) => f.startsWith('wird-backup-') && f.endsWith('.json'))
        .sort()
        .reverse()

      for (const file of backupFiles) {
        try {
          const content = await fs.readFile(join(this.backupDir, file), 'utf-8')
          const parsed = JSON.parse(content)
          if (parsed && typeof parsed === 'object') return parsed
        } catch {}
      }

      // Check legacy single backup
      const legacyContent = await fs.readFile(this.legacyBackupPath, 'utf-8').catch(() => '')
      if (legacyContent) {
        return JSON.parse(legacyContent)
      }
    } catch {}
    return null
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
      await fs.unlink(tempPath).catch(() => {})
      throw err
    }
  }
}
