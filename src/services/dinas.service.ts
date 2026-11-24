import { API_CONFIG } from "@/config/api.config";
import { apiClient } from "@/lib/api-client";
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

export class DinasService {
  /**
   * Mengambil agregasi pemantauan makro strategis tingkat Kadis (GET /monitoring/kadis)
   */
  public static async getKadisMonitoring(): Promise<KadisMonitoringResult> {
    return apiClient.get<KadisMonitoringResult>(API_CONFIG.ENDPOINTS.MONITORING.KADIS);
  }

  /**
   * Mengambil rekapitulasi kepatuhan shift & kewajiban serah terima tutup hari UPT (GET /daily-reports/obligations)
   */
  public static async getDailyObligations(
    portId?: number,
    date?: string
  ): Promise<DailyObligationRecap> {
    const params = new URLSearchParams();
    if (portId) params.set("portId", portId.toString());
    if (date) params.set("date", date);
    const queryString = params.toString() ? `?${params.toString()}` : "";
    return apiClient.get<DailyObligationRecap>(
      `${API_CONFIG.ENDPOINTS.DAILY_REPORTS.OBLIGATIONS}${queryString}`
    );
  }

  /**
   * Mengambil seluruh laporan shift harian & serah terima tutup hari UPTD
   */
  public static async getDailyReports(portId?: number): Promise<DailyPortReport[]> {
    const url = portId ? `/daily-reports?portId=${portId}` : "/daily-reports";
    const response = await apiClient.get<DailyPortReport[]>(url);
    return Array.isArray(response) ? response : [];
  }

  /**
   * Mengambil tiket inspeksi pemeliharaan & kelaikan fasilitas dermaga
   */
  public static async getMaintenanceTickets(portId?: number): Promise<MaintenanceTicket[]> {
    const url = portId ? `/maintenance?portId=${portId}` : "/maintenance";
    const response = await apiClient.get<MaintenanceTicket[]>(url);
    return Array.isArray(response) ? response : [];
  }

  /**
   * Mengambil daftar laporan pengaduan masyarakat / layanan publik UPTD (GET /complaints)
   */
  public static async getStaffComplaints(portId?: number): Promise<PublicComplaint[]> {
    const url = portId
      ? `${API_CONFIG.ENDPOINTS.COMPLAINTS.STAFF}?portId=${portId}`
      : API_CONFIG.ENDPOINTS.COMPLAINTS.STAFF;
    const response = await apiClient.get<PublicComplaint[]>(url);
    return Array.isArray(response) ? response : [];
  }

  /**
   * Pengesahan / disposisi laporan tutup hari oleh Pimpinan Dinas / Admin Pelabuhan
   */
  public static async acknowledgeDailyReport(id: number): Promise<DailyPortReport> {
    return apiClient.post<DailyPortReport>(`/daily-reports/${id}/acknowledge`);
  }

  /**
   * Menjalankan kalkulator simulasi penyesuaian tarif & proyeksi PAD tahunan (ReportsController)
   */
  public static async simulateRevenue(dto: SimulateRevenueDto): Promise<SimulateRevenueResult> {
    return apiClient.post<SimulateRevenueResult>("/reports/simulate-revenue", dto);
  }

  /**
   * Mengambil pemetaan peluang investasi & aset fasilitas GIS perairan
   */
  public static async getGisOpportunities(portId?: number): Promise<GisOpportunitiesResult> {
    const url = portId ? `/reports/gis-opportunities?portId=${portId}` : "/reports/gis-opportunities";
    return apiClient.get<GisOpportunitiesResult>(url);
  }

  /**
   * Mengambil daftar manifes penumpang & muatan kendaraan kapal ferry/perintis (GET /gate-ticketing/manifests)
   */
  public static async getManifests(portId?: number): Promise<VesselManifestItem[]> {
    const url = portId
      ? `${API_CONFIG.ENDPOINTS.GATE_TICKETING.MANIFESTS}?portId=${portId}`
      : API_CONFIG.ENDPOINTS.GATE_TICKETING.MANIFESTS;
    const response = await apiClient.get<VesselManifestItem[]>(url);
    return Array.isArray(response) ? response : [];
  }

  /**
   * Mengambil direktori kontrak sewa aset lahan, kios, dan fasilitas pelabuhan (GET /assets-leases/leases)
   */
  public static async getLeases(portId?: number): Promise<AssetLease[]> {
    const url = portId
      ? `${API_CONFIG.ENDPOINTS.ASSETS.LEASES}?portId=${portId}`
      : API_CONFIG.ENDPOINTS.ASSETS.LEASES;
    const response = await apiClient.get<AssetLease[]>(url);
    return Array.isArray(response) ? response : [];
  }

  /**
   * Mengambil riwayat audit log jejak transaksi pimpinan (GET /reports/audit-logs)
   */
  public static async getAuditLogs(
    portId?: number,
    entityName?: string,
    action?: string,
    actorId?: number
  ): Promise<DinasAuditLogItem[]> {
    const params = new URLSearchParams();
    if (portId) params.append("portId", String(portId));
    if (entityName) params.append("entityName", entityName);
    if (action) params.append("action", action);
    if (actorId) params.append("actorId", String(actorId));
    const qs = params.toString() ? `?${params.toString()}` : "";
    const response = await apiClient.get<DinasAuditLogItem[]>(
      `${API_CONFIG.ENDPOINTS.REPORTS.AUDIT_LOGS}${qs}`
    );
    return Array.isArray(response) ? response : [];
  }

  /**
   * Mengambil data analitik hierarkis drill-down per terminal & dermaga (GET /monitoring/kabid/drilldown)
   */
  public static async getKabidDrilldown(params?: {
    portId?: number;
    terminalId?: number;
    berthId?: number;
  }): Promise<KabidDrilldownResult> {
    const q = new URLSearchParams();
    if (params?.portId) q.append("portId", String(params.portId));
    if (params?.terminalId) q.append("terminalId", String(params.terminalId));
    if (params?.berthId) q.append("berthId", String(params.berthId));
    const qs = q.toString() ? `?${q.toString()}` : "";
    return apiClient.get<KabidDrilldownResult>(
      `${API_CONFIG.ENDPOINTS.MONITORING.KABID_DRILLDOWN}${qs}`
    );
  }
}
