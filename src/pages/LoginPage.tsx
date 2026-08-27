import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Lock } from 'lucide-react'
import BearMascot from '@/components/bear/BearMascot'
import Button from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/contexts/AuthContext'
import { friendlyError } from '@/lib/supabase'

export default function LoginPage() {
  const { user, signIn } = useAuth()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  if (user) {
    const from = (location.state as { from?: Location })?.from?.pathname ?? '/book'
    return <Navigate to={from} replace />
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await signIn(email, password)
      toast.success('ยินดีต้อนรับกลับมานะ 💕')
    } catch (err) {
      toast.error(friendlyError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-soft-pink via-cream to-baby-blue/40 px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-sm rounded-xl3 border border-white/60 bg-warm-white/80 p-8 shadow-lift backdrop-blur-md"
      >
        <div className="mb-6 flex flex-col items-center text-center">
          <BearMascot size={72} mood="happy" float />
          <h1 className="mt-3 text-xl font-semibold text-ink">Our Little Love Book</h1>
          <p className="mt-1 text-sm text-ink-soft">สมุดเล็ก ๆ ของเราสองคน 🐻💕</p>
        </div>

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
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button type="submit" className="w-full" loading={loading}>
            <Lock className="h-4 w-4" /> เข้าสู่ระบบ
          </Button>
        </form>

        <div className="mt-5 flex flex-col items-center gap-2 text-sm text-ink-soft">
          <Link to="/forgot-password" className="hover:text-ink hover:underline">
            ลืมรหัสผ่าน?
          </Link>
          <Link to="/register" className="hover:text-ink hover:underline">
            ยังไม่มีบัญชี? สมัครสมาชิกที่นี่
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
