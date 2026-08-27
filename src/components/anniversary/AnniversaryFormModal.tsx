import { useEffect, useState, type FormEvent } from 'react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { useToast } from '@/contexts/ToastContext'
import { useAuth } from '@/contexts/AuthContext'
import { useAnniversaries } from '@/hooks/useAnniversaries'
import { useCoupleSettings } from '@/hooks/useCoupleSettings'
import { uploadMemoryImage } from '@/lib/storage'
import { friendlyError } from '@/lib/supabase'
import { suggestAnniversaryLabel } from '@/lib/utils'
import type { Anniversary } from '@/types'

interface AnniversaryFormModalProps {
  open: boolean
  onClose: () => void
  anniversary?: Anniversary
  onSaved: () => void
}

export default function AnniversaryFormModal({ open, onClose, anniversary, onSaved }: AnniversaryFormModalProps) {
  const { user } = useAuth()
  const { showToast } = useToast()
  const { createAnniversary, updateAnniversary } = useAnniversaries()
  const { settings } = useCoupleSettings()
  const isEdit = Boolean(anniversary)

  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [message, setMessage] = useState('')
  const [description, setDescription] = useState('')
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setTitle(anniversary?.title ?? '')
      setDate(anniversary?.anniversary_date ?? new Date().toISOString().slice(0, 10))
      setMessage(anniversary?.message ?? '')
      setDescription(anniversary?.description ?? '')
      setCoverFile(null)
      setCoverPreview(anniversary?.cover_image_url ?? null)
    }
  }, [open, anniversary])

  function handleDateChange(value: string) {
    setDate(value)
    if (!title.trim() && settings?.relationship_start_date) {
      const suggestion = suggestAnniversaryLabel(new Date(settings.relationship_start_date), new Date(value))
      setTitle(suggestion.title)
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!user) return
    if (!title.trim() || !date) {
      showToast('ใส่ชื่อและวันที่ก่อนนะ 🐷', 'error')
      return
    }

    setSaving(true)
    try {
      let monthNumber = anniversary?.month_number ?? null
      let yearNumber = anniversary?.year_number ?? null
      if (settings?.relationship_start_date) {
        const suggestion = suggestAnniversaryLabel(new Date(settings.relationship_start_date), new Date(date))
        monthNumber = suggestion.monthNumber
        yearNumber = suggestion.yearNumber
      }

      const payload = {
        title: title.trim(),
        anniversary_date: date,
        description: description.trim() || null,
        message: message.trim() || null,
        month_number: monthNumber,
        year_number: yearNumber,
      }

      const saved = isEdit
        ? await updateAnniversary(anniversary!.id, payload)
        : await createAnniversary({ ...payload, cover_image_url: null })

      if (coverFile) {
        const uploaded = await uploadMemoryImage(user.id, `anniversaries/${saved.id}`, coverFile)
        await updateAnniversary(saved.id, { cover_image_url: uploaded.imageUrl })
      }

      showToast(isEdit ? 'บันทึกการแก้ไขแล้วนะ 💕' : 'เพิ่มวันครบรอบใหม่แล้ว! 🐷', 'success')
      onSaved()
      onClose()
    } catch (err) {
      showToast(friendlyError(err), 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'แก้ไขวันครบรอบ' : '+ เพิ่มวันครบรอบ'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input id="anniv-date" type="date" label="วันที่" required value={date} onChange={(e) => handleDateChange(e.target.value)} />
        <Input
          id="anniv-title"
          label="ชื่อวันครบรอบ"
          placeholder="ครบรอบ 6 เดือน"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Input
          id="anniv-message"
          label="ข้อความสั้นๆ"
          placeholder="365 วันที่มีเธอ"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <Textarea
          id="anniv-description"
          label="รายละเอียด"
          placeholder="วันนี้พิเศษยังไง..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className="space-y-2">
          <p className="text-sm font-medium text-ink">ภาพปก</p>
          {coverPreview && (
            <img src={coverPreview} alt="" className="h-32 w-full rounded-xl2 object-cover" />
          )}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
                setCoverFile(file)
                setCoverPreview(URL.createObjectURL(file))
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
            {isEdit ? 'บันทึกการแก้ไข' : 'เพิ่มวันครบรอบ'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
