import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { ToastProvider } from '@/contexts/ToastContext'
import ProtectedRoute from '@/routes/ProtectedRoute'

import Login from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'
import Memories from '@/pages/Memories'
import MemoryDetail from '@/pages/MemoryDetail'
import Anniversaries from '@/pages/Anniversaries'
import Timeline from '@/pages/Timeline'
import Letters from '@/pages/Letters'
import Gallery from '@/pages/Gallery'
import Settings from '@/pages/Settings'
import NotFound from '@/pages/NotFound'

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Login />} />

          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/memories" element={<ProtectedRoute><Memories /></ProtectedRoute>} />
          <Route path="/memories/:id" element={<ProtectedRoute><MemoryDetail /></ProtectedRoute>} />
          <Route path="/anniversaries" element={<ProtectedRoute><Anniversaries /></ProtectedRoute>} />
          <Route path="/timeline" element={<ProtectedRoute><Timeline /></ProtectedRoute>} />
          <Route path="/letters" element={<ProtectedRoute><Letters /></ProtectedRoute>} />
          <Route path="/gallery" element={<ProtectedRoute><Gallery /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </ToastProvider>
    </AuthProvider>
  )
}
