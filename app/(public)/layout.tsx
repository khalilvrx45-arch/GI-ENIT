import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SiteSettingsProvider } from "@/components/providers/SiteSettingsProvider";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SiteSettingsProvider>
      <Navbar />
      <main className="flex-grow pt-[76px]">
        {children}
      </main>
      <Footer />
    </SiteSettingsProvider>
  );
}
