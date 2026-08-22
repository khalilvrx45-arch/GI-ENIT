"use client";

import React, { useState, useEffect } from "react";
import {
  Briefcase,
  Plus,
  Search,
  Building,
  MapPin,
  Calendar,
  ExternalLink,
  Mail,
  Edit2,
  Trash2,
  Loader2,
  X,
  Sparkles,
  CheckCircle2,
  Eye,
  Clock,
  Layers,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface OpportunityRecord {
  id: string;
  title: string;
  company: string;
  type: "stage_pfe" | "stage_ete" | "stage_ouvrier" | "emploi" | "autre";
  location?: string | null;
  description?: string | null;
  requirements?: string | null;
  deadline?: string | null;
  contact_email?: string | null;
  apply_url?: string | null;
  is_active: boolean;
  created_at: string;
}

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  stage_pfe: { label: "Stage PFE", color: "bg-purple-500/20 text-purple-300 border-purple-500/30" },
  stage_ete: { label: "Stage d'Été", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
  stage_ouvrier: { label: "Stage Ouvrier", color: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
  emploi: { label: "Offre d'Emploi / CDI", color: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
  autre: { label: "Opportunité", color: "bg-gray-500/20 text-gray-300 border-gray-500/30" },
};

export default function OpportunitiesManager({
  onShowToast,
}: {
  onShowToast: (type: "success" | "error" | "info", msg: string) => void;
}) {
  const [opportunities, setOpportunities] = useState<OpportunityRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOpp, setEditingOpp] = useState<OpportunityRecord | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [type, setType] = useState<string>("stage_pfe");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [deadline, setDeadline] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [applyUrl, setApplyUrl] = useState("");
  const [isActive, setIsActive] = useState(true);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/opportunities");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur chargement des opportunités");
      setOpportunities(data.opportunities || []);
    } catch (err: any) {
      onShowToast("error", err.message || "Erreur lors du chargement.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const openCreateModal = () => {
    setEditingOpp(null);
    setTitle("");
    setCompany("");
    setType("stage_pfe");
    setLocation("");
    setDescription("");
    setRequirements("");
    setDeadline("");
    setContactEmail("");
    setApplyUrl("");
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (opp: OpportunityRecord) => {
    setEditingOpp(opp);
    setTitle(opp.title);
    setCompany(opp.company);
    setType(opp.type);
    setLocation(opp.location || "");
    setDescription(opp.description || "");
    setRequirements(opp.requirements || "");
    setDeadline(opp.deadline ? opp.deadline.split("T")[0] : "");
    setContactEmail(opp.contact_email || "");
    setApplyUrl(opp.apply_url || "");
    setIsActive(opp.is_active);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !company.trim()) {
      onShowToast("error", "Le titre et le nom de l'entreprise sont obligatoires.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        id: editingOpp?.id,
        title: title.trim(),
        company: company.trim(),
        type,
        location: location.trim() || null,
        description: description.trim() || null,
        requirements: requirements.trim() || null,
        deadline: deadline || null,
        contact_email: contactEmail.trim() || null,
        apply_url: applyUrl.trim() || null,
        is_active: isActive,
      };

      const res = await fetch("/api/admin/opportunities", {
        method: editingOpp ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur lors de l'enregistrement.");

      onShowToast(
        "success",
        editingOpp ? "Opportunité modifiée avec succès !" : "Nouvelle opportunité publiée !"
      );
      setIsModalOpen(false);
      fetchOpportunities();
    } catch (err: any) {
      onShowToast("error", err.message || "Impossible d'enregistrer.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, oppTitle: string) => {
    if (!confirm(`Supprimer définitivement l'offre "${oppTitle}" ?`)) return;
    try {
      const res = await fetch(`/api/admin/opportunities?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur suppression.");

      onShowToast("success", "Offre supprimée.");
      setOpportunities((prev) => prev.filter((o) => o.id !== id));
    } catch (err: any) {
      onShowToast("error", err.message || "Erreur lors de la suppression.");
    }
  };

  const toggleActive = async (opp: OpportunityRecord) => {
    try {
      const res = await fetch("/api/admin/opportunities", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: opp.id, is_active: !opp.is_active }),
      });
      if (!res.ok) throw new Error("Erreur mise à jour.");
      setOpportunities((prev) =>
        prev.map((o) => (o.id === opp.id ? { ...o, is_active: !opp.is_active } : o))
      );
      onShowToast("info", !opp.is_active ? "Offre activée." : "Offre archivée.");
    } catch (err: any) {
      onShowToast("error", err.message);
    }
  };

  const filteredOpportunities = opportunities.filter((o) => {
    const matchesSearch =
      o.title.toLowerCase().includes(search.toLowerCase()) ||
      o.company.toLowerCase().includes(search.toLowerCase()) ||
      (o.location && o.location.toLowerCase().includes(search.toLowerCase()));

    if (filterType === "all") return matchesSearch;
    return matchesSearch && o.type === filterType;
  });

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-white flex items-center gap-2.5">
            <Briefcase className="w-6 h-6 text-custom-amber" />
            <span>Hub d&apos;Opportunités & Offres de Stages</span>
          </h2>
          <p className="text-[#888] text-sm mt-0.5">
            Diffusez des stages PFE, stages d&apos;été et opportunités professionnelles exclusives aux adhérents.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-black bg-custom-amber hover:bg-[#ffc887] transition-all shadow-[0_0_20px_rgba(252,163,17,0.3)] hover:shadow-[0_0_25px_rgba(252,163,17,0.5)] shrink-0 cursor-pointer transform hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" />
          <span>Nouvelle Offre / Stage</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-[#777]" />
          <input
            type="text"
            placeholder="Rechercher par titre, entreprise, ville..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#141515] border border-[#2a2c2c] rounded-xl text-sm text-white focus:outline-none focus:border-custom-amber transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "all", label: "Toutes" },
            { id: "stage_pfe", label: "PFE" },
            { id: "stage_ete", label: "Été" },
            { id: "stage_ouvrier", label: "Ouvrier" },
            { id: "emploi", label: "Emploi" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                filterType === tab.id
                  ? "bg-custom-amber/20 text-custom-amber border border-custom-amber/40 font-bold"
                  : "bg-[#141515] text-[#888] border border-[#2a2c2c] hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Opportunities List */}
      {loading ? (
        <div className="bg-[#141515] border border-[#2a2c2c] rounded-2xl p-12 text-center text-[#888] text-sm flex items-center justify-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-custom-amber" />
          <span>Chargement des opportunités...</span>
        </div>
      ) : filteredOpportunities.length === 0 ? (
        <div className="bg-[#141515] border border-[#2a2c2c] rounded-2xl p-12 text-center text-[#888] text-sm space-y-3">
          <Briefcase className="w-8 h-8 text-[#555] mx-auto" />
          <p>Aucune opportunité trouvée. Cliquez sur &quot;Nouvelle Offre / Stage&quot; pour en ajouter une.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredOpportunities.map((opp) => {
            const badge = TYPE_LABELS[opp.type] || TYPE_LABELS.autre;
            return (
              <div
                key={opp.id}
                className={`bg-[#141515] border ${
                  opp.is_active ? "border-[#2a2c2c] hover:border-custom-amber/40" : "border-red-500/20 opacity-60"
                } rounded-2xl p-5 flex flex-col justify-between space-y-4 transition-all group shadow-lg`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full border ${badge.color}`}>
                          {badge.label}
                        </span>
                        <span className="text-xs text-custom-amber font-semibold flex items-center gap-1">
                          <Building className="w-3.5 h-3.5" />
                          {opp.company}
                        </span>
                      </div>
                      <h3 className="font-display font-bold text-base text-white mt-2 group-hover:text-custom-amber transition-colors line-clamp-2">
                        {opp.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => openEditModal(opp)}
                        className="p-1.5 rounded-lg text-[#888] hover:text-white hover:bg-white/10 transition-colors"
                        title="Modifier"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(opp.id, opp.title)}
                        className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {opp.description && (
                    <p className="text-xs text-[#aaa] line-clamp-2 leading-relaxed">
                      {opp.description}
                    </p>
                  )}

                  <div className="space-y-1.5 text-xs text-[#888] font-mono pt-1">
                    {opp.location && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-custom-amber" />
                        <span className="truncate">{opp.location}</span>
                      </div>
                    )}
                    {opp.deadline && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Date limite : {new Date(opp.deadline).toLocaleDateString("fr-FR")}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-[#2a2c2c] flex items-center justify-between gap-2">
                  <button
                    onClick={() => toggleActive(opp)}
                    className={`px-3 py-1 rounded-xl text-[10px] font-mono font-bold transition-colors cursor-pointer ${
                      opp.is_active
                        ? "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
                        : "bg-gray-700/50 text-gray-400 hover:bg-gray-700"
                    }`}
                  >
                    {opp.is_active ? "Active (En ligne)" : "Archivée"}
                  </button>

                  <div className="flex items-center gap-2">
                    {opp.contact_email && (
                      <a
                        href={`mailto:${opp.contact_email}`}
                        className="p-1.5 rounded-lg text-[#888] hover:text-white hover:bg-white/10"
                        title={opp.contact_email}
                      >
                        <Mail className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {opp.apply_url && (
                      <a
                        href={opp.apply_url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg text-custom-amber hover:bg-custom-amber/10"
                        title="Lien de candidature"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#141515] border border-[#2a2c2c] w-full max-w-2xl rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl my-8 relative overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-[#2a2c2c] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-custom-amber/15 border border-custom-amber/30 flex items-center justify-center text-custom-amber">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {editingOpp ? "Modifier l'opportunité" : "Nouvelle Opportunité / Offre"}
                    </h3>
                    <p className="text-xs text-[#888]">Renseignez les informations de l&apos;offre.</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-xl text-[#888] hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Title & Company */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase text-[#aaa] mb-1">
                      Intitulé du poste / Stage *
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="ex: Stage PFE Lean Management & 5S"
                      className="w-full px-4 py-2.5 bg-[#1e2020] border border-[#333535] rounded-xl text-sm text-white focus:outline-none focus:border-custom-amber"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-[#aaa] mb-1">
                      Entreprise / Organisation *
                    </label>
                    <input
                      type="text"
                      required
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="ex: Safran Tunisia / Leoni / Valeo"
                      className="w-full px-4 py-2.5 bg-[#1e2020] border border-[#333535] rounded-xl text-sm text-white focus:outline-none focus:border-custom-amber"
                    />
                  </div>
                </div>

                {/* Type & Location */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase text-[#aaa] mb-1">
                      Type d&apos;opportunité
                    </label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#1e2020] border border-[#333535] rounded-xl text-sm text-white focus:outline-none focus:border-custom-amber"
                    >
                      <option value="stage_pfe">Stage PFE (Fin d&apos;études)</option>
                      <option value="stage_ete">Stage d&apos;Été (Technique)</option>
                      <option value="stage_ouvrier">Stage Ouvrier / Immersion</option>
                      <option value="emploi">Offre d&apos;Emploi / CDI / CDD</option>
                      <option value="autre">Autre opportunité</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-[#aaa] mb-1">
                      Lieu / Ville / Télétravail
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="ex: Ben Arous, Tunis / Sousse"
                      className="w-full px-4 py-2.5 bg-[#1e2020] border border-[#333535] rounded-xl text-sm text-white focus:outline-none focus:border-custom-amber"
                    />
                  </div>
                </div>

                {/* Deadline, Email & Link */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase text-[#aaa] mb-1">
                      Date limite (Deadline)
                    </label>
                    <input
                      type="date"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#1e2020] border border-[#333535] rounded-xl text-sm text-white focus:outline-none focus:border-custom-amber"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-[#aaa] mb-1">
                      Email de contact / RH
                    </label>
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="rh@entreprise.com"
                      className="w-full px-4 py-2.5 bg-[#1e2020] border border-[#333535] rounded-xl text-sm text-white focus:outline-none focus:border-custom-amber"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-[#aaa] mb-1">
                      Lien de candidature / Form
                    </label>
                    <input
                      type="url"
                      value={applyUrl}
                      onChange={(e) => setApplyUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-4 py-2.5 bg-[#1e2020] border border-[#333535] rounded-xl text-sm text-white focus:outline-none focus:border-custom-amber"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-mono uppercase text-[#aaa] mb-1">
                    Missions & Description du stage
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Missions principales, contexte du projet..."
                    className="w-full px-4 py-2.5 bg-[#1e2020] border border-[#333535] rounded-xl text-sm text-white focus:outline-none focus:border-custom-amber"
                  />
                </div>

                {/* Requirements */}
                <div>
                  <label className="block text-xs font-mono uppercase text-[#aaa] mb-1">
                    Profil recherché / Compétences requises
                  </label>
                  <input
                    type="text"
                    value={requirements}
                    onChange={(e) => setRequirements(e.target.value)}
                    placeholder="ex: Élève ingénieur GI, maîtrise PowerBI et Arena"
                    className="w-full px-4 py-2.5 bg-[#1e2020] border border-[#333535] rounded-xl text-sm text-white focus:outline-none focus:border-custom-amber"
                  />
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#2a2c2c]">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl text-xs font-semibold text-[#888] hover:text-white hover:bg-white/10 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-custom-amber hover:bg-[#ffc887] text-black shadow-[0_0_20px_rgba(252,163,17,0.3)] transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>{submitting ? "Enregistrement..." : editingOpp ? "Mettre à jour" : "Publier l'opportunité"}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
