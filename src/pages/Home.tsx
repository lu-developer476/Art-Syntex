import { FormEvent, useEffect, useMemo, useState } from 'react'
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from 'firebase/auth'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../firebase/config'
import { createPurchaseOrder, registerCustomerAccount } from '../firebase/commerce'
import { getOrSeedProducts } from '../firebase/products'
import type { Product } from '../data/products'
import HeroSection from '../sections/Hero'

interface CartItem {
  product: Product
  quantity: number
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  })
    .format(price)
    .replace('US$', '€$')

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
      await addNotification('Ingreso exitoso', 'Usuario autenticado en Art-Syntex', {
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
      const credential = await registerCustomerAccount(auth, db, authEmail, authPassword)
      await addDoc(collection(db, 'mail'), {
        to: [credential.user.email],
        message: {
          subject: 'Bienvenido a Art-Syntex',
          text: 'Tu cuenta fue creada correctamente en Art-Syntex. Ya podés comprar cyberware.',
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

    if (!user.email) {
      setAuthMessage('No pudimos confirmar la compra porque tu cuenta no tiene correo válido.')
      return
    }

    await createPurchaseOrder(db, user.uid, user.email, cart)

    await addNotification('Compra en revisión', 'Carrito enviado para confirmación de compra', {
      email: user.email,
      total: String(cartTotal),
    })

    setCart([])
    setAuthMessage('Compra preconfirmada: Firebase creó tu orden en purchaseOrders.')
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
          subject: 'Postulación recibida en Art-Syntex',
          text: `Hola ${contactName}, recibimos tu perfil para operaciones en Night City: "${contactDescription}"`,
        },
      })

      await addNotification('Nueva postulación', 'Se recibió una solicitud para unirse a Art-Syntex', {
        email: contactEmail,
      })

      setContactName('')
      setContactEmail('')
      setContactDescription('')
      setContactMessage('Tu postulación fue enviada. Nuestro equipo de reclutamiento te contactará.')
    } catch {
      setContactMessage('No pudimos enviar la postulación. Verificá la configuración de Firebase.')
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-12 pb-16">
      <HeroSection />

      <section className="grid gap-4 md:grid-cols-3">
        <InfoCard label="Productos" value={products.length || 10} />
        <InfoCard label="Destacados" value={featuredCount || 3} />
        <InfoCard label="Estado" value={loading ? 'Sincronizando' : 'Online'} />
      </section>

      <section id="acceso" className="grid scroll-mt-24 gap-6 rounded-3xl border border-purple-200 bg-gradient-to-br from-white via-purple-50 to-slate-100 p-6 md:grid-cols-2">
        <div>
          <h2 className="text-2xl font-semibold text-purple-900">Acceso</h2>
          <p className="mt-2 text-sm text-purple-700">
            Iniciá sesión para operar la tienda y autorizar compras de implantes con tu identidad
            validada en la red de Art-Syntex.
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

      <section id="productos" className="scroll-mt-24 space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold text-purple-900">Productos</h2>
            <p className="mt-1 text-sm text-purple-700">
              Revisá el catálogo, agregá mejoras al carrito y comprobá tu vista previa antes de
              confirmar la compra.
            </p>
          </div>
          <p className="text-lg font-bold text-purple-900">Total del carrito: {formatPrice(cartTotal)}</p>
        </div>

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
                      Vista previa
                    </button>
                    <button
                      className="rounded-lg bg-purple-700 px-3 py-2 text-sm text-white hover:bg-purple-800"
                      onClick={() => handleAddToCart(product)}
                    >
                      Agregar al carrito
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

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
                Cerrar vista previa
              </button>
            </div>
          </section>
        ) : null}

        <section className="rounded-3xl border border-purple-200 bg-gradient-to-br from-white via-purple-50 to-slate-100 p-6">
          <h3 className="text-xl font-semibold text-purple-900">Vista previa de compra</h3>
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
      </section>

      <section id="contacto" className="scroll-mt-24 rounded-3xl border border-purple-200 bg-gradient-to-br from-white via-purple-50 to-slate-100 p-6">
        <h2 className="text-2xl font-semibold text-purple-900">Contacto</h2>
        <p className="mt-2 text-sm text-purple-700">
          ¿Querés formar parte de Art-Syntex? Buscamos talentos para desarrollo de implantes,
          operaciones de campo y seguridad corporativa en los distritos de Night City.
        </p>
        <form className="mt-4 grid gap-4 md:grid-cols-2" onSubmit={handleContactSubmit}>
          <label className="text-sm text-purple-800">
            Nombre o alias operativo
            <input
              value={contactName}
              onChange={(event) => setContactName(event.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-purple-300 px-3 py-2"
            />
          </label>
          <label className="text-sm text-purple-800">
            Correo de contacto
            <input
              type="email"
              value={contactEmail}
              onChange={(event) => setContactEmail(event.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-purple-300 px-3 py-2"
            />
          </label>
          <label className="text-sm text-purple-800 md:col-span-2">
            Contanos tu especialidad y experiencia en Night City
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
            Enviar postulación
          </button>
        </form>
        {contactMessage ? <p className="mt-3 text-sm text-purple-700">{contactMessage}</p> : null}
      </section>
    </div>
  )
}

function InfoCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="animate-pulse-glow rounded-xl border border-purple-200 bg-gradient-to-br from-white via-purple-50 to-slate-100 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-purple-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-purple-800">{value}</p>
    </div>
  )
}
