import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import AppShell from '@/components/layout/AppShell'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import BearIllustration from '@/components/bear/BearIllustration'
import PageLoader from '@/components/bear/PageLoader'
import CountdownDisplay from '@/components/book/CountdownDisplay'
import { useCoupleSettings } from '@/hooks/useCoupleSettings'
import { useAnniversaries } from '@/hooks/useAnniversaries'
import { useNow } from '@/hooks/useCountdown'
import { getCurrentAnniversary, getNextAnniversary, formatThaiDate, parseThaiDateOnly } from '@/lib/dates'

export default function BookHomePage() {
  const { settings, loading: settingsLoading } = useCoupleSettings()
  const { anniversaries, loading: anniversariesLoading } = useAnniversaries()
  const now = useNow(1000)

  if (settingsLoading || anniversariesLoading) {
    return (
      <AppShell>
        <PageLoader />
      </AppShell>
    )
  }

  const startDate = settings?.relationship_start_date ? parseThaiDateOnly(settings.relationship_start_date) : null
  const current = startDate ? getCurrentAnniversary(startDate, now) : null
  const next = startDate ? getNextAnniversary(startDate, now) : null

  const currentPage = current
    ? anniversaries.find((a) => a.month_number === current.monthNumber) ??
      [...anniversaries].reverse().find((a) => parseThaiDateOnly(a.anniversary_date) <= now)
    : anniversaries[anniversaries.length - 1]

  return (
    <AppShell>
      <Card className="mb-6 overflow-hidden bg-gradient-to-br from-[var(--accent-bg)]/50 via-warm-white to-baby-blue/30 p-6 sm:p-8">
        <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <h2 className="text-2xl font-semibold text-ink sm:text-3xl">สวัสดีความรักของเรา 💕</h2>
            <p className="mt-2 text-sm text-ink-soft">วันนี้เป็นอีกหนึ่งวันที่เราได้มีเธออยู่ด้วยกัน</p>

            {current ? (
              <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-1.5 text-sm font-medium text-ink">
                💕 ครบรอบ {current.monthNumber} เดือน
                <span className="text-ink-soft">· {formatThaiDate(current.date)}</span>
              </div>
            ) : (
              <p className="mt-4 text-sm text-ink-soft">
                ยังไม่ได้ตั้งวันที่เริ่มคบกันเลยนะ{' '}
                <Link to="/settings" className="font-medium text-ink underline">
                  ไปตั้งค่ากันเถอะ
                </Link>
              </p>
            )}
          </div>

          <BearIllustration pose="bear-love" alt="หมีกอดหัวใจ" size={140} fallbackMood="happy" />
        </div>
      </Card>

      {current?.isToday && (
        <Card className="mb-6 text-center">
          <p className="flex items-center justify-center gap-1.5 text-sm font-medium text-ink">
            <Sparkles className="h-4 w-4 text-accent" />
            วันนี้แหละ ครบรอบ {current.monthNumber} เดือนของเรา! 🎉
          </p>
        </Card>
      )}

      {next && (
        <Card className="mb-6 text-center">
          <p className="mb-1 flex items-center justify-center gap-1.5 text-sm font-medium text-ink">
            <Sparkles className="h-4 w-4 text-accent" />
            อีก {next.daysUntil} วัน จะถึงวันครบรอบของเรา 💕
          </p>
          <div className="mt-4">
            <CountdownDisplay target={next.date} />
          </div>
        </Card>
      )}

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        {currentPage ? (
          <Link to={`/anniversaries/${currentPage.id}`}>
            <Card className="paper-texture cursor-pointer transition-shadow hover:shadow-lift">
              <p className="text-xs text-ink-soft">Our {currentPage.month_number === 1 ? 'First' : `Month ${currentPage.month_number}`}</p>
              <p className="mt-1 text-lg font-semibold text-ink">{currentPage.title}</p>
              <p className="mt-1 text-sm text-ink-soft">{formatThaiDate(currentPage.anniversary_date)}</p>
              {currentPage.message && <p className="mt-3 italic text-ink">"{currentPage.message}"</p>}
              <span className="mt-4 inline-block text-sm font-medium text-accent">เปิดอ่าน →</span>
            </Card>
          </Link>
        ) : (
          <Card className="text-center">
            <p className="text-ink-soft">🐻 ยังไม่มีหน้าไหนในสมุดของเราเลยนะ</p>
            <Link to="/anniversaries">
              <Button className="mt-4">+ เขียนหน้าครบรอบ</Button>
            </Link>
          </Card>
        )}
      </motion.div>
    </AppShell>
  )
}
