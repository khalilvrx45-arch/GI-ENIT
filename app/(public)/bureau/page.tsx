"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { compressImage } from "@/lib/utils/imageCompressor";
import {
  LogOut, Briefcase, Plus, Edit, Trash2, Eye, EyeOff,
  Loader2, X, Upload, Calendar, MapPin, Sparkles,
  Image as ImageIcon, ChevronLeft, ChevronRight, FolderGit2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Toast, { ToastMessage } from "@/components/ui/Toast";
import ConfirmModal from "@/components/ui/ConfirmModal";
import PostCreatorModal from "@/components/admin/PostCreatorModal";
import ProjectManager from "@/components/admin/ProjectManager";
import MemberManagementHub from "@/components/bureau-admin/MemberManagementHub";
import EditProfileModal from "@/components/membre/EditProfileModal";
import { User as UserIcon } from "lucide-react";

interface Activity {
  id: string;
  title: string;
  description: string;
  content?: string;
  image_url?: string;
  photo_urls?: string[];
  category: string;
  date: string;
  location?: string;
  status: "draft" | "published" | "archived";
  created_at: string;
  created_by?: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  Visite: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  Formation: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  Workshop: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  Hackathon: "bg-green-500/20 text-green-300 border-green-500/30",
  "Conférence": "bg-pink-500/20 text-pink-300 border-pink-500/30",
  Autre: "bg-gray-500/20 text-gray-300 border-gray-500/30",
};

export default function BureauPage() {
  const router = useRouter();
  const supabase = createClient();

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [activeTab, setActiveTab] = useState<"activites" | "projets" | "administration">("activites");

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [saving, setSaving] = useState(false);

  // Form fields
  const [fTitle, setFTitle] = useState("");
  const [fCategory, setFCategory] = useState("Workshop");
  const [fDate, setFDate] = useState(new Date().toISOString().slice(0, 10));
  const [fLocation, setFLocation] = useState("");
  const [fStatus, setFStatus] = useState("published");
  const [fDescription, setFDescription] = useState("");
  const [fContent, setFContent] = useState("");
  const [fPhotoUrls, setFPhotoUrls] = useState<string[]>([]);
  const [fNewFiles, setFNewFiles] = useState<File[]>([]);
  const [fUrlInput, setFUrlInput] = useState("");

  // Toast & Confirm
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const addToast = (type: "success" | "error" | "info", message: string) => {
    setToasts(prev => [...prev, { id: Math.random().toString(36).slice(2), type, message }]);
  };
  const [modalConfig, setModalConfig] = useState<any>({ isOpen: false, title: "", message: "", onConfirm: () => {} });

  const [userProfile, setUserProfile] = useState<any>(null);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  // Auth guard
  useEffect(() => {
    async function checkAuth() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { router.push("/login"); return; }
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
        const role = profile?.role || "";
        if (role !== "bureau" && role !== "membre_bureau" && role !== "admin") {
          router.push(role === "admin" ? "/admin" : "/dashboard");
          return;
        }
        setCurrentUser(user);
        setUserProfile(profile || { id: user.id, email: user.email });
      } catch { router.push("/login"); }
      finally { setLoadingUser(false); }
    }
    checkAuth();
  }, []);

  const fetchActivities = useCallback(async () => {
    setLoadingActivities(true);
    try {
      const res = await fetch("/api/admin/activities");
      const data = await res.json();
      if (res.ok) setActivities(data.activities || []);
    } catch { /* silent */ }
    finally { setLoadingActivities(false); }
  }, []);

  useEffect(() => { if (currentUser) fetchActivities(); }, [currentUser, fetchActivities]);

  const [modalPhotoIndex, setModalPhotoIndex] = useState(0);

  const resetForm = () => {
    setFTitle(""); setFCategory("Workshop"); setFDate(new Date().toISOString().slice(0, 10));
    setFLocation(""); setFStatus("published"); setFDescription(""); setFContent("");
    setFPhotoUrls([]); setFNewFiles([]); setFUrlInput(""); setModalPhotoIndex(0);
  };

  const openCreate = () => { resetForm(); setEditingActivity(null); setIsModalOpen(true); };
  const openEdit = (act: Activity) => {
    setEditingActivity(act);
    setFTitle(act.title); setFCategory(act.category);
    setFDate(act.date ? new Date(act.date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10));
    setFLocation(act.location || ""); setFStatus(act.status);
    setFDescription(act.description); setFContent(act.content || "");
    setFPhotoUrls(act.photo_urls || (act.image_url ? [act.image_url] : []));
    setFNewFiles([]); setFUrlInput(""); setModalPhotoIndex(0);
    setIsModalOpen(true);
  };

  const allPreviewItems = [
    ...fPhotoUrls.map((url, idx) => ({ type: "url" as const, url, index: idx })),
    ...fNewFiles.map((file, idx) => ({ type: "file" as const, url: URL.createObjectURL(file), file, index: idx })),
  ];

  const handleRemovePreviewItem = (item: { type: "url" | "file"; index: number }) => {
    if (item.type === "url") {
      setFPhotoUrls(prev => prev.filter((_, i) => i !== item.index));
    } else {
      setFNewFiles(prev => prev.filter((_, i) => i !== item.index));
    }
    setModalPhotoIndex(0);
  };

  const handleFilesAdded = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const remaining = 10 - fPhotoUrls.length - fNewFiles.length;
      const selected = Array.from(e.target.files).slice(0, remaining);
      setFNewFiles(prev => [...prev, ...selected]);
      e.target.value = "";
    }
  };

  const handleAddUrl = () => {
    const u = fUrlInput.trim();
    if (u.startsWith("http") && fPhotoUrls.length + fNewFiles.length < 10) {
      setFPhotoUrls(prev => [...prev, u]);
      setFUrlInput("");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fTitle.trim() || !fDescription.trim()) { addToast("error", "Titre et description requis."); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      if (editingActivity) fd.append("id", editingActivity.id);
      fd.append("title", fTitle.trim()); fd.append("category", fCategory);
      fd.append("location", fLocation.trim()); fd.append("date", new Date(fDate).toISOString());
      fd.append("status", fStatus); fd.append("description", fDescription.trim());
      fd.append("content", fContent.trim());
      fd.append("photo_urls", JSON.stringify(fPhotoUrls));
      // Compress and append new files
      for (let i = 0; i < fNewFiles.length; i++) {
        const compressed = await compressImage(fNewFiles[i], 1280, 960, 0.82);
        fd.append(`file_${i}`, compressed);
      }
      const res = await fetch("/api/admin/activities", { method: editingActivity ? "PUT" : "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur.");
      addToast("success", editingActivity ? "Activité mise à jour !" : "Activité créée !");
      setIsModalOpen(false);
      fetchActivities();
    } catch (err: any) { addToast("error", err.message); }
    finally { setSaving(false); }
  };

  const handleToggleStatus = async (act: Activity) => {
    const newStatus = act.status === "published" ? "draft" : "published";
    try {
      const res = await fetch("/api/admin/activities", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: act.id, title: act.title, description: act.description, content: act.content, category: act.category, date: act.date, location: act.location, status: newStatus }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      addToast("info", `Activité ${newStatus === "published" ? "publiée" : "masquée"}`);
      fetchActivities();
    } catch (err: any) { addToast("error", err.message); }
  };

  const handleDelete = (act: Activity) => {
    setModalConfig({
      isOpen: true, title: "Supprimer cette activité ?",
      message: `"${act.title}" sera supprimée définitivement.`,
      confirmText: "Supprimer", variant: "danger",
      onConfirm: async () => {
        const res = await fetch(`/api/admin/activities?id=${act.id}`, { method: "DELETE" });
        if (res.ok) { addToast("success", "Supprimée."); fetchActivities(); }
        else { const d = await res.json(); addToast("error", d.error || "Erreur."); }
      },
    });
  };

  const handleLogout = async () => { await supabase.auth.signOut(); router.push("/login"); };

  const myActivities = activities;
  const published = myActivities.filter(a => a.status === "published").length;
  const drafts = myActivities.filter(a => a.status === "draft").length;

  if (loadingUser) {
    return (
      <div className="min-h-screen bg-[#0d0e0e] flex items-center justify-center text-[#fca311]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0e0e] text-white font-sans">
      <Toast toasts={toasts} onDismiss={id => setToasts(p => p.filter(t => t.id !== id))} />
      <ConfirmModal
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmText={modalConfig.confirmText}
        variant={modalConfig.variant}
        onConfirm={() => { modalConfig.onConfirm(); setModalConfig((p: any) => ({ ...p, isOpen: false })); }}
        onCancel={() => setModalConfig((p: any) => ({ ...p, isOpen: false }))}
      />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0d0e0e]/90 backdrop-blur border-b border-[#2a2c2c] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#fca311]/10 border border-[#fca311]/30 rounded-xl flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-[#fca311]" />
          </div>
          <div>
            <h1 className="text-base font-black text-white tracking-tight">Portail Bureau</h1>
            <p className="text-[10px] text-[#666]">Gestion des activités du club</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsEditProfileOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#fca311]/10 border border-[#fca311]/30 text-[#fca311] hover:bg-[#fca311]/20 font-bold text-xs transition-colors cursor-pointer"
          >
            <UserIcon className="w-3.5 h-3.5" />
            Mon Profil
          </button>
          <a href="/" className="text-xs text-[#666] hover:text-white transition-colors">← Site public</a>
          <button onClick={handleLogout} className="flex items-center gap-2 text-xs text-red-400 hover:text-red-300 transition-colors font-semibold">
            <LogOut className="w-3.5 h-3.5" /> Déconnexion
          </button>
        </div>
      </header>

      {/* TAB NAVIGATION */}
      <div className="border-b border-[#2a2c2c] bg-[#0d0e0e] sticky top-[65px] z-30">
        <div className="max-w-5xl mx-auto px-4 flex gap-1 pt-3">
          {[
            { id: "activites", label: "Activités du Club", icon: Sparkles },
            { id: "projets", label: "Gestion des Projets", icon: FolderGit2 },
            { id: "administration", label: "Gestion des Membres & Présences", icon: Briefcase },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg border-b-2 transition-all ${
                activeTab === id
                  ? "border-[#fca311] text-[#fca311] bg-[#fca311]/5"
                  : "border-transparent text-[#666] hover:text-white hover:border-[#555]"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* ADMINISTRATION HUB TAB */}
        {activeTab === "administration" && (
          <MemberManagementHub
            currentProfile={{
              id: currentUser?.id,
              role: currentUser?.user_metadata?.role || "membre_bureau",
              first_name: currentUser?.user_metadata?.first_name || "Bureau",
              email: currentUser?.email,
            }}
          />
        )}

        {/* PROJETS TAB */}
        {activeTab === "projets" && <ProjectManager />}

        {/* ACTIVITES TAB */}
        {activeTab === "activites" && (<>
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Mes activités", value: myActivities.length, color: "text-white" },
            { label: "Publiées", value: published, color: "text-green-400" },
            { label: "Brouillons", value: drafts, color: "text-yellow-400" },
          ].map(stat => (
            <div key={stat.label} className="bg-[#141515] border border-[#2a2c2c] rounded-2xl p-5 text-center">
              <div className={`text-3xl font-black ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-[#666] mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Activities list */}
        <div className="bg-[#141515] border border-[#2a2c2c] rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2c2c]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#fca311]" />
              <h2 className="font-bold text-sm">Activités du club</h2>
            </div>
            <button
              onClick={openCreate}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#fca311] hover:bg-[#ffc95e] text-black font-bold text-xs transition-colors shadow-lg"
            >
              <Plus className="w-3.5 h-3.5" /> Nouvelle publication
            </button>
          </div>

          {loadingActivities ? (
            <div className="py-16 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-[#fca311]" /></div>
          ) : myActivities.length === 0 ? (
            <div className="py-16 text-center">
              <ImageIcon className="w-10 h-10 text-[#444] mx-auto mb-3" />
              <p className="text-[#666] text-sm">Vous n'avez pas encore créé d'activités.</p>
              <button onClick={openCreate} className="mt-4 px-5 py-2 rounded-xl bg-[#fca311]/10 border border-[#fca311]/20 text-[#fca311] text-xs font-bold hover:bg-[#fca311]/20 transition-colors">
                Créer ma première activité
              </button>
            </div>
          ) : (
            <div className="divide-y divide-[#2a2c2c]">
              {myActivities.map(act => {
                const cover = act.photo_urls?.[0] || act.image_url;
                const photoCount = act.photo_urls?.length || (act.image_url ? 1 : 0);
                return (
                  <div key={act.id} className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors group">
                    <div className="w-16 h-12 rounded-lg overflow-hidden bg-[#1e2020] border border-[#2a2c2c] shrink-0 relative">
                      {cover ? (
                        <img src={cover} alt={act.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#444]">
                          <ImageIcon className="w-5 h-5" />
                        </div>
                      )}
                      {photoCount > 1 && (
                        <div className="absolute bottom-0 right-0 bg-black/70 text-[9px] text-white px-1 rounded-tl">
                          +{photoCount - 1}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-[10px] px-2 py-0.5 rounded border font-semibold ${CATEGORY_COLORS[act.category] || CATEGORY_COLORS.Autre}`}>
                          {act.category}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${act.status === "published" ? "bg-green-500/10 text-green-400" : "bg-yellow-500/10 text-yellow-400"}`}>
                          {act.status === "published" ? "Publiée" : "Brouillon"}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-white truncate">{act.title}</p>
                      <div className="flex items-center gap-3 text-[10px] text-[#666] mt-0.5">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(act.date).toLocaleDateString("fr-FR")}</span>
                        {act.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{act.location}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleToggleStatus(act)} title={act.status === "published" ? "Masquer" : "Publier"}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-[#888] hover:text-white transition-colors">
                        {act.status === "published" ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                      <button onClick={() => openEdit(act)} title="Modifier"
                        className="p-2 rounded-lg bg-white/5 hover:bg-[#fca311]/10 text-[#888] hover:text-[#fca311] transition-colors">
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(act)} title="Supprimer"
                        className="p-2 rounded-lg bg-white/5 hover:bg-red-500/10 text-[#888] hover:text-red-400 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        </>)}
      </main>

      <PostCreatorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingActivity={editingActivity}
        onSave={async (fd) => {
          const res = await fetch('/api/admin/activities', {
            method: editingActivity ? 'PUT' : 'POST',
            body: fd,
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Erreur.');
          addToast('success', editingActivity ? 'Activité mise à jour !' : 'Activité créée !');
          fetchActivities();
        }}
      />
      {userProfile && (
        <EditProfileModal
          isOpen={isEditProfileOpen}
          onClose={() => setIsEditProfileOpen(false)}
          profile={userProfile}
          onProfileUpdated={async () => {
            const { data: updated } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", userProfile.id)
              .maybeSingle();
            if (updated) setUserProfile(updated);
          }}
        />
      )}
    </div>
  );
}
