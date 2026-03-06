import { Link } from 'react-router-dom'

export default function HeroSection() {
  return (
    <section
      id="inicio"
      className="relative overflow-hidden rounded-3xl border border-purple-400/70 bg-gradient-to-br from-purple-900/70 via-black/70 to-slate-900/70 p-8 shadow-xl"
    >
      <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gradient-to-br from-purple-400/30 to-slate-300/20 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-gradient-to-tr from-slate-300/30 to-purple-400/20 blur-3xl" />

      <div className="relative">
        <img
          src="/logo.svg"
          alt="Logo de la red"
          className="h-24 w-24 animate-float drop-shadow-[0_8px_28px_rgba(124,58,237,0.55)] md:h-32 md:w-32"
        />

        <h1 className="mt-3 bg-gradient-to-r from-purple-200 via-purple-400 to-slate-300 bg-clip-text text-4xl font-black text-transparent md:text-6xl">
          Donde la carne sueña en binario y el metal responde con memoria propia
        </h1>

        <p className="mt-4 max-w-3xl text-base text-purple-100/90 md:text-lg">
          <em>"Forjamos ventajas humanas con nuestras conexiones"</em>
        </p>

        <p className="mt-4 max-w-3xl text-base text-purple-200 md:text-lg">
          Cada mejora calibrada para tu ritmo, tu riesgo y tu forma de atravesar la ciudad cuando todo vibra al límite.
        </p>

        <nav className="mt-7 flex flex-wrap gap-3" aria-label="Navegación interna">
          <Link
            to="/acceso"
            className="rounded-lg bg-gradient-to-r from-purple-700 to-slate-500 px-4 py-2 text-sm font-semibold text-white transition hover:scale-[1.03]"
          >
            Acceso
          </Link>
          <Link
            to="/productos"
            className="rounded-lg border border-purple-300 bg-white/10 px-4 py-2 text-sm font-semibold text-purple-100 transition hover:scale-[1.03] hover:bg-purple-700/30"
          >
            Productos
          </Link>
          <Link
            to="/contacto"
            className="rounded-lg border border-purple-300 bg-white/10 px-4 py-2 text-sm font-semibold text-purple-100 transition hover:scale-[1.03] hover:bg-purple-700/30"
          >
            Contacto
          </Link>
        </nav>
      </div>
    </section>
  )
}
