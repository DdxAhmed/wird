import { BrowserWindow, powerMonitor } from 'electron'
import { FocusSession, TaskDefinition } from '../shared/types'
import { StoreManager } from './store'

export class SessionManager {
  private store: StoreManager
  private timer: NodeJS.Timeout | null = null
  private getMainWindow: () => BrowserWindow | null
  private onSessionEndedCallback?: (completed: boolean) => void

  constructor(
    store: StoreManager,
    getMainWindow: () => BrowserWindow | null,
    onSessionEnded?: (completed: boolean) => void
  ) {
    this.store = store
    this.getMainWindow = getMainWindow
    this.onSessionEndedCallback = onSessionEnded

    this.registerPowerHooks()
    this.checkInterruptedSessionOnStartup()
  }

  private registerPowerHooks(): void {
    powerMonitor.on('lock-screen', () => {
      this.handleSystemPause('Screen locked')
    })

    powerMonitor.on('suspend', () => {
      this.handleSystemPause('System suspended')
    })

    powerMonitor.on('unlock-screen', () => {
      this.handleSystemWake('Screen unlocked')
    })

    powerMonitor.on('resume', () => {
      this.handleSystemWake('System resumed')
    })
  }

  private handleSystemPause(reason: string): void {
    const session = this.store.getData().activeSession
    if (session && session.status === 'active') {
      console.log(`[SessionManager] Pausing session due to ${reason}`)
      this.pauseSession()
    }
  }

  private handleSystemWake(reason: string): void {
    const session = this.store.getData().activeSession
    if (session && session.status === 'paused') {
      console.log(`[SessionManager] System resumed (${reason}). Session remains paused awaiting user resumption.`)
      // Ensure lastTickTime is updated to now so downtime is NOT counted!
      session.lastTickTime = Date.now()
      this.store.updateActiveSession({ lastTickTime: Date.now() }).catch(() => {})
    }
  }

  private checkInterruptedSessionOnStartup(): void {
    const session = this.store.getData().activeSession
    if (session && (session.status === 'active' || session.status === 'paused')) {
      console.log('[SessionManager] Found interrupted session on startup. Awaiting user resumption.')
      // Ensure timer is not ticking until user actively clicks resume
      this.stopTimer()
      this.store.updateActiveSession({ status: 'paused', lastTickTime: Date.now() }).catch(() => {})
    }
  }

  public getActiveSession(): FocusSession | null {
    return this.store.getData().activeSession
  }

  public async startSession(
    task: TaskDefinition,
    occurrenceId: string,
    durationMinutes: number
  ): Promise<FocusSession> {
    const current = this.store.getData().activeSession
    if (
      current &&
      (current.status === 'active' || current.status === 'paused' || current.status === 'awaiting_confirmation')
    ) {
      throw new Error('توجد جلسة تفرّغ نشطة بالفعل | A focus session is already running')
    }

    // Validate duration: between 1 and 180 minutes
    const validMinutes = Math.min(180, Math.max(1, Math.round(durationMinutes)))
    const totalSeconds = validMinutes * 60
    const lang = this.store.getData().settings.language || 'ar'
    const taskName = task.name[lang] || task.name.ar

    const session: FocusSession = {
      sessionId: `session-${Date.now()}`,
      taskId: task.id,
      occurrenceId,
      taskName,
      durationMinutes: validMinutes,
      totalDurationSeconds: totalSeconds,
      remainingSeconds: totalSeconds,
      status: 'active',
      startTime: Date.now(),
      lastTickTime: Date.now(),
      isAlwaysOnTop: false,
      showSeconds: true,
      hasTarget: Boolean(task.target?.enabled),
      targetTotal: task.target?.total,
      targetUnit: task.target?.unit
    }

    await this.store.setActiveSession(session)
    this.startTimer()

    // Configure main window for Focus Session
    const win = this.getMainWindow()
    if (win) {
      if (win.isMinimized()) win.restore()
      win.show()
      win.focus()
    }

    return session
  }

  public async pauseSession(): Promise<FocusSession | null> {
    const session = this.store.getData().activeSession
    if (!session || session.status !== 'active') return null

    this.stopTimer()
    session.status = 'paused'
    session.pausedAt = Date.now()
    session.lastTickTime = Date.now()
    await this.store.setActiveSession(session)
    return session
  }

