import { BerthType } from "./port.types";

/**
 * Definisi Tipe & Kontrak Data untuk Master Tarif Perda & Kurs USD
 * Selaras dengan DTO porta-be (src/modules/tariffs/dto/tariffs.dto.ts) & schema.prisma
 */

export type ServiceCode =
  | "JASA_LABUH"
  | "KEGIATAN_TUKS_TERSUS"
  | "JASA_TAMBAT_UMUM"
  | "JASA_TAMBAT_KHUSUS";

export type ShippingCategory =
  | "LUAR_NEGERI"
  | "DALAM_NEGERI"
  | "PELRA_PERINTIS";

export type ShipType = "NIAGA" | "NON_NIAGA";

export type ActivityMode = "NORMAL" | "FIXED_ACTIVITY";

export type TariffUnitType = "GT_PER_15_DAYS" | "GT_PER_MONTH" | "GT_PER_ETMAL";

export type Currency = "IDR" | "USD";

export interface TariffItem {
  id: number;
  tariffCode: string;
  serviceCode: ServiceCode;
  shippingCategory: ShippingCategory;
  shipType?: ShipType | null;
  activityMode?: ActivityMode | null;
  berthType?: BerthType | null;
  unitType: TariffUnitType;
  currency: Currency;
  amount: number | string;
  legalBasis: string;
  effectiveFrom: string;
  effectiveTo?: string | null;
  isActive: boolean;
  createdAt?: string;
}

export interface CreateTariffPayload {
  tariffCode: string;
  serviceCode: ServiceCode;
  shippingCategory: ShippingCategory;
  shipType?: ShipType;
  activityMode?: ActivityMode;
  berthType?: BerthType;
  unitType: TariffUnitType;
  currency: Currency;
  amount: number;
  legalBasis: string;
  effectiveFrom: string;
}

export interface UsdExchangeRateResponse {
  baseCurrency: string;
  targetCurrency: string;
  rate: number;
  source: string;
  lastUpdated: string;
  isFallback: boolean;
}
