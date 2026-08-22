import { createClient } from '@/lib/supabase/server'
import AnnouncementFeed from '@/components/membre/announcements/AnnouncementFeed'

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
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Annonces</h1>
        <p className="text-muted mt-1">Les communications officielles du bureau et des pôles.</p>
      </div>
      <AnnouncementFeed initialAnnouncements={(announcements ?? []) as Announcement[]} />
    </div>
  )
}