import { onAuthStateChanged, type User } from 'firebase/auth'
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { auth } from '../firebase/config'
import { loginWithEmail, logout, registerWithEmail } from '../firebase/services/authService'

type AuthContextValue = {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  isEmailVerified: boolean
  isAdmin: boolean
  login: (email: string, password: string) => Promise<User>
  register: (email: string, password: string, displayName?: string) => Promise<User>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    return onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser)

      if (!nextUser) {
        setIsAdmin(false)
        setLoading(false)
        return
      }

      try {
        const token = await nextUser.getIdTokenResult()
        setIsAdmin(token.claims.admin === true)
      } catch {
        setIsAdmin(false)
      } finally {
        setLoading(false)
      }
    })
  }, [])

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    isAuthenticated: Boolean(user),
    isEmailVerified: Boolean(user?.emailVerified),
    isAdmin,
    login: loginWithEmail,
    register: registerWithEmail,
    logout,
  }), [isAdmin, loading, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider.')
  return context
}
