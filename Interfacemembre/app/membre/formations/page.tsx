import { createClient } from '@/lib/supabase/server'
import ActivityListClient from '../../../components/membre/activity/ActivityListClient'
import { Database } from '@/lib/supabase/database.types'

type Activity = Database['public']['Tables']['activities']['Row']
type Registration = Database['public']['Tables']['event_registrations']['Row']

export default async function FormationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id

  const [activitiesRes, registrationsRes, countsRes] = await Promise.all([
    supabase
      .from('activities')
      .select('*')
      .eq('type', 'formation')
      .order('date_start', { ascending: true }),
    
    supabase
      .from('event_registrations')
      .select('*')
      .eq('user_id', userId || ''),
      
    supabase
      .from('event_registrations')
      .select('activity_id')
      .eq('status', 'confirmed')
  ])

  const activities = (activitiesRes.data ?? []) as Activity[]
  const registrations = (registrationsRes.data ?? []) as Registration[]
  const counts = (countsRes.data ?? []) as Array<Pick<Registration, 'activity_id'>>

  // Map pour accès rapide
  const userRegsMap = new Map<string, Registration>()
  registrations.forEach(reg => userRegsMap.set(reg.activity_id, reg))

  const countMap = new Map<string, number>()
  counts.forEach(c => {
    countMap.set(c.activity_id, (countMap.get(c.activity_id) || 0) + 1)
  })

  const formattedActivities = activities.map(act => ({
    activity: act,
    registration: userRegsMap.get(act.id) || null,
    registeredCount: countMap.get(act.id) || 0
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Formations</h1>
        <p className="text-muted mt-1">Développe tes compétences avec nos formations.</p>
      </div>
      
      <ActivityListClient 
        activities={formattedActivities} 
      />
    </div>
  )
}
