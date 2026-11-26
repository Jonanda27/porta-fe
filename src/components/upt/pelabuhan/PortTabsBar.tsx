"use client";

import React from "react";
import { Loader2, Plus, RefreshCw, Search } from "lucide-react";
import { PortCategory, PortItem } from "@/types/port.types";

export interface PortTabsBarProps {
  visiblePorts: PortItem[];
  selectedPortId: number | null;
  portSearchQuery: string;
  categoryFilter: PortCategory | "";
  isLoading: boolean;
  isSuperadmin: boolean;
  onPortSearchChange: (value: string) => void;
  onCategoryFilterChange: (value: PortCategory | "") => void;
  onRefresh: () => void;
  onCreatePort: () => void;
  onSelectPort: (portId: number) => void;
}

export function PortTabsBar({
  visiblePorts,
  selectedPortId,
  portSearchQuery,
  categoryFilter,
  isLoading,
  isSuperadmin,
  onPortSearchChange,
  onCategoryFilterChange,
  onRefresh,
  onCreatePort,
  onSelectPort,
}: PortTabsBarProps) {
  return (
    <div className="px-4 sm:px-5 pt-3.5 border-b border-slate-200 space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 flex-1 flex-wrap">
          <div className="relative w-full sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={portSearchQuery}
              onChange={(e) => onPortSearchChange(e.target.value)}
              placeholder="Filter daftar pelabuhan..."
              className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-[#0B241E]"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => onCategoryFilterChange(e.target.value as PortCategory | "")}
            className="py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
            title="Filter Kategori Pelabuhan"
          >
            <option value="">Semua Kategori Pelabuhan</option>
            <option value="BARANG">Barang</option>
            <option value="PENUMPANG">Penumpang</option>
            <option value="CAMPURAN">Campuran</option>
          </select>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={onRefresh}
            title="Muat Ulang"
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
          {isSuperadmin && (
            <button
              type="button"
              onClick={onCreatePort}
              className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-[#0B241E]" />
              <span>Tambah Pelabuhan</span>
            </button>
          )}
        </div>
      </div>

      {/* Horizontal Scrollable Port Tabs (Always visible, zero width stolen from table!) */}
      <div className="flex items-center gap-1 overflow-x-auto -mb-px">
        {isLoading && visiblePorts.length === 0 ? (
          <div className="py-2.5 text-xs text-slate-500">
            <Loader2 className="w-3.5 h-3.5 animate-spin inline mr-1.5" />
            Memuat pelabuhan...
          </div>
        ) : visiblePorts.length === 0 ? (
          <div className="py-2.5 text-xs text-slate-400">
            Tidak ada pelabuhan ditemukan.
          </div>
        ) : (
          visiblePorts.map((port) => {
            const isSelected = port.id === selectedPortId;
            const berthCount = port.berths?.length || 0;
            return (
              <button
                key={port.id}
                type="button"
                onClick={() => onSelectPort(port.id)}
                className={`px-3.5 py-2.5 text-xs whitespace-nowrap border-b-2 transition-colors flex items-center gap-2 cursor-pointer shrink-0 ${
                  isSelected
                    ? "border-[#0B241E] text-slate-900 font-semibold"
                    : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300 font-medium"
                }`}
              >
                <span className="font-mono text-[11px] text-slate-400">{port.code}</span>
                <span>{port.name}</span>
                <span className="text-[11px] text-slate-400">({berthCount})</span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
