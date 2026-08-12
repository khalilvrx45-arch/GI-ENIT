"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SiteSettingsProvider } from "@/components/providers/SiteSettingsProvider";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  return (
    <SiteSettingsProvider>
      {!isAdminRoute && <Navbar />}
      <main className={`flex-grow ${!isAdminRoute ? "pt-[76px]" : ""}`}>
        {children}
      </main>
      {!isAdminRoute && <Footer />}
    </SiteSettingsProvider>
  );
}
