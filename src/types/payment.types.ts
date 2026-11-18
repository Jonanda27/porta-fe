/**
 * Definisi Tipe & Kontrak Data untuk Payment Gateway & Feature Flag
 */

export type PaymentProviderType = "MIDTRANS" | "BANK_PAPUA" | "MANUAL";
export type PaymentTargetType = "INVOICE" | "ASSET_LEASE" | "UTILITY_READING";

export interface PaymentConfigResponse {
  gatewayEnabled: boolean;
  provider: PaymentProviderType;
  isProduction: boolean;
  midtransClientKey: string | null;
}

export interface UpdatePaymentConfigPayload {
  gatewayEnabled: boolean;
  provider: PaymentProviderType;
}

export interface CheckoutPaymentPayload {
  targetType: PaymentTargetType;
  targetId: number;
}

export interface CheckoutPaymentResponse {
  orderId: string;
  provider: PaymentProviderType;
  amountIdr: number;
  snapToken: string | null;
  redirectUrl: string | null;
}
