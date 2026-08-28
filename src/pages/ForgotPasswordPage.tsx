import { useState, type FormEvent } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import BearMascot from '@/components/bear/BearMascot'
import FloatingHearts from '@/components/book/FloatingHearts'
import Button from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/contexts/AuthContext'
import { friendlyError } from '@/lib/supabase'

export default function ForgotPasswordPage() {
  const { user, resetPassword } = useAuth()

  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  if (user) return <Navigate to="/book" replace />

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await resetPassword(email)
      setSent(true)
    } catch (err) {
      toast.error(friendlyError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-soft-pink via-cream to-baby-blue/40 px-4 py-10">
      <FloatingHearts />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-sm rounded-xl3 border border-white/60 bg-warm-white/80 p-8 shadow-lift backdrop-blur-md"
      >
        <div className="mb-6 flex flex-col items-center text-center">
          <BearMascot size={72} mood="sleepy" float />
          <h1 className="mt-3 text-xl font-semibold text-ink">ลืมรหัสผ่าน?</h1>
          <p className="mt-1 text-sm text-ink-soft">ไม่เป็นไรนะ ส่งลิงก์ตั้งรหัสผ่านใหม่ให้เลย 🐻</p>
        </div>

        {sent ? (
          <div className="rounded-2xl bg-baby-blue/40 px-4 py-3 text-center text-sm text-ink" role="status">
            ส่งลิงก์ตั้งรหัสผ่านใหม่ไปที่อีเมลแล้วนะ เช็คกล่องจดหมายได้เลย 📧
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="email"
              type="email"
              label="อีเมล"
              placeholder="you@example.com"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button type="submit" className="w-full" loading={loading}>
              ส่งลิงก์ตั้งรหัสผ่านใหม่
            </Button>
          </form>
        )}

        <div className="mt-5 flex flex-col items-center gap-2 text-sm text-ink-soft">
          <Link to="/login" className="hover:text-ink hover:underline">
            กลับไปเข้าสู่ระบบ
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
