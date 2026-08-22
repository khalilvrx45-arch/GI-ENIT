import { createClient } from '@/lib/supabase/server'
import CalendarClient from '@/components/membre/calendrier/CalendarClient'
import { Database } from '@/lib/supabase/database.types'
import { CalendarRange } from 'lucide-react'

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
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#181a1a] via-[#141515] to-[#121313] border border-[#2a2c2c] p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[#fca311] text-xs font-bold uppercase tracking-wider">
            <CalendarRange className="w-3.5 h-3.5" />
            <span>Planning & Événements</span>
          </div>
          <h1 className="font-display text-2xl sm:text-4xl font-bold text-white tracking-tight">
            Calendrier Interactif
          </h1>
          <p className="text-[#aaa] text-xs sm:text-sm max-w-2xl leading-relaxed">
            Visualisez le planning mensuel complet de toutes les activités, ateliers et sessions du Club GI ENIT.
          </p>
        </div>
      </div>

      <CalendarClient initialActivities={activities as Activity[]} />
    </div>
  )
}