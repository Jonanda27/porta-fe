import { API_CONFIG } from "@/config/api.config";
import { apiClient } from "@/lib/api-client";
import {
  ApproveBerthingOverridePayload,
  AssetLeaseItem,
  AuditLogItem,
  BerthingRecordItem,
  CreateOfficerTaskPayload,
  DailyObligationRecapResponse,
  DocumentItem,
  IssueWarningPayload,
  OfficerTaskItem,
  PermissionCatalogResponse,
  RejectAssetLeasePayload,
  RevenueSummaryResponse,
  ShipOperatorItem,
  ShipVisitItem,
  SubmitOfficerTaskPayload,
  TaskAttachmentItem,
  TaskTemplateItem,
  TenantItem,
  UpdateTaskChecklistPayload,
  UptInvoiceItem,
  UserAssignmentItem,
  VerifyEntityPayload,
  VerifyTenantPayload,
  VesselItem,
  WarningItem,
} from "@/types/upt.types";
import { PortAssetCatalogItem } from "@/types/tenant.types";
import {
  CreateBerthingContractPayload,
  OperatorBerthingContract,
  UploadDocumentPayload,
  VerifyBerthingContractPayload,
} from "@/types/kapal.types";

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

  approveVisit(visitId: number, berthId?: number): Promise<ShipVisitItem> {
    return apiClient.post<ShipVisitItem>(
      `${API_CONFIG.ENDPOINTS.VESSELS.VISITS}/${visitId}/approve`,
      berthId ? { berthId } : undefined
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

  verifyRoomLease(leaseId: number): Promise<AssetLeaseItem> {
    return apiClient.patch<AssetLeaseItem>(
      API_CONFIG.ENDPOINTS.ASSETS.VERIFY_ROOM(leaseId)
    );
  },

  approveLease(leaseId: number): Promise<AssetLeaseItem> {
    return apiClient.patch<AssetLeaseItem>(
      API_CONFIG.ENDPOINTS.ASSETS.APPROVE_LEASE(leaseId)
    );
  },

  rejectLease(
    leaseId: number,
    payload: RejectAssetLeasePayload
  ): Promise<AssetLeaseItem> {
    return apiClient.patch<AssetLeaseItem>(
      API_CONFIG.ENDPOINTS.ASSETS.REJECT_LEASE(leaseId),
      payload
    );
  },

  getPendingBerthingContracts(): Promise<OperatorBerthingContract[]> {
    return apiClient.get<OperatorBerthingContract[]>(
      API_CONFIG.ENDPOINTS.OPERATORS.PENDING_CONTRACTS
    );
  },

  reviewBerthingContract(
    contractId: number,
    payload: { decision: "APPROVE" | "REJECT"; notes?: string }
  ): Promise<OperatorBerthingContract> {
    return apiClient.patch<OperatorBerthingContract>(
      API_CONFIG.ENDPOINTS.OPERATORS.REVIEW_CONTRACT(contractId),
      payload
    );
  },

  verifyBerthingContract(
    contractId: number,
    payload: VerifyBerthingContractPayload
  ): Promise<OperatorBerthingContract> {
    return apiClient.patch<OperatorBerthingContract>(
      API_CONFIG.ENDPOINTS.OPERATORS.VERIFY_CONTRACT(contractId),
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

  // --- Detail & Dokumen Operator / Kapal / Kontrak PKS ---
  getOperatorById(operatorId: number | string): Promise<ShipOperatorItem> {
    return apiClient.get<ShipOperatorItem>(
      API_CONFIG.ENDPOINTS.OPERATORS.DETAIL(operatorId)
    );
  },

  getVesselsByOperator(
    operatorId: number | string,
    vesselCategory?: "BARANG" | "PENUMPANG" | "CAMPURAN"
  ): Promise<VesselItem[]> {
    return apiClient.get<VesselItem[]>(
      API_CONFIG.ENDPOINTS.OPERATORS.VESSELS(operatorId),
      vesselCategory ? { params: { vesselCategory } } : undefined
    );
  },

  uploadOperatorDocument(
    operatorId: number | string,
    payload: UploadDocumentPayload,
    file: File
  ): Promise<DocumentItem> {
    const formData = new FormData();
    formData.append("category", payload.category);
    if (payload.documentNumber) formData.append("documentNumber", payload.documentNumber);
    if (payload.notes) formData.append("notes", payload.notes);
    formData.append("file", file);
    return apiClient.post<DocumentItem>(
      API_CONFIG.ENDPOINTS.OPERATORS.DOCUMENTS(operatorId),
      formData
    );
  },

  uploadVesselDocument(
    vesselId: number | string,
    payload: UploadDocumentPayload,
    file: File
  ): Promise<DocumentItem> {
    const formData = new FormData();
    formData.append("category", payload.category);
    if (payload.documentNumber) formData.append("documentNumber", payload.documentNumber);
    if (payload.notes) formData.append("notes", payload.notes);
    formData.append("file", file);
    return apiClient.post<DocumentItem>(
      `${API_CONFIG.ENDPOINTS.VESSELS.LIST}/${vesselId}/documents`,
      formData
    );
  },

  getOperatorContracts(
    operatorId: number | string
  ): Promise<OperatorBerthingContract[]> {
    return apiClient.get<OperatorBerthingContract[]>(
      API_CONFIG.ENDPOINTS.OPERATORS.CONTRACTS(operatorId)
    );
  },

  createOperatorContract(
    operatorId: number | string,
    payload: CreateBerthingContractPayload
  ): Promise<OperatorBerthingContract> {
    const formData = new FormData();
    formData.append("title", payload.title);
    formData.append("portId", String(payload.portId));
    formData.append("startDate", payload.startDate);
    formData.append("endDate", payload.endDate);
    if (payload.monthlyQuota !== undefined) {
      formData.append("monthlyQuota", String(payload.monthlyQuota));
    }
    if (payload.dockAllocation) {
      formData.append("dockAllocation", payload.dockAllocation);
    }
    if (payload.file) {
      formData.append("file", payload.file);
    }
    return apiClient.post<OperatorBerthingContract>(
      API_CONFIG.ENDPOINTS.OPERATORS.CONTRACTS(operatorId),
      formData
    );
  },

  createDirectAssetLease(payload: {
    portId: number;
    assetId: number;
    tenantName: string;
    tenantNpwp?: string;
    tenantPhone?: string;
    startDate: string;
    endDate: string;
  }): Promise<AssetLeaseItem> {
    return apiClient.post<AssetLeaseItem>(API_CONFIG.ENDPOINTS.ASSETS.LEASES, payload);
  },

  // --- Penugasan (Assignments) & Lembar Tugas SOP (Tasks) ---
  getMyAssignments(): Promise<UserAssignmentItem[]> {
    return apiClient.get<UserAssignmentItem[]>(API_CONFIG.ENDPOINTS.ASSIGNMENTS.MY);
  },

  getPermissionsCatalog(): Promise<PermissionCatalogResponse> {
    return apiClient.get<PermissionCatalogResponse>(
      API_CONFIG.ENDPOINTS.ASSIGNMENTS.PERMISSIONS
    );
  },

  getTaskTemplates(): Promise<TaskTemplateItem[]> {
    return apiClient.get<TaskTemplateItem[]>(API_CONFIG.ENDPOINTS.TASKS.TEMPLATES);
  },

  getTasks(params?: {
    portId?: number;
    taskType?: string;
    executionStatus?: string;
    search?: string;
  }): Promise<OfficerTaskItem[]> {
    return apiClient
      .get<OfficerTaskItem[] | { data: OfficerTaskItem[] }>(
        API_CONFIG.ENDPOINTS.TASKS.BASE,
        params ? { params } : undefined
      )
      .then((res) => (Array.isArray(res) ? res : res.data || []));
  },

  getTaskById(taskId: number | string): Promise<OfficerTaskItem> {
    return apiClient.get<OfficerTaskItem>(
      API_CONFIG.ENDPOINTS.TASKS.DETAIL(taskId)
    );
  },

  createTask(payload: CreateOfficerTaskPayload): Promise<OfficerTaskItem> {
    return apiClient.post<OfficerTaskItem>(
      API_CONFIG.ENDPOINTS.TASKS.BASE,
      payload
    );
  },

  startTask(taskId: number | string): Promise<OfficerTaskItem> {
    return apiClient.patch<OfficerTaskItem>(
      API_CONFIG.ENDPOINTS.TASKS.START(taskId)
    );
  },

  updateTaskChecklist(
    taskId: number | string,
    payload: UpdateTaskChecklistPayload
  ): Promise<OfficerTaskItem> {
    return apiClient.patch<OfficerTaskItem>(
      API_CONFIG.ENDPOINTS.TASKS.CHECKLIST(taskId),
      payload
    );
  },

  uploadTaskAttachment(
    taskId: number | string,
    file: File,
    notes?: string
  ): Promise<TaskAttachmentItem> {
    const formData = new FormData();
    formData.append("file", file);
    if (notes) formData.append("notes", notes);
    return apiClient.post<TaskAttachmentItem>(
      API_CONFIG.ENDPOINTS.TASKS.ATTACHMENTS(taskId),
      formData
    );
  },

  submitTask(
    taskId: number | string,
    payload: SubmitOfficerTaskPayload
  ): Promise<OfficerTaskItem> {
    return apiClient.post<OfficerTaskItem>(
      API_CONFIG.ENDPOINTS.TASKS.SUBMIT(taskId),
      payload
    );
  },

  getDailyObligations(params?: {
    portId?: number;
    date?: string;
  }): Promise<DailyObligationRecapResponse> {
    return apiClient.get<DailyObligationRecapResponse>(
      API_CONFIG.ENDPOINTS.DAILY_REPORTS.OBLIGATIONS,
      params ? { params } : undefined
    );
  },
};
