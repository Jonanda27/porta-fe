import { create } from "zustand";
import { FieldOpsService } from "@/services/field-ops.service";
import { UptService } from "@/services/upt.service";
import {
  CloseGateHandoverPayload,
  CreateCargoRecordPayload,
  CreateDailyPortReportPayload,
  CreateEquipmentRentalPayload,
  CreateGateTicketBookPayload,
  CreateMaintenanceTicketPayload,
  CreateUtilityReadingPayload,
  CreateVesselManifestPayload,
  DailyPortReportItem,
  FerryRouteItem,
  GateHandoverItem,
  GateTicketBookItem,
  MaintenanceTicketItem,
  OpenGateHandoverPayload,
  PortAssetSummaryItem,
  StartBerthingPayload,
  UpdateMaintenanceStatusPayload,
  UtilityReadingItem,
  VesselManifestItem,
} from "@/types/field-ops.types";
import { ShipVisitItem } from "@/types/upt.types";

interface FieldOpsState {
  visits: ShipVisitItem[];
  utilities: UtilityReadingItem[];
  ticketBooks: GateTicketBookItem[];
  handovers: GateHandoverItem[];
  ferryRoutes: FerryRouteItem[];
  manifests: VesselManifestItem[];
  maintenanceTickets: MaintenanceTicketItem[];
  portAssets: PortAssetSummaryItem[];
  dailyReports: DailyPortReportItem[];
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;

  fetchVesselOpsData: (portId?: number) => Promise<void>;
  recordArrival: (visitId: number, ataAnchorage: string, portId?: number) => Promise<void>;
  startBerthing: (visitId: number, payload: StartBerthingPayload, portId?: number) => Promise<void>;
  endBerthing: (visitId: number, berthingId: number, actualEndAt: string, portId?: number) => Promise<void>;
  recordDeparture: (visitId: number, atdPort: string, portId?: number) => Promise<void>;
  createCargo: (payload: CreateCargoRecordPayload, portId?: number) => Promise<void>;
  createEquipment: (payload: CreateEquipmentRentalPayload, portId?: number) => Promise<void>;
  createUtility: (payload: CreateUtilityReadingPayload, portId?: number) => Promise<void>;

  fetchTicketingData: (portId?: number) => Promise<void>;
  createTicketBook: (payload: CreateGateTicketBookPayload, portId?: number) => Promise<void>;
  createManifest: (payload: CreateVesselManifestPayload, portId?: number) => Promise<void>;

  fetchMaintenanceData: (portId?: number) => Promise<void>;
  createMaintenance: (payload: CreateMaintenanceTicketPayload, portId?: number) => Promise<void>;
  updateMaintenanceStatus: (id: number, payload: UpdateMaintenanceStatusPayload, portId?: number) => Promise<void>;

  fetchShiftData: (portId?: number) => Promise<void>;
  openHandover: (payload: OpenGateHandoverPayload, portId?: number) => Promise<void>;
  closeHandover: (id: number, payload: CloseGateHandoverPayload, portId?: number) => Promise<void>;
  createDailyReport: (payload: CreateDailyPortReportPayload, portId?: number) => Promise<void>;
  acknowledgeDailyReport: (id: number, portId?: number) => Promise<void>;

  clearError: () => void;
}

