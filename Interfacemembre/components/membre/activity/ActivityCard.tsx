import Link from 'next/link'
import { Database } from '@/lib/supabase/database.types'
import { formatActivityDate, getActivityTypeLabel } from '@/lib/utils'
import CapacityBar from './CapacityBar'
import { motion } from 'framer-motion'

type Activity = Database['public']['Tables']['activities']['Row']
type Registration = Database['public']['Tables']['event_registrations']['Row']

type Props = {
  activity: Activity
  registration: Registration | null
  registeredCount: number
}

export default function ActivityCard({ activity, registration, registeredCount }: Props) {
  const isFull = activity.capacity ? registeredCount >= activity.capacity : false
  const typeColor = activity.type === 'event' ? 'text-steel' : activity.type === 'visit' ? 'text-accent' : 'text-success'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -2 }}
      className="panel-surface panel-interactive flex h-full flex-col overflow-hidden rounded-md group"
    >
      <Link href={`/membre/${activity.type === 'event' ? 'evenements' : activity.type === 'visit' ? 'visites' : 'formations'}/${activity.id}`} className="flex-1 p-4 flex flex-col gap-3">
        <div className="flex justify-between items-start">
          <span className={`text-xs font-mono uppercase tracking-wider ${typeColor}`}>
            {getActivityTypeLabel(activity.type)}
          </span>
          {registration && (
            <span className={`text-xs font-mono px-2 py-0.5 rounded-sm ${
              registration.status === 'confirmed' 
                ? 'bg-success/20 text-success' 
                : 'bg-warning/20 text-warning'
            }`}>
              {registration.status === 'confirmed' ? 'Inscrit' : `Attente #${registration.queue_position}`}
            </span>
          )}
          {!registration && isFull && (
            <span className="text-xs font-mono px-2 py-0.5 rounded-sm bg-muted/20 text-muted">
              Complet
            </span>
          )}
        </div>

        <div>
          <h3 className="font-display font-semibold text-lg text-text leading-tight group-hover:text-accent transition-colors">
            {activity.title}
          </h3>
          {activity.location && (
            <p className="text-sm text-muted mt-1 flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              {activity.location}
            </p>
          )}
        </div>

        <div className="mt-auto pt-3 border-t border-bg/50">
          <p className="text-sm text-text font-mono mb-3">
            {formatActivityDate(activity.date_start)}
          </p>
          {activity.capacity && (
            <CapacityBar registered={registeredCount} capacity={activity.capacity} />
          )}
        </div>
      </Link>
    </motion.div>
  )
}