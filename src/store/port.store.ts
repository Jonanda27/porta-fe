import { create } from "zustand";
import { Berth, Port } from "@/types/port.types";
import { PortService } from "@/services/port.service";
import { ApiException } from "@/lib/api-client";

interface PortState {
  ports: Port[];
  berths: Berth[];
  activePort: Port | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchPorts: () => Promise<void>;
  fetchBerths: (portId?: number) => Promise<void>;
  fetchPortAndBerthsData: (portId?: number) => Promise<void>;
}

export const usePortStore = create<PortState>((set, get) => ({
  ports: [],
  berths: [],
  activePort: null,
  isLoading: false,
  error: null,

  fetchPorts: async () => {
    set({ isLoading: true, error: null });
    try {
      const ports = await PortService.getAllPorts();
      const activePort = ports.find((p) => p.id === 1) || ports[0] || null;
      set({ ports, activePort, isLoading: false, error: null });
    } catch (err: unknown) {
      const msg =
        err instanceof ApiException
          ? err.message
          : err instanceof Error
          ? err.message
          : "Gagal memuat data pelabuhan";
      set({ isLoading: false, error: msg });
    }
  },

  fetchBerths: async (portId: number = 1) => {
    set({ isLoading: true, error: null });
    try {
      const berths = await PortService.getBerthsByPort(portId);
      set({ berths, isLoading: false, error: null });
    } catch (err: unknown) {
      const msg =
        err instanceof ApiException
          ? err.message
          : err instanceof Error
          ? err.message
          : "Gagal memuat data dermaga pelabuhan";
      set({ isLoading: false, error: msg });
    }
  },

  fetchPortAndBerthsData: async (portId: number = 1) => {
    set({ isLoading: true, error: null });
    try {
      const [ports, berths] = await Promise.all([
        PortService.getAllPorts(),
        PortService.getBerthsByPort(portId),
      ]);
      const activePort = ports.find((p) => p.id === portId) || ports[0] || null;
      set({ ports, berths, activePort, isLoading: false, error: null });
    } catch (err: unknown) {
      const msg =
        err instanceof ApiException
          ? err.message
          : err instanceof Error
          ? err.message
          : "Gagal memuat data fasilitas pelabuhan";
      set({ isLoading: false, error: msg });
    }
  },
}));
