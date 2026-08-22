import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const { email, password, firstName, lastName, role, statutMembre, classe, phone } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email et mot de passe requis." }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const adminClient = createSupabaseClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // 1. Create or get user in Supabase Auth
    const { data: userData, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        first_name: firstName || email.split("@")[0],
        last_name: lastName || "",
        role: role || "membre_actif",
      },
    });

    let userId: string;

    if (createError) {
      // If user already exists, update password and metadata
      if (createError.message.includes("already registered") || createError.message.includes("already been registered")) {
        // List users to find ID
        const { data: usersList } = await adminClient.auth.admin.listUsers();
        const existing = usersList?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase());
        if (!existing) {
          throw new Error(createError.message);
        }
        userId = existing.id;

        // Update password & metadata
        await adminClient.auth.admin.updateUserById(userId, {
          password,
          email_confirm: true,
          user_metadata: {
            first_name: firstName || email.split("@")[0],
            last_name: lastName || "",
            role: role || "membre_actif",
          },
        });
      } else {
        throw createError;
      }
    } else {
      userId = userData.user.id;
    }

    // 2. Upsert profile row in public.profiles
    const assignedRole = role === "admin" ? "admin" : role === "membre_bureau" ? "membre_bureau" : "membre_actif";

    const { error: profileError } = await adminClient.from("profiles").upsert(
      {
        id: userId,
        email: email.toLowerCase(),
        first_name: firstName || email.split("@")[0],
        last_name: lastName || "",
        role: assignedRole,
        statut_membre: statutMembre || "actif",
        statut_membre_verified: true,
        classe: classe || "1AGI1",
        phone: phone || "+216 00 000 000",
        points_total: role === "admin" ? 150 : role === "membre_bureau" ? 90 : 25,
        profile_completed_at: new Date().toISOString(),
        is_active: true,
      },
      { onConflict: "id" }
    );

    if (profileError) {
      console.error("Profile upsert error:", profileError);
    }

    return NextResponse.json({
      success: true,
      user_id: userId,
      email,
      role: assignedRole,
      message: "Compte créé et configuré avec succès !",
    });
  } catch (err: any) {
    console.error("Registration error:", err);
    return NextResponse.json({ error: err.message || "Erreur lors de l'enregistrement." }, { status: 500 });
  }
}
