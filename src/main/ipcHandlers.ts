import { app, BrowserWindow, ipcMain, shell } from 'electron'
import { IPC_CHANNELS } from '../shared/constants'
import { AppSettings, TaskDefinition } from '../shared/types'
import { AutoLauncher } from './autoLauncher'
import { AutoUpdateManager } from './autoUpdater'
import { NotificationManager } from './notificationManager'
import { SchedulerManager } from './schedulerManager'
import { StoreManager } from './store'

export function setupIpcHandlers(
  store: StoreManager,
  scheduler: SchedulerManager,
  notifications: NotificationManager,
  updater: AutoUpdateManager,
  getMainWindow: () => BrowserWindow | null
): void {
  // Store & Settings
  ipcMain.handle(IPC_CHANNELS.GET_STORE_DATA, async () => {
    return store.getData()
  })

  ipcMain.handle(IPC_CHANNELS.UPDATE_SETTINGS, async (_event, partialSettings: Partial<AppSettings>) => {
    if (!partialSettings || typeof partialSettings !== 'object') {
      throw new Error('Invalid settings object')
    }
    const updated = await store.updateSettings(partialSettings)
    if (partialSettings.autoStartOnBoot !== undefined) {
      AutoLauncher.setEnabled(partialSettings.autoStartOnBoot)
    }
    return updated
  })

  ipcMain.handle(
    IPC_CHANNELS.UPDATE_TASK,
    async (_event, taskId: string, partialTask: Partial<TaskDefinition>) => {
      if (!taskId || typeof taskId !== 'string' || !partialTask || typeof partialTask !== 'object') {
        throw new Error('Invalid task update payload')
      }
      return store.updateTask(taskId, partialTask)
    }
  )

  ipcMain.handle(IPC_CHANNELS.RESET_TASKS, async () => {
    return store.resetTasksToDefault()
  })

  // Task actions
  ipcMain.handle(
    IPC_CHANNELS.COMPLETE_TASK,
    async (_event, occurrenceId: string, taskId: string, cycleDate: string, completedLate: boolean) => {
      if (!occurrenceId || !taskId || !cycleDate) {
        throw new Error('Missing completion parameters')
      }
      return store.recordCompletion(occurrenceId, taskId, cycleDate, Boolean(completedLate))
    }
  )

  ipcMain.handle(IPC_CHANNELS.UNDO_COMPLETE_TASK, async (_event, occurrenceId: string) => {
    if (!occurrenceId) throw new Error('Missing occurrenceId')
    return store.undoCompletion(occurrenceId)
  })

  ipcMain.handle(IPC_CHANNELS.SNOOZE_TASK, async (_event, occurrenceId: string, minutes: number) => {
    if (!occurrenceId || typeof minutes !== 'number') {
      throw new Error('Invalid snooze parameters')
    }
    return store.snoozeTask(occurrenceId, minutes)
  })

  ipcMain.handle(IPC_CHANNELS.PAUSE_REMINDERS, async (_event, durationMinutes: number) => {
    if (typeof durationMinutes !== 'number') throw new Error('Invalid duration')
    return store.pauseReminders(durationMinutes)
  })

  ipcMain.handle(IPC_CHANNELS.RESUME_REMINDERS, async () => {
    return store.resumeReminders()
  })

  // Backup & Restore
  ipcMain.handle(IPC_CHANNELS.EXPORT_DATA, async () => {
    return store.exportJson()
  })

  ipcMain.handle(IPC_CHANNELS.VALIDATE_IMPORT_DATA, async (_event, jsonString: string) => {
    if (typeof jsonString !== 'string') return { valid: false, error: 'Input must be a string' }
    return store.validateImport(jsonString)
  })

  ipcMain.handle(IPC_CHANNELS.IMPORT_DATA, async (_event, jsonString: string) => {
    if (typeof jsonString !== 'string') throw new Error('Input must be a string')
    return store.importJson(jsonString)
  })

  // System & Window
  ipcMain.handle(IPC_CHANNELS.GET_SYSTEM_STATUS, async () => {
    return {
      isAutoStartEnabled: AutoLauncher.isEnabled(),
      appVersion: process.env.npm_package_version || '1.0.0',
      platform: process.platform,
      isPackaged: !process.defaultApp
    }
  })

  ipcMain.handle(IPC_CHANNELS.SET_AUTO_START, async (_event, enable: boolean) => {
    const success = AutoLauncher.setEnabled(Boolean(enable))
    if (success) {
      await store.updateSettings({ autoStartOnBoot: Boolean(enable) })
    }
    return success
  })

  ipcMain.handle(IPC_CHANNELS.TEST_NOTIFICATION, async () => {
    return notifications.sendTestNotification(store.getData(), () => {
      const win = getMainWindow()
      if (win) {
        if (win.isMinimized()) win.restore()
        win.show()
        win.focus()
      }
    })
  })

  ipcMain.handle(IPC_CHANNELS.MINIMIZE_WINDOW, () => {
    const win = getMainWindow()
    if (win) win.minimize()
  })

  ipcMain.handle(IPC_CHANNELS.CLOSE_WINDOW, () => {
    const win = getMainWindow()
    if (win) win.close()
  })

  ipcMain.handle(IPC_CHANNELS.QUIT_APP, () => {
    const win = getMainWindow()
    if (win) {
      // Force close without hiding to tray
      win.destroy()
    }
    app.quit()
  })

  ipcMain.handle(IPC_CHANNELS.OPEN_EXTERNAL_URL, async (_event, url: string) => {
    if (typeof url !== 'string') return
    try {
      const parsed = new URL(url)
      // Allow only http and https
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
        await shell.openExternal(url)
      }
    } catch {
      // Invalid URL ignored
    }
  })

  // Auto Updater
  ipcMain.handle(IPC_CHANNELS.CHECK_FOR_UPDATES, async () => {
    return updater.checkForUpdates(true)
  })

  ipcMain.handle(IPC_CHANNELS.DOWNLOAD_UPDATE, async () => {
    return updater.downloadUpdate()
  })

  ipcMain.handle(IPC_CHANNELS.INSTALL_UPDATE, async () => {
    return updater.quitAndInstall()
  })

  ipcMain.handle(IPC_CHANNELS.GET_UPDATE_STATUS, async () => {
    return updater.getStatus()
  })
}
