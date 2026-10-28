import React from 'react'
import { TaskDefinition } from '@shared/types'
import { AboutModal } from './components/AboutModal'
import { Header } from './components/Header'
import { OnboardingModal } from './components/OnboardingModal'
import { SettingsView } from './components/SettingsView'
import { TaskCard } from './components/TaskCard'
import { Toast } from './components/Toast'
import { UpdateBanner } from './components/UpdateBanner'
import { WeeklyHistory } from './components/WeeklyHistory'
import { useApp } from './context/AppContext'

export const App: React.FC = () => {
  const { storeData, loading, activeTab, highlightedTaskId } = useApp()

  if (loading || !storeData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100">
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

  const showOnboarding = !storeData.settings.hasCompletedOnboarding

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-emerald-500 selection:text-white">
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

      {/* First-time Onboarding Modal */}
      {showOnboarding && <OnboardingModal />}

      {/* In-app Toast notifications */}
      <Toast />
    </div>
  )
}
export default App
