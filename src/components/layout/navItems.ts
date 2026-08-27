import { BookHeart, Heart, Home, Images, Mail, Settings, History } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard', label: 'หน้าหลัก', icon: Home },
  { to: '/memories', label: 'ความทรงจำ', icon: BookHeart },
  { to: '/anniversaries', label: 'ครบรอบ', icon: Heart },
  { to: '/timeline', label: 'Timeline', icon: History },
  { to: '/letters', label: 'จดหมาย', icon: Mail },
  { to: '/gallery', label: 'รูปภาพ', icon: Images },
  { to: '/settings', label: 'ตั้งค่า', icon: Settings },
]
