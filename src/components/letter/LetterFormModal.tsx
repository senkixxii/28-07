import { useEffect, useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { Move } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import FocalPointPicker from '@/components/ui/FocalPointPicker'
import { useAuth } from '@/contexts/AuthContext'
import { useLetters } from '@/hooks/useLetters'
import { uploadLoveBookImage } from '@/lib/storage'
import { friendlyError } from '@/lib/supabase'
import { todayThaiDateString } from '@/lib/dates'
import { DEFAULT_FOCAL_POINT, type FocalPoint } from '@/lib/shareCardLayout'
import type { Letter } from '@/types'

interface LetterFormModalProps {
  open: boolean
  onClose: () => void
  letter?: Letter
  onSaved: () => void
}

export default function LetterFormModal({ open, onClose, letter, onSaved }: LetterFormModalProps) {
  const { user } = useAuth()
  const { createLetter, updateLetter } = useLetters()
  const isEdit = Boolean(letter)

  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [message, setMessage] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageFocalPoint, setImageFocalPoint] = useState<FocalPoint>(DEFAULT_FOCAL_POINT)
  const [focalPickerOpen, setFocalPickerOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const maxChars = 2000

  useEffect(() => {
    if (open) {
      setTitle(letter?.title ?? '')
      setDate(letter?.letter_date ?? todayThaiDateString())
      setMessage(letter?.message ?? '')
      setImageFile(null)
      setImagePreview(letter?.image_url ?? null)
      setImageFocalPoint(letter ? { x: letter.image_focal_x, y: letter.image_focal_y } : DEFAULT_FOCAL_POINT)
    }
  }, [open, letter])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!user) return
    if (!title.trim() || !message.trim()) {
      toast.error('ใส่หัวข้อและข้อความก่อนนะ 🐻')
      return
    }

    setSaving(true)
    try {
      const payload = {
        title: title.trim(),
        letter_date: date,
        message: message.trim(),
        image_focal_x: imageFocalPoint.x,
        image_focal_y: imageFocalPoint.y,
      }
      const saved = isEdit ? await updateLetter(letter!.id, payload) : await createLetter({ ...payload, image_url: null })

      if (imageFile) {
        const uploaded = await uploadLoveBookImage(user.id, `letters/${saved.id}`, imageFile)
        await updateLetter(saved.id, { image_url: uploaded.imageUrl })
      }

      toast.success(isEdit ? 'บันทึกจดหมายแล้วนะ 💌' : 'ส่งจดหมายฉบับใหม่แล้ว! 💌')
      onSaved()
      onClose()
    } catch (err) {
      toast.error(friendlyError(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'แก้ไขจดหมาย' : '+ เขียนจดหมาย'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input id="letter-title" label="หัวข้อ" placeholder="ถึงเธอ" required value={title} onChange={(e) => setTitle(e.target.value)} />
        <Input id="letter-date" type="date" label="วันที่" required value={date} onChange={(e) => setDate(e.target.value)} />
        <div>
          <Textarea
            id="letter-message"
            label="ข้อความ"
            placeholder="วันนี้เราอยากบอกว่า..."
            rows={7}
            required
            maxLength={maxChars}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="leading-loose"
          />
          <p className="mt-1 text-right text-xs text-ink-muted">
            {message.length} / {maxChars}
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-ink">รูปภาพแนบ (ไม่บังคับ)</p>
          {imagePreview && (
            <div className="group relative">
              <img
                src={imagePreview}
                alt=""
                className="h-32 w-full rounded-xl2 object-cover"
                style={{ objectPosition: `${imageFocalPoint.x}% ${imageFocalPoint.y}%` }}
              />
              <button
                type="button"
                onClick={() => setFocalPickerOpen(true)}
                aria-label="ปรับตำแหน่งรูป"
                className="absolute bottom-1.5 right-1.5 rounded-full bg-black/40 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                <Move className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
                setImageFile(file)
                setImagePreview(URL.createObjectURL(file))
                setImageFocalPoint(DEFAULT_FOCAL_POINT)
              }
            }}
            className="text-sm text-ink-soft"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>
            ยกเลิก
          </Button>
          <Button type="submit" loading={saving}>
            {isEdit ? 'บันทึกการแก้ไข' : 'ส่งจดหมาย'}
          </Button>
        </div>
      </form>

      <FocalPointPicker
        open={focalPickerOpen}
        imageUrl={imagePreview}
        initialFocalPoint={imageFocalPoint}
        onSave={(point) => {
          setImageFocalPoint(point)
          setFocalPickerOpen(false)
        }}
        onClose={() => setFocalPickerOpen(false)}
      />
    </Modal>
  )
}
