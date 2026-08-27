import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { BookHeart, ChevronLeft, ChevronRight, Image as ImageIcon, Mail } from 'lucide-react'
import AppShell from '@/components/layout/AppShell'
import PaperPage from '@/components/book/PaperPage'
import Lightbox from '@/components/ui/Lightbox'
import PageLoader from '@/components/bear/PageLoader'
import EmptyState from '@/components/bear/EmptyState'
import MemoryPhotoLayout from '@/components/anniversary/MemoryPhotoLayout'
import { useMemoryTimeline } from '@/hooks/useMemoryTimeline'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { formatThaiDate } from '@/lib/dates'

const KIND_META = {
  anniversary: { label: 'ครบรอบ', icon: BookHeart },
  letter: { label: 'จดหมาย', icon: Mail },
  photo: { label: 'รูปภาพ', icon: ImageIcon },
} as const

export default function MemoryBookPage() {
  const { entries, loading } = useMemoryTimeline()
  const reducedMotion = useReducedMotion()
  const [index, setIndex] = useState<number | null>(null)
  const [direction, setDirection] = useState(1)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const currentIndex = index ?? Math.max(0, entries.length - 1)
  const current = entries[currentIndex]

  function go(delta: number) {
    setDirection(delta)
    setIndex((prev) => {
      const from = prev ?? Math.max(0, entries.length - 1)
      return Math.min(entries.length - 1, Math.max(0, from + delta))
    })
    setLightboxIndex(null)
  }

  if (loading) {
    return (
      <AppShell title="สมุดความทรงจำ 📖">
        <PageLoader />
      </AppShell>
    )
  }

  if (entries.length === 0) {
    return (
      <AppShell title="สมุดความทรงจำ 📖">
        <EmptyState
          icon="📖"
          showBear={false}
          title="ยังไม่มีความทรงจำในสมุดเลยนะ"
          description="ลองเพิ่มหน้าครบรอบ จดหมาย หรือรูปภาพดูสิ แล้วมันจะมารวมกันที่นี่"
        />
      </AppShell>
    )
  }

  const Icon = KIND_META[current.kind].icon
  const lightboxImages = current.images.map((url) => ({ url, alt: current.title }))

  return (
    <AppShell title="สมุดความทรงจำ 📖">
      <p className="mb-4 text-sm text-ink-soft">
        หน้า {currentIndex + 1} จาก {entries.length} · เรียงตามวันที่ความทรงจำเกิดขึ้น
      </p>

      <div className="relative" style={{ perspective: 1600 }}>
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.div
            key={current.id}
            custom={direction}
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, rotateY: direction > 0 ? 40 : -40, x: direction > 0 ? 24 : -24 }}
            animate={{ opacity: 1, rotateY: 0, x: 0 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, rotateY: direction > 0 ? -40 : 40, x: direction > 0 ? -24 : 24 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformStyle: 'preserve-3d' }}
          >
            <PaperPage className="grid grid-cols-1 gap-6 p-6 sm:p-8 lg:grid-cols-2">
              <MemoryPhotoLayout
                images={current.images}
                layout={current.layout}
                alt={current.title}
                onImageClick={setLightboxIndex}
              />

              <div className="flex flex-col justify-center">
                <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[var(--accent-bg)]/60 px-3 py-1 text-xs font-medium text-ink">
                  <Icon className="h-3.5 w-3.5" /> {KIND_META[current.kind].label}
                </span>
                <p className="mt-3 text-sm text-ink-soft">{formatThaiDate(current.date)}</p>
                {current.title && <h2 className="mt-1 text-xl font-semibold text-ink">{current.title}</h2>}
                {current.message && <p className="mt-3 whitespace-pre-line leading-relaxed text-ink">{current.message}</p>}

                <Link to={current.linkTo} className="mt-5 inline-flex w-fit text-sm font-medium text-accent hover:underline">
                  เปิดดูต้นฉบับ →
                </Link>
              </div>
            </PaperPage>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-5 flex items-center justify-center gap-3">
        <button
          onClick={() => go(-1)}
          disabled={currentIndex === 0}
          aria-label="ความทรงจำก่อนหน้า"
          className="rounded-full bg-warm-white p-2.5 text-ink shadow-softer transition-transform hover:scale-105 disabled:pointer-events-none disabled:opacity-40"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={() => go(1)}
          disabled={currentIndex === entries.length - 1}
          aria-label="ความทรงจำถัดไป"
          className="rounded-full bg-warm-white p-2.5 text-ink shadow-softer transition-transform hover:scale-105 disabled:pointer-events-none disabled:opacity-40"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <Lightbox images={lightboxImages} index={lightboxIndex} onClose={() => setLightboxIndex(null)} onNavigate={setLightboxIndex} />
    </AppShell>
  )
}
