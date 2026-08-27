import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ImagePlus, Loader2, X } from 'lucide-react'
import { validateImageFile } from '@/lib/storage'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { toast } from 'sonner'

export interface PendingImage {
  id: string
  file: File
  previewUrl: string
  status: 'pending' | 'uploading' | 'done' | 'error'
}

interface ImageUploaderProps {
  pending: PendingImage[]
  onAdd: (files: File[]) => void
  onRemove: (id: string) => void
  disabled?: boolean
  multiple?: boolean
}

export default function ImageUploader({ pending, onAdd, onRemove, disabled, multiple = true }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const reducedMotion = useReducedMotion()

  function handleFiles(fileList: FileList | null) {
    if (!fileList) return
    const files = Array.from(fileList)
    const valid: File[] = []
    for (const file of files) {
      const result = validateImageFile(file)
      if (result.valid) valid.push(file)
      else toast.error(result.error ?? 'ไฟล์ไม่ถูกต้อง')
    }
    if (valid.length) onAdd(multiple ? valid : valid.slice(0, 1))
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
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click()
        }}
        className={`group flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl2 border-2 border-dashed px-4 py-8 text-center transition-all ${
          dragOver ? 'scale-[1.01] border-pastel-pink bg-soft-pink/40' : 'border-black/10 bg-white/60 hover:border-pastel-pink/60 hover:bg-soft-pink/20'
        } ${disabled ? 'pointer-events-none opacity-60' : ''}`}
      >
        <ImagePlus className="h-6 w-6 text-ink-soft transition-transform group-hover:scale-110 group-hover:text-accent" />
        <p className="text-sm text-ink-soft">ลากรูปมาวาง หรือแตะเพื่อเลือกรูป (สูงสุด 10MB ต่อรูป)</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple={multiple}
          className="hidden"
          onChange={(e) => {
            handleFiles(e.target.files)
            e.target.value = ''
          }}
        />
      </div>

      {pending.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          <AnimatePresence initial={false}>
            {pending.map((img) => (
              <motion.div
                key={img.id}
                layout={!reducedMotion}
                initial={reducedMotion ? false : { opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.2 }}
                className="group relative aspect-square overflow-hidden rounded-xl2 bg-black/5"
              >
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
                    className="absolute right-1 top-1 rounded-full bg-black/50 p-1 text-white opacity-0 transition-all hover:scale-110 group-hover:opacity-100"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
