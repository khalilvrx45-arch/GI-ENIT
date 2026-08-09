import type { Metadata } from "next";
import "./globals.css";
import { Inter, Space_Grotesk, IBM_Plex_Mono } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" });
const ibmPlexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-ibm-plex-mono" });

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
      <body className={`${inter.variable} ${spaceGrotesk.variable} ${ibmPlexMono.variable} min-h-screen flex flex-col antialiased`}>
        {children}
      </body>
    </html>
  );
}
