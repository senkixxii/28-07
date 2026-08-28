import { useEffect, useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import AppShell from '@/components/layout/AppShell'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import PageLoader from '@/components/bear/PageLoader'
import { useAuth } from '@/contexts/AuthContext'
import { useCoupleSettings } from '@/hooks/useCoupleSettings'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { uploadLoveBookImage } from '@/lib/storage'
import { friendlyError } from '@/lib/supabase'

export default function SettingsPage() {
  const { user } = useAuth()
  const { settings, loading, updateSettings } = useCoupleSettings()
  const reducedMotion = useReducedMotion()

  const [myName, setMyName] = useState('')
  const [partnerName, setPartnerName] = useState('')
  const [startDate, setStartDate] = useState('')
  const [myAvatar, setMyAvatar] = useState<string | null>(null)
  const [partnerAvatar, setPartnerAvatar] = useState<string | null>(null)
  const [couplePhoto, setCouplePhoto] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploadingKey, setUploadingKey] = useState<string | null>(null)

  useEffect(() => {
    if (settings) {
      setMyName(settings.my_name)
      setPartnerName(settings.partner_name)
      setStartDate(settings.relationship_start_date ?? '')
      setMyAvatar(settings.my_avatar_url)
      setPartnerAvatar(settings.partner_avatar_url)
      setCouplePhoto(settings.couple_photo_url)
    }
  }, [settings])

  async function handlePhotoChange(
    key: 'my_avatar_url' | 'partner_avatar_url' | 'couple_photo_url',
    file: File,
    setLocal: (url: string) => void,
  ) {
    if (!user) return
    setUploadingKey(key)
    try {
      const uploaded = await uploadLoveBookImage(user.id, `settings/${key}`, file)
      setLocal(uploaded.imageUrl)
      await updateSettings({ [key]: uploaded.imageUrl })
      toast.success('อัปเดตรูปแล้วนะ 💕')
    } catch (err) {
      toast.error(friendlyError(err))
    } finally {
      setUploadingKey(null)
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await updateSettings({
        my_name: myName.trim() || 'ฉัน',
        partner_name: partnerName.trim() || 'เธอ',
        relationship_start_date: startDate || null,
      })
      toast.success('บันทึกการตั้งค่าแล้วนะ 🐻💕')
    } catch (err) {
      toast.error(friendlyError(err))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <AppShell>
        <PageLoader />
      </AppShell>
    )
  }

  return (
    <AppShell title="⚙️ ตั้งค่า">
      <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-6">
        <motion.div
          initial={reducedMotion ? undefined : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <Card>
            <h2 className="mb-4 font-semibold text-ink">รูปโปรไฟล์คู่รัก</h2>
            <div className="flex flex-wrap items-center gap-6">
              <AvatarPicker label="รูปของฉัน" url={myAvatar} uploading={uploadingKey === 'my_avatar_url'} onChange={(file) => handlePhotoChange('my_avatar_url', file, setMyAvatar)} />
              <AvatarPicker label="รูปแฟน" url={partnerAvatar} uploading={uploadingKey === 'partner_avatar_url'} onChange={(file) => handlePhotoChange('partner_avatar_url', file, setPartnerAvatar)} />
              <AvatarPicker label="รูปคู่" url={couplePhoto} uploading={uploadingKey === 'couple_photo_url'} onChange={(file) => handlePhotoChange('couple_photo_url', file, setCouplePhoto)} />
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={reducedMotion ? undefined : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.08 }}
        >
          <Card className="space-y-4">
            <h2 className="font-semibold text-ink">ชื่อของเรา</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input id="my-name" label="ชื่อของเรา" value={myName} onChange={(e) => setMyName(e.target.value)} />
              <Input id="partner-name" label="ชื่อแฟน" value={partnerName} onChange={(e) => setPartnerName(e.target.value)} />
            </div>
            <Input id="start-date" type="date" label="วันที่เริ่มคบกัน" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </Card>
        </motion.div>

        <motion.div
          initial={reducedMotion ? undefined : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.16 }}
        >
          <Button type="submit" size="lg" loading={saving} className="w-full">
            บันทึกการตั้งค่า
          </Button>
        </motion.div>
      </form>
    </AppShell>
  )
}

function AvatarPicker({
  label,
  url,
  uploading,
  onChange,
}: {
  label: string
  url: string | null
  uploading: boolean
  onChange: (file: File) => void
}) {
  return (
    <label className="group flex cursor-pointer flex-col items-center gap-2">
      <div className="relative h-20 w-20 overflow-hidden rounded-full bg-soft-pink/50 shadow-softer ring-2 ring-transparent transition-all duration-200 group-hover:scale-105 group-hover:shadow-soft group-hover:ring-pastel-pink/60">
        {url ? <img src={url} alt={label} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-2xl">🐻</div>}
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-[10px] font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
          เปลี่ยนรูป
        </div>
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <Loader2 className="h-5 w-5 animate-spin text-white" />
          </div>
        )}
      </div>
      <span className="text-xs text-ink-soft transition-colors group-hover:text-ink">{label}</span>
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onChange(file)
          e.target.value = ''
        }}
      />
    </label>
  )
}
