import { useState } from 'react'
import { Plus, Trash2, Pencil } from 'lucide-react'
import AppShell from '@/components/layout/AppShell'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { CardSkeletonGrid } from '@/components/ui/Skeleton'
import EmptyState from '@/components/pig/EmptyState'
import AnniversaryFormModal from '@/components/anniversary/AnniversaryFormModal'
import { useAnniversaries } from '@/hooks/useAnniversaries'
import { useToast } from '@/contexts/ToastContext'
import { friendlyError } from '@/lib/supabase'
import { formatThaiDate } from '@/lib/utils'
import type { Anniversary } from '@/types'

export default function Anniversaries() {
  const { anniversaries, loading, refresh, deleteAnniversary } = useAnniversaries()
  const { showToast } = useToast()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Anniversary | undefined>(undefined)
  const [deleteTarget, setDeleteTarget] = useState<Anniversary | null>(null)
  const [deleting, setDeleting] = useState(false)

  const now = new Date()

  function openCreate() {
    setEditing(undefined)
    setFormOpen(true)
  }

  function openEdit(a: Anniversary) {
    setEditing(a)
    setFormOpen(true)
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteAnniversary(deleteTarget.id)
      showToast('ลบวันครบรอบแล้วนะ', 'success')
      refresh()
    } catch (err) {
      showToast(friendlyError(err), 'error')
    } finally {
      setDeleting(false)
      setDeleteTarget(null)
    }
  }

  return (
    <AppShell title="💕 ครบรอบ">
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-ink-soft">บันทึกวันพิเศษของเราทั้งหมด {anniversaries.length} ครั้ง</p>
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4" /> เพิ่มวันครบรอบ
        </Button>
      </div>

      {loading ? (
        <CardSkeletonGrid count={4} />
      ) : anniversaries.length === 0 ? (
        <EmptyState
          title="ยังไม่มีวันพิเศษที่บันทึกไว้"
          description="มาบันทึกวันครบรอบแรกของเรากันนะ 💕"
          action={<Button onClick={openCreate}>+ เพิ่มวันครบรอบ</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {anniversaries.map((a) => {
            const isPast = new Date(a.anniversary_date) <= now
            return (
              <Card key={a.id} className="flex flex-col overflow-hidden p-0">
                <div className="h-32 w-full overflow-hidden bg-soft-pink/40">
                  {a.cover_image_url ? (
                    <img src={a.cover_image_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-3xl">💕</div>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <p className="text-xs font-medium text-accent">💕 {a.title}</p>
                  <p className="mt-1 text-sm text-ink-soft">{formatThaiDate(a.anniversary_date)}</p>
                  {a.message && <p className="mt-2 text-sm italic text-ink">"{a.message}"</p>}
                  <span
                    className={`mt-3 inline-block w-fit rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                      isPast ? 'bg-lavender/50 text-ink' : 'bg-baby-blue/60 text-ink'
                    }`}
                  >
                    {isPast ? 'ผ่านไปแล้ว' : 'กำลังจะมาถึง'}
                  </span>
                  <div className="mt-3 flex gap-2">
                    <Button variant="secondary" size="sm" onClick={() => openEdit(a)}>
                      <Pencil className="h-3.5 w-3.5" /> แก้ไข
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => setDeleteTarget(a)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <AnniversaryFormModal open={formOpen} onClose={() => setFormOpen(false)} anniversary={editing} onSaved={refresh} />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="แน่ใจนะว่าจะลบวันครบรอบนี้?"
        confirmLabel="ลบ"
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </AppShell>
  )
}
