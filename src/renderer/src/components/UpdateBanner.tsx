import React from 'react'
import { translations } from '@shared/i18n'
import { Language } from '@shared/types'
import { useApp } from '../context/AppContext'
import { Download, RefreshCw, Sparkles, X } from 'lucide-react'

export const UpdateBanner: React.FC = () => {
  const { storeData, updateStatus, downloadUpdate, installUpdate, setActiveTab } = useApp()

  if (!storeData) return null

  const lang = (storeData.settings.language || 'ar') as Language
  const t = translations[lang] || translations.ar

  if (updateStatus.state === 'available') {
    return (
      <div className="mb-4 p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-transparent border border-emerald-500/30 flex items-center justify-between gap-4 animate-fade-in">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            {t.settings.updateAvailable} (v{updateStatus.info.version})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('settings')}
            className="text-xs text-slate-500 hover:underline px-2 py-1"
          >
            التفاصيل
          </button>
          <button
            onClick={downloadUpdate}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t.actions.downloadUpdate}</span>
          </button>
        </div>
      </div>
    )
  }

  if (updateStatus.state === 'downloaded') {
    return (
      <div className="mb-4 p-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/20 flex items-center justify-between gap-4 animate-fade-in">
        <div className="flex items-center gap-2.5">
          <RefreshCw className="w-4 h-4" />
          <span className="text-xs font-semibold">
            {t.settings.updateDownloaded}
            {updateStatus.fallbackFull && ' • تعذّر التنزيل التفاضلي، واكتمل تنزيل النسخة الكاملة الموثوقة'}
          </span>
        </div>
        <button
          onClick={installUpdate}
          className="px-4 py-1.5 rounded-xl bg-white text-emerald-700 font-bold text-xs shadow hover:bg-emerald-50 transition-colors"
        >
          {t.actions.restartAndInstall}
        </button>
      </div>
    )
  }

  return null
}
