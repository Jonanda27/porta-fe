import { API_CONFIG } from "@/config/api.config";
import { apiClient } from "@/lib/api-client";
import {
  CreateCargoRecordPayload,
  CreateDailyPortReportPayload,
  CreateEquipmentRentalPayload,
  CreateGateTicketBookPayload,
  CreateMaintenanceTicketPayload,
  CreateUtilityReadingPayload,
  CreateVesselManifestPayload,
  DailyPortReportItem,
  EndBerthingPayload,
  FerryRouteItem,
  GateHandoverItem,
  GateTicketBookItem,
  MaintenanceTicketItem,
  OpenGateHandoverPayload,
  CloseGateHandoverPayload,
  PortAssetSummaryItem,
  RecordArrivalPayload,
  RecordDeparturePayload,
  StartBerthingPayload,
  UpdateMaintenanceStatusPayload,
  UtilityReadingItem,
  VesselManifestItem,
} from "@/types/field-ops.types";

/**
 * Service untuk Operasional Lapangan Dermaga, Gerbang, Pemeliharaan, & Sif
 */
export const FieldOpsService = {
  // --- Visits Operational (ATA / Berthing / ATD) ---
  recordArrival(visitId: number, payload: RecordArrivalPayload) {
    return apiClient.post(
      `${API_CONFIG.ENDPOINTS.VESSELS.VISITS}/${visitId}/arrival`,
      payload
    );
  },

  startBerthing(visitId: number, payload: StartBerthingPayload) {
    const formData = new FormData();
    formData.append("berthId", String(payload.berthId));
    formData.append("berthCategory", payload.berthCategory);
    formData.append("actualStartAt", payload.actualStartAt);
    if (payload.overrideReason) {
      formData.append("overrideReason", payload.overrideReason);
    }
    if (payload.safetyChecklistVerified !== undefined) {
      formData.append(
        "safetyChecklistVerified",
        String(payload.safetyChecklistVerified)
      );
    }
    if (payload.evidenceFile) {
      formData.append("evidenceFile", payload.evidenceFile);
    }
    return apiClient.post(
      `${API_CONFIG.ENDPOINTS.VESSELS.VISITS}/${visitId}/berthings/start`,
      formData
    );
  },

  endBerthing(visitId: number, berthingId: number, payload: EndBerthingPayload) {
    return apiClient.post(
      `${API_CONFIG.ENDPOINTS.VESSELS.VISITS}/${visitId}/berthings/${berthingId}/end`,
      payload
    );
  },

  recordDeparture(visitId: number, payload: RecordDeparturePayload) {
    return apiClient.post(
      `${API_CONFIG.ENDPOINTS.VESSELS.VISITS}/${visitId}/depart`,
      payload
    );
  },

  // --- Cargo, Equipment & Utilities ---
  createCargoRecord(payload: CreateCargoRecordPayload) {
    return apiClient.post(API_CONFIG.ENDPOINTS.CARGO_UTILITY.CARGO, payload);
  },

  createEquipmentRental(payload: CreateEquipmentRentalPayload) {
    return apiClient.post(API_CONFIG.ENDPOINTS.CARGO_UTILITY.EQUIPMENT, payload);
  },

  getUtilities(portId?: number): Promise<UtilityReadingItem[]> {
    return apiClient.get<UtilityReadingItem[]>(
      API_CONFIG.ENDPOINTS.CARGO_UTILITY.UTILITIES,
      portId ? { params: { portId } } : undefined
    );
  },

  createUtilityReading(payload: CreateUtilityReadingPayload): Promise<UtilityReadingItem> {
    return apiClient.post<UtilityReadingItem>(
      API_CONFIG.ENDPOINTS.CARGO_UTILITY.UTILITIES,
      payload
    );
  },

  // --- Gate Ticketing, Handovers, Routes & Manifests ---
  getTicketBooks(portId?: number): Promise<GateTicketBookItem[]> {
    return apiClient.get<GateTicketBookItem[]>(
      API_CONFIG.ENDPOINTS.GATE_TICKETING.BOOKS,
      portId ? { params: { portId } } : undefined
    );
  },

  createTicketBook(payload: CreateGateTicketBookPayload): Promise<GateTicketBookItem> {
    return apiClient.post<GateTicketBookItem>(
      API_CONFIG.ENDPOINTS.GATE_TICKETING.BOOKS,
      payload
    );
  },

  getHandovers(portId?: number): Promise<GateHandoverItem[]> {
    return apiClient.get<GateHandoverItem[]>(
      API_CONFIG.ENDPOINTS.GATE_TICKETING.HANDOVERS,
      portId ? { params: { portId } } : undefined
    );
  },

  openHandover(payload: OpenGateHandoverPayload): Promise<GateHandoverItem> {
    return apiClient.post<GateHandoverItem>(
      API_CONFIG.ENDPOINTS.GATE_TICKETING.HANDOVERS_OPEN,
      payload
    );
  },

  closeHandover(
    handoverId: number,
    payload: CloseGateHandoverPayload
  ): Promise<GateHandoverItem> {
    return apiClient.post<GateHandoverItem>(
      `${API_CONFIG.ENDPOINTS.GATE_TICKETING.HANDOVERS}/${handoverId}/close`,
      payload
    );
  },

  getFerryRoutes(portId?: number): Promise<FerryRouteItem[]> {
    return apiClient.get<FerryRouteItem[]>(
      API_CONFIG.ENDPOINTS.GATE_TICKETING.FERRY_ROUTES,
      portId ? { params: { portId } } : undefined
    );
  },

  getManifests(portId?: number): Promise<VesselManifestItem[]> {
    return apiClient.get<VesselManifestItem[]>(
      API_CONFIG.ENDPOINTS.GATE_TICKETING.MANIFESTS,
      portId ? { params: { portId } } : undefined
    );
  },

  createManifest(payload: CreateVesselManifestPayload): Promise<VesselManifestItem> {
    return apiClient.post<VesselManifestItem>(
      API_CONFIG.ENDPOINTS.GATE_TICKETING.MANIFESTS,
      payload
    );
  },

  // --- Maintenance & Assets ---
  getMaintenanceTickets(portId?: number): Promise<MaintenanceTicketItem[]> {
    return apiClient.get<MaintenanceTicketItem[]>(
      API_CONFIG.ENDPOINTS.MAINTENANCE.BASE,
      portId ? { params: { portId } } : undefined
    );
  },

  createMaintenanceTicket(
    payload: CreateMaintenanceTicketPayload
  ): Promise<MaintenanceTicketItem> {
    const formData = new FormData();
    formData.append("portId", String(payload.portId));
    if (payload.berthId) formData.append("berthId", String(payload.berthId));
    if (payload.assetId) formData.append("assetId", String(payload.assetId));
    formData.append("severity", payload.severity);
    formData.append("title", payload.title);
    formData.append("description", payload.description);
    if (payload.evidenceFile) {
      formData.append("evidenceFile", payload.evidenceFile);
    }
    return apiClient.post<MaintenanceTicketItem>(
      API_CONFIG.ENDPOINTS.MAINTENANCE.BASE,
      formData
    );
  },

  updateMaintenanceStatus(
    ticketId: number,
    payload: UpdateMaintenanceStatusPayload
  ): Promise<MaintenanceTicketItem> {
    return apiClient.patch<MaintenanceTicketItem>(
      `${API_CONFIG.ENDPOINTS.MAINTENANCE.BASE}/${ticketId}/status`,
      payload
    );
  },

  getPortAssets(portId?: number): Promise<PortAssetSummaryItem[]> {
    return apiClient.get<PortAssetSummaryItem[]>(
      API_CONFIG.ENDPOINTS.ASSETS.ASSETS,
      portId ? { params: { portId } } : undefined
    );
  },

  // --- Daily Reports ---
  getDailyReports(portId?: number): Promise<DailyPortReportItem[]> {
    return apiClient.get<DailyPortReportItem[]>(
      API_CONFIG.ENDPOINTS.DAILY_REPORTS.BASE,
      portId ? { params: { portId } } : undefined
    );
  },

  createDailyReport(payload: CreateDailyPortReportPayload): Promise<DailyPortReportItem> {
    return apiClient.post<DailyPortReportItem>(
      API_CONFIG.ENDPOINTS.DAILY_REPORTS.BASE,
      payload
    );
  },

  acknowledgeDailyReport(reportId: number): Promise<DailyPortReportItem> {
    return apiClient.post<DailyPortReportItem>(
      `${API_CONFIG.ENDPOINTS.DAILY_REPORTS.BASE}/${reportId}/acknowledge`
    );
  },
};
