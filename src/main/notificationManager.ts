import { app, Notification } from 'electron'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { translations } from '../shared/i18n'
import { TaskOccurrenceInfo, WirdStoreData } from '../shared/types'
import { APP_ID } from '../shared/constants'

const currentDir = typeof __dirname !== 'undefined' ? __dirname : dirname(fileURLToPath(import.meta.url))

export class NotificationManager {
  private getIconPath(): string {
    return join(currentDir, '../../resources/icon.png')
  }

  private lastNotificationTime = 0
  private lastNotifiedTag = ''

  constructor() {
    if (process.platform === 'win32') {
      app.setAppUserModelId(APP_ID)
    }
  }

  public isSupported(): boolean {
    return Notification.isSupported()
  }

  /**
   * Dispatches a notification for due tasks.
   * Handles single task vs multiple tasks summary, deduplication, and sound toggle.
   */
  public notifyDueTasks(
    dueTasks: TaskOccurrenceInfo[],
    store: WirdStoreData,
    onOpenApp: (taskId?: string) => void,
    onComplete?: (occurrenceId: string) => void,
    onSnooze?: (occurrenceId: string, minutes: number) => void
  ): void {
    if (!this.isSupported() || dueTasks.length === 0) return

    const now = Date.now()
    // Debounce notification calls within 2 seconds
    if (now - this.lastNotificationTime < 2000) return
    this.lastNotificationTime = now

    const lang = store.settings.language || 'ar'
    const t = translations[lang] || translations.ar
    const soundEnabled = store.settings.soundEnabled ?? true

    if (dueTasks.length === 1) {
      const taskInfo = dueTasks[0]
      const taskName = taskInfo.task.name[lang] || taskInfo.task.name.ar
      const title = t.notifications.dueSingleTitle.replace('{taskName}', taskName)
      const body = t.notifications.dueSingleBody.replace('{taskName}', taskName)

      const tag = `due:${taskInfo.occurrenceId}`
      if (this.lastNotifiedTag === tag && now - this.lastNotificationTime < 10000) {
        return
      }
      this.lastNotifiedTag = tag

      const notification = new Notification({
        title,
        body,
        icon: this.getIconPath(),
        silent: !soundEnabled,
        urgency: 'normal'
      })

      notification.on('click', () => {
        onOpenApp(taskInfo.task.id)
      })

      // Native action support when available
      notification.on('action', (_event, index) => {
        if (index === 0 && onComplete) {
          onComplete(taskInfo.occurrenceId)
        } else if (index === 1 && onSnooze) {
          onSnooze(taskInfo.occurrenceId, taskInfo.task.snoozeDurationMinutes || 15)
        }
      })

      notification.show()
    } else {
      // Multiple tasks due: aggregate into one polite summary notification
      const taskNames = dueTasks
        .map((info) => info.task.name[lang] || info.task.name.ar)
        .join('، ')
      const title = t.notifications.dueMultipleTitle
      const body = t.notifications.dueMultipleBody
        .replace('{count}', String(dueTasks.length))
        .replace('{taskNames}', taskNames)

      const tag = `multiple:${dueTasks.map((d) => d.task.id).join(',')}`
      this.lastNotifiedTag = tag

      const notification = new Notification({
        title,
        body,
        icon: this.getIconPath(),
        silent: !soundEnabled,
        urgency: 'normal'
      })

      notification.on('click', () => {
        onOpenApp()
      })

      notification.show()
    }
  }

  /**
   * Sends a test notification to verify Windows system configuration and notifications permissions.
   */
  public sendTestNotification(store: WirdStoreData, onClick?: () => void): boolean {
    if (!this.isSupported()) return false

    const lang = store.settings.language || 'ar'
    const t = translations[lang] || translations.ar

    const notification = new Notification({
      title: t.notifications.testTitle,
      body: t.notifications.testBody,
      icon: this.getIconPath(),
      silent: !store.settings.soundEnabled
    })

    if (onClick) {
      notification.on('click', onClick)
    }

    notification.show()
    return true
  }
}
