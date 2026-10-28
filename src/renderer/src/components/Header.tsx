import React, { useMemo } from 'react'
import { translations } from '@shared/i18n'
import { getTaskOccurrence } from '@shared/scheduler'
import { Language, TaskDefinition } from '@shared/types'
import { useApp } from '../context/AppContext'
import { Bell, BellOff, Calendar, CheckCircle2, History, Info, Play, Settings } from 'lucide-react'

export const Header: React.FC = () => {
  const { storeData, activeTab, setActiveTab, resumeReminders } = useApp()

  const lang = (storeData?.settings.language || 'ar') as Language
  const t = translations[lang] || translations.ar

  const { gregorianFormatted, hijriFormatted } = useMemo(() => {
    const now = new Date()
    const locale = lang === 'ar' ? 'ar-EG' : 'en-US'

    const gFmt = new Intl.DateTimeFormat(locale, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(now)

    let hFmt = ''
    try {
      hFmt = new Intl.DateTimeFormat(lang === 'ar' ? 'ar-SA-u-ca-islamic-umalqura' : 'en-US-u-ca-islamic-umalqura', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(now)
    } catch {
      hFmt = ''
    }

    return { gregorianFormatted: gFmt, hijriFormatted: hFmt }
  }, [lang])

  // Count due and completed tasks for today
  const { dueCount, completedCount, totalCount } = useMemo(() => {
    if (!storeData) return { dueCount: 0, completedCount: 0, totalCount: 0 }
    let due = 0
    let completed = 0

    for (const task of storeData.tasks) {
      if (task.enabled) {
        const occ = getTaskOccurrence(task, storeData)
        if (occ.status === 'due') due++
        if (occ.status === 'completed') completed++
      }
    }

    return {
      dueCount: due,
      completedCount: completed,
      totalCount: storeData.tasks.filter((t: TaskDefinition) => t.enabled).length
    }
  }, [storeData])

  const isPaused = storeData?.settings.pausedUntil && storeData.settings.pausedUntil > Date.now()

  return (
    <header className="border-b border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md sticky top-0 z-20">
      <div className="max-w-5xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Brand & Date */}
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white font-bold text-xl">
            و
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                {t.appName}
              </h1>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/50">
                {completedCount}/{totalCount}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>{gregorianFormatted}</span>
              {hijriFormatted && (
                <>
                  <span>•</span>
                  <span className="text-slate-600 dark:text-slate-300 font-medium">{hijriFormatted}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Global Alert / Paused status badge */}
        {isPaused && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/50 text-amber-700 dark:text-amber-300 text-xs">
            <BellOff className="w-4 h-4" />
            <span>{t.status.paused}</span>
            <button
              onClick={() => resumeReminders()}
              className="font-medium underline hover:text-amber-900 dark:hover:text-amber-100 flex items-center gap-1"
            >
              <Play className="w-3 h-3" />
              {t.actions.resume}
            </button>
          </div>
        )}

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1.5 bg-slate-100/80 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700/60">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'home'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{t.tabs.home}</span>
            {dueCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'history'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <History className="w-4 h-4" />
            <span>{t.tabs.history}</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'settings'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>{t.tabs.settings}</span>
          </button>

          <button
            onClick={() => setActiveTab('about')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'about'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Info className="w-4 h-4" />
            <span>{t.tabs.about}</span>
          </button>
        </nav>
      </div>
    </header>
  )
}
