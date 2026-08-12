import { createClient } from '@/lib/supabase/server'
import { Database } from '@/lib/supabase/database.types'
import Link from 'next/link'
import { formatActivityDate, getActivityTypeLabel } from '@/lib/utils'
import AnimatedPoints from '@/components/membre/dashboard/AnimatedPoints'
import AnimatedAnnouncementList from '@/components/membre/dashboard/AnimatedAnnouncementList'

type Activity = Database['public']['Tables']['activities']['Row']

type Announcement = {
  id: string
  title: string
  excerpt: string | null
  created_at: string
}

type RankData = {
  rank: number
  points_total: number
}

type UpcomingRegistration = {
  activities: Activity | null
  status: 'confirmed' | 'waitlisted'
}

type ProjectSummary = {
  projects: {
    id: string
    title: string
    progress: number
    status: string
    poles: { name: string } | null
  } | null
}

function DimensionDivider({ label }: { label?: string }) {
  return (
    <div className="relative flex items-center py-4 my-2">
      <div className="flex-1 h-px bg-muted/20"></div>
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-px h-2 bg-muted/40"></div>
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-2 bg-muted/40"></div>
      {label && (
        <span className="px-3 text-xs font-mono uppercase tracking-widest text-muted bg-bg">
          {label}
        </span>
      )}
      <div className="flex-1 h-px bg-muted/20"></div>
    </div>
  )
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id

  if (!userId) return null

  const inSevenDays = new Date()
  inSevenDays.setDate(inSevenDays.getDate() + 7)

  const [
    rankRes,
    membersRes,
    upcomingRegsRes,
    activeProjectsRes,
    announcementsRes,
    agendaRes
  ] = await Promise.all([
    supabase.from('leaderboard').select('rank, points_total').eq('user_id', userId).single(),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('event_registrations').select('activities(*), status').eq('user_id', userId).in('status', ['confirmed', 'waitlisted']).gt('activities.date_start', new Date().toISOString()).order('activities.date_start', { ascending: true }).limit(2),
    supabase.from('project_members').select('projects(id, title, progress, status, poles(name))').eq('user_id', userId).neq('projects.status', 'done').limit(3),
    supabase.from('announcements').select('id, title, excerpt, created_at').order('created_at', { ascending: false }).limit(3),
    supabase.from('activities').select('id, title, type, date_start').gt('date_start', new Date().toISOString()).lt('date_start', inSevenDays.toISOString()).order('date_start', { ascending: true })
  ])

  const rankData = (rankRes.data ?? null) as RankData | null
  const totalMembers = membersRes.count ?? 0
  
  const upcomingRegs = (upcomingRegsRes.data ?? []) as UpcomingRegistration[]
  const nextEvent = upcomingRegs.find(r => r.activities?.type === 'event')?.activities
  const nextFormation = upcomingRegs.find(r => r.activities?.type === 'formation')?.activities
  
  const activeProjects = (activeProjectsRes.data ?? []) as ProjectSummary[]
  const announcements = (announcementsRes.data ?? []) as Announcement[]
  const agenda = (agendaRes.data ?? []) as Activity[]

  return (
    <div className="space-y-8">
      <section className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Tableau de bord</h1>
          <p className="text-muted mt-1">Bienvenue, voici l&apos;activité du club en temps réel.</p>
        </div>
        <div className="panel-surface flex items-end gap-6 rounded-md p-4">
          <div>
            <p className="text-xs text-muted font-mono uppercase tracking-wider mb-1">Points</p>
            <AnimatedPoints points={rankData?.points_total || 0} />
          </div>
          <div className="h-12 w-px bg-muted/20" />
          <div>
            <p className="text-xs text-muted font-mono uppercase tracking-wider mb-1">Rang</p>
            <p className="font-mono text-2xl font-bold text-text">
              {rankData?.rank || '-'}<span className="text-muted text-sm font-body">e / {totalMembers}</span>
            </p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="panel-surface panel-interactive flex flex-col rounded-md p-4">
          <span className="text-xs text-steel font-mono uppercase tracking-wider mb-2">Prochain Événement</span>
          {nextEvent ? (
            <>
              <h3 className="font-display text-lg font-semibold flex-1">{nextEvent.title}</h3>
              <p className="text-sm text-muted font-mono mt-2">{formatActivityDate(nextEvent.date_start)}</p>
              <Link href={`/membre/evenements/${nextEvent.id}`} className="text-sm text-steel hover:underline mt-3 inline-block">
                Voir le détail →
              </Link>
            </>
          ) : (
            <p className="text-sm text-muted py-4">Aucun événement à venir. Inscris-toi vite !</p>
          )}
        </div>

        <div className="panel-surface panel-interactive flex flex-col rounded-md p-4">
          <span className="text-xs text-success font-mono uppercase tracking-wider mb-2">Prochaine Formation</span>
          {nextFormation ? (
            <>
              <h3 className="font-display text-lg font-semibold flex-1">{nextFormation.title}</h3>
              <p className="text-sm text-muted font-mono mt-2">{formatActivityDate(nextFormation.date_start)}</p>
              <Link href={`/membre/formations/${nextFormation.id}`} className="text-sm text-success hover:underline mt-3 inline-block">
                Voir le détail →
              </Link>
            </>
          ) : (
            <p className="text-sm text-muted py-4">Pas de formation planifiée pour toi.</p>
          )}
        </div>

        <div className="panel-surface panel-interactive flex flex-col rounded-md p-4">
          <span className="text-xs text-accent font-mono uppercase tracking-wider mb-2">Projets Actifs</span>
          {activeProjects.length > 0 ? (
            <ul className="space-y-2 flex-1">
              {activeProjects.map(({ projects: p }) => (
                <li key={p?.id}>
                  <Link href={`/membre/projets/${p?.id}`} className="block hover:bg-bg/50 p-2 rounded-sm transition-colors">
                    <p className="font-medium text-sm text-text">{p?.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1 bg-bg rounded-full overflow-hidden">
                        <div className="h-full bg-accent" style={{ width: `${p?.progress || 0}%` }} />
                      </div>
                      <span className="text-xs font-mono text-muted">{p?.progress || 0}%</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted py-4">Tu ne fais partie d&apos;aucun projet pour le moment.</p>
          )}
        </div>
      </section>

      <DimensionDivider label="Activité Récente" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="font-display text-xl font-bold">Dernières Annonces</h2>
          {announcements.length > 0 ? (
            <AnimatedAnnouncementList announcements={announcements} />
          ) : (
            <p className="text-muted text-sm">Aucune annonce du bureau pour le moment.</p>
          )}
        </div>

        <div className="space-y-4">
          <h2 className="font-display text-xl font-bold">7 Prochains Jours</h2>
          <div className="panel-surface space-y-3 rounded-md p-4">
            {agenda.length > 0 ? (
              agenda.map((act) => (
                <Link 
                  key={act.id} 
                  href={`/membre/${act.type === 'event' ? 'evenements' : act.type === 'visit' ? 'visites' : 'formations'}/${act.id}`}
                  className="flex items-center gap-3 group"
                >
                  <div className="flex flex-col items-center justify-center w-10 h-10 bg-bg rounded-sm border border-muted/20 shrink-0">
                    <span className="text-[10px] uppercase text-muted font-mono">
                      {new Date(act.date_start).toLocaleDateString('fr-FR', { month: 'short' })}
                    </span>
                    <span className="text-sm font-bold text-text leading-none">
                      {new Date(act.date_start).getDate()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text group-hover:text-accent truncate transition-colors">
                      {act.title}
                    </p>
                    <p className="text-xs text-muted font-mono">
                      {getActivityTypeLabel(act.type)} - {new Date(act.date_start).getHours()}h{new Date(act.date_start).getMinutes().toString().padStart(2, '0')}
                    </p>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-muted text-sm text-center py-4">Agenda vide pour cette semaine.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}