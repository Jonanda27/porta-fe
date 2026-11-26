"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { DUMMY_CCTV_CAMERAS, DUMMY_CCTV_EVENTS } from "@/lib/cctv-dummy-data";
import { toast } from "@/store/toast.store";
import { CctvCameraItem } from "@/types/cctv.types";
import { CctvEventLogPopover } from "@/components/upt/cctv/CctvEventLogPopover";
import { CctvFocusModal } from "@/components/upt/cctv/CctvFocusModal";
import { CctvHeader } from "@/components/upt/cctv/CctvHeader";
import { CctvNavRail } from "@/components/upt/cctv/CctvNavRail";
import { CctvSearchPopover } from "@/components/upt/cctv/CctvSearchPopover";
import { CctvVideoWall } from "@/components/upt/cctv/CctvVideoWall";
import {
  captureCctvSnapshot,
  CctvFilterMode,
  CctvLayoutMode,
} from "@/components/upt/cctv/cctv.constants";

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
  const [ptzOffset, setPtzOffset] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
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
      toast.info(
        "Simulasi Ping NVR selesai — 6 dari 6 kamera dermaga aktif (ONLINE)."
      );
    }, 550);
  };

  const handleSnapshot = (cam: CctvCameraItem, fromFocusModal = false) => {
    const videoEl = fromFocusModal
      ? focusVideoRef.current
      : videoRefs.current[cam.id];
    captureCctvSnapshot(cam, videoEl);
  };

  const openFocusModal = (cam: CctvCameraItem) => {
    setPtzZoom(1);
    setPtzOffset({ x: 0, y: 0 });
    setFocusedCamera(cam);
  };

  const navigateFocusCamera = (direction: -1 | 1) => {
    if (!focusedCamera || filteredCameras.length <= 1) return;
    const currentIndex = filteredCameras.findIndex(
      (c) => c.id === focusedCamera.id
    );
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

  const focusedCameraIndex = focusedCamera
    ? filteredCameras.findIndex((c) => c.id === focusedCamera.id)
    : -1;

  return (
    <div className="fixed inset-0 h-screen w-screen overflow-hidden bg-[#040D0B] text-white select-none">
      {/* 1. OSIRIS-Style Slim Left Icon Rail */}
      <CctvNavRail
        stats={stats}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        eventCount={DUMMY_CCTV_EVENTS.length}
        isEventLogOpen={isEventLogOpen}
        onToggleEventLog={() => {
          setIsSearchOpen(false);
          setIsEventLogOpen((prev) => !prev);
        }}
        isSearchOpen={isSearchOpen}
        hasSearchQuery={Boolean(searchQuery)}
        onToggleSearch={() => {
          setIsEventLogOpen(false);
          setIsSearchOpen((prev) => !prev);
        }}
        isAutoTour={isAutoTour}
        onToggleAutoTour={toggleAutoTour}
        isRefreshing={isRefreshing}
        onRefreshFeeds={handleRefreshFeeds}
        layoutMode={layoutMode}
        onCycleLayoutMode={cycleLayoutMode}
      />

      {/* Floating Search Popover (from Left Rail) */}
      <CctvSearchPopover
        isOpen={isSearchOpen}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onClose={() => setIsSearchOpen(false)}
      />

      {/* 2. Floating Event Log Popover (OSIRIS-style) */}
      <CctvEventLogPopover
        isOpen={isEventLogOpen}
        events={DUMMY_CCTV_EVENTS}
        onSelectEventCamera={(cameraId) => {
          const target = cameras.find((c) => c.id === cameraId);
          if (target) {
            openFocusModal(target);
            setIsEventLogOpen(false);
          }
        }}
        onClose={() => setIsEventLogOpen(false)}
      />

      {/* 3. Main Full-Screen Surveillance Workspace */}
      <div className="pl-[54px] h-full w-full flex flex-col">
        <CctvHeader
          onlineCount={stats.online}
          offlineCount={stats.offline}
          clockText={clockText}
        />

        <CctvVideoWall
          cameras={filteredCameras}
          layoutMode={layoutMode}
          spotlightCameraId={spotlightCameraId}
          onSelectSpotlight={setSpotlightCameraId}
          registerVideoRef={(cameraId, el) => {
            videoRefs.current[cameraId] = el;
          }}
          onSnapshot={(cam) => handleSnapshot(cam)}
          onOpenFocus={openFocusModal}
        />
      </div>

      {/* Modal Focus & Simulasi Kontrol PTZ */}
      <CctvFocusModal
        camera={focusedCamera}
        totalFilteredCount={filteredCameras.length}
        currentIndex={focusedCameraIndex}
        isAutoTour={isAutoTour}
        clockText={clockText}
        ptzZoom={ptzZoom}
        ptzOffset={ptzOffset}
        focusVideoRef={focusVideoRef}
        onClose={() => {
          setIsAutoTour(false);
          setFocusedCamera(null);
        }}
        onNavigate={navigateFocusCamera}
        onToggleAutoTour={() => setIsAutoTour((prev) => !prev)}
        onPan={(dx, dy) =>
          setPtzOffset((p) => ({
            x: Math.max(Math.min(p.x + dx, 24), -24),
            y: Math.max(Math.min(p.y + dy, 24), -24),
          }))
        }
        onZoomChange={(delta) =>
          setPtzZoom((z) =>
            Math.max(Math.min(Number((z + delta).toFixed(1)), 2.5), 1)
          )
        }
        onResetPtz={() => {
          setPtzZoom(1);
          setPtzOffset({ x: 0, y: 0 });
        }}
        onSnapshot={(cam) => handleSnapshot(cam, true)}
      />
    </div>
  );
}
