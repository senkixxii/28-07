import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'
import AppShell from '@/components/layout/AppShell'
import PageLoader from '@/components/pig/PageLoader'
import EmptyState from '@/components/pig/EmptyState'
import { useMemories } from '@/hooks/useMemories'
import { useAnniversaries } from '@/hooks/useAnniversaries'
import { useCoupleSettings } from '@/hooks/useCoupleSettings'
import { formatThaiDate } from '@/lib/utils'

interface TimelineEntry {
  id: string
  date: string
  kind: 'start' | 'memory' | 'anniversary'
  title: string
  subtitle?: string
  link?: string
}

export default function Timeline() {
  const { memories, loading: memoriesLoading } = useMemories()
  const { anniversaries, loading: anniversariesLoading } = useAnniversaries()
  const { settings, loading: settingsLoading } = useCoupleSettings()

  const loading = memoriesLoading || anniversariesLoading || settingsLoading

  if (loading) {
    return (
      <AppShell title="🕰️ Timeline">
        <PageLoader />
      </AppShell>
    )
  }

  const entries: TimelineEntry[] = []

  if (settings?.relationship_start_date) {
    entries.push({
      id: 'start',
      date: settings.relationship_start_date,
      kind: 'start',
      title: 'วันแรกที่เราเริ่มคบกัน',
      subtitle: `${settings.my_name} & ${settings.partner_name}`,
    })
  }

  for (const m of memories) {
    entries.push({
      id: `memory-${m.id}`,
      date: m.memory_date,
      kind: 'memory',
      title: m.title,
      subtitle: m.location ?? undefined,
      link: `/memories/${m.id}`,
    })
  }

  for (const a of anniversaries) {
    entries.push({
      id: `anniversary-${a.id}`,
      date: a.anniversary_date,
      kind: 'anniversary',
      title: a.title,
      subtitle: a.message ?? undefined,
    })
  }

  entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  return (
    <AppShell title="🕰️ Timeline">
      {entries.length === 0 ? (
        <EmptyState title="เส้นเวลาของเรายังว่างอยู่" description="เริ่มบันทึกความทรงจำแรกกันเถอะ 🐷" />
      ) : (
        <div className="relative mx-auto max-w-2xl">
          <div className="absolute bottom-0 left-4 top-0 w-0.5 bg-pastel-pink/40 sm:left-1/2 sm:-translate-x-1/2" />
          <div className="space-y-8">
            {entries.map((entry, i) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className={`relative flex items-start gap-4 pl-10 sm:w-1/2 sm:pl-0 sm:pr-10 ${
                  i % 2 === 1 ? 'sm:ml-auto sm:pl-10 sm:pr-0 sm:text-left' : 'sm:text-right'
                }`}
              >
                <span
                  className={`absolute left-2.5 top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white shadow-softer sm:left-auto ${
                    i % 2 === 1 ? 'sm:-left-2' : 'sm:-right-2'
                  } ${
                    entry.kind === 'anniversary' ? 'bg-pastel-pink' : entry.kind === 'start' ? 'bg-lavender' : 'bg-baby-blue'
                  }`}
                />
                <div className="w-full rounded-xl2 border border-black/5 bg-white/80 p-4 shadow-softer">
                  <p className="text-xs text-ink-soft">
                    {entry.kind === 'anniversary' ? '💕' : entry.kind === 'start' ? '💕' : '📸'} {formatThaiDate(entry.date)}
                  </p>
                  {entry.link ? (
                    <Link to={entry.link} className="mt-1 block font-semibold text-ink hover:underline">
                      {entry.title}
                    </Link>
                  ) : (
                    <p className="mt-1 font-semibold text-ink">{entry.title}</p>
                  )}
                  {entry.subtitle && <p className="mt-0.5 text-sm text-ink-soft">{entry.subtitle}</p>}
                </div>
              </motion.div>
            ))}
          </div>
          <div className="mt-10 flex justify-center text-ink-soft">
            <Heart className="h-5 w-5" />
          </div>
        </div>
      )}
    </AppShell>
  )
}
