import { create } from "zustand";
import {
  CargoHandlingRecord,
  EquipmentRentalRecord,
  PayChargeDto,
  UtilityMeterReading,
  UtilityReceiptPayload,
} from "@/types/cargo-utility.types";
import { CargoUtilityService } from "@/services/cargo-utility.service";
import { ApiException } from "@/lib/api-client";

interface CargoUtilityState {
  utilities: UtilityMeterReading[];
  cargoRecords: CargoHandlingRecord[];
  equipmentRentals: EquipmentRentalRecord[];
  activeReceipt: UtilityReceiptPayload | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchUtilities: () => Promise<void>;
  fetchCargoRecords: () => Promise<void>;
  fetchEquipmentRentals: () => Promise<void>;
  fetchAllOperationalCharges: () => Promise<void>;

  payUtility: (id: number, idempotencyKey?: string) => Promise<UtilityMeterReading>;
  payCargo: (id: number, idempotencyKey?: string) => Promise<CargoHandlingRecord>;
  payEquipment: (id: number, idempotencyKey?: string) => Promise<EquipmentRentalRecord>;

  fetchUtilityReceipt: (id: number) => Promise<UtilityReceiptPayload>;
  clearActiveReceipt: () => void;
}

export const useCargoUtilityStore = create<CargoUtilityState>((set, get) => ({
  utilities: [],
  cargoRecords: [],
  equipmentRentals: [],
  activeReceipt: null,
  isLoading: false,
  error: null,

  fetchUtilities: async () => {
    set({ isLoading: true, error: null });
    try {
      const utilities = await CargoUtilityService.listUtilities();
      set({ utilities, isLoading: false });
    } catch (err: unknown) {
      const message =
        err instanceof ApiException
          ? err.message
          : err instanceof Error
          ? err.message
          : "Gagal memuat data pencatatan utilitas dermaga.";
      set({ isLoading: false, error: message });
    }
  },

  fetchCargoRecords: async () => {
    set({ isLoading: true, error: null });
    try {
      const cargoRecords = await CargoUtilityService.listCargo();
      set({ cargoRecords, isLoading: false });
    } catch (err: unknown) {
      const message =
        err instanceof ApiException
          ? err.message
          : err instanceof Error
          ? err.message
          : "Gagal memuat data pencatatan pelayanan kargo.";
      set({ isLoading: false, error: message });
    }
  },

  fetchEquipmentRentals: async () => {
    set({ isLoading: true, error: null });
    try {
      const equipmentRentals = await CargoUtilityService.listEquipment();
      set({ equipmentRentals, isLoading: false });
    } catch (err: unknown) {
      const message =
        err instanceof ApiException
          ? err.message
          : err instanceof Error
          ? err.message
          : "Gagal memuat data sewa alat pelabuhan.";
      set({ isLoading: false, error: message });
    }
  },

  fetchAllOperationalCharges: async () => {
    set({ isLoading: true, error: null });
    try {
      await Promise.all([
        get().fetchUtilities(),
        get().fetchCargoRecords(),
        get().fetchEquipmentRentals(),
      ]);
      set({ isLoading: false });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal memuat seluruh data operasional.";
      set({ isLoading: false, error: message });
    }
  },

  payUtility: async (id: number, idempotencyKey?: string) => {
    set({ isLoading: true, error: null });
    try {
      const key =
        idempotencyKey || `UTL-PAY-${id}-${Date.now()}`;
      const updated = await CargoUtilityService.payUtility(id, { idempotencyKey: key });
      await get().fetchUtilities();
      set({ isLoading: false });
      return updated;
    } catch (err: unknown) {
      const message =
        err instanceof ApiException
          ? err.message
          : err instanceof Error
          ? err.message
          : "Gagal memproses pembayaran utilitas.";
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  payCargo: async (id: number, idempotencyKey?: string) => {
    set({ isLoading: true, error: null });
    try {
      const key =
        idempotencyKey || `CRG-PAY-${id}-${Date.now()}`;
      const updated = await CargoUtilityService.payCargo(id, { idempotencyKey: key });
      await get().fetchCargoRecords();
      set({ isLoading: false });
      return updated;
    } catch (err: unknown) {
      const message =
        err instanceof ApiException
          ? err.message
          : err instanceof Error
          ? err.message
          : "Gagal memproses pembayaran retribusi kargo.";
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  payEquipment: async (id: number, idempotencyKey?: string) => {
    set({ isLoading: true, error: null });
    try {
      const key =
        idempotencyKey || `EQP-PAY-${id}-${Date.now()}`;
      const updated = await CargoUtilityService.payEquipment(id, { idempotencyKey: key });
      await get().fetchEquipmentRentals();
      set({ isLoading: false });
      return updated;
    } catch (err: unknown) {
      const message =
        err instanceof ApiException
          ? err.message
          : err instanceof Error
          ? err.message
          : "Gagal memproses pembayaran pemakaian alat.";
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  fetchUtilityReceipt: async (id: number) => {
    try {
      const receipt = await CargoUtilityService.getUtilityReceipt(id);
      set({ activeReceipt: receipt });
      return receipt;
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Gagal mengambil dokumen bukti pembayaran e-SSRD utilitas.";
      set({ error: message });
      throw err;
    }
  },

  clearActiveReceipt: () => {
    set({ activeReceipt: null });
  },
}));
