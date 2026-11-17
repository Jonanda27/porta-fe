/**
 * Definisi Tipe & Kontrak Data untuk Manajemen Pelabuhan & Dermaga (Ports & Berths)
 * Selaras dengan DTO porta-be (src/modules/ports/dto/ports.dto.ts) & schema.prisma
 */

export type PortCategory = "BARANG" | "PENUMPANG" | "CAMPURAN";

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

export type BillingEligibility =
  | "BILLABLE"
  | "NOT_BILLABLE"
  | "PENDING_VERIFICATION";

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
