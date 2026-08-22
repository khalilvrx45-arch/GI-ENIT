import { NextResponse } from "next/server";
import { verifyCanManage } from "@/lib/supabase/adminAuth";

export async function POST(request: Request) {
  try {
    const auth = await verifyCanManage();
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { client } = auth;
    const body = await request.json();
    const { user_id, verified = true } = body;

    if (!user_id) {
      return NextResponse.json({ error: "L'identifiant du membre est requis." }, { status: 400 });
    }

    const { data: updatedProfile, error: updateError } = await (client as any)
      .from("profiles")
      .update({
        statut_membre_verified: verified,
      })
      .eq("id", user_id)
      .select("id, first_name, last_name, statut_membre, statut_membre_verified")
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Create notification if verified is true
    if (verified) {
      await (client as any)
        .from("notifications")
        .insert({
          user_id,
          type: "système",
          title: "Statut membre vérifié",
          message: "Votre statut de membre a été vérifié et validé par l'administration du club.",
          link: "/membre/profil",
          read: false,
        });
    }

    return NextResponse.json({ success: true, profile: updatedProfile });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Erreur lors de la vérification du statut." },
      { status: 500 }
    );
  }
}
