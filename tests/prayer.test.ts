import { describe, expect, it } from 'vitest'
import { calculatePrayerTimes, DEFAULT_PRAYER_OPTIONS, localDateParts, PrayerLocation } from '../src/shared/prayer'

const cairo: PrayerLocation = {
  name: 'القاهرة', latitude: 30.0444, longitude: 31.2357,
  timeZone: 'Africa/Cairo', updatedAt: 0, source: 'manual'
}

describe('local prayer calculation', () => {
  it('uses the location date across UTC midnight and daylight saving transitions', () => {
    expect(localDateParts(new Date('2026-07-01T22:30:00Z'), 'Africa/Cairo')).toEqual([2026, 7, 2])
    const times = calculatePrayerTimes(cairo, DEFAULT_PRAYER_OPTIONS, new Date('2026-07-01T22:30:00Z'))
    expect(times.fajr).toBeLessThan(times.sunrise)
    expect(times.sunrise).toBeLessThan(times.dhuhr)
    expect(times.dhuhr).toBeLessThan(times.asr)
    expect(times.asr).toBeLessThan(times.maghrib)
    expect(times.maghrib).toBeLessThan(times.isha)
  })

  it('applies minute offsets and the Hanafi Asr option', () => {
    const now = new Date('2026-10-28T10:00:00Z')
    const baseline = calculatePrayerTimes(cairo, DEFAULT_PRAYER_OPTIONS, now)
    const adjusted = calculatePrayerTimes(cairo, {
      ...DEFAULT_PRAYER_OPTIONS, asr: 'Hanafi', offsets: { fajr: 5 }
    }, now)
    expect(adjusted.fajr - baseline.fajr).toBe(5 * 60_000)
    expect(adjusted.asr).toBeGreaterThan(baseline.asr)
  })

  it('rejects invalid location coordinates and time zones', () => {
    expect(() => calculatePrayerTimes({ ...cairo, latitude: 99 }, DEFAULT_PRAYER_OPTIONS)).toThrow()
    expect(() => calculatePrayerTimes({ ...cairo, timeZone: 'Not/A_Zone' }, DEFAULT_PRAYER_OPTIONS)).toThrow()
  })
})
