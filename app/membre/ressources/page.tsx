import { createClient } from '@/lib/supabase/server'
import { Database } from '@/lib/supabase/database.types'
import { BookOpen, ExternalLink, Download, FileText, FolderOpen } from 'lucide-react'

type Resource = Database['public']['Tables']['resources']['Row'] & {
  poles: { name: string } | null
}

const CATEGORY_LABELS: Record<string, string> = {
  cours: 'Cours & Supports de Cours',
  examen: 'Examens & Épreuves Corrigées',
  devoir_surveille: 'Devoirs Surveillés (DS)',
  autre: 'Autres Ressources & Outils',
  Divers: 'Documents Divers',
}

export default async function RessourcesPage() {
  const supabase = await createClient()
  
  const { data: resources } = await supabase
    .from('resources')
    .select('*, poles(name)')
    .order('created_at', { ascending: false })

  const grouped = (resources as Resource[] || []).reduce((acc, res) => {
    const rawCat = res.category || 'autre'
    const cat = CATEGORY_LABELS[rawCat] || rawCat
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(res)
    return acc
  }, {} as Record<string, Resource[]>)

  return (
    <div className="space-y-10">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#181a1a] via-[#141515] to-[#121313] border border-[#2a2c2c] p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[#fca311] text-xs font-bold uppercase tracking-wider">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Pédagogie & Bibliothèque Numérique</span>
          </div>
          <h1 className="font-display text-2xl sm:text-4xl font-bold text-white tracking-tight">
            Ressources & Supports Académiques
          </h1>
          <p className="text-[#aaa] text-xs sm:text-sm max-w-2xl leading-relaxed">
            Accédez aux documents pédagogiques, devoirs surveillés, examens, fiches de révision et supports de cours partagés par les promotions du Génie Industriel.
          </p>
        </div>
      </div>

      {Object.entries(grouped).map(([categoryName, items]) => (
        <section key={categoryName} className="space-y-4">
          <div className="flex items-center gap-2 border-b border-[#2a2c2c] pb-3">
            <FolderOpen className="w-4 h-4 text-[#fca311]" />
            <h2 className="font-display text-lg font-bold text-white">{categoryName}</h2>
            <span className="text-xs text-[#888] font-mono">({items.length})</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map((res) => (
              <div 
                key={res.id} 
                className="bg-[#141515] border border-[#2a2c2c] hover:border-[#fca311]/40 rounded-3xl p-5 flex flex-col justify-between transition-all duration-300 shadow-lg group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-[#1e2020] border border-[#2a2c2c] flex items-center justify-center text-[#fca311] shrink-0 group-hover:scale-105 transition-transform">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white group-hover:text-[#fca311] transition-colors leading-snug">
                          {res.title}
                        </h3>
                        {res.poles && (
                          <span className="inline-block mt-0.5 text-[10px] text-[#fca311] font-mono bg-[#fca311]/10 px-2 py-0.5 rounded-md border border-[#fca311]/20">
                            Pôle {res.poles.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {res.description && (
                    <p className="text-xs text-[#888] mt-3 line-clamp-2 leading-relaxed">
                      {res.description}
                    </p>
                  )}
                </div>

                <div className="mt-5 pt-3.5 border-t border-[#2a2c2c]/80 flex items-center justify-between">
                  <span className="text-[11px] text-[#666] font-mono">
                    {new Date(res.created_at).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>

                  <div className="flex items-center gap-2">
                    {res.drive_url && (
                      <a
                        href={res.drive_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold text-xs transition-colors cursor-pointer"
                      >
                        <span>Drive</span>
                        <ExternalLink className="w-3 h-3 text-[#fca311]" />
                      </a>
                    )}

                    {res.file_url && (
                      <a
                        href={res.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#fca311] hover:bg-[#ffc887] text-black font-bold text-xs transition-colors shadow-sm cursor-pointer"
                      >
                        <span>Télécharger</span>
                        <Download className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      {Object.keys(grouped).length === 0 && (
        <div className="bg-[#141515] rounded-3xl border border-dashed border-[#2a2c2c] py-16 text-center space-y-3">
          <BookOpen className="w-10 h-10 text-[#444] mx-auto" />
          <p className="text-sm font-bold text-white">Aucune ressource disponible pour le moment</p>
          <p className="text-xs text-[#888]">Les cours, examens et devoirs surveillés apparaîtront ici.</p>
        </div>
      )}
    </div>
  )
}