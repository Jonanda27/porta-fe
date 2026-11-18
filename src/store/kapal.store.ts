import { create } from "zustand";
import {
  CreateVesselPayload,
  CreateVisitPayload,
  OperatorDocument,
  ShipOperator,
  UploadDocumentPayload,
  Vessel,
  VesselVisit,
} from "@/types/kapal.types";
import { KapalService } from "@/services/kapal.service";
import { ApiException } from "@/lib/api-client";

interface KapalState {
  operator: ShipOperator | null;
  vessels: Vessel[];
  visits: VesselVisit[];
  selectedVisitDetail: VesselVisit | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchDashboardData: () => Promise<void>;
  fetchOperatorProfile: () => Promise<void>;
  fetchVessels: () => Promise<void>;
  fetchVisits: () => Promise<void>;
  fetchVisitDetail: (visitId: number) => Promise<VesselVisit>;
  createVisitRequest: (payload: CreateVisitPayload) => Promise<VesselVisit>;
  createVessel: (payload: CreateVesselPayload) => Promise<Vessel>;
  uploadVesselDocument: (
    vesselId: number,
    payload: UploadDocumentPayload,
    file: File | Blob
  ) => Promise<OperatorDocument>;
  uploadOperatorDocument: (
    operatorId: number | string,
    payload: UploadDocumentPayload,
    file: File | Blob
  ) => Promise<OperatorDocument>;
}

export const useKapalStore = create<KapalState>((set, get) => ({
  operator: null,
  vessels: [],
  visits: [],
  selectedVisitDetail: null,
  isLoading: false,
  error: null,

  fetchDashboardData: async () => {
    set({ isLoading: true, error: null });
    try {
      const [operator, vessels, visits] = await Promise.all([
        KapalService.getMyOperatorProfile().catch(() => null),
        KapalService.getMyVessels().catch(() => []),
        KapalService.getMyVisits().catch(() => []),
      ]);

      set({
        operator,
        vessels,
        visits,
        isLoading: false,
        error: null,
      });
    } catch (err: unknown) {
      const message =
        err instanceof ApiException
          ? err.message
          : err instanceof Error
          ? err.message
          : "Gagal memuat data operasional kapal.";

      set({
        isLoading: false,
        error: message,
      });
    }
  },

  fetchOperatorProfile: async () => {
    try {
      const operator = await KapalService.getMyOperatorProfile();
      set({ operator });
    } catch (err: unknown) {
      console.error("Gagal memuat profil operator:", err);
    }
  },

  fetchVessels: async () => {
    try {
      const vessels = await KapalService.getMyVessels();
      set({ vessels });
    } catch (err: unknown) {
      console.error("Gagal memuat daftar kapal:", err);
    }
  },

  fetchVisits: async () => {
    try {
      const visits = await KapalService.getMyVisits();
      set({ visits });
    } catch (err: unknown) {
      console.error("Gagal memuat daftar kunjungan kapal:", err);
    }
  },

  fetchVisitDetail: async (visitId: number): Promise<VesselVisit> => {
    try {
      const detail = await KapalService.getVisitDetail(visitId);
      set({ selectedVisitDetail: detail });
      return detail;
    } catch (err: unknown) {
      console.error("Gagal memuat detail kunjungan:", err);
      throw err;
    }
  },

  createVisitRequest: async (payload: CreateVisitPayload): Promise<VesselVisit> => {
    set({ isLoading: true, error: null });
    try {
      const newVisit = await KapalService.createVisitRequest(payload);
      set((state) => ({
        visits: [newVisit, ...state.visits],
        isLoading: false,
      }));
      return newVisit;
    } catch (err: unknown) {
      const message =
        err instanceof ApiException
          ? err.message
          : err instanceof Error
          ? err.message
          : "Gagal mengajukan permohonan sandar.";
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  createVessel: async (payload: CreateVesselPayload): Promise<Vessel> => {
    set({ isLoading: true, error: null });
    try {
      const newVessel = await KapalService.createVessel(payload);
      await get().fetchVessels();
      set({ isLoading: false });
      return newVessel;
    } catch (err: unknown) {
      const message =
        err instanceof ApiException
          ? err.message
          : err instanceof Error
          ? err.message
          : "Gagal mendaftarkan armada kapal baru.";
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  uploadVesselDocument: async (
    vesselId: number,
    payload: UploadDocumentPayload,
    file: File | Blob
  ): Promise<OperatorDocument> => {
    set({ isLoading: true, error: null });
    try {
      const doc = await KapalService.uploadVesselDocument(vesselId, payload, file);
      await get().fetchVessels();
      set({ isLoading: false });
      return doc;
    } catch (err: unknown) {
      const message =
        err instanceof ApiException
          ? err.message
          : err instanceof Error
          ? err.message
          : "Gagal mengunggah dokumen kapal.";
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  uploadOperatorDocument: async (
    operatorId: number | string,
    payload: UploadDocumentPayload,
    file: File | Blob
  ): Promise<OperatorDocument> => {
    set({ isLoading: true, error: null });
    try {
      const doc = await KapalService.uploadOperatorDocument(operatorId, payload, file);
      await get().fetchOperatorProfile();
      set({ isLoading: false });
      return doc;
    } catch (err: unknown) {
      const message =
        err instanceof ApiException
          ? err.message
          : err instanceof Error
          ? err.message
          : "Gagal mengunggah dokumen legalitas perusahaan.";
      set({ isLoading: false, error: message });
      throw err;
    }
  },
}));
