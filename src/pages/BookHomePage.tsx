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
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { getCurrentAnniversary, getNextAnniversary, formatThaiDate, parseThaiDateOnly } from '@/lib/dates'

export default function BookHomePage() {
  const { settings, loading: settingsLoading } = useCoupleSettings()
  const { anniversaries, loading: anniversariesLoading } = useAnniversaries()
  const now = useNow(1000)
  const reducedMotion = useReducedMotion()

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

  const fadeUp = (delay: number) => ({
    initial: reducedMotion ? undefined : { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] as const },
  })

  return (
    <AppShell>
      <motion.div {...fadeUp(0)}>
        <Card className="mb-6 overflow-hidden bg-gradient-to-br from-[var(--accent-bg)]/50 via-warm-white to-baby-blue/30 p-6 sm:p-8">
          <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:justify-between sm:text-left">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">สวัสดีความรักของเรา 💕</h2>
              <p className="mt-2 text-sm text-ink-soft">วันนี้เป็นอีกหนึ่งวันที่เราได้มีเธออยู่ด้วยกัน</p>

              {current ? (
                <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-1.5 text-sm font-medium text-ink shadow-softer">
                  💕 ครบรอบ {current.monthNumber} เดือน
                  <span className="text-ink-soft">· {formatThaiDate(current.date)}</span>
                </div>
              ) : (
                <p className="mt-4 text-sm text-ink-soft">
                  ยังไม่ได้ตั้งวันที่เริ่มคบกันเลยนะ{' '}
                  <Link to="/settings" className="font-medium text-ink underline decoration-pastel-pink decoration-2 underline-offset-2 transition-colors hover:text-accent">
                    ไปตั้งค่ากันเถอะ
                  </Link>
                </p>
              )}
            </div>

            <motion.div whileHover={reducedMotion ? undefined : { scale: 1.05, rotate: -2 }} transition={{ type: 'spring', stiffness: 300, damping: 15 }}>
              <BearIllustration pose="bear-love" alt="หมีกอดหัวใจ" size={140} fallbackMood="happy" />
            </motion.div>
          </div>
        </Card>
      </motion.div>

      {current?.isToday && (
        <motion.div {...fadeUp(0.08)}>
          <Card className="mb-6 text-center">
            <p className="flex items-center justify-center gap-1.5 text-sm font-medium text-ink">
              <Sparkles className="h-4 w-4 text-accent" />
              วันนี้แหละ ครบรอบ {current.monthNumber} เดือนของเรา! 🎉
            </p>
          </Card>
        </motion.div>
      )}

      {next && (
        <motion.div {...fadeUp(0.14)}>
          <Card className="mb-6 text-center">
            <p className="mb-1 flex items-center justify-center gap-1.5 text-sm font-medium text-ink">
              <Sparkles className="h-4 w-4 text-accent" />
              อีก {next.daysUntil} วัน จะถึงวันครบรอบของเรา 💕
            </p>
            <div className="mt-4">
              <CountdownDisplay target={next.date} />
            </div>
          </Card>
        </motion.div>
      )}

      <motion.div {...fadeUp(0.2)}>
        {currentPage ? (
          <Link to={`/anniversaries/${currentPage.id}`}>
            <Card className="paper-texture cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift">
              <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
                Our {currentPage.month_number === 1 ? 'First' : `Month ${currentPage.month_number}`}
              </p>
              <p className="mt-1 text-lg font-semibold text-ink">{currentPage.title}</p>
              <p className="mt-1 text-sm text-ink-soft">{formatThaiDate(currentPage.anniversary_date)}</p>
              {currentPage.message && <p className="mt-3 italic text-ink">"{currentPage.message}"</p>}
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent transition-transform group-hover:translate-x-0.5">
                เปิดอ่าน →
              </span>
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
