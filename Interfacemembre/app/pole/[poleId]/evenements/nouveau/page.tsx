import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ActivityForm from '@/components/membre/pole/ActivityForm'

type Profile = {
  role: 'member' | 'pole_lead' | 'admin'
}

export default async function CreateActivityPage({ params }: { params: { poleId: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // Vérification des droits
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user?.id || '')
    .single()

  const typedProfile = profile as Profile | null

  if (!typedProfile || (typedProfile.role !== 'admin' && typedProfile.role !== 'pole_lead')) {
    redirect('/membre')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Nouvelle Activité</h1>
        <p className="text-muted mt-1">Crée un événement, une visite ou une formation.</p>
      </div>
      <ActivityForm poleId={params.poleId} />
    </div>
  )
}