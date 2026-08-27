import { motion } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'

const EMOJIS = ['💕', '✨', '💗', '⭐️']

interface HeartSparkleBurstProps {
  count?: number
  className?: string
}

/**
 * A brief, one-shot scatter of pastel hearts/sparkles. Meant to be mounted only
 * for the duration of a celebratory moment (via AnimatePresence), never as a
 * persistent background effect.
 */
export default function HeartSparkleBurst({ count = 7, className }: HeartSparkleBurstProps) {
  const reducedMotion = useReducedMotion()
  if (reducedMotion) return null

  const pieces = Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI - Math.PI / 2 + (Math.random() - 0.5) * 0.6
    const distance = 46 + Math.random() * 30
    return {
      emoji: EMOJIS[i % EMOJIS.length],
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance - 10,
      delay: i * 0.045,
      size: 14 + Math.random() * 10,
    }
  })

  return (
    <div className={className} aria-hidden="true">
      {pieces.map((p, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, x: 0, y: 0, scale: 0.4, rotate: 0 }}
          animate={{ opacity: [0, 1, 1, 0], x: p.x, y: p.y, scale: 1, rotate: (Math.random() - 0.5) * 60 }}
          transition={{ duration: 1.1, delay: p.delay, ease: 'easeOut' }}
          className="pointer-events-none absolute left-1/2 top-1/2"
          style={{ fontSize: p.size }}
        >
          {p.emoji}
        </motion.span>
      ))}
    </div>
  )
}
