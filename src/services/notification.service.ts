import { API_CONFIG } from "@/config/api.config";
import { apiClient } from "@/lib/api-client";
import {
  AppNotification,
  NotificationPreference,
  UpdateNotificationPreferenceDto,
} from "@/types/notification.types";

export class NotificationService {
  /**
   * Mengambil daftar notifikasi milik user yang sedang aktif
   */
  public static async getMyNotifications(): Promise<AppNotification[]> {
    const response = await apiClient.get<AppNotification[]>(
      API_CONFIG.ENDPOINTS.NOTIFICATIONS.LIST
    );
    return Array.isArray(response) ? response : [];
  }

  /**
   * Menandai notifikasi spesifik sebagai sudah dibaca
   */
  public static async markAsRead(id: number): Promise<AppNotification> {
    return apiClient.patch<AppNotification>(
      API_CONFIG.ENDPOINTS.NOTIFICATIONS.READ(id)
    );
  }

  /**
   * Menandai seluruh notifikasi user sebagai sudah dibaca dalam 1 request batch (PATCH /notifications/read-all)
   */
  public static async markAllAsRead(): Promise<{ updatedCount: number }> {
    return apiClient.patch<{ updatedCount: number }>(
      API_CONFIG.ENDPOINTS.NOTIFICATIONS.READ_ALL
    );
  }

  /**
   * Mengambil preferensi notifikasi user
   */
  public static async getPreferences(): Promise<NotificationPreference[]> {
    const response = await apiClient.get<NotificationPreference[]>(
      API_CONFIG.ENDPOINTS.NOTIFICATIONS.PREFERENCES
    );
    return Array.isArray(response) ? response : [];
  }

  /**
   * Memperbarui atau menyimpan preferensi notifikasi per kategori
   */
  public static async updatePreference(
    dto: UpdateNotificationPreferenceDto
  ): Promise<NotificationPreference> {
    return apiClient.put<NotificationPreference>(
      API_CONFIG.ENDPOINTS.NOTIFICATIONS.PREFERENCES,
      dto
    );
  }
}
