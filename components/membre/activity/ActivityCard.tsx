"use client";

import Link from "next/link";
import { Database } from "@/lib/supabase/database.types";
import { formatActivityDate, getActivityTypeLabel } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  CalendarDays,
  MapPin,
  Users,
  Building,
  GraduationCap,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Clock,
  ExternalLink,
} from "lucide-react";

type Activity = Database["public"]["Tables"]["activities"]["Row"];
type Registration = Database["public"]["Tables"]["event_registrations"]["Row"];

type Props = {
  activity: Activity;
  registration: Registration | null;
  registeredCount: number;
};

export default function ActivityCard({ activity, registration, registeredCount }: Props) {
  const isFull = activity.capacity ? registeredCount >= activity.capacity : false;

  const getCategoryConfig = () => {
    switch (activity.type) {
      case "visit":
        return {
          label: "Visite Industrielle",
          icon: Building,
          badgeBg: "bg-amber-500/10 border-amber-500/30 text-[#fca311]",
          glow: "from-[#fca311]/15 to-transparent",
          route: "visites",
        };
      case "formation":
        return {
          label: "Formation Technique",
          icon: GraduationCap,
          badgeBg: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
          glow: "from-emerald-500/15 to-transparent",
          route: "formations",
        };
      default:
        return {
          label: "Événement Club",
          icon: CalendarDays,
          badgeBg: "bg-sky-500/10 border-sky-500/30 text-sky-400",
          glow: "from-sky-500/15 to-transparent",
          route: "evenements",
        };
    }
  };

  const config = getCategoryConfig();
  const Icon = config.icon;
  const imageUrl = activity.cover_image_url || activity.image_url;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="group relative flex flex-col h-full bg-[#141515] border border-[#2a2c2c] hover:border-[#fca311]/50 rounded-3xl overflow-hidden shadow-xl hover:shadow-[0_10px_35px_rgba(252,163,17,0.12)] transition-all duration-300"
    >
      {/* Top Ambient Glow */}
      <div className={`absolute -top-12 -right-12 w-36 h-36 rounded-full bg-gradient-to-br ${config.glow} blur-2xl pointer-events-none`} />

      {/* Optional Card Image / Header Visual */}
      {imageUrl ? (
        <div className="relative h-44 w-full overflow-hidden bg-[#1e2020] border-b border-[#2a2c2c]/60">
          <img
            src={imageUrl}
            alt={activity.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#141515] via-[#141515]/40 to-transparent" />
          
          <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between gap-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[11px] font-bold uppercase tracking-wider backdrop-blur-md border ${config.badgeBg}`}>
              <Icon className="w-3.5 h-3.5" />
              <span>{config.label}</span>
            </span>

            {registration ? (
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold backdrop-blur-md border ${
                registration.status === 'confirmed'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              }`}>
                {registration.status === 'confirmed' ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>Inscrit</span>
                  </>
                ) : (
                  <>
                    <Clock className="w-3 h-3 text-amber-400" />
                    <span>En attente</span>
                  </>
                )}
              </span>
            ) : isFull ? (
              <span className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-zinc-800/80 text-zinc-400 border border-zinc-700/60 backdrop-blur-md">
                Complet
              </span>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="pt-5 px-5 flex items-center justify-between gap-2">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[11px] font-bold uppercase tracking-wider border ${config.badgeBg}`}>
            <Icon className="w-3.5 h-3.5" />
            <span>{config.label}</span>
          </span>

          {registration ? (
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold border ${
              registration.status === 'confirmed'
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
            }`}>
              {registration.status === 'confirmed' ? (
                <>
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>Inscrit</span>
                </>
              ) : (
                <>
                  <Clock className="w-3 h-3 text-amber-400" />
                  <span>En attente</span>
                </>
              )}
            </span>
          ) : isFull ? (
            <span className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-zinc-800 text-zinc-400 border border-zinc-700">
              Complet
            </span>
          ) : null}
        </div>
      )}

      {/* Main Content Area */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2.5">
          {/* Subtitle / Company / Trainer */}
          {activity.entreprise && (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#fca311]">
              <Building className="w-3.5 h-3.5" />
              <span>{activity.entreprise}</span>
            </div>
          )}
          {activity.trainer_name && (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Formateur : {activity.trainer_name}</span>
            </div>
          )}

          {/* Title */}
          <h3 className="font-display font-bold text-lg text-white group-hover:text-[#fca311] transition-colors leading-snug line-clamp-2">
            {activity.title}
          </h3>

          {/* Description snippet */}
          {activity.description && (
            <p className="text-xs text-[#888] line-clamp-2 leading-relaxed">
              {activity.description}
            </p>
          )}
        </div>

        <div className="space-y-3.5 pt-2">
          {/* Metadata Row: Date & Location */}
          <div className="space-y-1.5 text-xs text-[#aaa]">
            <div className="flex items-center gap-2 font-mono">
              <CalendarDays className="w-3.5 h-3.5 text-[#fca311] shrink-0" />
              <span>{formatActivityDate(activity.date_start || activity.date || "")}</span>
            </div>

            {activity.location && (
              <div className="flex items-center gap-2 text-[#888]">
                <MapPin className="w-3.5 h-3.5 text-[#666] shrink-0" />
                <span className="truncate">{activity.location}</span>
              </div>
            )}
          </div>

          {/* CTA Link Button */}
          <div className="pt-2">
            <Link
              href={`/membre/${config.route}/${activity.id}`}
              className="w-full py-2.5 px-4 rounded-xl bg-[#1e2020] hover:bg-[#fca311] text-white hover:text-black border border-[#2a2c2c] hover:border-[#fca311] font-bold text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 group/btn cursor-pointer shadow-sm"
            >
              <span>Voir le détail</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}