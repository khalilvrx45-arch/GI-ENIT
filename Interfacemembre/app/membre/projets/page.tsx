import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import DimensionDivider from '@/components/membre/shared/DimensionDivider'

type ProjectSummary = {
  projects: {
    id: string
    title: string
    description: string | null
    progress: number
    status: string
    poles: { name: string } | null
  } | null
}

export default async function ProjetsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id

  const { data: projectMembers } = await supabase
    .from('project_members')
    .select('projects(id, title, description, progress, status, poles(name))')
    .eq('user_id', userId || '')
    .order('created_at', { ascending: false })

  const projects = (projectMembers ?? []) as ProjectSummary[]
  
  const activeProjects = projects.filter(p => p.projects && p.projects.status !== 'done')
  const completedProjects = projects.filter(p => p.projects && p.projects.status === 'done')

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Mes Projets</h1>
        <p className="text-muted mt-1">Suis l&apos;avancement des projets sur lesquels tu travailles.</p>
      </div>

      <section>
        <DimensionDivider label="Projets en cours" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {activeProjects.length > 0 ? (
            activeProjects.map(({ projects: p }) => p && (
              <Link 
                key={p.id} 
                href={`/membre/projets/${p.id}`}
                className="panel-surface panel-interactive group flex flex-col rounded-md p-5"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-display text-lg font-semibold group-hover:text-accent transition-colors">{p.title}</h3>
                  {p.poles && <span className="text-xs text-muted font-mono bg-bg px-2 py-1 rounded-sm border border-muted/20">{p.poles.name}</span>}
                </div>
                <p className="text-sm text-muted line-clamp-2 mb-4 flex-1">{p.description || 'Aucune description fournie.'}</p>
                <div className="mt-auto">
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-muted uppercase">{p.status}</span>
                    <span className="text-accent">{p.progress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-bg rounded-full overflow-hidden">
                    <div className="h-full bg-accent transition-all duration-500" style={{ width: `${p.progress}%` }} />
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <p className="panel-surface col-span-full rounded-md border border-dashed border-muted/30 p-6 text-center text-sm text-muted">
              Tu ne participes à aucun projet actif pour le moment.
            </p>
          )}
        </div>
      </section>

      {completedProjects.length > 0 && (
        <section>
          <DimensionDivider label="Projets terminés" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 opacity-75">
            {completedProjects.map(({ projects: p }) => p && (
              <Link 
                key={p.id} 
                href={`/membre/projets/${p.id}`}
                className="bg-bg border border-muted/10 hover:border-success/30 transition-colors p-5 rounded-md flex flex-col group"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-display text-lg font-medium text-muted group-hover:text-success transition-colors">{p.title}</h3>
                  {p.poles && <span className="text-[10px] text-muted font-mono uppercase">{p.poles.name}</span>}
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-success"></div>
                  <span className="text-xs text-success font-mono uppercase tracking-wider">Terminé</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
