import { create } from "zustand";
import {
  BillingAdjustment,
  BillingInvoice,
  CreateBillingAdjustmentDto,
  CreateWarningDto,
  DecideBillingAdjustmentDto,
  GenerateBillingDto,
  InvoicePrintPayload,
  RecordPaymentDto,
  RevenueSummary,
  SubmitPaymentProofDto,
  UnbilledVisit,
  WarningRecord,
} from "@/types/billing.types";
import {
  AssetLease,
  PortAsset,
  RecordLeasePaymentDto,
} from "@/types/asset.types";
import { BillingService } from "@/services/billing.service";
import { ApiException } from "@/lib/api-client";

interface BillingState {
  invoices: BillingInvoice[];
  adjustments: BillingAdjustment[];
  warnings: WarningRecord[];
  leases: AssetLease[];
  assets: PortAsset[];
  revenueSummary: RevenueSummary | null;
  unbilledVisits: UnbilledVisit[];
  activePrintPayload: InvoicePrintPayload | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchInvoices: () => Promise<void>;
  fetchAdjustments: () => Promise<void>;
  fetchWarnings: () => Promise<void>;
  fetchLeases: () => Promise<void>;
  fetchAssets: () => Promise<void>;
  fetchRevenueSummary: (portId?: number) => Promise<void>;
  fetchUnbilledVisits: (portId?: number) => Promise<void>;
  fetchPrintPayload: (invoiceId: number) => Promise<InvoicePrintPayload>;
  submitPaymentProof: (
    invoiceId: number,
    payload: SubmitPaymentProofDto,
    file?: File | Blob
  ) => Promise<void>;
  requestAdjustment: (
    invoiceId: number,
    dto: CreateBillingAdjustmentDto
  ) => Promise<BillingAdjustment>;
  decideAdjustment: (
    adjustmentId: number,
    dto: DecideBillingAdjustmentDto
  ) => Promise<void>;
  verifyPayment: (paymentId: number) => Promise<void>;
  recordCashPayment: (invoiceId: number, dto: RecordPaymentDto) => Promise<void>;
  recordLeasePayment: (leaseId: number, dto: RecordLeasePaymentDto) => Promise<void>;
  generateFinalSkrd: (
    visitId: number,
    dto?: GenerateBillingDto
  ) => Promise<BillingInvoice>;
  issueInvoice: (invoiceId: number) => Promise<void>;
  voidInvoice: (invoiceId: number, reason: string) => Promise<void>;
  issueWarning: (dto: CreateWarningDto) => Promise<WarningRecord>;
}

