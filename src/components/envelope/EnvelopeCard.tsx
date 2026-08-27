import { motion } from 'framer-motion'
import type { Letter } from '@/types'
import { formatDotDate } from '@/lib/dates'

const COLORS = ['bg-soft-pink', 'bg-baby-blue', 'bg-lavender', 'bg-soft-peach']
const ROTATIONS = [-3, 2, -2, 3, -1.5, 1.5]

export default function EnvelopeCard({ letter, index, onOpen }: { letter: Letter; index: number; onOpen: () => void }) {
  const color = COLORS[index % COLORS.length]
  const rotate = ROTATIONS[index % ROTATIONS.length]

  return (
    <motion.button
      onClick={onOpen}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0, rotate }}
      whileHover={{ y: -6, rotate: 0, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.3, delay: Math.min(index, 8) * 0.04 }}
      className={`relative flex aspect-[4/3] w-full flex-col justify-between rounded-xl2 ${color} p-4 text-left shadow-softer transition-shadow hover:shadow-lift`}
    >
      {/* envelope flap */}
      <svg className="absolute inset-x-0 top-0 h-1/2 w-full text-black/5" viewBox="0 0 100 50" preserveAspectRatio="none">
        <polygon points="0,0 100,0 50,50" fill="currentColor" />
      </svg>

      <div className="relative z-10 text-2xl">💌</div>
      <div className="relative z-10">
        <p className="font-semibold text-ink">{letter.title}</p>
        <p className="mt-1 text-xs text-ink-soft">เปิดอ่านวันที่ {formatDotDate(letter.letter_date)}</p>
      </div>
    </motion.button>
  )
}
