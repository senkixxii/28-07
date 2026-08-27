import { NavLink } from 'react-router-dom'
import { NAV_ITEMS } from './navItems'
import { cn } from '@/lib/utils'

export default function BottomNav() {
  return (
    <nav
      aria-label="เมนูหลัก"
      className="fixed inset-x-0 bottom-0 z-40 flex items-stretch justify-between border-t border-black/5 bg-white/95 px-1 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
    >
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            cn(
              'flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium transition-colors',
              isActive ? 'text-ink' : 'text-ink-soft',
            )
          }
        >
          {({ isActive }) => (
            <>
              <span
                className={cn(
                  'flex h-7 w-10 items-center justify-center rounded-full transition-colors',
                  isActive && 'bg-[var(--accent-bg)]/70',
                )}
              >
                <item.icon className="h-5 w-5" strokeWidth={isActive ? 2.4 : 2} />
              </span>
              <span>{item.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
