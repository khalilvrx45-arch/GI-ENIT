'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, Trash2, X, ShieldAlert, Check } from 'lucide-react'
import { useState } from 'react'

interface ConfirmActionModalProps {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
  requireDoubleConfirmation?: boolean
  confirmationKeyword?: string
  isLoading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmActionModal({
  isOpen,
  title,
  message,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  variant = 'warning',
  requireDoubleConfirmation = false,
  confirmationKeyword = 'SUPPRIMER',
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmActionModalProps) {
  const [typedKeyword, setTypedKeyword] = useState('')

  if (!isOpen) return null

  const isConfirmedDisabled = requireDoubleConfirmation && typedKeyword.trim().toUpperCase() !== confirmationKeyword.toUpperCase()

  const variantStyles = {
    danger: {
      bgIcon: 'bg-red-500/10 text-red-500 border-red-500/20',
      btnBg: 'bg-red-500 hover:bg-red-600 text-white',
      border: 'border-red-500/30',
    },
    warning: {
      bgIcon: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      btnBg: 'bg-[#fca311] hover:bg-[#ffc887] text-black font-bold',
      border: 'border-amber-500/30',
    },
    info: {
      bgIcon: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      btnBg: 'bg-blue-600 hover:bg-blue-500 text-white font-bold',
      border: 'border-blue-500/30',
    },
  }[variant]

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className={`w-full max-w-md bg-[#14213d] border ${variantStyles.border} rounded-2xl p-6 shadow-2xl space-y-5 text-white`}
        >
          <div className="flex items-start justify-between">
            <div className={`p-3 rounded-xl border ${variantStyles.bgIcon}`}>
              {variant === 'danger' ? <Trash2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
            </div>
            <button
              onClick={onCancel}
              className="p-1 rounded-lg text-[#888] hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div>
            <h3 className="text-lg font-bold font-mono tracking-tight text-white mb-2">{title}</h3>
            <p className="text-xs text-[#aaa] font-mono leading-relaxed">{message}</p>
          </div>

          {requireDoubleConfirmation && (
            <div className="space-y-2 bg-[#0d0e0e] p-3 rounded-xl border border-red-500/30">
              <label className="text-[10px] font-mono text-red-400 font-bold uppercase tracking-wider block">
                Tapez <span className="underline font-extrabold">{confirmationKeyword}</span> pour confirmer :
              </label>
              <input
                type="text"
                value={typedKeyword}
                onChange={(e) => setTypedKeyword(e.target.value)}
                placeholder={confirmationKeyword}
                className="w-full bg-[#14213d] border border-red-500/50 rounded-lg px-3 py-2 text-xs font-mono text-white outline-none focus:border-red-400"
              />
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-xl border border-[#333535] bg-[#121414] hover:bg-[#1a1c1c] text-xs font-mono font-bold text-[#ccc] transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm()
                setTypedKeyword('')
              }}
              disabled={isConfirmedDisabled || isLoading}
              className={`px-5 py-2.5 rounded-xl font-mono text-xs uppercase tracking-wider transition-colors flex items-center gap-2 ${variantStyles.btnBg} disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              <span>{confirmText}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
