import { useState } from 'react'
import { toast } from 'sonner'
import { AnimatePresence } from 'framer-motion'
import { Plus } from 'lucide-react'
import AppShell from '@/components/layout/AppShell'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import Lightbox from '@/components/ui/Lightbox'
import ImageUploader, { type PendingImage } from '@/components/ui/ImageUploader'
import { CardSkeletonGrid } from '@/components/ui/Skeleton'
import EmptyState from '@/components/bear/EmptyState'
import PolaroidCard from '@/components/photo/PolaroidCard'
import SaveCelebration from '@/components/book/SaveCelebration'
import { useGalleryImages } from '@/hooks/useGalleryImages'
import { useCelebration } from '@/hooks/useCelebration'
import { useAuth } from '@/contexts/AuthContext'
import { uploadLoveBookImage, deleteLoveBookImage } from '@/lib/storage'
import { friendlyError } from '@/lib/supabase'
import type { GalleryImage } from '@/types'

export default function PhotosPage() {
  const { user } = useAuth()
  const { images, loading, refresh, addImage, deleteImage } = useGalleryImages()
  const { show: celebrating, celebrate } = useCelebration()

  const [uploadOpen, setUploadOpen] = useState(false)
  const [pending, setPending] = useState<PendingImage[]>([])
  const [uploading, setUploading] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<GalleryImage | null>(null)
  const [deleting, setDeleting] = useState(false)

  function handleAddFiles(files: File[]) {
    setPending((prev) => [
      ...prev,
      ...files.map((file) => ({
        id: Math.random().toString(36).slice(2),
        file,
        previewUrl: URL.createObjectURL(file),
        status: 'pending' as const,
      })),
    ])
  }

  async function handleUploadAll() {
    if (!user || pending.length === 0) return
    setUploading(true)
    try {
      for (const img of pending) {
        setPending((prev) => prev.map((p) => (p.id === img.id ? { ...p, status: 'uploading' } : p)))
        try {
          const uploaded = await uploadLoveBookImage(user.id, 'gallery', img.file)
          await addImage({ image_url: uploaded.imageUrl, storage_path: uploaded.storagePath, caption: null })
        } catch (err) {
          toast.error(friendlyError(err))
        }
      }
      toast.success('เพิ่มรูปลงสมุดแล้วนะ 📸')
      setPending([])
      setUploadOpen(false)
      refresh()
      celebrate()
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteImage(deleteTarget.id)
      await deleteLoveBookImage(deleteTarget.storage_path)
      toast.success('ลบรูปแล้วนะ')
      refresh()
    } catch (err) {
      toast.error(friendlyError(err))
    } finally {
      setDeleting(false)
      setDeleteTarget(null)
    }
  }

  const lightboxImages = images.map((img) => ({ url: img.image_url, alt: img.caption ?? '' }))

  return (
    <AppShell title="สมุดรูปภาพของเรา 📸">
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-ink-soft">รูปทั้งหมด {images.length} รูป</p>
        <Button size="sm" onClick={() => setUploadOpen(true)}>
          <Plus className="h-4 w-4" /> เพิ่มรูป
        </Button>
      </div>

      {loading ? (
        <CardSkeletonGrid count={8} />
      ) : images.length === 0 ? (
        <EmptyState
          icon="📸"
          showBear={false}
          title="ยังไม่มีรูปในสมุดของเรา"
          action={<Button onClick={() => setUploadOpen(true)}>+ เพิ่มรูปแรก</Button>}
        />
      ) : (
        <div className="flex flex-wrap justify-center gap-6 sm:justify-start">
          <AnimatePresence>
            {images.map((img, i) => (
              <PolaroidCard key={img.id} image={img} index={i} onClick={() => setLightboxIndex(i)} onDelete={() => setDeleteTarget(img)} />
            ))}
          </AnimatePresence>
        </div>
      )}

      <SaveCelebration show={celebrating} />

      <Modal open={uploadOpen} onClose={() => !uploading && setUploadOpen(false)} title="เพิ่มรูปลงสมุด">
        <div className="space-y-4">
          <ImageUploader pending={pending} onAdd={handleAddFiles} onRemove={(id) => setPending((p) => p.filter((x) => x.id !== id))} disabled={uploading} />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setUploadOpen(false)} disabled={uploading}>
              ยกเลิก
            </Button>
            <Button onClick={handleUploadAll} loading={uploading} disabled={pending.length === 0}>
              เพิ่มรูป ({pending.length})
            </Button>
          </div>
        </div>
      </Modal>

      <Lightbox images={lightboxImages} index={lightboxIndex} onClose={() => setLightboxIndex(null)} onNavigate={setLightboxIndex} />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="อยากลบรูปนี้จริง ๆ เหรอ?"
        confirmLabel="ลบรูป"
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </AppShell>
  )
}
