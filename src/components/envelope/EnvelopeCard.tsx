import { motion } from 'framer-motion'
import type { Letter } from '@/types'
import { formatDotDate } from '@/lib/dates'
import { useReducedMotion } from '@/hooks/useReducedMotion'

const COLORS = ['bg-soft-pink', 'bg-baby-blue', 'bg-lavender', 'bg-soft-peach']
const ROTATIONS = [-3, 2, -2, 3, -1.5, 1.5]

export default function EnvelopeCard({ letter, index, onOpen }: { letter: Letter; index: number; onOpen: () => void }) {
  const color = COLORS[index % COLORS.length]
  const rotate = ROTATIONS[index % ROTATIONS.length]
  const reducedMotion = useReducedMotion()

  return (
    <motion.button
      onClick={onOpen}
      initial={reducedMotion ? false : { opacity: 0, y: 15, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1, rotate }}
      viewport={{ once: true, margin: '-40px' }}
      exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9, transition: { duration: 0.25 } }}
      whileHover={reducedMotion ? undefined : { y: -6, rotate: 0, scale: 1.03, boxShadow: '0 12px 32px -8px rgba(74,63,69,0.22)' }}
      whileTap={reducedMotion ? undefined : { scale: 0.97 }}
      transition={{ duration: 0.32, delay: Math.min(index, 8) * 0.05, ease: 'easeOut' }}
      className={`group relative flex aspect-[4/3] w-full flex-col justify-between rounded-xl2 ${color} p-4 text-left shadow-softer transition-shadow hover:shadow-lift`}
    >
      {/* envelope flap */}
      <svg className="absolute inset-x-0 top-0 h-1/2 w-full text-black/5" viewBox="0 0 100 50" preserveAspectRatio="none">
        <polygon points="0,0 100,0 50,50" fill="currentColor" />
      </svg>

      <span className="pointer-events-none absolute right-2 top-2 text-sm opacity-0 transition-opacity duration-200 group-hover:opacity-100">✨</span>

      <div className="relative z-10 text-2xl">💌</div>
      <div className="relative z-10">
        <p className="font-semibold text-ink">{letter.title}</p>
        <p className="mt-1 text-xs text-ink-soft">เปิดอ่านวันที่ {formatDotDate(letter.letter_date)}</p>
      </div>
    </motion.button>
  )
}
