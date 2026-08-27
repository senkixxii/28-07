import { NavLink } from 'react-router-dom'
import { LogOut, Settings } from 'lucide-react'
import { NAV_ITEMS } from './navItems'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'

export default function TopNav() {
  const { signOut } = useAuth()

  return (
    <header className="hidden border-b border-black/5 bg-warm-white/80 backdrop-blur-sm lg:block">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
        <NavLink to="/book" className="flex items-center gap-2">
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
                  'flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition-colors',
                  isActive ? 'bg-[var(--accent-bg)]/60 text-ink' : 'text-ink-soft hover:bg-black/5 hover:text-ink',
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <NavLink
            to="/settings"
            aria-label="ตั้งค่า"
            className={({ isActive }) =>
              cn('rounded-full p-2 transition-colors', isActive ? 'bg-[var(--accent-bg)]/60 text-ink' : 'text-ink-soft hover:bg-black/5 hover:text-ink')
            }
          >
            <Settings className="h-4.5 w-4.5" />
          </NavLink>
          <button
            onClick={() => signOut()}
            aria-label="ออกจากระบบ"
            className="rounded-full p-2 text-ink-soft transition-colors hover:bg-black/5 hover:text-ink"
          >
            <LogOut className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>
    </header>
  )
}
