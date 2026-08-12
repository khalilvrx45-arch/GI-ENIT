"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  LogOut,
  Users,
  ChevronRight,
  Sparkles,
  Calendar,
  MapPin,
  Workflow,
  ArrowUpRight,
  BookOpen
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export interface Activity {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  location?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadActivities() {
      try {
        const res = await fetch("/api/activities?limit=3");
        const data = await res.json();
        if (res.ok && data.activities) {
          setActivities(data.activities);
        }
      } catch (err) {
        console.error("Erreur de chargement des activités dans le dashboard", err);
      } finally {
        setLoading(false);
      }
    }
    loadActivities();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 sm:p-10 relative overflow-x-hidden font-sans">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-custom-navy/20 rounded-full blur-[160px] pointer-events-none" />

      {/* Top Bar */}
      <div className="max-w-6xl mx-auto flex items-center justify-between pb-8 border-b border-custom-gray/10 mb-10 relative z-10">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-custom-navy border border-custom-amber/30 flex items-center justify-center text-custom-amber font-extrabold shadow-[0_0_15px_rgba(252,163,17,0.15)]">
            CGI
          </div>
          <div>
            <div className="font-extrabold text-sm text-custom-white group-hover:text-custom-amber transition-colors">
              CGI ENIT
            </div>
            <div className="text-[10px] text-custom-gray/50 font-mono uppercase">
              Espace Membre
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-custom-navy hover:bg-custom-navy/80 border border-custom-gray/10 text-xs font-semibold text-custom-gray/80 hover:text-white transition-all"
          >
            <span>Site public</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-custom-gray/60 hover:text-red-400 transition-colors text-xs font-semibold px-3 py-2 rounded-xl hover:bg-red-500/10"
          >
            <LogOut className="w-4 h-4" /> Déconnexion
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto space-y-10 relative z-10">
        {/* Welcome Header Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-custom-navy/60 border border-custom-amber/20 rounded-3xl p-8 sm:p-10 relative overflow-hidden shadow-2xl"
        >
          <div className="max-w-2xl space-y-4">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 border border-custom-amber/30 text-custom-amber text-xs font-mono font-bold uppercase tracking-wider">
              <Users className="w-3.5 h-3.5" /> Espace Membre Actif
            </span>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Bienvenue sur votre <span className="text-custom-amber">Tableau de Bord</span>
            </h1>
            <p className="text-custom-gray/70 text-sm sm:text-base leading-relaxed">
              Consultez les récentes activités du club, accédez aux formations et restez connecté avec l'ensemble des membres et projets du CGI ENIT.
            </p>
          </div>
        </motion.div>

        {/* Section: Activités du Club pour les Membres */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-custom-amber" />
              <h2 className="text-xl font-extrabold text-custom-white tracking-tight">
                Dernières Activités du Club
              </h2>
            </div>
            <Link
              href="/activities"
              className="inline-flex items-center gap-1.5 text-xs font-mono text-custom-amber hover:underline uppercase tracking-wider"
            >
              <span>Voir tout</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="h-44 bg-custom-navy/30 border border-custom-gray/10 rounded-2xl animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {activities.map((act) => (
                <Link
                  key={act.id}
                  href="/activities"
                  className="bg-custom-navy p-6 rounded-2xl border border-custom-gray/10 hover:border-custom-amber/40 transition-all duration-300 group flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold uppercase text-custom-amber bg-custom-amber/10 px-2 py-0.5 rounded-md">
                        {act.category}
                      </span>
                      <span className="text-[11px] font-mono text-custom-gray/50 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-custom-amber" />
                        {new Date(act.date).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </div>
                    <h3 className="font-extrabold text-base text-custom-white group-hover:text-custom-amber transition-colors line-clamp-1">
                      {act.title}
                    </h3>
                    <p className="text-xs text-custom-gray/70 line-clamp-2">
                      {act.description}
                    </p>
                  </div>
                  <div className="pt-4 mt-4 border-t border-custom-gray/5 flex items-center justify-between text-xs text-custom-amber font-semibold">
                    <span>En savoir plus</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
