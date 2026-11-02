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
  if (typeof window === 'undefined') return fallback
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

  useEffect(() => setIsMenuOpen(false), [location.pathname])

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
      if (!navRef.current?.contains(event.target as Node)) setIsMenuOpen(false)
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
    <div className="app-shell flex min-h-screen flex-col px-4 pb-6 pt-0 text-purple-100 sm:px-6 md:px-8 xl:px-10">
      <div className="mx-auto flex min-h-8 w-full max-w-6xl items-center justify-center gap-3 border-b border-purple-400/20 px-2 text-center text-[9px] font-semibold uppercase tracking-[0.2em] text-cyan-100/80 sm:justify-between sm:text-[10px]">
        <span className="hidden shrink-0 text-cyber-gold sm:inline">A/S NEXUS · NIGHT CITY</span>
        <p className="min-w-0 truncate" aria-label={t('tickerLabel')}>{t('tickerMessage')}</p>
        <span className="hidden shrink-0 text-purple-300/70 md:inline">NETWORK // 2077</span>
      </div>

      <header className="sticky top-2 z-40 mx-auto mb-7 mt-3 w-full max-w-6xl rounded-2xl border border-purple-400/40 bg-black/75 px-4 py-3 shadow-[0_0_35px_rgba(168,85,247,0.12)] backdrop-blur-xl md:px-5">
        <div className="flex items-center justify-between gap-3">
          <Link
            to="/"
            className="flex min-w-0 items-center gap-2 rounded-xl px-1 py-1 transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
            aria-label={t('ariaHome')}
          >
            <img src="/logo.svg" alt="" className="h-9 w-9 shrink-0 object-contain sm:h-10 sm:w-10" />
            <span className="min-w-0 leading-tight">
              <span className="block font-android text-sm font-bold tracking-[0.16em] text-purple-100 sm:text-base">A/S NEXUS</span>
              <span className="hidden text-[9px] uppercase tracking-[0.2em] text-cyan-200/70 sm:block">Cybernetic systems</span>
            </span>
          </Link>

          <nav ref={navRef} className="relative flex items-center gap-2" aria-label={t('ariaNav')}>
            <ul className="hidden items-center gap-1 lg:flex">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.to
                return (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      className={[
                        'inline-flex min-h-10 items-center gap-2 rounded-xl px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300',
                        isActive ? 'bg-purple-700/70 text-white shadow-[0_0_20px_rgba(168,85,247,0.2)]' : 'text-purple-100/80 hover:bg-purple-900/60 hover:text-white',
                      ].join(' ')}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <span aria-hidden="true" className="text-cyber-gold">{item.icon}</span>
                      {t(item.labelKey)}
                    </Link>
                  </li>
                )
              })}
            </ul>

            <div className="hidden items-center gap-2 sm:flex" aria-label={t('ariaPrefs')}>
              <div className="flex rounded-xl border border-purple-400/30 bg-black/40 p-1" role="group" aria-label={t('ariaLang')}>
                {languageOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={['min-h-8 min-w-9 rounded-lg px-2 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300', language === option.value ? 'bg-cyan-300 text-slate-950' : 'text-purple-100 hover:bg-purple-800/70'].join(' ')}
                    aria-pressed={language === option.value}
                    aria-label={t(option.ariaLabelKey)}
                    onClick={() => setLanguage(option.value)}
                  >
                    {option.flag}
                  </button>
                ))}
              </div>
              <div className="flex rounded-xl border border-purple-400/30 bg-black/40 p-1" role="group" aria-label={t('ariaTheme')}>
                {themeOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={['min-h-8 rounded-lg px-2 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300', theme === option.value ? 'bg-[#f5c542] text-slate-950' : 'text-purple-100 hover:bg-purple-800/70'].join(' ')}
                    aria-pressed={theme === option.value}
                    aria-label={t(option.ariaLabelKey)}
                    onClick={() => setTheme(option.value)}
                  >
                    {option.icon}
                  </button>
                ))}
              </div>
            </div>

            <button
              ref={menuButtonRef}
              type="button"
              className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-purple-300/50 bg-purple-900/60 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-purple-50 transition hover:border-cyan-300/80 hover:bg-purple-800/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 lg:hidden"
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
                'absolute right-0 top-full mt-3 w-[min(22rem,calc(100vw-2rem))] origin-top-right overflow-hidden rounded-2xl border border-purple-400/60 bg-black/95 p-3 shadow-[0_24px_70px_rgba(15,23,42,0.55),0_0_40px_rgba(147,51,234,0.22)] backdrop-blur-xl transition-all duration-200 lg:hidden',
                isMenuOpen ? 'pointer-events-auto translate-y-0 scale-100 opacity-100' : 'pointer-events-none -translate-y-2 scale-95 opacity-0',
              ].join(' ')}
              aria-hidden={!isMenuOpen}
            >
              <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-cyan-200">{t('menuPanelTitle')}</p>
              <ul className="grid gap-1">
                {menuItems.map((item) => {
                  const isActive = location.pathname === item.to
                  return (
                    <li key={item.to}>
                      <Link
                        to={item.to}
                        className={['flex min-h-11 items-center justify-between rounded-xl px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300', isActive ? 'bg-purple-700/75 text-white' : 'text-purple-100 hover:bg-purple-800/70 hover:text-white'].join(' ')}
                        aria-current={isActive ? 'page' : undefined}
                        tabIndex={isMenuOpen ? 0 : -1}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <span>{t(item.labelKey)}</span>
                        <span aria-hidden="true" className="text-cyber-gold">{item.icon}</span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
              <div className="mt-3 grid grid-cols-2 gap-3 border-t border-purple-400/30 pt-3">
                <div>
                  <p className="mb-2 text-[9px] uppercase tracking-[0.18em] text-cyan-200">{t('ariaLang')}</p>
                  <div className="flex gap-1" role="group" aria-label={t('ariaLang')}>
                    {languageOptions.map((option) => (
                      <button key={option.value} type="button" className={['min-h-9 flex-1 rounded-lg text-sm', language === option.value ? 'bg-cyan-300 text-slate-950' : 'bg-purple-950 text-purple-100'].join(' ')} aria-pressed={language === option.value} aria-label={t(option.ariaLabelKey)} onClick={() => setLanguage(option.value)}>{option.flag}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-[9px] uppercase tracking-[0.18em] text-cyan-200">{t('ariaTheme')}</p>
                  <div className="flex gap-1" role="group" aria-label={t('ariaTheme')}>
                    {themeOptions.map((option) => (
                      <button key={option.value} type="button" className={['min-h-9 flex-1 rounded-lg text-xs', theme === option.value ? 'bg-[#f5c542] text-slate-950' : 'bg-purple-950 text-purple-100'].join(' ')} aria-pressed={theme === option.value} aria-label={t(option.ariaLabelKey)} onClick={() => setTheme(option.value)}>{option.icon}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </nav>
        </div>
      </header>

      <I18nProvider language={language}>
        <main className="flex-1">{children}</main>
        <footer className="mx-auto mt-10 w-full max-w-6xl overflow-hidden rounded-2xl border border-purple-400/30 bg-black/65 shadow-[0_0_35px_rgba(168,85,247,0.1)] backdrop-blur-xl">
          <div className="grid gap-8 px-5 py-7 sm:grid-cols-2 md:px-8 lg:grid-cols-[1.2fr_0.8fr_1fr] lg:gap-10 lg:py-9">
            <div role="group" aria-labelledby="footerBrandTitle">
              <Link to="/" className="inline-flex items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300">
                <img src="/logo.svg" alt="" className="h-11 w-11 object-contain" />
                <span id="footerBrandTitle" className="font-android text-base font-bold tracking-[0.16em] text-purple-100">A/S NEXUS</span>
              </Link>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-purple-200/75">{t('footerDescription')}</p>
              <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-200/70">Night City · Est. 2077</p>
            </div>

            <nav aria-label={t('footerExplore')}>
              <h2 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-cyan-200">{t('footerExplore')}</h2>
              <ul className="grid gap-3 text-sm text-purple-100/80">
                {menuItems.map((item) => (
                  <li key={item.to}>
                    <Link to={item.to} className="inline-flex items-center gap-2 transition hover:text-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300" aria-current={location.pathname === item.to ? 'page' : undefined}>
                      <span aria-hidden="true" className="text-cyber-gold">{item.icon}</span>{t(item.labelKey)}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div role="group" aria-labelledby="footerSupportTitle">
              <h2 id="footerSupportTitle" className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-cyan-200">{t('footerSupport')}</h2>
              <p className="text-sm leading-relaxed text-purple-200/75">{t('footerSupportCopy')}</p>
              <Link to="/contacto" className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-xl border border-cyan-300/50 bg-cyan-300/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-cyan-100 transition hover:border-cyan-200 hover:bg-cyan-300/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300">
                {t('footerContactAction')} <span aria-hidden="true">↗</span>
              </Link>
              <p className="mt-4 text-[10px] uppercase tracking-[0.12em] text-purple-300/60">{t('footerAccessNote')}</p>
            </div>
          </div>
          <div className="border-t border-purple-400/20 px-5 py-4 text-center md:px-8">
            <p className="text-[10px] leading-relaxed text-purple-300/65">{t('footerNotice')}</p>
            <p className="mt-2 text-[10px] tracking-wide text-purple-200/70"><span className="text-cyber-gold">©</span> {new Date().getFullYear()} A/S Nexus · {t('rights')}</p>
          </div>
        </footer>
      </I18nProvider>
    </div>
  )
}
