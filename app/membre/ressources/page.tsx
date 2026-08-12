import { createClient } from '@/lib/supabase/server'
import { Database } from '@/lib/supabase/database.types'
import DimensionDivider from '@/components/membre/shared/DimensionDivider'

type Resource = Database['public']['Tables']['resources']['Row'] & {
  poles: { name: string } | null
}

export default async function RessourcesPage() {
  const supabase = await createClient()
  
  // RLS s'assure qu'on ne récupère que les ressources du pôle du user si pole_id est non null
  const { data: resources } = await supabase
    .from('resources')
    .select('*, poles(name)')
    .order('category', { ascending: true })

  const grouped = (resources as Resource[] || []).reduce((acc, res) => {
    const cat = res.category || 'Divers'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(res)
    return acc
  }, {} as Record<string, Resource[]>)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Ressources</h1>
        <p className="text-muted mt-1">Documents, templates et supports du club.</p>
      </div>

      {Object.entries(grouped).map(([cat, items]) => (
        <section key={cat}>
          <DimensionDivider label={cat} />
          <div className="mt-4 space-y-2">
            {items.map(res => (
              <a 
                key={res.id} 
                href={res.file_url} 
                target="_blank" 
                rel="noreferrer"
                className="panel-surface panel-interactive group flex items-center gap-4 rounded-md p-3"
              >
                <div className="w-10 h-10 bg-bg flex items-center justify-center rounded-sm border border-muted/20">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-steel">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text group-hover:text-steel transition-colors truncate">{res.title}</p>
                  {res.poles && <p className="text-xs text-accent font-mono mt-0.5">Pôle {res.poles.name}</p>}
                </div>
                <span className="text-xs text-muted group-hover:text-steel transition-colors">Télécharger ↓</span>
              </a>
            ))}
          </div>
        </section>
      ))}

      {Object.keys(grouped).length === 0 && (
        <div className="panel-surface rounded-md border border-dashed border-muted/30 py-16 text-center">
          <p className="text-muted">Aucune ressource disponible pour le moment.</p>
        </div>
      )}
    </div>
  )
}