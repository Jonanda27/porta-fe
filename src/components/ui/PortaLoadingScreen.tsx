"use client";

import React from "react";

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
  className = "",
}: PortaLoadingScreenProps) {
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
      <span className="sr-only">{title}</span>

      {/* Animated Sailing Ship on Feathered Maritime Waves (no hard box edges) */}
      <div
        className="relative z-10 w-80 h-44 flex items-center justify-center overflow-hidden"
        style={{
          maskImage:
            "radial-gradient(ellipse 48% 46% at 50% 52%, rgba(0,0,0,1) 52%, rgba(0,0,0,0.65) 75%, rgba(0,0,0,0) 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 48% 46% at 50% 52%, rgba(0,0,0,1) 52%, rgba(0,0,0,0.65) 75%, rgba(0,0,0,0) 100%)",
        }}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 240 135"
          className="w-full h-full overflow-visible"
        >
          <defs>
            <linearGradient id="portaWaveBackGrad" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor={isDarkSurface ? "rgba(16, 185, 129, 0.22)" : "rgba(15, 118, 110, 0.14)"}
              />
              <stop offset="100%" stopColor="rgba(15, 118, 110, 0)" />
            </linearGradient>
            <linearGradient id="portaWaveFrontGrad" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor={isDarkSurface ? "rgba(13, 148, 136, 0.36)" : "rgba(15, 118, 110, 0.22)"}
              />
              <stop offset="100%" stopColor="rgba(15, 118, 110, 0)" />
            </linearGradient>
            <radialGradient id="portaSunGlow" cx="50%" cy="50%" r="50%">
              <stop
                offset="0%"
                stopColor={isDarkSurface ? "rgba(251, 191, 36, 0.38)" : "rgba(217, 119, 6, 0.28)"}
              />
              <stop
                offset="55%"
                stopColor={isDarkSurface ? "rgba(251, 191, 36, 0.12)" : "rgba(217, 119, 6, 0.1)"}
              />
              <stop offset="100%" stopColor="rgba(217, 119, 6, 0)" />
            </radialGradient>
          </defs>

          {/* Soft Feathered Sun Halo */}
          <circle cx="174" cy="40" r="24" fill="url(#portaSunGlow)" />
          <circle
            cx="174"
            cy="40"
            r="7.5"
            fill={isDarkSurface ? "rgba(251, 191, 36, 0.45)" : "rgba(217, 119, 6, 0.35)"}
          />

          {/* Back Wave Layer (fades smoothly downward) */}
          <g className="animate-porta-wave-slow">
            <path
              d="M-80 95 Q -60 88, -40 95 T 0 95 T 40 95 T 80 95 T 120 95 T 160 95 T 200 95 T 240 95 T 280 95 T 320 95 L 320 135 L -80 135 Z"
              fill="url(#portaWaveBackGrad)"
            />
          </g>

            {/* Sailing Ship Group */}
            <g className="animate-porta-ship-sail">
              {/* Funnel Smoke Puffs */}
              <circle
                cx="86"
                cy="34"
                r="4.5"
                className="animate-porta-smoke"
                fill={isDarkSurface ? "rgba(226, 232, 240, 0.45)" : "rgba(100, 116, 139, 0.35)"}
              />
              <circle
                cx="81"
                cy="29"
                r="6"
                className="animate-porta-smoke-delayed"
                fill={isDarkSurface ? "rgba(226, 232, 240, 0.35)" : "rgba(100, 116, 139, 0.28)"}
              />

              {/* Radar Mast */}
              <line
                x1="126"
                y1="26"
                x2="126"
                y2="46"
                stroke={isDarkSurface ? "#94B8AC" : "#0B241E"}
                strokeWidth="2.2"
                strokeLinecap="round"
              />
              <line
                x1="118"
                y1="32"
                x2="134"
                y2="32"
                stroke="#D97706"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle cx="126" cy="25" r="2.2" fill="#F59E0B" />

              {/* Funnel / Cerobong */}
              <path
                d="M84 40 L94 40 L97 56 L81 56 Z"
                fill={isDarkSurface ? "#1A4D3E" : "#0B241E"}
              />
              <rect x="83" y="42" width="12" height="4" rx="1" fill="#D97706" />

              {/* Upper Bridge / Anjungan */}
              <rect
                x="102"
                y="43"
                width="36"
                height="13"
                rx="3"
                fill={isDarkSurface ? "#E2E8F0" : "#FFFFFF"}
                stroke={isDarkSurface ? "#336B5B" : "#0B241E"}
                strokeWidth="1.5"
              />
              {/* Bridge Windows */}
              <rect x="108" y="47" width="6" height="4" rx="1" fill="#F59E0B" />
              <rect x="117" y="47" width="6" height="4" rx="1" fill="#F59E0B" />
              <rect x="126" y="47" width="6" height="4" rx="1" fill="#F59E0B" />

              {/* Main Deck Cabin */}
              <rect
                x="72"
                y="56"
                width="74"
                height="16"
                rx="3"
                fill={isDarkSurface ? "#F8FAFC" : "#F8FAFC"}
                stroke={isDarkSurface ? "#336B5B" : "#0B241E"}
                strokeWidth="1.5"
              />
              <circle cx="84" cy="64" r="2.2" fill="#0F766E" />
              <circle cx="95" cy="64" r="2.2" fill="#0F766E" />
              <circle cx="106" cy="64" r="2.2" fill="#0F766E" />
              <circle cx="117" cy="64" r="2.2" fill="#0F766E" />
              <circle cx="128" cy="64" r="2.2" fill="#0F766E" />

              {/* Cargo Containers on Bow */}
              <rect x="148" y="61" width="16" height="11" rx="1.5" fill="#D97706" />
              <rect x="166" y="63" width="14" height="9" rx="1.5" fill="#0F766E" />

              {/* Ship Hull / Lambung */}
              <path
                d="M50 72 L192 72 L177 95 C175 98, 171 99, 166 99 L66 99 C60 99, 55 96, 53 91 Z"
                fill={isDarkSurface ? "#11352C" : "#0B241E"}
                stroke={isDarkSurface ? "#34D399" : "#143E33"}
                strokeWidth="1.5"
              />
              {/* Waterline Stripe */}
              <path
                d="M55 88 L181 88 L178 93 L57 93 Z"
                fill="#D97706"
              />
            </g>

            {/* Front Flowing Wave Layer (soft gradient fade) */}
            <g className="animate-porta-wave">
              <path
                d="M-80 99 Q -60 91, -40 99 T 0 99 T 40 99 T 80 99 T 120 99 T 160 99 T 200 99 T 240 99 T 280 99 T 320 99 L 320 135 L -80 135 Z"
                fill="url(#portaWaveFrontGrad)"
              />
              <path
                d="M-80 104 Q -60 97, -40 104 T 0 104 T 40 104 T 80 104 T 120 104 T 160 104 T 200 104 T 240 104 T 280 104 T 320 104"
                fill="none"
                stroke={isDarkSurface ? "rgba(251, 191, 36, 0.5)" : "rgba(217, 119, 6, 0.45)"}
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <path
                d="M-80 113 Q -60 107, -40 113 T 0 113 T 40 113 T 80 113 T 120 113 T 160 113 T 200 113 T 240 113 T 280 113 T 320 113"
                fill="none"
                stroke={isDarkSurface ? "rgba(52, 211, 153, 0.28)" : "rgba(15, 118, 110, 0.22)"}
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </g>
          </svg>
      </div>
    </div>
  );
}
