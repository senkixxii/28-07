import { useState } from 'react'
import { toast } from 'sonner'
import { AnimatePresence } from 'framer-motion'
import { Plus } from 'lucide-react'
import AppShell from '@/components/layout/AppShell'
import Button from '@/components/ui/Button'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { CardSkeletonGrid } from '@/components/ui/Skeleton'
import EmptyState from '@/components/bear/EmptyState'
import EnvelopeCard from '@/components/envelope/EnvelopeCard'
import LetterFormModal from '@/components/letter/LetterFormModal'
import LetterOpenOverlay from '@/components/letter/LetterOpenOverlay'
import SaveCelebration from '@/components/book/SaveCelebration'
import { useLetters } from '@/hooks/useLetters'
import { useCelebration } from '@/hooks/useCelebration'
import { friendlyError } from '@/lib/supabase'
import type { Letter } from '@/types'

export default function LettersPage() {
  const { letters, loading, refresh, deleteLetter } = useLetters()
  const { show: celebrating, celebrate } = useCelebration()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Letter | undefined>(undefined)
  const [reading, setReading] = useState<Letter | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Letter | null>(null)
  const [deleting, setDeleting] = useState(false)

  function openCreate() {
    setEditing(undefined)
    setFormOpen(true)
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteLetter(deleteTarget.id)
      toast.success('ลบจดหมายแล้วนะ')
      setReading(null)
      refresh()
    } catch (err) {
      toast.error(friendlyError(err))
    } finally {
      setDeleting(false)
      setDeleteTarget(null)
    }
  }

  return (
    <AppShell title="จดหมายของเรา 💌">
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-ink-soft">จดหมายที่เขียนถึงกันทั้งหมด {letters.length} ฉบับ</p>
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4" /> เขียนจดหมาย
        </Button>
      </div>

      {loading ? (
        <CardSkeletonGrid count={6} />
      ) : letters.length === 0 ? (
        <EmptyState
          icon="💌"
          showBear={false}
          title="ยังไม่มีจดหมาย"
          description="ลองเขียนอะไรถึงเธอสักหน่อยไหม?"
          action={<Button onClick={openCreate}>+ เขียนจดหมาย</Button>}
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          <AnimatePresence>
            {letters.map((letter, i) => (
              <EnvelopeCard key={letter.id} letter={letter} index={i} onOpen={() => setReading(letter)} />
            ))}
          </AnimatePresence>
        </div>
      )}

      <LetterFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        letter={editing}
        onSaved={() => {
          refresh()
          celebrate()
        }}
      />

      <SaveCelebration show={celebrating} />

      <LetterOpenOverlay
        letter={reading}
        onClose={() => setReading(null)}
        onEdit={() => {
          setEditing(reading ?? undefined)
          setReading(null)
          setFormOpen(true)
        }}
        onDelete={() => setDeleteTarget(reading)}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="แน่ใจนะว่าจะลบจดหมายนี้?"
        confirmLabel="ลบจดหมาย"
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </AppShell>
  )
}
