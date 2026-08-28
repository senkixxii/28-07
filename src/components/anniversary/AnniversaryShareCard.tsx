import { forwardRef } from 'react'
import { formatThaiDate } from '@/lib/dates'
import { SHARE_ASPECT_RATIOS, type FocalPoint, type ShareAspectRatio } from '@/lib/shareCardLayout'
import type { AnniversaryWithImages } from '@/types'

interface AnniversaryShareCardProps {
  anniversary: AnniversaryWithImages
  aspectRatio: ShareAspectRatio
  heroUrl: string | null
  focalPoint: FocalPoint
}

/**
 * A fixed-size layout used only for generating the shareable image — kept
 * separate from the on-screen page so the export always comes out with a
 * consistent, deliberately-chosen shape instead of however tall the
 * responsive on-screen layout happens to stack on the viewer's phone.
 * aspectRatio/heroUrl/focalPoint are user-adjustable via ShareCustomizeDialog.
 */
const AnniversaryShareCard = forwardRef<HTMLDivElement, AnniversaryShareCardProps>(function AnniversaryShareCard(
  { anniversary, aspectRatio, heroUrl, focalPoint },
  ref,
) {
  const { width, height, photoHeight, messageLines } = SHARE_ASPECT_RATIOS[aspectRatio]

  return (
    <div
      ref={ref}
      style={{ width, height, fontFamily: "'Prompt', sans-serif" }}
      className="flex flex-col overflow-hidden bg-warm-white"
    >
      <div style={{ height: photoHeight }} className="relative w-full shrink-0 overflow-hidden bg-soft-pink/40">
        {heroUrl ? (
          <img
            src={heroUrl}
            alt={anniversary.title}
            className="h-full w-full object-cover"
            style={{ objectPosition: `${focalPoint.x}% ${focalPoint.y}%` }}
          />
        ) : (
          <div style={{ fontSize: 140 }} className="flex h-full items-center justify-center">
            🐻
          </div>
        )}
      </div>

      <div style={{ padding: 64 }} className="flex flex-1 flex-col overflow-hidden">
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
              WebkitLineClamp: messageLines,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
            className="whitespace-pre-line text-ink"
          >
            {anniversary.message}
          </p>
        )}

        <p style={{ fontSize: 22, marginTop: 'auto', paddingTop: 24 }} className="text-ink-muted">
          🐻 สมุดเล็กๆของเราสองคน
        </p>
      </div>
    </div>
  )
})

export default AnniversaryShareCard
