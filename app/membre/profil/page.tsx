import { createClient } from "@/lib/supabase/server";
import ProfilClient from "@/components/membre/ProfilClient";
import { Role } from "@/lib/types/roles";

export default async function ProfilPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userId = user?.id;

  const [profileRes, pointsLogRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("*, poles(name)")
      .eq("id", userId || "")
      .single(),

    supabase
      .from("points_log")
      .select("*")
      .eq("user_id", userId || "")
      .order("created_at", { ascending: false }),
  ]);

  const profile = profileRes.data;
  const pointsLog = pointsLogRes.data || [];

  return (
    <ProfilClient
      initialProfile={profile as any}
      initialPointsLog={pointsLog}
      userEmail={user?.email || ""}
    />
  );
}