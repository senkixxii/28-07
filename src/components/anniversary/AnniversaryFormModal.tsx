import { useEffect, useState, type FormEvent } from 'react'
import { GripVertical, Star, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import ImageUploader, { type PendingImage } from '@/components/ui/ImageUploader'
import PhotoLayoutPicker from '@/components/anniversary/PhotoLayoutPicker'
import { useAuth } from '@/contexts/AuthContext'
import { useAnniversaries } from '@/hooks/useAnniversaries'
import { useCoupleSettings } from '@/hooks/useCoupleSettings'
import { uploadLoveBookImage, deleteLoveBookImage } from '@/lib/storage'
import { friendlyError } from '@/lib/supabase'
import { monthsElapsed } from '@/lib/dates'
import type { AnniversaryImage, AnniversaryWithImages, PhotoLayout } from '@/types'

interface AnniversaryFormModalProps {
  open: boolean
  onClose: () => void
  anniversary?: AnniversaryWithImages
  onSaved: () => void
}

export default function AnniversaryFormModal({ open, onClose, anniversary, onSaved }: AnniversaryFormModalProps) {
  const { user } = useAuth()
  const { settings } = useCoupleSettings()
  const { createAnniversary, updateAnniversary, addAnniversaryImage, removeAnniversaryImage, reorderAnniversaryImages } =
    useAnniversaries()
  const isEdit = Boolean(anniversary)

  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [monthNumber, setMonthNumber] = useState(1)
  const [message, setMessage] = useState('')
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null)
  const [existingImages, setExistingImages] = useState<AnniversaryImage[]>([])
  const [pending, setPending] = useState<PendingImage[]>([])
  const [photoLayout, setPhotoLayout] = useState<PhotoLayout>('single')
  const [saving, setSaving] = useState(false)
  const [dragId, setDragId] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setTitle(anniversary?.title ?? '')
      const initialDate = anniversary?.anniversary_date ?? new Date().toISOString().slice(0, 10)
      setDate(initialDate)
      setMonthNumber(
        anniversary?.month_number ??
          (settings?.relationship_start_date ? Math.max(1, monthsElapsed(new Date(settings.relationship_start_date), new Date(initialDate))) : 1),
      )
      setMessage(anniversary?.message ?? '')
      setCoverImageUrl(anniversary?.cover_image_url ?? null)
      setExistingImages(anniversary?.anniversary_images ?? [])
      setPending([])
      setPhotoLayout(anniversary?.photo_layout ?? 'single')
    }
  }, [open, anniversary, settings])

  function handleDateChange(value: string) {
    setDate(value)
    if (settings?.relationship_start_date) {
      setMonthNumber(Math.max(1, monthsElapsed(new Date(settings.relationship_start_date), new Date(value))))
    }
  }

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

  function handleRemovePending(id: string) {
    setPending((prev) => prev.filter((p) => p.id !== id))
  }

  async function handleRemoveExisting(img: AnniversaryImage) {
    try {
      await removeAnniversaryImage(img.id)
      await deleteLoveBookImage(img.storage_path)
      setExistingImages((prev) => prev.filter((i) => i.id !== img.id))
      if (coverImageUrl === img.image_url) setCoverImageUrl(null)
      toast.success('ลบรูปแล้วนะ')
    } catch (err) {
      toast.error(friendlyError(err))
    }
  }

  function handleReorder(fromId: string, toId: string) {
    if (fromId === toId) return
    setExistingImages((prev) => {
      const fromIdx = prev.findIndex((i) => i.id === fromId)
      const toIdx = prev.findIndex((i) => i.id === toId)
      if (fromIdx === -1 || toIdx === -1) return prev
      const next = [...prev]
      const [moved] = next.splice(fromIdx, 1)
      next.splice(toIdx, 0, moved)
      return next
    })
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!user) return
    if (!title.trim() || !date) {
      toast.error('ใส่ชื่อเรื่องและวันที่ก่อนนะ 🐻')
      return
    }

    setSaving(true)
    try {
      const basePayload = {
        title: title.trim(),
        anniversary_date: date,
        month_number: monthNumber,
        message: message.trim() || null,
        photo_layout: photoLayout,
      }

      const anniversaryId = isEdit ? anniversary!.id : (await createAnniversary({ ...basePayload, cover_image_url: null })).id

      let newCover = coverImageUrl

      for (const img of pending) {
        setPending((prev) => prev.map((p) => (p.id === img.id ? { ...p, status: 'uploading' } : p)))
        try {
          const uploaded = await uploadLoveBookImage(user.id, `anniversaries/${anniversaryId}`, img.file)
          await addAnniversaryImage({
            anniversary_id: anniversaryId,
            user_id: user.id,
            image_url: uploaded.imageUrl,
            storage_path: uploaded.storagePath,
            sort_order: existingImages.length + pending.indexOf(img),
          })
          if (!newCover) newCover = uploaded.imageUrl
          setPending((prev) => prev.map((p) => (p.id === img.id ? { ...p, status: 'done' } : p)))
        } catch (err) {
          setPending((prev) => prev.map((p) => (p.id === img.id ? { ...p, status: 'error' } : p)))
          toast.error(friendlyError(err))
        }
      }

      if (existingImages.length > 0) {
        await reorderAnniversaryImages(existingImages.map((img, i) => ({ id: img.id, sort_order: i })))
      }

      await updateAnniversary(anniversaryId, { ...basePayload, cover_image_url: newCover })

      toast.success(isEdit ? 'บันทึกหน้าครบรอบแล้วนะ 💕' : 'เขียนหน้าครบรอบใหม่แล้ว! 🐻')
      onSaved()
      onClose()
    } catch (err) {
      toast.error(friendlyError(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'แก้ไขหน้าครบรอบ' : '+ เขียนหน้าครบรอบ'} maxWidth="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input id="anniv-title" label="ชื่อเรื่อง" placeholder="เดือนแรกของเรา" required value={title} onChange={(e) => setTitle(e.target.value)} />

        <div className="grid grid-cols-2 gap-4">
          <Input id="anniv-date" type="date" label="วันที่" required value={date} onChange={(e) => handleDateChange(e.target.value)} />
          <Input
            id="anniv-month"
            type="number"
            min={1}
            label="จำนวนเดือน"
            required
            value={monthNumber}
            onChange={(e) => setMonthNumber(Number(e.target.value))}
            hint="คำนวณให้อัตโนมัติจากวันเริ่มคบกัน แก้ไขเองได้"
          />
        </div>

        <Textarea id="anniv-message" label="ข้อความ" placeholder="ขอบคุณที่อยู่ด้วยกันนะ..." rows={5} value={message} onChange={(e) => setMessage(e.target.value)} />

        <div className="space-y-2">
          <p className="text-sm font-medium text-ink">รูปภาพ</p>

          {existingImages.length > 0 && (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {existingImages.map((img) => (
                <div
                  key={img.id}
                  draggable
                  onDragStart={() => setDragId(img.id)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    if (dragId) handleReorder(dragId, img.id)
                    setDragId(null)
                  }}
                  className="group relative aspect-square cursor-grab overflow-hidden rounded-xl2 bg-black/5 active:cursor-grabbing"
                >
                  <img src={img.image_url} alt="" className="h-full w-full object-cover" />
                  <span className="absolute bottom-1 left-1 rounded-full bg-black/40 p-1 text-white opacity-0 group-hover:opacity-100">
                    <GripVertical className="h-3 w-3" />
                  </span>
                  <button
                    type="button"
                    onClick={() => setCoverImageUrl(img.image_url)}
                    aria-label="ตั้งเป็นภาพปก"
                    className={`absolute left-1 top-1 rounded-full p-1 ${
                      coverImageUrl === img.image_url ? 'bg-pastel-pink text-white' : 'bg-black/40 text-white opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    <Star className="h-3.5 w-3.5" fill={coverImageUrl === img.image_url ? 'currentColor' : 'none'} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveExisting(img)}
                    aria-label="ลบรูปนี้"
                    className="absolute right-1 top-1 rounded-full bg-black/50 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <ImageUploader pending={pending} onAdd={handleAddFiles} onRemove={handleRemovePending} disabled={saving} />

          {existingImages.length + pending.length >= 2 && (
            <div className="space-y-1.5 pt-1">
              <p className="text-sm font-medium text-ink">รูปแบบการแสดงรูป</p>
              <PhotoLayoutPicker value={photoLayout} onChange={setPhotoLayout} />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>
            ยกเลิก
          </Button>
          <Button type="submit" loading={saving}>
            {isEdit ? 'บันทึกการแก้ไข' : 'เขียนหน้าครบรอบ'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
