'use client'
import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Users,
  Search,
  Filter,
  Download,
  Plus,
  ShieldAlert,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Megaphone,
  BarChart3,
  Mail,
  RotateCw,
  Trash2,
  Eye,
  Tag,
  Clock,
  Send,
  UserCheck,
  UserX,
  FileSpreadsheet,
  Copy,
  Check,
  Ban,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { isAdmin, isBureauOrAdmin, getRoleLabel } from '@/lib/types/roles'
import MemberDetailModal from './MemberDetailModal'
import ConfirmActionModal from './ConfirmActionModal'
import SendAnnouncementModal from './SendAnnouncementModal'
import PresenceTracker from '@/components/membre/pole/PresenceTracker'
import AnnouncementFeed from '@/components/membre/announcements/AnnouncementFeed'

interface MemberManagementHubProps {
  currentProfile: any
}

export default function MemberManagementHub({ currentProfile }: MemberManagementHubProps) {
  const supabase = createClient()
  const userIsAdmin = isAdmin(currentProfile.role)

  const [activeTab, setActiveTab] = useState<'members' | 'attendance' | 'announcements' | 'stats' | 'invitations'>('members')

  // Members data state
  const [members, setMembers] = useState<any[]>([])
  const [loadingMembers, setLoadingMembers] = useState(true)
  const [selectedMember, setSelectedMember] = useState<any | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [yearFilter, setYearFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  // Attendance & Events state
  const [events, setEvents] = useState<any[]>([])
  const [selectedEventId, setSelectedEventId] = useState<string>('')
  const [eventRegistrations, setEventRegistrations] = useState<any[]>([])
  const [loadingEvents, setLoadingEvents] = useState(false)

  // Announcements state
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false)
  const [poles, setPoles] = useState<any[]>([])

  // Invitations state (Admin)
  const [invitations, setInvitations] = useState<any[]>([])
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'membre_actif' | 'membre_bureau'>('membre_actif')
  const [inviteDuration, setInviteDuration] = useState(7)
  const [sendingInvite, setSendingInvite] = useState(false)
  const [inviteMessage, setInviteMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [copiedToken, setCopiedToken] = useState<string | null>(null)

  // Confirm Modal state
  const [confirmModalConfig, setConfirmModalConfig] = useState<{
    isOpen: boolean
    title: string
    message: string
    confirmText?: string
    variant?: 'danger' | 'warning' | 'info'
    requireDoubleConfirmation?: boolean
    onConfirm: () => void
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  })

  // Fetch Members
  const fetchMembers = useCallback(async () => {
    setLoadingMembers(true)
    try {
      const res = await fetch('/api/admin/members')
      const data = await res.json()
      if (res.ok && Array.isArray(data.members) && data.members.length > 0) {
        setMembers(data.members)
      } else {
        // Fallback directly to client Supabase
        const { data: clientMembers, error: clientErr } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false })

        if (!clientErr && clientMembers) {
          setMembers(clientMembers)
        } else if (Array.isArray(data.members)) {
          setMembers(data.members)
        }
      }
    } catch (err) {
      console.error('Erreur chargement membres:', err)
      const { data: clientMembers } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
      if (clientMembers) {
        setMembers(clientMembers)
      }
    } finally {
      setLoadingMembers(false)
    }
  }, [supabase])

  // Fetch Events for Presence Tracker
  const fetchEvents = useCallback(async () => {
    setLoadingEvents(true)
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date_start', { ascending: false })

      if (!error && data) {
        setEvents(data)
        if (data.length > 0 && !selectedEventId) {
          setSelectedEventId(data[0].id)
        }
      }
    } catch (err) {
      console.error('Erreur chargement événements:', err)
    } finally {
      setLoadingEvents(false)
    }
  }, [supabase, selectedEventId])

  // Fetch Registrations for selected event
  const fetchEventRegistrations = useCallback(async (eventId: string) => {
    if (!eventId) return
    try {
      const { data, error } = await supabase
        .from('event_registrations')
        .select('*, profiles(first_name, last_name, email, role)')
        .eq('event_id', eventId)

      if (!error && data) {
        setEventRegistrations(data)
      }
    } catch (err) {
      console.error(err)
    }
  }, [supabase])

  // Fetch Announcements
  const fetchAnnouncements = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*, poles(name)')
        .order('pinned', { ascending: false })
        .order('created_at', { ascending: false })

      if (!error && data) {
        setAnnouncements(data)
      }
    } catch (err) {
      console.error(err)
    }
  }, [supabase])

  // Fetch Poles
  const fetchPoles = useCallback(async () => {
    try {
      const { data } = await supabase.from('poles').select('id, name')
      if (data) setPoles(data)
    } catch (err) {
      console.error(err)
    }
  }, [supabase])

  // Fetch Invitations (Admin)
  const fetchInvitations = useCallback(async () => {
    if (!userIsAdmin) return
    try {
      const { data } = await supabase
        .from('invitations')
        .select('*')
        .order('created_at', { ascending: false })

      if (data) setInvitations(data)
    } catch (err) {
      console.error(err)
    }
  }, [supabase, userIsAdmin])

  useEffect(() => {
    fetchMembers()
    fetchEvents()
    fetchAnnouncements()
    fetchPoles()
    fetchInvitations()
  }, [fetchMembers, fetchEvents, fetchAnnouncements, fetchPoles, fetchInvitations])

  useEffect(() => {
    if (selectedEventId) {
      fetchEventRegistrations(selectedEventId)
    }
  }, [selectedEventId, fetchEventRegistrations])

  // Filtered members list
  const filteredMembers = members.filter((m) => {
    const q = searchQuery.toLowerCase().trim()
    const matchesSearch =
      !q ||
      (m.email && m.email.toLowerCase().includes(q)) ||
      (m.first_name && m.first_name.toLowerCase().includes(q)) ||
      (m.last_name && m.last_name.toLowerCase().includes(q)) ||
      (m.phone && m.phone.toLowerCase().includes(q))

    const matchesRole = roleFilter === 'all' || m.role === roleFilter
    const matchesYear = yearFilter === 'all' || m.year === yearFilter
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && m.is_active !== false && m.status_flag !== 'inactif') ||
      (statusFilter === 'inactive' && (m.is_active === false || m.status_flag === 'inactif')) ||
      (statusFilter === 'a_relancer' && m.status_flag === 'a_relancer')

    return matchesSearch && matchesRole && matchesYear && matchesStatus
  })

  // Export CSV Handler
  const handleExportCSV = () => {
    window.open('/api/admin/members/export', '_blank')
  }

  // Handle Send Invitation
  const handleSendInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail.trim()) return

    setSendingInvite(true)
    setInviteMessage(null)
    try {
      const res = await fetch('/api/admin/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteEmail.trim(),
          role: inviteRole,
          duration: inviteDuration,
          created_by: currentProfile.id,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Échec de l\'envoi')

      setInviteMessage({
        type: 'success',
        text: data.emailSent
          ? `Invitation envoyée avec succès à ${inviteEmail}`
          : `Invitation créée ! Lien : ${data.inviteLink}`,
      })
      setInviteEmail('')
      fetchInvitations()
    } catch (err: any) {
      setInviteMessage({ type: 'error', text: err.message })
    } finally {
      setSendingInvite(false)
    }
  }

  // Invitation Actions
  const handleCopyInviteLink = (token: string) => {
    const link = `${window.location.origin}/invite/${token}`
    navigator.clipboard.writeText(link)
    setCopiedToken(token)
    setTimeout(() => setCopiedToken(null), 3000)
  }

  const handleResendInvite = async (inv: any) => {
    try {
      await supabase.from('invitations').update({ status: 'cancelled' }).eq('id', inv.id)
      const res = await fetch('/api/admin/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inv.email,
          role: inv.role,
          duration: 7,
          created_by: currentProfile.id,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur lors du renvoi')
      setInviteMessage({
        type: 'success',
        text: `Invitation renvoyée avec succès à ${inv.email}`,
      })
      fetchInvitations()
    } catch (err: any) {
      setInviteMessage({ type: 'error', text: err.message })
    }
  }

  const handleCancelInvite = (inv: any) => {
    setConfirmModalConfig({
      isOpen: true,
      title: `Annuler l'invitation pour ${inv.email} ?`,
      message: `Ce lien d'invitation ne sera plus utilisable par le destinataire.`,
      confirmText: `Annuler l'invitation`,
      variant: 'warning',
      onConfirm: async () => {
        try {
          await supabase.from('invitations').update({ status: 'cancelled' }).eq('id', inv.id)
          fetchInvitations()
        } catch (err: any) {
          alert(err.message)
        }
      },
    })
  }

  const handleDeleteInvite = (inv: any) => {
    setConfirmModalConfig({
      isOpen: true,
      title: `Supprimer l'invitation pour ${inv.email} ?`,
      message: `Cette invitation sera définitivement effacée de l'historique.`,
      confirmText: `Supprimer de l'historique`,
      variant: 'danger',
      onConfirm: async () => {
        try {
          await supabase.from('invitations').delete().eq('id', inv.id)
          fetchInvitations()
        } catch (err: any) {
          alert(err.message)
        }
      },
    })
  }

  // Handle Member Delete (Admin only)
  const handleDeleteMember = (member: any) => {
    setConfirmModalConfig({
      isOpen: true,
      title: `Supprimer ${member.first_name || ''} ${member.last_name || member.email} ?`,
      message: `Attention : cette action est irréversible. Le profil et les données du membre seront définitivement révoqués.`,
      confirmText: 'Supprimer définitivement',
      variant: 'danger',
      requireDoubleConfirmation: true,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/members?id=${member.id}`, { method: 'DELETE' })
          if (!res.ok) {
            const data = await res.json()
            throw new Error(data.error || 'Erreur lors de la suppression')
          }
          fetchMembers()
        } catch (err: any) {
          alert(err.message)
        }
      },
    })
  }

  // Stats calculation
  const totalMembersCount = members.length
  const activeMembersCount = members.filter((m) => m.is_active !== false && m.status_flag !== 'inactif').length
  const relancerCount = members.filter((m) => m.status_flag === 'a_relancer').length
  const inactiveCount = members.filter((m) => m.is_active === false || m.status_flag === 'inactif').length

  return (
    <div className="space-y-6 font-mono text-white">
      {/* Top Banner & Tab Navigation */}
      <div className="bg-[#14213d] border border-[#333535] rounded-2xl p-6 shadow-2xl space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-[#fca311]/10 text-[#fca311] border border-[#fca311]/30 text-[10px] font-extrabold uppercase tracking-wider">
                ESPACE {userIsAdmin ? 'ADMINISTRATEUR' : 'BUREAU'}
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white mt-1">
              Gestion du Club & Des Membres
            </h1>
            <p className="text-xs text-[#888] mt-1">
              Pilotez l'annuaire, émargement des événements, publications et invitations.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleExportCSV}
              className="px-4 py-2.5 rounded-xl border border-[#333535] bg-[#121414] hover:bg-[#1a1c1c] text-xs font-bold text-white flex items-center gap-2 transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-[#fca311]" />
              <span>Exporter CSV</span>
            </button>

            <button
              onClick={() => setIsAnnouncementModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-[#fca311] hover:bg-[#ffc887] text-black text-xs font-extrabold flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Megaphone className="w-4 h-4" />
              <span>Nouvelle Annonce</span>
            </button>
          </div>
        </div>

        {/* Tab Headers */}
        <div className="flex flex-wrap gap-2 border-t border-[#2a2c2c] pt-4 text-xs font-bold">
          <button
            onClick={() => setActiveTab('members')}
            className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'members'
                ? 'bg-[#fca311] text-black shadow-lg'
                : 'bg-[#121414] text-[#888] hover:text-white hover:bg-[#1a1c1c]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Membres ({totalMembersCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('attendance')}
            className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'attendance'
                ? 'bg-[#fca311] text-black shadow-lg'
                : 'bg-[#121414] text-[#888] hover:text-white hover:bg-[#1a1c1c]'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Émargement / Présence</span>
          </button>

          <button
            onClick={() => setActiveTab('announcements')}
            className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'announcements'
                ? 'bg-[#fca311] text-black shadow-lg'
                : 'bg-[#121414] text-[#888] hover:text-white hover:bg-[#1a1c1c]'
            }`}
          >
            <Megaphone className="w-4 h-4" />
            <span>Annonces ({announcements.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('stats')}
            className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'stats'
                ? 'bg-[#fca311] text-black shadow-lg'
                : 'bg-[#121414] text-[#888] hover:text-white hover:bg-[#1a1c1c]'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Statistiques</span>
          </button>

          {userIsAdmin && (
            <button
              onClick={() => setActiveTab('invitations')}
              className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'invitations'
                  ? 'bg-[#fca311] text-black shadow-lg'
                  : 'bg-[#121414] text-[#888] hover:text-white hover:bg-[#1a1c1c]'
              }`}
            >
              <Mail className="w-4 h-4" />
              <span>Invitations ({invitations.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: MEMBERS DIRECTORY & MANAGEMENT */}
      {activeTab === 'members' && (
        <div className="bg-[#14213d] border border-[#333535] rounded-2xl p-6 shadow-2xl space-y-6">
          {/* Search & Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pb-4 border-b border-[#2a2c2c]">
            <div className="relative">
              <Search className="w-4 h-4 text-[#666] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher nom, email..."
                className="w-full bg-[#121414] border border-[#333535] focus:border-[#fca311] rounded-xl py-2.5 pl-10 pr-3 text-xs text-white outline-none"
              />
            </div>

            <div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full bg-[#121414] border border-[#333535] focus:border-[#fca311] rounded-xl py-2.5 px-3 text-xs text-white outline-none cursor-pointer"
              >
                <option value="all">Tous les rôles</option>
                <option value="membre_actif">Membre Actif</option>
                <option value="membre_bureau">Membre Bureau</option>
                <option value="admin">Administrateur</option>
              </select>
            </div>

            <div>
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="w-full bg-[#121414] border border-[#333535] focus:border-[#fca311] rounded-xl py-2.5 px-3 text-xs text-white outline-none cursor-pointer"
              >
                <option value="all">Toutes les classes</option>
                <option value="GI 1">GI 1</option>
                <option value="GI 2">GI 2</option>
                <option value="GI 3">GI 3</option>
              </select>
            </div>

            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-[#121414] border border-[#333535] focus:border-[#fca311] rounded-xl py-2.5 px-3 text-xs text-white outline-none cursor-pointer"
              >
                <option value="all">Tous les statuts</option>
                <option value="active">Membres Actifs</option>
                <option value="a_relancer">À relancer</option>
                <option value="inactive">Inactifs / Désactivés</option>
              </select>
            </div>
          </div>

          {/* Members Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-[#2a2c2c] text-[#777] uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">MEMBRE</th>
                  <th className="py-3 px-4">CLASSE</th>
                  <th className="py-3 px-4">RÔLE</th>
                  <th className="py-3 px-4">STATUT</th>
                  <th className="py-3 px-4">POINTS</th>
                  <th className="py-3 px-4 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2c2c]">
                {loadingMembers ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-[#666]">
                      Chargement des membres...
                    </td>
                  </tr>
                ) : filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-[#666]">
                      Aucun membre ne correspond à votre recherche.
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((m) => (
                    <tr key={m.id} className="hover:bg-[#1e2020]/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#121414] border border-[#fca311]/40 flex items-center justify-center font-extrabold text-[#fca311] text-xs">
                            {m.first_name?.[0] || m.email?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-white">
                              {m.first_name || m.last_name
                                ? `${m.first_name || ''} ${m.last_name || ''}`
                                : m.email.split('@')[0]}
                            </div>
                            <div className="text-[10px] text-[#777]">{m.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#aaa]">{m.year || 'N/A'}</td>
                      <td className="py-3.5 px-4">
                        {userIsAdmin ? (
                          <select
                            value={m.role || 'membre_actif'}
                            onChange={async (e) => {
                              const newRole = e.target.value
                              try {
                                const res = await fetch('/api/admin/members', {
                                  method: 'PATCH',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ memberId: m.id, newRole }),
                                })
                                if (res.ok) {
                                  fetchMembers()
                                } else {
                                  const errData = await res.json()
                                  alert(errData.error || 'Erreur lors du changement de rôle.')
                                }
                              } catch (err: any) {
                                alert(err.message)
                              }
                            }}
                            className="bg-[#121414] border border-[#333535] focus:border-[#fca311] rounded-lg py-1 px-2 text-[10px] font-bold text-white outline-none cursor-pointer"
                          >
                            <option value="membre_actif">Membre Actif</option>
                            <option value="membre_bureau">Membre Bureau</option>
                            <option value="admin">Administrateur</option>
                          </select>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full bg-[#121414] border border-[#333535] text-[10px] font-bold text-[#ccc]">
                            {getRoleLabel(m.role)}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {userIsAdmin ? (
                          <select
                            value={m.status_flag || (m.is_active === false ? 'inactif' : 'normal')}
                            onChange={async (e) => {
                              const flag = e.target.value
                              try {
                                const res = await fetch('/api/admin/members', {
                                  method: 'PATCH',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    memberId: m.id,
                                    status_flag: flag,
                                    is_active: flag !== 'inactif',
                                  }),
                                })
                                if (res.ok) {
                                  fetchMembers()
                                } else {
                                  const errData = await res.json()
                                  alert(errData.error || 'Erreur lors du changement de statut.')
                                }
                              } catch (err: any) {
                                alert(err.message)
                              }
                            }}
                            className={`border rounded-lg py-1 px-2 text-[10px] font-bold outline-none cursor-pointer ${
                              m.is_active === false || m.status_flag === 'inactif'
                                ? 'bg-red-500/10 text-red-400 border-red-500/30'
                                : m.status_flag === 'a_relancer'
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                : 'bg-green-500/10 text-green-400 border-green-500/30'
                            }`}
                          >
                            <option value="normal" className="bg-[#121414] text-green-400">Actif</option>
                            <option value="a_relancer" className="bg-[#121414] text-amber-400">À relancer</option>
                            <option value="inactif" className="bg-[#121414] text-red-400">Inactif</option>
                          </select>
                        ) : (
                          m.is_active === false || m.status_flag === 'inactif' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] font-bold">
                              Inactif
                            </span>
                          ) : m.status_flag === 'a_relancer' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold">
                              À relancer
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 text-[10px] font-bold">
                              Actif
                            </span>
                          )
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-[#fca311]">{m.points_total || 0} pts</td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedMember(m)
                              setIsDetailModalOpen(true)
                            }}
                            className="p-1.5 rounded-lg text-[#888] hover:text-[#fca311] hover:bg-[#fca311]/10 transition-colors"
                            title="Voir Fiche Membre"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {userIsAdmin && (
                            <button
                              onClick={() => handleDeleteMember(m)}
                              className="p-1.5 rounded-lg text-[#888] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                              title="Supprimer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: ATTENDANCE & EMARGEMENT */}
      {activeTab === 'attendance' && (
        <div className="bg-[#14213d] border border-[#333535] rounded-2xl p-6 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#2a2c2c] pb-4">
            <div>
              <h3 className="text-lg font-black uppercase text-white">Émargement aux Activités</h3>
              <p className="text-xs text-[#888]">Sélectionnez un événement pour enregistrer la présence des membres.</p>
            </div>

            <div className="w-full sm:w-80">
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="w-full bg-[#121414] border border-[#333535] focus:border-[#fca311] rounded-xl p-3 text-xs text-white outline-none cursor-pointer font-bold"
              >
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title} ({ev.date_start ? new Date(ev.date_start).toLocaleDateString('fr-FR') : ''})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <PresenceTracker registrations={eventRegistrations} />
        </div>
      )}

      {/* TAB 3: ANNOUNCEMENT FEED & CREATION */}
      {activeTab === 'announcements' && (
        <div className="bg-[#14213d] border border-[#333535] rounded-2xl p-6 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-[#2a2c2c] pb-4">
            <div>
              <h3 className="text-lg font-black uppercase text-white">Annonces & Communication</h3>
              <p className="text-xs text-[#888]">Fil des annonces diffusées en temps réel à l'ensemble du club.</p>
            </div>
            <button
              onClick={() => setIsAnnouncementModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#fca311] hover:bg-[#ffc887] text-black font-extrabold uppercase text-xs flex items-center gap-2"
            >
              <Megaphone className="w-4 h-4" />
              <span>Publier</span>
            </button>
          </div>

          <AnnouncementFeed initialAnnouncements={announcements} />
        </div>
      )}

      {/* TAB 4: STATISTICS & METRICS */}
      {activeTab === 'stats' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#14213d] border border-[#333535] rounded-2xl p-6 shadow-xl space-y-2">
            <span className="text-[10px] font-bold text-[#888] uppercase tracking-wider">Total Membres</span>
            <p className="text-3xl font-black text-white">{totalMembersCount}</p>
            <p className="text-[10px] text-[#666]">Comptes créés sur la plateforme</p>
          </div>

          <div className="bg-[#14213d] border border-[#333535] rounded-2xl p-6 shadow-xl space-y-2">
            <span className="text-[10px] font-bold text-green-400 uppercase tracking-wider">Membres Actifs</span>
            <p className="text-3xl font-black text-green-400">{activeMembersCount}</p>
            <p className="text-[10px] text-[#666]">Participent régulièrement</p>
          </div>

          <div className="bg-[#14213d] border border-[#333535] rounded-2xl p-6 shadow-xl space-y-2">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">À Relancer</span>
            <p className="text-3xl font-black text-amber-400">{relancerCount}</p>
            <p className="text-[10px] text-[#666]">Absents aux derniers événements</p>
          </div>

          <div className="bg-[#14213d] border border-[#333535] rounded-2xl p-6 shadow-xl space-y-2">
            <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">Inactifs / Bloqués</span>
            <p className="text-3xl font-black text-red-400">{inactiveCount}</p>
            <p className="text-[10px] text-[#666]">Accès restreint ou suspendu</p>
          </div>
        </div>
      )}

      {/* TAB 5: INVITATIONS (ADMIN ONLY) */}
      {activeTab === 'invitations' && userIsAdmin && (
        <div className="bg-[#14213d] border border-[#333535] rounded-2xl p-6 shadow-2xl space-y-6">
          <div className="border-b border-[#2a2c2c] pb-4">
            <h3 className="text-lg font-black uppercase text-white">Générateur d'Invitations</h3>
            <p className="text-xs text-[#888]">Envoyez des liens d'invitation sécurisés pour de nouveaux membres.</p>
          </div>

          {inviteMessage && (
            <div
              className={`p-4 rounded-xl border flex items-center gap-2 text-xs ${
                inviteMessage.type === 'success'
                  ? 'bg-green-500/10 border-green-500/30 text-green-400'
                  : 'bg-red-500/10 border-red-500/30 text-red-400'
              }`}
            >
              {inviteMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span>{inviteMessage.text}</span>
            </div>
          )}

          <form onSubmit={handleSendInviteSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] text-[#888] uppercase block mb-1 font-bold">Email du destinataire *</label>
              <input
                type="email"
                required
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="etudiant@enit.utm.tn"
                className="w-full bg-[#121414] border border-[#333535] focus:border-[#fca311] rounded-xl p-3 text-xs text-white outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] text-[#888] uppercase block mb-1 font-bold">Rôle Attribué</label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as any)}
                className="w-full bg-[#121414] border border-[#333535] focus:border-[#fca311] rounded-xl p-3 text-xs text-white outline-none cursor-pointer"
              >
                <option value="membre_actif">Membre Actif</option>
                <option value="membre_bureau">Membre du Bureau</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={sendingInvite || !inviteEmail.trim()}
                className="w-full py-3 bg-[#fca311] hover:bg-[#ffc887] text-black font-extrabold uppercase text-xs rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-40"
              >
                <Send className="w-4 h-4" />
                <span>Envoyer Invitation</span>
              </button>
            </div>
          </form>

          {/* Invitations Table */}
          <div className="pt-4 overflow-x-auto">
            <h4 className="text-xs uppercase text-[#888] font-bold mb-3">Historique des invitations</h4>
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-[#2a2c2c] text-[#777] uppercase text-[10px]">
                  <th className="py-2.5 px-3">EMAIL</th>
                  <th className="py-2.5 px-3">RÔLE</th>
                  <th className="py-2.5 px-3">STATUT</th>
                  <th className="py-2.5 px-3">EXPIRATION</th>
                  <th className="py-2.5 px-3 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2c2c]">
                {invitations.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-[#666]">
                      Aucune invitation enregistrée.
                    </td>
                  </tr>
                ) : (
                  invitations.map((inv) => (
                    <tr key={inv.id} className="hover:bg-[#1e2020]/50">
                      <td className="py-3 px-3 font-bold text-white">{inv.email}</td>
                      <td className="py-3 px-3 text-[#ccc]">{getRoleLabel(inv.role)}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            inv.status === 'accepted'
                              ? 'bg-green-500/10 text-green-400 border-green-500/20'
                              : inv.status === 'cancelled'
                              ? 'bg-red-500/10 text-red-400 border-red-500/20'
                              : 'bg-[#121414] border-[#333535] text-[#fca311]'
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-[#888]">
                        {inv.expires_at ? new Date(inv.expires_at).toLocaleDateString('fr-FR') : ''}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Copy Link Button */}
                          {inv.token && (
                            <button
                              onClick={() => handleCopyInviteLink(inv.token)}
                              className="p-1.5 rounded-lg text-[#888] hover:text-[#fca311] hover:bg-[#fca311]/10 transition-colors"
                              title="Copier le lien d'invitation"
                            >
                              {copiedToken === inv.token ? (
                                <Check className="w-4 h-4 text-green-400" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>
                          )}

                          {/* Resend Button */}
                          {inv.status === 'pending' && (
                            <button
                              onClick={() => handleResendInvite(inv)}
                              className="p-1.5 rounded-lg text-[#888] hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
                              title="Renvoyer l'email d'invitation"
                            >
                              <RotateCw className="w-4 h-4" />
                            </button>
                          )}

                          {/* Cancel Button */}
                          {inv.status === 'pending' && (
                            <button
                              onClick={() => handleCancelInvite(inv)}
                              className="p-1.5 rounded-lg text-[#888] hover:text-orange-400 hover:bg-orange-500/10 transition-colors"
                              title="Annuler cette invitation"
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                          )}

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDeleteInvite(inv)}
                            className="p-1.5 rounded-lg text-[#888] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            title="Supprimer l'enregistrement"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODALS */}
      <MemberDetailModal
        isOpen={isDetailModalOpen}
        member={selectedMember}
        currentUserRole={currentProfile.role}
        onClose={() => setIsDetailModalOpen(false)}
        onMemberUpdated={fetchMembers}
      />

      <SendAnnouncementModal
        isOpen={isAnnouncementModalOpen}
        poles={poles}
        onClose={() => setIsAnnouncementModalOpen(false)}
        onAnnouncementCreated={fetchAnnouncements}
      />

      <ConfirmActionModal
        isOpen={confirmModalConfig.isOpen}
        title={confirmModalConfig.title}
        message={confirmModalConfig.message}
        confirmText={confirmModalConfig.confirmText}
        variant={confirmModalConfig.variant}
        requireDoubleConfirmation={confirmModalConfig.requireDoubleConfirmation}
        onConfirm={() => {
          confirmModalConfig.onConfirm()
          setConfirmModalConfig((prev) => ({ ...prev, isOpen: false }))
        }}
        onCancel={() => setConfirmModalConfig((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  )
}
