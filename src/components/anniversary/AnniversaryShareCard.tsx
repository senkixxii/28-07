import { forwardRef } from 'react'
import { formatThaiDate } from '@/lib/dates'
import { SHARE_ASPECT_RATIOS, type FocalPoint, type ShareAspectRatio } from '@/lib/shareCardLayout'
import type { AnniversaryWithImages } from '@/types'

export type SharePhotoLayout = 'single' | 'grid'

interface AnniversaryShareCardProps {
  anniversary: AnniversaryWithImages
  aspectRatio: ShareAspectRatio
  photoLayout: SharePhotoLayout
  heroUrl: string | null
  photoUrls: string[]
  focalPoint: FocalPoint
}

/**
 * A fixed-size layout used only for generating the shareable image — kept
 * separate from the on-screen page so the export always comes out with a
 * consistent, deliberately-chosen shape instead of however tall the
 * responsive on-screen layout happens to stack on the viewer's phone.
 * aspectRatio/photoLayout/heroUrl/photoUrls/focalPoint are all
 * user-adjustable via ShareCustomizeDialog.
 */
const AnniversaryShareCard = forwardRef<HTMLDivElement, AnniversaryShareCardProps>(function AnniversaryShareCard(
  { anniversary, aspectRatio, photoLayout, heroUrl, photoUrls, focalPoint },
  ref,
) {
  const { width, height, photoHeight, messageLines } = SHARE_ASPECT_RATIOS[aspectRatio]
  const gridPhotos = photoUrls.slice(0, 4)

  return (
    <div
      ref={ref}
      style={{ width, height, fontFamily: "'Prompt', sans-serif" }}
      className="flex flex-col overflow-hidden bg-warm-white"
    >
      <div style={{ height: photoHeight }} className="relative w-full shrink-0 overflow-hidden bg-soft-pink/40">
        {photoLayout === 'grid' && gridPhotos.length > 0 ? (
          <div
            className="grid h-full w-full gap-1"
            style={{ gridTemplateColumns: gridPhotos.length > 1 ? 'repeat(2, 1fr)' : '1fr' }}
          >
            {gridPhotos.map((url, i) => {
              const isLastOdd = gridPhotos.length % 2 === 1 && i === gridPhotos.length - 1
              return (
                <div key={url + i} className="overflow-hidden bg-black/5" style={isLastOdd ? { gridColumn: 'span 2' } : undefined}>
                  <img src={url} alt="" className="h-full w-full object-cover" />
                </div>
              )
            })}
          </div>
        ) : heroUrl ? (
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
