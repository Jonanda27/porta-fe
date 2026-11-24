import Link from "next/link";
import { ArrowRight, BarChart3, PieChart, Ship, Target } from "lucide-react";
import type { PortPerformanceSummary } from "@/types/dinas.types";
import { VesselCategoryItem, formatDonutTotal } from "@/lib/dinas-dashboard";

interface ExecutiveAnalyticsGridProps {
  totalVerifiedPad: number;
  apbdTarget2026: number;
  padPercentage: string;
  taskCompletionRate: number;
  vesselRev: number;
  gateRev: number;
  assetRev: number;
  cargoUtilityRev: number;
  portComparisonData: PortPerformanceSummary[];
  vesselCategories: VesselCategoryItem[];
}

/**
 * Grid analitik eksekutif: Grafik Donat objek retribusi, komparasi pelabuhan,
 * distribusi kategori armada, serta pace & run-rate target APBD 2026.
 */
export function ExecutiveAnalyticsGrid({
  totalVerifiedPad,
  apbdTarget2026,
  padPercentage,
  taskCompletionRate,
  vesselRev,
  gateRev,
  assetRev,
  cargoUtilityRev,
  portComparisonData,
  vesselCategories,
}: ExecutiveAnalyticsGridProps) {
  const donutRadius = 40;
  const donutCircumference = 2 * Math.PI * donutRadius;
  const validTotalPad = totalVerifiedPad > 0 ? totalVerifiedPad : 1;

  const revenueClusters = [
    {
      key: "vessel",
      label: "Pelayanan Kapal (Labuh/Tambat)",
      amount: vesselRev,
      pct: totalVerifiedPad > 0 ? (vesselRev / validTotalPad) * 100 : 0,
      stroke: "#2563EB",
      dotClass: "bg-blue-600",
      cardClass: "bg-blue-50/50 border-blue-100",
      amountClass: "text-blue-900",
      pctClass: "text-blue-700",
    },
    {
      key: "gate",
      label: "Pas Gerbang & Penumpang",
      amount: gateRev,
      pct: totalVerifiedPad > 0 ? (gateRev / validTotalPad) * 100 : 0,
      stroke: "#059669",
      dotClass: "bg-emerald-600",
      cardClass: "bg-emerald-50/50 border-emerald-100",
      amountClass: "text-emerald-900",
      pctClass: "text-emerald-700",
    },
    {
      key: "asset",
      label: "Sewa Lahan & Kios UPTD",
      amount: assetRev,
      pct: totalVerifiedPad > 0 ? (assetRev / validTotalPad) * 100 : 0,
      stroke: "#7C3AED",
      dotClass: "bg-purple-600",
      cardClass: "bg-purple-50/50 border-purple-100",
      amountClass: "text-purple-900",
      pctClass: "text-purple-700",
    },
    {
      key: "cargo",
      label: "Kargo, Alat Berat & Utilitas",
      amount: cargoUtilityRev,
      pct: totalVerifiedPad > 0 ? (cargoUtilityRev / validTotalPad) * 100 : 0,
      stroke: "#D97706",
      dotClass: "bg-amber-600",
      cardClass: "bg-amber-50/50 border-amber-100",
      amountClass: "text-amber-900",
      pctClass: "text-amber-700",
    },
  ];

  let cumulativeStroke = 0;
  const donutSegments = revenueClusters.map((cluster) => {
    const strokeLength = (cluster.pct / 100) * donutCircumference;
    const offset = -cumulativeStroke;
    cumulativeStroke += strokeLength;
    return { ...cluster, strokeLength, offset };
  });

  const maxPortPad = Math.max(
    ...portComparisonData.map((p) => p.revenue?.totalRevenueIdr || 0),
    1
  );
  const maxCategoryVisits = Math.max(...vesselCategories.map((c) => c.visitCount), 1);

  const sisaTarget = Math.max(0, apbdTarget2026 - totalVerifiedPad);
  const remainingMonths = Math.max(1, 12 - new Date().getMonth());
  const monthlyRunRateNeeded = Math.round(sisaTarget / remainingMonths);
  const isPaceHealthy = Number(padPercentage) >= 40;

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* GRAFIK 1: Komposisi Objek Retribusi Daerah (Donut Chart) */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-[#E2E8F0] shadow-xs flex flex-col justify-between space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#0B241E] text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                <PieChart className="w-5 h-5 text-[#D97706]" />
              </div>
              <div>
                <h3 className="font-bold text-[#0B241E] text-sm">
                  Komposisi Realisasi PAD per Objek Retribusi
                </h3>
                <p className="text-xs text-slate-500">
                  Porsi 4 kluster layanan pelabuhan sesuai Perda Kab. Mimika No. 4/2023
                </p>
              </div>
            </div>
            <span className="text-[11px] font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full shrink-0">
              Kasda RKUD
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-6">
            <div className="relative shrink-0 flex items-center justify-center">
              <svg className="w-40 h-40 -rotate-90 transform" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r={donutRadius} fill="transparent" stroke="#F1F5F9" strokeWidth="14" />
                {totalVerifiedPad > 0 ? (
                  donutSegments.map((seg) => (
                    <circle
                      key={seg.key}
                      cx="50"
                      cy="50"
                      r={donutRadius}
                      fill="transparent"
                      stroke={seg.stroke}
                      strokeWidth="14"
                      strokeDasharray={`${seg.strokeLength} ${donutCircumference}`}
                      strokeDashoffset={seg.offset}
                      className="transition-all duration-500"
                    />
                  ))
                ) : (
                  <circle
                    cx="50"
                    cy="50"
                    r={donutRadius}
                    fill="transparent"
                    stroke="#E2E8F0"
                    strokeWidth="14"
                    strokeDasharray="4 4"
                  />
                )}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Total Sah
                </span>
                <span className="text-sm font-black font-mono text-[#0B241E] leading-tight">
                  {formatDonutTotal(totalVerifiedPad)}
                </span>
                <span className="text-[9px] font-mono text-emerald-700 font-bold mt-0.5">
                  {padPercentage}% Target
                </span>
              </div>
            </div>

            <div className="flex-1 w-full space-y-2.5 text-xs">
              {revenueClusters.map((cluster) => (
                <div
                  key={cluster.key}
                  className={`flex flex-wrap items-center justify-between gap-1.5 p-2 rounded-lg border ${cluster.cardClass}`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${cluster.dotClass}`} />
                    <span className="font-semibold text-slate-800">{cluster.label}</span>
                  </div>
                  <div className="text-right font-mono ml-auto">
                    <span className={`font-bold ${cluster.amountClass}`}>
                      Rp {cluster.amount.toLocaleString("id-ID")}
                    </span>
                    <span className={`text-[10px] ml-1.5 font-bold ${cluster.pctClass}`}>
                      ({cluster.pct.toFixed(0)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* GRAFIK 2: Komparasi Realisasi & Kunjungan per Pelabuhan UPTD */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-[#E2E8F0] shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-700 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-[#0B241E] text-sm">
                  Komparasi Kontribusi PAD per Pelabuhan
                </h3>
                <p className="text-xs text-slate-500">
                  Realisasi penerimaan dan volume kunjungan antar-UPTD Kabupaten Mimika
                </p>
              </div>
            </div>
            <span className="text-[11px] font-mono font-bold text-blue-800 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full shrink-0">
              {portComparisonData.length} Pelabuhan
            </span>
          </div>

          <div className="space-y-4 pt-1">
            {portComparisonData.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 font-mono">
                Menyinkronkan data komparasi antar-pelabuhan...
              </div>
            ) : (
              portComparisonData.map((port) => {
                const portRev = port.revenue?.totalRevenueIdr || 0;
                const barWidth = Math.max(8, Math.min(100, Math.round((portRev / maxPortPad) * 100)));
                const visits = port.vesselActivity?.totalVisits || 0;

                return (
                  <div key={port.portId} className="space-y-1.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900">{port.name}</span>
                        <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          {port.code}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="text-[11px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-bold">
                          {visits} Call
                        </span>
                        <span className="font-extrabold text-[#0B241E]">
                          Rp {portRev.toLocaleString("id-ID")}
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden flex">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-600 to-[#0B241E] rounded-full transition-all duration-500"
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end text-[11px] text-slate-500">
            <span className="font-mono text-emerald-700 font-bold">
              Kepatuhan Tugas: {taskCompletionRate}%
            </span>
          </div>
        </div>
      </div>

      {/* GRAFIK BARIS KEDUA: Kategori Armada Kapal & Capaian Target APBD 2026 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-purple-700 text-white flex items-center justify-center font-bold shadow-xs">
                <Ship className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-[#0B241E] text-sm">
                  Grafik Distribusi Trafik Berdasarkan Kategori Armada
                </h3>
                <p className="text-xs text-slate-500">
                  Proporsi volume kunjungan kapal kargo barang, kapal penumpang, dan kapal rakyat
                </p>
              </div>
            </div>
            <span className="text-[11px] font-mono font-bold text-purple-800 bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded-full">
              Kategori Kapal
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            {vesselCategories.map((cat) => {
              const visitPct =
                maxCategoryVisits > 0
                  ? Math.max(8, Math.min(100, Math.round((cat.visitCount / maxCategoryVisits) * 100)))
                  : 8;

              return (
                <div
                  key={cat.key}
                  className={`p-4 rounded-xl border ${cat.borderCls} ${cat.bgLight} flex flex-col justify-between space-y-3`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-slate-800">{cat.label}</span>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white ${cat.textColor} border ${cat.borderCls}`}>
                      {cat.key}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-black font-mono text-slate-900">{cat.visitCount}</span>
                      <span className="text-xs text-slate-500 font-sans">Kunjungan</span>
                    </div>
                    <div className="w-full bg-white/80 rounded-full h-2 mt-2 overflow-hidden border border-slate-200/50">
                      <div
                        className={`h-full ${cat.colorBg} rounded-full transition-all duration-500`}
                        style={{ width: `${visitPct}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/60 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">PAD Terverifikasi:</span>
                    <span className={`font-mono font-bold ${cat.textColor}`}>
                      Rp {cat.revenueIdr.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-[#D97706]" />
                <h3 className="font-bold text-[#0B241E] text-sm">Pace & Run-Rate APBD 2026</h3>
              </div>
              <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                {padPercentage}% Capaian
              </span>
            </div>

            <div className="mt-4 space-y-3">
              <div className="space-y-1.5">
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-700 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(3, Number(padPercentage)))}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-slate-400">
                  <span>0%</span>
                  <span>25% (Q1)</span>
                  <span>50% (Q2)</span>
                  <span>75% (Q3)</span>
                  <span>100%</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50/80 rounded-xl space-y-2 text-xs border border-slate-100">
                <div className="flex justify-between items-center text-slate-600">
                  <span>Kebutuhan Run-Rate:</span>
                  <span className="font-mono font-bold text-blue-800">
                    Rp {monthlyRunRateNeeded.toLocaleString("id-ID")}/bln
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Sisa Kekurangan:</span>
                  <span className="font-mono font-bold text-amber-700">
                    Rp {sisaTarget.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-200/60 flex justify-between items-center text-[11px]">
                  <span className="text-slate-500">Status Laju Fiskal:</span>
                  <span
                    className={`font-semibold px-2 py-0.5 rounded-full text-[10px] ${
                      isPaceHealthy ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {isPaceHealthy ? "Pace Terjaga" : "Akselerasi e-SKRD"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <Link
              href="/dinas/evaluasi"
              className="w-full py-2 px-3 bg-[#0B241E] hover:bg-[#133D31] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
            >
              <span>Buka Simulasi & Target PAD</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#D97706]" />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
