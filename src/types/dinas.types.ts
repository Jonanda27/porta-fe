/**
 * Definisi Tipe & Kontrak Data Modul Pengawasan Eksekutif Dinas Perhubungan (DISHUB_EKSEKUTIF)
 */

export interface DailyReportOfficer {
  id: number;
  fullName: string;
}

export interface DailyReportItem {
  id: number;
  reportId: number;
  visitId?: number | null;
  vesselName: string;
  berthId?: number | null;
  berth?: {
    id: number;
    code: string;
    name: string;
  } | null;
  activityStatus: string;
  notes?: string | null;
}

export interface DailyPortReport {
  id: number;
  portId: number;
  reportDate: string;
  officerId: number;
  totalVesselsStaying: number;
  generalNotes?: string | null;
  status: "SUBMITTED" | "ACKNOWLEDGED";
  officer?: DailyReportOfficer;
  items?: DailyReportItem[];
  createdAt: string;
  updatedAt?: string;
}

export type MaintenanceSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type MaintenanceStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED";

export interface MaintenanceTicket {
  id: number;
  ticketNumber: string;
  portId: number;
  facilityType: string;
  issueDescription: string;
  severity: MaintenanceSeverity;
  status: MaintenanceStatus;
  evidenceFilePath?: string | null;
  reportedById: number;
  berthId?: number | null;
  assetId?: number | null;
  createdAt: string;
  updatedAt?: string;
  berth?: {
    id: number;
    code: string;
    name: string;
  } | null;
  asset?: {
    id: number;
    assetCode: string;
    name: string;
  } | null;
  reportedBy?: {
    id: number;
    fullName: string;
  };
}

export interface SimulateRevenueDto {
  portId?: number;
  estimatedMonthlyVisits: number;
  averageGt: number;
  averageEtmal: number;
  tariffPerGtEtmalIdr: number;
  labuhTariffPerGtIdr: number;
  tariffAdjustmentPercent?: number;
}

export interface SimulateRevenueResult {
  portId: number | string;
  tariffAdjustmentPercent: number;
  monthlyLabuhIdr: number;
  monthlyTambatIdr: number;
  projectedAnnualVesselRevenueIdr: number;
  potentialAnnualAssetLeaseIdr: number;
  projectedTotalAnnualPadIdr: number;
}

export interface GisOpportunitiesResult {
  berths: Array<{
    id: number;
    portId: number;
    code: string;
    name: string;
    berthType: string;
    authorityType: string;
    billingEligibility: string;
  }>;
  assets: Array<{
    id: number;
    portId: number;
    assetCode: string;
    name: string;
    assetType: string;
    areaSqm: number | string;
    annualRatePerSqmIdr: number | string;
    billingEligibility: string;
    status: string;
    gisCoordinates?: string | null;
  }>;
  availableAssetsCount: number;
  leasedAssetsCount: number;
}

export interface PublicComplaint {
  id: number;
  ticketNumber: string;
  portId: number;
  category: string;
  description: string;
  reporterName: string;
  reporterPhone?: string | null;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED";
  resolutionNotes?: string | null;
  createdAt: string;
  resolvedAt?: string | null;
}

