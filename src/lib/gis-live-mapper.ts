import { POUMAKO_DEFAULT_CENTER } from "@/lib/gis-layers";
import {
  AisVesselTelemetry,
  GisAssetPoint,
  GisBerthPoint,
} from "@/types/gis.types";
import { BerthItem, BerthScheduleItem } from "@/types/port.types";
import { AssetLeaseItem, ShipVisitItem, VesselItem } from "@/types/upt.types";

function parseGisCoords(raw?: string | null): { lat: number; lng: number } | null {
  if (!raw) return null;
  const parts = raw.split(",").map((s) => Number(s.trim()));
  if (parts.length !== 2 || parts.some((n) => !Number.isFinite(n))) {
    return null;
  }
  return { lat: parts[0], lng: parts[1] };
}

const POUMAKO_WATERFRONT_BERTH_SLOTS: Record<
  string,
  { lat: number; lng: number; bearingDeg: number }
> = {
  "DOL-PEMDA-01": { lat: -4.8045, lng: 136.7675, bearingDeg: 112 },
  "DRM-PEMDA-01": { lat: -4.8041, lng: 136.7685, bearingDeg: 25 },
  "DRM-PELRA-01": { lat: -4.8019, lng: 136.7684, bearingDeg: 112 },
  "DRM-UPP-01": { lat: -4.8027, lng: 136.7691, bearingDeg: 25 },
  "TLD-PEMDA-01": { lat: -4.7979, lng: 136.7724, bearingDeg: 128 },
  "TUKS-MIMIKA-01": { lat: -4.7982, lng: 136.7707, bearingDeg: 35 },
};

const FALLBACK_WATERFRONT_SLOTS = Object.values(POUMAKO_WATERFRONT_BERTH_SLOTS);

/**
 * Memetakan data dermaga & jadwal sandar asli dari backend ke titik GIS Poumako.
 */
export function mapLiveBerthsToGis(
  berths: BerthItem[],
  schedule: BerthScheduleItem[]
): GisBerthPoint[] {
  return berths.map((berth, index) => {
    const slotMatch = schedule.find((s) => s.berth.id === berth.id);
    const activeSlot = slotMatch?.occupiedSlots.find((o) => o.status === "ACTIVE");
    const waterfrontSlot =
      POUMAKO_WATERFRONT_BERTH_SLOTS[berth.code] ??
      FALLBACK_WATERFRONT_SLOTS[index % FALLBACK_WATERFRONT_SLOTS.length];

    const authorityType: GisBerthPoint["authorityType"] =
      berth.authorityType === "UPP_KEMENHUB" || berth.authorityType === "TUKS_TERSUS"
        ? berth.authorityType
        : "PEMDA_DISHUB";

    const operationalStatus: GisBerthPoint["operationalStatus"] =
      berth.operationalStatus === "MAINTENANCE" || berth.operationalStatus === "CLOSED"
        ? berth.operationalStatus
        : "OPEN";

    return {
      id: berth.id,
      code: berth.code,
      name: berth.name,
      authorityType,
      operationalStatus,
      maxLengthMeters: Number(berth.maxLengthMeters || 100),
      currentVesselName: activeSlot?.vesselName,
      lat: waterfrontSlot.lat,
      lng: waterfrontSlot.lng,
      bearingDeg: waterfrontSlot.bearingDeg,
    };
  });
}

/**
 * Memetakan data kontrak sewa aset/kios asli ke titik GIS (membaca gisCoordinates jika tersedia).
 */
export function mapLiveLeasesToGisAssets(leases: AssetLeaseItem[]): GisAssetPoint[] {
  const uniqueByAsset = new Map<number, AssetLeaseItem>();
  leases.forEach((lease) => {
    if (lease.asset?.id && !uniqueByAsset.has(lease.asset.id)) {
      uniqueByAsset.set(lease.asset.id, lease);
    }
  });

  return Array.from(uniqueByAsset.values()).map((lease, idx) => {
    const parsed = parseGisCoords(
      (lease.asset as { gisCoordinates?: string | null } | undefined)?.gisCoordinates
    );
    const fallbackLat = POUMAKO_DEFAULT_CENTER.lat - 0.0018 + (idx % 4) * 0.0012;
    const fallbackLng = POUMAKO_DEFAULT_CENTER.lng + 0.0016 + Math.floor(idx / 4) * 0.001;

    const rawType = (lease.asset?.assetType || "KIOS").toUpperCase();
    const assetType: GisAssetPoint["assetType"] = rawType.includes("GUDANG")
      ? "GUDANG"
      : rawType.includes("LAHAN")
        ? "LAHAN"
        : "KIOS";

    return {
      id: lease.asset?.id || lease.id,
      code: lease.asset?.assetCode || lease.contractNumber,
      name: lease.asset?.name || `Aset ${lease.contractNumber}`,
      assetType,
      status: lease.status === "ACTIVE" ? "LEASED" : "AVAILABLE",
      tenantName: lease.tenant?.name,
      areaSqm: Number(lease.asset?.areaSqm || 24),
      annualRateIdr: Number(lease.totalAnnualAmountIdr || 0),
      lat: parsed?.lat ?? fallbackLat,
      lng: parsed?.lng ?? fallbackLng,
    };
  });
}

/**
 * Mencocokkan kapal AIS live dengan daftar kunjungan & kapal terdaftar di PORTA (anti-kebocoran PAD).
 */
export function enrichAisVesselCompliance(
  vessel: AisVesselTelemetry,
  visits: ShipVisitItem[],
  registeredVessels: VesselItem[]
): AisVesselTelemetry {
  if (vessel.isSimulated) return vessel;

  const normalizedAisName = vessel.shipName.replace(/[^A-Z0-9]/gi, "").toUpperCase();

  const matchedVisit = visits.find((visit) => {
    if (
      visit.status !== "ANCHORED" &&
      visit.status !== "BERTHED" &&
      visit.status !== "REQUESTED" &&
      visit.status !== "BILLED"
    ) {
      return false;
    }
    const visitName = (visit.vessel?.name || "")
      .replace(/[^A-Z0-9]/gi, "")
      .toUpperCase();
    return visitName.length > 3 && normalizedAisName.includes(visitName);
  });

  const matchedRegistered = registeredVessels.some((rv) => {
    const rvName = rv.name.replace(/[^A-Z0-9]/gi, "").toUpperCase();
    return rvName.length > 3 && normalizedAisName.includes(rvName);
  });

  if (matchedVisit) {
    return {
      ...vessel,
      complianceStatus: "REGISTERED",
      skrdNumber: matchedVisit.visitNumber,
    };
  }

  return {
    ...vessel,
    complianceStatus: matchedRegistered ? "REGISTERED" : "UNREGISTERED",
  };
}
