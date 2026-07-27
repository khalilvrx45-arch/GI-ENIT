"use client";

import React from "react";
import { Mail, Users, FileText, MessageSquare, Settings, LogOut } from "lucide-react";

export interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  isComingSoon?: boolean;
}

export const ADMIN_NAV_ITEMS: NavItem[] = [
  { id: "invitations", label: "Invitations", icon: Mail },
  { id: "membres", label: "Membres", icon: Users },
  { id: "contenu", label: "Contenu", icon: FileText, isComingSoon: true },
  { id: "temoignages", label: "Témoignages", icon: MessageSquare, isComingSoon: true },
  { id: "parametres", label: "Paramètres", icon: Settings, isComingSoon: true },
];

interface SidebarProps {
  activeItem: string;
  onSelectTab: (id: string) => void;
  onSignOut: () => void;
}

export default function Sidebar({ activeItem, onSelectTab, onSignOut }: SidebarProps) {
  return (
    <aside className="hidden md:flex flex-col w-[240px] bg-[#1a1c1c] border-r border-[#2a2c2c] min-h-[calc(100vh-65px)] p-4 justify-between shrink-0">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-[#666]">
          Navigation Admin
        </div>
        {ADMIN_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all group cursor-pointer ${
                isActive
                  ? "bg-custom-amber/15 text-custom-amber font-semibold border border-custom-amber/30 shadow-[0_0_15px_rgba(252,163,17,0.1)]"
                  : "text-[#a0a0a0] hover:text-white hover:bg-white/5"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? "text-custom-amber" : "text-[#777] group-hover:text-white"}`} />
                <span>{item.label}</span>
              </div>
              {item.isComingSoon && (
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-[#888] font-normal">
                  Bientôt
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="pt-4 border-t border-[#2a2c2c]">
        <button
          onClick={onSignOut}
          className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-red-400" />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}
