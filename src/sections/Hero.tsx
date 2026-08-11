import { useI18n } from '../i18n'
export default function HeroSection() {
  const { t } = useI18n()
  const [heroLead, heroStrength] = t('heroTitle').split('\n')

  return (
    <section className="relative overflow-hidden rounded-3xl border border-purple-400/30 bg-black/40 px-6 py-8 backdrop-blur md:px-8 md:py-10">
      <div className="space-y-5">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:gap-8">
          <div className="animate-float flex w-fit shrink-0 items-center justify-center rounded-3xl border border-purple-300/20 bg-white/5 p-4 shadow-[0_0_40px_rgba(168,85,247,0.18)]">
            <img
              src="/logo.svg"
              alt="A/S Nexus"
              className="h-20 w-20 md:h-28 md:w-28"
            />
          </div>

          <h1 className="max-w-4xl text-[clamp(1.65rem,6.5vw,3.35rem)] font-semibold uppercase leading-[1.08] tracking-[0.025em] text-purple-100 md:text-[clamp(2.35rem,4.5vw,4rem)]">
            <span className="block">{heroLead}</span>
          </h1>
        </div>

        <div className="space-y-4">
          <h2 className="mx-auto max-w-4xl text-center text-[clamp(1.45rem,5.8vw,3rem)] font-semibold uppercase leading-[1.08] tracking-[0.025em] text-purple-100 md:text-[clamp(2.05rem,4vw,3.45rem)]">
            {heroStrength}
          </h2>

          <p className="max-w-3xl text-lg italic text-purple-200/90">
            {t('heroQuote')}
          </p>

          <p className="max-w-4xl text-base text-purple-100/80 md:text-lg">
            {t('heroDescription')}
          </p>
        </div>
      </div>
    </section>
  )
}
