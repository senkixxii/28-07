import { motion } from 'framer-motion'
import { Trash2 } from 'lucide-react'
import type { GalleryImage } from '@/types'

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 14, rotate: 0 }}
      animate={{ opacity: 1, y: 0, rotate }}
      whileHover={{ rotate: 0, scale: 1.04, zIndex: 10 }}
      transition={{ duration: 0.3, delay: Math.min(index, 10) * 0.03 }}
      className="group relative w-full max-w-[220px] rounded-sm bg-white p-2.5 pb-8 shadow-softer"
    >
      {/* tape */}
      <span className="absolute -top-2 left-1/2 h-5 w-14 -translate-x-1/2 rotate-[-3deg] rounded-sm bg-baby-blue/60 shadow-sm" />

      <button onClick={onClick} className="block aspect-square w-full overflow-hidden bg-black/5" aria-label={image.caption ?? 'เปิดดูรูป'}>
        <img src={image.image_url} alt={image.caption ?? ''} loading="lazy" className="h-full w-full object-cover" />
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
