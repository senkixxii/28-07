import { AnimatePresence, motion } from 'framer-motion'
import { createPortal } from 'react-dom'
import { Pencil, Trash2, X } from 'lucide-react'
import Button from '@/components/ui/Button'
import { formatThaiDate } from '@/lib/utils'
import type { Letter } from '@/types'

interface LetterReaderProps {
  letter: Letter | null
  onClose: () => void
  onEdit: () => void
  onDelete: () => void
}

export default function LetterReader({ letter, onClose, onEdit, onDelete }: LetterReaderProps) {
  return createPortal(
    <AnimatePresence>
      {letter && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm" onClick={onClose}>
          <motion.div
            initial={{ opacity: 0, rotateX: -90, scale: 0.9 }}
            animate={{ opacity: 1, rotateX: 0, scale: 1 }}
            exit={{ opacity: 0, rotateX: 90, scale: 0.9 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            style={{ transformPerspective: 1200 }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[85vh] w-full max-w-md overflow-y-auto rounded-xl2 bg-[repeating-linear-gradient(white,white_27px,#fbe3ea_28px)] p-8 shadow-lift"
          >
            <button onClick={onClose} aria-label="ปิด" className="absolute right-3 top-3 rounded-full p-1.5 text-ink-soft hover:bg-black/5">
              <X className="h-5 w-5" />
            </button>

            <p className="text-xs text-ink-soft">{formatThaiDate(letter.letter_date)}</p>
            <h2 className="mt-1 font-['Anuphan'] text-xl font-semibold text-ink">{letter.title}</h2>

            {letter.image_url && <img src={letter.image_url} alt="" className="my-4 w-full rounded-xl2 object-cover" />}

            <p className="mt-4 whitespace-pre-line font-medium leading-relaxed text-ink">{letter.message}</p>

            <div className="mt-6 flex justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={onEdit}>
                <Pencil className="h-3.5 w-3.5" /> แก้ไข
              </Button>
              <Button variant="danger" size="sm" onClick={onDelete}>
                <Trash2 className="h-3.5 w-3.5" /> ลบ
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
