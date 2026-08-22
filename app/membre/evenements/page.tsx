import { createClient } from '@/lib/supabase/server'
import ActivityListClient from '@/components/membre/activity/ActivityListClient'
import { Database } from '@/lib/supabase/database.types'
import { CalendarDays, Sparkles } from 'lucide-react'

type Activity = Database['public']['Tables']['activities']['Row']
type Registration = Database['public']['Tables']['event_registrations']['Row']

export default async function EvenementsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id

  const [activitiesRes, registrationsRes, countsRes] = await Promise.all([
    supabase
      .from('activities')
      .select('*')
      .eq('type', 'event')
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
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#181a1a] via-[#141515] to-[#121313] border border-[#2a2c2c] p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 w-72 h-72 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-bold uppercase tracking-wider">
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Vie du Club & Rassemblements</span>
          </div>
          <h1 className="font-display text-2xl sm:text-4xl font-bold text-white tracking-tight">
            Événements du Club
          </h1>
          <p className="text-[#aaa] text-xs sm:text-sm max-w-2xl leading-relaxed">
            Participez aux séminaires, conférences, teambuildings et rencontres du Club Génie Industriel ENIT.
          </p>
        </div>
      </div>
      
      <ActivityListClient 
        activities={formattedActivities} 
      />
    </div>
  )
}