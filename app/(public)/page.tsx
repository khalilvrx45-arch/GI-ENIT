"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  Users,
  Target,
  Heart,
  TrendingUp,
  Cpu,
  ChevronRight,
  ClipboardList,
  Workflow,
  ShieldCheck,
  LineChart,
  Lightbulb,
  Factory,
  Zap,
  Shield,
  Flame,
  Trophy,
  Rocket,
  Calculator,
  FolderKanban,
  Truck,
  Linkedin,
  Github,
  Code2,
} from "lucide-react";
import HeroBackgroundCarousel from "@/components/home/HeroBackgroundCarousel";
import ClubActivitiesSection from "@/components/home/ClubActivitiesSection";
import { useSiteSettings } from "@/components/providers/SiteSettingsProvider";
import { createClient } from "@/lib/supabase/client";

// Icon Helper
const renderDynamicIcon = (name: string, className = "w-6 h-6") => {
  switch (name) {
    case "Users": return <Users className={className} />;
    case "Heart": return <Heart className={className} />;
    case "Target": return <Target className={className} />;
    case "Zap": return <Zap className={className} />;
    case "Shield": return <Shield className={className} />;
    case "Flame": return <Flame className={className} />;
    case "Trophy": return <Trophy className={className} />;
    case "Rocket": return <Rocket className={className} />;
    case "TrendingUp": return <TrendingUp className={className} />;
    case "Factory": return <Factory className={className} />;
    case "ShieldCheck": return <ShieldCheck className={className} />;
    case "Calculator": return <Calculator className={className} />;
    case "Cpu": return <Cpu className={className} />;
    case "FolderKanban": return <FolderKanban className={className} />;
    case "LineChart": return <LineChart className={className} />;
    case "Truck": return <Truck className={className} />;
    case "ClipboardList": return <ClipboardList className={className} />;
    default: return <Workflow className={className} />;
  }
};

// Fallback Default Data
const DEFAULT_WHY_US = [
  { title: "Team Spirit", description: "Une cohésion d'équipe indéfectible. Nous croyons en la synergie des talents de l'ENIT pour accomplir de grandes choses ensemble.", icon: "Users" },
  { title: "Passion", description: "L'amour de l'ingénierie et de l'optimisation. Nous cherchons constamment à repousser les limites de l'innovation industrielle.", icon: "Heart" },
  { title: "One Goal", description: "Un seul objectif : l'excellence. Former les ingénieurs GI de demain à être prêts pour les défis du marché mondial.", icon: "Target" },
];

const DEFAULT_ROADMAPS = [
  {
    icon: "TrendingUp",
    title: "Supply Chain & Logistique",
    role: "Supply Chain Manager, Ingénieur Logistique",
    description: "L'art de piloter les flux physiques et d'information de bout en bout avec une efficacité maximale et des coûts optimisés.",
    skills: ["Gestion des stocks & Approvisionnements", "Transport, Distribution & Logistique Verte", "Global Supply Chain & S&OP"],
    tools: ["SAP ERP", "Advanced Planning & Scheduling (APS)", "Logiciels de routage (VRP)"],
  },
  {
    icon: "Factory",
    title: "Gestion de Production",
    role: "Responsable Production, Ingénieur Méthodes",
    description: "Planifier, ordonnancer et fabriquer en minimisant les gaspillages et en maximisant la productivité.",
    skills: ["MRP / ERP & Ordonnancement", "Lean Manufacturing (Gaspillages, VSM)", "Système Juste-à-Temps & Kanban"],
    tools: ["Jira / Trello", "MS Project / Primavera", "Systèmes MES (Manufacturing Execution Systems)"],
  },
  {
    icon: "ShieldCheck",
    title: "Qualité & Amélioration Continue",
    role: "Ingénieur Qualité, Black Belt Lean Six Sigma",
    description: "Garantir la conformité et installer une culture d'amélioration permanente pour atteindre le zéro défaut.",
    skills: ["Méthodologie Six Sigma (DMAIC)", "Outils Lean (5S, Kaizen, SMED, Poka-Yoke)", "Normes ISO 9001, 14001, 45001"],
    tools: ["Minitab (Analyse statistique)", "Diagramme d'Ishikawa / Pareto", "FMEA (AMDEC)"],
  },
  {
    icon: "LineChart",
    title: "Recherche Opérationnelle",
    role: "Ingénieur R&D, Data Analyst Industriel",
    description: "Utiliser les mathématiques appliquées et l'informatique pour prendre les meilleures décisions possibles.",
    skills: ["Modélisation mathématique & Optimisation", "Simulation de flux et d'événements discrets", "Théorie des graphes & Aide à la décision"],
    tools: ["Python (PuLP, SciPy)", "Gurobi / CPLEX", "Arena / FlexSim (Simulation de flux)"],
  },
  {
    icon: "Cpu",
    title: "Industrie 4.0 & Maintenance",
    role: "Ingénieur Industrie 4.0, Responsable Maintenance",
    description: "Intégrer le digital au cœur de l'usine physique pour la rendre intelligente, flexible et prédictive.",
    skills: ["Smart Factory & IoT Industriel", "Maintenance Prédictive & GMAO", "Jumeaux numériques (Digital Twins)"],
    tools: ["Node-RED / Plateformes IoT", "Logiciels GMAO", "SCADA & Automates Programmables (API)"],
  },
  {
    icon: "ClipboardList",
    title: "Gestion de Projets & Économie",
    role: "Chef de Projet Industriel, Auditeur de processus",
    description: "Piloter des projets complexes multidisciplinaires en maîtrisant les budgets, les délais et les risques.",
    skills: ["Management de projet (PMBOK, Agile/Scrum)", "Gestion des risques industriels & financiers", "Ingénierie financière & Analyse de rentabilité"],
    tools: ["MS Project", "Analyse de sensibilité financière", "Matrice de criticité (Risk Register)"],
  },
];

