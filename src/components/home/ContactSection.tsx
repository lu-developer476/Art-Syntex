import type { FormEvent } from 'react'
import { useI18n } from '../../i18n'

interface ContactSectionProps {
  contactDescription: string
  contactEmail: string
  contactMessage: string | null
  contactName: string
  isSubmitting: boolean
  newsletterConsent: boolean
  newsletterEmail: string
  newsletterMessage: string | null
  isNewsletterSubmitting: boolean
  onDescriptionChange: (value: string) => void
  onEmailChange: (value: string) => void
  onNameChange: (value: string) => void
  onSubmit: (event: FormEvent) => Promise<void>
  onNewsletterConsentChange: (value: boolean) => void
  onNewsletterEmailChange: (value: string) => void
  onNewsletterSubmit: (event: FormEvent) => Promise<void>
}

export default function ContactSection({
  contactDescription,
  contactEmail,
  contactMessage,
  contactName,
  isSubmitting,
  newsletterConsent,
  newsletterEmail,
  newsletterMessage,
  isNewsletterSubmitting,
  onDescriptionChange,
  onEmailChange,
  onNameChange,
  onSubmit,
  onNewsletterConsentChange,
  onNewsletterEmailChange,
  onNewsletterSubmit,
}: ContactSectionProps) {
  const { t } = useI18n()

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-purple-400/50 bg-gradient-to-br from-purple-950/80 via-black/70 to-slate-900/70 p-6">
        <h2 className="text-2xl font-semibold text-purple-100">{t('contactTitle')}</h2>
        <p className="mt-2 text-sm text-purple-200">
          {t('contactDescription')}
        </p>
        <div className="mt-4 rounded-2xl border border-cyan-400/30 bg-cyan-950/20 p-4 text-sm text-cyan-100">
          {t('contactNote')}
        </div>
        <form id="contact-form" className="mt-4 grid scroll-mt-32 gap-4 md:grid-cols-2" onSubmit={(event) => void onSubmit(event)}>
          <label className="text-sm text-purple-100">
            {t('nameAlias')}
            <input
              value={contactName}
              onChange={(event) => onNameChange(event.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-purple-400 bg-black/30 px-3 py-2 text-purple-50"
            />
          </label>
          <label className="text-sm text-purple-100">
            {t('contactEmail')}
            <input
              type="email"
              value={contactEmail}
              onChange={(event) => onEmailChange(event.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-purple-400 bg-black/30 px-3 py-2 text-purple-50"
            />
          </label>
          <label className="text-sm text-purple-100 md:col-span-2">
            {t('experience')}
            <textarea
              value={contactDescription}
              onChange={(event) => onDescriptionChange(event.target.value)}
              required
              minLength={20}
              rows={4}
              className="mt-1 w-full rounded-lg border border-purple-400 bg-black/30 px-3 py-2 text-purple-50"
            />
          </label>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-purple-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-purple-800 disabled:cursor-not-allowed disabled:opacity-60 md:w-fit"
          >
            {isSubmitting ? t('sending') : t('apply')}
          </button>
        </form>
        {contactMessage ? <p className="mt-3 text-sm text-purple-200" role="status">{contactMessage}</p> : null}
      </section>

      <div className="rounded-3xl border border-purple-400/40 bg-gradient-to-br from-black/70 via-purple-950/50 to-slate-900/60 p-6 shadow-[0_0_30px_rgba(91,33,182,0.12)]">
        <div className="grid gap-7 md:grid-cols-2 md:gap-8">
          <section aria-labelledby="newsletter-title">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-400/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-200">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" aria-hidden="true" />
              A/S Nexus // Transmisiones
            </div>
            <h3 id="newsletter-title" className="text-xl font-semibold text-purple-50">{t('newsletterTitle')}</h3>
            <p className="mt-2 text-sm leading-relaxed text-purple-200/90">{t('newsletterDescription')}</p>

            <form className="mt-4 space-y-3" onSubmit={(event) => void onNewsletterSubmit(event)}>
              <div className="flex flex-col gap-2 sm:flex-row">
                <label className="sr-only" htmlFor="newsletter-email">{t('newsletterEmailLabel')}</label>
                <input
                  id="newsletter-email"
                  type="email"
                  value={newsletterEmail}
                  onChange={(event) => onNewsletterEmailChange(event.target.value)}
                  autoComplete="email"
                  maxLength={160}
                  placeholder={t('newsletterEmailPlaceholder')}
                  required
                  className="min-w-0 flex-1 rounded-xl border border-purple-300/40 bg-black/40 px-4 py-3 text-sm text-purple-50 outline-none transition placeholder:text-purple-300/50 focus:border-cyan-300"
                />
                <button
                  type="submit"
                  disabled={isNewsletterSubmitting}
                  className="rounded-xl border border-cyan-300/60 bg-cyan-300 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isNewsletterSubmitting ? t('newsletterSubmitting') : t('newsletterSubmit')}
                </button>
              </div>
              <label className="flex cursor-pointer items-start gap-2 text-xs leading-relaxed text-purple-300">
                <input
                  type="checkbox"
                  checked={newsletterConsent}
                  onChange={(event) => onNewsletterConsentChange(event.target.checked)}
                  required
                  className="mt-0.5 accent-cyan-300"
                />
                <span>{t('newsletterConsent')}</span>
              </label>
            </form>
            {newsletterMessage ? (
              <p className="mt-3 text-sm text-cyan-100" role="status" aria-live="polite">{newsletterMessage}</p>
            ) : null}
          </section>

          <section className="flex flex-col justify-center border-t border-purple-400/25 pt-6 md:border-l md:border-t-0 md:pl-8 md:pt-0" aria-labelledby="support-title">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-purple-300/30 bg-purple-400/10 text-lg text-cyber-gold" aria-hidden="true">
              ✉
            </div>
            <h3 id="support-title" className="text-xl font-semibold text-purple-50">{t('supportTitle')}</h3>
            <p className="mt-2 text-sm leading-relaxed text-purple-200/90">{t('supportDescription')}</p>
            <a
              href="#contact-form"
              className="mt-5 inline-flex w-fit items-center gap-2 rounded-xl border border-purple-300/50 px-4 py-2.5 text-sm font-semibold text-purple-100 transition hover:border-cyan-300 hover:bg-purple-800/40 hover:text-white"
            >
              {t('supportAction')}
              <span aria-hidden="true">↗</span>
            </a>
          </section>
        </div>
      </div>
    </div>
  )
}
