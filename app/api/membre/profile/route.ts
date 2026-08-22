import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PUT(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
    }

    const body = await request.json();
    const {
      first_name,
      last_name,
      phone,
      classe,
      statut_membre,
      avatar_url,
      cv_url,
      linkedin_url,
      prepa_section,
      prepa_etablissement,
      rang_concours,
    } = body;

    if (!first_name?.trim() || !last_name?.trim() || !phone?.trim() || !classe || !statutMembreCheck(statut_membre)) {
      return NextResponse.json(
        { error: "Veuillez remplir tous les champs obligatoires (Prénom, Nom, Téléphone, Classe, Statut)." },
        { status: 400 }
      );
    }

    const updatePayload: Record<string, any> = {
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      phone: phone.trim(),
      classe: classe.trim(),
      statut_membre: statut_membre,
      avatar_url: avatar_url || null,
      cv_url: cv_url || null,
      linkedin_url: linkedin_url?.trim() || null,
      prepa_section: prepa_section || null,
      prepa_etablissement: prepa_etablissement?.trim() || null,
      rang_concours: rang_concours !== null && rang_concours !== undefined && rang_concours !== ""
        ? parseInt(String(rang_concours), 10)
        : null,
    };

    const { data: updatedProfile, error: updateError } = await supabase
      .from("profiles")
      .update(updatePayload)
      .eq("id", user.id)
      .select("*, poles(name)")
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, profile: updatedProfile });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Une erreur est survenue lors de la mise à jour du profil." },
      { status: 500 }
    );
  }
}

function statutMembreCheck(statut: any): boolean {
  return ["actif", "senior", "alumni"].includes(statut);
}
