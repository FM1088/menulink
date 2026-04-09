import { describe, it, expect } from 'vitest'
import { computeOpenStatus } from './business-hours'
import type { BusinessHours } from './types'

const fullWeek: BusinessHours[] = [
  { day: 'Sunday', open: '11:00', close: '21:00', closed: false },
  { day: 'Monday', open: '11:00', close: '22:00', closed: false },
  { day: 'Tuesday', open: '11:00', close: '22:00', closed: false },
  { day: 'Wednesday', open: '11:00', close: '22:00', closed: false },
  { day: 'Thursday', open: '11:00', close: '22:00', closed: false },
  { day: 'Friday', open: '11:00', close: '23:00', closed: false },
  { day: 'Saturday', open: '11:00', close: '23:00', closed: false },
]

// Helper: build a Date for a specific weekday + time
function dateAt(dayIdx: number, hh: number, mm: number): Date {
  // 2026-04-05 = Sunday. Use it as anchor.
  const sunday = new Date(2026, 3, 5, hh, mm, 0, 0)
  sunday.setDate(sunday.getDate() + dayIdx)
  return sunday
}

describe('computeOpenStatus', () => {
  it('returns unknown if hours array is empty', () => {
    expect(computeOpenStatus([], new Date()).state).toBe('unknown')
  })

  it('open during business hours on a regular weekday', () => {
    const monday14h = dateAt(1, 14, 0)
    const result = computeOpenStatus(fullWeek, monday14h)
    expect(result.state).toBe('open')
    if (result.state === 'open') {
      expect(result.closesAt).toBe('22:00')
    }
  })

  it('closed before opening time', () => {
    const monday9h = dateAt(1, 9, 0)
    const result = computeOpenStatus(fullWeek, monday9h)
    expect(result.state).toBe('closed')
    if (result.state === 'closed') {
      expect(result.opensAt).toBe('11:00')
      expect(result.opensDay).toBe('today')
    }
  })

  it('closed after closing time, opens tomorrow', () => {
    const monday23h = dateAt(1, 23, 0)
    const result = computeOpenStatus(fullWeek, monday23h)
    expect(result.state).toBe('closed')
    if (result.state === 'closed') {
      expect(result.opensDay).toBe('tomorrow')
    }
  })

  it('handles a closed day (skips to next available)', () => {
    const monClosed: BusinessHours[] = [
      ...fullWeek.map((h) =>
        h.day === 'Monday' ? { ...h, closed: true } : h,
      ),
    ]
    const monday14h = dateAt(1, 14, 0)
    const result = computeOpenStatus(monClosed, monday14h)
    expect(result.state).toBe('closed')
    if (result.state === 'closed') {
      expect(result.opensDay).toBe('tomorrow')
    }
  })

  it('overnight hours wrap correctly: 1am Saturday is still "open" if Saturday lists 18:00-02:00', () => {
    const lateBar: BusinessHours[] = [
      { day: 'Friday', open: '18:00', close: '02:00', closed: false },
      { day: 'Saturday', open: '18:00', close: '02:00', closed: false },
      { day: 'Sunday', open: '00:00', close: '00:00', closed: true },
      { day: 'Monday', open: '00:00', close: '00:00', closed: true },
      { day: 'Tuesday', open: '00:00', close: '00:00', closed: true },
      { day: 'Wednesday', open: '00:00', close: '00:00', closed: true },
      { day: 'Thursday', open: '00:00', close: '00:00', closed: true },
    ]
    // 1 AM Saturday — within Saturday's overnight wrap window
    const sat1am = dateAt(6, 1, 0)
    const result = computeOpenStatus(lateBar, sat1am)
    expect(result.state).toBe('open')
  })

  it('handles overnight wrap on the same day correctly', () => {
    const overnight: BusinessHours[] = [
      { day: 'Saturday', open: '18:00', close: '02:00', closed: false },
      ...fullWeek.filter((h) => h.day !== 'Saturday'),
    ]
    // 11 PM Saturday — clearly within Saturday's 18:00-02:00 session
    const sat23h = dateAt(6, 23, 0)
    const result = computeOpenStatus(overnight, sat23h)
    expect(result.state).toBe('open')
  })

  it('rejects malformed time strings as not-open', () => {
    const broken: BusinessHours[] = [
      { day: 'Monday', open: 'invalid', close: '22:00', closed: false },
    ]
    const monday14h = dateAt(1, 14, 0)
    const result = computeOpenStatus(broken, monday14h)
    expect(result.state).toBe('closed')
  })
})
