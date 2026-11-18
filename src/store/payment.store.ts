import { create } from "zustand";
import { PaymentService } from "@/services/payment.service";
import {
  CheckoutPaymentPayload,
  CheckoutPaymentResponse,
  PaymentConfigResponse,
  UpdatePaymentConfigPayload,
} from "@/types/payment.types";

interface PaymentState {
  config: PaymentConfigResponse | null;
  isLoading: boolean;
  isUpdating: boolean;
  error: string | null;

  fetchConfig: () => Promise<void>;
  updateConfig: (payload: UpdatePaymentConfigPayload) => Promise<void>;
  checkout: (payload: CheckoutPaymentPayload) => Promise<CheckoutPaymentResponse>;
  clearError: () => void;
}

export const usePaymentStore = create<PaymentState>((set) => ({
  config: null,
  isLoading: false,
  isUpdating: false,
  error: null,

  fetchConfig: async () => {
    set({ isLoading: true, error: null });
    try {
      const config = await PaymentService.getConfig();
      set({ config, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  updateConfig: async (payload: UpdatePaymentConfigPayload) => {
    set({ isUpdating: true, error: null });
    try {
      const config = await PaymentService.updateConfig(payload);
      set({ config, isUpdating: false });
    } catch (err: unknown) {
      set({
        error:
          err instanceof Error
            ? err.message
            : "Gagal memperbarui konfigurasi pembayaran.",
        isUpdating: false,
      });
      throw err;
    }
  },

  checkout: async (payload: CheckoutPaymentPayload) => {
    set({ isUpdating: true, error: null });
    try {
      const result = await PaymentService.checkout(payload);
      set({ isUpdating: false });
      return result;
    } catch (err: unknown) {
      set({
        error:
          err instanceof Error
            ? err.message
            : "Gagal membuat sesi pembayaran online.",
        isUpdating: false,
      });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));
