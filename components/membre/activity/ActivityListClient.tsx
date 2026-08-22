"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ActivityCard from "./ActivityCard";
import { Database } from "@/lib/supabase/database.types";
import { Search, Sparkles, CalendarDays, Filter, UserCheck, Layers } from "lucide-react";

type Activity = Database["public"]["Tables"]["activities"]["Row"];
type Registration = Database["public"]["Tables"]["event_registrations"]["Row"];

type Props = {
  activities: {
    activity: Activity;
    registration: Registration | null;
    registeredCount: number;
  }[];
};

export default function ActivityListClient({ activities }: Props) {
  const [activeTab, setActiveTab] = useState<"all" | "registered">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const registeredCount = activities.filter((a) => !!a.registration).length;

  const filtered = useMemo(() => {
    return activities.filter((item) => {
      // Registration filter
      if (activeTab === "registered" && !item.registration) {
        return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const act = item.activity;
        const matchesTitle = act.title?.toLowerCase().includes(query);
        const matchesDesc = (act.description || "").toLowerCase().includes(query);
        const matchesLocation = (act.location || "").toLowerCase().includes(query);
        const matchesCompany = (act.entreprise || "").toLowerCase().includes(query);
        const matchesTrainer = (act.trainer_name || "").toLowerCase().includes(query);

        if (!matchesTitle && !matchesDesc && !matchesLocation && !matchesCompany && !matchesTrainer) {
          return false;
        }
      }

      return true;
    });
  }, [activities, activeTab, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Top Filter & Search Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Tabs: All / Registered */}
        <div className="flex items-center gap-1.5 p-1 bg-[#141515] border border-[#2a2c2c] rounded-2xl self-start">
          <button
            onClick={() => setActiveTab("all")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "all"
                ? "bg-[#fca311] text-black shadow-md shadow-[#fca311]/20"
                : "text-[#888] hover:text-white hover:bg-white/5"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Toutes ({activities.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("registered")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "registered"
                ? "bg-[#fca311] text-black shadow-md shadow-[#fca311]/20"
                : "text-[#888] hover:text-white hover:bg-white/5"
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Mes Inscriptions ({registeredCount})</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par titre, lieu..."
            className="w-full bg-[#141515] border border-[#2a2c2c] focus:border-[#fca311] rounded-2xl py-2 pl-10 pr-4 text-white text-xs outline-none transition-all placeholder-[#666]"
          />
        </div>
      </div>

      {/* Activities Grid */}
      {filtered.length > 0 ? (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.05 },
            },
          }}
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((item) => (
              <motion.div
                key={item.activity.id}
                layout
                variants={{
                  hidden: { opacity: 0, y: 15 },
                  visible: { opacity: 1, y: 0 },
                }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex"
              >
                <ActivityCard
                  activity={item.activity}
                  registration={item.registration}
                  registeredCount={item.registeredCount}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="bg-[#141515] border border-dashed border-[#2a2c2c] rounded-3xl p-12 text-center text-[#888] space-y-3">
          <CalendarDays className="w-10 h-10 text-[#444] mx-auto" />
          <h3 className="text-base font-bold text-white">
            {activeTab === "registered"
              ? "Vous n'êtes inscrit à aucune activité pour le moment."
              : searchQuery.trim()
              ? "Aucune activité ne correspond à votre recherche."
              : "Aucune activité disponible pour le moment."}
          </h3>
          <p className="text-xs text-[#aaa]">
            {activeTab === "registered"
              ? "Consultez les activités ci-dessus et inscrivez-vous en un clic !"
              : "Revenez bientôt pour découvrir les prochaines sessions du Club GI ENIT."}
          </p>
        </div>
      )}
    </div>
  );
}