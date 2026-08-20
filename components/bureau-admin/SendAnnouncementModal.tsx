'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Megaphone, Send, Pin, AlertCircle, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface SendAnnouncementModalProps {
  isOpen: boolean
  poles: { id: string; name: string }[]
  onClose: () => void
  onAnnouncementCreated: () => void
}

export default function SendAnnouncementModal({
  isOpen,
  poles,
  onClose,
  onAnnouncementCreated,
}: SendAnnouncementModalProps) {
  const supabase = createClient()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [poleId, setPoleId] = useState<string>('')
  const [pinned, setPinned] = useState(false)
  const [sending, setSending] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setSending(true)
    setErrorMsg('')
    try {
      const { data: user } = await supabase.auth.getUser()

      const { error } = await supabase.from('announcements').insert({
        title: title.trim(),
        content: content.trim() || null,
        pinned,
        pole_id: poleId || null,
        author_id: user.user?.id || null,
      })

      if (error) throw error

      setTitle('')
      setContent('')
      setPoleId('')
      setPinned(false)
      onAnnouncementCreated()
      onClose()
    } catch (err: any) {
      setErrorMsg(err.message || 'Erreur lors de la publication de l\'annonce.')
    } finally {
      setSending(false)
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-lg bg-[#14213d] border border-[#333535] rounded-2xl p-6 shadow-2xl space-y-5 text-white font-mono"
        >
          <div className="flex items-center justify-between border-b border-[#2a2c2c] pb-4">
            <div className="flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-[#fca311]" />
              <h3 className="text-lg font-black uppercase text-white tracking-tight">Publier une annonce</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-[#888] hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl flex items-center gap-2 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="text-[10px] text-[#888] uppercase block mb-1 font-bold">Titre de l'annonce *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Réunion générale ce vendredi à 14h"
                className="w-full bg-[#121414] border border-[#333535] focus:border-[#fca311] rounded-xl p-3 text-white outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] text-[#888] uppercase block mb-1 font-bold">Contenu de l'annonce</label>
              <textarea
                rows={4}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Détails de l'annonce..."
                className="w-full bg-[#121414] border border-[#333535] focus:border-[#fca311] rounded-xl p-3 text-white outline-none resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-[#888] uppercase block mb-1 font-bold">Pôle Cible (Optionnel)</label>
                <select
                  value={poleId}
                  onChange={(e) => setPoleId(e.target.value)}
                  className="w-full bg-[#121414] border border-[#333535] focus:border-[#fca311] rounded-xl p-3 text-white outline-none cursor-pointer"
                >
                  <option value="">Tous les membres (Général)</option>
                  {poles.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center pt-6">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#ccc]">
                  <input
                    type="checkbox"
                    checked={pinned}
                    onChange={(e) => setPinned(e.target.checked)}
                    className="w-4 h-4 rounded border-[#333535] bg-[#121414] text-[#fca311] focus:ring-0 cursor-pointer"
                  />
                  <Pin className="w-4 h-4 text-[#fca311]" />
                  <span>Épingler en haut</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#2a2c2c]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-[#333535] bg-[#121414] text-[#ccc] hover:bg-[#1a1c1c] font-bold"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={sending || !title.trim()}
                className="px-6 py-2.5 rounded-xl bg-[#fca311] hover:bg-[#ffc887] text-black font-extrabold uppercase flex items-center gap-2 transition-colors disabled:opacity-40"
              >
                <Send className="w-4 h-4" />
                <span>Publier</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
