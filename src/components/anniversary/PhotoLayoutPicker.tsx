import { LayoutGrid, Layers, Square } from 'lucide-react'
import type { PhotoLayout } from '@/types'
import { cn } from '@/lib/utils'

const OPTIONS: { value: PhotoLayout; label: string; icon: typeof Square }[] = [
  { value: 'single', label: 'รูปเดียว', icon: Square },
  { value: 'grid', label: 'กริด', icon: LayoutGrid },
  { value: 'stack', label: 'กองโพลารอยด์', icon: Layers },
]

export default function PhotoLayoutPicker({ value, onChange }: { value: PhotoLayout; onChange: (v: PhotoLayout) => void }) {
  return (
    <div className="flex gap-2">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            'flex flex-1 flex-col items-center gap-1.5 rounded-xl2 border px-3 py-2.5 text-xs font-medium transition-colors',
            value === opt.value
              ? 'border-pastel-pink bg-soft-pink/50 text-ink'
              : 'border-black/10 text-ink-soft hover:border-black/20 hover:bg-black/5',
          )}
        >
          <opt.icon className="h-5 w-5" />
          {opt.label}
        </button>
      ))}
    </div>
  )
}
