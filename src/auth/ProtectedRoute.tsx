import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './AuthProvider'

export default function ProtectedRoute({ requireVerifiedEmail = false, requireAdmin = false }: { requireVerifiedEmail?: boolean; requireAdmin?: boolean }) {
  const { loading, isAuthenticated, isEmailVerified, isAdmin } = useAuth()
  const location = useLocation()

  if (loading) return null
  if (!isAuthenticated) return <Navigate to="/acceso" replace state={{ from: location.pathname }} />
  if (requireVerifiedEmail && !isEmailVerified) return <Navigate to="/verificar-email" replace />
  if (requireAdmin && !isAdmin) return <Navigate to="/" replace />

  return <Outlet />
}
