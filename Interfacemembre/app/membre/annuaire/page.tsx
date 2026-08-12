import { createClient } from '@/lib/supabase/server'
import DimensionDivider from '@/components/membre/shared/DimensionDivider'

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

export default async function AnnuairePage() {
  const supabase = await createClient()
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*, poles(name)')
    .order('first_name', { ascending: true })

  const typedProfiles = (profiles ?? []) as Profile[]
  const bureau = typedProfiles.filter((p) => p.role === 'admin' || p.role === 'pole_lead')
  const members = typedProfiles.filter((p) => p.role === 'member')

  // Grouper par pôle
  const membersByPole = members.reduce((acc, member) => {
    const poleName = member.poles?.name || 'Non assigné'
    if (!acc[poleName]) acc[poleName] = []
    acc[poleName].push(member)
    return acc
  }, {} as Record<string, Profile[]>)

  const roleLabels: Record<string, string> = {
    admin: 'Administrateur',
    pole_lead: 'Responsable Pôle'
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Annuaire</h1>
        <p className="text-muted mt-1">L&apos;organigramme du club et les membres par pôle.</p>
      </div>

      {/* Bureau */}
      <section>
        <DimensionDivider label="Bureau & Responsables" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
          {bureau.map((member) => (
            <div key={member.id} className="panel-surface panel-interactive flex flex-col items-center rounded-md p-4 text-center">
              <div className="w-16 h-16 rounded-full bg-bg border border-muted/20 flex items-center justify-center mb-3">
                <span className="font-display font-bold text-xl text-accent">
                  {member.first_name?.[0]}{member.last_name?.[0]}
                </span>
              </div>
              <p className="font-medium text-text text-sm">{member.first_name} {member.last_name}</p>
              <p className="text-xs text-accent font-mono mt-1 uppercase tracking-wider">{roleLabels[member.role]}</p>
              {member.poles && <p className="text-xs text-muted mt-0.5">{member.poles.name}</p>}
            </div>
          ))}
        </div>
      </section>

      {/* Membres par pôle */}
      {Object.entries(membersByPole).map(([poleName, poleMembers]) => (
        <section key={poleName}>
          <DimensionDivider label={poleName} />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
            {poleMembers.map((member) => (
              <div key={member.id} className="panel-surface panel-interactive flex items-center gap-3 rounded-md p-4">
                <div className="w-10 h-10 rounded-full bg-bg border border-muted/20 flex items-center justify-center shrink-0">
                  <span className="font-display font-bold text-sm text-muted">
                    {member.first_name?.[0]}{member.last_name?.[0]}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-text text-sm truncate">{member.first_name} {member.last_name}</p>
                  <p className="text-xs text-muted font-mono">{member.year || 'Année ?'}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}