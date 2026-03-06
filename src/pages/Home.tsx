import { FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from 'firebase/auth'
import { FirebaseError } from 'firebase/app'
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

export type SectionKey = 'acceso' | 'productos' | 'contacto'

interface HomeProps {
  focusSection?: SectionKey
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  })
    .format(price)
    .replace('US$', '€$')

export default function Home({ focusSection }: HomeProps) {
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

  const accesoRef = useRef<HTMLElement>(null)
  const productosRef = useRef<HTMLElement>(null)
  const contactoRef = useRef<HTMLElement>(null)

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
        setError('No pudimos conectarte a nuestra red. Revisa tus credenciales.')
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [])

  useEffect(() => {
    const map = {
      acceso: accesoRef,
      productos: productosRef,
      contacto: contactoRef,
    }

    if (focusSection) {
      map[focusSection].current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [focusSection])


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

    if (!authEmail || !authPassword) {
      setAuthMessage('ID y clave requeridos.')
      return
    }

    try {
      const credential = await signInWithEmailAndPassword(auth, authEmail, authPassword)
      await addNotification('Ingreso exitoso', 'Usuario autenticado en la red', {
        email: credential.user.email ?? authEmail,
      })
      setAuthMessage('Sesión identificada en la base de datos.')
    } catch (error) {
      if (error instanceof FirebaseError && error.code === 'auth/invalid-credential') {
        setAuthMessage('Credenciales incorrectas. Verificar.')
        return
      }

      setAuthMessage('Error de ingreso')
    }
  }

  const handleSignUp = async () => {
    setAuthMessage(null)

    if (!authEmail.includes('@') || authPassword.length < 6) {
      setAuthMessage('Las credenciales son personales. Por favor, resguardalas.')
      return
    }

    try {
      const credential = await registerCustomerAccount(auth, db, authEmail, authPassword)
      await addDoc(collection(db, 'mail'), {
        to: [credential.user.email],
        message: {
          subject: 'Bienvenido a la red',
          text: 'Tu cuenta fue creada correctamente. Estás habilitado para comprar nuestros productos.',
        },
      })
      await addNotification('Registro completado', 'Nuevo usuario registrado para comprar', {
        email: credential.user.email ?? authEmail,
      })
      setAuthMessage('Registro exitoso. Perfil del cliente operativo.')
    } catch (error) {
      if (error instanceof FirebaseError && error.code === 'auth/email-already-in-use') {
        setAuthMessage('El ID ya está registrado. Se requieren identificadores diferentes.')
        return
      }

      setAuthMessage('No se pudo registrar. Revisa tus credenciales.')
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
      setAuthMessage('El derecho a comprar está restringido a nuestros usuarios. Por favor, registrate para operar en nuestro sitio.')
      return
    }

    if (!user.email) {
      setAuthMessage('No pudimos confirmar la compra porque no hay registros en nuestra red.')
      return
    }

    try {
      await createPurchaseOrder(db, user.uid, user.email, cart)

      await addNotification('Producto en espera', 'Carrito enviado para aceptación de compra', {
        email: user.email,
        total: String(cartTotal),
      })

      setCart([])
      setAuthMessage('Compra preconfirmada: Orden generada.')
    } catch {
      setAuthMessage('No pudimos guardar la orden. Vuelve a intentarlo en unos minutos.')
    }
  }

  const handleContactSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setContactMessage(null)

    if (contactDescription.trim().length < 20) {
      setContactMessage('Tu perfil debe tener al menos 20 caracteres para evaluación.')
      return
    }

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
          subject: 'Postulación recibida en nuestros sistemas',
          text: `Hola ${contactName}, recibimos tu perfil para operaciones en Night City: "${contactDescription}"`,
        },
      })

      await addNotification('Nueva postulación', 'Se recibió una solicitud para unirse a la red', {
        email: contactEmail,
      })

      setContactName('')
      setContactEmail('')
      setContactDescription('')
      setContactMessage('Postulación enviada con éxito. El personal encargado te contactará pronto.')
    } catch {
      setContactMessage('Fallo en la red. Vuelve a intentarlo en unos minutos.')
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-12 pb-16">
      <HeroSection />

      <section className="grid gap-4 md:grid-cols-3">
        <InfoCard label="Productos" value={products.length || 10} />
        <InfoCard label="Mejoras en carrito" value={cart.length} />
        <InfoCard label="Estado" value={loading ? 'Sincronizando' : 'Activo'} />
      </section>

      <section
        ref={accesoRef}
        id="acceso"
        className="grid scroll-mt-24 gap-6 rounded-3xl border border-purple-400/50 bg-gradient-to-br from-purple-950/80 via-black/70 to-slate-900/70 p-6 md:grid-cols-2"
      >
        <div>
          <h2 className="text-2xl font-semibold text-purple-100">Acceso</h2>
          <p className="mt-2 text-sm text-purple-200">
            Para operar en nuestra red, valida tu identidad.
          </p>
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

      {error && (
        <div className="rounded-2xl border border-red-400/60 bg-red-950/60 p-4 text-sm text-red-200">{error}</div>
      )}

      <section ref={productosRef} id="productos" className="scroll-mt-24 space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold text-purple-100">Productos</h2>
            <p className="mt-1 text-sm text-purple-200">
              Personaliza tu pedido y verifica cada mejora antes de autorizar el pago digital.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2">
            {Array.from({ length: 10 }).map((_, index) => (
              <div
                key={index}
                className="h-[340px] animate-pulse rounded-2xl border border-purple-300/50 bg-purple-900/30"
              />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {products.map((product) => (
              <article
                key={product.id}
                className="group overflow-hidden rounded-2xl border border-purple-300/50 bg-black/50 transition hover:-translate-y-1 hover:border-purple-300"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-48 w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="space-y-3 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-android text-xl font-semibold text-purple-50">{product.name}</h3>
                    <span className="rounded-full bg-purple-900/60 px-3 py-1 text-xs uppercase tracking-widest text-purple-200">
                      {product.category}
                    </span>
                  </div>
                  <p className="text-lg font-bold text-purple-200">{formatPrice(product.price)}</p>
                  <p className="font-android text-sm text-purple-300">{product.description}</p>
                  <div className="flex flex-wrap gap-3">
                    <button
                      className="rounded-lg border border-purple-300 px-3 py-2 text-sm text-purple-100 hover:bg-purple-800/40"
                      onClick={() => setSelectedProduct(product)}
                    >
                      Vista previa
                    </button>
                    <button
                      className="rounded-lg bg-purple-700 px-3 py-2 text-sm text-white hover:bg-purple-800"
                      onClick={() => handleAddToCart(product)}
                    >
                      Agregar al carrito · Total: {formatPrice(cartTotal)}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {selectedProduct ? (
          <section className="rounded-2xl border border-purple-300/50 bg-purple-950/60 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-android text-2xl font-semibold text-purple-100">{selectedProduct.name}</h3>
                <p className="font-android mt-2 text-purple-200">{selectedProduct.description}</p>
                <p className="mt-3 text-lg font-bold text-purple-100">
                  Precio: {formatPrice(selectedProduct.price)}
                </p>
              </div>
              <button
                className="rounded-lg border border-purple-300 px-3 py-2 text-sm text-purple-100 hover:bg-purple-900/50"
                onClick={() => setSelectedProduct(null)}
              >
                Cerrar detalles
              </button>
            </div>
          </section>
        ) : null}

        <section className="rounded-3xl border border-purple-400/50 bg-gradient-to-br from-purple-950/80 via-black/70 to-slate-900/70 p-6">
          <h3 className="text-xl font-semibold text-purple-100">Detalles de compra</h3>
          {cart.length === 0 ? (
            <p className="mt-4 text-sm text-purple-200">Todavía no agregaste productos al carrito.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {cart.map((item) => (
                <li
                  key={item.product.id}
                  className="flex items-center justify-between rounded-lg border border-purple-300/40 px-4 py-3"
                >
                  <span className="text-sm text-purple-100">
                    {item.product.name} x {item.quantity}
                  </span>
                  <span className="text-sm font-semibold text-purple-100">
                    {formatPrice(item.product.price * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <button
            onClick={handleConfirmPurchase}
            disabled={!user || cart.length === 0}
            className="mt-5 rounded-lg bg-purple-700 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-purple-950"
          >
            Confirmar compra
          </button>
        </section>
      </section>

      <section
        ref={contactoRef}
        id="contacto"
        className="scroll-mt-24 rounded-3xl border border-purple-400/50 bg-gradient-to-br from-purple-950/80 via-black/70 to-slate-900/70 p-6"
      >
        <h2 className="text-2xl font-semibold text-purple-100">Contacto</h2>
        <p className="mt-2 text-sm text-purple-200">
          ¿Querés formar parte de nuestra empresa? Buscamos talentos para desarrollo de implantes y cyberware,
          operaciones de campo y seguridad corporativa en los distritos de Night City.
        </p>
        <form className="mt-4 grid gap-4 md:grid-cols-2" onSubmit={handleContactSubmit}>
          <label className="text-sm text-purple-100">
            Nombre o alias operativo
            <input
              value={contactName}
              onChange={(event) => setContactName(event.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-purple-400 bg-black/30 px-3 py-2 text-purple-50"
            />
          </label>
          <label className="text-sm text-purple-100">
            ID de contacto
            <input
              type="email"
              value={contactEmail}
              onChange={(event) => setContactEmail(event.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-purple-400 bg-black/30 px-3 py-2 text-purple-50"
            />
          </label>
          <label className="text-sm text-purple-100 md:col-span-2">
            Contanos tu especialidad y experiencias previas
            <textarea
              value={contactDescription}
              onChange={(event) => setContactDescription(event.target.value)}
              required
              minLength={20}
              rows={4}
              className="mt-1 w-full rounded-lg border border-purple-400 bg-black/30 px-3 py-2 text-purple-50"
            />
          </label>
          <button
            type="submit"
            className="rounded-lg bg-purple-700 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-800 md:w-fit"
          >
            Postular
          </button>
        </form>
        {contactMessage ? <p className="mt-3 text-sm text-purple-200">{contactMessage}</p> : null}
      </section>
    </div>
  )
}

function InfoCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="animate-pulse-glow rounded-xl border border-purple-400/40 bg-gradient-to-br from-purple-950/60 via-black/40 to-slate-900/50 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-purple-300">{label}</p>
      <p className="mt-2 text-2xl font-bold text-purple-100">{value}</p>
    </div>
  )
}
