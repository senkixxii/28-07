import { useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Pencil, Trash2, X } from 'lucide-react'
import Button from '@/components/ui/Button'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { formatThaiDate } from '@/lib/dates'
import type { Letter } from '@/types'

interface LetterOpenOverlayProps {
  letter: Letter | null
  onClose: () => void
  onEdit: () => void
  onDelete: () => void
}

/**
 * The envelope-opening sequence: flap opens, the letter slides up and
 * expands, the backdrop dims, then the message fades in line by line.
 */
export default function LetterOpenOverlay({ letter, onClose, onEdit, onDelete }: LetterOpenOverlayProps) {
  const reducedMotion = useReducedMotion()
  const [revealed, setRevealed] = useState(false)

  const lines = letter?.message.split('\n') ?? []

  function handleClose() {
    setRevealed(false)
    onClose()
  }

  return createPortal(
    <AnimatePresence onExitComplete={() => setRevealed(false)}>
      {letter && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[95] flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm"
          onClick={handleClose}
        >
          {!revealed && !reducedMotion ? (
            <motion.div
              key="envelope"
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative flex h-40 w-56 flex-col items-center justify-center rounded-xl2 bg-soft-pink shadow-lift"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.svg
                className="absolute inset-x-0 top-0 h-1/2 w-full text-pastel-pink"
                viewBox="0 0 100 50"
                preserveAspectRatio="none"
                initial={{ rotateX: 0 }}
                animate={{ rotateX: -150 }}
                transition={{ delay: 0.35, duration: 0.5, ease: 'easeInOut' }}
                style={{ transformOrigin: 'top center', transformStyle: 'preserve-3d' }}
              >
                <polygon points="0,0 100,0 50,50" fill="currentColor" />
              </motion.svg>

              <motion.div
                initial={{ y: 20, opacity: 0, scale: 0.9 }}
                animate={{ y: -90, opacity: 1, scale: 1.5 }}
                transition={{ delay: 0.75, duration: 0.55, ease: 'easeOut' }}
                onAnimationComplete={() => setRevealed(true)}
                className="absolute h-24 w-36 rounded-md bg-warm-white shadow-soft"
              />
            </motion.div>
          ) : (
            <motion.div
              key="letter"
              initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              onClick={(e) => e.stopPropagation()}
              className="paper-texture relative max-h-[85vh] w-full max-w-md overflow-y-auto rounded-xl2 bg-warm-white p-8 shadow-lift"
            >
              <button
                onClick={handleClose}
                aria-label="ปิด"
                className="absolute right-3 top-3 rounded-full p-1.5 text-ink-soft hover:bg-black/5"
              >
                <X className="h-5 w-5" />
              </button>

              <p className="text-xs text-ink-soft">{formatThaiDate(letter.letter_date)}</p>
              <h2 className="mt-1 text-xl font-semibold text-ink">{letter.title}</h2>

              {letter.image_url && <img src={letter.image_url} alt="" className="my-4 w-full rounded-xl2 object-cover" />}

              <div className="mt-4 space-y-2 leading-relaxed text-ink">
                {lines.map((line, i) => (
                  <motion.p
                    key={i}
                    initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + i * 0.12 }}
                    className="whitespace-pre-line"
                  >
                    {line || ' '}
                  </motion.p>
                ))}
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <Button variant="secondary" size="sm" onClick={onEdit}>
                  <Pencil className="h-3.5 w-3.5" /> แก้ไข
                </Button>
                <Button variant="danger" size="sm" onClick={onDelete}>
                  <Trash2 className="h-3.5 w-3.5" /> ลบ
                </Button>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
