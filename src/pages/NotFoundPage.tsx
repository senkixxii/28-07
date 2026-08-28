import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import BearMascot from '@/components/bear/BearMascot'
import Button from '@/components/ui/Button'
import { useReducedMotion } from '@/hooks/useReducedMotion'

export default function NotFoundPage() {
  const reducedMotion = useReducedMotion()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-cream px-4 text-center">
      <motion.div
        initial={reducedMotion ? undefined : { opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <BearMascot size={100} mood="sad" float />
      </motion.div>
      <motion.h1
        initial={reducedMotion ? undefined : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="text-xl font-semibold text-ink"
      >
        หน้านี้หายไปจากสมุดของเรานะ 🐻
      </motion.h1>
      <motion.p
        initial={reducedMotion ? undefined : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="text-sm text-ink-soft"
      >
        ลองกลับไปหน้าของเราดูสิ
      </motion.p>
      <motion.div
        initial={reducedMotion ? undefined : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <Link to="/book">
          <Button>กลับหน้าของเรา</Button>
        </Link>
      </motion.div>
    </div>
  )
}
