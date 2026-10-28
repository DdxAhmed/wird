import React, { useState, useEffect, useRef } from 'react'
import { translations } from '@shared/i18n'
import { Language } from '@shared/types'
import { useApp } from '../context/AppContext'
import {
  CheckCircle,
  Clock,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  PlusCircle,
  Shield,
  XCircle
} from 'lucide-react'

export const FocusSessionOverlay: React.FC = () => {
  const {
    storeData,
    pauseSession,
    resumeSession,
    extendSession,
    confirmSession,
    abandonSession,
    toggleSessionAlwaysOnTop,
    toggleSessionSeconds
  } = useApp()

  const session = storeData?.activeSession

  // State for long-press early exit
  const [exitHoldProgress, setExitHoldProgress] = useState(0)
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const [showExtendMenu, setShowExtendMenu] = useState(false)
  const holdIntervalRef = useRef<NodeJS.Timeout | null>(null)

  if (!session) return null

  const lang = (storeData?.settings.language || 'ar') as Language
  const t = translations[lang] || translations.ar

  // Format time
  const totalSeconds = session.remainingSeconds
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  const formattedMinutes = String(minutes).padStart(2, '0')
  const formattedSeconds = String(seconds).padStart(2, '0')

  // Progress percentage
  const percentComplete =
    session.totalDurationSeconds > 0
      ? Math.round(((session.totalDurationSeconds - session.remainingSeconds) / session.totalDurationSeconds) * 100)
      : 0

  // Long-press exit handler
  const startHoldExit = () => {
    if (holdIntervalRef.current) clearInterval(holdIntervalRef.current)
    const startTime = Date.now()
    const holdDurationMs = 2000

    holdIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(100, Math.round((elapsed / holdDurationMs) * 100))
      setExitHoldProgress(progress)

      if (progress >= 100) {
        clearInterval(holdIntervalRef.current!)
        holdIntervalRef.current = null
        setExitHoldProgress(0)
        setShowExitConfirm(true)
      }
    }, 50)
  }

  const cancelHoldExit = () => {
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current)
      holdIntervalRef.current = null
    }
    setExitHoldProgress(0)
  }

  // Handle awaiting confirmation view
  const isAwaitingConfirmation = session.status === 'awaiting_confirmation' || session.remainingSeconds === 0

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-2xl text-slate-100 flex flex-col justify-between p-8 select-none animate-fade-in font-sans">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between max-w-4xl w-full mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600/30 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold text-lg">
            و
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              {session.taskName}
            </h1>
            <span className="text-xs text-slate-400">
              {t.session.title} • {session.durationMinutes} {t.session.minutesUnit}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button onClick={() => window.wirdApi.stopPrayerAudio()} className="rounded-xl border border-amber-500/60 px-3 py-1.5 text-xs text-amber-200">إيقاف الأذان</button>
          {/* Always on top toggle */}
          <button
            onClick={() => toggleSessionAlwaysOnTop()}
            title={t.session.alwaysOnTop}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors border ${
              session.isAlwaysOnTop
                ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>{t.session.alwaysOnTop}</span>
          </button>

          {/* Seconds toggle */}
          <button
            onClick={() => toggleSessionSeconds()}
            title={t.session.toggleSeconds}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors border ${
              session.showSeconds
                ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{session.showSeconds ? 'ثوانٍ: مفعل' : 'ثوانٍ: مخفي'}</span>
          </button>
        </div>
      </div>

      {/* Main Center Area */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-lg mx-auto text-center py-6 w-full">
        {/* If paused (e.g. system lock/sleep) */}
        {session.status === 'paused' && (
          <div className="mb-6 px-4 py-2.5 rounded-2xl bg-amber-950/40 border border-amber-800/60 text-amber-300 text-xs flex items-center gap-2 animate-pulse">
            <Pause className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{t.session.pausedDueToLockTitle} — {t.session.pausedDueToLockDesc}</span>
          </div>
        )}

        {/* Large Countdown Timer */}
        <div className="relative my-4 flex items-center justify-center">
          <div className="text-7xl sm:text-8xl md:text-9xl font-mono font-bold tracking-tight text-white drop-shadow-md">
            {session.showSeconds ? (
              <>
                <span>{formattedMinutes}</span>
                <span className="text-emerald-500 animate-pulse">:</span>
                <span>{formattedSeconds}</span>
              </>
            ) : (
              <>
                <span>{formattedMinutes}</span>
                <span className="text-xs text-slate-400 font-sans ml-2">دقيقة</span>
              </>
            )}
          </div>
        </div>

        {/* Subtle Progress Bar */}
        <div className="w-full max-w-xs h-1.5 bg-slate-900 rounded-full overflow-hidden my-4 border border-slate-800">
          <div
            className="h-full bg-emerald-500 transition-all duration-1000 ease-linear rounded-full"
            style={{ width: `${percentComplete}%` }}
          />
        </div>

        {/* Target display if available */}
        {session.hasTarget && session.targetTotal && (
          <p className="text-xs text-slate-400 mt-2">
            الهدف: {session.targetTotal} {session.targetUnit || 'صفحات'}
          </p>
        )}

        {/* Session Play/Pause Control Button */}
        {!isAwaitingConfirmation && (
          <div className="flex items-center gap-3 mt-6">
            {session.status === 'active' ? (
              <button
                onClick={() => pauseSession()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-slate-700 text-xs font-semibold transition-all shadow-lg"
              >
                <Pause className="w-4 h-4 text-amber-400" />
                <span>إيقاف مؤقت</span>
              </button>
            ) : (
              <button
                onClick={() => resumeSession()}
                className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all shadow-lg shadow-emerald-600/30"
              >
                <Play className="w-4 h-4" />
                <span>{t.session.resumeButton}</span>
              </button>
            )}

            <button
              onClick={() => setShowExtendMenu(!showExtendMenu)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-semibold transition-all"
            >
              <PlusCircle className="w-4 h-4 text-emerald-400" />
              <span>تمديد الوقت</span>
            </button>
          </div>
        )}

        {/* Extend menu dropdown */}
        {showExtendMenu && !isAwaitingConfirmation && (
          <div className="flex items-center gap-2 mt-3 p-2 rounded-2xl bg-slate-900 border border-slate-800 animate-fade-in text-xs">
            <span className="text-slate-400 px-2">إضافة:</span>
            {[5, 10, 15].map((m) => (
              <button
                key={m}
                onClick={() => {
                  extendSession(m)
                  setShowExtendMenu(false)
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-emerald-600 text-white font-medium transition-colors"
              >
                +{m} دقيقة
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Bar: Early Exit with Hold */}
      <div className="max-w-4xl w-full mx-auto flex items-center justify-between border-t border-slate-900 pt-4">
        <span className="text-xs text-slate-500">
          {t.appName} • {t.footerTagline}
        </span>

        {/* Hold to Exit Button */}
        <div className="relative">
          <button
            onMouseDown={startHoldExit}
            onMouseUp={cancelHoldExit}
            onMouseLeave={cancelHoldExit}
            onTouchStart={startHoldExit}
            onTouchEnd={cancelHoldExit}
            className="relative overflow-hidden px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-slate-200 border border-slate-800 text-xs font-medium transition-all"
          >
            {/* Fill indicator while holding */}
            <div
              className="absolute inset-0 bg-rose-950/70 border-r-2 border-rose-500 transition-all pointer-events-none"
              style={{ width: `${exitHoldProgress}%` }}
            />
            <span className="relative z-10 flex items-center gap-2">
              <XCircle className="w-3.5 h-3.5 text-rose-400" />
              <span>{t.session.earlyExitButton}</span>
            </span>
          </button>
          <p className="text-[10px] text-slate-500 text-center mt-1">
            {t.session.earlyExitHint}
          </p>
        </div>
      </div>

      {/* Confirmation Dialog on Timer Finish */}
      {isAwaitingConfirmation && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-center space-y-6">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
              <CheckCircle className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white">
                {t.session.timerFinishedQuestion}
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                انقضت مدة جلسة التفرّغ لـ «{session.taskName}». هل أتممت القراءة بحمد الله؟
              </p>
            </div>

            <div className="flex flex-col gap-2.5">
              {/* Completed Yes */}
              <button
                onClick={() => confirmSession()}
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                <span>{t.session.yesCompleted}</span>
              </button>

              {/* Need More Time */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => extendSession(5)}
                  className="py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                >
                  +{5} دقائق إضافية
                </button>
                <button
                  onClick={() => extendSession(10)}
                  className="py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                >
                  +{10} دقائق إضافية
                </button>
              </div>

              {/* Finish Without Confirming */}
              <button
                onClick={() => abandonSession()}
                className="w-full py-2.5 rounded-2xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 text-xs font-medium transition-colors"
              >
                {t.session.finishWithoutConfirm}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Early Exit Confirmation Dialog (from hold) */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="max-w-sm w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-center space-y-5">
            <h3 className="text-base font-bold text-white">
              {t.session.earlyExitConfirmTitle}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t.session.earlyExitConfirmDesc}
            </p>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="flex-1 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
              >
                متابعة الجلسة
              </button>
              <button
                onClick={() => {
                  setShowExitConfirm(false)
                  abandonSession()
                }}
                className="flex-1 py-2.5 rounded-2xl bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-bold transition-colors"
              >
                تأكيد الخروج
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
