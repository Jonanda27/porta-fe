"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Activity,
  Anchor,
  ArrowLeft,
  Camera,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  LayoutGrid,
  MapPin,
  Maximize2,
  Moon,
  Pause,
  Play,
  Radio,
  RefreshCw,
  RotateCcw,
  Search,
  Ship,
  VideoOff,
  Wifi,
  WifiOff,
  Wrench,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { DUMMY_CCTV_CAMERAS, DUMMY_CCTV_EVENTS } from "@/lib/cctv-dummy-data";
import { toast } from "@/store/toast.store";
import { CctvCameraItem, CctvStatus } from "@/types/cctv.types";

type CctvFilterMode = "ALL" | "ONLINE" | "OFFLINE";
type CctvLayoutMode = "3x2" | "2x2" | "spotlight";

const STATUS_BADGE: Record<
  CctvStatus,
  { label: string; className: string; dotClass: string }
> = {
  ONLINE: {
    label: "ONLINE",
    className: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    dotClass: "bg-emerald-400",
  },
  DEGRADED: {
    label: "SINYAL LEMAH",
    className: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    dotClass: "bg-amber-400",
  },
  OFFLINE: {
    label: "OFFLINE",
    className: "bg-rose-500/20 text-rose-300 border-rose-500/40",
    dotClass: "bg-rose-500",
  },
};

