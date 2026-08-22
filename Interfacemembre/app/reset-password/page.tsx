'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle2, Loader2 } from 'lucide-react'

export default function ResetPasswordPage() {
  const router = useRouter()
  const supabase = createClient()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.')
      return
    }
    if (password !== confirmPassword) {
      setError('Les deux mots de passe ne correspondent pas.')
      return
    }

    setLoading(true)
    const { error: updateError } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (updateError) {
      setError("Le lien a peut-être expiré. Redemande une réinitialisation depuis la page de connexion.")
      return
    }

    setSuccess(true)
    setTimeout(() => {
      router.push('/membre')
      router.refresh()
    }, 1500)
  }

  return (
    <div className="industrial-shell min-h-screen bg-bg px-4 py-10 sm:px-6 sm:py-16 flex items-center justify-center">
      <div className="pointer-events-none fixed inset-0 industrial-grid" />
      <div className="pointer-events-none fixed inset-x-0 top-0 h-36 scanline-overlay opacity-35" />

      <div className="relative w-full max-w-sm">
        <div className="mb-6 text-center">
          <p className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-steel">
            CGI · ENIT
          </p>
          <h1 className="font-display text-2xl font-semibold text-text sm:text-3xl">
            Nouveau mot de passe
          </h1>
          <p className="mt-1 text-sm text-muted">
            Choisis un mot de passe pour ton compte.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="panel-surface rounded-xl p-5 sm:p-6 flex flex-col gap-4 panel-interactive"
        >
          {success ? (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <CheckCircle2 className="h-8 w-8 text-success" aria-hidden="true" />
              <p className="text-sm text-text">Mot de passe mis à jour. Redirection en cours...</p>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="password" className="font-mono text-xs uppercase tracking-wider text-muted">
                  Nouveau mot de passe
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-sm border border-muted/35 bg-bg/80 px-3 py-2 text-sm text-text placeholder:text-muted/60 outline-none transition-all focus:border-accent focus:shadow-[0_0_0_2px_rgba(181,140,42,0.2)]"
                  placeholder="••••••••"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="confirm" className="font-mono text-xs uppercase tracking-wider text-muted">
                  Confirmer le mot de passe
                </label>
                <input
                  id="confirm"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                {loading ? 'Mise à jour...' : 'Valider'}
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  )
}