const DEFAULT_TESTIMONIALS = [
  {
    id: "def-1",
    author_name: "Prof. Mohamed Ben Ali",
    author_role: "Enseignant-Chercheur ENIT",
    quote: "Le Club Génie Industriel de l'ENIT joue un rôle fondamental dans le pont entre la théorie académique avancée et les pratiques réelles du monde industriel.",
    author_photo_url: null,
  },
  {
    id: "def-2",
    author_name: "Sarra Mansour",
    author_role: "Alumni ENIT • Supply Chain Manager at Airbus",
    quote: "Grâce aux ateliers et hackathons du CGI, j'ai développé une compréhension concrète des flux de production qui m'a directement propulsée dans ma carrière.",
    author_photo_url: null,
  },
  {
    id: "def-3",
    author_name: "Youssef Gharbi",
    author_role: "Ancien Président du Club CGI ENIT",
    quote: "L'esprit de synergie et la quête constante de l'excellence font du CGI une véritable école de leadership au cœur de l'ENIT.",
    author_photo_url: null,
  },
];

const DEFAULT_DEVS = [
  { name: "Khalil Ben Ahmed", role: "Lead Fullstack Developer", linkedin: "https://linkedin.com", github: "https://github.com" },
  { name: "Yassine Mansour", role: "UI/UX & Frontend Engineer", linkedin: "https://linkedin.com", github: "https://github.com" },
  { name: "Aymen Ben Ali", role: "Backend & Cloud Architect", linkedin: "https://linkedin.com", github: "https://github.com" },
];