  public async resumeSession(): Promise<FocusSession | null> {
    const session = this.store.getData().activeSession
    if (!session || session.status !== 'paused') return null

    // Reset lastTickTime to now so paused duration is never subtracted
    session.status = 'active'
    session.lastTickTime = Date.now()
    session.pausedAt = undefined
    await this.store.setActiveSession(session)
    this.startTimer()
    return session
  }

  public async extendSession(extensionMinutes: number): Promise<FocusSession | null> {
    const session = this.store.getData().activeSession
    if (!session) return null

    const additionalSeconds = Math.max(1, Math.round(extensionMinutes)) * 60
    session.remainingSeconds += additionalSeconds
    session.totalDurationSeconds += additionalSeconds
    session.status = 'active'
    session.lastTickTime = Date.now()

    await this.store.setActiveSession(session)
    this.startTimer()
    return session
  }

  public async confirmSession(): Promise<void> {
    const session = this.store.getData().activeSession
    if (!session) return

    this.stopTimer()
    const cycleDate = session.occurrenceId.split(':')[1] || new Date().toISOString().slice(0, 10)

    // Record completion in store
    await this.store.recordCompletion(
      session.occurrenceId,
      session.taskId,
      cycleDate,
      false,
      session.targetTotal,
      session.targetTotal
    )

    // If task has target, mark progress as 100% completed
    if (session.hasTarget && session.targetTotal) {
      await this.store.updateProgress(
        session.occurrenceId,
        session.targetTotal,
        session.targetTotal,
        session.targetUnit || 'صفحات'
      )
    }

    await this.store.setActiveSession(null)
    this.exitWindowFullScreen()

    if (this.onSessionEndedCallback) {
      this.onSessionEndedCallback(true)
    }
  }

  public async abandonSession(): Promise<void> {
    this.stopTimer()
    await this.store.setActiveSession(null)
    this.exitWindowFullScreen()

    if (this.onSessionEndedCallback) {
      this.onSessionEndedCallback(false)
    }
  }

  public async toggleAlwaysOnTop(): Promise<boolean> {
    const session = this.store.getData().activeSession
    if (!session) return false

    session.isAlwaysOnTop = !session.isAlwaysOnTop
    await this.store.updateActiveSession({ isAlwaysOnTop: session.isAlwaysOnTop })

    const win = this.getMainWindow()
    if (win) {
      win.setAlwaysOnTop(session.isAlwaysOnTop, 'normal')
    }
    return session.isAlwaysOnTop
  }

  public async toggleShowSeconds(): Promise<boolean> {
    const session = this.store.getData().activeSession
    if (!session) return true

    session.showSeconds = !session.showSeconds
    await this.store.updateActiveSession({ showSeconds: session.showSeconds })
    return session.showSeconds
  }

  private startTimer(): void {
    this.stopTimer()

    this.timer = setInterval(async () => {
      const session = this.store.getData().activeSession
      if (!session || session.status !== 'active') {
        this.stopTimer()
        return
      }

      const now = Date.now()
      // Real wall-clock elapsed calculation
      const elapsedSeconds = Math.max(0, Math.floor((now - session.lastTickTime) / 1000))

      if (elapsedSeconds > 0) {
        // Detect anomalous clock shift (> 5 min)
        if (elapsedSeconds > 300) {
          console.warn('[SessionManager] Detected system clock shift during session. Normalizing tick.')
          session.lastTickTime = now
          await this.store.updateActiveSession({ lastTickTime: now })
          return
        }

        session.remainingSeconds = Math.max(0, session.remainingSeconds - elapsedSeconds)
        session.lastTickTime = now

        if (session.remainingSeconds === 0) {
          // Timer finished! Does NOT complete task automatically; awaits confirmation!
          this.stopTimer()
          session.status = 'awaiting_confirmation'
          await this.store.setActiveSession(session)

          const win = this.getMainWindow()
          if (win) {
            if (win.isMinimized()) win.restore()
            win.show()
            win.focus()
          }
          return
        }

        // Periodic checkpoint every 5 seconds
        if (session.remainingSeconds % 5 === 0) {
          await this.store.updateActiveSession({
            remainingSeconds: session.remainingSeconds,
            lastTickTime: now
          })
        }
      }
    }, 1000)
  }

  private stopTimer(): void {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  }

  private exitWindowFullScreen(): void {
    const win = this.getMainWindow()
    if (win) {
      win.setAlwaysOnTop(false)
    }
  }
}
