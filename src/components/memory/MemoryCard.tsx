import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Camera } from 'lucide-react'
import type { MemoryWithImages } from '@/types'
import { formatThaiDate } from '@/lib/utils'

export default function MemoryCard({ memory, index = 0 }: { memory: MemoryWithImages; index?: number }) {
  const cover = memory.cover_image_url ?? memory.memory_images[0]?.image_url ?? null

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index, 8) * 0.04 }}
      whileHover={{ y: -4 }}
      className="group overflow-hidden rounded-xl3 border border-black/5 bg-white shadow-softer transition-shadow hover:shadow-lift"
    >
      <Link to={`/memories/${memory.id}`}>
        <div className="aspect-[4/3] w-full overflow-hidden bg-soft-pink/40">
          {cover ? (
            <img
              src={cover}
              alt={memory.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-4xl">🐻</div>
          )}
        </div>
        <div className="p-4">
          <p className="text-xs text-ink-soft">🐻 {formatThaiDate(memory.memory_date)}</p>
          <h3 className="mt-1 font-semibold text-ink">{memory.title}</h3>
          {memory.description && (
            <p className="mt-1 line-clamp-2 text-sm text-ink-soft">{memory.description}</p>
          )}
          <div className="mt-3 flex items-center justify-between">
            <span className="inline-flex items-center gap-1 text-xs text-ink-soft">
              <Camera className="h-3.5 w-3.5" /> {memory.memory_images.length} รูป
            </span>
            <span className="text-xs font-medium text-accent group-hover:underline">เปิดความทรงจำ →</span>
          </div>
          {memory.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {memory.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="rounded-full bg-lavender/50 px-2 py-0.5 text-[11px] text-ink">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  )
}
