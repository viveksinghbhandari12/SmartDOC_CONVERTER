import {
  useCallback,
  useMemo,
  useState,
  useEffect,
} from 'react'
import { AuthContext } from './auth-context.js'
import { api } from '../services/api.js'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const logout = useCallback(() => {
    localStorage.removeItem('smartdoc_token')
    setUser(null)
  }, [])

  const loadMe = useCallback(async () => {
    const token = localStorage.getItem('smartdoc_token')
    if (!token) {
      setUser(null)
      setLoading(false)
      return
    }
    try {
      const { data } = await api.get('/api/auth/me')
      setUser(data.data.user)
    } catch {
      localStorage.removeItem('smartdoc_token')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadMe()
  }, [loadMe])

  const login = useCallback((token, userPayload) => {
    localStorage.setItem('smartdoc_token', token)
    setUser(userPayload)
  }, [])

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      logout,
      refreshUser: loadMe,
    }),
    [user, loading, login, logout, loadMe]
  )

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  )
}
