import Link from 'next/link'

const highlights = [
  {
    title: 'Événements & visites',
    description: "Portes ouvertes en usine, conférences et rencontres avec des professionnels de l'industrie.",
  },
  {
    title: 'Formations',
    description: 'Ateliers pratiques sur le Lean 4.0, les ERP, les jumeaux numériques et la data science.',
  },
  {
    title: 'Projets',
    description: 'Des projets étudiants encadrés par pôle, du brief au livrable, en équipe.',
  },
]

export default function Home() {
  return (
    <div className="industrial-shell min-h-screen bg-bg text-text">
      <div className="pointer-events-none fixed inset-0 industrial-grid" />
      <div className="pointer-events-none fixed inset-x-0 top-0 h-40 scanline-overlay opacity-30" />

      <header className="relative border-b border-card/80 bg-bg/75 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 sm:py-5">
          <span className="font-display text-lg font-bold tracking-[0.08em] text-gold-gradient sm:text-xl">
            CGI ENIT
          </span>
          <Link
            href="/login"
            className="rounded-sm border border-accent/35 bg-card/70 px-4 py-2 font-mono text-xs uppercase tracking-wider text-text transition-all duration-200 hover:-translate-y-0.5 hover:border-accent hover:text-accent"
          >
            Espace membre
          </Link>
        </div>
      </header>

      <main className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <section className="grid gap-10 py-14 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12 lg:py-24">
          <div>
            <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-steel sm:mb-5">
              Club Génie Industriel · ENIT
            </p>
            <h1 className="max-w-2xl font-display text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
              Là où l&apos;ingénierie industrielle prend vie, en dehors des amphis.
            </h1>
            <p className="mt-5 max-w-xl text-base text-muted sm:text-lg">
              Le club rassemble les étudiants du département Génie Industriel autour de projets,
              de formations et de visites en entreprise.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/login"
                className="rounded-sm bg-gradient-gold px-5 py-2.5 text-sm font-semibold text-bg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-gold-glow"
              >
                Accéder à l&apos;espace membre
              </Link>
              <span className="rounded-sm border border-steel/30 bg-steel/10 px-4 py-2.5 font-mono text-xs uppercase tracking-[0.15em] text-steel">
                Lean · Data · Terrain
              </span>
            </div>
          </div>

          <div className="panel-surface panel-interactive relative overflow-hidden rounded-xl p-6 sm:p-7">
            <div className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-accent/20 blur-3xl animate-float-gentle" />
            <div className="pointer-events-none absolute -bottom-14 -left-10 h-36 w-36 rounded-full bg-blue-700/20 blur-3xl animate-float-gentle [animation-delay:1.2s]" />
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent-light">
              Vision industrielle
            </p>
            <h2 className="mt-3 font-display text-2xl font-semibold text-text">
              Former, construire, piloter.
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Notre communauté transforme les idées en systèmes efficaces via des missions terrain,
              des outils numériques et une culture d&apos;amélioration continue.
            </p>
            <div className="mt-6 grid grid-cols-3 gap-3">
              {[
                ['6+', 'Pôles actifs'],
                ['20+', 'Actions/an'],
                ['100%', 'Orientation impact'],
              ].map(([value, label]) => (
                <div key={label} className="rounded-md border border-accent/15 bg-bg/50 px-3 py-3 text-center">
                  <p className="font-display text-lg font-bold text-accent-light">{value}</p>
                  <p className="mt-1 text-[10px] font-mono uppercase tracking-wider text-muted">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="pb-16 sm:pb-24">
          <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
            Axes d&apos;action
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {highlights.map((item) => (
              <div
                key={item.title}
                className="panel-surface panel-interactive rounded-lg p-5"
              >
                <h2 className="font-display text-lg font-semibold text-text">
                  {item.title}
                </h2>
                <p className="mt-2 text-sm text-muted leading-relaxed">
                  {item.description}
                </p>
                <div className="mt-4 h-px w-full bg-gradient-to-r from-accent/40 via-steel/30 to-transparent" />
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="relative border-t border-card/80 bg-bg/85 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-4 py-5 font-mono text-xs text-muted sm:px-6">
          CGI ENIT — École Nationale d&apos;Ingénieurs de Tunis
        </div>
      </footer>
    </div>
  )
}
