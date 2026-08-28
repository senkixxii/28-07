import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Copy .env.example to .env and fill in your Supabase project credentials.',
  )
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

/** Turns a raw Supabase/Postgrest error into a short, friendly Thai message. */
export function friendlyError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error)

  if (/invalid login credentials/i.test(message)) {
    return 'อีเมลหรือรหัสผ่านไม่ถูกต้องนะ ลองใหม่อีกครั้ง 🐻'
  }
  if (/already registered|user already exists/i.test(message)) {
    return 'อีเมลนี้มีบัญชีอยู่แล้วนะ ลองเข้าสู่ระบบดูสิ 💕'
  }
  if (/email not confirmed/i.test(message)) {
    return 'ยืนยันอีเมลของคุณก่อนนะ เช็คกล่องจดหมายดูได้เลย 📧'
  }
  if (/password should be at least/i.test(message)) {
    return 'รหัสผ่านสั้นไปนิดนึง ต้องมีอย่างน้อย 6 ตัวอักษรนะ'
  }
  if (/duplicate key/i.test(message)) {
    return 'ข้อมูลนี้มีอยู่แล้วนะ 🐻'
  }
  if (/network/i.test(message)) {
    return 'เชื่อมต่ออินเทอร์เน็ตไม่ได้ ลองเช็คสัญญาณดูนะ 📶'
  }

  return 'เกิดอะไรขึ้นนิดหน่อย 🐻 ลองใหม่อีกครั้งนะ'
}
