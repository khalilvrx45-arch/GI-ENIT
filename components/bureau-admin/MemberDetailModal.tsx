'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  User,
  Mail,
  Phone,
  GraduationCap,
  Award,
  Calendar,
  Shield,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Edit2,
  Save,
  Tag,
  Ban,
  RotateCw,
  ExternalLink,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { isAdmin, getRoleLabel } from '@/lib/types/roles'

interface MemberDetailModalProps {
  isOpen: boolean
  member: any
  currentUserRole: string
  onClose: () => void
  onMemberUpdated: () => void
}

export default function MemberDetailModal({
  isOpen,
  member,
  currentUserRole,
  onClose,
  onMemberUpdated,
}: MemberDetailModalProps) {
  const supabase = createClient()
  const userIsAdmin = isAdmin(currentUserRole)

  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'history' | 'admin'>('profile')
  const [registrations, setRegistrations] = useState<any[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Edit fields for Admin
  const [editFirstName, setEditFirstName] = useState('')
  const [editLastName, setEditLastName] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editYear, setEditYear] = useState('')
  const [editRole, setEditRole] = useState('')
  const [editStatusFlag, setEditStatusFlag] = useState('')

  useEffect(() => {
    if (member) {
      setEditFirstName(member.first_name || '')
      setEditLastName(member.last_name || '')
      setEditPhone(member.phone || '')
      setEditYear(member.year || '')
      setEditRole(member.role || 'membre_actif')
      setEditStatusFlag(member.status_flag || 'normal')
      fetchMemberHistory(member.id)
    }
  }, [member])

  const fetchMemberHistory = async (memberId: string) => {
    setLoadingHistory(true)
    try {
      const { data, error } = await supabase
        .from('event_registrations')
        .select('*, events(title, date_start, category)')
        .eq('user_id', memberId)
        .order('created_at', { ascending: false })

      if (!error && data) {
        setRegistrations(data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingHistory(false)
    }
  }

  if (!isOpen || !member) return null

  const handleStatusFlagChange = async (flag: string) => {
    setUpdating(true)
    setErrorMsg('')
    setSuccessMsg('')
    try {
      const res = await fetch('/api/admin/members', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: member.id,
          status_flag: flag,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Échec de la mise à jour')

      setSuccessMsg(`Statut mis à jour : ${flag}`)
      setEditStatusFlag(flag)
      onMemberUpdated()
    } catch (err: any) {
      setErrorMsg(err.message)
    } finally {
      setUpdating(false)
    }
  }

  const handleAdminSave = async () => {
    setUpdating(true)
    setErrorMsg('')
    setSuccessMsg('')
    try {
      const res = await fetch('/api/admin/members', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: member.id,
          first_name: editFirstName,
          last_name: editLastName,
          phone: editPhone,
          year: editYear,
          newRole: editRole,
          status_flag: editStatusFlag,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Échec de la mise à jour')

      setSuccessMsg('Fiche membre mise à jour avec succès.')
      onMemberUpdated()
      setTimeout(() => {
        window.location.reload()
      }, 500)
    } catch (err: any) {
      setErrorMsg(err.message)
    } finally {
      setUpdating(false)
    }
  }

  const handleToggleActiveStatus = async () => {
    setUpdating(true)
    setErrorMsg('')
    const newStatus = !member.is_active
    try {
      const res = await fetch('/api/admin/members', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: member.id,
          is_active: newStatus,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Échec du changement de statut')

      setSuccessMsg(newStatus ? 'Compte réactivé.' : 'Compte désactivé.')
      onMemberUpdated()
    } catch (err: any) {
      setErrorMsg(err.message)
    } finally {
      setUpdating(false)
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-2xl bg-[#14213d] border border-[#333535] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header Banner */}
          <div className="bg-[#121414] p-6 border-b border-[#2a2c2c] relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-xl text-[#888] hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-[#fca311]/10 border-2 border-[#fca311] flex items-center justify-center text-[#fca311] font-extrabold text-xl shrink-0 shadow-lg">
                {member.first_name?.[0] || member.email?.[0]?.toUpperCase()}
                {member.last_name?.[0] || ''}
              </div>

              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                  <h2 className="text-xl font-black text-white font-mono">
                    {member.first_name} {member.last_name}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-md bg-[#fca311]/10 text-[#fca311] border border-[#fca311]/30 font-mono text-[10px] font-bold">
                    {getRoleLabel(member.role)}
                  </span>
                  {member.is_active === false && (
                    <span className="px-2.5 py-0.5 rounded-md bg-red-500/10 text-red-400 border border-red-500/30 font-mono text-[10px] font-bold">
                      Désactivé
                    </span>
                  )}
                  {member.status_flag === 'a_relancer' && (
                    <span className="px-2.5 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/30 font-mono text-[10px] font-bold">
                      À relancer
                    </span>
                  )}
                  {member.status_flag === 'inactif' && (
                    <span className="px-2.5 py-0.5 rounded-md bg-gray-500/10 text-gray-400 border border-gray-500/30 font-mono text-[10px] font-bold">
                      Inactif
                    </span>
                  )}
                </div>
                <p className="text-xs font-mono text-[#888]">{member.email}</p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-3 text-xs font-mono text-[#aaa]">
                  <div className="flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-[#fca311]" />
                    <span>{member.year || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-[#fca311]" />
                    <span>{member.points_total || 0} pts cumulés</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Tabs inside Modal */}
            <div className="flex gap-2 mt-6 pt-4 border-t border-[#2a2c2c] text-xs font-mono">
              <button
                onClick={() => setActiveSubTab('profile')}
                className={`px-4 py-2 rounded-xl transition-colors font-bold ${
                  activeSubTab === 'profile'
                    ? 'bg-[#fca311] text-black'
                    : 'bg-[#1a1c1c] text-[#888] hover:text-white'
                }`}
              >
                Vue Profil
              </button>
              <button
                onClick={() => setActiveSubTab('history')}
                className={`px-4 py-2 rounded-xl transition-colors font-bold ${
                  activeSubTab === 'history'
                    ? 'bg-[#fca311] text-black'
                    : 'bg-[#1a1c1c] text-[#888] hover:text-white'
                }`}
              >
                Historique ({registrations.length})
              </button>
              {userIsAdmin && (
                <button
                  onClick={() => setActiveSubTab('admin')}
                  className={`px-4 py-2 rounded-xl transition-colors font-bold ${
                    activeSubTab === 'admin'
                      ? 'bg-red-500 text-white'
                      : 'bg-[#1a1c1c] text-red-400 hover:bg-red-500/10'
                  }`}
                >
                  Gestion Admin
                </button>
              )}
            </div>
          </div>

          {/* Modal Content Body */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs font-mono">
            {errorMsg && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
            {successMsg && (
              <div className="p-3 bg-green-500/10 border border-green-500/30 text-green-400 rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* TAB 1: PROFILE VIEW */}
            {activeSubTab === 'profile' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-[#121414] p-4 rounded-xl border border-[#2a2c2c] space-y-1">
                    <span className="text-[10px] text-[#777] uppercase font-bold">Email</span>
                    <p className="text-white font-bold text-sm truncate">{member.email}</p>
                  </div>

                  <div className="bg-[#121414] p-4 rounded-xl border border-[#2a2c2c] space-y-1">
                    <span className="text-[10px] text-[#777] uppercase font-bold">Téléphone</span>
                    <p className="text-white font-bold text-sm">{member.phone || 'Non renseigné'}</p>
                  </div>

                  <div className="bg-[#121414] p-4 rounded-xl border border-[#2a2c2c] space-y-1">
                    <span className="text-[10px] text-[#777] uppercase font-bold">Classe / Promo</span>
                    <p className="text-[#fca311] font-bold text-sm">{member.year || 'Non spécifié'}</p>
                  </div>

                  <div className="bg-[#121414] p-4 rounded-xl border border-[#2a2c2c] space-y-1">
                    <span className="text-[10px] text-[#777] uppercase font-bold">Pôle d'appartenance</span>
                    <p className="text-white font-bold text-sm">{member.poles?.name || 'Aucun pôle'}</p>
                  </div>

                  <div className="bg-[#121414] p-4 rounded-xl border border-[#2a2c2c] space-y-1">
                    <span className="text-[10px] text-[#777] uppercase font-bold">Points Cumulés</span>
                    <p className="text-[#fca311] font-extrabold text-base">{member.points_total || 0} pts</p>
                  </div>

                  <div className="bg-[#121414] p-4 rounded-xl border border-[#2a2c2c] space-y-1">
                    <span className="text-[10px] text-[#777] uppercase font-bold">Date d'adhésion</span>
                    <p className="text-white font-bold text-sm">
                      {member.created_at ? new Date(member.created_at).toLocaleDateString('fr-FR') : 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Status Tag Quick Toggle for Bureau/Admin */}
                <div className="bg-[#121414] p-4 rounded-xl border border-[#2a2c2c] space-y-3">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-[#fca311]" />
                    <span className="text-xs text-white font-bold uppercase">Signaler / Taguer l'assiduité :</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleStatusFlagChange('normal')}
                      disabled={updating}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-colors ${
                        editStatusFlag === 'normal' || !editStatusFlag
                          ? 'bg-green-500/20 text-green-400 border-green-500/40'
                          : 'bg-[#1a1c1c] text-[#888] border-[#333535] hover:text-white'
                      }`}
                    >
                      Assidu / Normal
                    </button>
                    <button
                      onClick={() => handleStatusFlagChange('a_relancer')}
                      disabled={updating}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-colors ${
                        editStatusFlag === 'a_relancer'
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                          : 'bg-[#1a1c1c] text-[#888] border-[#333535] hover:text-white'
                      }`}
                    >
                      À relancer
                    </button>
                    <button
                      onClick={() => handleStatusFlagChange('inactif')}
                      disabled={updating}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-colors ${
                        editStatusFlag === 'inactif'
                          ? 'bg-gray-500/20 text-gray-400 border-gray-500/40'
                          : 'bg-[#1a1c1c] text-[#888] border-[#333535] hover:text-white'
                      }`}
                    >
                      Inactif
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: PARTICIPATION HISTORY */}
            {activeSubTab === 'history' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs uppercase text-[#888] font-bold">Événements auxquels le membre s'est inscrit</h4>
                </div>

                {loadingHistory ? (
                  <p className="text-center py-8 text-[#666]">Chargement de l'historique...</p>
                ) : registrations.length === 0 ? (
                  <div className="text-center py-8 bg-[#121414] rounded-xl border border-dashed border-[#333535] text-[#666]">
                    Aucune inscription enregistrée pour ce membre.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {registrations.map((reg) => (
                      <div
                        key={reg.id}
                        className="bg-[#121414] border border-[#2a2c2c] rounded-xl p-3.5 flex items-center justify-between"
                      >
                        <div>
                          <p className="font-bold text-white text-sm">{reg.events?.title || 'Événement'}</p>
                          <p className="text-[10px] text-[#888]">
                            Catégorie : {reg.events?.category || 'Générale'} •{' '}
                            {reg.events?.date_start ? new Date(reg.events.date_start).toLocaleDateString('fr-FR') : ''}
                          </p>
                        </div>
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                            reg.attended
                              ? 'bg-green-500/10 text-green-400 border-green-500/20'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}
                        >
                          {reg.attended ? 'Présent' : 'Inscrit'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: ADMIN EDITING & CONTROLS */}
            {activeSubTab === 'admin' && userIsAdmin && (
              <div className="space-y-6">
                <div className="bg-[#121414] p-5 rounded-xl border border-[#2a2c2c] space-y-4">
                  <h4 className="text-xs uppercase text-[#fca311] font-bold tracking-wider">Modifier les informations</h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] text-[#888] uppercase block mb-1">Prénom</label>
                      <input
                        type="text"
                        value={editFirstName}
                        onChange={(e) => setEditFirstName(e.target.value)}
                        className="w-full bg-[#14213d] border border-[#333535] focus:border-[#fca311] rounded-lg p-2.5 text-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#888] uppercase block mb-1">Nom</label>
                      <input
                        type="text"
                        value={editLastName}
                        onChange={(e) => setEditLastName(e.target.value)}
                        className="w-full bg-[#14213d] border border-[#333535] focus:border-[#fca311] rounded-lg p-2.5 text-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#888] uppercase block mb-1">Téléphone</label>
                      <input
                        type="text"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        className="w-full bg-[#14213d] border border-[#333535] focus:border-[#fca311] rounded-lg p-2.5 text-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#888] uppercase block mb-1">Classe / Année</label>
                      <input
                        type="text"
                        value={editYear}
                        onChange={(e) => setEditYear(e.target.value)}
                        className="w-full bg-[#14213d] border border-[#333535] focus:border-[#fca311] rounded-lg p-2.5 text-white outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-[#888] uppercase block mb-1">Rôle du Membre</label>
                    <select
                      value={editRole}
                      onChange={(e) => setEditRole(e.target.value)}
                      className="w-full bg-[#14213d] border border-[#333535] focus:border-[#fca311] rounded-lg p-2.5 text-white outline-none uppercase font-bold"
                    >
                      <option value="membre_actif">Membre Actif</option>
                      <option value="membre_bureau">Membre du Bureau</option>
                      <option value="admin">Administrateur</option>
                    </select>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={handleAdminSave}
                      disabled={updating}
                      className="bg-[#fca311] hover:bg-[#ffc887] text-black font-bold uppercase text-xs px-5 py-2.5 rounded-xl transition-colors flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>Enregistrer les modifications</span>
                    </button>
                  </div>
                </div>

                {/* Account Activation/Deactivation Toggle */}
                <div className="bg-[#121414] p-5 rounded-xl border border-red-500/30 space-y-3">
                  <h4 className="text-xs uppercase text-red-400 font-bold tracking-wider">Statut du Compte</h4>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-bold">Accès au portail membre</p>
                      <p className="text-[10px] text-[#888]">
                        {member.is_active === false
                          ? 'Le membre est actuellement bloqué.'
                          : 'Le membre a un accès actif au club.'}
                      </p>
                    </div>

                    <button
                      onClick={handleToggleActiveStatus}
                      disabled={updating}
                      className={`px-4 py-2 rounded-xl font-bold uppercase text-xs border transition-colors ${
                        member.is_active === false
                          ? 'bg-green-500/20 text-green-400 border-green-500/40 hover:bg-green-500/30'
                          : 'bg-red-500/20 text-red-400 border-red-500/40 hover:bg-red-500/30'
                      }`}
                    >
                      {member.is_active === false ? 'Réactiver le membre' : 'Désactiver le membre'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
