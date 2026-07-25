"use client";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { LogOut, Briefcase, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function BureauPage() {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#fca311]/5 rounded-full blur-[150px] pointer-events-none" />
      
      <div className="absolute top-6 right-6 z-20">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 text-custom-gray/60 hover:text-white transition-colors text-sm font-semibold"
        >
          <LogOut className="w-4 h-4" /> Déconnexion
        </button>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="z-10 text-center max-w-lg px-6"
      >
        <div className="w-20 h-20 bg-[#141515] border border-[#fca311]/20 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-[0_0_30px_rgba(252,163,17,0.15)]">
          <Briefcase className="w-10 h-10 text-[#fca311]" />
        </div>
        
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">Portail <span className="text-custom-amber">Bureau</span></h1>
        
        <div className="bg-[#141515] border border-[#2A2B2B] rounded-2xl p-6 mb-8 text-left">
          <p className="text-[#a0a0a0] leading-relaxed">
            L'espace de gestion pour les membres du bureau arrive bientôt. Vous pourrez y gérer les événements, suivre l'avancement des membres et piloter la logistique du club.
          </p>
        </div>

        <Link href="/" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold transition-all">
          Retour au site public <ChevronRight className="w-4 h-4" />
        </Link>
      </motion.div>
    </div>
  );
}
