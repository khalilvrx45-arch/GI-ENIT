"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface SiteSettingsContextType {
  logoUrl: string;
  setLogoUrl: (url: string) => void;
}

const SiteSettingsContext = createContext<SiteSettingsContextType>({
  logoUrl: "/logo-cgi.jpg",
  setLogoUrl: () => {},
});

export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}

export function SiteSettingsProvider({ children }: { children: React.ReactNode }) {
  const [logoUrl, setLogoUrl] = useState("/logo-cgi.jpg");

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch(`/api/admin/settings/logo?t=${Date.now()}`, {
          cache: "no-store",
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.logoUrl) {
            setLogoUrl(data.logoUrl);
          }
        }
      } catch (err) {
        // Silent fallback to default logo
      }
    }
    loadSettings();
  }, []);

  return (
    <SiteSettingsContext.Provider value={{ logoUrl, setLogoUrl }}>
      {children}
    </SiteSettingsContext.Provider>
  );
}
