"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Shield, Users, Award, ChevronLeft, ArrowRight, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("membre_actif");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate auth action
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 1500);
  };

  const roles = [
    {
      id: "membre_actif",
      name: "Membre Actif",
      desc: "Accès aux formations & roadmaps exclusives",
      icon: <Users className="w-4 h-4" />
    },
    {
      id: "membre_bureau",
      name: "Membre du Bureau",
      desc: "Gestion opérationnelle & logistique du club",
      icon: <Award className="w-4 h-4" />
    },
    {
      id: "admin",
      name: "Administrateur",
      desc: "Contrôle global & configuration système",
      icon: <Shield className="w-4 h-4" />
    }
  ];

  return (
    <div className="min-h-[85vh] bg-black flex items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] rounded-full bg-custom-navy/30 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-custom-amber/5 blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-xl bg-custom-navy rounded-3xl border border-custom-gray/10 p-8 sm:p-12 relative z-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
      >
        
        {/* Back Link */}
        <Link
          href="/"
          className="group inline-flex items-center gap-2 text-custom-gray/60 hover:text-custom-amber text-xs font-semibold uppercase tracking-wider mb-8 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Retour à l'accueil</span>
        </Link>

        {/* Header */}
        <div className="space-y-3 mb-8">
          <motion.div 
            whileHover={{ rotate: 5, scale: 1.05 }}
            className="inline-flex items-center justify-center w-12 h-12 rounded-2xl overflow-hidden bg-black border border-custom-amber/20 shadow-[0_0_15px_rgba(252,163,17,0.1)]"
          >
            <img src="/logo-cgi.jpg" alt="CGI ENIT Logo" className="w-full h-full object-cover" />
          </motion.div>
          <h2 className="text-3xl font-extrabold text-custom-white tracking-tight">
            Espace Membres
          </h2>
          <p className="text-sm text-custom-gray/60">
            Connectez-vous pour accéder à votre portail personnalisé et vos outils.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {success ? (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-6 text-center py-8"
            >
              <div className="w-16 h-16 rounded-full bg-custom-amber/10 border border-custom-amber/30 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(252,163,17,0.1)]">
                <CheckCircle2 className="w-8 h-8 text-custom-amber animate-bounce" />
              </div>
              <div className="space-y-2">
                <h3 className="text-custom-white text-xl font-bold">Connexion réussie !</h3>
                <p className="text-sm text-custom-gray/60 max-w-sm mx-auto">
                  Simulation de l'authentification Firebase Auth réussie. Redirection vers votre tableau de bord en cours...
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setSuccess(false)}
                className="px-6 py-2.5 rounded-xl border border-custom-gray/20 hover:border-custom-amber text-custom-gray/80 hover:text-custom-amber text-sm font-semibold transition-colors cursor-pointer"
              >
                Réinitialiser la simulation
              </motion.button>
            </motion.div>
          ) : (
            <motion.form 
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleSubmit} 
              className="space-y-6"
            >
              {/* Input Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-custom-white">
                  Adresse Email
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-custom-gray/40">
                    <Mail className="w-5 h-5" />
                  </span>
                  <input
                    id="email"
                    type="email"
                    required
                    placeholder="ex: prenom.nom@enit.utm.tn"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-black border border-custom-gray/10 focus:border-custom-amber rounded-xl py-3.5 pl-12 pr-4 text-sm text-custom-white placeholder-custom-gray/30 outline-none transition-all duration-300 focus:shadow-[0_0_15px_rgba(252,163,17,0.15)]"
                  />
                </div>
              </div>

              {/* Input Password */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-custom-white">
                    Mot de passe
                  </label>
                  <a href="#" className="text-[10px] text-custom-amber hover:underline font-semibold uppercase tracking-wider">
                    Oublié ?
                  </a>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-custom-gray/40">
                    <Lock className="w-5 h-5" />
                  </span>
                  <input
                    id="password"
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-black border border-custom-gray/10 focus:border-custom-amber rounded-xl py-3.5 pl-12 pr-4 text-sm text-custom-white placeholder-custom-gray/30 outline-none transition-all duration-300 focus:shadow-[0_0_15px_rgba(252,163,17,0.15)]"
                  />
                </div>
              </div>

              {/* Role Selection Tabs */}
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-custom-white">
                  Rôle attendu
                </label>
                <div className="grid grid-cols-1 gap-2.5">
                  {roles.map((item) => (
                    <motion.button
                      key={item.id}
                      type="button"
                      whileHover={{ x: 4, borderColor: role === item.id ? "#fca311" : "rgba(252,163,17,0.2)" }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => setRole(item.id)}
                      className={`flex items-center gap-3.5 p-3 rounded-xl border text-left transition-all duration-300 cursor-pointer ${
                        role === item.id
                          ? "bg-custom-amber/10 border-custom-amber text-custom-amber"
                          : "bg-black/60 border-custom-gray/5 text-custom-gray/50 hover:text-custom-gray/80"
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                          role === item.id ? "bg-custom-amber text-custom-black" : "bg-custom-navy text-custom-gray/40"
                        }`}
                      >
                        {item.icon}
                      </div>
                      <div>
                        <div className="text-xs font-bold">{item.name}</div>
                        <div className="text-[10px] opacity-70 mt-0.5">{item.desc}</div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02, boxShadow: "0 0 25px rgba(252,163,17,0.3)" }}
                whileTap={{ scale: 0.98 }}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-custom-amber text-custom-black font-extrabold text-sm tracking-wider uppercase hover:bg-custom-amber/90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-[0_0_20px_rgba(252,163,17,0.15)]"
              >
                {loading ? (
                  <span>Connexion en cours...</span>
                ) : (
                  <>
                    <span>S'authentifier</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
