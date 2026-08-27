import { Link } from 'react-router-dom'
import BearMascot from '@/components/bear/BearMascot'
import Button from '@/components/ui/Button'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-cream px-4 text-center">
      <BearMascot size={100} mood="sad" float />
      <h1 className="text-xl font-semibold text-ink">หน้านี้หายไปจากสมุดของเรานะ 🐻</h1>
      <p className="text-sm text-ink-soft">ลองกลับไปหน้าของเราดูสิ</p>
      <Link to="/book">
        <Button>กลับหน้าของเรา</Button>
      </Link>
    </div>
  )
}
