import React, { useState } from 'react'
import { translations } from '@shared/i18n'
import { Language, TaskDefinition, ThemeMode } from '@shared/types'
import { useApp } from '../context/AppContext'
import { PrayerPanel } from './PrayerPanel'
import {
  Bell,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Laptop,
  Moon,
  Sparkles,
  Sun
} from 'lucide-react'

export const OnboardingModal: React.FC = () => {
  const { storeData, updateSettings, updateTask, testNotification, showToast } = useApp()
  const [step, setStep] = useState(1)

  if (!storeData) return null

  const lang = (storeData.settings.language || 'ar') as Language
  const t = translations[lang] || translations.ar

  const handleFinish = async () => {
    await updateSettings({ hasCompletedOnboarding: true })
    showToast(t.onboarding.readyTitle, 'success')
  }

  const handleTestNotification = async () => {
    try {
      await testNotification()
      showToast(t.onboarding.testNotificationSuccess, 'success')
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Step indicator */}
        <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white font-bold flex items-center justify-center text-lg shadow-md shadow-emerald-600/20">
              و
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {t.onboarding.welcomeTitle}
              </h2>
              <span className="text-xs text-slate-400">
                الخطوة {step} من 4
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-2 rounded-full transition-all duration-300 ${
                  s === step
                    ? 'w-6 bg-emerald-600'
                    : s < step
                    ? 'w-2 bg-emerald-300 dark:bg-emerald-800'
                    : 'w-2 bg-slate-200 dark:bg-slate-700'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="p-6 flex-1 overflow-y-auto max-h-[60vh] space-y-6">
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {t.onboarding.step1Title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {t.onboarding.step1Desc}
                </p>
              </div>

              <div
                onClick={() =>
                  updateSettings({ autoStartOnBoot: !storeData.settings.autoStartOnBoot })
                }
                className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 cursor-pointer flex items-start gap-4 transition-all"
              >
                <div
                  className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                    storeData.settings.autoStartOnBoot
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                  }`}
                >
                  {storeData.settings.autoStartOnBoot && <Check className="w-3.5 h-3.5" />}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {t.onboarding.autoStartLabel}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {t.onboarding.autoStartDesc}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-500 space-y-2">
                <p className="flex items-center gap-2">
                  <Laptop className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>
                    عند بدء تشغيل Windows، سيعمل التطبيق بهدوء في علبة النظام (System Tray) دون إظهار نافذة تشتتك.
                  </span>
                </p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <PrayerPanel />
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {t.onboarding.step2Title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {t.onboarding.step2Desc}
                </p>
              </div>

              <div className="space-y-3">
                {storeData.tasks.map((task: TaskDefinition) => (
                  <div
                    key={task.id}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {task.name[lang] || task.name.ar}
                      </span>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={task.enabled}
                          onChange={(e) => updateTask(task.id, { enabled: e.target.checked })}
                          className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                        />
                        <span className="text-xs text-slate-500">تفعيل</span>
                      </label>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">بداية الفترة</label>
                        <input
                          type="time"
                          value={task.startTime}
                          onChange={(e) => updateTask(task.id, { startTime: e.target.value })}
                          className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-center"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">نهاية الفترة</label>
                        <input
                          type="time"
                          value={task.endTime}
                          onChange={(e) => updateTask(task.id, { endTime: e.target.value })}
                          className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-center"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {t.onboarding.step3Title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {t.onboarding.step3Desc}
                </p>
              </div>

              <div className="space-y-3">
                {storeData.tasks.map((task: TaskDefinition) => (
                  <div
                    key={task.id}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between gap-4"
                  >
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                        {task.name[lang] || task.name.ar}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        الفاصل الزمني بين كل إشعار وآخر
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={task.repeatIntervalMinutes}
                        onChange={(e) =>
                          updateTask(task.id, { repeatIntervalMinutes: Number(e.target.value) })
                        }
                        className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                      >
                        <option value={10}>كل 10 دقائق</option>
                        <option value={15}>كل 15 دقيقة (الموصى به)</option>
                        <option value={20}>كل 20 دقيقة</option>
                        <option value={30}>كل 30 دقيقة</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {t.onboarding.step4Title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {t.onboarding.step4Desc}
                </p>
              </div>

              {/* Theme choice */}
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-2">
                  {t.settings.themeLabel}
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { mode: 'light' as ThemeMode, label: t.settings.themes.light, icon: Sun },
                    { mode: 'dark' as ThemeMode, label: t.settings.themes.dark, icon: Moon },
                    { mode: 'system' as ThemeMode, label: t.settings.themes.system, icon: Laptop }
                  ].map(({ mode, label, icon: Icon }) => (
                    <button
                      key={mode}
                      onClick={() => updateSettings({ theme: mode })}
                      className={`p-3 rounded-2xl border text-xs font-medium flex flex-col items-center gap-2 transition-all ${
                        storeData.settings.theme === mode
                          ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Test Notification button */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    تجربة إشعار Windows
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    تحقق من ظهور الإشعارات وأصواتها
                  </p>
                </div>
                <button
                  onClick={handleTestNotification}
                  className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-medium transition-colors flex items-center gap-1.5"
                >
                  <Bell className="w-4 h-4 text-emerald-500" />
                  <span>{t.actions.testNotification}</span>
                </button>
              </div>

              <p className="text-[11px] text-slate-400 text-center">
                {t.notifications.dndNote}
              </p>
            </div>
          )}
        </div>

        {/* Footer controls */}
        <div className="p-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ChevronRight className="w-4 h-4" />
              <span>{t.actions.back}</span>
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20"
            >
              <span>{t.actions.next}</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="flex items-center gap-1.5 px-6 py-2 rounded-xl text-xs font-medium bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-600/25"
            >
              <Sparkles className="w-4 h-4" />
              <span>{t.actions.finish}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
