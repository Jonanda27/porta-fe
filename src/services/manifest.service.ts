import { API_CONFIG } from "@/config/api.config";
import { apiClient } from "@/lib/api-client";
import {
  CreateVesselManifestPayload,
  FerryRouteItem,
  VesselManifestItem,
} from "@/types/manifest.types";

/**
 * Service API untuk Manifes Penumpang & Muatan Kapal (Gate Ticketing / SOLAS)
 */
export const ManifestService = {
  /**
   * Mengambil riwayat manifes kapal (otomatis di-scope per operator oleh backend)
   */
  async listManifests(portId?: number): Promise<VesselManifestItem[]> {
    const params = portId ? { portId } : undefined;
    const response = await apiClient.get<VesselManifestItem[]>(
      API_CONFIG.ENDPOINTS.GATE_TICKETING.MANIFESTS,
      params ? { params } : undefined
    );
    return Array.isArray(response) ? response : [];
  },

  /**
   * Menyerahkan laporan manifes muatan & penumpang kapal baru ke sistem pelabuhan
   */
  async createManifest(payload: CreateVesselManifestPayload): Promise<VesselManifestItem> {
    return apiClient.post<VesselManifestItem>(
      API_CONFIG.ENDPOINTS.GATE_TICKETING.MANIFESTS,
      payload
    );
  },

  /**
   * Mengambil daftar master trayek penyeberangan / ferry routes
   */
  async listFerryRoutes(portId?: number): Promise<FerryRouteItem[]> {
    const params = portId ? { portId } : undefined;
    const response = await apiClient.get<FerryRouteItem[]>(
      API_CONFIG.ENDPOINTS.GATE_TICKETING.FERRY_ROUTES,
      params ? { params } : undefined
    );
    return Array.isArray(response) ? response : [];
  },
};
