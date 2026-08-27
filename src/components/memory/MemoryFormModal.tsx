import { useEffect, useState, type FormEvent } from 'react'
import { Star, Trash2 } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import ImageUploader, { type PendingImage } from './ImageUploader'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { useMemories } from '@/hooks/useMemories'
import { uploadMemoryImage, deleteMemoryImage } from '@/lib/storage'
import { friendlyError } from '@/lib/supabase'
import type { MemoryWithImages } from '@/types'

interface MemoryFormModalProps {
  open: boolean
  onClose: () => void
  memory?: MemoryWithImages
  onSaved: () => void
}

export default function MemoryFormModal({ open, onClose, memory, onSaved }: MemoryFormModalProps) {
  const { user } = useAuth()
  const { showToast } = useToast()
  const { createMemory, updateMemory, addMemoryImage, removeMemoryImage } = useMemories()
  const isEdit = Boolean(memory)

  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')
  const [personalMessage, setPersonalMessage] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null)
  const [existingImages, setExistingImages] = useState(memory?.memory_images ?? [])
  const [pending, setPending] = useState<PendingImage[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setTitle(memory?.title ?? '')
      setDate(memory?.memory_date ?? new Date().toISOString().slice(0, 10))
      setLocation(memory?.location ?? '')
      setDescription(memory?.description ?? '')
      setPersonalMessage(memory?.personal_message ?? '')
      setTagsInput(memory?.tags.join(', ') ?? '')
      setCoverImageUrl(memory?.cover_image_url ?? null)
      setExistingImages(memory?.memory_images ?? [])
      setPending([])
    }
  }, [open, memory])

  function handleAddFiles(files: File[]) {
    const newPending: PendingImage[] = files.map((file) => ({
      id: Math.random().toString(36).slice(2),
      file,
      previewUrl: URL.createObjectURL(file),
      progress: 0,
      status: 'pending',
    }))
    setPending((prev) => [...prev, ...newPending])
  }

  function handleRemovePending(id: string) {
    setPending((prev) => prev.filter((p) => p.id !== id))
  }

  async function handleRemoveExisting(imageId: string, storagePath: string, imageUrl: string) {
    try {
      await removeMemoryImage(imageId)
      await deleteMemoryImage(storagePath)
      setExistingImages((prev) => prev.filter((img) => img.id !== imageId))
      if (coverImageUrl === imageUrl) setCoverImageUrl(null)
      showToast('ลบรูปแล้วนะ', 'success')
    } catch (err) {
      showToast(friendlyError(err), 'error')
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!user) return
    if (!title.trim()) {
      showToast('ใส่ชื่อความทรงจำก่อนนะ 🐻', 'error')
      return
    }

    setSaving(true)
    try {
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)

      const basePayload = {
        title: title.trim(),
        memory_date: date,
        location: location.trim() || null,
        description: description.trim() || null,
        personal_message: personalMessage.trim() || null,
        tags,
      }

      const memoryId = isEdit
        ? memory!.id
        : (
            await createMemory({
              ...basePayload,
              cover_image_url: null,
            })
          ).id

      let newCover = coverImageUrl

      for (const img of pending) {
        setPending((prev) => prev.map((p) => (p.id === img.id ? { ...p, status: 'uploading' } : p)))
        try {
          const uploaded = await uploadMemoryImage(user.id, memoryId, img.file, (percent) => {
            setPending((prev) => prev.map((p) => (p.id === img.id ? { ...p, progress: percent } : p)))
          })
          await addMemoryImage({
            memory_id: memoryId,
            user_id: user.id,
            image_url: uploaded.imageUrl,
            storage_path: uploaded.storagePath,
            sort_order: existingImages.length + pending.indexOf(img),
          })
          if (!newCover) newCover = uploaded.imageUrl
          setPending((prev) => prev.map((p) => (p.id === img.id ? { ...p, status: 'done' } : p)))
        } catch (err) {
          setPending((prev) => prev.map((p) => (p.id === img.id ? { ...p, status: 'error' } : p)))
          showToast(friendlyError(err), 'error')
        }
      }

      await updateMemory(memoryId, { ...basePayload, cover_image_url: newCover })

      showToast(isEdit ? 'บันทึกความทรงจำแล้วนะ 💕' : 'เพิ่มความทรงจำใหม่แล้ว! 🐻', 'success')
      onSaved()
      onClose()
    } catch (err) {
      showToast(friendlyError(err), 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'แก้ไขความทรงจำ' : '+ เพิ่มความทรงจำ'} maxWidth="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="memory-title"
          label="ชื่อความทรงจำ"
          placeholder="วันแรกที่เราไปเที่ยวด้วยกัน"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            id="memory-date"
            type="date"
            label="วันที่"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <Input
            id="memory-location"
            label="สถานที่"
            placeholder="จันทบุรี"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        <Textarea
          id="memory-description"
          label="เรื่องราว"
          placeholder="วันนี้เรา..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <Textarea
          id="memory-message"
          label="ข้อความถึงเธอ"
          placeholder="ขอบคุณที่อยู่ด้วยกันนะ ❤️"
          rows={2}
          value={personalMessage}
          onChange={(e) => setPersonalMessage(e.target.value)}
        />

        <Input
          id="memory-tags"
          label="แท็ก (คั่นด้วยจุลภาค)"
          placeholder="ทริป, วันเกิด, เที่ยว"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
        />

        <div className="space-y-2">
          <p className="text-sm font-medium text-ink">รูปภาพ</p>

          {existingImages.length > 0 && (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {existingImages.map((img) => (
                <div key={img.id} className="group relative aspect-square overflow-hidden rounded-xl2 bg-black/5">
                  <img src={img.image_url} alt="" className="h-full w-full object-cover" />
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
                    onClick={() => handleRemoveExisting(img.id, img.storage_path, img.image_url)}
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
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>
            ยกเลิก
          </Button>
          <Button type="submit" loading={saving}>
            {isEdit ? 'บันทึกการแก้ไข' : 'เพิ่มความทรงจำ'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
