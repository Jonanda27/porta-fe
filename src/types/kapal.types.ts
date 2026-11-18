/**
 * Definisi Tipe & Kontrak Data Modul Kapal & Operator Pelayaran
 */

import { BillingInvoice } from "./billing.types";

export interface OperatorDocument {
  id: number;
  operatorId?: number;
  vesselId?: number | null;
  category: "SIUPAL_NIB" | "NPWP" | "SURAT_UKUR" | "PAS_BESAR_KECIL" | "LAINNYA";
  documentNumber: string;
  filePath: string;
  fileName: string;
  mimeType: string;
  verificationStatus: "PENDING" | "VERIFIED" | "REJECTED";
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ShipOperator {
  id: number;
  name: string;
  npwp: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  operatorProfile: "REGULAR_SCHEDULED" | "INCIDENTAL";
  verificationStatus: "PENDING" | "VERIFIED" | "REJECTED";
  rejectionReason?: string | null;
  verifiedAt?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  documents?: OperatorDocument[];
}

export interface Vessel {
  id: number;
  operatorId: number;
  registrationNumber: string;
  imoNumber?: string | null;
  name: string;
  flag: string;
  grossTonnage: number | string;
  lengthMeters?: number | null;
  draftMeters?: number | null;
  shipType: "NIAGA" | "NON_NIAGA";
  vesselCategory: "BARANG" | "PENUMPANG" | "CAMPURAN";
  shippingCategory: "LUAR_NEGERI" | "DALAM_NEGERI" | "PELRA_PERINTIS";
  verificationStatus: "PENDING" | "VERIFIED" | "REJECTED";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  operator?: ShipOperator;
  documents?: OperatorDocument[];
}

export interface BerthingRecord {
  id: number;
  portId: number;
  visitId: number;
  berthId: number;
  berthCategory: string;
  plannedStartAt: string;
  plannedEndAt: string;
  actualStartAt?: string | null;
  actualEndAt?: string | null;
  calculatedHours?: string | number | null;
  billableEtmal?: string | number | null;
  compatibilityStatus: string;
  validationResult: string;
  approvalStatus: string;
  berth?: {
    id: number;
    name: string;
    code: string;
    berthType?: string;
  };
}

export interface VesselVisit {
  id: number;
  visitNumber: string;
  portId: number;
  vesselId: number;
  operatorId: number;
  visitOrigin: string;
  activityMode: string;
  isTransitOnly: boolean;
  originPort: string;
  destinationPort: string;
  eta: string;
  etd: string;
  ataAnchorage?: string | null;
  atdPort?: string | null;
  status:
    | "REQUESTED"
    | "SCHEDULED"
    | "APPROVED"
    | "ARRIVED"
    | "BERTHED"
    | "DEPARTED"
    | "CANCELLED";
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  port?: {
    id: number;
    code: string;
    name: string;
    portCategory?: string;
  };
  vessel?: Vessel;
  operator?: ShipOperator;
  berthingRecords?: BerthingRecord[];
  invoices?: BillingInvoice[];
}

export interface CreateVisitPayload {
  portId: number;
  vesselId: number;
  visitOrigin: "OPERATOR_REQUEST" | "OFFICER_INCIDENTAL";
  activityMode: "NORMAL" | "FIXED_ACTIVITY";
  isTransitOnly?: boolean;
  originPort?: string;
  destinationPort?: string;
  eta: string;
  etd: string;
  notes?: string;
}

export interface CreateVesselPayload {
  operatorId: number | string;
  registrationNumber: string;
  imoNumber?: string;
  name: string;
  flag?: string;
  grossTonnage: number;
  shipType: "NIAGA" | "NON_NIAGA";
  vesselCategory?: "BARANG" | "PENUMPANG" | "CAMPURAN";
  shippingCategory: "LUAR_NEGERI" | "DALAM_NEGERI" | "PELRA_PERINTIS";
  lengthMeters?: number;
  draftMeters?: number;
}

export interface UploadDocumentPayload {
  category: "SIUPAL_NIB" | "NPWP" | "SURAT_UKUR" | "PAS_BESAR_KECIL" | "LAINNYA";
  documentNumber?: string;
  notes?: string;
}
