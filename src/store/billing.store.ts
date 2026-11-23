import { create } from "zustand";
import {
  BillingAdjustment,
  BillingInvoice,
  CheckoutPaymentDto,
  CheckoutPaymentResponse,
  CreateBillingAdjustmentDto,
  CreateWarningDto,
  DecideBillingAdjustmentDto,
  GenerateBillingDto,
  InvoicePrintPayload,
  PaymentConfig,
  RecordPaymentDto,
  RevenueSummary,
  SubmitPaymentProofDto,
  UnbilledVisit,
  WarningRecord,
} from "@/types/billing.types";
import {
  AssetLease,
  LeasePaymentReceiptPayload,
  PortAsset,
  RecordLeasePaymentDto,
} from "@/types/asset.types";
import {
  CloseGateHandoverPayload,
  CreateGateTicketBookPayload,
  FerryRouteItem,
  GateHandoverItem,
  GateTicketBookItem,
} from "@/types/field-ops.types";
import { VesselManifestItem } from "@/types/manifest.types";
import { BillingService } from "@/services/billing.service";
import { FieldOpsService } from "@/services/field-ops.service";
import { ApiException } from "@/lib/api-client";

interface BillingState {
  invoices: BillingInvoice[];
  adjustments: BillingAdjustment[];
  warnings: WarningRecord[];
  leases: AssetLease[];
  assets: PortAsset[];
  ticketBooks: GateTicketBookItem[];
  ferryRoutes: FerryRouteItem[];
  handovers: GateHandoverItem[];
  manifests: VesselManifestItem[];
  revenueSummary: RevenueSummary | null;
  unbilledVisits: UnbilledVisit[];
  activePrintPayload: InvoicePrintPayload | null;
  activeLeaseReceipt: LeasePaymentReceiptPayload | null;
  paymentConfig: PaymentConfig | null;
  activeCheckoutSession: CheckoutPaymentResponse | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchInvoices: () => Promise<void>;
  fetchPaymentConfig: () => Promise<PaymentConfig | null>;
  checkoutPayment: (dto: CheckoutPaymentDto) => Promise<CheckoutPaymentResponse>;
  clearCheckoutSession: () => void;
  fetchAdjustments: () => Promise<void>;
  fetchWarnings: () => Promise<void>;
  fetchLeases: () => Promise<void>;
  fetchAssets: () => Promise<void>;
  fetchTicketBooks: () => Promise<void>;
  createTicketBook: (payload: CreateGateTicketBookPayload) => Promise<GateTicketBookItem>;
  fetchFerryRoutes: (portId?: number) => Promise<void>;
  fetchHandovers: () => Promise<void>;
  fetchManifests: () => Promise<void>;
  closeHandover: (
    handoverId: number,
    dto: CloseGateHandoverPayload
  ) => Promise<GateHandoverItem>;
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
  fetchLeasePaymentReceipt: (paymentId: number) => Promise<LeasePaymentReceiptPayload>;
  clearActiveLeaseReceipt: () => void;
  generateVisitEstimate: (
    visitId: number,
    dto?: GenerateBillingDto
  ) => Promise<BillingInvoice>;
  generateAdvanceSkrd: (
    visitId: number,
    dto?: GenerateBillingDto
  ) => Promise<BillingInvoice>;
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
  ticketBooks: [],
  ferryRoutes: [],
  handovers: [],
  manifests: [],
  revenueSummary: null,
  unbilledVisits: [],
  activePrintPayload: null,
  activeLeaseReceipt: null,
  paymentConfig: null,
  activeCheckoutSession: null,
  isLoading: false,
  error: null,

  fetchPaymentConfig: async () => {
    try {
      const config = await BillingService.getPaymentConfig();
      set({ paymentConfig: config });
      return config;
    } catch (err: unknown) {
      console.warn("Gagal memuat konfigurasi payment gateway:", err);
      return null;
    }
  },

