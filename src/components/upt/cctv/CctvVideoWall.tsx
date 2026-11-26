"use client";

import { VideoOff } from "lucide-react";
import { CctvCameraItem } from "@/types/cctv.types";
import { CctvCameraCard } from "./CctvCameraCard";
import { CctvLayoutMode } from "./cctv.constants";

export interface CctvVideoWallProps {
  cameras: CctvCameraItem[];
  layoutMode: CctvLayoutMode;
  spotlightCameraId: string;
  onSelectSpotlight: (cameraId: string) => void;
  registerVideoRef: (cameraId: string, el: HTMLVideoElement | null) => void;
  onSnapshot: (camera: CctvCameraItem) => void;
  onOpenFocus: (camera: CctvCameraItem) => void;
}

export function CctvVideoWall({
  cameras,
  layoutMode,
  spotlightCameraId,
  onSelectSpotlight,
  registerVideoRef,
  onSnapshot,
  onOpenFocus,
}: CctvVideoWallProps) {
  if (cameras.length === 0) {
    return (
      <main className="flex-1 min-h-0 px-4 pb-3.5 overflow-y-auto xl:overflow-hidden">
        <div className="h-full rounded-2xl bg-[#0B241E]/60 border border-[#1E4D40] flex flex-col items-center justify-center text-center p-8">
          <VideoOff className="w-10 h-10 text-[#85A69B] mb-2" />
          <p className="text-sm font-bold text-white">
            Tidak ada kamera yang cocok dengan filter
          </p>
        </div>
      </main>
    );
  }

  if (layoutMode === "spotlight") {
    const mainCam =
      cameras.find((c) => c.id === spotlightCameraId) ?? cameras[0];
    const stripCams = cameras.filter((c) => c.id !== mainCam.id);

    return (
      <main className="flex-1 min-h-0 px-4 pb-3.5 overflow-y-auto xl:overflow-hidden">
        <div className="h-full flex flex-col gap-3">
          <div className="flex-1 min-h-0">
            <CctvCameraCard
              camera={mainCam}
              variant="spotlight-main"
              registerVideoRef={registerVideoRef}
              onSnapshot={onSnapshot}
              onOpenFocus={onOpenFocus}
            />
          </div>
          {stripCams.length > 0 && (
            <div className="h-32 sm:h-36 shrink-0 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
              {stripCams.map((cam) => (
                <CctvCameraCard
                  key={cam.id}
                  camera={cam}
                  variant="spotlight-compact"
                  registerVideoRef={registerVideoRef}
                  onSelectSpotlight={onSelectSpotlight}
                  onSnapshot={onSnapshot}
                  onOpenFocus={onOpenFocus}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 min-h-0 px-4 pb-3.5 overflow-y-auto xl:overflow-hidden">
      <div
        className={`grid gap-3 h-full ${
          layoutMode === "2x2"
            ? "grid-cols-1 md:grid-cols-2 auto-rows-[minmax(220px,1fr)]"
            : "grid-cols-1 md:grid-cols-2 xl:grid-cols-3 xl:grid-rows-2 auto-rows-[minmax(210px,1fr)]"
        }`}
      >
        {cameras.map((cam) => (
          <CctvCameraCard
            key={cam.id}
            camera={cam}
            variant="grid"
            registerVideoRef={registerVideoRef}
            onSnapshot={onSnapshot}
            onOpenFocus={onOpenFocus}
          />
        ))}
      </div>
    </main>
  );
}
