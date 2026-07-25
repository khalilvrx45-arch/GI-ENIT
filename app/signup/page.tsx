"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ChevronLeft, ArrowRight, AlertCircle, Loader2, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const router = useRouter();
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            role: "membre", // Default role for new signups
          }
        }
      });

      if (error) throw error;
      
      // Usually, Supabase sends an email confirmation. We show a success message.
      setSuccess(true);
      
      // We can also redirect to login after a few seconds
      setTimeout(() => {
        router.push("/login");
      }, 4000);
      
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue lors de l'inscription.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Background Accents */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-custom-navy/20 via-black to-black z-0 pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-custom-amber/5 blur-[100px] z-0 pointer-events-none" />

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
            <h1 className="text-2xl font-bold text-white mb-2">Rejoindre le CGI</h1>
            <p className="text-[#a0a0a0] text-sm">Créez votre compte membre</p>
          </div>

          {/* Success Message */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-start gap-3"
              >
                <div className="w-5 h-5 text-green-500 shrink-0 mt-0.5 rounded-full border-2 border-green-500 flex items-center justify-center text-xs">✓</div>
                <p className="text-sm text-green-200">
                  Inscription réussie ! Vérifiez votre boîte mail pour confirmer votre compte. Redirection vers la connexion...
                </p>
              </motion.div>
            )}
          </AnimatePresence>

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

          <form onSubmit={handleSignup} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              {/* First Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#888] uppercase tracking-wider">Prénom</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="w-4 h-4 text-[#555] group-focus-within:text-custom-amber transition-colors" />
                  </div>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Prénom"
                    className="w-full bg-[#1e2020] border border-[#333535] focus:border-custom-amber rounded-xl py-3.5 pl-10 pr-4 text-[#e2e2e2] text-sm outline-none transition-all duration-300 focus:shadow-[0_0_15px_rgba(252,163,17,0.15)] placeholder-[#555]"
                  />
                </div>
              </div>
              
              {/* Last Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#888] uppercase tracking-wider">Nom</label>
                <div className="relative group">
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Nom"
                    className="w-full bg-[#1e2020] border border-[#333535] focus:border-custom-amber rounded-xl py-3.5 px-4 text-[#e2e2e2] text-sm outline-none transition-all duration-300 focus:shadow-[0_0_15px_rgba(252,163,17,0.15)] placeholder-[#555]"
                  />
                </div>
              </div>
            </div>

            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#888] uppercase tracking-wider">Email ENIT</label>
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
              <label className="text-xs font-semibold text-[#888] uppercase tracking-wider">Mot de passe</label>
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
                  minLength={6}
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

            {/* Signup Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading || success}
              type="submit"
              className="w-full mt-4 bg-[#fca311] hover:bg-[#ffc887] text-black font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Créer mon compte
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </form>
          
          <div className="mt-8 text-center border-t border-[#333535] pt-6">
            <p className="text-sm text-[#888]">
              Déjà membre ? {" "}
              <Link href="/login" className="text-custom-amber hover:text-[#ffc887] font-semibold transition-colors">
                Connectez-vous
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
