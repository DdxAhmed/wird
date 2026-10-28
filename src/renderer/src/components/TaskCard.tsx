import React, { useState } from 'react'
import { translations } from '@shared/i18n'
import { getTaskOccurrence } from '@shared/scheduler'
import { Language, TaskDefinition } from '@shared/types'
import { useApp } from '../context/AppContext'
import { QuickSnoozeModal } from './QuickSnoozeModal'
import {
  Bell,
  BookOpen,
  Calendar,
  Check,
  CheckCircle,
  Clock,
  Moon,
  RotateCcw,
  Sun,
  Volume2,
  VolumeX,
  Zap
} from 'lucide-react'

interface TaskCardProps {
  task: TaskDefinition
  isHighlighted?: boolean
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, isHighlighted }) => {
  const { storeData, completeTask, undoCompleteTask, showToast } = useApp()
  const [showSnoozeModal, setShowSnoozeModal] = useState(false)

  if (!storeData) return null

  const lang = (storeData.settings.language || 'ar') as Language
  const t = translations[lang] || translations.ar

  const occurrence = getTaskOccurrence(task, storeData)
  const taskName = task.name[lang] || task.name.ar
  const taskDesc = task.description ? task.description[lang] || task.description.ar : ''

  // Icon based on task ID
  const TaskIcon = () => {
    if (task.id === 'morning-adhkar') {
      return <Sun className="w-5 h-5 text-amber-500" />
    }
    if (task.id === 'evening-adhkar') {
      return <Moon className="w-5 h-5 text-indigo-400" />
    }
    return <BookOpen className="w-5 h-5 text-emerald-500" />
  }

  // Format timestamp to localized time
  const formatTime = (ts: number | null) => {
    if (!ts) return ''
    return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-EG' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(new Date(ts))
  }

  const handleMarkDone = async (isLate = false) => {
    try {
      await completeTask(occurrence.occurrenceId, task.id, occurrence.cycleDate, isLate)
      showToast(t.status.completed, 'success')
    } catch (err) {
      console.error(err)
      showToast('حدث خطأ أثناء حفظ الإنجاز', 'error')
    }
  }

  const handleUndo = async () => {
    try {
      await undoCompleteTask(occurrence.occurrenceId)
      showToast(t.actions.undo, 'info')
    } catch (err) {
      console.error(err)
    }
  }

  // Status badge styling and text
  const getStatusBadge = () => {
    switch (occurrence.status) {
      case 'completed':
        return {
          text: occurrence.completionRecord?.completedLate ? t.status.completedLate : t.status.completed,
          classes: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
          dot: 'bg-emerald-500'
        }
      case 'due':
        return {
          text: t.status.due,
          classes: 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border-rose-300 dark:border-rose-800 animate-pulse',
          dot: 'bg-rose-500 animate-ping'
        }
      case 'snoozed':
        return {
          text: t.status.snoozed,
          classes: 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300 dark:border-amber-800',
          dot: 'bg-amber-500'
        }
      case 'expired':
        return {
          text: t.status.expired,
          classes: 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-300 dark:border-slate-700',
          dot: 'bg-slate-400'
        }
      case 'upcoming':
      default:
        return {
          text: t.status.upcoming,
          classes: 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border-blue-300 dark:border-blue-800',
          dot: 'bg-blue-500'
        }
    }
  }

  const badge = getStatusBadge()

  return (
    <>
      <div
        className={`relative overflow-hidden rounded-3xl border transition-all duration-300 p-6 ${
          occurrence.status === 'due'
            ? 'bg-gradient-to-b from-white to-rose-50/30 dark:from-slate-900 dark:to-rose-950/20 border-rose-300 dark:border-rose-800/60 shadow-xl shadow-rose-500/5 ring-2 ring-rose-500/20'
            : occurrence.status === 'completed'
            ? 'bg-white/80 dark:bg-slate-900/80 border-emerald-200 dark:border-emerald-900/50 shadow-sm'
            : 'bg-white/60 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800/80 shadow-sm'
        } ${isHighlighted ? 'ring-4 ring-emerald-500 animate-subtle-pulse' : ''}`}
      >
        {/* Top row: Icon, Name & Status badge */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 shadow-sm">
              <TaskIcon />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {taskName}
                {occurrence.isOvernight && (
                  <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                    عابر لمنتصف الليل
                  </span>
                )}
              </h3>
              {taskDesc && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{taskDesc}</p>
              )}
            </div>
          </div>

          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${badge.classes}`}
          >
            <span className={`w-2 h-2 rounded-full ${badge.dot}`} />
            <span>{badge.text}</span>
          </div>
        </div>

        {/* Middle row: Timing details */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/60 text-xs text-slate-600 dark:text-slate-300">
          <div>
            <span className="text-slate-400 dark:text-slate-500 block mb-0.5">
              {t.taskCard.windowPeriod}
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono" dir="ltr">
              {task.startTime} - {task.endTime}
            </span>
          </div>

          <div>
            <span className="text-slate-400 dark:text-slate-500 block mb-0.5">
              {t.taskCard.repeatEvery}
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {task.repeatIntervalMinutes} دقيقة
            </span>
          </div>

          <div>
            {occurrence.status === 'completed' ? (
              <>
                <span className="text-slate-400 dark:text-slate-500 block mb-0.5">
                  {t.taskCard.completedAt}
                </span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {formatTime(occurrence.completionRecord?.completedAt || null)}
                </span>
              </>
            ) : occurrence.status === 'snoozed' ? (
              <>
                <span className="text-slate-400 dark:text-slate-500 block mb-0.5">
                  {t.taskCard.snoozedUntil}
                </span>
                <span className="font-semibold text-amber-600 dark:text-amber-400">
                  {formatTime(occurrence.snoozedUntil || null)}
                </span>
              </>
            ) : occurrence.status === 'due' ? (
              <>
                <span className="text-slate-400 dark:text-slate-500 block mb-0.5">
                  {t.taskCard.nextReminder}
                </span>
                <span className="font-semibold text-rose-600 dark:text-rose-400">
                  مستحقة الآن
                </span>
              </>
            ) : occurrence.status === 'expired' ? (
              <>
                <span className="text-slate-400 dark:text-slate-500 block mb-0.5">
                  {t.status.expired}
                </span>
                <span className="font-semibold text-slate-500">
                  {t.taskCard.windowEnded}
                </span>
              </>
            ) : (
              <>
                <span className="text-slate-400 dark:text-slate-500 block mb-0.5">
                  {t.taskCard.nextReminder}
                </span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {formatTime(occurrence.nextReminderTime)}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Bottom row: Interactive Actions */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          {occurrence.status === 'completed' ? (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium text-xs">
                <CheckCircle className="w-4 h-4" />
                <span>تقبل الله طاعتكم</span>
              </div>
              <button
                onClick={handleUndo}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title={t.actions.undo}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t.actions.undo}</span>
              </button>
            </div>
          ) : occurrence.status === 'due' ? (
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => handleMarkDone(false)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium text-xs shadow-lg shadow-emerald-600/25 active:scale-95 transition-all"
              >
                <Check className="w-4 h-4" />
                <span>{t.actions.markDone}</span>
              </button>

              <button
                onClick={() => setShowSnoozeModal(true)}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 font-medium text-xs transition-colors"
              >
                <Clock className="w-4 h-4" />
                <span>{t.actions.snooze}</span>
              </button>
            </div>
          ) : occurrence.status === 'snoozed' ? (
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                مؤجلة حتى {formatTime(occurrence.snoozedUntil || null)}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowSnoozeModal(true)}
                  className="px-3 py-1.5 rounded-xl text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors"
                >
                  تعديل التأجيل
                </button>
                <button
                  onClick={() => handleMarkDone(false)}
                  className="px-4 py-1.5 rounded-xl text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-colors"
                >
                  تمت القراءة الآن
                </button>
              </div>
            </div>
          ) : occurrence.status === 'expired' ? (
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-slate-400 dark:text-slate-500">
                {t.status.expired}
              </span>
              <button
                onClick={() => handleMarkDone(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium text-xs transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{t.actions.markDoneLate}</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-slate-400 dark:text-slate-500">
                تبدأ في الساعة {task.startTime}
              </span>
              <button
                onClick={() => handleMarkDone(false)}
                className="text-xs text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 underline transition-colors"
              >
                قرأتها مسبقًا؟ اضغط هنا للتأكيد
              </button>
            </div>
          )}
        </div>
      </div>

      {showSnoozeModal && (
        <QuickSnoozeModal
          occurrenceId={occurrence.occurrenceId}
          defaultMinutes={task.snoozeDurationMinutes}
          onClose={() => setShowSnoozeModal(false)}
        />
      )}
    </>
  )
}
