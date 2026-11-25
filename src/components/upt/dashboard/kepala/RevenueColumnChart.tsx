"use client";

import React, { useMemo, useState } from "react";
import { RevenueSummaryResponse } from "@/types/upt.types";
import { formatRupiahCompact } from "./ExecutiveKpiGrid";

interface RevenueColumnChartProps {
  revenueSummary: RevenueSummaryResponse | null;
}

export function RevenueColumnChart({ revenueSummary }: RevenueColumnChartProps) {
  const [hoveredSector, setHoveredSector] = useState<string | null>(null);

  const revenueSectors = useMemo(() => {
    const items = [
      {
        id: "vessel",
        shortLabel: "Jasa Kapal",
        amount: revenueSummary?.vesselRevenueIdr ?? 0,
        barClass: "bg-[#0B241E]",
      },
      {
        id: "lease",
        shortLabel: "Sewa Aset",
        amount: revenueSummary?.assetLeaseRevenueIdr ?? 0,
        barClass: "bg-[#D97706]",
      },
      {
        id: "gate",
        shortLabel: "Pas & Tiket",
        amount: revenueSummary?.gateTicketingRevenueIdr ?? 0,
        barClass: "bg-emerald-500",
      },
      {
        id: "cargo",
        shortLabel: "Bongkar Muat",
        amount: revenueSummary?.cargoEquipmentRevenueIdr ?? 0,
        barClass: "bg-sky-600",
      },
      {
        id: "utility",
        shortLabel: "Utilitas",
        amount: revenueSummary?.utilityRevenueIdr ?? 0,
        barClass: "bg-indigo-500",
      },
    ];
    const total = items.reduce((sum, item) => sum + item.amount, 0);
    const maxAmount = Math.max(...items.map((i) => i.amount), 1);

    return {
      items: items.map((item) => ({
        ...item,
        sharePct: total > 0 ? (item.amount / total) * 100 : 0,
        heightPct: total > 0 ? (item.amount / maxAmount) * 100 : 0,
      })),
      total,
    };
  }, [revenueSummary]);

  return (
    <div className="lg:col-span-7 bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="text-sm font-extrabold text-[#0B241E]">
            Grafik Komposisi Penerimaan Daerah (PAD)
          </h3>
          <p className="text-[11px] text-[#64748B]">
            Distribusi penerimaan terverifikasi per sektor layanan pelabuhan
          </p>
        </div>
        <span className="text-xs font-mono font-bold text-[#0B241E] bg-[#F8FAFC] border border-[#E2E8F0] px-2.5 py-1 rounded-lg">
          Total: Rp {(revenueSummary?.totalVerifiedRevenueIdr ?? 0).toLocaleString("id-ID")}
        </span>
      </div>

      {revenueSectors.total === 0 ? (
        <div className="py-12 text-center text-xs text-[#94A3B8] border border-dashed border-[#E2E8F0] rounded-xl">
          Belum ada penerimaan terverifikasi yang tercatat dari backend.
        </div>
      ) : (
        <div className="relative pt-4">
          <div className="relative h-56 flex items-end justify-around gap-3 px-2 border-b border-[#E2E8F0]">
            <div className="pointer-events-none absolute inset-0 flex flex-col justify-between">
              {[100, 75, 50, 25, 0].map((tick) => (
                <div
                  key={tick}
                  className="w-full border-t border-dashed border-[#E2E8F0]/80"
                />
              ))}
            </div>

            {revenueSectors.items.map((sector) => {
              const isHovered = hoveredSector === sector.id;
              const barHeightPct =
                sector.amount > 0 ? Math.max(sector.heightPct, 6) : 2;
              return (
                <div
                  key={sector.id}
                  onMouseEnter={() => setHoveredSector(sector.id)}
                  onMouseLeave={() => setHoveredSector(null)}
                  className="relative z-10 flex-1 max-w-[84px] h-full flex flex-col items-center justify-end cursor-pointer"
                >
                  {isHovered && (
                    <div className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap z-20 px-2.5 py-1 rounded-lg bg-[#0B241E] text-white text-[10.5px] font-mono font-bold shadow-lg">
                      Rp {sector.amount.toLocaleString("id-ID")} ({sector.sharePct.toFixed(1)}%)
                    </div>
                  )}

                  <span className="text-[10px] font-mono font-bold text-[#334155] mb-1.5 whitespace-nowrap">
                    {sector.sharePct.toFixed(1)}%
                  </span>

                  <div
                    className={`w-full max-w-[44px] rounded-t-xl transition-all duration-300 ${
                      sector.barClass
                    } ${
                      hoveredSector && !isHovered ? "opacity-45" : "opacity-100"
                    } ${isHovered ? "ring-2 ring-offset-2 ring-[#D97706]" : ""}`}
                    style={{ height: `${barHeightPct}%` }}
                  />
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-5 gap-2 pt-2.5 text-center">
            {revenueSectors.items.map((sector) => (
              <div key={sector.id} className="min-w-0">
                <p className="text-[11px] font-bold text-[#0B241E] truncate">
                  {sector.shortLabel}
                </p>
                <p className="text-[10px] font-mono text-[#64748B] truncate">
                  {formatRupiahCompact(sector.amount)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
