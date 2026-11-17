import { create } from "zustand";
import { TariffService } from "@/services/tariff.service";
import {
  CreateTariffPayload,
  TariffItem,
  UsdExchangeRateResponse,
} from "@/types/tariff.types";

interface TariffState {
  tariffs: TariffItem[];
  usdRate: UsdExchangeRateResponse | null;
  isLoading: boolean;
  isRateLoading: boolean;
  isSubmitting: boolean;
  error: string | null;

  fetchTariffs: () => Promise<void>;
  fetchUsdRate: (refresh?: boolean) => Promise<void>;
  createTariff: (payload: CreateTariffPayload) => Promise<void>;
  deactivateTariff: (tariffId: number) => Promise<void>;
  clearError: () => void;
}

export const useTariffStore = create<TariffState>((set, get) => ({
  tariffs: [],
  usdRate: null,
  isLoading: false,
  isRateLoading: false,
  isSubmitting: false,
  error: null,

  fetchTariffs: async () => {
    set({ isLoading: true, error: null });
    try {
      const tariffs = await TariffService.getAllActiveTariffs();
      set({ tariffs, isLoading: false });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal memuat daftar tarif Perda.";
      set({ error: message, isLoading: false });
    }
  },

  fetchUsdRate: async (refresh = false) => {
    set({ isRateLoading: true });
    try {
      const usdRate = await TariffService.getLiveUsdRate(refresh);
      set({ usdRate, isRateLoading: false });
    } catch {
      set({ isRateLoading: false });
    }
  },

  createTariff: async (payload: CreateTariffPayload) => {
    set({ isSubmitting: true, error: null });
    try {
      await TariffService.createTariff(payload);
      await get().fetchTariffs();
      set({ isSubmitting: false });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal menambahkan tarif baru.";
      set({ error: message, isSubmitting: false });
      throw err;
    }
  },

  deactivateTariff: async (tariffId: number) => {
    set({ isSubmitting: true, error: null });
    try {
      await TariffService.deactivateTariff(tariffId);
      set((state) => ({
        tariffs: state.tariffs.filter((t) => t.id !== tariffId),
        isSubmitting: false,
      }));
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal menonaktifkan tarif.";
      set({ error: message, isSubmitting: false });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));
