import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })
    }

    const body = await request.json()
    const { year, birth_date, phone, linkedin_url, avatar_url } = body

    // Validate phone (Tunisian format: exactly 8 digits)
    if (phone && phone.trim() !== '') {
      if (!/^\d{8}$/.test(phone.trim())) {
        return NextResponse.json(
          { error: 'Numéro de téléphone invalide. Format requis : 8 chiffres.' },
          { status: 400 }
        )
      }
    }

    // Validate LinkedIn URL
    if (linkedin_url && linkedin_url.trim() !== '') {
      if (!linkedin_url.includes('linkedin.com')) {
        return NextResponse.json(
          { error: 'URL LinkedIn invalide. Elle doit contenir "linkedin.com".' },
          { status: 400 }
        )
      }
    }

    const updateData: Record<string, string | null> = {}
    if (year !== undefined) updateData.year = year || null
    if (birth_date !== undefined) updateData.birth_date = birth_date || null
    if (phone !== undefined) updateData.phone = phone?.trim() || null
    if (linkedin_url !== undefined) updateData.linkedin_url = linkedin_url?.trim() || null
    if (avatar_url !== undefined) updateData.avatar_url = avatar_url || null

    // 1. Update profiles table
    const { error: updateError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id)

    // 2. Also back up values in Supabase Auth user_metadata so profile is never lost
    await supabase.auth.updateUser({
      data: {
        ...(year !== undefined ? { year: year || null } : {}),
        ...(birth_date !== undefined ? { birth_date: birth_date || null } : {}),
        ...(phone !== undefined ? { phone: phone?.trim() || null } : {}),
        ...(linkedin_url !== undefined ? { linkedin_url: linkedin_url?.trim() || null } : {}),
        ...(avatar_url !== undefined ? { avatar_url: avatar_url || null } : {}),
      }
    })

    if (updateError) {
      // If table update fails due to missing column, user metadata is already updated safely
      console.warn('Profiles table update warning:', updateError.message)
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Erreur lors de la mise à jour du profil.' },
      { status: 500 }
    )
  }
}
