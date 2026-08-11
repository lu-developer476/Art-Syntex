import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth'
import { auth } from '../config'

export type AuthUser = User

export async function registerWithEmail(email: string, password: string, displayName?: string) {
  const credential = await createUserWithEmailAndPassword(auth, email.trim(), password)

  if (displayName?.trim()) {
    await updateProfile(credential.user, { displayName: displayName.trim() })
  }

  await sendEmailVerification(credential.user)
  return credential.user
}

export async function loginWithEmail(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(auth, email.trim(), password)
  return credential.user
}

export async function logout() {
  await signOut(auth)
}

export function isEmailVerified(user: User | null) {
  return Boolean(user?.emailVerified)
}

export function getAuthErrorMessage(error: unknown) {
  const code = error instanceof Error && 'code' in error ? String(error.code) : ''

  const messages: Record<string, string> = {
    'auth/invalid-email': 'El correo electrónico no es válido.',
    'auth/invalid-credential': 'Las credenciales no son válidas.',
    'auth/user-not-found': 'No existe una cuenta con ese correo.',
    'auth/wrong-password': 'La contraseña no es correcta.',
    'auth/email-already-in-use': 'Ese correo ya está registrado.',
    'auth/weak-password': 'La contraseña no cumple los requisitos mínimos.',
    'auth/too-many-requests': 'Demasiados intentos. Esperá unos minutos antes de volver a intentar.',
    'auth/network-request-failed': 'No se pudo conectar con Firebase. Revisá tu conexión.',
    'auth/user-disabled': 'Esta cuenta fue deshabilitada.',
  }

  return messages[code] ?? 'No se pudo completar la operación de autenticación.'
}
