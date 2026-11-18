import { create } from "zustand";
import { DailyPortReport, MaintenanceTicket } from "@/types/dinas.types";
import { DinasService } from "@/services/dinas.service";

interface DinasState {
  dailyReports: DailyPortReport[];
  maintenanceTickets: MaintenanceTicket[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchDailyReports: (portId?: number) => Promise<void>;
  fetchMaintenanceTickets: (portId?: number) => Promise<void>;
  acknowledgeDailyReport: (id: number) => Promise<void>;
}

export const useDinasStore = create<DinasState>((set, get) => ({
  dailyReports: [],
  maintenanceTickets: [],
  isLoading: false,
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
}));
