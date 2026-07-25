"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Users,
  FileText,
  MessageSquare,
  Settings,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Ban,
  RotateCw,
  Trash2,
  UserCheck,
  Send,
  Loader2,
  Shield,
  Search,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

import Sidebar from "@/components/ui/Sidebar";
import BottomNav from "@/components/ui/BottomNav";
import RoleBadge from "@/components/ui/RoleBadge";
import DataTable, { Column } from "@/components/ui/DataTable";
import Toast, { ToastMessage } from "@/components/ui/Toast";
import ConfirmModal from "@/components/ui/ConfirmModal";

export interface InvitationRecord {
  id: string;
  email: string;
  role: "membre_actif" | "membre_bureau";
  token: string;
  status: "pending" | "accepted" | "expired" | "cancelled";
  expires_at: string;
  created_at: string;
  accepted_at?: string | null;
}

export interface MemberRecord {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: "admin" | "membre_bureau" | "membre_actif";
  created_at: string;
}

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState("invitations");
  const [loadingUser, setLoadingUser] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Data states
  const [invitations, setInvitations] = useState<InvitationRecord[]>([]);
  const [members, setMembers] = useState<MemberRecord[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Form states (Invitations)
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"membre_actif" | "membre_bureau">("membre_actif");
  const [inviteDuration, setInviteDuration] = useState<number>(7);
  const [sendingInvite, setSendingInvite] = useState(false);

  // Member search / filter
  const [memberSearch, setMemberSearch] = useState("");

  // Toast System
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const addToast = (type: "success" | "error" | "info", message: string) => {
    const newToast: ToastMessage = {
      id: Math.random().toString(36).substring(2, 9),
      type,
      message,
    };
    setToasts((prev) => [...prev, newToast]);
  };
  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Confirm Modal state
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    variant?: "danger" | "warning" | "info";
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const router = useRouter();
  const supabase = createClient();

  // Auth Guard check
  useEffect(() => {
    async function checkAuth() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push("/login");
          return;
        }

        const role = user.user_metadata?.role || "membre";
        if (role !== "admin") {
          // AuthGuard: redirect if not admin
          router.push(role === "bureau" || role === "membre_bureau" ? "/bureau" : "/dashboard");
          return;
        }

        setCurrentUser(user);
      } catch (err) {
        router.push("/login");
      } finally {
        setLoadingUser(false);
      }
    }
    checkAuth();
  }, [router, supabase]);

  // Fetch Invitations and Members
  const fetchData = useCallback(async () => {
    setLoadingData(true);
    try {
      // 1. Fetch invitations
      const { data: inviteData, error: inviteErr } = await supabase
        .from("invitations")
        .select("*")
        .order("created_at", { ascending: false });

      if (!inviteErr && inviteData) {
        // Auto-check expired status
        const now = new Date();
        const updatedInvites = inviteData.map((inv) => {
          if (inv.status === "pending" && new Date(inv.expires_at) < now) {
            return { ...inv, status: "expired" as const };
          }
          return inv;
        });
        setInvitations(updatedInvites);
      }

      // 2. Fetch members (from profiles table)
      const { data: memberData, error: memberErr } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (!memberErr && memberData) {
        setMembers(memberData);
      }
    } catch (err) {
      // Ignore if table does not exist yet
    } finally {
      setLoadingData(false);
    }
  }, [supabase]);

  useEffect(() => {
    if (currentUser) {
      fetchData();
    }
  }, [currentUser, fetchData]);

  // Sign out handler
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  // Process Invitation sending
  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setSendingInvite(true);
    try {
      // 1. Check if email already member
      const existingMember = members.find(
        (m) => m.email.toLowerCase() === inviteEmail.trim().toLowerCase()
      );
      if (existingMember) {
        addToast("error", `L'email ${inviteEmail} appartient déjà à un membre du club.`);
        setSendingInvite(false);
        return;
      }

      // 2. Check if pending invitation exists
      const existingInvite = invitations.find(
        (i) =>
          i.email.toLowerCase() === inviteEmail.trim().toLowerCase() &&
          i.status === "pending" &&
          new Date(i.expires_at) > new Date()
      );

      if (existingInvite) {
        addToast("error", `Une invitation active existe déjà pour ${inviteEmail}.`);
        setSendingInvite(false);
        return;
      }

      // 3. Calculate expiration date
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + inviteDuration);

      const newToken = crypto.randomUUID();

      // 4. Insert into invitations table
      const { error: insertErr } = await supabase.from("invitations").insert({
        email: inviteEmail.trim().toLowerCase(),
        role: inviteRole,
        token: newToken,
        status: "pending",
        expires_at: expiresAt.toISOString(),
        created_by: currentUser?.id,
      });

      if (insertErr) {
        throw new Error(insertErr.message);
      }

      // 5. Try calling Supabase Auth admin invitation if configured
      try {
        await supabase.auth.admin.inviteUserByEmail(inviteEmail.trim().toLowerCase(), {
          redirectTo: `${window.location.origin}/invite/${newToken}`,
        });
      } catch (err) {
        // Fallback: system created link manually
      }

      addToast("success", `Invitation envoyée avec succès à ${inviteEmail}`);
      setInviteEmail("");
      fetchData();
    } catch (err: any) {
      addToast("error", err.message || "Erreur lors de l'envoi de l'invitation.");
    } finally {
      setSendingInvite(false);
    }
  };

  // Resend invitation
  const handleResendInvite = async (invitation: InvitationRecord) => {
    try {
      // Cancel old
      await supabase
        .from("invitations")
        .update({ status: "cancelled" })
        .eq("id", invitation.id);

      // Create new
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
      const newToken = crypto.randomUUID();

      const { error: insertErr } = await supabase.from("invitations").insert({
        email: invitation.email,
        role: invitation.role,
        token: newToken,
        status: "pending",
        expires_at: expiresAt.toISOString(),
        created_by: currentUser?.id,
      });

      if (insertErr) throw insertErr;

      addToast("success", `Invitation renvoyée à ${invitation.email}`);
      fetchData();
    } catch (err: any) {
      addToast("error", err.message || "Erreur lors de la réexpéditon.");
    }
  };

  // Cancel invitation
  const handleCancelInvite = (invitation: InvitationRecord) => {
    setModalConfig({
      isOpen: true,
      title: "Annuler l'invitation",
      message: `Êtes-vous sûr de vouloir annuler l'invitation envoyée à ${invitation.email} ? Le lien deviendra invalide.`,
      confirmText: "Annuler l'invitation",
      variant: "danger",
      onConfirm: async () => {
        setModalConfig((prev) => ({ ...prev, isOpen: false }));
        try {
          await supabase
            .from("invitations")
            .update({ status: "cancelled" })
            .eq("id", invitation.id);
          addToast("info", "Invitation annulée.");
          fetchData();
        } catch (err: any) {
          addToast("error", err.message || "Erreur lors de l'annulation.");
        }
      },
    });
  };

  // Change member role
  const handleChangeRole = (member: MemberRecord, newRole: "admin" | "membre_bureau" | "membre_actif") => {
    setModalConfig({
      isOpen: true,
      title: "Changer le rôle du membre",
      message: `Voulez-vous modifier le rôle de ${member.first_name} ${member.last_name} en "${
        newRole === "admin" ? "Admin" : newRole === "membre_bureau" ? "Membre du Bureau" : "Membre Actif"
      }" ?`,
      confirmText: "Confirmer la modification",
      variant: "warning",
      onConfirm: async () => {
        setModalConfig((prev) => ({ ...prev, isOpen: false }));
        try {
          await supabase
            .from("profiles")
            .update({ role: newRole })
            .eq("id", member.id);
          addToast("success", `Rôle mis à jour pour ${member.first_name}`);
          fetchData();
        } catch (err: any) {
          addToast("error", err.message || "Erreur lors du changement de rôle.");
        }
      },
    });
  };

  // Delete member
  const handleDeleteMember = (member: MemberRecord) => {
    setModalConfig({
      isOpen: true,
      title: "Supprimer le membre",
      message: `Êtes-vous sûr de vouloir supprimer le compte de ${member.first_name} ${member.last_name} ? Cette action est irréversible.`,
      confirmText: "Supprimer",
      variant: "danger",
      onConfirm: async () => {
        setModalConfig((prev) => ({ ...prev, isOpen: false }));
        try {
          await supabase.from("profiles").delete().eq("id", member.id);
          addToast("info", "Membre supprimé avec succès.");
          fetchData();
        } catch (err: any) {
          addToast("error", err.message || "Erreur lors de la suppression.");
        }
      },
    });
  };

  if (loadingUser) {
    return (
      <div className="min-h-screen bg-[#121414] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-custom-amber animate-spin" />
      </div>
    );
  }

  // Calculate invitation stats
  const countAccepted = invitations.filter((i) => i.status === "accepted").length;
  const countPending = invitations.filter((i) => i.status === "pending").length;
  const countExpired = invitations.filter((i) => i.status === "expired").length;

  // Calculate member stats
  const countActifs = members.filter((m) => m.role === "membre_actif" || m.role === "membre").length;
  const countBureau = members.filter((m) => m.role === "membre_bureau" || m.role === "bureau").length;
  const countAdmins = members.filter((m) => m.role === "admin").length;

  // Filtered members list
  const filteredMembers = members.filter(
    (m) =>
      `${m.first_name} ${m.last_name}`.toLowerCase().includes(memberSearch.toLowerCase()) ||
      m.email.toLowerCase().includes(memberSearch.toLowerCase())
  );

  // Invitation table columns definition
  const invitationColumns: Column<InvitationRecord>[] = [
    {
      header: "Email",
      accessorKey: "email",
      cell: (row) => <span className="font-semibold text-white">{row.email}</span>,
    },
    {
      header: "Rôle",
      cell: (row) => <RoleBadge role={row.role} size="sm" />,
    },
    {
      header: "Statut",
      cell: (row) => {
        switch (row.status) {
          case "accepted":
            return (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-400">
                <CheckCircle2 className="w-3.5 h-3.5" /> Acceptée
              </span>
            );
          case "expired":
            return (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-400">
                <AlertTriangle className="w-3.5 h-3.5" /> Expirée
              </span>
            );
          case "cancelled":
            return (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/40">
                <Ban className="w-3.5 h-3.5" /> Annulée
              </span>
            );
          case "pending":
          default:
            return (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-custom-amber">
                <Clock className="w-3.5 h-3.5" /> En attente
              </span>
            );
        }
      },
    },
    {
      header: "Envoyée le",
      cell: (row) => new Date(row.created_at).toLocaleDateString("fr-FR"),
    },
    {
      header: "Expire le",
      cell: (row) => new Date(row.expires_at).toLocaleDateString("fr-FR"),
    },
    {
      header: "Actions",
      cell: (row) => (
        <div className="flex items-center gap-2">
          {row.status === "pending" && (
            <>
              <button
                onClick={() => handleResendInvite(row)}
                className="px-2.5 py-1 rounded-lg border border-custom-amber/40 text-custom-amber hover:bg-custom-amber hover:text-black text-xs font-semibold transition-all cursor-pointer flex items-center gap-1"
              >
                <RotateCw className="w-3 h-3" /> Renvoyer
              </button>
              <button
                onClick={() => handleCancelInvite(row)}
                className="px-2 py-1 rounded-lg text-white/50 hover:text-red-400 hover:bg-red-500/10 text-xs transition-colors cursor-pointer"
              >
                Annuler
              </button>
            </>
          )}
          {row.status === "expired" && (
            <button
              onClick={() => handleResendInvite(row)}
              className="px-2.5 py-1 rounded-lg border border-custom-amber/40 text-custom-amber hover:bg-custom-amber hover:text-black text-xs font-semibold transition-all cursor-pointer flex items-center gap-1"
            >
              <RotateCw className="w-3 h-3" /> Renvoyer
            </button>
          )}
          {row.status === "accepted" && (
            <span className="text-xs text-white/40 italic">Utilisée</span>
          )}
          {row.status === "cancelled" && (
            <span className="text-xs text-white/40 italic">Annulée</span>
          )}
        </div>
      ),
    },
  ];

  // Member table columns definition
  const memberColumns: Column<MemberRecord>[] = [
    {
      header: "Membre",
      cell: (row) => (
        <div>
          <div className="font-bold text-white">
            {row.first_name} {row.last_name}
          </div>
          <div className="text-xs text-[#888]">{row.email}</div>
        </div>
      ),
    },
    {
      header: "Rôle actuel",
      cell: (row) => <RoleBadge role={row.role} size="sm" />,
    },
    {
      header: "Changer le rôle",
      cell: (row) => (
        <select
          value={row.role}
          onChange={(e) =>
            handleChangeRole(row, e.target.value as "admin" | "membre_bureau" | "membre_actif")
          }
          className="bg-[#1e2020] border border-[#333535] focus:border-custom-amber text-xs text-[#e2e2e2] rounded-lg px-2.5 py-1.5 outline-none cursor-pointer"
        >
          <option value="membre_actif">Membre Actif</option>
          <option value="membre_bureau">Membre du Bureau</option>
          <option value="admin">Administrateur</option>
        </select>
      ),
    },
    {
      header: "Membre depuis",
      cell: (row) => new Date(row.created_at).toLocaleDateString("fr-FR"),
    },
    {
      header: "Actions",
      cell: (row) => (
        <button
          onClick={() => handleDeleteMember(row)}
          className="p-1.5 rounded-lg text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
          title="Supprimer le membre"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-[#121414] text-[#e2e2e2] flex flex-col font-sans">
      {/* Toast Notifications */}
      <Toast toasts={toasts} onDismiss={dismissToast} />

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmText={modalConfig.confirmText}
        variant={modalConfig.variant}
        onConfirm={modalConfig.onConfirm}
        onCancel={() => setModalConfig((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Topbar Header */}
      <header className="bg-[#1e2020] border-b border-[#2a2c2c] px-6 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-black border border-custom-amber/30 overflow-hidden shadow-[0_0_10px_rgba(252,163,17,0.2)]">
            <img src="/logo-cgi.jpg" alt="CGI ENIT" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white leading-tight">CGI ENIT Admin</h1>
            <p className="text-[10px] text-custom-gray/60 uppercase tracking-wider font-semibold">
              Console de Gestion
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3">
            <RoleBadge role="admin" size="sm" />
            <div className="text-right">
              <div className="text-xs font-bold text-white">
                {currentUser?.user_metadata?.first_name || "Admin"} {currentUser?.user_metadata?.last_name || ""}
              </div>
              <div className="text-[10px] text-[#888]">{currentUser?.email}</div>
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-custom-amber/20 border border-custom-amber/40 flex items-center justify-center text-custom-amber font-bold text-sm shadow-[0_0_10px_rgba(252,163,17,0.15)]">
            {currentUser?.email?.substring(0, 2).toUpperCase() || "AD"}
          </div>
        </div>
      </header>

      {/* Main Layout Container */}
      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <Sidebar activeItem={activeTab} onSelectTab={setActiveTab} onSignOut={handleSignOut} />

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-8 md:p-12 pb-24 md:pb-12 max-w-7xl mx-auto w-full">
          {/* TAB 1: INVITATIONS */}
          {activeTab === "invitations" && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {/* Header Title */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-custom-amber/10 border border-custom-amber/30 flex items-center justify-center text-custom-amber">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-2xl font-extrabold text-white tracking-tight">Invitations</h2>
                  <p className="text-xs text-[#888]">
                    Invitez des membres à rejoindre le portail CGI ENIT avec des rôles spécifiques.
                  </p>
                </div>
              </div>

              {/* Formulaire "Nouvelle invitation" */}
              <div className="bg-[#14213d] border border-[#333535] hover:border-custom-amber/50 rounded-3xl p-6 sm:p-8 transition-all duration-300 shadow-xl">
                <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <Send className="w-4 h-4 text-custom-amber" />
                  Nouvelle invitation
                </h3>
                <form onSubmit={handleSendInvite} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                  {/* Input Email */}
                  <div className="md:col-span-5 space-y-1.5">
                    <label className="text-xs font-semibold text-[#888] uppercase tracking-wider">
                      Adresse email de l'invité
                    </label>
                    <input
                      type="email"
                      required
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="membre@enit.utm.tn"
                      className="w-full bg-[#1e2020] border border-[#333535] focus:border-custom-amber rounded-xl py-3 px-4 text-[#e2e2e2] text-sm outline-none transition-all focus:shadow-[0_0_15px_rgba(252,163,17,0.15)] placeholder-[#555]"
                    />
                  </div>

                  {/* Dropdown Rôle */}
                  <div className="md:col-span-3 space-y-1.5">
                    <label className="text-xs font-semibold text-[#888] uppercase tracking-wider">
                      Rôle attribué
                    </label>
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value as any)}
                      className="w-full bg-[#1e2020] border border-[#333535] focus:border-custom-amber text-[#e2e2e2] text-sm rounded-xl py-3 px-4 outline-none cursor-pointer"
                    >
                      <option value="membre_actif">Membre Actif</option>
                      <option value="membre_bureau">Membre du Bureau</option>
                    </select>
                  </div>

                  {/* Dropdown Expiration */}
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-xs font-semibold text-[#888] uppercase tracking-wider">
                      Validité
                    </label>
                    <select
                      value={inviteDuration}
                      onChange={(e) => setInviteDuration(Number(e.target.value))}
                      className="w-full bg-[#1e2020] border border-[#333535] focus:border-custom-amber text-[#e2e2e2] text-sm rounded-xl py-3 px-4 outline-none cursor-pointer"
                    >
                      <option value={3}>3 jours</option>
                      <option value={7}>7 jours</option>
                      <option value={14}>14 jours</option>
                      <option value={30}>30 jours</option>
                    </select>
                  </div>

                  {/* Submit Button */}
                  <div className="md:col-span-2">
                    <button
                      type="submit"
                      disabled={sendingInvite}
                      className="w-full bg-custom-amber hover:bg-[#ffc887] text-black font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(252,163,17,0.2)] disabled:opacity-50"
                    >
                      {sendingInvite ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <span>Envoyer</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Stats Résumé */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-[#1e2020] border border-[#333535] rounded-2xl p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-2xl font-extrabold text-white">{countAccepted}</div>
                    <div className="text-xs text-[#888]">Invitations acceptées</div>
                  </div>
                </div>

                <div className="bg-[#1e2020] border border-[#333535] rounded-2xl p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-custom-amber/10 border border-custom-amber/30 text-custom-amber flex items-center justify-center">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-2xl font-extrabold text-white">{countPending}</div>
                    <div className="text-xs text-[#888]">Invitations en attente</div>
                  </div>
                </div>

                <div className="bg-[#1e2020] border border-[#333535] rounded-2xl p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-2xl font-extrabold text-white">{countExpired}</div>
                    <div className="text-xs text-[#888]">Invitations expirées</div>
                  </div>
                </div>
              </div>

              {/* Tableau Invitations */}
              <div className="space-y-3">
                <h3 className="text-base font-bold text-white">Invitations envoyées</h3>
                <DataTable columns={invitationColumns} data={invitations} emptyMessage="Aucune invitation envoyée pour le moment." />
              </div>
            </motion.div>
          )}

          {/* TAB 2: MEMBRES */}
          {activeTab === "membres" && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {/* Header Title */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-custom-amber/10 border border-custom-amber/30 flex items-center justify-center text-custom-amber">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-2xl font-extrabold text-white tracking-tight">Membres du club</h2>
                  <p className="text-xs text-[#888]">
                    Gérez les rôles et les accès des membres enregistrés.
                  </p>
                </div>
              </div>

              {/* Stats Members */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-[#1e2020] border border-[#333535] rounded-2xl p-4">
                  <div className="text-xs text-[#888] mb-1">Total Membres</div>
                  <div className="text-2xl font-extrabold text-white">{members.length}</div>
                </div>
                <div className="bg-[#1e2020] border border-[#333535] rounded-2xl p-4">
                  <div className="text-xs text-[#888] mb-1">Membres Actifs</div>
                  <div className="text-2xl font-extrabold text-custom-amber">{countActifs}</div>
                </div>
                <div className="bg-[#1e2020] border border-[#333535] rounded-2xl p-4">
                  <div className="text-xs text-[#888] mb-1">Membres du Bureau</div>
                  <div className="text-2xl font-extrabold text-blue-400">{countBureau}</div>
                </div>
                <div className="bg-[#1e2020] border border-[#333535] rounded-2xl p-4">
                  <div className="text-xs text-[#888] mb-1">Administrateurs</div>
                  <div className="text-2xl font-extrabold text-amber-500">{countAdmins}</div>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative max-w-md">
                <Search className="w-4 h-4 text-[#666] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  placeholder="Rechercher un membre par nom ou email..."
                  className="w-full bg-[#1e2020] border border-[#333535] focus:border-custom-amber rounded-xl py-2.5 pl-10 pr-4 text-xs text-[#e2e2e2] outline-none"
                />
              </div>

              {/* Tableau Membres */}
              <DataTable columns={memberColumns} data={filteredMembers} emptyMessage="Aucun membre trouvé dans la base de données." />
            </motion.div>
          )}

          {/* TAB 3, 4, 5: COMING SOON PLACES */}
          {["contenu", "temoignages", "parametres"].includes(activeTab) && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="py-12 flex items-center justify-center"
            >
              <div className="bg-[#14213d]/60 border border-[#333535] rounded-3xl p-12 text-center max-w-lg w-full backdrop-blur-xl shadow-2xl space-y-4">
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="w-16 h-16 rounded-2xl bg-custom-amber/10 border border-custom-amber/30 text-custom-amber mx-auto flex items-center justify-center shadow-[0_0_20px_rgba(252,163,17,0.15)]"
                >
                  {activeTab === "contenu" && <FileText className="w-8 h-8" />}
                  {activeTab === "temoignages" && <MessageSquare className="w-8 h-8" />}
                  {activeTab === "parametres" && <Settings className="w-8 h-8" />}
                </motion.div>
                <h3 className="text-2xl font-bold text-white capitalize">
                  {activeTab === "contenu" ? "Gestion du Contenu" : activeTab === "temoignages" ? "Gestion des Témoignages" : "Paramètres du Système"}
                </h3>
                <p className="text-sm text-custom-gray/70 leading-relaxed">
                  Cette fonctionnalité arrive bientôt dans la prochaine version du portail CGI ENIT.
                </p>
              </div>
            </motion.div>
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav activeItem={activeTab} onSelectTab={setActiveTab} onSignOut={handleSignOut} />
    </div>
  );
}
