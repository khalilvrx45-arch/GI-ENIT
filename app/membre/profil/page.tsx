import { createClient } from "@/lib/supabase/server";
import ProfilClient from "@/components/membre/ProfilClient";
import { Role } from "@/lib/types/roles";

export default async function ProfilPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userId = user?.id;

  let profileData = null;
  let pointsLogData: any[] = [];

  try {
    const [pRes, plRes] = await Promise.all([
      supabase.from("profiles").select("*, poles(name)").eq("id", userId || "").single(),
      supabase.from("points_log").select("*").eq("user_id", userId || "").order("created_at", { ascending: false }),
    ]);

    if (pRes.error && pRes.error.message.includes("relationship")) {
      const fallbackPRes = await supabase.from("profiles").select("*").eq("id", userId || "").single();
      profileData = fallbackPRes.data;
    } else {
      profileData = pRes.data;
    }
    pointsLogData = plRes.data || [];
  } catch (err) {
    const fallbackPRes = await supabase.from("profiles").select("*").eq("id", userId || "").single();
    profileData = fallbackPRes.data;
  }

  const meta = user?.user_metadata || {};
  const fullNameParts = (meta.full_name || meta.name || "").split(" ");

  const profile = {
    ...profileData,
    first_name: profileData?.first_name || meta.first_name || fullNameParts[0] || "",
    last_name: profileData?.last_name || meta.last_name || fullNameParts.slice(1).join(" ") || "",
    email: user?.email || '',
  }

  return (
    <ProfilClient
      initialProfile={profile as any}
      initialPointsLog={pointsLogData}
      userEmail={user?.email || ""}
    />
  );
}