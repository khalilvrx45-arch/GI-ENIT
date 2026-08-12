'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle2, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [mode, setMode] = useState<'signin' | 'reset'>('signin')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resetSent, setResetSent] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError(
        authError.message === 'Invalid login credentials'
          ? 'Email ou mot de passe incorrect.'
          : authError.message
      )
      setLoading(false)
      return
    }

    router.push('/membre')
    router.refresh()
  }

  const handleResetRequest = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    setLoading(false)

    if (resetError) {
      setError("Impossible d'envoyer le lien. Vérifie ton adresse email.")
      return
    }

    setResetSent(true)
  }

  return (
    <div className="industrial-shell min-h-screen bg-bg px-4 py-10 sm:px-6 sm:py-16">
      <div className="pointer-events-none fixed inset-0 industrial-grid" />
      <div className="pointer-events-none fixed inset-x-0 top-0 h-36 scanline-overlay opacity-35" />

      <div className="relative mx-auto grid w-full max-w-5xl items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="hidden lg:block">
          <div className="panel-surface rounded-xl p-8">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-steel mb-3">
              CGI · ENIT
            </p>
            <h1 className="font-display text-4xl font-semibold leading-tight">
              Pilote ton parcours <span className="text-gold-gradient">industriel</span>.
            </h1>
            <p className="mt-4 text-muted max-w-md">
              Accède aux événements, formations, projets et ressources de ton club avec une
              interface pensée comme un cockpit d&apos;ingénierie.
            </p>
            <div className="mt-7 grid grid-cols-2 gap-3">
              {[
                ['Projets', 'Suivi par étapes'],
                ['Événements', 'Présence & stats'],
                ['Formations', 'Compétences terrain'],
                ['Rang', 'Progression continue'],
              ].map(([title, subtitle]) => (
                <div key={title} className="rounded-md border border-accent/20 bg-bg/50 p-3">
                  <p className="font-display text-sm font-semibold text-accent-light">{title}</p>
                  <p className="text-xs text-muted mt-0.5">{subtitle}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="relative w-full max-w-sm justify-self-center lg:max-w-none">
          <div className="mb-6 text-center lg:mb-8">
            <p className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-steel">
              CGI · ENIT
            </p>
            <h1 className="font-display text-2xl font-semibold text-text sm:text-3xl">
              {mode === 'signin' ? 'Espace membre' : 'Réinitialiser le mot de passe'}
            </h1>
            <p className="mt-1 text-sm text-muted">
              {mode === 'signin'
                ? 'Connecte-toi pour accéder à ton espace.'
                : 'Recevez un lien de réinitialisation par email.'}
            </p>
          </div>

          {mode === 'signin' ? (
            <form
              onSubmit={handleSubmit}
              className="panel-surface rounded-xl p-5 sm:p-6 flex flex-col gap-4 panel-interactive"
            >
              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="font-mono text-xs uppercase tracking-wider text-muted">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-sm border border-muted/35 bg-bg/80 px-3 py-2 text-sm text-text placeholder:text-muted/60 outline-none transition-all focus:border-accent focus:shadow-[0_0_0_2px_rgba(181,140,42,0.2)]"
                  placeholder="prenom.nom@enit.ucar.tn"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="font-mono text-xs uppercase tracking-wider text-muted">
                    Mot de passe
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('reset')
                      setError(null)
                      setResetSent(false)
                    }}
                    className="text-xs text-steel hover:text-accent hover:underline transition-colors"
                  >
                    Mot de passe oublié ?
                  </button>
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-sm border border-muted/35 bg-bg/80 px-3 py-2 text-sm text-text placeholder:text-muted/60 outline-none transition-all focus:border-accent focus:shadow-[0_0_0_2px_rgba(181,140,42,0.2)]"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <p role="alert" className="text-xs text-warning bg-warning/10 border border-warning/50 rounded-sm px-3 py-2">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                aria-busy={loading}
                className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-sm bg-gradient-gold px-4 py-2.5 text-sm font-semibold text-bg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-gold-glow disabled:opacity-50"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                {loading ? 'Connexion...' : 'Se connecter'}
              </button>
            </form>
          ) : (
            <form
              onSubmit={handleResetRequest}
              className="panel-surface rounded-xl p-5 sm:p-6 flex flex-col gap-4 panel-interactive"
            >
              {resetSent ? (
                <div className="flex flex-col items-center gap-3 py-4 text-center">
                  <CheckCircle2 className="h-8 w-8 text-success" aria-hidden="true" />
                  <p className="text-sm text-text">
                    Si un compte existe pour <span className="font-medium">{email}</span>, un lien de
                    réinitialisation vient d&apos;être envoyé.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="reset-email" className="font-mono text-xs uppercase tracking-wider text-muted">
                      Email
                    </label>
                    <input
                      id="reset-email"
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-sm border border-muted/35 bg-bg/80 px-3 py-2 text-sm text-text placeholder:text-muted/60 outline-none transition-all focus:border-accent focus:shadow-[0_0_0_2px_rgba(181,140,42,0.2)]"
                      placeholder="prenom.nom@enit.ucar.tn"
                    />
                  </div>

                  {error && (
                    <p role="alert" className="text-xs text-warning bg-warning/10 border border-warning/50 rounded-sm px-3 py-2">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    aria-busy={loading}
                    className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-sm bg-gradient-gold px-4 py-2.5 text-sm font-semibold text-bg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-gold-glow disabled:opacity-50"
                  >
                    {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                    {loading ? 'Envoi...' : 'Envoyer le lien'}
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={() => {
                  setMode('signin')
                  setError(null)
                  setResetSent(false)
                }}
                className="text-xs text-muted hover:text-accent hover:underline transition-colors text-center"
              >
                ← Retour à la connexion
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-xs text-muted">
            Pas encore de compte ?{' '}
            <Link href="mailto:bureau@cgi-enit.tn" className="text-steel hover:text-accent hover:underline">
              Contacte le bureau du club
            </Link>{' '}
            pour être ajouté.
          </p>
        </div>
      </div>
    </div>
  )
}
