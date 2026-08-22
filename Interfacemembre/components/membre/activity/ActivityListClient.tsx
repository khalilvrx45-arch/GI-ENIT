'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ActivityCard from './ActivityCard'
import { Database } from '@/lib/supabase/database.types'

type Activity = Database['public']['Tables']['activities']['Row']
type Registration = Database['public']['Tables']['event_registrations']['Row']

type Props = {
  activities: { activity: Activity; registration: Registration | null; registeredCount: number }[]
}

export default function ActivityListClient({ activities }: Props) {
  const [filter, setFilter] = useState<'upcoming' | 'past'>('upcoming')
  const now = new Date()

  const filtered = activities.filter(item => {
    const isUpcoming = new Date(item.activity.date_start) >= now
    return filter === 'upcoming' ? isUpcoming : !isUpcoming
  })

  return (
    <div className="space-y-6">
      <div className="flex gap-2 border-b border-accent/15">
        {(['upcoming', 'past'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`relative px-4 py-2 text-sm font-medium transition-colors ${
              filter === f ? 'text-accent' : 'text-muted hover:text-text'
            }`}
          >
            {f === 'upcoming' ? 'À venir' : 'Passés'}
            {filter === f && (
              <motion.div 
                layoutId="active-tab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent"
              />
            )}
          </button>
        ))}
      </div>

      {filtered.length > 0 ? (
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.05 }
            }
          }}
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((item) => (
              <motion.div
                key={item.activity.id}
                layout
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: { opacity: 1, y: 0 }
                }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <ActivityCard 
                  activity={item.activity}
                  registration={item.registration}
                  registeredCount={item.registeredCount}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="panel-surface rounded-md border border-dashed border-muted/30 py-16 text-center">
          <p className="text-muted">
            {filter === 'upcoming' 
              ? "Aucun événement à venir pour le moment. Reviens bientôt !" 
              : "Aucun événement passé."}
          </p>
        </div>
      )}
    </div>
  )
}