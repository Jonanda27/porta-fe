import { create } from "zustand";
import { UptService } from "@/services/upt.service";
import {
  ApproveBerthingOverridePayload,
  AssetLeaseItem,
  AuditLogItem,
  BerthingRecordItem,
  CreateOfficerTaskPayload,
  DailyObligationRecapResponse,
  IssueWarningPayload,
  OfficerTaskItem,
  PermissionCatalogResponse,
  RevenueSummaryResponse,
  ShipOperatorItem,
  ShipVisitItem,
  SubmitOfficerTaskPayload,
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
import {
  CreateBerthingContractPayload,
  OperatorBerthingContract,
  UploadDocumentPayload,
} from "@/types/kapal.types";

interface UptState {
  operators: ShipOperatorItem[];
  vessels: VesselItem[];
  tenants: TenantItem[];
  pendingBerthingContracts: OperatorBerthingContract[];
  visits: ShipVisitItem[];
  unbilledVisits: ShipVisitItem[];
  pendingOverrides: BerthingRecordItem[];
  leases: AssetLeaseItem[];
  invoices: UptInvoiceItem[];
  auditLogs: AuditLogItem[];
  revenueSummary: RevenueSummaryResponse | null;
  warnings: WarningItem[];
  myAssignments: UserAssignmentItem[];
  permissionsCatalog: PermissionCatalogResponse | null;
  taskTemplates: TaskTemplateItem[];
  officerTasks: OfficerTaskItem[];
  dailyObligations: DailyObligationRecapResponse | null;
  lastVerificationFetchedAt: number;
  lastWorkspaceFetchedAt: number;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;

  fetchVerificationData: (force?: boolean) => Promise<void>;
  verifyOperator: (id: number, payload: VerifyEntityPayload) => Promise<void>;
  verifyVessel: (id: number, payload: VerifyEntityPayload) => Promise<void>;
  verifyTenant: (id: number, payload: VerifyTenantPayload) => Promise<void>;
  verifyBerthingContract: (
    contractId: number,
    status: "ACTIVE" | "REJECTED",
    reason?: string,
    signatureData?: string
  ) => Promise<void>;
  reviewBerthingContractByOfficer: (
    contractId: number,
    decision: "APPROVE" | "REJECT",
    notes?: string
  ) => Promise<void>;
  createBerthingContractForOperator: (
    operatorId: number,
    payload: CreateBerthingContractPayload
  ) => Promise<void>;
  uploadOperatorDocumentByOfficer: (
    operatorId: number,
    payload: UploadDocumentPayload,
    file: File
  ) => Promise<void>;
  uploadVesselDocumentByOfficer: (
    vesselId: number,
    payload: UploadDocumentPayload,
    file: File
  ) => Promise<void>;
  verifyRoomLease: (leaseId: number, portId?: number) => Promise<void>;

  fetchOfficerWorkspaceData: (portId?: number, force?: boolean) => Promise<void>;
  createOfficerTask: (payload: CreateOfficerTaskPayload) => Promise<void>;
  startOfficerTask: (taskId: number) => Promise<void>;
  updateOfficerTaskChecklist: (
    taskId: number,
    payload: UpdateTaskChecklistPayload
  ) => Promise<void>;
  uploadOfficerTaskAttachment: (
    taskId: number,
    file: File,
    notes?: string
  ) => Promise<void>;
  submitOfficerTask: (
    taskId: number,
    payload: SubmitOfficerTaskPayload
  ) => Promise<void>;

  fetchAllocationData: (portId?: number) => Promise<void>;
  approveVisit: (visitId: number, portId?: number, berthId?: number) => Promise<void>;
  decideOverride: (
    visitId: number,
    berthingId: number,
    payload: ApproveBerthingOverridePayload,
    portId?: number
  ) => Promise<void>;
  approveLease: (leaseId: number, portId?: number) => Promise<void>;
  rejectLease: (leaseId: number, reason: string, portId?: number) => Promise<void>;

  fetchDashboardData: (portId?: number) => Promise<void>;
  issueWarning: (payload: IssueWarningPayload, portId?: number) => Promise<void>;
  fetchAuditLogs: () => Promise<void>;
  clearError: () => void;
}

export const useUptStore = create<UptState>((set, get) => ({
  operators: [],
  vessels: [],
  tenants: [],
  pendingBerthingContracts: [],
  visits: [],
  unbilledVisits: [],
  pendingOverrides: [],
  leases: [],
  invoices: [],
  auditLogs: [],
  revenueSummary: null,
  warnings: [],
  myAssignments: [],
  permissionsCatalog: null,
  taskTemplates: [],
  officerTasks: [],
  dailyObligations: null,
  lastVerificationFetchedAt: 0,
  lastWorkspaceFetchedAt: 0,
  isLoading: false,
  isSubmitting: false,
  error: null,

  fetchVerificationData: async (force = false) => {
    const state = get();
    const hasCachedData =
      state.operators.length > 0 ||
      state.vessels.length > 0 ||
      state.leases.length > 0;
    const isCacheFresh = Date.now() - state.lastVerificationFetchedAt < 45_000;

    // Jika data sudah ada di memori dan masih segar (<45 detik), langsung gunakan cache (0ms, tanpa hit ulang API)
    if (!force && hasCachedData && isCacheFresh) {
      return;
    }

    // Stale-While-Revalidate: hanya tampilkan spinner penuh jika belum ada data sama sekali
    if (!hasCachedData) {
      set({ isLoading: true, error: null });
    } else {
      set({ error: null });
    }

    try {
      const [operators, vessels, tenants, pendingBerthingContracts, leases] =
        await Promise.all([
          UptService.getOperators().catch(() => state.operators),
          UptService.getVessels().catch(() => state.vessels),
          UptService.getTenants().catch(() => state.tenants),
          UptService.getPendingBerthingContracts().catch(
            () => state.pendingBerthingContracts
          ),
          UptService.getLeases().catch(() => state.leases),
        ]);
      set({
        operators,
        vessels,
        tenants,
        pendingBerthingContracts,
        leases,
        lastVerificationFetchedAt: Date.now(),
        isLoading: false,
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal memuat data verifikasi.";
      set({ error: message, isLoading: false });
    }
  },

  verifyOperator: async (id: number, payload: VerifyEntityPayload) => {
    set({ isSubmitting: true, error: null });
    try {
      await UptService.verifyOperator(id, payload);
      await get().fetchVerificationData(true);
      set({ isSubmitting: false });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal memverifikasi operator.";
      set({ error: message, isSubmitting: false });
      throw err;
    }
  },

  verifyVessel: async (id: number, payload: VerifyEntityPayload) => {
    set({ isSubmitting: true, error: null });
    try {
      await UptService.verifyVessel(id, payload);
      await get().fetchVerificationData(true);
      set({ isSubmitting: false });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal memverifikasi kapal.";
      set({ error: message, isSubmitting: false });
      throw err;
    }
  },

  verifyTenant: async (id: number, payload: VerifyTenantPayload) => {
    set({ isSubmitting: true, error: null });
    try {
      await UptService.verifyTenant(id, payload);
      await get().fetchVerificationData(true);
      set({ isSubmitting: false });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal memverifikasi tenant.";
      set({ error: message, isSubmitting: false });
      throw err;
    }
  },

  verifyBerthingContract: async (
    contractId: number,
    status: "ACTIVE" | "REJECTED",
    reason?: string,
    signatureData?: string
  ) => {
    set({ isSubmitting: true, error: null });
    try {
      await UptService.verifyBerthingContract(contractId, {
        status,
        rejectionReason: reason,
        signatureData,
      });
      await get().fetchVerificationData(true);
      set({ isSubmitting: false });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal memverifikasi PKS Sandar.";
      set({ error: message, isSubmitting: false });
      throw err;
    }
  },

  reviewBerthingContractByOfficer: async (
    contractId: number,
    decision: "APPROVE" | "REJECT",
    notes?: string
  ) => {
    set({ isSubmitting: true, error: null });
    try {
      await UptService.reviewBerthingContract(contractId, {
        decision,
        notes,
      });
      await get().fetchVerificationData(true);
      set({ isSubmitting: false });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal meninjau prasyarat PKS Sandar.";
      set({ error: message, isSubmitting: false });
      throw err;
    }
  },

  createBerthingContractForOperator: async (
    operatorId: number,
    payload: CreateBerthingContractPayload
  ) => {
    set({ isSubmitting: true, error: null });
    try {
      await UptService.createOperatorContract(operatorId, payload);
      await get().fetchVerificationData(true);
      set({ isSubmitting: false });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal mendaftarkan kontrak PKS Sandar.";
      set({ error: message, isSubmitting: false });
      throw err;
    }
  },

  uploadOperatorDocumentByOfficer: async (
    operatorId: number,
    payload: UploadDocumentPayload,
    file: File
  ) => {
    set({ isSubmitting: true, error: null });
    try {
      await UptService.uploadOperatorDocument(operatorId, payload, file);
      await get().fetchVerificationData(true);
      set({ isSubmitting: false });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal mengunggah dokumen operator.";
      set({ error: message, isSubmitting: false });
      throw err;
    }
  },

  uploadVesselDocumentByOfficer: async (
    vesselId: number,
    payload: UploadDocumentPayload,
    file: File
  ) => {
    set({ isSubmitting: true, error: null });
    try {
      await UptService.uploadVesselDocument(vesselId, payload, file);
      await get().fetchVerificationData(true);
      set({ isSubmitting: false });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal mengunggah dokumen kapal.";
      set({ error: message, isSubmitting: false });
      throw err;
    }
  },

  fetchOfficerWorkspaceData: async (portId?: number, force = false) => {
    const state = get();
    const hasCachedWorkspace =
      state.myAssignments.length > 0 || state.officerTasks.length > 0;
    const isCacheFresh = Date.now() - state.lastWorkspaceFetchedAt < 45_000;

    if (!force && hasCachedWorkspace && isCacheFresh) {
      return;
    }

    if (!hasCachedWorkspace) {
      set({ isLoading: true, error: null });
    } else {
      set({ error: null });
    }

    try {
      const [
        myAssignments,
        permissionsCatalog,
        taskTemplates,
        officerTasks,
        dailyObligations,
      ] = await Promise.all([
        UptService.getMyAssignments().catch(() => state.myAssignments),
        UptService.getPermissionsCatalog().catch(() => state.permissionsCatalog),
        UptService.getTaskTemplates().catch(() => state.taskTemplates),
        UptService.getTasks(portId ? { portId } : undefined).catch(
          () => state.officerTasks
        ),
        UptService.getDailyObligations(portId ? { portId } : undefined).catch(
          () => state.dailyObligations
        ),
      ]);
      set({
        myAssignments,
        permissionsCatalog,
        taskTemplates,
        officerTasks,
        dailyObligations,
        lastWorkspaceFetchedAt: Date.now(),
        isLoading: false,
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal memuat data penugasan & tugas.";
      set({ error: message, isLoading: false });
    }
  },

  createOfficerTask: async (payload: CreateOfficerTaskPayload) => {
    set({ isSubmitting: true, error: null });
    try {
      await UptService.createTask(payload);
      await get().fetchOfficerWorkspaceData(payload.portId, true);
      set({ isSubmitting: false });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal membuat lembar tugas baru.";
      set({ error: message, isSubmitting: false });
      throw err;
    }
  },

  startOfficerTask: async (taskId: number) => {
    set({ isSubmitting: true, error: null });
    try {
      await UptService.startTask(taskId);
      await get().fetchOfficerWorkspaceData();
      set({ isSubmitting: false });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal memulai tugas.";
      set({ error: message, isSubmitting: false });
      throw err;
    }
  },

  updateOfficerTaskChecklist: async (
    taskId: number,
    payload: UpdateTaskChecklistPayload
  ) => {
    set({ isSubmitting: true, error: null });
    try {
      await UptService.updateTaskChecklist(taskId, payload);
      await get().fetchOfficerWorkspaceData();
      set({ isSubmitting: false });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal menyimpan checklist tugas.";
      set({ error: message, isSubmitting: false });
      throw err;
    }
  },

  uploadOfficerTaskAttachment: async (
    taskId: number,
    file: File,
    notes?: string
  ) => {
    set({ isSubmitting: true, error: null });
    try {
      await UptService.uploadTaskAttachment(taskId, file, notes);
      await get().fetchOfficerWorkspaceData();
      set({ isSubmitting: false });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal mengunggah lampiran bukti tugas.";
      set({ error: message, isSubmitting: false });
      throw err;
    }
  },

  submitOfficerTask: async (
    taskId: number,
    payload: SubmitOfficerTaskPayload
  ) => {
    set({ isSubmitting: true, error: null });
    try {
      await UptService.submitTask(taskId, payload);
      await get().fetchOfficerWorkspaceData();
      set({ isSubmitting: false });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal mengirim lembar tugas.";
      set({ error: message, isSubmitting: false });
      throw err;
    }
  },

  verifyRoomLease: async (leaseId: number, portId?: number) => {
    set({ isSubmitting: true, error: null });
    try {
      await UptService.verifyRoomLease(leaseId);
      await get().fetchAllocationData(portId);
      await get().fetchVerificationData();
      set({ isSubmitting: false });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal memverifikasi sewa ruangan.";
      set({ error: message, isSubmitting: false });
      throw err;
    }
  },

  fetchAllocationData: async (portId?: number) => {
    set({ isLoading: true, error: null });
    try {
      const [visits, pendingOverrides, leases] = await Promise.all([
        UptService.getVisits(portId),
        UptService.getPendingBerthingOverrides(portId),
        UptService.getLeases(portId),
      ]);
      set({ visits, pendingOverrides, leases, isLoading: false });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal memuat data alokasi.";
      set({ error: message, isLoading: false });
    }
  },

  approveVisit: async (visitId: number, portId?: number, berthId?: number) => {
    set({ isSubmitting: true, error: null });
    try {
      await UptService.approveVisit(visitId, berthId);
      await get().fetchAllocationData(portId);
      set({ isSubmitting: false });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal menyetujui kunjungan kapal.";
      set({ error: message, isSubmitting: false });
      throw err;
    }
  },

  decideOverride: async (
    visitId: number,
    berthingId: number,
    payload: ApproveBerthingOverridePayload,
    portId?: number
  ) => {
    set({ isSubmitting: true, error: null });
    try {
      await UptService.approveBerthingOverride(visitId, berthingId, payload);
      await get().fetchAllocationData(portId);
      set({ isSubmitting: false });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal memproses override sandar.";
      set({ error: message, isSubmitting: false });
      throw err;
    }
  },

  approveLease: async (leaseId: number, portId?: number) => {
    set({ isSubmitting: true, error: null });
    try {
      await UptService.approveLease(leaseId);
      await get().fetchAllocationData(portId);
      set({ isSubmitting: false });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal menyetujui pengajuan sewa.";
      set({ error: message, isSubmitting: false });
      throw err;
    }
  },

  rejectLease: async (leaseId: number, reason: string, portId?: number) => {
    set({ isSubmitting: true, error: null });
    try {
      await UptService.rejectLease(leaseId, { rejectionReason: reason });
      await get().fetchAllocationData(portId);
      set({ isSubmitting: false });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal menolak pengajuan sewa.";
      set({ error: message, isSubmitting: false });
      throw err;
    }
  },

  fetchDashboardData: async (portId?: number) => {
    set({ isLoading: true, error: null });
    try {
      const [visits, leases, warnings, revenueSummary, unbilledVisits, invoices] =
        await Promise.all([
          UptService.getVisits(portId),
          UptService.getLeases(portId),
          UptService.getWarnings(portId),
          UptService.getRevenueSummary(portId).catch(() => null),
          UptService.getUnbilledVisits(portId).catch(() => []),
          UptService.getInvoices(portId).catch(() => []),
        ]);
      set({
        visits,
        leases,
        warnings,
        revenueSummary,
        unbilledVisits,
        invoices,
        isLoading: false,
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal memuat data command center.";
      set({ error: message, isLoading: false });
    }
  },

  issueWarning: async (payload, portId) => {
    set({ isSubmitting: true, error: null });
    try {
      await UptService.issueWarning(payload);
      await get().fetchDashboardData(portId);
      set({ isSubmitting: false });
    } catch (err: unknown) {
      set({
        error: err instanceof Error ? err.message : "Gagal menerbitkan surat teguran.",
        isSubmitting: false,
      });
      throw err;
    }
  },

  fetchAuditLogs: async () => {
    try {
      const auditLogs = await UptService.getAuditLogs();
      set({ auditLogs });
    } catch {
      // Hanya SUPERADMIN yang berhak membaca audit logs
    }
  },

  clearError: () => set({ error: null }),
}));
