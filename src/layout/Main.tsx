import { ReactNode } from 'react'

interface MainLayoutProps {
  children: ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-white px-4 py-8 text-purple-900 md:px-10">
      <main className="flex-1">{children}</main>

      <footer className="mt-12 border-t border-purple-300 pt-6 text-center text-xs tracking-wide text-purple-700 md:text-sm">
        <span className="text-cyber-gold">©</span> {new Date().getFullYear()} Todos los derechos reservados • Built with React.js, Next.js, TypeScript & Tailwind CSS • UX/UI Interface • Database and Deploy by Firebase ®
      </footer>
    </div>
  )
}
