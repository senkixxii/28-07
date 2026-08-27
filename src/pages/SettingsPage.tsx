import { useEffect, useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { Check, Copy, Loader2, RefreshCw, Users } from 'lucide-react'
import AppShell from '@/components/layout/AppShell'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import PageLoader from '@/components/bear/PageLoader'
import { useAuth } from '@/contexts/AuthContext'
import { useCouple } from '@/contexts/CoupleContext'
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
      <div className="mx-auto max-w-2xl space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
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

        <motion.div
          initial={reducedMotion ? undefined : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.24 }}
        >
          <ShareCoupleCard />
        </motion.div>
      </div>
    </AppShell>
  )
}

function ShareCoupleCard() {
  const { inviteCode, members, loading, joinCouple, regenerateInviteCode } = useCouple()
  const [joinCode, setJoinCode] = useState('')
  const [joining, setJoining] = useState(false)
  const [regenerating, setRegenerating] = useState(false)
  const [copied, setCopied] = useState(false)

  if (loading) return null

  const isShared = members.length >= 2

  async function handleCopy() {
    if (!inviteCode) return
    try {
      await navigator.clipboard.writeText(inviteCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      toast.error('คัดลอกไม่ได้นะ ลองเลือกข้อความเองดูสิ')
    }
  }

  async function handleRegenerate() {
    setRegenerating(true)
    try {
      await regenerateInviteCode()
      toast.success('สร้างรหัสเชิญใหม่แล้วนะ')
    } catch (err) {
      toast.error(friendlyError(err))
    } finally {
      setRegenerating(false)
    }
  }

  async function handleJoin(e: FormEvent) {
    e.preventDefault()
    if (!joinCode.trim()) return
    setJoining(true)
    try {
      await joinCouple(joinCode.trim())
      toast.success('เข้าร่วมสมุดเล่มนี้แล้วนะ 💕')
      setJoinCode('')
    } catch (err) {
      toast.error(friendlyError(err))
    } finally {
      setJoining(false)
    }
  }

  return (
    <Card className="space-y-4">
      <h2 className="flex items-center gap-1.5 font-semibold text-ink">
        <Users className="h-4 w-4 text-accent" /> แชร์สมุดกับแฟน
      </h2>

      {isShared ? (
        <div className="rounded-2xl bg-baby-blue/30 px-4 py-3 text-sm text-ink">
          คุณสองคนแชร์สมุดเล่มนี้อยู่แล้วนะ 💕
          <ul className="mt-2 space-y-1 text-ink-soft">
            {members.map((m) => (
              <li key={m.userId}>🐻 {m.displayName ?? 'คนในสมุดนี้'}</li>
            ))}
          </ul>
        </div>
      ) : (
        <>
          <div>
            <p className="mb-1.5 text-sm font-medium text-ink">รหัสเชิญของคุณ</p>
            <p className="mb-2 text-xs text-ink-soft">
              ส่งรหัสนี้ให้แฟนคุณ ให้เขาสมัครสมาชิก แล้วมาใส่รหัสด้านล่างนี้ เพื่อดูสมุดเล่มเดียวกัน
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded-xl2 border border-black/10 bg-black/[0.03] px-3 py-2 text-center text-sm font-semibold tracking-widest text-ink">
                {inviteCode ?? '········'}
              </code>
              <button
                type="button"
                onClick={handleCopy}
                aria-label="คัดลอกรหัสเชิญ"
                className="flex h-9 w-9 items-center justify-center rounded-xl2 border border-black/10 text-ink-soft transition-all hover:bg-black/5 hover:text-ink active:scale-95"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
              </button>
              <button
                type="button"
                onClick={handleRegenerate}
                disabled={regenerating}
                aria-label="สร้างรหัสใหม่"
                className="flex h-9 w-9 items-center justify-center rounded-xl2 border border-black/10 text-ink-soft transition-all hover:bg-black/5 hover:text-ink active:scale-95 disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${regenerating ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          <div className="border-t border-black/5 pt-4">
            <form onSubmit={handleJoin} className="space-y-2">
              <p className="text-sm font-medium text-ink">มีรหัสเชิญจากแฟนแล้ว?</p>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    id="join-code"
                    placeholder="ใส่รหัสเชิญตรงนี้"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                  />
                </div>
                <Button type="submit" variant="secondary" loading={joining} disabled={!joinCode.trim()}>
                  เข้าร่วม
                </Button>
              </div>
              <p className="text-xs text-ink-muted">การเข้าร่วมจะใช้ได้เฉพาะบัญชีที่ยังไม่มีข้อมูลของตัวเองนะ</p>
            </form>
          </div>
        </>
      )}
    </Card>
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
