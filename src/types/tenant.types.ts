import { DocumentItem, VerificationStatus } from "@/types/upt.types";

/**
 * Definisi Tipe & Kontrak Data untuk Portal Tenant & Mitra Usaha
 * Selaras dengan DTO porta-be: auth, assets-leases, cargo-utility
 */

export interface RegisterTenantPayload {
  email: string;
  password: string;
  fullName: string;
  businessName: string;
  npwp?: string;
  nib?: string;
  phone?: string;
  address?: string;
}

export interface TenantProfile {
  id: number;
  name: string;
  npwp?: string | null;
  nib?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  verificationStatus: VerificationStatus;
  rejectionReason?: string | null;
  verifiedAt?: string | null;
  isActive: boolean;
  documents?: DocumentItem[];
  createdAt: string;
}

export interface PortAssetCatalogItem {
  id: number;
  portId: number;
  assetCode: string;
  name: string;
  assetType: string;
  areaSqm: number | string;
  annualRatePerSqmIdr: number | string;
  billingEligibility: "BILLABLE" | "NOT_BILLABLE" | "PENDING_VERIFICATION";
  status: "AVAILABLE" | "LEASED" | "MAINTENANCE";
  gisCoordinates?: string | null;
  legalBasis?: string | null;
}

export interface RequestLeasePayload {
  assetId: number;
  startDate: string;
  endDate: string;
}

export interface AssetLeasePaymentItem {
  id: number;
  leaseId: number;
  idempotencyKey: string;
  periodYear: number;
  amountIdr: number | string;
  paidAt: string;
  createdAt: string;
}

export interface TenantLeaseItem {
  id: number;
  contractNumber: string;
  portId: number;
  assetId: number;
  tenantId?: number | null;
  tenantName: string;
  startDate: string;
  endDate: string;
  totalAnnualAmountIdr: number | string;
  status: "REQUESTED" | "DRAFT" | "ACTIVE" | "REJECTED" | "EXPIRED" | "TERMINATED";
  rejectionReason?: string | null;
  asset?: PortAssetCatalogItem;
  payments?: AssetLeasePaymentItem[];
  createdAt: string;
}

export type TenantDocumentCategory = "SIUPAL_NIB" | "NPWP" | "LAINNYA";

export interface LeasePaymentReceiptPayload {
  documentTitle: string;
  subTitle: string;
  ssrdNumber: string;
  contractNumber: string;
  paymentDate: string;
  taxPeriod: string;
  portName: string;
  portLocation: string;
  taxPayer: {
    tenantName: string;
    tenantNpwp: string;
    tenantPhone: string;
    businessName: string;
    address: string;
  };
  retributionObject: {
    assetCode: string;
    assetName: string;
    assetType: string;
    areaSqm: number;
    annualRatePerSqmIdr: number;
    legalBasis: string;
    revenueAccountCode: string;
  };
  paymentDetails: {
    totalAnnualContractIdr: number;
    periodYear: number;
    amountPaidIdr: number;
    idempotencyKey: string;
    paymentStatus: string;
    verifiedByName: string;
    verifiedAt: string;
  };
  qrValidationCode: string;
}

export interface UtilityReceiptPayload {
  documentTitle: string;
  subTitle: string;
  ssrdNumber: string;
  readingNumber: string;
  paymentDate: string;
  portName: string;
  portLocation: string;
  taxPayer: {
    tenantName: string;
    tenantNpwp: string;
    businessName: string;
  };
  retributionObject: {
    utilityType: string;
    assetCode: string;
    assetName: string;
    meterStart: number;
    meterEnd: number;
    volumeConsumed: number;
    unitLabel: string;
    ratePerUnitIdr: number;
    legalBasis: string;
    revenueAccountCode: string;
  };
  paymentDetails: {
    totalAmountIdr: number;
    paymentStatus: string;
    paidAt?: string;
    idempotencyKey: string;
    recordedByName: string;
  };
  qrValidationCode: string;
}

export type ReceiptModalData =
  | { type: "LEASE_PAYMENT"; data: LeasePaymentReceiptPayload }
  | { type: "UTILITY"; data: UtilityReceiptPayload };

