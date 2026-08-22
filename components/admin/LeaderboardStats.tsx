"use client";

import React, { useState, useEffect } from "react";
import {
  Trophy,
  Users,
  Award,
  TrendingUp,
  BarChart3,
  PieChart as PieIcon,
  ShieldCheck,
  Sparkles,
  Loader2,
  Calendar,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Cell,
  PieChart,
  Pie,
} from "recharts";

interface StatsData {
  kpis: {
    totalMembers: number;
    activeMembers: number;
    avgPoints: number;
    profileCompletionRate: number;
    statutBreakdown: {
      actif: number;
      senior: number;
      alumni: number;
      non_renseigne: number;
    };
  };
  top10: Array<{
    rank: number;
    id: string;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
    points_total: number;
  }>;
  pointsDistribution: Array<{
    range: string;
    count: number;
  }>;
  pointsTimeline: Array<{
    date: string;
    total: number;
  }>;
  poleStats: Array<{
    id: string;
    name: string;
    memberCount: number;
    totalPoints: number;
    avgPoints: number;
  }>;
}

const STATUT_COLORS = ["#3b82f6", "#fca311", "#a855f7", "#6b7280"];
const BAR_COLORS = ["#fca311", "#e5e5e5", "#3b82f6", "#10b981", "#8b5cf6"];

export default function LeaderboardStats({
  onShowToast,
}: {
  onShowToast: (type: "success" | "error" | "info", msg: string) => void;
}) {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/stats");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Erreur chargement des stats");
      setData(json);
    } catch (err: any) {
      onShowToast("error", err.message || "Erreur lors du chargement des statistiques.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <Loader2 className="w-8 h-8 text-custom-amber animate-spin mx-auto mb-3" />
        <p className="text-xs text-[#666]">Génération des statistiques et graphiques...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-[#141515] border border-[#2a2c2c] rounded-2xl p-8 text-center text-xs text-[#888]">
        Aucune donnée disponible.
      </div>
    );
  }

  const statutPieData = [
    { name: "Actif", value: data.kpis.statutBreakdown.actif },
    { name: "Senior", value: data.kpis.statutBreakdown.senior },
    { name: "Alumni", value: data.kpis.statutBreakdown.alumni },
    { name: "Non renseigné", value: data.kpis.statutBreakdown.non_renseigne },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="border-b border-[#2a2c2c] pb-5">
        <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
          <Trophy className="w-6 h-6 text-custom-amber" />
          <span>Statistiques & Graphes de Classement</span>
        </h2>
        <p className="text-xs text-[#888] mt-1">
          Analysez l&apos;engagement des membres, la distribution des points et les classements par pôle.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Membres */}
        <div className="bg-[#141515] border border-[#2a2c2c] rounded-2xl p-4 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-[#888] uppercase tracking-wider">Membres Actifs</p>
            <p className="text-xl font-extrabold text-white mt-0.5">
              {data.kpis.activeMembers} <span className="text-xs font-normal text-[#666]">/ {data.kpis.totalMembers}</span>
            </p>
          </div>
        </div>

        {/* Moyenne Points */}
        <div className="bg-[#141515] border border-[#2a2c2c] rounded-2xl p-4 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-custom-amber/10 border border-custom-amber/20 flex items-center justify-center text-custom-amber shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-[#888] uppercase tracking-wider">Moyenne Points</p>
            <p className="text-xl font-extrabold text-custom-amber mt-0.5">{data.kpis.avgPoints} pts</p>
          </div>
        </div>

        {/* Complétion Profil */}
        <div className="bg-[#141515] border border-[#2a2c2c] rounded-2xl p-4 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-[#888] uppercase tracking-wider">Profils Complétés</p>
            <p className="text-xl font-extrabold text-white mt-0.5">{data.kpis.profileCompletionRate}%</p>
          </div>
        </div>

        {/* Top Pôle */}
        <div className="bg-[#141515] border border-[#2a2c2c] rounded-2xl p-4 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-[#888] uppercase tracking-wider">Pôle Leader</p>
            <p className="text-sm font-bold text-purple-300 mt-0.5 truncate max-w-[140px]">
              {data.poleStats[0]?.name || "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Histogramme de distribution des points */}
        <div className="bg-[#141515] border border-[#2a2c2c] rounded-3xl p-5 sm:p-6 shadow-sm">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-custom-amber" />
            <span>Distribution des Points par Tranche</span>
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.pointsDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                <XAxis dataKey="range" stroke="#777" fontSize={11} />
                <YAxis stroke="#777" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1e2020", borderColor: "#333", borderRadius: 12, fontSize: 12 }}
                  labelStyle={{ color: "#fff", fontWeight: "bold" }}
                />
                <Bar dataKey="count" fill="#fca311" radius={[8, 8, 0, 0]}>
                  {data.pointsDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Évolution temporelle des points */}
        <div className="bg-[#141515] border border-[#2a2c2c] rounded-3xl p-5 sm:p-6 shadow-sm">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>Évolution des Points Attribués (30 jours)</span>
          </h3>
          <div className="h-64 w-full">
            {data.pointsTimeline.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-[#666]">
                Aucun mouvement de points récent.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.pointsTimeline}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                  <XAxis dataKey="date" stroke="#777" fontSize={10} tickFormatter={(d) => d.slice(5)} />
                  <YAxis stroke="#777" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1e2020", borderColor: "#333", borderRadius: 12, fontSize: 12 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    dot={{ fill: "#10b981", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Second Row: Top 10 & Statuts Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top 10 Leaderboard Table (2 cols) */}
        <div className="lg:col-span-2 bg-[#141515] border border-[#2a2c2c] rounded-3xl p-5 sm:p-6">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
            <Trophy className="w-4 h-4 text-custom-amber" />
            <span>Top 10 Membres du Club</span>
          </h3>

          <div className="divide-y divide-[#2a2c2c]/50 overflow-x-auto">
            {data.top10.map((member) => (
              <div key={member.id} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-extrabold text-xs shrink-0 ${
                      member.rank === 1
                        ? "bg-custom-amber text-black shadow-[0_0_10px_rgba(252,163,17,0.4)]"
                        : member.rank === 2
                        ? "bg-gray-300 text-black"
                        : member.rank === 3
                        ? "bg-amber-700 text-white"
                        : "bg-[#1e2020] text-[#777]"
                    }`}
                  >
                    #{member.rank}
                  </div>
                  <div className="w-7 h-7 rounded-full bg-[#1e2020] border border-[#333] flex items-center justify-center overflow-hidden shrink-0 text-[10px] font-bold text-custom-amber">
                    {member.avatar_url ? (
                      <img src={member.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span>{member.first_name?.[0] || "M"}</span>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">
                      {member.first_name || "Membre"} {member.last_name || ""}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 font-mono font-bold text-xs text-custom-amber">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{member.points_total} pts</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Statuts Membres Répartition */}
        <div className="bg-[#141515] border border-[#2a2c2c] rounded-3xl p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
              <PieIcon className="w-4 h-4 text-purple-400" />
              <span>Répartition par Statut</span>
            </h3>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statutPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statutPieData.map((_, index) => (
                      <Cell key={`pie-cell-${index}`} fill={STATUT_COLORS[index % STATUT_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1e2020", borderColor: "#333", borderRadius: 12, fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-2 mt-4 pt-3 border-t border-[#2a2c2c]">
            {statutPieData.map((item, idx) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: STATUT_COLORS[idx % STATUT_COLORS.length] }}
                  />
                  <span className="text-[#aaa]">{item.name}</span>
                </div>
                <span className="font-bold text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
