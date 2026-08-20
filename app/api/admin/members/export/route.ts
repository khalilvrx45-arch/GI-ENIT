import { NextResponse } from 'next/server'
import { createClient as createServerSupabase } from '@/lib/supabase/server'
import { isBureauOrAdmin, getRoleLabel } from '@/lib/types/roles'

export async function GET() {
  try {
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    const role = profile?.role || user.user_metadata?.role || 'membre_actif'
    if (!isBureauOrAdmin(role)) {
      return NextResponse.json({ error: 'Accès refusé. Rôle Bureau ou Admin requis.' }, { status: 403 })
    }

    const { data: members, error } = await supabase
      .from('profiles')
      .select('*, poles(name)')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Generate CSV string
    const headers = ['Nom', 'Prénom', 'Email', 'Téléphone', 'Année/Classe', 'Rôle', 'Statut', 'Points', 'Pôle', 'Date Inscription']
    
    const rows = (members || []).map(m => {
      const nom = `"${(m.last_name || '').replace(/"/g, '""')}"`
      const prenom = `"${(m.first_name || '').replace(/"/g, '""')}"`
      const email = `"${(m.email || '').replace(/"/g, '""')}"`
      const phone = `"${(m.phone || '').replace(/"/g, '""')}"`
      const year = `"${(m.year || '').replace(/"/g, '""')}"`
      const roleLabel = `"${getRoleLabel(m.role)}"`
      const status = m.is_active === false ? '"Inactif"' : (m.status_flag ? `"${m.status_flag}"` : '"Actif"')
      const points = m.points_total || 0
      const pole = `"${(m.poles?.name || '').replace(/"/g, '""')}"`
      const date = `"${m.created_at ? new Date(m.created_at).toLocaleDateString('fr-FR') : ''}"`

      return [nom, prenom, email, phone, year, roleLabel, status, points, pole, date].join(',')
    })

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n')

    return new Response(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="membres_cgi_enit_${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erreur lors de l\'exportation CSV.' }, { status: 500 })
  }
}
