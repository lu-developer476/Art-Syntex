import { useI18n } from '../i18n'
export default function HeroSection() {
  const { t } = useI18n()
  const [heroLead, heroStrength] = t('heroTitle').split('\n')

  return (
    <section className="relative overflow-hidden rounded-3xl border border-purple-400/30 bg-black/40 px-8 py-12 backdrop-blur">
      <div className="space-y-6">
        <div className="animate-float flex w-fit items-center justify-center rounded-3xl border border-purple-300/20 bg-white/5 p-4 shadow-[0_0_40px_rgba(168,85,247,0.18)]">
          <img
            src="/logo.svg"
            alt="A/S Nexus"
            className="h-24 w-24 md:h-32 md:w-32"
          />
        </div>

        <div className="space-y-4">
          <h1 className="max-w-5xl text-[clamp(1.8rem,7.5vw,4.5rem)] font-semibold uppercase leading-[1.18] tracking-[0.025em] text-purple-100 md:text-[clamp(3rem,5.6vw,5rem)]">
            <span className="block">{heroLead}</span>
            <span className="mt-7 block md:mt-10">{heroStrength}</span>
          </h1>

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
