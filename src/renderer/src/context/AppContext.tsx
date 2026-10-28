import React, { createContext, useContext, useEffect, useState } from 'react'
import {
  AppSettings,
  ImportValidationResult,
  SystemStatus,
  TaskDefinition,
  UpdateStatus,
  WirdStoreData
} from '@shared/types'

interface AppContextType {
  storeData: WirdStoreData | null
  loading: boolean
  systemStatus: SystemStatus | null
  updateStatus: UpdateStatus
  activeTab: 'home' | 'history' | 'settings' | 'about'
  highlightedTaskId: string | null
  toast: { text: string; type: 'success' | 'error' | 'info' } | null
  setActiveTab: (tab: 'home' | 'history' | 'settings' | 'about') => void
  setHighlightedTaskId: (id: string | null) => void
  showToast: (text: string, type?: 'success' | 'error' | 'info') => void
  hideToast: () => void

  // Actions
  completeTask: (occurrenceId: string, taskId: string, cycleDate: string, completedLate?: boolean) => Promise<void>
  undoCompleteTask: (occurrenceId: string) => Promise<void>
  snoozeTask: (occurrenceId: string, minutes: number) => Promise<void>
  updateSettings: (partial: Partial<AppSettings>) => Promise<void>
  updateTask: (taskId: string, partial: Partial<TaskDefinition>) => Promise<void>
  resetTasks: () => Promise<void>
  pauseReminders: (minutes: number) => Promise<void>
  resumeReminders: () => Promise<void>
  exportData: () => Promise<string>
  validateImport: (jsonString: string) => Promise<ImportValidationResult>
  importData: (jsonString: string) => Promise<boolean>
  testNotification: () => Promise<void>
  checkForUpdates: () => Promise<void>
  downloadUpdate: () => Promise<void>
  installUpdate: () => Promise<void>
  openExternalUrl: (url: string) => Promise<void>
}

