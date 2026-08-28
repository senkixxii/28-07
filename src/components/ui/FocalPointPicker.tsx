import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Move, X } from 'lucide-react'
import Button from './Button'
import { DEFAULT_FOCAL_POINT, type FocalPoint } from '@/lib/shareCardLayout'

const PREVIEW_SIZE = 280

interface FocalPointPickerProps {
  open: boolean
  imageUrl: string | null
  initialFocalPoint?: FocalPoint
  saving?: boolean
  onSave: (point: FocalPoint) => void
  onClose: () => void
}

/**
 * Lets the user drag directly on a photo to choose which part of it stays
 * in frame wherever the photo gets cropped (aspect-square thumbnails,
 * grids, share cards) — the same drag-to-reposition interaction as
 * ShareCustomizeDialog, but for adjusting a photo's saved crop instead of
 * a one-off shareable image.
 */
export default function FocalPointPicker({ open, imageUrl, initialFocalPoint, saving, onSave, onClose }: FocalPointPickerProps) {
  const [point, setPoint] = useState<FocalPoint>(initialFocalPoint ?? DEFAULT_FOCAL_POINT)
  const dragging = useRef(false)

  useEffect(() => {
    if (open) setPoint(initialFocalPoint ?? DEFAULT_FOCAL_POINT)
  }, [open, initialFocalPoint])

  function updateFromEvent(e: PointerEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100))
    const y = Math.min(100, Math.max(0, ((e.clientY - rect.top) / rect.height) * 100))
    setPoint({ x, y })
  }

  function handlePointerDown(e: PointerEvent<HTMLDivElement>) {
    dragging.current = true
    e.currentTarget.setPointerCapture(e.pointerId)
    updateFromEvent(e)
  }

  function handlePointerMove(e: PointerEvent<HTMLDivElement>) {
    if (!dragging.current) return
    updateFromEvent(e)
  }

  function handlePointerUp() {
    dragging.current = false
  }

  return createPortal(
    <AnimatePresence>
      {open && imageUrl && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[110] flex items-center justify-center bg-ink/50 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm rounded-xl3 bg-cream p-5 shadow-lift"
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-ink">ปรับตำแหน่งรูป</h2>
              <button
                onClick={onClose}
                aria-label="ปิด"
                className="rounded-full p-1.5 text-ink-soft transition-all hover:rotate-90 hover:bg-black/5 hover:text-ink active:scale-90"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              style={{ width: PREVIEW_SIZE, height: PREVIEW_SIZE }}
              className="relative mx-auto mb-2 cursor-move touch-none overflow-hidden rounded-xl2 border border-black/5 shadow-softer"
            >
              <img
                src={imageUrl}
                alt=""
                className="pointer-events-none h-full w-full object-cover"
                style={{ objectPosition: `${point.x}% ${point.y}%` }}
              />
              <div
                className="pointer-events-none absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow"
                style={{ left: `${point.x}%`, top: `${point.y}%` }}
              />
            </div>
            <p className="mb-4 flex items-center justify-center gap-1 text-center text-[11px] text-ink-muted">
              <Move className="h-3 w-3" /> ลากเพื่อเลือกจุดที่อยากให้อยู่กลางภาพ
            </p>

            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={onClose}>
                ยกเลิก
              </Button>
              <Button size="sm" onClick={() => onSave(point)} loading={saving}>
                บันทึก
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
