import { create } from "zustand";
import { ManifestService } from "@/services/manifest.service";
import { ApiException } from "@/lib/api-client";
import {
  CreateVesselManifestPayload,
  FerryRouteItem,
  VesselManifestItem,
} from "@/types/manifest.types";

interface ManifestState {
  manifests: VesselManifestItem[];
  ferryRoutes: FerryRouteItem[];
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;

  // Actions
  fetchManifests: (portId?: number) => Promise<void>;
  fetchFerryRoutes: (portId?: number) => Promise<void>;
  createManifest: (payload: CreateVesselManifestPayload) => Promise<VesselManifestItem>;
  clearError: () => void;
}

export const useManifestStore = create<ManifestState>((set) => ({
  manifests: [],
  ferryRoutes: [],
  isLoading: false,
  isSubmitting: false,
  error: null,

  fetchManifests: async (portId?: number) => {
    set({ isLoading: true, error: null });
    try {
      const manifests = await ManifestService.listManifests(portId);
      set({ manifests, isLoading: false, error: null });
    } catch (err: unknown) {
      const message =
        err instanceof ApiException
          ? err.message
          : err instanceof Error
          ? err.message
          : "Gagal memuat riwayat manifes kapal.";
      set({ isLoading: false, error: message });
    }
  },

  fetchFerryRoutes: async (portId?: number) => {
    try {
      const ferryRoutes = await ManifestService.listFerryRoutes(portId);
      set({ ferryRoutes });
    } catch {
      // Non-blocking fallback jika rute ferry kosong
    }
  },

  createManifest: async (payload: CreateVesselManifestPayload) => {
    set({ isSubmitting: true, error: null });
    try {
      const created = await ManifestService.createManifest(payload);
      set((state) => ({
        manifests: [created, ...state.manifests],
        isSubmitting: false,
        error: null,
      }));
      return created;
    } catch (err: unknown) {
      const message =
        err instanceof ApiException
          ? err.message
          : err instanceof Error
          ? err.message
          : "Gagal mengirimkan laporan manifes kapal.";
      set({ isSubmitting: false, error: message });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));
