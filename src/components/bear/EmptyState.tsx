import type { ReactNode } from 'react'
import BearMascot from './BearMascot'
import type { BearMood } from './BearMascot'

interface EmptyStateProps {
  title: string
  description?: string
  mood?: BearMood
  action?: ReactNode
}

export default function EmptyState({ title, description, mood = 'sad', action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-xl3 border border-dashed border-pastel-pink/50 bg-white/60 px-6 py-16 text-center animate-fade-in">
      <BearMascot size={88} mood={mood} float />
      <div className="space-y-1.5">
        <p className="font-medium text-ink">{title}</p>
        {description && <p className="text-sm text-ink-soft">{description}</p>}
      </div>
      {action}
    </div>
  )
}
