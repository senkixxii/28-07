import { useState, type FormEvent } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock } from 'lucide-react'
import PigMascot from '@/components/pig/PigMascot'
import Button from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { friendlyError } from '@/lib/supabase'

type Mode = 'login' | 'register' | 'forgot'

export default function Login() {
  const { user, signIn, signUp, resetPassword } = useAuth()
  const { showToast } = useToast()
  const location = useLocation()

  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [info, setInfo] = useState<string | null>(null)

  if (user) {
    const from = (location.state as { from?: Location })?.from?.pathname ?? '/dashboard'
    return <Navigate to={from} replace />
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setInfo(null)
    setLoading(true)
    try {
      if (mode === 'login') {
        await signIn(email, password)
        showToast('ยินดีต้อนรับกลับมานะ 💕', 'success')
      } else if (mode === 'register') {
        await signUp(email, password)
        setInfo('สมัครสำเร็จแล้ว! เช็คอีเมลเพื่อยืนยันบัญชี แล้วค่อยเข้าสู่ระบบนะ 🐷')
        setMode('login')
      } else {
        await resetPassword(email)
        setInfo('ส่งลิงก์ตั้งรหัสผ่านใหม่ไปที่อีเมลแล้วนะ เช็คกล่องจดหมายได้เลย 📧')
      }
    } catch (err) {
      showToast(friendlyError(err), 'error')
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
        className="w-full max-w-sm rounded-xl3 border border-white/60 bg-white/80 p-8 shadow-lift backdrop-blur-md"
      >
        <div className="mb-6 flex flex-col items-center text-center">
          <PigMascot size={72} mood={mode === 'forgot' ? 'sleepy' : 'happy'} float />
          <h1 className="mt-3 text-xl font-semibold text-ink">Our Little Love Book</h1>
          <p className="mt-1 text-sm text-ink-soft">สมุดความทรงจำของเรา 🐷💕</p>
        </div>

        {info && (
          <div className="mb-4 rounded-2xl bg-baby-blue/40 px-4 py-2.5 text-sm text-ink" role="status">
            {info}
          </div>
        )}

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
          {mode !== 'forgot' && (
            <Input
              id="password"
              type="password"
              label="รหัสผ่าน"
              placeholder="••••••••"
              required
              minLength={6}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          )}

          <Button type="submit" className="w-full" loading={loading}>
            {mode === 'login' && (
              <>
                <Lock className="h-4 w-4" /> เข้าสู่ระบบ
              </>
            )}
            {mode === 'register' && (
              <>
                <Mail className="h-4 w-4" /> สมัครสมาชิก
              </>
            )}
            {mode === 'forgot' && 'ส่งลิงก์ตั้งรหัสผ่านใหม่'}
          </Button>
        </form>

        <div className="mt-5 flex flex-col items-center gap-2 text-sm text-ink-soft">
          {mode === 'login' && (
            <>
              <button onClick={() => setMode('forgot')} className="hover:text-ink hover:underline">
                ลืมรหัสผ่าน?
              </button>
              <button onClick={() => setMode('register')} className="hover:text-ink hover:underline">
                ยังไม่มีบัญชี? สมัครสมาชิกที่นี่
              </button>
            </>
          )}
          {mode === 'register' && (
            <button onClick={() => setMode('login')} className="hover:text-ink hover:underline">
              มีบัญชีอยู่แล้ว? เข้าสู่ระบบ
            </button>
          )}
          {mode === 'forgot' && (
            <button onClick={() => setMode('login')} className="hover:text-ink hover:underline">
              กลับไปเข้าสู่ระบบ
            </button>
          )}
        </div>
      </motion.div>
    </div>
  )
}
