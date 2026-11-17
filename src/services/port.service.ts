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
  getAllPorts(portCategory?: PortCategory): Promise<PortItem[]> {
    return apiClient.get<PortItem[]>(
      API_CONFIG.ENDPOINTS.PORTS.BASE,
      portCategory ? { params: { portCategory } } : undefined
    );
  },

  createPort(payload: CreatePortPayload): Promise<PortItem> {
    return apiClient.post<PortItem>(API_CONFIG.ENDPOINTS.PORTS.BASE, payload);
  },

  updatePort(portId: number, payload: UpdatePortPayload): Promise<PortItem> {
    return apiClient.patch<PortItem>(
      `${API_CONFIG.ENDPOINTS.PORTS.BASE}/${portId}`,
      payload
    );
  },

  getBerthsByPort(
    portId: number,
    berthServiceCategory?: BerthServiceCategory
  ): Promise<BerthItem[]> {
    return apiClient.get<BerthItem[]>(
      `${API_CONFIG.ENDPOINTS.PORTS.BASE}/${portId}/berths`,
      berthServiceCategory ? { params: { berthServiceCategory } } : undefined
    );
  },

  createBerth(payload: CreateBerthPayload): Promise<BerthItem> {
    return apiClient.post<BerthItem>(API_CONFIG.ENDPOINTS.PORTS.BERTHS, payload);
  },

  updateBerth(berthId: number, payload: UpdateBerthPayload): Promise<BerthItem> {
    return apiClient.patch<BerthItem>(
      `${API_CONFIG.ENDPOINTS.PORTS.BERTHS}/${berthId}`,
      payload
    );
  },
};
