import { createClient } from '@/lib/supabase/server'
import AnnouncementFeed from '@/components/membre/announcements/AnnouncementFeed'
import { Megaphone } from 'lucide-react'

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

export default async function AnnoncesPage() {
  const supabase = await createClient()
  const { data: announcements } = await supabase
    .from('announcements')
    .select('*, poles(name)')
    .order('pinned', { ascending: false })
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#181a1a] via-[#141515] to-[#121313] border border-[#2a2c2c] p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[#fca311] text-xs font-bold uppercase tracking-wider">
            <Megaphone className="w-3.5 h-3.5" />
            <span>Communications Officielles</span>
          </div>
          <h1 className="font-display text-2xl sm:text-4xl font-bold text-white tracking-tight">
            Annonces & Nouvelles du Club
          </h1>
          <p className="text-[#aaa] text-xs sm:text-sm max-w-2xl leading-relaxed">
            Consultez les informations importantes émises par le Bureau exécutif et les responsables de pôles.
          </p>
        </div>
      </div>

      <AnnouncementFeed initialAnnouncements={(announcements ?? []) as Announcement[]} />
    </div>
  )
}