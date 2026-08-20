import { NextResponse } from 'next/server'
import { createClient as createServerSupabase } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import { isBureauOrAdmin, isAdmin } from '@/lib/types/roles'

async function getAdminSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (serviceRoleKey) {
    return createClient(supabaseUrl, serviceRoleKey)
  }
  return await createServerSupabase()
}

// Helper to get authenticated user & role
async function getAuthContext() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { user: null, role: null }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  const role = profile?.role || user.user_metadata?.role || 'membre_actif'
  return { user, role }
}

export async function GET(request: Request) {
  try {
    const { user, role } = await getAuthContext()
    if (!user || !isBureauOrAdmin(role)) {
      return NextResponse.json({ error: 'Accès refusé. Rôle Bureau ou Admin requis.' }, { status: 403 })
    }

    const supabase = await getAdminSupabase()

    // 1. Try selecting profiles with joined poles relation
    let { data: members, error } = await supabase
      .from('profiles')
      .select('*, poles(name)')
      .order('created_at', { ascending: false })

    // 2. Fallback to basic profiles query if join relation error occurs
    if (error || !members) {
      console.warn('Fallback query for profiles without poles join:', error?.message)
      const fallbackResult = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      members = fallbackResult.data || []
    }

    return NextResponse.json({ members: members || [] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erreur lors de la récupération des membres.' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const { user, role } = await getAuthContext()
    if (!user || !isBureauOrAdmin(role)) {
      return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 })
    }

    const body = await request.json()
    const { memberId, newRole, is_active, first_name, last_name, year, phone, linkedin_url, birth_date, status_flag } = body

    if (!memberId) {
      return NextResponse.json({ error: 'Identifiant du membre requis.' }, { status: 400 })
    }

    // Role changes require Admin privileges
    if (newRole !== undefined && !isAdmin(role)) {
      return NextResponse.json({ error: 'Seul un Administrateur peut modifier le rôle d\'un membre.' }, { status: 403 })
    }

    // Account activation/deactivation requires Admin privileges
    if (is_active !== undefined && !isAdmin(role)) {
      return NextResponse.json({ error: 'Seul un Administrateur peut désactiver ou réactiver un membre.' }, { status: 403 })
    }

    // General info editing (name, year, phone) requires Admin privileges if modifying other members
    if ((first_name !== undefined || last_name !== undefined || year !== undefined) && !isAdmin(role)) {
      return NextResponse.json({ error: 'Seul un Administrateur peut modifier les informations personnelles d\'un membre.' }, { status: 403 })
    }

    const updatePayload: Record<string, any> = {}
    if (newRole !== undefined) updatePayload.role = newRole
    if (is_active !== undefined) updatePayload.is_active = is_active
    if (first_name !== undefined) updatePayload.first_name = first_name?.trim() || null
    if (last_name !== undefined) updatePayload.last_name = last_name?.trim() || null
    if (year !== undefined) updatePayload.year = year || null
    if (phone !== undefined) updatePayload.phone = phone?.trim() || null
    if (linkedin_url !== undefined) updatePayload.linkedin_url = linkedin_url?.trim() || null
    if (birth_date !== undefined) updatePayload.birth_date = birth_date || null
    if (status_flag !== undefined) updatePayload.status_flag = status_flag || null

    const supabase = await getAdminSupabase()
    const { data: updatedMember, error: updateError } = await supabase
      .from('profiles')
      .update(updatePayload)
      .eq('id', memberId)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, member: updatedMember })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erreur lors de la mise à jour.' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { user, role } = await getAuthContext()
    if (!user || !isAdmin(role)) {
      return NextResponse.json({ error: 'Accès refusé. Seul un Administrateur peut supprimer un membre.' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const memberId = searchParams.get('id')

    if (!memberId) {
      return NextResponse.json({ error: 'Identifiant du membre requis.' }, { status: 400 })
    }

    if (memberId === user.id) {
      return NextResponse.json({ error: 'Vous ne pouvez pas supprimer votre propre compte Administrateur.' }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    let supabase = await getAdminSupabase()

    // Delete profile record
    const { error: deleteProfileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', memberId)

    if (deleteProfileError) {
      return NextResponse.json({ error: deleteProfileError.message }, { status: 500 })
    }

    // Try deleting auth user if service role key is present
    if (serviceRoleKey) {
      const adminSupabase = createClient(supabaseUrl, serviceRoleKey)
      await adminSupabase.auth.admin.deleteUser(memberId)
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erreur lors de la suppression.' }, { status: 500 })
  }
}
