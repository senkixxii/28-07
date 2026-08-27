import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import BearMascot from './BearMascot'
import type { BearMood } from './BearMascot'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface EmptyStateProps {
  icon?: string
  title: string
  description?: string
  mood?: BearMood
  showBear?: boolean
  action?: ReactNode
}

export default function EmptyState({ icon, title, description, mood = 'sad', showBear = true, action }: EmptyStateProps) {
  const reducedMotion = useReducedMotion()

  return (
    <motion.div
      initial={reducedMotion ? undefined : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex flex-col items-center justify-center gap-4 rounded-xl3 border border-dashed border-pastel-pink/50 bg-warm-white/60 px-6 py-16 text-center"
    >
      {showBear ? (
        <BearMascot size={88} mood={mood} float />
      ) : (
        icon && (
          <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-soft-pink/70 to-baby-blue/40 text-4xl shadow-inner">
            {icon}
          </span>
        )
      )}
      <div className="space-y-1.5">
        <p className="font-medium text-ink">{title}</p>
        {description && <p className="text-sm text-ink-soft">{description}</p>}
      </div>
      {action}
    </motion.div>
  )
}
