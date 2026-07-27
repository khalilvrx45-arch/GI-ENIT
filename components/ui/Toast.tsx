"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export default function Toast({ toasts, onDismiss }: ToastProps) {
  useEffect(() => {
    toasts.forEach((toast) => {
      const timer = setTimeout(() => {
        onDismiss(toast.id);
      }, 4000);
      return () => clearTimeout(timer);
    });
  }, [toasts, onDismiss]);

  return (
    <div className="fixed bottom-20 md:bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className={`pointer-events-auto p-4 rounded-2xl border backdrop-blur-xl flex items-start gap-3 shadow-2xl ${
              toast.type === "success"
                ? "bg-[#141515]/95 border-custom-amber/40 text-custom-amber shadow-[0_0_20px_rgba(252,163,17,0.15)]"
                : toast.type === "error"
                ? "bg-[#141515]/95 border-red-500/40 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.15)]"
                : "bg-[#141515]/95 border-blue-500/40 text-blue-400"
            }`}
          >
            {toast.type === "success" && (
              <CheckCircle2 className="w-5 h-5 text-custom-amber shrink-0 mt-0.5" />
            )}
            {toast.type === "error" && (
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            )}
            {toast.type === "info" && (
              <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 text-sm text-[#e2e2e2] font-medium leading-snug">
              {toast.message}
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-[#888] hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
