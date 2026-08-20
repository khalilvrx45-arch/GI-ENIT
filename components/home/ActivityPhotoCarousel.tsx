"use client";

import React, { useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, Image as ImageIcon } from "lucide-react";

interface ActivityPhotoCarouselProps {
  photos: string[];
  alt?: string;
  className?: string;
  /** @deprecated No longer used — images display at their natural aspect ratio */
  aspectRatio?: string;
}

export default function ActivityPhotoCarousel({
  photos,
  alt = "Photo activité",
  className = "",
  aspectRatio = "aspect-video",
}: ActivityPhotoCarouselProps) {
  const [current, setCurrent] = useState(0);

  const prev = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      setCurrent((c) => (c === 0 ? photos.length - 1 : c - 1));
    },
    [photos.length]
  );

  const next = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      setCurrent((c) => (c === photos.length - 1 ? 0 : c + 1));
    },
    [photos.length]
  );

  if (!photos || photos.length === 0) {
    return (
      <div
        className={`w-full rounded-2xl bg-gradient-to-br from-[#14213d] to-[#0c0d0d] border border-[#2a2c2c] flex items-center justify-center min-h-[200px] ${className}`}
      >
        <ImageIcon className="w-10 h-10 text-[#333]" />
      </div>
    );
  }

  return (
    <div className={`relative w-full rounded-2xl overflow-hidden bg-black group ${className}`}>
      {/* Natural-ratio image stack — only the current photo takes up space */}
      <div className="relative">
        {photos.map((url, idx) => (
          <img
            key={idx}
            src={url}
            alt={`${alt} ${idx + 1}`}
            className={`w-full max-h-[70vh] object-contain transition-opacity duration-500 ${
              idx === current ? "block opacity-100" : "hidden opacity-0"
            }`}
          />
        ))}
      </div>

      {/* Navigation arrows — always visible when multiple photos */}
      {photos.length > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Photo précédente"
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white hover:bg-black/80 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={next}
            aria-label="Photo suivante"
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white hover:bg-black/80 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Dot indicators */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5">
            {photos.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrent(idx);
                }}
                aria-label={`Aller à la photo ${idx + 1}`}
                className={`rounded-full transition-all duration-300 ${
                  idx === current
                    ? "w-4 h-1.5 bg-[#fca311]"
                    : "w-1.5 h-1.5 bg-white/40 hover:bg-white/70"
                }`}
              />
            ))}
          </div>

          {/* Counter badge */}
          <div className="absolute top-2 right-2 z-10 bg-black/60 backdrop-blur-sm border border-white/10 rounded-full px-2 py-0.5 text-[10px] font-mono text-white/70">
            {current + 1}/{photos.length}
          </div>
        </>
      )}
    </div>
  );
}
