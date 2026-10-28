import React, { useEffect, useState } from 'react'
import {
  BookMarked,
  BookOpen,
  CalendarDays,
  ChartNoAxesColumn,
  Check,
  Clock3,
  MapPin,
  Moon,
  Play,
  RefreshCw,
  Sun,
  Sunrise,
  Timer
} from 'lucide-react'
import { getTaskOccurrence } from '@shared/scheduler'
import { PRAYER_NAMES, PrayerName } from '@shared/prayer'
import { TaskDefinition } from '@shared/types'
import { useApp } from '../context/AppContext'
import { ProgressModal } from './ProgressModal'
import scene from '../assets/mosque-scene.svg'

const names: Record<PrayerName, string> = {
  fajr: 'الفجر',
  sunrise: 'الشروق',
  dhuhr: 'الظهر',
  asr: 'العصر',
  maghrib: 'المغرب',
  isha: 'العشاء'
}

const icons: Record<PrayerName, React.ElementType> = {
  fajr: Moon,
  sunrise: Sunrise,
  dhuhr: Sun,
  asr: Sun,
  maghrib: Moon,
  isha: Moon
}

interface HomeTaskProps {
  task: TaskDefinition
}

const HomeTask: React.FC<HomeTaskProps> = ({ task }) => {
  const { storeData, startSession, completeTask, undoCompleteTask } = useApp()
  const [progressOpen, setProgressOpen] = useState(false)

  if (!storeData) return null

  const occ = getTaskOccurrence(task, storeData)
  const completed = occ.status === 'completed'
  const progress = storeData.progress[occ.occurrenceId]?.current || 0
  const total = task.target?.total || 10
  const isWird = !!task.target?.enabled
  const isMorning = task.id === 'morning-adhkar'
  const isEvening = task.id === 'evening-adhkar'

  const Icon = isMorning ? Sun : isEvening ? Moon : BookOpen
  const begin = () => startSession(task.id, occ.occurrenceId, task.defaultFocusDurationMinutes || 15)

  // Status text in Arabic
  const statusLabel =
    occ.status === 'due'
      ? 'مستحقة الآن'
      : occ.status === 'upcoming'
      ? 'قادمة'
      : occ.status === 'snoozed'
      ? 'مؤجلة'
      : 'فات وقتها'

  return (
    <article className={`wird-task-card ${isMorning ? 'wird-morning-card' : ''}`}>
      {/* Background illustration for morning adhkar card as requested in visual spec */}
      {isMorning && <img className="wird-task-card-bg" src={scene} alt="" />}

      <div className="wird-task-top">
        <span className="wird-task-icon">
          <Icon size={20} strokeWidth={1.8} />
        </span>
        <h3>{task.name.ar}</h3>
      </div>

      <p className="wird-task-description">
        {task.description?.ar ||
          (isMorning
            ? 'أذكار الصباح لتحصين النفس واستفتاح اليوم'
            : isEvening
            ? 'أذكار المساء للسكينة وختام اليوم بالذكر'
            : 'وردك اليومي من القرآن الكريم تدبرًا وتلاوة')}
      </p>

      {/* Middle status or progress */}
      {isWird ? (
        <div className="wird-progress-area">
          <div className="wird-progress-header">
            <span>تقدّم اليوم</span>
            <strong>
              {progress} من {total} {task.target?.unit || 'صفحات'}
            </strong>
          </div>
          <div className="wird-progress-track">
            <span style={{ width: `${Math.min(100, (progress / total) * 100)}%` }} />
          </div>
        </div>
      ) : (
        <div className="wird-task-status">
          <span className={`wird-badge ${completed ? 'completed' : ''}`}>
            {completed ? (
              <>
                <Check size={14} /> تمّت القراءة
              </>
            ) : (
              statusLabel
            )}
          </span>
          <span className="wird-task-time">
            <Clock3 size={14} />
            <bdi dir="rtl">{task.startTime}</bdi>
          </span>
        </div>
      )}

      {/* Action buttons matching the specification */}
      <div className="wird-task-actions">
        {completed ? (
          <button className="wird-button outline w-full" onClick={() => undoCompleteTask(occ.occurrenceId)}>
            تراجع عن الإنجاز
          </button>
        ) : isWird ? (
          <>
            <button className="wird-button primary flex-1" onClick={begin}>
              <Play size={15} /> هبدأ دلوقتي
            </button>
            <button className="wird-button outline flex-1" onClick={() => setProgressOpen(true)}>
              تسجيل تقدّم
            </button>
          </>
        ) : isEvening ? (
          <>
            <button className="wird-button outline flex-1" onClick={begin}>
              <Play size={15} /> بدء الجلسة
            </button>
            <button
              className="wird-button outline flex-1"
              onClick={() => completeTask(occ.occurrenceId, task.id, occ.cycleDate, occ.status === 'expired')}
            >
              تمّت القراءة
            </button>
          </>
        ) : (
          <>
            <button className="wird-button primary flex-1" onClick={begin}>
              <Play size={15} /> بدء الجلسة
            </button>
            <button
              className="wird-button outline flex-1"
              onClick={() => completeTask(occ.occurrenceId, task.id, occ.cycleDate, occ.status === 'expired')}
            >
              تمّت القراءة
            </button>
          </>
        )}
      </div>

      {progressOpen && (
        <ProgressModal
          task={task}
          occurrenceId={occ.occurrenceId}
          currentProgress={progress}
          targetTotal={total}
          targetUnit={task.target?.unit || 'صفحات'}
          onClose={() => setProgressOpen(false)}
        />
      )}
    </article>
  )
}

