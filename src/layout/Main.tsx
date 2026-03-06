import { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'

interface MainLayoutProps {
  children: ReactNode
}

const menuItems = [
  { to: '/', label: 'Inicio' },
  { to: '/acceso', label: 'Acceso' },
  { to: '/productos', label: 'Productos' },
  { to: '/contacto', label: 'Contacto' },
]

export default function MainLayout({ children }: MainLayoutProps) {
  const location = useLocation()

  return (
    <div className="flex min-h-screen flex-col px-4 py-8 text-purple-100 md:px-10">
      <header className="mx-auto mb-6 flex w-full max-w-6xl items-center justify-between rounded-2xl border border-purple-400/40 bg-black/45 px-4 py-3 backdrop-blur">
        <Link to="/" className="text-lg font-bold text-purple-200">
          A/S Nexus
        </Link>

        <details className="group relative">
          <summary className="cursor-pointer list-none rounded-lg border border-purple-300/60 bg-purple-900/60 px-4 py-2 text-sm font-semibold text-purple-100 hover:bg-purple-800/70">
            ➕
          </summary>
          <nav className="absolute right-0 z-20 mt-2 w-48 rounded-xl border border-purple-400/50 bg-black/90 p-2 shadow-xl">
            {menuItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`block rounded-md px-3 py-2 text-sm transition hover:bg-purple-700/60 ${
                  location.pathname === item.to ? 'bg-purple-700/70 text-white' : 'text-purple-100'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </details>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="mt-12 border-t border-purple-500/40 pt-6 text-center text-xs tracking-wide text-purple-200 md:text-sm">
        <span className="text-cyber-gold">©</span> {new Date().getFullYear()} Todos los derechos reservados • Built with React.js, Next.js, TypeScript & Tailwind CSS • UX/UI Interface • Database and Deploy by Firebase ®
      </footer>
    </div>
  )
}