export const useFieldOpsStore = create<FieldOpsState>((set, get) => ({
  visits: [],
  utilities: [],
  ticketBooks: [],
  handovers: [],
  ferryRoutes: [],
  manifests: [],
  maintenanceTickets: [],
  portAssets: [],
  dailyReports: [],
  isLoading: false,
  isSubmitting: false,
  error: null,

  fetchVesselOpsData: async (portId?: number) => {
    set({ isLoading: true, error: null });
    try {
      const [visits, utilities] = await Promise.all([
        UptService.getVisits(portId),
        FieldOpsService.getUtilities(portId),
      ]);
      set({ visits, utilities, isLoading: false });
    } catch (err: unknown) {
      set({
        error: err instanceof Error ? err.message : "Gagal memuat data log kapal.",
        isLoading: false,
      });
    }
  },

  recordArrival: async (visitId, ataAnchorage, portId) => {
    set({ isSubmitting: true, error: null });
    try {
      await FieldOpsService.recordArrival(visitId, { ataAnchorage });
      await get().fetchVesselOpsData(portId);
      set({ isSubmitting: false });
    } catch (err: unknown) {
      set({
        error: err instanceof Error ? err.message : "Gagal mencatat kedatangan kapal.",
        isSubmitting: false,
      });
      throw err;
    }
  },

  startBerthing: async (visitId, payload, portId) => {
    set({ isSubmitting: true, error: null });
    try {
      await FieldOpsService.startBerthing(visitId, payload);
      await get().fetchVesselOpsData(portId);
      set({ isSubmitting: false });
    } catch (err: unknown) {
      set({
        error: err instanceof Error ? err.message : "Gagal memulai pencatatan sandar.",
        isSubmitting: false,
      });
      throw err;
    }
  },

  endBerthing: async (visitId, berthingId, actualEndAt, portId) => {
    set({ isSubmitting: true, error: null });
    try {
      await FieldOpsService.endBerthing(visitId, berthingId, { actualEndAt });
      await get().fetchVesselOpsData(portId);
      set({ isSubmitting: false });
    } catch (err: unknown) {
      set({
        error: err instanceof Error ? err.message : "Gagal mengakhiri sandar kapal.",
        isSubmitting: false,
      });
      throw err;
    }
  },

  recordDeparture: async (visitId, atdPort, portId) => {
    set({ isSubmitting: true, error: null });
    try {
      await FieldOpsService.recordDeparture(visitId, { atdPort });
      await get().fetchVesselOpsData(portId);
      set({ isSubmitting: false });
    } catch (err: unknown) {
      set({
        error: err instanceof Error ? err.message : "Gagal mencatat keberangkatan kapal.",
        isSubmitting: false,
      });
      throw err;
    }
  },

  createCargo: async (payload, portId) => {
    set({ isSubmitting: true, error: null });
    try {
      await FieldOpsService.createCargoRecord(payload);
      await get().fetchVesselOpsData(portId);
      set({ isSubmitting: false });
    } catch (err: unknown) {
      set({
        error: err instanceof Error ? err.message : "Gagal mencatat bongkar muat.",
        isSubmitting: false,
      });
      throw err;
    }
  },

  createEquipment: async (payload, portId) => {
    set({ isSubmitting: true, error: null });
    try {
      await FieldOpsService.createEquipmentRental(payload);
      await get().fetchVesselOpsData(portId);
      set({ isSubmitting: false });
    } catch (err: unknown) {
      set({
        error: err instanceof Error ? err.message : "Gagal mencatat sewa alat.",
        isSubmitting: false,
      });
      throw err;
    }
  },

  createUtility: async (payload, portId) => {
    set({ isSubmitting: true, error: null });
    try {
      await FieldOpsService.createUtilityReading(payload);
      await get().fetchVesselOpsData(portId);
      set({ isSubmitting: false });
    } catch (err: unknown) {
      set({
        error: err instanceof Error ? err.message : "Gagal mencatat meteran utilitas.",
        isSubmitting: false,
      });
      throw err;
    }
  },

  fetchTicketingData: async (portId) => {
    set({ isLoading: true, error: null });
    try {
      const [ticketBooks, ferryRoutes, manifests, visits] = await Promise.all([
        FieldOpsService.getTicketBooks(portId),
        FieldOpsService.getFerryRoutes(portId),
        FieldOpsService.getManifests(portId),
        UptService.getVisits(portId),
      ]);
      set({ ticketBooks, ferryRoutes, manifests, visits, isLoading: false });
    } catch (err: unknown) {
      set({
        error: err instanceof Error ? err.message : "Gagal memuat data gerbang & manifes.",
        isLoading: false,
      });
    }
  },

  createTicketBook: async (payload, portId) => {
    set({ isSubmitting: true, error: null });
    try {
      await FieldOpsService.createTicketBook(payload);
      await get().fetchTicketingData(portId);
      set({ isSubmitting: false });
    } catch (err: unknown) {
      set({
        error: err instanceof Error ? err.message : "Gagal menambahkan buku karcis.",
        isSubmitting: false,
      });
      throw err;
    }
  },

  createManifest: async (payload, portId) => {
    set({ isSubmitting: true, error: null });
    try {
      await FieldOpsService.createManifest(payload);
      await get().fetchTicketingData(portId);
      set({ isSubmitting: false });
    } catch (err: unknown) {
      set({
        error: err instanceof Error ? err.message : "Gagal mencatat manifes kapal.",
        isSubmitting: false,
      });
      throw err;
    }
  },

  fetchMaintenanceData: async (portId) => {
    set({ isLoading: true, error: null });
    try {
      const [maintenanceTickets, portAssets] = await Promise.all([
        FieldOpsService.getMaintenanceTickets(portId),
        FieldOpsService.getPortAssets(portId),
      ]);
      set({ maintenanceTickets, portAssets, isLoading: false });
    } catch (err: unknown) {
      set({
        error: err instanceof Error ? err.message : "Gagal memuat data pemeliharaan.",
        isLoading: false,
      });
    }
  },

  createMaintenance: async (payload, portId) => {
    set({ isSubmitting: true, error: null });
    try {
      await FieldOpsService.createMaintenanceTicket(payload);
      await get().fetchMaintenanceData(portId);
      set({ isSubmitting: false });
    } catch (err: unknown) {
      set({
        error: err instanceof Error ? err.message : "Gagal membuat tiket pemeliharaan.",
        isSubmitting: false,
      });
      throw err;
    }
  },

  updateMaintenanceStatus: async (id, payload, portId) => {
    set({ isSubmitting: true, error: null });
    try {
      await FieldOpsService.updateMaintenanceStatus(id, payload);
      await get().fetchMaintenanceData(portId);
      set({ isSubmitting: false });
    } catch (err: unknown) {
      set({
        error: err instanceof Error ? err.message : "Gagal memperbarui status pemeliharaan.",
        isSubmitting: false,
      });
      throw err;
    }
  },

  fetchShiftData: async (portId) => {
    set({ isLoading: true, error: null });
    try {
      const [handovers, ticketBooks, dailyReports, visits] = await Promise.all([
        FieldOpsService.getHandovers(portId),
        FieldOpsService.getTicketBooks(portId),
        FieldOpsService.getDailyReports(portId),
        UptService.getVisits(portId),
      ]);
      set({ handovers, ticketBooks, dailyReports, visits, isLoading: false });
    } catch (err: unknown) {
      set({
        error: err instanceof Error ? err.message : "Gagal memuat data laporan sif.",
        isLoading: false,
      });
    }
  },

  openHandover: async (payload, portId) => {
    set({ isSubmitting: true, error: null });
    try {
      await FieldOpsService.openHandover(payload);
      await get().fetchShiftData(portId);
      set({ isSubmitting: false });
    } catch (err: unknown) {
      set({
        error: err instanceof Error ? err.message : "Gagal membuka sif gerbang.",
        isSubmitting: false,
      });
      throw err;
    }
  },

  closeHandover: async (id, payload, portId) => {
    set({ isSubmitting: true, error: null });
    try {
      await FieldOpsService.closeHandover(id, payload);
      await get().fetchShiftData(portId);
      set({ isSubmitting: false });
    } catch (err: unknown) {
      set({
        error: err instanceof Error ? err.message : "Gagal menutup sif gerbang.",
        isSubmitting: false,
      });
      throw err;
    }
  },

  createDailyReport: async (payload, portId) => {
    set({ isSubmitting: true, error: null });
    try {
      await FieldOpsService.createDailyReport(payload);
      await get().fetchShiftData(portId);
      set({ isSubmitting: false });
    } catch (err: unknown) {
      set({
        error: err instanceof Error ? err.message : "Gagal mengirim laporan harian.",
        isSubmitting: false,
      });
      throw err;
    }
  },

  acknowledgeDailyReport: async (id, portId) => {
    set({ isSubmitting: true, error: null });
    try {
      await FieldOpsService.acknowledgeDailyReport(id);
      await get().fetchShiftData(portId);
      set({ isSubmitting: false });
    } catch (err: unknown) {
      set({
        error: err instanceof Error ? err.message : "Gagal mengesahkan laporan harian.",
        isSubmitting: false,
      });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));
