import { NextResponse } from "next/server";
import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

export interface ActivityItem {
  id: string;
  title: string;
  description: string;
  content?: string;
  image_url?: string;
  photo_urls?: string[];
  category: "Workshop" | "Hackathon" | "Visite" | "Formation" | "Conférence" | "Autre";
  date: string;
  location?: string;
  status: "draft" | "published" | "archived";
  created_at: string;
  created_by?: string;
}

// Fallback initial sample activities if database table is empty
const DEFAULT_ACTIVITIES: ActivityItem[] = [
  {
    id: "sample-1",
    title: "Workshop Industrie 4.0 & IoT",
    description: "Atelier pratique d'initiation aux capteurs IoT et à la collecte de données en temps réel sur les lignes d'assemblage.",
    content: "Une journée d'immersion complète dédiée aux technologies de l'Industrie 4.0. Nos étudiants ont pu manipuler des microcontrôleurs ESP32, configurer des flux Node-RED et visualiser la performance globale des équipements (OEE) sur un tableau de bord dynamique en temps réel.",
    category: "Workshop",
    date: new Date(Date.now() - 3 * 86400000).toISOString(),
    location: "ENIT - Lab-Inno GI",
    status: "published",
    created_at: new Date().toISOString(),
    image_url: "",
    photo_urls: [],
  },
  {
    id: "sample-2",
    title: "Hackathon Supply Chain Challenge 2026",
    description: "24h de compétition intense pour optimiser le réseau de distribution logistique d'une multinationale agroalimentaire.",
    content: "Félicitations aux 15 équipes participantes ! Pendant 24 heures sans interruption, les membres du CGI ont modélisé des stratégies de routage de véhicules sous contraintes de fenêtres horaires et de décarbonation du transport.",
    category: "Hackathon",
    date: new Date(Date.now() - 10 * 86400000).toISOString(),
    location: "Amphithéâtre Ibn Khaldoun, ENIT",
    status: "published",
    created_at: new Date().toISOString(),
    image_url: "",
    photo_urls: [],
  },
  {
    id: "sample-3",
    title: "Visite d'Usine Immersive - Automotive Plant",
    description: "Découverte sur le terrain des chaînes de montage automatisées et du système de production KANBAN en flux tendus.",
    content: "Visite guidée exclusive pour nos étudiants au cœur d'un site de production aéronautique et automobile de pointe.",
    category: "Visite",
    date: new Date(Date.now() - 18 * 86400000).toISOString(),
    location: "Zone Industrielle Ben Arous",
    status: "published",
    created_at: new Date().toISOString(),
    image_url: "",
    photo_urls: [],
  },
  {
    id: "sample-4",
    title: "Certification Lean Six Sigma Green Belt",
    description: "Lancement de la session intensive de formation et préparation à l'examen de certification internationale Green Belt.",
    content: "Formation certifiante animée par un Master Black Belt chevronné. Module couvrant la méthodologie DMAIC.",
    category: "Formation",
    date: new Date(Date.now() - 25 * 86400000).toISOString(),
    location: "Salle de Conférence GI",
    status: "published",
    created_at: new Date().toISOString(),
    image_url: "",
    photo_urls: [],
  },
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : null;
    const page = searchParams.get("page") ? parseInt(searchParams.get("page")!) : 1;
    const perPage = searchParams.get("per_page") ? parseInt(searchParams.get("per_page")!) : null;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    let activities: ActivityItem[] = [];
    let total = 0;

    if (supabaseUrl) {
      const client = serviceRoleKey
        ? createClient(supabaseUrl, serviceRoleKey)
        : await createServerSupabase();

      let query = client
        .from("activities")
        .select("*", { count: "exact" })
        .eq("status", "published")
        .order("date", { ascending: false });

      if (category && category !== "All" && category !== "Toutes") {
        query = query.eq("category", category);
      }

      if (limit) {
        query = query.limit(limit);
      } else if (perPage) {
        const from = (page - 1) * perPage;
        query = query.range(from, from + perPage - 1);
      }

      const { data, error, count } = await query;

      if (!error && data && data.length > 0) {
        activities = data;
        total = count ?? data.length;
      }
    }

    // Fallback to sample activities if database has no items
    if (activities.length === 0) {
      let filtered = DEFAULT_ACTIVITIES;
      if (category && category !== "All" && category !== "Toutes") {
        filtered = filtered.filter((a) => a.category === category);
      }
      if (limit) {
        filtered = filtered.slice(0, limit);
      } else if (perPage) {
        const from = (page - 1) * perPage;
        filtered = filtered.slice(from, from + perPage);
      }
      activities = filtered;
      total = DEFAULT_ACTIVITIES.length;
    }

    return NextResponse.json({ activities, total });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Erreur lors de la récupération des activités." },
      { status: 500 }
    );
  }
}
