import type { BillingInvoice } from "@/types/billing.types";

export interface TrendPoint {
  month: string;
  padRealized: number;
  skrdIssued: number;
  shipVisits: number;
  isCurrent: boolean;
}

export interface ChartCoord {
  x: number;
  y: number;
}

export interface VesselCategoryItem {
  key: string;
  label: string;
  colorBg: string;
  textColor: string;
  borderCls: string;
  bgLight: string;
  visitCount: number;
  revenueIdr: number;
}

/**
 * Format angka rupiah ke bentuk ringkas (M, Jt, Rb) untuk label grafik.
 */
export function formatRupiahCompact(val: number): string {
  if (val >= 1_000_000_000) {
    return `${(val / 1_000_000_000).toFixed(1)} M`;
  }
  if (val >= 1_000_000) {
    return `${Math.round(val / 1_000_000)} Jt`;
  }
  if (val > 0) {
    return `${Math.round(val / 1_000)} Rb`;
  }
  return "0";
}

/**
 * Format total PAD di tengah donut chart (2 desimal untuk Miliar, 1 desimal untuk Juta).
 */
export function formatDonutTotal(val: number): string {
  if (val >= 1_000_000_000) {
    return `${(val / 1_000_000_000).toFixed(2)} M`;
  }
  if (val >= 1_000_000) {
    return `${(val / 1_000_000).toFixed(1)} Jt`;
  }
  return `Rp ${val.toLocaleString("id-ID")}`;
}

/**
 * Pembentuk kurva Bezier halus (Catmull-Rom / Cubic Spline) untuk grafik garis SVG.
 */
export function createSmoothCurvedPath(
  points: ChartCoord[],
  baselineY: number = 145
): { linePath: string; areaPath: string } {
  if (points.length === 0) return { linePath: "", areaPath: "" };
  if (points.length === 1) {
    return { linePath: `M ${points[0].x},${points[0].y}`, areaPath: "" };
  }

  let d = `M ${points[0].x.toFixed(1)},${points[0].y.toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = i > 0 ? points[i - 1] : points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = i < points.length - 2 ? points[i + 2] : p2;

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;

    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
  }

  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];
  const area = `${d} L ${lastPoint.x.toFixed(1)},${baselineY} L ${firstPoint.x.toFixed(1)},${baselineY} Z`;

  return { linePath: d, areaPath: area };
}

/**
 * Agregasi data tren 6 bulan terakhir (Semester II TA 2026) langsung dari data riil faktur e-SKRD.
 */
export function computeMonthlyTrendData(
  invoices: BillingInvoice[],
  selectedPortFilter?: number
): TrendPoint[] {
  const months = [
    { label: "Jun", mIdx: 5, year: 2026 },
    { label: "Jul", mIdx: 6, year: 2026 },
    { label: "Agu", mIdx: 7, year: 2026 },
    { label: "Sep", mIdx: 8, year: 2026 },
    { label: "Okt", mIdx: 9, year: 2026 },
    { label: "Nov", mIdx: 10, year: 2026, isCurrent: true },
  ];

  const sourceInvoices = selectedPortFilter
    ? invoices.filter((inv) => inv.portId === selectedPortFilter)
    : invoices;

  return months.map((m) => {
    let padRealized = 0;
    let skrdIssued = 0;
    let shipVisits = 0;

    sourceInvoices.forEach((inv) => {
      const dateStr = inv.issuedAt || inv.createdAt;
      if (!dateStr) return;
      const d = new Date(dateStr);
      if (d.getFullYear() === m.year && d.getMonth() === m.mIdx) {
        const amt = Number(inv.totalAmountIdr) || 0;
        skrdIssued += amt;
        const isPaid =
          inv.status === "PAID" ||
          inv.payments?.some((p) => p.isVerified);
        if (isPaid) {
          padRealized += amt;
        }
        if (inv.visit) {
          shipVisits += 1;
        }
      }
    });

    return {
      month: m.label,
      padRealized,
      skrdIssued,
      shipVisits,
      isCurrent: Boolean(m.isCurrent),
    };
  });
}
