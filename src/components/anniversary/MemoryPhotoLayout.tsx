import { motion } from 'framer-motion'
import type { PhotoLayout } from '@/types'
import { useReducedMotion } from '@/hooks/useReducedMotion'

const STACK_ROTATIONS = [-6, 4, -3, 5, -4, 3]

interface MemoryPhotoLayoutProps {
  images: string[]
  layout: PhotoLayout
  alt: string
  onImageClick?: (index: number) => void
  className?: string
}

/**
 * Renders a memory's photos according to its chosen layout — a single
 * cover photo, an even grid, or a scattered polaroid-style stack.
 */
export default function MemoryPhotoLayout({ images, layout, alt, onImageClick, className }: MemoryPhotoLayoutProps) {
  const reducedMotion = useReducedMotion()

  if (images.length === 0) {
    return (
      <div className={`flex aspect-square w-full items-center justify-center rounded-xl2 bg-soft-pink/40 text-5xl ${className ?? ''}`}>
        🐻
      </div>
    )
  }

  if (layout === 'grid') {
    return (
      <div className={`grid grid-cols-2 gap-2 ${className ?? ''}`}>
        {images.map((url, i) => (
          <button
            key={url + i}
            onClick={() => onImageClick?.(i)}
            className="aspect-square overflow-hidden rounded-xl2 bg-black/5 shadow-softer"
          >
            <img src={url} alt={`${alt} ${i + 1}`} loading="lazy" className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
    )
  }

  if (layout === 'stack') {
    return (
      <div className={`relative flex aspect-square w-full items-center justify-center ${className ?? ''}`}>
        {images.slice(0, 6).map((url, i) => {
          const rotate = STACK_ROTATIONS[i % STACK_ROTATIONS.length]
          const size = 62 - i * 4
          return (
            <motion.button
              key={url + i}
              onClick={() => onImageClick?.(i)}
              initial={reducedMotion ? undefined : { opacity: 0, scale: 0.85, rotate: 0 }}
              whileInView={{ opacity: 1, scale: 1, rotate }}
              viewport={{ once: true }}
              whileHover={reducedMotion ? undefined : { scale: 1.05, zIndex: 20, rotate: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="absolute rounded-sm bg-white p-1.5 pb-4 shadow-lift"
              style={{ width: `${size}%`, zIndex: images.length - i }}
            >
              <span className="block aspect-square w-full overflow-hidden bg-black/5">
                <img src={url} alt={`${alt} ${i + 1}`} loading="lazy" className="h-full w-full object-cover" />
              </span>
            </motion.button>
          )
        })}
      </div>
    )
  }

  return (
    <button
      onClick={() => onImageClick?.(0)}
      className={`aspect-square w-full overflow-hidden rounded-xl2 bg-soft-pink/40 shadow-softer ${className ?? ''}`}
    >
      <img src={images[0]} alt={alt} loading="lazy" className="h-full w-full object-cover" />
    </button>
  )
}
