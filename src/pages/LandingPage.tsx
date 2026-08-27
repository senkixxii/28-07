import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import BookCover from '@/components/book/BookCover'
import FloatingHearts from '@/components/book/FloatingHearts'
import BearMascot from '@/components/bear/BearMascot'
import { useAuth } from '@/contexts/AuthContext'

export default function LandingPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [opening, setOpening] = useState(false)

  function handleOpen() {
    setOpening(true)
    setTimeout(() => navigate(user ? '/book' : '/login'), 650)
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-soft-pink via-cream to-baby-blue/40 px-4 py-16 text-center">
      <FloatingHearts />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 mb-4"
      >
        <BearMascot size={72} mood="happy" float easterEgg />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="relative z-10 text-3xl font-semibold text-ink sm:text-4xl"
      >
        Our Little Love Book
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="relative z-10 mt-1 text-ink-soft"
      >
        สมุดเล็ก ๆ ของเราสองคน 🐻💕
      </motion.p>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="relative z-10 mt-3 max-w-sm text-sm text-ink-muted"
      >
        เรื่องราวเล็ก ๆ ที่อยากเก็บไว้ด้วยกัน
      </motion.p>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="relative z-10 my-10"
      >
        <BookCover onOpen={handleOpen} opening={opening} />
      </motion.div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleOpen}
        className="relative z-10 inline-flex items-center gap-2 rounded-full bg-pastel-pink px-7 py-3 font-medium text-ink shadow-softer transition-all hover:bg-[#f5aac5] hover:shadow-soft"
      >
        เปิดสมุดของเรา
      </motion.button>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="relative z-10 mt-6 text-xs italic text-ink-muted"
      >
        A little book for our little moments.
      </motion.p>
    </div>
  )
}
