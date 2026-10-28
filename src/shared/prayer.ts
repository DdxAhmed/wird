import { PrayTime } from './vendor/praytime.cjs'

export const PRAYER_NAMES = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'] as const
export type PrayerName = typeof PRAYER_NAMES[number]

export interface PrayerLocation {
  name: string
  latitude: number
  longitude: number
  timeZone: string
  updatedAt: number
  accuracyMeters?: number
  source: 'manual' | 'device'
  countryCode?: string
}

export interface PrayerOptions {
  method: 'Egypt' | 'MWL' | 'ISNA' | 'Makkah' | 'Karachi' | 'France' | 'Russia' | 'Singapore'
  asr: 'Standard' | 'Hanafi'
  highLats: 'AngleBased' | 'NightMiddle' | 'OneSeventh' | 'None'
  offsets: Partial<Record<PrayerName, number>>
}

export const DEFAULT_PRAYER_OPTIONS: PrayerOptions = {
  method: 'Egypt',
  asr: 'Standard',
  highLats: 'AngleBased',
  offsets: {}
}

export function validatePrayerLocation(location: PrayerLocation): void {
  if (!location || !Number.isFinite(location.latitude) || Math.abs(location.latitude) > 90 ||
      !Number.isFinite(location.longitude) || Math.abs(location.longitude) > 180 ||
      !location.name?.trim() || !location.timeZone?.trim()) {
    throw new Error('أدخل اسم الموقع وإحداثيات صحيحة ومنطقة زمنية')
  }
  try {
    new Intl.DateTimeFormat('en', { timeZone: location.timeZone })
  } catch {
    throw new Error('المنطقة الزمنية غير صالحة')
  }
}

export function localDateParts(now: Date, timeZone: string): [number, number, number] {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone, year: 'numeric', month: 'numeric', day: 'numeric'
  }).formatToParts(now)
  const numberFor = (type: string): number => Number(parts.find((p) => p.type === type)?.value)
  return [numberFor('year'), numberFor('month'), numberFor('day')]
}

export function calculatePrayerTimes(
  location: PrayerLocation,
  options: PrayerOptions,
  now = new Date()
): Record<PrayerName, number> {
  validatePrayerLocation(location)
  const calculator = new PrayTime(options.method)
    .location([location.latitude, location.longitude])
    .timezone(location.timeZone)
    .adjust({ asr: options.asr, highLats: options.highLats })
    .tune(options.offsets)
    .format('x')
  const raw = calculator.times(localDateParts(now, location.timeZone))
  const result = {} as Record<PrayerName, number>
  for (const name of PRAYER_NAMES) {
    const value = raw[name]
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      throw new Error(`تعذر حساب وقت ${name} لهذا الموقع`)
    }
    result[name] = value
  }
  return result
}
