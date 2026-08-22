"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import fr from "./dictionaries/fr.json";
import en from "./dictionaries/en.json";

export type Locale = "fr" | "en";

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (path: string, fallback?: string) => string;
}

const dictionaries: Record<Locale, any> = { fr, en };

const I18nContext = createContext<I18nContextType>({
  locale: "fr",
  setLocale: () => {},
  t: (path) => path,
});

export function I18nProvider({
  children,
  initialLocale = "fr",
}: {
  children: React.ReactNode;
  initialLocale?: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  useEffect(() => {
    // Read from cookie or localStorage on mount
    const saved = localStorage.getItem("cgi_locale") as Locale | null;
    if (saved === "fr" || saved === "en") {
      setLocaleState(saved);
      document.cookie = `NEXT_LOCALE=${saved}; path=/; max-age=31536000; SameSite=Lax`;
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem("cgi_locale", newLocale);
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
  };

  const t = (path: string, fallback?: string): string => {
    const keys = path.split(".");
    let current = dictionaries[locale] || dictionaries.fr;

    for (const key of keys) {
      if (current && typeof current === "object" && key in current) {
        current = current[key];
      } else {
        // Fallback to French dictionary
        let fallbackVal = dictionaries.fr;
        for (const fKey of keys) {
          if (fallbackVal && typeof fallbackVal === "object" && fKey in fallbackVal) {
            fallbackVal = fallbackVal[fKey];
          } else {
            return fallback || path;
          }
        }
        return typeof fallbackVal === "string" ? fallbackVal : fallback || path;
      }
    }

    return typeof current === "string" ? current : fallback || path;
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