export const useBillingStore = create<BillingState>((set, get) => ({
  invoices: [],
  adjustments: [],
  warnings: [],
  leases: [],
  assets: [],
  revenueSummary: null,
  unbilledVisits: [],
  activePrintPayload: null,
  isLoading: false,
  error: null,

  fetchInvoices: async () => {
    set({ isLoading: true, error: null });
    try {
      const invoices = await BillingService.getAllInvoices();
      set({ invoices, isLoading: false, error: null });
    } catch (err: unknown) {
      const message =
        err instanceof ApiException
          ? err.message
          : err instanceof Error
          ? err.message
          : "Gagal memuat daftar tagihan e-SKRD.";
      set({ isLoading: false, error: message });
    }
  },

  fetchRevenueSummary: async (portId?: number) => {
    try {
      const revenueSummary = await BillingService.getRevenueSummary(portId);
      set({ revenueSummary });
    } catch (err: unknown) {
      console.error("Gagal memuat ringkasan pendapatan PAD:", err);
    }
  },

  fetchUnbilledVisits: async (portId?: number) => {
    try {
      const unbilledVisits = await BillingService.getUnbilledVisits(portId);
      set({ unbilledVisits });
    } catch (err: unknown) {
      console.error("Gagal memuat daftar kunjungan belum ditagih:", err);
    }
  },

  verifyPayment: async (paymentId: number) => {
    set({ isLoading: true, error: null });
    try {
      await BillingService.verifyPayment(paymentId);
      await Promise.all([get().fetchInvoices(), get().fetchRevenueSummary()]);
      set({ isLoading: false });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal memverifikasi pembayaran.";
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  recordCashPayment: async (invoiceId: number, dto: RecordPaymentDto) => {
    set({ isLoading: true, error: null });
    try {
      await BillingService.recordPayment(invoiceId, dto);
      await Promise.all([get().fetchInvoices(), get().fetchRevenueSummary()]);
      set({ isLoading: false });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal mencatat pembayaran loket.";
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  generateFinalSkrd: async (visitId: number, dto: GenerateBillingDto = {}) => {
    set({ isLoading: true, error: null });
    try {
      const invoice = await BillingService.generateFinalSkrd(visitId, dto);
      await Promise.all([
        get().fetchInvoices(),
        get().fetchUnbilledVisits(),
        get().fetchRevenueSummary(),
      ]);
      set({ isLoading: false });
      return invoice;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal menerbitkan e-SKRD Rampung.";
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  issueInvoice: async (invoiceId: number) => {
    set({ isLoading: true, error: null });
    try {
      await BillingService.issueInvoice(invoiceId);
      await get().fetchInvoices();
      set({ isLoading: false });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal menetapkan resmi e-SKRD.";
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  voidInvoice: async (invoiceId: number, reason: string) => {
    set({ isLoading: true, error: null });
    try {
      await BillingService.voidInvoice(invoiceId, { voidReason: reason });
      await Promise.all([get().fetchInvoices(), get().fetchRevenueSummary()]);
      set({ isLoading: false });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal membatalkan e-SKRD.";
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  fetchAdjustments: async () => {
    try {
      const adjustments = await BillingService.getAdjustments();
      set({ adjustments });
    } catch (err: unknown) {
      console.error("Gagal memuat daftar permohonan penyesuaian tagihan:", err);
    }
  },

  fetchWarnings: async () => {
    try {
      const warnings = await BillingService.getWarnings();
      set({ warnings });
    } catch (err: unknown) {
      console.error("Gagal memuat daftar surat teguran retribusi:", err);
    }
  },

  fetchPrintPayload: async (invoiceId: number): Promise<InvoicePrintPayload> => {
    try {
      const payload = await BillingService.getInvoicePrintPayload(invoiceId);
      set({ activePrintPayload: payload });
      return payload;
    } catch (err: unknown) {
      console.error("Gagal mengambil rincian cetak invoice:", err);
      throw err;
    }
  },

  submitPaymentProof: async (
    invoiceId: number,
    payload: SubmitPaymentProofDto,
    file?: File | Blob
  ): Promise<void> => {
    set({ isLoading: true, error: null });
    try {
      await BillingService.submitPaymentProof(invoiceId, payload, file);
      await get().fetchInvoices();
      set({ isLoading: false });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal mengirim bukti pembayaran.";
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  requestAdjustment: async (
    invoiceId: number,
    dto: CreateBillingAdjustmentDto
  ): Promise<BillingAdjustment> => {
    set({ isLoading: true, error: null });
    try {
      const adj = await BillingService.requestAdjustment(invoiceId, dto);
      await Promise.all([get().fetchAdjustments(), get().fetchInvoices()]);
      set({ isLoading: false });
      return adj;
    } catch (err: unknown) {
      const message =
        err instanceof ApiException
          ? err.message
          : err instanceof Error
          ? err.message
          : "Gagal mengajukan permohonan penyesuaian e-SKRD.";
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  decideAdjustment: async (
    adjustmentId: number,
    dto: DecideBillingAdjustmentDto
  ): Promise<void> => {
    set({ isLoading: true, error: null });
    try {
      await BillingService.decideAdjustment(adjustmentId, dto);
      await Promise.all([get().fetchAdjustments(), get().fetchInvoices()]);
      set({ isLoading: false });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal menetapkan keputusan keberatan.";
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  fetchLeases: async () => {
    set({ isLoading: true, error: null });
    try {
      const leases = await BillingService.listLeases();
      set({ leases, isLoading: false });
    } catch (err: unknown) {
      console.error("Gagal memuat daftar kontrak sewa tenant:", err);
      set({ isLoading: false, error: "Gagal memuat data sewa tenant." });
    }
  },

  fetchAssets: async () => {
    try {
      const assets = await BillingService.listAssets();
      set({ assets });
    } catch (err: unknown) {
      console.error("Gagal memuat master aset pelabuhan:", err);
    }
  },

  recordLeasePayment: async (
    leaseId: number,
    dto: RecordLeasePaymentDto
  ): Promise<void> => {
    set({ isLoading: true, error: null });
    try {
      await BillingService.recordLeasePayment(leaseId, dto);
      await Promise.all([get().fetchLeases(), get().fetchRevenueSummary()]);
      set({ isLoading: false });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal mencatat penerimaan sewa aset.";
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  issueWarning: async (dto: CreateWarningDto) => {
    set({ isLoading: true, error: null });
    try {
      const record = await BillingService.issueWarning(dto);
      await get().fetchWarnings();
      set({ isLoading: false });
      return record;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal menerbitkan surat teguran.";
      set({ isLoading: false, error: message });
      throw err;
    }
  },
}));
