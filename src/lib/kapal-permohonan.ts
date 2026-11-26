import { API_CONFIG } from "@/config/api.config";
import { estimateVisitCosts, VisitCostEstimateResult } from "@/lib/tariff-estimator";
import { BillingInvoice } from "@/types/billing.types";
import { DockRequest, Vessel, VesselVisit } from "@/types/kapal.types";
import { BerthItem, BerthType } from "@/types/port.types";
import { ShipType, ShippingCategory, TariffItem } from "@/types/tariff.types";

export interface FleetOption {
  id: string;
  numericId: number;
  name: string;
  callSign: string;
  gt: number;
  loa: number;
  draft: number;
  shippingCategory: ShippingCategory;
  shipType: ShipType;
  defaultRoute: string;
}

export interface DestinationPortOption {
  id: number;
  name: string;
  code: string;
  label: string;
}

export const EMPTY_FLEET_OPTION: FleetOption = {
  id: "",
  numericId: 0,
  name: "Belum Ada Kapal",
  callSign: "-",
  gt: 0,
  loa: 0,
  draft: 0,
  shippingCategory: "DALAM_NEGERI",
  shipType: "NIAGA",
  defaultRoute: "-",
};

/**
 * Master fasilitas dermaga Pelabuhan Poumako dengan fallback data resmi Perda No. 4/2023
 */
export const FALLBACK_BERTHS: BerthItem[] = [
  {
    id: 1,
    portId: 1,
    code: "DRM-PEMDA-01",
    name: "Dermaga Beton Nusantara Pemda",
    berthType: "DERMAGA_BESI_BETON_KAYU",
    berthServiceCategory: "DERMAGA_CAMPURAN",
    authorityType: "PEMDA_DISHUB",
    billingEligibility: "BILLABLE",
    maxLengthMeters: 120,
    operationalStatus: "OPEN",
    legalBasis: "Perda Kab. Mimika No. 4 Tahun 2023 Lampiran XI",
    isActive: true,
    createdAt: "",
    updatedAt: "",
  },
  {
    id: 2,
    portId: 1,
    code: "TLD-PEMDA-01",
    name: "Tambatan Talud Cenderawasih",
    berthType: "PINGGIRAN_TALUD",
    berthServiceCategory: "DERMAGA_BARANG",
    authorityType: "PEMDA_DISHUB",
    billingEligibility: "BILLABLE",
    maxLengthMeters: 60,
    operationalStatus: "OPEN",
    legalBasis: "Perda Kab. Mimika No. 4 Tahun 2023 Lampiran XI",
    isActive: true,
    createdAt: "",
    updatedAt: "",
  },
  {
    id: 3,
    portId: 1,
    code: "DOL-PEMDA-01",
    name: "Dolphin Bressing MB Penyeberangan Ferry",
    berthType: "BRESSING_DOLPHIN_PELAMPUNG",
    berthServiceCategory: "DERMAGA_PENUMPANG",
    authorityType: "PEMDA_DISHUB",
    billingEligibility: "BILLABLE",
    maxLengthMeters: 90,
    operationalStatus: "OPEN",
    legalBasis: "Perda Kab. Mimika No. 4 Tahun 2023 Lampiran XI",
    isActive: true,
    createdAt: "",
    updatedAt: "",
  },
  {
    id: 4,
    portId: 1,
    code: "DRM-UPP-01",
    name: "Dermaga UPP Kemenhub (Non-Retribusi Pemda)",
    berthType: "DERMAGA_BESI_BETON_KAYU",
    berthServiceCategory: "DERMAGA_CAMPURAN",
    authorityType: "UPP_KEMENHUB",
    billingEligibility: "NOT_BILLABLE",
    maxLengthMeters: 150,
    operationalStatus: "OPEN",
    legalBasis: "PM Perhubungan No. 36 Tahun 2012",
    isActive: true,
    createdAt: "",
    updatedAt: "",
  },
  {
    id: 5,
    portId: 1,
    code: "DRM-PELRA-01",
    name: "Dermaga Pelabuhan Rakyat Muara Pomako",
    berthType: "DERMAGA_BESI_BETON_KAYU",
    berthServiceCategory: "DERMAGA_BARANG",
    authorityType: "PEMDA_DISHUB",
    billingEligibility: "BILLABLE",
    maxLengthMeters: 50,
    operationalStatus: "OPEN",
    legalBasis: "Perda Kab. Mimika No. 4 Tahun 2023",
    isActive: true,
    createdAt: "",
    updatedAt: "",
  },
  {
    id: 6,
    portId: 1,
    code: "TUKS-LPS-01",
    name: "Dermaga TUKS Logistik Pantai Selatan",
    berthType: "DERMAGA_BESI_BETON_KAYU",
    berthServiceCategory: "DERMAGA_BARANG",
    authorityType: "TUKS_TERSUS",
    billingEligibility: "NOT_BILLABLE",
    maxLengthMeters: 80,
    operationalStatus: "OPEN",
    legalBasis: "Izin Operasional TUKS Kemenhub",
    isActive: true,
    createdAt: "",
    updatedAt: "",
  },
];

