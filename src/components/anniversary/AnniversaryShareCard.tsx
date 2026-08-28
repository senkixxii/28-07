import { forwardRef } from 'react'
import { formatThaiDate } from '@/lib/dates'
import type { AnniversaryWithImages } from '@/types'

interface AnniversaryShareCardProps {
  anniversary: AnniversaryWithImages
}

/**
 * A fixed-size layout used only for generating the shareable image — kept
 * separate from the on-screen page so the export always comes out with the
 * same well-proportioned shape, regardless of how tall the on-screen
 * responsive layout happens to stack on a phone (which is what made shares
 * look cropped/stretched once dropped into an Instagram Story).
 */
const AnniversaryShareCard = forwardRef<HTMLDivElement, AnniversaryShareCardProps>(function AnniversaryShareCard(
  { anniversary },
  ref,
) {
  const cover = anniversary.cover_image_url ?? anniversary.anniversary_images[0]?.image_url ?? null
  const gallery = anniversary.anniversary_images.map((img) => img.image_url)
  const collage = gallery.length > 1 ? gallery.slice(0, 4) : []

  return (
    <div ref={ref} style={{ width: 1080, fontFamily: "'Prompt', sans-serif" }} className="flex flex-col bg-warm-white">
      <div style={{ height: 1080 }} className="relative w-full shrink-0 overflow-hidden bg-soft-pink/40">
        {collage.length > 0 ? (
          <div className="grid h-full w-full grid-cols-2 gap-1">
            {collage.map((url, i) => (
              <div key={url + i} className="overflow-hidden bg-black/5">
                <img src={url} alt="" className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        ) : cover ? (
          <img src={cover} alt={anniversary.title} className="h-full w-full object-cover" />
        ) : (
          <div style={{ fontSize: 140 }} className="flex h-full items-center justify-center">
            🐻
          </div>
        )}
      </div>

      <div style={{ padding: 64 }} className="flex flex-col">
        <p style={{ fontSize: 26 }} className="font-medium text-ink-muted">
          {String(anniversary.month_number).padStart(2, '0')}
        </p>
        <h1
          style={{
            fontSize: 52,
            lineHeight: 1.25,
            marginTop: 8,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
          className="font-semibold text-ink"
        >
          {anniversary.title}
        </h1>
        <p style={{ fontSize: 26, marginTop: 12 }} className="text-ink-soft">
          {formatThaiDate(anniversary.anniversary_date)}
        </p>

        {anniversary.message && (
          <p
            style={{
              fontSize: 30,
              lineHeight: 1.55,
              marginTop: 28,
              display: '-webkit-box',
              WebkitLineClamp: 9,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
            className="whitespace-pre-line text-ink"
          >
            {anniversary.message}
          </p>
        )}

        <p style={{ fontSize: 22, marginTop: 40 }} className="text-ink-muted">
          🐻 สมุดเล็กๆของเราสองคน
        </p>
      </div>
    </div>
  )
})

export default AnniversaryShareCard
