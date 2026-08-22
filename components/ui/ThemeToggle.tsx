"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={`w-9 h-9 rounded-xl border border-[#2a2c2c] bg-[#141515] ${className}`}
      />
    );
  }

  const isDark = (resolvedTheme || theme) === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      type="button"
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#2a2c2c] bg-[#141515] text-[#888] transition-all duration-200 hover:border-[#fca311]/40 hover:text-[#fca311] cursor-pointer ${className}`}
      title={isDark ? "Passer en mode clair" : "Passer en mode sombre"}
      aria-label="Toggle Theme"
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-[#fca311] transition-transform duration-200 hover:rotate-45" />
      ) : (
        <Moon className="h-4 w-4 text-blue-400 transition-transform duration-200 hover:-rotate-12" />
      )}
    </button>
  );
}
