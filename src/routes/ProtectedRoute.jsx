import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function ProtectedRoute({ allow }) {
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (allow && !allow.includes(user.role)) return <Navigate to="/login" replace />

  return <Outlet />
}
