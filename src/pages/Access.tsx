import { FormEvent, useEffect, useState } from 'react'
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from 'firebase/auth'
import { FirebaseError } from 'firebase/app'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../firebase/config'
import { registerCustomerAccount } from '../firebase/commerce'

export default function Access() {
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [user, setUser] = useState<User | null>(null)
  const [authMessage, setAuthMessage] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser)
    return () => unsubscribe()
  }, [])

  const addNotification = async (title: string, body: string, metadata: Record<string, string>) => {
    await addDoc(collection(db, 'notifications'), {
      title,
      body,
      metadata,
      createdAt: serverTimestamp(),
    })
  }

  const handleSignIn = async (event: FormEvent) => {
    event.preventDefault()
    setAuthMessage(null)

    if (!authEmail || !authPassword) {
      setAuthMessage('Ingresá ID y clave para autenticarte.')
      return
    }

    try {
      const credential = await signInWithEmailAndPassword(auth, authEmail, authPassword)
      await addNotification('Ingreso exitoso', 'Usuario autenticado en la red', {
        email: credential.user.email ?? authEmail,
      })
      setAuthMessage('Ingreso correcto. Tu sesión quedó activa en Firebase Auth.')
    } catch (error) {
      if (error instanceof FirebaseError && error.code === 'auth/invalid-credential') {
        setAuthMessage('Credenciales inválidas. Verificá ID y clave.')
        return
      }

      setAuthMessage('No se pudo ingresar. Revisá la configuración de Authentication en Firebase.')
    }
  }

  const handleSignUp = async () => {
    setAuthMessage(null)

    if (!authEmail.includes('@') || authPassword.length < 6) {
      setAuthMessage('Usá un ID válido y una clave de al menos 6 caracteres.')
      return
    }

    try {
      const credential = await registerCustomerAccount(auth, db, authEmail, authPassword)
      await addDoc(collection(db, 'mail'), {
        to: [credential.user.email],
        message: {
          subject: 'Bienvenido a la red',
          text: 'Tu cuenta fue creada correctamente. Ya podés comprar cyberware.',
        },
      })
      await addNotification('Registro completado', 'Nuevo usuario registrado para comprar', {
        email: credential.user.email ?? authEmail,
      })
      setAuthMessage('Registro exitoso. Authentication y perfil de cliente quedaron operativos.')
    } catch (error) {
      if (error instanceof FirebaseError && error.code === 'auth/email-already-in-use') {
        setAuthMessage('Ese ID ya está registrado. Probá iniciar sesión.')
        return
      }

      setAuthMessage('No se pudo registrar. Revisá Authentication/Firestore en Firebase.')
    }
  }

  return (
    <section className="mx-auto grid max-w-6xl gap-6 rounded-3xl border border-purple-400/50 bg-gradient-to-br from-purple-950/80 via-black/70 to-slate-900/70 p-6 md:grid-cols-2">
      <div>
        <h2 className="text-2xl font-semibold text-purple-100">Acceso</h2>
        <p className="mt-2 text-sm text-purple-200">Para operar en nuestra red, valida tu identidad.</p>
        {user ? (
          <div className="mt-4 space-y-3 rounded-xl bg-purple-900/40 p-4">
            <p className="text-sm text-purple-100">Sesión activa: {user.email}</p>
            <button
              onClick={() => signOut(auth)}
              className="rounded-lg border border-purple-300 px-3 py-2 text-sm text-purple-100 hover:bg-purple-800/50"
            >
              Cerrar sesión
            </button>
          </div>
        ) : null}
        {authMessage ? <p className="mt-3 text-sm text-purple-200">{authMessage}</p> : null}
      </div>

      <form className="space-y-3" onSubmit={handleSignIn}>
        <label className="block text-sm text-purple-100">
          ID
          <input
            type="email"
            value={authEmail}
            onChange={(event) => setAuthEmail(event.target.value)}
            required
            className="mt-1 w-full rounded-lg border border-purple-400 bg-black/30 px-3 py-2 text-purple-50"
          />
        </label>
        <label className="block text-sm text-purple-100">
          Clave
          <input
            type="password"
            value={authPassword}
            onChange={(event) => setAuthPassword(event.target.value)}
            required
            minLength={6}
            className="mt-1 w-full rounded-lg border border-purple-400 bg-black/30 px-3 py-2 text-purple-50"
          />
        </label>
        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            className="rounded-lg bg-purple-700 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-800"
          >
            Ingresar
          </button>
          <button
            type="button"
            onClick={handleSignUp}
            className="rounded-lg border border-purple-400 px-4 py-2 text-sm text-purple-100 hover:bg-purple-900/40"
          >
            Registrarse
          </button>
        </div>
      </form>
    </section>
  )
}
