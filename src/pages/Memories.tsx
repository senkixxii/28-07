import { useState } from 'react'
import { Plus } from 'lucide-react'
import AppShell from '@/components/layout/AppShell'
import Button from '@/components/ui/Button'
import { CardSkeletonGrid } from '@/components/ui/Skeleton'
import EmptyState from '@/components/bear/EmptyState'
import MemoryCard from '@/components/memory/MemoryCard'
import MemoryFormModal from '@/components/memory/MemoryFormModal'
import { useMemories } from '@/hooks/useMemories'

export default function Memories() {
  const { memories, loading, refresh } = useMemories()
  const [formOpen, setFormOpen] = useState(false)

  return (
    <AppShell title="📖 ความทรงจำ">
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-ink-soft">สมุดบันทึกเรื่องราวของเราทั้งหมด {memories.length} เรื่อง</p>
        <Button size="sm" onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4" /> เพิ่มความทรงจำ
        </Button>
      </div>

      {loading ? (
        <CardSkeletonGrid count={6} />
      ) : memories.length === 0 ? (
        <EmptyState
          title="สมุดของเรายังว่างอยู่เลย"
          description="มาเติมเรื่องราวของเรากันนะ 💕"
          action={<Button onClick={() => setFormOpen(true)}>+ เพิ่มความทรงจำแรก</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {memories.map((memory, i) => (
            <MemoryCard key={memory.id} memory={memory} index={i} />
          ))}
        </div>
      )}

      <MemoryFormModal open={formOpen} onClose={() => setFormOpen(false)} onSaved={refresh} />
    </AppShell>
  )
}
