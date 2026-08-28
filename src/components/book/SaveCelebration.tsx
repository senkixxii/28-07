import { AnimatePresence, motion } from 'framer-motion'
import BearMascot from '@/components/bear/BearMascot'
import HeartSparkleBurst from './HeartSparkleBurst'
import { useReducedMotion } from '@/hooks/useReducedMotion'

/**
 * Short-lived, centered celebration shown right after a memory is saved:
 * the bear hugs a heart, a small burst of hearts/sparkles scatters, and a
 * "Memory saved!" bubble appears. Auto-driven by the `show` flag — mount
 * it once per page and flip `show` true briefly after a successful save.
 */
export default function SaveCelebration({ show }: { show: boolean }) {
  const reducedMotion = useReducedMotion()

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="pointer-events-none fixed inset-x-0 top-16 z-[110] flex justify-center sm:top-20"
          aria-live="polite"
        >
          <motion.div
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 18, stiffness: 260 }}
            className="relative flex flex-col items-center gap-1 rounded-xl3 bg-warm-white px-6 py-4 text-center shadow-lift"
          >
            <div className="relative">
              <BearMascot size={64} mood="hug" />
              <HeartSparkleBurst className="absolute inset-0" count={8} />
            </div>
            <p className="mt-1 text-sm font-semibold text-ink">Memory saved! 🧸💕</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
