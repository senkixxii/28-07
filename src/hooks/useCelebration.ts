import { useCallback, useRef, useState } from 'react'

/** Flips a boolean true for a short window, re-triggerable, for one-shot celebration UI. */
export function useCelebration(durationMs = 1400) {
  const [show, setShow] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>()

  const celebrate = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setShow(false)
    requestAnimationFrame(() => {
      setShow(true)
      timeoutRef.current = setTimeout(() => setShow(false), durationMs)
    })
  }, [durationMs])

  return { show, celebrate }
}
