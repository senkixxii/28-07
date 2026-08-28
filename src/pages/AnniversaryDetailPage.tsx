import { useRef, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { ArrowLeft, Pencil, Share2, Trash2 } from 'lucide-react'
import AppShell from '@/components/layout/AppShell'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import ImagePreviewDialog from '@/components/ui/ImagePreviewDialog'
import Lightbox from '@/components/ui/Lightbox'
import PageLoader from '@/components/bear/PageLoader'
import AnniversaryFormModal from '@/components/anniversary/AnniversaryFormModal'
import MemoryPhotoLayout from '@/components/anniversary/MemoryPhotoLayout'
import { useAnniversary, useAnniversaries } from '@/hooks/useAnniversaries'
import { useAuth } from '@/contexts/AuthContext'
import { friendlyError } from '@/lib/supabase'
import { deleteLoveBookFolder } from '@/lib/storage'
import { captureNodeImage } from '@/lib/shareImage'
import { formatThaiDate } from '@/lib/dates'

const ROTATIONS = [-4, 3, -2, 4, -3, 2]

export default function AnniversaryDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const { anniversary, loading, refresh } = useAnniversary(id)
  const { deleteAnniversary } = useAnniversaries()
  const navigate = useNavigate()
  const pageRef = useRef<HTMLDivElement>(null)

  const [editOpen, setEditOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [capturing, setCapturing] = useState(false)
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  if (loading) {
    return (
      <AppShell>
        <PageLoader />
      </AppShell>
    )
  }

  if (!anniversary) {
    return (
      <AppShell>
        <Card className="text-center">
          <p className="text-ink-soft">ไม่พบหน้านี้ในสมุดของเรานะ 🐻</p>
          <Link to="/anniversaries">
            <Button variant="ghost" className="mt-4">
              กลับไปหน้าครบรอบ
            </Button>
          </Link>
        </Card>
      </AppShell>
    )
  }

  async function handleDelete() {
    if (!anniversary || !user) return
    setDeleting(true)
    try {
      await deleteAnniversary(anniversary.id)
      await deleteLoveBookFolder(user.id, `anniversaries/${anniversary.id}`)
      toast.success('ลบหน้าความทรงจำแล้วนะ')
      navigate('/anniversaries')
    } catch (err) {
      toast.error(friendlyError(err))
    } finally {
      setDeleting(false)
      setConfirmOpen(false)
    }
  }

  async function handlePreviewShare() {
    if (!anniversary || !pageRef.current) return
    setCapturing(true)
    try {
      const blob = await captureNodeImage(pageRef.current)
      setPreviewBlob(blob)
    } catch (err) {
      toast.error(friendlyError(err))
    } finally {
      setCapturing(false)
    }
  }

  const cover = anniversary.cover_image_url ?? anniversary.anniversary_images[0]?.image_url ?? null
  const extraImages = anniversary.anniversary_images.filter((img) => img.image_url !== cover)
  const images = anniversary.anniversary_images.map((img) => ({ url: img.image_url, alt: anniversary.title }))

  return (
    <AppShell>
      <Link to="/anniversaries" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> กลับไปสมุดครบรอบ
      </Link>

      <motion.div
        ref={pageRef}
        initial={{ opacity: 0, rotateY: -6 }}
        animate={{ opacity: 1, rotateY: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        style={{ transformPerspective: 1400 }}
        className="grid grid-cols-1 overflow-hidden rounded-xl3 border border-black/5 bg-warm-white shadow-page lg:grid-cols-2"
      >
        {/* Left page */}
        <div className="paper-texture relative flex flex-col items-center justify-center gap-4 border-b border-black/5 p-8 lg:border-b-0 lg:border-r">
          {anniversary.photo_layout === 'single' ? (
            <>
              <div className="aspect-square w-full max-w-xs overflow-hidden rounded-xl2 bg-soft-pink/40 shadow-softer">
                {cover ? (
                  <button onClick={() => setLightboxIndex(0)} className="block h-full w-full">
                    <img src={cover} alt={anniversary.title} className="h-full w-full object-cover" />
                  </button>
                ) : (
                  <div className="flex h-full items-center justify-center text-5xl">🐻</div>
                )}
              </div>

              {extraImages.length > 0 && (
                <div className="mt-2 flex flex-wrap justify-center gap-4 pt-4">
                  {extraImages.map((img, i) => (
                    <button
                      key={img.id}
                      onClick={() => setLightboxIndex(images.findIndex((x) => x.url === img.image_url))}
                      className="rounded-sm bg-white p-1.5 pb-4 shadow-softer transition-transform hover:scale-105"
                      style={{ transform: `rotate(${ROTATIONS[i % ROTATIONS.length]}deg)` }}
                    >
                      <img src={img.image_url} alt="" className="h-20 w-20 object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <MemoryPhotoLayout
              images={images.map((img) => img.url)}
              layout={anniversary.photo_layout}
              alt={anniversary.title}
              onImageClick={setLightboxIndex}
              className="w-full max-w-xs"
            />
          )}

          <p className="text-sm text-ink-soft">{formatThaiDate(anniversary.anniversary_date)}</p>
        </div>

        {/* Right page */}
        <div className="paper-texture flex flex-col justify-center p-8 sm:p-10">
          <p className="text-xs font-medium text-ink-muted">{String(anniversary.month_number).padStart(2, '0')}</p>
          <h1 className="mt-1 text-2xl font-semibold text-ink">{anniversary.title}</h1>
          {anniversary.message && <p className="mt-4 whitespace-pre-line leading-relaxed text-ink">{anniversary.message}</p>}
        </div>
      </motion.div>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
        <Button variant="secondary" size="sm" onClick={() => setEditOpen(true)}>
          <Pencil className="h-3.5 w-3.5" /> แก้ไข
        </Button>
        <Button variant="ghost" size="sm" onClick={handlePreviewShare} loading={capturing}>
          {!capturing && <Share2 className="h-3.5 w-3.5" />} แชร์รูปภาพ
        </Button>
        <Button variant="danger" size="sm" onClick={() => setConfirmOpen(true)}>
          <Trash2 className="h-3.5 w-3.5" /> ลบ
        </Button>
      </div>

      <Lightbox images={images} index={lightboxIndex} onClose={() => setLightboxIndex(null)} onNavigate={setLightboxIndex} />

      <ImagePreviewDialog
        blob={previewBlob}
        onClose={() => setPreviewBlob(null)}
        options={{
          // Some browsers mangle non-ASCII filenames on blob downloads, so keep
          // this part plain — the Thai title/text below still show up in the
          // native share sheet where Unicode works fine.
          filename: `love-book-anniversary-${anniversary.month_number}.png`,
          title: anniversary.title,
          text: `${anniversary.title} · ${formatThaiDate(anniversary.anniversary_date)}`,
        }}
      />

      <AnniversaryFormModal open={editOpen} onClose={() => setEditOpen(false)} anniversary={anniversary} onSaved={refresh} />

      <ConfirmDialog
        open={confirmOpen}
        title="อยากลบหน้าความทรงจำนี้จริง ๆ เหรอ?"
        description="สิ่งที่เขียนไว้จะถูกลบออกจากสมุดของเรา"
        confirmLabel="ลบหน้าความทรงจำ"
        cancelLabel="เก็บไว้"
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </AppShell>
  )
}
