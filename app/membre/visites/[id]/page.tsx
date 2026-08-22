import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { formatActivityDate } from "@/lib/utils";
import { Database } from "@/lib/supabase/database.types";
import { MapPin, Building, Factory, ArrowLeft } from "lucide-react";
import Link from "next/link";
import VisitEnrollmentCard from "@/components/membre/activity/VisitEnrollmentCard";

type Activity = Database["public"]["Tables"]["activities"]["Row"];
type Registration = Database["public"]["Tables"]["event_registrations"]["Row"];

export default async function VisitDetailPage({
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
    .eq("type", "visit")
    .single();

  const activity = activityRes.data as Activity | null;

  if (!activity) notFound();

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
      {/* Return to visits list */}
      <div>
        <Link
          href="/membre/visites"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#888] hover:text-custom-amber transition-colors mb-4 group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Retour aux visites d&apos;entreprise</span>
        </Link>

        <div className="flex items-center gap-2">
          <Factory className="w-4 h-4 text-custom-amber" />
          <span className="text-xs text-custom-amber font-mono uppercase tracking-wider">
            Visite Industrielle
          </span>
        </div>
        <h1 className="font-display text-3xl md:text-4xl font-bold mt-1 text-white">
          {activity.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 mt-3 text-[#aaa]">
          {activity.entreprise && (
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-custom-amber">
              <Building className="h-4 w-4" />
              {activity.entreprise}
            </span>
          )}
          <span className="font-mono text-sm">
            {formatActivityDate(activity.date_start || activity.date || "")}
          </span>
          {activity.location && (
            <span className="inline-flex items-center gap-1.5 text-sm">
              <MapPin className="h-4 w-4 text-custom-amber" aria-hidden="true" />
              {activity.location}
            </span>
          )}
        </div>
      </div>

      {/* Cover Image */}
      {(activity.cover_image_url || activity.image_url) && (
        <div className="w-full h-64 md:h-96 rounded-3xl overflow-hidden border border-[#2a2c2c] relative shadow-2xl">
          <img
            src={activity.cover_image_url || activity.image_url || ""}
            alt={activity.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Description / Programme */}
      {activity.description && (
        <div className="bg-[#141515] border border-[#2a2c2c] rounded-3xl p-6 sm:p-8 space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-custom-amber">
            Description du programme & Objectifs
          </h2>
          <p className="text-[#ddd] text-sm leading-relaxed whitespace-pre-line">
            {activity.description}
          </p>
        </div>
      )}

      {/* Interactive Enrollment Card with places count & glowing button */}
      <VisitEnrollmentCard
        activity={activity}
        initialRegistration={registration}
        initialRegisteredCount={registeredCount || 0}
        userId={user?.id || ""}
      />
    </div>
  );
}
