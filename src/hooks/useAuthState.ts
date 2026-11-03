import { useEffect, useState, type FormEvent } from 'react'
import {
  onAuthStateChanged,
  reload,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth'
import { FirebaseError } from 'firebase/app'
import { auth, db } from '../firebase/config'
import { registerCustomerAccount } from '../firebase/commerce'
import { addNotification } from '../lib/home'
import { postMailService } from '../lib/api'

const verificationCenterUrl = `${window.location.origin}/verificar-email?registro=pendiente`
const verificationSuccessUrl = `${window.location.origin}/verificar-email?registro=ok`

export function useAuthState() {
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [user, setUser] = useState<User | null>(null)
  const [isAuthInitializing, setIsAuthInitializing] = useState(true)
  const [authMessage, setAuthMessage] = useState<string | null>(null)
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false)
  const [isAuthLoading, setIsAuthLoading] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser)
      setIsAuthInitializing(false)
    })
    return () => unsubscribe()
  }, [])

  const handleSignIn = async (event: FormEvent) => {
    event.preventDefault()
    setAuthMessage(null)
    setIsAuthLoading(true)

    if (!authEmail || !authPassword) {
      setAuthMessage('Ingresá tu correo y tu clave para continuar.')
      setIsAuthLoading(false)
      return
    }

    try {
      const credential = await signInWithEmailAndPassword(auth, authEmail, authPassword)
      await reload(credential.user)

      if (!credential.user.emailVerified) {
        await signOut(auth)
        setAuthMessage('Tu cuenta existe, pero el correo todavía no fue validado. Revisá tu bandeja y luego intentá de nuevo.')
        return
      }

      await addNotification(db, 'Ingreso exitoso', 'Usuario autenticado en la red', {
        email: credential.user.email ?? authEmail,
      })
      setAuthMessage('Ingreso confirmado. Tu sesión ya está activa.')
    } catch (error) {
      if (error instanceof FirebaseError && error.code === 'auth/invalid-credential') {
        setAuthMessage('Credenciales incorrectas. Revisalas e intentá nuevamente.')
        return
      }

      setAuthMessage('No pudimos iniciar tu sesión en este momento.')
    } finally {
      setIsAuthLoading(false)
    }
  }

  const handleSignUp = async () => {
    setAuthMessage(null)
    setIsAuthLoading(true)

    if (!authEmail.includes('@') || authPassword.length < 6) {
      setAuthMessage('Usá un correo válido y una clave de al menos 6 caracteres.')
      setIsAuthLoading(false)
      return
    }

    try {
      const credential = await registerCustomerAccount(auth, db, authEmail, authPassword)
      await sendEmailVerification(credential.user, {
        url: verificationSuccessUrl,
        handleCodeInApp: false,
      })
      await postMailService({
        path: '/registration-notice',
        payload: {
          email: credential.user.email ?? authEmail,
          verificationUrl: verificationCenterUrl,
        },
      })
      await addNotification(db, 'Registro completado', 'Nuevo usuario registrado para comprar', {
        email: credential.user.email ?? authEmail,
      })
      setIsRegisterModalOpen(true)
      setAuthMessage('Registro creado. Te enviamos un correo de validación y un acceso al centro de verificación.')
    } catch (error) {
      if (error instanceof FirebaseError && error.code === 'auth/email-already-in-use') {
        setAuthMessage('Ese correo ya está registrado. Probá iniciar sesión.')
        return
      }

      setAuthMessage('No pudimos completar el registro. Revisá los datos e intentá de nuevo.')
    } finally {
      setIsAuthLoading(false)
    }
  }

  const handleSignOut = async () => {
    await signOut(auth)
    setAuthMessage('Sesión cerrada. Cuando quieras volver, ingresá con tu correo verificado.')
  }

  return {
    authEmail,
    authMessage,
    authPassword,
    isAuthenticated: Boolean(user),
    isAuthInitializing,
    isAuthLoading,
    isRegisterModalOpen,
    setAuthEmail,
    setAuthPassword,
    setIsRegisterModalOpen,
    signOut: handleSignOut,
    handleSignIn,
    handleSignUp,
    setAuthMessage,
    user,
    verificationCenterUrl,
  }
}
