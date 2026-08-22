import { createClient } from '@/lib/supabase/server'
import LeaderboardClient from '@/components/membre/leaderboard/LeaderboardClient'
import { Database } from '@/lib/supabase/database.types'
import { Trophy } from 'lucide-react'

type LeaderboardEntry = Database['public']['Views']['leaderboard']['Row']

export default async function ClassementPage() {
  const supabase = await createClient()
  
  const [userRes, leaderboardRes] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from('leaderboard')
      .select('*')
      .order('rank', { ascending: true })
  ])

  const userId = userRes.data.user?.id
  const leaderboard = leaderboardRes.data

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#181a1a] via-[#141515] to-[#121313] border border-[#2a2c2c] p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[#fca311] text-xs font-bold uppercase tracking-wider">
            <Trophy className="w-3.5 h-3.5" />
            <span>Gamification & Engagement</span>
          </div>
          <h1 className="font-display text-2xl sm:text-4xl font-bold text-white tracking-tight">
            Classement & Points d&apos;Activité
          </h1>
          <p className="text-[#aaa] text-xs sm:text-sm max-w-2xl leading-relaxed">
            L&apos;engagement fait la force du Club GI ENIT. Participez aux visites, assistez aux formations et contribuez aux projets pour gravir les échelons du classement !
          </p>
        </div>
      </div>
      
      <LeaderboardClient 
        initialLeaderboard={leaderboard as LeaderboardEntry[]} 
        currentUserId={userId || ''} 
      />
    </div>
  )
}