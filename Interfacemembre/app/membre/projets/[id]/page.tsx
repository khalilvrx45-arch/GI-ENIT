import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import KanbanBoard from '../../../../components/membre/projects/KanbanBoard'

type Project = {
  id: string
  title: string
  deadline: string | null
  lead_id: string | null
  poles: { name: string } | null
  profiles: { first_name: string | null; last_name: string | null } | null
}

type ProjectMember = {
  id: string
}

type ProjectTask = {
  id: string
  project_id: string
  title: string
  status: 'todo' | 'in_progress' | 'done'
  assignee_id: string | null
}

type ProjectMemberProfile = {
  profiles: { id: string; first_name: string | null; last_name: string | null }
}

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id

  const project = (await supabase
    .from('projects')
    .select('*, poles(name), profiles:lead_id(first_name, last_name)')
    .eq('id', params.id)
    .single()).data as Project | null

  if (!project) notFound()

  // Vérifier si l'user est membre
  const membership = (await supabase
    .from('project_members')
    .select('id')
    .eq('project_id', params.id)
    .eq('user_id', userId || '')
    .single()).data as ProjectMember | null

  const isMember = !!membership || project.lead_id === userId

  // Récupérer les tâches
  const tasks = ((await supabase
    .from('project_tasks')
    .select('*')
    .eq('project_id', params.id)
  ).data ?? []) as ProjectTask[]

  // Récupérer les membres du projet pour les avatars
  const members = ((await supabase
    .from('project_members')
    .select('profiles(id, first_name, last_name)')
    .eq('project_id', params.id)
  ).data ?? []) as ProjectMemberProfile[]

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs text-accent font-mono uppercase tracking-wider">
            {project.poles?.name || 'Projet'}
          </span>
          <h1 className="font-display text-3xl md:text-4xl font-bold mt-1">{project.title}</h1>
          <div className="flex items-center gap-4 mt-2 text-sm text-muted">
            <span>Responsable: {project.profiles?.first_name} {project.profiles?.last_name}</span>
            {project.deadline && <span className="font-mono">Échéance: {new Date(project.deadline).toLocaleDateString('fr-FR')}</span>}
          </div>
        </div>
        
        <div className="flex items-center -space-x-2">
          {members.map((m) => (
            <div key={m.profiles.id} className="w-8 h-8 rounded-full bg-card border-2 border-bg flex items-center justify-center text-xs font-bold">
              {(m.profiles.first_name?.[0] || '?')}{(m.profiles.last_name?.[0] || '?')}
            </div>
          ))}
        </div>
      </div>

      <KanbanBoard 
        projectId={params.id} 
        initialTasks={tasks || []} 
        isMember={isMember} 
      />
    </div>
  )
}