import React, { useEffect, useState } from 'react'
import {
  BookOpen,
  CalendarDays,
  ChartNoAxesColumn,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Home,
  Info,
  Maximize2,
  Minimize2,
  Minus,
  Settings2,
  X
} from 'lucide-react'
import { useApp, AppTab } from '../context/AppContext'
import mark from '../assets/wird-mark.svg'

const navItems: { tab: AppTab; label: string; icon: React.ElementType }[] = [
  { tab: 'home', label: 'الرئيسية', icon: Home },
  { tab: 'prayer', label: 'مواقيت الصلاة', icon: CalendarDays },
  { tab: 'tasks', label: 'الأذكار والورد', icon: BookOpen },
  { tab: 'focus', label: 'جلسات التفرّغ', icon: Clock3 },
  { tab: 'history', label: 'السجل', icon: ChartNoAxesColumn },
  { tab: 'settings', label: 'الإعدادات', icon: Settings2 },
  { tab: 'about', label: 'حول التطبيق', icon: Info }
]

export const TitleBar: React.FC = () => {
  const [maximized, setMaximized] = useState(false)

  return (
    <header className="wird-titlebar" dir="ltr">
      <div className="wird-titlebar-brand">
        <img src={mark} alt="" />
        <span>وِرد</span>
      </div>
      <div className="wird-window-actions">
        <button
          type="button"
          aria-label="تصغير النافذة"
          title="تصغير"
          onClick={() => window.wirdApi.minimizeWindow()}
        >
          <Minus size={16} />
        </button>
        <button
          type="button"
          aria-label={maximized ? 'استعادة النافذة' : 'تكبير النافذة'}
          title={maximized ? 'استعادة' : 'تكبير'}
          onClick={async () => {
            const isMax = await window.wirdApi.toggleMaximizeWindow()
            setMaximized(isMax)
          }}
        >
          {maximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
        </button>
        <button
          type="button"
          className="close"
          aria-label="إغلاق النافذة إلى شريط النظام"
          title="إغلاق إلى شريط النظام"
          onClick={() => window.wirdApi.closeWindow()}
        >
          <X size={16} />
        </button>
      </div>
    </header>
  )
}

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, storeData } = useApp()
  const [collapsed, setCollapsed] = useState(false)
  const [online, setOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true)

  useEffect(() => {
    const refresh = () => setOnline(navigator.onLine)
    window.addEventListener('online', refresh)
    window.addEventListener('offline', refresh)
    return () => {
      window.removeEventListener('online', refresh)
      window.removeEventListener('offline', refresh)
    }
  }, [])

  const adhanActive =
    !!storeData?.settings?.prayerAudioFile &&
    Object.values(storeData.settings.prayerEnabled || {}).some(Boolean)

  return (
    <aside className={`wird-sidebar ${collapsed ? 'collapsed' : ''}`} aria-label="التنقل الرئيسي">
      {/* 4. Top Brand & Logo */}
      <div className="wird-sidebar-top">
        <div className="wird-brand">
          <img src={mark} alt="شعار وِرد" />
          <div className="wird-brand-copy">
            <strong>وِرد</strong>
            <span>مساحة للسكينة</span>
          </div>
        </div>
        <button
          type="button"
          className="wird-collapse"
          aria-label={collapsed ? 'توسيع الشريط الجانبي' : 'طي الشريط الجانبي'}
          title={collapsed ? 'توسيع الشريط' : 'طي الشريط'}
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>

      {/* Navigation items in strict specified order */}
      <nav className="wird-sidebar-nav">
        {navItems.map(({ tab, label, icon: Icon }) => (
          <button
            key={tab}
            type="button"
            className={`wird-nav-item ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
            aria-current={activeTab === tab ? 'page' : undefined}
            title={label}
          >
            <Icon size={19} strokeWidth={1.8} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      {/* Bottom status indicators */}
      <div className="wird-sidebar-bottom">
        <div className="wird-sidebar-status">
          <CheckCircle2 size={17} />
          <span>{adhanActive ? 'الأذان مفعّل' : 'لم يُحدّد ملف أذان'}</span>
        </div>
        <div className="wird-sidebar-status">
          <span className={`wird-status-dot ${online ? 'online' : ''}`} />
          <span>{online ? 'اتصال الشبكة متاح' : 'غير متصل بالشبكة'}</span>
        </div>
      </div>
    </aside>
  )
}
