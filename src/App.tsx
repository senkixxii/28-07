import { Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/contexts/AuthContext'
import ProtectedRoute from '@/routes/ProtectedRoute'
import OpeningIntro from '@/components/book/OpeningIntro'

import LandingPage from '@/pages/LandingPage'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import ForgotPasswordPage from '@/pages/ForgotPasswordPage'
import BookHomePage from '@/pages/BookHomePage'
import AnniversariesPage from '@/pages/AnniversariesPage'
import AnniversaryDetailPage from '@/pages/AnniversaryDetailPage'
import MemoryBookPage from '@/pages/MemoryBookPage'
import LettersPage from '@/pages/LettersPage'
import PhotosPage from '@/pages/PhotosPage'
import SettingsPage from '@/pages/SettingsPage'
import NotFoundPage from '@/pages/NotFoundPage'

export default function App() {
  return (
    <AuthProvider>
      <OpeningIntro />
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: '#FFFDFC',
            color: '#4A3F45',
            border: '1px solid rgba(0,0,0,0.05)',
            borderRadius: '1rem',
          },
        }}
      />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        <Route path="/book" element={<ProtectedRoute><BookHomePage /></ProtectedRoute>} />
        <Route path="/anniversaries" element={<ProtectedRoute><AnniversariesPage /></ProtectedRoute>} />
        <Route path="/anniversaries/:id" element={<ProtectedRoute><AnniversaryDetailPage /></ProtectedRoute>} />
        <Route path="/memory-book" element={<ProtectedRoute><MemoryBookPage /></ProtectedRoute>} />
        <Route path="/letters" element={<ProtectedRoute><LettersPage /></ProtectedRoute>} />
        <Route path="/photos" element={<ProtectedRoute><PhotosPage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

        <Route path="/dashboard" element={<Navigate to="/book" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AuthProvider>
  )
}
