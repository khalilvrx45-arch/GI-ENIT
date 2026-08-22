import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const { token, password, firstName, lastName } = await req.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: "Le jeton d'invitation et le mot de passe sont obligatoires." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Le mot de passe doit contenir au moins 6 caractères." },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const adminClient = createSupabaseClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // 1. Verify invitation token
    const { data: invitation, error: inviteErr } = await adminClient
      .from("invitations")
      .select("*")
      .eq("token", token)
      .single();

    if (inviteErr || !invitation) {
      return NextResponse.json(
        { error: "Invitation introuvable ou lien invalide." },
        { status: 404 }
      );
    }

    if (invitation.status === "cancelled" || invitation.status === "accepted") {
      return NextResponse.json(
        { error: "Cette invitation a déjà été utilisée ou a été annulée." },
        { status: 400 }
      );
    }

    const now = new Date();
    const expiresAt = new Date(invitation.expires_at);
    if (invitation.status === "expired" || expiresAt < now) {
      return NextResponse.json(
        { error: "Cette invitation a expiré." },
        { status: 400 }
      );
    }

    const cleanEmail = invitation.email.trim().toLowerCase();
    const role = invitation.role || "membre_actif";

    // 2. Create or Update user in Supabase Auth
    let userId: string;

    const { data: userData, error: createError } =
      await adminClient.auth.admin.createUser({
        email: cleanEmail,
        password,
        email_confirm: true,
        user_metadata: {
          first_name: firstName || cleanEmail.split("@")[0],
          last_name: lastName || "",
          role,
        },
      });

    if (createError) {
      if (
        createError.message.includes("already registered") ||
        createError.message.includes("already been registered")
      ) {
        // Find existing user ID
        const { data: usersList } = await adminClient.auth.admin.listUsers();
        const existing = usersList?.users?.find(
          (u) => u.email?.toLowerCase() === cleanEmail
        );

        if (!existing) {
          return NextResponse.json(
            { error: createError.message },
            { status: 400 }
          );
        }

        userId = existing.id;

        // Update password and confirm email
        const { error: updateAuthErr } =
          await adminClient.auth.admin.updateUserById(userId, {
            password,
            email_confirm: true,
            user_metadata: {
              first_name: firstName || cleanEmail.split("@")[0],
              last_name: lastName || "",
              role,
            },
          });

        if (updateAuthErr) {
          return NextResponse.json(
            { error: updateAuthErr.message },
            { status: 500 }
          );
        }
      } else {
        return NextResponse.json(
          { error: createError.message },
          { status: 400 }
        );
      }
    } else {
      userId = userData.user.id;
    }

    // 3. Upsert profile record
    const { error: profileError } = await adminClient.from("profiles").upsert(
      {
        id: userId,
        email: cleanEmail,
        first_name: firstName || cleanEmail.split("@")[0],
        last_name: lastName || "",
        role,
      },
      { onConflict: "id" }
    );

    if (profileError) {
      console.error("Profile upsert error:", profileError);
    }

    // 4. Mark invitation as accepted
    await adminClient
      .from("invitations")
      .update({
        status: "accepted",
        accepted_at: new Date().toISOString(),
      })
      .eq("id", invitation.id);

    return NextResponse.json({
      success: true,
      userId,
      email: cleanEmail,
      role,
      message: "Compte activé avec succès !",
    });
  } catch (err: any) {
    console.error("Accept invite error:", err);
    return NextResponse.json(
      { error: err.message || "Erreur interne du serveur." },
      { status: 500 }
    );
  }
}
