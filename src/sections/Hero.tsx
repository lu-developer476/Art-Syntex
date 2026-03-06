export default function HeroSection() {
  return (
    <section
      id="inicio"
      className="relative overflow-hidden rounded-3xl border border-purple-300/70 bg-gradient-to-br from-purple-100 via-white to-slate-200 p-8 shadow-xl"
    >
      <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gradient-to-br from-purple-400/40 to-slate-300/40 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-gradient-to-tr from-slate-300/50 to-purple-400/30 blur-3xl" />

      <div className="relative">
        <img
          src="/logo.svg"
          alt="Logo de Art-Syntex"
          className="h-24 w-24 animate-float drop-shadow-[0_8px_22px_rgba(124,58,237,0.45)] md:h-32 md:w-32"
        />

        <p className="mt-5 text-sm uppercase tracking-[0.25em] text-purple-700">Art-Syntex</p>

        <h1 className="mt-3 bg-gradient-to-r from-purple-800 via-purple-600 to-slate-500 bg-clip-text text-4xl font-black text-transparent md:text-6xl">
          Mercado de implantes para operar en Night City
        </h1>

        <p className="mt-4 max-w-3xl text-base text-purple-900/80 md:text-lg">
          <span className="font-semibold">Nuestro lema:</span>{' '}
          <em>"No vendemos piezas: forjamos ventaja humana en cada conexión neural."</em>
        </p>

        <p className="mt-4 max-w-3xl text-base text-purple-700 md:text-lg">
          Art-Syntex abastece mercenarios, netrunners y equipos tácticos con cyberware de alto
          rendimiento, soporte técnico y cadena de suministros segura en el universo Cyberpunk.
        </p>

        <nav className="mt-7 flex flex-wrap gap-3" aria-label="Navegación interna">
          <a
            href="#acceso"
            className="rounded-lg bg-gradient-to-r from-purple-700 to-slate-500 px-4 py-2 text-sm font-semibold text-white transition hover:scale-[1.03]"
          >
            Acceso
          </a>
          <a
            href="#productos"
            className="rounded-lg border border-purple-400 bg-white/80 px-4 py-2 text-sm font-semibold text-purple-700 transition hover:scale-[1.03] hover:bg-purple-100"
          >
            Productos
          </a>
          <a
            href="#contacto"
            className="rounded-lg border border-purple-400 bg-white/80 px-4 py-2 text-sm font-semibold text-purple-700 transition hover:scale-[1.03] hover:bg-purple-100"
          >
            Contacto
          </a>
        </nav>
      </div>
    </section>
  )
}
