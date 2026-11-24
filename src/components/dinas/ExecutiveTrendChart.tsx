import { useState } from "react";
import { Calendar, TrendingUp } from "lucide-react";
import {
  TrendPoint,
  createSmoothCurvedPath,
  formatRupiahCompact,
} from "@/lib/dinas-dashboard";

interface ExecutiveTrendChartProps {
  trendData: TrendPoint[];
}

/**
 * Grafik garis tren realisasi PAD Kasda vs nilai ketetapan e-SKRD & trafik kunjungan kapal.
 */
export function ExecutiveTrendChart({ trendData }: ExecutiveTrendChartProps) {
  const [activeChartMetric, setActiveChartMetric] = useState<"revenue" | "traffic">("revenue");
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);

  const maxRevenueVal = Math.max(
    ...trendData.map((d) => Math.max(d.padRealized, d.skrdIssued)),
    1_000_000
  );
  const maxLineRev = Math.max(
    Math.ceil((maxRevenueVal * 1.3) / 10_000_000) * 10_000_000,
    10_000_000
  );
  const maxVisitsVal = Math.max(...trendData.map((d) => d.shipVisits), 4);
  const maxLineVisits = Math.ceil(maxVisitsVal * 1.35);

  const baselineY = 145;
  const chartHeight = 110;
  const startX = 75;
  const endX = 765;
  const widthSpan = endX - startX;
  const xDenominator = Math.max(1, trendData.length - 1);

  const calcY = (value: number, maxVal: number) =>
    Math.min(baselineY, Math.max(15, baselineY - (value / maxVal) * chartHeight));

  const rawPointsRealized = trendData.map((d, i) => ({
    x: startX + i * (widthSpan / xDenominator),
    y: calcY(d.padRealized, maxLineRev),
  }));
  const { linePath: linePathRealized, areaPath: areaPathRealized } = createSmoothCurvedPath(
    rawPointsRealized,
    baselineY
  );

  const rawPointsIssued = trendData.map((d, i) => ({
    x: startX + i * (widthSpan / xDenominator),
    y: calcY(d.skrdIssued, maxLineRev),
  }));
  const { linePath: linePathIssued } = createSmoothCurvedPath(rawPointsIssued, baselineY);

  const rawPointsVisits = trendData.map((d, i) => ({
    x: startX + i * (widthSpan / xDenominator),
    y: calcY(d.shipVisits, maxLineVisits),
  }));
  const { linePath: linePathVisits, areaPath: areaPathVisits } = createSmoothCurvedPath(
    rawPointsVisits,
    baselineY
  );

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 border border-[#E2E8F0] shadow-xs space-y-4 sm:space-y-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0B241E] to-[#164336] text-white flex items-center justify-center font-bold shadow-xs shrink-0">
            <TrendingUp className="w-5 h-5 text-[#D97706]" />
          </div>
          <div>
            <h3 className="font-bold text-[#0B241E] text-sm sm:text-base flex flex-wrap items-center gap-2">
              <span>Grafik Garis: Tren Realisasi PAD Kasda & Trafik Maritim</span>
              <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                Live Data
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Fluktuasi kronologis setoran pembayaran sah (RKUD Papua) vs nilai ketetapan tagihan e-SKRD
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 w-full md:w-auto text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveChartMetric("revenue")}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer text-center ${
              activeChartMetric === "revenue"
                ? "bg-white text-[#0B241E] font-bold shadow-xs border border-slate-200/60"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Penerimaan PAD (Rp)
          </button>
          <button
            type="button"
            onClick={() => setActiveChartMetric("traffic")}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer text-center ${
              activeChartMetric === "traffic"
                ? "bg-white text-[#0B241E] font-bold shadow-xs border border-slate-200/60"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Kunjungan Kapal (Call)
          </button>
        </div>
      </div>

      <div className="relative w-full overflow-x-auto pb-1">
        <div className="min-w-[540px] sm:min-w-0 relative">
        <svg className="w-full h-40 sm:h-44 select-none" viewBox="0 0 800 170" preserveAspectRatio="none">
          <defs>
            <linearGradient id="lineFillGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#059669" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="trafficFillGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563EB" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {[0, 1, 2, 3].map((step) => {
            const yPos = 25 + (120 / 3) * step;
            const ratio = (3 - step) / 3;
            const yLabel =
              activeChartMetric === "revenue"
                ? formatRupiahCompact(maxLineRev * ratio)
                : `${Math.round(maxLineVisits * ratio)}`;

            return (
              <g key={step}>
                <line
                  x1={startX}
                  y1={yPos}
                  x2={endX}
                  y2={yPos}
                  stroke="#F1F5F9"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={startX - 12}
                  y={yPos + 3.5}
                  textAnchor="end"
                  className="text-[10px] font-sans font-medium fill-slate-400 select-none"
                >
                  {yLabel}
                </text>
              </g>
            );
          })}

          {trendData.map((d, i) => {
            const xPos = startX + i * (widthSpan / xDenominator);
            return (
              <g key={d.month}>
                <line x1={xPos} y1="25" x2={xPos} y2={baselineY} stroke="#F8FAFC" strokeWidth="1" />
                <text
                  x={xPos}
                  y="162"
                  textAnchor="middle"
                  className={`text-[11px] font-sans select-none ${
                    d.isCurrent ? "fill-emerald-800 font-extrabold" : "fill-slate-500 font-medium"
                  }`}
                >
                  {d.month}
                </text>
                {d.isCurrent && <circle cx={xPos} cy="168" r="1.5" fill="#059669" />}
              </g>
            );
          })}

          {activeChartMetric === "revenue" ? (
            <>
              <path d={areaPathRealized} fill="url(#lineFillGradient)" />
              <path
                d={linePathIssued}
                fill="none"
                stroke="#2563EB"
                strokeWidth="1.75"
                strokeDasharray="4 4"
              />
              <path
                d={linePathRealized}
                fill="none"
                stroke="#059669"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </>
          ) : (
            <>
              <path d={areaPathVisits} fill="url(#trafficFillGradient)" />
              <path
                d={linePathVisits}
                fill="none"
                stroke="#2563EB"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </>
          )}

          {trendData.map((d, i) => {
            const xPos = startX + i * (widthSpan / xDenominator);
            const yPos =
              activeChartMetric === "revenue"
                ? calcY(d.padRealized, maxLineRev)
                : calcY(d.shipVisits, maxLineVisits);
            const isHovered = hoveredPointIndex === i;
            const pointColor = activeChartMetric === "revenue" ? "#059669" : "#2563EB";

            return (
              <g
                key={d.month}
                className="cursor-pointer transition-transform"
                onMouseEnter={() => setHoveredPointIndex(i)}
                onMouseLeave={() => setHoveredPointIndex(null)}
              >
                {d.isCurrent && (
                  <circle cx={xPos} cy={yPos} r="7" fill={pointColor} opacity="0.2" className="animate-pulse" />
                )}
                {isHovered && <circle cx={xPos} cy={yPos} r="8" fill={pointColor} opacity="0.15" />}
                <circle
                  cx={xPos}
                  cy={yPos}
                  r={isHovered ? "5" : d.isCurrent ? "4.5" : "3.5"}
                  fill={pointColor}
                  stroke="#FFFFFF"
                  strokeWidth={d.isCurrent ? "2" : "1.5"}
                  className="transition-all duration-150"
                />
              </g>
            );
          })}
        </svg>

        {hoveredPointIndex !== null && trendData[hoveredPointIndex] && (
          <div
            className="absolute top-2 bg-[#0B241E] text-white p-3 rounded-xl shadow-xl text-xs z-20 pointer-events-none transition-all duration-150 border border-[#164336]"
            style={{
              left: `${Math.min(70, Math.max(6, (hoveredPointIndex / xDenominator) * 74))}%`,
            }}
          >
            <div className="flex items-center gap-2 pb-1.5 border-b border-[#164336] font-mono font-bold text-[#D97706]">
              <Calendar className="w-3.5 h-3.5" />
              <span>
                Periode {trendData[hoveredPointIndex].month} 2026{" "}
                {trendData[hoveredPointIndex].isCurrent ? "(Bulan Berjalan)" : "(Riil Transaksi)"}
              </span>
            </div>
            {activeChartMetric === "revenue" ? (
              <div className="mt-2 space-y-1 font-mono text-[11px]">
                <div className="flex justify-between gap-5 text-emerald-400">
                  <span>PAD Masuk Kasda:</span>
                  <strong className="text-white">
                    Rp {trendData[hoveredPointIndex].padRealized.toLocaleString("id-ID")}
                  </strong>
                </div>
                <div className="flex justify-between gap-5 text-blue-400">
                  <span>Ketetapan e-SKRD:</span>
                  <strong className="text-white">
                    Rp {trendData[hoveredPointIndex].skrdIssued.toLocaleString("id-ID")}
                  </strong>
                </div>
              </div>
            ) : (
              <div className="mt-2 space-y-1 font-mono text-[11px]">
                <div className="flex justify-between gap-5 text-blue-400">
                  <span>Volume Trafik:</span>
                  <strong className="text-white">
                    {trendData[hoveredPointIndex].shipVisits} Kapal Sandar
                  </strong>
                </div>
              </div>
            )}
          </div>
        )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-3.5 border-t border-slate-100 text-xs">
        <div className="flex items-center gap-4">
          {activeChartMetric === "revenue" ? (
            <>
              <div className="flex items-center gap-2">
                <span className="w-4 h-1 bg-emerald-600 rounded-full" />
                <span className="font-semibold text-slate-700">Realisasi Setoran Kasda (Sah)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-0.5 border-b-2 border-dashed border-blue-600" />
                <span className="font-semibold text-slate-700">Nilai Penetapan e-SKRD</span>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <span className="w-4 h-1 bg-blue-600 rounded-full" />
              <span className="font-semibold text-slate-700">Frekuensi Kunjungan Kapal (Call)</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
