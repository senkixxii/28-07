import { addMonths, differenceInCalendarDays, differenceInCalendarMonths, isSameDay } from 'date-fns'

// Thailand doesn't observe daylight saving, so a fixed +7h offset from UTC is
// always correct — no timezone database needed for this.
const THAI_OFFSET_MS = 7 * 60 * 60 * 1000

/**
 * A Date whose *local* Y/M/D/H/M/S match Thailand's wall-clock time for the
 * given instant, regardless of the visitor's own system timezone. Safe to
 * pass into date-fns's local-based calendar functions (addMonths,
 * differenceInCalendarMonths, isSameDay, differenceInCalendarDays) and into
 * native local getters for display.
 *
 * Its own `.getTime()` is NOT a real timestamp — never use it as a countdown
 * target or store it. Use `thaiMidnightInstant` to convert back.
 */
function toThaiWallClock(date: Date): Date {
  const shifted = new Date(date.getTime() + THAI_OFFSET_MS)
  return new Date(
    shifted.getUTCFullYear(),
    shifted.getUTCMonth(),
    shifted.getUTCDate(),
    shifted.getUTCHours(),
    shifted.getUTCMinutes(),
    shifted.getUTCSeconds(),
    shifted.getUTCMilliseconds(),
  )
}

/** The real instant for 00:00:00 Thailand time on the calendar date carried by `wallClock`. */
function thaiMidnightInstant(wallClock: Date): Date {
  return new Date(Date.UTC(wallClock.getFullYear(), wallClock.getMonth(), wallClock.getDate()) - THAI_OFFSET_MS)
}

/** Parses a date-only string (e.g. from a Postgres `date` column) as Thailand midnight, as a real instant. */
export function parseThaiDateOnly(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d) - THAI_OFFSET_MS)
}

/**
 * Today's calendar date in Thailand, as YYYY-MM-DD — for defaulting date
 * inputs. `new Date().toISOString().slice(0, 10)` would be wrong for ~7
 * hours a day (Thai midnight to 7am), since it reads the UTC date instead.
 */
export function todayThaiDateString(): string {
  const t = toThaiWallClock(new Date())
  const y = t.getFullYear()
  const m = String(t.getMonth() + 1).padStart(2, '0')
  const d = String(t.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * Whole months elapsed since `start`, anchored to `start`'s day-of-month, both
 * evaluated in Thailand time. Uses date-fns `addMonths` (which clamps to the
 * last day of a shorter month, e.g. Jan 31 + 1 month = Feb 28/29) so
 * month-length and leap-year differences are handled correctly.
 */
export function monthsElapsed(start: Date, now: Date = new Date()): number {
  const s = toThaiWallClock(start)
  const n = toThaiWallClock(now)
  let months = differenceInCalendarMonths(n, s)
  if (months < 0) return 0
  if (addMonths(s, months) > n) months -= 1
  return Math.max(0, months)
}

export interface CurrentAnniversaryInfo {
  monthNumber: number
  date: Date
  isToday: boolean
}

/** The most recently reached monthly milestone (the "current" anniversary), in Thailand time. */
export function getCurrentAnniversary(start: Date, now: Date = new Date()): CurrentAnniversaryInfo {
  const s = toThaiWallClock(start)
  const n = toThaiWallClock(now)
  const monthNumber = monthsElapsed(start, now)
  const wallClockDate = addMonths(s, monthNumber)
  return { monthNumber, date: thaiMidnightInstant(wallClockDate), isToday: isSameDay(wallClockDate, n) }
}

export interface NextAnniversaryInfo {
  monthNumber: number
  date: Date
  daysUntil: number
}

/** The next upcoming monthly anniversary (strictly after `now`, unless it is today), in Thailand time. */
export function getNextAnniversary(start: Date, now: Date = new Date()): NextAnniversaryInfo {
  const s = toThaiWallClock(start)
  const n = toThaiWallClock(now)
  const current = getCurrentAnniversary(start, now)
  const monthNumber = current.isToday ? current.monthNumber : current.monthNumber + 1
  const wallClockDate = current.isToday ? toThaiWallClock(current.date) : addMonths(s, monthNumber)
  return {
    monthNumber,
    date: thaiMidnightInstant(wallClockDate),
    daysUntil: Math.max(0, differenceInCalendarDays(wallClockDate, n)),
  }
}

const THAI_MONTHS = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
]
const THAI_MONTHS_SHORT = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.',
]

export function formatThaiDate(dateStr: string | Date): string {
  const date = toThaiWallClock(typeof dateStr === 'string' ? new Date(dateStr) : dateStr)
  return `${date.getDate()} ${THAI_MONTHS[date.getMonth()]} ${date.getFullYear() + 543}`
}

export function formatShortDate(dateStr: string | Date): string {
  const date = toThaiWallClock(typeof dateStr === 'string' ? new Date(dateStr) : dateStr)
  return `${date.getDate()} ${THAI_MONTHS_SHORT[date.getMonth()]} ${date.getFullYear() + 543}`
}

export function formatDotDate(dateStr: string | Date): string {
  const date = toThaiWallClock(typeof dateStr === 'string' ? new Date(dateStr) : dateStr)
  const dd = String(date.getDate()).padStart(2, '0')
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  return `${dd}.${mm}.${date.getFullYear() + 543}`
}
