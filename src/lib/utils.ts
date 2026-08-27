import { differenceInCalendarDays, differenceInCalendarMonths, differenceInCalendarYears } from 'date-fns'

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ')
}

export interface RelationshipDuration {
  years: number
  months: number
  days: number
  totalDays: number
}

/** Breaks down the time since `startDate` into whole years / months / days, cumulatively. */
export function getRelationshipDuration(startDate: Date, now: Date = new Date()): RelationshipDuration {
  const totalDays = Math.max(0, differenceInCalendarDays(now, startDate))
  const years = Math.max(0, differenceInCalendarYears(now, startDate))

  const afterYears = new Date(startDate)
  afterYears.setFullYear(afterYears.getFullYear() + years)
  const months = Math.max(0, differenceInCalendarMonths(now, afterYears))

  const afterMonths = new Date(afterYears)
  afterMonths.setMonth(afterMonths.getMonth() + months)
  const days = Math.max(0, differenceInCalendarDays(now, afterMonths))

  return { years, months, days, totalDays }
}

/** The next monthly anniversary date on/after `now`, based on the day-of-month of `startDate`. */
export function getNextAnniversary(startDate: Date, now: Date = new Date()): { date: Date; daysUntil: number } {
  const monthsElapsed = Math.max(0, differenceInCalendarMonths(now, startDate))
  let candidate = addMonthsSafe(startDate, monthsElapsed)

  if (differenceInCalendarDays(candidate, now) < 0) {
    candidate = addMonthsSafe(startDate, monthsElapsed + 1)
  }

  return { date: candidate, daysUntil: differenceInCalendarDays(candidate, now) }
}

function addMonthsSafe(date: Date, months: number): Date {
  const d = new Date(date)
  d.setMonth(d.getMonth() + months)
  return d
}

export function formatThaiDate(dateStr: string | Date): string {
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr
  const months = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
  ]
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear() + 543}`
}

export function formatShortDate(dateStr: string | Date): string {
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr
  const months = [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
    'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.',
  ]
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear() + 543}`
}

/** Suggests an anniversary label (e.g. "ครบรอบ 6 เดือน") from a start date + target date. */
export function suggestAnniversaryLabel(startDate: Date, targetDate: Date) {
  const months = Math.max(0, differenceInCalendarMonths(targetDate, startDate))
  if (months > 0 && months % 12 === 0) {
    const years = months / 12
    return { title: `ครบรอบ ${years} ปี`, monthNumber: months, yearNumber: years }
  }
  return { title: `ครบรอบ ${months} เดือน`, monthNumber: months, yearNumber: null }
}

export function slugifyFilename(name: string): string {
  const ext = name.includes('.') ? name.slice(name.lastIndexOf('.')) : ''
  const base = name
    .slice(0, name.length - ext.length)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  const random = Math.random().toString(36).slice(2, 8)
  return `${base || 'image'}-${Date.now()}-${random}${ext.toLowerCase()}`
}
