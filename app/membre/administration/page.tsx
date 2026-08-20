import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { isBureauOrAdmin } from '@/lib/types/roles'
import MemberManagementHub from '@/components/bureau-admin/MemberManagementHub'

export default async function AdministrationPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, poles(name)')
    .eq('id', user.id)
    .maybeSingle()

  const currentRole = profile?.role || user.user_metadata?.role || 'membre_actif'

  // Access Guard: Only Bureau or Admin members can access administration
  if (!isBureauOrAdmin(currentRole)) {
    redirect('/membre')
  }

  const profileData = profile || {
    id: user.id,
    first_name: user.user_metadata?.first_name || 'Membre',
    last_name: user.user_metadata?.last_name || '',
    role: currentRole,
    email: user.email,
  }

  return (
    <div className="space-y-6">
      <MemberManagementHub currentProfile={profileData} />
    </div>
  )
}
