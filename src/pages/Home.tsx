import { FormEvent, useEffect, useMemo, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../firebase/config'
import { getOrSeedProducts } from '../firebase/products'
import type { Product } from '../data/products'

interface CartItem {
  product: Product
  quantity: number
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(price)

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [user, setUser] = useState<User | null>(null)
  const [authMessage, setAuthMessage] = useState<string | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  const [contactName, setContactName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactDescription, setContactDescription] = useState('')
  const [contactMessage, setContactMessage] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser)
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const items = await getOrSeedProducts()
        setProducts(items)
      } catch {
        setError('No pudimos conectar con Firebase. Revisá tus variables VITE_FIREBASE_*')
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [])

  const featuredCount = useMemo(
    () => products.filter((product) => product.featured).length,
    [products],
  )

  const cartTotal = useMemo(
    () => cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0),
    [cart],
  )

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
    try {
      const credential = await signInWithEmailAndPassword(auth, authEmail, authPassword)
      await addNotification('Ingreso exitoso', 'Usuario autenticado en Art-Synt', {
        email: credential.user.email ?? authEmail,
      })
      setAuthMessage('Ingreso correcto. Tu sesión quedó activa en Firebase Auth.')
    } catch {
      setAuthMessage('No se pudo ingresar. Revisá correo y contraseña registrados.')
    }
  }

  const handleSignUp = async () => {
    setAuthMessage(null)
    try {
      const credential = await createUserWithEmailAndPassword(auth, authEmail, authPassword)
      await addDoc(collection(db, 'mail'), {
        to: [credential.user.email],
        message: {
          subject: 'Bienvenido a Art-Synt',
          text: 'Tu cuenta fue creada correctamente en Art-Synt. Ya podés comprar cyberware.',
        },
      })
      await addNotification('Registro completado', 'Nuevo usuario registrado para comprar', {
        email: credential.user.email ?? authEmail,
      })
      setAuthMessage('Registro exitoso. Te enviamos una notificación por Firebase.')
    } catch {
      setAuthMessage('No se pudo registrar. Probá con otro correo o una contraseña más segura.')
    }
  }

  const handleAddToCart = (product: Product) => {
    setCart((currentCart) => {
      const existing = currentCart.find((item) => item.product.id === product.id)
      if (existing) {
        return currentCart.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        )
      }
      return [...currentCart, { product, quantity: 1 }]
    })
  }

  const handleConfirmPurchase = async () => {
    if (!user || cart.length === 0) {
      return
    }

    await addDoc(collection(db, 'carts'), {
      email: user.email,
      items: cart.map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
      })),
      total: cartTotal,
      createdAt: serverTimestamp(),
    })

    await addNotification('Compra en revisión', 'Carrito enviado para confirmación de compra', {
      email: user.email ?? 'sin-email',
      total: String(cartTotal),
    })

    setCart([])
    setAuthMessage('Compra preconfirmada: guardamos tu carrito en Firebase.')
  }

  const handleContactSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setContactMessage(null)

    try {
      await addDoc(collection(db, 'contactMessages'), {
        name: contactName,
        email: contactEmail,
        description: contactDescription,
        createdAt: serverTimestamp(),
      })

      await addDoc(collection(db, 'mail'), {
        to: [contactEmail],
        message: {
          subject: 'Recibimos tu sugerencia en Art-Synt',
          text: `Hola ${contactName}, recibimos tu mensaje: "${contactDescription}"`,
        },
      })

      await addNotification('Nuevo contacto', 'Se recibió una sugerencia para la tienda', {
        email: contactEmail,
      })

      setContactName('')
      setContactEmail('')
      setContactDescription('')
      setContactMessage('Gracias por tu sugerencia. Firebase generó la notificación de correo.')
    } catch {
      setContactMessage('No pudimos enviar la sugerencia. Verificá la configuración de Firebase.')
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-12 pb-16">
      <section className="rounded-3xl border border-purple-300 bg-purple-50 p-8 shadow-md">
        <img src="/logo.svg" alt="Logo de Art-Synt" className="h-14 w-14" />
        <p className="mt-4 text-sm uppercase tracking-[0.25em] text-purple-700">Art-Synt</p>
        <h1 className="mt-3 text-4xl font-bold text-purple-900 md:text-6xl">
          Bienvenido a Art-Synt: implantes de élite para sobrevivir Night City
        </h1>
        <p className="mt-4 max-w-3xl text-base text-purple-700 md:text-lg">
          En 2077, Art-Synt es una corporación independiente que diseña cyberware premium para
          mercenarios, netrunners y operadores de alto riesgo. Nuestro catálogo combina implantes
          experimentales, soporte táctico y estética urbana inspirada en los distritos más hostiles
          de Night City.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <InfoCard label="Productos" value={products.length || 10} />
          <InfoCard label="Destacados" value={featuredCount || 3} />
          <InfoCard label="Estado" value={loading ? 'Sincronizando' : 'Online'} />
        </div>
      </section>

      <section className="grid gap-6 rounded-3xl border border-purple-200 bg-white p-6 md:grid-cols-2">
        <div>
          <h2 className="text-2xl font-semibold text-purple-900">Acceso de clientes</h2>
          <p className="mt-2 text-sm text-purple-700">
            Ingresá con correo y contraseña de Firebase Auth o registrate para empezar a comprar.
          </p>
          {user ? (
            <div className="mt-4 space-y-3 rounded-xl bg-purple-50 p-4">
              <p className="text-sm text-purple-800">Sesión activa: {user.email}</p>
              <button
                onClick={() => signOut(auth)}
                className="rounded-lg border border-purple-400 px-3 py-2 text-sm text-purple-700 hover:bg-purple-100"
              >
                Cerrar sesión
              </button>
            </div>
          ) : null}
          {authMessage ? <p className="mt-3 text-sm text-purple-700">{authMessage}</p> : null}
        </div>

        <form className="space-y-3" onSubmit={handleSignIn}>
          <label className="block text-sm text-purple-800">
            Correo
            <input
              type="email"
              value={authEmail}
              onChange={(event) => setAuthEmail(event.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-purple-300 px-3 py-2"
            />
          </label>
          <label className="block text-sm text-purple-800">
            Contraseña
            <input
              type="password"
              value={authPassword}
              onChange={(event) => setAuthPassword(event.target.value)}
              required
              minLength={6}
              className="mt-1 w-full rounded-lg border border-purple-300 px-3 py-2"
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
              className="rounded-lg border border-purple-400 px-4 py-2 text-sm text-purple-700 hover:bg-purple-100"
            >
              Registrarse
            </button>
          </div>
        </form>
      </section>

      {error && (
        <div className="rounded-2xl border border-red-300 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      <section className="space-y-5">
        <h2 className="text-2xl font-semibold text-purple-900">Productos</h2>
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2">
            {Array.from({ length: 10 }).map((_, index) => (
              <div
                key={index}
                className="h-[340px] animate-pulse rounded-2xl border border-purple-200 bg-purple-100"
              />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {products.map((product) => (
              <article
                key={product.id}
                className="group overflow-hidden rounded-2xl border border-purple-200 bg-white transition hover:-translate-y-1 hover:border-purple-400"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-48 w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="space-y-3 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-xl font-semibold text-purple-900">{product.name}</h3>
                    <span className="rounded-full bg-purple-100 px-3 py-1 text-xs uppercase tracking-widest text-purple-700">
                      {product.category}
                    </span>
                  </div>
                  <p className="text-lg font-bold text-purple-800">{formatPrice(product.price)}</p>
                  <div className="flex flex-wrap gap-3">
                    <button
                      className="rounded-lg border border-purple-400 px-3 py-2 text-sm text-purple-700 hover:bg-purple-100"
                      onClick={() => setSelectedProduct(product)}
                    >
                      Detalles
                    </button>
                    <button
                      className="rounded-lg bg-purple-700 px-3 py-2 text-sm text-white hover:bg-purple-800"
                      onClick={() => handleAddToCart(product)}
                    >
                      Incorporar al carrito
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {selectedProduct ? (
        <section className="rounded-2xl border border-purple-300 bg-purple-50 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-2xl font-semibold text-purple-900">{selectedProduct.name}</h3>
              <p className="mt-2 text-purple-700">{selectedProduct.description}</p>
              <p className="mt-3 text-lg font-bold text-purple-900">
                Precio: {formatPrice(selectedProduct.price)}
              </p>
            </div>
            <button
              className="rounded-lg border border-purple-400 px-3 py-2 text-sm text-purple-700 hover:bg-purple-100"
              onClick={() => setSelectedProduct(null)}
            >
              Cerrar detalle
            </button>
          </div>
        </section>
      ) : null}

      <section className="rounded-3xl border border-purple-200 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-2xl font-semibold text-purple-900">Carrito</h2>
          <p className="text-lg font-bold text-purple-900">Total: {formatPrice(cartTotal)}</p>
        </div>
        {cart.length === 0 ? (
          <p className="mt-4 text-sm text-purple-700">Todavía no agregaste productos al carrito.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {cart.map((item) => (
              <li
                key={item.product.id}
                className="flex items-center justify-between rounded-lg border border-purple-200 px-4 py-3"
              >
                <span className="text-sm text-purple-800">
                  {item.product.name} x {item.quantity}
                </span>
                <span className="text-sm font-semibold text-purple-900">
                  {formatPrice(item.product.price * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
        )}
        <button
          onClick={handleConfirmPurchase}
          disabled={!user || cart.length === 0}
          className="mt-5 rounded-lg bg-purple-700 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-purple-300"
        >
          Confirmar compra
        </button>
      </section>

      <section className="rounded-3xl border border-purple-200 bg-white p-6">
        <h2 className="text-2xl font-semibold text-purple-900">Contacto</h2>
        <p className="mt-2 text-sm text-purple-700">
          Enviá sugerencias sobre la tienda. Guardamos tu mensaje y disparamos un correo desde
          Firebase (colección mail) si está configurada la extensión de Email Trigger.
        </p>
        <form className="mt-4 grid gap-4 md:grid-cols-2" onSubmit={handleContactSubmit}>
          <label className="text-sm text-purple-800">
            Nombre y apellido
            <input
              value={contactName}
              onChange={(event) => setContactName(event.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-purple-300 px-3 py-2"
            />
          </label>
          <label className="text-sm text-purple-800">
            Correo
            <input
              type="email"
              value={contactEmail}
              onChange={(event) => setContactEmail(event.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-purple-300 px-3 py-2"
            />
          </label>
          <label className="text-sm text-purple-800 md:col-span-2">
            Descripción de sugerencias
            <textarea
              value={contactDescription}
              onChange={(event) => setContactDescription(event.target.value)}
              required
              rows={4}
              className="mt-1 w-full rounded-lg border border-purple-300 px-3 py-2"
            />
          </label>
          <button
            type="submit"
            className="rounded-lg bg-purple-700 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-800 md:w-fit"
          >
            Enviar sugerencia
          </button>
        </form>
        {contactMessage ? <p className="mt-3 text-sm text-purple-700">{contactMessage}</p> : null}
      </section>
    </div>
  )
}

function InfoCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-purple-200 bg-white p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-purple-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-purple-800">{value}</p>
    </div>
  )
}
