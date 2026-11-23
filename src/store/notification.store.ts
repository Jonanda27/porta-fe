import { create } from "zustand";
import {
  AppNotification,
  NotificationPreference,
  UpdateNotificationPreferenceDto,
} from "@/types/notification.types";
import { NotificationService } from "@/services/notification.service";
import { ApiException } from "@/lib/api-client";

interface NotificationState {
  notifications: AppNotification[];
  preferences: NotificationPreference[];
  unreadCount: number;
  isLoading: boolean;
  isSavingPreference: boolean;
  error: string | null;

  // Actions
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  fetchPreferences: () => Promise<void>;
  updatePreference: (
    dto: UpdateNotificationPreferenceDto
  ) => Promise<NotificationPreference>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  preferences: [],
  unreadCount: 0,
  isLoading: false,
  isSavingPreference: false,
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

      // Single batch API call (PATCH /notifications/read-all)
      await NotificationService.markAllAsRead();
    } catch {
      // Jika gagal, refresh kembali dari server
      get().fetchNotifications();
    }
  },

  fetchPreferences: async () => {
    try {
      const preferences = await NotificationService.getPreferences();
      set({ preferences });
    } catch (err: unknown) {
      console.error("Gagal memuat preferensi notifikasi:", err);
    }
  },

  updatePreference: async (
    dto: UpdateNotificationPreferenceDto
  ): Promise<NotificationPreference> => {
    set({ isSavingPreference: true, error: null });
    try {
      const saved = await NotificationService.updatePreference(dto);
      set((state) => {
        const exists = state.preferences.some((p) => p.category === saved.category);
        const nextPreferences = exists
          ? state.preferences.map((p) => (p.category === saved.category ? saved : p))
          : [...state.preferences, saved];
        return {
          preferences: nextPreferences,
          isSavingPreference: false,
          error: null,
        };
      });
      return saved;
    } catch (err: unknown) {
      const msg =
        err instanceof ApiException
          ? err.message
          : err instanceof Error
          ? err.message
          : "Gagal menyimpan preferensi notifikasi.";
      set({ isSavingPreference: false, error: msg });
      throw err;
    }
  },
}));
