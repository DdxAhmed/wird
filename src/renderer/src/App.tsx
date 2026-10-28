import React from 'react'
import { translations } from '@shared/i18n'
import { Language, TaskDefinition } from '@shared/types'
import { AboutModal } from './components/AboutModal'
import { FocusSessionOverlay } from './components/FocusSessionOverlay'
import { Header } from './components/Header'
import { MiniReminderView } from './components/MiniReminderView'
import { OnboardingModal } from './components/OnboardingModal'
import { SettingsView } from './components/SettingsView'
import { TaskCard } from './components/TaskCard'
import { Toast } from './components/Toast'
import { UpdateBanner } from './components/UpdateBanner'
import { WeeklyHistory } from './components/WeeklyHistory'
import { useApp } from './context/AppContext'

export const App: React.FC = () => {
  const { storeData, loading, activeTab, highlightedTaskId } = useApp()

  // If this window instance was opened with hash #mini-reminder, render MiniReminderView directly
  if (window.location.hash === '#mini-reminder') {
    return <MiniReminderView />
  }

  if (loading || !storeData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white font-bold text-2xl flex items-center justify-center animate-pulse shadow-xl shadow-emerald-600/30">
            و
          </div>
          <span className="text-xs text-slate-400 font-medium tracking-wide">
            جارٍ تحميل وِرد...
          </span>
        </div>
      </div>
    )
  }

  const lang = (storeData.settings.language || 'ar') as Language
  const t = translations[lang] || translations.ar
  const showOnboarding = !storeData.settings.hasCompletedOnboarding

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-emerald-500 selection:text-white font-sans antialiased">
      {/* Header */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-6">
        <UpdateBanner />

        {activeTab === 'home' && (
          <div className="space-y-4 animate-fade-in">
            {storeData.tasks.map((task: TaskDefinition) => (
              <TaskCard
                key={task.id}
                task={task}
                isHighlighted={highlightedTaskId === task.id}
              />
            ))}
          </div>
        )}

        {activeTab === 'history' && <WeeklyHistory />}

        {activeTab === 'settings' && <SettingsView />}

        {activeTab === 'about' && <AboutModal />}
      </main>

      {/* Footer Tagline */}
      <footer className="py-6 border-t border-slate-200/80 dark:border-slate-800/80 text-center">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
          {t.footerTagline}
        </p>
      </footer>

      {/* First-time Onboarding Modal */}
      {showOnboarding && <OnboardingModal />}

      {/* In-app Toast notifications */}
      <Toast />

      {/* Focus Session Fullscreen Overlay («جلسة تفرّغ») */}
      {storeData.activeSession && <FocusSessionOverlay />}
    </div>
  )
}

export default App
