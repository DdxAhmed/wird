import {
  Clock,
  TaskDefinition,
  TaskOccurrenceInfo,
  TaskStatus,
  WirdStoreData
} from './types'

export const systemClock: Clock = {
  now: () => Date.now()
}

export function parseTime(timeStr: string): { hours: number; minutes: number } {
  const parts = timeStr.split(':')
  const hours = parseInt(parts[0] || '0', 10)
  const minutes = parseInt(parts[1] || '0', 10)
  return {
    hours: isNaN(hours) ? 0 : Math.min(23, Math.max(0, hours)),
    minutes: isNaN(minutes) ? 0 : Math.min(59, Math.max(0, minutes))
  }
}

export function formatLocalDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day, 0, 0, 0, 0)
}

/**
 * Creates a Date on the same calendar day as targetDate with given HH:mm
 */
export function setTimeOnDate(baseDate: Date, timeStr: string): Date {
  const { hours, minutes } = parseTime(timeStr)
  const d = new Date(baseDate.getTime())
  d.setHours(hours, minutes, 0, 0)
  return d
}

/**
 * Computes window boundaries and cycle date for a task given a current timestamp.
 * Handles both standard same-day windows and overnight windows (e.g. 21:00 to 02:00).
 */
export function calculateTaskWindow(
  task: TaskDefinition,
  nowTimestamp: number
): {
  cycleDate: string
  windowStart: number
  windowEnd: number
  isOvernight: boolean
} {
  const nowDate = new Date(nowTimestamp)
  const { hours: startH, minutes: startM } = parseTime(task.startTime)
  const { hours: endH, minutes: endM } = parseTime(task.endTime)

  const isOvernight = startH > endH || (startH === endH && startM > endM)

  if (!isOvernight) {
    // Standard window: both start and end are on the same calendar day
    const startDate = setTimeOnDate(nowDate, task.startTime)
    const endDate = setTimeOnDate(nowDate, task.endTime)
    const cycleDate = formatLocalDate(nowDate)
    return {
      cycleDate,
      windowStart: startDate.getTime(),
      windowEnd: endDate.getTime(),
      isOvernight: false
    }
  }

  // Overnight window: e.g. 21:00 to 02:00
  // Check if current time is past midnight but before endTime
  const currentMinutes = nowDate.getHours() * 60 + nowDate.getMinutes()
  const endMinutes = endH * 60 + endM

  if (currentMinutes < endMinutes) {
    // We are in the morning part of the cycle that started yesterday evening
    const yesterday = new Date(nowDate.getTime())
    yesterday.setDate(yesterday.getDate() - 1)

    const cycleDate = formatLocalDate(yesterday)
    const startDate = setTimeOnDate(yesterday, task.startTime)
    const endDate = setTimeOnDate(nowDate, task.endTime)

    return {
      cycleDate,
      windowStart: startDate.getTime(),
      windowEnd: endDate.getTime(),
      isOvernight: true
    }
  }

  // Otherwise, the cycle starts today evening and ends tomorrow morning
  const tomorrow = new Date(nowDate.getTime())
  tomorrow.setDate(tomorrow.getDate() + 1)

  const cycleDate = formatLocalDate(nowDate)
  const startDate = setTimeOnDate(nowDate, task.startTime)
  const endDate = setTimeOnDate(tomorrow, task.endTime)

  return {
    cycleDate,
    windowStart: startDate.getTime(),
    windowEnd: endDate.getTime(),
    isOvernight: true
  }
}

/**
 * Returns complete occurrence info for a task at the current time.
 */
