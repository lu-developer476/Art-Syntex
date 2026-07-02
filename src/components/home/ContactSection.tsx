import type { FormEvent } from 'react'
import { useI18n } from '../../i18n'

interface ContactSectionProps {
  contactDescription: string
  contactEmail: string
  contactMessage: string | null
  contactName: string
  isSubmitting: boolean
  onDescriptionChange: (value: string) => void
  onEmailChange: (value: string) => void
  onNameChange: (value: string) => void
  onSubmit: (event: FormEvent) => Promise<void>
}

export default function ContactSection({
  contactDescription,
  contactEmail,
  contactMessage,
  contactName,
  isSubmitting,
  onDescriptionChange,
  onEmailChange,
  onNameChange,
  onSubmit,
}: ContactSectionProps) {
  const { t } = useI18n()
  return (
    <section className="rounded-3xl border border-purple-400/50 bg-gradient-to-br from-purple-950/80 via-black/70 to-slate-900/70 p-6">
      <h2 className="text-2xl font-semibold text-purple-100">{t('contactTitle')}</h2>
      <p className="mt-2 text-sm text-purple-200">
        {t('contactDescription')}
      </p>
      <div className="mt-4 rounded-2xl border border-cyan-400/30 bg-cyan-950/20 p-4 text-sm text-cyan-100">
        {t('contactNote')}
      </div>
      <form className="mt-4 grid gap-4 md:grid-cols-2" onSubmit={(event) => void onSubmit(event)}>
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
          className="rounded-lg bg-purple-700 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-800 disabled:cursor-not-allowed disabled:opacity-60 md:w-fit"
        >
          {isSubmitting ? t('sending') : t('apply')}
        </button>
      </form>
      {contactMessage ? <p className="mt-3 text-sm text-purple-200">{contactMessage}</p> : null}
    </section>
  )
}
