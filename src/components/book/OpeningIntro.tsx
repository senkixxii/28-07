import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import BearMascot from '@/components/bear/BearMascot'
import HeartSparkleBurst from './HeartSparkleBurst'
import { useReducedMotion } from '@/hooks/useReducedMotion'

const SESSION_KEY = 'love-book-intro-shown'

/**
 * A short (~1.6s) one-time splash played when the site first loads in a tab:
 * closed book -> bear appears -> book opens -> hearts/sparkles -> fades away.
 * Renders nothing (and never delays the real app) once already shown this
 * session, or when the user prefers reduced motion.
 */
export default function OpeningIntro() {
  const reducedMotion = useReducedMotion()
  const [visible, setVisible] = useState(false)
  const [stage, setStage] = useState<'book' | 'bear' | 'open' | 'burst'>('book')
  const claimedRef = useRef(false)

  useEffect(() => {
    if (reducedMotion) return
    if (typeof window === 'undefined') return

    // Guard with a ref (not just sessionStorage) so React StrictMode's
    // dev-only mount->cleanup->mount doesn't cancel the first run's timers
    // and then have the second run bail out on the flag it just set.
    if (!claimedRef.current) {
      if (sessionStorage.getItem(SESSION_KEY)) return
      sessionStorage.setItem(SESSION_KEY, '1')
      claimedRef.current = true
      setVisible(true)
    }

    const timers = [
      setTimeout(() => setStage('bear'), 350),
      setTimeout(() => setStage('open'), 750),
      setTimeout(() => setStage('burst'), 1050),
      setTimeout(() => setVisible(false), 1650),
    ]
    return () => timers.forEach(clearTimeout)
  }, [reducedMotion])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-gradient-to-b from-soft-pink via-cream to-baby-blue"
          aria-hidden="true"
        >
          <div className="relative flex flex-col items-center gap-4">
            <AnimatePresence>
              {(stage === 'bear' || stage === 'open' || stage === 'burst') && (
                <motion.div
                  initial={{ opacity: 0, x: -16, scale: 0.7 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 16 }}
                  className="absolute -left-16 bottom-2"
                >
                  <BearMascot size={56} mood="wave" />
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              className="relative h-32 w-24 rounded-r-xl rounded-l-sm bg-gradient-to-br from-pastel-pink to-soft-peach shadow-page"
              style={{ perspective: 800 }}
            >
              <span className="absolute left-0 top-0 h-full w-2.5 rounded-l-sm bg-black/10" />
              <motion.span
                className="absolute right-0.5 top-1 h-[calc(100%-8px)] w-[calc(100%-10px)] origin-left rounded-r-lg bg-warm-white shadow-inner"
                animate={stage === 'open' || stage === 'burst' ? { rotateY: -130 } : { rotateY: 0 }}
                transition={{ duration: 0.45, ease: 'easeInOut' }}
                style={{ transformStyle: 'preserve-3d' }}
              />
              <div className="relative z-10 flex h-full items-center justify-center text-2xl">🧸</div>
            </motion.div>

            {stage === 'burst' && (
              <div className="relative h-0 w-0">
                <HeartSparkleBurst count={9} className="absolute inset-0" />
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
