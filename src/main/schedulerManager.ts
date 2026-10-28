import { powerMonitor } from 'electron'
import { getDueTasksForNotification, getTaskOccurrence } from '../shared/scheduler'
import { TaskOccurrenceInfo } from '../shared/types'
import { MiniReminderManager } from './miniReminderManager'
import { NotificationManager } from './notificationManager'
import { StoreManager } from './store'

export class SchedulerManager {
  private store: StoreManager
  private notifications: NotificationManager
  private miniReminderManager?: MiniReminderManager
  private timer: NodeJS.Timeout | null = null
  private onOpenAppCallback?: (taskId?: string) => void
  private lastEvaluationTime: number = Date.now()

  constructor(
    store: StoreManager,
    notifications: NotificationManager,
    onOpenApp: (taskId?: string) => void,
    miniReminderManager?: MiniReminderManager
  ) {
    this.store = store
    this.notifications = notifications
    this.onOpenAppCallback = onOpenApp
    this.miniReminderManager = miniReminderManager

    this.registerPowerMonitor()
  }

  private registerPowerMonitor(): void {
    powerMonitor.on('resume', () => {
      console.log('[Scheduler] System resumed from sleep/hibernate. Re-evaluating schedule...')
      // Wait 3 seconds for network/system clock sync
      setTimeout(() => {
        this.evaluateSchedule(true)
      }, 3000)
    })

    powerMonitor.on('unlock-screen', () => {
      console.log('[Scheduler] Screen unlocked. Re-evaluating schedule...')
      this.evaluateSchedule(false)
    })
  }

  public start(): void {
    this.stop()
    // Initial evaluation
    this.evaluateSchedule(false)

    // Tick every 30 seconds to evaluate schedule against wall clock
    this.timer = setInterval(() => {
      const now = Date.now()
      // Detect system clock jumps (e.g. clock adjusted backwards or forwards by > 2 minutes)
      const elapsed = Math.abs(now - this.lastEvaluationTime)
      if (elapsed > 120000) {
        console.log('[Scheduler] Detected clock jump or sleep without resume event. Refreshing...')
      }
      this.lastEvaluationTime = now
      this.evaluateSchedule(false)
    }, 30000)
  }

  public stop(): void {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  }

  /**
   * Evaluates all tasks and dispatches reminders when due.
   * isWakeup indicates whether this evaluation occurred immediately after waking from sleep.
   */
  public async evaluateSchedule(isWakeup = false): Promise<TaskOccurrenceInfo[]> {
    const data = this.store.getData()

    // Central coordination: If in active or paused focus session, suppress reminders
    if (data.activeSession && (data.activeSession.status === 'active' || data.activeSession.status === 'paused')) {
      return this.getAllTaskOccurrences()
    }

    // 1. Get due tasks that should trigger notification
    const dueTasks = getDueTasksForNotification(data)

    if (dueTasks.length > 0) {
      // Dispatch Windows notification
      this.notifications.notifyDueTasks(
        dueTasks,
        data,
        (taskId) => {
          if (this.onOpenAppCallback) {
            this.onOpenAppCallback(taskId)
          }
        },
        async (occurrenceId) => {
          const taskInfo = dueTasks.find((d) => d.occurrenceId === occurrenceId)
          if (taskInfo) {
            await this.store.recordCompletion(occurrenceId, taskInfo.task.id, taskInfo.cycleDate, false)
          }
        },
        async (occurrenceId, minutes) => {
          await this.store.snoozeTask(occurrenceId, minutes)
        }
      )

      // Show mini reminder window if enabled in settings
      if (this.miniReminderManager) {
        this.miniReminderManager.showDueReminder(dueTasks)
      }

      // Record last notified timestamps so we don't repeat until repeat interval elapses
      for (const due of dueTasks) {
        await this.store.recordNotification(due.occurrenceId)
      }
    }

    return this.getAllTaskOccurrences()
  }

  public getAllTaskOccurrences(): TaskOccurrenceInfo[] {
    const data = this.store.getData()
    return data.tasks.map((task) => getTaskOccurrence(task, data))
  }
}
