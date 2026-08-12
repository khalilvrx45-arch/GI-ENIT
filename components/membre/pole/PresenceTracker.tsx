'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/lib/supabase/database.types'
import { motion } from 'framer-motion'

export type Registration = Database['public']['Tables']['event_registrations']['Row'] & {
  profiles: { first_name: string | null, last_name: string | null } | null
}

export default function PresenceTracker({ registrations }: { registrations: Registration[] }) {
  const supabase = createClient()
  const [regs, setRegs] = useState(registrations)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const togglePresence = async (regId: string, currentStatus: boolean | null) => {
    setUpdatingId(regId)
    const newStatus = !currentStatus

    // Optimistic UI
    setRegs(prev => prev.map(r => r.id === regId ? { ...r, attended: newStatus } : r))

    const { error } = await supabase
      .from('event_registrations')
      .update({ attended: newStatus })
      .eq('id', regId)

    if (error) {
      // Rollback
      setRegs(prev => prev.map(r => r.id === regId ? { ...r, attended: currentStatus } : r))
    }
    setUpdatingId(null)
  }

  return (
    <div className="panel-surface overflow-hidden rounded-md">
      <div className="grid grid-cols-[1fr_auto] gap-4 px-4 py-3 border-b border-muted/10 bg-bg/30">
        <span className="text-xs font-mono uppercase tracking-wider text-muted">Membre</span>
        <span className="text-xs font-mono uppercase tracking-wider text-muted">Présence</span>
      </div>
      
      {regs.length === 0 ? (
        <p className="p-4 text-center text-muted text-sm">Aucun membre inscrit confirmé.</p>
      ) : (
        regs.map((reg) => (
          <div 
            key={reg.id} 
            className={`grid grid-cols-[1fr_auto] gap-4 px-4 py-3 border-b border-bg/50 last:border-b-0 items-center transition-colors ${
              reg.attended ? 'bg-success/5' : 'hover:bg-bg/30'
            }`}
          >
            <div>
              <p className="text-sm font-medium text-text">
                {reg.profiles?.first_name} {reg.profiles?.last_name}
              </p>
            </div>
            <button
              onClick={() => togglePresence(reg.id, reg.attended)}
              disabled={updatingId === reg.id}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                reg.attended ? 'bg-success' : 'bg-muted/30'
              } disabled:opacity-50`}
            >
              <motion.div 
                layout
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className={`absolute top-0.5 w-5 h-5 bg-bg rounded-full ${
                  reg.attended ? 'right-0.5' : 'left-0.5'
                }`}
              />
            </button>
          </div>
        ))
      )}
    </div>
  )
}