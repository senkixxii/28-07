import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LogOut, Settings } from 'lucide-react'
import { NAV_ITEMS } from './navItems'
import { useAuth } from '@/contexts/AuthContext'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { cn } from '@/lib/utils'

export default function TopNav() {
  const { signOut } = useAuth()
  const reducedMotion = useReducedMotion()

  return (
    <header className="sticky top-0 z-40 hidden border-b border-black/5 bg-warm-white/80 backdrop-blur-md lg:block">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
        <NavLink to="/book" className="flex items-center gap-2 transition-transform hover:scale-[1.02]">
          <span className="text-2xl">🐻</span>
          <span className="font-semibold text-ink">Our Little Love Book 🐻💕</span>
        </NavLink>

        <nav className="flex items-center gap-1" aria-label="เมนูหลัก">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'relative flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition-colors',
                  isActive ? 'text-ink' : 'text-ink-soft hover:bg-black/5 hover:text-ink',
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="topnav-active-pill"
                      className="absolute inset-0 rounded-full bg-[var(--accent-bg)]/60"
                      transition={reducedMotion ? { duration: 0 } : { type: 'spring', bounce: 0.2, duration: 0.5 }}
                    />
                  )}
                  <item.icon className="relative z-10 h-4 w-4" />
                  <span className="relative z-10">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <NavLink
            to="/settings"
            aria-label="ตั้งค่า"
            className={({ isActive }) =>
              cn(
                'relative rounded-full p-2 transition-colors',
                isActive ? 'text-ink' : 'text-ink-soft hover:bg-black/5 hover:text-ink',
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.span
                    layoutId="topnav-active-pill"
                    className="absolute inset-0 rounded-full bg-[var(--accent-bg)]/60"
                    transition={reducedMotion ? { duration: 0 } : { type: 'spring', bounce: 0.2, duration: 0.5 }}
                  />
                )}
                <Settings className="relative z-10 h-4.5 w-4.5 transition-transform" />
              </>
            )}
          </NavLink>
          <button
            onClick={() => signOut()}
            aria-label="ออกจากระบบ"
            className="rounded-full p-2 text-ink-soft transition-all hover:scale-105 hover:bg-black/5 hover:text-ink active:scale-95"
          >
            <LogOut className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>
    </header>
  )
}
