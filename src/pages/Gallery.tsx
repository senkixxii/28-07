import { useMemo, useState } from 'react'
import AppShell from '@/components/layout/AppShell'
import Lightbox from '@/components/ui/Lightbox'
import { CardSkeletonGrid } from '@/components/ui/Skeleton'
import EmptyState from '@/components/bear/EmptyState'
import { useMemories } from '@/hooks/useMemories'

export default function Gallery() {
  const { memories, loading } = useMemories()
  const [memoryFilter, setMemoryFilter] = useState<string>('all')
  const [yearFilter, setYearFilter] = useState<string>('all')
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const allImages = useMemo(
    () =>
      memories.flatMap((m) =>
        m.memory_images.map((img) => ({
          url: img.image_url,
          alt: m.title,
          memoryId: m.id,
          memoryTitle: m.title,
          year: new Date(m.memory_date).getFullYear() + 543,
        })),
      ),
    [memories],
  )

  const years = useMemo(() => Array.from(new Set(allImages.map((i) => i.year))).sort((a, b) => b - a), [allImages])

  const filtered = allImages.filter((img) => {
    if (memoryFilter !== 'all' && img.memoryId !== memoryFilter) return false
    if (yearFilter !== 'all' && String(img.year) !== yearFilter) return false
    return true
  })

  const selectClass =
    'rounded-full border border-black/10 bg-white px-3 py-1.5 text-sm text-ink focus:border-pastel-pink'

  return (
    <AppShell title="📸 รูปภาพ">
      {loading ? (
        <CardSkeletonGrid count={9} />
      ) : allImages.length === 0 ? (
        <EmptyState title="ยังไม่มีรูปเลยนะ 📸" description="รูปของเราจะอยู่ตรงนี้" />
      ) : (
        <>
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <select
              aria-label="กรองตามความทรงจำ"
              value={memoryFilter}
              onChange={(e) => setMemoryFilter(e.target.value)}
              className={selectClass}
            >
              <option value="all">ทุกความทรงจำ</option>
              {memories
                .filter((m) => m.memory_images.length > 0)
                .map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title}
                  </option>
                ))}
            </select>
            <select
              aria-label="กรองตามปี"
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className={selectClass}
            >
              <option value="all">ทุกปี</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  ปี {y}
                </option>
              ))}
            </select>
            <span className="text-sm text-ink-soft">{filtered.length} รูป</span>
          </div>

          {filtered.length === 0 ? (
            <EmptyState title="ไม่พบรูปที่ตรงกับตัวกรองนะ 🐻" />
          ) : (
            <div className="columns-2 gap-3 sm:columns-3 lg:columns-4 [&>*]:mb-3">
              {filtered.map((img, i) => (
                <button
                  key={`${img.memoryId}-${img.url}`}
                  onClick={() => setLightboxIndex(i)}
                  className="block w-full overflow-hidden rounded-xl2 bg-black/5"
                >
                  <img src={img.url} alt={img.alt} loading="lazy" className="w-full object-cover transition-transform hover:scale-105" />
                </button>
              ))}
            </div>
          )}

          <Lightbox images={filtered} index={lightboxIndex} onClose={() => setLightboxIndex(null)} onNavigate={setLightboxIndex} />
        </>
      )}
    </AppShell>
  )
}
