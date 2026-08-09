import { createClient } from '@/lib/supabase/server'
import CalendarClient from '@/components/membre/calendrier/CalendarClient'
import { Database } from '@/lib/supabase/database.types'

type Activity = Database['public']['Tables']['activities']['Row']

export default async function CalendrierPage() {
  const supabase = await createClient()
  
  // Récupère les activités du mois en cours + 1 mois avant/après pour les bords
  const start = new Date()
  start.setMonth(start.getMonth() - 1)
  start.setDate(1)
  
  const end = new Date()
  end.setMonth(end.getMonth() + 2)
  end.setDate(0)

  const { data: activities } = await supabase
    .from('activities')
    .select('*')
    .gte('date_start', start.toISOString())
    .lte('date_start', end.toISOString())
    .order('date_start', { ascending: true })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Calendrier</h1>
        <p className="text-muted mt-1">Vue d&apos;ensemble des activités du club.</p>
      </div>
      <CalendarClient initialActivities={activities as Activity[]} />
    </div>
  )
}