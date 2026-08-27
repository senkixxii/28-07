import { useEffect, useState, type FormEvent } from 'react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { useToast } from '@/contexts/ToastContext'
import { useAuth } from '@/contexts/AuthContext'
import { useLetters } from '@/hooks/useLetters'
import { uploadMemoryImage } from '@/lib/storage'
import { friendlyError } from '@/lib/supabase'
import type { Letter } from '@/types'

interface LetterFormModalProps {
  open: boolean
  onClose: () => void
  letter?: Letter
  onSaved: () => void
}

export default function LetterFormModal({ open, onClose, letter, onSaved }: LetterFormModalProps) {
  const { user } = useAuth()
  const { showToast } = useToast()
  const { createLetter, updateLetter } = useLetters()
  const isEdit = Boolean(letter)

  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [message, setMessage] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setTitle(letter?.title ?? '')
      setDate(letter?.letter_date ?? new Date().toISOString().slice(0, 10))
      setMessage(letter?.message ?? '')
      setImageFile(null)
      setImagePreview(letter?.image_url ?? null)
    }
  }, [open, letter])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!user) return
    if (!title.trim() || !message.trim()) {
      showToast('ใส่หัวข้อและข้อความก่อนนะ 🐻', 'error')
      return
    }

    setSaving(true)
    try {
      const payload = { title: title.trim(), letter_date: date, message: message.trim() }
      const saved = isEdit
        ? await updateLetter(letter!.id, payload)
        : await createLetter({ ...payload, image_url: null })

      if (imageFile) {
        const uploaded = await uploadMemoryImage(user.id, `letters/${saved.id}`, imageFile)
        await updateLetter(saved.id, { image_url: uploaded.imageUrl })
      }

      showToast(isEdit ? 'บันทึกจดหมายแล้วนะ 💌' : 'ส่งจดหมายฉบับใหม่แล้ว! 💌', 'success')
      onSaved()
      onClose()
    } catch (err) {
      showToast(friendlyError(err), 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'แก้ไขจดหมาย' : '✍️ เขียนจดหมายถึงเธอ'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input id="letter-title" label="หัวข้อ" placeholder="ถึงเธอ" required value={title} onChange={(e) => setTitle(e.target.value)} />
        <Input id="letter-date" type="date" label="วันที่" required value={date} onChange={(e) => setDate(e.target.value)} />
        <Textarea
          id="letter-message"
          label="ข้อความ"
          placeholder="ขอบคุณสำหรับทุกวันที่อยู่ข้างกันนะ..."
          rows={6}
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <div className="space-y-2">
          <p className="text-sm font-medium text-ink">รูปภาพแนบ (ไม่บังคับ)</p>
          {imagePreview && <img src={imagePreview} alt="" className="h-32 w-full rounded-xl2 object-cover" />}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
                setImageFile(file)
                setImagePreview(URL.createObjectURL(file))
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
    </Modal>
  )
}
