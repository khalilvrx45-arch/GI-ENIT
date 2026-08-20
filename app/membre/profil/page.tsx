import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProfilForm from '@/components/membre/profil/ProfilForm'

type Profile = {
  id: string
  first_name: string | null
  last_name: string | null
  role: 'admin' | 'membre_bureau' | 'membre_actif'
  pole_id: string | null
  points_total: number
  year: string | null
  avatar_url: string | null
  is_active: boolean
  // Extended fields — nullable until migration is applied
  birth_date: string | null
  phone: string | null
  linkedin_url: string | null
  poles: { name: string } | null
  email?: string
}

type PointLog = {
  id: string
  reason: string
  amount: number
  created_at: string
}

export default async function ProfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login?error=no_user')

  // Use explicit column list instead of '*' to avoid crashing if
  // migration hasn't been pushed yet — new columns default to null
  // Try fetching profile with extended fields first
  let rawProfile: any = null
  const profileQuery = await supabase
    .from('profiles')
    .select('id, first_name, last_name, role, pole_id, points_total, year, avatar_url, is_active, birth_date, phone, linkedin_url, poles(name)')
    .eq('id', user!.id)
    .maybeSingle()

  if (profileQuery.error) {
    // If extended query fails due to missing DB columns, fallback to base query
    const { data: baseData } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, role, pole_id, points_total, is_active, poles(name)')
      .eq('id', user!.id)
      .maybeSingle()
    rawProfile = baseData
  } else {
    rawProfile = profileQuery.data
  }

  const { data: pointsLogData } = await supabase
    .from('points_log')
    .select('id, reason, amount, created_at')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })
    .limit(10)

  // Extract fallback values from user_metadata if profiles row has missing fields
  const meta = user!.user_metadata || {}
  const fullNameParts = (meta.full_name || meta.name || '').split(' ')

  const profile: Profile = {
    id: user!.id,
    first_name: rawProfile?.first_name || meta.first_name || fullNameParts[0] || null,
    last_name: rawProfile?.last_name || meta.last_name || fullNameParts.slice(1).join(' ') || null,
    role: (rawProfile?.role as Profile['role']) || (meta.role as Profile['role']) || 'membre_actif',
    pole_id: rawProfile?.pole_id ?? null,
    points_total: rawProfile?.points_total ?? 0,
    year: rawProfile?.year || meta.year || null,
    avatar_url: rawProfile?.avatar_url || meta.avatar_url || null,
    is_active: rawProfile?.is_active ?? true,
    birth_date: rawProfile?.birth_date || meta.birth_date || null,
    phone: rawProfile?.phone || meta.phone || null,
    linkedin_url: rawProfile?.linkedin_url || meta.linkedin_url || null,
    poles: rawProfile?.poles ?? null,
    email: user!.email,
  }

  const pointsLog = (pointsLogData ?? []) as PointLog[]

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Profile form (editable fields + avatar) */}
      <ProfilForm profile={profile} />

      {/* Points history — read-only */}
      <div>
        <h3 className="font-display text-xl font-bold mb-4">Historique des points</h3>
        <div className="panel-surface overflow-hidden rounded-xl">
          {pointsLog.length > 0 ? (
            pointsLog.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-4 border-b border-[#2a2c2c]/50 last:border-b-0"
              >
                <div>
                  <p className="text-sm text-white font-medium">{log.reason}</p>
                  <p className="text-xs text-[#666] font-mono mt-0.5">
                    {new Date(log.created_at).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <span
                  className={`font-mono font-bold text-lg ${
                    log.amount > 0 ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {log.amount > 0 ? '+' : ''}{log.amount}
                </span>
              </div>
            ))
          ) : (
            <p className="p-6 text-center text-[#555] text-sm font-mono">
              Aucun mouvement de points enregistré.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}