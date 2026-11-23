import { create } from "zustand";
import {
  DailyPortReport,
  GisOpportunitiesResult,
  MaintenanceTicket,
  SimulateRevenueDto,
  SimulateRevenueResult,
} from "@/types/dinas.types";
import { DinasService } from "@/services/dinas.service";

interface DinasState {
  dailyReports: DailyPortReport[];
  maintenanceTickets: MaintenanceTicket[];
  gisOpportunities: GisOpportunitiesResult | null;
  simulationResult: SimulateRevenueResult | null;
  isLoading: boolean;
  isSimulating: boolean;
  error: string | null;

  // Actions
  fetchDailyReports: (portId?: number) => Promise<void>;
  fetchMaintenanceTickets: (portId?: number) => Promise<void>;
  acknowledgeDailyReport: (id: number) => Promise<void>;
  fetchGisOpportunities: (portId?: number) => Promise<void>;
  simulateRevenue: (dto: SimulateRevenueDto) => Promise<SimulateRevenueResult>;
  clearError: () => void;
}

export const useDinasStore = create<DinasState>((set, get) => ({
  dailyReports: [],
  maintenanceTickets: [],
  gisOpportunities: null,
  simulationResult: null,
  isLoading: false,
  isSimulating: false,
  error: null,

  fetchDailyReports: async (portId?: number) => {
    set({ isLoading: true, error: null });
    try {
      const dailyReports = await DinasService.getDailyReports(portId);
      set({ dailyReports, isLoading: false });
    } catch (err: unknown) {
      console.error("Gagal memuat laporan shift harian UPT:", err);
      set({ isLoading: false, error: "Gagal memuat laporan harian." });
    }
  },

  fetchMaintenanceTickets: async (portId?: number) => {
    set({ isLoading: true, error: null });
    try {
      const maintenanceTickets = await DinasService.getMaintenanceTickets(portId);
      set({ maintenanceTickets, isLoading: false });
    } catch (err: unknown) {
      console.error("Gagal memuat log pemeliharaan fasilitas:", err);
      set({ isLoading: false, error: "Gagal memuat data pemeliharaan." });
    }
  },

  acknowledgeDailyReport: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      await DinasService.acknowledgeDailyReport(id);
      await get().fetchDailyReports();
      set({ isLoading: false });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal mengesahkan laporan tutup hari.";
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  fetchGisOpportunities: async (portId?: number) => {
    set({ isLoading: true, error: null });
    try {
      const gisOpportunities = await DinasService.getGisOpportunities(portId);
      set({ gisOpportunities, isLoading: false });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal memuat data potensi GIS aset pelabuhan.";
      set({ isLoading: false, error: message });
    }
  },

  simulateRevenue: async (dto: SimulateRevenueDto) => {
    set({ isSimulating: true, error: null });
    try {
      const simulationResult = await DinasService.simulateRevenue(dto);
      set({ simulationResult, isSimulating: false });
      return simulationResult;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal menjalankan simulasi proyeksi PAD.";
      set({ isSimulating: false, error: message });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));