export default function HomePage() {
  const [activeRoadmapIdx, setActiveRoadmapIdx] = useState<number>(0);
  const { logoUrl } = useSiteSettings();
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [siteContent, setSiteContent] = useState<Record<string, any>>({});

  useEffect(() => {
    const supabase = createClient();
    // Testimonials
    supabase
      .from("testimonials")
      .select("*")
      .eq("approved", true)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data && data.length > 0) {
          setTestimonials(data);
        } else {
          setTestimonials(DEFAULT_TESTIMONIALS);
        }
      });

    // Site Content
    supabase
      .from("site_content")
      .select("section, content")
      .then(({ data }) => {
        if (data) {
          const map: Record<string, any> = {};
          data.forEach((row) => { map[row.section] = row.content; });
          setSiteContent(map);
        }
      });
  }, []);

  // Content extractions with robust fallback merging
  const heroContent = siteContent.hero || {};
  const aboutContent = siteContent.about || {};
  const whyUsPillars = siteContent.why_us?.pillars || DEFAULT_WHY_US;

  // Build full 6+ roadmaps list merging DB changes with defaults
  const dbRoadmaps = siteContent.roadmaps?.items;
  let roadmapItems = DEFAULT_ROADMAPS;
  if (Array.isArray(dbRoadmaps) && dbRoadmaps.length > 0) {
    roadmapItems = DEFAULT_ROADMAPS.map((def, idx) => {
      const dbItem = dbRoadmaps[idx];
      if (!dbItem) return def;
      return {
        ...def,
        ...dbItem,
        role: dbItem.role || def.role,
        skills: (dbItem.skills && dbItem.skills.length > 0) ? dbItem.skills : def.skills,
        tools: (dbItem.tools && dbItem.tools.length > 0) ? dbItem.tools : def.tools,
      };
    });
    if (dbRoadmaps.length > DEFAULT_ROADMAPS.length) {
      roadmapItems = roadmapItems.concat(dbRoadmaps.slice(DEFAULT_ROADMAPS.length));
    }
  }

  const displayTestimonials = testimonials.length > 0 ? testimonials : DEFAULT_TESTIMONIALS;
  const displayDevs = (siteContent.developers?.items && siteContent.developers.items.length > 0)
    ? siteContent.developers.items
    : DEFAULT_DEVS;

  const aboutStats = aboutContent.stats || [
    { value: "+70", label: "Étudiants / promo" },
    { value: "37 ans", label: "D'existence" },
    { value: "+500", label: "Alumni actifs" },
  ];

  // Animation variants
  const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
  };

  const cardHoverEffect = {
    y: -8,
    scale: 1.02,
    borderColor: "rgba(252, 163, 17, 0.4)",
    boxShadow: "0 10px 30px -10px rgba(252, 163, 17, 0.15), 0 0 25px 2px rgba(252, 163, 17, 0.05)",
  };

  const currentRoadmap = roadmapItems[activeRoadmapIdx] || DEFAULT_ROADMAPS[0];

  return (
    <div className="bg-black text-custom-gray overflow-x-hidden">
      
      {/* 1. HERO SECTION */}
      <section id="hero" className="relative min-h-[90vh] flex items-center justify-center pt-24 pb-20 px-6 overflow-hidden">
        <HeroBackgroundCarousel />

        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto text-center relative z-10 space-y-8"
        >
          {/* Badge */}
          <motion.div 
            variants={fadeInUp}
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-black/60 backdrop-blur-md border border-custom-amber/40 text-custom-amber text-xs font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(252,163,17,0.15)]"
          >
            <div className="w-5 h-5 rounded-full overflow-hidden border border-custom-amber/30 flex-shrink-0 bg-[#121414]">
              <img src={logoUrl} alt="CGI" className="w-full h-full object-contain p-0.5" />
            </div>
            <span>{heroContent.badge || "Club Génie Industriel • ENIT"}</span>
          </motion.div>

          {/* Main Title */}
          <motion.h1 
            variants={fadeInUp}
            className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-white tracking-tight leading-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]"
          >
            {heroContent.title || "PROFICIENCY IS OUR"} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-custom-amber via-yellow-500 to-amber-600 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              {heroContent.titleAccent || "CURRENCY"}
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            variants={fadeInUp}
            className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] font-medium"
          >
            {heroContent.subtitle || "Optimisez les flux, maîtrisez le Lean Six Sigma et pilotez l'industrie 4.0. Le point de rencontre des futurs ingénieurs experts en supply chain, production et innovation technologique de l'ENIT."}
          </motion.p>

          {/* Action Buttons */}
          <motion.div 
            variants={fadeInUp}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <motion.a
              href="#about"
              whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(252,163,17,0.3)" }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-custom-amber text-custom-black font-extrabold text-base tracking-wide hover:bg-custom-amber/90 transition-all duration-300 shadow-[0_0_20px_rgba(252,163,17,0.2)]"
            >
              <span>{heroContent.cta1 || "Découvrir le Club"}</span>
            </motion.a>
            <motion.a
              href="#roadmaps"
              whileHover={{ scale: 1.05, backgroundColor: "rgba(252,163,17,0.08)" }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-custom-amber text-custom-amber font-extrabold text-base tracking-wide transition-all duration-300"
            >
              <span>{heroContent.cta2 || "Roadmaps Industrielles"}</span>
              <ChevronRight className="w-5 h-5" />
            </motion.a>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce cursor-pointer z-10"
        >
          <span className="text-[10px] text-custom-gray/40 uppercase tracking-widest">Faire défiler</span>
          <div className="w-1.5 h-6 bg-custom-amber/30 rounded-full flex justify-center pt-1">
            <div className="w-1 h-2 bg-custom-amber rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* 2. WHY US SECTION */}
      <section className="py-20 max-w-7xl mx-auto px-6 lg:px-8 border-t border-custom-navy/20 relative z-10">
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {whyUsPillars.map((item: any, index: number) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              whileHover={cardHoverEffect}
              className="bg-custom-navy p-8 rounded-3xl border border-custom-gray/10 transition-all duration-300 group cursor-pointer"
            >
              <div className="w-14 h-14 rounded-2xl bg-black flex items-center justify-center mb-6 border border-custom-gray/10 group-hover:border-custom-amber/30 transition-colors">
                {renderDynamicIcon(item.icon, "w-8 h-8 text-custom-amber")}
              </div>
              <h3 className="text-custom-white font-extrabold text-xl mb-3 tracking-wide group-hover:text-custom-amber transition-colors">
                {item.title}
              </h3>
              <p className="text-custom-gray/70 text-sm leading-relaxed">
                {item.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* 3. ABOUT US & HISTORY SECTION */}
      <section id="about" className="py-24 bg-black border-t border-custom-navy/20 relative">
        <div className="absolute right-0 top-1/4 w-[350px] h-[350px] rounded-full bg-custom-navy/20 blur-[100px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            {/* Text Content */}
            <motion.div 
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-7 space-y-6"
            >
              <span className="text-xs font-bold uppercase tracking-wider text-custom-amber border-l-2 border-custom-amber pl-2">
                Qui sommes-nous ?
              </span>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-custom-white tracking-tight leading-tight">
                {aboutContent.title || "L'excellence du Génie Industriel à l'ENIT."}
              </h2>
              <p className="text-base sm:text-lg text-custom-gray/70 leading-relaxed">
                {aboutContent.description || "Fondée en 1882 pour sa structure historique d'ingénierie et reconnue dans toute l'Afrique, l'École Nationale d'Ingénieurs de Tunis (ENIT) abrite un département de Génie Industriel prestigieux. C'est dans ce terreau d'excellence que le Club Génie Industriel ENIT a vu le jour en 1989."}
              </p>
              
              {/* Metrics */}
              <div className="grid grid-cols-3 gap-6 pt-6">
                {aboutStats.map((metric: any, i: number) => (
                  <motion.div 
                    key={i}
                    whileHover={{ scale: 1.05, borderColor: "rgba(252, 163, 17, 0.3)" }}
                    className="p-4 rounded-2xl bg-custom-navy border border-custom-gray/5 transition-all duration-300"
                  >
                    <div className="text-2xl sm:text-3xl font-extrabold text-custom-amber">{metric.value}</div>
                    <div className="text-[10px] sm:text-xs text-custom-gray/40 uppercase tracking-wider mt-1">{metric.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Visual Box — ENIT Photo */}
            <motion.div 
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-5 relative"
            >
              <motion.div 
                whileHover={{ scale: 1.02, boxShadow: "0 20px 40px -10px rgba(252, 163, 17, 0.15)" }}
                transition={{ duration: 0.3 }}
                className="w-full aspect-square rounded-3xl border border-custom-gray/10 overflow-hidden relative group cursor-pointer"
              >
                <img
                  src="/enit-gate.jpg"
                  alt="École Nationale d'Ingénieurs de Tunis"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                <div className="absolute top-4 right-4">
                  <span className="text-[10px] font-mono text-custom-amber tracking-widest bg-black/70 backdrop-blur-sm border border-custom-amber/30 px-3 py-1.5 rounded-full">
                    EST. 1989
                  </span>
                </div>

                <div className="absolute top-4 left-4 w-12 h-12 rounded-xl overflow-hidden border border-custom-amber/30 shadow-[0_0_15px_rgba(252,163,17,0.2)]">
                  <img src={logoUrl} alt="CGI ENIT" className="w-full h-full object-cover" />
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-5 backdrop-blur-sm bg-black/50 border-t border-custom-amber/10">
                  <h3 className="text-base font-black text-custom-white leading-snug mb-2">École Nationale d'Ingénieurs de Tunis</h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-[10px] text-custom-gray/50 uppercase tracking-widest">
                    <span className="flex items-center gap-1.5"><span className="w-1 h-1 bg-custom-amber rounded-full inline-block" />Optimization</span>
                    <span className="flex items-center gap-1.5"><span className="w-1 h-1 bg-custom-amber rounded-full inline-block" />Lean Thinking</span>
                    <span className="flex items-center gap-1.5"><span className="w-1 h-1 bg-custom-amber rounded-full inline-block" />Supply Chain</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 4. CLUB ACTIVITIES SECTION */}
      <ClubActivitiesSection />

      {/* 5. INDUSTRIAL ROADMAPS SECTION (INTERACTIVE) */}
      <section id="roadmaps" className="py-24 bg-black border-t border-custom-navy/20 relative">
        <div className="absolute left-0 bottom-1/4 w-[350px] h-[350px] rounded-full bg-custom-navy/20 blur-[120px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-2xl mx-auto mb-16 space-y-4"
          >
            <span className="text-xs font-bold uppercase tracking-wider text-custom-amber border-l-2 border-custom-amber px-2">
              Parcours Professionnels
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-custom-white tracking-tight">
              Roadmaps Industrielles
            </h2>
            <p className="text-sm text-custom-gray/60 leading-relaxed">
              Explorez les grandes disciplines du Génie Industriel à travers nos feuilles de route interactives décrivant les concepts-clés et outils à maîtriser.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Selection Grid */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4"
            >
              {roadmapItems.map((rm: any, idx: number) => (
                <motion.button
                  key={idx}
                  whileHover={{ x: 6 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveRoadmapIdx(idx)}
                  className={`p-5 rounded-2xl flex items-center justify-between text-left border transition-all duration-300 cursor-pointer ${
                    activeRoadmapIdx === idx
                      ? "bg-custom-amber text-custom-black border-custom-amber font-extrabold shadow-[0_0_20px_rgba(252,163,17,0.15)]"
                      : "bg-custom-navy text-custom-gray border-custom-gray/10 hover:border-custom-amber/40 hover:bg-custom-navy/80"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                        activeRoadmapIdx === idx ? "bg-custom-black text-custom-amber" : "bg-black text-custom-gray"
                      }`}
                    >
                      {renderDynamicIcon(rm.icon, "w-6 h-6")}
                    </div>
                    <span className="text-sm font-semibold tracking-wide">{rm.title}</span>
                  </div>
                  <ChevronRight className="w-5 h-5 opacity-60" />
                </motion.button>
              ))}
            </motion.div>

            {/* Display Detailed Container */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-7"
            >
              <AnimatePresence mode="wait">
                {currentRoadmap && (
                  <motion.div
                    key={activeRoadmapIdx}
                    initial={{ opacity: 0, y: 15, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -15, scale: 0.98 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="bg-custom-navy p-8 sm:p-10 rounded-3xl border border-custom-gray/10 shadow-2xl relative overflow-hidden"
                  >
                    <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-custom-amber/5 blur-3xl pointer-events-none" />

                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 rounded-xl bg-black border border-custom-amber/20 flex items-center justify-center text-custom-amber">
                        {renderDynamicIcon(currentRoadmap.icon, "w-6 h-6")}
                      </div>
                      <div>
                        <h3 className="text-2xl font-extrabold text-custom-white leading-tight">
                          {currentRoadmap.title}
                        </h3>
                        {currentRoadmap.role && (
                          <p className="text-xs font-semibold text-custom-amber mt-1 font-mono uppercase tracking-wider">
                            Métier cible : {currentRoadmap.role}
                          </p>
                        )}
                      </div>
                    </div>

                    <p className="text-sm sm:text-base text-custom-gray/70 leading-relaxed mb-8">
                      {currentRoadmap.description}
                    </p>

                    {/* Concepts clés / Skills Grid */}
                    {((currentRoadmap.skills && currentRoadmap.skills.length > 0) || ((currentRoadmap as any).topics && (currentRoadmap as any).topics.length > 0)) && (
                      <div className="mb-8">
                        <h4 className="text-custom-white text-sm uppercase tracking-wider font-extrabold mb-4 border-b border-custom-gray/5 pb-2">
                          Concepts clés à maîtriser
                        </h4>
                        <ul className="space-y-3">
                          {(currentRoadmap.skills || (currentRoadmap as any).topics || []).map((skill: string, i: number) => (
                            <li key={i} className="flex items-center gap-3 text-sm text-custom-gray/80">
                              <span className="w-1.5 h-1.5 bg-custom-amber rounded-full flex-shrink-0" />
                              <span>{skill}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Tools & Tech Chips */}
                    {currentRoadmap.tools && currentRoadmap.tools.length > 0 && (
                      <div>
                        <h4 className="text-custom-white text-sm uppercase tracking-wider font-extrabold mb-4">
                          Outils & Systèmes clés
                        </h4>
                        <div className="flex flex-wrap gap-2.5">
                          {currentRoadmap.tools.map((tool: string, i: number) => (
                            <motion.span
                              key={i}
                              whileHover={{ scale: 1.08, borderColor: "rgba(252,163,17,0.4)" }}
                              className="text-xs font-mono font-semibold px-3.5 py-1.5 rounded-lg bg-black border border-custom-gray/10 text-custom-gray/80 transition-colors duration-300"
                            >
                              {tool}
                            </motion.span>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 6. TESTIMONIALS SECTION */}
      <section id="testimonials" className="py-24 bg-black border-t border-custom-navy/20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-2xl mx-auto mb-16 space-y-4"
          >
            <span className="text-xs font-bold uppercase tracking-wider text-custom-amber border-l-2 border-custom-amber px-2">
              Témoignages
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-custom-white tracking-tight">
              Ils parlent de nous
            </h2>
            <p className="text-sm text-custom-gray/60 leading-relaxed">
              Ce que disent nos enseignants, nos partenaires de l'industrie et nos anciens membres.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {displayTestimonials.map((test, index) => (
              <motion.div
                key={test.id || index}
                variants={fadeInUp}
                whileHover={cardHoverEffect}
                className="bg-custom-navy p-8 rounded-3xl border border-custom-gray/10 flex flex-col justify-between transition-all duration-300 cursor-pointer"
              >
                <div className="space-y-4">
                  <span className="text-6xl text-custom-amber/20 font-serif leading-none select-none">“</span>
                  <p className="text-sm text-custom-gray/70 leading-relaxed italic -mt-6">{test.quote}</p>
                </div>
                <div className="flex items-center gap-4 pt-8 border-t border-custom-gray/5 mt-6">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-black border border-custom-amber/20 flex items-center justify-center text-custom-amber font-extrabold text-sm flex-shrink-0">
                    {test.author_photo_url ? (
                      <img src={test.author_photo_url} alt={test.author_name} className="w-full h-full object-cover" />
                    ) : (
                      test.author_name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
                    )}
                  </div>
                  <div>
                    <h4 className="text-custom-white font-bold text-sm leading-tight">{test.author_name}</h4>
                    <p className="text-[10px] text-custom-gray/50 mt-0.5">{test.author_role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 7. DEVELOPERS SECTION (DYNAMIC FROM SITE_CONTENT) */}
      {displayDevs.length > 0 && (
        <section id="developers" className="py-24 bg-black border-t border-custom-navy/20">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5 }}
              className="text-center max-w-2xl mx-auto mb-16 space-y-4"
            >
              <span className="text-xs font-bold uppercase tracking-wider text-custom-amber border-l-2 border-custom-amber px-2">
                Équipe Digital & Tech
              </span>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-custom-white tracking-tight">
                Développeurs du site
              </h2>
              <p className="text-sm text-custom-gray/60 leading-relaxed">
                Les ingénieurs qui ont conçu et réalisé la plateforme numérique du Club Génie Industriel ENIT.
              </p>
            </motion.div>

            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              {displayDevs.map((dev: any, index: number) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  whileHover={cardHoverEffect}
                  className="bg-custom-navy p-8 rounded-3xl border border-custom-gray/10 flex flex-col items-center text-center transition-all duration-300 group"
                >
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-black border-2 border-custom-amber/30 mb-5 flex items-center justify-center text-custom-amber font-extrabold text-xl shadow-[0_0_20px_rgba(252,163,17,0.15)] group-hover:border-custom-amber transition-colors">
                    {dev.photo_url ? (
                      <img src={dev.photo_url} alt={dev.name} className="w-full h-full object-cover" />
                    ) : (
                      dev.name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "DEV"
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-custom-white group-hover:text-custom-amber transition-colors">
                    {dev.name}
                  </h3>
                  <p className="text-xs font-mono text-custom-amber/80 mt-1 uppercase tracking-wider">
                    {dev.role}
                  </p>

                  <div className="flex items-center gap-3 mt-6">
                    {dev.linkedin && (
                      <a href={dev.linkedin} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-xl bg-black text-custom-gray hover:text-custom-amber border border-custom-gray/10 transition-colors">
                        <Linkedin className="w-4 h-4" />
                      </a>
                    )}
                    {dev.github && (
                      <a href={dev.github} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-xl bg-black text-custom-gray hover:text-custom-amber border border-custom-gray/10 transition-colors">
                        <Github className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

    </div>
  );
}
