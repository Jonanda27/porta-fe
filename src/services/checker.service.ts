import { API_CONFIG } from "@/config/api.config";
import { apiClient } from "@/lib/api-client";
import {
  AdminCheckerDashboardResponse,
  CheckerDailyReportItem,
  DailyObligationRecapResponse,
} from "@/types/checker.types";

/**
 * Service khusus Admin Pelabuhan (Pure Checker Tugas & Rekap Laporan Harian)
 */
export const CheckerService = {
  getAdminTaskDashboard(date?: string): Promise<AdminCheckerDashboardResponse> {
    return apiClient.get<AdminCheckerDashboardResponse>(
      API_CONFIG.ENDPOINTS.TASK_REVIEWS.ADMIN_DASHBOARD,
      date ? { params: { date } } : undefined
    );
  },

  startAdminReview(taskId: number): Promise<unknown> {
    return apiClient.post<unknown>(
      `${API_CONFIG.ENDPOINTS.TASK_REVIEWS.ADMIN_BASE}/${taskId}/start-review`
    );
  },

  approveTaskToHead(taskId: number, notes?: string): Promise<unknown> {
    return apiClient.post<unknown>(
      `${API_CONFIG.ENDPOINTS.TASK_REVIEWS.ADMIN_BASE}/${taskId}/approve`,
      { notes: notes || "Kelengkapan administrasi tugas telah diperiksa dan diteruskan ke Kepala Pelabuhan." }
    );
  },

  returnTaskToOfficer(taskId: number, reason: string): Promise<unknown> {
    return apiClient.post<unknown>(
      `${API_CONFIG.ENDPOINTS.TASK_REVIEWS.ADMIN_BASE}/${taskId}/return`,
      { reason }
    );
  },

  async getDailyObligationRecap(date?: string): Promise<DailyObligationRecapResponse> {
    const res = await apiClient.get<
      DailyObligationRecapResponse | { officers?: DailyObligationRecapResponse["officers"] }
    >(
      API_CONFIG.ENDPOINTS.DAILY_REPORTS.OBLIGATIONS,
      date ? { params: { date } } : undefined
    );
    return {
      ...res,
      officers: Array.isArray(res?.officers) ? res.officers : [],
    };
  },

  async getDailyReports(): Promise<CheckerDailyReportItem[]> {
    const res = await apiClient.get<CheckerDailyReportItem[]>(
      API_CONFIG.ENDPOINTS.DAILY_REPORTS.BASE
    );
    return Array.isArray(res) ? res : [];
  },

  adminCheckDailyReport(
    reportId: number,
    decision: "APPROVED" | "RETURNED",
    notes?: string
  ): Promise<CheckerDailyReportItem> {
    return apiClient.post<CheckerDailyReportItem>(
      `${API_CONFIG.ENDPOINTS.DAILY_REPORTS.BASE}/${reportId}/admin-check`,
      { decision, notes }
    );
  },
};
