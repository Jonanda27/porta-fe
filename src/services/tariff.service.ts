import { API_CONFIG } from "@/config/api.config";
import { apiClient } from "@/lib/api-client";
import {
  CreateTariffPayload,
  TariffItem,
  UsdExchangeRateResponse,
} from "@/types/tariff.types";

/**
 * Service untuk mengelola Master Tarif Perda Mimika 4/2023 & Kurs USD
 */
export const TariffService = {
  getAllActiveTariffs(): Promise<TariffItem[]> {
    return apiClient.get<TariffItem[]>(API_CONFIG.ENDPOINTS.TARIFFS.BASE);
  },

  getLiveUsdRate(refresh = false): Promise<UsdExchangeRateResponse> {
    return apiClient.get<UsdExchangeRateResponse>(
      API_CONFIG.ENDPOINTS.TARIFFS.USD_RATE,
      refresh ? { params: { refresh: true } } : undefined
    );
  },

  createTariff(payload: CreateTariffPayload): Promise<TariffItem> {
    return apiClient.post<TariffItem>(API_CONFIG.ENDPOINTS.TARIFFS.BASE, payload);
  },

  deactivateTariff(tariffId: number): Promise<TariffItem> {
    return apiClient.patch<TariffItem>(
      `${API_CONFIG.ENDPOINTS.TARIFFS.BASE}/${tariffId}/deactivate`
    );
  },
};
