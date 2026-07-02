import HeroSection from '../sections/Hero'
import { useCart } from '../hooks/useCart'
import { useProducts } from '../hooks/useProducts'
import { useI18n } from '../i18n'

export default function Home() {
  const products = useProducts()
  const cart = useCart()
  const { t } = useI18n()

  return (
    <div className="mx-auto max-w-6xl space-y-12 pb-16">
      <HeroSection />

      <section className="grid gap-4 md:grid-cols-3">
        <InfoCard label={t('statProducts')} value={products.products.length || 10} />
        <InfoCard label={t('statCart')} value={cart.cart.length} />
        <InfoCard label={t('statStatus')} value={products.loading ? t('statSync') : t('statActive')} />
      </section>
    </div>
  )
}

function InfoCard({ label, value }: { label: string; value: number | string }) {
  return (
    <article className="rounded-2xl border border-purple-400/40 bg-black/50 p-5 backdrop-blur">
      <p className="text-sm uppercase tracking-[0.3em] text-purple-300">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-purple-50">{value}</p>
    </article>
  )
}
