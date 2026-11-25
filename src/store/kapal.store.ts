import { create } from "zustand";
import {
  ClaimVesselPayload,
  CreateBerthingContractPayload,
  CreateVesselPayload,
  CreateVisitPayload,
  OperatorBerthingContract,
  OperatorDocument,
  ShipOperator,
  UpdateOperatorPayload,
  UpdateVesselPayload,
  UploadDocumentPayload,
  Vessel,
  VesselRegistrationAttachment,
  VesselVisit,
} from "@/types/kapal.types";
import {
  AssetLease,
  PortAsset,
  RequestAssetLeaseDto,
} from "@/types/asset.types";
import { KapalService } from "@/services/kapal.service";
import { ApiException } from "@/lib/api-client";

interface KapalState {
  operator: ShipOperator | null;
  vessels: Vessel[];
  visits: VesselVisit[];
  contracts: OperatorBerthingContract[];
  portAssets: PortAsset[];
  assetLeases: AssetLease[];
  selectedVisitDetail: VesselVisit | null;
  selectedCategory: "ALL" | "BARANG" | "PENUMPANG" | "CAMPURAN";
  isLoading: boolean;
  isLeaseSubmitting: boolean;
  error: string | null;
  leaseError: string | null;

  // Actions
  fetchDashboardData: () => Promise<void>;
  fetchOperatorProfile: () => Promise<void>;
  updateOperatorProfile: (
    operatorId: number | string,
    payload: UpdateOperatorPayload
  ) => Promise<ShipOperator>;
  fetchContracts: (operatorId?: number | string) => Promise<void>;
  createContract: (
    operatorId: number | string,
    payload: CreateBerthingContractPayload,
    file?: File | Blob
  ) => Promise<OperatorBerthingContract>;
  uploadSignedContract: (
    contractId: number | string,
    file: File | Blob
  ) => Promise<OperatorBerthingContract>;
  fetchPortAssets: () => Promise<void>;
  fetchAssetLeases: () => Promise<void>;
  requestAssetLease: (payload: RequestAssetLeaseDto) => Promise<AssetLease>;
  clearLeaseError: () => void;
  fetchVessels: (category?: "BARANG" | "PENUMPANG" | "CAMPURAN") => Promise<void>;
  setSelectedCategory: (category: "ALL" | "BARANG" | "PENUMPANG" | "CAMPURAN") => void;
  fetchVisits: () => Promise<void>;
  fetchVisitDetail: (visitId: number) => Promise<VesselVisit>;
  createVisitRequest: (payload: CreateVisitPayload) => Promise<VesselVisit>;
  createVessel: (
    payload: CreateVesselPayload,
    attachments?: VesselRegistrationAttachment[]
  ) => Promise<Vessel>;
  updateVessel: (
    vesselId: number,
    payload: UpdateVesselPayload,
    attachments?: VesselRegistrationAttachment[]
  ) => Promise<Vessel>;
  claimVessel: (
    operatorId: number,
    vesselId: number,
    payload: ClaimVesselPayload
  ) => Promise<void>;
  unlinkVessel: (operatorId: number, vesselId: number) => Promise<void>;
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
  contracts: [],
  portAssets: [],
  assetLeases: [],
  selectedVisitDetail: null,
  selectedCategory: "ALL",
  isLoading: false,
  isLeaseSubmitting: false,
  error: null,
  leaseError: null,

