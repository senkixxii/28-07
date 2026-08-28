import { useRef, useState, type PointerEvent, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Move, X } from 'lucide-react'
import Button from './Button'
import { SHARE_ASPECT_RATIOS, type FocalPoint, type ShareAspectRatio } from '@/lib/shareCardLayout'
import { cn } from '@/lib/utils'

const PREVIEW_WIDTH = 260
const MAX_GRID_PHOTOS = 4

type PhotoLayout = 'single' | 'grid'

interface ShareCustomizeDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  capturing: boolean
  aspectRatio: ShareAspectRatio
  onAspectRatioChange: (ratio: ShareAspectRatio) => void
  hasPhoto: boolean
  focalPoint: FocalPoint
  onFocalPointChange: (point: FocalPoint) => void
  photoOptions?: string[]
  selectedPhoto?: string | null
  onSelectPhoto?: (url: string) => void
  /** When provided (2+ photos available), shows a เดี่ยว/หลายรูป toggle
   * and switches the thumbnail row to multi-select for the grid layout. */
  photoLayout?: PhotoLayout
  onPhotoLayoutChange?: (layout: PhotoLayout) => void
  selectedPhotos?: string[]
  onTogglePhoto?: (url: string) => void
  /** The live ShareCard component instance, rendered at its real 1080px width — this dialog scales it down for display. */
  children: ReactNode
}

/**
 * Lets the user adjust the shareable image's shape (aspect ratio), which
 * photo leads it, and where the photo is cropped — before it's captured —
 * because an automatic layout alone still can't guess the right crop for
 * every photo, and "it doesn't look nice" needs a way to actually fix it.
 */
export default function ShareCustomizeDialog({
  open,
  onClose,
  onConfirm,
  capturing,
  aspectRatio,
  onAspectRatioChange,
  hasPhoto,
  focalPoint,
  onFocalPointChange,
  photoOptions,
  selectedPhoto,
  onSelectPhoto,
  photoLayout,
  onPhotoLayoutChange,
  selectedPhotos,
  onTogglePhoto,
  children,
}: ShareCustomizeDialogProps) {
  const dragging = useRef(false)
  const { width, height, photoHeight } = SHARE_ASPECT_RATIOS[aspectRatio]
  const scale = PREVIEW_WIDTH / width
  const previewHeight = height * scale
  const photoPreviewHeight = photoHeight * scale
  const isGrid = photoLayout === 'grid'

  function updateFocalPointFromEvent(e: PointerEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100))
    const y = Math.min(100, Math.max(0, ((e.clientY - rect.top) / rect.height) * 100))
    onFocalPointChange({ x, y })
  }

  function handlePointerDown(e: PointerEvent<HTMLDivElement>) {
    dragging.current = true
    e.currentTarget.setPointerCapture(e.pointerId)
    updateFocalPointFromEvent(e)
  }

  function handlePointerMove(e: PointerEvent<HTMLDivElement>) {
    if (!dragging.current) return
    updateFocalPointFromEvent(e)
  }

  function handlePointerUp() {
    dragging.current = false
  }

  return createPortal(
    <AnimatePresence>
      {open && (
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
              <h2 className="text-sm font-semibold text-ink">ปรับรูปแบบก่อนแชร์</h2>
              <button
                onClick={onClose}
                aria-label="ปิด"
                className="rounded-full p-1.5 text-ink-soft transition-all hover:rotate-90 hover:bg-black/5 hover:text-ink active:scale-90"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-4 flex justify-center gap-1.5 rounded-full bg-black/5 p-1">
              {(Object.keys(SHARE_ASPECT_RATIOS) as ShareAspectRatio[]).map((key) => (
                <button
                  key={key}
                  onClick={() => onAspectRatioChange(key)}
                  className={cn(
                    'flex-1 rounded-full px-2 py-1.5 text-xs font-medium transition-colors',
                    aspectRatio === key ? 'bg-warm-white text-ink shadow-softer' : 'text-ink-soft hover:text-ink',
                  )}
                >
                  {SHARE_ASPECT_RATIOS[key].label}
                </button>
              ))}
            </div>

            {onPhotoLayoutChange && photoOptions && photoOptions.length > 1 && (
              <div className="mb-4 flex justify-center gap-1.5 rounded-full bg-black/5 p-1">
                {(
                  [
                    { key: 'single' as const, label: 'รูปเดียว' },
                    { key: 'grid' as const, label: 'หลายรูป' },
                  ]
                ).map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => onPhotoLayoutChange(key)}
                    className={cn(
                      'flex-1 rounded-full px-2 py-1.5 text-xs font-medium transition-colors',
                      (photoLayout ?? 'single') === key ? 'bg-warm-white text-ink shadow-softer' : 'text-ink-soft hover:text-ink',
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}

            <div className="mx-auto mb-4 overflow-hidden rounded-xl2 border border-black/5 shadow-softer" style={{ width: PREVIEW_WIDTH }}>
              <div style={{ width: PREVIEW_WIDTH, height: previewHeight, position: 'relative', overflow: 'hidden' }}>
                <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}>{children}</div>

                {hasPhoto && !isGrid && (
                  <div
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                    style={{ position: 'absolute', top: 0, left: 0, width: PREVIEW_WIDTH, height: photoPreviewHeight }}
                    className="flex cursor-move touch-none items-end justify-center bg-black/0 pb-2 active:bg-black/10"
                  >
                    <span className="flex items-center gap-1 rounded-full bg-black/40 px-2 py-1 text-[10px] text-white opacity-80">
                      <Move className="h-3 w-3" /> ลากเพื่อเลื่อนรูป
                    </span>
                  </div>
                )}
              </div>
            </div>

            {photoOptions && photoOptions.length > 1 && (
              <div className="mb-4 flex flex-wrap justify-center gap-2">
                {photoOptions.map((url) => {
                  const isSelected = isGrid ? (selectedPhotos ?? []).includes(url) : selectedPhoto === url
                  const gridFull = isGrid && !isSelected && (selectedPhotos ?? []).length >= MAX_GRID_PHOTOS
                  return (
                    <button
                      key={url}
                      disabled={gridFull}
                      onClick={() => (isGrid ? onTogglePhoto?.(url) : onSelectPhoto?.(url))}
                      className={cn(
                        'h-12 w-12 overflow-hidden rounded-lg border-2 transition-all',
                        isSelected ? 'border-accent' : 'border-transparent opacity-70 hover:opacity-100',
                        gridFull && 'cursor-not-allowed opacity-30',
                      )}
                    >
                      <img src={url} alt="" className="h-full w-full object-cover" />
                    </button>
                  )
                })}
              </div>
            )}
            {isGrid && <p className="-mt-2 mb-4 text-center text-[11px] text-ink-muted">เลือกได้สูงสุด {MAX_GRID_PHOTOS} รูป</p>}

            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={onClose}>
                ยกเลิก
              </Button>
              <Button size="sm" onClick={onConfirm} loading={capturing}>
                ดูตัวอย่าง
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