export default function UptCctvPage() {
  const [cameras] = useState<CctvCameraItem[]>(DUMMY_CCTV_CAMERAS);
  const [statusFilter, setStatusFilter] = useState<CctvFilterMode>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [layoutMode, setLayoutMode] = useState<CctvLayoutMode>("3x2");
  const [spotlightCameraId, setSpotlightCameraId] = useState<string>(
    DUMMY_CCTV_CAMERAS[0]?.id ?? "cam-1"
  );
  const [focusedCamera, setFocusedCamera] = useState<CctvCameraItem | null>(null);
  const [isAutoTour, setIsAutoTour] = useState<boolean>(false);
  const [isEventLogOpen, setIsEventLogOpen] = useState<boolean>(false);
  const [clockText, setClockText] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Simulasi kontrol PTZ di modal focus
  const [ptzZoom, setPtzZoom] = useState<number>(1);
  const [ptzOffset, setPtzOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});
  const focusVideoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const updateClock = () => {
      setClockText(
        new Date().toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  const stats = useMemo(() => {
    const total = cameras.length;
    const online = cameras.filter((c) => c.status === "ONLINE").length;
    const offline = cameras.filter((c) => c.status !== "ONLINE").length;
    return { total, online, offline };
  }, [cameras]);

  const filteredCameras = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return cameras.filter((cam) => {
      if (statusFilter === "ONLINE" && cam.status !== "ONLINE") return false;
      if (statusFilter === "OFFLINE" && cam.status === "ONLINE") return false;
      if (!q) return true;
      return (
        cam.code.toLowerCase().includes(q) ||
        cam.name.toLowerCase().includes(q) ||
        cam.location.toLowerCase().includes(q) ||
        (cam.berthCode && cam.berthCode.toLowerCase().includes(q)) ||
        (cam.activeVessel && cam.activeVessel.toLowerCase().includes(q))
      );
    });
  }, [cameras, statusFilter, searchQuery]);

  const handleRefreshFeeds = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast.info("Simulasi Ping NVR selesai — 6 dari 6 kamera dermaga aktif (ONLINE).");
    }, 550);
  };

  const handleSnapshot = (cam: CctvCameraItem, fromFocusModal = false) => {
    if (cam.status === "OFFLINE") {
      toast.error(`${cam.code} sedang offline, snapshot tidak tersedia.`);
      return;
    }

    const videoEl = fromFocusModal
      ? focusVideoRef.current
      : videoRefs.current[cam.id];

    if (!videoEl || videoEl.readyState < 2 || videoEl.videoWidth === 0) {
      toast.info(`Frame ${cam.code} sedang dimuat, coba sesaat lagi.`);
      return;
    }

    try {
      const canvas = document.createElement("canvas");
      canvas.width = videoEl.videoWidth;
      canvas.height = videoEl.videoHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        toast.error("Gagal menginisialisasi kanvas snapshot.");
        return;
      }

      ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);

      // Watermark cap waktu & identitas kamera PORTA
      const nowStr = new Date().toLocaleString("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      const stamp = `PORTA CCTV • ${cam.code}${
        cam.berthCode ? ` • ${cam.berthCode}` : ""
      } • ${nowStr} WIT`;

      const barHeight = Math.max(36, Math.round(canvas.height * 0.055));
      ctx.fillStyle = "rgba(6, 22, 18, 0.82)";
      ctx.fillRect(0, canvas.height - barHeight, canvas.width, barHeight);
      ctx.fillStyle = "#F59E0B";
      ctx.font = `bold ${Math.max(14, Math.round(barHeight * 0.45))}px monospace`;
      ctx.textBaseline = "middle";
      ctx.fillText(stamp, 16, canvas.height - barHeight / 2);

      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `snapshot-${cam.code}-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Snapshot ${cam.code} berhasil diunduh (.png).`);
    } catch {
      toast.error(`Gagal mengambil snapshot dari ${cam.code}.`);
    }
  };

  const openFocusModal = (cam: CctvCameraItem) => {
    setPtzZoom(1);
    setPtzOffset({ x: 0, y: 0 });
    setFocusedCamera(cam);
  };

  const navigateFocusCamera = (direction: -1 | 1) => {
    if (!focusedCamera || filteredCameras.length <= 1) return;
    const currentIndex = filteredCameras.findIndex((c) => c.id === focusedCamera.id);
    const baseIndex = currentIndex === -1 ? 0 : currentIndex;
    const nextIndex =
      (baseIndex + direction + filteredCameras.length) % filteredCameras.length;
    openFocusModal(filteredCameras[nextIndex]);
  };

  useEffect(() => {
    if (!focusedCamera) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        navigateFocusCamera(-1);
      } else if (e.key === "ArrowRight") {
        navigateFocusCamera(1);
      } else if (e.key === "Escape") {
        setIsAutoTour(false);
        setFocusedCamera(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  // Auto-Tour: rotasi kamera otomatis setiap 8 detik saat mode Focus aktif
  useEffect(() => {
    if (!isAutoTour || !focusedCamera || filteredCameras.length <= 1) return;
    const timer = setInterval(() => {
      navigateFocusCamera(1);
    }, 8000);
    return () => clearInterval(timer);
  });

  const toggleAutoTour = () => {
    if (isAutoTour) {
      setIsAutoTour(false);
      toast.info("Auto-Tour CCTV dihentikan.");
      return;
    }
    if (filteredCameras.length === 0) return;
    if (!focusedCamera) {
      openFocusModal(filteredCameras[0]);
    }
    setIsAutoTour(true);
    toast.success("Auto-Tour CCTV aktif (rotasi setiap 8 detik).");
  };

  const cycleLayoutMode = () => {
    setLayoutMode((prev) =>
      prev === "3x2" ? "2x2" : prev === "2x2" ? "spotlight" : "3x2"
    );
  };

  return (
    <div className="fixed inset-0 h-screen w-screen overflow-hidden bg-[#040D0B] text-white select-none">
      {/* 1. OSIRIS-Style Slim Left Icon Rail */}
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
            {(
              [
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
              ] as const
            ).map((item) => {
              const Icon = item.icon;
              const active = statusFilter === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setStatusFilter(item.id)}
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
            onClick={() => {
              setIsSearchOpen(false);
              setIsEventLogOpen((prev) => !prev);
            }}
            title="Log Kejadian & Deteksi CCTV"
            className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer border ${
              isEventLogOpen
                ? "bg-[#143E33] border-[#D97706] text-white shadow-lg"
                : "bg-[#0B241E]/80 border-[#1E4D40] text-[#85A69B] hover:text-white hover:bg-[#143E33]"
            }`}
          >
            <Activity className="w-[18px] h-[18px]" />
            <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-[#D97706] text-white text-[9px] font-mono font-black flex items-center justify-center shadow-sm">
              {DUMMY_CCTV_EVENTS.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsEventLogOpen(false);
              setIsSearchOpen((prev) => !prev);
            }}
            title="Cari kamera, dermaga, atau kapal"
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer border ${
              isSearchOpen || searchQuery
                ? "bg-[#143E33] border-[#D97706] text-white shadow-lg"
                : "bg-[#0B241E]/80 border-[#1E4D40] text-[#85A69B] hover:text-white hover:bg-[#143E33]"
            }`}
          >
            <Search className="w-[18px] h-[18px]" />
          </button>

          <button
            type="button"
            onClick={toggleAutoTour}
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
            onClick={handleRefreshFeeds}
            disabled={isRefreshing}
            title="Ping NVR Simulasi"
            className="w-10 h-10 rounded-xl bg-[#0B241E]/80 hover:bg-[#143E33] border border-[#1E4D40] text-[#F59E0B] flex items-center justify-center cursor-pointer transition-colors disabled:opacity-60"
          >
            <RefreshCw className={`w-[18px] h-[18px] ${isRefreshing ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Layout Switcher at bottom of rail */}
        <div className="flex flex-col items-center gap-1.5 w-full px-1.5">
          <button
            type="button"
            onClick={cycleLayoutMode}
            title={`Ubah tata letak grid (saat ini ${
              layoutMode === "3x2"
                ? "3×2"
                : layoutMode === "2x2"
                  ? "2×2"
                  : "Spotlight 1+5"
            })`}
            className="w-10 h-10 rounded-xl bg-[#0B241E] hover:bg-[#143E33] border border-[#1E4D40] text-[10px] font-mono font-black text-[#F59E0B] flex items-center justify-center cursor-pointer transition-colors"
          >
            {layoutMode === "3x2" ? "3×2" : layoutMode === "2x2" ? "2×2" : "1+5"}
          </button>
        </div>
      </nav>

      {/* Floating Search Popover (from Left Rail) */}
      {isSearchOpen && (
        <div className="fixed left-[68px] top-[88px] z-[1000] w-72 rounded-2xl bg-[#0B241E]/95 backdrop-blur-xl border border-[#1E4D40] p-2.5 shadow-2xl">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#85A69B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setSearchQuery("");
                  setIsSearchOpen(false);
                }
              }}
              placeholder="Cari kamera, dermaga, kapal..."
              className="w-full h-9 pl-9 pr-8 rounded-xl bg-[#061612]/95 border border-[#D97706]/60 text-xs text-white placeholder:text-[#85A69B] focus:outline-none"
            />
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setIsSearchOpen(false);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#85A69B] hover:text-white cursor-pointer"
              title="Tutup pencarian"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 2. Floating Event Log Popover (OSIRIS-style) */}
      {isEventLogOpen && (
        <aside className="fixed left-[68px] top-[88px] z-[1000] w-[300px] max-h-[calc(100vh-120px)] flex flex-col rounded-2xl bg-[#0B241E]/95 backdrop-blur-xl border border-[#1E4D40] shadow-2xl overflow-hidden">
          <div className="px-3.5 py-2.5 border-b border-[#143E33] flex items-center justify-between shrink-0">
            <span className="text-xs font-extrabold tracking-wide text-white inline-flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>Log Deteksi &amp; Event</span>
            </span>
            <button
              type="button"
              onClick={() => setIsEventLogOpen(false)}
              className="p-1 rounded-lg hover:bg-[#143E33] text-[#A3BFB5] hover:text-white cursor-pointer"
              title="Tutup log"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="p-2.5 space-y-2 overflow-y-auto">
            {DUMMY_CCTV_EVENTS.map((evt) => {
              const severityBadge =
                evt.severity === "ALERT"
                  ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                  : evt.severity === "WARNING"
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                    : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
              return (
                <button
                  key={evt.id}
                  type="button"
                  onClick={() => {
                    const target = cameras.find((c) => c.id === evt.cameraId);
                    if (target) {
                      openFocusModal(target);
                      setIsEventLogOpen(false);
                    }
                  }}
                  className="w-full text-left p-2.5 rounded-xl bg-[#061612]/75 hover:bg-[#143E33]/80 border border-[#143E33] transition-colors cursor-pointer space-y-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`px-1.5 py-0.5 rounded border text-[9px] font-mono font-bold ${severityBadge}`}
                    >
                      {evt.cameraCode}
                    </span>
                    <span className="text-[9.5px] font-mono text-[#85A69B]">
                      {evt.timestamp}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-white">{evt.title}</p>
                  <p className="text-[10.5px] text-[#A3BFB5] leading-snug">
                    {evt.detail}
                  </p>
                </button>
              );
            })}
          </div>
        </aside>
      )}

      {/* 3. Main Full-Screen Surveillance Workspace */}
      <div className="pl-[54px] h-full w-full flex flex-col">
        {/* Top OSIRIS Header Row */}
        <header className="px-4 pt-3.5 pb-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* Top-Left PORTA Brand */}
          <div className="flex items-start gap-3">
            <img
              src="/brand/symbol-white.svg"
              alt="PORTA Logo"
              className="w-10 h-10 object-contain shrink-0 mt-0.5 drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]"
            />
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-[0.35em] text-[#F59E0B] uppercase leading-none">
                PORTA
              </span>
              <p className="text-[11px] font-mono font-medium tracking-[0.26em] text-[#D97706]/90 uppercase mt-1 leading-none">
                MARITIME CCTV SURVEILLANCE
              </p>
              <p className="text-[9px] font-mono tracking-[0.22em] text-[#E2E8F0]/50 uppercase mt-1.5 leading-none hidden sm:block">
                SIMULASI NVR • PELABUHAN UMUM POUMAKO • 6 DERMAGA
              </p>
            </div>
          </div>

          {/* Top-Right Minimalist Telemetry (Boxless) */}
          <div className="hidden sm:flex items-center gap-2 text-[10.5px] font-mono tracking-wider drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
            <span className="text-emerald-300 font-bold">{stats.online} ONLINE</span>
            <span className="text-[#1E4D40]">|</span>
            <span className="text-rose-300 font-bold">{stats.offline} GANGGUAN</span>
            <span className="text-[#1E4D40]">|</span>
            <span className="text-[#A3BFB5] tabular-nums">{clockText || "--:--:--"} WIT</span>
          </div>
        </header>

        {/* Full-Height Video Wall Grid */}
        <main className="flex-1 min-h-0 px-4 pb-3.5 overflow-y-auto xl:overflow-hidden">
          {filteredCameras.length === 0 ? (
            <div className="h-full rounded-2xl bg-[#0B241E]/60 border border-[#1E4D40] flex flex-col items-center justify-center text-center p-8">
              <VideoOff className="w-10 h-10 text-[#85A69B] mb-2" />
              <p className="text-sm font-bold text-white">
                Tidak ada kamera yang cocok dengan filter
              </p>
            </div>
          ) : layoutMode === "spotlight" ? (
            (() => {
              const mainCam =
                filteredCameras.find((c) => c.id === spotlightCameraId) ??
                filteredCameras[0];
              const stripCams = filteredCameras.filter((c) => c.id !== mainCam.id);
              const renderSpotlightCard = (cam: CctvCameraItem, compact: boolean) => {
                const statusStyle = STATUS_BADGE[cam.status];
                const isMaintenance = cam.offlineReason?.startsWith("SEDANG MAINTENANCE");
                return (
                  <div
                    key={cam.id}
                    onClick={compact ? () => setSpotlightCameraId(cam.id) : undefined}
                    className={`relative h-full rounded-2xl overflow-hidden bg-[#061612] border border-[#1E4D40] hover:border-[#D97706]/60 shadow-2xl transition-colors ${
                      compact ? "cursor-pointer min-h-[120px]" : "min-h-[260px]"
                    }`}
                  >
                    {cam.status !== "OFFLINE" && cam.videoSrc ? (
                      <video
                        ref={(el) => {
                          videoRefs.current[cam.id] = el;
                        }}
                        src={cam.videoSrc}
                        poster={cam.posterSrc}
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="w-full h-full object-cover opacity-95"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-[#040B09] p-3 text-center">
                        <div className="w-9 h-9 rounded-xl bg-rose-950/60 border border-rose-500/40 flex items-center justify-center text-rose-400 mb-1.5">
                          {isMaintenance ? (
                            <Wrench className="w-4 h-4" />
                          ) : (
                            <VideoOff className="w-4 h-4" />
                          )}
                        </div>
                        <p className="text-[10.5px] font-mono font-black text-rose-300">
                          {isMaintenance ? `MAINTENANCE` : `NO SIGNAL`}
                        </p>
                        {!compact && (
                          <>
                            <p className="text-[11px] text-[#A3BFB5] mt-1 max-w-xs">
                              {cam.offlineReason || "Koneksi NVR terputus"}
                            </p>
                            <Link
                              href="/upt/pemeliharaan"
                              className="mt-2.5 px-3 py-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 border border-rose-500/40 text-[10.5px] font-bold text-rose-200 inline-flex items-center gap-1.5"
                            >
                              <Wrench className="w-3 h-3" />
                              <span>Lapor Kerusakan</span>
                            </Link>
                          </>
                        )}
                      </div>
                    )}

                    <div className="absolute inset-x-0 top-0 p-2 bg-gradient-to-b from-black/85 via-black/35 to-transparent flex items-center justify-between gap-1.5">
                      <span
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md border text-[9.5px] font-mono font-bold ${statusStyle.className}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${statusStyle.dotClass} ${
                            cam.status === "ONLINE" ? "animate-pulse" : ""
                          }`}
                        />
                        {cam.code}
                      </span>
                      {cam.berthCode && !compact && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#0B241E]/85 border border-[#1E4D40] text-[10px] font-mono font-bold text-emerald-300">
                          <Anchor className="w-2.5 h-2.5" />
                          {cam.berthCode}
                        </span>
                      )}
                    </div>

                    <div className="absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-black/90 via-black/55 to-transparent flex items-end justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="text-[11px] font-extrabold text-white truncate">
                          {cam.name}
                        </h3>
                        {!compact && (
                          <div className="flex items-center gap-2 text-[10px] font-mono text-[#A3BFB5] mt-0.5">
                            <span>
                              {cam.resolution} • {cam.fps} FPS
                            </span>
                            {cam.activeVessel && (
                              <span className="text-amber-300 font-bold inline-flex items-center gap-1 truncate">
                                <Ship className="w-3 h-3 shrink-0" />
                                <span className="truncate">{cam.activeVessel}</span>
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {!compact && (
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Link
                            href="/upt/gis"
                            className="p-1.5 rounded-lg bg-black/70 hover:bg-[#143E33] border border-white/15 text-emerald-300 transition-colors"
                            title="Lihat Lokasi Dermaga di GIS"
                          >
                            <MapPin className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleSnapshot(cam)}
                            className="p-1.5 rounded-lg bg-black/70 hover:bg-[#143E33] border border-white/15 text-white cursor-pointer transition-colors"
                            title="Ambil & Unduh Snapshot PNG"
                          >
                            <Camera className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => openFocusModal(cam)}
                            className="p-1.5 rounded-lg bg-[#D97706] hover:bg-[#B45309] text-white cursor-pointer transition-colors"
                            title="Perbesar & Kontrol PTZ"
                          >
                            <Maximize2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              };

              return (
                <div className="h-full flex flex-col gap-3">
                  <div className="flex-1 min-h-0">{renderSpotlightCard(mainCam, false)}</div>
                  {stripCams.length > 0 && (
                    <div className="h-32 sm:h-36 shrink-0 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                      {stripCams.map((cam) => renderSpotlightCard(cam, true))}
                    </div>
                  )}
                </div>
              );
            })()
          ) : (
            <div
              className={`grid gap-3 h-full ${
                layoutMode === "2x2"
                  ? "grid-cols-1 md:grid-cols-2 auto-rows-[minmax(220px,1fr)]"
                  : "grid-cols-1 md:grid-cols-2 xl:grid-cols-3 xl:grid-rows-2 auto-rows-[minmax(210px,1fr)]"
              }`}
            >
              {filteredCameras.map((cam) => {
                const statusStyle = STATUS_BADGE[cam.status];
                const isMaintenance = cam.offlineReason?.startsWith("SEDANG MAINTENANCE");
                return (
                  <div
                    key={cam.id}
                    className="relative h-full min-h-[210px] rounded-2xl overflow-hidden bg-[#061612] border border-[#1E4D40] hover:border-[#D97706]/60 shadow-2xl transition-colors group"
                  >
                    {/* Video or Maintenance/No-Signal Canvas */}
                    {cam.status !== "OFFLINE" && cam.videoSrc ? (
                      <video
                        ref={(el) => {
                          videoRefs.current[cam.id] = el;
                        }}
                        src={cam.videoSrc}
                        poster={cam.posterSrc}
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="w-full h-full object-cover opacity-95"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-[#040B09] p-5 text-center relative">
                        <div className="w-12 h-12 rounded-2xl bg-rose-950/60 border border-rose-500/40 flex items-center justify-center text-rose-400 mb-3">
                          {isMaintenance ? (
                            <Wrench className="w-6 h-6" />
                          ) : (
                            <VideoOff className="w-6 h-6" />
                          )}
                        </div>
                        <p className="text-xs font-mono font-black tracking-wider text-rose-300">
                          {isMaintenance
                            ? `MAINTENANCE — ${cam.code}`
                            : `NO SIGNAL — ${cam.code}`}
                        </p>
                        <p className="text-[11px] text-[#A3BFB5] mt-1 max-w-xs">
                          {cam.offlineReason || "Koneksi NVR terputus"}
                        </p>
                        <Link
                          href="/upt/pemeliharaan"
                          className="mt-3 px-3 py-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 border border-rose-500/40 text-[10.5px] font-bold text-rose-200 inline-flex items-center gap-1.5 transition-colors"
                        >
                          <Wrench className="w-3 h-3" />
                          <span>Lapor Kerusakan</span>
                        </Link>
                      </div>
                    )}

                    {/* Top Surveillance HUD */}
                    <div className="absolute inset-x-0 top-0 p-2.5 bg-gradient-to-b from-black/85 via-black/35 to-transparent flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[10px] font-mono font-bold ${statusStyle.className}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${statusStyle.dotClass} ${
                              cam.status === "ONLINE" ? "animate-pulse" : ""
                            }`}
                          />
                          {cam.code}
                        </span>
                        {cam.berthCode && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#0B241E]/85 border border-[#1E4D40] text-[10px] font-mono font-bold text-emerald-300">
                            <Anchor className="w-2.5 h-2.5" />
                            {cam.berthCode}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {cam.ptzSupported && (
                          <span className="px-1.5 py-0.5 rounded bg-black/60 border border-white/15 text-[9px] font-mono text-amber-300">
                            PTZ
                          </span>
                        )}
                        {cam.nightVision && (
                          <span
                            className="p-1 rounded bg-black/60 border border-white/15 text-sky-300"
                            title="Night Vision / IR Aktif"
                          >
                            <Moon className="w-2.5 h-2.5" />
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Bottom HUD */}
                    <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/90 via-black/55 to-transparent flex items-end justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="text-xs font-extrabold text-white truncate">
                          {cam.name}
                        </h3>
                        <div className="flex items-center gap-2 text-[10px] font-mono text-[#A3BFB5] mt-0.5">
                          <span>
                            {cam.resolution} • {cam.fps} FPS
                          </span>
                          {cam.activeVessel && (
                            <span className="text-amber-300 font-bold inline-flex items-center gap-1 truncate">
                              <Ship className="w-3 h-3 shrink-0" />
                              <span className="truncate">{cam.activeVessel}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <Link
                          href="/upt/gis"
                          className="p-1.5 rounded-lg bg-black/70 hover:bg-[#143E33] border border-white/15 text-emerald-300 transition-colors"
                          title="Lihat Lokasi Dermaga di GIS"
                        >
                          <MapPin className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleSnapshot(cam)}
                          className="p-1.5 rounded-lg bg-black/70 hover:bg-[#143E33] border border-white/15 text-white cursor-pointer transition-colors"
                          title="Ambil & Unduh Snapshot PNG"
                        >
                          <Camera className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openFocusModal(cam)}
                          className="p-1.5 rounded-lg bg-[#D97706] hover:bg-[#B45309] text-white cursor-pointer transition-colors"
                          title="Perbesar & Kontrol PTZ"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* Modal Focus & Simulasi Kontrol PTZ */}
      {focusedCamera && (
        <div className="fixed inset-0 z-[1005] bg-black/85 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-5xl flex items-center justify-center gap-3 sm:gap-5">
            {filteredCameras.length > 1 && (
              <button
                type="button"
                onClick={() => navigateFocusCamera(-1)}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#0B241E]/95 hover:bg-[#143E33] border border-[#1E4D40] hover:border-[#D97706] text-white flex items-center justify-center shadow-2xl cursor-pointer transition-all shrink-0"
                title="Kamera Sebelumnya (←)"
                aria-label="Kamera Sebelumnya"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}

            <div className="w-full max-w-4xl rounded-2xl bg-[#0B241E] border border-[#1E4D40] shadow-2xl overflow-hidden text-white">
              <div className="px-4 py-3 border-b border-[#143E33] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <div>
                    <h2 className="text-sm font-black text-white">
                      {focusedCamera.code} — {focusedCamera.name}
                    </h2>
                    <p className="text-[11px] font-mono text-[#A3BFB5]">
                      {focusedCamera.ipAddress} • {focusedCamera.protocol}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAutoTour((prev) => !prev)}
                    className={`px-2.5 py-1 rounded-md border text-[10.5px] font-mono font-bold inline-flex items-center gap-1.5 cursor-pointer transition-colors ${
                      isAutoTour
                        ? "bg-emerald-950/90 border-emerald-500/50 text-emerald-300"
                        : "bg-[#061612] border-[#1E4D40] text-[#A3BFB5] hover:text-white"
                    }`}
                    title="Putar rotasi otomatis kamera setiap 8 detik"
                  >
                    {isAutoTour ? (
                      <Pause className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Play className="w-3 h-3 text-emerald-400" />
                    )}
                    <span>{isAutoTour ? "Tour 8s ON" : "Auto-Tour"}</span>
                  </button>
                  {filteredCameras.length > 1 && (
                    <span className="px-2 py-0.5 rounded-md bg-[#061612] border border-[#1E4D40] text-[10.5px] font-mono text-[#A3BFB5]">
                      {Math.max(
                        filteredCameras.findIndex((c) => c.id === focusedCamera.id) + 1,
                        1
                      )}{" "}
                      / {filteredCameras.length}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setIsAutoTour(false);
                      setFocusedCamera(null);
                    }}
                    className="p-1.5 rounded-lg hover:bg-[#143E33] text-[#A3BFB5] hover:text-white cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="relative aspect-video bg-black overflow-hidden">
                {focusedCamera.status !== "OFFLINE" && focusedCamera.videoSrc ? (
                  <video
                    ref={focusVideoRef}
                    src={focusedCamera.videoSrc}
                    autoPlay
                    muted
                    loop
                    playsInline
                    style={{
                      transform: `scale(${ptzZoom}) translate(${ptzOffset.x}%, ${ptzOffset.y}%)`,
                    }}
                    className="w-full h-full object-cover transition-transform duration-200"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-rose-300 p-6 text-center">
                    <VideoOff className="w-10 h-10 mb-2" />
                    <p className="text-sm font-mono font-bold">
                      {focusedCamera.offlineReason || "KAMERA OFFLINE"}
                    </p>
                  </div>
                )}

                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-black/70 text-[11px] font-mono text-white">
                  ZOOM {ptzZoom.toFixed(1)}x • {clockText} WIT
                </div>
              </div>

            <div className="p-4 bg-[#061612] flex flex-wrap items-center justify-between gap-4">
              <div className="text-xs text-[#A3BFB5] space-y-0.5">
                <p>
                  Lokasi:{" "}
                  <span className="text-white font-semibold">{focusedCamera.location}</span>
                </p>
                <p>
                  Stream:{" "}
                  <span className="font-mono text-emerald-300">
                    {focusedCamera.resolution} @ {focusedCamera.fps}fps (
                    {focusedCamera.bitrateKbps} kbps)
                  </span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                {focusedCamera.ptzSupported && focusedCamera.status !== "OFFLINE" && (
                  <div className="flex items-center gap-1 p-1 rounded-xl bg-[#0B241E] border border-[#1E4D40]">
                    <button
                      type="button"
                      onClick={() => setPtzOffset((p) => ({ ...p, x: Math.min(p.x + 8, 24) }))}
                      className="p-1.5 rounded-lg hover:bg-[#143E33] cursor-pointer"
                      title="Pan Kiri"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPtzOffset((p) => ({ ...p, y: Math.min(p.y + 8, 24) }))}
                      className="p-1.5 rounded-lg hover:bg-[#143E33] cursor-pointer"
                      title="Tilt Atas"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPtzOffset((p) => ({ ...p, y: Math.max(p.y - 8, -24) }))}
                      className="p-1.5 rounded-lg hover:bg-[#143E33] cursor-pointer"
                      title="Tilt Bawah"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPtzOffset((p) => ({ ...p, x: Math.max(p.x - 8, -24) }))}
                      className="p-1.5 rounded-lg hover:bg-[#143E33] cursor-pointer"
                      title="Pan Kanan"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <div className="w-px h-5 bg-[#1E4D40] mx-0.5" />
                    <button
                      type="button"
                      onClick={() => setPtzZoom((z) => Math.min(Number((z + 0.3).toFixed(1)), 2.5))}
                      className="p-1.5 rounded-lg hover:bg-[#143E33] cursor-pointer"
                      title="Zoom In"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPtzZoom((z) => Math.max(Number((z - 0.3).toFixed(1)), 1))}
                      className="p-1.5 rounded-lg hover:bg-[#143E33] cursor-pointer"
                      title="Zoom Out"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPtzZoom(1);
                        setPtzOffset({ x: 0, y: 0 });
                      }}
                      className="p-1.5 rounded-lg hover:bg-[#143E33] text-amber-400 cursor-pointer"
                      title="Reset Posisi PTZ"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {focusedCamera.status === "OFFLINE" ? (
                  <Link
                    href="/upt/pemeliharaan"
                    className="px-3 py-2 rounded-xl bg-rose-950/90 hover:bg-rose-900 border border-rose-500/40 text-xs font-bold text-rose-200 inline-flex items-center gap-1.5 transition-colors"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Lapor Kerusakan</span>
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/upt/kapal"
                      className="px-3 py-2 rounded-xl bg-[#143E33] hover:bg-[#1B4D3E] border border-[#235D4D] text-xs font-bold text-white inline-flex items-center gap-1.5 transition-colors"
                    >
                      <Ship className="w-3.5 h-3.5 text-[#F59E0B]" />
                      <span>Catat Sandar</span>
                    </Link>
                    <Link
                      href="/upt/gis"
                      className="px-3 py-2 rounded-xl bg-[#0B241E] hover:bg-[#143E33] border border-[#1E4D40] text-xs font-bold text-emerald-300 inline-flex items-center gap-1.5 transition-colors"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Lihat di GIS</span>
                    </Link>
                  </>
                )}

                <button
                  type="button"
                  onClick={() => handleSnapshot(focusedCamera, true)}
                  className="px-3 py-2 rounded-xl bg-[#D97706] hover:bg-[#B45309] text-xs font-bold text-white inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Snapshot</span>
                </button>
              </div>
            </div>
            </div>

            {filteredCameras.length > 1 && (
              <button
                type="button"
                onClick={() => navigateFocusCamera(1)}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#0B241E]/95 hover:bg-[#143E33] border border-[#1E4D40] hover:border-[#D97706] text-white flex items-center justify-center shadow-2xl cursor-pointer transition-all shrink-0"
                title="Kamera Berikutnya (→)"
                aria-label="Kamera Berikutnya"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
