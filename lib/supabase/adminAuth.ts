import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { isBureauOrAdmin, isAdmin, Role } from "@/lib/types/roles";

export async function verifyCanManage(adminOnly: boolean = false): Promise<
  | { ok: true; user: any; role: Role; client: ReturnType<typeof createClient> }
  | { ok: false; error: string; status: number }
> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const serverSupabase = await createServerSupabase();
  const {
    data: { user },
  } = await serverSupabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Non authentifié.", status: 401 };
  }

  const client = serviceRoleKey
    ? createClient(supabaseUrl, serviceRoleKey)
    : serverSupabase;

  const { data: profile } = await (client as any)
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const role: Role = (profile?.role || user.user_metadata?.role || "membre_actif") as Role;

  if (adminOnly) {
    if (!isAdmin(role)) {
      return {
        ok: false,
        error: "Accès réservé aux administrateurs.",
        status: 403,
      };
    }
  } else {
    if (!isBureauOrAdmin(role)) {
      return {
        ok: false,
        error: "Accès refusé. Réservé à l'administration et au bureau.",
        status: 403,
      };
    }
  }

  return { ok: true, user, role, client: client as any };
}
