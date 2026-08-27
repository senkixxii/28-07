import { useState } from 'react'
import BearMascot, { type BearMood } from './BearMascot'
import { cn } from '@/lib/utils'

interface BearIllustrationProps {
  /** Filename (without extension) expected at /public/assets/<pose>.png — see IMAGE ASSET REQUIREMENTS in README. */
  pose: string
  alt: string
  size?: number
  fallbackMood?: BearMood
  float?: boolean
  className?: string
}

/**
 * Shows a hand-generated illustration if present at /assets/<pose>.png,
 * and quietly falls back to the procedural BearMascot SVG if it's missing —
 * the site must keep working before those assets are generated.
 */
export default function BearIllustration({ pose, alt, size = 220, fallbackMood = 'happy', float = true, className }: BearIllustrationProps) {
  const [errored, setErrored] = useState(false)

  if (errored) {
    return <BearMascot size={size * 0.6} mood={fallbackMood} float={float} className={className} />
  }

  return (
    <img
      src={`/assets/${pose}.png`}
      alt={alt}
      width={size}
      height={size}
      onError={() => setErrored(true)}
      className={cn('object-contain', float && 'animate-float', className)}
      style={{ maxWidth: size, maxHeight: size }}
    />
  )
}
