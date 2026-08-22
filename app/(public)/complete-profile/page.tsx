import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PreinscriptionForm from "@/components/membre/PreinscriptionForm";

export default async function CompleteProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  // If already completed, redirect to member dashboard
  if (profile?.profile_completed_at) {
    redirect("/membre");
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 sm:px-6 py-12 relative overflow-hidden">
      {/* Background Accents */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-custom-navy/20 via-black to-black pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-custom-amber/5 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-2xl relative z-10 flex justify-center">
        <PreinscriptionForm
          userId={user.id}
          initialEmail={user.email || profile?.email || ""}
          initialFirstName={profile?.first_name || user.user_metadata?.first_name || ""}
          initialLastName={profile?.last_name || user.user_metadata?.last_name || ""}
        />
      </div>
    </div>
  );
}
