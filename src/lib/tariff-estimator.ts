import { BerthType } from "@/types/port.types";
import {
  ActivityMode,
  ServiceCode,
  ShipType,
  ShippingCategory,
  TariffItem,
  TariffUnitType,
} from "@/types/tariff.types";

export interface TariffEstimateLine {
  serviceCode: ServiceCode;
  tariffCode: string;
  legalBasis: string;
  currency: "IDR" | "USD";
  tariffAmount: number;
  unitType: TariffUnitType;
  unitsCharged: number;
  unitLabel: string;
  subtotalOriginal: number;
  subtotalIdr: number;
  rateLabel: string;
  formulaNote: string;
  isLiveTariff: boolean;
}

export interface VisitCostEstimateResult {
  labuh: TariffEstimateLine;
  tambat: TariffEstimateLine;
  mooring: number;
  anchorage: number;
  water: number;
  power: number;
  waste: number;
  total: number;
  exchangeRateUsd: number;
  usesUsd: boolean;
  isLiveTariff: boolean;
}

const HOURS_PER_ETMAL = 24;
const DAYS_PER_LABUH_PERIOD = 15;
const DAYS_PER_MONTH_PERIOD = 30;

export function resolveActiveTariff(
  tariffs: TariffItem[],
  criteria: {
    serviceCode: ServiceCode;
    shippingCategory: ShippingCategory;
    shipType?: ShipType | null;
    activityMode?: ActivityMode | null;
    berthType?: BerthType | null;
  }
): TariffItem | null {
  const now = Date.now();
  const candidates = tariffs.filter((t) => {
    if (!t.isActive) return false;
    if (t.serviceCode !== criteria.serviceCode) return false;
    if (t.shippingCategory !== criteria.shippingCategory) return false;
    if (t.effectiveFrom && new Date(t.effectiveFrom).getTime() > now) return false;
    if (t.effectiveTo && new Date(t.effectiveTo).getTime() < now) return false;

    if (criteria.shipType !== undefined && t.shipType !== criteria.shipType) {
      return false;
    }
    if (criteria.activityMode !== undefined && t.activityMode !== criteria.activityMode) {
      return false;
    }
    if (criteria.berthType !== undefined && t.berthType !== criteria.berthType) {
      return false;
    }
    return true;
  });

  if (candidates.length === 0) return null;

  candidates.sort(
    (a, b) => new Date(b.effectiveFrom).getTime() - new Date(a.effectiveFrom).getTime()
  );
  return candidates[0];
}

function formatRateLabel(
  currency: "IDR" | "USD",
  amount: number,
  unitType: TariffUnitType
): string {
  const unitText =
    unitType === "GT_PER_ETMAL"
      ? "GT / Etmal"
      : unitType === "GT_PER_15_DAYS"
      ? "GT / 15 Hari"
      : "GT / Bulan";
  if (currency === "USD") {
    return `USD ${amount.toLocaleString("en-US", { maximumFractionDigits: 4 })} / ${unitText}`;
  }
  return `Rp ${amount.toLocaleString("id-ID", { maximumFractionDigits: 2 })} / ${unitText}`;
}

export function calculateTariffLine(params: {
  grossTonnage: number;
  durationHours: number;
  tariff: TariffItem | null;
  fallback: {
    serviceCode: ServiceCode;
    tariffCode: string;
    legalBasis: string;
    unitType: TariffUnitType;
    currency: "IDR" | "USD";
    amount: number;
  };
  exchangeRateUsd: number;
}): TariffEstimateLine {
  const gt = Math.max(0, Number(params.grossTonnage) || 0);
  const hours = Math.max(1, Number(params.durationHours) || 1);
  const days = hours / 24;

  const isLiveTariff = Boolean(params.tariff);
  const serviceCode = params.tariff?.serviceCode ?? params.fallback.serviceCode;
  const tariffCode = params.tariff?.tariffCode ?? params.fallback.tariffCode;
  const legalBasis = params.tariff?.legalBasis ?? params.fallback.legalBasis;
  const unitType = params.tariff?.unitType ?? params.fallback.unitType;
  const currency = params.tariff?.currency ?? params.fallback.currency;
  const tariffAmount = params.tariff
    ? Number(params.tariff.amount) || 0
    : params.fallback.amount;

  let unitsCharged = 1;
  let unitLabel = "etmal";
  if (unitType === "GT_PER_ETMAL") {
    unitsCharged = Math.max(1, Math.ceil(hours / HOURS_PER_ETMAL));
    unitLabel = "etmal";
  } else if (unitType === "GT_PER_15_DAYS") {
    unitsCharged = Math.max(1, Math.ceil(days / DAYS_PER_LABUH_PERIOD));
    unitLabel = "periode (15 hari)";
  } else if (unitType === "GT_PER_MONTH") {
    unitsCharged = Math.max(1, Math.ceil(days / DAYS_PER_MONTH_PERIOD));
    unitLabel = "bulan";
  }

  const rawSubtotal = gt * unitsCharged * tariffAmount;
  const subtotalOriginal = Number(rawSubtotal.toFixed(4));
  const subtotalIdr =
    currency === "USD"
      ? Math.round(subtotalOriginal * params.exchangeRateUsd)
      : Math.round(subtotalOriginal);

  const rateNote =
    currency === "USD"
      ? ` × Kurs Rp ${params.exchangeRateUsd.toLocaleString("id-ID")}`
      : "";
  const formulaNote = `${gt.toLocaleString("id-ID")} GT × ${unitsCharged} ${unitLabel} × ${currency} ${tariffAmount}${rateNote}`;

  return {
    serviceCode,
    tariffCode,
    legalBasis,
    currency,
    tariffAmount,
    unitType,
    unitsCharged,
    unitLabel,
    subtotalOriginal,
    subtotalIdr,
    rateLabel: formatRateLabel(currency, tariffAmount, unitType),
    formulaNote,
    isLiveTariff,
  };
}

