/**
 * Definisi Tipe & Kontrak Data Modul Port Assets & Leases (Kios, Lahan, Gudang, Utilitas)
 * Mengacu pada Perda Kab. Mimika No. 4 Tahun 2023 & PP No. 35 Tahun 2023
 */

export type PortAssetType =
  | "KIOS"
  | "GUDANG"
  | "LAPAK_TERBUKA"
  | "KANTOR"
  | "ALAT_BERAT"
  | "UTILITAS";

export type PortAssetStatus = "AVAILABLE" | "LEASED" | "MAINTENANCE";

export type BillingEligibility = "BILLABLE" | "PENDING_VERIFICATION" | "NON_BILLABLE";

export type LeaseStatus = "ACTIVE" | "EXPIRED" | "TERMINATED";

export interface PortAsset {
  id: number;
  portId: number;
  assetCode: string;
  name: string;
  assetType: PortAssetType;
  areaSqm: number | string;
  annualRatePerSqmIdr: number | string;
  billingEligibility: BillingEligibility;
  status: PortAssetStatus;
  gisCoordinates?: string | null;
  legalBasis?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AssetLeasePayment {
  id: number;
  leaseId: number;
  idempotencyKey: string;
  periodYear: number;
  amountIdr: number | string;
  paidAt: string;
  recordedById?: number | null;
  createdAt?: string;
}

export interface AssetLease {
  id: number;
  contractNumber: string;
  portId: number;
  assetId: number;
  tenantName: string;
  tenantNpwp?: string | null;
  tenantPhone?: string | null;
  startDate: string;
  endDate: string;
  totalAnnualAmountIdr: number | string;
  status: LeaseStatus;
  createdById: number;
  createdAt: string;
  updatedAt?: string;
  asset?: PortAsset;
  payments?: AssetLeasePayment[];
}

export interface RecordLeasePaymentDto {
  idempotencyKey: string;
  periodYear: number;
  amountIdr: number;
  paidAt: string;
}

export interface CreateAssetLeaseDto {
  assetId: number;
  tenantName: string;
  tenantNpwp?: string;
  tenantPhone?: string;
  startDate: string;
  endDate: string;
}
