import type { BusinessHours } from '@/lib/types'

export type OpenStatus =
  | { state: 'open'; closesAt: string }
  | { state: 'closed'; opensAt?: string; opensDay?: string }
  | { state: 'unknown' }

const DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]

/**
 * Compute "Open now" status from a BusinessHours[] array.
 *
 * Pure function — takes an explicit `now` Date so it's deterministic in tests.
 * Treats hours strings as local time in the venue's implicit timezone (which
 * we don't track yet — venue is assumed to be in the user's browser TZ when
 * called client-side, which is acceptable for the AU-focused MVP).
 */
export function computeOpenStatus(hours: BusinessHours[], now: Date): OpenStatus {
  if (!hours || hours.length === 0) return { state: 'unknown' }

  const currentDayIdx = now.getDay() // 0 = Sunday
  const currentDayName = DAY_NAMES[currentDayIdx]
  const currentMinutes = now.getHours() * 60 + now.getMinutes()

  const today = hours.find((h) => h.day === currentDayName)

  if (today && !today.closed && today.open && today.close) {
    const openMin = parseHHMM(today.open)
    const closeMin = parseHHMM(today.close)
    if (openMin !== null && closeMin !== null) {
      // Handle overnight (e.g. 18:00 → 02:00)
      if (closeMin > openMin) {
        if (currentMinutes >= openMin && currentMinutes < closeMin) {
          return { state: 'open', closesAt: today.close }
        }
      } else {
        // Overnight wrap
        if (currentMinutes >= openMin || currentMinutes < closeMin) {
          return { state: 'open', closesAt: today.close }
        }
      }
    }
  }

  // Closed — find the next opening time within the next 7 days
  for (let i = 0; i < 7; i++) {
    const dayIdx = (currentDayIdx + i) % 7
    const dayName = DAY_NAMES[dayIdx]
    const day = hours.find((h) => h.day === dayName)
    if (!day || day.closed || !day.open) continue
    const openMin = parseHHMM(day.open)
    if (openMin === null) continue
    if (i === 0 && openMin <= currentMinutes) continue // already past today's opening
    return {
      state: 'closed',
      opensAt: day.open,
      opensDay: i === 0 ? 'today' : i === 1 ? 'tomorrow' : dayName,
    }
  }

  return { state: 'closed' }
}

function parseHHMM(s: string): number | null {
  const m = s.match(/^(\d{1,2}):(\d{2})$/)
  if (!m) return null
  const h = parseInt(m[1], 10)
  const min = parseInt(m[2], 10)
  if (h < 0 || h > 24 || min < 0 || min > 59) return null
  return h * 60 + min
}
