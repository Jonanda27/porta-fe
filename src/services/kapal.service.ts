import { API_CONFIG } from "@/config/api.config";
import { apiClient } from "@/lib/api-client";
import {
  CreateBerthingContractPayload,
  CreateVesselPayload,
  CreateVisitPayload,
  OperatorBerthingContract,
  OperatorDocument,
  ShipOperator,
  UpdateOperatorPayload,
  UpdateVesselPayload,
  UploadDocumentPayload,
  VerifyBerthingContractPayload,
  Vessel,
  VesselVisit,
} from "@/types/kapal.types";
import {
  AssetLease,
  PortAsset,
  RequestAssetLeaseDto,
} from "@/types/asset.types";

export class KapalService {
  /**
   * Mengambil data profil perusahaan pelayaran / operator kapal dari backend.
   * Mendukung query detail by ID atau list scoped operator dengan fleetSummary.
   */
  public static async getMyOperatorProfile(operatorId?: number | string): Promise<ShipOperator | null> {
    try {
      if (operatorId) {
        return await apiClient.get<ShipOperator>(API_CONFIG.ENDPOINTS.OPERATORS.DETAIL(operatorId));
      }
      const list = await apiClient.get<ShipOperator[]>(API_CONFIG.ENDPOINTS.OPERATORS.BASE);
      return Array.isArray(list) && list.length > 0 ? list[0] : null;
    } catch {
      // Fallback ke endpoint legacy /vessels/operators jika /operators gagal
      const list = await apiClient.get<ShipOperator[]>(API_CONFIG.ENDPOINTS.VESSELS.OPERATORS);
      return Array.isArray(list) && list.length > 0 ? list[0] : null;
    }
  }

  /**
   * Memperbarui data profil badan usaha operator kapal (PATCH /operators/:id)
   */
  public static async updateOperatorProfile(
    operatorId: number | string,
    payload: UpdateOperatorPayload
  ): Promise<ShipOperator> {
    return apiClient.patch<ShipOperator>(
      API_CONFIG.ENDPOINTS.OPERATORS.DETAIL(operatorId),
      payload
    );
  }

  /**
   * Mengambil daftar seluruh armada kapal milik operator yang sedang login
   * dengan dukungan filter kategori kapal (BARANG, PENUMPANG, CAMPURAN) dan operatorId
   */
  public static async getMyVessels(
    vesselCategory?: "BARANG" | "PENUMPANG" | "CAMPURAN",
    operatorId?: number | string
  ): Promise<Vessel[]> {
    const params = vesselCategory ? `?vesselCategory=${vesselCategory}` : "";
    if (operatorId) {
      try {
        const response = await apiClient.get<Vessel[]>(
          `${API_CONFIG.ENDPOINTS.OPERATORS.VESSELS(operatorId)}${params}`
        );
        if (Array.isArray(response)) return response;
      } catch {
        // Fallback to /vessels
      }
    }
    const response = await apiClient.get<Vessel[]>(
      `${API_CONFIG.ENDPOINTS.VESSELS.LIST}${params}`
    );
    return Array.isArray(response) ? response : [];
  }

  /**
   * Mendaftarkan armada kapal baru milik operator ke Backend
   * Menggunakan endpoint khusus operator: POST /operators/:id/vessels
   */
  public static async createVessel(payload: CreateVesselPayload): Promise<Vessel> {
    if (payload.operatorId) {
      try {
        return await apiClient.post<Vessel>(
          API_CONFIG.ENDPOINTS.OPERATORS.VESSELS(payload.operatorId),
          payload
        );
      } catch {
        // Fallback to POST /vessels
      }
    }
    return apiClient.post<Vessel>(API_CONFIG.ENDPOINTS.VESSELS.LIST, payload);
  }

  /**
   * Memperbarui data master armada kapal milik operator
   */
  public static async updateVessel(
    vesselId: number,
    payload: UpdateVesselPayload
  ): Promise<Vessel> {
    return apiClient.patch<Vessel>(
      `${API_CONFIG.ENDPOINTS.VESSELS.LIST}/${vesselId}`,
      payload
    );
  }

  /**
   * Upload dokumen kapal (Surat Ukur, Pas Tahunan/Besar/Kecil, dsb)
   */
  public static async uploadVesselDocument(
    vesselId: number,
    payload: UploadDocumentPayload,
    file: File | Blob
  ): Promise<OperatorDocument> {
    const formData = new FormData();
    formData.append("category", payload.category);
    if (payload.documentNumber) formData.append("documentNumber", payload.documentNumber);
    if (payload.notes) formData.append("notes", payload.notes);
    formData.append("file", file);

    return apiClient.post<OperatorDocument>(
      `${API_CONFIG.ENDPOINTS.VESSELS.LIST}/${vesselId}/documents`,
      formData
    );
  }

