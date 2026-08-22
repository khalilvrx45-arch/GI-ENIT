"use client";

import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Plus,
  Search,
  ExternalLink,
  Edit2,
  Trash2,
  Loader2,
  FileText,
  Upload,
  X,
  Download,
  FolderPlus,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

interface ResourceRecord {
  id: string;
  title: string;
  description?: string | null;
  category?: string | null;
  file_url: string;
  drive_url?: string | null;
  pole_id?: string | null;
  created_at: string;
  uploader?: {
    first_name: string | null;
    last_name: string | null;
  };
}

const CATEGORIES = [
  { id: "cours", label: "Cours" },
  { id: "examen", label: "Examen" },
  { id: "devoir_surveille", label: "Devoir Surveillé" },
  { id: "autre", label: "Autre" },
];

export default function ResourcesManager({
  onShowToast,
}: {
  onShowToast: (type: "success" | "error" | "info", msg: string) => void;
}) {
  const supabase = createClient();
  const [resources, setResources] = useState<ResourceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<ResourceRecord | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("cours");
  const [driveUrl, setDriveUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/resources");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur chargement");
      setResources(data.resources || []);
    } catch (err: any) {
      onShowToast("error", err.message || "Erreur chargement des ressources.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const openCreateModal = () => {
    setEditingResource(null);
    setTitle("");
    setDescription("");
    setCategory("cours");
    setDriveUrl("");
    setFile(null);
    setIsModalOpen(true);
  };

  const openEditModal = (res: ResourceRecord) => {
    setEditingResource(res);
    setTitle(res.title || "");
    setDescription(res.description || "");
    setCategory(res.category || "cours");
    setDriveUrl(res.drive_url || "");
    setFile(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      onShowToast("error", "Le titre de la ressource est requis.");
      return;
    }

    if (!file && !driveUrl.trim() && !editingResource?.file_url) {
      onShowToast("error", "Veuillez téléverser un fichier ou fournir un lien Google Drive.");
      return;
    }

    setSubmitting(true);
    try {
      let finalFileUrl = editingResource?.file_url || "";

      // Upload file to bucket if selected
      if (file) {
        const fileExt = file.name.split(".").pop();
        const fileName = `resource-${Date.now()}.${fileExt}`;
        const { error: uploadErr } = await supabase.storage
          .from("resources")
          .upload(fileName, file);

        if (uploadErr) {
          throw new Error(`Échec du téléversement du fichier : ${uploadErr.message}`);
        }

        const { data: pubData } = supabase.storage
          .from("resources")
          .getPublicUrl(fileName);
        finalFileUrl = pubData.publicUrl;
      }

      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        category,
        drive_url: driveUrl.trim() || null,
        file_url: finalFileUrl || driveUrl.trim(),
      };

      if (editingResource) {
        const res = await fetch("/api/admin/resources", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingResource.id, ...payload }),
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error);
        onShowToast("success", "Ressource mise à jour avec succès !");
      } else {
        const res = await fetch("/api/admin/resources", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error);
        onShowToast("success", "Ressource pédagogique publiée et membres notifiés !");
      }

      setIsModalOpen(false);
      fetchResources();
    } catch (err: any) {
      onShowToast("error", err.message || "Erreur lors de l'enregistrement.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cette ressource ?")) return;
    try {
      const res = await fetch(`/api/admin/resources?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResources((prev) => prev.filter((r) => r.id !== id));
      onShowToast("success", "Ressource supprimée avec succès !");
    } catch (err: any) {
      onShowToast("error", err.message || "Erreur lors de la suppression.");
    }
  };

  const getCategoryBadge = (cat?: string | null) => {
    switch (cat) {
      case "cours":
        return <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] px-2 py-0.5 rounded-md font-bold">Cours</span>;
      case "examen":
        return <span className="bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] px-2 py-0.5 rounded-md font-bold">Examen</span>;
      case "devoir_surveille":
        return <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] px-2 py-0.5 rounded-md font-bold">Devoir Surveillé</span>;
      default:
        return <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[10px] px-2 py-0.5 rounded-md font-bold">Autre</span>;
    }
  };

  const filtered = resources.filter((r) => {
    const matchSearch =
      (r.title || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.description || "").toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCategory === "all" || r.category === filterCategory;
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#2a2c2c] pb-5">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-custom-amber" />
            <span>Gestion des Ressources Pédagogiques</span>
          </h2>
          <p className="text-xs text-[#888] mt-1">
            Partagez devoirs surveillés, examens, supports de cours et liens Google Drive.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-custom-amber text-black font-bold text-xs hover:bg-[#ffc887] transition-all shadow-[0_0_15px_rgba(252,163,17,0.2)] cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nouvelle Ressource</span>
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
            placeholder="Rechercher par titre, description..."
            className="w-full bg-[#141515] border border-[#2a2c2c] focus:border-custom-amber rounded-xl py-2.5 pl-10 pr-4 text-xs text-[#e2e2e2] outline-none transition-colors"
          />
        </div>

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="w-full sm:w-auto bg-[#141515] border border-[#2a2c2c] rounded-xl py-2.5 px-3 text-xs text-[#aaa] outline-none focus:border-custom-amber"
        >
          <option value="all">Toutes les catégories</option>
          {CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {/* Resources Table/Cards */}
      {loading ? (
        <div className="py-16 text-center">
          <Loader2 className="w-8 h-8 text-custom-amber animate-spin mx-auto mb-3" />
          <p className="text-xs text-[#666]">Chargement des ressources...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-[#141515] border border-dashed border-[#2a2c2c] rounded-2xl py-12 text-center p-6">
          <BookOpen className="w-10 h-10 text-[#444] mx-auto mb-3 stroke-[1.5]" />
          <p className="text-sm font-semibold text-white">Aucune ressource disponible</p>
          <p className="text-xs text-[#777] mt-1">Ajoutez un premier document ou support pédagogique.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((res) => (
            <div
              key={res.id}
              className="bg-[#141515] border border-[#2a2c2c] hover:border-custom-amber/40 rounded-2xl p-5 flex flex-col justify-between transition-all group shadow-sm"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div className="flex items-center gap-2">
                    {getCategoryBadge(res.category)}
                    {res.drive_url && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Drive
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(res)}
                      className="p-1.5 rounded-lg bg-[#1e2020] hover:bg-white/10 text-[#aaa] hover:text-custom-amber transition-colors cursor-pointer"
                      title="Modifier"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(res.id)}
                      className="p-1.5 rounded-lg bg-[#1e2020] hover:bg-red-500/20 text-[#aaa] hover:text-red-400 transition-colors cursor-pointer"
                      title="Supprimer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="font-bold text-sm text-white group-hover:text-custom-amber transition-colors">
                  {res.title}
                </h3>

                {res.description && (
                  <p className="text-xs text-[#888] mt-1.5 line-clamp-2 leading-relaxed">
                    {res.description}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-[#2a2c2c]/60 flex items-center justify-between text-xs">
                <span className="text-[10px] text-[#666] font-mono">
                  {new Date(res.created_at).toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>

                <div className="flex items-center gap-2">
                  {res.drive_url && (
                    <a
                      href={res.drive_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white font-semibold text-[11px] transition-colors"
                    >
                      <span>Drive</span>
                      <ExternalLink className="w-3 h-3 text-custom-amber" />
                    </a>
                  )}

                  {res.file_url && (
                    <a
                      href={res.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-custom-amber/10 hover:bg-custom-amber/20 text-custom-amber font-semibold text-[11px] transition-colors"
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
      )}

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#141515] border border-[#333535] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl my-8"
            >
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-[#2a2c2c]">
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-custom-amber" />
                  <span>{editingResource ? "Modifier la Ressource" : "Nouvelle Ressource"}</span>
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 text-[#888] hover:text-white rounded-lg hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#888] uppercase">Titre du document *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Examen Supply Chain 2025"
                    className="w-full bg-[#1e2020] border border-[#333535] focus:border-custom-amber rounded-xl py-2.5 px-3.5 text-xs text-white outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#888] uppercase">Catégorie</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#1e2020] border border-[#333535] focus:border-custom-amber rounded-xl py-2.5 px-3.5 text-xs text-white outline-none"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#888] uppercase">Description</label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Sujet, corrigé, professeur, remarques..."
                    className="w-full bg-[#1e2020] border border-[#333535] focus:border-custom-amber rounded-xl py-2.5 px-3.5 text-xs text-white outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#888] uppercase">Lien Google Drive</label>
                  <input
                    type="url"
                    value={driveUrl}
                    onChange={(e) => setDriveUrl(e.target.value)}
                    placeholder="https://drive.google.com/..."
                    className="w-full bg-[#1e2020] border border-[#333535] focus:border-custom-amber rounded-xl py-2.5 px-3.5 text-xs text-white outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#888] uppercase">Ou téléverser un fichier</label>
                  <input
                    type="file"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="w-full text-xs text-[#aaa] file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:bg-custom-amber/10 file:text-custom-amber hover:file:bg-custom-amber/20"
                  />
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
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Publier"}
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
