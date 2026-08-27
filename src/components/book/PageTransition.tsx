import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import { useReducedMotion } from '@/hooks/useReducedMotion'

/** Wraps route content with a soft "turning page" fade + slide on navigation. */
export default function PageTransition({ children }: { children: ReactNode }) {
  const location = useLocation()
  const reducedMotion = useReducedMotion()

  if (reducedMotion) return <>{children}</>

  return (
    <motion.div
      key={location.pathname}
      initial={{ opacity: 0, x: 12, rotateY: -2 }}
      animate={{ opacity: 1, x: 0, rotateY: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      style={{ transformPerspective: 1000 }}
    >
      {children}
    </motion.div>
  )
}
