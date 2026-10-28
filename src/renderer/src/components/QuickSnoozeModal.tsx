import React, { useState } from 'react'
import { translations } from '@shared/i18n'
import { Language } from '@shared/types'
import { useApp } from '../context/AppContext'
import { AlertTriangle, Clock, X } from 'lucide-react'

interface QuickSnoozeModalProps {
  occurrenceId: string
  defaultMinutes?: number
  windowEndTime?: string
  onClose: () => void
}

export const QuickSnoozeModal: React.FC<QuickSnoozeModalProps> = ({
  occurrenceId,
  defaultMinutes = 15,
  windowEndTime,
  onClose
}) => {
  const { storeData, snoozeTask, showToast } = useApp()
  const [selectedMinutes, setSelectedMinutes] = useState(defaultMinutes)

  const lang = (storeData?.settings.language || 'ar') as Language
  const t = translations[lang] || translations.ar

  // Specific 5, 15, 30 min quick options as requested
  const presetOptions = [5, 15, 30]

  // Check if snooze would exceed window end
  const checkExceedsWindow = (mins: number) => {
    if (!windowEndTime) return false
    const [h, m] = windowEndTime.split(':').map(Number)
    const now = new Date()
    const targetEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0)
    const snoozeEnd = new Date(now.getTime() + mins * 60000)
    return snoozeEnd > targetEnd
  }

  const willExceedWindow = checkExceedsWindow(selectedMinutes)

  const handleSnooze = async () => {
    try {
      await snoozeTask(occurrenceId, selectedMinutes)
      showToast(t.actions.snoozeMinutes.replace('{minutes}', String(selectedMinutes)), 'info')
      onClose()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in font-sans">
      <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              {t.actions.snooze}
            </h4>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          حدد المدة التي ترغب بتأجيل التذكير بعدها:
        </p>

        {/* Quick Options: 5, 15, 30 min */}
        <div className="grid grid-cols-3 gap-2">
          {presetOptions.map((mins) => (
            <button
              key={mins}
              onClick={() => setSelectedMinutes(mins)}
              className={`py-3 px-3 rounded-2xl text-xs font-bold border transition-all ${
                selectedMinutes === mins
                  ? 'border-amber-500 bg-amber-500 text-white shadow-md shadow-amber-500/20'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:border-slate-300'
              }`}
            >
              {mins} دقيقة
            </button>
          ))}
        </div>

        {/* Exceeds window warning */}
        {willExceedWindow && (
          <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              {t.taskCard.snoozePastWindowWarning.replace('{endTime}', windowEndTime || '')}
            </p>
          </div>
        )}

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
          >
            {t.actions.cancel}
          </button>
          <button
            onClick={handleSnooze}
            className="px-5 py-2 rounded-xl text-xs bg-amber-600 hover:bg-amber-500 text-white font-bold shadow-md shadow-amber-600/20"
          >
            {t.actions.confirm}
          </button>
        </div>
      </div>
    </div>
  )
}
