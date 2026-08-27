import { NavLink } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import PigMascot from '@/components/pig/PigMascot'
import { NAV_ITEMS } from './navItems'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'

export default function Sidebar() {
  const { signOut } = useAuth()

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-black/5 bg-white/70 px-4 py-6 backdrop-blur-sm lg:flex">
      <div className="mb-8 flex items-center gap-2 px-2">
        <PigMascot size={40} />
        <div>
          <p className="text-sm font-semibold leading-tight text-ink">Our Little Love Book</p>
          <p className="text-xs text-ink-soft">สมุดความทรงจำของเรา 🐷💕</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1" aria-label="เมนูหลัก">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-[var(--accent-bg)]/60 text-ink shadow-softer'
                  : 'text-ink-soft hover:bg-black/5 hover:text-ink',
              )
            }
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <button
        onClick={() => signOut()}
        className="mt-4 flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-ink-soft transition-colors hover:bg-black/5 hover:text-ink"
      >
        <LogOut className="h-5 w-5" />
        ออกจากระบบ
      </button>
    </aside>
  )
}
