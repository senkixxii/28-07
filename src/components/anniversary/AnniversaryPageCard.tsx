import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Camera } from 'lucide-react'
import type { AnniversaryWithImages } from '@/types'
import { formatThaiDate } from '@/lib/dates'

export default function AnniversaryPageCard({ anniversary, index = 0 }: { anniversary: AnniversaryWithImages; index?: number }) {
  const cover = anniversary.cover_image_url ?? anniversary.anniversary_images[0]?.image_url ?? null

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index, 8) * 0.04 }}
      whileHover={{ y: -4, rotate: index % 2 === 0 ? -0.5 : 0.5 }}
      className="group overflow-hidden rounded-xl3 border border-black/5 bg-warm-white shadow-softer transition-shadow hover:shadow-lift"
    >
      <Link to={`/anniversaries/${anniversary.id}`}>
        <div className="aspect-[4/3] w-full overflow-hidden bg-soft-pink/40">
          {cover ? (
            <img
              src={cover}
              alt={anniversary.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-4xl">🐻</div>
          )}
        </div>
        <div className="p-4">
          <p className="text-xs font-medium text-ink-muted">{String(anniversary.month_number).padStart(2, '0')}</p>
          <h3 className="mt-1 font-semibold text-ink">{anniversary.title}</h3>
          <p className="mt-1 text-xs text-ink-soft">{formatThaiDate(anniversary.anniversary_date)}</p>
          {anniversary.message && <p className="mt-2 line-clamp-2 text-sm italic text-ink-soft">"{anniversary.message}"</p>}
          <div className="mt-3 flex items-center justify-between">
            <span className="inline-flex items-center gap-1 text-xs text-ink-soft">
              <Camera className="h-3.5 w-3.5" /> {anniversary.anniversary_images.length} รูป
            </span>
            <span className="text-xs font-medium text-accent group-hover:underline">เปิดอ่าน →</span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
