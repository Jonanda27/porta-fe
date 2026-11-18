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
import { PortAssetCatalogItem } from "@/types/tenant.types";

/**
 * Service untuk portal operasional UPT (ADMIN_PELABUHAN & SUPERADMIN)
 */
export const UptService = {
  // --- Verifikasi Operator, Armada, & Tenant ---
  getOperators(): Promise<ShipOperatorItem[]> {
    return apiClient.get<ShipOperatorItem[]>(API_CONFIG.ENDPOINTS.VESSELS.OPERATORS);
  },

  createOperator(payload: {
    name: string;
    npwp?: string;
    phone?: string;
    email?: string;
    address?: string;
    operatorProfile: "REGULAR_SCHEDULED" | "INCIDENTAL";
  }): Promise<ShipOperatorItem> {
    return apiClient.post<ShipOperatorItem>(API_CONFIG.ENDPOINTS.VESSELS.OPERATORS, payload);
  },

  updateOperator(
    operatorId: number,
    payload: {
      name?: string;
      npwp?: string;
      phone?: string;
      email?: string;
      address?: string;
      operatorProfile?: "REGULAR_SCHEDULED" | "INCIDENTAL";
      isActive?: boolean;
    }
  ): Promise<ShipOperatorItem> {
    return apiClient.patch<ShipOperatorItem>(
      `${API_CONFIG.ENDPOINTS.VESSELS.OPERATORS}/${operatorId}`,
      payload
    );
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

  createVessel(payload: {
    operatorId: number;
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
  }): Promise<VesselItem> {
    return apiClient.post<VesselItem>(API_CONFIG.ENDPOINTS.VESSELS.LIST, payload);
  },

  updateVessel(
    vesselId: number,
    payload: {
      operatorId?: number;
      registrationNumber?: string;
      imoNumber?: string;
      name?: string;
      flag?: string;
      grossTonnage?: number;
      shipType?: "NIAGA" | "NON_NIAGA";
      vesselCategory?: "BARANG" | "PENUMPANG" | "CAMPURAN";
      shippingCategory?: "LUAR_NEGERI" | "DALAM_NEGERI" | "PELRA_PERINTIS";
      lengthMeters?: number;
      draftMeters?: number;
      isActive?: boolean;
    }
  ): Promise<VesselItem> {
    return apiClient.patch<VesselItem>(
      `${API_CONFIG.ENDPOINTS.VESSELS.LIST}/${vesselId}`,
      payload
    );
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

  createTenant(payload: {
    name: string;
    npwp?: string;
    nib?: string;
    phone?: string;
    email?: string;
    address?: string;
  }): Promise<TenantItem> {
    return apiClient.post<TenantItem>(API_CONFIG.ENDPOINTS.ASSETS.TENANTS, payload);
  },

  updateTenant(
    tenantId: number,
    payload: {
      name?: string;
      npwp?: string;
      nib?: string;
      phone?: string;
      email?: string;
      address?: string;
      isActive?: boolean;
    }
  ): Promise<TenantItem> {
    return apiClient.patch<TenantItem>(
      `${API_CONFIG.ENDPOINTS.ASSETS.TENANTS}/${tenantId}`,
      payload
    );
  },

  verifyTenant(tenantId: number, payload: VerifyTenantPayload): Promise<TenantItem> {
    return apiClient.patch<TenantItem>(
      `${API_CONFIG.ENDPOINTS.ASSETS.TENANTS}/${tenantId}/verify`,
      payload
    );
  },

  createAsset(payload: {
    portId: number;
    assetCode: string;
    name: string;
    assetType: string;
    areaSqm: number;
    annualRatePerSqmIdr: number;
    billingEligibility?: "BILLABLE" | "NOT_BILLABLE" | "PENDING_VERIFICATION";
    gisCoordinates?: string;
    legalBasis?: string;
  }): Promise<PortAssetCatalogItem> {
    return apiClient.post<PortAssetCatalogItem>(API_CONFIG.ENDPOINTS.ASSETS.ASSETS, payload);
  },

  updateAsset(
    assetId: number,
    payload: {
      name?: string;
      assetType?: string;
      areaSqm?: number;
      annualRatePerSqmIdr?: number;
      billingEligibility?: "BILLABLE" | "NOT_BILLABLE" | "PENDING_VERIFICATION";
      status?: "AVAILABLE" | "LEASED" | "MAINTENANCE";
      gisCoordinates?: string;
      legalBasis?: string;
    }
  ): Promise<PortAssetCatalogItem> {
    return apiClient.patch<PortAssetCatalogItem>(
      `${API_CONFIG.ENDPOINTS.ASSETS.ASSETS}/${assetId}`,
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
