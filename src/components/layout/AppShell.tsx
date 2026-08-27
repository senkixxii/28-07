import type { ReactNode } from 'react'
import TopNav from './TopNav'
import BottomNav from './BottomNav'
import PageTransition from '@/components/book/PageTransition'
import { useAuth } from '@/contexts/AuthContext'

export default function AppShell({ title, children }: { title?: string; children: ReactNode }) {
  const { signOut } = useAuth()

  return (
    <div className="min-h-screen bg-cream">
      <TopNav />

      <header className="flex items-center justify-between border-b border-black/5 bg-warm-white/80 px-4 py-3 backdrop-blur-sm lg:hidden">
        <span className="flex items-center gap-2 text-sm font-semibold text-ink">
          <span className="text-xl">🐻</span> Our Little Love Book
        </span>
        <button onClick={() => signOut()} className="rounded-full px-3 py-1.5 text-xs font-medium text-ink-soft hover:bg-black/5">
          ออกจากระบบ
        </button>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-24 pt-6 sm:px-6 lg:px-8 lg:pb-12 lg:pt-8">
        <PageTransition>
          {title && <h1 className="mb-6 text-2xl font-semibold text-ink">{title}</h1>}
          {children}
        </PageTransition>
      </main>

      <BottomNav />
    </div>
  )
}
