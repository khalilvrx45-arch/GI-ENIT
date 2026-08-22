'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/lib/supabase/database.types'

type Profile = Database['public']['Tables']['profiles']['Row'] & {
  poles: { name: string } | null
}

export default function UserHeader({ profile }: { profile: Profile }) {
  const router = useRouter()
  const supabase = createClient()
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    setLoggingOut(true)
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-accent/15 bg-bg/80 px-4 backdrop-blur-md lg:px-8">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-md border border-muted/20 bg-card">
           <span className="font-display font-bold text-accent">
            {profile.first_name?.[0] || 'X'}{profile.last_name?.[0] || 'X'}
           </span>
        </div>
        <div>
          <p className="text-sm font-medium text-text leading-none">
            {profile.first_name} {profile.last_name}
          </p>
          <p className="text-xs text-muted leading-none mt-1">
            {profile.poles?.name || 'Membre'} {profile.role === 'pole_lead' && '· Pole Lead'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="panel-surface flex items-center gap-2 rounded-md px-3 py-1.5">
          <span className="text-xs text-muted font-mono uppercase tracking-wider hidden sm:block">Points</span>
          <motion.span 
            className="font-mono text-lg font-bold text-accent"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {profile.points_total || 0}
          </motion.span>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          title="Se déconnecter"
          aria-label="Se déconnecter"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-muted/20 bg-card text-muted transition-colors hover:border-warning/40 hover:bg-warning/10 hover:text-warning disabled:opacity-50"
        >
          {loggingOut ? (
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z" />
            </svg>
          ) : (
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          )}
        </button>
      </div>
    </header>
  )
}