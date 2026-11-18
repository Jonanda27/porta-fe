import { create } from "zustand";
import { AppNotification } from "@/types/notification.types";
import { NotificationService } from "@/services/notification.service";
import { ApiException } from "@/lib/api-client";

interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,

  fetchNotifications: async () => {
    set({ isLoading: true, error: null });
    try {
      const notifications = await NotificationService.getMyNotifications();
      const unreadCount = notifications.filter((n) => !n.isRead).length;
      set({ notifications, unreadCount, isLoading: false, error: null });
    } catch (err: unknown) {
      const msg =
        err instanceof ApiException
          ? err.message
          : err instanceof Error
          ? err.message
          : "Gagal memuat notifikasi sistem";
      set({ isLoading: false, error: msg });
    }
  },

  markAsRead: async (id: number) => {
    try {
      // Optimistic update
      const current = get().notifications;
      const updated = current.map((n) => (n.id === id ? { ...n, isRead: true } : n));
      const unreadCount = updated.filter((n) => !n.isRead).length;
      set({ notifications: updated, unreadCount });

      // Call API
      await NotificationService.markAsRead(id);
    } catch {
      // Jika gagal, refresh kembali dari server
      get().fetchNotifications();
    }
  },

  markAllAsRead: async () => {
    const unread = get().notifications.filter((n) => !n.isRead);
    if (unread.length === 0) return;

    try {
      // Optimistic update
      const updated = get().notifications.map((n) => ({ ...n, isRead: true }));
      set({ notifications: updated, unreadCount: 0 });

      // Call API
      await NotificationService.markAllAsRead(unread.map((n) => n.id));
    } catch {
      // Jika gagal, refresh kembali dari server
      get().fetchNotifications();
    }
  },
}));
