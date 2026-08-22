import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PresenceTracker, { type Registration } from '@/components/membre/pole/PresenceTracker'
type Profile = {
  role: 'member' | 'pole_lead' | 'admin'
}

type Activity = {
  title: string
  date_start: string
}

export default async function PresencePage({ params }: { params: { poleId: string, id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user?.id || '')
    .single()

  const typedProfile = profile as Profile | null

  if (!typedProfile || (typedProfile.role !== 'admin' && typedProfile.role !== 'pole_lead')) {
    redirect('/membre')
  }

  const { data: activity } = await supabase
    .from('activities')
    .select('title, date_start')
    .eq('id', params.id)
    .single()

  const typedActivity = activity as Activity | null

  const { data: registrations } = await supabase
    .from('event_registrations')
    .select('*, profiles(first_name, last_name)')
    .eq('activity_id', params.id)
    .eq('status', 'confirmed')
    .order('profiles(last_name)', { ascending: true })

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <span className="text-xs text-accent font-mono uppercase tracking-wider">Pointage</span>
        <h1 className="font-display text-3xl font-bold tracking-tight">{typedActivity?.title}</h1>
        <p className="text-muted mt-1">Coche les membres présents. Les points sont crédités automatiquement.</p>
      </div>

      <PresenceTracker registrations={(registrations ?? []) as Registration[]} />
    </div>
  )
}