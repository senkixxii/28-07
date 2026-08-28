import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { toast } from 'sonner'
import { Download, Share2, X } from 'lucide-react'
import Button from './Button'
import { downloadBlob, shareBlob, type ShareImageOptions } from '@/lib/shareImage'
import { friendlyError } from '@/lib/supabase'

interface ImagePreviewDialogProps {
  blob: Blob | null
  options: ShareImageOptions
  onClose: () => void
}

/**
 * Shows the generated image before it actually goes anywhere, so the user
 * can bail out if the layout came out wrong instead of finding out only
 * after it's already been sent. Renders at a higher z-index than any of the
 * pages that open it (including the letter and lightbox overlays), so it
 * always lands on top regardless of what triggered it.
 */
export default function ImagePreviewDialog({ blob, options, onClose }: ImagePreviewDialogProps) {
  const [url, setUrl] = useState<string | null>(null)
  const [sharing, setSharing] = useState(false)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    if (!blob) {
      setUrl(null)
      return
    }
    const objectUrl = URL.createObjectURL(blob)
    setUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [blob])

  async function handleShare() {
    if (!blob) return
    setSharing(true)
    try {
      await shareBlob(blob, options)
      onClose()
    } catch (err) {
      toast.error(friendlyError(err))
    } finally {
      setSharing(false)
    }
  }

  function handleDownload() {
    if (!blob) return
    setDownloading(true)
    try {
      downloadBlob(blob, options.filename)
      toast.success('บันทึกรูปภาพแล้วนะ')
      onClose()
    } finally {
      setDownloading(false)
    }
  }

  return createPortal(
    <AnimatePresence>
      {blob && (
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
            className="relative w-full max-w-md rounded-xl3 bg-cream p-5 shadow-lift"
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-ink">ตัวอย่างก่อนแชร์</h2>
              <button
                onClick={onClose}
                aria-label="ปิด"
                className="rounded-full p-1.5 text-ink-soft transition-all hover:rotate-90 hover:bg-black/5 hover:text-ink active:scale-90"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {url && (
              <div className="mb-4 overflow-hidden rounded-xl2 border border-black/5 bg-black/[0.02]">
                <img src={url} alt="ตัวอย่างรูปภาพ" className="max-h-[55vh] w-full object-contain" />
              </div>
            )}

            <div className="flex flex-wrap justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={onClose}>
                ยกเลิก
              </Button>
              <Button variant="secondary" size="sm" onClick={handleDownload} loading={downloading}>
                {!downloading && <Download className="h-3.5 w-3.5" />} ดาวน์โหลด
              </Button>
              <Button size="sm" onClick={handleShare} loading={sharing}>
                {!sharing && <Share2 className="h-3.5 w-3.5" />} แชร์
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
