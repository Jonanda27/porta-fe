"use client";

import React from "react";
import Link from "next/link";
import {
  Camera,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  MapPin,
  Pause,
  Play,
  Radio,
  RotateCcw,
  Ship,
  VideoOff,
  Wrench,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { CctvCameraItem } from "@/types/cctv.types";

export interface CctvFocusModalProps {
  camera: CctvCameraItem | null;
  totalFilteredCount: number;
  currentIndex: number;
  isAutoTour: boolean;
  clockText: string;
  ptzZoom: number;
  ptzOffset: { x: number; y: number };
  focusVideoRef: React.RefObject<HTMLVideoElement | null>;
  onClose: () => void;
  onNavigate: (direction: -1 | 1) => void;
  onToggleAutoTour: () => void;
  onPan: (dx: number, dy: number) => void;
  onZoomChange: (delta: number) => void;
  onResetPtz: () => void;
  onSnapshot: (camera: CctvCameraItem) => void;
}

export function CctvFocusModal({
  camera,
  totalFilteredCount,
  currentIndex,
  isAutoTour,
  clockText,
  ptzZoom,
  ptzOffset,
  focusVideoRef,
  onClose,
  onNavigate,
  onToggleAutoTour,
  onPan,
  onZoomChange,
  onResetPtz,
  onSnapshot,
}: CctvFocusModalProps) {
  if (!camera) return null;

  return (
    <div className="fixed inset-0 z-[1005] bg-black/85 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-5xl flex items-center justify-center gap-3 sm:gap-5">
        {totalFilteredCount > 1 && (
          <button
            type="button"
            onClick={() => onNavigate(-1)}
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
                  {camera.code} — {camera.name}
                </h2>
                <p className="text-[11px] font-mono text-[#A3BFB5]">
                  {camera.ipAddress} • {camera.protocol}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onToggleAutoTour}
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
              {totalFilteredCount > 1 && (
                <span className="px-2 py-0.5 rounded-md bg-[#061612] border border-[#1E4D40] text-[10.5px] font-mono text-[#A3BFB5]">
                  {Math.max(currentIndex + 1, 1)} / {totalFilteredCount}
                </span>
              )}
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-[#143E33] text-[#A3BFB5] hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="relative aspect-video bg-black overflow-hidden">
            {camera.status !== "OFFLINE" && camera.videoSrc ? (
              <video
                ref={focusVideoRef}
                src={camera.videoSrc}
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
                  {camera.offlineReason || "KAMERA OFFLINE"}
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
                <span className="text-white font-semibold">{camera.location}</span>
              </p>
              <p>
                Stream:{" "}
                <span className="font-mono text-emerald-300">
                  {camera.resolution} @ {camera.fps}fps ({camera.bitrateKbps} kbps)
                </span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              {camera.ptzSupported && camera.status !== "OFFLINE" && (
                <div className="flex items-center gap-1 p-1 rounded-xl bg-[#0B241E] border border-[#1E4D40]">
                  <button
                    type="button"
                    onClick={() => onPan(8, 0)}
                    className="p-1.5 rounded-lg hover:bg-[#143E33] cursor-pointer"
                    title="Pan Kiri"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onPan(0, 8)}
                    className="p-1.5 rounded-lg hover:bg-[#143E33] cursor-pointer"
                    title="Tilt Atas"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onPan(0, -8)}
                    className="p-1.5 rounded-lg hover:bg-[#143E33] cursor-pointer"
                    title="Tilt Bawah"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onPan(-8, 0)}
                    className="p-1.5 rounded-lg hover:bg-[#143E33] cursor-pointer"
                    title="Pan Kanan"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <div className="w-px h-5 bg-[#1E4D40] mx-0.5" />
                  <button
                    type="button"
                    onClick={() => onZoomChange(0.3)}
                    className="p-1.5 rounded-lg hover:bg-[#143E33] cursor-pointer"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onZoomChange(-0.3)}
                    className="p-1.5 rounded-lg hover:bg-[#143E33] cursor-pointer"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={onResetPtz}
                    className="p-1.5 rounded-lg hover:bg-[#143E33] text-amber-400 cursor-pointer"
                    title="Reset Posisi PTZ"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              )}

              {camera.status === "OFFLINE" ? (
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
                onClick={() => onSnapshot(camera)}
                className="px-3 py-2 rounded-xl bg-[#D97706] hover:bg-[#B45309] text-xs font-bold text-white inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Snapshot</span>
              </button>
            </div>
          </div>
        </div>

        {totalFilteredCount > 1 && (
          <button
            type="button"
            onClick={() => onNavigate(1)}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#0B241E]/95 hover:bg-[#143E33] border border-[#1E4D40] hover:border-[#D97706] text-white flex items-center justify-center shadow-2xl cursor-pointer transition-all shrink-0"
            title="Kamera Berikutnya (→)"
            aria-label="Kamera Berikutnya"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
