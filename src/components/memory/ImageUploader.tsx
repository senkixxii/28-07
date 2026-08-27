import { useRef, useState } from 'react'
import { ImagePlus, Loader2, X } from 'lucide-react'
import { validateImageFile } from '@/lib/storage'
import { useToast } from '@/contexts/ToastContext'

export interface PendingImage {
  id: string
  file: File
  previewUrl: string
  progress: number
  status: 'pending' | 'uploading' | 'done' | 'error'
}

interface ImageUploaderProps {
  pending: PendingImage[]
  onAdd: (files: File[]) => void
  onRemove: (id: string) => void
  disabled?: boolean
}

export default function ImageUploader({ pending, onAdd, onRemove, disabled }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const { showToast } = useToast()

  function handleFiles(fileList: FileList | null) {
    if (!fileList) return
    const files = Array.from(fileList)
    const valid: File[] = []
    for (const file of files) {
      const result = validateImageFile(file)
      if (result.valid) valid.push(file)
      else showToast(result.error ?? 'ไฟล์ไม่ถูกต้อง', 'error')
    }
    if (valid.length) onAdd(valid)
  }

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          if (!disabled) handleFiles(e.dataTransfer.files)
        }}
        onClick={() => !disabled && inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl2 border-2 border-dashed px-4 py-8 text-center transition-colors ${
          dragOver ? 'border-pastel-pink bg-soft-pink/40' : 'border-black/10 bg-white/60 hover:border-pastel-pink/60'
        } ${disabled ? 'pointer-events-none opacity-60' : ''}`}
      >
        <ImagePlus className="h-6 w-6 text-ink-soft" />
        <p className="text-sm text-ink-soft">ลากรูปมาวาง หรือแตะเพื่อเลือกรูป (สูงสุด 10MB ต่อรูป)</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="hidden"
          onChange={(e) => {
            handleFiles(e.target.files)
            e.target.value = ''
          }}
        />
      </div>

      {pending.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {pending.map((img) => (
            <div key={img.id} className="group relative aspect-square overflow-hidden rounded-xl2 bg-black/5">
              <img src={img.previewUrl} alt="" className="h-full w-full object-cover" />
              {img.status === 'uploading' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <Loader2 className="h-5 w-5 animate-spin text-white" />
                </div>
              )}
              {img.status !== 'uploading' && (
                <button
                  type="button"
                  onClick={() => onRemove(img.id)}
                  aria-label="ลบรูปนี้"
                  className="absolute right-1 top-1 rounded-full bg-black/50 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
