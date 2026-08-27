import { addMonths, differenceInCalendarDays, differenceInCalendarMonths, isSameDay } from 'date-fns'

/**
 * Whole months elapsed since `start`, anchored to `start`'s day-of-month.
 * Uses date-fns `addMonths` (which clamps to the last day of a shorter
 * month, e.g. Jan 31 + 1 month = Feb 28/29) so month-length and leap-year
 * differences are handled correctly rather than via a naive calendar diff.
 */
export function monthsElapsed(start: Date, now: Date = new Date()): number {
  let months = differenceInCalendarMonths(now, start)
  if (months < 0) return 0
  if (addMonths(start, months) > now) months -= 1
  return Math.max(0, months)
}

export interface CurrentAnniversaryInfo {
  monthNumber: number
  date: Date
  isToday: boolean
}

/** The most recently reached monthly milestone (the "current" anniversary). */
export function getCurrentAnniversary(start: Date, now: Date = new Date()): CurrentAnniversaryInfo {
  const monthNumber = monthsElapsed(start, now)
  const date = addMonths(start, monthNumber)
  return { monthNumber, date, isToday: isSameDay(date, now) }
}

export interface NextAnniversaryInfo {
  monthNumber: number
  date: Date
  daysUntil: number
}

/** The next upcoming monthly anniversary (strictly after `now`, unless it is today). */
export function getNextAnniversary(start: Date, now: Date = new Date()): NextAnniversaryInfo {
  const current = getCurrentAnniversary(start, now)
  const monthNumber = current.isToday ? current.monthNumber : current.monthNumber + 1
  const date = current.isToday ? current.date : addMonths(start, current.monthNumber + 1)
  return { monthNumber, date, daysUntil: Math.max(0, differenceInCalendarDays(date, now)) }
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
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr
  return `${date.getDate()} ${THAI_MONTHS[date.getMonth()]} ${date.getFullYear() + 543}`
}

export function formatShortDate(dateStr: string | Date): string {
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr
  return `${date.getDate()} ${THAI_MONTHS_SHORT[date.getMonth()]} ${date.getFullYear() + 543}`
}

export function formatDotDate(dateStr: string | Date): string {
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr
  const dd = String(date.getDate()).padStart(2, '0')
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  return `${dd}.${mm}.${date.getFullYear() + 543}`
}
