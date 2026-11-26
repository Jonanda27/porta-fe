"use client";

import { Search, X } from "lucide-react";

export interface CctvSearchPopoverProps {
  isOpen: boolean;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onClose: () => void;
}

export function CctvSearchPopover({
  isOpen,
  searchQuery,
  onSearchChange,
  onClose,
}: CctvSearchPopoverProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed left-[68px] top-[88px] z-[1000] w-72 rounded-2xl bg-[#0B241E]/95 backdrop-blur-xl border border-[#1E4D40] p-2.5 shadow-2xl">
      <div className="relative">
        <Search className="w-3.5 h-3.5 text-[#85A69B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          autoFocus
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              onSearchChange("");
              onClose();
            }
          }}
          placeholder="Cari kamera, dermaga, kapal..."
          className="w-full h-9 pl-9 pr-8 rounded-xl bg-[#061612]/95 border border-[#D97706]/60 text-xs text-white placeholder:text-[#85A69B] focus:outline-none"
        />
        <button
          type="button"
          onClick={() => {
            onSearchChange("");
            onClose();
          }}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#85A69B] hover:text-white cursor-pointer"
          title="Tutup pencarian"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
