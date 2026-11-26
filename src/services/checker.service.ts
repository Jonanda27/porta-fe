import { API_CONFIG } from "@/config/api.config";
import { apiClient } from "@/lib/api-client";
import {
  AdminCheckerDashboardResponse,
  CheckerDailyReportItem,
  DailyObligationRecapResponse,
} from "@/types/checker.types";
import {
  HeadBottlenecksResponse,
  TaskDetailItem,
} from "@/types/task.types";

/**
 * Service khusus Admin Pelabuhan (Pure Checker Tugas & Rekap Laporan Harian)
 * serta Verifikasi & Bottleneck Radar Kepala Pelabuhan
 */
export const CheckerService = {
  getAdminTaskDashboard(date?: string): Promise<AdminCheckerDashboardResponse> {
    return apiClient.get<AdminCheckerDashboardResponse>(
      API_CONFIG.ENDPOINTS.TASK_REVIEWS.ADMIN_DASHBOARD,
      date ? { params: { date } } : undefined
    );
  },

  getTaskDetail(taskId: number): Promise<TaskDetailItem> {
    return apiClient.get<TaskDetailItem>(
      `${API_CONFIG.ENDPOINTS.TASKS.BASE}/${taskId}`
    );
  },

  startAdminReview(taskId: number): Promise<unknown> {
    return apiClient.post<unknown>(
      `${API_CONFIG.ENDPOINTS.TASK_REVIEWS.ADMIN_BASE}/${taskId}/start-review`
    );
  },

  updateAdminChecklist(
    taskId: number,
    items: Array<{
      code: string;
      checkedByAdmin: boolean;
      adminNotes?: string;
    }>
  ): Promise<TaskDetailItem> {
    return apiClient.patch<TaskDetailItem>(
      `${API_CONFIG.ENDPOINTS.TASK_REVIEWS.ADMIN_BASE}/${taskId}/checklist`,
      { items }
    );
  },

  approveTaskToHead(
    taskId: number,
    notes?: string,
    checklistItems?: Array<{
      code: string;
      checkedByAdmin: boolean;
      adminNotes?: string;
    }>
  ): Promise<unknown> {
    return apiClient.post<unknown>(
      `${API_CONFIG.ENDPOINTS.TASK_REVIEWS.ADMIN_BASE}/${taskId}/approve`,
      {
        notes:
          notes ||
          "Kelengkapan administrasi tugas telah diperiksa dan diteruskan ke Kepala Pelabuhan.",
        ...(checklistItems ? { checklistItems } : {}),
      }
    );
  },

  returnTaskToOfficer(taskId: number, reason: string): Promise<unknown> {
    return apiClient.post<unknown>(
      `${API_CONFIG.ENDPOINTS.TASK_REVIEWS.ADMIN_BASE}/${taskId}/return`,
      { reason }
    );
  },

  async getHeadQueue(): Promise<TaskDetailItem[]> {
    const res = await apiClient.get<TaskDetailItem[]>(
      API_CONFIG.ENDPOINTS.TASK_REVIEWS.HEAD_QUEUE
    );
    return Array.isArray(res) ? res : [];
  },

  getHeadBottlenecks(filters?: {
    stage?: string;
    role?: string;
  }): Promise<HeadBottlenecksResponse> {
    return apiClient.get<HeadBottlenecksResponse>(
      API_CONFIG.ENDPOINTS.TASK_REVIEWS.HEAD_BOTTLENECKS,
      filters ? { params: filters } : undefined
    );
  },

  headVerifyTask(taskId: number, notes?: string): Promise<unknown> {
    return apiClient.post<unknown>(
      `${API_CONFIG.ENDPOINTS.TASK_REVIEWS.HEAD_BASE}/${taskId}/verify`,
      { notes }
    );
  },

  headReturnTask(taskId: number, reason: string): Promise<unknown> {
    return apiClient.post<unknown>(
      `${API_CONFIG.ENDPOINTS.TASK_REVIEWS.HEAD_BASE}/${taskId}/return`,
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
