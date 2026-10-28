import React, { useState } from 'react'
import { getTaskOccurrence } from '@shared/scheduler'
import { AboutModal } from './components/AboutModal'
import { FocusSessionOverlay } from './components/FocusSessionOverlay'
import { Sidebar, TitleBar } from './components/DesktopChrome'
import { HomeDashboard } from './components/HomeDashboard'
import { MiniReminderView } from './components/MiniReminderView'
import { OnboardingModal } from './components/OnboardingModal'
import { PrayerPanel } from './components/PrayerPanel'
import { SettingsView } from './components/SettingsView'
import { TaskCard } from './components/TaskCard'
import { Toast } from './components/Toast'
import { UpdateBanner } from './components/UpdateBanner'
import { WeeklyHistory } from './components/WeeklyHistory'
import { useApp } from './context/AppContext'

export const App: React.FC = () => {
  const { storeData, loading, activeTab, highlightedTaskId, startSession } = useApp()
  const [focusMinutes, setFocusMinutes] = useState(20)

  // If this window instance was opened with hash #mini-reminder, render MiniReminderView directly
  if (window.location.hash === '#mini-reminder') {
    return <MiniReminderView />
  }

  if (loading || !storeData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--wird-background)] text-[var(--wird-text)] font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[var(--wird-primary)] text-[var(--wird-background)] font-bold text-2xl flex items-center justify-center shadow-xl">
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
  const sortedTasks = [...storeData.tasks].sort((a, b) => {
    const order = { due: 0, snoozed: 1, upcoming: 2, expired: 3, completed: 4 }
    return order[getTaskOccurrence(a, storeData).status] - order[getTaskOccurrence(b, storeData).status]
  })
  return (
    <div className="wird-app" dir="rtl">
      <TitleBar />
      <div className="wird-workspace"><Sidebar /><main className="wird-content"><UpdateBanner />
        {activeTab === 'home' && <HomeDashboard />}
        {activeTab === 'prayer' && <div className="wird-inner-page"><h1>مواقيت الصلاة</h1><PrayerPanel /></div>}
        {activeTab === 'tasks' && <div className="wird-inner-page"><h1>الأذكار والورد</h1><div className="space-y-4">{sortedTasks.map(task => <TaskCard key={task.id} task={task} isHighlighted={highlightedTaskId === task.id}/>)}</div></div>}
        {activeTab === 'focus' && <div className="wird-inner-page"><h1>جلسات التفرّغ</h1><p className="wird-page-subtitle">اختر مدة الجلسة ثم المهمة التي ستتفرّغ لها.</p><label className="wird-focus-duration">مدة الجلسة <select value={focusMinutes} onChange={event => setFocusMinutes(Number(event.target.value))}>{[10, 15, 20, 30, 45, 60].map(minutes => <option key={minutes} value={minutes}>{minutes} دقيقة</option>)}</select></label><div className="wird-focus-choices">{sortedTasks.filter(task => task.enabled).map(task => { const occurrence = getTaskOccurrence(task, storeData); return <button key={task.id} className="wird-panel" onClick={() => startSession(task.id, occurrence.occurrenceId, focusMinutes)}><strong>{task.name.ar}</strong><span>ابدأ ←</span></button> })}</div></div>}
        {activeTab === 'history' && <div className="wird-inner-page"><WeeklyHistory /></div>}
        {activeTab === 'settings' && <div className="wird-inner-page"><SettingsView /></div>}
        {activeTab === 'about' && <div className="wird-inner-page"><AboutModal /></div>}
      </main></div>

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
