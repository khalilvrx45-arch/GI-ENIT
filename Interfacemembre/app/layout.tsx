import type { Metadata } from "next";
import { Inter, Space_Grotesk, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const spaceGrostek = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk", display: "swap" });
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-ibm-plex-mono", display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "CGI ENIT | Club Génie Industriel",
    template: "%s | CGI ENIT",
  },
  description:
    "Le Club Génie Industriel de l'ENIT rassemble les étudiants autour de projets, formations et visites en entreprise.",
  openGraph: {
    title: "CGI ENIT | Club Génie Industriel",
    description:
      "Événements, formations, projets et visites industrielles du département Génie Industriel de l'ENIT.",
    locale: "fr_FR",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport = {
  themeColor: "#040A17",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${inter.variable} ${spaceGrostek.variable} ${plexMono.variable}`}>
      <body className="bg-bg text-text font-body antialiased">
        {children}
      </body>
    </html>
  );
}