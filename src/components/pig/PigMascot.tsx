import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export type PigMood = 'happy' | 'sleepy' | 'wink' | 'party' | 'sad'

interface PigMascotProps {
  size?: number
  mood?: PigMood
  float?: boolean
  className?: string
}

/** A small hand-drawn-style pastel pig used as the app's recurring visual identity. */
export default function PigMascot({ size = 96, mood = 'happy', float = false, className }: PigMascotProps) {
  const svg = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('drop-shadow-sm', className)}
      role="img"
      aria-label="pig mascot"
    >
      {/* ears */}
      <ellipse cx="38" cy="30" rx="13" ry="15" fill="#F8BBD0" />
      <ellipse cx="82" cy="30" rx="13" ry="15" fill="#F8BBD0" />
      <ellipse cx="38" cy="32" rx="6" ry="7" fill="#FCE4EC" />
      <ellipse cx="82" cy="32" rx="6" ry="7" fill="#FCE4EC" />

      {/* face */}
      <circle cx="60" cy="64" r="42" fill="#FBCBDD" />
      <circle cx="60" cy="64" r="42" fill="url(#pig-shade)" opacity="0.5" />

      {/* cheeks */}
      <ellipse cx="34" cy="72" rx="8" ry="5" fill="#FFDCE7" opacity="0.9" />
      <ellipse cx="86" cy="72" rx="8" ry="5" fill="#FFDCE7" opacity="0.9" />

      {/* eyes */}
      {mood === 'sleepy' ? (
        <>
          <path d="M43 58 Q49 63 55 58" stroke="#4A3F45" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M65 58 Q71 63 77 58" stroke="#4A3F45" strokeWidth="3" strokeLinecap="round" fill="none" />
        </>
      ) : mood === 'wink' ? (
        <>
          <circle cx="49" cy="60" r="3.6" fill="#4A3F45" />
          <path d="M67 60 Q71 57 75 60" stroke="#4A3F45" strokeWidth="3" strokeLinecap="round" fill="none" />
        </>
      ) : mood === 'sad' ? (
        <>
          <circle cx="49" cy="61" r="3.6" fill="#4A3F45" />
          <circle cx="71" cy="61" r="3.6" fill="#4A3F45" />
          <path d="M42 50 Q49 46 54 50" stroke="#4A3F45" strokeWidth="2.4" strokeLinecap="round" fill="none" />
          <path d="M66 50 Q71 46 78 50" stroke="#4A3F45" strokeWidth="2.4" strokeLinecap="round" fill="none" />
        </>
      ) : (
        <>
          <circle cx="49" cy="60" r="3.6" fill="#4A3F45" />
          <circle cx="71" cy="60" r="3.6" fill="#4A3F45" />
        </>
      )}

      {/* snout */}
      <ellipse cx="60" cy="78" rx="17" ry="12" fill="#FCE4EC" stroke="#F3A9C4" strokeWidth="1.5" />
      <ellipse cx="53" cy="78" rx="2.6" ry="3.4" fill="#B97A94" />
      <ellipse cx="67" cy="78" rx="2.6" ry="3.4" fill="#B97A94" />

      {/* mouth */}
      {mood === 'party' || mood === 'happy' ? (
        <path d="M52 90 Q60 96 68 90" stroke="#4A3F45" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      ) : null}

      {/* party hat */}
      {mood === 'party' && (
        <g>
          <polygon points="60,6 48,26 72,26" fill="#E8DFF5" />
          <circle cx="60" cy="6" r="3" fill="#F8BBD0" />
        </g>
      )}

      <defs>
        <radialGradient id="pig-shade" cx="0.5" cy="0.35" r="0.7">
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
