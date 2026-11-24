/**
 * Definisi Tipe & Kontrak Data untuk Portal Operasional UPT (ADMIN_PELABUHAN & PETUGAS_DERMAGA)
 * Selaras dengan DTO & Prisma Schema porta-be
 */

export type VerificationStatus = "PENDING" | "VERIFIED" | "REJECTED";

export interface DocumentItem {
  id: number;
  category: string;
  documentNumber?: string | null;
  filePath: string;
  fileName: string;
  mimeType: string;
  verificationStatus: VerificationStatus;
  notes?: string | null;
  createdAt: string;
}

export interface ShipOperatorItem {
  id: number;
  name: string;
  npwp?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  operatorProfile: "REGULAR_SCHEDULED" | "INCIDENTAL";
  verificationStatus: VerificationStatus;
  rejectionReason?: string | null;
  verifiedAt?: string | null;
  isActive: boolean;
  documents?: DocumentItem[];
  createdAt: string;
}

export type VesselRelationshipType = "OWNER" | "AGENT" | "CHARTERER";

export interface OperatorVesselLinkItem {
  id: number;
  operatorId: number;
  vesselId: number;
  relationshipType: VesselRelationshipType;
  verificationStatus: VerificationStatus | "SUSPENDED";
  rejectionReason?: string | null;
  authorizationDocPath?: string | null;
  isActive: boolean;
  operator?: {
    id: number;
    name: string;
    operatorProfile?: "REGULAR_SCHEDULED" | "INCIDENTAL";
    verificationStatus?: VerificationStatus;
  };
}

export interface VesselItem {
  id: number;
  operatorId?: number | null;
  registrationNumber: string;
  imoNumber?: string | null;
  name: string;
  flag: string;
  grossTonnage: number | string;
  shipType: "NIAGA" | "NON_NIAGA";
  vesselCategory: "BARANG" | "PENUMPANG" | "CAMPURAN";
  shippingCategory: "LUAR_NEGERI" | "DALAM_NEGERI" | "PELRA_PERINTIS";
  lengthMeters?: number | string | null;
  draftMeters?: number | string | null;
  verificationStatus: VerificationStatus;
  rejectionReason?: string | null;
  isActive: boolean;
  operator?: { id: number; name: string } | null;
  operatorLinks?: OperatorVesselLinkItem[];
  documents?: DocumentItem[];
  createdAt: string;
}

export interface VerifyEntityPayload {
  status: "VERIFIED" | "REJECTED";
  rejectionReason?: string;
}

export interface TenantItem {
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

export interface VerifyTenantPayload {
  verificationStatus: "VERIFIED" | "REJECTED";
  rejectionReason?: string;
}

export type VisitStatus =
  | "REQUESTED"
  | "APPROVED"
  | "ANCHORED"
  | "BERTHED"
  | "DEPARTED"
  | "BILLED"
  | "SETTLED"
  | "CANCELLED";

export interface BerthingRecordItem {
  id: number;
  portId: number;
  visitId: number;
  berthId: number;
  berthCategory: "UMUM" | "KHUSUS_TUKS";
  compatibilityStatus: "MATCH" | "MISMATCH";
  validationResult: "ALLOW" | "WARNING" | "BLOCK";
  approvalStatus: "AUTO_APPROVED" | "PENDING" | "APPROVED" | "REJECTED";
  overrideReason?: string | null;
  approvalNotes?: string | null;
  actualStartAt: string;
  actualEndAt?: string | null;
  berth?: { id: number; code: string; name: string };
  visit?: {
    id: number;
    visitNumber: string;
    vessel?: { id: number; name: string; vesselCategory: string };
  };
}

export interface ShipVisitItem {
  id: number;
  visitNumber: string;
  portId: number;
  vesselId: number;
  operatorId: number;
  visitOrigin: "OPERATOR_REQUEST" | "OFFICER_INCIDENTAL";
  activityMode: "NORMAL" | "FIXED_ACTIVITY" | "TUKS_TERSUS";
  isTransitOnly: boolean;
  originPort?: string | null;
  destinationPort?: string | null;
  eta: string;
  etd: string;
  ataAnchorage?: string | null;
  atdPort?: string | null;
  status: VisitStatus;
  notes?: string | null;
  vessel?: VesselItem;
  operator?: { id: number; name: string };
  port?: { id: number; code: string; name: string };
  berthings?: BerthingRecordItem[];
  createdAt: string;
}

export interface ApproveBerthingOverridePayload {
  decision: "APPROVED" | "REJECTED";
  approvalNotes?: string;
}

export type LeaseStatus =
  | "REQUESTED"
  | "DRAFT"
  | "ACTIVE"
  | "REJECTED"
  | "EXPIRED"
  | "TERMINATED";

export interface AssetLeaseItem {
  id: number;
  contractNumber: string;
  portId: number;
  assetId: number;
  tenantId?: number | null;
  tenantName: string;
  tenantNpwp?: string | null;
  tenantPhone?: string | null;
  startDate: string;
  endDate: string;
  totalAnnualAmountIdr: number | string;
  status: LeaseStatus;
  rejectionReason?: string | null;
  asset?: {
    id: number;
    assetCode: string;
    name: string;
    assetType: string;
    areaSqm: number | string;
  };
  tenant?: TenantItem | null;
  createdAt: string;
}

export interface RejectAssetLeasePayload {
  rejectionReason: string;
}

export interface RevenueSummaryResponse {
  vesselRevenueIdr: number;
  gateTicketingRevenueIdr: number;
  assetLeaseRevenueIdr: number;
  cargoEquipmentRevenueIdr: number;
  utilityRevenueIdr: number;
  totalVerifiedRevenueIdr: number;
  outstandingReceivablesIdr?: number;
  unbilledVisitsCount?: number;
}

export interface WarningItem {
  id: number;
  warningNumber: string;
  portId: number;
  level: "TEGURAN_1" | "TEGURAN_2" | "TEGURAN_3";
  status: "SENT" | "RESOLVED";
  notes?: string | null;
  createdAt: string;
  operator?: { id: number; name: string };
  invoice?: { id: number; documentNumber: string; totalAmountIdr: number | string };
}

export interface IssueWarningPayload {
  invoiceId: number;
  warningLevel: "TEGURAN_1" | "TEGURAN_2" | "TEGURAN_3";
  message: string;
}

export interface UptInvoiceItem {
  id: number;
  documentNumber: string;
  visitId: number;
  billingStage: "ESTIMATE" | "ADVANCE_SKRD" | "FINAL_SKRD" | "ADJUSTMENT_SKRD";
  collectionInstrument: "KARCIS" | "SKRD";
  totalAmountIdr: number | string;
  status: "DRAFT" | "ISSUED" | "PARTIAL" | "PAID" | "OVERPAID" | "VOID";
  dueDate?: string | null;
  operator?: { id: number; name: string };
  visit?: { id: number; visitNumber: string; portId: number };
}

export interface AuditLogItem {
  id: number;
  actorId?: number | null;
  action: string;
  entityName: string;
  entityId?: number | null;
  createdAt: string;
  actor?: {
    id: number;
    email: string;
    fullName: string;
    role: string;
  } | null;
}
