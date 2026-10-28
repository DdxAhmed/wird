import React, { useEffect, useState } from 'react'
import { translations } from '@shared/i18n'
import { Language, TaskOccurrenceInfo } from '@shared/types'
import { useApp } from '../context/AppContext'
import { Bell, Check, Clock, Play, X } from 'lucide-react'

export const MiniReminderView: React.FC = () => {
  const { storeData, completeTask, snoozeTask, startSession } = useApp()
  const [tasks, setTasks] = useState<TaskOccurrenceInfo[]>([])

  useEffect(() => {
    // Listen to tasks sent by main process
    if (window.wirdApi?.onMiniReminderTasks) {
      const unsub = window.wirdApi.onMiniReminderTasks((receivedTasks) => {
        setTasks(receivedTasks)
      })
      return () => unsub()
    }
  }, [])

  const lang = (storeData?.settings.language || 'ar') as Language
  const t = translations[lang] || translations.ar

  // Determine current active task to display
  const currentTaskInfo = tasks[0] || null
  const currentTask = currentTaskInfo ? currentTaskInfo.task : storeData?.tasks[0] || null
  const occurrenceId =
    currentTaskInfo?.occurrenceId ||
    `${currentTask?.id}:${new Date().toISOString().slice(0, 10)}`
  const cycleDate =
    currentTaskInfo?.cycleDate || new Date().toISOString().slice(0, 10)

  const handleStartSession = async () => {
    if (!currentTask) return
    const duration = currentTask.defaultFocusDurationMinutes || 15
    await startSession(currentTask.id, occurrenceId, duration)
    window.wirdApi?.closeWindow()
  }

  const handleComplete = async () => {
    if (!currentTask) return
    await completeTask(occurrenceId, currentTask.id, cycleDate, false)
    window.wirdApi?.closeWindow()
  }

  const handleSnooze = async (minutes = 15) => {
    await snoozeTask(occurrenceId, minutes)
    window.wirdApi?.closeWindow()
  }

  const handleClose = () => {
    // Dismiss mini window only. Does NOT mark complete, does NOT remove reminder schedule.
    window.wirdApi?.closeWindow()
  }

  const taskName = currentTask
    ? currentTask.name[lang] || currentTask.name.ar
    : 'تذكير وِرد'

  return (
    <div className="h-screen w-screen p-3 flex flex-col justify-between bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl text-slate-900 dark:text-slate-100 font-sans select-none overflow-hidden">
      {/* Top Bar with Task Title and Close */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-emerald-600/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
            و
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[200px]">
              {taskName}
            </h3>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {t.status.due}
            </span>
          </div>
        </div>

        {/* Close Button: closes window without dropping reminder */}
        <button
          onClick={handleClose}
          title={t.actions.close}
          className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Primary Action Buttons */}
      <div className="grid grid-cols-2 gap-2 my-2">
        {/* Start Focus Session */}
        <button
          onClick={handleStartSession}
          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>{t.actions.startSession}</span>
        </button>

        {/* Mark Done */}
        <button
          onClick={handleComplete}
          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-100 font-semibold text-xs border border-slate-200/60 dark:border-slate-700/60 transition-colors"
        >
          <Check className="w-3.5 h-3.5 text-emerald-500" />
          <span>{t.actions.markDone}</span>
        </button>
      </div>

      {/* Snooze Footer */}
      <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-2 text-[11px]">
        <span className="text-slate-400">تأجيل:</span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleSnooze(5)}
            className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium transition-colors"
          >
            5 د
          </button>
          <button
            onClick={() => handleSnooze(15)}
            className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium transition-colors"
          >
            15 د
          </button>
          <button
            onClick={() => handleSnooze(30)}
            className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium transition-colors"
          >
            30 د
          </button>
        </div>
      </div>
    </div>
  )
}
