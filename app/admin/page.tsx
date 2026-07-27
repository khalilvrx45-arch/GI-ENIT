"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Mail,
  Users,
  FileText,
  MessageSquare,
  Settings,
  Clock,
  CheckCircle2,
  AlertCircle,
  Ban,
  RotateCw,
  Trash2,
  Send,
  Loader2,
  Search,
  Bell,
  LogOut,
  Wrench,
  Download,
  Filter,
  UserPlus,
  Copy,
  Check,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

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
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // Member search
  const [memberSearch, setMemberSearch] = useState("");

  // Pagination states
  const [invitePage, setInvitePage] = useState(1);
  const itemsPerPage = 6;

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
      const { data: inviteData, error: inviteErr } = await supabase
        .from("invitations")
        .select("*")
        .order("created_at", { ascending: false });

      if (!inviteErr && inviteData) {
        const now = new Date();
        const updatedInvites = inviteData.map((inv) => {
          if (inv.status === "pending" && new Date(inv.expires_at) < now) {
            return { ...inv, status: "expired" as const };
          }
          return inv;
        });
        setInvitations(updatedInvites);
      }

      const { data: memberData, error: memberErr } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (!memberErr && memberData) {
        setMembers(memberData);
      }
    } catch (err) {
      // Database loading
    } finally {
      setLoadingData(false);
    }
  }, [supabase]);

  useEffect(() => {
    if (currentUser) {
      fetchData();
    }
  }, [currentUser, fetchData]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setSendingInvite(true);
    try {
      const response = await fetch("/api/admin/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: inviteEmail.trim(),
          role: inviteRole,
          duration: inviteDuration,
          created_by: currentUser?.id,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erreur lors de la création de l'invitation.");
      }

      if (result.emailSent) {
        addToast("success", `Invitation envoyée par email à ${inviteEmail}`);
      } else {
        addToast(
          "success",
          `Invitation créée ! Lien : ${result.inviteLink}`
        );
      }

      setInviteEmail("");
      fetchData();
    } catch (err: any) {
      addToast("error", err.message || "Erreur lors de l'envoi de l'invitation.");
    } finally {
      setSendingInvite(false);
    }
  };

  const handleCopyLink = (token: string) => {
    const link = `${window.location.origin}/invite/${token}`;
    navigator.clipboard.writeText(link);
    setCopiedToken(token);
    addToast("info", "Lien d'invitation copié dans le presse-papier !");
    setTimeout(() => setCopiedToken(null), 3000);
  };

  const handleResendInvite = async (invitation: InvitationRecord) => {
    try {
      await supabase
        .from("invitations")
        .update({ status: "cancelled" })
        .eq("id", invitation.id);

      const response = await fetch("/api/admin/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: invitation.email,
          role: invitation.role,
          duration: 7,
          created_by: currentUser?.id,
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);

      addToast("success", `Nouvelle invitation créée pour ${invitation.email}`);
      fetchData();
    } catch (err: any) {
      addToast("error", err.message || "Erreur lors de la réexpédition.");
    }
  };

  const handleCancelInvite = (invitation: InvitationRecord) => {
    setModalConfig({
      isOpen: true,
      title: "Annuler l'invitation",
      message: `Voulez-vous annuler l'invitation pour ${invitation.email} ?`,
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

  const handleDeleteInvite = (invitation: InvitationRecord) => {
    setModalConfig({
      isOpen: true,
      title: "Supprimer l'invitation",
      message: `Voulez-vous supprimer définitivement l'invitation pour ${invitation.email} ?`,
      confirmText: "Supprimer",
      variant: "danger",
      onConfirm: async () => {
        setModalConfig((prev) => ({ ...prev, isOpen: false }));
        try {
          const { error } = await supabase
            .from("invitations")
            .delete()
            .eq("id", invitation.id);

          if (error) throw error;

          addToast("info", "Invitation supprimée des archives.");
          fetchData();
        } catch (err: any) {
          addToast("error", err.message || "Erreur lors de la suppression.");
        }
      },
    });
  };

  const handleChangeRole = (member: MemberRecord, newRole: "admin" | "membre_bureau" | "membre_actif") => {
    setModalConfig({
      isOpen: true,
      title: "Changer le rôle",
      message: `Modifier le rôle de ${member.first_name || member.email} en ${newRole} ?`,
      confirmText: "Confirmer",
      variant: "warning",
      onConfirm: async () => {
        setModalConfig((prev) => ({ ...prev, isOpen: false }));
        try {
          await supabase.from("profiles").update({ role: newRole }).eq("id", member.id);
          addToast("success", `Rôle mis à jour.`);
          fetchData();
        } catch (err: any) {
          addToast("error", err.message || "Erreur lors de la mise à jour.");
        }
      },
    });
  };

  const handleDeleteMember = (member: MemberRecord) => {
    setModalConfig({
      isOpen: true,
      title: "Supprimer le membre",
      message: `Supprimer définitivement le compte de ${member.email} ?`,
      confirmText: "Supprimer",
      variant: "danger",
      onConfirm: async () => {
        setModalConfig((prev) => ({ ...prev, isOpen: false }));
        try {
          await supabase.from("profiles").delete().eq("id", member.id);
          addToast("info", "Membre supprimé.");
          fetchData();
        } catch (err: any) {
          addToast("error", err.message || "Erreur de suppression.");
        }
      },
    });
  };

  if (loadingUser) {
    return (
      <div className="min-h-screen bg-[#0d0f0f] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#fca311] animate-spin" />
      </div>
    );
  }

  // Calculate statistics
  const countAccepted = invitations.filter((i) => i.status === "accepted").length;
  const countPending = invitations.filter((i) => i.status === "pending").length;
  const countExpired = invitations.filter((i) => i.status === "expired").length;

  const countActifs = members.filter((m) => m.role === "membre_actif").length;
  const countBureau = members.filter((m) => m.role === "membre_bureau").length;
  const countAdmins = members.filter((m) => m.role === "admin").length;

  const filteredMembers = members.filter(
    (m) =>
      `${m.first_name || ""} ${m.last_name || ""}`.toLowerCase().includes(memberSearch.toLowerCase()) ||
      m.email.toLowerCase().includes(memberSearch.toLowerCase())
  );

  // Pagination calculation
  const totalInvitePages = Math.ceil(invitations.length / itemsPerPage) || 1;
  const paginatedInvitations = invitations.slice(
    (invitePage - 1) * itemsPerPage,
    invitePage * itemsPerPage
  );

  return (
    <div className="min-h-screen bg-[#121414] text-[#e2e2e2] flex font-sans select-none">
      <Toast toasts={toasts} onDismiss={dismissToast} />
      <ConfirmModal
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmText={modalConfig.confirmText}
        variant={modalConfig.variant}
        onConfirm={modalConfig.onConfirm}
        onCancel={() => setModalConfig((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* SIDEBAR (Stitch "Kinetic Forge" Theme) */}
      <aside className="w-64 bg-[#121414] border-r border-[#1a1c1c] flex flex-col justify-between p-6 hidden md:flex shrink-0">
        <div className="space-y-8">
          {/* Brand Header */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-black border border-[#333535] flex items-center justify-center p-1 shadow">
              <img src="/logo-cgi.jpg" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-base font-extrabold text-white tracking-wider uppercase font-mono">
                CGI ENIT
              </h1>
              <p className="text-[10px] text-[#888] tracking-widest uppercase font-mono">
                ADMIN TERMINAL
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5 font-mono text-sm">
            {[
              { id: "invitations", label: "Invitations", icon: Mail },
              { id: "membres", label: "Members", icon: Users },
              { id: "contenu", label: "Content", icon: FileText },
              { id: "temoignages", label: "Testimonials", icon: MessageSquare },
              { id: "parametres", label: "Settings", icon: Settings },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#1e2020] text-white border-l-2 border-[#fca311]"
                      : "text-[#888] hover:text-white hover:bg-[#1a1c1c]"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-[#fca311]" : ""}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Logout */}
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-4 py-3 text-sm text-[#888] hover:text-red-400 font-mono transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar Header */}
        <header className="h-16 border-b border-[#1a1c1c] px-6 sm:px-8 flex items-center justify-between bg-[#121414] sticky top-0 z-20">
          <div className="flex items-center gap-3">
            {activeTab === "invitations" && <Mail className="w-5 h-5 text-[#fca311]" />}
            {activeTab === "membres" && <Users className="w-5 h-5 text-[#fca311]" />}
            {["contenu", "temoignages", "parametres"].includes(activeTab) && (
              <Wrench className="w-5 h-5 text-[#fca311]" />
            )}
            <h2 className="text-xl font-extrabold text-white tracking-tight font-mono uppercase">
              {activeTab === "invitations"
                ? "Invitations"
                : activeTab === "membres"
                ? "Club Members"
                : "CGI ENIT"}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-[#888] hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
            </button>

            <div className="h-6 w-[1px] bg-[#222]" />

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-white font-mono">
                  {currentUser?.user_metadata?.first_name || "Admin User"}
                </div>
                <div className="text-[10px] text-[#fca311] font-mono tracking-wider uppercase">
                  SUPER ADMIN
                </div>
              </div>
              <div className="w-9 h-9 rounded-lg bg-[#1e2020] border border-[#333535] flex items-center justify-center text-white font-mono text-sm font-bold shadow">
                {currentUser?.email?.substring(0, 2).toUpperCase() || "AD"}
              </div>
            </div>
          </div>
        </header>

        {/* Content View */}
        <main className="p-6 sm:p-8 flex-1 overflow-y-auto max-w-7xl w-full mx-auto space-y-6">
          {/* TAB 1: INVITATIONS */}
          {activeTab === "invitations" && (
            <div className="space-y-6">
              {/* Top Grid: Form + Stats */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* New Invitation Form */}
                <div className="lg:col-span-8 bg-[#14213d] border border-[#333535] rounded-xl p-6 shadow-xl">
                  <div className="flex items-center gap-2 mb-6 text-white font-mono font-bold text-sm">
                    <UserPlus className="w-4 h-4 text-[#fca311]" />
                    <span>New invitation</span>
                  </div>

                  <form onSubmit={handleSendInvite} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      {/* Email Input */}
                      <div className="md:col-span-5 space-y-1.5">
                        <label className="text-[10px] font-bold text-[#888] font-mono uppercase tracking-wider">
                          EMAIL ADDRESS
                        </label>
                        <input
                          type="email"
                          required
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          placeholder="user@example.com"
                          className="w-full bg-[#121414] border border-[#333535] focus:border-[#fca311] rounded-lg py-2.5 px-3 text-xs text-white font-mono outline-none"
                        />
                      </div>

                      {/* Role Dropdown */}
                      <div className="md:col-span-4 space-y-1.5">
                        <label className="text-[10px] font-bold text-[#888] font-mono uppercase tracking-wider">
                          ROLE
                        </label>
                        <select
                          value={inviteRole}
                          onChange={(e) => setInviteRole(e.target.value as any)}
                          className="w-full bg-[#121414] border border-[#333535] focus:border-[#fca311] rounded-lg py-2.5 px-3 text-xs text-white font-mono outline-none cursor-pointer"
                        >
                          <option value="membre_actif">Active Member</option>
                          <option value="membre_bureau">Board Member</option>
                        </select>
                      </div>

                      {/* Validity Dropdown */}
                      <div className="md:col-span-3 space-y-1.5">
                        <label className="text-[10px] font-bold text-[#888] font-mono uppercase tracking-wider">
                          VALIDITY
                        </label>
                        <select
                          value={inviteDuration}
                          onChange={(e) => setInviteDuration(Number(e.target.value))}
                          className="w-full bg-[#121414] border border-[#333535] focus:border-[#fca311] rounded-lg py-2.5 px-3 text-xs text-white font-mono outline-none cursor-pointer"
                        >
                          <option value={3}>3 days</option>
                          <option value={7}>7 days</option>
                          <option value={14}>14 days</option>
                        </select>
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        type="submit"
                        disabled={sendingInvite}
                        className="bg-[#fca311] hover:bg-[#ffc887] text-black font-mono font-bold text-xs uppercase py-2.5 px-6 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(252,163,17,0.2)] disabled:opacity-50"
                      >
                        {sendingInvite ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            <span>SUBMIT</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>

                {/* KPI Cards Stack */}
                <div className="lg:col-span-4 space-y-3">
                  {/* Accepted */}
                  <div className="bg-[#14213d] border border-green-500/40 rounded-xl p-4 flex items-center justify-between shadow">
                    <div>
                      <div className="text-[10px] font-bold text-[#888] font-mono uppercase tracking-wider">
                        ACCEPTED
                      </div>
                      <div className="text-2xl font-extrabold text-white font-mono mt-0.5">
                        {countAccepted}
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-green-500/10 border border-green-500/40 text-green-400 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Pending */}
                  <div className="bg-[#14213d] border border-[#fca311]/40 rounded-xl p-4 flex items-center justify-between shadow">
                    <div>
                      <div className="text-[10px] font-bold text-[#888] font-mono uppercase tracking-wider">
                        PENDING
                      </div>
                      <div className="text-2xl font-extrabold text-white font-mono mt-0.5">
                        {countPending}
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-[#fca311]/10 border border-[#fca311]/40 text-[#fca311] flex items-center justify-center">
                      <Clock className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Expired */}
                  <div className="bg-[#14213d] border border-red-500/40 rounded-xl p-4 flex items-center justify-between shadow">
                    <div>
                      <div className="text-[10px] font-bold text-[#888] font-mono uppercase tracking-wider">
                        EXPIRED
                      </div>
                      <div className="text-2xl font-extrabold text-white font-mono mt-0.5">
                        {countExpired}
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-red-500/10 border border-red-500/40 text-red-400 flex items-center justify-center">
                      <AlertCircle className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Table: Invitation Logs */}
              <div className="bg-[#14213d] border border-[#333535] rounded-xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-[#2a2c2c] pb-4">
                  <h3 className="text-sm font-bold text-white font-mono">Invitation Logs</h3>
                  <div className="flex items-center gap-2">
                    <button className="p-1.5 text-[#888] hover:text-white transition-colors">
                      <Filter className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 text-[#888] hover:text-white transition-colors">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left font-mono text-xs">
                    <thead>
                      <tr className="border-b border-[#2a2c2c] text-[#888] uppercase text-[10px] tracking-wider">
                        <th className="py-3 px-4">EMAIL</th>
                        <th className="py-3 px-4">ROLE</th>
                        <th className="py-3 px-4">STATUS</th>
                        <th className="py-3 px-4">SENT DATE</th>
                        <th className="py-3 px-4">EXPIRES DATE</th>
                        <th className="py-3 px-4 text-right">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2a2c2c]">
                      {paginatedInvitations.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-[#666]">
                            No invitations sent yet.
                          </td>
                        </tr>
                      ) : (
                        paginatedInvitations.map((row) => (
                          <tr key={row.id} className="hover:bg-[#1e2020]/50 transition-colors">
                            <td className="py-3.5 px-4 font-semibold text-white">{row.email}</td>
                            <td className="py-3.5 px-4">
                              <span className="px-2 py-0.5 rounded-full border border-[#333535] bg-[#121414] text-[10px] text-[#aaa] uppercase font-bold tracking-wider">
                                {row.role === "membre_bureau" ? "BOARD MEMBER" : "ACTIVE MEMBER"}
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              {row.status === "accepted" && (
                                <span className="inline-flex items-center gap-1 text-green-400 font-bold text-[11px]">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Accepted
                                </span>
                              )}
                              {row.status === "pending" && (
                                <span className="inline-flex items-center gap-1 text-[#fca311] font-bold text-[11px]">
                                  <Clock className="w-3.5 h-3.5" /> Pending
                                </span>
                              )}
                              {row.status === "expired" && (
                                <span className="inline-flex items-center gap-1 text-red-400 font-bold text-[11px]">
                                  <AlertCircle className="w-3.5 h-3.5" /> Expired
                                </span>
                              )}
                              {row.status === "cancelled" && (
                                <span className="inline-flex items-center gap-1 text-white/40 font-bold text-[11px]">
                                  <Ban className="w-3.5 h-3.5" /> Cancelled
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-[#aaa]">
                              {new Date(row.created_at).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </td>
                            <td className="py-3.5 px-4 text-[#aaa]">
                              {row.status === "accepted"
                                ? "Completed"
                                : new Date(row.expires_at).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {row.status === "pending" && (
                                  <>
                                    <button
                                      onClick={() => handleCopyLink(row.token)}
                                      className="px-2 py-1 rounded border border-[#333535] hover:border-[#fca311] text-[10px] text-[#fca311] font-bold uppercase transition-colors flex items-center gap-1"
                                      title="Copier le lien d'invitation"
                                    >
                                      {copiedToken === row.token ? (
                                        <Check className="w-3 h-3 text-green-400" />
                                      ) : (
                                        <Copy className="w-3 h-3" />
                                      )}
                                      <span>{copiedToken === row.token ? "COPIED" : "LINK"}</span>
                                    </button>
                                    <button
                                      onClick={() => handleResendInvite(row)}
                                      className="px-2 py-1 rounded border border-[#333535] hover:border-[#fca311] text-[10px] text-white font-bold uppercase transition-colors"
                                    >
                                      RESEND
                                    </button>
                                    <button
                                      onClick={() => handleCancelInvite(row)}
                                      className="px-2 py-1 text-[10px] text-red-400 hover:underline uppercase"
                                    >
                                      CANCEL
                                    </button>
                                  </>
                                )}
                                {row.status === "expired" && (
                                  <button
                                    onClick={() => handleResendInvite(row)}
                                    className="px-2 py-1 rounded border border-[#333535] hover:border-[#fca311] text-[10px] text-white font-bold uppercase transition-colors"
                                  >
                                    RESEND
                                  </button>
                                )}
                                {row.status !== "accepted" && (
                                  <button
                                    onClick={() => handleDeleteInvite(row)}
                                    className="p-1 rounded text-[#888] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                    title="Supprimer l'invitation"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                {row.status === "accepted" && (
                                  <span className="text-[10px] text-[#555] italic">No actions</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between pt-2 border-t border-[#2a2c2c] font-mono text-xs text-[#888]">
                  <div>
                    Showing {paginatedInvitations.length} of {invitations.length} invitations
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      disabled={invitePage === 1}
                      onClick={() => setInvitePage((p) => Math.max(1, p - 1))}
                      className="px-2.5 py-1 rounded bg-[#121414] border border-[#333535] text-white disabled:opacity-30"
                    >
                      Prev
                    </button>
                    <span className="px-3 py-1 rounded bg-[#fca311] text-black font-bold">
                      {invitePage}
                    </span>
                    <button
                      disabled={invitePage >= totalInvitePages}
                      onClick={() => setInvitePage((p) => Math.min(totalInvitePages, p + 1))}
                      className="px-2.5 py-1 rounded bg-[#121414] border border-[#333535] text-white disabled:opacity-30"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MEMBERS */}
          {activeTab === "membres" && (
            <div className="space-y-6">
              {/* Top 4 KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
                <div className="bg-[#14213d] border border-[#333535] rounded-xl p-5 shadow space-y-2">
                  <div className="text-[10px] font-bold text-[#888] uppercase tracking-wider">
                    TOTAL MEMBERS
                  </div>
                  <div className="text-3xl font-extrabold text-white">{members.length}</div>
                  <div className="flex gap-1 pt-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="h-1.5 flex-1 bg-[#fca311] rounded-sm" />
                    ))}
                  </div>
                </div>

                <div className="bg-[#14213d] border border-[#333535] rounded-xl p-5 shadow space-y-2">
                  <div className="text-[10px] font-bold text-[#888] uppercase tracking-wider">
                    ACTIVE MEMBERS
                  </div>
                  <div className="text-3xl font-extrabold text-white">{countActifs}</div>
                  <div className="flex gap-1 pt-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-1.5 flex-1 bg-[#fca311] rounded-sm" />
                    ))}
                    <div className="h-1.5 flex-1 bg-[#222] rounded-sm" />
                  </div>
                </div>

                <div className="bg-[#14213d] border border-[#333535] rounded-xl p-5 shadow space-y-2">
                  <div className="text-[10px] font-bold text-[#888] uppercase tracking-wider">
                    BOARD MEMBERS
                  </div>
                  <div className="text-3xl font-extrabold text-white">{countBureau}</div>
                  <div className="flex gap-1 pt-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="h-1.5 flex-1 bg-[#fca311] rounded-sm" />
                    ))}
                  </div>
                </div>

                <div className="bg-[#14213d] border border-[#333535] rounded-xl p-5 shadow space-y-2">
                  <div className="text-[10px] font-bold text-[#888] uppercase tracking-wider">
                    ADMINS
                  </div>
                  <div className="text-3xl font-extrabold text-white">{countAdmins}</div>
                  <div className="flex gap-1 pt-1">
                    <div className="h-1.5 flex-1 bg-[#fca311] rounded-sm" />
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-1.5 flex-1 bg-[#222] rounded-sm" />
                    ))}
                  </div>
                </div>
              </div>

              {/* Members Table Section */}
              <div className="bg-[#14213d] border border-[#333535] rounded-xl p-6 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-[#2a2c2c]">
                  <div className="relative w-full sm:w-80">
                    <Search className="w-4 h-4 text-[#555] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={memberSearch}
                      onChange={(e) => setMemberSearch(e.target.value)}
                      placeholder="Search by name, email, or role..."
                      className="w-full bg-[#121414] border border-[#333535] focus:border-[#fca311] rounded-lg py-2 pl-9 pr-3 text-xs text-white font-mono outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button className="px-4 py-2 rounded-lg border border-[#333535] bg-[#121414] text-xs font-mono text-white flex items-center gap-2">
                      <Filter className="w-3.5 h-3.5" /> Filter
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left font-mono text-xs">
                    <thead>
                      <tr className="border-b border-[#2a2c2c] text-[#888] uppercase text-[10px] tracking-wider">
                        <th className="py-3 px-4">MEMBER</th>
                        <th className="py-3 px-4">CURRENT ROLE</th>
                        <th className="py-3 px-4">JOIN DATE</th>
                        <th className="py-3 px-4 text-right">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2a2c2c]">
                      {filteredMembers.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-[#666]">
                            No members found in database.
                          </td>
                        </tr>
                      ) : (
                        filteredMembers.map((row) => (
                          <tr key={row.id} className="hover:bg-[#1e2020]/50 transition-colors">
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-[#1e2020] border border-[#333535] flex items-center justify-center font-bold text-white text-xs">
                                  {row.email.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                  <div className="font-bold text-white">
                                    {row.first_name || row.last_name
                                      ? `${row.first_name || ""} ${row.last_name || ""}`
                                      : row.email.split("@")[0]}
                                  </div>
                                  <div className="text-[10px] text-[#888]">{row.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              <select
                                value={row.role}
                                onChange={(e) =>
                                  handleChangeRole(row, e.target.value as any)
                                }
                                className="bg-[#121414] border border-[#333535] focus:border-[#fca311] text-[10px] uppercase font-bold text-white rounded-full px-3 py-1 outline-none cursor-pointer"
                              >
                                <option value="membre_actif">Regular Member</option>
                                <option value="membre_bureau">Board Member</option>
                                <option value="admin">Admin</option>
                              </select>
                            </td>
                            <td className="py-3.5 px-4 text-[#aaa]">
                              {new Date(row.created_at).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <button
                                onClick={() => handleDeleteMember(row)}
                                className="p-1.5 rounded text-[#888] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3, 4, 5: COMING SOON */}
          {["contenu", "temoignages", "parametres"].includes(activeTab) && (
            <div className="py-12 flex items-center justify-center">
              <div className="bg-[#14213d] border border-[#333535] rounded-2xl p-10 text-center max-w-lg w-full shadow-2xl space-y-6 font-mono">
                <div className="w-16 h-16 rounded-full bg-[#1e2020] border border-[#333535] text-[#fca311] mx-auto flex items-center justify-center shadow">
                  <Wrench className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-extrabold text-white uppercase tracking-wider">
                    COMING SOON
                  </h3>
                  <div className="h-[2px] w-12 bg-[#fca311] mx-auto" />
                </div>

                <p className="text-xs text-[#888] leading-relaxed">
                  This feature is coming soon in the next version of the{" "}
                  <span className="text-white font-bold">CGI ENIT portal</span>. We are currently
                  engineering a high-performance environment for your content management.
                </p>

                <div className="space-y-2 text-left">
                  <div className="flex justify-between text-[10px] text-[#888]">
                    <span>SYSTEM CALIBRATION</span>
                    <span>84% COMPLETE</span>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-3 flex-1 bg-[#fca311] rounded-sm" />
                    ))}
                    <div className="h-3 flex-1 bg-[#222] rounded-sm" />
                  </div>
                </div>

                <div className="pt-2 flex justify-center gap-3">
                  <button
                    onClick={() => setActiveTab("invitations")}
                    className="bg-[#fca311] hover:bg-[#ffc887] text-black font-bold text-xs uppercase px-5 py-2.5 rounded-lg transition-colors"
                  >
                    Return to Dashboard
                  </button>
                </div>

                <div className="pt-4 border-t border-[#2a2c2c] flex justify-between items-center text-[10px] text-[#555]">
                  <span>⚡ Version 2.0.4-beta</span>
                  <span>🔒 Secure Terminal</span>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
