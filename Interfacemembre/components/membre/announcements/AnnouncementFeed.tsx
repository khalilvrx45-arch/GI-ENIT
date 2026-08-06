'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'

type Announcement = {
  id: string
  title: string
  content: string | null
  excerpt: string | null
  pinned: boolean
  created_at: string
  pole_id: string | null
  poles: { name: string } | null
}

export default function AnnouncementFeed({ initialAnnouncements }: { initialAnnouncements: Announcement[] }) {
  const supabase = createClient()
  const [announcements, setAnnouncements] = useState(initialAnnouncements)

  useEffect(() => {
    const channel = supabase
      .channel('announcements-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'announcements' },
        async (payload) => {
          // Récupérer l'annonce complète avec la jointure du pôle
          const { data: newAnnouncement } = await supabase
            .from('announcements')
            .select('*, poles(name)')
            .eq('id', payload.new.id)
            .single()
          
          if (newAnnouncement) {
            setAnnouncements(prev => [newAnnouncement as Announcement, ...prev])
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [supabase])

  return (
    <div className="space-y-4">
      <AnimatePresence initial={false}>
        {announcements.map((a) => (
          <motion.div
            key={a.id}
            layout
            initial={{ opacity: 0, y: -20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={`bg-card border rounded-md p-5 ${
              a.pinned ? 'border-accent/40 bg-accent/5' : 'border-card'
            }`}
          >
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="flex items-center gap-2">
                {a.pinned && (
                  <span className="text-xs font-mono uppercase tracking-wider text-accent bg-accent/10 px-2 py-0.5 rounded-sm">
                    Épinglé
                  </span>
                )}
                {a.poles && (
                  <span className="text-xs font-mono uppercase tracking-wider text-steel bg-steel/10 px-2 py-0.5 rounded-sm">
                    {a.poles.name}
                  </span>
                )}
              </div>
              <time className="text-xs text-muted font-mono shrink-0">
                {new Date(a.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
              </time>
            </div>
            <h2 className="font-display text-xl font-bold text-text mb-2">{a.title}</h2>
            {a.content && <p className="text-text/80 leading-relaxed whitespace-pre-line">{a.content}</p>}
          </motion.div>
        ))}
      </AnimatePresence>
      
      {announcements.length === 0 && (
        <div className="text-center py-16 bg-card rounded-md border border-dashed border-muted/30">
          <p className="text-muted">Aucune annonce pour le moment.</p>
        </div>
      )}
    </div>
  )
}