"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  AlertTriangle,
  Anchor,
  ArrowLeft,
  Building2,
  CloudRain,
  Compass,
  Globe,
  LocateFixed,
  Map as MapIcon,
  Minus,
  Navigation,
  Plus,
  Radar,
  Radio,
  Route,
  Ruler,
  Satellite,
  Search,
  Ship,
  Trash2,
  X,
} from "lucide-react";
import {
  AIS_SCOPES,
  POUMAKO_DEFAULT_CENTER,
  POUMAKO_DEFAULT_ZOOM,
} from "@/lib/gis-layers";
import {
  DUMMY_POUMAKO_ASSETS,
  DUMMY_POUMAKO_BERTHS,
  DUMMY_POUMAKO_VESSELS,
} from "@/lib/gis-dummy-data";
import {
  enrichAisVesselCompliance,
  mapLiveBerthsToGis,
  mapLiveLeasesToGisAssets,
} from "@/lib/gis-live-mapper";
import { formatRupiah } from "@/lib/kapal-billing";
import { calculateRouteDistance } from "@/lib/gis-measure";
import { usePortStore } from "@/store/port.store";
import { useUptStore } from "@/store/upt.store";
import {
  AisScopeId,
  AisVesselTelemetry,
  GisCoordinates,
  GisFlyToTarget,
  GisSelectedFeature,
  MapBaseLayerId,
  MapProjectionMode,
  VesselFilterMode,
} from "@/types/gis.types";
import { useAisStream } from "./useAisStream";
import { MarineWeatherWidget } from "./MarineWeatherWidget";

type RailCategoryId = "pelabuhan" | "kapal" | "maritim" | "cuaca";

const PoumakoGisMap = dynamic(
  () => import("./PoumakoGisMap").then((mod) => mod.PoumakoGisMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-[#061612] text-xs font-mono text-[#A3BFB5]">
        MEMUAT KANVAS GEOSPASIAL PELABUHAN POUMAKO...
      </div>
    ),
  }
);

