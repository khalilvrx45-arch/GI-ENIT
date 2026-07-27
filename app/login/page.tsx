"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ChevronLeft, ArrowRight, AlertCircle, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Sign in with email/password
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;
      if (!data.user) throw new Error("Utilisateur introuvable.");

      // 2. Fetch the role from the profiles table (source of truth)
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .maybeSingle();

      // Determine role — fallback to user_metadata if profile not found
      const role = profile?.role || data.user.user_metadata?.role || "membre_actif";

      // 3. Redirect based on role
      if (role === "admin") {
        router.push("/admin");
      } else if (role === "membre_bureau" || role === "bureau") {
        router.push("/bureau");
      } else {
        router.push("/dashboard");
      }

    } catch (err: any) {
      setError(err.message || "Une erreur est survenue lors de la connexion.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Background Accents */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-custom-navy/20 via-black to-black z-0 pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-custom-amber/5 blur-[100px] z-0 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        {/* Back Link */}
        <Link
          href="/"
          className="group inline-flex items-center gap-2 text-custom-gray/60 hover:text-custom-amber text-xs font-semibold uppercase tracking-wider mb-8 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Retour au site</span>
        </Link>

        {/* Form Container */}
        <div className="bg-[#141515] border border-[#2A2B2B] rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
          {/* Header */}
          <div className="flex flex-col items-center mb-8 text-center">
            <div className="w-16 h-16 rounded-2xl overflow-hidden border border-[#333535] mb-6 shadow-[0_0_15px_rgba(252,163,17,0.1)]">
              <img src="/logo-cgi.jpg" alt="CGI ENIT" className="w-full h-full object-cover" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Club Génie Industriel ENIT</h1>
            <p className="text-[#a0a0a0] text-sm">Connectez-vous à votre espace</p>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-200">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#888] uppercase tracking-wider">Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-[#555] group-focus-within:text-custom-amber transition-colors" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="prenom.nom@enit.utm.tn"
                  className="w-full bg-[#1e2020] border border-[#333535] focus:border-custom-amber rounded-xl py-3.5 pl-11 pr-4 text-[#e2e2e2] text-sm outline-none transition-all duration-300 focus:shadow-[0_0_15px_rgba(252,163,17,0.15)] placeholder-[#555]"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-[#888] uppercase tracking-wider">Mot de passe</label>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-[#555] group-focus-within:text-custom-amber transition-colors" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#1e2020] border border-[#333535] focus:border-custom-amber rounded-xl py-3.5 pl-11 pr-12 text-[#e2e2e2] text-sm outline-none transition-all duration-300 focus:shadow-[0_0_15px_rgba(252,163,17,0.15)] placeholder-[#555]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#555] hover:text-[#fff] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              type="submit"
              className="w-full mt-4 bg-[#fca311] hover:bg-[#ffc887] text-black font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Se connecter
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </form>
          
          <div className="mt-8 text-center pt-2 border-t border-[#333535]">
            <p className="text-xs text-[#666]">
              Problème de connexion ? <br/> Contactez l'administrateur du système.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
