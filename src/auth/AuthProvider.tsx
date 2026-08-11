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

  useEffect(() => {
    return onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser)
      setLoading(false)
    })
  }, [])

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    isAuthenticated: Boolean(user),
    isEmailVerified: Boolean(user?.emailVerified),
    isAdmin: Boolean(user?.getIdTokenResult && false),
    login: loginWithEmail,
    register: registerWithEmail,
    logout,
  }), [loading, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider.')
  return context
}
