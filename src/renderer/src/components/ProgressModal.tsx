import React, { useState } from 'react'
import { translations } from '@shared/i18n'
import { Language, TaskDefinition } from '@shared/types'
import { useApp } from '../context/AppContext'
import { Check, Plus, Minus, X } from 'lucide-react'

interface ProgressModalProps {
  task: TaskDefinition
  occurrenceId: string
  currentProgress: number
  targetTotal: number
  targetUnit: string
  onClose: () => void
}

export const ProgressModal: React.FC<ProgressModalProps> = ({
  task,
  occurrenceId,
  currentProgress,
  targetTotal,
  targetUnit,
  onClose
}) => {
  const { storeData, updateProgress, completeTask } = useApp()
  const [val, setVal] = useState(currentProgress)

  const lang = (storeData?.settings.language || 'ar') as Language
  const t = translations[lang] || translations.ar

  const taskName = task.name[lang] || task.name.ar
  const cycleDate = occurrenceId.split(':')[1] || new Date().toISOString().slice(0, 10)

  const handleSave = async () => {
    const finalVal = Math.max(0, val)
    await updateProgress(occurrenceId, finalVal, targetTotal, targetUnit)

    // If goal reached or exceeded, prompt user to confirm completion if not already completed
    if (finalVal >= targetTotal) {
      const confirmComplete = window.confirm(
        `ما شاء الله، بلغت الهدف المطلوب (${targetTotal} ${targetUnit})! هل ترغب في تأكيد إتمام الورد لليوم؟`
      )
      if (confirmComplete) {
        await completeTask(occurrenceId, task.id, cycleDate, false)
      }
    }

    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in font-sans">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              تسجيل التقدم
            </h3>
            <p className="text-xs text-slate-400">{taskName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Counter controls */}
        <div className="flex flex-col items-center justify-center gap-4 py-2">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setVal(Math.max(0, val - 1))}
              className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-800 dark:text-slate-200 transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>

            <div className="text-center">
              <span className="text-4xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                {val}
              </span>
              <span className="text-sm text-slate-400 font-mono ml-1">
                / {targetTotal}
              </span>
              <p className="text-xs text-slate-500 mt-1">{targetUnit}</p>
            </div>

            <button
              onClick={() => setVal(val + 1)}
              className="w-10 h-10 rounded-2xl bg-emerald-600 hover:bg-emerald-500 flex items-center justify-center text-white transition-colors shadow-md shadow-emerald-600/20"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Quick presets */}
          <div className="flex items-center gap-2 pt-2">
            {[1, 5, 10].map((inc) => (
              <button
                key={inc}
                onClick={() => setVal(val + inc)}
                className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors"
              >
                +{inc}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium transition-colors"
          >
            إلغاء
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20"
          >
            حفظ التقدم
          </button>
        </div>
      </div>
    </div>
  )
}
