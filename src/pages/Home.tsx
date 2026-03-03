import { useEffect, useMemo, useState } from 'react'
import { getOrSeedProducts } from '../firebase/products'
import type { Product } from '../data/products'

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

  return (
    <div className="mx-auto max-w-6xl space-y-12">
      <section className="rounded-3xl border border-cyan-400/30 bg-gradient-to-br from-[#121227] to-[#090916] p-8 shadow-[0_0_80px_rgba(0,255,255,0.12)]">
        <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">Art-Synt</p>
        <h1 className="mt-3 text-4xl font-bold text-fuchsia-400 md:text-6xl">
          Cyberware Store lista para portfolio + deploy en Firebase
        </h1>
        <p className="mt-4 max-w-2xl text-base text-slate-300 md:text-lg">
          Catálogo dinámico conectado a Firestore con seed automático de tus 10 productos.
          Diseño cyberpunk, responsive y preparado para presentar como e-commerce conceptual.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <InfoCard label="Productos" value={products.length || 10} />
          <InfoCard label="Destacados" value={featuredCount || 3} />
          <InfoCard label="Estado" value={loading ? 'Sincronizando' : 'Online'} />
        </div>
      </section>

      {error && (
        <div className="rounded-2xl border border-red-400/40 bg-red-500/10 p-4 text-sm text-red-200">
          {error}
        </div>
      )}

      {loading ? (
        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-[360px] animate-pulse rounded-2xl border border-white/10 bg-white/5"
            />
          ))}
        </section>
      ) : (
        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <article
              key={product.id}
              className="group overflow-hidden rounded-2xl border border-fuchsia-500/20 bg-[#14142a] transition hover:-translate-y-1 hover:border-cyan-300/50"
            >
              <img
                src={product.image}
                alt={product.name}
                className="h-52 w-full object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="space-y-3 p-5">
                <div className="flex items-start justify-between gap-4">
                  <h2 className="text-xl font-semibold text-cyan-200">{product.name}</h2>
                  <span className="rounded-full bg-cyan-400/15 px-3 py-1 text-xs uppercase tracking-widest text-cyan-300">
                    {product.category}
                  </span>
                </div>
                <p className="text-sm text-slate-300">{product.description}</p>
                <div className="flex items-center justify-between">
                  <p className="text-lg font-bold text-fuchsia-300">{formatPrice(product.price)}</p>
                  <button className="rounded-lg border border-fuchsia-400/40 px-3 py-2 text-sm text-fuchsia-200 transition hover:bg-fuchsia-500/20">
                    Ver detalle
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  )
}

function InfoCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-bold text-cyan-200">{value}</p>
    </div>
  )
}
