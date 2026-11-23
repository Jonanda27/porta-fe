"use client";

import React, { useId } from "react";

export type PortaLoadingVariant = "fullscreen" | "overlay" | "inline";

export interface PortaLoadingScreenProps {
  /**
   * Mode tampilan loading screen:
   * - "fullscreen": Layar penuh solid deep maritime (untuk root loading / redirect awal)
   * - "overlay": Layar penuh frosted glass terbuka tanpa modal card (untuk jeda pindah halaman)
   * - "inline": Kontainer bersih di dalam area konten portal (sidebar & header tetap tampil)
   */
  variant?: PortaLoadingVariant;
  /** Judul status utama */
  title?: string;
  /** Keterangan tambahan di bawah judul */
  subtitle?: string;
  /** Tampilkan progress bar shimmer maritim */
  showProgress?: boolean;
  /** Kelas CSS tambahan untuk penyesuaian tinggi / margin pada mode inline */
  className?: string;
}

export function PortaLoadingScreen({
  variant = "fullscreen",
  title = "Memuat Halaman...",
  subtitle = "UPTD Pelabuhan Poumako • Kabupaten Mimika",
  showProgress = true,
  className = "",
}: PortaLoadingScreenProps) {
  const gradientId = useId();
  const isDarkSurface = variant === "fullscreen";

  const wrapperClass =
    variant === "fullscreen"
      ? "fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-br from-[#061612] via-[#0B241E] to-[#0F3129] text-white overflow-hidden p-6"
      : variant === "overlay"
      ? "fixed inset-0 z-[9998] flex flex-col items-center justify-center bg-[#F4F6F8]/85 backdrop-blur-md text-[#0B241E] overflow-hidden p-6 transition-opacity duration-200"
      : "w-full min-h-[58vh] flex flex-col items-center justify-center rounded-2xl bg-white border border-[#E2E8F0] shadow-xs relative overflow-hidden p-8 text-[#0B241E]";

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={`${wrapperClass} ${className}`}
    >
      {/* Subtle Nautical Coordinate Grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: isDarkSurface
            ? "linear-gradient(to right, rgba(133,166,155,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(133,166,155,0.06) 1px, transparent 1px)"
            : "linear-gradient(to right, rgba(11,36,30,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(11,36,30,0.04) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Soft Ambient Lighthouse Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute w-[400px] h-[400px] rounded-full blur-3xl"
        style={{
          background: isDarkSurface
            ? "radial-gradient(circle, rgba(217,119,6,0.16) 0%, rgba(16,185,129,0.09) 45%, transparent 72%)"
            : "radial-gradient(circle, rgba(217,119,6,0.12) 0%, rgba(11,36,30,0.06) 45%, transparent 72%)",
        }}
      />

      {/* Open Borderless Centerpiece */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-sm">
        {/* Maritime Compass & Sonar Emblem */}
        <div className="relative w-28 h-28 flex items-center justify-center mb-5">
          {/* Expanding Sonar Pulse Rings */}
          <span
            aria-hidden="true"
            className={`absolute inset-2 rounded-full border ${
              isDarkSurface ? "border-[#D97706]/45" : "border-[#D97706]/45"
            } animate-porta-sonar`}
          />
          <span
            aria-hidden="true"
            className={`absolute inset-2 rounded-full border ${
              isDarkSurface ? "border-emerald-400/30" : "border-[#0B241E]/20"
            } animate-porta-sonar-delayed`}
          />

          {/* Slowly Rotating Compass Degree Ring */}
          <svg
            aria-hidden="true"
            viewBox="0 0 120 120"
            className="absolute inset-0 w-full h-full animate-porta-spin-slow"
          >
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke={
                isDarkSurface
                  ? "rgba(133, 166, 155, 0.28)"
                  : "rgba(11, 36, 30, 0.16)"
              }
              strokeWidth="1.35"
              strokeDasharray="3 6"
            />
            <line
              x1="60"
              y1="2"
              x2="60"
              y2="9"
              stroke="#D97706"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            <line
              x1="118"
              y1="60"
              x2="111"
              y2="60"
              stroke="#D97706"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            <line
              x1="60"
              y1="118"
              x2="60"
              y2="111"
              stroke="#D97706"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            <line
              x1="2"
              y1="60"
              x2="9"
              y2="60"
              stroke="#D97706"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          </svg>

          {/* Smooth Radar Arc Sweep */}
          <svg
            aria-hidden="true"
            viewBox="0 0 120 120"
            className="absolute inset-1.5 w-[calc(100%-12px)] h-[calc(100%-12px)] animate-porta-radar-sweep"
          >
            <defs>
              <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#D97706" stopOpacity="0" />
                <stop offset="65%" stopColor="#D97706" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#F59E0B" stopOpacity="1" />
              </linearGradient>
            </defs>
            <circle
              cx="60"
              cy="60"
              r="46"
              fill="none"
              stroke={`url(#${gradientId})`}
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeDasharray="95 200"
            />
          </svg>

          {/* Inner Medallion with Official PORTA Anchor Logo */}
          <div
            className={`relative w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg animate-porta-float ${
              isDarkSurface
                ? "bg-[#11352C] border border-[#235B4C] shadow-black/40"
                : "bg-[#0B241E] border border-[#1E5748] shadow-[#0B241E]/25"
            }`}
          >
            <img
              src="/brand/symbol-white.svg"
              alt="Logo PORTA"
              className="w-9 h-9 object-contain"
            />
          </div>
        </div>

        {/* Brand Wordmark */}
        <span
          className={`text-xs font-mono font-extrabold tracking-[0.3em] uppercase mb-1 ${
            isDarkSurface ? "text-[#FBBF24]" : "text-[#D97706]"
          }`}
        >
          PORTA
        </span>

        {/* Dynamic Status Title */}
        <p
          className={`text-base font-extrabold tracking-tight leading-snug ${
            isDarkSurface ? "text-white" : "text-[#0B241E]"
          }`}
        >
          {title}
        </p>

        {/* Subtitle */}
        <p
          className={`text-xs mt-1 font-medium ${
            isDarkSurface ? "text-[#94B8AC]" : "text-[#475569]"
          }`}
        >
          {subtitle}
        </p>

        {/* Indeterminate Maritime Progress Bar */}
        {showProgress && (
          <div
            className={`w-52 h-1.5 rounded-full overflow-hidden mt-5 relative ${
              isDarkSurface ? "bg-white/15" : "bg-[#0B241E]/15"
            }`}
          >
            <div className="absolute inset-y-0 left-0 w-2/5 rounded-full bg-gradient-to-r from-[#0B241E] via-[#D97706] to-emerald-500 animate-porta-shimmer" />
          </div>
        )}
      </div>
    </div>
  );
}
