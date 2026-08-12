'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Calendar, Users, CheckCircle, Clock, Trash2, Edit3, Shield, FolderGit2 } from 'lucide-react'

type Pole = { id: string; name: string; slug: string }

type MemberProfile = {
  id: string
  first_name: string | null
  last_name: string | null
  role: string
  pole_id: string | null
  avatar_url: string | null
}

type ProjectMember = {
  user_id: string
  profiles: MemberProfile | null
}

type Project = {
  id: string
  title: string
  description: string | null
  status: 'planned' | 'in_progress' | 'done'
  progress: number
  deadline: string | null
  pole_id: string | null
  lead_id: string | null
  poles: Pole | null
  lead: MemberProfile | null
  project_members: ProjectMember[]
}

export default function ProjectManager() {
  const [projects, setProjects] = useState<Project[]>([])
  const [poles, setPoles] = useState<Pole[]>([])
  const [profiles, setProfiles] = useState<MemberProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Form Fields
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [poleId, setPoleId] = useState('')
  const [leadId, setLeadId] = useState('')
  const [deadline, setDeadline] = useState('')
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([])
  const [memberSearch, setMemberSearch] = useState('')

  // Fetch Projects Data
  const fetchProjects = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/projects')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur lors du chargement')
      setProjects(data.projects || [])
      setPoles(data.poles || [])
      setProfiles(data.profiles || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  // Open Modal for Create or Edit
  const handleOpenModal = (project?: Project) => {
    if (project) {
      setEditingProject(project)
      setTitle(project.title)
      setDescription(project.description || '')
      setPoleId(project.pole_id || '')
      setLeadId(project.lead_id || '')
      setDeadline(project.deadline ? project.deadline.split('T')[0] : '')
      setSelectedMemberIds(project.project_members?.map((pm) => pm.user_id) || [])
    } else {
      setEditingProject(null)
      setTitle('')
      setDescription('')
      setPoleId('')
      setLeadId('')
      setDeadline('')
      setSelectedMemberIds([])
    }
    setMemberSearch('')
    setIsModalOpen(true)
  }

  const handleToggleMember = (id: string) => {
    setSelectedMemberIds((prev) =>
      prev.includes(id) ? prev.filter((mId) => mId !== id) : [...prev, id]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setSubmitting(true)
    setError(null)

    try {
      const payload = {
        id: editingProject?.id,
        title,
        description,
        pole_id: poleId || null,
        lead_id: leadId || null,
        deadline: deadline ? new Date(deadline).toISOString() : null,
        member_ids: selectedMemberIds,
      }

      const res = await fetch('/api/admin/projects', {
        method: editingProject ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur lors de l’enregistrement')

      setIsModalOpen(false)
      fetchProjects()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleStatusToggle = async (project: Project, newStatus: 'planned' | 'in_progress' | 'done') => {
    try {
      const progressValue = newStatus === 'done' ? 100 : newStatus === 'in_progress' ? 50 : 0
      const res = await fetch('/api/admin/projects', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: project.id, status: newStatus, progress: progressValue }),
      })
      if (res.ok) fetchProjects()
    } catch (err) {
      console.error('Failed to update status', err)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Voulez-vous vraiment supprimer ce projet ?')) return
    try {
      const res = await fetch(`/api/admin/projects?id=${id}`, { method: 'DELETE' })
      if (res.ok) fetchProjects()
    } catch (err) {
      console.error('Failed to delete project', err)
    }
  }

  const filteredProjects = projects.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.poles?.name.toLowerCase().includes(search.toLowerCase())
  )

  const filteredProfiles = profiles.filter((prof) =>
    `${prof.first_name} ${prof.last_name}`.toLowerCase().includes(memberSearch.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold flex items-center gap-2">
            <FolderGit2 className="w-6 h-6 text-accent" />
            Gestion des Projets
          </h2>
          <p className="text-muted text-sm mt-0.5">
            Crée des projets, assigne les membres de l'équipe et suis l'avancement.
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="btn-accent flex items-center gap-2 px-4 py-2.5 rounded-md font-medium text-sm text-bg bg-accent hover:bg-accent/90 transition-all shadow-md shrink-0"
        >
          <Plus className="w-4 h-4" />
          Nouveau Projet
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3 w-4 h-4 text-muted" />
        <input
          type="text"
          placeholder="Rechercher un projet ou un pôle..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-bg/80 border border-muted/20 rounded-md text-sm text-text focus:outline-none focus:border-accent transition-colors"
        />
      </div>

      {error && (
        <div className="p-4 bg-danger/10 border border-danger/30 rounded-md text-danger text-sm">
          {error}
        </div>
      )}

      {/* Projects List */}
      {loading ? (
        <div className="panel-surface p-12 text-center text-muted text-sm animate-pulse">
          Chargement des projets...
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="panel-surface p-12 text-center text-muted text-sm rounded-md">
          Aucun projet trouvé. Clique sur "+ Nouveau Projet" pour en créer un.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProjects.map((project) => {
            const memberCount = project.project_members?.length || 0
            return (
              <div
                key={project.id}
                className="panel-surface panel-interactive p-5 rounded-md flex flex-col justify-between space-y-4 border border-muted/10 hover:border-accent/30 transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-accent/10 text-accent uppercase tracking-wider">
                        {project.poles?.name || 'Général'}
                      </span>
                      <h3 className="font-display font-bold text-lg text-text mt-1.5">{project.title}</h3>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleOpenModal(project)}
                        className="p-1.5 rounded text-muted hover:text-accent hover:bg-bg/50 transition-colors"
                        title="Modifier"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(project.id)}
                        className="p-1.5 rounded text-muted hover:text-danger hover:bg-bg/50 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {project.description && (
                    <p className="text-sm text-muted mt-2 line-clamp-2">{project.description}</p>
                  )}
                </div>

                {/* Status & Progress Bar */}
                <div className="space-y-2 pt-2 border-t border-muted/10">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted">Progression</span>
                    <span className="font-mono font-bold text-accent">{project.progress}%</span>
                  </div>
                  <div className="h-2 w-full bg-bg rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent transition-all duration-300 rounded-full"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>

                {/* Team & Deadline Info */}
                <div className="flex items-center justify-between text-xs text-muted pt-2 border-t border-muted/10">
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-accent" />
                    <span>{memberCount} membre{memberCount > 1 ? 's' : ''} assigné{memberCount > 1 ? 's' : ''}</span>
                  </div>

                  {project.deadline && (
                    <div className="flex items-center gap-1.5 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-muted" />
                      <span>{new Date(project.deadline).toLocaleDateString('fr-FR')}</span>
                    </div>
                  )}
                </div>

                {/* Status Selector */}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-muted font-medium">Statut:</span>
                  <div className="flex items-center gap-1 bg-bg p-1 rounded-md border border-muted/10">
                    <button
                      onClick={() => handleStatusToggle(project, 'planned')}
                      className={`px-2 py-1 text-xs font-mono rounded transition-colors ${
                        project.status === 'planned' ? 'bg-accent/20 text-accent font-bold' : 'text-muted hover:text-text'
                      }`}
                    >
                      Planifié
                    </button>
                    <button
                      onClick={() => handleStatusToggle(project, 'in_progress')}
                      className={`px-2 py-1 text-xs font-mono rounded transition-colors ${
                        project.status === 'in_progress' ? 'bg-accent/20 text-accent font-bold' : 'text-muted hover:text-text'
                      }`}
                    >
                      En cours
                    </button>
                    <button
                      onClick={() => handleStatusToggle(project, 'done')}
                      className={`px-2 py-1 text-xs font-mono rounded transition-colors ${
                        project.status === 'done' ? 'bg-success/20 text-success font-bold' : 'text-muted hover:text-text'
                      }`}
                    >
                      Terminé
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="panel-surface w-full max-w-xl rounded-lg p-6 space-y-6 max-h-[90vh] overflow-y-auto border border-muted/20 shadow-2xl">
            <div className="flex items-center justify-between border-b border-muted/10 pb-4">
              <h3 className="font-display font-bold text-xl text-text">
                {editingProject ? 'Modifier le projet' : 'Nouveau Projet'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-muted hover:text-text text-xl font-bold px-2"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-mono uppercase text-muted mb-1">Titre du Projet *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="ex: Développement Plateforme Web"
                  className="w-full px-3.5 py-2 bg-bg border border-muted/20 rounded-md text-sm text-text focus:outline-none focus:border-accent"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-mono uppercase text-muted mb-1">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Objectifs, livrables et consignes..."
                  className="w-full px-3.5 py-2 bg-bg border border-muted/20 rounded-md text-sm text-text focus:outline-none focus:border-accent"
                />
              </div>

              {/* Grid: Pole & Lead */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-muted mb-1">Pôle Associé</label>
                  <select
                    value={poleId}
                    onChange={(e) => setPoleId(e.target.value)}
                    className="w-full px-3.5 py-2 bg-bg border border-muted/20 rounded-md text-sm text-text focus:outline-none focus:border-accent"
                  >
                    <option value="">-- Aucun / Général --</option>
                    {poles.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-muted mb-1">Responsable Projet (Lead)</label>
                  <select
                    value={leadId}
                    onChange={(e) => setLeadId(e.target.value)}
                    className="w-full px-3.5 py-2 bg-bg border border-muted/20 rounded-md text-sm text-text focus:outline-none focus:border-accent"
                  >
                    <option value="">-- Sélectionner un lead --</option>
                    {profiles.map((prof) => (
                      <option key={prof.id} value={prof.id}>
                        {prof.first_name} {prof.last_name} ({prof.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Deadline */}
              <div>
                <label className="block text-xs font-mono uppercase text-muted mb-1">Date Limite (Deadline)</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-3.5 py-2 bg-bg border border-muted/20 rounded-md text-sm text-text focus:outline-none focus:border-accent"
                />
              </div>

              {/* Member Selection Checklist */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-mono uppercase text-muted">Membres de l'Équipe ({selectedMemberIds.length} sélectionnés)</label>
                </div>

                <input
                  type="text"
                  placeholder="Filtrer les membres par nom..."
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  className="w-full px-3 py-1.5 bg-bg border border-muted/20 rounded-md text-xs text-text mb-2 focus:outline-none focus:border-accent"
                />

                <div className="max-h-44 overflow-y-auto space-y-1.5 border border-muted/20 bg-bg/50 p-2.5 rounded-md">
                  {filteredProfiles.map((prof) => {
                    const isSelected = selectedMemberIds.includes(prof.id)
                    return (
                      <label
                        key={prof.id}
                        onClick={() => handleToggleMember(prof.id)}
                        className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors text-xs ${
                          isSelected ? 'bg-accent/20 border border-accent/30 text-text' : 'hover:bg-bg text-muted'
                        }`}
                      >
                        <span className="font-medium">
                          {prof.first_name} {prof.last_name}
                        </span>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="accent-accent"
                        />
                      </label>
                    )
                  })}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-muted/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-md text-sm font-medium text-muted hover:text-text transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-md text-sm font-medium bg-accent text-bg hover:bg-accent/90 transition-all shadow-md disabled:opacity-50"
                >
                  {submitting ? 'Enregistrement...' : editingProject ? 'Mettre à jour' : 'Créer le projet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
