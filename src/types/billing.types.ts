/**
 * Definisi Tipe & Kontrak Data Modul Penagihan (Billing), e-SKRD & Pembayaran Retribusi Daerah
 */

export type InvoiceStatus = "DRAFT" | "ISSUED" | "PAID" | "PARTIAL" | "VOID" | "ADJUSTED";
export type BillingStage = "ESTIMATE" | "ADVANCE_SKRD" | "FINAL_SKRD";
export type PaymentMethod = "BANK_TRANSFER" | "VA" | "QRIS" | "CASH";

export interface InvoiceItem {
  id: number;
  invoiceId: number;
  tariffId?: number;
  serviceCode: string;
  description: string;
  gtSnapshot: string | number;
  unitsCharged: string | number;
  unitType: string;
  tariffAmountSnapshot: string | number;
  currency?: string;
  subtotalOriginal?: string | number;
  subtotalIdr: string | number;
  formulaNote?: string | null;
  createdAt?: string;
  tariff?: {
    tariffCode: string;
    legalBasis?: string;
  };
}

export interface PaymentRecord {
  id: number;
  invoiceId: number;
  idempotencyKey: string;
  amountIdr: string | number;
  method: PaymentMethod;
  referenceNo?: string | null;
  paidAt: string;
  isVerified: boolean;
  verifiedById?: number | null;
  verifiedAt?: string | null;
  proofFilePath?: string | null;
  createdAt?: string;
}

export interface BillingInvoice {
  id: number;
  invoiceNumber: string;
  ssrdNumber?: string | null;
  collectionInstrument: string;
  portId: number;
  visitId: number;
  operatorId: number;
  billingStage: BillingStage;
  exchangeRateUsd?: string | number | null;
  totalAmountIdr: string | number;
  status: InvoiceStatus;
  issuedAt: string;
  dueDate: string;
  voidReason?: string | null;
  createdAt: string;
  updatedAt: string;
  visit?: {
    id: number;
    visitNumber: string;
    originPort?: string;
    destinationPort?: string;
    vessel?: {
      id: number;
      name: string;
      registrationNumber: string;
      grossTonnage: string | number;
      shipType: string;
    };
  };
  items?: InvoiceItem[];
  payments?: PaymentRecord[];
}

export interface InvoicePrintPayload {
  issuerAuthority: string;
  documentType: string;
  invoiceNumber: string;
  ssrdNumber?: string | null;
  collectionInstrument: string;
  billingStage: string;
  status: string;
  issuedAt: string;
  dueDate: string;
  port: {
    id: number;
    code: string;
    name: string;
    location: string;
  };
  operator: {
    id: number;
    name: string;
    npwp?: string;
    address?: string;
    phone?: string;
  };
  vessel: {
    id: number;
    name: string;
    registrationNumber: string;
    imoNumber?: string | null;
    grossTonnage: string | number;
    shipType: string;
    shippingCategory?: string;
  };
  visitNumber: string;
  items: InvoiceItem[];
  totalAmountIdr: number;
  totalVerifiedPaidIdr: number;
  remainingDueIdr: number;
  payments: PaymentRecord[];
}

export interface SubmitPaymentProofDto {
  amountIdr: number;
  method: PaymentMethod;
  referenceNo?: string;
  idempotencyKey: string;
  paidAt?: string;
}

export type BillingAdjustmentType =
  | "INSTALLMENT_PLAN"
  | "PAYMENT_DEFERRAL"
  | "OVERPAYMENT_REFUND"
  | "CREDIT_TRANSFER";

export type AdjustmentApprovalStatus = "REQUESTED" | "APPROVED" | "REJECTED";

export interface BillingAdjustment {
  id: number;
  requestNumber: string;
  portId: number;
  invoiceId: number;
  adjustmentType: BillingAdjustmentType;
  requestedAmountIdr: number | string;
  installmentCount?: number | null;
  deferredUntil?: string | null;
  reason: string;
  status: AdjustmentApprovalStatus;
  requestedById: number;
  approvedById?: number | null;
  approvedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  invoice?: BillingInvoice;
  requestedBy?: {
    id: number;
    fullName?: string;
    email: string;
  };
}

export interface CreateBillingAdjustmentDto {
  adjustmentType: BillingAdjustmentType;
  requestedAmountIdr: number;
  installmentCount?: number;
  deferredUntil?: string;
  reason: string;
}

export type WarningLevel = "TEGURAN_1" | "TEGURAN_2" | "TEGURAN_3";
export type WarningStatus = "SENT" | "ACKNOWLEDGED" | "RESOLVED";

