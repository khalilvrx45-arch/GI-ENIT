import { createClient } from '@/lib/supabase/server'

type Profile = {
  id: string
  first_name: string | null
  last_name: string | null
  role: 'member' | 'pole_lead' | 'admin'
  pole_id: string | null
  points_total: number
  year: string | null
  poles: { name: string } | null
}

type PointLog = {
  id: string
  user_id: string
  reason: string
  amount: number
  created_at: string
}

export default async function ProfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id

  const [profileRes, pointsLogRes] = await Promise.all([
    supabase
      .from('profiles')
      .select('*, poles(name)')
      .eq('id', userId || '')
      .single(),
    
    supabase
      .from('points_log')
      .select('*')
      .eq('user_id', userId || '')
      .order('created_at', { ascending: false })
  ])

  const typedProfile = profileRes.data as Profile | null
  const pointsLog = pointsLogRes.data

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Mon Profil</h1>
      </div>

      <div className="panel-surface rounded-md p-6">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-bg border border-muted/20 flex items-center justify-center">
            <span className="font-display font-bold text-2xl text-accent">
              {typedProfile?.first_name?.[0]}{typedProfile?.last_name?.[0]}
            </span>
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold">{typedProfile?.first_name} {typedProfile?.last_name}</h2>
            <p className="text-muted text-sm">{typedProfile?.poles?.name || 'Membre'} · {typedProfile?.year || 'Année ?'}</p>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-muted/10 flex items-center justify-between">
          <span className="text-sm text-muted uppercase font-mono tracking-wider">Total Points</span>
          <span className="font-mono text-3xl font-bold text-accent">{typedProfile?.points_total || 0}</span>
        </div>
      </div>

      <div>
        <h3 className="font-display text-xl font-bold mb-4">Historique des points</h3>
        <div className="panel-surface overflow-hidden rounded-md">
          {pointsLog && pointsLog.length > 0 ? (
            pointsLog.map((log: PointLog) => (
              <div key={log.id} className="flex items-center justify-between p-4 border-b border-bg/50 last:border-b-0">
                <div>
                  <p className="text-sm text-text font-medium">{log.reason}</p>
                  <p className="text-xs text-muted font-mono mt-0.5">
                    {new Date(log.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <span className={`font-mono font-bold text-lg ${log.amount > 0 ? 'text-success' : 'text-danger'}`}>
                  {log.amount > 0 ? '+' : ''}{log.amount}
                </span>
              </div>
            ))
          ) : (
            <p className="p-4 text-center text-muted text-sm">Aucun mouvement de points enregistré.</p>
          )}
        </div>
      </div>
    </div>
  )
}