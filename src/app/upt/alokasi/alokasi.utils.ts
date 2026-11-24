export type AlokasiTabType = "visits" | "overrides" | "leases";

export interface AlokasiBerthOption {
  id: number;
  code: string;
  name: string;
  authorityType: string;
  maxLengthMeters?: number | string | null;
  operationalStatus?: string;
  berthServiceCategory?: string;
}

export function formatVisitSchedule(dateStr: string): string {
  return new Date(dateStr).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatCompactSchedule(dateStr: string): string {
  const date = new Date(dateStr);
  const datePart = date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  const timePart = date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  return `${datePart}, ${timePart}`;
}

export function formatTimeOnly(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jayapura",
  });
}

export function isBerthCategoryCompatible(
  vesselCategory?: string | null,
  berthServiceCategory?: string | null
): boolean {
  if (!vesselCategory || !berthServiceCategory) return true;
  if (berthServiceCategory === "DERMAGA_CAMPURAN") return true;
  if (vesselCategory === "BARANG") return berthServiceCategory === "DERMAGA_BARANG";
  if (vesselCategory === "PENUMPANG") return berthServiceCategory === "DERMAGA_PENUMPANG";
  return false;
}

export function formatBerthServiceCategory(cat?: string | null): string {
  if (cat === "DERMAGA_BARANG") return "Dermaga Barang";
  if (cat === "DERMAGA_PENUMPANG") return "Dermaga Penumpang";
  if (cat === "DERMAGA_CAMPURAN") return "Dermaga Campuran";
  return cat || "-";
}

export function paginateItems<T>(items: T[], currentPage: number, itemsPerPage: number): T[] {
  const start = (currentPage - 1) * itemsPerPage;
  return items.slice(start, start + itemsPerPage);
}
