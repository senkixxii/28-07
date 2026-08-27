import { BookHeart, BookOpen, Home, Image, Mail } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/book', label: 'หน้าของเรา', icon: Home },
  { to: '/memory-book', label: 'สมุดเล่มนี้', icon: BookOpen },
  { to: '/anniversaries', label: 'ครบรอบ', icon: BookHeart },
  { to: '/letters', label: 'จดหมาย', icon: Mail },
  { to: '/photos', label: 'รูปภาพ', icon: Image },
]
