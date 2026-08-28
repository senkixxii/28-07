import { useState, type FormEvent } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Mail } from 'lucide-react'
import BearMascot from '@/components/bear/BearMascot'
import FloatingHearts from '@/components/book/FloatingHearts'
import Button from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/contexts/AuthContext'
import { friendlyError } from '@/lib/supabase'

export default function RegisterPage() {
  const { user, signUp } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  if (user) return <Navigate to="/book" replace />

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await signUp(email, password)
      setDone(true)
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
          <BearMascot size={72} mood="party" float />
          <h1 className="mt-3 text-xl font-semibold text-ink">เริ่มสมุดของเรากันเถอะ</h1>
          <p className="mt-1 text-sm text-ink-soft">สมัครสมาชิกเพื่อเริ่มเก็บเรื่องราว 🐻💕</p>
        </div>

        {done ? (
          <div className="space-y-4 text-center">
            <div className="rounded-2xl bg-baby-blue/40 px-4 py-3 text-sm text-ink" role="status">
              สมัครสำเร็จแล้ว! เช็คอีเมลเพื่อยืนยันบัญชี แล้วค่อยเข้าสู่ระบบนะ 🐻
            </div>
            <Link to="/login">
              <Button variant="secondary" className="w-full">
                ไปเข้าสู่ระบบ
              </Button>
            </Link>
          </div>
        ) : (
          <>
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
              <Input
                id="password"
                type="password"
                label="รหัสผ่าน"
                placeholder="••••••••"
                required
                minLength={6}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <Button type="submit" className="w-full" loading={loading}>
                <Mail className="h-4 w-4" /> สมัครสมาชิก
              </Button>
            </form>

            <div className="mt-5 flex flex-col items-center gap-2 text-sm text-ink-soft">
              <Link to="/login" className="hover:text-ink hover:underline">
                มีบัญชีอยู่แล้ว? เข้าสู่ระบบ
              </Link>
            </div>
          </>
        )}
      </motion.div>
    </div>
  )
}
