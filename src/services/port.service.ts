import { API_CONFIG } from "@/config/api.config";
import { apiClient } from "@/lib/api-client";
import { Berth, BerthServiceCategory, Port } from "@/types/port.types";

export class PortService {
  /**
   * Mengambil daftar seluruh pelabuhan aktif beserta relasi dermaganya
   */
  public static async getAllPorts(): Promise<Port[]> {
    const response = await apiClient.get<Port[]>(API_CONFIG.ENDPOINTS.PORTS.LIST);
    return Array.isArray(response) ? response : [];
  }

  /**
   * Mengambil daftar dermaga fisik aktif untuk pelabuhan tertentu (Default: Pelabuhan Poumako ID 1)
   */
  public static async getBerthsByPort(
    portId: number = 1,
    berthServiceCategory?: BerthServiceCategory
  ): Promise<Berth[]> {
    const url = API_CONFIG.ENDPOINTS.PORTS.BERTHS(portId);
    const query = berthServiceCategory ? `?berthServiceCategory=${berthServiceCategory}` : "";
    const response = await apiClient.get<Berth[]>(`${url}${query}`);
    return Array.isArray(response) ? response : [];
  }
}