export const FALLBACK_DESTINATION_PORTS: DestinationPortOption[] = [
  {
    id: 1,
    name: "Pelabuhan Umum Poumako",
    code: "PMK",
    label: "Pelabuhan Umum Poumako (Dermaga UPTD Pomako)",
  },
  {
    id: 2,
    name: "Pelabuhan Barang & Logistik Poumako",
    code: "PMK-BRG",
    label: "Pelabuhan Barang & Logistik Poumako",
  },
  {
    id: 3,
    name: "Pelabuhan Penumpang & Wisata Bahari Poumako",
    code: "PMK-PAS",
    label: "Pelabuhan Penumpang & Wisata Bahari Poumako",
  },
  {
    id: 4,
    name: "Dermaga UPP Kemenhub Pomako",
    code: "UPP-PMK",
    label: "Dermaga UPP Kemenhub Pomako",
  },
];

/**
 * Dapatkan nama singkat pelabuhan untuk ringkasan rute
 */
export function getPortShortName(fullName: string): string {
  if (fullName.includes("Poumako") || fullName.includes("Pomako")) return "Poumako";
  if (fullName.includes("Dobo")) return "Dobo";
  if (fullName.includes("Agats") || fullName.includes("Asmat")) return "Agats";
  if (fullName.includes("Merauke")) return "Merauke";
  if (fullName.includes("Timika")) return "Timika";
  return fullName;
}

/**
 * Format tanggal lokal ke YYYY-MM-DD
 */
export function formatLocalDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Format jam lokal ke HH:mm
 */
