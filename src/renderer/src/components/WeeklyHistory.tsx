import React, { useMemo } from 'react'
import { formatLocalDate } from '@shared/scheduler'
import { translations } from '@shared/i18n'
import { Language, TaskDefinition } from '@shared/types'
import { useApp } from '../context/AppContext'
import { Award, Calendar, Check, EyeOff, Sparkles } from 'lucide-react'

export const WeeklyHistory: React.FC = () => {
  const { storeData, setActiveTab } = useApp()

  if (!storeData) return null

  const lang = (storeData.settings.language || 'ar') as Language
  const t = translations[lang] || translations.ar

  // Respect user preference to hide weekly history
  if (storeData.settings.hideWeeklyHistory) {
    return (
      <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-4 max-w-md mx-auto my-12 animate-fade-in font-sans">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
          <EyeOff className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            سجل الإنجاز مخفي
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            تم إخفاء عرض السجل الأسبوعي وفق رغبتك ليكون الورد خالصًا دون انشغال بالأرقام.
          </p>
        </div>
        <button
          onClick={() => setActiveTab('settings')}
          className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs text-slate-700 dark:text-slate-300 font-medium transition-colors"
        >
          تعديل الإعدادات
        </button>
      </div>
    )
  }

  // Compute last 7 days
  const historyDays = useMemo(() => {
    const days: Array<{
      dateStr: string
      dayName: string
      formattedDate: string
      isToday: boolean
      tasks: Array<{
        taskId: string
        taskName: string
        completed: boolean
        completedLate: boolean
        completedAt?: number
      }>
    }> = []

    const today = new Date()

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today.getTime())
      d.setDate(d.getDate() - i)
      const dateStr = formatLocalDate(d)
      const isToday = i === 0

      const dayName = t.days[d.getDay()] || ''
      const formattedDate = new Intl.DateTimeFormat(lang === 'ar' ? 'ar-EG' : 'en-US', {
        day: 'numeric',
        month: 'short'
      }).format(d)

      const tasksForDay = storeData.tasks.map((task: TaskDefinition) => {
        const occId = `${task.id}:${dateStr}`
        const record = storeData.completions[occId]
        return {
          taskId: task.id,
          taskName: task.name[lang] || task.name.ar,
          completed: Boolean(record),
          completedLate: Boolean(record?.completedLate),
          completedAt: record?.completedAt
        }
      })

      days.push({
        dateStr,
        dayName,
        formattedDate,
        isToday,
        tasks: tasksForDay
      })
    }

    return days
  }, [storeData, lang, t.days])

  // Aggregate summary
  const summary = useMemo(() => {
    let totalCompleted = 0
    let onTime = 0
    let late = 0

    for (const day of historyDays) {
      for (const task of day.tasks) {
        if (task.completed) {
          totalCompleted++
          if (task.completedLate) {
            late++
          } else {
            onTime++
          }
        }
      }
    }

    return { totalCompleted, onTime, late }
  }, [historyDays])

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-500" />
              <span>{t.history.title}</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {t.history.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
              <span className="text-[10px] text-slate-400 block">{t.history.completedCount}</span>
              <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                {summary.totalCompleted}
              </span>
            </div>
            <div className="px-4 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
              <span className="text-[10px] text-slate-400 block">{t.history.onTime}</span>
              <span className="text-lg font-bold text-teal-600 dark:text-teal-400">
                {summary.onTime}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 7 Days Table / Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-7 gap-3">
        {historyDays.map((day) => {
          const completedDayCount = day.tasks.filter((t) => t.completed).length

          return (
            <div
              key={day.dateStr}
              className={`p-4 rounded-3xl border flex flex-col justify-between transition-all ${
                day.isToday
                  ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/80 shadow-md ring-2 ring-emerald-500/10'
                  : 'bg-white/60 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800/80'
              }`}
            >
              <div>
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                      {day.dayName}
                    </span>
                    <span className="text-[10px] text-slate-400">{day.formattedDate}</span>
                  </div>
                  {day.isToday && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 font-bold">
                      اليوم
                    </span>
                  )}
                </div>

                {/* Tasks badges */}
                <div className="space-y-2">
                  {day.tasks.map((task) => (
                    <div
                      key={task.taskId}
                      className={`p-2 rounded-xl text-[11px] flex items-center justify-between transition-all ${
                        task.completed
                          ? task.completedLate
                            ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900/40'
                            : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/40'
                          : 'bg-slate-50 dark:bg-slate-800/40 text-slate-400 border border-slate-100 dark:border-slate-800'
                      }`}
                      title={
                        task.completed
                          ? `${task.taskName} - ${task.completedLate ? t.status.completedLate : t.status.completed}`
                          : task.taskName
                      }
                    >
                      <span className="truncate max-w-[85px]">{task.taskName}</span>
                      {task.completed ? (
                        <Check className="w-3.5 h-3.5 shrink-0 stroke-[2.5]" />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 font-medium">
                  {completedDayCount} من {day.tasks.length}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
