import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { BookHeart, ChevronLeft, ChevronRight, Image as ImageIcon, Mail } from 'lucide-react'
import AppShell from '@/components/layout/AppShell'
import Lightbox from '@/components/ui/Lightbox'
import PageLoader from '@/components/bear/PageLoader'
import EmptyState from '@/components/bear/EmptyState'
import FloatingHearts from '@/components/book/FloatingHearts'
import HeartSparkleBurst from '@/components/book/HeartSparkleBurst'
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
  const [caughtUp, setCaughtUp] = useState(false)
  const didDragRef = useRef(false)
  const prevIndexRef = useRef<number | null>(null)

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

  useEffect(() => {
    if (entries.length === 0) return
    const justArrivedAtLast =
      prevIndexRef.current !== null && prevIndexRef.current !== currentIndex && currentIndex === entries.length - 1
    prevIndexRef.current = currentIndex
    if (!justArrivedAtLast) return
    setCaughtUp(true)
    const t = setTimeout(() => setCaughtUp(false), 900)
    return () => clearTimeout(t)
  }, [currentIndex, entries.length])

  useEffect(() => {
    if (entries.length === 0) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') go(-1)
      if (e.key === 'ArrowRight') go(1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries.length])

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
  const progressPercent = ((currentIndex + 1) / entries.length) * 100

  return (
    <AppShell title="สมุดความทรงจำ 📖">
      <div className="relative">
        <FloatingHearts />

        <div className="relative z-10">
          <div className="mb-1 flex items-center justify-between text-sm text-ink-soft">
            <span>
              หน้า {currentIndex + 1} จาก {entries.length} · เรียงตามวันที่ความทรงจำเกิดขึ้น
            </span>
          </div>
          <div className="mb-4 h-1 w-full overflow-hidden rounded-full bg-black/5">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-pastel-pink to-accent"
              animate={{ width: `${progressPercent}%` }}
              transition={reducedMotion ? { duration: 0 } : { duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>

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
                drag={!reducedMotion && entries.length > 1 ? 'x' : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.7}
                onDragStart={() => {
                  didDragRef.current = true
                }}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -60 || info.velocity.x < -400) go(1)
                  else if (info.offset.x > 60 || info.velocity.x > 400) go(-1)
                  setTimeout(() => {
                    didDragRef.current = false
                  }, 50)
                }}
              >
                <div className="relative grid grid-cols-1 overflow-hidden rounded-xl3 border border-black/5 bg-warm-white shadow-page sm:grid-cols-2">
                  {/* spine shadow down the middle, like an open book's gutter */}
                  <div className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-10 -translate-x-1/2 bg-gradient-to-r from-black/10 via-transparent to-black/10 sm:block" />

                  {/* Left page */}
                  <div className="paper-texture relative flex items-center justify-center border-b border-black/5 p-6 sm:border-b-0 sm:border-r sm:p-8">
                    <MemoryPhotoLayout
                      images={current.images}
                      layout={current.layout}
                      alt={current.title}
                      onImageClick={setLightboxIndex}
                      className="w-full max-w-sm"
                    />
                  </div>

                  {/* Right page */}
                  <div className="paper-texture flex flex-col justify-center p-6 sm:p-8 lg:p-10">
                    <div className="relative w-fit">
                      <motion.span
                        initial={reducedMotion ? undefined : { opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 16, delay: 0.15 }}
                        className="inline-flex items-center gap-1.5 rounded-full bg-[var(--accent-bg)]/60 px-3 py-1 text-xs font-medium text-ink"
                      >
                        <Icon className="h-3.5 w-3.5" /> {KIND_META[current.kind].label}
                      </motion.span>
                      {caughtUp && <HeartSparkleBurst className="absolute inset-0" count={6} />}
                    </div>
                    <p className="mt-3 text-sm text-ink-soft">{formatThaiDate(current.date)}</p>
                    {current.title && <h2 className="mt-1 text-xl font-semibold text-ink">{current.title}</h2>}
                    {current.message && <p className="mt-3 whitespace-pre-line leading-relaxed text-ink">{current.message}</p>}

                    <Link
                      to={current.linkTo}
                      onClick={(e) => {
                        if (didDragRef.current) e.preventDefault()
                      }}
                      className="mt-5 inline-flex w-fit text-sm font-medium text-accent hover:underline"
                    >
                      เปิดดูต้นฉบับ →
                    </Link>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-5 flex items-center justify-center gap-3">
            <button
              onClick={() => go(-1)}
              disabled={currentIndex === 0}
              aria-label="ความทรงจำก่อนหน้า"
              className="rounded-full bg-warm-white p-2.5 text-ink shadow-softer transition-all hover:scale-105 active:scale-95 disabled:pointer-events-none disabled:opacity-40"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => go(1)}
              disabled={currentIndex === entries.length - 1}
              aria-label="ความทรงจำถัดไป"
              className="rounded-full bg-warm-white p-2.5 text-ink shadow-softer transition-all hover:scale-105 active:scale-95 disabled:pointer-events-none disabled:opacity-40"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <Lightbox images={lightboxImages} index={lightboxIndex} onClose={() => setLightboxIndex(null)} onNavigate={setLightboxIndex} />
    </AppShell>
  )
}
