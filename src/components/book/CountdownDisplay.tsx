import { motion, AnimatePresence } from 'framer-motion'
import { useCountdown } from '@/hooks/useCountdown'

function Digit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl2 bg-warm-white shadow-softer sm:h-16 sm:w-16">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={value}
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -12, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute text-xl font-semibold text-ink sm:text-2xl"
          >
            {String(value).padStart(2, '0')}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="text-[11px] text-ink-soft">{label}</span>
    </div>
  )
}

export default function CountdownDisplay({ target }: { target: Date }) {
  const { days, hours, minutes, seconds } = useCountdown(target)

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3">
      <Digit value={days} label="วัน" />
      <span className="pb-4 text-ink-muted">:</span>
      <Digit value={hours} label="ชั่วโมง" />
      <span className="pb-4 text-ink-muted">:</span>
      <Digit value={minutes} label="นาที" />
      <span className="pb-4 text-ink-muted">:</span>
      <Digit value={seconds} label="วินาที" />
    </div>
  )
}
