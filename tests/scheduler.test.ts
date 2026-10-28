import { describe, expect, it } from 'vitest'
import {
  calculateTaskWindow,
  formatLocalDate,
  getOccurrenceId,
  getTaskOccurrence,
  parseTime,
  shouldTriggerReminder
} from '../src/shared/scheduler'
import { Clock, TaskDefinition, WirdStoreData } from '../src/shared/types'

class MockClock implements Clock {
  private currentTime: number

  constructor(initialIsoOrMs: string | number) {
    this.currentTime = typeof initialIsoOrMs === 'string' ? new Date(initialIsoOrMs).getTime() : initialIsoOrMs
  }

  now(): number {
    return this.currentTime
  }

  setTime(isoOrMs: string | number): void {
    this.currentTime = typeof isoOrMs === 'string' ? new Date(isoOrMs).getTime() : isoOrMs
  }

  advanceMinutes(mins: number): void {
    this.currentTime += mins * 60 * 1000
  }
}

describe('Scheduler & Task Occurrence Logic', () => {
  const sampleMorningTask: TaskDefinition = {
    id: 'morning-adhkar',
    name: { ar: 'أذكار الصباح', en: 'Morning Adhkar' },
    enabled: true,
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    startTime: '05:30',
    endTime: '11:00',
    repeatIntervalMinutes: 15,
    snoozeDurationMinutes: 15
  }

  const sampleOvernightTask: TaskDefinition = {
    id: 'night-prayer',
    name: { ar: 'قيام الليل', en: 'Night Prayer' },
    enabled: true,
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    startTime: '22:00',
    endTime: '02:00',
    repeatIntervalMinutes: 20,
    snoozeDurationMinutes: 15
  }

  const createEmptyStore = (): WirdStoreData => ({
    schemaVersion: 1,
    settings: {
      schemaVersion: 1,
      theme: 'system',
      language: 'ar',
      autoStartOnBoot: true,
      startMinimizedToTray: true,
      hasCompletedOnboarding: true,
      soundEnabled: true,
      pausedUntil: null,
      autoCheckUpdates: true,
      updateChannel: 'stable',
      lastUpdateCheck: null
    },
    tasks: [sampleMorningTask, sampleOvernightTask],
    completions: {},
    snoozes: {},
    lastNotified: {}
  })

  it('correctly parses 24h time strings', () => {
    expect(parseTime('05:30')).toEqual({ hours: 5, minutes: 30 })
    expect(parseTime('23:59')).toEqual({ hours: 23, minutes: 59 })
    expect(parseTime('00:00')).toEqual({ hours: 0, minutes: 0 })
    expect(parseTime('invalid')).toEqual({ hours: 0, minutes: 0 })
  })

  it('evaluates upcoming status before window start', () => {
    // 04:00 AM on 2026-10-28
    const clock = new MockClock('2026-10-28T04:00:00')
    const store = createEmptyStore()

    const occ = getTaskOccurrence(sampleMorningTask, store, clock)
    expect(occ.status).toBe('upcoming')
    expect(shouldTriggerReminder(occ, store, clock)).toBe(false)
  })

  it('evaluates due status inside reminder window and triggers initial reminder', () => {
    // 06:00 AM on 2026-10-28
    const clock = new MockClock('2026-10-28T06:00:00')
    const store = createEmptyStore()

    const occ = getTaskOccurrence(sampleMorningTask, store, clock)
    expect(occ.status).toBe('due')
    expect(shouldTriggerReminder(occ, store, clock)).toBe(true)
  })

  it('throttles repeated reminders according to repeatIntervalMinutes', () => {
    const clock = new MockClock('2026-10-28T06:00:00')
    const store = createEmptyStore()

    const occ = getTaskOccurrence(sampleMorningTask, store, clock)
    expect(shouldTriggerReminder(occ, store, clock)).toBe(true)

    // Record notification at 06:00:00
    store.lastNotified[occ.occurrenceId] = clock.now()

    // 5 minutes later: should NOT trigger (interval is 15 min)
    clock.advanceMinutes(5)
    expect(shouldTriggerReminder(occ, store, clock)).toBe(false)

    // 15 minutes later: should trigger again!
    clock.advanceMinutes(10) // 15 mins total
    expect(shouldTriggerReminder(occ, store, clock)).toBe(true)
  })

  it('supports snooze and suspends reminders until snooze expires', () => {
    const clock = new MockClock('2026-10-28T06:00:00')
    const store = createEmptyStore()

    const occ = getTaskOccurrence(sampleMorningTask, store, clock)
    // Snooze for 15 minutes
    store.snoozes[occ.occurrenceId] = clock.now() + 15 * 60 * 1000

    // Re-evaluate
    const snoozedOcc = getTaskOccurrence(sampleMorningTask, store, clock)
    expect(snoozedOcc.status).toBe('snoozed')
    expect(shouldTriggerReminder(snoozedOcc, store, clock)).toBe(false)

    // Advance 14 minutes: still snoozed
    clock.advanceMinutes(14)
    expect(getTaskOccurrence(sampleMorningTask, store, clock).status).toBe('snoozed')
    expect(shouldTriggerReminder(snoozedOcc, store, clock)).toBe(false)

    // Advance 2 more minutes (16 min total): snooze expired, becomes due again
    clock.advanceMinutes(2)
    const dueAgain = getTaskOccurrence(sampleMorningTask, store, clock)
    expect(dueAgain.status).toBe('due')
    expect(shouldTriggerReminder(dueAgain, store, clock)).toBe(true)
  })

  it('marks task as completed and stops reminders for that cycle', () => {
    const clock = new MockClock('2026-10-28T06:30:00')
    const store = createEmptyStore()

    const occ = getTaskOccurrence(sampleMorningTask, store, clock)
    expect(occ.status).toBe('due')

    // Mark completed
    store.completions[occ.occurrenceId] = {
      occurrenceId: occ.occurrenceId,
      taskId: sampleMorningTask.id,
      cycleDate: occ.cycleDate,
      completedAt: clock.now(),
      completedLate: false
    }

    const completedOcc = getTaskOccurrence(sampleMorningTask, store, clock)
    expect(completedOcc.status).toBe('completed')
    expect(shouldTriggerReminder(completedOcc, store, clock)).toBe(false)

    // Advance time: remains completed for the entire day
    clock.advanceMinutes(120)
    expect(getTaskOccurrence(sampleMorningTask, store, clock).status).toBe('completed')
  })

  it('supports undoing completion and reverts status back to due/expired', () => {
    const clock = new MockClock('2026-10-28T07:00:00')
    const store = createEmptyStore()

    const occ = getTaskOccurrence(sampleMorningTask, store, clock)
    store.completions[occ.occurrenceId] = {
      occurrenceId: occ.occurrenceId,
      taskId: sampleMorningTask.id,
      cycleDate: occ.cycleDate,
      completedAt: clock.now(),
      completedLate: false
    }

    expect(getTaskOccurrence(sampleMorningTask, store, clock).status).toBe('completed')

    // Undo completion
    delete store.completions[occ.occurrenceId]
    expect(getTaskOccurrence(sampleMorningTask, store, clock).status).toBe('due')
  })

  it('handles expired state when current time is past windowEnd', () => {
    // 12:00 PM on 2026-10-28 (window ended at 11:00 AM)
    const clock = new MockClock('2026-10-28T12:00:00')
    const store = createEmptyStore()

    const occ = getTaskOccurrence(sampleMorningTask, store, clock)
    expect(occ.status).toBe('expired')
    expect(shouldTriggerReminder(occ, store, clock)).toBe(false)
  })

  it('allows late completion after expiration without reviving reminders', () => {
    const clock = new MockClock('2026-10-28T13:00:00')
    const store = createEmptyStore()

    const occ = getTaskOccurrence(sampleMorningTask, store, clock)
    expect(occ.status).toBe('expired')

    // Complete late
    store.completions[occ.occurrenceId] = {
      occurrenceId: occ.occurrenceId,
      taskId: sampleMorningTask.id,
      cycleDate: occ.cycleDate,
      completedAt: clock.now(),
      completedLate: true
    }

    const reevaluated = getTaskOccurrence(sampleMorningTask, store, clock)
    expect(reevaluated.status).toBe('completed')
    expect(reevaluated.completionRecord?.completedLate).toBe(true)
    expect(shouldTriggerReminder(reevaluated, store, clock)).toBe(false)
  })

  describe('Overnight / Cross-Midnight Windows', () => {
    it('accurately identifies overnight cycles before midnight and after midnight', () => {
      // 23:00 on 2026-10-28
      const clockEvening = new MockClock('2026-10-28T23:00:00')
      const winEvening = calculateTaskWindow(sampleOvernightTask, clockEvening.now())
      expect(winEvening.isOvernight).toBe(true)
      expect(winEvening.cycleDate).toBe('2026-10-28')

      // 01:30 on 2026-10-29 (past midnight, before 02:00)
      const clockMorning = new MockClock('2026-10-29T01:30:00')
      const winMorning = calculateTaskWindow(sampleOvernightTask, clockMorning.now())
      expect(winMorning.isOvernight).toBe(true)
      // Must attribute to cycle that started yesterday!
      expect(winMorning.cycleDate).toBe('2026-10-28')

      // Both must yield the EXACT same occurrenceId!
      const id1 = getOccurrenceId(sampleOvernightTask.id, winEvening.cycleDate)
      const id2 = getOccurrenceId(sampleOvernightTask.id, winMorning.cycleDate)
      expect(id1).toBe(id2)
    })

    it('keeps task completed past midnight for an overnight window', () => {
      const clock = new MockClock('2026-10-28T23:00:00')
      const store = createEmptyStore()

      const eveningOcc = getTaskOccurrence(sampleOvernightTask, store, clock)
      expect(eveningOcc.status).toBe('due')

      // Mark completed at 23:00
      store.completions[eveningOcc.occurrenceId] = {
        occurrenceId: eveningOcc.occurrenceId,
        taskId: sampleOvernightTask.id,
        cycleDate: eveningOcc.cycleDate,
        completedAt: clock.now(),
        completedLate: false
      }

      // Fast forward past midnight to 01:15 AM
      clock.setTime('2026-10-29T01:15:00')
      const morningOcc = getTaskOccurrence(sampleOvernightTask, store, clock)
      expect(morningOcc.occurrenceId).toBe(eveningOcc.occurrenceId)
      expect(morningOcc.status).toBe('completed')
      expect(shouldTriggerReminder(morningOcc, store, clock)).toBe(false)
    })

    it('expires overnight task after window ends (e.g. at 03:00)', () => {
      const clock = new MockClock('2026-10-29T03:00:00')
      const store = createEmptyStore()

      const occ = getTaskOccurrence(sampleOvernightTask, store, clock)
      // At 03:00, the next cycle starts today at 22:00
      expect(occ.cycleDate).toBe('2026-10-29')
      expect(occ.status).toBe('upcoming')
    })
  })

  describe('Pausing Reminders and Wake-from-sleep Simulation', () => {
    it('does not trigger notifications while reminders are paused', () => {
      const clock = new MockClock('2026-10-28T07:00:00')
      const store = createEmptyStore()

      const occ = getTaskOccurrence(sampleMorningTask, store, clock)
      expect(occ.status).toBe('due')
      expect(shouldTriggerReminder(occ, store, clock)).toBe(true)

      // Pause for 60 minutes
      store.settings.pausedUntil = clock.now() + 60 * 60 * 1000
      expect(shouldTriggerReminder(occ, store, clock)).toBe(false)

      // Advance 61 minutes
      clock.advanceMinutes(61)
      expect(shouldTriggerReminder(occ, store, clock)).toBe(true)
    })

    it('does not produce notification storm when waking up after window expired during sleep', () => {
      // Put to sleep at 04:00 (upcoming)
      const clock = new MockClock('2026-10-28T04:00:00')
      const store = createEmptyStore()

      // Machine was asleep until 14:00 (window expired at 11:00)
      clock.setTime('2026-10-28T14:00:00')

      const occ = getTaskOccurrence(sampleMorningTask, store, clock)
      expect(occ.status).toBe('expired')
      // Must NOT trigger notification backlog!
      expect(shouldTriggerReminder(occ, store, clock)).toBe(false)
    })
  })
})