export interface CreateWarningDto {
  invoiceId: number;
  warningLevel: WarningLevel;
  message: string;
}

export interface GateHandoverRecord {
  id: number;
  bookId: number;
  wardenName: string;
  openedAt: string;
  closedAt?: string | null;
  status: "OPEN" | "SETTLED";
  actualCashSettledIdr?: number | string | null;
  notes?: string | null;
  book?: {
    bookCode: string;
    ticketCategory: string;
    nominalPerTicket: number | string;
    serialStart: number;
    serialEnd: number;
  };
}

export interface WarningRecord {
  id: number;
  warningNumber: string;
  portId: number;
  operatorId: number;
  invoiceId: number;
  warningLevel: WarningLevel;
  message: string;
  status: WarningStatus;
  createdAt: string;
  updatedAt: string;
  invoice?: {
    id: number;
    invoiceNumber: string;
    totalAmountIdr: number | string;
    status: string;
  };
}

export interface RecordPaymentDto {
  amountIdr: number;
  method: PaymentMethod;
  referenceNo?: string;
  idempotencyKey: string;
  paidAt?: string;
}

export interface GenerateBillingDto {
  currency?: string;
  exchangeRateUsd?: number;
  notes?: string;
  collectionInstrument?: string;
}

export interface VoidInvoiceDto {
  voidReason: string;
}

export interface DecideBillingAdjustmentDto {
  approved: boolean;
  notes?: string;
}

export interface RevenueSummary {
  vesselRevenueIdr: number;
  gateTicketingRevenueIdr: number;
  assetLeaseRevenueIdr: number;
  cargoEquipmentRevenueIdr: number;
  utilityRevenueIdr: number;
  totalVerifiedRevenueIdr: number;
  verifiedPaymentCount: number;
  outstandingReceivablesIdr: number;
  outstandingInvoiceCount: number;
  unbilledDepartedVisitsCount: number;
  passengerTraffic: {
    totalPassengers: number;
    totalVehicles: number;
    terminalPassengerFeeIdr: number;
  };
  vesselCategoryBreakdown?: Record<
    string,
    { visitCount: number; verifiedRevenueIdr: number }
  >;
}

export interface UnbilledVisit {
  id: number;
  visitNumber: string;
  vesselId: number;
  portId: number;
  berthId?: number | null;
  status: string;
  eta: string;
  etd: string;
  actualBerthTime?: string | null;
  actualDepartureTime?: string | null;
  vessel?: {
    id: number;
    name: string;
    callSign?: string | null;
    grossTonnage: number | string;
    shipType: string;
    vesselCategory?: string;
  };
  berth?: {
    id: number;
    code: string;
    name: string;
    authorityType?: string;
  };
}

export interface PaymentConfig {
  gatewayEnabled: boolean;
  provider: "MIDTRANS" | "BANK_PAPUA" | "MANUAL";
  isProduction: boolean;
  midtransClientKey: string | null;
}

export interface CheckoutPaymentDto {
  targetType: "INVOICE" | "ASSET_LEASE" | "UTILITY_READING";
  targetId: number;
}

import type { AssetLease, AssetLeasePayment } from "./asset.types";

export interface CheckoutPaymentResponse {
  orderId: string;
  provider: string;
  amountIdr: number;
  snapToken?: string;
  redirectUrl?: string;
}

export interface UnpaidLeaseSummary {
  lease: AssetLease;
  totalDue: number;
  totalPaid: number;
  remaining: number;
}

export type UnifiedPaidRecord =
  | { kind: "DERMAGA"; sortDate: number; invoice: BillingInvoice }
  | { kind: "RUANGAN"; sortDate: number; lease: AssetLease; payment: AssetLeasePayment };

export interface OverdueInvoiceSummary {
  invoiceId: number;
  invoiceNumber: string;
  operatorId: number;
  operatorName: string;
  dueDate: string;
  status: InvoiceStatus;
  penaltyRateMonthly: number;
  daysOverdue: number;
  monthsOverdue: number;
  remainingPrincipalIdr: number;
  penaltyIdr: number;
  totalDueWithPenaltyIdr: number;
  issuedWarningLevels: WarningLevel[];
  pendingEscalationLevels: WarningLevel[];
}

export interface AutoEscalateWarningsResponse {
  scannedCount: number;
  escalatedCount: number;
  issuedWarnings: Array<{
    warningId: number;
    warningNumber: string;
    invoiceNumber: string;
    warningLevel: WarningLevel;
    penaltyIdr: number;
  }>;
}