export function formatLocalTime(d: Date): string {
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${min}`;
}

/**
 * Bangun URL penuh untuk berkas dokumen kapal dari backend
 */
export function getPermohonanFileUrl(filePath?: string | null): string | null {
  if (!filePath) return null;
  if (filePath.startsWith("http")) return filePath;
  const normalized = filePath.replace(/\\/g, "/");
  const base = API_CONFIG.BASE_URL.replace(/\/api\/?$/, "");
  return `${base}/${normalized.replace(/^\/+/, "")}`;
}

/**
 * Ubah daftar kapal terverifikasi dari backend menjadi opsi dropdown armada
 */
export function buildVerifiedFleetOptions(vessels: Vessel[]): FleetOption[] {
  return vessels
    .filter((v) => v.verificationStatus === "VERIFIED")
    .map((v) => ({
      id: String(v.id),
      numericId: v.id,
      name: v.name,
      callSign: v.registrationNumber,
      gt: Number(v.grossTonnage) || 500,
      loa: v.lengthMeters || 65.0,
      draft: v.draftMeters || 3.5,
      shippingCategory: (v.shippingCategory || "DALAM_NEGERI") as ShippingCategory,
      shipType: (v.shipType || "NIAGA") as ShipType,
      defaultRoute: "Pelabuhan Dobo ➔ Pelabuhan Poumako",
    }));
}

/**
 * Mapping data kunjungan (VesselVisit) dari backend ke model tampilan DockRequest
 */
export function mapVisitsToDockRequests(params: {
  visits: VesselVisit[];
  invoices: BillingInvoice[];
  tariffs: TariffItem[];
  exchangeRateUsd: number;
}): DockRequest[] {
  const { visits, invoices, tariffs, exchangeRateUsd } = params;

  return visits.map((v) => {
    const gt = v.vessel?.grossTonnage ? Number(v.vessel.grossTonnage) : 500;
    const vesselName = v.vessel?.name || "Kapal Terdaftar";
    const callSign = v.vessel?.registrationNumber || "REG-PMK-001";
    const portName = v.port?.name || "Pelabuhan Poumako, Mimika";
    const routeStr = `${v.originPort || "Pelabuhan Dobo"} ➔ ${v.destinationPort || "Pelabuhan Poumako"}`;

    let status: "submitted" | "verified" | "approved" | "rejected" = "submitted";
    let statusLabel = "Diajukan (Menunggu Review UPT)";

    if (v.status === "APPROVED" || v.status === "BERTHED" || v.status === "DEPARTED") {
      status = "approved";
      statusLabel =
        v.status === "BERTHED"
          ? "Sandar Aktif di Dermaga"
          : v.status === "DEPARTED"
          ? "Pelayanan Selesai"
          : "Alokasi Dermaga Terbit";
    } else if (v.status === "ARRIVED") {
      status = "verified";
      statusLabel = "Tiba di Kolam Labuh (Diverifikasi)";
    } else if (v.status === "REQUESTED") {
      status = "submitted";
      statusLabel = "Diajukan (Menunggu Review UPT)";
    }

    const etaStr =
      new Date(v.eta).toLocaleString("id-ID", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }) + " WIT";

    const etdStr =
      new Date(v.etd).toLocaleString("id-ID", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }) + " WIT";

    const durationHours = Math.max(
      1,
      Math.ceil((new Date(v.etd).getTime() - new Date(v.eta).getTime()) / (1000 * 60 * 60)) || 24
    );

    const visitInvoices = invoices.filter(
      (inv) => inv.visitId === v.id && inv.status !== "VOID"
    );
    const officialInvoice =
      visitInvoices.find((inv) => inv.billingStage === "FINAL_SKRD") ||
      visitInvoices.find((inv) => inv.billingStage === "ADVANCE_SKRD") ||
      visitInvoices.find((inv) => inv.billingStage === "ESTIMATE") ||
      visitInvoices[0] ||
      null;

    const liveEstimate = estimateVisitCosts({
      tariffs,
      exchangeRateUsd,
      grossTonnage: gt,
      durationHours,
      shippingCategory: (v.vessel?.shippingCategory || "DALAM_NEGERI") as ShippingCategory,
      shipType: (v.vessel?.shipType || "NIAGA") as ShipType,
      berthType: v.berthingRecords?.[0]?.berth?.berthType as BerthType | undefined,
      needFreshWater: false,
      waterVolume: 0,
      needShorePower: false,
      powerKwh: 0,
      needWasteDisposal: false,
    });

    return {
      id: v.visitNumber,
      visitId: v.id,
      backendStatus: v.status,
      vesselName,
      callSign,
      gt,
      port: portName,
      route: routeStr,
      activityType: v.activityMode === "NORMAL" ? "Bongkar Muat & Sandar Tambat" : "Labuh & Transit",
      dockType: "Reguler",
      eta: etaStr,
      etd: etdStr,
      durationHours,
      utilities: {
        freshWater: false,
        waterVolume: 0,
        shorePower: false,
        wasteDisposal: false,
      },
      costBreakdown: {
        mooring: liveEstimate.mooring,
        anchorage: liveEstimate.anchorage,
        water: 0,
        power: 0,
        waste: 0,
        total: officialInvoice
          ? Number(officialInvoice.totalAmountIdr)
          : liveEstimate.total,
        labuhFormula: liveEstimate.labuh.formulaNote,
        tambatFormula: liveEstimate.tambat.formulaNote,
      },
      officialInvoice,
      status,
      statusLabel,
      allocatedDock:
        v.berthingRecords?.[0]?.berth?.name ||
        v.notes?.match(/\[Alokasi Dermaga: ([^\]]+)\]/)?.[1] ||
        (v.status === "REQUESTED"
          ? "Menunggu Penetapan Petugas Dermaga"
          : "Dermaga Pelabuhan Poumako"),
      officerNotes: v.notes || "Permohonan terdaftar di sistem backend PORTA.",
      submittedAt: new Date(v.createdAt).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    };
  });
}

/**
 * Bangun objek DockRequest lokal setelah pengajuan baru berhasil disimpan ke backend
 */
export function buildCreatedDockRequest(params: {
  newVisit: VesselVisit;
  activeVessel: FleetOption;
  destinationPort: string;
  derivedRoute: string;
  activityType: string;
  etaDate: string;
  etaTime: string;
  etdDate: string;
  etdTime: string;
  serviceDurationHours: number;
  needFreshWater: boolean;
  waterVolume: number;
  needShorePower: boolean;
  powerKwh: number;
  needWasteDisposal: boolean;
  costs: VisitCostEstimateResult;
}): DockRequest {
  const {
    newVisit,
    activeVessel,
    destinationPort,
    derivedRoute,
    activityType,
    etaDate,
    etaTime,
    etdDate,
    etdTime,
    serviceDurationHours,
    needFreshWater,
    waterVolume,
    needShorePower,
    powerKwh,
    needWasteDisposal,
    costs,
  } = params;

  return {
    id: newVisit.visitNumber,
    visitId: newVisit.id,
    backendStatus: newVisit.status,
    vesselName: activeVessel.name,
    callSign: activeVessel.callSign,
    gt: activeVessel.gt,
    port: destinationPort,
    route: derivedRoute,
    activityType,
    dockType: "Reguler",
    allocatedDock: "Menunggu Penetapan Petugas Dermaga",
    eta: `${etaDate}, ${etaTime} WIT`,
    etd: `${etdDate}, ${etdTime} WIT`,
    durationHours: serviceDurationHours,
    utilities: {
      freshWater: needFreshWater,
      waterVolume: needFreshWater ? waterVolume : 0,
      shorePower: needShorePower,
      powerKwh: needShorePower ? powerKwh : 0,
      wasteDisposal: needWasteDisposal,
    },
    costBreakdown: {
      mooring: costs.mooring,
      anchorage: costs.anchorage,
      water: costs.water,
      power: costs.power,
      waste: costs.waste,
      total: costs.total,
      labuhFormula: costs.labuh.formulaNote,
      tambatFormula: costs.tambat.formulaNote,
    },
    officialInvoice: null,
    status: "submitted",
    statusLabel: "Diajukan (Menunggu Alokasi Dermaga)",
    officerNotes:
      "Permohonan baru berhasil dikirim ke UPT Pelabuhan. Petugas Dermaga akan memverifikasi slot kosong dan menetapkan dermaga sandar.",
    submittedAt: "Hari ini, Baru saja",
  };
}