  checkoutPayment: async (dto: CheckoutPaymentDto) => {
    set({ isLoading: true, error: null });
    try {
      const session = await BillingService.checkoutPayment(dto);
      set({ activeCheckoutSession: session, isLoading: false });
      return session;
    } catch (err: unknown) {
      const message =
        err instanceof ApiException
          ? err.message
          : err instanceof Error
          ? err.message
          : "Gagal memproses sesi pembayaran online.";
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  clearCheckoutSession: () => {
    set({ activeCheckoutSession: null });
  },

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

  generateAdvanceSkrd: async (visitId: number, dto: GenerateBillingDto = {}) => {
    set({ isLoading: true, error: null });
    try {
      const invoice = await BillingService.generateAdvanceSkrd(visitId, dto);
      await Promise.all([
        get().fetchInvoices(),
        get().fetchUnbilledVisits(),
        get().fetchRevenueSummary(),
      ]);
      set({ isLoading: false });
      return invoice;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal menerbitkan e-SKRD Uang Muka.";
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

  fetchLeasePaymentReceipt: async (paymentId: number): Promise<LeasePaymentReceiptPayload> => {
    set({ isLoading: true, error: null });
    try {
      const receipt = await BillingService.getLeasePaymentReceipt(paymentId);
      set({ activeLeaseReceipt: receipt, isLoading: false });
      return receipt;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal memuat kuitansi e-SSRD sewa aset.";
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  clearActiveLeaseReceipt: () => {
    set({ activeLeaseReceipt: null });
  },

  generateVisitEstimate: async (
    visitId: number,
    dto: GenerateBillingDto = {}
  ): Promise<BillingInvoice> => {
    set({ isLoading: true, error: null });
    try {
      const estimate = await BillingService.generateVisitEstimate(visitId, dto);
      await get().fetchInvoices();
      set({ isLoading: false });
      return estimate;
    } catch (err: unknown) {
      const message =
        err instanceof ApiException
          ? err.message
          : err instanceof Error
          ? err.message
          : "Gagal menghitung estimasi tagihan resmi dari server.";
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

  fetchTicketBooks: async () => {
    try {
      const ticketBooks = await BillingService.getTicketBooks();
      set({ ticketBooks });
    } catch (err: unknown) {
      console.error("Gagal memuat inventaris buku karcis/tiket:", err);
    }
  },

  createTicketBook: async (payload: CreateGateTicketBookPayload) => {
    set({ isLoading: true, error: null });
    try {
      const created = await FieldOpsService.createTicketBook(payload);
      await get().fetchTicketBooks();
      set({ isLoading: false });
      return created;
    } catch (err: unknown) {
      const message =
        err instanceof ApiException
          ? err.message
          : err instanceof Error
          ? err.message
          : "Gagal menerbitkan buku karcis baru.";
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  fetchFerryRoutes: async (portId?: number) => {
    try {
      const ferryRoutes = await FieldOpsService.getFerryRoutes(portId);
      set({ ferryRoutes });
    } catch (err: unknown) {
      console.error("Gagal memuat daftar rute penyeberangan:", err);
    }
  },

  fetchHandovers: async () => {
    try {
      const handovers = await BillingService.getHandovers();
      set({ handovers });
    } catch (err: unknown) {
      console.error("Gagal memuat daftar sesi serah terima gerbang:", err);
    }
  },

  fetchManifests: async () => {
    try {
      const manifests = await BillingService.getManifests();
      set({ manifests });
    } catch (err: unknown) {
      console.error("Gagal memuat daftar manifes kapal penyeberangan:", err);
    }
  },

  closeHandover: async (handoverId: number, dto: CloseGateHandoverPayload) => {
    set({ isLoading: true, error: null });
    try {
      const settled = await BillingService.closeHandover(handoverId, dto);
      await Promise.all([
        get().fetchHandovers(),
        get().fetchTicketBooks(),
        get().fetchRevenueSummary(),
      ]);
      set({ isLoading: false });
      return settled;
    } catch (err: unknown) {
      const message =
        err instanceof ApiException
          ? err.message
          : err instanceof Error
          ? err.message
          : "Gagal menutup sesi serah terima tiket gerbang.";
      set({ isLoading: false, error: message });
      throw err;
    }
  },
}));
