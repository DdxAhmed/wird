import React, { useState } from 'react'
import { translations } from '@shared/i18n'
import { Language, TaskDefinition } from '@shared/types'
import { useApp } from '../context/AppContext'
import { Check, Plus, Trash2, X } from 'lucide-react'

interface CustomTaskModalProps {
  taskToEdit?: TaskDefinition | null
  onClose: () => void
}

export const CustomTaskModal: React.FC<CustomTaskModalProps> = ({ taskToEdit, onClose }) => {
  const { storeData, addTask, updateTask, deleteTask } = useApp()

  const lang = (storeData?.settings.language || 'ar') as Language
  const t = translations[lang] || translations.ar

  const [nameAr, setNameAr] = useState(taskToEdit?.name.ar || '')
  const [nameEn, setNameEn] = useState(taskToEdit?.name.en || '')
  const [startTime, setStartTime] = useState(taskToEdit?.startTime || '08:00')
  const [endTime, setEndTime] = useState(taskToEdit?.endTime || '12:00')
  const [repeatIntervalMinutes, setRepeatIntervalMinutes] = useState(
    taskToEdit?.repeatIntervalMinutes || 15
  )
  const [defaultFocusDurationMinutes, setDefaultFocusDurationMinutes] = useState(
    taskToEdit?.defaultFocusDurationMinutes || 15
  )
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>(
    taskToEdit?.daysOfWeek || [0, 1, 2, 3, 4, 5, 6]
  )

  // Target
  const [hasTarget, setHasTarget] = useState(Boolean(taskToEdit?.target?.enabled))
  const [targetTotal, setTargetTotal] = useState(taskToEdit?.target?.total || 10)
  const [targetUnit, setTargetUnit] = useState(taskToEdit?.target?.unit || 'صفحات')

  const toggleDay = (dayIndex: number) => {
    if (daysOfWeek.includes(dayIndex)) {
      if (daysOfWeek.length > 1) {
        setDaysOfWeek(daysOfWeek.filter((d) => d !== dayIndex))
      }
    } else {
      setDaysOfWeek([...daysOfWeek, dayIndex].sort())
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nameAr.trim()) return

    const taskData: Omit<TaskDefinition, 'id' | 'isDefault'> = {
      name: {
        ar: nameAr.trim(),
        en: nameEn.trim() || nameAr.trim()
      },
      enabled: true,
      daysOfWeek,
      startTime,
      endTime,
      repeatIntervalMinutes: Number(repeatIntervalMinutes) || 15,
      defaultFocusDurationMinutes: Number(defaultFocusDurationMinutes) || 15,
      snoozeDurationMinutes: 15,
      target: hasTarget
        ? {
            enabled: true,
            total: Number(targetTotal) || 10,
            unit: targetUnit.trim() || 'صفحات'
          }
        : undefined
    }

    if (taskToEdit) {
      await updateTask(taskToEdit.id, taskData)
    } else {
      await addTask(taskData)
    }

    onClose()
  }

  const handleDelete = async () => {
    if (!taskToEdit || taskToEdit.isDefault) return
    const confirm = window.confirm('هل أنت متأكد من حذف هذه المهمة؟')
    if (confirm) {
      await deleteTask(taskToEdit.id)
      onClose()
    }
  }

  const daysLabels = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in font-sans">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            {taskToEdit ? 'تعديل المهمة' : 'إنشاء مهمة جديدة'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          {/* Task Name */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-800 dark:text-slate-200">
              اسم المهمة (بالعربية) *
            </label>
            <input
              type="text"
              required
              value={nameAr}
              onChange={(e) => setNameAr(e.target.value)}
              placeholder="مثال: قيام الليل، صلاة الضحى، سورة الكهف..."
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-sans"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-800 dark:text-slate-200">
              الاسم بالإنجليزية (اختياري)
            </label>
            <input
              type="text"
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              placeholder="e.g. Duha Prayer"
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-sans"
            />
          </div>

          {/* Window Times */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-800 dark:text-slate-200">
                بداية فترة التذكير
              </label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-sans"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-800 dark:text-slate-200">
                نهاية فترة التذكير
              </label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-sans"
              />
            </div>
          </div>

          {/* Repeat Interval & Focus Duration */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-800 dark:text-slate-200">
                فاصل إعادة التذكير (دقائق)
              </label>
              <input
                type="number"
                min="5"
                max="120"
                value={repeatIntervalMinutes}
                onChange={(e) => setRepeatIntervalMinutes(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-sans"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-800 dark:text-slate-200">
                مدة جلسة التفرّغ الافتراضية
              </label>
              <input
                type="number"
                min="1"
                max="180"
                value={defaultFocusDurationMinutes}
                onChange={(e) => setDefaultFocusDurationMinutes(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-sans"
              />
            </div>
          </div>

          {/* Days of week */}
          <div className="space-y-2">
            <label className="font-semibold text-slate-800 dark:text-slate-200">
              أيام التكرار
            </label>
            <div className="flex flex-wrap gap-1.5">
              {daysLabels.map((label, idx) => {
                const isSelected = daysOfWeek.includes(idx)
                return (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => toggleDay(idx)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                      isSelected
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Optional Numeric Goal / Target */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-800 dark:text-slate-200">
                تفعيل هدف عددي (صفحات، ركعات، تكرار...)
              </label>
              <input
                type="checkbox"
                checked={hasTarget}
                onChange={(e) => setHasTarget(e.target.checked)}
                className="rounded accent-emerald-600 w-4 h-4 cursor-pointer"
              />
            </div>

            {hasTarget && (
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="space-y-1">
                  <span className="text-[11px] text-slate-500">العدد المطلوب:</span>
                  <input
                    type="number"
                    min="1"
                    max="10000"
                    value={targetTotal}
                    onChange={(e) => setTargetTotal(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-sans"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[11px] text-slate-500">الوحدة:</span>
                  <input
                    type="text"
                    value={targetUnit}
                    onChange={(e) => setTargetUnit(e.target.value)}
                    placeholder="صفحات، تسبيحة، ركعات..."
                    className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-sans"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            {taskToEdit && !taskToEdit.isDefault ? (
              <button
                type="button"
                onClick={handleDelete}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>حذف المهمة</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium transition-colors"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-md shadow-emerald-600/20"
              >
                {taskToEdit ? 'حفظ التعديلات' : 'إنشاء المهمة'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
