/**
 * Definisi Tipe & Kontrak Data untuk Manajemen Pelabuhan & Dermaga (Ports & Berths)
 * Selaras dengan DTO porta-be (src/modules/ports/dto/ports.dto.ts) & schema.prisma
 */

export type PortCategory = "BARANG" | "PENUMPANG" | "CAMPURAN" | "KHUSUS";

export type BerthType =
  | "DERMAGA_BESI_BETON_KAYU"
  | "BRESSING_DOLPHIN_PELAMPUNG"
  | "PINGGIRAN_TALUD";

export type BerthServiceCategory =
  | "DERMAGA_BARANG"
  | "DERMAGA_PENUMPANG"
  | "DERMAGA_CAMPURAN";

export type BerthOperationalStatus = "OPEN" | "CLOSED" | "MAINTENANCE";

export type AuthorityType = "PEMDA_DISHUB" | "UPP_KEMENHUB" | "TUKS_TERSUS";
export type BerthAuthorityType = AuthorityType;

export type BillingEligibility =
  | "BILLABLE"
  | "NOT_BILLABLE"
  | "PENDING_VERIFICATION";
export type BerthBillingEligibility = BillingEligibility;

export interface BerthItem {
  id: number;
  portId: number;
  code: string;
  name: string;
  berthType: BerthType;
  berthServiceCategory: BerthServiceCategory;
  operationalStatus: BerthOperationalStatus;
  authorityType: AuthorityType;
  billingEligibility: BillingEligibility;
  legalBasis?: string | null;
  managementEvidence?: string | null;
  maxLengthMeters?: number | string | null;
  maxDraftMeters?: number | string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type Berth = BerthItem;

export interface PortItem {
  id: number;
  code: string;
  name: string;
  location?: string | null;
  portCategory: PortCategory;
  isActive: boolean;
  berths?: BerthItem[];
  createdAt?: string;
  updatedAt?: string;
}

export type Port = PortItem;

export interface CreatePortPayload {
  code: string;
  name: string;
  location?: string;
  portCategory?: PortCategory;
}

export interface UpdatePortPayload {
  name?: string;
  location?: string;
  portCategory?: PortCategory;
  isActive?: boolean;
}

export interface CreateBerthPayload {
  portId: number;
  code: string;
  name: string;
  berthType: BerthType;
  berthServiceCategory?: BerthServiceCategory;
  operationalStatus?: BerthOperationalStatus;
  authorityType: AuthorityType;
  billingEligibility?: BillingEligibility;
  legalBasis?: string;
  managementEvidence?: string;
  maxLengthMeters?: number;
  maxDraftMeters?: number;
}

export interface UpdateBerthPayload {
  name?: string;
  berthServiceCategory?: BerthServiceCategory;
  operationalStatus?: BerthOperationalStatus;
  maxLengthMeters?: number;
  maxDraftMeters?: number;
  isActive?: boolean;
}

export type TerminalType =
  | "BARANG"
  | "PENUMPANG"
  | "MULTIPURPOSE"
  | "RORO_FERRY"
  | "PELRA"
  | "KHUSUS_TUKS";

export type TerminalClass = "KELAS_A" | "KELAS_B" | "KELAS_C";

export type ZoneType =
  | "LAPANGAN_PENUMPUKAN"
  | "GUDANG_KAWASAN"
  | "RUANG_TUNGGU"
  | "AREA_PARKIR"
  | "AREA_DERMAGA"
  | "PERAIRAN_KOLAM"
  | "LAINNYA";

export type FacilityConditionStatus =
  | "GOOD"
  | "MINOR_DAMAGE"
  | "MAJOR_DAMAGE"
  | "UNDER_MAINTENANCE"
  | "INACTIVE";

export interface PortTerminalItem {
  id: number;
  portId: number;
  code: string;
  name: string;
  terminalType: TerminalType;
  terminalClass: TerminalClass;
  description?: string | null;
  isActive: boolean;
  berths?: BerthItem[];
  zones?: PortZoneItem[];
  facilities?: PortFacilityItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface PortZoneItem {
  id: number;
  portId: number;
  terminalId?: number | null;
  berthId?: number | null;
  code: string;
  name: string;
  zoneType: ZoneType;
  areaSqm?: number | string | null;
  description?: string | null;
  isActive: boolean;
  terminal?: { id: number; code: string; name: string } | null;
  berth?: { id: number; code: string; name: string } | null;
  facilities?: PortFacilityItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface PortFacilityItem {
  id: number;
  portId: number;
  terminalId?: number | null;
  berthId?: number | null;
  zoneId?: number | null;
  code: string;
  name: string;
  facilityType: string;
  conditionStatus: FacilityConditionStatus;
  specifications?: Record<string, unknown> | null;
  isActive: boolean;
  terminal?: { id: number; code: string; name: string } | null;
  berth?: { id: number; code: string; name: string } | null;
  zone?: { id: number; code: string; name: string } | null;
  createdAt?: string;
  updatedAt?: string;
}


export interface BerthScheduleSlot {
  berthingId: number;
  visitId: number;
  visitNumber: string;
  vesselName: string;
  operatorName: string;
  startAt: string;
  endAt: string;
  status: "ACTIVE" | "PLANNED" | "COMPLETED" | "PENDING_OVERRIDE";
}

export interface BerthFreeSlot {
  startAt: string;
  endAt: string;
}

export interface BerthScheduleItem {
  berth: {
    id: number;
    code: string;
    name: string;
    authorityType: string;
    operationalStatus: string;
    berthServiceCategory: BerthServiceCategory;
    maxLengthMeters: number | null;
  };
  occupiedSlots: BerthScheduleSlot[];
  freeSlots: BerthFreeSlot[];
}

export interface PortBerthsScheduleResponse {
  portId: number;
  date: string;
  dayStart: string;
  dayEnd: string;
  berths: BerthScheduleItem[];
}

export type BerthAuthorityFilter = "ALL" | "PEMDA_DISHUB" | "UPP_KEMENHUB" | "TUKS_TERSUS";
export type BerthServiceCategoryFilter = "ALL" | BerthServiceCategory;
export type BerthOperationalStatusFilter = "ALL" | BerthOperationalStatus;
