import BearMascot from './BearMascot'

export default function PageLoader({ message = 'กำลังเปิดสมุดของเรา...' }: { message?: string }) {
  return (
    <div className="flex min-h-[60vh] w-full flex-col items-center justify-center gap-4 text-center">
      <BearMascot size={72} mood="sleepy" float />
      <p className="flex items-center gap-1 text-sm font-medium text-ink-soft">
        🐻 {message}
        <span className="inline-flex gap-0.5">
          <span className="animate-bounce [animation-delay:-0.3s]">.</span>
          <span className="animate-bounce [animation-delay:-0.15s]">.</span>
          <span className="animate-bounce">.</span>
        </span>
      </p>
    </div>
  )
}
