import React, { useEffect, useRef, useState } from 'react'
import { DEFAULT_PRAYER_OPTIONS, PRAYER_NAMES, PrayerLocation } from '@shared/prayer'
import { useApp } from '../context/AppContext'

const labels: Record<string, string> = {
  fajr: 'الفجر', sunrise: 'الشروق', dhuhr: 'الظهر', asr: 'العصر', maghrib: 'المغرب', isha: 'العشاء'
}

export const PrayerPanel: React.FC = () => {
  const { storeData, updateSettings, showToast } = useApp()
  const [times, setTimes] = useState<Record<string, number> | null>(null)
  const [now, setNow] = useState(Date.now())
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [timeZone, setTimeZone] = useState('Africa/Cairo')
  const [countryCode, setCountryCode] = useState('EG')
  const [locationError, setLocationError] = useState('')
  const locating = useRef(false)
  const location = storeData?.settings.prayerLocation
  const options = storeData?.settings.prayerOptions ?? DEFAULT_PRAYER_OPTIONS

  useEffect(() => {
    if (!location) { setTimes(null); return }
    window.wirdApi.getPrayerTimes().then(setTimes).catch(() => setTimes(null))
  }, [location, options, new Date(now).toLocaleDateString('en-CA', { timeZone: location?.timeZone || 'UTC' })])

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60_000)
    return () => window.clearInterval(timer)
  }, [])

  const autoLocate = async (): Promise<void> => {
    if (locating.current) return
    locating.current = true
    setLocationError('')
    try {
      if (!storeData?.settings.automaticLocationConsent) await updateSettings({ automaticLocationConsent: true })
      if (!navigator.geolocation) throw new Error('تحديد الموقع غير متاح على هذا الجهاز')
      const position = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: false, timeout: 15000, maximumAge: 0 }))
      const value: PrayerLocation = {
        name: 'الموقع الحالي', latitude: position.coords.latitude, longitude: position.coords.longitude,
        timeZone: location?.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        updatedAt: Date.now(), accuracyMeters: position.coords.accuracy, source: 'device'
      }
      await updateSettings({ prayerLocation: value })
      showToast('تأكد من صحة المنطقة الزمنية للموقع', 'success')
    } catch {
      setLocationError('تعذر تحديد الموقع أو رُفض الإذن. أدخل الموقع يدويًا؛ آخر موقع محفوظ قديم لكنه ما زال مستخدمًا إن وُجد.')
    } finally { locating.current = false }
  }

  useEffect(() => {
    if (location?.source !== 'device' || !storeData?.settings.automaticLocationConsent || !storeData.settings.locationRefreshHours) return
    const refresh = () => {
      if (Date.now() - location.updatedAt >= storeData.settings.locationRefreshHours * 3_600_000) autoLocate()
    }
    refresh()
    const timer = window.setInterval(refresh, 60_000)
    window.addEventListener('focus', refresh)
    document.addEventListener('visibilitychange', refresh)
    return () => { window.clearInterval(timer); window.removeEventListener('focus', refresh); document.removeEventListener('visibilitychange', refresh) }
  }, [location?.source, location?.updatedAt, storeData?.settings.locationRefreshHours, storeData?.settings.automaticLocationConsent])

  if (!storeData) return null

  const format = (timestamp: number): string => new Intl.DateTimeFormat('ar-EG', {
    timeZone: location?.timeZone, hour: 'numeric', minute: '2-digit'
  }).format(timestamp)
  const next = times && PRAYER_NAMES.filter((name) => name !== 'sunrise').find((name) => times[name] > now)

  const save = async (): Promise<void> => {
    if (!latitude.trim() || !longitude.trim()) {
      showToast('أدخل خط العرض وخط الطول', 'error')
      return
    }
    const value: PrayerLocation = {
      name: name.trim(), latitude: Number(latitude), longitude: Number(longitude),
      timeZone: timeZone.trim(), updatedAt: Date.now(), source: 'manual', countryCode
    }
    try {
      await updateSettings({ prayerLocation: value, automaticLocationConsent: false,
        prayerOptions: countryCode === 'EG' ? { ...options, method: 'Egypt' } : options })
      setEditing(false)
      showToast('تم حفظ الموقع', 'success')
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'تعذر حفظ الموقع', 'error')
    }
  }
  const chooseAudio = async (fajr: boolean): Promise<void> => {
    try {
      const file = await window.wirdApi.pickPrayerAudio(fajr)
      if (file) showToast('تم حفظ ملف الأذان محليًا', 'success')
    } catch (error) { showToast(error instanceof Error ? error.message : 'تعذر قراءة ملف الصوت', 'error') }
  }
  const preview = async (fajr: boolean): Promise<void> => {
    try { await window.wirdApi.previewPrayerAudio(fajr) }
    catch (error) { showToast(error instanceof Error ? error.message : 'تعذر تشغيل الملف', 'error') }
  }

  return <section className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-night-surface p-5" aria-label="مواقيت الصلاة">
    <div className="flex items-center justify-between gap-3">
      <div><h2 className="text-lg font-bold">مواقيت الصلاة</h2><p className="text-sm text-slate-500 dark:text-night-muted">{location?.name || 'حدد موقعك لعرض المواقيت'}</p></div>
      <button className="rounded-lg border px-3 py-1.5 text-sm" onClick={() => {
        setName(location?.name || ''); setLatitude(String(location?.latitude ?? '')); setLongitude(String(location?.longitude ?? ''))
        setTimeZone(location?.timeZone || 'Africa/Cairo'); setCountryCode(location?.countryCode || 'EG'); setEditing(!editing)
      }}>{location ? 'تعديل الموقع' : 'تحديد الموقع'}</button>
      <button className="rounded-lg border px-3 py-1.5 text-sm" onClick={autoLocate}>تحديد تلقائي بإذني</button>
      <button className="rounded-lg border border-amber-500 px-3 py-1.5 text-sm text-amber-700 dark:text-night-gold" onClick={() => window.wirdApi.stopPrayerAudio()}>إيقاف الأذان</button>
    </div>
    {locationError && <p role="alert" className="mt-2 text-sm text-amber-700 dark:text-night-gold">{locationError}</p>}
    {location?.source === 'device' && <div className="mt-2 text-xs text-slate-500 dark:text-night-muted">آخر تحديث: {new Date(location.updatedAt).toLocaleString('ar-EG')} {location.accuracyMeters ? `• دقة تقريبية: ${Math.round(location.accuracyMeters)} متر` : ''} • تحقق من المنطقة الزمنية في تعديل الموقع
      <label className="ms-2">تحديث الموقع <select className="rounded border bg-[var(--wird-surface)]" value={storeData.settings.locationRefreshHours} onChange={e => updateSettings({ locationRefreshHours: Number(e.target.value) as 0 | 2 | 4 })}><option value="4">كل 4 ساعات</option><option value="2">كل ساعتين</option><option value="0">يدوي فقط</option></select></label>
    </div>}
    {editing && <div className="mt-4 grid gap-3 sm:grid-cols-2">
      <label>اسم المدينة<input className="mt-1 w-full rounded-lg border bg-transparent p-2" value={name} onChange={e => setName(e.target.value)} /></label>
      <label>البلد <select className="mt-1 w-full rounded-lg border bg-[var(--wird-surface)] p-2" value={countryCode} onChange={e => setCountryCode(e.target.value)}><option value="EG">مصر (اقتراح الهيئة المصرية)</option><option value="OTHER">بلد آخر</option></select></label>
      <label>المنطقة الزمنية (IANA)<input className="mt-1 w-full rounded-lg border bg-transparent p-2" value={timeZone} onChange={e => setTimeZone(e.target.value)} /></label>
      <label>خط العرض<input type="number" step="any" className="mt-1 w-full rounded-lg border bg-transparent p-2" value={latitude} onChange={e => setLatitude(e.target.value)} /></label>
      <label>خط الطول<input type="number" step="any" className="mt-1 w-full rounded-lg border bg-transparent p-2" value={longitude} onChange={e => setLongitude(e.target.value)} /></label>
      <button className="rounded-lg bg-violet-700 px-4 py-2 text-white dark:bg-night-primary dark:text-night-background" onClick={save}>حفظ الموقع</button>
    </div>}
    {location && <>
      <div className="mt-4 flex flex-wrap gap-3 text-sm">
        <label>طريقة الحساب <select className="rounded-lg border bg-[var(--wird-surface)] p-1" value={options.method} onChange={e => updateSettings({ prayerOptions: { ...options, method: e.target.value as typeof options.method } })}>
          <option value="Egypt">الهيئة المصرية</option><option value="MWL">رابطة العالم الإسلامي</option><option value="ISNA">ISNA</option><option value="Makkah">أم القرى</option><option value="Karachi">كراتشي</option><option value="France">فرنسا</option><option value="Russia">روسيا</option><option value="Singapore">سنغافورة</option>
        </select></label>
        <label>العصر <select className="rounded-lg border bg-[var(--wird-surface)] p-1" value={options.asr} onChange={e => updateSettings({ prayerOptions: { ...options, asr: e.target.value as typeof options.asr } })}>
          <option value="Standard">الجمهور</option><option value="Hanafi">الحنفي</option>
        </select></label>
        <label>خطوط العرض العالية <select className="rounded-lg border bg-[var(--wird-surface)] p-1" value={options.highLats} onChange={e => updateSettings({ prayerOptions: { ...options, highLats: e.target.value as typeof options.highLats } })}>
          <option value="AngleBased">بحسب الزاوية</option><option value="NightMiddle">منتصف الليل</option><option value="OneSeventh">سُبع الليل</option><option value="None">بلا تعديل</option>
        </select></label>
      </div>
      <details className="mt-3 text-sm"><summary className="cursor-pointer">تعديل الدقائق لكل صلاة</summary>
        <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">{PRAYER_NAMES.filter(name => name !== 'sunrise').map(name => <label key={name}>{labels[name]}
          <input type="number" min="-120" max="120" className="mt-1 w-full rounded-lg border bg-transparent p-1" value={options.offsets[name] ?? 0}
            onChange={e => updateSettings({ prayerOptions: { ...options, offsets: { ...options.offsets, [name]: Math.max(-120, Math.min(120, Number(e.target.value) || 0)) } } })} />
        </label>)}</div>
      </details>
      <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6">{PRAYER_NAMES.map(name => <div key={name} className="rounded-xl border p-2 text-center"><div className="text-sm text-slate-500 dark:text-night-muted">{labels[name]}</div><div className="font-semibold">{times ? format(times[name]) : '—'}</div></div>)}</div>
      {next && <p className="mt-3 text-sm text-violet-700 dark:text-night-primary">الصلاة القادمة: {labels[next]}، {format(times![next])} • بقي {Math.max(1, Math.ceil((times![next] - now) / 60_000))} دقيقة</p>}
      {!next && times && <p className="mt-3 text-sm text-slate-500 dark:text-night-muted">انتهت مواقيت اليوم في هذا الموقع</p>}
      <p className="mt-3 text-xs text-slate-500 dark:text-night-muted">المواقيت محسوبة محليًا وقد تختلف عن مسجدك. الشروق معلومة فقط، وليس موعد أذان.</p>
      <details className="mt-4 border-t pt-3 text-sm"><summary className="cursor-pointer font-semibold">إعدادات الأذان</summary>
        <div className="mt-3 space-y-3">
          <div className="flex flex-wrap gap-2"><button className="rounded-lg border px-3 py-1" onClick={() => chooseAudio(false)}>اختيار MP3 أو WAV</button><button className="rounded-lg border px-3 py-1" onClick={() => preview(false)}>معاينة</button><button className="rounded-lg border px-3 py-1" onClick={() => window.wirdApi.stopPrayerAudio()}>إيقاف الأذان</button></div>
          <div className="flex flex-wrap gap-2"><button className="rounded-lg border px-3 py-1" onClick={() => chooseAudio(true)}>ملف اختياري للفجر</button><button className="rounded-lg border px-3 py-1" onClick={() => preview(true)}>معاينة الفجر</button></div>
          <label className="block">مستوى الصوت: {Math.round(storeData.settings.prayerVolume * 100)}% <input type="range" min="0" max="100" value={Math.round(storeData.settings.prayerVolume * 100)} onChange={e => updateSettings({ prayerVolume: Number(e.target.value) / 100 })} /></label>
          <div className="flex flex-wrap gap-3">{PRAYER_NAMES.filter(name => name !== 'sunrise').map(name => <label key={name}><input type="checkbox" checked={storeData.settings.prayerEnabled[name]} onChange={e => updateSettings({ prayerEnabled: { ...storeData.settings.prayerEnabled, [name]: e.target.checked } })} /> أذان {labels[name]}</label>)}</div>
          <label className="block">تنبيه قبل الصلاة بالدقائق <input type="number" min="0" max="60" className="w-20 rounded-lg border bg-transparent p-1" value={storeData.settings.prayerPreAlertMinutes} onChange={e => updateSettings({ prayerPreAlertMinutes: Math.max(0, Math.min(60, Number(e.target.value) || 0)) })} /></label>
          <label className="block"><input type="checkbox" checked={storeData.settings.allowAdhanDuringFocus} onChange={e => updateSettings({ allowAdhanDuringFocus: e.target.checked })} /> السماح بالأذان أثناء جلسة التفرّغ</label>
          <label className="block"><input type="checkbox" checked={storeData.settings.allowAdhanWhileRemindersPaused} onChange={e => updateSettings({ allowAdhanWhileRemindersPaused: e.target.checked })} /> يستمر الأذان عند إيقاف التذكيرات الأخرى مؤقتًا</label>
          <p className="text-xs text-slate-500 dark:text-night-muted">يعمل الصوت ما دام التطبيق والجهاز قيد التشغيل، ويتأثر بكتم Windows ومخرج الصوت. لن يوقظ الجهاز.</p>
        </div>
      </details>
    </>}
  </section>
}
