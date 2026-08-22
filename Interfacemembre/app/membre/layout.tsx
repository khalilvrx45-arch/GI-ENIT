import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from './layout/Sidebar'
import BottomNav from './layout/BottomNav'
import UserHeader from './layout/UserHeader'

export default async function MembreLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?error=no_user')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, poles(*)')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/login?error=no_profile')
  }

  return (
    <div className="industrial-shell min-h-screen flex flex-col lg:flex-row bg-bg">
      <div className="pointer-events-none fixed inset-0 industrial-grid" />
      <div className="pointer-events-none fixed inset-x-0 top-0 h-40 scanline-overlay opacity-25" />
      {/* Sidebar Desktop */}
      <Sidebar profile={profile} />
      
      {/* Contenu principal */}
      <div className="flex-1 flex flex-col min-h-screen lg:pl-64">
        <UserHeader profile={profile} />
        <main className="relative flex-1 p-4 pb-24 sm:p-5 lg:p-8 lg:pb-8">
          {children}
        </main>
      </div>

      {/* Navigation Mobile */}
      <BottomNav />
    </div>
  )
}