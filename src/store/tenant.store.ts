import { create } from "zustand";
import { TenantService } from "@/services/tenant.service";
import { UtilityReadingItem } from "@/types/field-ops.types";
import {
  PortAssetCatalogItem,
  RequestLeasePayload,
  TenantDocumentCategory,
  TenantLeaseItem,
  TenantProfile,
} from "@/types/tenant.types";

interface TenantState {
  profile: TenantProfile | null;
  assets: PortAssetCatalogItem[];
  leases: TenantLeaseItem[];
  utilities: UtilityReadingItem[];
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  isApplyModalOpen: boolean;
  selectedAssetForApply: PortAssetCatalogItem | null;

  fetchTenantData: () => Promise<void>;
  openApplyModal: (asset?: PortAssetCatalogItem) => void;
  closeApplyModal: () => void;
  uploadDocument: (
    category: TenantDocumentCategory,
    file: File,
    documentNumber?: string,
    notes?: string
  ) => Promise<void>;
  requestLease: (payload: RequestLeasePayload) => Promise<void>;
  clearError: () => void;
}

export const useTenantStore = create<TenantState>((set, get) => ({
  profile: null,
  assets: [],
  leases: [],
  utilities: [],
  isLoading: false,
  isSubmitting: false,
  error: null,
  isApplyModalOpen: false,
  selectedAssetForApply: null,

  openApplyModal: (asset) =>
    set({
      isApplyModalOpen: true,
      selectedAssetForApply: asset || null,
      error: null,
    }),

  closeApplyModal: () =>
    set({
      isApplyModalOpen: false,
      selectedAssetForApply: null,
    }),

  fetchTenantData: async () => {
    set({ isLoading: true, error: null });
    try {
      const [profile, assets, leases, utilities] = await Promise.all([
        TenantService.getMyProfile().catch(() => null),
        TenantService.getAvailableAssets(),
        TenantService.getMyLeases(),
        TenantService.getMyUtilities(),
      ]);
      set({ profile, assets, leases, utilities, isLoading: false });
    } catch (err: unknown) {
      set({
        error:
          err instanceof Error
            ? err.message
            : "Gagal memuat data portal tenant.",
        isLoading: false,
      });
    }
  },

  uploadDocument: async (category, file, documentNumber, notes) => {
    set({ isSubmitting: true, error: null });
    try {
      await TenantService.uploadMyDocument(
        category,
        file,
        documentNumber,
        notes
      );
      await get().fetchTenantData();
      set({ isSubmitting: false });
    } catch (err: unknown) {
      set({
        error:
          err instanceof Error ? err.message : "Gagal mengunggah dokumen.",
        isSubmitting: false,
      });
      throw err;
    }
  },

  requestLease: async (payload) => {
    set({ isSubmitting: true, error: null });
    try {
      await TenantService.requestLease(payload);
      await get().fetchTenantData();
      set({ isSubmitting: false });
    } catch (err: unknown) {
      set({
        error:
          err instanceof Error ? err.message : "Gagal mengajukan sewa aset.",
        isSubmitting: false,
      });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));
