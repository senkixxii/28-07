import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Settings } from 'lucide-react'
import { NAV_ITEMS } from './navItems'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { cn } from '@/lib/utils'

export default function BottomNav() {
  const reducedMotion = useReducedMotion()

  return (
    <nav
      aria-label="เมนูหลัก"
      className="fixed inset-x-0 bottom-0 z-40 flex items-stretch justify-between border-t border-black/5 bg-warm-white/95 px-1 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
    >
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            cn(
              'flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium transition-colors active:scale-95',
              isActive ? 'text-ink' : 'text-ink-soft',
            )
          }
        >
          {({ isActive }) => (
            <>
              <span className="relative flex h-8 w-11 items-center justify-center rounded-full">
                {isActive && (
                  <motion.span
                    layoutId="bottomnav-active-pill"
                    className="absolute inset-0 rounded-full bg-[var(--accent-bg)]/70"
                    transition={reducedMotion ? { duration: 0 } : { type: 'spring', bounce: 0.25, duration: 0.5 }}
                  />
                )}
                <item.icon className="relative z-10 h-5 w-5" strokeWidth={isActive ? 2.4 : 2} />
              </span>
              <span>{item.label}</span>
            </>
          )}
        </NavLink>
      ))}
      <NavLink
        to="/settings"
        className={({ isActive }) =>
          cn(
            'flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium transition-colors active:scale-95',
            isActive ? 'text-ink' : 'text-ink-soft',
          )
        }
      >
        {({ isActive }) => (
          <>
            <span className="relative flex h-8 w-11 items-center justify-center rounded-full">
              {isActive && (
                <motion.span
                  layoutId="bottomnav-active-pill"
                  className="absolute inset-0 rounded-full bg-[var(--accent-bg)]/70"
                  transition={reducedMotion ? { duration: 0 } : { type: 'spring', bounce: 0.25, duration: 0.5 }}
                />
              )}
              <Settings className="relative z-10 h-5 w-5" strokeWidth={isActive ? 2.4 : 2} />
            </span>
            <span>ตั้งค่า</span>
          </>
        )}
      </NavLink>
    </nav>
  )
}
