import { describe, expect, it, vi } from 'vitest'
import { calculatePrayerTimes, DEFAULT_PRAYER_OPTIONS, PrayerLocation } from '../src/shared/prayer'
import { DEFAULT_SETTINGS } from '../src/shared/constants'
import { PrayerScheduler } from '../src/main/prayerScheduler'
import type { StoreManager } from '../src/main/store'
import type { AdhanAudioManager } from '../src/main/adhanAudioManager'

const shown = vi.fn()
vi.mock('electron', () => ({
  powerMonitor: { on: vi.fn() },
  Notification: class {
    static isSupported() { return true }
    show() { shown() }
  }
}))

const cairo: PrayerLocation = {
  name: 'القاهرة', latitude: 30.0444, longitude: 31.2357,
  timeZone: 'Africa/Cairo', updatedAt: 0, source: 'manual'
}

function fixture(allowAdhanDuringFocus = true) {
  const data = {
    settings: { ...DEFAULT_SETTINGS, prayerLocation: cairo, prayerAudioFile: 'copied.mp3', allowAdhanDuringFocus },
    prayerEvents: {} as Record<string, number>, activeSession: null as null | { status: string }
  }
  const recordPrayerEvent = vi.fn(async (id: string) => { data.prayerEvents[id] = Date.now() })
  const play = vi.fn(async () => {})
  const scheduler = new PrayerScheduler(
    { getData: () => data, recordPrayerEvent } as unknown as StoreManager,
    { play } as unknown as AdhanAudioManager
  )
  return { data, recordPrayerEvent, play, scheduler }
}

describe('prayer event delivery', () => {
  const day = new Date('2026-10-28T00:00:00Z')
  const fajr = calculatePrayerTimes(cairo, DEFAULT_PRAYER_OPTIONS, day).fajr

  it('plays only once after a small delay, even after a schedule reevaluation', async () => {
    const { scheduler, play, recordPrayerEvent } = fixture()
    await scheduler.tick(fajr + 30_000)
    await scheduler.tick(fajr + 45_000)
    expect(play).toHaveBeenCalledTimes(1)
    expect(recordPrayerEvent).toHaveBeenCalledTimes(1)
  })

  it('does not play an old adhan after waking late', async () => {
    const { scheduler, play } = fixture()
    await scheduler.tick(fajr + 10 * 60_000)
    expect(play).not.toHaveBeenCalled()
  })

  it('summarizes a suppressed prayer after focus ends', async () => {
    shown.mockClear()
    const { data, scheduler, play } = fixture(false)
    data.activeSession = { status: 'active' }
    await scheduler.tick(fajr + 30_000)
    expect(play).not.toHaveBeenCalled()
    data.activeSession = null
    await scheduler.tick(fajr + 45_000)
    expect(shown).toHaveBeenCalledTimes(1)
  })
})
