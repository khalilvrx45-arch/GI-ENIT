"use client";

import React from "react";
import { ADMIN_NAV_ITEMS } from "./Sidebar";
import { LogOut } from "lucide-react";

interface BottomNavProps {
  activeItem: string;
  onSelectTab: (id: string) => void;
  onSignOut: () => void;
}

export default function BottomNav({ activeItem, onSelectTab, onSignOut }: BottomNavProps) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#1a1c1c] border-t border-[#2a2c2c] z-40 px-2 py-2 flex items-center justify-around backdrop-blur-xl">
      {ADMIN_NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = activeItem === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onSelectTab(item.id)}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-medium transition-colors ${
              isActive ? "text-custom-amber" : "text-[#777] hover:text-white"
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? "text-custom-amber" : "text-[#777]"}`} />
            <span className="truncate max-w-[50px]">{item.label}</span>
          </button>
        );
      })}
      <button
        onClick={onSignOut}
        className="flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-medium text-red-400"
      >
        <LogOut className="w-5 h-5 text-red-400" />
        <span>Sortir</span>
      </button>
    </nav>
  );
}
