import React from 'react'
import { translations } from '@shared/i18n'
import { Language } from '@shared/types'
import { useApp } from '../context/AppContext'
import {
  CheckCircle,
  ExternalLink,
  Github,
  Heart,
  Info,
  Layers,
  MapPin,
  ShieldCheck,
  Sparkles
} from 'lucide-react'

export const AboutModal: React.FC = () => {
  const { storeData, systemStatus, openExternalUrl } = useApp()

  if (!storeData) return null

  const lang = (storeData.settings.language || 'ar') as Language
  const t = translations[lang] || translations.ar

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Hero Header */}
      <div className="p-8 rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white relative overflow-hidden shadow-xl shadow-emerald-900/20">
        <div className="relative z-10 space-y-3 max-w-xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold text-2xl shadow-inner">
              و
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">{t.appName}</h2>
              <span className="text-xs text-emerald-100 font-mono">
                v{systemStatus?.appVersion || '1.0.0'} • MIT License
              </span>
            </div>
          </div>

          <p className="text-sm text-emerald-50 leading-relaxed pt-1">
            {t.about.description}
          </p>

          <div className="flex items-center gap-3 pt-3">
            <button
              onClick={() => openExternalUrl('https://github.com/wird-app/wird')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold backdrop-blur-md transition-colors"
            >
              <Github className="w-4 h-4" />
              <span>{t.about.githubRepo}</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </button>
          </div>
        </div>

        {/* Decorative background circle */}
        <div className="absolute -left-12 -bottom-12 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />
      </div>

      {/* Core Principles */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>{t.about.principlesTitle}</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {t.about.principles.map((principle: string, idx: number) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 leading-relaxed"
            >
              {principle}
            </div>
          ))}
        </div>
      </div>

      {/* Future Roadmap */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>{t.about.roadmapTitle}</span>
        </h3>

        <div className="space-y-2.5">
          {t.about.roadmapItems.map((item: string, idx: number) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center gap-3 text-xs text-slate-700 dark:text-slate-300"
            >
              <div className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Open Source & Credits */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4 text-rose-500" />
          <span>مبني بحب وإتقان لخدمة كل مسلم ومسلمة. مفتوح المصدر لوجه الله تعالى.</span>
        </div>
        <div className="text-[11px] text-slate-400 font-mono">
          Electron • React • TypeScript • Vite
        </div>
      </div>
    </div>
  )
}