export function UptGisView() {
  const [activeLayerId, setActiveLayerId] = useState<MapBaseLayerId>("sat");
  const [projectionMode, setProjectionMode] = useState<MapProjectionMode>("3d");
  const [showSeamarkOverlay, setShowSeamarkOverlay] = useState<boolean>(true);
  const [showMaritimeLines, setShowMaritimeLines] = useState<boolean>(true);
  const [showRainRadar, setShowRainRadar] = useState<boolean>(false);
  const [rainRadarStatus, setRainRadarStatus] = useState<{
    state: "idle" | "loading" | "ready" | "error";
    frameTime?: number;
  }>({ state: "idle" });
  const [showVesselTrails, setShowVesselTrails] = useState<boolean>(true);
  const [showBerths, setShowBerths] = useState<boolean>(true);
  const [showAssets, setShowAssets] = useState<boolean>(true);
  const [showGeofence, setShowGeofence] = useState<boolean>(true);
  const [showDummyVessels, setShowDummyVessels] = useState<boolean>(true);
  const [vesselFilter, setVesselFilter] = useState<VesselFilterMode>("ALL");
  const [isMeasureMode, setIsMeasureMode] = useState<boolean>(false);
  const [measurePoints, setMeasurePoints] = useState<GisCoordinates[]>([]);
  const [aisEnabled, setAisEnabled] = useState<boolean>(false);
  const [aisScope, setAisScope] = useState<AisScopeId>("poumako");
  const [activeRailTab, setActiveRailTab] = useState<RailCategoryId | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [selectedFeature, setSelectedFeature] = useState<GisSelectedFeature | null>(null);
  const [flyToTarget, setFlyToTarget] = useState<GisFlyToTarget | null>(null);

  const [recenterSignal, setRecenterSignal] = useState<number>(0);
  const [globeViewSignal, setGlobeViewSignal] = useState<number>(0);
  const [zoomInSignal, setZoomInSignal] = useState<number>(0);
  const [zoomOutSignal, setZoomOutSignal] = useState<number>(0);
  const [viewportCoords, setViewportCoords] = useState<GisCoordinates>(
    POUMAKO_DEFAULT_CENTER
  );
  const [viewportZoom, setViewportZoom] = useState<number>(POUMAKO_DEFAULT_ZOOM);

  const { vessels: liveVessels, status: aisStatus } = useAisStream(
    aisEnabled,
    aisScope
  );

  const {
    berths: liveBerths,
    berthsSchedule,
    fetchBerths,
    fetchBerthsSchedule,
  } = usePortStore();
  const {
    visits: liveVisits,
    vessels: registeredVessels,
    leases: liveLeases,
    fetchDashboardData,
  } = useUptStore();

  useEffect(() => {
    fetchBerths().catch(() => undefined);
    fetchBerthsSchedule(1).catch(() => undefined);
    fetchDashboardData().catch(() => undefined);
  }, [fetchBerths, fetchBerthsSchedule, fetchDashboardData]);

  const activeBerths = useMemo(
    () =>
      liveBerths.length > 0
        ? mapLiveBerthsToGis(liveBerths, berthsSchedule?.berths ?? [])
        : DUMMY_POUMAKO_BERTHS,
    [liveBerths, berthsSchedule]
  );

  const activeAssets = useMemo(() => {
    const mapped = mapLiveLeasesToGisAssets(liveLeases);
    return mapped.length > 0 ? mapped : DUMMY_POUMAKO_ASSETS;
  }, [liveLeases]);

  const combinedVessels = useMemo<AisVesselTelemetry[]>(() => {
    const map = new Map<string, AisVesselTelemetry>();
    if (showDummyVessels) {
      DUMMY_POUMAKO_VESSELS.forEach((v) => map.set(v.mmsi, v));
    }
    if (aisEnabled) {
      liveVessels.forEach((v) =>
        map.set(
          v.mmsi,
          enrichAisVesselCompliance(v, liveVisits, registeredVessels)
        )
      );
    }
    return Array.from(map.values());
  }, [showDummyVessels, aisEnabled, liveVessels, liveVisits, registeredVessels]);

  const unregisteredVessels = useMemo(
    () => combinedVessels.filter((v) => v.complianceStatus === "UNREGISTERED"),
    [combinedVessels]
  );

  const filteredVessels = useMemo(() => {
    switch (vesselFilter) {
      case "MOVING":
        return combinedVessels.filter((v) => v.sog > 0.5);
      case "ANCHORED":
        return combinedVessels.filter((v) => v.sog <= 0.5);
      case "UNREGISTERED":
        return combinedVessels.filter((v) => v.complianceStatus === "UNREGISTERED");
      default:
        return combinedVessels;
    }
  }, [combinedVessels, vesselFilter]);

  const measureDistance = useMemo(
    () => calculateRouteDistance(measurePoints),
    [measurePoints]
  );

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    const results: Array<{
      id: string;
      label: string;
      sub: string;
      lat: number;
      lng: number;
      feature: GisSelectedFeature;
    }> = [];

    activeBerths.forEach((b) => {
      if (b.name.toLowerCase().includes(q) || b.code.toLowerCase().includes(q)) {
        results.push({
          id: `berth-${b.id}`,
          label: b.name,
          sub: `Dermaga • ${b.code}`,
          lat: b.lat,
          lng: b.lng,
          feature: { kind: "berth", data: b },
        });
      }
    });

    activeAssets.forEach((a) => {
      if (
        a.name.toLowerCase().includes(q) ||
        a.code.toLowerCase().includes(q) ||
        a.tenantName?.toLowerCase().includes(q)
      ) {
        results.push({
          id: `asset-${a.id}`,
          label: a.name,
          sub: `Aset • ${a.code}`,
          lat: a.lat,
          lng: a.lng,
          feature: { kind: "asset", data: a },
        });
      }
    });

    combinedVessels.forEach((v) => {
      if (v.shipName.toLowerCase().includes(q) || v.mmsi.includes(q)) {
        results.push({
          id: `vessel-${v.mmsi}`,
          label: v.shipName,
          sub: `Kapal • MMSI ${v.mmsi}`,
          lat: v.lat,
          lng: v.lng,
          feature: { kind: "vessel", data: v },
        });
      }
    });

    return results.slice(0, 6);
  }, [searchQuery, combinedVessels, activeBerths, activeAssets]);

  const handleSelectFeature = useCallback((feature: GisSelectedFeature) => {
    setSelectedFeature(feature);
  }, []);

  const triggerFlyTo = (lat: number, lng: number, zoom = 16.5) => {
    setFlyToTarget({ lat, lng, zoom, signal: Date.now() });
  };

  return (
    <div className="fixed inset-0 h-screen w-screen overflow-hidden bg-[#061612] text-white select-none">
      {/* 1. Full-Bleed MapLibre 3D/2D Canvas */}
      <div className="absolute inset-0">
        <PoumakoGisMap
          activeLayerId={activeLayerId}
          projectionMode={projectionMode}
          showSeamarkOverlay={showSeamarkOverlay}
          showMaritimeLines={showMaritimeLines}
          showRainRadar={showRainRadar}
          showVesselTrails={showVesselTrails}
          showGeofence={showGeofence}
          isMeasureMode={isMeasureMode}
          measurePoints={measurePoints}
          berths={showBerths ? activeBerths : []}
          assets={showAssets ? activeAssets : []}
          vessels={filteredVessels}
          recenterSignal={recenterSignal}
          globeViewSignal={globeViewSignal}
          zoomInSignal={zoomInSignal}
          zoomOutSignal={zoomOutSignal}
          flyToTarget={flyToTarget}
          onSelectFeature={handleSelectFeature}
          onAddMeasurePoint={(coords) =>
            setMeasurePoints((prev) => [...prev, coords])
          }
          onViewportChange={(coords, zoom) => {
            setViewportCoords(coords);
            setViewportZoom(zoom);
          }}
          onRainRadarStatusChange={setRainRadarStatus}
        />
      </div>

      {/* 2. OSIRIS-Style Transparent Top-Left Brand with Official PORTA Logo */}
      <div className="pointer-events-none fixed top-3.5 left-[68px] z-[999] select-none flex items-start gap-3 drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]">
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
            MARITIME PORT INTELLIGENCE
          </p>
          <p className="text-[9px] font-mono tracking-[0.22em] text-[#E2E8F0]/50 uppercase mt-1.5 leading-none hidden sm:block">
            REAL-TIME MONITORING • POUMAKO • AIS • MARITIME
          </p>
        </div>
      </div>

      {/* Vertical OSIRIS-Style Right Action Pill Dock (Vertically Centered) */}
      <div className="fixed top-1/2 -translate-y-1/2 right-3.5 z-[1000] flex items-start gap-2">
        {isSearchOpen && (
          <div className="relative w-64 sm:w-72">
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
              placeholder="Cari kapal, MMSI, dermaga..."
              className="w-full h-10 pl-9 pr-8 rounded-full bg-[#061612]/95 backdrop-blur-xl border border-[#D97706]/60 text-xs text-white placeholder:text-[#85A69B] focus:outline-none shadow-2xl"
            />
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setIsSearchOpen(false);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#85A69B] hover:text-white cursor-pointer"
              title="Tutup pencarian"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            {searchResults.length > 0 && (
              <div className="absolute left-0 right-0 mt-2 rounded-2xl bg-[#0B241E]/95 backdrop-blur-xl border border-[#1E4D40] shadow-2xl overflow-hidden divide-y divide-[#143E33]">
                {searchResults.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setSelectedFeature(item.feature);
                      triggerFlyTo(item.lat, item.lng, 16.8);
                      setSearchQuery("");
                      setIsSearchOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-[#143E33] transition-colors cursor-pointer"
                  >
                    <p className="text-xs font-bold text-white truncate">{item.label}</p>
                    <p className="text-[10px] font-mono text-[#A3BFB5] truncate">
                      {item.sub}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="rounded-full bg-[#061612]/90 backdrop-blur-xl border border-[#1E4D40] p-1.5 flex flex-col items-center gap-2 shadow-2xl">
          <button
            type="button"
            onClick={() => setRecenterSignal((prev) => prev + 1)}
            className="w-9 h-9 rounded-full bg-[#D97706]/15 hover:bg-[#D97706]/30 border border-[#D97706]/60 text-[#F59E0B] flex items-center justify-center transition-colors cursor-pointer"
            title="Fokus kembali ke Pelabuhan Poumako"
            aria-label="Fokus Poumako"
          >
            <LocateFixed className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setIsSearchOpen((prev) => !prev)}
            className={`w-9 h-9 rounded-full border flex items-center justify-center transition-colors cursor-pointer ${
              isSearchOpen
                ? "bg-[#143E33] border-[#D97706]/60 text-white"
                : "border-transparent text-[#A3BFB5] hover:text-white hover:bg-[#0B241E]"
            }`}
            title="Cari kapal, MMSI, dermaga, atau aset"
            aria-label="Cari di peta"
          >
            <Search className="w-4 h-4" />
          </button>

          {unregisteredVessels.length > 0 && (
            <button
              type="button"
              onClick={() => {
                const target = unregisteredVessels[0];
                setSelectedFeature({ kind: "vessel", data: target });
                triggerFlyTo(target.lat, target.lng, 16.5);
              }}
              className="relative w-9 h-9 rounded-full border border-rose-500/40 bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 flex items-center justify-center transition-colors cursor-pointer"
              title={`${unregisteredVessels.length} Kapal Anomali Tanpa Izin PORTA`}
              aria-label="Kapal Anomali"
            >
              <AlertTriangle className="w-4 h-4 animate-pulse" />
              <span className="absolute -top-0.5 -right-0.5 min-w-[15px] h-[15px] px-1 rounded-full bg-rose-500 text-white text-[9px] font-mono font-black flex items-center justify-center">
                {unregisteredVessels.length}
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsMeasureMode((prev) => !prev)}
            className={`w-9 h-9 rounded-full border flex items-center justify-center transition-colors cursor-pointer ${
              isMeasureMode
                ? "bg-[#D97706]/25 border-[#D97706] text-[#F59E0B]"
                : "border-transparent text-[#A3BFB5] hover:text-white hover:bg-[#0B241E]"
            }`}
            title="Alat Ukur Jarak Nautika (klik titik di peta)"
            aria-label="Ukur Jarak"
          >
            <Ruler className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => {
              setProjectionMode("3d");
              setGlobeViewSignal((prev) => prev + 1);
            }}
            className="w-9 h-9 rounded-full border border-transparent text-emerald-400 hover:text-emerald-300 hover:bg-[#0B241E] flex items-center justify-center transition-colors cursor-pointer"
            title="Lihat Globe 3D Penuh"
            aria-label="Globe 3D"
          >
            <Globe className="w-4 h-4" />
          </button>

          <MarineWeatherWidget variant="rail" />
        </div>
      </div>

      {/* 3. OSIRIS-Style Slim Left Icon Rail + Separated Category Popover */}
      <nav
        aria-label="Navigasi Layer & Radar"
        className="fixed left-0 top-0 bottom-0 z-[1001] w-[54px] bg-[#061612]/95 backdrop-blur-xl border-r border-[#1E4D40] flex flex-col items-center py-3.5 justify-between"
      >
        <div className="flex flex-col items-center gap-3 w-full">
          <Link
            href="/upt/verifikasi"
            className="w-9 h-9 rounded-xl bg-[#143E33] hover:bg-[#1B4D3E] border border-[#235D4D] flex items-center justify-center text-[#D97706] hover:text-[#F59E0B] shadow-inner transition-colors"
            title="Kembali ke Portal UPT"
            aria-label="Kembali ke Portal UPT"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div className="w-6 h-px bg-[#1E4D40]" />

          <div className="flex flex-col items-center gap-2.5 w-full px-1.5">
            {(
              [
                {
                  id: "pelabuhan" as const,
                  label: "Layer Pelabuhan & Aset",
                  icon: Anchor,
                  activeCount: [showBerths, showAssets, showGeofence].filter(Boolean).length,
                },
                {
                  id: "kapal" as const,
                  label: "Radar Kapal & AIS",
                  icon: Ship,
                  activeCount: [showDummyVessels, showVesselTrails, aisEnabled].filter(Boolean).length,
                },
                {
                  id: "maritim" as const,
                  label: "Jalur & Rambu Laut",
                  icon: Route,
                  activeCount: [showMaritimeLines, showSeamarkOverlay].filter(Boolean).length,
                },
                {
                  id: "cuaca" as const,
                  label: "Radar Hujan & Cuaca",
                  icon: CloudRain,
                  activeCount: showRainRadar ? 1 : 0,
                },
              ] as const
            ).map((cat) => {
              const Icon = cat.icon;
              const isSelected = activeRailTab === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() =>
                    setActiveRailTab((prev) => (prev === cat.id ? null : cat.id))
                  }
                  title={cat.label}
                  className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer border ${
                    isSelected
                      ? "bg-[#143E33] border-[#D97706] text-white shadow-lg"
                      : cat.activeCount > 0
                        ? "bg-[#0B241E]/80 border-[#1E4D40] text-white hover:bg-[#143E33]"
                        : "bg-transparent border-transparent text-[#85A69B] hover:text-white hover:bg-[#0B241E]"
                  }`}
                >
                  <Icon className="w-[18px] h-[18px]" />
                  {cat.activeCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-sky-400 text-[#061612] text-[9px] font-mono font-black flex items-center justify-center shadow-sm">
                      {cat.activeCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Separated Floating Category Panel (opens next to the OSIRIS Rail) */}
      {activeRailTab && (
        <aside className="fixed left-[68px] top-[88px] z-[1000] w-[276px] max-h-[calc(100vh-164px)] flex flex-col rounded-2xl bg-[#0B241E]/95 backdrop-blur-xl border border-[#1E4D40] shadow-2xl overflow-hidden">
          <div className="px-3.5 py-2.5 border-b border-[#143E33] flex items-center justify-between shrink-0">
            <span className="text-xs font-extrabold tracking-wide text-white">
              {activeRailTab === "pelabuhan"
                ? "Layer Pelabuhan & Aset"
                : activeRailTab === "kapal"
                  ? "Radar Kapal & AIS"
                  : activeRailTab === "maritim"
                    ? "Jalur & Rambu Laut"
                    : "Radar Hujan & Cuaca"}
            </span>
            <button
              type="button"
              onClick={() => setActiveRailTab(null)}
              className="p-1 rounded-lg hover:bg-[#143E33] text-[#A3BFB5] hover:text-white cursor-pointer transition-colors"
              title="Tutup panel"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-3 space-y-2 overflow-y-auto">
            {activeRailTab === "pelabuhan" &&
              [
                {
                  label: "Dermaga Poumako",
                  count: activeBerths.length,
                  active: showBerths,
                  toggle: () => setShowBerths((v) => !v),
                  icon: Anchor,
                },
                {
                  label: "Aset & Kios Sewa",
                  count: activeAssets.length,
                  active: showAssets,
                  toggle: () => setShowAssets((v) => !v),
                  icon: Building2,
                },
                {
                  label: "Geofence Labuh (1 NM)",
                  active: showGeofence,
                  toggle: () => setShowGeofence((v) => !v),
                  icon: Radar,
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={item.toggle}
                    className={`w-full px-3 py-2 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                      item.active
                        ? "bg-[#143E33] border-emerald-500/40 text-white"
                        : "bg-[#061612]/60 border-[#143E33] hover:bg-[#143E33]/50 text-[#85A69B]"
                    }`}
                  >
                    <span className="flex items-center gap-2 text-xs font-semibold truncate">
                      <Icon
                        className={`w-3.5 h-3.5 shrink-0 ${
                          item.active ? "text-[#F59E0B]" : "text-[#85A69B]"
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                      {item.count !== undefined && (
                        <span className="text-[10px] font-mono text-[#A3BFB5]">
                          ({item.count})
                        </span>
                      )}
                    </span>
                    <span
                      className={`w-8 h-4.5 rounded-full p-0.5 transition-colors flex items-center ${
                        item.active ? "bg-emerald-500 justify-end" : "bg-[#1E4D40] justify-start"
                      }`}
                    >
                      <span className="w-3.5 h-3.5 rounded-full bg-white shadow-xs" />
                    </span>
                  </button>
                );
              })}

            {activeRailTab === "kapal" && (
              <>
                {[
                  {
                    label: "Kapal Simulasi",
                    count: DUMMY_POUMAKO_VESSELS.length,
                    active: showDummyVessels,
                    toggle: () => setShowDummyVessels((v) => !v),
                    icon: Ship,
                  },
                  {
                    label: "Jejak Lintasan Kapal",
                    active: showVesselTrails,
                    toggle: () => setShowVesselTrails((v) => !v),
                    icon: Navigation,
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={item.toggle}
                      className={`w-full px-3 py-2 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                        item.active
                          ? "bg-[#143E33] border-emerald-500/40 text-white"
                          : "bg-[#061612]/60 border-[#143E33] hover:bg-[#143E33]/50 text-[#85A69B]"
                      }`}
                    >
                      <span className="flex items-center gap-2 text-xs font-semibold truncate">
                        <Icon
                          className={`w-3.5 h-3.5 shrink-0 ${
                            item.active ? "text-[#F59E0B]" : "text-[#85A69B]"
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                        {item.count !== undefined && (
                          <span className="text-[10px] font-mono text-[#A3BFB5]">
                            ({item.count})
                          </span>
                        )}
                      </span>
                      <span
                        className={`w-8 h-4.5 rounded-full p-0.5 transition-colors flex items-center ${
                          item.active ? "bg-emerald-500 justify-end" : "bg-[#1E4D40] justify-start"
                        }`}
                      >
                        <span className="w-3.5 h-3.5 rounded-full bg-white shadow-xs" />
                      </span>
                    </button>
                  );
                })}

                <div className="pt-2 border-t border-[#143E33] space-y-1.5">
                  <p className="text-[10px] font-mono uppercase tracking-wider text-[#85A69B]">
                    Filter Status Kapal ({filteredVessels.length})
                  </p>
                  <div className="grid grid-cols-4 gap-1">
                    {(
                      [
                        { id: "ALL", label: "Semua" },
                        { id: "MOVING", label: "Jalan" },
                        { id: "ANCHORED", label: "Labuh" },
                        { id: "UNREGISTERED", label: "Anomali" },
                      ] as const
                    ).map((chip) => {
                      const active = vesselFilter === chip.id;
                      return (
                        <button
                          key={chip.id}
                          type="button"
                          onClick={() => setVesselFilter(chip.id)}
                          className={`py-1 px-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                            active
                              ? "bg-[#D97706] text-white border-[#D97706]"
                              : "bg-[#061612]/60 text-[#A3BFB5] border-[#143E33] hover:text-white"
                          }`}
                        >
                          {chip.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-2 border-t border-[#143E33] space-y-1.5">
                  <button
                    type="button"
                    onClick={() => setAisEnabled((prev) => !prev)}
                    className={`w-full px-3 py-2 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                      aisEnabled
                        ? "bg-[#143E33] border-emerald-500/40 text-white"
                        : "bg-[#061612]/60 border-[#143E33] hover:bg-[#143E33]/50 text-[#85A69B]"
                    }`}
                  >
                    <span className="flex items-center gap-2 text-xs font-semibold">
                      <Radio
                        className={`w-3.5 h-3.5 ${
                          aisEnabled ? "text-emerald-400" : "text-[#85A69B]"
                        }`}
                      />
                      <span>AISStream.io Live</span>
                    </span>
                    <span className="text-[10px] font-mono font-bold">
                      {aisEnabled
                        ? aisStatus === "connected"
                          ? `LIVE (${liveVessels.length})`
                          : "..."
                        : "OFF"}
                    </span>
                  </button>

                  {aisEnabled && (
                    <div className="grid grid-cols-3 gap-1">
                      {(Object.keys(AIS_SCOPES) as AisScopeId[]).map((scopeKey) => {
                        const active = aisScope === scopeKey;
                        const shortLabel =
                          scopeKey === "poumako"
                            ? "Poumako"
                            : scopeKey === "papua"
                              ? "Papua"
                              : "Nusantara";
                        return (
                          <button
                            key={scopeKey}
                            type="button"
                            onClick={() => setAisScope(scopeKey)}
                            className={`py-1 px-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                              active
                                ? "bg-[#D97706] text-white border-[#D97706]"
                                : "bg-[#061612]/70 text-[#A3BFB5] border-[#143E33] hover:text-white"
                            }`}
                          >
                            {shortLabel}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-[#143E33] grid grid-cols-2 gap-x-2 gap-y-1.5 text-[10px] text-[#A3BFB5]">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    Aktif / Berizin
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    Labuh / Rawat
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-sky-400" />
                    Disewa / UPP
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    Anomali / Tunggak
                  </span>
                </div>
              </>
            )}

            {activeRailTab === "maritim" &&
              [
                {
                  label: "Maritime Lines",
                  active: showMaritimeLines,
                  toggle: () => setShowMaritimeLines((v) => !v),
                  icon: Route,
                },
                {
                  label: "Rambu Laut OpenSeaMap",
                  active: showSeamarkOverlay,
                  toggle: () => setShowSeamarkOverlay((v) => !v),
                  icon: Compass,
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={item.toggle}
                    className={`w-full px-3 py-2 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                      item.active
                        ? "bg-[#143E33] border-emerald-500/40 text-white"
                        : "bg-[#061612]/60 border-[#143E33] hover:bg-[#143E33]/50 text-[#85A69B]"
                    }`}
                  >
                    <span className="flex items-center gap-2 text-xs font-semibold truncate">
                      <Icon
                        className={`w-3.5 h-3.5 shrink-0 ${
                          item.active ? "text-[#F59E0B]" : "text-[#85A69B]"
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </span>
                    <span
                      className={`w-8 h-4.5 rounded-full p-0.5 transition-colors flex items-center ${
                        item.active ? "bg-emerald-500 justify-end" : "bg-[#1E4D40] justify-start"
                      }`}
                    >
                      <span className="w-3.5 h-3.5 rounded-full bg-white shadow-xs" />
                    </span>
                  </button>
                );
              })}

            {activeRailTab === "cuaca" && (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setShowRainRadar((v) => !v)}
                  className={`w-full px-3 py-2 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                    showRainRadar
                      ? "bg-[#143E33] border-emerald-500/40 text-white"
                      : "bg-[#061612]/60 border-[#143E33] hover:bg-[#143E33]/50 text-[#85A69B]"
                  }`}
                >
                  <span className="flex items-center gap-2 text-xs font-semibold truncate">
                    <CloudRain
                      className={`w-3.5 h-3.5 shrink-0 ${
                        showRainRadar ? "text-sky-400" : "text-[#85A69B]"
                      }`}
                    />
                    <span className="truncate">Radar Hujan (RainViewer)</span>
                  </span>
                  <span
                    className={`w-8 h-4.5 rounded-full p-0.5 transition-colors flex items-center ${
                      showRainRadar ? "bg-emerald-500 justify-end" : "bg-[#1E4D40] justify-start"
                    }`}
                  >
                    <span className="w-3.5 h-3.5 rounded-full bg-white shadow-xs" />
                  </span>
                </button>

                <div className="p-2.5 rounded-xl bg-[#061612]/70 border border-[#143E33] space-y-1.5 text-[10.5px] text-[#A3BFB5]">
                  <p className="font-mono text-white font-semibold">
                    {showRainRadar
                      ? rainRadarStatus.state === "loading"
                        ? "Memuat tile radar RainViewer..."
                        : rainRadarStatus.state === "error"
                          ? "Gagal memuat data RainViewer"
                          : `Aktif${
                              rainRadarStatus.frameTime
                                ? ` • ${new Date(
                                    rainRadarStatus.frameTime * 1000
                                  ).toLocaleTimeString("id-ID", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}`
                                : ""
                            }`
                      : "Radar hujan sedang nonaktif"}
                  </p>
                  <p className="text-[10px] leading-relaxed">
                    Area cerah tampil transparan. Zoom out untuk melihat sebaran awan hujan di seluruh Indonesia.
                  </p>
                  {showRainRadar && viewportZoom > 7 && (
                    <button
                      type="button"
                      onClick={() => triggerFlyTo(-2.5, 118, 4.5)}
                      className="w-full py-1.5 rounded-lg bg-[#143E33] hover:bg-[#1B4D3E] border border-sky-400/30 text-[10.5px] font-mono font-bold text-sky-300 cursor-pointer transition-colors"
                    >
                      Zoom Out: Lihat Indonesia
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </aside>
      )}

      {/* 4. Right-Side Inspector Drawer */}
      {selectedFeature && (
        <aside className="fixed right-[72px] top-3.5 z-[1000] w-80 max-w-[calc(100vw-6rem)] max-h-[calc(100vh-144px)] overflow-y-auto rounded-2xl bg-[#0B241E]/95 backdrop-blur-xl border border-[#1E4D40] shadow-2xl">
          <div className="px-4 py-3 border-b border-[#143E33] flex items-center justify-between bg-[#061612]/50">
            <span className="text-[11px] font-mono font-extrabold uppercase tracking-wider text-[#F59E0B]">
              {selectedFeature.kind === "berth"
                ? "Inspector Dermaga"
                : selectedFeature.kind === "asset"
                  ? "Inspector Aset & Kios"
                  : "Telemetry Kapal AIS"}
            </span>
            <button
              type="button"
              onClick={() => setSelectedFeature(null)}
              className="p-1 rounded-lg hover:bg-[#143E33] text-[#A3BFB5] hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4 space-y-3 text-xs">
            {selectedFeature.kind === "berth" && (
              <>
                <div>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {selectedFeature.data.code}
                  </span>
                  <h3 className="text-sm font-black text-white mt-1.5">
                    {selectedFeature.data.name}
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-2.5 p-3 rounded-xl bg-[#061612]/70 border border-[#143E33] text-[11px]">
                  <div>
                    <p className="text-[#85A69B]">Otoritas</p>
                    <p className="font-bold text-white">{selectedFeature.data.authorityType}</p>
                  </div>
                  <div>
                    <p className="text-[#85A69B]">Status</p>
                    <p className="font-bold text-emerald-300">
                      {selectedFeature.data.operationalStatus}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#85A69B]">Panjang Dermaga</p>
                    <p className="font-bold text-white">
                      {selectedFeature.data.maxLengthMeters} m
                    </p>
                  </div>
                  <div>
                    <p className="text-[#85A69B]">Kapal Sandar</p>
                    <p className="font-bold text-[#F59E0B] truncate">
                      {selectedFeature.data.currentVesselName || "Kosong"}
                    </p>
                  </div>
                </div>
              </>
            )}

            {selectedFeature.kind === "asset" && (
              <>
                <div>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-sky-500/20 text-sky-200 border border-sky-400/30">
                    {selectedFeature.data.code} • {selectedFeature.data.assetType}
                  </span>
                  <h3 className="text-sm font-black text-white mt-1.5">
                    {selectedFeature.data.name}
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-2.5 p-3 rounded-xl bg-[#061612]/70 border border-[#143E33] text-[11px]">
                  <div>
                    <p className="text-[#85A69B]">Status Sewa</p>
                    <p
                      className={`font-bold ${
                        selectedFeature.data.status === "ARREARS"
                          ? "text-rose-400"
                          : "text-emerald-300"
                      }`}
                    >
                      {selectedFeature.data.status}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#85A69B]">Luas</p>
                    <p className="font-bold text-white">{selectedFeature.data.areaSqm} m²</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[#85A69B]">Penyewa / Tenant</p>
                    <p className="font-bold text-white">
                      {selectedFeature.data.tenantName || "Belum Ada Penyewa"}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[#85A69B]">Tarif Tahunan</p>
                    <p className="font-bold text-[#F59E0B]">
                      {formatRupiah(selectedFeature.data.annualRateIdr)} / tahun
                    </p>
                  </div>
                </div>
              </>
            )}

            {selectedFeature.kind === "vessel" && (
              <>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#143E33] text-[#E2E8F0]">
                      MMSI {selectedFeature.data.mmsi}
                    </span>
                    {selectedFeature.data.complianceStatus === "UNREGISTERED" ? (
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-rose-500/25 text-rose-200 border border-rose-400/40 font-bold">
                        TANPA IZIN PORTA
                      </span>
                    ) : (
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-bold">
                        TERDAFTAR
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-black text-white mt-1.5">
                    {selectedFeature.data.shipName}
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-2.5 p-3 rounded-xl bg-[#061612]/70 border border-[#143E33] text-[11px]">
                  <div>
                    <p className="text-[#85A69B]">Kecepatan (SOG)</p>
                    <p className="font-bold text-white">
                      {selectedFeature.data.sog.toFixed(1)} kn
                    </p>
                  </div>
                  <div>
                    <p className="text-[#85A69B]">Haluan (COG)</p>
                    <p className="font-bold text-white">
                      {Math.round(selectedFeature.data.cog)}°
                    </p>
                  </div>
                  {(selectedFeature.data.lengthMeters || selectedFeature.data.beamMeters) && (
                    <div>
                      <p className="text-[#85A69B]">Dimensi (P × L)</p>
                      <p className="font-mono font-bold text-white">
                        {selectedFeature.data.lengthMeters || "-"} ×{" "}
                        {selectedFeature.data.beamMeters || "-"} m
                      </p>
                    </div>
                  )}
                  {selectedFeature.data.draughtMeters !== undefined && (
                    <div>
                      <p className="text-[#85A69B]">Sarat Air (Draught)</p>
                      <p className="font-mono font-bold text-sky-300">
                        {selectedFeature.data.draughtMeters.toFixed(1)} m
                      </p>
                    </div>
                  )}
                  {(selectedFeature.data.imoNumber || selectedFeature.data.callSign) && (
                    <div className="col-span-2 flex items-center justify-between text-[10.5px] font-mono text-[#A3BFB5]">
                      <span>IMO: {selectedFeature.data.imoNumber || "-"}</span>
                      <span>Call Sign: {selectedFeature.data.callSign || "-"}</span>
                    </div>
                  )}
                  {selectedFeature.data.destination && (
                    <div className="col-span-2">
                      <p className="text-[#85A69B]">Tujuan</p>
                      <p className="font-bold text-emerald-300">
                        {selectedFeature.data.destination}
                      </p>
                    </div>
                  )}
                  {selectedFeature.data.skrdNumber && (
                    <div className="col-span-2">
                      <p className="text-[#85A69B]">No. e-SKRD Aktif</p>
                      <p className="font-mono font-bold text-[#F59E0B]">
                        {selectedFeature.data.skrdNumber}
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </aside>
      )}

      {/* Floating Top-Center Pills (Measure Distance & RainViewer Radar Legend) */}
      {(isMeasureMode || showRainRadar) && (
        <div className="pointer-events-none fixed top-[58px] left-1/2 -translate-x-1/2 z-[1000] flex flex-col items-center gap-2 max-w-[92vw]">
          {isMeasureMode && (
            <div className="pointer-events-auto px-3.5 py-2 rounded-xl bg-[#0B241E]/95 backdrop-blur-xl border border-[#D97706]/60 shadow-2xl flex items-center gap-3 text-xs">
              <Ruler className="w-4 h-4 text-[#F59E0B] shrink-0" />
              <div className="font-mono">
                {measurePoints.length < 2 ? (
                  <span className="text-[#E2E8F0]">
                    Klik {measurePoints.length === 0 ? "titik awal" : "titik tujuan"} di peta
                  </span>
                ) : (
                  <span className="text-white font-bold">
                    {measureDistance.nauticalMiles.toFixed(2)} NM{" "}
                    <span className="text-[#A3BFB5] font-normal">
                      (
                      {measureDistance.meters >= 1000
                        ? `${(measureDistance.meters / 1000).toFixed(2)} km`
                        : `${Math.round(measureDistance.meters)} m`}
                      )
                    </span>
                  </span>
                )}
              </div>
              {measurePoints.length > 0 && (
                <button
                  type="button"
                  onClick={() => setMeasurePoints([])}
                  className="p-1 rounded-md hover:bg-[#143E33] text-[#A3BFB5] hover:text-white cursor-pointer"
                  title="Hapus titik ukur"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setIsMeasureMode(false);
                  setMeasurePoints([]);
                }}
                className="px-2 py-0.5 rounded-md bg-[#143E33] hover:bg-[#1B4D3E] text-[11px] font-bold text-white cursor-pointer"
              >
                Selesai
              </button>
            </div>
          )}

          {showRainRadar && (
            <div className="pointer-events-auto px-3.5 py-2 rounded-xl bg-[#0B241E]/95 backdrop-blur-xl border border-[#1E4D40] shadow-2xl flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-[11px]">
              <div className="flex items-center gap-1.5 font-mono">
                <CloudRain
                  className={`w-3.5 h-3.5 shrink-0 ${
                    rainRadarStatus.state === "error"
                      ? "text-rose-400"
                      : "text-sky-400"
                  }`}
                />
                {rainRadarStatus.state === "loading" && (
                  <span className="text-sky-200 animate-pulse font-semibold">
                    Memuat radar hujan RainViewer...
                  </span>
                )}
                {rainRadarStatus.state === "error" && (
                  <span className="text-rose-300 font-semibold">
                    Gagal memuat RainViewer (periksa koneksi)
                  </span>
                )}
                {(rainRadarStatus.state === "ready" || rainRadarStatus.state === "idle") && (
                  <span className="text-white font-semibold">
                    Radar Hujan Aktif
                    {rainRadarStatus.frameTime && (
                      <span className="text-[#A3BFB5] font-normal ml-1.5">
                        (Data{" "}
                        {new Date(rainRadarStatus.frameTime * 1000).toLocaleTimeString(
                          "id-ID",
                          { hour: "2-digit", minute: "2-digit" }
                        )}
                        )
                      </span>
                    )}
                  </span>
                )}
              </div>

              {rainRadarStatus.state !== "error" && (
                <>
                  <span className="text-[#1E4D40] hidden sm:inline">|</span>
                  <div className="flex items-center gap-2 font-mono text-[10px] text-[#E2E8F0]">
                    <span className="inline-flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-sky-400" />
                      Ringan
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      Sedang
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      Lebat
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      Ekstrem
                    </span>
                  </div>
                </>
              )}

              {rainRadarStatus.state === "ready" && viewportZoom > 7 && (
                <>
                  <span className="text-[#1E4D40] hidden md:inline">|</span>
                  <span className="text-[10px] text-[#A3BFB5]">
                    Area cerah transparan
                  </span>
                  <button
                    type="button"
                    onClick={() => triggerFlyTo(-2.5, 118, 4.5)}
                    className="px-2 py-0.5 rounded-md bg-[#143E33] hover:bg-[#1B4D3E] border border-sky-400/30 text-[10px] font-mono font-bold text-sky-300 cursor-pointer transition-colors"
                    title="Zoom out ke seluruh perairan Indonesia untuk melihat sebaran awan hujan"
                  >
                    Lihat Indonesia
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* 5. Bottom-Left 3D/2D, MAP/SAT & OSIRIS-Style Coordinate Readout */}
      <div className="pointer-events-none fixed bottom-3 left-[68px] z-[1000] flex flex-col items-start gap-1.5">
        <div className="flex items-center gap-2">
          <div className="pointer-events-auto p-1 rounded-xl bg-[#0B241E]/95 backdrop-blur-xl border border-[#1E4D40] flex items-center gap-1 shadow-xl">
            <button
              type="button"
              onClick={() => setProjectionMode("3d")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-extrabold inline-flex items-center gap-1.5 transition-all cursor-pointer ${
                projectionMode === "3d"
                  ? "bg-[#D97706] text-white shadow-xs"
                  : "text-[#A3BFB5] hover:text-white"
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>3D</span>
            </button>
            <button
              type="button"
              onClick={() => setProjectionMode("2d")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-extrabold inline-flex items-center gap-1.5 transition-all cursor-pointer ${
                projectionMode === "2d"
                  ? "bg-[#D97706] text-white shadow-xs"
                  : "text-[#A3BFB5] hover:text-white"
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>2D</span>
            </button>
          </div>

          <div className="pointer-events-auto p-1 rounded-xl bg-[#0B241E]/95 backdrop-blur-xl border border-[#1E4D40] flex items-center gap-1 shadow-xl">
            <button
              type="button"
              onClick={() => setActiveLayerId("map")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-extrabold inline-flex items-center gap-1.5 transition-all cursor-pointer ${
                activeLayerId === "map"
                  ? "bg-[#D97706] text-white shadow-xs"
                  : "text-[#A3BFB5] hover:text-white"
              }`}
              title="Peta Gelap Taktis (Esri Dark Gray)"
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>MAP</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveLayerId("sat")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-extrabold inline-flex items-center gap-1.5 transition-all cursor-pointer ${
                activeLayerId === "sat"
                  ? "bg-[#D97706] text-white shadow-xs"
                  : "text-[#A3BFB5] hover:text-white"
              }`}
              title="Citra Satelit Bersih (Google Satellite)"
            >
              <Satellite className="w-3.5 h-3.5" />
              <span>SAT</span>
            </button>
          </div>
        </div>

        <div className="text-[10.5px] font-mono tracking-wider text-[#A3BFB5] drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)] tabular-nums">
          <span>CURSOR </span>
          <span className="text-[#F59E0B] font-semibold">
            {viewportCoords.lat.toFixed(4)}, {viewportCoords.lng.toFixed(4)}
          </span>
          <span className="text-[#85A69B] ml-2">Z{viewportZoom}</span>
        </div>
      </div>

      {/* 6. Bottom-Right Custom Zoom Controls */}
      <div className="fixed bottom-10 right-3.5 z-[1000] flex flex-col gap-1.5">
        <button
          type="button"
          onClick={() => setZoomInSignal((prev) => prev + 1)}
          className="w-10 h-10 rounded-xl bg-[#0B241E]/95 hover:bg-[#143E33] backdrop-blur-xl border border-[#1E4D40] text-white flex items-center justify-center shadow-xl cursor-pointer transition-colors"
          title="Perbesar (Zoom In)"
          aria-label="Zoom In"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => setZoomOutSignal((prev) => prev + 1)}
          className="w-10 h-10 rounded-xl bg-[#0B241E]/95 hover:bg-[#143E33] backdrop-blur-xl border border-[#1E4D40] text-white flex items-center justify-center shadow-xl cursor-pointer transition-colors"
          title="Perkecil (Zoom Out)"
          aria-label="Zoom Out"
        >
          <Minus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