  /**
   * Upload dokumen legalitas perusahaan operator (SIUPAL, NIB, NPWP)
   * Menggunakan endpoint resmi: POST /operators/:id/documents
   */
  public static async uploadOperatorDocument(
    operatorId: number | string,
    payload: UploadDocumentPayload,
    file: File | Blob
  ): Promise<OperatorDocument> {
    const formData = new FormData();
    formData.append("category", payload.category);
    if (payload.documentNumber) formData.append("documentNumber", payload.documentNumber);
    if (payload.notes) formData.append("notes", payload.notes);
    formData.append("file", file);

    return apiClient.post<OperatorDocument>(
      API_CONFIG.ENDPOINTS.OPERATORS.DOCUMENTS(operatorId),
      formData
    );
  }

  /**
   * Mengambil daftar riwayat & rencana kunjungan kapal (Visits) milik operator
   */
  public static async getMyVisits(): Promise<VesselVisit[]> {
    const response = await apiClient.get<VesselVisit[]>(API_CONFIG.ENDPOINTS.VESSELS.VISITS);
    return Array.isArray(response) ? response : [];
  }

  /**
   * Mengambil detail satu kunjungan kapal beserta alokasi dermaga & invoice terkait
   */
  public static async getVisitDetail(visitId: number): Promise<VesselVisit> {
    return apiClient.get<VesselVisit>(`${API_CONFIG.ENDPOINTS.VESSELS.VISITS}/${visitId}`);
  }

  /**
   * Mengajukan Permohonan Sandar Kapal (PPK / Visit Request) ke Backend
   */
  public static async createVisitRequest(payload: CreateVisitPayload): Promise<VesselVisit> {
    return apiClient.post<VesselVisit>(API_CONFIG.ENDPOINTS.VESSELS.VISITS, payload);
  }

  /**
   * Mengambil daftar Kontrak Payung (PKS Sandar Kapal) milik operator
   */
  public static async getOperatorContracts(
    operatorId: number | string
  ): Promise<OperatorBerthingContract[]> {
    const res = await apiClient.get<OperatorBerthingContract[]>(
      API_CONFIG.ENDPOINTS.OPERATORS.CONTRACTS(operatorId)
    );
    return Array.isArray(res) ? res : [];
  }

  /**
   * Mengajukan PKS Sandar Kapal baru (Kontrak Payung) beserta upload dokumen draft/legalitas
   */
  public static async createOperatorContract(
    operatorId: number | string,
    payload: CreateBerthingContractPayload,
    file?: File | Blob
  ): Promise<OperatorBerthingContract> {
    const formData = new FormData();
    formData.append("title", payload.title);
    formData.append("portId", String(payload.portId));
    formData.append("startDate", payload.startDate);
    formData.append("endDate", payload.endDate);
    if (payload.monthlyQuota !== undefined) {
      formData.append("monthlyQuota", String(payload.monthlyQuota));
    }
    if (payload.dockAllocation) {
      formData.append("dockAllocation", payload.dockAllocation);
    }
    if (file) {
      formData.append("file", file);
    }

    return apiClient.post<OperatorBerthingContract>(
      API_CONFIG.ENDPOINTS.OPERATORS.CONTRACTS(operatorId),
      formData
    );
  }

  /**
   * Mengambil daftar PKS Sandar yang menunggu verifikasi Kepala Pelabuhan
   */
  public static async getPendingBerthingContracts(): Promise<OperatorBerthingContract[]> {
    const res = await apiClient.get<OperatorBerthingContract[]>(
      API_CONFIG.ENDPOINTS.OPERATORS.PENDING_CONTRACTS
    );
    return Array.isArray(res) ? res : [];
  }

  /**
   * Verifikasi PKS Sandar Kapal oleh Kepala Pelabuhan (Approve / Reject)
   */
  public static async verifyBerthingContract(
    contractId: number | string,
    payload: VerifyBerthingContractPayload
  ): Promise<OperatorBerthingContract> {
    return apiClient.patch<OperatorBerthingContract>(
      API_CONFIG.ENDPOINTS.OPERATORS.VERIFY_CONTRACT(contractId),
      payload
    );
  }

  /**
   * Mengambil katalog aset & ruangan pelabuhan (Kantor, Gudang, Kios, Lapak, dll)
   */
  public static async getAvailableAssets(): Promise<PortAsset[]> {
    const res = await apiClient.get<PortAsset[]>(API_CONFIG.ENDPOINTS.ASSETS.ASSETS);
    return Array.isArray(res) ? res : [];
  }

  /**
   * Mengambil daftar pengajuan & kontrak sewa ruangan/aset milik Operator Kapal
   */
  public static async getMyAssetLeases(): Promise<AssetLease[]> {
    const res = await apiClient.get<AssetLease[]>(API_CONFIG.ENDPOINTS.ASSETS.LEASES);
    return Array.isArray(res) ? res : [];
  }

  /**
   * Mengajukan permohonan sewa ruangan/aset pelabuhan oleh Operator Kapal
   */
  public static async requestAssetLease(payload: RequestAssetLeaseDto): Promise<AssetLease> {
    return apiClient.post<AssetLease>(API_CONFIG.ENDPOINTS.ASSETS.LEASE_REQUEST, payload);
  }
}
