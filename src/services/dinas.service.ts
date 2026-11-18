import { apiClient } from "@/lib/api-client";
import {
  DailyPortReport,
  GisOpportunitiesResult,
  MaintenanceTicket,
  SimulateRevenueDto,
  SimulateRevenueResult,
} from "@/types/dinas.types";

export class DinasService {
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
}
