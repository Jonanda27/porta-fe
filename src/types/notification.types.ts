/**
 * Tipe Data Terpusat Modul Notifikasi PORTA
 * 
 * Sesuai dengan spesifikasi backend porta-be (modules/notifications)
 */

export type NotificationType =
  | "WARNING"
  | "BERTHING_OVERRIDE"
  | "VISIT_APPROVED"
  | "INVOICE_ISSUED"
  | "PAYMENT_VERIFIED"
  | "GENERAL"
  | "LEASE_REQUEST"
  | "LEASE_VERIFIED"
  | "LEASE_APPROVED"
  | "LEASE_REJECTED"
  | "UTILITY_ALERT"
  | "PAYMENT_SUCCESS"
  | "VISIT_REQUEST";

export type NotificationPriority = "INFORMATIONAL" | "WARNING" | "URGENT" | "CRITICAL";

export interface AppNotification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: NotificationType;
  category?: string;
  priority?: NotificationPriority;
  isRead: boolean;
  linkUrl?: string | null;
  createdAt: string;
}

export interface NotificationPreference {
  id?: number;
  userId: number;
  category: string;
  minPriority: NotificationPriority;
  inAppEnabled: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateNotificationPreferenceDto {
  category: string;
  minPriority?: NotificationPriority;
  inAppEnabled?: boolean;
}

export type NotificationFilterCategory =
  | "ALL"
  | "UNREAD"
  | "VISITS"
  | "BILLING"
  | "WARNINGS"
  | "LEASES";

export type KapalNotificationFilterTab =
  | "ALL"
  | "UNREAD"
  | "VISITS"
  | "BILLING"
  | "WARNINGS";
