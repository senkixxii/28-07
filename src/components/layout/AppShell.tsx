import { useEffect, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import Sidebar from './Sidebar'
import BottomNav from './BottomNav'
import BearMascot from '@/components/bear/BearMascot'
import { useAuth } from '@/contexts/AuthContext'
import { useCoupleSettings } from '@/hooks/useCoupleSettings'

export default function AppShell({ title, children }: { title?: string; children: ReactNode }) {
  const { signOut } = useAuth()
  const { settings } = useCoupleSettings()

  useEffect(() => {
    document.documentElement.dataset.theme = settings?.theme_preference ?? 'pastel'
  }, [settings?.theme_preference])

  return (
    <div className="flex min-h-screen bg-cream">
      <Sidebar />
      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-black/5 bg-white/60 px-4 py-3 backdrop-blur-sm lg:hidden">
          <div className="flex items-center gap-2">
            <BearMascot size={30} />
            <span className="text-sm font-semibold text-ink">Our Little Love Book</span>
          </div>
          <button
            onClick={() => signOut()}
            className="rounded-full px-3 py-1.5 text-xs font-medium text-ink-soft hover:bg-black/5"
          >
            ออกจากระบบ
          </button>
        </header>

        <motion.main
          key={title}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="flex-1 px-4 pb-24 pt-6 sm:px-6 lg:px-10 lg:pb-10 lg:pt-8"
        >
          {title && <h1 className="mb-6 text-2xl font-semibold text-ink">{title}</h1>}
          {children}
        </motion.main>
      </div>
      <BottomNav />
    </div>
  )
}
