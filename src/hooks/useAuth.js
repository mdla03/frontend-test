import { useCallback, useState } from 'react'
import { clearToken, getCurrentUser, setToken } from '../lib/auth'

export function useAuth() {
  const [user, setUser] = useState(getCurrentUser)

  const login = useCallback((token) => {
    setToken(token)
    setUser(getCurrentUser())
  }, [])

  const logout = useCallback(() => {
    clearToken()
    setUser(null)
  }, [])

  return { user, login, logout, isAuthenticated: Boolean(user) }
}
