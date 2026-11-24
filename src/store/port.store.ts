import { create } from "zustand";
import { PortService } from "@/services/port.service";
import { ApiException } from "@/lib/api-client";
import {
  BerthItem,
  CreateBerthPayload,
  CreatePortPayload,
  PortCategory,
  PortFacilityItem,
  PortItem,
  PortBerthsScheduleResponse,
  PortTerminalItem,
  PortZoneItem,
  UpdateBerthPayload,
  UpdatePortPayload,
} from "@/types/port.types";

interface PortState {
  ports: PortItem[];
  berths: BerthItem[];
  terminals: PortTerminalItem[];
  zones: PortZoneItem[];
  facilities: PortFacilityItem[];
  berthsSchedule: PortBerthsScheduleResponse | null;
  activePort: PortItem | null;
  isLoading: boolean;
  isScheduleLoading: boolean;
  isSubmitting: boolean;
  error: string | null;

  // Actions
  fetchPorts: (portCategory?: PortCategory) => Promise<void>;
  fetchBerths: (portId?: number) => Promise<void>;
  fetchBerthsSchedule: (portId: number, date?: string) => Promise<void>;
  fetchPortAndBerthsData: (portId?: number) => Promise<void>;
  fetchPortInfrastructure: (portId?: number) => Promise<void>;
  createPort: (payload: CreatePortPayload) => Promise<void>;
  updatePort: (portId: number, payload: UpdatePortPayload) => Promise<void>;
  createBerth: (payload: CreateBerthPayload) => Promise<void>;
  updateBerth: (berthId: number, payload: UpdateBerthPayload) => Promise<void>;
  clearError: () => void;
}

export const usePortStore = create<PortState>((set, get) => ({
  ports: [],
  berths: [],
  terminals: [],
  zones: [],
  facilities: [],
  berthsSchedule: null,
  activePort: null,
  isLoading: false,
  isScheduleLoading: false,
  isSubmitting: false,
  error: null,

  fetchPorts: async (portCategory?: PortCategory) => {
    if (!portCategory && get().ports.length > 0) {
      return;
    }
    set({ isLoading: true, error: null });
    try {
      const ports = await PortService.getAllPorts(portCategory);
      const activePort = ports.find((p) => p.id === 1) || ports[0] || null;
      set({ ports, activePort, isLoading: false });
    } catch (err: unknown) {
      const message =
        err instanceof ApiException
          ? err.message
          : err instanceof Error
          ? err.message
          : "Gagal memuat data pelabuhan.";
      set({ error: message, isLoading: false });
    }
  },

  fetchBerths: async (portId: number = 1) => {
    set({ isLoading: true, error: null });
    try {
      const berths = await PortService.getBerthsByPort(portId);
      set({ berths, isLoading: false, error: null });
    } catch (err: unknown) {
      const message =
        err instanceof ApiException
          ? err.message
          : err instanceof Error
          ? err.message
          : "Gagal memuat data dermaga pelabuhan.";
      set({ isLoading: false, error: message });
    }
  },

  fetchBerthsSchedule: async (portId: number, date?: string) => {
    set({ isScheduleLoading: true, error: null });
    try {
      const berthsSchedule = await PortService.getBerthsSchedule(portId, date);
      set({ berthsSchedule, isScheduleLoading: false });
    } catch (err: unknown) {
      const message =
        err instanceof ApiException
          ? err.message
          : err instanceof Error
          ? err.message
          : "Gagal memuat jadwal dermaga.";
      set({ error: message, isScheduleLoading: false });
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
      const message =
        err instanceof ApiException
          ? err.message
          : err instanceof Error
          ? err.message
          : "Gagal memuat data fasilitas pelabuhan.";
      set({ isLoading: false, error: message });
    }
  },

  fetchPortInfrastructure: async (portId: number = 1) => {
    set({ isLoading: true, error: null });
    try {
      const [ports, berths, terminals, zones, facilities] = await Promise.all([
        PortService.getAllPorts().catch(() => []),
        PortService.getBerthsByPort(portId).catch(() => []),
        PortService.getTerminalsByPort(portId).catch(() => []),
        PortService.getZonesByPort(portId).catch(() => []),
        PortService.getFacilitiesByPort(portId).catch(() => []),
      ]);
      const activePort = ports.find((p) => p.id === portId) || ports[0] || null;
      set({
        ports,
        berths,
        terminals,
        zones,
        facilities,
        activePort,
        isLoading: false,
        error: null,
      });
    } catch (err: unknown) {
      const message =
        err instanceof ApiException
          ? err.message
          : err instanceof Error
          ? err.message
          : "Gagal memuat data fasilitas dan infrastruktur pelabuhan.";
      set({ isLoading: false, error: message });
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
      if (payload.portId) {
        await get().fetchBerths(payload.portId);
      }
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
