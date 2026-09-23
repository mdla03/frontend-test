import { useCallback, useState } from 'react'
import { clearToken, getCurrentUser, setToken, setUser as persistUser } from '../lib/auth'

export function useAuth() {
  const [user, setUser] = useState(getCurrentUser)

  const login = useCallback((token, userData) => {
    setToken(token)
    persistUser(userData)
    setUser(userData)
  }, [])

  const logout = useCallback(() => {
    clearToken()
    setUser(null)
  }, [])

  return { user, login, logout, isAuthenticated: Boolean(user) }
}
