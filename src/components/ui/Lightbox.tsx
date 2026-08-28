import { useEffect, useCallback, useRef, useState, type MouseEvent } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { toast } from 'sonner'
import { ChevronLeft, ChevronRight, Download, Loader2, Share2, X, ZoomIn, ZoomOut } from 'lucide-react'
import { downloadImageFromUrl, shareImageFromUrl } from '@/lib/shareImage'
import { friendlyError } from '@/lib/supabase'

interface LightboxProps {
  images: { url: string; alt?: string }[]
  index: number | null
  onClose: () => void
  onNavigate: (index: number) => void
}

function extensionFromUrl(url: string): string {
  const match = /\.(jpe?g|png|webp|gif)(?:$|\?)/i.exec(url)
  return match ? match[1].toLowerCase() : 'jpg'
}

export default function Lightbox({ images, index, onClose, onNavigate }: LightboxProps) {
  const open = index !== null
  const current = index !== null ? images[index] : null
  const [zoomed, setZoomed] = useState(false)
  const [sharing, setSharing] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const didDragRef = useRef(false)

  const goPrev = useCallback(() => {
    if (index === null) return
    setZoomed(false)
    onNavigate((index - 1 + images.length) % images.length)
  }, [index, images.length, onNavigate])

  const goNext = useCallback(() => {
    if (index === null) return
    setZoomed(false)
    onNavigate((index + 1) % images.length)
  }, [index, images.length, onNavigate])

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'ArrowRight') goNext()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose, goPrev, goNext])

  async function handleShare(e: MouseEvent) {
    e.stopPropagation()
    if (!current) return
    setSharing(true)
    try {
      await shareImageFromUrl(current.url, {
        filename: `love-book-photo.${extensionFromUrl(current.url)}`,
        title: current.alt || undefined,
      })
    } catch (err) {
      toast.error(friendlyError(err))
    } finally {
      setSharing(false)
    }
  }

  async function handleDownload(e: MouseEvent) {
    e.stopPropagation()
    if (!current) return
    setDownloading(true)
    try {
      await downloadImageFromUrl(current.url, `love-book-photo.${extensionFromUrl(current.url)}`)
      toast.success('บันทึกรูปภาพแล้วนะ')
    } catch (err) {
      toast.error(friendlyError(err))
    } finally {
      setDownloading(false)
    }
  }

  return createPortal(
    <AnimatePresence>
      {open && current && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4"
          role="dialog"
          aria-modal="true"
          onClick={onClose}
        >
          <div className="absolute right-4 top-4 flex items-center gap-2">
            <button
              onClick={handleShare}
              disabled={sharing}
              aria-label="แชร์รูปภาพ"
              className="rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20 disabled:opacity-60"
            >
              {sharing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Share2 className="h-5 w-5" />}
            </button>
            <button
              onClick={handleDownload}
              disabled={downloading}
              aria-label="ดาวน์โหลดรูปภาพ"
              className="rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20 disabled:opacity-60"
            >
              {downloading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}
            </button>
            <button
              onClick={onClose}
              aria-label="ปิด"
              className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation()
              setZoomed((z) => !z)
            }}
            aria-label={zoomed ? 'ย่อรูป' : 'ขยายรูป'}
            className="absolute left-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          >
            {zoomed ? <ZoomOut className="h-5 w-5" /> : <ZoomIn className="h-5 w-5" />}
          </button>

          {images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                goPrev()
              }}
              aria-label="รูปก่อนหน้า"
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 sm:left-4"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}

          <motion.img
            key={current.url}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: zoomed ? 1.6 : 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            src={current.url}
            alt={current.alt ?? ''}
            className={`max-h-[85vh] max-w-full touch-pan-y rounded-xl2 object-contain shadow-lift transition-transform ${zoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}
            drag={!zoomed && images.length > 1 ? 'x' : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.6}
            onDragStart={() => {
              didDragRef.current = true
            }}
            onDragEnd={(_, info) => {
              if (info.offset.x < -60 || info.velocity.x < -400) goNext()
              else if (info.offset.x > 60 || info.velocity.x > 400) goPrev()
              setTimeout(() => {
                didDragRef.current = false
              }, 50)
            }}
            onClick={(e) => {
              e.stopPropagation()
              if (didDragRef.current) return
              setZoomed((z) => !z)
            }}
          />

          {images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                goNext()
              }}
              aria-label="รูปถัดไป"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 sm:right-4"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}

          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-xs text-white">
              {index !== null ? index + 1 : 0} / {images.length}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
