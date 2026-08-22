"use client";

import React, { useState, useEffect, useRef } from "react";
import { Bell, CheckCheck, ExternalLink, Sparkles, MessageSquare, ShieldCheck, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { Database } from "@/lib/supabase/database.types";
import { useI18n } from "@/lib/i18n/context";
import Link from "next/link";

type Notification = Database["public"]["Tables"]["notifications"]["Row"];

export default function NotificationBell({ userId }: { userId: string }) {
  const { t } = useI18n();
  const supabase = createClient();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20);

      if (!error && data) {
        setNotifications(data as Notification[]);
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userId) return;
    fetchNotifications();

    // Setup Supabase Realtime subscription
    const channel = supabase
      .channel(`user-notifications-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = async () => {
    try {
      await supabase
        .from("notifications")
        .update({ read: true })
        .eq("user_id", userId)
        .eq("read", false);

      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error("Error marking all as read:", err);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await supabase.from("notifications").update({ read: true }).eq("id", id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "points":
        return <Sparkles className="w-4 h-4 text-custom-amber" />;
      case "système":
        return <ShieldCheck className="w-4 h-4 text-emerald-400" />;
      default:
        return <MessageSquare className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#2a2c2c] bg-[#141515] text-[#888] transition-all duration-200 hover:border-[#fca311]/40 hover:text-[#fca311] cursor-pointer"
        aria-label="Notifications"
        title={t("notifications.title", "Notifications")}
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-custom-amber px-1 text-[10px] font-extrabold text-black shadow-[0_0_8px_rgba(252,163,17,0.8)]">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-[#2a2c2c] bg-[#141515] shadow-2xl backdrop-blur-xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#2a2c2c] px-4 py-3 bg-[#1a1c1c]/80">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white">
                  {t("notifications.title", "Notifications")}
                </span>
                {unreadCount > 0 && (
                  <span className="rounded-md bg-custom-amber/15 px-1.5 py-0.5 text-[10px] font-bold text-custom-amber border border-custom-amber/30">
                    {unreadCount}
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="flex items-center gap-1 text-[11px] font-semibold text-[#888] hover:text-custom-amber transition-colors cursor-pointer"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>{t("notifications.mark_all_read", "Tout marquer lu")}</span>
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-[380px] overflow-y-auto divide-y divide-[#2a2c2c]/40">
              {loading ? (
                <div className="py-8 text-center text-xs text-[#666]">
                  {t("common.loading", "Chargement...")}
                </div>
              ) : notifications.length === 0 ? (
                <div className="py-10 text-center px-4">
                  <Bell className="w-8 h-8 mx-auto text-[#444] mb-2 stroke-[1.5]" />
                  <p className="text-xs text-[#888]">
                    {t("notifications.no_notifications", "Aucune notification pour le moment.")}
                  </p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => !notif.read && markAsRead(notif.id)}
                    className={`flex items-start gap-3 p-3.5 transition-colors ${
                      !notif.read
                        ? "bg-custom-amber/[0.03] hover:bg-custom-amber/[0.07]"
                        : "hover:bg-white/[0.02]"
                    }`}
                  >
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#1e2020] border border-[#2a2c2c]">
                      {getIcon(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-bold text-white truncate">
                          {notif.title}
                        </p>
                        {!notif.read && (
                          <span className="h-2 w-2 rounded-full bg-custom-amber shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-[#aaa] mt-0.5 leading-relaxed break-words">
                        {notif.message}
                      </p>
                      <div className="flex items-center justify-between mt-2 pt-1">
                        <span className="text-[10px] text-[#666] font-mono">
                          {new Date(notif.created_at).toLocaleDateString("fr-FR", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {notif.link && (
                          <Link
                            href={notif.link}
                            onClick={() => {
                              markAsRead(notif.id);
                              setIsOpen(false);
                            }}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-custom-amber hover:underline"
                          >
                            <span>Voir</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
