import { API_CONFIG } from "@/config/api.config";
import { apiClient } from "@/lib/api-client";
import {
  CargoHandlingRecord,
  EquipmentRentalRecord,
  PayChargeDto,
  UtilityMeterReading,
  UtilityReceiptPayload,
} from "@/types/cargo-utility.types";

export class CargoUtilityService {
  /**
   * Mengambil daftar pencatatan pemakaian meteran utilitas (Air Bersih & Listrik Dermaga)
   */
  public static async listUtilities(): Promise<UtilityMeterReading[]> {
    const response = await apiClient.get<UtilityMeterReading[]>(
      API_CONFIG.ENDPOINTS.CARGO_UTILITY.UTILITIES
    );
    return Array.isArray(response) ? response : [];
  }

  /**
   * Mencatat pembayaran kasda atas tagihan pemakaian utilitas air / listrik
   */
  public static async payUtility(
    id: number,
    dto: PayChargeDto
  ): Promise<UtilityMeterReading> {
    return apiClient.post<UtilityMeterReading>(
      API_CONFIG.ENDPOINTS.CARGO_UTILITY.UTILITY_PAY(id),
      dto
    );
  }

  /**
   * Mengambil dokumen cetak tanda bukti setor / e-SSRD utilitas pelabuhan
   */
  public static async getUtilityReceipt(id: number): Promise<UtilityReceiptPayload> {
    return apiClient.get<UtilityReceiptPayload>(
      API_CONFIG.ENDPOINTS.CARGO_UTILITY.UTILITY_RECEIPT(id)
    );
  }

  /**
   * Mengambil daftar pencatatan pelayanan kargo / bongkar muat barang pelabuhan
   */
  public static async listCargo(): Promise<CargoHandlingRecord[]> {
    const response = await apiClient.get<CargoHandlingRecord[]>(
      API_CONFIG.ENDPOINTS.CARGO_UTILITY.CARGO
    );
    return Array.isArray(response) ? response : [];
  }

  /**
   * Mencatat pembayaran kasda retribusi pelayanan kargo / bongkar muat
   */
  public static async payCargo(
    id: number,
    dto: PayChargeDto
  ): Promise<CargoHandlingRecord> {
    return apiClient.post<CargoHandlingRecord>(
      API_CONFIG.ENDPOINTS.CARGO_UTILITY.CARGO_PAY(id),
      dto
    );
  }

  /**
   * Mengambil daftar sewa / pemakaian alat pelabuhan (Crane, Forklift, Head Truck)
   */
  public static async listEquipment(): Promise<EquipmentRentalRecord[]> {
    const response = await apiClient.get<EquipmentRentalRecord[]>(
      API_CONFIG.ENDPOINTS.CARGO_UTILITY.EQUIPMENT
    );
    return Array.isArray(response) ? response : [];
  }

  /**
   * Mencatat pembayaran kasda sewa / pemakaian alat pelabuhan
   */
  public static async payEquipment(
    id: number,
    dto: PayChargeDto
  ): Promise<EquipmentRentalRecord> {
    return apiClient.post<EquipmentRentalRecord>(
      API_CONFIG.ENDPOINTS.CARGO_UTILITY.EQUIPMENT_PAY(id),
      dto
    );
  }
}