export const HomeDashboard: React.FC = () => {
  const { storeData, setActiveTab } = useApp()
  const [times, setTimes] = useState<Record<string, number> | null>(null)
  const [tomorrowTimes, setTomorrowTimes] = useState<Record<string, number> | null>(null)
  const [now, setNow] = useState(Date.now())

  const location = storeData?.settings.prayerLocation
  const options = storeData?.settings.prayerOptions

  useEffect(() => {
    if (!location) {
      setTimes(null)
      return
    }
    setTomorrowTimes(null)
    window.wirdApi.getPrayerTimes().then(setTimes).catch(() => setTimes(null))
  }, [location, options, new Date(now).toLocaleDateString('en-CA', { timeZone: location?.timeZone || 'UTC' })])

  const afterIsha = !!times && now >= times.isha
  useEffect(() => {
    if (!location || !afterIsha) return
    // After Isha, adding twelve hours lands on the next local calendar day.
    window.wirdApi.getPrayerTimes(now + 12 * 60 * 60 * 1000).then(setTomorrowTimes).catch(() => setTomorrowTimes(null))
  }, [location, afterIsha, times?.isha])

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60_000)
    return () => window.clearInterval(timer)
  }, [])

  if (!storeData) return null

  const formatTime = (time: number) =>
    new Intl.DateTimeFormat('ar-EG', {
      timeZone: location?.timeZone,
      hour: 'numeric',
      minute: '2-digit'
    }).format(time)

  const nextToday = times && PRAYER_NAMES.filter((n) => n !== 'sunrise').find((n) => times[n] > now)
  const next = nextToday || (tomorrowTimes?.fajr ? 'fajr' : null)
  const nextTimestamp = nextToday && times ? times[nextToday] : tomorrowTimes?.fajr

  const completed = storeData.tasks.filter((t) => t.enabled && getTaskOccurrence(t, storeData).status === 'completed').length
  const total = storeData.tasks.filter((t) => t.enabled).length
  const percent = total ? completed / total : 0
  const circumference = 2 * Math.PI * 42

  // In RTL, items ordered [morning, evening, wird] will place morning on the right, evening in middle, wird on the left
  const standardTasks = ['morning-adhkar', 'evening-adhkar', 'daily-wird']
    .map((id) => storeData.tasks.find((t) => t.id === id))
    .filter((t): t is TaskDefinition => !!t)

  // User Greeting
  const userName = storeData.settings.userName?.trim()
  const greeting = userName ? `السلام عليكم يا ${userName}` : 'السلام عليكم'

  return (
    <div className="wird-dashboard">
      {/* 5. Header */}
      <div className="wird-page-heading">
        <h1>{greeting}</h1>
        <p>خطوة صغيرة… وذكر يدوم</p>
      </div>

      {/* 6. First Row: Achievement (Right) + Next Prayer (Left) in RTL */}
      <div className="wird-top-grid">
        {/* بطاقة إنجاز اليوم — الأصغر ناحية اليمين */}
        <section className="wird-panel wird-achievement">
          <div className="wird-achievement-top">
            <h2>إنجاز اليوم</h2>
            <button
              className="wird-achievement-action"
              title="عرض السجل"
              aria-label="عرض السجل"
              onClick={() => setActiveTab('history')}
            >
              <ChartNoAxesColumn size={16} />
            </button>
          </div>
          <div className="wird-ring">
            <svg viewBox="0 0 104 104" aria-hidden="true">
              <circle cx="52" cy="52" r="42" className="track" />
              <circle
                cx="52"
                cy="52"
                r="42"
                className="value"
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - percent)}
              />
            </svg>
            <strong>
              <bdi dir="ltr">
                {completed} / {total}
              </bdi>
            </strong>
          </div>
          <p>
            {completed === 0
              ? 'لا توجد مهام مكتملة بعد'
              : completed === 1
              ? 'مهمة واحدة مكتملة'
              : completed === 2
              ? 'مهمتان مكتملتان'
              : `${completed} مهام مكتملة`}
          </p>
        </section>

        {/* بطاقة الصلاة القادمة — الأوسع ناحية اليسار */}
        <section className="wird-panel wird-next-prayer">
          <img className="wird-prayer-art" src={scene} alt="" />
          <div className="wird-next-copy">
            <span className="wird-eyebrow">الصلاة القادمة</span>
            <h2>{next ? `${names[next]}${!nextToday ? ' غدًا' : ''}` : location ? 'جارٍ حساب الموعد' : 'حدّد موقعك'}</h2>
            <div className="wird-next-time">
              <bdi dir="rtl">{nextTimestamp ? formatTime(nextTimestamp) : '—'}</bdi>
            </div>
            <p>
              {nextTimestamp
                ? `متبقي ${Math.max(1, Math.ceil((nextTimestamp - now) / 60_000))} دقيقة`
                : location
                ? 'جارٍ حساب مواقيت الصلاة'
                : 'أدخل موقعك لعرض مواقيت الصلاة'}
            </p>
            <div className="wird-location">
              <MapPin size={15} />
              <span>{location?.name || 'لا يوجد موقع محدد'}</span>
              <button onClick={() => setActiveTab('prayer')}>
                <RefreshCw size={13} /> تحديث الموقع
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* 7. بطاقة مواقيت اليوم */}
      <section className="wird-panel wird-times">
        <div className="wird-section-heading">
          <h2>
            <CalendarDays size={20} /> مواقيت اليوم
          </h2>
          <button onClick={() => setActiveTab('prayer')}>عرض التفاصيل</button>
        </div>
        <div className="wird-times-grid">
          {PRAYER_NAMES.map((name) => {
            const Icon = icons[name]
            const isNext = nextToday === name
            return (
              <div className={`wird-time-item ${isNext ? 'next' : ''}`} key={name}>
                <Icon size={22} strokeWidth={1.8} />
                <span>{names[name]}</span>
                <strong>
                  <bdi dir="rtl">{times ? formatTime(times[name]) : '—'}</bdi>
                </strong>
              </div>
            )
          })}
        </div>
      </section>

      {/* 8. قسم «أذكارك ووردك» */}
      <section className="wird-dhikr">
        <div className="wird-section-heading">
          <h2>
            <BookMarked size={20} /> أذكارك ووردك
          </h2>
          <button onClick={() => setActiveTab('tasks')}>كل المهام</button>
        </div>
        <div className="wird-tasks-grid">
          {standardTasks.map((task) => (
            <HomeTask key={task.id} task={task} />
          ))}
        </div>
      </section>

      {/* 9. بطاقة جلسة التفرّغ */}
      <section className="wird-focus-banner">
        <img src={scene} alt="" />
        <div>
          <div className="wird-focus-icon-wrap">
            <Timer size={24} />
          </div>
          <span>
            <strong>وقتٌ للسكينة</strong>
            <small>تفرّغ لوردك، ودع الباقي ينتظر</small>
          </span>
        </div>
        <button className="wird-button primary" onClick={() => setActiveTab('focus')}>
          <Timer size={16} /> ابدأ جلسة تفرّغ
        </button>
      </section>

      {/* 10. الفوتر */}
      <footer className="wird-footer">
        <span />
        ابتغاء وجه الله، وعونًا على دوام الذكر
        <span />
      </footer>
    </div>
  )
}
