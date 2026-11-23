/**
 * Tipe Data dan DTO Modul Kargo, Pemakaian Alat Pelabuhan, dan Utilitas Dermaga
 * Sesuai Perda Kab. Mimika No. 4/2023 & Perbup No. 25/2024
 */

export type CargoCategory =
  | "BERAS_BULOG"
  | "SEMEN"
  | "BAHAN_BANGUNAN"
  | "KONTINER_20FT"
  | "KONTINER_40FT"
  | "KENDARAAN_R2"
  | "KENDARAAN_R4"
  | "KENDARAAN_BERAT"
  | "HEWAN_TERNAK"
  | "CAMPURAN_SEMBAKO";

export type StorageLocationType =
  | "DERMAGA_OPEN"
  | "LAPANGAN_PENUMPUKAN"
  | "GUDANG_LINI_1"
  | "GUDANG_LINI_2";

export type PortEquipmentType =
  | "FORKLIFT_3_5T"
  | "FORKLIFT_7T"
  | "MOBILE_CRANE"
  | "REACH_STACKER"
  | "HEAD_TRUCK"
  | "CHASSIS"
  | "WEIGHBRIDGE";

export type UtilityType = "AIR_BERSIH" | "LISTRIK";

export type ChargePaymentStatus = "UNPAID" | "PAID" | "CANCELLED";

export interface CargoHandlingRecord {
  id: number;
  recordNumber: string;
  portId: number;
  visitId?: number | null;
  cargoCategory: CargoCategory;
  description: string;
  quantity: number | string;
  unitLabel: string;
  storageLocation?: StorageLocationType | null;
  durationDays: number;
  ratePerUnitIdr: number | string;
  totalAmountIdr: number | string;
  paymentStatus: ChargePaymentStatus;
  idempotencyKey?: string | null;
  paidAt?: string | null;
  recordedById: number;
  createdAt: string;
  updatedAt: string;
  visit?: {
    id: number;
    visitNumber?: string;
    vessel?: {
      id: number;
      name: string;
      callSign?: string;
    } | null;
  } | null;
  recordedBy?: {
    id: number;
    fullName: string;
    role?: string;
  } | null;
}

export interface EquipmentRentalRecord {
  id: number;
  rentalNumber: string;
  portId: number;
  visitId?: number | null;
  equipmentType: PortEquipmentType;
  capacityLabel: string;
  unitCount: number;
  durationHours: number | string;
  ratePerHourIdr: number | string;
  totalAmountIdr: number | string;
  paymentStatus: ChargePaymentStatus;
  idempotencyKey?: string | null;
  paidAt?: string | null;
  recordedById: number;
  createdAt: string;
  updatedAt: string;
  visit?: {
    id: number;
    visitNumber?: string;
    vessel?: {
      id: number;
      name: string;
      callSign?: string;
    } | null;
  } | null;
  recordedBy?: {
    id: number;
    fullName: string;
    role?: string;
  } | null;
}

export interface UtilityMeterReading {
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
  ratePerUnitIdr: number | string;
  totalAmountIdr: number | string;
  paymentStatus: ChargePaymentStatus;
  idempotencyKey?: string | null;
  paidAt?: string | null;
  recordedById: number;
  createdAt: string;
  updatedAt: string;
  asset?: {
    id: number;
    assetCode: string;
    name: string;
    assetType?: string;
  } | null;
  visit?: {
    id: number;
    visitNumber?: string;
    vessel?: {
      id: number;
      name: string;
    } | null;
  } | null;
  recordedBy?: {
    id: number;
    fullName: string;
    role?: string;
  } | null;
}

export interface PayChargeDto {
  idempotencyKey: string;
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
    paidAt?: string | null;
    idempotencyKey: string;
    recordedByName: string;
  };
  qrValidationCode: string;
}
