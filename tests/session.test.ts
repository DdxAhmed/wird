import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { promises as fs } from 'fs'
import { join } from 'path'
import { SessionManager } from '../src/main/sessionManager'
import { StoreManager } from '../src/main/store'
import { TaskDefinition } from '../src/shared/types'

// Mock Electron modules
vi.mock('electron', () => ({
  powerMonitor: {
    on: vi.fn()
  },
  BrowserWindow: vi.fn()
}))

describe('SessionManager («جلسة تفرّغ»)', () => {
  const testDir = join(__dirname, '.temp-session-test')
  let store: StoreManager

  const sampleTask: TaskDefinition = {
    id: 'morning-adhkar',
    name: { ar: 'أذكار الصباح', en: 'Morning Adhkar' },
    enabled: true,
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    startTime: '05:30',
    endTime: '11:00',
    repeatIntervalMinutes: 15,
    snoozeDurationMinutes: 15,
    defaultFocusDurationMinutes: 15
  }

  const sampleTargetTask: TaskDefinition = {
    id: 'daily-wird',
    name: { ar: 'الورد اليومي', en: 'Daily Wird' },
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

  beforeAll(async () => {
    await fs.mkdir(testDir, { recursive: true })
    store = new StoreManager(testDir)
    await store.initialize()
  })

  afterAll(async () => {
    await fs.rm(testDir, { recursive: true, force: true }).catch(() => {})
  })

  it('starts a focus session with valid parameters and initializes countdown', async () => {
    const sessionManager = new SessionManager(store, () => null)

    const session = await sessionManager.startSession(sampleTask, 'morning-adhkar:2026-10-28', 15)
    expect(session).toBeDefined()
    expect(session.status).toBe('active')
    expect(session.durationMinutes).toBe(15)
    expect(session.remainingSeconds).toBe(900)
    expect(session.totalDurationSeconds).toBe(900)
    expect(session.isAlwaysOnTop).toBe(false)
    expect(session.showSeconds).toBe(true)

    // Store holds the active session
    expect(store.getData().activeSession?.sessionId).toBe(session.sessionId)

    // Clean up
    await sessionManager.abandonSession()
  })

  it('prevents starting a second session while another is active', async () => {
    const sessionManager = new SessionManager(store, () => null)
    await sessionManager.startSession(sampleTask, 'morning-adhkar:2026-10-28', 10)

    await expect(
      sessionManager.startSession(sampleTask, 'morning-adhkar:2026-10-28', 20)
    ).rejects.toThrow()

    await sessionManager.abandonSession()
  })

  it('pauses and resumes session correctly', async () => {
    const sessionManager = new SessionManager(store, () => null)
    await sessionManager.startSession(sampleTask, 'morning-adhkar:2026-10-28', 15)

    const paused = await sessionManager.pauseSession()
    expect(paused?.status).toBe('paused')
    expect(paused?.pausedAt).toBeDefined()

    const resumed = await sessionManager.resumeSession()
    expect(resumed?.status).toBe('active')
    expect(resumed?.pausedAt).toBeUndefined()

    await sessionManager.abandonSession()
  })

  it('extends session time on request', async () => {
    const sessionManager = new SessionManager(store, () => null)
    await sessionManager.startSession(sampleTask, 'morning-adhkar:2026-10-28', 10)

    const extended = await sessionManager.extendSession(5)
    expect(extended?.remainingSeconds).toBe(15 * 60)
    expect(extended?.totalDurationSeconds).toBe(15 * 60)

    await sessionManager.abandonSession()
  })

  it('toggles always on top and show seconds', async () => {
    const sessionManager = new SessionManager(store, () => null)
    await sessionManager.startSession(sampleTask, 'morning-adhkar:2026-10-28', 10)

    const onTop = await sessionManager.toggleAlwaysOnTop()
    expect(onTop).toBe(true)
    expect(store.getData().activeSession?.isAlwaysOnTop).toBe(true)

    const seconds = await sessionManager.toggleShowSeconds()
    expect(seconds).toBe(false)
    expect(store.getData().activeSession?.showSeconds).toBe(false)

    await sessionManager.abandonSession()
  })

  it('confirms session, records completion and updates progress if target is present', async () => {
    const sessionManager = new SessionManager(store, () => null)
    const occId = 'daily-wird:2026-10-28'
    await sessionManager.startSession(sampleTargetTask, occId, 20)

    await sessionManager.confirmSession()

    // Active session must be cleared
    expect(store.getData().activeSession).toBeNull()

    // Completion recorded
    const completion = store.getData().completions[occId]
    expect(completion).toBeDefined()
    expect(completion.completedLate).toBe(false)

    // Progress updated to full 10 pages
    const progress = store.getData().progress[occId]
    expect(progress).toBeDefined()
    expect(progress.current).toBe(10)
    expect(progress.target).toBe(10)
  })

  it('abandons session without marking completion', async () => {
    const sessionManager = new SessionManager(store, () => null)
    const occId = 'morning-adhkar:2026-10-29'
    await sessionManager.startSession(sampleTask, occId, 15)

    await sessionManager.abandonSession()

    expect(store.getData().activeSession).toBeNull()
    expect(store.getData().completions[occId]).toBeUndefined()
  })
})
