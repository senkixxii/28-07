import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Plus } from 'lucide-react'
import AppShell from '@/components/layout/AppShell'
import Button from '@/components/ui/Button'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { CardSkeletonGrid } from '@/components/ui/Skeleton'
import EmptyState from '@/components/pig/EmptyState'
import LetterFormModal from '@/components/letters/LetterFormModal'
import LetterReader from '@/components/letters/LetterReader'
import { useLetters } from '@/hooks/useLetters'
import { useToast } from '@/contexts/ToastContext'
import { friendlyError } from '@/lib/supabase'
import { formatThaiDate } from '@/lib/utils'
import type { Letter } from '@/types'

export default function Letters() {
  const { letters, loading, refresh, deleteLetter } = useLetters()
  const { showToast } = useToast()

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
      showToast('ลบจดหมายแล้วนะ', 'success')
      setReading(null)
      refresh()
    } catch (err) {
      showToast(friendlyError(err), 'error')
    } finally {
      setDeleting(false)
      setDeleteTarget(null)
    }
  }

  return (
    <AppShell title="💌 จดหมาย">
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-ink-soft">จดหมายที่เขียนถึงกันทั้งหมด {letters.length} ฉบับ</p>
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4" /> เขียนจดหมาย
        </Button>
      </div>

      {loading ? (
        <CardSkeletonGrid count={4} />
      ) : letters.length === 0 ? (
        <EmptyState
          title="ยังไม่มีจดหมายเลยนะ"
          description="เขียนจดหมายฉบับแรกถึงเธอกันเถอะ 💌"
          action={<Button onClick={openCreate}>+ เขียนจดหมายฉบับแรก</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {letters.map((letter, i) => (
            <motion.button
              key={letter.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i, 8) * 0.04 }}
              whileHover={{ y: -3 }}
              onClick={() => setReading(letter)}
              className="flex flex-col items-start gap-3 rounded-xl2 border border-black/5 bg-white p-5 text-left shadow-softer transition-shadow hover:shadow-lift"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-soft-pink/70 text-pastel-pink">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-ink-soft">{formatThaiDate(letter.letter_date)}</p>
                <p className="mt-1 font-semibold text-ink">{letter.title}</p>
                <p className="mt-1 line-clamp-2 text-sm text-ink-soft">{letter.message}</p>
              </div>
            </motion.button>
          ))}
        </div>
      )}

      <LetterFormModal open={formOpen} onClose={() => setFormOpen(false)} letter={editing} onSaved={refresh} />

      <LetterReader
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
