import { Notification, powerMonitor } from 'electron'
import { calculatePrayerTimes, localDateParts, PRAYER_NAMES, PrayerName } from '../shared/prayer'
import { AdhanAudioManager } from './adhanAudioManager'
import { StoreManager } from './store'

const LABELS: Record<PrayerName, string> = {
  fajr: 'الفجر', sunrise: 'الشروق', dhuhr: 'الظهر', asr: 'العصر', maghrib: 'المغرب', isha: 'العشاء'
}
const LATE_TOLERANCE_MS = 90_000

export class PrayerScheduler {
  private timer: NodeJS.Timeout | null = null
  private busy = false
  private pendingAfterFocus = new Set<PrayerName>()

  constructor(private store: StoreManager, private audio: AdhanAudioManager) {
    powerMonitor.on('resume', () => { setTimeout(() => this.tick(), 3000) })
    powerMonitor.on('unlock-screen', () => { this.tick() })
  }

  public start(): void {
    this.tick()
    this.timer = setInterval(() => this.tick(), 15_000)
  }

  public stop(): void { if (this.timer) clearInterval(this.timer); this.timer = null }

  private notify(title: string, body: string): void {
    if (Notification.isSupported()) new Notification({ title, body, silent: true }).show()
  }

  public async tick(now = Date.now()): Promise<void> {
    if (this.busy) return
    this.busy = true
    try {
      const data = this.store.getData()
      const location = data.settings.prayerLocation
      if (!location) return
      const [year, month, day] = localDateParts(new Date(now), location.timeZone)
      const dateId = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const times = calculatePrayerTimes(location, data.settings.prayerOptions, new Date(now))
      const focus = data.activeSession && ['active', 'paused'].includes(data.activeSession.status)
      const remindersPaused = !!data.settings.pausedUntil && data.settings.pausedUntil > now
      const missed: string[] = []
      for (const name of PRAYER_NAMES) {
        if (name === 'sunrise') continue
        const at = times[name]
        const eventId = `${dateId}:${name}:adhan`
        const preId = `${dateId}:${name}:pre`
        const pre = data.settings.prayerPreAlertMinutes
        if (pre > 0 && now >= at - pre * 60_000 && now < at && !data.prayerEvents[preId]) {
          await this.store.recordPrayerEvent(preId)
          if (!focus) this.notify(`اقترب وقت ${LABELS[name]}`, `باقي ${pre} دقيقة تقريبًا`)
        }
        if (now < at || data.prayerEvents[eventId]) continue
        // Persist before any external side effect, including playback.
        await this.store.recordPrayerEvent(eventId)
        if (now - at > LATE_TOLERANCE_MS) continue
        if ((focus && !data.settings.allowAdhanDuringFocus) ||
            (remindersPaused && !data.settings.allowAdhanWhileRemindersPaused)) {
          this.pendingAfterFocus.add(name)
          continue
        }
        if (!data.settings.prayerEnabled[name]) continue
        const file = name === 'fajr' && data.settings.fajrAudioFile || data.settings.prayerAudioFile
        this.notify(`حان وقت صلاة ${LABELS[name]}`, file ? 'يبدأ الأذان الآن' : 'دخل وقت الصلاة')
        if (file) {
          try { await this.audio.play(file, data.settings.prayerVolume) }
          catch (error) { console.error('[PrayerScheduler] Audio playback failed:', error); missed.push(LABELS[name]) }
        }
      }
      if (!focus && !remindersPaused && this.pendingAfterFocus.size) {
        this.notify('دخل وقت الصلاة أثناء جلسة التفرّغ', [...this.pendingAfterFocus].map(n => LABELS[n]).join('، '))
        this.pendingAfterFocus.clear()
      }
      if (missed.length) this.notify('تعذر تشغيل الأذان', missed.join('، '))
    } catch (error) {
      console.error('[PrayerScheduler] Could not evaluate prayer times:', error)
    } finally { this.busy = false }
  }
}
