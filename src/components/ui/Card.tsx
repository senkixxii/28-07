import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export default function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-xl3 border border-black/5 bg-warm-white/90 p-5 shadow-softer backdrop-blur-sm',
        className,
      )}
      {...props}
    />
  )
}
