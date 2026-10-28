import React, { useRef, useState } from 'react'
import { translations } from '@shared/i18n'
import {
  Language,
  MiniReminderPosition,
  TaskDefinition,
  ThemeMode,
  UpdateChannel
} from '@shared/types'
import { useApp } from '../context/AppContext'
import { CustomTaskModal } from './CustomTaskModal'
import { PrayerPanel } from './PrayerPanel'
import {
  AlertTriangle,
  Bell,
  Check,
  Clock,
  Compass,
  Download,
  EyeOff,
  FileDown,
  FileUp,
  Globe,
  HelpCircle,
  Info,
  Laptop,
  Moon,
  Plus,
  Power,
  RefreshCw,
  RotateCcw,
  Shield,
  Sliders,
  Sun,
  Trash2,
  Volume2,
  VolumeX,
  Zap
} from 'lucide-react'

export const SettingsView: React.FC = () => {
  const {
    storeData,
    systemStatus,
    updateStatus,
    updateSettings,
    updateTask,
    deleteTask,
    resetTasks,
    exportData,
    validateImport,
    importData,
    checkForUpdates,
    downloadUpdate,
    installUpdate,
    testNotification,
    testMiniReminder,
    showToast
  } = useApp()

  const [activeSection, setActiveSection] = useState<'general' | 'tasks' | 'diagnostics' | 'updates' | 'data'>('general')
  const [editingTask, setEditingTask] = useState<TaskDefinition | null>(null)
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false)
  const [importJsonInput, setImportJsonInput] = useState('')
  const [importPreview, setImportPreview] = useState<{
    valid: boolean
    taskCount?: number
    completionCount?: number
    error?: string
  } | null>(null)
  const [showImportConfirm, setShowImportConfirm] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!storeData) return null

  const lang = (storeData.settings.language || 'ar') as Language
  const t = translations[lang] || translations.ar

  const handleExport = async () => {
    try {
      const json = await exportData()
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `wird-backup-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
      showToast('تم تصدير النسخة الاحتياطية بنجاح', 'success')
    } catch (err) {
      console.error(err)
      showToast('تعذر تصدير البيانات', 'error')
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (event) => {
      const content = event.target?.result as string
      setImportJsonInput(content)
      const result = await validateImport(content)
      setImportPreview(result)
    }
    reader.readAsText(file)
  }

  const handleApplyImport = async () => {
    try {
      await importData(importJsonInput)
      setShowImportConfirm(false)
      setImportPreview(null)
      setImportJsonInput('')
      showToast(t.settings.importSuccess, 'success')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      showToast(msg, 'error')
    }
  }

  const handleResetDefaults = async () => {
    try {
      await resetTasks()
      setShowResetConfirm(false)
      showToast('تمت استعادة المهام الافتراضية بنجاح', 'success')
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12 font-sans">
      {/* Settings Navigation tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        {[
          { id: 'general' as const, label: t.settings.general, icon: Sliders },
          { id: 'tasks' as const, label: t.settings.tasks, icon: Clock },
          { id: 'diagnostics' as const, label: 'الفحص والتنبيهات', icon: Bell },
          { id: 'updates' as const, label: t.settings.updates, icon: RefreshCw },
          { id: 'data' as const, label: t.settings.dataManagement, icon: Shield }
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveSection(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-semibold transition-all ${
              activeSection === id
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* SECTION: GENERAL */}
      {activeSection === 'general' && (
        <div className="space-y-4">
          <PrayerPanel />
          {/* Language & Theme Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-500" />
              <span>{t.settings.appearance}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-500 block mb-2">{t.settings.languageLabel}</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => updateSettings({ language: 'ar' })}
                    className={`p-2.5 rounded-xl border text-xs font-medium transition-all ${
                      storeData.settings.language === 'ar'
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-bold'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    العربية (RTL)
                  </button>
                  <button
                    onClick={() => updateSettings({ language: 'en' })}
                    className={`p-2.5 rounded-xl border text-xs font-medium transition-all ${
                      storeData.settings.language === 'en'
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-bold'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    English (LTR)
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-500 block mb-2">{t.settings.themeLabel}</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { mode: 'light' as ThemeMode, label: t.settings.themes.light, icon: Sun },
                    { mode: 'dark' as ThemeMode, label: t.settings.themes.dark, icon: Moon },
                    { mode: 'system' as ThemeMode, label: t.settings.themes.system, icon: Laptop }
                  ].map(({ mode, label, icon: Icon }) => (
                    <button
                      key={mode}
                      onClick={() => updateSettings({ theme: mode })}
                      className={`p-2.5 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                        storeData.settings.theme === mode
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-bold'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* User Greeting Name */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
              <label className="text-xs text-slate-400 block mb-1.5 font-medium">اسم المستخدم للترحيب (اختياري)</label>
              <input
                type="text"
                value={storeData.settings.userName || ''}
                placeholder="مثال: أحمد"
                onChange={(e) => updateSettings({ userName: e.target.value })}
                className="w-full max-w-sm px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-violet-400"
              />
              <span className="text-[11px] text-slate-400 block mt-1">يظهر أعلى الصفحة الرئيسية («السلام عليكم يا أحمد»)</span>
            </div>
          </div>

          {/* Mini Reminder Window Settings */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Compass className="w-4 h-4 text-emerald-500" />
              <span>نافذة التذكير المصغّرة</span>
            </h3>

            <div className="flex items-start justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  {t.miniReminder.enableLabel}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {t.miniReminder.enableDesc}
                </span>
              </div>
              <input
                type="checkbox"
                checked={storeData.settings.miniReminderEnabled}
                onChange={(e) => updateSettings({ miniReminderEnabled: e.target.checked })}
                className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
            </div>

            {storeData.settings.miniReminderEnabled && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  {t.miniReminder.positionLabel}
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { pos: 'bottom-right' as MiniReminderPosition, label: t.miniReminder.positions.bottomRight },
                    { pos: 'bottom-left' as MiniReminderPosition, label: t.miniReminder.positions.bottomLeft },
                    { pos: 'top-right' as MiniReminderPosition, label: t.miniReminder.positions.topRight },
                    { pos: 'top-left' as MiniReminderPosition, label: t.miniReminder.positions.topLeft }
                  ].map(({ pos, label }) => (
                    <button
                      key={pos}
                      onClick={() => updateSettings({ miniReminderPosition: pos })}
                      className={`p-2 rounded-xl text-xs font-medium border transition-all ${
                        storeData.settings.miniReminderPosition === pos
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* System & Startup Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Power className="w-4 h-4 text-emerald-500" />
              <span>{t.settings.general}</span>
            </h3>

            {/* Auto Start */}
            <div className="flex items-start justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  {t.settings.autoStartLabel}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {t.settings.autoStartDesc}
                </span>
              </div>
              <input
                type="checkbox"
                checked={storeData.settings.autoStartOnBoot}
                onChange={(e) => updateSettings({ autoStartOnBoot: e.target.checked })}
                className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
            </div>

            {/* Minimize to tray */}
            <div className="flex items-start justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  {t.settings.minimizeToTrayLabel}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {t.settings.minimizeToTrayDesc}
                </span>
              </div>
              <input
                type="checkbox"
                checked={storeData.settings.startMinimizedToTray}
                onChange={(e) => updateSettings({ startMinimizedToTray: e.target.checked })}
                className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
            </div>

            {/* Notification Sound */}
            <div className="flex items-start justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                {storeData.settings.soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-emerald-500" />
                ) : (
                  <VolumeX className="w-4 h-4 text-slate-400" />
                )}
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    {t.settings.soundLabel}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {t.settings.soundDesc}
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={storeData.settings.soundEnabled}
                onChange={(e) => updateSettings({ soundEnabled: e.target.checked })}
                className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
            </div>

            {/* Hide Weekly History */}
            <div className="flex items-start justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  إخفاء سجل الإنجاز الأسبوعي
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {t.history.hideHistoryOption}
                </span>
              </div>
              <input
                type="checkbox"
                checked={storeData.settings.hideWeeklyHistory}
                onChange={(e) => updateSettings({ hideWeeklyHistory: e.target.checked })}
                className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* SECTION: TASKS */}
      {activeSection === 'tasks' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              يمكنك تخصيص فترات التذكير وإضافة مهام مخصصة جديدة:
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowCreateTaskModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة مهمة جديدة</span>
              </button>
              <button
                onClick={() => setShowResetConfirm(true)}
                className="flex items-center gap-1 text-xs text-slate-500 hover:text-rose-600 font-medium transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t.actions.reset}</span>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {storeData.tasks.map((task: TaskDefinition) => (
              <div
                key={task.id}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {task.name[lang] || task.name.ar}
                    </span>
                    {task.isCustom && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-medium">
                        مهمة مخصصة
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setEditingTask(task)}
                      className="text-xs text-emerald-600 hover:underline font-medium"
                    >
                      تعديل كامل
                    </button>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={task.enabled}
                        onChange={(e) => updateTask(task.id, { enabled: e.target.checked })}
                        className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                      />
                      <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                        {t.settings.taskEnabledLabel}
                      </span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="text-[11px] text-slate-500 block mb-1">
                      {t.settings.startTimeLabel}
                    </label>
                    <input
                      type="time"
                      value={task.startTime}
                      onChange={(e) => updateTask(task.id, { startTime: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-center"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-500 block mb-1">
                      {t.settings.endTimeLabel}
                    </label>
                    <input
                      type="time"
                      value={task.endTime}
                      onChange={(e) => updateTask(task.id, { endTime: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-center"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-500 block mb-1">
                      {t.settings.repeatIntervalLabel}
                    </label>
                    <select
                      value={task.repeatIntervalMinutes}
                      onChange={(e) =>
                        updateTask(task.id, { repeatIntervalMinutes: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    >
                      <option value={5}>كل 5 دقائق</option>
                      <option value={10}>كل 10 دقائق</option>
                      <option value={15}>كل 15 دقيقة</option>
                      <option value={20}>كل 20 دقيقة</option>
                      <option value={30}>كل 30 دقيقة</option>
                      <option value={60}>كل ساعة</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-500 block mb-1">
                      مدة جلسة التفرّغ الافتراضية
                    </label>
                    <select
                      value={task.defaultFocusDurationMinutes || 15}
                      onChange={(e) =>
                        updateTask(task.id, { defaultFocusDurationMinutes: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    >
                      <option value={5}>5 دقائق</option>
                      <option value={10}>10 دقائق</option>
                      <option value={15}>15 دقيقة</option>
                      <option value={20}>20 دقيقة</option>
                      <option value={30}>30 دقيقة</option>
                      <option value={45}>45 دقيقة</option>
                      <option value={60}>ساعة كاملة</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION: DIAGNOSTICS & NOTIFICATIONS */}
      {activeSection === 'diagnostics' && (
        <div className="space-y-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6 shadow-sm">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Bell className="w-4 h-4 text-emerald-500" />
                <span>فحص واختبار التنبيهات</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                تأكد من قدرة التطبيق على إرسال الإشعارات وعرض النوافذ المصغّرة بنجاح على نظام Windows.
              </p>
            </div>

            {/* Test buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/60 space-y-3">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  إشعار Windows Toast
                </span>
                <p className="text-[11px] text-slate-500">
                  إرسال إشعار فوري إلى مركز إشعارات Windows لاختبار الصوت والظهور.
                </p>
                <button
                  onClick={() => testNotification()}
                  className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-medium transition-colors flex items-center gap-2"
                >
                  <Bell className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t.actions.testNotification}</span>
                </button>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/60 space-y-3">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  نافذة التذكير المصغّرة
                </span>
                <p className="text-[11px] text-slate-500">
                  عرض نافذة عائمة مصغّرة غير سارقة للتركيز في الموضع المحدد.
                </p>
                <button
                  onClick={() => testMiniReminder()}
                  className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-medium transition-colors flex items-center gap-2"
                >
                  <Compass className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t.actions.testMiniReminder}</span>
                </button>
              </div>
            </div>

            {/* Educational Note about Windows Focus Assist / DND */}
            <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-900 dark:text-amber-200">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>ملاحظة حول ميزة تركيز Windows (Focus Assist / Do Not Disturb)</span>
              </div>
              <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                في حال تفعيل وضع عدم الإزعاج أو وضع الألعاب أو تشغيل العروض التقديمية في Windows، قد يكتم النظام الإشعارات تلقائيًا أو يجمعها في مركز الإجراءات دون إصدار صوت أو نافذة منبثقة. يمكنك التحقق من إعدادات Focus Assist في إعدادات النظام للتأكد من السماح بوصول تنبيهات «وِرد».
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SECTION: UPDATES */}
      {activeSection === 'updates' && (
        <div className="space-y-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-5 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-emerald-500" />
                  <span>تحديثات GitHub Releases</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  تحديثات دورية مباشرة من المستودع الرسمي المفتوح المصدر
                </p>
              </div>

              <div className="text-xs text-slate-600 dark:text-slate-400">
                <span className="text-slate-400">الإصدار المثبت: </span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                  v{systemStatus?.appVersion || '1.1.0'}
                </span>
              </div>
            </div>

            {/* Update state alerts */}
            {updateStatus.state === 'checking' && (
              <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs flex items-center gap-2.5">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{t.settings.checkingUpdates}</span>
              </div>
            )}

            {updateStatus.state === 'not-available' && (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2.5">
                <Check className="w-4 h-4" />
                <span>{t.settings.upToDate}</span>
              </div>
            )}

            {updateStatus.state === 'available' && (
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-900 dark:text-amber-200">
                    {t.settings.updateAvailable}: v{updateStatus.info.version}
                  </span>
                  <button
                    onClick={downloadUpdate}
                    className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs shadow-sm flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{t.actions.downloadUpdate}</span>
                  </button>
                </div>
                {updateStatus.info.releaseNotes && (
                  <div className="p-3 rounded-xl bg-white/70 dark:bg-slate-900/70 text-xs text-slate-700 dark:text-slate-300 font-mono whitespace-pre-wrap max-h-32 overflow-y-auto">
                    {updateStatus.info.releaseNotes}
                  </div>
                )}
              </div>
            )}

            {updateStatus.state === 'downloading' && (
              <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 space-y-2">
                <div className="flex items-center justify-between text-xs text-blue-900 dark:text-blue-200 font-medium">
                  <span>{t.settings.downloadingUpdate}</span>
                  <span>{updateStatus.progress.percent}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-blue-200 dark:bg-blue-900 overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-300"
                    style={{ width: `${updateStatus.progress.percent}%` }}
                  />
                </div>
              </div>
            )}

            {updateStatus.state === 'downloaded' && (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between gap-4">
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-200">
                  {t.settings.updateDownloaded}
                </span>
                <button
                  onClick={installUpdate}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-md shadow-emerald-600/20"
                >
                  {t.actions.restartAndInstall}
                </button>
              </div>
            )}

            {/* Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    {t.settings.updateCheckLabel}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {t.settings.updateCheckDesc}
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={storeData.settings.autoCheckUpdates}
                  onChange={(e) => updateSettings({ autoCheckUpdates: e.target.checked })}
                  className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    {t.settings.updateChannelLabel}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    تلقي الإصدارات المستقرة فقط
                  </span>
                </div>
                <select
                  value={storeData.settings.updateChannel}
                  onChange={(e) =>
                    updateSettings({ updateChannel: e.target.value as UpdateChannel })
                  }
                  className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                >
                  <option value="stable">{t.settings.channels.stable}</option>
                  <option value="beta">{t.settings.channels.beta}</option>
                </select>
              </div>
            </div>

            <button
              onClick={() => checkForUpdates()}
              disabled={updateStatus.state === 'checking'}
              className="px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium text-xs transition-colors flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${updateStatus.state === 'checking' ? 'animate-spin' : ''}`} />
              <span>{t.actions.checkForUpdates}</span>
            </button>
          </div>
        </div>
      )}

      {/* SECTION: DATA MANAGEMENT */}
      {activeSection === 'data' && (
        <div className="space-y-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6 shadow-sm">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-500" />
                <span>{t.settings.dataManagement}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                تُحفظ جميع بياناتك محليًا في مجلد المستخدم (`userData`) بطريقة ذرية تضمن عدم تلف البيانات عند إيقاف التشغيل المفاجئ. يحتفظ التطبيق تلقائيًا بآخر 5 نسخ احتياطية دورية متناوبة في مجلد backups.
              </p>
            </div>

            {/* Export & Import Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/60 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileDown className="w-4 h-4 text-emerald-500" />
                  <span>تصدير نسخة احتياطية</span>
                </h4>
                <p className="text-[11px] text-slate-500">
                  {t.settings.exportDesc}
                </p>
                <button
                  onClick={handleExport}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-sm flex items-center gap-2 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{t.actions.exportData}</span>
                </button>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/60 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileUp className="w-4 h-4 text-teal-500" />
                  <span>استيراد واستعادة</span>
                </h4>
                <p className="text-[11px] text-slate-500">
                  {t.settings.importDesc}
                </p>
                <input
                  type="file"
                  accept=".json"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-medium text-xs flex items-center gap-2 transition-colors"
                >
                  <FileUp className="w-3.5 h-3.5" />
                  <span>اختر ملف JSON</span>
                </button>
              </div>
            </div>

            {/* Import Preview Card */}
            {importPreview && (
              <div className="p-4 rounded-2xl border border-blue-200 dark:border-blue-800 bg-blue-50/60 dark:bg-blue-950/30 space-y-3">
                {importPreview.valid ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-900 dark:text-blue-200">
                        معاينة بيانات الملف المستورد:
                      </span>
                      <button
                        onClick={() => setShowImportConfirm(true)}
                        className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium"
                      >
                        تطبيق الاستيراد
                      </button>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-blue-800 dark:text-blue-300">
                      <span>المهام: {importPreview.taskCount}</span>
                      <span>سجلات الإنجاز: {importPreview.completionCount}</span>
                    </div>
                  </>
                ) : (
                  <div className="text-xs text-rose-600 dark:text-rose-400">
                    {importPreview.error}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Custom Task Modal */}
      {(showCreateTaskModal || editingTask) && (
        <CustomTaskModal
          taskToEdit={editingTask}
          onClose={() => {
            setShowCreateTaskModal(false)
            setEditingTask(null)
          }}
        />
      )}

      {/* Confirmation modal for Import */}
      {showImportConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-amber-600">
              <AlertTriangle className="w-6 h-6" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                {t.settings.importConfirmTitle}
              </h4>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {t.settings.importConfirmDesc}
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setShowImportConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs text-slate-600 dark:text-slate-400 font-medium"
              >
                {t.actions.cancel}
              </button>
              <button
                onClick={handleApplyImport}
                className="px-4 py-2 rounded-xl text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
              >
                {t.actions.confirm}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation modal for Reset Defaults */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle className="w-6 h-6" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                {t.settings.resetConfirmTitle}
              </h4>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {t.settings.resetConfirmDesc}
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs text-slate-600 dark:text-slate-400 font-medium"
              >
                {t.actions.cancel}
              </button>
              <button
                onClick={handleResetDefaults}
                className="px-4 py-2 rounded-xl text-xs bg-rose-600 hover:bg-rose-500 text-white font-medium"
              >
                {t.actions.confirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
