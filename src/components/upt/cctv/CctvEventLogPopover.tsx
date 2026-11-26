"use client";

import { Activity, X } from "lucide-react";
import { CctvEventItem } from "@/types/cctv.types";
import { EVENT_SEVERITY_BADGE } from "./cctv.constants";

export interface CctvEventLogPopoverProps {
  isOpen: boolean;
  events: CctvEventItem[];
  onSelectEventCamera: (cameraId: string) => void;
  onClose: () => void;
}

export function CctvEventLogPopover({
  isOpen,
  events,
  onSelectEventCamera,
  onClose,
}: CctvEventLogPopoverProps) {
  if (!isOpen) return null;

  return (
    <aside className="fixed left-[68px] top-[88px] z-[1000] w-[300px] max-h-[calc(100vh-120px)] flex flex-col rounded-2xl bg-[#0B241E]/95 backdrop-blur-xl border border-[#1E4D40] shadow-2xl overflow-hidden">
      <div className="px-3.5 py-2.5 border-b border-[#143E33] flex items-center justify-between shrink-0">
        <span className="text-xs font-extrabold tracking-wide text-white inline-flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-[#F59E0B]" />
          <span>Log Deteksi &amp; Event</span>
        </span>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-[#143E33] text-[#A3BFB5] hover:text-white cursor-pointer"
          title="Tutup log"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="p-2.5 space-y-2 overflow-y-auto">
        {events.map((evt) => (
          <button
            key={evt.id}
            type="button"
            onClick={() => onSelectEventCamera(evt.cameraId)}
            className="w-full text-left p-2.5 rounded-xl bg-[#061612]/75 hover:bg-[#143E33]/80 border border-[#143E33] transition-colors cursor-pointer space-y-1"
          >
            <div className="flex items-center justify-between gap-2">
              <span
                className={`px-1.5 py-0.5 rounded border text-[9px] font-mono font-bold ${EVENT_SEVERITY_BADGE[evt.severity]}`}
              >
                {evt.cameraCode}
              </span>
              <span className="text-[9.5px] font-mono text-[#85A69B]">
                {evt.timestamp}
              </span>
            </div>
            <p className="text-xs font-bold text-white">{evt.title}</p>
            <p className="text-[10.5px] text-[#A3BFB5] leading-snug">{evt.detail}</p>
          </button>
        ))}
      </div>
    </aside>
  );
}
