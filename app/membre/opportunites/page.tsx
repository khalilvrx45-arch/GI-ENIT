import { createClient } from "@/lib/supabase/server";
import {
  Briefcase,
  Building,
  MapPin,
  Calendar,
  ExternalLink,
  Mail,
  Sparkles,
  ArrowRight,
  Filter,
  CheckCircle2,
} from "lucide-react";

type Opportunity = {
  id: string;
  title: string;
  company: string;
  type: "stage_pfe" | "stage_ete" | "stage_ouvrier" | "emploi" | "autre";
  location: string | null;
  description: string | null;
  requirements: string | null;
  deadline: string | null;
  contact_email: string | null;
  apply_url: string | null;
  created_at: string;
};

const TYPE_BADGES: Record<string, { label: string; bg: string; text: string; border: string }> = {
  stage_pfe: { label: "Stage PFE", bg: "bg-purple-500/15", text: "text-purple-300", border: "border-purple-500/30" },
  stage_ete: { label: "Stage d'Été", bg: "bg-emerald-500/15", text: "text-emerald-300", border: "border-emerald-500/30" },
  stage_ouvrier: { label: "Stage Ouvrier", bg: "bg-amber-500/15", text: "text-amber-300", border: "border-amber-500/30" },
  emploi: { label: "Offre d'Emploi", bg: "bg-blue-500/15", text: "text-blue-300", border: "border-blue-500/30" },
  autre: { label: "Opportunité", bg: "bg-gray-500/15", text: "text-gray-300", border: "border-gray-500/30" },
};

export default async function OpportunitiesPage() {
  const supabase = await createClient();

  const { data: opportunities } = await (supabase as any)
    .from("opportunities")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  const opps: Opportunity[] = (opportunities || []) as Opportunity[];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-custom-amber" />
          <span className="text-xs text-custom-amber font-mono uppercase tracking-wider">
            Réseau & Carrière GI
          </span>
        </div>
        <h1 className="font-display text-3xl md:text-4xl font-bold mt-1 text-white">
          Stages & Opportunités Professionnelles
        </h1>
        <p className="text-[#aaa] text-sm mt-1">
          Offres exclusives de stages PFE, stages d&apos;été et opportunités de carrière partagées par nos partenaires et le réseau des Alumni.
        </p>
      </div>

      {/* Grid of opportunities */}
      {opps.length === 0 ? (
        <div className="bg-[#141515] border border-[#2a2c2c] rounded-3xl p-12 text-center text-[#888] space-y-3">
          <Briefcase className="w-10 h-10 text-[#444] mx-auto" />
          <h3 className="text-base font-bold text-white">Aucune offre disponible actuellement</h3>
          <p className="text-xs text-[#aaa]">
            Revenez bientôt ou surveillez vos notifications pour les prochaines publications de stages !
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {opps.map((opp) => {
            const badge = TYPE_BADGES[opp.type] || TYPE_BADGES.autre;
            return (
              <div
                key={opp.id}
                className="bg-[#141515] border border-[#2a2c2c] hover:border-custom-amber/40 rounded-3xl p-6 flex flex-col justify-between space-y-5 transition-all shadow-xl group relative overflow-hidden"
              >
                {/* Subtle top corner gradient */}
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-custom-amber/5 blur-[50px] pointer-events-none" />

                <div className="space-y-4">
                  {/* Company & Type */}
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <span className="text-xs font-bold text-custom-amber flex items-center gap-1.5 bg-custom-amber/10 border border-custom-amber/20 px-3 py-1 rounded-xl">
                      <Building className="w-3.5 h-3.5" />
                      {opp.company}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full border ${badge.bg} ${badge.text} ${badge.border}`}
                    >
                      {badge.label}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-display text-lg font-bold text-white group-hover:text-custom-amber transition-colors line-clamp-2 leading-snug">
                    {opp.title}
                  </h3>

                  {/* Description */}
                  {opp.description && (
                    <p className="text-xs text-[#aaa] line-clamp-3 leading-relaxed">
                      {opp.description}
                    </p>
                  )}

                  {/* Requirements pill */}
                  {opp.requirements && (
                    <div className="p-2.5 rounded-xl bg-[#1e2020] border border-[#333535] text-[11px] text-[#ccc]">
                      <span className="text-custom-amber font-mono font-bold block mb-0.5 text-[10px] uppercase">
                        Profil recherché :
                      </span>
                      <span className="line-clamp-2">{opp.requirements}</span>
                    </div>
                  )}

                  {/* Meta: Location & Deadline */}
                  <div className="space-y-1.5 text-xs text-[#888] font-mono pt-1">
                    {opp.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-custom-amber shrink-0" />
                        <span className="truncate">{opp.location}</span>
                      </div>
                    )}
                    {opp.deadline && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Date limite : {new Date(opp.deadline).toLocaleDateString("fr-FR")}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Apply Button */}
                <div className="pt-4 border-t border-[#2a2c2c] flex items-center gap-2">
                  {opp.apply_url ? (
                    <a
                      href={opp.apply_url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 py-3 px-4 rounded-2xl bg-custom-amber hover:bg-[#ffc887] text-black font-extrabold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(252,163,17,0.25)] hover:shadow-[0_0_25px_rgba(252,163,17,0.45)] text-center cursor-pointer transform hover:-translate-y-0.5"
                    >
                      <span>Postuler</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : opp.contact_email ? (
                    <a
                      href={`mailto:${opp.contact_email}?subject=Candidature - ${encodeURIComponent(opp.title)}`}
                      className="flex-1 py-3 px-4 rounded-2xl bg-custom-amber hover:bg-[#ffc887] text-black font-extrabold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 text-center cursor-pointer"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Envoyer CV par Email</span>
                    </a>
                  ) : (
                    <div className="flex-1 py-2.5 text-center text-xs text-[#888] italic font-mono">
                      Contact via le club GI
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
