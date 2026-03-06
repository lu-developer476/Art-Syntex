import { useEffect, useMemo, useState } from 'react'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../firebase/config'
import { createPurchaseOrder } from '../firebase/commerce'
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
  })
    .format(price)
    .replace('US$', '€$')

export default function Products() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [authMessage, setAuthMessage] = useState<string | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [cart, setCart] = useState<CartItem[]>([])

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
      setAuthMessage('Necesitás sesión activa y productos en el carrito para confirmar la compra.')
      return
    }

    if (!user.email) {
      setAuthMessage('No pudimos confirmar la compra porque tu cuenta no tiene correo válido.')
      return
    }

    try {
      await createPurchaseOrder(db, user.uid, user.email, cart)

      await addNotification('Compra en revisión', 'Carrito enviado para confirmación de compra', {
        email: user.email,
        total: String(cartTotal),
      })

      setCart([])
      setAuthMessage('Compra preconfirmada: Firestore creó tu orden en purchaseOrders.')
    } catch {
      setAuthMessage('No pudimos guardar la orden. Revisá permisos de Firestore (rules).')
    }
  }

  return (
    <section className="mx-auto max-w-6xl space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-purple-100">Productos</h2>
          <p className="mt-1 text-sm text-purple-200">
            Personaliza tu pedido y verifica cada mejora antes de autorizar el pago digital.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-400/60 bg-red-950/60 p-4 text-sm text-red-200">{error}</div>
      )}

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
                    Detalles
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
              <p className="mt-3 text-lg font-bold text-purple-100">Precio: {formatPrice(selectedProduct.price)}</p>
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
        {authMessage ? <p className="mt-3 text-sm text-purple-200">{authMessage}</p> : null}
      </section>
    </section>
  )
}
