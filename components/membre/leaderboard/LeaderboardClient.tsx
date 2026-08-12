'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/lib/supabase/database.types'
import { motion, AnimatePresence } from 'framer-motion'

type LeaderboardEntry = Database['public']['Views']['leaderboard']['Row']

export default function LeaderboardClient({ 
  initialLeaderboard, 
  currentUserId 
}: { 
  initialLeaderboard: LeaderboardEntry[], 
  currentUserId: string 
}) {
  const supabase = createClient()
  const [entries, setEntries] = useState(initialLeaderboard)

  useEffect(() => {
    // Abonnement Realtime sur la table profiles
    const channel = supabase
      .channel('leaderboard-realtime')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles' },
        async () => {
          // Quand un profil est mis à jour (ex: points crédités), on refetch la vue
          // C'est plus simple et plus sûr que de recalculer le rang côté client
          const { data: newLeaderboard } = await supabase
            .from('leaderboard')
            .select('*')
            .order('rank', { ascending: true })
          
          if (newLeaderboard) setEntries(newLeaderboard as LeaderboardEntry[])
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [supabase])

  const top3 = entries.slice(0, 3)
  const rest = entries.slice(3)
  
  // Couleurs du podium
  const podiumStyles = [
    'order-2 md:order-1 h-32 md:h-40', // 1er (au centre sur mobile, à gauche sur desktop)
    'order-1 md:order-2 h-40 md:h-48', // 2ème (plus haut)
    'order-3 md:order-3 h-28 md:h-32'  // 3ème
  ]
  const podiumColors = [
    'border-accent text-accent', // Or
    'border-muted text-text',
    'border-steel text-steel'
  ]

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-3 gap-2 md:gap-4 items-end">
        {top3.map((entry, idx) => {
          const visualIndex = entry.rank === 1 ? 1 : entry.rank === 2 ? 0 : 2
          return (
            <motion.div 
              key={entry.user_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, type: 'spring', stiffness: 100 }}
              className={`panel-surface flex flex-col items-center justify-end rounded-md border-b-2 p-4 ${podiumStyles[visualIndex]} ${podiumColors[visualIndex]}`}
            >
              <div className="w-12 h-12 rounded-full bg-bg flex items-center justify-center mb-2 border border-muted/20">
                <span className="font-display font-bold text-lg">
                  {entry.first_name?.[0]}{entry.last_name?.[0]}
                </span>
              </div>
              <span className="font-medium text-sm text-text text-center truncate w-full">
                {entry.first_name} {entry.last_name}
              </span>
              <span className="font-mono text-2xl font-bold mt-1">{entry.points_total}</span>
              <span className="text-xs text-muted font-mono">#{entry.rank}</span>
            </motion.div>
          )
        })}
      </div>

      <div className="panel-surface overflow-hidden rounded-md">
        <AnimatePresence>
          {rest.map((entry) => (
            <motion.div
              key={entry.user_id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`flex items-center justify-between border-b border-bg/50 p-4 transition-colors last:border-b-0 ${
                entry.user_id === currentUserId ? 'bg-accent/5 border-l-2 border-l-accent' : 'hover:bg-bg/30'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 w-12">
                  <span className="font-mono text-muted text-sm">{entry.rank}</span>
                  <div className="h-3 w-px bg-muted/30" />
                </div>
                <div>
                  <p className="font-medium text-text">
                    {entry.first_name} {entry.last_name}
                    {entry.user_id === currentUserId && <span className="text-accent text-xs ml-2">(Toi)</span>}
                  </p>
                  <p className="text-xs text-muted">{entry.pole_name || 'Membre'}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-mono font-bold text-accent text-lg">{entry.points_total}</p>
                <p className="text-[10px] uppercase text-muted tracking-wider">points</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}