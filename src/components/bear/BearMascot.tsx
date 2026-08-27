import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useReducedMotion } from '@/hooks/useReducedMotion'

export type BearMood = 'happy' | 'sleepy' | 'wink' | 'party' | 'sad'

interface BearMascotProps {
  size?: number
  mood?: BearMood
  float?: boolean
  className?: string
  /** Click the bear 5 times for a tiny surprise. */
  easterEgg?: boolean
}

/** A small hand-drawn-style pastel bear used as the app's recurring visual identity. */
export default function BearMascot({ size = 96, mood = 'happy', float = false, className, easterEgg = false }: BearMascotProps) {
  const reducedMotion = useReducedMotion()
  const [clicks, setClicks] = useState(0)
  const [reacting, setReacting] = useState(false)
  const activeMood = reacting ? 'party' : mood

  function handleClick() {
    if (!easterEgg) return
    const next = clicks + 1
    setClicks(next)
    if (next >= 5) {
      setReacting(true)
      setClicks(0)
      setTimeout(() => setReacting(false), 1800)
    }
  }

  const svg = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('drop-shadow-sm', easterEgg && 'cursor-pointer', className)}
      role="img"
      aria-label="bear mascot"
      onClick={handleClick}
    >
      <circle cx="34" cy="24" r="13" fill="#F8BBD0" />
      <circle cx="86" cy="24" r="13" fill="#F8BBD0" />
      <circle cx="34" cy="25" r="6.5" fill="#FCE4EC" />
      <circle cx="86" cy="25" r="6.5" fill="#FCE4EC" />

      <circle cx="60" cy="66" r="42" fill="#FBCBDD" />
      <circle cx="60" cy="66" r="42" fill="url(#bear-shade)" opacity="0.5" />

      <ellipse cx="32" cy="74" rx="8" ry="5" fill="#FFDCE7" opacity="0.9" />
      <ellipse cx="88" cy="74" rx="8" ry="5" fill="#FFDCE7" opacity="0.9" />

      {activeMood === 'sleepy' ? (
        <>
          <path d="M42 60 Q48 65 54 60" stroke="#4A3F45" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M66 60 Q72 65 78 60" stroke="#4A3F45" strokeWidth="3" strokeLinecap="round" fill="none" />
        </>
      ) : activeMood === 'wink' ? (
        <>
          <circle cx="48" cy="62" r="3.6" fill="#4A3F45" />
          <path d="M67 62 Q71 59 75 62" stroke="#4A3F45" strokeWidth="3" strokeLinecap="round" fill="none" />
        </>
      ) : activeMood === 'sad' ? (
        <>
          <circle cx="48" cy="63" r="3.6" fill="#4A3F45" />
          <circle cx="72" cy="63" r="3.6" fill="#4A3F45" />
          <path d="M41 52 Q48 48 53 52" stroke="#4A3F45" strokeWidth="2.4" strokeLinecap="round" fill="none" />
          <path d="M67 52 Q72 48 79 52" stroke="#4A3F45" strokeWidth="2.4" strokeLinecap="round" fill="none" />
        </>
      ) : (
        <>
          <circle cx="48" cy="62" r="3.6" fill="#4A3F45" />
          <circle cx="72" cy="62" r="3.6" fill="#4A3F45" />
        </>
      )}

      <ellipse cx="60" cy="79" rx="18" ry="14" fill="#FCE4EC" stroke="#F3A9C4" strokeWidth="1.5" />
      <ellipse cx="60" cy="73" rx="5.5" ry="4" fill="#8A7373" />

      {activeMood === 'party' || activeMood === 'happy' ? (
        <path d="M52 84 Q60 90 68 84" stroke="#4A3F45" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      ) : (
        <path d="M60 77 L60 84" stroke="#4A3F45" strokeWidth="2" strokeLinecap="round" fill="none" />
      )}

      {activeMood === 'party' && (
        <g>
          <polygon points="60,4 48,24 72,24" fill="#E8DFF5" />
          <circle cx="60" cy="4" r="3" fill="#F8BBD0" />
        </g>
      )}

      <defs>
        <radialGradient id="bear-shade" cx="0.5" cy="0.35" r="0.7">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  )

  return (
    <div className="relative inline-block">
      {float && !reducedMotion ? (
        <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} className="inline-block">
          {svg}
        </motion.div>
      ) : (
        svg
      )}

      <AnimatePresence>
        {reacting && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 0, scale: 0.6 }}
              animate={{ opacity: 1, y: -30, scale: 1 }}
              exit={{ opacity: 0 }}
              className="pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white px-3 py-1 text-xs font-semibold text-accent shadow-soft"
            >
              🐻💕 รักนะ!
            </motion.div>
            {[...Array(6)].map((_, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 1, x: 0, y: 0, scale: 0.6 }}
                animate={{
                  opacity: 0,
                  x: (i - 2.5) * 18,
                  y: -70 - i * 6,
                  scale: 1,
                }}
                transition={{ duration: 1.4, delay: i * 0.06 }}
                className="pointer-events-none absolute left-1/2 top-1/3 text-lg"
              >
                💕
              </motion.span>
            ))}
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
