import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Club Génie Industriel ENIT - Live Your Best Experiences",
  description: "Plateforme officielle du Club Génie Industriel de l'École Nationale d'Ingénieurs de Tunis (ENIT). Supply Chain, Production, Amélioration Continue et Industrie 4.0.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="scroll-smooth">
      <body className="bg-black text-custom-gray min-h-screen flex flex-col antialiased">
        <Navbar />
        <main className="flex-grow pt-[76px]">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
