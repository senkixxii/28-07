import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

/** A page-like surface: warm paper color, subtle grain texture, soft page shadow. */
export default function PaperPage({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'paper-texture rounded-xl3 border border-black/5 bg-warm-white shadow-page',
        className,
      )}
      {...props}
    />
  )
}
