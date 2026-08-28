import { forwardRef } from 'react'
import { formatThaiDate } from '@/lib/dates'
import type { Letter } from '@/types'

interface LetterShareCardProps {
  letter: Letter
}

/**
 * A fixed-size layout used only for generating the shareable image — see
 * AnniversaryShareCard for why this is kept separate from the on-screen
 * letter card (whose height varies with message length and viewport).
 */
const LetterShareCard = forwardRef<HTMLDivElement, LetterShareCardProps>(function LetterShareCard({ letter }, ref) {
  return (
    <div ref={ref} style={{ width: 1080, fontFamily: "'Prompt', sans-serif" }} className="paper-texture flex flex-col bg-warm-white">
      {letter.image_url && (
        <div style={{ height: 620 }} className="w-full shrink-0 overflow-hidden bg-soft-pink/40">
          <img src={letter.image_url} alt="" className="h-full w-full object-cover" />
        </div>
      )}

      <div style={{ padding: 64 }} className="flex flex-col">
        <p style={{ fontSize: 26 }} className="text-ink-soft">
          {formatThaiDate(letter.letter_date)}
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
          {letter.title}
        </h1>

        <p
          style={{
            fontSize: 30,
            lineHeight: 1.55,
            marginTop: 28,
            display: '-webkit-box',
            WebkitLineClamp: letter.image_url ? 9 : 16,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
          className="whitespace-pre-line text-ink"
        >
          {letter.message}
        </p>

        <p style={{ fontSize: 22, marginTop: 40 }} className="text-ink-muted">
          🐻 สมุดเล็กๆของเราสองคน
        </p>
      </div>
    </div>
  )
})

export default LetterShareCard
