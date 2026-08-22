'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/lib/supabase/database.types'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Medal, Crown, Sparkles, Award } from 'lucide-react'

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
    const channel = supabase
      .channel('leaderboard-realtime')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles' },
        async () => {
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

  const top1 = entries.find(e => e.rank === 1)
  const top2 = entries.find(e => e.rank === 2)
  const top3 = entries.find(e => e.rank === 3)
  const rest = entries.filter(e => (e.rank || 0) > 3)

  return (
    <div className="space-y-10">
      {/* Podium Top 3 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 items-end pt-6">
        {/* 2nd Place (Silver) */}
        {top2 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="order-2 sm:order-1 bg-[#141515] border border-slate-400/30 rounded-3xl p-5 sm:p-6 flex flex-col items-center text-center relative overflow-hidden shadow-xl"
          >
            <div className="w-10 h-10 rounded-full bg-slate-400/20 text-slate-300 font-bold text-sm flex items-center justify-center mb-3 border border-slate-400/40">
              #2
            </div>
            <div className="w-16 h-16 rounded-2xl bg-[#1e2020] border-2 border-slate-400/50 flex items-center justify-center mb-3 shadow-md">
              <span className="font-display font-bold text-xl text-slate-300">
                {top2.first_name?.[0]}{top2.last_name?.[0]}
              </span>
            </div>
            <p className="font-bold text-white text-sm truncate max-w-full">
              {top2.first_name} {top2.last_name}
            </p>
            <p className="text-[11px] text-[#888] font-mono mt-0.5">{top2.pole_name || 'Membre'}</p>
            <div className="mt-3 px-4 py-1.5 rounded-xl bg-slate-400/10 border border-slate-400/20">
              <span className="font-mono text-xl font-black text-slate-200">{top2.points_total}</span>
              <span className="text-[10px] text-slate-400 font-bold ml-1 uppercase">pts</span>
            </div>
          </motion.div>
        )}

        {/* 1st Place (Gold / Crown) */}
        {top1 && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="order-1 sm:order-2 bg-gradient-to-b from-[#1c1a14] to-[#141515] border-2 border-[#fca311] rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center relative overflow-hidden shadow-[0_0_35px_rgba(252,163,17,0.2)]"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#fca311]/15 rounded-full blur-2xl pointer-events-none" />
            <div className="w-10 h-10 rounded-full bg-[#fca311] text-black font-extrabold text-sm flex items-center justify-center mb-3 shadow-[0_0_15px_rgba(252,163,17,0.5)]">
              <Crown className="w-5 h-5" />
            </div>
            <div className="w-20 h-20 rounded-2xl bg-[#1e2020] border-2 border-[#fca311] flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(252,163,17,0.25)]">
              <span className="font-display font-extrabold text-2xl text-[#fca311]">
                {top1.first_name?.[0]}{top1.last_name?.[0]}
              </span>
            </div>
            <p className="font-extrabold text-white text-base truncate max-w-full">
              {top1.first_name} {top1.last_name}
            </p>
            <p className="text-xs text-[#fca311] font-mono font-bold mt-0.5">{top1.pole_name || 'Membre ENIT'}</p>
            <div className="mt-4 px-5 py-2 rounded-2xl bg-[#fca311]/15 border border-[#fca311]/40">
              <span className="font-mono text-2xl font-black text-[#fca311]">{top1.points_total}</span>
              <span className="text-xs text-[#fca311] font-bold ml-1 uppercase">pts</span>
            </div>
          </motion.div>
        )}

        {/* 3rd Place (Bronze) */}
        {top3 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="order-3 sm:order-3 bg-[#141515] border border-amber-700/30 rounded-3xl p-5 sm:p-6 flex flex-col items-center text-center relative overflow-hidden shadow-xl"
          >
            <div className="w-10 h-10 rounded-full bg-amber-700/20 text-amber-400 font-bold text-sm flex items-center justify-center mb-3 border border-amber-700/40">
              #3
            </div>
            <div className="w-16 h-16 rounded-2xl bg-[#1e2020] border-2 border-amber-700/50 flex items-center justify-center mb-3 shadow-md">
              <span className="font-display font-bold text-xl text-amber-500">
                {top3.first_name?.[0]}{top3.last_name?.[0]}
              </span>
            </div>
            <p className="font-bold text-white text-sm truncate max-w-full">
              {top3.first_name} {top3.last_name}
            </p>
            <p className="text-[11px] text-[#888] font-mono mt-0.5">{top3.pole_name || 'Membre'}</p>
            <div className="mt-3 px-4 py-1.5 rounded-xl bg-amber-700/10 border border-amber-700/20">
              <span className="font-mono text-xl font-black text-amber-400">{top3.points_total}</span>
              <span className="text-[10px] text-amber-500 font-bold ml-1 uppercase">pts</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Full Leaderboard List */}
      <div className="space-y-4">
        <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
          <Trophy className="w-4 h-4 text-[#fca311]" />
          <span>Classement Général des Membres</span>
        </h2>

        <div className="bg-[#141515] border border-[#2a2c2c] rounded-3xl overflow-hidden shadow-xl">
          <AnimatePresence>
            {entries.map((entry) => {
              const isCurrentUser = entry.user_id === currentUserId
              return (
                <motion.div
                  key={entry.user_id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`flex items-center justify-between border-b border-[#2a2c2c]/60 p-4 sm:p-5 transition-colors last:border-b-0 ${
                    isCurrentUser 
                      ? 'bg-[#fca311]/10 border-l-4 border-l-[#fca311]' 
                      : 'hover:bg-white/[0.02]'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-[#1e2020] border border-[#2a2c2c]">
                      <span className="font-mono font-bold text-xs text-[#888]">
                        #{entry.rank}
                      </span>
                    </div>

                    <div className="w-10 h-10 rounded-xl bg-[#1e2020] border border-[#2a2c2c] flex items-center justify-center shrink-0">
                      <span className="font-bold text-xs text-white">
                        {entry.first_name?.[0]}{entry.last_name?.[0]}
                      </span>
                    </div>

                    <div>
                      <p className="font-bold text-white text-sm">
                        {entry.first_name} {entry.last_name}
                        {isCurrentUser && (
                          <span className="ml-2 text-[10px] font-bold px-2 py-0.5 rounded bg-[#fca311] text-black uppercase">
                            Toi
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-[#888] font-mono mt-0.5">{entry.pole_name || 'Membre ENIT'}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-mono font-black text-[#fca311] text-lg sm:text-xl">{entry.points_total}</p>
                    <p className="text-[10px] uppercase text-[#666] font-mono font-bold tracking-wider">points</p>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}