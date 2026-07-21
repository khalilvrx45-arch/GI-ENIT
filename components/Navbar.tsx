"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowRight } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Accueil", href: "#hero" },
    { name: "À Propos & Historique", href: "#about" },
    { name: "Activités", href: "#activities" },
    { name: "Roadmaps", href: "#roadmaps" },
    { name: "Témoignages", href: "#testimonials" },
    { name: "Développeurs", href: "#developers" },
  ];

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b ${
        scrolled
          ? "bg-black/90 backdrop-blur-lg border-custom-navy/60 py-3 shadow-[0_4px_30px_rgba(20,33,61,0.1)]"
          : "bg-transparent border-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative flex items-center justify-center w-10 h-10 rounded-xl overflow-hidden bg-black border border-custom-amber/20 group-hover:border-custom-amber transition-colors duration-300 shadow-[0_0_15px_rgba(252,163,17,0.05)] group-hover:shadow-[0_0_20px_rgba(252,163,17,0.15)]"
            >
              <img src="/logo-cgi.jpg" alt="CGI ENIT Logo" className="w-full h-full object-cover" />
            </motion.div>
            <div className="flex flex-col">
              <span className="text-custom-white font-extrabold text-sm tracking-wide leading-none group-hover:text-custom-amber transition-colors duration-300">
                CGI ENIT
              </span>
              <span className="text-[10px] text-custom-gray/50 uppercase tracking-widest mt-0.5">
                Génie Industriel
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link, index) => (
              <motion.div
                key={link.name}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 + 0.2 }}
              >
                <a
                  href={link.href}
                  className="relative text-custom-gray/70 hover:text-custom-white text-xs font-semibold uppercase tracking-wider transition-colors duration-300 group py-1"
                >
                  {link.name}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-custom-amber transition-all duration-300 group-hover:w-full" />
                </a>
              </motion.div>
            ))}
          </div>

          {/* Desktop CTA Button */}
          <motion.div 
            className="hidden md:flex items-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            <Link
              href="/login"
              className="group relative inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-custom-amber text-custom-black font-bold text-xs tracking-wider uppercase overflow-hidden transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] shadow-[0_0_20px_rgba(252,163,17,0.15)] hover:shadow-[0_0_25px_rgba(252,163,17,0.35)]"
            >
              <span className="relative z-10 flex items-center gap-2">
                <span>Connexion Portal</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </motion.div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsOpen(!isOpen)}
              className="text-custom-gray hover:text-custom-amber transition-colors p-2"
              aria-label="Toggle Menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden fixed inset-x-0 top-[65px] bg-black/95 backdrop-blur-xl border-b border-custom-navy/60 overflow-hidden z-45"
          >
            <div className="px-6 py-8 space-y-4 flex flex-col">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="text-custom-gray/80 hover:text-custom-amber text-sm font-semibold py-2 transition-colors uppercase tracking-wider border-b border-custom-navy/20"
                >
                  {link.name}
                </a>
              ))}
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-custom-amber text-custom-black font-bold text-sm tracking-wider uppercase hover:bg-custom-amber/90 transition-colors mt-4"
              >
                <span>Connexion Portal</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
