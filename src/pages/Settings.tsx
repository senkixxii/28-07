import { useEffect, useState, type FormEvent } from 'react'
import AppShell from '@/components/layout/AppShell'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import PageLoader from '@/components/pig/PageLoader'
import { useAuth } from '@/contexts/AuthContext'
import { useCoupleSettings } from '@/hooks/useCoupleSettings'
import { useToast } from '@/contexts/ToastContext'
import { uploadMemoryImage } from '@/lib/storage'
import { friendlyError } from '@/lib/supabase'

const THEME_OPTIONS = [
  { value: 'pastel', label: 'ชมพูพาสเทล', swatch: '#F8BBD0' },
  { value: 'lavender', label: 'ลาเวนเดอร์', swatch: '#E8DFF5' },
  { value: 'blue', label: 'ฟ้าเบบี้', swatch: '#D6EAF8' },
]

export default function Settings() {
  const { user } = useAuth()
  const { settings, loading, updateSettings } = useCoupleSettings()
  const { showToast } = useToast()

  const [myName, setMyName] = useState('')
  const [partnerName, setPartnerName] = useState('')
  const [startDate, setStartDate] = useState('')
  const [reminderDays, setReminderDays] = useState(3)
  const [theme, setTheme] = useState('pastel')
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
      setReminderDays(settings.reminder_days_before)
      setTheme(settings.theme_preference)
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
      const uploaded = await uploadMemoryImage(user.id, `settings/${key}`, file)
      setLocal(uploaded.imageUrl)
      await updateSettings({ [key]: uploaded.imageUrl })
      showToast('อัปเดตรูปแล้วนะ 💕', 'success')
    } catch (err) {
      showToast(friendlyError(err), 'error')
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
        reminder_days_before: reminderDays,
        theme_preference: theme,
      })
      document.documentElement.dataset.theme = theme
      showToast('บันทึกการตั้งค่าแล้วนะ 🐷💕', 'success')
    } catch (err) {
      showToast(friendlyError(err), 'error')
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
        <Card>
          <h2 className="mb-4 font-semibold text-ink">รูปโปรไฟล์คู่รัก</h2>
          <div className="flex flex-wrap items-center gap-6">
            <AvatarPicker
              label="ของฉัน"
              url={myAvatar}
              uploading={uploadingKey === 'my_avatar_url'}
              onChange={(file) => handlePhotoChange('my_avatar_url', file, setMyAvatar)}
            />
            <AvatarPicker
              label="ของเธอ"
              url={partnerAvatar}
              uploading={uploadingKey === 'partner_avatar_url'}
              onChange={(file) => handlePhotoChange('partner_avatar_url', file, setPartnerAvatar)}
            />
            <AvatarPicker
              label="รูปคู่"
              url={couplePhoto}
              uploading={uploadingKey === 'couple_photo_url'}
              onChange={(file) => handlePhotoChange('couple_photo_url', file, setCouplePhoto)}
            />
          </div>
        </Card>

        <Card className="space-y-4">
          <h2 className="font-semibold text-ink">ชื่อของเรา</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input id="my-name" label="ชื่อของฉัน" value={myName} onChange={(e) => setMyName(e.target.value)} />
            <Input id="partner-name" label="ชื่อของเธอ" value={partnerName} onChange={(e) => setPartnerName(e.target.value)} />
          </div>
          <Input
            id="start-date"
            type="date"
            label="วันที่เริ่มคบกัน"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </Card>

        <Card className="space-y-4">
          <h2 className="font-semibold text-ink">การแจ้งเตือนวันครบรอบ</h2>
          <Input
            id="reminder-days"
            type="number"
            min={0}
            max={30}
            label="แจ้งเตือนล่วงหน้า (วัน)"
            value={reminderDays}
            onChange={(e) => setReminderDays(Number(e.target.value))}
          />
        </Card>

        <Card className="space-y-4">
          <h2 className="font-semibold text-ink">ธีมสี</h2>
          <div className="flex gap-3">
            {THEME_OPTIONS.map((opt) => (
              <button
                type="button"
                key={opt.value}
                onClick={() => setTheme(opt.value)}
                className={`flex flex-col items-center gap-1.5 rounded-2xl border-2 px-4 py-3 text-xs font-medium transition-colors ${
                  theme === opt.value ? 'border-ink' : 'border-transparent'
                }`}
              >
                <span className="h-8 w-8 rounded-full" style={{ backgroundColor: opt.swatch }} />
                {opt.label}
              </button>
            ))}
          </div>
        </Card>

        <Button type="submit" size="lg" loading={saving} className="w-full">
          บันทึกการตั้งค่า
        </Button>
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
    <label className="flex cursor-pointer flex-col items-center gap-2">
      <div className="relative h-20 w-20 overflow-hidden rounded-full bg-soft-pink/50 shadow-softer">
        {url ? (
          <img src={url} alt={label} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-2xl">🐷</div>
        )}
        {uploading && <div className="absolute inset-0 flex items-center justify-center bg-black/30 text-xs text-white">...</div>}
      </div>
      <span className="text-xs text-ink-soft">{label}</span>
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
