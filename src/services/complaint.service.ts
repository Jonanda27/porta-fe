/**
 * Service Pengaduan & Lapor Kendala Fasilitas PORTA
 * Sesuai arsitektur 3-lapis PORTA
 */

import { API_CONFIG } from "@/config/api.config";
import { apiClient } from "@/lib/api-client";
import {
  CreateFacilityComplaintPayload,
  ComplaintItem,
} from "@/types/complaint.types";

export class ComplaintService {
  /**
   * Mengirim laporan kendala fasilitas kios / aset UPTD
   */
  public static async submitComplaint(
    payload: CreateFacilityComplaintPayload
  ): Promise<{ ticketNumber: string; status: string; createdAt: string }> {
    return apiClient.post(API_CONFIG.ENDPOINTS.COMPLAINTS.SUBMIT, payload);
  }

  /**
   * Melacak status laporan pengaduan berdasarkan nomor tiket
   */
  public static async trackComplaint(ticketNumber: string): Promise<ComplaintItem> {
    return apiClient.get<ComplaintItem>(API_CONFIG.ENDPOINTS.COMPLAINTS.TRACK, {
      params: { ticketNumber },
    });
  }

  /**
   * Mengambil riwayat aduan milik pengguna/penyewa aktif
   */
  public static async getMyComplaints(): Promise<ComplaintItem[]> {
    try {
      const response = await apiClient.get<ComplaintItem[]>(
        API_CONFIG.ENDPOINTS.COMPLAINTS.MY
      );
      return Array.isArray(response) ? response : [];
    } catch {
      return [];
    }
  }
}
