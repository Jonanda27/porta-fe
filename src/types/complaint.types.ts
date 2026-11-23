/**
 * Tipe Data Terpusat Modul Pengaduan & Kendala Fasilitas PORTA
 * 
 * Sesuai dengan spesifikasi backend porta-be (modules/public-portal)
 */

export type ComplaintStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";

export type FacilityIssueCategory =
  | "LISTRIK"
  | "AIR_BERSIH"
  | "FISIK_BANGUNAN"
  | "KEBERSIHAN_LINGKUNGAN"
  | "KEAMANAN"
  | "LAINNYA";

export interface CreateFacilityComplaintPayload {
  portId: number;
  reporterName: string;
  reporterPhone?: string;
  reporterEmail?: string;
  category: string;
  subject: string;
  description: string;
}

export interface ComplaintItem {
  id?: number;
  ticketNumber: string;
  portId?: number;
  reporterName?: string;
  reporterPhone?: string | null;
  reporterEmail?: string | null;
  category: string;
  subject: string;
  description?: string;
  status: ComplaintStatus;
  resolutionNote?: string | null;
  resolvedAt?: string | null;
  createdAt: string;
  port?: {
    id?: number;
    code?: string;
    name: string;
  };
}
