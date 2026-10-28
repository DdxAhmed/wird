import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { promises as fs } from 'fs'
import { join } from 'path'
import { StoreManager } from '../src/main/store'
import { CURRENT_SCHEMA_VERSION } from '../src/shared/constants'

describe('StoreManager & Persistence', () => {
  const testDir = join(__dirname, '.temp-store-test')

  beforeAll(async () => {
    await fs.mkdir(testDir, { recursive: true })
  })

  afterAll(async () => {
    await fs.rm(testDir, { recursive: true, force: true }).catch(() => {})
  })

  it('initializes default store if file does not exist', async () => {
    const store = new StoreManager(testDir)
    await store.initialize()

    const data = store.getData()
    expect(data.schemaVersion).toBe(CURRENT_SCHEMA_VERSION)
    expect(data.tasks.length).toBeGreaterThan(0)
    expect(data.settings.theme).toBe('system')

    const fileContent = await fs.readFile(join(testDir, 'wird-store.json'), 'utf-8')
    expect(JSON.parse(fileContent).schemaVersion).toBe(CURRENT_SCHEMA_VERSION)
  })

  it('updates settings and persists atomically', async () => {
    const store = new StoreManager(testDir)
    await store.initialize()

    await store.updateSettings({ theme: 'dark', language: 'en' })
    expect(store.getData().settings.theme).toBe('dark')
    expect(store.getData().settings.language).toBe('en')

    // Read directly from disk
    const onDisk = JSON.parse(await fs.readFile(join(testDir, 'wird-store.json'), 'utf-8'))
    expect(onDisk.settings.theme).toBe('dark')
    expect(onDisk.settings.language).toBe('en')
  })

  it('adds and deletes custom tasks', async () => {
    const store = new StoreManager(testDir)
    await store.initialize()

    const initialCount = store.getData().tasks.length
    await store.addTask({
      name: { ar: 'صلاة الضحى', en: 'Duha Prayer' },
      enabled: true,
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
      startTime: '08:00',
      endTime: '11:30',
      repeatIntervalMinutes: 20,
      snoozeDurationMinutes: 15,
      defaultFocusDurationMinutes: 15
    })

    const afterAdd = store.getData().tasks
    expect(afterAdd.length).toBe(initialCount + 1)
    const customTask = afterAdd.find((t) => t.name.ar === 'صلاة الضحى')
    expect(customTask).toBeDefined()
    expect(customTask?.isCustom).toBe(true)

    // Delete custom task
    await store.deleteTask(customTask!.id)
    expect(store.getData().tasks.length).toBe(initialCount)
  })

  it('updates progress and undos completion without alerts', async () => {
    const store = new StoreManager(testDir)
    await store.initialize()

    const occId = 'daily-wird:2026-10-28'
    await store.updateProgress(occId, 5, 10, 'صفحات')
    expect(store.getData().progress[occId]).toBeDefined()
    expect(store.getData().progress[occId].current).toBe(5)
    expect(store.getData().progress[occId].target).toBe(10)

    // Complete task
    await store.recordCompletion(occId, 'daily-wird', '2026-10-28', false, 10, 10)
    expect(store.getData().completions[occId]).toBeDefined()

    // Undo completion
    await store.undoCompletion(occId)
    expect(store.getData().completions[occId]).toBeUndefined()
  })

  it('records completion and removes snooze', async () => {
    const store = new StoreManager(testDir)
    await store.initialize()

    const occId = 'morning-adhkar:2026-10-28'
    await store.snoozeTask(occId, 15)
    expect(store.getData().snoozes[occId]).toBeDefined()

    await store.recordCompletion(occId, 'morning-adhkar', '2026-10-28', false)
    expect(store.getData().completions[occId]).toBeDefined()
    expect(store.getData().completions[occId].completedLate).toBe(false)
    expect(store.getData().snoozes[occId]).toBeUndefined() // Snooze removed!
  })

  it('handles corrupted store gracefully by creating emergency backup and recovering', async () => {
    const corruptDir = join(testDir, 'corrupt-sub')
    await fs.mkdir(corruptDir, { recursive: true })
    const storeFile = join(corruptDir, 'wird-store.json')

    // Write malformed JSON
    await fs.writeFile(storeFile, '{ broken invalid json !!!', 'utf-8')

    const store = new StoreManager(corruptDir)
    await store.initialize()

    // Must not throw, but fall back to valid initial store
    expect(store.getData().schemaVersion).toBe(CURRENT_SCHEMA_VERSION)
    expect(store.getData().tasks.length).toBeGreaterThan(0)
  })

  it('exports JSON and validates structure', async () => {
    const store = new StoreManager(testDir)
    await store.initialize()

    const exported = await store.exportJson()
    const parsed = JSON.parse(exported)
    expect(parsed.version).toBeDefined()
    expect(parsed.data).toBeDefined()
    expect(parsed.data.schemaVersion).toBe(CURRENT_SCHEMA_VERSION)
  })

  it('maintains rotating backups and caps to 5 most recent', async () => {
    const rotatingDir = join(testDir, 'rotating-sub')
    await fs.mkdir(rotatingDir, { recursive: true })

    const store = new StoreManager(rotatingDir)
    await store.initialize()

    // Create 7 manual backups
    for (let i = 0; i < 7; i++) {
      await store.createRotatingBackup(JSON.stringify({ backupIndex: i }))
      await new Promise((r) => setTimeout(r, 10))
    }

    const backupsDir = join(rotatingDir, 'backups')
    const files = await fs.readdir(backupsDir)
    const backupFiles = files.filter((f) => f.startsWith('wird-backup-') && f.endsWith('.json'))

    // Must not exceed 5 files
    expect(backupFiles.length).toBeLessThanOrEqual(5)
  })
})
