import { useEffect } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { api } from '../lib/api'
import { getToken } from '../lib/auth'

export default function ProtectedRoute({ allow }) {
  const { user, login, logout, isAuthenticated } = useAuth()

  // The cached user goes stale when an admin changes a role or application status,
  // so re-sync it from the server on entry instead of waiting for the next login.
  useEffect(() => {
    if (!getToken()) return
    api
      .get('/me')
      .then(({ data }) => login(getToken(), data.data))
      .catch((err) => {
        if (err.response?.status === 401) logout()
      })
  }, [login, logout])

  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (allow && !allow.includes(user.role)) return <Navigate to="/login" replace />

  return <Outlet />
}
