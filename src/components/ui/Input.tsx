import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface FieldWrapperProps {
  label?: string
  error?: string
  hint?: string
  id: string
}

const fieldBase =
  'w-full rounded-2xl border border-black/10 bg-white px-4 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 transition-colors focus:border-pastel-pink'

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & FieldWrapperProps
>(({ label, error, hint, id, className, ...props }, ref) => (
  <div className="space-y-1.5">
    {label && (
      <label htmlFor={id} className="block text-sm font-medium text-ink">
        {label}
      </label>
    )}
    <input id={id} ref={ref} className={cn(fieldBase, error && 'border-rose-300', className)} {...props} />
    {hint && !error && <p className="text-xs text-ink-soft">{hint}</p>}
    {error && <p className="text-xs text-rose-500">{error}</p>}
  </div>
))
Input.displayName = 'Input'

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement> & FieldWrapperProps
>(({ label, error, hint, id, className, rows = 4, ...props }, ref) => (
  <div className="space-y-1.5">
    {label && (
      <label htmlFor={id} className="block text-sm font-medium text-ink">
        {label}
      </label>
    )}
    <textarea
      id={id}
      ref={ref}
      rows={rows}
      className={cn(fieldBase, 'resize-none', error && 'border-rose-300', className)}
      {...props}
    />
    {hint && !error && <p className="text-xs text-ink-soft">{hint}</p>}
    {error && <p className="text-xs text-rose-500">{error}</p>}
  </div>
))
Textarea.displayName = 'Textarea'
