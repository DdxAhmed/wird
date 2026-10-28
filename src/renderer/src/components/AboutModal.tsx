import React from 'react'
import { translations } from '@shared/i18n'
import { Language } from '@shared/types'
import { useApp } from '../context/AppContext'
import {
  ExternalLink,
  Github,
  Heart,
  HelpCircle,
  RefreshCw,
  Scale,
  ShieldCheck
} from 'lucide-react'

export const AboutModal: React.FC = () => {
  const { storeData, systemStatus, updateStatus, checkForUpdates, openExternalUrl } = useApp()

  if (!storeData) return null

  const lang = (storeData.settings.language || 'ar') as Language
  const t = translations[lang] || translations.ar

  const repoUrl = storeData.settings.githubRepoUrl || 'https://github.com/wird-app/wird'
  const issuesUrl = storeData.settings.issuesUrl || 'https://github.com/wird-app/wird/issues'
  const licenseUrl = storeData.settings.licenseUrl || 'https://github.com/wird-app/wird/blob/main/LICENSE'

  return (
    <div className="space-y-6 animate-fade-in pb-12 max-w-3xl mx-auto">
      {/* Calm Hero Card */}
      <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-emerald-600 dark:bg-emerald-500 text-white flex items-center justify-center font-bold text-3xl shadow-lg shadow-emerald-600/20">
            و
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {t.appName}
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-mono font-medium border border-emerald-200/50 dark:border-emerald-800/50">
                {t.about.version} {systemStatus?.appVersion || '1.0.0'}
              </span>
            </div>
          </div>
        </div>

        {/* Exact Specified Arabic Text */}
        <div className="space-y-4 text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line border-t border-slate-100 dark:border-slate-800/80 pt-6">
          {t.about.exactDescription}
        </div>
      </div>

      {/* Privacy & Network Connection Notice */}
      <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>الخصوصية والاتصال بالشبكة</span>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          {t.about.privacyNote}
        </p>
      </div>

      {/* Links & Actions Section */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Check Updates Button */}
          <button
            onClick={() => checkForUpdates()}
            disabled={updateStatus.state === 'checking'}
            className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 transition-colors text-xs font-medium text-slate-800 dark:text-slate-200 group"
          >
            <div className="flex items-center gap-2.5">
              <RefreshCw
                className={`w-4 h-4 text-emerald-600 dark:text-emerald-400 ${
                  updateStatus.state === 'checking' ? 'animate-spin' : ''
                }`}
              />
              <span>{t.actions.checkForUpdates}</span>
            </div>
            <span className="text-[11px] text-slate-400">
              {updateStatus.state === 'checking' ? t.settings.checkingUpdates : ''}
            </span>
          </button>

          {/* GitHub Repo */}
          <button
            onClick={() => openExternalUrl(repoUrl)}
            className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 transition-colors text-xs font-medium text-slate-800 dark:text-slate-200"
          >
            <div className="flex items-center gap-2.5">
              <Github className="w-4 h-4 text-slate-700 dark:text-slate-300" />
              <span>{t.actions.viewRepo}</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Report Issue */}
          <button
            onClick={() => openExternalUrl(issuesUrl)}
            className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 transition-colors text-xs font-medium text-slate-800 dark:text-slate-200"
          >
            <div className="flex items-center gap-2.5">
              <HelpCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>{t.actions.reportIssue}</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* License */}
          <button
            onClick={() => openExternalUrl(licenseUrl)}
            className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 transition-colors text-xs font-medium text-slate-800 dark:text-slate-200"
          >
            <div className="flex items-center gap-2.5">
              <Scale className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>{t.actions.viewLicense}</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Calm Footer Banner */}
      <div className="text-center py-6">
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
          {t.footerTagline}
        </p>
      </div>
    </div>
  )
}