const AppContext = createContext<AppContextType | null>(null)

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [storeData, setStoreData] = useState<WirdStoreData | null>(null)
  const [loading, setLoading] = useState(true)
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null)
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus>({ state: 'idle' })
  const [activeTab, setActiveTab] = useState<'home' | 'history' | 'settings' | 'about'>('home')
  const [highlightedTaskId, setHighlightedTaskId] = useState<string | null>(null)
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null)

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ text, type })
  }

  const hideToast = () => {
    setToast(null)
  }

  // Load initial data and subscribe to IPC events
  useEffect(() => {
    let unmounted = false

    const loadData = async () => {
      try {
        if (window.wirdApi) {
          const [data, status, initialUpdate] = await Promise.all([
            window.wirdApi.getStoreData(),
            window.wirdApi.getSystemStatus(),
            window.wirdApi.getUpdateStatus()
          ])

          if (!unmounted) {
            setStoreData(data)
            setSystemStatus(status)
            setUpdateStatus(initialUpdate)
            setLoading(false)
          }
        }
      } catch (err) {
        console.error('Failed to load initial Wird data:', err)
        setLoading(false)
      }
    }

    loadData()

    if (window.wirdApi) {
      const unsubStore = window.wirdApi.onStoreChanged((data: WirdStoreData) => {
        setStoreData(data)
      })

      const unsubUpdate = window.wirdApi.onUpdateStatusChanged((status: UpdateStatus) => {
        setUpdateStatus(status)
      })

      const unsubTask = window.wirdApi.onTaskStatusChanged((payload: { focusTaskId?: string; tab?: string }) => {
        if (payload.focusTaskId) {
          setHighlightedTaskId(payload.focusTaskId)
          setActiveTab('home')
        }
        if (payload.tab) {
          setActiveTab(payload.tab as 'home' | 'history' | 'settings' | 'about')
        }
      })

      return () => {
        unmounted = true
        unsubStore()
        unsubUpdate()
        unsubTask()
      }
    }

    return () => {
      unmounted = true
    }
  }, [])

  // Sync HTML direction and language
  useEffect(() => {
    if (!storeData) return
    const lang = storeData.settings.language || 'ar'
    document.documentElement.lang = lang
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'

    const theme = storeData.settings.theme
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else if (theme === 'light') {
      document.documentElement.classList.remove('dark')
    } else {
      // System default
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      if (prefersDark) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }, [storeData?.settings.language, storeData?.settings.theme])

  const completeTask = async (
    occurrenceId: string,
    taskId: string,
    cycleDate: string,
    completedLate = false
  ) => {
    if (!window.wirdApi) return
    const updated = await window.wirdApi.completeTask(occurrenceId, taskId, cycleDate, completedLate)
    setStoreData(updated)
  }

  const undoCompleteTask = async (occurrenceId: string) => {
    if (!window.wirdApi) return
    const updated = await window.wirdApi.undoCompleteTask(occurrenceId)
    setStoreData(updated)
  }

  const snoozeTask = async (occurrenceId: string, minutes: number) => {
    if (!window.wirdApi) return
    const updated = await window.wirdApi.snoozeTask(occurrenceId, minutes)
    setStoreData(updated)
  }

  const updateSettings = async (partial: Partial<AppSettings>) => {
    if (!window.wirdApi) return
    const updated = await window.wirdApi.updateSettings(partial)
    setStoreData(updated)
  }

  const updateTask = async (taskId: string, partial: Partial<TaskDefinition>) => {
    if (!window.wirdApi) return
    const updated = await window.wirdApi.updateTask(taskId, partial)
    setStoreData(updated)
  }

  const resetTasks = async () => {
    if (!window.wirdApi) return
    const updated = await window.wirdApi.resetTasks()
    setStoreData(updated)
  }

  const pauseReminders = async (minutes: number) => {
    if (!window.wirdApi) return
    const updated = await window.wirdApi.pauseReminders(minutes)
    setStoreData(updated)
  }

  const resumeReminders = async () => {
    if (!window.wirdApi) return
    const updated = await window.wirdApi.resumeReminders()
    setStoreData(updated)
  }

  const exportData = async () => {
    if (!window.wirdApi) return ''
    return window.wirdApi.exportData()
  }

  const validateImport = async (jsonString: string) => {
    if (!window.wirdApi) return { valid: false, error: 'API not available' }
    return window.wirdApi.validateImportData(jsonString)
  }

  const importData = async (jsonString: string) => {
    if (!window.wirdApi) return false
    const success = await window.wirdApi.importData(jsonString)
    if (success) {
      const refreshed = await window.wirdApi.getStoreData()
      setStoreData(refreshed)
    }
    return success
  }

  const testNotification = async () => {
    if (!window.wirdApi) return
    await window.wirdApi.testNotification()
  }

  const checkForUpdates = async () => {
    if (!window.wirdApi) return
    const status = await window.wirdApi.checkForUpdates()
    setUpdateStatus(status)
  }

  const downloadUpdate = async () => {
    if (!window.wirdApi) return
    await window.wirdApi.downloadUpdate()
  }

  const installUpdate = async () => {
    if (!window.wirdApi) return
    await window.wirdApi.installUpdate()
  }

  const openExternalUrl = async (url: string) => {
    if (!window.wirdApi) return
    await window.wirdApi.openExternalUrl(url)
  }

  return (
    <AppContext.Provider
      value={{
        storeData,
        loading,
        systemStatus,
        updateStatus,
        activeTab,
        highlightedTaskId,
        toast,
        setActiveTab,
        setHighlightedTaskId,
        showToast,
        hideToast,
        completeTask,
        undoCompleteTask,
        snoozeTask,
        updateSettings,
        updateTask,
        resetTasks,
        pauseReminders,
        resumeReminders,
        exportData,
        validateImport,
        importData,
        testNotification,
        checkForUpdates,
        downloadUpdate,
        installUpdate,
        openExternalUrl
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp must be used within an AppProvider')
  return context
}
