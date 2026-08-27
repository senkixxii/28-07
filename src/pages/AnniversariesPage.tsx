import { useState } from 'react'
import { Plus } from 'lucide-react'
import AppShell from '@/components/layout/AppShell'
import Button from '@/components/ui/Button'
import { CardSkeletonGrid } from '@/components/ui/Skeleton'
import EmptyState from '@/components/bear/EmptyState'
import AnniversaryPageCard from '@/components/anniversary/AnniversaryPageCard'
import AnniversaryFormModal from '@/components/anniversary/AnniversaryFormModal'
import { useAnniversaries } from '@/hooks/useAnniversaries'

export default function AnniversariesPage() {
  const { anniversaries, loading, refresh } = useAnniversaries()
  const [formOpen, setFormOpen] = useState(false)

  return (
    <AppShell title="สมุดครบรอบของเรา">
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-ink-soft">บันทึกไว้แล้ว {anniversaries.length} หน้า</p>
        <Button size="sm" onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4" /> เขียนหน้าครบรอบ
        </Button>
      </div>

      {loading ? (
        <CardSkeletonGrid count={6} />
      ) : anniversaries.length === 0 ? (
        <EmptyState
          title="หน้านี้ยังว่างอยู่เลย"
          description="มาเขียนเรื่องราวของเรากันนะ 💕"
          action={<Button onClick={() => setFormOpen(true)}>เขียนหน้าครบรอบ</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {anniversaries
            .slice()
            .reverse()
            .map((a, i) => (
              <AnniversaryPageCard key={a.id} anniversary={a} index={i} />
            ))}
        </div>
      )}

      <AnniversaryFormModal open={formOpen} onClose={() => setFormOpen(false)} onSaved={refresh} />
    </AppShell>
  )
}
