/**
 * Definisi Tipe & Kontrak Data untuk Operasional Lapangan Dermaga (PETUGAS_DERMAGA & ADMIN_PELABUHAN)
 * Selaras dengan DTO porta-be: visits, cargo-utility, gate-ticketing, maintenance, daily-reports
 */

// --- Visits Operational Payloads ---
export interface RecordArrivalPayload {
  ataAnchorage: string;
}

export interface StartBerthingPayload {
  berthId: number;
  berthCategory: "UMUM" | "KHUSUS_TUKS";
  actualStartAt: string;
  overrideReason?: string;
  safetyChecklistVerified?: boolean;
  evidenceFile?: File | null;
}

export interface EndBerthingPayload {
  actualEndAt: string;
}

export interface RecordDeparturePayload {
  atdPort: string;
}

// --- Cargo, Equipment & Utilities ---
export type CargoCategory =
  | "IMPOR_EKSPOR"
  | "ANTARPULAU"
  | "BULOG_PUPUK"
  | "HEWAN_TERNAK"
  | "PETI_KEMAS_20FT"
  | "PETI_KEMAS_40FT"
  | "PETI_KEMAS_OVER_40FT";

export type StorageLocationType = "GUDANG_TERTUTUP" | "LAPANGAN_TERBUKA";

export type PortEquipmentType =
  | "CRANE_LISTRIK_DIESEL"
  | "FORKLIFT"
  | "MOTOR_LONG_BOAT"
  | "GEROBAK_DORONG";

export type UtilityType = "AIR_BERSIH" | "LISTRIK";

export interface CreateCargoRecordPayload {
  portId: number;
  visitId?: number;
  cargoCategory: CargoCategory;
  description: string;
  quantity: number;
  unitLabel: string;
  storageLocation?: StorageLocationType;
  durationDays?: number;
  ratePerUnitIdr?: number;
}

export interface CreateEquipmentRentalPayload {
  portId: number;
  visitId?: number;
  equipmentType: PortEquipmentType;
  capacityLabel: string;
  unitCount?: number;
  durationHours: number;
  ratePerHourIdr?: number;
}

export interface CreateUtilityReadingPayload {
  portId: number;
  visitId?: number;
  assetId?: number;
  utilityType: UtilityType;
  meterStart: number;
  meterEnd: number;
  unitLabel: string;
  ratePerUnitIdr?: number;
}

export interface UtilityReadingItem {
  id: number;
  readingNumber: string;
  portId: number;
  visitId?: number | null;
  assetId?: number | null;
  utilityType: UtilityType;
  meterStart: number | string;
  meterEnd: number | string;
  volumeConsumed: number | string;
  unitLabel: string;
  totalAmountIdr: number | string;
  paymentStatus: "UNPAID" | "PAID";
  createdAt: string;
  asset?: { id: number; assetCode: string; name: string } | null;
}

// --- Gate Ticketing, Handovers, Routes & Manifests ---
export interface GateTicketBookItem {
  id: number;
  portId: number;
  bookCode: string;
  ticketCategory: string;
  serialStart: number;
  serialEnd: number;
  nominalPerTicket: number | string;
  status: "STOK" | "ACTIVE" | "HABIS";
  porporasiNumber?: string | null;
}

export interface CreateGateTicketBookPayload {
  portId: number;
  bookCode: string;
  ticketCategory: string;
  serialStart: number;
  serialEnd: number;
  nominalPerTicket: number;
  porporasiNumber?: string;
  porporasiDate?: string;
  legalBasis?: string;
}

export interface GateHandoverItem {
  id: number;
  portId: number;
  bookId: number;
  wardenName: string;
  dispatchedSerialStart: number;
  dispatchedSerialEnd: number;
  lastReturnedSerial?: number | null;
  soldQty?: number | null;
  expectedAmountIdr?: number | string | null;
  actualCashSettledIdr?: number | string | null;
  unmatchedAmountIdr?: number | string | null;
  status: "DISTRIBUTED" | "SETTLED" | "DISCREPANCY";
  notes?: string | null;
  dispatchTime: string;
  settleTime?: string | null;
  book?: GateTicketBookItem;
}

export interface OpenGateHandoverPayload {
  bookId: number;
  wardenName: string;
}

export interface CloseGateHandoverPayload {
  lastReturnedSerial: number;
  actualCashSettledIdr: number;
  notes?: string;
}

export interface FerryRouteItem {
  id: number;
  portId: number;
  destinationName: string;
  distanceMiles: number;
  adultFareIdr: number | string;
  childFareIdr: number | string;
}

export type TerminalClass = "KELAS_A" | "KELAS_B" | "KELAS_C";

export interface VesselManifestItem {
  id: number;
  manifestNumber: string;
  portId: number;
  visitId: number;
  ferryRouteId?: number | null;
  terminalClass: TerminalClass;
  adultCount: number;
  childCount: number;
  infantCount: number;
  greeterCount: number;
  vehicleCount: number;
  cargoTons: number | string;
  notes?: string | null;
  createdAt: string;
  visit?: {
    id: number;
    visitNumber: string;
    vessel?: { name: string };
  };
  ferryRoute?: {
    id: number;
    destinationName: string;
    distanceMiles?: number | null;
  } | null;
}

export interface CreateVesselManifestPayload {
  portId: number;
  visitId: number;
  ferryRouteId?: number;
  terminalClass?: TerminalClass;
  adultCount: number;
  childCount?: number;
  infantCount?: number;
  greeterCount?: number;
  vehicleCount?: number;
  cargoTons?: number;
  notes?: string;
}

// --- Maintenance ---
export type MaintenanceSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type MaintenanceStatus = "REPORTED" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";

export interface MaintenanceTicketItem {
  id: number;
  ticketNumber: string;
  portId: number;
  berthId?: number | null;
  assetId?: number | null;
  severity: MaintenanceSeverity;
  title: string;
  description: string;
  evidencePhoto?: string | null;
  status: MaintenanceStatus;
  assignedTechnician?: string | null;
  resolutionNote?: string | null;
  createdAt: string;
  berth?: { id: number; code: string; name: string } | null;
  asset?: { id: number; assetCode: string; name: string } | null;
}

export interface CreateMaintenanceTicketPayload {
  portId: number;
  berthId?: number;
  assetId?: number;
  severity: MaintenanceSeverity;
  title: string;
  description: string;
  evidenceFile?: File | null;
}

export interface UpdateMaintenanceStatusPayload {
  status: MaintenanceStatus;
  assignedTechnician?: string;
  resolutionNote?: string;
}

// --- Daily Reports ---
export interface DailyReportItemInput {
  visitId?: number;
  berthId?: number;
  vesselNameSnapshot: string;
  registrationNumberSnapshot: string;
  isAdhoc?: boolean;
  notes?: string;
}

export interface DailyPortReportItem {
  id: number;
  reportNumber: string;
  portId: number;
  reportDate: string;
  status: "SUBMITTED" | "ACKNOWLEDGED";
  generalNotes?: string | null;
  createdAt: string;
  items?: DailyReportItemInput[];
  officer?: { id: number; fullName: string };
}

export interface CreateDailyPortReportPayload {
  portId: number;
  reportDate: string;
  generalNotes?: string;
  items: DailyReportItemInput[];
}

export interface PortAssetSummaryItem {
  id: number;
  portId: number;
  assetCode: string;
  name: string;
  assetType: string;
  areaSqm: number | string;
  annualRatePerSqmIdr: number | string;
  status: "AVAILABLE" | "LEASED" | "MAINTENANCE";
  gisCoordinates?: string | null;
}