export function estimateVisitCosts(params: {
  tariffs: TariffItem[];
  exchangeRateUsd: number;
  grossTonnage: number;
  durationHours: number;
  shippingCategory: ShippingCategory;
  shipType: ShipType;
  berthType?: BerthType;
  needFreshWater: boolean;
  waterVolume: number;
  needShorePower: boolean;
  powerKwh: number;
  needWasteDisposal: boolean;
}): VisitCostEstimateResult {
  const effectiveRate = params.exchangeRateUsd > 0 ? params.exchangeRateUsd : 16000;
  const berthType: BerthType = params.berthType || "DERMAGA_BESI_BETON_KAYU";

  const labuhTariff =
    resolveActiveTariff(params.tariffs, {
      serviceCode: "JASA_LABUH",
      shippingCategory: params.shippingCategory,
      shipType: params.shipType,
      activityMode: "NORMAL",
    }) ||
    resolveActiveTariff(params.tariffs, {
      serviceCode: "JASA_LABUH",
      shippingCategory: params.shippingCategory,
    });

  const tambatTariff =
    resolveActiveTariff(params.tariffs, {
      serviceCode: "JASA_TAMBAT_UMUM",
      shippingCategory: params.shippingCategory,
      berthType,
    }) ||
    resolveActiveTariff(params.tariffs, {
      serviceCode: "JASA_TAMBAT_UMUM",
      shippingCategory: params.shippingCategory,
    });

  const labuhFallbackAmount =
    params.shippingCategory === "LUAR_NEGERI"
      ? 0.08
      : params.shippingCategory === "PELRA_PERINTIS"
      ? 40
      : 77;

  const tambatFallbackAmount =
    params.shippingCategory === "LUAR_NEGERI"
      ? 0.07
      : params.shippingCategory === "PELRA_PERINTIS"
      ? 50
      : 100;

  const labuh = calculateTariffLine({
    grossTonnage: params.grossTonnage,
    durationHours: params.durationHours,
    tariff: labuhTariff,
    fallback: {
      serviceCode: "JASA_LABUH",
      tariffCode: "PERDA-LABUH-DEFAULT",
      legalBasis: "Perda Kab. Mimika No. 4/2023",
      unitType: "GT_PER_15_DAYS",
      currency: params.shippingCategory === "LUAR_NEGERI" ? "USD" : "IDR",
      amount: labuhFallbackAmount,
    },
    exchangeRateUsd: effectiveRate,
  });

  const tambat = calculateTariffLine({
    grossTonnage: params.grossTonnage,
    durationHours: params.durationHours,
    tariff: tambatTariff,
    fallback: {
      serviceCode: "JASA_TAMBAT_UMUM",
      tariffCode: "PERDA-TAMBAT-DEFAULT",
      legalBasis: "Perda Kab. Mimika No. 4/2023",
      unitType: "GT_PER_ETMAL",
      currency: params.shippingCategory === "LUAR_NEGERI" ? "USD" : "IDR",
      amount: tambatFallbackAmount,
    },
    exchangeRateUsd: effectiveRate,
  });

  const water = params.needFreshWater ? params.waterVolume * 28000 : 0;
  const power = params.needShorePower ? params.powerKwh * 3200 : 0;
  const waste = params.needWasteDisposal ? 150000 : 0;

  const total = labuh.subtotalIdr + tambat.subtotalIdr + water + power + waste;

  return {
    labuh,
    tambat,
    mooring: tambat.subtotalIdr,
    anchorage: labuh.subtotalIdr,
    water,
    power,
    waste,
    total,
    exchangeRateUsd: effectiveRate,
    usesUsd: labuh.currency === "USD" || tambat.currency === "USD",
    isLiveTariff: labuh.isLiveTariff || tambat.isLiveTariff,
  };
}
