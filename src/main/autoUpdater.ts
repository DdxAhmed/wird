import { app } from 'electron'
import { autoUpdater, UpdateInfo as ElectronUpdateInfo } from 'electron-updater'
import { UpdateInfo, UpdateProgress, UpdateStatus } from '../shared/types'
import { StoreManager } from './store'

export class AutoUpdateManager {
  private store: StoreManager
  private status: UpdateStatus = { state: 'idle' }
  private statusListeners: Array<(status: UpdateStatus) => void> = []
  private isChecking = false
  private periodicInterval: NodeJS.Timeout | null = null
  private fallbackFull = false

  constructor(store: StoreManager, private canInstall: () => boolean = () => true) {
    this.store = store
    this.configureUpdater()
  }

  private configureUpdater(): void {
    autoUpdater.autoDownload = false // Controlled download
    // Installation must remain an explicit action; quitting during a focus session
    // must never silently start an installer.
    autoUpdater.autoInstallOnAppQuit = false
    autoUpdater.allowPrerelease = this.store.getData().settings.updateChannel === 'beta'

    // Logger
    autoUpdater.logger = {
      info: (message: string) => console.info('[Updater]', message),
      warn: (message: string) => console.warn('[Updater]', message),
      error: (message: string) => {
        if (message.startsWith('Cannot download differentially, fallback to full download:')) {
          this.fallbackFull = true
          console.warn('[Updater] Differential download unavailable; using verified full installer')
          if (this.status.state === 'downloading') this.setStatus({ ...this.status, fallbackFull: true })
        } else console.error('[Updater]', message)
      },
      debug: (message: string) => console.debug('[Updater]', message)
    }

    autoUpdater.on('checking-for-update', () => {
      this.setStatus({ state: 'checking' })
    })

    autoUpdater.on('update-available', (info: ElectronUpdateInfo) => {
      this.isChecking = false
      const updateInfo: UpdateInfo = {
        version: info.version,
        releaseDate: info.releaseDate,
        releaseNotes: typeof info.releaseNotes === 'string' ? info.releaseNotes : undefined,
        prerelease: Boolean(info.version.includes('beta') || info.version.includes('alpha'))
      }
      this.setStatus({ state: 'available', info: updateInfo })

      // Checking is automatic, but downloading waits for the user's action.
      // This also allows postponing a potentially large full-download fallback.
    })

    autoUpdater.on('update-not-available', () => {
      this.isChecking = false
      this.setStatus({ state: 'not-available', checkedAt: Date.now() })
      this.store.updateSettings({ lastUpdateCheck: Date.now() }).catch(() => {})
    })

    autoUpdater.on('download-progress', (progressObj) => {
      if (this.status.state === 'downloading' || this.status.state === 'available') {
        const progress: UpdateProgress = {
          bytesPerSecond: progressObj.bytesPerSecond,
          percent: Math.round(progressObj.percent),
          transferred: progressObj.transferred,
          total: progressObj.total
        }
        const info = (this.status as { info: UpdateInfo }).info
        this.setStatus({
          state: 'downloading',
          progress,
          info,
          fallbackFull: this.fallbackFull
        })
      }
    })

    autoUpdater.on('update-downloaded', (info: ElectronUpdateInfo) => {
      const updateInfo: UpdateInfo = {
        version: info.version,
        releaseDate: info.releaseDate,
        releaseNotes: typeof info.releaseNotes === 'string' ? info.releaseNotes : undefined
      }
      this.setStatus({ state: 'downloaded', info: updateInfo, fallbackFull: this.fallbackFull })
    })

    autoUpdater.on('error', (err) => {
      this.isChecking = false
      const message = err == null ? 'Unknown update error' : (err.message || String(err)).toString()
      console.error('AutoUpdater error:', message)
      this.setStatus({ state: 'error', message })
    })
  }

  public getStatus(): UpdateStatus {
    return this.status
  }

  public async checkForUpdates(isManual = false): Promise<UpdateStatus> {
    if (this.isChecking) return this.status
    this.isChecking = true

    if (!app.isPackaged) {
      console.log('[AutoUpdater] In development mode. Simulating or skipping real check.')
      this.setStatus({ state: 'checking' })
      await new Promise((res) => setTimeout(res, 1200))

      if (isManual) {
        // Return not-available for local dev test unless configured
        this.isChecking = false
        this.setStatus({ state: 'not-available', checkedAt: Date.now() })
        return this.status
      }

      this.isChecking = false
      this.setStatus({ state: 'idle' })
      return this.status
    }

    try {
      autoUpdater.allowPrerelease = this.store.getData().settings.updateChannel === 'beta'
      await autoUpdater.checkForUpdates()
    } catch (err: unknown) {
      this.isChecking = false
      const msg = err instanceof Error ? err.message : String(err)
      this.setStatus({ state: 'error', message: msg })
    }

    return this.status
  }

  public async downloadUpdate(): Promise<void> {
    if (this.status.state !== 'available') return
    this.fallbackFull = false

    try {
      const info = this.status.info
      this.setStatus({
        state: 'downloading',
        progress: { bytesPerSecond: 0, percent: 0, transferred: 0, total: 0 },
        info
      })

      if (!app.isPackaged) {
        // Simulate download in dev mode for UI testing
        let percent = 0
        const interval = setInterval(() => {
          percent += 25
          if (percent >= 100) {
            clearInterval(interval)
            this.setStatus({ state: 'downloaded', info })
          } else {
            this.setStatus({
              state: 'downloading',
              progress: { bytesPerSecond: 500000, percent, transferred: percent * 100000, total: 10000000 },
              info
            })
          }
        }, 500)
        return
      }

      await autoUpdater.downloadUpdate()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      this.setStatus({ state: 'error', message: msg })
    }
  }

  public async quitAndInstall(): Promise<void> {
    if (this.status.state !== 'downloaded') return
    if (!this.canInstall()) throw new Error('أوقف الأذان قبل تثبيت التحديث')

    const session = this.store.getData().activeSession
    if (session && (session.status === 'active' || session.status === 'paused')) {
      throw new Error('أنهِ جلسة التفرّغ أو أوقفها قبل تثبيت التحديث')
    }

    // Save state before quitting
    console.log('[AutoUpdater] Restarting application to install update...')
    if (!app.isPackaged) {
      this.setStatus({ state: 'idle' })
      return
    }

    autoUpdater.quitAndInstall(false, true)
  }

  public startPeriodicCheck(): void {
    // Check after 15 seconds on launch
    setTimeout(() => {
      if (this.store.getData().settings.autoCheckUpdates) {
        this.checkForUpdates(false).catch(() => {})
      }
    }, 15000)

    // Check every 4 hours
    const FOUR_HOURS = 4 * 60 * 60 * 1000
    this.periodicInterval = setInterval(() => {
      if (this.store.getData().settings.autoCheckUpdates) {
        this.checkForUpdates(false).catch(() => {})
      }
    }, FOUR_HOURS)
  }

  public stopPeriodicCheck(): void {
    if (this.periodicInterval) {
      clearInterval(this.periodicInterval)
      this.periodicInterval = null
    }
  }

  public onStatusChange(listener: (status: UpdateStatus) => void): () => void {
    this.statusListeners.push(listener)
    return () => {
      this.statusListeners = this.statusListeners.filter((l) => l !== listener)
    }
  }

  private setStatus(status: UpdateStatus): void {
    this.status = status
    for (const listener of this.statusListeners) {
      try {
        listener(status)
      } catch (err) {
        console.error('Error in update status listener:', err)
      }
    }
  }
}

