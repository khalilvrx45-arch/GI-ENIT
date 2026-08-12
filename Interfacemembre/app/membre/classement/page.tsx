import { createClient } from '@/lib/supabase/server'
import LeaderboardClient from '@/components/membre/leaderboard/LeaderboardClient'
import { Database } from '@/lib/supabase/database.types'

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
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Classement</h1>
        <p className="text-muted mt-1">L&apos;engagement fait la force du club. Voici les membres les plus actifs.</p>
      </div>
      
      <LeaderboardClient 
        initialLeaderboard={leaderboard as LeaderboardEntry[]} 
        currentUserId={userId || ''} 
      />
    </div>
  )
}