import { motion } from 'framer-motion'
import { Trash2 } from 'lucide-react'
import type { GalleryImage } from '@/types'
import { useReducedMotion } from '@/hooks/useReducedMotion'

const ROTATIONS = [-4, 3, -2, 4, -3, 2, -1.5, 1.5]

export default function PolaroidCard({
  image,
  index,
  onClick,
  onDelete,
}: {
  image: GalleryImage
  index: number
  onClick: () => void
  onDelete: () => void
}) {
  const rotate = ROTATIONS[index % ROTATIONS.length]
  const reducedMotion = useReducedMotion()

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 15, scale: 0.94, rotate: 0 }}
      whileInView={{ opacity: 1, y: 0, scale: 1, rotate }}
      viewport={{ once: true, margin: '-40px' }}
      exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9, y: -6, transition: { duration: 0.25 } }}
      whileHover={reducedMotion ? undefined : { rotate: 0, scale: 1.05, zIndex: 10, boxShadow: '0 12px 32px -8px rgba(74,63,69,0.22)' }}
      whileTap={reducedMotion ? undefined : { scale: 0.97 }}
      transition={{ duration: 0.35, delay: Math.min(index, 10) * 0.05, ease: 'easeOut' }}
      className="group relative w-full max-w-[220px] rounded-sm bg-white p-2.5 pb-8 shadow-softer"
    >
      {/* tape */}
      <span className="absolute -top-2 left-1/2 h-5 w-14 -translate-x-1/2 rotate-[-3deg] rounded-sm bg-baby-blue/60 shadow-sm" />

      <button onClick={onClick} className="relative block aspect-square w-full overflow-hidden bg-black/5" aria-label={image.caption ?? 'เปิดดูรูป'}>
        <motion.img
          src={image.image_url}
          alt={image.caption ?? ''}
          loading="lazy"
          className="h-full w-full object-cover"
          whileHover={reducedMotion ? undefined : { scale: 1.08 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
        <span className="pointer-events-none absolute right-1.5 top-1.5 text-base opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          💕
        </span>
      </button>

      {image.caption && <p className="mt-2 truncate text-center text-xs text-ink-soft">{image.caption}</p>}

      <button
        onClick={(e) => {
          e.stopPropagation()
          onDelete()
        }}
        aria-label="ลบรูปนี้"
        className="absolute right-1 top-1 rounded-full bg-black/40 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </motion.div>
  )
}
