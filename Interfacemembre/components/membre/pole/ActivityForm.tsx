'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Database } from '@/lib/supabase/database.types'

export default function ActivityForm({ poleId }: { poleId: string }) {
  const supabase = createClient()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    type: 'event' as Database['public']['Tables']['activities']['Row']['type'],
    description: '',
    location: '',
    date_start: '',
    capacity: '',
    prerequisites: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const { data, error: insertError } = await supabase
      .from('activities')
      .insert({
        title: formData.title,
        type: formData.type,
        description: formData.description || null,
        location: formData.location || null,
        date_start: new Date(formData.date_start).toISOString(),
        capacity: formData.capacity ? parseInt(formData.capacity) : null,
        prerequisites: formData.prerequisites || null,
        pole_id: poleId
      })
      .select('id, type')
      .single()

    const createdActivity = data as { id: string; type: 'event' | 'visit' | 'formation' } | null

    if (insertError) {
      setError("Erreur lors de la création. Vérifie les champs.")
      setIsLoading(false)
    } else {
      const path = createdActivity?.type === 'event' ? 'evenements' : createdActivity?.type === 'visit' ? 'visites' : 'formations'
      router.push(`/membre/${path}/${createdActivity?.id}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="panel-surface space-y-4 rounded-md p-6">
      <div>
        <label className="block text-xs font-mono uppercase tracking-wider text-muted mb-1.5">Titre</label>
        <input
          type="text"
          name="title"
          required
          value={formData.title}
          onChange={handleChange}
          className="w-full rounded-sm border border-card bg-bg px-3 py-2 text-base text-text outline-none transition-colors focus:border-accent"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-muted mb-1.5">Type</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full rounded-sm border border-card bg-bg px-3 py-2 text-base text-text outline-none transition-colors focus:border-accent"
          >
            <option value="event">Événement</option>
            <option value="visit">Visite</option>
            <option value="formation">Formation</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-muted mb-1.5">Capacité</label>
          <input
            type="number"
            name="capacity"
            min="1"
            value={formData.capacity}
            onChange={handleChange}
            className="w-full rounded-sm border border-card bg-bg px-3 py-2 text-base font-mono text-text outline-none transition-colors focus:border-accent"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-mono uppercase tracking-wider text-muted mb-1.5">Date & Heure</label>
        <input
          type="datetime-local"
          name="date_start"
          required
          value={formData.date_start}
          onChange={handleChange}
          className="w-full rounded-sm border border-card bg-bg px-3 py-2 text-base font-mono text-text outline-none transition-colors focus:border-accent"
        />
      </div>

      <div>
        <label className="block text-xs font-mono uppercase tracking-wider text-muted mb-1.5">Lieu</label>
        <input
          type="text"
          name="location"
          value={formData.location}
          onChange={handleChange}
          className="w-full rounded-sm border border-card bg-bg px-3 py-2 text-base text-text outline-none transition-colors focus:border-accent"
        />
      </div>

      <div>
        <label className="block text-xs font-mono uppercase tracking-wider text-muted mb-1.5">Description</label>
        <textarea
          name="description"
          rows={4}
          value={formData.description}
          onChange={handleChange}
          className="w-full resize-none rounded-sm border border-card bg-bg px-3 py-2 text-base text-text outline-none transition-colors focus:border-accent"
        />
      </div>

      <div>
        <label className="block text-xs font-mono uppercase tracking-wider text-muted mb-1.5">Prérequis (Visites uniquement)</label>
        <input
          type="text"
          name="prerequisites"
          value={formData.prerequisites}
          onChange={handleChange}
          placeholder="Ex: Carte étudiante, tenue obligatoire..."
          className="w-full rounded-sm border border-card bg-bg px-3 py-2 text-base text-text outline-none transition-colors focus:border-accent"
        />
      </div>

      {error && <p className="text-danger text-sm">{error}</p>}

      <button
        type="submit"
        disabled={isLoading}
        className="mt-4 w-full rounded-sm bg-gradient-gold py-3 font-medium text-bg transition-all hover:-translate-y-0.5 hover:shadow-gold-glow disabled:opacity-50"
      >
        {isLoading ? 'Création...' : 'Créer l\'activité'}
      </button>
    </form>
  )
}