"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserPlus,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ChevronLeft,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ShieldAlert,
  Sparkles,
  Zap,
  Users,
  Shield,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useSiteSettings } from "@/components/providers/SiteSettingsProvider";
import { useI18n } from "@/lib/i18n/context";
import LanguageToggle from "@/components/ui/LanguageToggle";
import ThemeToggle from "@/components/ui/ThemeToggle";

export default function SignUpPage() {
  const { t } = useI18n();
  const { logoUrl } = useSiteSettings();
  const router = useRouter();
  const supabase = createClient();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<"admin" | "membre_bureau" | "membre_actif">("admin");
  const [statutMembre, setStatutMembre] = useState<"senior" | "actif" | "alumni">("senior");
  const [classe, setClasse] = useState("1AGI1");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Quick Preset Creator
  const handleQuickCreate = async (presetRole: "admin" | "membre_bureau" | "membre_actif") => {
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    const presetData = {
      admin: {
        email: "admin@gi-enit.tn",
        password: "Password123!",
        firstName: "Admin",
        lastName: "CGI",
        role: "admin",
        statutMembre: "senior",
        classe: "2AGI1",
      },
      membre_bureau: {
        email: "bureau@gi-enit.tn",
        password: "Password123!",
        firstName: "Responsable",
        lastName: "Bureau",
        role: "membre_bureau",
        statutMembre: "senior",
        classe: "2AGI2",
      },
      membre_actif: {
        email: "membre@gi-enit.tn",
        password: "Password123!",
        firstName: "Adhérent",
        lastName: "Actif",
        role: "membre_actif",
        statutMembre: "actif",
        classe: "1AGI1",
      },
    }[presetRole];

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(presetData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur de création");

      // Auto sign in
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: presetData.email,
        password: presetData.password,
      });

      if (signInErr) throw signInErr;

      setSuccessMsg(`Compte ${presetRole.toUpperCase()} créé et connecté ! Redirection...`);

      setTimeout(() => {
        if (presetRole === "admin") router.push("/admin");
        else if (presetRole === "membre_bureau") router.push("/bureau");
        else router.push("/membre");
        router.refresh();
      }, 1000);
    } catch (err: any) {
      setError(err.message || "Erreur lors de la création.");
    } finally {
      setLoading(false);
    }
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          firstName,
          lastName,
          role,
          statutMembre,
          classe,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur lors de l'enregistrement.");

      // Auto login with credentials
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) throw loginError;

      setSuccessMsg("Compte créé avec succès ! Connexion en cours...");

      setTimeout(() => {
        if (role === "admin") router.push("/admin");
        else if (role === "membre_bureau") router.push("/bureau");
        else router.push("/membre");
        router.refresh();
      }, 1000);
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4 py-10 relative overflow-hidden transition-colors duration-200">
      {/* Top right language & theme controls */}
      <div className="absolute top-6 right-6 z-20 flex items-center gap-2">
        <LanguageToggle />
        <ThemeToggle />
      </div>

      <div className="w-full max-w-xl relative z-10 space-y-6">
        {/* Back Link */}
        <Link
          href="/login"
          className="group inline-flex items-center gap-2 text-muted hover:text-custom-amber text-xs font-semibold uppercase tracking-wider transition-colors"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Retour à la connexion</span>
        </Link>

        {/* 1-CLICK PRESET GENERATOR BANNER */}
        <div className="bg-gradient-to-r from-custom-amber/15 via-amber-500/10 to-transparent border border-custom-amber/30 rounded-3xl p-5 shadow-xl space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-custom-amber" />
            <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">
              Création Rapide en 1 Clic (Mode Test)
            </h2>
          </div>
          <p className="text-xs text-muted">
            Cliquez sur l&apos;un des 3 espaces ci-dessous pour créer le compte test, vous connecter et être redirigé instantanément :
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickCreate("admin")}
              className="px-3 py-2.5 rounded-xl bg-[#1e2020] hover:bg-custom-amber hover:text-black border border-[#333535] text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm group"
            >
              <Shield className="w-3.5 h-3.5 text-custom-amber group-hover:text-black" />
              <span>Compte Admin</span>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickCreate("membre_bureau")}
              className="px-3 py-2.5 rounded-xl bg-[#1e2020] hover:bg-custom-amber hover:text-black border border-[#333535] text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm group"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400 group-hover:text-black" />
              <span>Compte Bureau</span>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickCreate("membre_actif")}
              className="px-3 py-2.5 rounded-xl bg-[#1e2020] hover:bg-custom-amber hover:text-black border border-[#333535] text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm group"
            >
              <Users className="w-3.5 h-3.5 text-blue-400 group-hover:text-black" />
              <span>Compte Membre</span>
            </button>
          </div>
        </div>

        {/* CUSTOM SIGN UP FORM CONTAINER */}
        <div className="bg-surface-card border border-surface-border rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
          <div className="flex items-center gap-4 pb-4 border-b border-surface-border">
            <div className="w-12 h-12 rounded-2xl bg-surface-input border border-surface-border flex items-center justify-center overflow-hidden shrink-0">
              <img src={logoUrl} alt="Logo" className="w-full h-full object-contain p-1" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Créer un compte personnalisé</h1>
              <p className="text-xs text-muted mt-0.5">
                Choisissez votre rôle pour accéder à l&apos;espace correspondant.
              </p>
            </div>
          </div>

          {/* Feedback messages */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
            {successMsg && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2 font-bold"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleCustomSubmit} className="space-y-4">
            {/* Name Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted uppercase">Prénom *</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Khalil"
                  className="w-full bg-surface-input border border-surface-border focus:border-custom-amber rounded-xl py-2.5 px-3.5 text-xs text-foreground outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted uppercase">Nom *</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Ksibi"
                  className="w-full bg-surface-input border border-surface-border focus:border-custom-amber rounded-xl py-2.5 px-3.5 text-xs text-foreground outline-none"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-muted uppercase">Email *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="khalil.ksibi@etudiant-enit.utm.tn"
                  className="w-full bg-surface-input border border-surface-border focus:border-custom-amber rounded-xl py-2.5 pl-10 pr-3.5 text-xs text-foreground outline-none"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-muted uppercase">Mot de passe *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-surface-input border border-surface-border focus:border-custom-amber rounded-xl py-2.5 pl-10 pr-10 text-xs text-foreground outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Role Selector */}
            <div className="space-y-1.5 pt-1">
              <label className="text-[11px] font-bold text-custom-amber uppercase tracking-wider block">
                Rôle & Espace Assigné *
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setRole("admin")}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                    role === "admin"
                      ? "bg-custom-amber text-black border-custom-amber shadow-md"
                      : "bg-surface-input border-surface-border text-muted hover:text-foreground"
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  <span>Admin</span>
                  <span className="text-[9px] font-normal opacity-80">(/admin)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole("membre_bureau")}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                    role === "membre_bureau"
                      ? "bg-custom-amber text-black border-custom-amber shadow-md"
                      : "bg-surface-input border-surface-border text-muted hover:text-foreground"
                  }`}
                >
                  <Zap className="w-4 h-4" />
                  <span>Bureau</span>
                  <span className="text-[9px] font-normal opacity-80">(/bureau)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole("membre_actif")}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                    role === "membre_actif"
                      ? "bg-custom-amber text-black border-custom-amber shadow-md"
                      : "bg-surface-input border-surface-border text-muted hover:text-foreground"
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Membre</span>
                  <span className="text-[9px] font-normal opacity-80">(/membre)</span>
                </button>
              </div>
            </div>

            {/* Statut & Classe */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted uppercase">Statut Membre</label>
                <select
                  value={statutMembre}
                  onChange={(e) => setStatutMembre(e.target.value as any)}
                  className="w-full bg-surface-input border border-surface-border focus:border-custom-amber rounded-xl py-2.5 px-3 text-xs text-foreground outline-none cursor-pointer"
                >
                  <option value="actif">Membre Actif (1ère année)</option>
                  <option value="senior">Membre Senior (2ème année)</option>
                  <option value="alumni">Alumni (3ème année+)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted uppercase">Classe ENIT</label>
                <select
                  value={classe}
                  onChange={(e) => setClasse(e.target.value)}
                  className="w-full bg-surface-input border border-surface-border focus:border-custom-amber rounded-xl py-2.5 px-3 text-xs text-foreground outline-none cursor-pointer"
                >
                  <option value="1AGI1">1AGI1</option>
                  <option value="1AGI2">1AGI2</option>
                  <option value="1AGI3">1AGI3</option>
                  <option value="2AGI1">2AGI1</option>
                  <option value="2AGI2">2AGI2</option>
                  <option value="2AGI3">2AGI3</option>
                  <option value="3AGI">3AGI</option>
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 bg-[#fca311] hover:bg-[#ffc887] text-black font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-lg"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Créer le compte et se connecter</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
