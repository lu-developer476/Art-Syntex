import type { FormEvent } from 'react'
import type { User } from 'firebase/auth'
import { useI18n } from '../../i18n'

interface AccessSectionProps {
  authEmail: string
  authMessage: string | null
  authPassword: string
  isAuthLoading: boolean
  isRegisterModalOpen: boolean
  onCloseRegisterModal: () => void
  onEmailChange: (value: string) => void
  onPasswordChange: (value: string) => void
  onSignIn: (event: FormEvent) => Promise<void>
  onSignOut: () => Promise<void>
  onSignUp: () => Promise<void>
  user: User | null
  verificationCenterUrl: string
}

export default function AccessSection({
  authEmail,
  authMessage,
  authPassword,
  isAuthLoading,
  isRegisterModalOpen,
  onCloseRegisterModal,
  onEmailChange,
  onPasswordChange,
  onSignIn,
  onSignOut,
  onSignUp,
  user,
  verificationCenterUrl,
}: AccessSectionProps) {
  const { t } = useI18n()
  return (
    <>
      <section className="grid gap-6 rounded-3xl border border-purple-400/50 bg-gradient-to-br from-purple-950/80 via-black/70 to-slate-900/70 p-6 md:grid-cols-2">
        <div>
          <h2 className="text-2xl font-semibold text-purple-100">{t('accessTitle')}</h2>
          <p className="mt-2 text-sm text-purple-200">
            {t('accessDescription')}
          </p>
          <div className="mt-4 rounded-2xl border border-cyan-400/30 bg-cyan-950/20 p-4 text-sm text-cyan-100">
            <p className="font-semibold uppercase tracking-[0.2em] text-cyan-300">{t('recommendedFlow')}</p>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-purple-100/90">
              <li>{t('accessStep1')}</li>
              <li>{t('accessStep2')}</li>
              <li>{t('accessStep3')}</li>
            </ol>
          </div>
          {user ? (
            <div className="mt-4 space-y-3 rounded-xl bg-purple-900/40 p-4">
              <p className="text-sm text-purple-100">{t('activeSession')}: {user.email}</p>
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">
                {t('status')}: {user.emailVerified ? t('emailVerified') : t('emailPending')}
              </p>
              <button
                onClick={() => void onSignOut()}
                className="rounded-lg border border-purple-300 px-3 py-2 text-sm text-purple-100 hover:bg-purple-800/50"
              >
                {t('signOut')}
              </button>
            </div>
          ) : null}
          {authMessage ? <p className="mt-3 text-sm text-purple-200">{authMessage}</p> : null}
        </div>

        <form className="space-y-3" onSubmit={(event) => void onSignIn(event)}>
          <label className="block text-sm text-purple-100">
            {t('email')}
            <input
              type="email"
              value={authEmail}
              onChange={(event) => onEmailChange(event.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-purple-400 bg-black/30 px-3 py-2 text-purple-50"
            />
          </label>
          <label className="block text-sm text-purple-100">
            {t('password')}
            <input
              type="password"
              value={authPassword}
              onChange={(event) => onPasswordChange(event.target.value)}
              required
              minLength={6}
              className="mt-1 w-full rounded-lg border border-purple-400 bg-black/30 px-3 py-2 text-purple-50"
            />
          </label>
          <div className="rounded-2xl border border-purple-400/40 bg-black/20 p-4 text-xs leading-6 text-purple-200">
            {t('authNote')}
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={isAuthLoading}
              className="rounded-lg bg-purple-700 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isAuthLoading ? t('processing') : t('signIn')}
            </button>
            <button
              type="button"
              disabled={isAuthLoading}
              onClick={() => void onSignUp()}
              className="rounded-lg border border-purple-400 px-4 py-2 text-sm text-purple-100 hover:bg-purple-900/40 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {t('signUp')}
            </button>
            <a
              href={verificationCenterUrl}
              className="rounded-lg border border-cyan-400/60 px-4 py-2 text-sm text-cyan-100 transition hover:bg-cyan-900/30"
            >
              {t('network')}
            </a>
          </div>
        </form>
      </section>

      {isRegisterModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-cyan-400/50 bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 p-6 shadow-[0_0_45px_rgba(34,211,238,0.18)]">
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">{t('accountCreated')}</p>
            <h3 className="mt-3 text-2xl font-semibold text-white">{t('verifyEmailTitle')}</h3>
            <p className="mt-3 text-sm leading-6 text-purple-100">
              {t('verifyEmailCopy')}
            </p>
            <div className="mt-5 rounded-2xl border border-purple-400/40 bg-black/30 p-4 text-sm text-purple-100">
              <p className="font-semibold text-cyan-300">{t('nextStep')}</p>
              <p className="mt-2 break-all">{verificationCenterUrl}</p>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={verificationCenterUrl}
                className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400"
              >
                {t('openNetwork')}
              </a>
              <button
                type="button"
                onClick={onCloseRegisterModal}
                className="rounded-lg border border-purple-300 px-4 py-2 text-sm text-purple-100 hover:bg-purple-900/40"
              >
                {t('understood')}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
