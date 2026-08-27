import { useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowLeft, MapPin, Pencil, Trash2 } from 'lucide-react'
import AppShell from '@/components/layout/AppShell'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Lightbox from '@/components/ui/Lightbox'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import PageLoader from '@/components/pig/PageLoader'
import MemoryFormModal from '@/components/memory/MemoryFormModal'
import { useMemory, useMemories } from '@/hooks/useMemories'
import { useToast } from '@/contexts/ToastContext'
import { friendlyError } from '@/lib/supabase'
import { deleteMemoryFolder } from '@/lib/storage'
import { useAuth } from '@/contexts/AuthContext'
import { formatThaiDate } from '@/lib/utils'

export default function MemoryDetail() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const { memory, loading, refresh } = useMemory(id)
  const { deleteMemory } = useMemories()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  if (loading) {
    return (
      <AppShell>
        <PageLoader />
      </AppShell>
    )
  }

  if (!memory) {
    return (
      <AppShell>
        <Card className="text-center">
          <p className="text-ink-soft">ไม่พบความทรงจำนี้นะ 🐷</p>
          <Link to="/memories">
            <Button variant="ghost" className="mt-4">
              กลับไปหน้าความทรงจำ
            </Button>
          </Link>
        </Card>
      </AppShell>
    )
  }

  async function handleDelete() {
    if (!memory || !user) return
    setDeleting(true)
    try {
      await deleteMemory(memory.id)
      await deleteMemoryFolder(user.id, memory.id)
      showToast('ลบความทรงจำแล้วนะ', 'success')
      navigate('/memories')
    } catch (err) {
      showToast(friendlyError(err), 'error')
    } finally {
      setDeleting(false)
      setConfirmOpen(false)
    }
  }

  const images = memory.memory_images.map((img) => ({ url: img.image_url, alt: memory.title }))

  return (
    <AppShell>
      <Link to="/memories" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> กลับไปหน้าความทรงจำ
      </Link>

      <Card className="mb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm text-ink-soft">🐷 {formatThaiDate(memory.memory_date)}</p>
            <h1 className="mt-1 text-2xl font-semibold text-ink">{memory.title}</h1>
            {memory.location && (
              <p className="mt-1 inline-flex items-center gap-1 text-sm text-ink-soft">
                <MapPin className="h-4 w-4" /> {memory.location}
              </p>
            )}
            {memory.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {memory.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-lavender/50 px-2 py-0.5 text-xs text-ink">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="flex shrink-0 gap-2">
            <Button variant="secondary" size="sm" onClick={() => setEditOpen(true)}>
              <Pencil className="h-4 w-4" /> แก้ไข
            </Button>
            <Button variant="danger" size="sm" onClick={() => setConfirmOpen(true)}>
              <Trash2 className="h-4 w-4" /> ลบ
            </Button>
          </div>
        </div>

        {memory.description && <p className="mt-5 whitespace-pre-line text-ink">{memory.description}</p>}

        {memory.personal_message && (
          <div className="mt-5 rounded-xl2 bg-soft-pink/50 px-4 py-3 text-ink">
            <p className="mb-1 text-xs font-medium text-ink-soft">ข้อความถึงเธอ</p>
            <p className="whitespace-pre-line">{memory.personal_message}</p>
          </div>
        )}
      </Card>

      {images.length > 0 && (
        <Card>
          <h2 className="mb-4 font-semibold text-ink">📸 รูปภาพ ({images.length})</h2>
          <div className="columns-2 gap-3 sm:columns-3 [&>*]:mb-3">
            {images.map((img, i) => (
              <button
                key={img.url}
                onClick={() => setLightboxIndex(i)}
                className="block w-full overflow-hidden rounded-xl2 bg-black/5"
              >
                <img src={img.url} alt="" loading="lazy" className="w-full object-cover transition-transform hover:scale-105" />
              </button>
            ))}
          </div>
        </Card>
      )}

      <Lightbox images={images} index={lightboxIndex} onClose={() => setLightboxIndex(null)} onNavigate={setLightboxIndex} />

      <MemoryFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        memory={memory}
        onSaved={refresh}
      />

      <ConfirmDialog
        open={confirmOpen}
        title="แน่ใจนะว่าจะลบความทรงจำนี้?"
        description="เมื่อลบแล้วรูปภาพและข้อมูลทั้งหมดจะหายไปถาวรนะ"
        confirmLabel="ลบความทรงจำ"
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </AppShell>
  )
}
