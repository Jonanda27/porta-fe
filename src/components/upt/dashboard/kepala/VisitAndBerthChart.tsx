"use client";

import React, { useMemo } from "react";

interface VisitAndBerthChartProps {
  activeVisits: number;
  requestedVisits: number;
  completedVisits: number;
  openBerths: number;
  maintenanceBerths: number;
  closedBerths: number;
}

export function VisitAndBerthChart({
  activeVisits,
  requestedVisits,
  completedVisits,
  openBerths,
  maintenanceBerths,
  closedBerths,
}: VisitAndBerthChartProps) {
  const totalVisits = activeVisits + requestedVisits + completedVisits;
  const totalBerths = openBerths + maintenanceBerths + closedBerths;

  const legendItems = useMemo(
    () => [
      { label: "Aktif / Sandar", count: activeVisits, stroke: "#10B981", dot: "bg-emerald-500" },
      { label: "Menunggu Izin", count: requestedVisits, stroke: "#D97706", dot: "bg-[#D97706]" },
      { label: "Selesai / Lunas", count: completedVisits, stroke: "#0B241E", dot: "bg-[#0B241E]" },
    ],
    [activeVisits, requestedVisits, completedVisits]
  );

  const donutSegments = useMemo(() => {
    if (totalVisits === 0) return [];
    const radius = 42;
    const circumference = 2 * Math.PI * radius;
    let offset = 0;

    return legendItems.map((seg) => {
      const length = (seg.count / totalVisits) * circumference;
      const item = {
        ...seg,
        dasharray: `${length} ${circumference - length}`,
        dashoffset: -offset,
      };
      offset += length;
      return item;
    });
  }, [legendItems, totalVisits]);

  return (
    <div className="lg:col-span-5 bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
      <div>
        <h3 className="text-sm font-extrabold text-[#0B241E]">
          Monitoring Kunjungan &amp; Dermaga
        </h3>
        <p className="text-[11px] text-[#64748B]">
          Proporsi siklus kunjungan kapal dan kesiapan fasilitas tambat
        </p>
      </div>

      <div className="my-5 flex items-center justify-center gap-6">
        <div className="relative w-32 h-32 shrink-0">
          <svg viewBox="0 0 110 110" className="w-full h-full -rotate-90">
            <circle
              cx="55"
              cy="55"
              r="42"
              fill="none"
              stroke="#F1F5F9"
              strokeWidth="14"
            />
            {donutSegments.map((seg) => (
              <circle
                key={seg.label}
                cx="55"
                cy="55"
                r="42"
                fill="none"
                stroke={seg.stroke}
                strokeWidth="14"
                strokeDasharray={seg.dasharray}
                strokeDashoffset={seg.dashoffset}
              />
            ))}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-black text-[#0B241E]">{totalVisits}</span>
            <span className="text-[10px] font-semibold text-[#64748B]">Kunjungan</span>
          </div>
        </div>

        <div className="space-y-2.5 text-xs">
          {legendItems.map((item) => (
            <div key={item.label} className="flex items-center justify-between gap-4">
              <span className="inline-flex items-center gap-1.5 text-[#334155] font-semibold">
                <span className={`w-2.5 h-2.5 rounded-full ${item.dot}`} />
                {item.label}
              </span>
              <span className="font-mono font-bold text-[#0B241E]">{item.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-3 border-t border-[#F1F5F9]">
        <div className="flex items-center justify-between text-[11px] font-bold text-[#475569] mb-1.5">
          <span>Kesiapan Dermaga Fisik</span>
          <span className="font-mono">
            {openBerths} Open / {maintenanceBerths} Rawat / {closedBerths} Tutup
          </span>
        </div>
        <div className="w-full h-2.5 rounded-full bg-[#F1F5F9] overflow-hidden flex">
          {totalBerths > 0 && (
            <>
              <div
                className="bg-emerald-500 h-full"
                style={{ width: `${(openBerths / totalBerths) * 100}%` }}
              />
              <div
                className="bg-amber-400 h-full"
                style={{ width: `${(maintenanceBerths / totalBerths) * 100}%` }}
              />
              <div
                className="bg-rose-500 h-full"
                style={{ width: `${(closedBerths / totalBerths) * 100}%` }}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