export function getTaskOccurrence(
  task: TaskDefinition,
  store: Partial<WirdStoreData>,
  clock: Clock = systemClock
): TaskOccurrenceInfo {
  const now = clock.now()
  const { cycleDate, windowStart, windowEnd, isOvernight } = calculateTaskWindow(task, now)
  const occurrenceId = `${task.id}:${cycleDate}`

  const completionRecord = store.completions?.[occurrenceId]
  const snoozedUntil = store.snoozes?.[occurrenceId]

  let status: TaskStatus = 'upcoming'

  if (completionRecord) {
    status = 'completed'
  } else if (!task.enabled) {
    status = 'upcoming'
  } else {
    // Check if task is scheduled for this cycle day of week
    const cycleDateObj = parseLocalDate(cycleDate)
    const dayOfWeek = cycleDateObj.getDay()
    const isDayScheduled = task.daysOfWeek.includes(dayOfWeek)

    if (!isDayScheduled) {
      status = 'upcoming'
    } else if (now < windowStart) {
      status = 'upcoming'
    } else if (now > windowEnd) {
      status = 'expired'
    } else {
      // Within window
      if (snoozedUntil && snoozedUntil > now) {
        status = 'snoozed'
      } else {
        status = 'due'
      }
    }
  }

  // Calculate next reminder time
  let nextReminderTime: number | null = null

  if (status === 'completed' || status === 'expired' || !task.enabled) {
    nextReminderTime = null
  } else if (status === 'upcoming') {
    nextReminderTime = windowStart
  } else if (status === 'snoozed') {
    nextReminderTime = snoozedUntil || null
  } else if (status === 'due') {
    const lastNotified = store.lastNotified?.[occurrenceId] || 0
    const intervalMs = Math.max(1, task.repeatIntervalMinutes) * 60 * 1000

    if (lastNotified === 0) {
      // Never notified yet in this window -> due immediately
      nextReminderTime = Math.min(now, windowStart)
    } else {
      const nextDue = lastNotified + intervalMs
      if (nextDue <= windowEnd) {
        nextReminderTime = nextDue
      } else {
        // No more reminders fit inside this window
        nextReminderTime = null
      }
    }
  }

  return {
    task,
    occurrenceId,
    cycleDate,
    windowStart,
    windowEnd,
    status,
    completionRecord,
    snoozedUntil,
    nextReminderTime,
    isOvernight
  }
}

/**
 * Checks if a reminder should actually fire right now for this task.
 */
export function shouldTriggerReminder(
  taskInfo: TaskOccurrenceInfo,
  store: WirdStoreData,
  clock: Clock = systemClock
): boolean {
  const now = clock.now()

  // If reminders are paused globally
  if (store.settings.pausedUntil && store.settings.pausedUntil > now) {
    return false
  }

  // Must be enabled
  if (!taskInfo.task.enabled) {
    return false
  }

  // Must be currently inside the window
  if (now < taskInfo.windowStart || now > taskInfo.windowEnd) {
    return false
  }

  // Must not be completed
  if (taskInfo.status === 'completed') {
    return false
  }

  // If snoozed and snooze period has not elapsed
  if (taskInfo.snoozedUntil && taskInfo.snoozedUntil > now) {
    return false
  }

  const lastNotified = store.lastNotified[taskInfo.occurrenceId] || 0
  const intervalMs = Math.max(1, taskInfo.task.repeatIntervalMinutes) * 60 * 1000

  // If never notified yet in this window, trigger immediately
  if (lastNotified === 0) {
    return true
  }

  // If last notification was within repeat interval, don't trigger yet
  if (now - lastNotified < intervalMs) {
    return false
  }

  return true
}

/**
 * Returns all tasks that are currently due for notification.
 */
export function getDueTasksForNotification(
  store: WirdStoreData,
  clock: Clock = systemClock
): TaskOccurrenceInfo[] {
  const dueTasks: TaskOccurrenceInfo[] = []

  for (const task of store.tasks) {
    const info = getTaskOccurrence(task, store, clock)
    if (shouldTriggerReminder(info, store, clock)) {
      dueTasks.push(info)
    }
  }

  return dueTasks
}

/**
 * Generates an occurrence ID deterministically.
 */
export function getOccurrenceId(taskId: string, cycleDate: string): string {
  return `${taskId}:${cycleDate}`
}
