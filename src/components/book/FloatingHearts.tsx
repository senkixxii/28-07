import { useReducedMotion } from '@/hooks/useReducedMotion'

const HEARTS = [
  { left: '8%', delay: '0s', duration: '6s', size: 16 },
  { left: '22%', delay: '1.2s', duration: '7s', size: 12 },
  { left: '38%', delay: '2.4s', duration: '5.5s', size: 20 },
  { left: '55%', delay: '0.6s', duration: '6.5s', size: 14 },
  { left: '70%', delay: '1.8s', duration: '7.5s', size: 18 },
  { left: '85%', delay: '3s', duration: '6s', size: 12 },
]

/** Subtle floating hearts used as ambient background decoration. */
export default function FloatingHearts() {
  const reducedMotion = useReducedMotion()
  if (reducedMotion) return null

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {HEARTS.map((h, i) => (
        <span
          key={i}
          className="absolute bottom-0 animate-drift text-pastel-pink/60"
          style={{
            left: h.left,
            fontSize: h.size,
            animationDelay: h.delay,
            animationDuration: h.duration,
          }}
        >
          💕
        </span>
      ))}
    </div>
  )
}
