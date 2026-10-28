import { contextBridge, ipcRenderer } from 'electron'
import { IPC_CHANNELS } from '../shared/constants'
import {
  AppSettings,
  ImportValidationResult,
  SystemStatus,
  TaskDefinition,
  UpdateStatus,
  WirdStoreData
} from '../shared/types'

export const wirdApi = {
  // Store & Settings
  getStoreData: (): Promise<WirdStoreData> => ipcRenderer.invoke(IPC_CHANNELS.GET_STORE_DATA),
  updateSettings: (partial: Partial<AppSettings>): Promise<WirdStoreData> =>
    ipcRenderer.invoke(IPC_CHANNELS.UPDATE_SETTINGS, partial),
  updateTask: (taskId: string, partial: Partial<TaskDefinition>): Promise<WirdStoreData> =>
    ipcRenderer.invoke(IPC_CHANNELS.UPDATE_TASK, taskId, partial),
  resetTasks: (): Promise<WirdStoreData> => ipcRenderer.invoke(IPC_CHANNELS.RESET_TASKS),

  // Task Actions
  completeTask: (
    occurrenceId: string,
    taskId: string,
    cycleDate: string,
    completedLate: boolean
  ): Promise<WirdStoreData> =>
    ipcRenderer.invoke(IPC_CHANNELS.COMPLETE_TASK, occurrenceId, taskId, cycleDate, completedLate),
  undoCompleteTask: (occurrenceId: string): Promise<WirdStoreData> =>
    ipcRenderer.invoke(IPC_CHANNELS.UNDO_COMPLETE_TASK, occurrenceId),
  snoozeTask: (occurrenceId: string, minutes: number): Promise<WirdStoreData> =>
    ipcRenderer.invoke(IPC_CHANNELS.SNOOZE_TASK, occurrenceId, minutes),
  pauseReminders: (durationMinutes: number): Promise<WirdStoreData> =>
    ipcRenderer.invoke(IPC_CHANNELS.PAUSE_REMINDERS, durationMinutes),
  resumeReminders: (): Promise<WirdStoreData> => ipcRenderer.invoke(IPC_CHANNELS.RESUME_REMINDERS),

  // Backup & Import
  exportData: (): Promise<string> => ipcRenderer.invoke(IPC_CHANNELS.EXPORT_DATA),
  validateImportData: (jsonString: string): Promise<ImportValidationResult> =>
    ipcRenderer.invoke(IPC_CHANNELS.VALIDATE_IMPORT_DATA, jsonString),
  importData: (jsonString: string): Promise<boolean> =>
    ipcRenderer.invoke(IPC_CHANNELS.IMPORT_DATA, jsonString),

  // System
  getSystemStatus: (): Promise<SystemStatus> => ipcRenderer.invoke(IPC_CHANNELS.GET_SYSTEM_STATUS),
  setAutoStart: (enable: boolean): Promise<boolean> =>
    ipcRenderer.invoke(IPC_CHANNELS.SET_AUTO_START, enable),
  testNotification: (): Promise<boolean> => ipcRenderer.invoke(IPC_CHANNELS.TEST_NOTIFICATION),
  minimizeWindow: (): Promise<void> => ipcRenderer.invoke(IPC_CHANNELS.MINIMIZE_WINDOW),
  closeWindow: (): Promise<void> => ipcRenderer.invoke(IPC_CHANNELS.CLOSE_WINDOW),
  quitApp: (): Promise<void> => ipcRenderer.invoke(IPC_CHANNELS.QUIT_APP),
  openExternalUrl: (url: string): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.OPEN_EXTERNAL_URL, url),

  // Updates
  checkForUpdates: (): Promise<UpdateStatus> => ipcRenderer.invoke(IPC_CHANNELS.CHECK_FOR_UPDATES),
  downloadUpdate: (): Promise<void> => ipcRenderer.invoke(IPC_CHANNELS.DOWNLOAD_UPDATE),
  installUpdate: (): Promise<void> => ipcRenderer.invoke(IPC_CHANNELS.INSTALL_UPDATE),
  getUpdateStatus: (): Promise<UpdateStatus> => ipcRenderer.invoke(IPC_CHANNELS.GET_UPDATE_STATUS),

  // Push Event Subscriptions
  onStoreChanged: (callback: (data: WirdStoreData) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, data: WirdStoreData) => callback(data)
    ipcRenderer.on(IPC_CHANNELS.EVENT_STORE_CHANGED, handler)
    return () => ipcRenderer.removeListener(IPC_CHANNELS.EVENT_STORE_CHANGED, handler)
  },
  onUpdateStatusChanged: (callback: (status: UpdateStatus) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, status: UpdateStatus) => callback(status)
    ipcRenderer.on(IPC_CHANNELS.EVENT_UPDATE_STATUS_CHANGED, handler)
    return () => ipcRenderer.removeListener(IPC_CHANNELS.EVENT_UPDATE_STATUS_CHANGED, handler)
  },
  onTaskStatusChanged: (
    callback: (event: { focusTaskId?: string; tab?: string }) => void
  ): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, payload: { focusTaskId?: string; tab?: string }) =>
      callback(payload)
    ipcRenderer.on(IPC_CHANNELS.EVENT_TASK_STATUS_CHANGED, handler)
    return () => ipcRenderer.removeListener(IPC_CHANNELS.EVENT_TASK_STATUS_CHANGED, handler)
  }
}

export type WirdApi = typeof wirdApi

contextBridge.exposeInMainWorld('wirdApi', wirdApi)
