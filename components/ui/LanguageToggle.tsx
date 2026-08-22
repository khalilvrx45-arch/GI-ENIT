"use client";

import React from "react";
import { useI18n } from "@/lib/i18n/context";
import { Languages } from "lucide-react";

export default function LanguageToggle({ className = "" }: { className?: string }) {
  const { locale, setLocale } = useI18n();

  const toggleLanguage = () => {
    setLocale(locale === "fr" ? "en" : "fr");
  };

  return (
    <button
      onClick={toggleLanguage}
      type="button"
      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-[#2a2c2c] bg-[#141515] text-xs font-semibold text-[#a0a0a0] hover:text-[#fca311] hover:border-[#fca311]/40 transition-all duration-200 cursor-pointer shadow-sm ${className}`}
      title={locale === "fr" ? "Switch to English" : "Passer en Français"}
      aria-label="Changer de langue"
    >
      <Languages className="w-3.5 h-3.5 text-[#fca311]" />
      <span className="uppercase tracking-wider font-mono text-[11px] font-bold text-white">
        {locale}
      </span>
    </button>
  );
}
