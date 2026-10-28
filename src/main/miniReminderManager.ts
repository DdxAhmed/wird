import { BrowserWindow, screen } from 'electron'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { MiniReminderPosition, TaskOccurrenceInfo } from '../shared/types'
import { StoreManager } from './store'

const currentDir = typeof __dirname !== 'undefined' ? __dirname : dirname(fileURLToPath(import.meta.url))

export class MiniReminderManager {
  private window: BrowserWindow | null = null
  private store: StoreManager
  private onStartSession: (taskId: string, occurrenceId: string, durationMinutes: number) => void
  private onOpenMain: (taskId?: string) => void
  private pendingTasks: TaskOccurrenceInfo[] = []

  constructor(
    store: StoreManager,
    onStartSession: (taskId: string, occurrenceId: string, durationMinutes: number) => void,
    onOpenMain: (taskId?: string) => void
  ) {
    this.store = store
    this.onStartSession = onStartSession
    this.onOpenMain = onOpenMain

    // Reposition window if external monitor disconnected
    screen.on('display-removed', () => {
      if (this.window && !this.window.isDestroyed()) {
        this.repositionWindow()
      }
    })
  }

  private getWindowPosition(
    width: number,
    height: number,
    prefPosition: MiniReminderPosition
  ): { x: number; y: number } {
    // Locate the monitor where the cursor currently resides
    const cursor = screen.getCursorScreenPoint()
    const display = screen.getDisplayNearestPoint(cursor) || screen.getPrimaryDisplay()
    const workArea = display.workArea

    const margin = 20
    let x: number
    let y: number

    switch (prefPosition) {
      case 'bottom-left':
        x = workArea.x + margin
        y = workArea.y + workArea.height - height - margin
        break
      case 'top-left':
        x = workArea.x + margin
        y = workArea.y + margin
        break
      case 'top-right':
        x = workArea.x + workArea.width - width - margin
        y = workArea.y + margin
        break
      case 'bottom-right':
      default:
        x = workArea.x + workArea.width - width - margin
        y = workArea.y + workArea.height - height - margin
        break
    }

    return { x: Math.round(x), y: Math.round(y) }
  }

  public repositionWindow(): void {
    if (!this.window || this.window.isDestroyed()) return

    const [width, height] = this.window.getSize()
    const posSetting = this.store.getData().settings.miniReminderPosition || 'bottom-right'
    const { x, y } = this.getWindowPosition(width, height, posSetting)
    this.window.setPosition(x, y)
  }

  public showDueReminder(dueTasks: TaskOccurrenceInfo[]): void {
    const data = this.store.getData()

    // 1. Honor settings: disabled
    if (!data.settings.miniReminderEnabled) {
      return
    }

    // 2. Central coordination priority: Never disrupt an active or paused focus session
    if (data.activeSession && (data.activeSession.status === 'active' || data.activeSession.status === 'paused')) {
      return
    }

    // 3. Central coordination: User pause
    if (data.settings.pausedUntil && data.settings.pausedUntil > Date.now()) {
      return
    }

    if (dueTasks.length === 0) return

    this.pendingTasks = dueTasks
    this.createOrUpdateWindow()
  }

  private createOrUpdateWindow(): void {
    const width = 360
    const height = this.pendingTasks.length > 1 ? 260 : 210
    const posSetting = this.store.getData().settings.miniReminderPosition || 'bottom-right'
    const { x, y } = this.getWindowPosition(width, height, posSetting)

    if (this.window && !this.window.isDestroyed()) {
      this.window.setSize(width, height)
      this.window.setPosition(x, y)
      this.sendTasksToWindow()
      this.window.showInactive()
      return
    }

    const iconPath = join(currentDir, '../../resources/icon.png')

    this.window = new BrowserWindow({
      width,
      height,
      x,
      y,
      frame: false,
      resizable: false,
      alwaysOnTop: true,
      skipTaskbar: true,
      show: false,
      transparent: true,
      hasShadow: true,
      icon: iconPath,
      webPreferences: {
        preload: join(currentDir, '../preload/index.js'),
        sandbox: false,
        contextIsolation: true,
        nodeIntegration: false,
        webSecurity: true
      }
    })

    // Load mini reminder view via hash
    if (process.env.ELECTRON_RENDERER_URL) {
      this.window.loadURL(`${process.env.ELECTRON_RENDERER_URL}#mini-reminder`)
    } else {
      this.window.loadFile(join(currentDir, '../renderer/index.html'), { hash: 'mini-reminder' })
    }

    this.window.once('ready-to-show', () => {
      this.sendTasksToWindow()
      // Show without stealing keyboard/typing focus
      this.window?.showInactive()
    })

    this.window.on('closed', () => {
      this.window = null
    })
  }

  private sendTasksToWindow(): void {
    if (this.window && !this.window.isDestroyed()) {
      this.window.webContents.send('mini-reminder:tasks', this.pendingTasks)
    }
  }

  public testReminder(): void {
    const data = this.store.getData()
    const task = data.tasks[0] || {
      id: 'test-task',
      name: { ar: 'أذكار الصباح (تجربة)', en: 'Morning Adhkar (Test)' },
      startTime: '05:30',
      endTime: '11:00',
      repeatIntervalMinutes: 15,
      defaultFocusDurationMinutes: 15,
      enabled: true,
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6]
    }

    const testOccurrence: TaskOccurrenceInfo = {
      task,
      cycleDate: new Date().toISOString().slice(0, 10),
      occurrenceId: `${task.id}:${new Date().toISOString().slice(0, 10)}`,
      status: 'due',
      windowStart: Date.now(),
      windowEnd: Date.now() + 3600000,
      isOvernight: false,
      nextReminderTime: Date.now()
    }

    this.pendingTasks = [testOccurrence]
    this.createOrUpdateWindow()
  }

  public close(): void {
    if (this.window && !this.window.isDestroyed()) {
      this.window.close()
      this.window = null
    }
  }

  public getPendingTasks(): TaskOccurrenceInfo[] {
    return this.pendingTasks
  }
}
