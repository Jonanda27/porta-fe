/**
 * Tipe Data Terpusat Fasilitas Pelabuhan & Dermaga (Ports & Berths)
 * 
 * Sesuai skema database prisma & module ports di porta-be
 */

export type PortCategory = "CAMPURAN" | "PENUMPANG" | "BARANG" | "KHUSUS";

export type BerthType =
  | "DERMAGA_BESI_BETON_KAYU"
  | "PINGGIRAN_TALUD"
  | "BRESSING_DOLPHIN_PELAMPUNG";

export type BerthServiceCategory =
  | "DERMAGA_CAMPURAN"
  | "DERMAGA_PENUMPANG"
  | "DERMAGA_BARANG";

export type BerthOperationalStatus = "OPEN" | "MAINTENANCE" | "CLOSED";

export type BerthAuthorityType =
  | "PEMDA_DISHUB"
  | "UPP_KEMENHUB"
  | "TUKS_TERSUS";

export type BerthBillingEligibility = "BILLABLE" | "NOT_BILLABLE";

export interface Berth {
  id: number;
  portId: number;
  code: string;
  name: string;
  berthType: BerthType;
  berthServiceCategory: BerthServiceCategory;
  operationalStatus: BerthOperationalStatus;
  authorityType: BerthAuthorityType;
  billingEligibility: BerthBillingEligibility;
  legalBasis: string;
  managementEvidence?: string | null;
  maxLengthMeters?: string | number | null;
  maxDraftMeters?: string | number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Port {
  id: number;
  code: string;
  name: string;
  location: string;
  portCategory: PortCategory;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  berths?: Berth[];
}
