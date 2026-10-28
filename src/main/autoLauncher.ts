import { app } from 'electron'

export class AutoLauncher {
  public static isSupported(): boolean {
    return process.platform === 'win32' || process.platform === 'darwin'
  }

  public static isEnabled(): boolean {
    try {
      if (!this.isSupported()) return false
      const settings = app.getLoginItemSettings()
      return settings.openAtLogin
    } catch (err) {
      console.error('Failed to get login item settings:', err)
      return false
    }
  }

  public static setEnabled(enable: boolean): boolean {
    try {
      if (!this.isSupported()) return false

      app.setLoginItemSettings({
        openAtLogin: enable,
        openAsHidden: true,
        name: 'Wird',
        args: ['--minimized', '--hidden']
      })
      return true
    } catch (err) {
      console.error('Failed to set login item settings:', err)
      return false
    }
  }
}
