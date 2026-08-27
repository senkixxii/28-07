import BearMascot from './BearMascot'

export default function PageLoader({ message = 'กำลังเปิดสมุดของเรา...' }: { message?: string }) {
  return (
    <div className="flex min-h-[60vh] w-full flex-col items-center justify-center gap-4 text-center">
      <BearMascot size={72} mood="sleepy" float />
      <p className="animate-pulse text-sm font-medium text-ink-soft">🐻 {message}</p>
    </div>
  )
}
