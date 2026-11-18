import { API_CONFIG } from "@/config/api.config";
import { apiClient } from "@/lib/api-client";
import { AppNotification } from "@/types/notification.types";

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
   * Menandai beberapa notifikasi sekaligus sebagai sudah dibaca
   */
  public static async markAllAsRead(ids: number[]): Promise<void> {
    if (!ids || ids.length === 0) return;
    await Promise.allSettled(
      ids.map((id) =>
        apiClient.patch(API_CONFIG.ENDPOINTS.NOTIFICATIONS.READ(id))
      )
    );
  }
}
