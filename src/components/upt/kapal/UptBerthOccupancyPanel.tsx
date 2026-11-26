"use client";

import { useState } from "react";
import { Anchor, ChevronDown, ChevronUp, X } from "lucide-react";
import { formatLabel } from "@/lib/format-labels";
import { BerthItem } from "@/types/port.types";
import { ShipVisitItem } from "@/types/upt.types";

export interface UptBerthOccupancyPanelProps {
  activePortBerths: BerthItem[];
  berthOccupationMap: Map<number, ShipVisitItem>;
  occupiedBerthCount: number;
  availableBerthCount: number;
  selectedBerthFilter: number | null;
  onToggleBerthFilter: (berthId: number) => void;
  onClearBerthFilter: () => void;
}

export function UptBerthOccupancyPanel({
  activePortBerths,
  berthOccupationMap,
  occupiedBerthCount,
  availableBerthCount,
  selectedBerthFilter,
  onToggleBerthFilter,
  onClearBerthFilter,
}: UptBerthOccupancyPanelProps) {
  const [isBerthExpanded, setIsBerthExpanded] = useState(false);

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-3.5 shadow-2xs">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-xs font-bold text-[#0B241E] flex items-center gap-1.5">
            <Anchor className="w-4 h-4 text-[#D97706]" />
            Okupansi Dermaga Real-Time
          </h3>
          <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
            {occupiedBerthCount}/{activePortBerths.length} Terisi
          </span>
          <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            {availableBerthCount} Tersedia
          </span>
          {selectedBerthFilter !== null && (
            <button
              type="button"
              onClick={onClearBerthFilter}
              className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-[#0B241E] text-white inline-flex items-center gap-1 cursor-pointer hover:bg-[#13382F]"
            >
              Filter Dermaga Aktif
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={() => setIsBerthExpanded((prev) => !prev)}
          className="text-[11px] font-semibold text-[#475569] hover:text-[#0B241E] inline-flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-[#F8FAFC] cursor-pointer"
        >
          {isBerthExpanded ? (
            <>
              Ringkas
              <ChevronUp className="w-3.5 h-3.5" />
            </>
          ) : (
            <>
              Detail Kartu
              <ChevronDown className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>

      {isBerthExpanded ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {activePortBerths.map((berth) => {
            const occupyingVisit = berthOccupationMap.get(berth.id);
            const isSelected = selectedBerthFilter === berth.id;
            return (
              <button
                key={berth.id}
                type="button"
                onClick={() => onToggleBerthFilter(berth.id)}
                className={`text-left p-3 rounded-xl border text-xs transition-all cursor-pointer ${
                  occupyingVisit
                    ? "bg-amber-50/70 border-amber-200 hover:border-amber-300"
                    : berth.operationalStatus === "OPEN"
                    ? "bg-emerald-50/50 border-emerald-200 hover:border-emerald-300"
                    : "bg-slate-50 border-slate-200 hover:border-slate-300"
                } ${isSelected ? "ring-2 ring-[#0B241E] ring-offset-1" : ""}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono font-bold text-[#0B241E]">
                    {berth.code}
                  </span>
                  <span className="text-[10px] font-bold">
                    {occupyingVisit
                      ? "Terisi"
                      : formatLabel(berth.operationalStatus)}
                  </span>
                </div>
                <p className="font-semibold text-[#1E293B] mt-0.5 truncate">
                  {berth.name}
                </p>
                <p className="text-[11px] text-[#64748B] mt-0.5 truncate">
                  {occupyingVisit
                    ? `Kapal: ${
                        occupyingVisit.vessel?.name || occupyingVisit.visitNumber
                      }`
                    : formatLabel(berth.berthServiceCategory)}
                </p>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {activePortBerths.map((berth) => {
            const occupyingVisit = berthOccupationMap.get(berth.id);
            const isSelected = selectedBerthFilter === berth.id;
            return (
              <button
                key={berth.id}
                type="button"
                onClick={() => onToggleBerthFilter(berth.id)}
                title={`${berth.name} — Klik untuk filter kunjungan di dermaga ini`}
                className={`text-left px-2.5 py-2 rounded-xl border transition-all cursor-pointer ${
                  occupyingVisit
                    ? "bg-amber-50/80 border-amber-200 hover:border-amber-300"
                    : berth.operationalStatus === "OPEN"
                    ? "bg-emerald-50/50 border-emerald-200 hover:border-emerald-300"
                    : "bg-slate-50 border-slate-200 hover:border-slate-300"
                } ${isSelected ? "ring-2 ring-[#0B241E] ring-offset-1" : ""}`}
              >
                <div className="flex items-center justify-between gap-1.5">
                  <span className="font-mono text-[11px] font-bold text-[#0B241E] truncate">
                    {berth.code}
                  </span>
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      occupyingVisit
                        ? "bg-amber-500"
                        : berth.operationalStatus === "OPEN"
                        ? "bg-emerald-500"
                        : "bg-slate-400"
                    }`}
                  />
                </div>
                <p className="text-[10.5px] font-medium text-[#475569] truncate mt-0.5">
                  {occupyingVisit
                    ? occupyingVisit.vessel?.name || occupyingVisit.visitNumber
                    : "Tersedia"}
                </p>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
