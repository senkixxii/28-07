import { Link } from 'react-router-dom'
import BearMascot from '@/components/bear/BearMascot'
import Button from '@/components/ui/Button'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-cream px-4 text-center">
      <BearMascot size={100} mood="sad" float />
      <h1 className="text-xl font-semibold text-ink">อุ๊บส์! หาหน้าที่ตามหาไม่เจอ 🐻</h1>
      <p className="text-sm text-ink-soft">หน้านี้อาจจะหายไปในสมุดความทรงจำของเรานะ</p>
      <Link to="/dashboard">
        <Button>กลับหน้าหลัก</Button>
      </Link>
    </div>
  )
}
