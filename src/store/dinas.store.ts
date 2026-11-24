import { create } from "zustand";
import {
  AssetLease,
  DailyObligationRecap,
  DailyPortReport,
  DinasAuditLogItem,
  GisOpportunitiesResult,
  KadisMonitoringResult,
  MaintenanceTicket,
  PublicComplaint,
  SimulateRevenueDto,
  SimulateRevenueResult,
  VesselManifestItem,
  KabidDrilldownResult,
} from "@/types/dinas.types";
import { DinasService } from "@/services/dinas.service";

interface DinasState {
  dailyReports: DailyPortReport[];
  maintenanceTickets: MaintenanceTicket[];
  complaints: PublicComplaint[];
  kadisMonitoring: KadisMonitoringResult | null;
  obligationsRecap: DailyObligationRecap | null;
  manifests: VesselManifestItem[];
  leases: AssetLease[];
  auditLogs: DinasAuditLogItem[];
  drilldownData: KabidDrilldownResult | null;
  gisOpportunities: GisOpportunitiesResult | null;
  simulationResult: SimulateRevenueResult | null;
  isLoading: boolean;
  isLoadingMonitoring: boolean;
  isLoadingObligations: boolean;
  isLoadingManifests: boolean;
  isLoadingLeases: boolean;
  isLoadingAuditLogs: boolean;
  isLoadingDrilldown: boolean;
  isSimulating: boolean;
  error: string | null;

  // Actions
  fetchKadisMonitoring: () => Promise<void>;
  fetchDailyObligations: (portId?: number, date?: string) => Promise<void>;
  fetchDailyReports: (portId?: number) => Promise<void>;
  fetchMaintenanceTickets: (portId?: number) => Promise<void>;
  fetchComplaints: (portId?: number) => Promise<void>;
  fetchManifests: (portId?: number) => Promise<void>;
  fetchLeases: (portId?: number) => Promise<void>;
  fetchAuditLogs: (portId?: number, entityName?: string, action?: string, actorId?: number) => Promise<void>;
  fetchKabidDrilldown: (params?: { portId?: number; terminalId?: number; berthId?: number }) => Promise<void>;
  acknowledgeDailyReport: (id: number) => Promise<void>;
  fetchGisOpportunities: (portId?: number) => Promise<void>;
  simulateRevenue: (dto: SimulateRevenueDto) => Promise<SimulateRevenueResult>;
  clearError: () => void;
}

export const useDinasStore = create<DinasState>((set, get) => ({
  dailyReports: [],
  maintenanceTickets: [],
  complaints: [],
  kadisMonitoring: null,
  obligationsRecap: null,
  manifests: [],
  leases: [],
  auditLogs: [],
  drilldownData: null,
  gisOpportunities: null,
  simulationResult: null,
  isLoading: false,
  isLoadingMonitoring: false,
  isLoadingObligations: false,
  isLoadingManifests: false,
  isLoadingLeases: false,
  isLoadingAuditLogs: false,
  isLoadingDrilldown: false,
  isSimulating: false,
  error: null,

  fetchKadisMonitoring: async () => {
    set({ isLoadingMonitoring: true, error: null });
    try {
      const kadisMonitoring = await DinasService.getKadisMonitoring();
      set({ kadisMonitoring, isLoadingMonitoring: false });
    } catch (err: unknown) {
      console.error("Gagal memuat monitoring eksekutif Kadis:", err);
      set({ isLoadingMonitoring: false });
    }
  },

  fetchDailyObligations: async (portId?: number, date?: string) => {
    set({ isLoadingObligations: true, error: null });
    try {
      const obligationsRecap = await DinasService.getDailyObligations(portId, date);
      set({ obligationsRecap, isLoadingObligations: false });
    } catch (err: unknown) {
      console.error("Gagal memuat rekap kewajiban tutup hari UPT:", err);
      set({ isLoadingObligations: false });
    }
  },

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

  fetchComplaints: async (portId?: number) => {
    set({ isLoading: true, error: null });
    try {
      const complaints = await DinasService.getStaffComplaints(portId);
      set({ complaints, isLoading: false });
    } catch (err: unknown) {
      console.error("Gagal memuat daftar pengaduan publik:", err);
      set({ isLoading: false, error: "Gagal memuat data pengaduan publik." });
    }
  },

  fetchManifests: async (portId?: number) => {
    set({ isLoadingManifests: true, error: null });
    try {
      const manifests = await DinasService.getManifests(portId);
      set({ manifests, isLoadingManifests: false });
    } catch (err: unknown) {
      console.error("Gagal memuat daftar manifes kapal:", err);
      set({ isLoadingManifests: false });
    }
  },

  fetchLeases: async (portId?: number) => {
    set({ isLoadingLeases: true, error: null });
    try {
      const leases = await DinasService.getLeases(portId);
      set({ leases, isLoadingLeases: false });
    } catch (err: unknown) {
      console.error("Gagal memuat kontrak sewa aset pelabuhan:", err);
      set({ isLoadingLeases: false });
    }
  },

  fetchAuditLogs: async (portId?: number, entityName?: string, action?: string, actorId?: number) => {
    set({ isLoadingAuditLogs: true, error: null });
    try {
      const auditLogs = await DinasService.getAuditLogs(portId, entityName, action, actorId);
      set({ auditLogs, isLoadingAuditLogs: false });
    } catch (err: unknown) {
      console.error("Gagal memuat log audit pimpinan:", err);
      set({ isLoadingAuditLogs: false });
    }
  },

  fetchKabidDrilldown: async (params?: { portId?: number; terminalId?: number; berthId?: number }) => {
    set({ isLoadingDrilldown: true, error: null });
    try {
      const drilldownData = await DinasService.getKabidDrilldown(params);
      set({ drilldownData, isLoadingDrilldown: false });
    } catch (err: unknown) {
      console.error("Gagal memuat data analitik drilldown dermaga:", err);
      set({ isLoadingDrilldown: false });
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
