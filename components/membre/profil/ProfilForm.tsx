'use client'
import { useState, useRef, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/lib/supabase/database.types'

type Profile = Database['public']['Tables']['profiles']['Row'] & {
  poles: { name: string } | null
  email?: string
}

type ToastState = { message: string; type: 'success' | 'error' } | null

const ANNEE_OPTIONS = [
  { value: '1ère année', label: '1ère année' },
  { value: '2ème année', label: '2ème année' },
  { value: '3ème année', label: '3ème année' },
]

const CLASSE_OPTIONS = [
  { value: 'GI 1', label: 'GI 1' },
  { value: 'GI 2', label: 'GI 2' },
  { value: 'GI 3', label: 'GI 3' },
]

function parseYear(rawYear: string | null) {
  if (!rawYear) return { annee: '', classe: '' }
  let annee = ''
  let classe = ''
  
  if (rawYear.includes('1ère année') || rawYear.includes('1ère') || rawYear.includes('1A')) annee = '1ère année'
  else if (rawYear.includes('2ème année') || rawYear.includes('2ème') || rawYear.includes('2A')) annee = '2ème année'
  else if (rawYear.includes('3ème année') || rawYear.includes('3ème') || rawYear.includes('3A')) annee = '3ème année'

  if (rawYear.includes('GI 1') || rawYear.includes('GI1') || rawYear.includes('1ère classe')) classe = 'GI 1'
  else if (rawYear.includes('GI 2') || rawYear.includes('GI2') || rawYear.includes('2ème classe')) classe = 'GI 2'
  else if (rawYear.includes('GI 3') || rawYear.includes('GI3') || rawYear.includes('3ème classe')) classe = 'GI 3'

  return { annee, classe }
}

const COMPLETION_FIELDS: { key: keyof Profile; label: string; weight: number }[] = [
  { key: 'avatar_url', label: 'Photo de profil', weight: 25 },
  { key: 'year', label: 'Classe / Promo', weight: 20 },
  { key: 'birth_date', label: 'Date de naissance', weight: 15 },
  { key: 'phone', label: 'Téléphone', weight: 20 },
  { key: 'linkedin_url', label: 'LinkedIn', weight: 20 },
]

function computeCompletion(profile: Profile): number {
  const total = COMPLETION_FIELDS.reduce((acc, f) => acc + f.weight, 0)
  const filled = COMPLETION_FIELDS
    .filter(f => profile[f.key] && String(profile[f.key]).trim() !== '')
    .reduce((acc, f) => acc + f.weight, 0)
  return Math.round((filled / total) * 100)
}

function Toast({ toast, onClose }: { toast: ToastState; onClose: () => void }) {
  if (!toast) return null
  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border px-5 py-3.5 shadow-2xl backdrop-blur-sm transition-all ${
        toast.type === 'success'
          ? 'border-[#fca311]/40 bg-[#141515] text-[#fca311]'
          : 'border-red-500/40 bg-[#141515] text-red-400'
      }`}
    >
      <span className="text-sm font-semibold font-mono">{toast.message}</span>
      <button
        onClick={onClose}
        aria-label="Fermer"
        className="ml-2 opacity-60 hover:opacity-100 transition-opacity text-lg leading-none"
      >
        ×
      </button>
    </div>
  )
}

export default function ProfilForm({ profile: initialProfile }: { profile: Profile }) {
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isPending, startTransition] = useTransition()
  const [toast, setToast] = useState<ToastState>(null)
  const [isUploading, setIsUploading] = useState(false)

  const [profile, setProfile] = useState<Profile>(initialProfile)
  const initialParsed = parseYear(initialProfile.year)
  const [annee, setAnnee] = useState(initialParsed.annee)
  const [classe, setClasse] = useState(initialParsed.classe)
  const year = [annee, classe].filter(Boolean).join(' — ')
  const [birthDate, setBirthDate] = useState(initialProfile.birth_date || '')
  const [phone, setPhone] = useState(initialProfile.phone || '')
  const [linkedin, setLinkedin] = useState(initialProfile.linkedin_url || '')

  // Client-side validation errors
  const [phoneError, setPhoneError] = useState('')
  const [linkedinError, setLinkedinError] = useState('')

  const completion = computeCompletion(profile)

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  const validatePhone = (val: string) => {
    if (val && !/^\d{8}$/.test(val.trim())) {
      setPhoneError('Format invalide — 8 chiffres requis (ex: 55123456)')
      return false
    }
    setPhoneError('')
    return true
  }

  const validateLinkedin = (val: string) => {
    if (val && !val.includes('linkedin.com')) {
      setLinkedinError('L\'URL doit contenir "linkedin.com"')
      return false
    }
    setLinkedinError('')
    return true
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      showToast('Fichier invalide. Sélectionnez une image.', 'error')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      showToast('Image trop lourde. Maximum 2 Mo.', 'error')
      return
    }

    setIsUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const path = `${profile.id}/avatar.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true })

      if (uploadError) throw new Error(uploadError.message)

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(path)

      // Add cache-busting query param
      const urlWithCache = `${publicUrl}?t=${Date.now()}`

      const res = await fetch('/api/profil/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar_url: urlWithCache }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erreur lors de la mise à jour.')
      }

      setProfile(p => ({ ...p, avatar_url: urlWithCache }))
      showToast('Photo de profil mise à jour !', 'success')
    } catch (err: any) {
      showToast(err.message, 'error')
    } finally {
      setIsUploading(false)
    }
  }

  const handleSave = () => {
    const phoneOk = validatePhone(phone)
    const linkedinOk = validateLinkedin(linkedin)
    if (!phoneOk || !linkedinOk) return

    startTransition(async () => {
      const res = await fetch('/api/profil/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          year: year || null,
          birth_date: birthDate || null,
          phone: phone || null,
          linkedin_url: linkedin || null,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        showToast(data.error || 'Erreur lors de la sauvegarde.', 'error')
        return
      }

      // Update local state to reflect completion changes
      setProfile(p => ({
        ...p,
        year: year || null,
        birth_date: birthDate || null,
        phone: phone || null,
        linkedin_url: linkedin || null,
      }))

      showToast('Profil enregistré avec succès !', 'success')
    })
  }

  const initials =
    (profile.first_name?.[0] || '') + (profile.last_name?.[0] || '')

  const completionColor =
    completion >= 80 ? '#22c55e' : completion >= 40 ? '#fca311' : '#ef4444'

  return (
    <>
      <Toast toast={toast} onClose={() => setToast(null)} />

      <div className="space-y-8 max-w-3xl">
        {/* Header */}
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Mon Profil</h1>
          <p className="text-[#888] mt-1 text-sm">
            Complétez vos informations pour accéder à toutes les fonctionnalités du club.
          </p>
        </div>

        {/* Completion indicator + avatar card */}
        <div className="panel-surface rounded-xl p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar */}
            <div className="relative shrink-0">
              <button
                type="button"
                id="avatar-upload-btn"
                aria-label="Changer la photo de profil"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="group relative flex h-24 w-24 items-center justify-center rounded-full overflow-hidden border-2 border-[#fca311]/30 bg-[#0d0e0e] transition-all hover:border-[#fca311]/70 focus:outline-none focus:ring-2 focus:ring-[#fca311]/50"
              >
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={`Avatar de ${profile.first_name}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="font-bold text-2xl text-[#fca311]">{initials}</span>
                )}
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  {isUploading ? (
                    <svg className="h-5 w-5 animate-spin text-[#fca311]" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z" />
                    </svg>
                  ) : (
                    <>
                      <svg className="h-5 w-5 text-white mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                      </svg>
                      <span className="text-white text-[10px] font-mono uppercase tracking-wider">Modifier</span>
                    </>
                  )}
                </div>
              </button>
              <input
                ref={fileInputRef}
                id="avatar-file-input"
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handleAvatarUpload}
              />
            </div>

            {/* Info + completion */}
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-xl text-white">
                {profile.first_name} {profile.last_name}
              </h2>
              <p className="text-[#888] text-sm mt-0.5">
                {profile.poles?.name || 'Membre CGI ENIT'} · {profile.email || ''}
              </p>

              {/* Completion bar */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-mono uppercase tracking-widest text-[#666]">
                    Complétion du profil
                  </span>
                  <span
                    className="text-xs font-mono font-bold"
                    style={{ color: completionColor }}
                  >
                    {completion}%
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-[#0d0e0e] border border-[#2a2c2c] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${completion}%`, backgroundColor: completionColor }}
                  />
                </div>
                {/* Checklist */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {COMPLETION_FIELDS.map(f => {
                    const filled = profile[f.key] && String(profile[f.key]).trim() !== ''
                    return (
                      <span
                        key={f.key}
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-mono border ${
                          filled
                            ? 'border-[#fca311]/30 bg-[#fca311]/10 text-[#fca311]'
                            : 'border-[#2a2c2c] bg-[#0d0e0e] text-[#555]'
                        }`}
                      >
                        {filled ? '✓' : '○'} {f.label}
                      </span>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form fields */}
        <div className="panel-surface rounded-xl p-6 space-y-6">
          <h3 className="text-xs font-mono uppercase tracking-widest text-[#fca311] border-b border-[#2a2c2c] pb-3">
            Informations personnelles
          </h3>

          {/* Année & Classe */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label
                htmlFor="profile-annee"
                className="block text-xs font-mono uppercase tracking-wider text-[#888]"
              >
                Année
              </label>
              <select
                id="profile-annee"
                value={annee}
                onChange={e => setAnnee(e.target.value)}
                className="w-full rounded-xl border border-[#2a2c2c] bg-[#0d0e0e] px-4 py-3 text-sm text-white appearance-none cursor-pointer transition-colors focus:border-[#fca311]/60 focus:outline-none focus:ring-1 focus:ring-[#fca311]/30"
              >
                <option value="">— Sélectionner l&apos;année —</option>
                {ANNEE_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="profile-classe"
                className="block text-xs font-mono uppercase tracking-wider text-[#888]"
              >
                Classe
              </label>
              <select
                id="profile-classe"
                value={classe}
                onChange={e => setClasse(e.target.value)}
                className="w-full rounded-xl border border-[#2a2c2c] bg-[#0d0e0e] px-4 py-3 text-sm text-white appearance-none cursor-pointer transition-colors focus:border-[#fca311]/60 focus:outline-none focus:ring-1 focus:ring-[#fca311]/30"
              >
                <option value="">— Sélectionner la classe —</option>
                {CLASSE_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Date de naissance */}
          <div className="space-y-2">
            <label
              htmlFor="profile-birth-date"
              className="block text-xs font-mono uppercase tracking-wider text-[#888]"
            >
              Date de naissance
            </label>
            <input
              id="profile-birth-date"
              type="date"
              value={birthDate}
              onChange={e => setBirthDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="w-full rounded-xl border border-[#2a2c2c] bg-[#0d0e0e] px-4 py-3 text-sm text-white transition-colors focus:border-[#fca311]/60 focus:outline-none focus:ring-1 focus:ring-[#fca311]/30 [color-scheme:dark]"
            />
          </div>

          {/* Téléphone */}
          <div className="space-y-2">
            <label
              htmlFor="profile-phone"
              className="block text-xs font-mono uppercase tracking-wider text-[#888]"
            >
              Numéro de téléphone
            </label>
            <div className="flex gap-2">
              <div className="flex items-center rounded-xl border border-[#2a2c2c] bg-[#0d0e0e] px-4 py-3 text-sm text-[#555] font-mono shrink-0 select-none">
                +216
              </div>
              <input
                id="profile-phone"
                type="tel"
                inputMode="numeric"
                placeholder="55 123 456"
                value={phone}
                onChange={e => {
                  const val = e.target.value.replace(/\D/g, '')
                  setPhone(val)
                  if (phoneError) validatePhone(val)
                }}
                onBlur={() => validatePhone(phone)}
                maxLength={8}
                className={`flex-1 rounded-xl border bg-[#0d0e0e] px-4 py-3 text-sm text-white placeholder:text-[#444] font-mono transition-colors focus:outline-none focus:ring-1 ${
                  phoneError
                    ? 'border-red-500/60 focus:border-red-500 focus:ring-red-500/20'
                    : 'border-[#2a2c2c] focus:border-[#fca311]/60 focus:ring-[#fca311]/30'
                }`}
              />
            </div>
            {phoneError && (
              <p className="text-xs text-red-400 font-mono mt-1">⚠ {phoneError}</p>
            )}
          </div>

          {/* LinkedIn */}
          <div className="space-y-2">
            <label
              htmlFor="profile-linkedin"
              className="block text-xs font-mono uppercase tracking-wider text-[#888]"
            >
              Profil LinkedIn
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
                <svg className="h-4 w-4 text-[#555]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </div>
              <input
                id="profile-linkedin"
                type="url"
                placeholder="https://linkedin.com/in/votre-profil"
                value={linkedin}
                onChange={e => {
                  setLinkedin(e.target.value)
                  if (linkedinError) validateLinkedin(e.target.value)
                }}
                onBlur={() => validateLinkedin(linkedin)}
                className={`w-full rounded-xl border bg-[#0d0e0e] pl-11 pr-4 py-3 text-sm text-white placeholder:text-[#444] transition-colors focus:outline-none focus:ring-1 ${
                  linkedinError
                    ? 'border-red-500/60 focus:border-red-500 focus:ring-red-500/20'
                    : 'border-[#2a2c2c] focus:border-[#fca311]/60 focus:ring-[#fca311]/30'
                }`}
              />
            </div>
            {linkedinError && (
              <p className="text-xs text-red-400 font-mono mt-1">⚠ {linkedinError}</p>
            )}
          </div>

          {/* Save button */}
          <div className="pt-2 flex justify-end">
            <button
              id="save-profile-btn"
              type="button"
              onClick={handleSave}
              disabled={isPending || !!phoneError || !!linkedinError}
              className="inline-flex items-center gap-2 rounded-xl bg-[#fca311] px-6 py-3 text-xs font-bold font-mono uppercase tracking-wider text-black shadow-lg shadow-[#fca311]/20 transition-all hover:bg-[#e8940f] hover:shadow-[#fca311]/30 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#fca311]/50"
            >
              {isPending ? (
                <>
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z" />
                  </svg>
                  Enregistrement...
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V7.414A2 2 0 0018.414 6L15 2.586A2 2 0 0013.586 2H7" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 21V15h8v6" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 3v4h7" />
                  </svg>
                  Enregistrer le profil
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