  fetchDashboardData: async () => {
    set({ isLoading: true, error: null });
    try {
      const operator = await KapalService.getMyOperatorProfile().catch(() => null);
      const cat = get().selectedCategory;
      const catParam = cat === "ALL" ? undefined : cat;

      const [vessels, visits, contracts, assetLeases] = await Promise.all([
        KapalService.getMyVessels(catParam, operator?.id).catch(() => []),
        KapalService.getMyVisits().catch(() => []),
        operator?.id
          ? KapalService.getOperatorContracts(operator.id).catch(() => [])
          : Promise.resolve([]),
        KapalService.getMyAssetLeases().catch(() => []),
      ]);

      set({
        operator,
        vessels,
        visits,
        contracts,
        assetLeases,
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

  fetchContracts: async (operatorId?: number | string) => {
    try {
      const opId = operatorId ?? get().operator?.id;
      if (!opId) return;
      const contracts = await KapalService.getOperatorContracts(opId);
      set({ contracts });
    } catch (err: unknown) {
      console.error("Gagal memuat kontrak PKS Sandar:", err);
    }
  },

  createContract: async (
    operatorId: number | string,
    payload: CreateBerthingContractPayload,
    file?: File | Blob
  ): Promise<OperatorBerthingContract> => {
    set({ isLoading: true, error: null });
    try {
      const newContract = await KapalService.createOperatorContract(operatorId, payload, file);
      await get().fetchContracts(operatorId);
      set({ isLoading: false });
      return newContract;
    } catch (err: unknown) {
      const message =
        err instanceof ApiException
          ? err.message
          : err instanceof Error
          ? err.message
          : "Gagal mengajukan PKS Sandar baru.";
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  uploadSignedContract: async (
    contractId: number | string,
    file: File | Blob
  ): Promise<OperatorBerthingContract> => {
    set({ isLoading: true, error: null });
    try {
      const updated = await KapalService.uploadSignedContract(contractId, file);
      await get().fetchDashboardData();
      set({ isLoading: false });
      return updated;
    } catch (err: unknown) {
      const message =
        err instanceof ApiException
          ? err.message
          : err instanceof Error
          ? err.message
          : "Gagal mengunggah scan kontrak bertanda tangan basah.";
      set({ isLoading: false, error: message });
      throw err;
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

  updateOperatorProfile: async (
    operatorId: number | string,
    payload: UpdateOperatorPayload
  ): Promise<ShipOperator> => {
    set({ isLoading: true, error: null });
    try {
      const updated = await KapalService.updateOperatorProfile(operatorId, payload);
      await get().fetchOperatorProfile();
      set({ isLoading: false, error: null });
      return updated;
    } catch (err: unknown) {
      const message =
        err instanceof ApiException
          ? err.message
          : err instanceof Error
          ? err.message
          : "Gagal memperbarui profil badan usaha.";
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  fetchVessels: async (category?: "BARANG" | "PENUMPANG" | "CAMPURAN") => {
    try {
      const op = get().operator;
      const selected = get().selectedCategory;
      const catParam: "BARANG" | "PENUMPANG" | "CAMPURAN" | undefined =
        category !== undefined
          ? category
          : selected === "ALL"
          ? undefined
          : selected;
      const vessels = await KapalService.getMyVessels(catParam, op?.id);
      set({ vessels });
    } catch (err: unknown) {
      console.error("Gagal memuat daftar kapal:", err);
    }
  },

  setSelectedCategory: (selectedCategory) => {
    set({ selectedCategory });
    get().fetchVessels(selectedCategory === "ALL" ? undefined : selectedCategory);
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

  createVessel: async (
    payload: CreateVesselPayload,
    attachments?: VesselRegistrationAttachment[]
  ): Promise<Vessel> => {
    set({ isLoading: true, error: null });
    try {
      const newVessel = await KapalService.createVessel(payload);

      if (attachments && attachments.length > 0) {
        for (const att of attachments) {
          await KapalService.uploadVesselDocument(
            newVessel.id,
            {
              category: att.category,
              documentNumber: att.documentNumber,
              notes: att.notes,
            },
            att.file
          );
        }
      }

      await Promise.all([
        get().fetchVessels(),
        get().fetchOperatorProfile(),
      ]);
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

  updateVessel: async (
    vesselId: number,
    payload: UpdateVesselPayload,
    attachments?: VesselRegistrationAttachment[]
  ): Promise<Vessel> => {
    set({ isLoading: true, error: null });
    try {
      const updated = await KapalService.updateVessel(vesselId, payload);

      if (attachments && attachments.length > 0) {
        for (const att of attachments) {
          await KapalService.uploadVesselDocument(
            vesselId,
            {
              category: att.category,
              documentNumber: att.documentNumber,
              notes: att.notes,
            },
            att.file
          );
        }
      }

      await Promise.all([
        get().fetchVessels(),
        get().fetchOperatorProfile(),
      ]);
      set({ isLoading: false });
      return updated;
    } catch (err: unknown) {
      const message =
        err instanceof ApiException
          ? err.message
          : err instanceof Error
          ? err.message
          : "Gagal memperbarui data armada kapal.";
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  claimVessel: async (
    operatorId: number,
    vesselId: number,
    payload: ClaimVesselPayload
  ): Promise<void> => {
    set({ isLoading: true, error: null });
    try {
      await KapalService.claimVessel(operatorId, vesselId, payload);
      await get().fetchVessels();
      set({ isLoading: false });
    } catch (err: unknown) {
      const message =
        err instanceof ApiException
          ? err.message
          : err instanceof Error
          ? err.message
          : "Gagal mengklaim kapal ke armada Anda.";
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  unlinkVessel: async (operatorId: number, vesselId: number): Promise<void> => {
    set({ isLoading: true, error: null });
    try {
      await KapalService.unlinkVessel(operatorId, vesselId);
      await get().fetchVessels();
      set({ isLoading: false });
    } catch (err: unknown) {
      const message =
        err instanceof ApiException
          ? err.message
          : err instanceof Error
          ? err.message
          : "Gagal melepas kapal dari armada Anda.";
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

  fetchPortAssets: async () => {
    set({ isLoading: true, leaseError: null });
    try {
      const portAssets = await KapalService.getAvailableAssets();
      set({ portAssets, isLoading: false });
    } catch (err: unknown) {
      const message =
        err instanceof ApiException
          ? err.message
          : err instanceof Error
          ? err.message
          : "Gagal memuat katalog ruangan & aset pelabuhan.";
      set({ isLoading: false, leaseError: message });
    }
  },

  fetchAssetLeases: async () => {
    set({ isLoading: true, leaseError: null });
    try {
      const assetLeases = await KapalService.getMyAssetLeases();
      set({ assetLeases, isLoading: false });
    } catch (err: unknown) {
      const message =
        err instanceof ApiException
          ? err.message
          : err instanceof Error
          ? err.message
          : "Gagal memuat daftar pengajuan & kontrak sewa ruangan.";
      set({ isLoading: false, leaseError: message });
    }
  },

  requestAssetLease: async (payload: RequestAssetLeaseDto): Promise<AssetLease> => {
    set({ isLeaseSubmitting: true, leaseError: null });
    try {
      const created = await KapalService.requestAssetLease(payload);
      await Promise.all([get().fetchAssetLeases(), get().fetchPortAssets()]);
      set({ isLeaseSubmitting: false });
      return created;
    } catch (err: unknown) {
      const message =
        err instanceof ApiException
          ? err.message
          : err instanceof Error
          ? err.message
          : "Gagal mengajukan permohonan sewa ruangan.";
      set({ isLeaseSubmitting: false, leaseError: message });
      throw err;
    }
  },

  clearLeaseError: () => set({ leaseError: null }),
}));
