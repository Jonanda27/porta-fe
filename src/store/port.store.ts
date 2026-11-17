import { create } from "zustand";
import { PortService } from "@/services/port.service";
import {
  CreateBerthPayload,
  CreatePortPayload,
  PortCategory,
  PortItem,
  UpdateBerthPayload,
  UpdatePortPayload,
} from "@/types/port.types";

interface PortState {
  ports: PortItem[];
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;

  fetchPorts: (portCategory?: PortCategory) => Promise<void>;
  createPort: (payload: CreatePortPayload) => Promise<void>;
  updatePort: (portId: number, payload: UpdatePortPayload) => Promise<void>;
  createBerth: (payload: CreateBerthPayload) => Promise<void>;
  updateBerth: (berthId: number, payload: UpdateBerthPayload) => Promise<void>;
  clearError: () => void;
}

export const usePortStore = create<PortState>((set, get) => ({
  ports: [],
  isLoading: false,
  isSubmitting: false,
  error: null,

  fetchPorts: async (portCategory?: PortCategory) => {
    set({ isLoading: true, error: null });
    try {
      const ports = await PortService.getAllPorts(portCategory);
      set({ ports, isLoading: false });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal memuat data pelabuhan.";
      set({ error: message, isLoading: false });
    }
  },

  createPort: async (payload: CreatePortPayload) => {
    set({ isSubmitting: true, error: null });
    try {
      await PortService.createPort(payload);
      await get().fetchPorts();
      set({ isSubmitting: false });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal menambahkan pelabuhan.";
      set({ error: message, isSubmitting: false });
      throw err;
    }
  },

  updatePort: async (portId: number, payload: UpdatePortPayload) => {
    set({ isSubmitting: true, error: null });
    try {
      await PortService.updatePort(portId, payload);
      await get().fetchPorts();
      set({ isSubmitting: false });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal memperbarui pelabuhan.";
      set({ error: message, isSubmitting: false });
      throw err;
    }
  },

  createBerth: async (payload: CreateBerthPayload) => {
    set({ isSubmitting: true, error: null });
    try {
      await PortService.createBerth(payload);
      await get().fetchPorts();
      set({ isSubmitting: false });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal menambahkan dermaga.";
      set({ error: message, isSubmitting: false });
      throw err;
    }
  },

  updateBerth: async (berthId: number, payload: UpdateBerthPayload) => {
    set({ isSubmitting: true, error: null });
    try {
      await PortService.updateBerth(berthId, payload);
      await get().fetchPorts();
      set({ isSubmitting: false });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal memperbarui dermaga.";
      set({ error: message, isSubmitting: false });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));
