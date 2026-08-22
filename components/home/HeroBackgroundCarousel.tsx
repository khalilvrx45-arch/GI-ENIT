"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

// Default fallback images if database is empty
const DEFAULT_HERO_IMAGES = [
  "/enit-gate.jpg",
  "/logo-cgi.jpg",
];

export default function HeroBackgroundCarousel() {
  const [images, setImages] = useState<string[]>(DEFAULT_HERO_IMAGES);
  const [currentIndex, setCurrentIndex] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    async function loadHeroImages() {
      try {
        const { data, error } = await supabase
          .from("hero_images")
          .select("image_url")
          .order("display_order", { ascending: true })
          .order("created_at", { ascending: false });

        if (!error && data && data.length > 0) {
          setImages(data.map((img) => img.image_url));
        }
      } catch (err) {
        // Fallback to defaults
      }
    }
    loadHeroImages();
  }, [supabase]);

  // Autoplay crossfade cycle every 5 seconds
  useEffect(() => {
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {/* Animated Image Slides with Framer Motion Crossfade */}
      <AnimatePresence mode="popLayout">
        <motion.div
          key={images[currentIndex % images.length]}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 0.85, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <img
            src={images[currentIndex % images.length]}
            alt="Hero Background"
            className="w-full h-full object-cover object-center"
          />
        </motion.div>
      </AnimatePresence>

      {/* Dark Overlay & Radial Gradients for Contrast & Legibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/30 to-black/95 z-10 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(20,33,61,0.3)_0%,rgba(0,0,0,0.6)_100%)] z-10 mix-blend-multiply pointer-events-none" />

      {/* Slide Navigation Dots */}
      {images.length > 1 && (
        <div className="absolute bottom-6 right-8 z-20 flex items-center gap-2 pointer-events-auto">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                idx === currentIndex % images.length
                  ? "w-6 bg-custom-amber shadow-[0_0_10px_rgba(252,163,17,0.5)]"
                  : "w-1.5 bg-white/30 hover:bg-white/60"
              }`}
              aria-label={`Aller à l'image ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
