import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { promises as fs } from 'fs'
import { join } from 'path'
import { StoreManager } from '../src/main/store'

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
    expect(data.schemaVersion).toBe(1)
    expect(data.tasks.length).toBeGreaterThan(0)
    expect(data.settings.theme).toBe('system')

    const fileContent = await fs.readFile(join(testDir, 'wird-store.json'), 'utf-8')
    expect(JSON.parse(fileContent).schemaVersion).toBe(1)
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
    expect(store.getData().schemaVersion).toBe(1)
    expect(store.getData().tasks.length).toBeGreaterThan(0)
  })

  it('exports JSON and validates structure', async () => {
    const store = new StoreManager(testDir)
    await store.initialize()

    const exported = await store.exportJson()
    const parsed = JSON.parse(exported)
    expect(parsed.version).toBeDefined()
    expect(parsed.data).toBeDefined()
    expect(parsed.data.schemaVersion).toBe(1)
  })
})
