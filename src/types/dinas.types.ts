import type { AssetLease, PortAsset } from "@/types/asset.types";
import type { VesselManifestItem } from "@/types/field-ops.types";

export type { AssetLease, PortAsset, VesselManifestItem };

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
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  resolutionNotes?: string | null;
  createdAt: string;
  resolvedAt?: string | null;
  port?: {
    id: number;
    code: string;
    name: string;
  } | null;
}

// ==========================================
// Prioritas 1: Macro Kadis Monitoring
// ==========================================
export interface TaskPerformanceSummary {
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  unsubmittedTasks: number;
  completionRatePercent: number;
}

export interface VesselActivitySummary {
  totalVisits: number;
  cargoVisits: number;
  passengerVisits: number;
  mixedVisits: number;
  activeBerthings: number;
  unbilledDepartedVisits: number;
}

export interface RevenueMetricSummary {
  totalRevenueIdr: number;
  vesselRevenueIdr: number;
  cargoEquipmentRevenueIdr: number;
  utilityRevenueIdr: number;
  gateTicketingRevenueIdr: number;
  assetLeaseRevenueIdr: number;
  totalVerifiedRevenueIdr: number;
  outstandingReceivablesIdr: number;
}

export interface DivisionPerformance {
  divisionId: number;
  code: string;
  name: string;
  kabidOfficers: Array<{ id: number; fullName: string; email: string }>;
  portCount: number;
  completionRatePercent: number;
  overdueTasks: number;
  unsubmittedTasks: number;
  totalVisits: number;
  totalRevenueIdr: number;
}

export interface PortPerformanceSummary {
  portId: number;
  code: string;
  name: string;
  portCategory?: string;
  portClassification?: string;
  taskPerformance?: TaskPerformanceSummary;
  vesselActivity?: VesselActivitySummary;
  revenue?: RevenueMetricSummary;
}

export interface KadisMonitoringResult {
  agencyOverview: {
    taskPerformance: TaskPerformanceSummary;
    vesselActivity: VesselActivitySummary;
    revenue: RevenueMetricSummary;
    revenueTargetAndRealization: {
      annualTargetIdr: number;
      realizedRevenueIdr: number;
      realizationPercent: number;
    };
    reportCompliance: {
      totalReportsSubmitted: number;
      verifiedReports: number;
      waitingVerification: number;
      reportComplianceRatePercent: number;
    };
  };
  divisionPerformance: DivisionPerformance[];
  portPerformance: PortPerformanceSummary[];
  criticalIssues: {
    overdueOrIssueTasksCount: number;
    highOrCriticalMaintenanceCount: number;
    tasksRequiringAttention: Array<{
      id: number;
      taskNumber: string;
      title: string;
      portId: number;
      isOverdue: boolean;
      hasIssue: boolean;
      issueNotes?: string | null;
    }>;
    criticalMaintenanceTickets: Array<unknown>;
  };
}

export interface OfficerObligationRecap {
  officer: {
    id: number;
    fullName: string;
    email: string;
    role: string;
    portId?: number | null;
    port?: { id: number; code: string; name: string } | null;
  };
  overallObligationStatus: string;
  metrics: {
    totalObligated: number;
    notStarted: number;
    inProgress: number;
    submitted: number;
    unsubmitted: number;
    returned: number;
    adminChecked: number;
    headVerified: number;
    completed: number;
    overdue: number;
    withIssues: number;
  };
}

export interface DailyObligationRecap {
  officers: OfficerObligationRecap[];
  unassignedTasks?: Array<unknown>;
  portTotals: {
    totalObligated: number;
    notStarted: number;
    inProgress: number;
    submitted: number;
    unsubmitted: number;
    returned: number;
    adminChecked: number;
    headVerified: number;
    completed: number;
    overdue: number;
  };
  complianceRatePercent?: number;
}

// ==========================================
// Prioritas 2: Audit Logs
// ==========================================
export interface DinasAuditLogItem {
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
  port?: {
    id: number;
    code: string;
    name: string;
  } | null;
}

// ==========================================
// Prioritas 3: Hierarchical Drilldown Per Terminal & Dermaga
// ==========================================
export interface DrilldownBerthingRecord {
  id: number;
  berthId: number;
  visitId: number;
  berthTime?: string | null;
  departureTime?: string | null;
  berthingStatus?: string | null;
  visit?: {
    id: number;
    visitNumber: string;
    vessel?: { id: number; name: string; vesselCategory: string } | null;
    operator?: { id: number; name: string } | null;
  } | null;
}

export interface DrilldownTask {
  id: number;
  taskNumber: string;
  title: string;
  executionStatus: string;
  dueDate?: string | null;
  assignee?: { id: number; fullName: string } | null;
  berth?: { id: number; code: string; name: string } | null;
  terminal?: { id: number; code: string; name: string } | null;
}

export interface DrilldownBerth {
  id: number;
  portId: number;
  terminalId?: number | null;
  code: string;
  name: string;
  maxLengthMeters?: number | null;
  berthType?: string | null;
  authorityType?: string | null;
  billingEligibility?: string | null;
  operationalStatus?: string | null;
  berthingRecords?: DrilldownBerthingRecord[];
  tasks?: DrilldownTask[];
}

export interface DrilldownTerminal {
  id: number;
  portId: number;
  code: string;
  name: string;
  terminalType?: string | null;
  isActive: boolean;
  berths?: DrilldownBerth[];
}

export interface DrilldownPort {
  id: number;
  code: string;
  name: string;
  address?: string | null;
  city?: string | null;
  isActive: boolean;
  terminals: DrilldownTerminal[];
  berths: DrilldownBerth[];
}

export interface KabidDrilldownResult {
  drilldownScope: {
    divisionId: number | null;
    portIds: number[];
    terminalId: number | null;
    berthId: number | null;
  };
  ports: DrilldownPort[];
  tasks: DrilldownTask[];
}
