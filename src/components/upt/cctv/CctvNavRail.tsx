"use client";

import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  LayoutGrid,
  Pause,
  Play,
  RefreshCw,
  Search,
  Wifi,
  WifiOff,
} from "lucide-react";
import { CctvFilterMode, CctvLayoutMode } from "./cctv.constants";

export interface CctvNavRailProps {
  stats: {
    total: number;
    online: number;
    offline: number;
  };
  statusFilter: CctvFilterMode;
  onStatusFilterChange: (mode: CctvFilterMode) => void;
  eventCount: number;
  isEventLogOpen: boolean;
  onToggleEventLog: () => void;
  isSearchOpen: boolean;
  hasSearchQuery: boolean;
  onToggleSearch: () => void;
  isAutoTour: boolean;
  onToggleAutoTour: () => void;
  isRefreshing: boolean;
  onRefreshFeeds: () => void;
  layoutMode: CctvLayoutMode;
  onCycleLayoutMode: () => void;
}

export function CctvNavRail({
  stats,
  statusFilter,
  onStatusFilterChange,
  eventCount,
  isEventLogOpen,
  onToggleEventLog,
  isSearchOpen,
  hasSearchQuery,
  onToggleSearch,
  isAutoTour,
  onToggleAutoTour,
  isRefreshing,
  onRefreshFeeds,
  layoutMode,
  onCycleLayoutMode,
}: CctvNavRailProps) {
  const filterItems = [
    {
      id: "ALL" as const,
      label: "Semua Kamera Dermaga",
      icon: LayoutGrid,
      count: stats.total,
    },
    {
      id: "ONLINE" as const,
      label: "Kamera Online",
      icon: Wifi,
      count: stats.online,
    },
    {
      id: "OFFLINE" as const,
      label: "Maintenance / No Signal",
      icon: WifiOff,
      count: stats.offline,
    },
  ] as const;

  const layoutLabel =
    layoutMode === "3x2" ? "3×2" : layoutMode === "2x2" ? "2×2" : "Spotlight 1+5";
  const layoutShort =
    layoutMode === "3x2" ? "3×2" : layoutMode === "2x2" ? "2×2" : "1+5";

  return (
    <nav
      aria-label="Navigasi CCTV Pelabuhan"
      className="fixed left-0 top-0 bottom-0 z-[1001] w-[54px] bg-[#061612]/95 backdrop-blur-xl border-r border-[#1E4D40] flex flex-col items-center py-3.5 justify-between"
    >
      <div className="flex flex-col items-center gap-3 w-full">
        <Link
          href="/upt/kapal"
          className="w-9 h-9 rounded-xl bg-[#143E33] hover:bg-[#1B4D3E] border border-[#235D4D] flex items-center justify-center text-[#D97706] hover:text-[#F59E0B] shadow-inner transition-colors"
          title="Kembali ke Operasional Kapal"
          aria-label="Kembali ke Operasional Kapal"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>

        <div className="w-6 h-px bg-[#1E4D40]" />

        <div className="flex flex-col items-center gap-2.5 w-full px-1.5">
          {filterItems.map((item) => {
            const Icon = item.icon;
            const active = statusFilter === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onStatusFilterChange(item.id)}
                title={item.label}
                className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer border ${
                  active
                    ? "bg-[#143E33] border-[#D97706] text-white shadow-lg"
                    : "bg-[#0B241E]/80 border-[#1E4D40] text-[#85A69B] hover:text-white hover:bg-[#143E33]"
                }`}
              >
                <Icon className="w-[18px] h-[18px]" />
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-sky-400 text-[#061612] text-[9px] font-mono font-black flex items-center justify-center shadow-sm">
                  {item.count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="w-6 h-px bg-[#1E4D40]" />

        <button
          type="button"
          onClick={onToggleEventLog}
          title="Log Kejadian & Deteksi CCTV"
          className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer border ${
            isEventLogOpen
              ? "bg-[#143E33] border-[#D97706] text-white shadow-lg"
              : "bg-[#0B241E]/80 border-[#1E4D40] text-[#85A69B] hover:text-white hover:bg-[#143E33]"
          }`}
        >
          <Activity className="w-[18px] h-[18px]" />
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-[#D97706] text-white text-[9px] font-mono font-black flex items-center justify-center shadow-sm">
            {eventCount}
          </span>
        </button>

        <button
          type="button"
          onClick={onToggleSearch}
          title="Cari kamera, dermaga, atau kapal"
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer border ${
            isSearchOpen || hasSearchQuery
              ? "bg-[#143E33] border-[#D97706] text-white shadow-lg"
              : "bg-[#0B241E]/80 border-[#1E4D40] text-[#85A69B] hover:text-white hover:bg-[#143E33]"
          }`}
        >
          <Search className="w-[18px] h-[18px]" />
        </button>

        <button
          type="button"
          onClick={onToggleAutoTour}
          title={
            isAutoTour
              ? "Hentikan Auto-Tour (8 detik)"
              : "Putar Auto-Tour kamera (8 detik)"
          }
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer border ${
            isAutoTour
              ? "bg-emerald-950/90 border-emerald-500/60 text-emerald-300 shadow-lg"
              : "bg-[#0B241E]/80 border-[#1E4D40] text-emerald-400 hover:text-emerald-300 hover:bg-[#143E33]"
          }`}
        >
          {isAutoTour ? (
            <Pause className="w-[18px] h-[18px]" />
          ) : (
            <Play className="w-[18px] h-[18px]" />
          )}
        </button>

        <button
          type="button"
          onClick={onRefreshFeeds}
          disabled={isRefreshing}
          title="Ping NVR Simulasi"
          className="w-10 h-10 rounded-xl bg-[#0B241E]/80 hover:bg-[#143E33] border border-[#1E4D40] text-[#F59E0B] flex items-center justify-center cursor-pointer transition-colors disabled:opacity-60"
        >
          <RefreshCw
            className={`w-[18px] h-[18px] ${isRefreshing ? "animate-spin" : ""}`}
          />
        </button>
      </div>

      {/* Layout Switcher at bottom of rail */}
      <div className="flex flex-col items-center gap-1.5 w-full px-1.5">
        <button
          type="button"
          onClick={onCycleLayoutMode}
          title={`Ubah tata letak grid (saat ini ${layoutLabel})`}
          className="w-10 h-10 rounded-xl bg-[#0B241E] hover:bg-[#143E33] border border-[#1E4D40] text-[10px] font-mono font-black text-[#F59E0B] flex items-center justify-center cursor-pointer transition-colors"
        >
          {layoutShort}
        </button>
      </div>
    </nav>
  );
}
