import { API_CONFIG } from "@/config/api.config";
import { apiClient } from "@/lib/api-client";
import {
  ClaimVesselPayload,
  CreateVesselPayload,
  CreateVisitPayload,
  OperatorDocument,
  ShipOperator,
  UploadDocumentPayload,
  Vessel,
  VesselVisit,
} from "@/types/kapal.types";

export class KapalService {
  /**
   * Mengambil data profil perusahaan pelayaran / operator kapal dari backend
   */
  public static async getMyOperatorProfile(): Promise<ShipOperator | null> {
    const list = await apiClient.get<ShipOperator[]>(API_CONFIG.ENDPOINTS.VESSELS.OPERATORS);
    return Array.isArray(list) && list.length > 0 ? list[0] : null;
  }

  /**
   * Mengambil daftar seluruh armada kapal milik operator yang sedang login
   */
  public static async getMyVessels(): Promise<Vessel[]> {
    const response = await apiClient.get<Vessel[]>(API_CONFIG.ENDPOINTS.VESSELS.LIST);
    return Array.isArray(response) ? response : [];
  }

  /**
   * Mencari kapal di Katalog Master Kapal Global PORTA (Search-First sebelum daftar baru)
   */
  public static async searchVesselCatalog(query?: string): Promise<Vessel[]> {
    const response = await apiClient.get<Vessel[]>(
      API_CONFIG.ENDPOINTS.VESSELS.CATALOG,
      query ? { params: { q: query } } : undefined
    );
    return Array.isArray(response) ? response : [];
  }

  /**
   * Mendaftarkan armada kapal baru milik operator ke Backend
   */
  public static async createVessel(payload: CreateVesselPayload): Promise<Vessel> {
    return apiClient.post<Vessel>(API_CONFIG.ENDPOINTS.VESSELS.LIST, payload);
  }

  /**
   * Mengklaim kapal yang sudah terdaftar di Katalog Global ke armada perusahaan (OWNER / AGENT / CHARTERER)
   */
  public static async claimVessel(
    operatorId: number,
    vesselId: number,
    payload: ClaimVesselPayload
  ): Promise<unknown> {
    return apiClient.post<unknown>(
      `${API_CONFIG.ENDPOINTS.VESSELS.OPERATORS_BASE}/${operatorId}/vessels/${vesselId}/claim`,
      payload
    );
  }

  /**
   * Melepas ikatan kapal dari armada perusahaan (tanpa menghapus master kapal global)
   */
  public static async unlinkVessel(operatorId: number, vesselId: number): Promise<unknown> {
    return apiClient.delete<unknown>(
      `${API_CONFIG.ENDPOINTS.VESSELS.OPERATORS_BASE}/${operatorId}/vessels/${vesselId}`
    );
  }

  /**
   * Upload dokumen kapal (Surat Ukur, Pas Tahunan/Besar/Kecil, dsb)
   */
  public static async uploadVesselDocument(
    vesselId: number,
    payload: UploadDocumentPayload,
    file: File | Blob
  ): Promise<OperatorDocument> {
    const formData = new FormData();
    formData.append("category", payload.category);
    if (payload.documentNumber) formData.append("documentNumber", payload.documentNumber);
    if (payload.notes) formData.append("notes", payload.notes);
    formData.append("file", file);

    return apiClient.post<OperatorDocument>(
      `${API_CONFIG.ENDPOINTS.VESSELS.LIST}/${vesselId}/documents`,
      formData
    );
  }

  /**
   * Upload dokumen legalitas perusahaan operator (SIUPAL, NIB, NPWP)
   */
  public static async uploadOperatorDocument(
    operatorId: number,
    payload: UploadDocumentPayload,
    file: File | Blob
  ): Promise<OperatorDocument> {
    const formData = new FormData();
    formData.append("category", payload.category);
    if (payload.documentNumber) formData.append("documentNumber", payload.documentNumber);
    if (payload.notes) formData.append("notes", payload.notes);
    formData.append("file", file);

    return apiClient.post<OperatorDocument>(
      `${API_CONFIG.ENDPOINTS.VESSELS.OPERATORS}/${operatorId}/documents`,
      formData
    );
  }

  /**
   * Mengambil daftar riwayat & rencana kunjungan kapal (Visits) milik operator
   */
  public static async getMyVisits(): Promise<VesselVisit[]> {
    const response = await apiClient.get<VesselVisit[]>(API_CONFIG.ENDPOINTS.VESSELS.VISITS);
    return Array.isArray(response) ? response : [];
  }

  /**
   * Mengambil detail satu kunjungan kapal beserta alokasi dermaga & invoice terkait
   */
  public static async getVisitDetail(visitId: number): Promise<VesselVisit> {
    return apiClient.get<VesselVisit>(`${API_CONFIG.ENDPOINTS.VESSELS.VISITS}/${visitId}`);
  }

  /**
   * Mengajukan Permohonan Sandar Kapal (PPK / Visit Request) ke Backend
   */
  public static async createVisitRequest(payload: CreateVisitPayload): Promise<VesselVisit> {
    return apiClient.post<VesselVisit>(API_CONFIG.ENDPOINTS.VESSELS.VISITS, payload);
  }
}
