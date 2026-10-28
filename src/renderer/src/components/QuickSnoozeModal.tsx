import React, { useState } from 'react'
import { translations } from '@shared/i18n'
import { Language } from '@shared/types'
import { useApp } from '../context/AppContext'
import { Clock, X } from 'lucide-react'

interface QuickSnoozeModalProps {
  occurrenceId: string
  defaultMinutes?: number
  onClose: () => void
}

export const QuickSnoozeModal: React.FC<QuickSnoozeModalProps> = ({
  occurrenceId,
  defaultMinutes = 15,
  onClose
}) => {
  const { storeData, snoozeTask, showToast } = useApp()
  const [selectedMinutes, setSelectedMinutes] = useState(defaultMinutes)

  const lang = (storeData?.settings.language || 'ar') as Language
  const t = translations[lang] || translations.ar

  const presetOptions = [10, 15, 20, 30, 45, 60]

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
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

        <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 mb-4">
          حدد المدة التي ترغب بتأجيل التذكير بعدها:
        </p>

        {/* Options */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          {presetOptions.map((mins) => (
            <button
              key={mins}
              onClick={() => setSelectedMinutes(mins)}
              className={`py-2.5 px-3 rounded-2xl text-xs font-medium border transition-all ${
                selectedMinutes === mins
                  ? 'border-amber-500 bg-amber-500 text-white font-bold shadow-md shadow-amber-500/20'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:border-slate-300'
              }`}
            >
              {mins} دقيقة
            </button>
          ))}
        </div>

        <div className="flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
          >
            {t.actions.cancel}
          </button>
          <button
            onClick={handleSnooze}
            className="px-5 py-2 rounded-xl text-xs bg-amber-600 hover:bg-amber-500 text-white font-medium shadow-md shadow-amber-600/20"
          >
            {t.actions.confirm}
          </button>
        </div>
      </div>
    </div>
  )
}
