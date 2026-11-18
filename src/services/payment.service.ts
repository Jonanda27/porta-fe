import { API_CONFIG } from "@/config/api.config";
import { apiClient } from "@/lib/api-client";
import {
  CheckoutPaymentPayload,
  CheckoutPaymentResponse,
  PaymentConfigResponse,
  UpdatePaymentConfigPayload,
} from "@/types/payment.types";

/**
 * Service untuk Payment Gateway Adapter & Feature Flag
 */
export const PaymentService = {
  getConfig(): Promise<PaymentConfigResponse> {
    return apiClient.get<PaymentConfigResponse>(
      API_CONFIG.ENDPOINTS.PAYMENTS.CONFIG
    );
  },

  updateConfig(
    payload: UpdatePaymentConfigPayload
  ): Promise<PaymentConfigResponse> {
    return apiClient.patch<PaymentConfigResponse>(
      API_CONFIG.ENDPOINTS.PAYMENTS.CONFIG,
      payload
    );
  },

  checkout(payload: CheckoutPaymentPayload): Promise<CheckoutPaymentResponse> {
    return apiClient.post<CheckoutPaymentResponse>(
      API_CONFIG.ENDPOINTS.PAYMENTS.CHECKOUT,
      payload
    );
  },
};
