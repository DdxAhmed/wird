import React, { useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'

export const Toast: React.FC = () => {
  const { toast, hideToast } = useApp()

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => {
      hideToast()
    }, 4000)
    return () => clearTimeout(timer)
  }, [toast, hideToast])

  if (!toast) return null

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-bounce-in">
      <div
        className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl shadow-xl text-xs font-medium border backdrop-blur-md ${
          toast.type === 'success'
            ? 'bg-emerald-600/90 text-white border-emerald-400/40 shadow-emerald-600/20'
            : toast.type === 'error'
            ? 'bg-rose-600/90 text-white border-rose-400/40 shadow-rose-600/20'
            : 'bg-slate-900/90 text-white border-slate-700/60 shadow-slate-900/20'
        }`}
      >
        {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 shrink-0" />}
        {toast.type === 'error' && <AlertCircle className="w-4 h-4 shrink-0" />}
        {toast.type === 'info' && <Info className="w-4 h-4 shrink-0" />}
        <span>{toast.text}</span>
        <button
          onClick={hideToast}
          className="p-1 rounded-lg hover:bg-white/20 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
