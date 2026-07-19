import { ReactNode, useEffect, useId, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { I18nProvider, translate, type Language, type TranslationKey } from '../i18n'

interface MainLayoutProps {
  children: ReactNode
}

type Theme = 'dark' | 'light'

const menuItems = [
  { to: '/', labelKey: 'navHome', icon: '⌂' },
  { to: '/acceso', labelKey: 'navAccess', icon: '⎋' },
  { to: '/productos', labelKey: 'navProducts', icon: '⬡' },
  { to: '/contacto', labelKey: 'navContact', icon: '✉' },
] as const

const languageOptions: Array<{ value: Language; flag: string; ariaLabelKey: 'ariaSpanish' | 'ariaEnglish' }> = [
  { value: 'es', flag: '🇪🇸', ariaLabelKey: 'ariaSpanish' },
  { value: 'en', flag: '🇺🇸', ariaLabelKey: 'ariaEnglish' },
]

const themeOptions: Array<{ value: Theme; labelKey: 'themeDark' | 'themeLight'; icon: string; ariaLabelKey: 'ariaDark' | 'ariaLight' }> = [
  { value: 'dark', labelKey: 'themeDark', icon: '🌑', ariaLabelKey: 'ariaDark' },
  { value: 'light', labelKey: 'themeLight', icon: '☀️', ariaLabelKey: 'ariaLight' },
]

const getStoredPreference = <T extends string>(key: string, fallback: T, allowedValues: readonly T[]) => {
  if (typeof window === 'undefined') {
    return fallback
  }

  const storedValue = window.localStorage.getItem(key)
  return allowedValues.includes(storedValue as T) ? (storedValue as T) : fallback
}

export default function MainLayout({ children }: MainLayoutProps) {
  const location = useLocation()
  const menuId = useId()
  const navRef = useRef<HTMLElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [language, setLanguage] = useState<Language>(() =>
    getStoredPreference('as-nexus-language', 'es', ['es', 'en'] as const),
  )
  const [theme, setTheme] = useState<Theme>(() =>
    getStoredPreference('as-nexus-theme', 'dark', ['dark', 'light'] as const),
  )
  const t = (key: TranslationKey) => translate(language, key)

  useEffect(() => {
    setIsMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    document.documentElement.lang = language
    document.documentElement.dataset.language = language
    window.localStorage.setItem('as-nexus-language', language)
  }, [language])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    window.localStorage.setItem('as-nexus-theme', theme)
  }, [theme])

  useEffect(() => {
    function handlePointerDown(event: MouseEvent | TouchEvent) {
      if (!navRef.current?.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsMenuOpen(false)
        menuButtonRef.current?.focus()
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('touchstart', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('touchstart', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  return (
    <div className="app-shell flex min-h-screen flex-col px-4 py-6 text-purple-100 sm:px-6 md:px-8 md:py-8 xl:px-10">
      <header className="sticky top-3 z-40 mx-auto mb-6 w-full max-w-6xl rounded-3xl border border-purple-400/40 bg-black/65 px-4 py-4 shadow-[0_0_35px_rgba(168,85,247,0.12)] backdrop-blur md:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <Link
            to="/"
            className="rounded-xl px-1 py-1 text-lg font-bold tracking-[0.18em] text-purple-100 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:text-xl"
            aria-label={t('ariaHome')}
          >
            <span className="font-android text-cyber-gold">A/S</span>{' '}
            <span className="font-android text-purple-100">Nexus</span>
          </Link>

          <nav ref={navRef} className="relative" aria-label={t('ariaNav')}>
            <button
              ref={menuButtonRef}
              type="button"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-purple-300/60 bg-purple-900/70 px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-purple-50 shadow-[0_0_20px_rgba(91,33,182,0.2)] transition hover:border-cyan-300/80 hover:bg-purple-800/80 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              aria-expanded={isMenuOpen}
              aria-controls={menuId}
              aria-haspopup="true"
              aria-label={isMenuOpen ? t('ariaMenuClose') : t('ariaMenuOpen')}
              onClick={() => setIsMenuOpen((open) => !open)}
            >
              <span aria-hidden="true">{isMenuOpen ? '✕' : '☰'}</span>
              <span>{t('menuLabel')}</span>
            </button>

            <div
              id={menuId}
              className={[
                'absolute right-0 top-full mt-3 w-[min(22rem,calc(100vw-2rem))] origin-top-right overflow-hidden rounded-3xl border border-purple-400/60 bg-black/95 p-3 shadow-[0_24px_70px_rgba(15,23,42,0.55),0_0_40px_rgba(147,51,234,0.22)] backdrop-blur transition-all duration-200',
                isMenuOpen
                  ? 'pointer-events-auto translate-y-0 scale-100 opacity-100'
                  : 'pointer-events-none -translate-y-2 scale-95 opacity-0',
              ].join(' ')}
            >
              <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">{t('menuPanelTitle')}</p>
              <ul className="grid gap-1">
                {menuItems.map((item) => {
                  const isActive = location.pathname === item.to

                  return (
                    <li key={item.to}>
                      <Link
                        to={item.to}
                        className={[
                          'flex min-h-12 items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold uppercase tracking-[0.16em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-black',
                          isActive
                            ? 'bg-purple-700/75 text-white shadow-[0_0_24px_rgba(168,85,247,0.28)]'
                            : 'text-purple-100 hover:bg-purple-800/70 hover:text-white',
                        ].join(' ')}
                        aria-current={isActive ? 'page' : undefined}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <span>{t(item.labelKey)}</span>
                        <span aria-hidden="true" className="text-cyber-gold">{item.icon}</span>
                      </Link>
                    </li>
                  )
                })}
              </ul>

              <div className="mt-3 border-t border-purple-400/30 pt-3" aria-label={t('ariaPrefs')}>
                <div className="mb-3 flex rounded-2xl border border-purple-400/50 bg-black/50 p-1 shadow-[0_0_20px_rgba(147,51,234,0.12)]" role="group" aria-label={t('ariaLang')}>
                  {languageOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={[
                        'min-h-10 flex-1 rounded-xl px-3 py-2 text-sm font-bold tracking-[0.14em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-black',
                        language === option.value
                          ? 'bg-cyan-300 text-slate-950 shadow-[0_0_18px_rgba(103,232,249,0.35)]'
                          : 'text-purple-100 hover:bg-purple-800/70 hover:text-white',
                      ].join(' ')}
                      aria-pressed={language === option.value}
                      aria-label={t(option.ariaLabelKey)}
                      onClick={() => setLanguage(option.value)}
                    >
                      <span aria-hidden="true">{option.flag}</span>
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2" role="group" aria-label={t('ariaTheme')}>
                  {themeOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={[
                        'min-h-11 rounded-xl border border-purple-400/40 px-3 py-2 text-sm font-bold tracking-[0.08em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-black',
                        theme === option.value
                          ? 'bg-[#f5c542] text-slate-950 shadow-[0_0_18px_rgba(245,197,66,0.35)]'
                          : 'bg-black/40 text-purple-100 hover:bg-purple-800/70 hover:text-white',
                      ].join(' ')}
                      aria-pressed={theme === option.value}
                      aria-label={t(option.ariaLabelKey)}
                      onClick={() => setTheme(option.value)}
                    >
                      <span aria-hidden="true">{option.icon}</span> {t(option.labelKey)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </nav>
        </div>
      </header>

      <I18nProvider language={language}>
        <main className="flex-1">{children}</main>
      </I18nProvider>

      <footer className="mt-12 border-t border-purple-500/40 pt-6 text-center text-xs leading-relaxed tracking-wide text-purple-200 md:text-sm">
        <span className="text-cyber-gold">©</span> {new Date().getFullYear()} {t('rights')} • Built with React.js, Next.js, TypeScript & Tailwind CSS • UX/UI Interface • Database and Deploy by Firebase ®
      </footer>
    </div>
  )
}
