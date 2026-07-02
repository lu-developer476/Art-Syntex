import { useEffect, useState } from 'react'
import type { Product } from '../../data/products'
import { formatPrice } from '../../lib/home'
import { useI18n } from '../../i18n'

interface ProductsSectionProps {
  cartCount: number
  cartTotal: number
  error: string | null
  loading: boolean
  onAddToCart: (product: Product) => void
  onOpenCart: () => void
  onSelectProduct: (product: Product | null) => void
  products: Product[]
  selectedProduct: Product | null
}

export default function ProductsSection({
  cartCount,
  cartTotal,
  error,
  loading,
  onAddToCart,
  onOpenCart,
  onSelectProduct,
  products,
  selectedProduct,
}: ProductsSectionProps) {
  const { t } = useI18n()
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null)

  useEffect(() => {
    if (!previewProduct) {
      return
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setPreviewProduct(null)
      }
    }

    window.addEventListener('keydown', handleEscape)

    return () => window.removeEventListener('keydown', handleEscape)
  }, [previewProduct])

  const handleAddToCart = (product: Product) => {
    onAddToCart(product)
    onOpenCart()
  }

  return (
    <>
      <section className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold text-purple-100">{t('productsTitle')}</h2>
            <p className="mt-1 text-sm text-purple-200">
              {t('productsSubtitle')}
            </p>
          </div>
          <button
            type="button"
            className="rounded-full border border-purple-300/60 bg-purple-900/40 px-4 py-2 text-sm font-medium text-purple-100 transition hover:border-purple-200 hover:bg-purple-800/50"
            onClick={onOpenCart}
          >
            {t('cart')} · {cartCount} {cartCount === 1 ? t('item') : t('items')} · {formatPrice(cartTotal)}
          </button>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-400/60 bg-red-950/60 p-4 text-sm text-red-200">{error}</div>
        ) : null}

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
                <button
                  type="button"
                  onClick={() => setPreviewProduct(product)}
                  className="relative block w-full overflow-hidden"
                  aria-label={`${t('openImage')} ${product.name}`}
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-48 w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent px-4 py-3 text-left text-xs uppercase tracking-[0.3em] text-purple-100 opacity-0 transition group-hover:opacity-100">
                    {t('clickZoom')}
                  </span>
                </button>
                <div className="space-y-3 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-android text-xl font-semibold text-purple-50">{product.name}</h3>
                    <span className="rounded-full bg-purple-900/60 px-3 py-1 text-xs uppercase tracking-widest text-purple-200">
                      {product.category}
                    </span>
                  </div>
                  <p className="text-lg font-bold text-purple-200">{formatPrice(product.price)}</p>
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      className="rounded-lg border border-purple-300 px-3 py-2 text-sm text-purple-100 transition hover:bg-purple-800/40"
                      onClick={() => onSelectProduct(selectedProduct?.id === product.id ? null : product)}
                    >
                      {selectedProduct?.id === product.id ? t('hideDetails') : t('viewDetails')}
                    </button>
                    <button
                      type="button"
                      className="rounded-lg bg-purple-700 px-3 py-2 text-sm text-white transition hover:bg-purple-800"
                      onClick={() => handleAddToCart(product)}
                    >
                      {t('addToCart')} · {t('total')}: {formatPrice(cartTotal + product.price)}
                    </button>
                  </div>
                  {selectedProduct?.id === product.id ? (
                    <div className="rounded-2xl border border-purple-300/40 bg-purple-950/40 p-4">
                      <p className="font-android text-sm leading-6 text-purple-200">{product.description}</p>
                      <p className="mt-3 text-sm font-semibold uppercase tracking-[0.2em] text-purple-300/80">
                        {t('category')}: {product.category}
                      </p>
                    </div>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {previewProduct ? (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 px-4 py-8 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={`${t('expandedView')} ${previewProduct.name}`}
          onClick={() => setPreviewProduct(null)}
        >
          <div
            className="relative w-full max-w-5xl rounded-3xl border border-purple-300/40 bg-[#11071c] p-4 shadow-2xl shadow-black/60"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreviewProduct(null)}
              className="absolute right-4 top-4 z-10 rounded-full border border-purple-300/40 bg-black/40 px-3 py-2 text-sm text-purple-100 transition hover:bg-purple-900/60"
            >
              {t('close')}
            </button>
            <img
              src={previewProduct.image}
              alt={previewProduct.name}
              className="max-h-[75vh] w-full rounded-2xl object-contain"
            />
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 px-2 pb-2">
              <div>
                <h3 className="font-android text-2xl text-purple-50">{previewProduct.name}</h3>
                <p className="mt-1 text-sm uppercase tracking-[0.25em] text-purple-300/80">
                  {previewProduct.category}
                </p>
              </div>
              <p className="text-lg font-semibold text-purple-100">{formatPrice(previewProduct.price)}</p>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
