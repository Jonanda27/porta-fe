import { API_CONFIG } from "@/config/api.config";
import { apiClient } from "@/lib/api-client";
import {
  ApproveBerthingOverridePayload,
  AssetLeaseItem,
  AuditLogItem,
  BerthingRecordItem,
  IssueWarningPayload,
  RejectAssetLeasePayload,
  RevenueSummaryResponse,
  ShipOperatorItem,
  ShipVisitItem,
  TenantItem,
  UptInvoiceItem,
  VerifyEntityPayload,
  VerifyTenantPayload,
  VesselItem,
  WarningItem,
} from "@/types/upt.types";

/**
 * Service untuk portal operasional UPT (ADMIN_PELABUHAN & SUPERADMIN)
 */
export const UptService = {
  // --- Verifikasi Operator, Armada, & Tenant ---
  getOperators(): Promise<ShipOperatorItem[]> {
    return apiClient.get<ShipOperatorItem[]>(API_CONFIG.ENDPOINTS.VESSELS.OPERATORS);
  },

  verifyOperator(
    operatorId: number,
    payload: VerifyEntityPayload
  ): Promise<ShipOperatorItem> {
    return apiClient.post<ShipOperatorItem>(
      `${API_CONFIG.ENDPOINTS.VESSELS.OPERATORS}/${operatorId}/verify`,
      payload
    );
  },

  getVessels(): Promise<VesselItem[]> {
    return apiClient.get<VesselItem[]>(API_CONFIG.ENDPOINTS.VESSELS.LIST);
  },

  verifyVessel(vesselId: number, payload: VerifyEntityPayload): Promise<VesselItem> {
    return apiClient.post<VesselItem>(
      `${API_CONFIG.ENDPOINTS.VESSELS.LIST}/${vesselId}/verify`,
      payload
    );
  },

  getTenants(): Promise<TenantItem[]> {
    return apiClient.get<TenantItem[]>(API_CONFIG.ENDPOINTS.ASSETS.TENANTS);
  },

  verifyTenant(tenantId: number, payload: VerifyTenantPayload): Promise<TenantItem> {
    return apiClient.patch<TenantItem>(
      `${API_CONFIG.ENDPOINTS.ASSETS.TENANTS}/${tenantId}/verify`,
      payload
    );
  },

  // --- Kunjungan Kapal, Alokasi Dermaga, & Sewa Aset ---
  getVisits(portId?: number): Promise<ShipVisitItem[]> {
    return apiClient.get<ShipVisitItem[]>(
      API_CONFIG.ENDPOINTS.VESSELS.VISITS,
      portId ? { params: { portId } } : undefined
    );
  },

  approveVisit(visitId: number): Promise<ShipVisitItem> {
    return apiClient.post<ShipVisitItem>(
      `${API_CONFIG.ENDPOINTS.VESSELS.VISITS}/${visitId}/approve`
    );
  },

  getPendingBerthingOverrides(portId?: number): Promise<BerthingRecordItem[]> {
    return apiClient.get<BerthingRecordItem[]>(
      `${API_CONFIG.ENDPOINTS.VESSELS.VISITS}/berthing-overrides/pending`,
      portId ? { params: { portId } } : undefined
    );
  },

  approveBerthingOverride(
    visitId: number,
    berthingId: number,
    payload: ApproveBerthingOverridePayload
  ): Promise<BerthingRecordItem> {
    return apiClient.post<BerthingRecordItem>(
      `${API_CONFIG.ENDPOINTS.VESSELS.VISITS}/${visitId}/berthings/${berthingId}/approve-override`,
      payload
    );
  },

  getLeases(portId?: number): Promise<AssetLeaseItem[]> {
    return apiClient.get<AssetLeaseItem[]>(
      API_CONFIG.ENDPOINTS.ASSETS.LEASES,
      portId ? { params: { portId } } : undefined
    );
  },

  approveLease(leaseId: number): Promise<AssetLeaseItem> {
    return apiClient.patch<AssetLeaseItem>(
      `${API_CONFIG.ENDPOINTS.ASSETS.LEASES}/${leaseId}/approve`
    );
  },

  rejectLease(
    leaseId: number,
    payload: RejectAssetLeasePayload
  ): Promise<AssetLeaseItem> {
    return apiClient.patch<AssetLeaseItem>(
      `${API_CONFIG.ENDPOINTS.ASSETS.LEASES}/${leaseId}/reject`,
      payload
    );
  },

  // --- Dashboard Telemetry ---
  getRevenueSummary(portId?: number): Promise<RevenueSummaryResponse> {
    return apiClient.get<RevenueSummaryResponse>(
      API_CONFIG.ENDPOINTS.REPORTS.REVENUE_SUMMARY,
      portId ? { params: { portId } } : undefined
    );
  },

  getWarnings(portId?: number): Promise<WarningItem[]> {
    return apiClient.get<WarningItem[]>(
      API_CONFIG.ENDPOINTS.WARNINGS.BASE,
      portId ? { params: { portId } } : undefined
    );
  },

  issueWarning(payload: IssueWarningPayload): Promise<WarningItem> {
    return apiClient.post<WarningItem>(
      API_CONFIG.ENDPOINTS.WARNINGS.BASE,
      payload
    );
  },

  getUnbilledVisits(portId?: number): Promise<ShipVisitItem[]> {
    return apiClient.get<ShipVisitItem[]>(
      API_CONFIG.ENDPOINTS.REPORTS.UNBILLED_VISITS,
      portId ? { params: { portId } } : undefined
    );
  },

  getInvoices(portId?: number): Promise<UptInvoiceItem[]> {
    return apiClient.get<UptInvoiceItem[]>(
      API_CONFIG.ENDPOINTS.BILLING.INVOICES,
      portId ? { params: { portId } } : undefined
    );
  },

  getAuditLogs(): Promise<AuditLogItem[]> {
    return apiClient.get<AuditLogItem[]>(
      API_CONFIG.ENDPOINTS.REPORTS.AUDIT_LOGS
    );
  },
};
