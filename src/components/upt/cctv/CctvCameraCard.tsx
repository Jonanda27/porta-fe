"use client";

import Link from "next/link";
import {
  Anchor,
  Camera,
  MapPin,
  Maximize2,
  Moon,
  Ship,
  VideoOff,
  Wrench,
} from "lucide-react";
import { CctvCameraItem } from "@/types/cctv.types";
import { STATUS_BADGE } from "./cctv.constants";

export type CctvCardVariant = "grid" | "spotlight-main" | "spotlight-compact";

export interface CctvCameraCardProps {
  camera: CctvCameraItem;
  variant: CctvCardVariant;
  registerVideoRef: (cameraId: string, el: HTMLVideoElement | null) => void;
  onSelectSpotlight?: (cameraId: string) => void;
  onSnapshot: (camera: CctvCameraItem) => void;
  onOpenFocus: (camera: CctvCameraItem) => void;
}

export function CctvCameraCard({
  camera,
  variant,
  registerVideoRef,
  onSelectSpotlight,
  onSnapshot,
  onOpenFocus,
}: CctvCameraCardProps) {
  const statusStyle = STATUS_BADGE[camera.status];
  const isMaintenance = camera.offlineReason?.startsWith("SEDANG MAINTENANCE");
  const isGrid = variant === "grid";
  const isCompact = variant === "spotlight-compact";

  return (
    <div
      onClick={
        isCompact && onSelectSpotlight ? () => onSelectSpotlight(camera.id) : undefined
      }
      className={`relative h-full rounded-2xl overflow-hidden bg-[#061612] border border-[#1E4D40] hover:border-[#D97706]/60 shadow-2xl transition-colors ${
        isGrid
          ? "min-h-[210px] group"
          : isCompact
            ? "cursor-pointer min-h-[120px]"
            : "min-h-[260px]"
      }`}
    >
      {/* Video or Maintenance/No-Signal Canvas */}
      {camera.status !== "OFFLINE" && camera.videoSrc ? (
        <video
          ref={(el) => registerVideoRef(camera.id, el)}
          src={camera.videoSrc}
          poster={camera.posterSrc}
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover opacity-95"
        />
      ) : (
        <div
          className={`w-full h-full flex flex-col items-center justify-center bg-[#040B09] text-center ${
            isGrid ? "p-5 relative" : "p-3"
          }`}
        >
          <div
            className={`bg-rose-950/60 border border-rose-500/40 flex items-center justify-center text-rose-400 ${
              isGrid ? "w-12 h-12 rounded-2xl mb-3" : "w-9 h-9 rounded-xl mb-1.5"
            }`}
          >
            {isMaintenance ? (
              <Wrench className={isGrid ? "w-6 h-6" : "w-4 h-4"} />
            ) : (
              <VideoOff className={isGrid ? "w-6 h-6" : "w-4 h-4"} />
            )}
          </div>
          <p
            className={`font-mono font-black text-rose-300 ${
              isGrid ? "text-xs tracking-wider" : "text-[10.5px]"
            }`}
          >
            {isGrid
              ? isMaintenance
                ? `MAINTENANCE — ${camera.code}`
                : `NO SIGNAL — ${camera.code}`
              : isMaintenance
                ? "MAINTENANCE"
                : "NO SIGNAL"}
          </p>
          {!isCompact && (
            <>
              <p className="text-[11px] text-[#A3BFB5] mt-1 max-w-xs">
                {camera.offlineReason || "Koneksi NVR terputus"}
              </p>
              <Link
                href="/upt/pemeliharaan"
                className={`${
                  isGrid ? "mt-3" : "mt-2.5"
                } px-3 py-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 border border-rose-500/40 text-[10.5px] font-bold text-rose-200 inline-flex items-center gap-1.5 transition-colors`}
              >
                <Wrench className="w-3 h-3" />
                <span>Lapor Kerusakan</span>
              </Link>
            </>
          )}
        </div>
      )}

      {/* Top Surveillance HUD */}
      <div
        className={`absolute inset-x-0 top-0 bg-gradient-to-b from-black/85 via-black/35 to-transparent flex items-center justify-between ${
          isGrid ? "p-2.5 gap-2" : "p-2 gap-1.5"
        }`}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <span
            className={`inline-flex items-center rounded-md border font-mono font-bold ${
              isGrid ? "gap-1.5 px-2 py-0.5 text-[10px]" : "gap-1 px-1.5 py-0.5 text-[9.5px]"
            } ${statusStyle.className}`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${statusStyle.dotClass} ${
                camera.status === "ONLINE" ? "animate-pulse" : ""
              }`}
            />
            {camera.code}
          </span>
          {camera.berthCode && !isCompact && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#0B241E]/85 border border-[#1E4D40] text-[10px] font-mono font-bold text-emerald-300">
              <Anchor className="w-2.5 h-2.5" />
              {camera.berthCode}
            </span>
          )}
        </div>

        {isGrid && (
          <div className="flex items-center gap-1.5 shrink-0">
            {camera.ptzSupported && (
              <span className="px-1.5 py-0.5 rounded bg-black/60 border border-white/15 text-[9px] font-mono text-amber-300">
                PTZ
              </span>
            )}
            {camera.nightVision && (
              <span
                className="p-1 rounded bg-black/60 border border-white/15 text-sky-300"
                title="Night Vision / IR Aktif"
              >
                <Moon className="w-2.5 h-2.5" />
              </span>
            )}
          </div>
        )}
      </div>

      {/* Bottom HUD */}
      <div
        className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/55 to-transparent flex items-end justify-between gap-2 ${
          isGrid ? "p-3" : "p-2.5"
        }`}
      >
        <div className="min-w-0">
          <h3
            className={`font-extrabold text-white truncate ${
              isGrid ? "text-xs" : "text-[11px]"
            }`}
          >
            {camera.name}
          </h3>
          {!isCompact && (
            <div className="flex items-center gap-2 text-[10px] font-mono text-[#A3BFB5] mt-0.5">
              <span>
                {camera.resolution} • {camera.fps} FPS
              </span>
              {camera.activeVessel && (
                <span className="text-amber-300 font-bold inline-flex items-center gap-1 truncate">
                  <Ship className="w-3 h-3 shrink-0" />
                  <span className="truncate">{camera.activeVessel}</span>
                </span>
              )}
            </div>
          )}
        </div>

        {!isCompact && (
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
              onClick={() => onSnapshot(camera)}
              className="p-1.5 rounded-lg bg-black/70 hover:bg-[#143E33] border border-white/15 text-white cursor-pointer transition-colors"
              title="Ambil & Unduh Snapshot PNG"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onOpenFocus(camera)}
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
}
