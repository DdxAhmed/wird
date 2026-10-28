import { app, BrowserWindow, Menu, Tray, nativeImage, shell } from 'electron'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { APP_ID, APP_NAME, IPC_CHANNELS } from '../shared/constants'
import { translations } from '../shared/i18n'
import { AutoUpdateManager } from './autoUpdater'
import { setupIpcHandlers } from './ipcHandlers'
import { NotificationManager } from './notificationManager'
import { SchedulerManager } from './schedulerManager'
import { StoreManager } from './store'

const currentDir = typeof __dirname !== 'undefined' ? __dirname : dirname(fileURLToPath(import.meta.url))

// Single instance lock
const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  app.quit()
  process.exit(0)
}

let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null
let isQuitting = false

const store = new StoreManager()
const notifications = new NotificationManager()
let scheduler: SchedulerManager
let autoUpdater: AutoUpdateManager

function getIconPath(): string {
  return join(currentDir, '../../resources/icon.png')
}

function updateTrayMenu(): void {
  if (!tray) return

  const data = store.getData()
  const lang = data.settings.language || 'ar'
  const t = translations[lang] || translations.ar

  const occurrences = scheduler ? scheduler.getAllTaskOccurrences() : []
  const dueTasks = occurrences.filter((o) => o.status === 'due')

  const menuTemplate: Electron.MenuItemConstructorOptions[] = [
    {
      label: t.tray.openApp,
      type: 'normal',
      click: () => {
        showMainWindow()
      }
    },
    { type: 'separator' }
  ]

  // Due tasks summary
  if (dueTasks.length > 0) {
    menuTemplate.push({
      label: `${t.tray.dueTasks} (${dueTasks.length})`,
      enabled: false
    })
    for (const due of dueTasks) {
      const taskName = due.task.name[lang] || due.task.name.ar
      menuTemplate.push({
        label: `  • ${taskName}`,
        click: () => {
          showMainWindow(due.task.id)
        }
      })
    }
    menuTemplate.push({ type: 'separator' })
  } else {
    menuTemplate.push({
      label: t.tray.noDueTasks,
      enabled: false
    })
    menuTemplate.push({ type: 'separator' })
  }

  // Pause / Resume reminders
  const isPaused = data.settings.pausedUntil && data.settings.pausedUntil > Date.now()
  if (isPaused) {
    menuTemplate.push({
      label: t.tray.resumeReminders,
      click: async () => {
        await store.resumeReminders()
        updateTrayMenu()
      }
    })
  } else {
    menuTemplate.push({
      label: t.tray.pauseReminders,
      submenu: [
        {
          label: t.tray.pause30m,
          click: async () => {
            await store.pauseReminders(30)
            updateTrayMenu()
          }
        },
        {
          label: t.tray.pause1h,
          click: async () => {
            await store.pauseReminders(60)
            updateTrayMenu()
          }
        },
        {
          label: t.tray.pause2h,
          click: async () => {
            await store.pauseReminders(120)
            updateTrayMenu()
          }
        },
        {
          label: t.tray.pauseToday,
          click: async () => {
            // Pause until 23:59:59
            const now = new Date()
            const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
            const diffMin = Math.max(10, Math.round((endOfDay.getTime() - now.getTime()) / 60000))
            await store.pauseReminders(diffMin)
            updateTrayMenu()
          }
        }
      ]
    })
  }

  menuTemplate.push(
    { type: 'separator' },
    {
      label: t.tabs.settings,
      click: () => {
        showMainWindow()
        mainWindow?.webContents.send(IPC_CHANNELS.EVENT_TASK_STATUS_CHANGED, { tab: 'settings' })
      }
    },
    {
      label: t.tray.checkUpdates,
      click: () => {
        autoUpdater.checkForUpdates(true).catch(() => {})
      }
    },
    { type: 'separator' },
    {
      label: t.tray.quit,
      click: () => {
        isQuitting = true
        app.quit()
      }
    }
  )

  const contextMenu = Menu.buildFromTemplate(menuTemplate)
  tray.setContextMenu(contextMenu)
  tray.setToolTip(APP_NAME)
}

function createTray(): void {
  try {
    const icon = nativeImage.createFromPath(getIconPath())
    tray = new Tray(icon)
    tray.setToolTip(APP_NAME)

    tray.on('double-click', () => {
      showMainWindow()
    })

    tray.on('click', () => {
      showMainWindow()
    })

    updateTrayMenu()
  } catch (err) {
    console.error('Failed to create system tray:', err)
  }
}

function showMainWindow(focusTaskId?: string): void {
  if (!mainWindow) {
    createWindow()
    return
  }

  if (mainWindow.isMinimized()) {
    mainWindow.restore()
  }
  mainWindow.show()
  mainWindow.focus()

  if (focusTaskId) {
    mainWindow.webContents.send(IPC_CHANNELS.EVENT_TASK_STATUS_CHANGED, { focusTaskId })
  }
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 980,
    height: 720,
    minWidth: 800,
    minHeight: 600,
    show: false,
    frame: true,
    title: APP_NAME,
    icon: getIconPath(),
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(currentDir, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true
    }
  })

  // Prevent navigation to unknown websites inside renderer
  mainWindow.webContents.setWindowOpenHandler((details) => {
    try {
      const url = new URL(details.url)
      if (url.protocol === 'http:' || url.protocol === 'https:') {
        shell.openExternal(details.url)
      }
    } catch {}
    return { action: 'deny' }
  })

  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (url !== mainWindow?.webContents.getURL()) {
      event.preventDefault()
      try {
        const parsed = new URL(url)
        if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
          shell.openExternal(url)
        }
      } catch {}
    }
  })

  // Handle close: minimize to tray unless app is quitting
  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault()
      mainWindow?.hide()
    }
  })

  // Load URL
  if (process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    mainWindow.loadFile(join(currentDir, '../renderer/index.html'))
  }

  mainWindow.once('ready-to-show', () => {
    const data = store.getData()
    const shouldStartHidden =
      process.argv.includes('--minimized') ||
      process.argv.includes('--hidden') ||
      (data.settings.hasCompletedOnboarding && data.settings.startMinimizedToTray && !process.env.ELECTRON_RENDERER_URL)

    if (!shouldStartHidden) {
      mainWindow?.show()
      mainWindow?.focus()
    }
  })
}

// App lifecycle
app.whenReady().then(async () => {
  if (process.platform === 'win32') {
    app.setAppUserModelId(APP_ID)
  }

  await store.initialize()

  autoUpdater = new AutoUpdateManager(store)
  scheduler = new SchedulerManager(store, notifications, (taskId) => {
    showMainWindow(taskId)
  })

  setupIpcHandlers(store, scheduler, notifications, autoUpdater, () => mainWindow)

  createWindow()
  createTray()

  scheduler.start()
  autoUpdater.startPeriodicCheck()

  // Sync store changes to renderer & update tray
  store.onChange((data) => {
    updateTrayMenu()
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send(IPC_CHANNELS.EVENT_STORE_CHANGED, data)
    }
  })

  // Sync updater status to renderer
  autoUpdater.onStatusChange((status) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send(IPC_CHANNELS.EVENT_UPDATE_STATUS_CHANGED, status)
    }
  })
})

app.on('second-instance', () => {
  showMainWindow()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  } else {
    showMainWindow()
  }
})

app.on('before-quit', () => {
  isQuitting = true
  if (scheduler) {
    scheduler.stop()
  }
  if (autoUpdater) {
    autoUpdater.stopPeriodicCheck()
  }
})
