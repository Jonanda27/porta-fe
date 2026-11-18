import { API_CONFIG } from "@/config/api.config";
import { apiClient } from "@/lib/api-client";
import {
  BerthItem,
  BerthServiceCategory,
  CreateBerthPayload,
  CreatePortPayload,
  PortCategory,
  PortItem,
  UpdateBerthPayload,
  UpdatePortPayload,
} from "@/types/port.types";

/**
 * Service untuk mengelola Master Pelabuhan & Dermaga (Ports & Berths)
 */
export const PortService = {
  /**
   * Mengambil daftar seluruh pelabuhan aktif beserta relasi dermaganya
   */
  async getAllPorts(portCategory?: PortCategory): Promise<PortItem[]> {
    const response = await apiClient.get<PortItem[]>(
      API_CONFIG.ENDPOINTS.PORTS.BASE,
      portCategory ? { params: { portCategory } } : undefined
    );
    return Array.isArray(response) ? response : [];
  },

  /**
   * Membuat data pelabuhan baru
   */
  createPort(payload: CreatePortPayload): Promise<PortItem> {
    return apiClient.post<PortItem>(API_CONFIG.ENDPOINTS.PORTS.BASE, payload);
  },

  /**
   * Memperbarui informasi pelabuhan
   */
  updatePort(portId: number, payload: UpdatePortPayload): Promise<PortItem> {
    return apiClient.patch<PortItem>(
      `${API_CONFIG.ENDPOINTS.PORTS.BASE}/${portId}`,
      payload
    );
  },

  /**
   * Mengambil daftar dermaga fisik aktif untuk pelabuhan tertentu (Default: Pelabuhan Poumako ID 1)
   */
  async getBerthsByPort(
    portId: number = 1,
    berthServiceCategory?: BerthServiceCategory
  ): Promise<BerthItem[]> {
    const response = await apiClient.get<BerthItem[]>(
      `${API_CONFIG.ENDPOINTS.PORTS.BASE}/${portId}/berths`,
      berthServiceCategory ? { params: { berthServiceCategory } } : undefined
    );
    return Array.isArray(response) ? response : [];
  },

  /**
   * Mendaftarkan dermaga fisik baru
   */
  createBerth(payload: CreateBerthPayload): Promise<BerthItem> {
    return apiClient.post<BerthItem>(API_CONFIG.ENDPOINTS.PORTS.BERTHS, payload);
  },

  /**
   * Memperbarui spesifikasi dermaga
   */
  updateBerth(berthId: number, payload: UpdateBerthPayload): Promise<BerthItem> {
    return apiClient.patch<BerthItem>(
      `${API_CONFIG.ENDPOINTS.PORTS.BERTHS}/${berthId}`,
      payload
    );
  },
};
