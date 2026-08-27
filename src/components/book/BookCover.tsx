import { motion } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface BookCoverProps {
  onOpen: () => void
  opening?: boolean
}

/** A large closed storybook, floating gently, that "opens" (page flip) when clicked. */
export default function BookCover({ onOpen, opening = false }: BookCoverProps) {
  const reducedMotion = useReducedMotion()

  return (
    <motion.button
      onClick={onOpen}
      aria-label="เปิดสมุดของเรา"
      animate={reducedMotion ? undefined : { y: [0, -10, 0] }}
      transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      className="relative mx-auto block h-56 w-44 rounded-r-2xl rounded-l-md bg-gradient-to-br from-pastel-pink to-soft-peach shadow-page sm:h-64 sm:w-52"
      style={{ perspective: 1000 }}
    >
      {/* spine */}
      <span className="absolute left-0 top-0 h-full w-3 rounded-l-md bg-black/10" />
      {/* page edges */}
      <span className="absolute right-0 top-1.5 h-[calc(100%-12px)] w-2 rounded-r-sm bg-warm-white/90" />

      <motion.span
        className="absolute right-1 top-1.5 h-[calc(100%-12px)] w-[calc(100%-16px)] origin-left rounded-r-xl2 bg-warm-white shadow-inner"
        animate={opening && !reducedMotion ? { rotateY: -140 } : { rotateY: 0 }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
        style={{ transformStyle: 'preserve-3d' }}
      />

      <div className="relative z-10 flex h-full flex-col items-center justify-center gap-2 px-4 text-center">
        <span className="text-3xl">🐻</span>
        <span className="font-semibold leading-tight text-ink">Our Little
          <br />Love Book</span>
        <span className="text-xs text-ink-soft">💕</span>
      </div>
    </motion.button>
  )
}
