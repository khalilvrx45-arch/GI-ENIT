"use client";

import React, { useState, useEffect } from "react";
import {
  Factory,
  Plus,
  Search,
  Calendar,
  MapPin,
  ExternalLink,
  Edit2,
  Trash2,
  Loader2,
  CheckCircle2,
  Clock,
  Eye,
  Upload,
  X,
  Building,
  Users,
  Download,
  ShieldCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

interface VisitRecord {
  id: string;
  title: string;
  entreprise?: string | null;
  location?: string | null;
  description?: string | null;
  cover_image_url?: string | null;
  image_url?: string | null;
  google_form_url?: string | null;
  date_start: string;
  date_end?: string | null;
  capacity?: number | null;
  status: "draft" | "published" | "cancelled" | "done";
  created_at: string;
}

interface ParticipantRecord {
  id: string;
  activity_id: string;
  user_id: string;
  status: "confirmed" | "waitlisted" | "cancelled";
  queue_position?: number | null;
  attended: boolean;
  created_at: string;
  profile?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string;
    phone: string | null;
    classe: string | null;
    avatar_url: string | null;
    statut_membre: string | null;
  };
}

export default function VisitesManager({
  onShowToast,
}: {
  onShowToast: (type: "success" | "error" | "info", msg: string) => void;
}) {
  const supabase = createClient();
  const [visits, setVisits] = useState<VisitRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Modal states (Create / Edit Visit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVisit, setEditingVisit] = useState<VisitRecord | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [entreprise, setEntreprise] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [capacity, setCapacity] = useState<string>("");
  const [googleFormUrl, setGoogleFormUrl] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("published");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  // Participants Modal States
  const [participantsModal, setParticipantsModal] = useState<{
    isOpen: boolean;
    visit: VisitRecord | null;
    participants: ParticipantRecord[];
    loading: boolean;
    search: string;
  }>({
    isOpen: false,
    visit: null,
    participants: [],
    loading: false,
    search: "",
  });

  const fetchVisits = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/visites");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur chargement des visites");
      setVisits(data.visits || []);
    } catch (err: any) {
      onShowToast("error", err.message || "Erreur lors du chargement des visites.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisits();
  }, []);

  const openCreateModal = () => {
    setEditingVisit(null);
    setTitle("");
    setEntreprise("");
    setLocation("");
    setDescription("");
    setDateStart(new Date().toISOString().slice(0, 16));
    setDateEnd("");
    setCapacity("");
    setGoogleFormUrl("");
    setStatus("published");
    setImageFile(null);
    setPreviewImageUrl(null);
    setIsModalOpen(true);
  };

  const openEditModal = (visit: VisitRecord) => {
    setEditingVisit(visit);
    setTitle(visit.title || "");
    setEntreprise(visit.entreprise || "");
    setLocation(visit.location || "");
    setDescription(visit.description || "");
    setDateStart(visit.date_start ? new Date(visit.date_start).toISOString().slice(0, 16) : "");
    setDateEnd(visit.date_end ? new Date(visit.date_end).toISOString().slice(0, 16) : "");
    setCapacity(visit.capacity ? String(visit.capacity) : "");
    setGoogleFormUrl(visit.google_form_url || "");
    setStatus(visit.status === "draft" ? "draft" : "published");
    setImageFile(null);
    setPreviewImageUrl(visit.cover_image_url || visit.image_url || null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dateStart) {
      onShowToast("error", "Titre et date sont obligatoires.");
      return;
    }

    setSubmitting(true);
    try {
      let finalImageUrl = editingVisit?.cover_image_url || editingVisit?.image_url || null;

      // Upload image if selected
      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop();
        const fileName = `visit-${Date.now()}.${fileExt}`;
        const { error: uploadErr } = await supabase.storage
          .from("activity-images")
          .upload(fileName, imageFile);

        if (uploadErr) {
          throw new Error(`Échec du téléversement de l'image : ${uploadErr.message}`);
        }

        const { data: pubData } = supabase.storage
          .from("activity-images")
          .getPublicUrl(fileName);
        finalImageUrl = pubData.publicUrl;
      }

      const payload = {
        title: title.trim(),
        entreprise: entreprise.trim() || null,
        location: location.trim() || null,
        description: description.trim() || "",
        date_start: new Date(dateStart).toISOString(),
        date_end: dateEnd ? new Date(dateEnd).toISOString() : null,
        capacity: capacity ? parseInt(capacity, 10) : null,
        google_form_url: googleFormUrl.trim() || null,
        cover_image_url: finalImageUrl,
        status,
      };

      if (editingVisit) {
        const res = await fetch("/api/admin/visites", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingVisit.id, ...payload }),
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error);
        onShowToast("success", "Visite mise à jour avec succès !");
      } else {
        const res = await fetch("/api/admin/visites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error);
        onShowToast("success", "Nouvelle visite d'entreprise créée !");
      }

      setIsModalOpen(false);
      fetchVisits();
    } catch (err: any) {
      onShowToast("error", err.message || "Erreur lors de l'enregistrement.");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (visit: VisitRecord) => {
    const newStatus = visit.status === "published" ? "draft" : "published";
    try {
      const res = await fetch("/api/admin/visites", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: visit.id, status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setVisits((prev) =>
        prev.map((v) => (v.id === visit.id ? { ...v, status: newStatus } : v))
      );
      onShowToast(
        "success",
        `Visite ${newStatus === "published" ? "publiée aux membres" : "mise en brouillon"}.`
      );
    } catch (err: any) {
      onShowToast("error", err.message || "Erreur changement de statut.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cette visite d'entreprise ?")) return;
    try {
      const res = await fetch(`/api/admin/visites?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setVisits((prev) => prev.filter((v) => v.id !== id));
      onShowToast("success", "Visite supprimée avec succès !");
    } catch (err: any) {
      onShowToast("error", err.message || "Erreur lors de la suppression.");
    }
  };

  // --- PARTICIPANTS MANAGEMENT ---
  const openParticipantsModal = async (visit: VisitRecord) => {
    setParticipantsModal({
      isOpen: true,
      visit,
      participants: [],
      loading: true,
      search: "",
    });

    try {
      const res = await fetch(`/api/admin/visites/participants?activity_id=${visit.id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setParticipantsModal((prev) => ({
        ...prev,
        participants: data.registrations || [],
        loading: false,
      }));
    } catch (err: any) {
      onShowToast("error", err.message || "Erreur lors de la récupération des participants.");
      setParticipantsModal((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleToggleAttendance = async (participantId: string, currentAttended: boolean) => {
    try {
      const res = await fetch("/api/admin/visites/participants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registration_id: participantId, attended: !currentAttended }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setParticipantsModal((prev) => ({
        ...prev,
        participants: prev.participants.map((p) =>
          p.id === participantId ? { ...p, attended: !currentAttended } : p
        ),
      }));

      onShowToast(
        "success",
        !currentAttended
          ? "Présence validée (+5 points attribués au membre) !"
          : "Présence annulée."
      );
    } catch (err: any) {
      onShowToast("error", err.message || "Erreur lors de la mise à jour de présence.");
    }
  };

  const exportParticipantsCsv = (visit: VisitRecord, list: ParticipantRecord[]) => {
    const headers = ["Nom", "Prénom", "Email", "Téléphone", "Classe ENIT", "Statut", "Présence"];
    const rows = list.map((p) => [
      p.profile?.last_name || "",
      p.profile?.first_name || "",
      p.profile?.email || "",
      p.profile?.phone || "",
      p.profile?.classe || "",
      p.status === "confirmed" ? "Inscrit" : "Liste d'attente",
      p.attended ? "Présent" : "Absent",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.map((val) => `"${val}"`).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `participants-visite-${visit.entreprise || "cgi"}-${Date.now()}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast("info", "Fichier CSV exporté avec succès !");
  };

  const filteredVisits = visits.filter((v) => {
    const matchSearch =
      (v.title || "").toLowerCase().includes(search.toLowerCase()) ||
      (v.entreprise || "").toLowerCase().includes(search.toLowerCase()) ||
      (v.location || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || v.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#2a2c2c] pb-5">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
            <Factory className="w-6 h-6 text-custom-amber" />
            <span>Gestion des Visites d&apos;Entreprise</span>
          </h2>
          <p className="text-xs text-[#888] mt-1">
            Créez, publiez et suivez les visites d&apos;usines, sites industriels et participants.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-custom-amber text-black font-bold text-xs hover:bg-[#ffc887] transition-all shadow-[0_0_15px_rgba(252,163,17,0.2)] cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nouvelle Visite</span>
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[#666] absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par titre, entreprise, lieu..."
            className="w-full bg-[#141515] border border-[#2a2c2c] focus:border-custom-amber rounded-xl py-2.5 pl-10 pr-4 text-xs text-[#e2e2e2] outline-none transition-colors"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="w-full sm:w-auto bg-[#141515] border border-[#2a2c2c] rounded-xl py-2.5 px-3 text-xs text-[#aaa] outline-none focus:border-custom-amber"
        >
          <option value="all">Tous les statuts</option>
          <option value="published">Publiées</option>
          <option value="draft">Brouillons</option>
        </select>
      </div>

      {/* Visits List */}
      {loading ? (
        <div className="py-16 text-center">
          <Loader2 className="w-8 h-8 text-custom-amber animate-spin mx-auto mb-3" />
          <p className="text-xs text-[#666]">Chargement des visites industrielles...</p>
        </div>
      ) : filteredVisits.length === 0 ? (
        <div className="bg-[#141515] border border-dashed border-[#2a2c2c] rounded-2xl py-12 text-center p-6">
          <Factory className="w-10 h-10 text-[#444] mx-auto mb-3 stroke-[1.5]" />
          <p className="text-sm font-semibold text-white">Aucune visite trouvée</p>
          <p className="text-xs text-[#777] mt-1">Créez votre première visite d&apos;entreprise pour les membres du club.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredVisits.map((visit) => (
            <div
              key={visit.id}
              className="bg-[#141515] border border-[#2a2c2c] hover:border-custom-amber/40 rounded-2xl p-5 flex flex-col justify-between transition-all group shadow-sm"
            >
              <div>
                {/* Header card */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md border ${
                        visit.status === "published"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      }`}
                    >
                      {visit.status === "published" ? "Publiée" : "Brouillon"}
                    </span>
                    {visit.google_form_url && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        Google Form
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* View Participants Button */}
                    <button
                      onClick={() => openParticipantsModal(visit)}
                      title="Voir la liste des participants et présences"
                      className="p-1.5 rounded-lg bg-[#1e2020] hover:bg-custom-amber/15 text-[#aaa] hover:text-custom-amber transition-colors cursor-pointer text-[10px] font-bold flex items-center gap-1"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Inscrits</span>
                    </button>

                    <button
                      onClick={() => toggleStatus(visit)}
                      title={visit.status === "published" ? "Passer en brouillon" : "Publier"}
                      className="p-1.5 rounded-lg bg-[#1e2020] hover:bg-white/10 text-[#aaa] hover:text-white transition-colors cursor-pointer text-[10px] font-bold"
                    >
                      {visit.status === "published" ? "Désactiver" : "Publier"}
                    </button>
                    <button
                      onClick={() => openEditModal(visit)}
                      className="p-1.5 rounded-lg bg-[#1e2020] hover:bg-white/10 text-[#aaa] hover:text-custom-amber transition-colors cursor-pointer"
                      title="Modifier"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(visit.id)}
                      className="p-1.5 rounded-lg bg-[#1e2020] hover:bg-red-500/20 text-[#aaa] hover:text-red-400 transition-colors cursor-pointer"
                      title="Supprimer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="font-bold text-sm text-white group-hover:text-custom-amber transition-colors">
                  {visit.title}
                </h3>

                {visit.entreprise && (
                  <p className="text-xs text-custom-amber font-semibold mt-1 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5" />
                    <span>{visit.entreprise}</span>
                  </p>
                )}

                {visit.description && (
                  <p className="text-xs text-[#888] mt-2 line-clamp-2 leading-relaxed">
                    {visit.description}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-[#2a2c2c]/60 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#777]">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#555]" />
                  <span>
                    {new Date(visit.date_start).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                {visit.location && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#555]" />
                    <span>{visit.location}</span>
                  </div>
                )}

                {visit.capacity && (
                  <span className="font-mono text-[10px] text-custom-amber">
                    Capacité : {visit.capacity} places
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PARTICIPANTS MODAL */}
      <AnimatePresence>
        {participantsModal.isOpen && participantsModal.visit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#141515] border border-[#333535] rounded-3xl p-6 sm:p-8 max-w-3xl w-full shadow-2xl my-8 text-white space-y-5"
            >
              <div className="flex items-center justify-between pb-4 border-b border-[#2a2c2c]">
                <div>
                  <h3 className="font-bold text-base text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-custom-amber" />
                    <span>Participants — {participantsModal.visit.entreprise || participantsModal.visit.title}</span>
                  </h3>
                  <p className="text-xs text-[#888] mt-0.5">
                    {participantsModal.participants.filter((p) => p.status === "confirmed").length} /{" "}
                    {participantsModal.visit.capacity || "∞"} places confirmées
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      exportParticipantsCsv(
                        participantsModal.visit!,
                        participantsModal.participants
                      )
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold border border-white/10 transition-colors cursor-pointer"
                    title="Exporter au format CSV"
                  >
                    <Download className="w-3.5 h-3.5 text-custom-amber" />
                    <span>Exporter CSV</span>
                  </button>
                  <button
                    onClick={() => setParticipantsModal((prev) => ({ ...prev, isOpen: false }))}
                    className="p-1.5 text-[#888] hover:text-white rounded-lg hover:bg-white/10"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Search within participants */}
              <div className="relative">
                <Search className="w-4 h-4 text-[#666] absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={participantsModal.search}
                  onChange={(e) =>
                    setParticipantsModal((prev) => ({ ...prev, search: e.target.value }))
                  }
                  placeholder="Filtrer par nom, email, classe..."
                  className="w-full bg-[#1e2020] border border-[#333535] focus:border-custom-amber rounded-xl py-2 pl-9 pr-3 text-xs text-white outline-none"
                />
              </div>

              {/* Table */}
              {participantsModal.loading ? (
                <div className="py-12 text-center">
                  <Loader2 className="w-6 h-6 text-custom-amber animate-spin mx-auto mb-2" />
                  <p className="text-xs text-[#666]">Chargement de la liste des inscrits...</p>
                </div>
              ) : participantsModal.participants.length === 0 ? (
                <div className="py-10 text-center text-xs text-[#666] border border-dashed border-[#2a2c2c] rounded-2xl">
                  Aucun membre ne s&apos;est encore inscrit à cette visite.
                </div>
              ) : (
                <div className="overflow-x-auto max-h-[50vh]">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#2a2c2c] text-[#888] uppercase text-[10px]">
                        <th className="py-2.5 px-3">MEMBRE</th>
                        <th className="py-2.5 px-3">CLASSE</th>
                        <th className="py-2.5 px-3">TÉLÉPHONE</th>
                        <th className="py-2.5 px-3">STATUT</th>
                        <th className="py-2.5 px-3 text-right">PRÉSENCE (+5 PTS)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2a2c2c]">
                      {participantsModal.participants
                        .filter((p) => {
                          const s = participantsModal.search.toLowerCase();
                          const name = `${p.profile?.first_name || ""} ${p.profile?.last_name || ""}`.toLowerCase();
                          const email = (p.profile?.email || "").toLowerCase();
                          const classe = (p.profile?.classe || "").toLowerCase();
                          return name.includes(s) || email.includes(s) || classe.includes(s);
                        })
                        .map((p) => (
                          <tr key={p.id} className="hover:bg-[#1e2020]/50 transition-colors">
                            <td className="py-2.5 px-3">
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-full bg-[#1e2020] border border-[#333] flex items-center justify-center overflow-hidden shrink-0 text-[10px] font-bold text-custom-amber">
                                  {p.profile?.avatar_url ? (
                                    <img
                                      src={p.profile.avatar_url}
                                      alt="Avatar"
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <span>{p.profile?.first_name?.[0] || "M"}</span>
                                  )}
                                </div>
                                <div>
                                  <div className="font-bold text-white text-xs">
                                    {p.profile?.first_name} {p.profile?.last_name}
                                  </div>
                                  <div className="text-[10px] text-[#888]">{p.profile?.email}</div>
                                </div>
                              </div>
                            </td>

                            <td className="py-2.5 px-3 font-mono text-[11px] text-white">
                              {p.profile?.classe || "—"}
                            </td>

                            <td className="py-2.5 px-3 text-[11px] text-[#aaa]">
                              {p.profile?.phone || "—"}
                            </td>

                            <td className="py-2.5 px-3">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                                  p.status === "confirmed"
                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                    : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                }`}
                              >
                                {p.status === "confirmed"
                                  ? "Inscrit"
                                  : `Attente #${p.queue_position || 1}`}
                              </span>
                            </td>

                            <td className="py-2.5 px-3 text-right">
                              <button
                                type="button"
                                onClick={() => handleToggleAttendance(p.id, p.attended)}
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                                  p.attended
                                    ? "bg-emerald-500 text-black shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                                    : "bg-[#1e2020] text-[#888] hover:text-white border border-[#333535]"
                                }`}
                              >
                                <ShieldCheck className="w-3.5 h-3.5" />
                                <span>{p.attended ? "Présent ✓" : "Pointer"}</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create / Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#141515] border border-[#333535] rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl my-8"
            >
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-[#2a2c2c]">
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <Factory className="w-5 h-5 text-custom-amber" />
                  <span>{editingVisit ? "Modifier la Visite" : "Nouvelle Visite Industrielle"}</span>
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 text-[#888] hover:text-white rounded-lg hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-[#888] uppercase">Titre de la visite *</label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Ex: Immersion Industrie 4.0"
                      className="w-full bg-[#1e2020] border border-[#333535] focus:border-custom-amber rounded-xl py-2.5 px-3.5 text-xs text-white outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-[#888] uppercase">Entreprise partenaire</label>
                    <input
                      type="text"
                      value={entreprise}
                      onChange={(e) => setEntreprise(e.target.value)}
                      placeholder="Ex: SAGEMCOM, Draxlmaier..."
                      className="w-full bg-[#1e2020] border border-[#333535] focus:border-custom-amber rounded-xl py-2.5 px-3.5 text-xs text-white outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[11px] font-semibold text-[#888] uppercase">Lieu / Usine</label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Ex: Z.I. Ben Arous, Usine 3"
                      className="w-full bg-[#1e2020] border border-[#333535] focus:border-custom-amber rounded-xl py-2.5 px-3.5 text-xs text-white outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-[#888] uppercase">Capacité max</label>
                    <input
                      type="number"
                      min={1}
                      value={capacity}
                      onChange={(e) => setCapacity(e.target.value)}
                      placeholder="Ex: 25"
                      className="w-full bg-[#1e2020] border border-[#333535] focus:border-custom-amber rounded-xl py-2.5 px-3.5 text-xs text-white outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-[#888] uppercase">Date & Heure de début *</label>
                    <input
                      type="datetime-local"
                      required
                      value={dateStart}
                      onChange={(e) => setDateStart(e.target.value)}
                      className="w-full bg-[#1e2020] border border-[#333535] focus:border-custom-amber rounded-xl py-2.5 px-3.5 text-xs text-white outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-[#888] uppercase">Date de fin (optionnel)</label>
                    <input
                      type="datetime-local"
                      value={dateEnd}
                      onChange={(e) => setDateEnd(e.target.value)}
                      className="w-full bg-[#1e2020] border border-[#333535] focus:border-custom-amber rounded-xl py-2.5 px-3.5 text-xs text-white outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#888] uppercase">Programme & Description</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Déroulé de la visite, consignes de sécurité, équipement requis..."
                    className="w-full bg-[#1e2020] border border-[#333535] focus:border-custom-amber rounded-xl py-2.5 px-3.5 text-xs text-white outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#888] uppercase">
                    Lien Google Form (Optionnel)
                  </label>
                  <input
                    type="url"
                    value={googleFormUrl}
                    onChange={(e) => setGoogleFormUrl(e.target.value)}
                    placeholder="https://forms.gle/..."
                    className="w-full bg-[#1e2020] border border-[#333535] focus:border-custom-amber rounded-xl py-2.5 px-3.5 text-xs text-white outline-none"
                  />
                  <p className="text-[10px] text-[#666]">
                    Si renseigné, le bouton d&apos;inscription côté membre redirigera vers ce formulaire tout en permettant d&apos;enregistrer la place.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-[#888] uppercase">Statut</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="w-full bg-[#1e2020] border border-[#333535] focus:border-custom-amber rounded-xl py-2.5 px-3.5 text-xs text-white outline-none"
                    >
                      <option value="published">Publiée</option>
                      <option value="draft">Brouillon</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-[#888] uppercase">Photo de couverture</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setImageFile(file);
                        if (file) setPreviewImageUrl(URL.createObjectURL(file));
                      }}
                      className="w-full text-xs text-[#aaa] file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:bg-custom-amber/10 file:text-custom-amber hover:file:bg-custom-amber/20"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#2a2c2c] mt-6">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-[#333535] text-xs font-semibold text-[#aaa] hover:bg-white/5"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2.5 rounded-xl bg-custom-amber text-black font-bold text-xs hover:bg-[#ffc887] transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Enregistrer"}
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
