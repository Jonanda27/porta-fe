import { create } from "zustand";
import { UptService } from "@/services/upt.service";
import {
  ApproveBerthingOverridePayload,
  AssetLeaseItem,
  AuditLogItem,
  BerthingRecordItem,
  IssueWarningPayload,
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

interface UptState {
  operators: ShipOperatorItem[];
  vessels: VesselItem[];
  tenants: TenantItem[];
  visits: ShipVisitItem[];
  unbilledVisits: ShipVisitItem[];
  pendingOverrides: BerthingRecordItem[];
  leases: AssetLeaseItem[];
  invoices: UptInvoiceItem[];
  auditLogs: AuditLogItem[];
  revenueSummary: RevenueSummaryResponse | null;
  warnings: WarningItem[];
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;

  fetchVerificationData: () => Promise<void>;
  verifyOperator: (id: number, payload: VerifyEntityPayload) => Promise<void>;
  verifyVessel: (id: number, payload: VerifyEntityPayload) => Promise<void>;
  verifyTenant: (id: number, payload: VerifyTenantPayload) => Promise<void>;

  fetchAllocationData: (portId?: number) => Promise<void>;
  approveVisit: (visitId: number, portId?: number) => Promise<void>;
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
  visits: [],
  unbilledVisits: [],
  pendingOverrides: [],
  leases: [],
  invoices: [],
  auditLogs: [],
  revenueSummary: null,
  warnings: [],
  isLoading: false,
  isSubmitting: false,
  error: null,

  fetchVerificationData: async () => {
    set({ isLoading: true, error: null });
    try {
      const [operators, vessels, tenants] = await Promise.all([
        UptService.getOperators(),
        UptService.getVessels(),
        UptService.getTenants(),
      ]);
      set({ operators, vessels, tenants, isLoading: false });
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
      await get().fetchVerificationData();
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
      await get().fetchVerificationData();
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
      await get().fetchVerificationData();
      set({ isSubmitting: false });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal memverifikasi tenant.";
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

  approveVisit: async (visitId: number, portId?: number) => {
    set({ isSubmitting: true, error: null });
    try {
      await UptService.approveVisit(visitId);
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
