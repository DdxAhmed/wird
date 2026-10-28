import { app, BrowserWindow, dialog } from 'electron'
import { randomUUID } from 'crypto'
import { promises as fs } from 'fs'
import { extname, join, resolve, sep } from 'path'
import { pathToFileURL } from 'url'
import { StoreManager } from './store'

const MAX_BYTES = 20 * 1024 * 1024

export class AdhanAudioManager {
  private window: BrowserWindow | null = null
  private playing = false

  constructor(private store: StoreManager, private onPlaybackChanged: () => void = () => {}) {}

  public isPlaying(): boolean { return this.playing }

  private async player(): Promise<BrowserWindow> {
    if (this.window && !this.window.isDestroyed()) return this.window
    const win = new BrowserWindow({
      show: false,
      webPreferences: { backgroundThrottling: false, nodeIntegration: false, contextIsolation: true, webSecurity: true }
    })
    this.window = win
    await win.loadFile(join(__dirname, '../../resources/audio-player.html'))
    win.on('page-title-updated', (_event, title) => {
      if (title === 'audio-ended') { this.playing = false; this.onPlaybackChanged() }
    })
    win.on('closed', () => { if (this.window === win) this.window = null; this.playing = false; this.onPlaybackChanged() })
    return win
  }

  private async decode(file: string): Promise<void> {
    const win = await this.player()
    const url = pathToFileURL(file).href
    const result = await win.webContents.executeJavaScript(`new Promise(resolve => {
      const audio = new Audio(${JSON.stringify(url)});
      const timer = setTimeout(() => resolve('timeout'), 8000);
      audio.oncanplay = () => { clearTimeout(timer); audio.src = ''; resolve('ok') };
      audio.onerror = () => { clearTimeout(timer); resolve('invalid') };
      audio.load();
    })`)
    if (result !== 'ok') throw new Error('تعذر فك ملف الصوت أو تشغيله')
  }

  public async pick(fajr: boolean): Promise<string | null> {
    const result = await dialog.showOpenDialog({
      title: fajr ? 'اختر أذان الفجر' : 'اختر ملف الأذان', properties: ['openFile'],
      filters: [{ name: 'صوت MP3 أو WAV', extensions: ['mp3', 'wav'] }]
    })
    if (result.canceled || !result.filePaths[0]) return null
    const source = result.filePaths[0]
    const extension = extname(source).toLowerCase()
    if (!['.mp3', '.wav'].includes(extension)) throw new Error('الملف يجب أن يكون MP3 أو WAV')
    const stat = await fs.stat(source)
    if (!stat.isFile() || stat.size < 128 || stat.size > MAX_BYTES) throw new Error('حجم الملف غير صالح (الحد الأقصى 20 MB)')
    const handle = await fs.open(source, 'r')
    const header = Buffer.alloc(12)
    try { await handle.read(header, 0, header.length, 0) } finally { await handle.close() }
    const valid = extension === '.wav'
      ? header.toString('ascii', 0, 4) === 'RIFF' && header.toString('ascii', 8, 12) === 'WAVE'
      : header.toString('ascii', 0, 3) === 'ID3' || (header[0] === 0xff && (header[1] & 0xe0) === 0xe0)
    if (!valid) throw new Error('الملف لا يبدو كصوت MP3 أو WAV صالح')
    const dir = join(app.getPath('userData'), 'adhan')
    await fs.mkdir(dir, { recursive: true })
    const target = join(dir, `${randomUUID()}${extension}`)
    await fs.copyFile(source, target)
    try { await this.decode(target) } catch (error) { await fs.unlink(target).catch(() => {}); throw error }
    await this.store.updateSettings(fajr ? { fajrAudioFile: target } : { prayerAudioFile: target })
    return target
  }

  public async play(file: string, volume: number): Promise<void> {
    const audioDirectory = resolve(app.getPath('userData'), 'adhan') + sep
    if (!resolve(file).startsWith(audioDirectory)) throw new Error('ملف الأذان خارج مجلد التطبيق')
    await this.stop()
    await this.decode(file)
    const win = await this.player()
    const url = pathToFileURL(file).href
    await win.webContents.executeJavaScript(`(() => {
      const audio = document.getElementById('adhan');
      audio.src = ${JSON.stringify(url)};
      audio.volume = ${Math.max(0, Math.min(1, volume))};
      audio.onended = () => { audio.src = ''; document.title = 'audio-ended' };
      document.title = 'audio-playing';
      return audio.play();
    })()`)
    this.playing = true
    this.onPlaybackChanged()
  }

  public async stop(): Promise<void> {
    this.playing = false
    this.onPlaybackChanged()
    if (this.window && !this.window.isDestroyed()) {
      await this.window.webContents.executeJavaScript(`(() => { const audio = document.getElementById('adhan'); audio.pause(); audio.currentTime = 0; audio.src = ''; })()`).catch(() => {})
    }
  }

  public close(): void { this.window?.destroy(); this.window = null; this.playing = false }
}
