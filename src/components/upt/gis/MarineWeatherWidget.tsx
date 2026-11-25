"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Eye,
  RefreshCw,
  Waves,
  Wind,
  X,
} from "lucide-react";
import { fetchPoumakoMarineWeather } from "@/services/marine-weather.service";
import { MarineSafetyLevel, PoumakoMarineWeather } from "@/types/gis.types";

const SAFETY_BADGE_MAP: Record<
  MarineSafetyLevel,
  { label: string; badgeClass: string; dotClass: string }
> = {
  AMAN: {
    label: "SANDAR AMAN",
    badgeClass: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    dotClass: "bg-emerald-400",
  },
  WASPADA: {
    label: "WASPADA CUACA",
    badgeClass: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    dotClass: "bg-amber-400",
  },
  SIAGA: {
    label: "SIAGA GELOMBANG",
    badgeClass: "bg-rose-500/25 text-rose-200 border-rose-500/50",
    dotClass: "bg-rose-500",
  },
};

interface MarineWeatherWidgetProps {
  variant?: "card" | "rail";
}

export function MarineWeatherWidget({ variant = "card" }: MarineWeatherWidgetProps) {
  const [weather, setWeather] = useState<PoumakoMarineWeather | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);

  const loadWeather = useCallback(async () => {
    setIsLoading(true);
    setHasError(false);
    try {
      const data = await fetchPoumakoMarineWeather();
      setWeather(data);
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWeather();
    const timer = setInterval(loadWeather, 5 * 60 * 1000);
    return () => clearInterval(timer);
  }, [loadWeather]);

  const safetyMeta = weather
    ? SAFETY_BADGE_MAP[weather.safetyLevel]
    : SAFETY_BADGE_MAP.AMAN;

  const waveSummary =
    weather?.waveHeightMeters !== null && weather?.waveHeightMeters !== undefined
      ? `${weather.waveHeightMeters.toFixed(1)} m`
      : "-- m";
  const windSummary =
    weather?.windSpeedKnots !== null && weather?.windSpeedKnots !== undefined
      ? `${Math.round(weather.windSpeedKnots)} kn`
      : "-- kn";

  const renderDetails = () => (
    <div className="px-3 pb-3 pt-2 border-t border-[#143E33] bg-[#061612]/60 space-y-2 text-[11px]">
      {hasError ? (
        <div className="flex items-center justify-between text-rose-300">
          <span>Gagal memuat Open-Meteo</span>
          <button
            type="button"
            onClick={loadWeather}
            className="underline font-bold cursor-pointer"
          >
            Coba lagi
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 rounded-lg bg-[#0B241E]/80 border border-[#143E33]">
              <p className="text-[10px] text-[#85A69B] flex items-center gap-1">
                <Waves className="w-3 h-3 text-sky-400" />
                Gelombang
              </p>
              <p className="font-mono font-bold text-white mt-0.5">
                {weather?.waveHeightMeters !== null &&
                weather?.waveHeightMeters !== undefined
                  ? `${weather.waveHeightMeters.toFixed(2)} m`
                  : "-"}
                {weather?.wavePeriodSeconds
                  ? ` (${weather.wavePeriodSeconds.toFixed(0)}s)`
                  : ""}
              </p>
            </div>

            <div className="p-2 rounded-lg bg-[#0B241E]/80 border border-[#143E33]">
              <p className="text-[10px] text-[#85A69B] flex items-center gap-1">
                <Wind className="w-3 h-3 text-[#F59E0B]" />
                Angin 10m
              </p>
              <p className="font-mono font-bold text-white mt-0.5">
                {weather?.windSpeedKnots !== null &&
                weather?.windSpeedKnots !== undefined
                  ? `${weather.windSpeedKnots.toFixed(1)} kn`
                  : "-"}
                {weather?.windDirectionDeg !== null &&
                weather?.windDirectionDeg !== undefined
                  ? ` (${Math.round(weather.windDirectionDeg)}°)`
                  : ""}
              </p>
            </div>

            <div className="p-2 rounded-lg bg-[#0B241E]/80 border border-[#143E33]">
              <p className="text-[10px] text-[#85A69B]">Arus Laut</p>
              <p className="font-mono font-bold text-white mt-0.5">
                {weather?.currentVelocityMs !== null &&
                weather?.currentVelocityMs !== undefined
                  ? `${weather.currentVelocityMs.toFixed(2)} m/s`
                  : "-"}
              </p>
            </div>

            <div className="p-2 rounded-lg bg-[#0B241E]/80 border border-[#143E33]">
              <p className="text-[10px] text-[#85A69B] flex items-center gap-1">
                <Eye className="w-3 h-3 text-emerald-400" />
                Jarak Pandang
              </p>
              <p className="font-mono font-bold text-white mt-0.5">
                {weather?.visibilityMeters !== null &&
                weather?.visibilityMeters !== undefined
                  ? `${(weather.visibilityMeters / 1000).toFixed(1)} km`
                  : "-"}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-[#85A69B] pt-0.5">
            <span>Sumber: Open-Meteo Marine</span>
            <button
              type="button"
              onClick={loadWeather}
              disabled={isLoading}
              className="inline-flex items-center gap-1 text-[#F59E0B] hover:underline font-semibold cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${isLoading ? "animate-spin" : ""}`} />
              <span>Segarkan</span>
            </button>
          </div>
        </>
      )}
    </div>
  );

  if (variant === "rail") {
    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className={`relative w-9 h-9 rounded-full border flex items-center justify-center transition-colors cursor-pointer ${
            isExpanded
              ? "bg-[#143E33] border-sky-400/60 text-sky-300"
              : "border-transparent text-sky-400 hover:text-sky-300 hover:bg-[#0B241E]"
          }`}
          title={`Cuaca Maritim Poumako: ${waveSummary} • ${windSummary} (${safetyMeta.label})`}
          aria-label="Cuaca Maritim Poumako"
        >
          <Waves className="w-4 h-4" />
          <span
            className={`absolute top-1 right-1 w-2 h-2 rounded-full ring-2 ring-[#061612] ${
              hasError ? "bg-rose-500" : safetyMeta.dotClass
            }`}
          />
        </button>

        {isExpanded && (
          <div className="absolute right-14 top-1/2 -translate-y-1/2 w-[268px] rounded-2xl bg-[#0B241E]/95 backdrop-blur-xl border border-[#1E4D40] shadow-2xl overflow-hidden text-white">
            <div className="px-3.5 py-2.5 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Waves className="w-4 h-4 text-sky-400 shrink-0" />
                <div className="leading-tight">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-white">
                    <span>{waveSummary}</span>
                    <span className="text-[#1E4D40]">•</span>
                    <span>{windSummary}</span>
                  </div>
                  <p className="text-[9.5px] font-mono text-[#A3BFB5] truncate">
                    Cuaca Maritim Poumako
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {!hasError && weather && (
                  <span
                    className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${safetyMeta.badgeClass}`}
                  >
                    {safetyMeta.label}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setIsExpanded(false)}
                  className="p-1 rounded-md hover:bg-[#143E33] text-[#A3BFB5] hover:text-white cursor-pointer"
                  title="Tutup"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            {renderDetails()}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="pointer-events-auto rounded-xl bg-[#0B241E]/95 backdrop-blur-xl border border-[#1E4D40] shadow-xl overflow-hidden text-white min-w-[235px]">
      {/* Compact Header Strip */}
      <div className="px-3 py-2 flex items-center justify-between gap-2.5">
        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="flex items-center gap-2 text-left cursor-pointer"
          title="Lihat rincian cuaca maritim Pelabuhan Poumako"
        >
          <Waves className="w-4 h-4 text-sky-400 shrink-0" />
          <div className="leading-tight">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-extrabold text-white">
                {waveSummary}
              </span>
              <span className="text-[#1E4D40]">•</span>
              <span className="text-[11px] font-bold text-[#E2E8F0]">
                {windSummary}
              </span>
            </div>
            <p className="text-[9.5px] font-mono text-[#A3BFB5]">
              Cuaca Maritim Poumako
            </p>
          </div>
        </button>

        <div className="flex items-center gap-1.5">
          {!hasError && weather && (
            <span
              className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${safetyMeta.badgeClass}`}
            >
              {safetyMeta.label}
            </span>
          )}
          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="p-1 rounded-md hover:bg-[#143E33] text-[#A3BFB5] hover:text-white cursor-pointer"
            aria-label="Toggle rincian cuaca maritim"
          >
            {isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronUp className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && renderDetails()}
    </div>
  );
}
