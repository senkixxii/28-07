import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export type BearMood = 'happy' | 'sleepy' | 'wink' | 'party' | 'sad'

interface BearMascotProps {
  size?: number
  mood?: BearMood
  float?: boolean
  className?: string
}

/** A small hand-drawn-style pastel bear used as the app's recurring visual identity. */
export default function BearMascot({ size = 96, mood = 'happy', float = false, className }: BearMascotProps) {
  const svg = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('drop-shadow-sm', className)}
      role="img"
      aria-label="bear mascot"
    >
      {/* round bear ears */}
      <circle cx="34" cy="24" r="13" fill="#F8BBD0" />
      <circle cx="86" cy="24" r="13" fill="#F8BBD0" />
      <circle cx="34" cy="25" r="6.5" fill="#FCE4EC" />
      <circle cx="86" cy="25" r="6.5" fill="#FCE4EC" />

      {/* face */}
      <circle cx="60" cy="66" r="42" fill="#FBCBDD" />
      <circle cx="60" cy="66" r="42" fill="url(#bear-shade)" opacity="0.5" />

      {/* cheeks */}
      <ellipse cx="32" cy="74" rx="8" ry="5" fill="#FFDCE7" opacity="0.9" />
      <ellipse cx="88" cy="74" rx="8" ry="5" fill="#FFDCE7" opacity="0.9" />

      {/* eyes */}
      {mood === 'sleepy' ? (
        <>
          <path d="M42 60 Q48 65 54 60" stroke="#4A3F45" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M66 60 Q72 65 78 60" stroke="#4A3F45" strokeWidth="3" strokeLinecap="round" fill="none" />
        </>
      ) : mood === 'wink' ? (
        <>
          <circle cx="48" cy="62" r="3.6" fill="#4A3F45" />
          <path d="M67 62 Q71 59 75 62" stroke="#4A3F45" strokeWidth="3" strokeLinecap="round" fill="none" />
        </>
      ) : mood === 'sad' ? (
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

      {/* muzzle */}
      <ellipse cx="60" cy="79" rx="18" ry="14" fill="#FCE4EC" stroke="#F3A9C4" strokeWidth="1.5" />
      <ellipse cx="60" cy="73" rx="5.5" ry="4" fill="#B97A94" />

      {/* mouth */}
      {mood === 'party' || mood === 'happy' ? (
        <path d="M52 84 Q60 90 68 84" stroke="#4A3F45" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      ) : (
        <path d="M60 77 L60 84" stroke="#4A3F45" strokeWidth="2" strokeLinecap="round" fill="none" />
      )}

      {/* party hat */}
      {mood === 'party' && (
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

  if (!float) return svg

  return (
    <motion.div
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      className="inline-block"
    >
      {svg}
    </motion.div>
  )
}
