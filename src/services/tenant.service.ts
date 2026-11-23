import { API_CONFIG } from "@/config/api.config";
import { apiClient } from "@/lib/api-client";
import { LoginResponse } from "@/types/auth.types";
import { UtilityReadingItem } from "@/types/field-ops.types";
import {
  LeasePaymentReceiptPayload,
  PortAssetCatalogItem,
  RegisterTenantPayload,
  RequestLeasePayload,
  TenantDocumentCategory,
  TenantLeaseItem,
  TenantProfile,
  UtilityReceiptPayload,
} from "@/types/tenant.types";
import { DocumentItem } from "@/types/upt.types";

/**
 * Service untuk Portal Tenant & Mitra Usaha
 */
export const TenantService = {
  registerTenant(payload: RegisterTenantPayload): Promise<LoginResponse> {
    return apiClient.post<LoginResponse>(
      API_CONFIG.ENDPOINTS.AUTH.REGISTER_TENANT,
      payload
    );
  },

  getMyProfile(): Promise<TenantProfile> {
    return apiClient.get<TenantProfile>(API_CONFIG.ENDPOINTS.ASSETS.TENANT_ME);
  },

  uploadMyDocument(
    category: TenantDocumentCategory,
    file: File,
    documentNumber?: string,
    notes?: string
  ): Promise<DocumentItem> {
    const formData = new FormData();
    formData.append("category", category);
    formData.append("file", file);
    if (documentNumber) formData.append("documentNumber", documentNumber);
    if (notes) formData.append("notes", notes);
    return apiClient.post<DocumentItem>(
      API_CONFIG.ENDPOINTS.ASSETS.TENANT_DOCUMENTS,
      formData
    );
  },

  getAvailableAssets(): Promise<PortAssetCatalogItem[]> {
    return apiClient.get<PortAssetCatalogItem[]>(
      API_CONFIG.ENDPOINTS.ASSETS.ASSETS
    );
  },

  getMyLeases(): Promise<TenantLeaseItem[]> {
    return apiClient.get<TenantLeaseItem[]>(API_CONFIG.ENDPOINTS.ASSETS.LEASES);
  },

  requestLease(payload: RequestLeasePayload): Promise<TenantLeaseItem> {
    return apiClient.post<TenantLeaseItem>(
      API_CONFIG.ENDPOINTS.ASSETS.LEASE_REQUEST,
      payload
    );
  },

  getMyUtilities(): Promise<UtilityReadingItem[]> {
    return apiClient.get<UtilityReadingItem[]>(
      API_CONFIG.ENDPOINTS.CARGO_UTILITY.UTILITIES
    );
  },

  getLeasePaymentReceipt(paymentId: number): Promise<LeasePaymentReceiptPayload> {
    return apiClient.get<LeasePaymentReceiptPayload>(
      API_CONFIG.ENDPOINTS.ASSETS.LEASE_PAYMENT_RECEIPT(paymentId)
    );
  },

  getUtilityReceipt(utilityId: number): Promise<UtilityReceiptPayload> {
    return apiClient.get<UtilityReceiptPayload>(
      API_CONFIG.ENDPOINTS.CARGO_UTILITY.UTILITY_RECEIPT(utilityId)
    );
  },
};
