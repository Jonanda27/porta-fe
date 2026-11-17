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
