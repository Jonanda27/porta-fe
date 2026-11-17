import { create } from "zustand";
import {
  BillingInvoice,
  InvoicePrintPayload,
  SubmitPaymentProofDto,
} from "@/types/billing.types";
import { BillingService } from "@/services/billing.service";
import { ApiException } from "@/lib/api-client";

interface BillingState {
  invoices: BillingInvoice[];
  activePrintPayload: InvoicePrintPayload | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchInvoices: () => Promise<void>;
  fetchPrintPayload: (invoiceId: number) => Promise<InvoicePrintPayload>;
  submitPaymentProof: (
    invoiceId: number,
    payload: SubmitPaymentProofDto,
    file?: File | Blob
  ) => Promise<void>;
}

export const useBillingStore = create<BillingState>((set, get) => ({
  invoices: [],
  activePrintPayload: null,
  isLoading: false,
  error: null,

  fetchInvoices: async () => {
    set({ isLoading: true, error: null });
    try {
      const invoices = await BillingService.getMyInvoices();
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
      // Refresh daftar invoice
      await get().fetchInvoices();
      set({ isLoading: false });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal mengirim bukti pembayaran.";
      set({ isLoading: false, error: message });
      throw err;
    }
  },
}));
