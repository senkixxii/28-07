import { useEffect, useState } from 'react'

export interface Countdown {
  days: number
  hours: number
  minutes: number
  seconds: number
  total: number
}

function diffToCountdown(targetMs: number, nowMs: number): Countdown {
  const total = Math.max(0, targetMs - nowMs)
  const days = Math.floor(total / (1000 * 60 * 60 * 24))
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24)
  const minutes = Math.floor((total / (1000 * 60)) % 60)
  const seconds = Math.floor((total / 1000) % 60)
  return { days, hours, minutes, seconds, total }
}

/** Ticking countdown to `target`, updated once a second. */
export function useCountdown(target: Date | null): Countdown {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!target) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [target])

  if (!target) return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 }
  return diffToCountdown(target.getTime(), now)
}

/** Re-renders on an interval so date-based displays stay fresh without a heavy timer. */
export function useNow(intervalMs = 60_000): Date {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])

  return now
}
