import { useMemo, useState } from 'react'
import { auth } from '../firebase/config'
import { getProductSeedById, isProductId, type ProductId } from '../data/products'
import { formatPrice } from '../lib/home'
import { CHECKOUT_CART_KEY } from '../hooks/useCart'

type StoredCartLine = { productId: ProductId; quantity: number }

function readCart(): StoredCartLine[] {
  try {
    const raw = window.localStorage.getItem(CHECKOUT_CART_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((item): item is StoredCartLine =>
      Boolean(item && typeof item === 'object' && isProductId(item.productId) &&
        Number.isInteger(item.quantity) && item.quantity > 0 && item.quantity <= 20),
    )
  } catch {
    return []
  }
}

export default function Checkout() {
  const [cart, setCart] = useState<StoredCartLine[]>(readCart)
  const [name, setName] = useState(auth.currentUser?.displayName ?? '')
  const [email, setEmail] = useState(auth.currentUser?.email ?? '')
  const [orderId, setOrderId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const lines = useMemo(() => cart.map(({ productId, quantity }) => {
    const product = getProductSeedById(productId)
    return { product, quantity, subtotal: product.price * quantity }
  }), [cart])
  const total = lines.reduce((sum, line) => sum + line.subtotal, 0)

  const updateQuantity = (productId: ProductId, delta: number) => {
    setCart((current) => {
      const next = current.map((line) => line.productId === productId
        ? { ...line, quantity: line.quantity + delta }
        : line).filter((line) => line.quantity > 0 && line.quantity <= 20)
      window.localStorage.setItem(CHECKOUT_CART_KEY, JSON.stringify(next))
      return next
    })
  }

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    if (!lines.length) {
      setError('El carrito está vacío. Volvé a la tienda y agregá productos.')
      return
    }
    if (name.trim().length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Revisá el nombre y el correo electrónico.')
      return
    }

    const id = `AS-${Date.now().toString(36).toUpperCase()}`
    const order = {
      id,
      customer: { name: name.trim(), email: email.trim() },
      userId: auth.currentUser?.uid ?? null,
      status: 'pending' as const,
      currency: 'USD' as const,
      items: lines.map(({ product, quantity, subtotal }) => ({
        productId: product.id, name: product.name, unitPrice: product.price, quantity, lineTotal: subtotal,
      })),
      total,
      createdAt: new Date().toISOString(),
      persistence: 'local-demo',
    }
    try {
      const key = 'art-syntex:demo-orders:v1'
      const previous = JSON.parse(window.localStorage.getItem(key) ?? '[]')
      const orders = Array.isArray(previous) ? previous : []
      window.localStorage.setItem(key, JSON.stringify([...orders, order]))
      window.localStorage.removeItem(CHECKOUT_CART_KEY)
      setCart([])
      setOrderId(id)
    } catch {
      setError('No se pudo guardar la orden en este navegador. Revisá el espacio disponible e intentá otra vez.')
    }
  }

  if (orderId) {
    return (
      <section className="mx-auto max-w-3xl rounded-3xl border border-emerald-300/30 bg-black/60 p-8 text-center shadow-2xl">
        <p className="text-sm uppercase tracking-[0.3em] text-emerald-300">Solicitud registrada · Demo</p>
        <h1 className="mt-4 text-3xl font-semibold text-white">Orden pendiente creada</h1>
        <p className="mt-3 text-purple-100">Número de referencia: <strong>{orderId}</strong></p>
        <p className="mt-4 text-sm leading-6 text-purple-200">Esta orden se guardó únicamente en el almacenamiento local de este navegador. No se envió a un servidor, no se realizó ningún cobro y no se envió ningún correo.</p>
        <a href="/productos" className="mt-7 inline-flex rounded-xl bg-purple-700 px-5 py-3 font-semibold text-white hover:bg-purple-600">Volver a la tienda</a>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-5xl space-y-6 pb-16">
      <header>
        <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">Art-Syntex · Checkout</p>
        <h1 className="mt-2 text-3xl font-semibold text-purple-50 md:text-4xl">Confirmá tu pedido</h1>
        <p className="mt-2 text-sm text-purple-200">Podés continuar como invitado. No hace falta crear una cuenta.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <form onSubmit={submit} className="space-y-5 rounded-3xl border border-purple-300/30 bg-black/50 p-6">
          <h2 className="text-xl font-semibold text-purple-50">Datos del comprador</h2>
          <label className="block space-y-2 text-sm text-purple-200">Nombre completo
            <input required minLength={2} maxLength={120} autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} className="w-full rounded-xl border border-purple-300/40 bg-purple-950/50 px-4 py-3 text-white outline-none focus:border-cyan-300" />
          </label>
          <label className="block space-y-2 text-sm text-purple-200">Correo electrónico
            <input required type="email" maxLength={254} autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-xl border border-purple-300/40 bg-purple-950/50 px-4 py-3 text-white outline-none focus:border-cyan-300" />
          </label>
          {auth.currentUser ? <p className="text-xs text-cyan-200">Sesión iniciada como {auth.currentUser.email}. La compra no requiere cerrar sesión.</p> : <p className="text-xs text-purple-300">Estás comprando como invitado.</p>}
          <div className="rounded-xl border border-amber-300/30 bg-amber-950/20 p-4 text-xs leading-5 text-amber-100">
            Modo demostración: la orden queda guardada en este navegador. No se procesa un pago ni se registra en una base de datos remota.
          </div>
          {error ? <p role="alert" className="text-sm text-red-300">{error}</p> : null}
          <button type="submit" disabled={!cart.length} className="w-full rounded-xl bg-purple-700 px-5 py-3 font-semibold text-white transition hover:bg-purple-600 disabled:cursor-not-allowed disabled:opacity-40">Crear orden pendiente · {formatPrice(total)}</button>
        </form>

        <aside className="h-fit rounded-3xl border border-purple-300/30 bg-black/50 p-6">
          <h2 className="text-xl font-semibold text-purple-50">Resumen del carrito</h2>
          {lines.length ? <div className="mt-5 space-y-4">{lines.map(({ product, quantity, subtotal }) => (
            <article key={product.id} className="border-b border-purple-300/20 pb-4">
              <div className="flex gap-3">
                <img src={product.image} alt="" className="h-16 w-16 rounded-xl object-cover" />
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium text-purple-50">{product.name}</h3>
                  <p className="mt-1 text-sm text-purple-300">{formatPrice(product.price)} c/u</p>
                  <div className="mt-2 flex items-center gap-3 text-sm">
                    <button type="button" onClick={() => updateQuantity(product.id, -1)} className="rounded border border-purple-300/40 px-2 text-white" aria-label={`Quitar una unidad de ${product.name}`}>−</button>
                    <span className="text-white">{quantity}</span>
                    <button type="button" onClick={() => updateQuantity(product.id, 1)} disabled={quantity >= 20} className="rounded border border-purple-300/40 px-2 text-white disabled:opacity-40" aria-label={`Agregar una unidad de ${product.name}`}>+</button>
                    <span className="ml-auto font-semibold text-purple-100">{formatPrice(subtotal)}</span>
                  </div>
                </div>
              </div>
            </article>
          ))}</div> : <p className="mt-5 text-sm text-purple-300">No hay productos en el carrito. <a href="/productos" className="text-cyan-300 underline">Volver a la tienda</a>.</p>}
          <div className="mt-5 flex justify-between text-lg font-semibold text-white"><span>Total</span><span>{formatPrice(total)}</span></div>
          <a href="/productos" className="mt-5 inline-block text-sm text-cyan-300 underline underline-offset-4">Seguir comprando</a>
        </aside>
      </div>
    </section>
  )
}
