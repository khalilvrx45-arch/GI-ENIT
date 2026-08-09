import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import EventDetailClient from '../../../../components/membre/activity/EventDetailClient'
import { formatActivityDate } from '@/lib/utils'
import { Database } from '@/lib/supabase/database.types'
import { MapPin } from 'lucide-react'

type Activity = Database['public']['Tables']['activities']['Row']
type Registration = Database['public']['Tables']['event_registrations']['Row']

export default async function EventDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Récupère l'activité
  const activity = (await supabase
    .from('activities')
    .select('*')
    .eq('id', params.id)
    .eq('type', 'event') // Sécurité: on s'assure que c'est bien un event
    .single()).data as Activity | null

  if (!activity) notFound()

  // Récupère l'inscription de l'utilisateur courant
  const registration = (await supabase
    .from('event_registrations')
    .select('*')
    .eq('activity_id', params.id)
    .eq('user_id', user?.id || '')
    .single()).data as Registration | null

  // Compte les inscrits confirmés
  const { count: registeredCount } = await supabase
    .from('event_registrations')
    .select('*', { count: 'exact', head: true })
    .eq('activity_id', params.id)
    .eq('status', 'confirmed')

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <span className="text-xs text-steel font-mono uppercase tracking-wider">Événement</span>
        <h1 className="font-display text-3xl md:text-4xl font-bold mt-1">{activity.title}</h1>
        <div className="flex flex-wrap items-center gap-4 mt-3 text-muted">
          <span className="font-mono text-sm">{formatActivityDate(activity.date_start)}</span>
          {activity.location && (
            <span className="inline-flex items-center gap-1.5 text-sm">
              <MapPin className="h-4 w-4 text-steel" aria-hidden="true" />
              {activity.location}
            </span>
          )}
        </div>
      </div>

      {activity.description && (
        <div className="prose prose-invert max-w-none">
          <p className="text-text/90 leading-relaxed">{activity.description}</p>
        </div>
      )}

      <div className="panel-surface rounded-md p-6">
        <h2 className="font-display text-xl font-bold mb-4">Inscription</h2>
        <EventDetailClient 
          activity={activity} 
          initialRegistration={registration} 
          initialRegisteredCount={registeredCount || 0}
          userId={user?.id || ''}
        />
      </div>

      {/* S'il y a un compte-rendu après la date */}
      {activity.recap_url && new Date(activity.date_start) < new Date() && (
        <div className="bg-bg border border-success/30 p-4 rounded-md flex items-center justify-between">
          <span className="text-sm text-success">Cet événement est terminé. Le compte-rendu est disponible.</span>
          <a href={activity.recap_url} target="_blank" rel="noreferrer" className="text-sm font-medium text-success hover:underline">
            Télécharger →
          </a>
        </div>
      )}
    </div>
  )
}