import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { formatActivityDate } from "@/lib/utils";
import { Database } from "@/lib/supabase/database.types";
import { MapPin, GraduationCap, ArrowLeft, BookOpen, AlertCircle, FileText, ExternalLink } from "lucide-react";
import Link from "next/link";
import FormationEnrollmentCard from "@/components/membre/activity/FormationEnrollmentCard";

type Activity = Database["public"]["Tables"]["activities"]["Row"];
type Registration = Database["public"]["Tables"]["event_registrations"]["Row"];

export default async function FormationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const activityRes = await supabase
    .from("activities")
    .select("*")
    .eq("id", id)
    .eq("type", "formation")
    .single();

  const rawActivity = activityRes.data as any | null;

  if (!rawActivity) notFound();

  let metadata: Record<string, any> = {};
  if (rawActivity.content) {
    try {
      const parsed = JSON.parse(rawActivity.content);
      if (parsed && typeof parsed === "object" && parsed._is_formation_meta) {
        metadata = parsed;
      }
    } catch (_) {}
  }

  // Use rawActivity (any) to avoid strict DB type issues with extra columns
  const activity = rawActivity as any;

  // Récupère l'inscription de l'utilisateur courant
  const registrationRes = await supabase
    .from("event_registrations")
    .select("*")
    .eq("activity_id", id)
    .eq("user_id", user?.id || "")
    .maybeSingle();

  const registration = registrationRes.data as Registration | null;

  // Compte les inscrits confirmés
  const { count: registeredCount } = await supabase
    .from("event_registrations")
    .select("*", { count: "exact", head: true })
    .eq("activity_id", id)
    .eq("status", "confirmed");

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Return to formations list */}
      <div>
        <Link
          href="/membre/formations"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#888] hover:text-emerald-400 transition-colors mb-4 group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Retour aux formations</span>
        </Link>

        <div className="flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-emerald-400" />
          <span className="text-xs text-emerald-400 font-mono uppercase tracking-wider">
            Formation Professionnelle & Technique
          </span>
        </div>
        <h1 className="font-display text-3xl md:text-4xl font-bold mt-1 text-white">
          {activity.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 mt-3 text-[#aaa]">
          {activity.trainer_name && (
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-400">
              <GraduationCap className="h-4 w-4" />
              {activity.trainer_name}
            </span>
          )}
          <span className="font-mono text-sm">
            {formatActivityDate(activity.date_start || "")}
          </span>
          {activity.location && (
            <span className="inline-flex items-center gap-1.5 text-sm">
              <MapPin className="h-4 w-4 text-emerald-400" aria-hidden="true" />
              {activity.location}
            </span>
          )}
        </div>
      </div>

      {/* Cover Image */}
      {activity.image_url && (
        <div className="w-full h-64 md:h-96 rounded-3xl overflow-hidden border border-[#2a2c2c] relative shadow-2xl">
          <img
            src={activity.image_url}
            alt={activity.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Description / Programme */}
      {activity.description && (
        <div className="bg-[#141515] border border-[#2a2c2c] rounded-3xl p-6 sm:p-8 space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            <span>Objectifs & Programme de la Formation</span>
          </h2>
          <p className="text-[#ddd] text-sm leading-relaxed whitespace-pre-line">
            {activity.description}
          </p>
        </div>
      )}

      {/* Prerequisites if any */}
      {activity.prerequisites && (
        <div className="bg-[#141515] border border-[#2a2c2c] rounded-3xl p-6 sm:p-8 space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>Prérequis recommandés</span>
          </h3>
          <p className="text-xs text-[#aaa] leading-relaxed">
            {activity.prerequisites}
          </p>
        </div>
      )}

      {/* Training materials if applicable */}
      {activity.training_material_url && (
        <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-3xl p-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Supports de formation disponibles</h4>
              <p className="text-xs text-[#888]">Consultez les slides et documents mis à disposition par le formateur.</p>
            </div>
          </div>
          <a
            href={activity.training_material_url}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-colors inline-flex items-center gap-1.5 shrink-0"
          >
            <span>Accéder aux supports</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}

      {/* Interactive Enrollment Card */}
      <FormationEnrollmentCard
        activity={activity}
        initialRegistration={registration}
        initialRegisteredCount={registeredCount || 0}
        userId={user?.id || ""}
      />
    </div>
  );
}
