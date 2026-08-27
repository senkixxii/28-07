import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BookHeart, Calendar, Camera, Heart, Sparkles } from 'lucide-react'
import AppShell from '@/components/layout/AppShell'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import PigMascot from '@/components/pig/PigMascot'
import PageLoader from '@/components/pig/PageLoader'
import EmptyState from '@/components/pig/EmptyState'
import { useCoupleSettings } from '@/hooks/useCoupleSettings'
import { useMemories } from '@/hooks/useMemories'
import { useAnniversaries } from '@/hooks/useAnniversaries'
import { useNow } from '@/hooks/useCountdown'
import { formatThaiDate, getNextAnniversary, getRelationshipDuration } from '@/lib/utils'

export default function Dashboard() {
  const { settings, loading: settingsLoading } = useCoupleSettings()
  const { memories, loading: memoriesLoading } = useMemories()
  const { anniversaries } = useAnniversaries()
  const now = useNow()

  if (settingsLoading || memoriesLoading) {
    return (
      <AppShell>
        <PageLoader />
      </AppShell>
    )
  }

  const startDate = settings?.relationship_start_date ? new Date(settings.relationship_start_date) : null
  const duration = startDate ? getRelationshipDuration(startDate, now) : null
  const nextAnniversary = startDate ? getNextAnniversary(startDate, now) : null

  const totalPhotos = memories.reduce((sum, m) => sum + m.memory_images.length, 0)
  const latestMemory = memories[0]

  return (
    <AppShell>
      {/* Hero */}
      <Card className="mb-6 overflow-hidden bg-gradient-to-br from-[var(--accent-bg)]/60 via-white to-baby-blue/40 p-6 sm:p-8">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
          <div className="text-center sm:text-left">
            <p className="mb-1 text-sm font-medium text-ink-soft">Our Story 💕</p>
            <h2 className="mb-3 text-2xl font-semibold text-ink sm:text-3xl">
              {settings?.my_name ?? 'ฉัน'} &amp; {settings?.partner_name ?? 'เธอ'}
            </h2>

            {duration ? (
              <>
                <p className="text-sm text-ink-soft">เรารักกันมาแล้ว</p>
                <p className="text-xl font-semibold text-ink">
                  {duration.years > 0 && `${duration.years} ปี `}
                  {duration.months > 0 && `${duration.months} เดือน `}
                  {duration.days} วัน
                </p>
              </>
            ) : (
              <p className="text-sm text-ink-soft">
                ยังไม่ได้ตั้งวันที่เริ่มคบกันเลยนะ{' '}
                <Link to="/settings" className="font-medium text-ink underline">
                  ไปตั้งค่ากันเถอะ
                </Link>
              </p>
            )}

            {nextAnniversary && (
              <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-[var(--accent-bg)]/50 px-4 py-1.5 text-sm font-medium text-ink">
                💕 วันครบรอบครั้งต่อไป อีก {nextAnniversary.daysUntil} วัน
              </div>
            )}
          </div>
          <PigMascot size={120} mood="happy" float />
        </div>
      </Card>

      {/* Stat cards */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={<Calendar className="h-5 w-5" />}
          label="คบกันมาแล้ว"
          value={duration ? `${duration.totalDays} วัน` : '—'}
        />
        <StatCard
          icon={<Sparkles className="h-5 w-5" />}
          label="วันครบรอบถัดไป"
          value={nextAnniversary ? formatThaiDate(nextAnniversary.date) : '—'}
        />
        <StatCard icon={<BookHeart className="h-5 w-5" />} label="ความทรงจำทั้งหมด" value={`${memories.length}`} />
        <StatCard icon={<Camera className="h-5 w-5" />} label="รูปภาพทั้งหมด" value={`${totalPhotos}`} />
      </div>

      {/* Anniversaries + latest memory */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <div className="mb-3 flex items-center gap-2">
            <Heart className="h-5 w-5 text-pastel-pink" />
            <h3 className="font-semibold text-ink">วันครบรอบ</h3>
          </div>
          <p className="text-sm text-ink-soft">บันทึกไว้แล้ว {anniversaries.length} ครั้ง</p>
          <Link to="/anniversaries">
            <Button variant="secondary" size="sm" className="mt-4">
              ดูทั้งหมด
            </Button>
          </Link>
        </Card>

        <Card className="lg:col-span-2">
          <h3 className="mb-3 font-semibold text-ink">ความทรงจำล่าสุด</h3>
          {latestMemory ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col gap-4 sm:flex-row"
            >
              <div className="h-40 w-full shrink-0 overflow-hidden rounded-xl2 bg-black/5 sm:w-48">
                {latestMemory.cover_image_url || latestMemory.memory_images[0] ? (
                  <img
                    src={latestMemory.cover_image_url ?? latestMemory.memory_images[0].image_url}
                    alt={latestMemory.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-ink-soft">
                    <Camera className="h-8 w-8" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="text-xs text-ink-soft">{formatThaiDate(latestMemory.memory_date)}</p>
                <p className="mt-1 font-semibold text-ink">{latestMemory.title}</p>
                <p className="mt-1 line-clamp-2 text-sm text-ink-soft">{latestMemory.description}</p>
                <Link to={`/memories/${latestMemory.id}`}>
                  <Button variant="ghost" size="sm" className="mt-3 px-0 text-accent hover:bg-transparent">
                    เปิดความทรงจำ →
                  </Button>
                </Link>
              </div>
            </motion.div>
          ) : (
            <EmptyState
              title="🐷 วันนี้มีความทรงจำใหม่หรือยัง?"
              description="มาเพิ่มเรื่องราวของเรากันเถอะ"
              action={
                <Link to="/memories">
                  <Button size="sm">+ เพิ่มความทรงจำ</Button>
                </Link>
              }
            />
          )}
        </Card>
      </div>
    </AppShell>
  )
}

function StatCard({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <Card className="flex flex-col gap-2">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-lavender/60 text-ink">{icon}</div>
      <p className="text-xs text-ink-soft">{label}</p>
      <p className="text-lg font-semibold leading-tight text-ink">{value}</p>
    </Card>
  )
}
