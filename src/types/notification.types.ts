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
  | "GENERAL";

export interface AppNotification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  linkUrl?: string | null;
  createdAt: string;
}

export type NotificationFilterCategory =
  | "ALL"
  | "UNREAD"
  | "VISITS"
  | "BILLING"
  | "WARNINGS";
