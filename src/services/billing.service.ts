import { API_CONFIG } from "@/config/api.config";
import { apiClient } from "@/lib/api-client";
import {
  BillingAdjustment,
  BillingInvoice,
  CheckoutPaymentDto,
  CheckoutPaymentResponse,
  CreateBillingAdjustmentDto,
  CreateWarningDto,
  DecideBillingAdjustmentDto,
  GateHandoverRecord,
  GenerateBillingDto,
  InvoicePrintPayload,
  PaymentConfig,
  PaymentRecord,
  RecordPaymentDto,
  RevenueSummary,
  SubmitPaymentProofDto,
  UnbilledVisit,
  VoidInvoiceDto,
  WarningRecord,
} from "@/types/billing.types";
import {
  AssetLease,
  AssetLeasePayment,
  LeasePaymentReceiptPayload,
  PortAsset,
  RecordLeasePaymentDto,
} from "@/types/asset.types";
import {
  CloseGateHandoverPayload,
  GateHandoverItem,
  GateTicketBookItem,
} from "@/types/field-ops.types";
import { VesselManifestItem } from "@/types/manifest.types";

export class BillingService {
  /**
   * Mengambil daftar invoice retribusi daerah (e-SKRD) milik operator yang login
   */
  public static async getMyInvoices(): Promise<BillingInvoice[]> {
    const response = await apiClient.get<BillingInvoice[]>(API_CONFIG.ENDPOINTS.BILLING.INVOICES);
    return Array.isArray(response) ? response : [];
  }

  /**
   * Mengambil dokumen cetak resmi e-SKRD / e-SSRD beserta rincian tarif
   */
  public static async getInvoicePrintPayload(invoiceId: number): Promise<InvoicePrintPayload> {
    return apiClient.get<InvoicePrintPayload>(`/billing/invoices/${invoiceId}/print-payload`);
  }

  /**
   * Mengambil daftar permohonan penyesuaian/keberatan e-SKRD (Billing Adjustments)
   */
  public static async getAdjustments(): Promise<BillingAdjustment[]> {
    const response = await apiClient.get<BillingAdjustment[]>("/billing/adjustments");
    return Array.isArray(response) ? response : [];
  }

  /**
   * Mengajukan permohonan penyesuaian/keringanan/angsuran e-SKRD (Pasal 10, 19, 20 Perbup 25/2024)
   */
  public static async requestAdjustment(
    invoiceId: number,
    dto: CreateBillingAdjustmentDto
  ): Promise<BillingAdjustment> {
    return apiClient.post<BillingAdjustment>(`/billing/invoices/${invoiceId}/adjustments`, dto);
  }

  /**
   * Mengambil daftar surat teguran piutang retribusi daerah (Warnings ST-1/2/3)
   */
  public static async getWarnings(): Promise<WarningRecord[]> {
    const response = await apiClient.get<WarningRecord[]>("/warnings");
    return Array.isArray(response) ? response : [];
  }

  /**
   * Mengirim bukti pembayaran tagihan retribusi ke kas daerah
   */
  public static async submitPaymentProof(
    invoiceId: number,
    payload: SubmitPaymentProofDto,
    file?: File | Blob
  ): Promise<unknown> {
    const formData = new FormData();
    formData.append("amountIdr", String(payload.amountIdr));
    formData.append("method", payload.method);
    formData.append("idempotencyKey", payload.idempotencyKey);
    if (payload.referenceNo) {
      formData.append("referenceNo", payload.referenceNo);
    }
    if (payload.paidAt) {
      formData.append("paidAt", payload.paidAt);
    }
    if (file) {
      formData.append("file", file);
    } else {
      // Mock minimal file jika user belum upload attachment
      const emptyBlob = new Blob(["BUKTI_TRANSFER_PORTA"], { type: "application/pdf" });
      formData.append("file", emptyBlob, `bukti_bayar_${payload.idempotencyKey}.pdf`);
    }

    return apiClient.post<unknown>(
      API_CONFIG.ENDPOINTS.BILLING.SUBMIT_PAYMENT(invoiceId),
      formData
    );
  }

  /**
   * Menghitung & menerbitkan dokumen Estimasi Tagihan Resmi (ESTIMATE) dari Backend
   * berdasarkan tarif Perda Mimika 4/2023 & kurs USD live
   */
  public static async generateVisitEstimate(
    visitId: number,
    dto: GenerateBillingDto = {}
  ): Promise<BillingInvoice> {
    return apiClient.post<BillingInvoice>(
      API_CONFIG.ENDPOINTS.BILLING.ESTIMATE(visitId),
      dto
    );
  }

  /**
   * Mengambil konfigurasi status dan provider gateway pembayaran digital
   */
  public static async getPaymentConfig(): Promise<PaymentConfig> {
    return apiClient.get<PaymentConfig>(API_CONFIG.ENDPOINTS.PAYMENTS.CONFIG);
  }

  /**
   * Melakukan checkout pembayaran digital (Midtrans / QRIS / VA) untuk e-SKRD atau sewa aset
   */
  public static async checkoutPayment(dto: CheckoutPaymentDto): Promise<CheckoutPaymentResponse> {
    return apiClient.post<CheckoutPaymentResponse>(API_CONFIG.ENDPOINTS.PAYMENTS.CHECKOUT, dto);
  }

  /**
   * Mengambil seluruh invoice untuk role Bendahara / Admin Pelabuhan
   */
  public static async getAllInvoices(): Promise<BillingInvoice[]> {
    const response = await apiClient.get<BillingInvoice[]>(API_CONFIG.ENDPOINTS.BILLING.INVOICES);
    return Array.isArray(response) ? response : [];
  }

  /**
   * Menerbitkan e-SKRD Uang Muka (Advance SKRD) untuk kunjungan kapal
   */
  public static async generateAdvanceSkrd(
    visitId: number,
    dto: GenerateBillingDto = {}
  ): Promise<BillingInvoice> {
    return apiClient.post<BillingInvoice>(`/billing/visits/${visitId}/advance-skrd`, dto);
  }

  /**
   * Menerbitkan e-SKRD Rampung (Final SKRD) setelah kapal selesai bongkar/muat
   */
  public static async generateFinalSkrd(
    visitId: number,
    dto: GenerateBillingDto = {}
  ): Promise<BillingInvoice> {
    return apiClient.post<BillingInvoice>(`/billing/visits/${visitId}/final-skrd`, dto);
  }

  /**
   * Menetapkan dan menerbitkan resmi invoice e-SKRD (Issue Invoice)
   */
  public static async issueInvoice(invoiceId: number): Promise<BillingInvoice> {
    return apiClient.post<BillingInvoice>(`/billing/invoices/${invoiceId}/issue`);
  }

  /**
   * Membatalkan / Void ketetapan invoice e-SKRD
   */
  public static async voidInvoice(invoiceId: number, dto: VoidInvoiceDto): Promise<BillingInvoice> {
    return apiClient.post<BillingInvoice>(`/billing/invoices/${invoiceId}/void`, dto);
  }

  /**
   * Mencatat pembayaran manual di loket pelabuhan (Kasir Loket)
   */
  public static async recordPayment(
    invoiceId: number,
    dto: RecordPaymentDto
  ): Promise<PaymentRecord> {
    return apiClient.post<PaymentRecord>(`/billing/invoices/${invoiceId}/payments`, dto);
  }

  /**
   * Memverifikasi bukti pembayaran transfer bank & menerbitkan e-SSRD
   */
  public static async verifyPayment(paymentId: number): Promise<PaymentRecord> {
    return apiClient.post<PaymentRecord>(`/billing/payments/${paymentId}/verify`);
  }

  /**
   * Memutuskan permohonan penyesuaian/keringanan tarif (Approve / Reject)
   */
  public static async decideAdjustment(
    adjustmentId: number,
    dto: DecideBillingAdjustmentDto
  ): Promise<BillingAdjustment> {
    return apiClient.post<BillingAdjustment>(`/billing/adjustments/${adjustmentId}/decide`, dto);
  }

  /**
   * Mengambil ringkasan realisasi PAD pelabuhan (Revenue Summary)
   * Jika portId diisi, menyaring per pelabuhan. Jika kosong, mengembalikan agregat se-Kabupaten Mimika (DISHUB_EKSEKUTIF)
   */
  public static async getRevenueSummary(portId?: number): Promise<RevenueSummary> {
    const url = portId ? `/reports/revenue-summary?portId=${portId}` : "/reports/revenue-summary";
    return apiClient.get<RevenueSummary>(url);
  }

  /**
   * Mengambil daftar kunjungan kapal yang belum ditagih (Anti-Kebocoran PAD)
   */
  public static async getUnbilledVisits(portId?: number): Promise<UnbilledVisit[]> {
    const url = portId ? `/reports/unbilled-visits?portId=${portId}` : "/reports/unbilled-visits";
    const response = await apiClient.get<UnbilledVisit[]>(url);
    return Array.isArray(response) ? response : [];
  }

  /**
   * Menerbitkan Surat Teguran / Surat Tagihan Retribusi Daerah (STPD)
   */
  public static async issueWarning(dto: CreateWarningDto): Promise<WarningRecord> {
    return apiClient.post<WarningRecord>("/warnings", dto);
  }

  /**
   * Mengambil buku tiket/karcis pas pelabuhan
   */
  public static async getTicketBooks(): Promise<GateTicketBookItem[]> {
    const response = await apiClient.get<GateTicketBookItem[]>(
      API_CONFIG.ENDPOINTS.GATE_TICKETING.BOOKS
    );
    return Array.isArray(response) ? response : [];
  }

  /**
   * Mengambil sesi serah terima penerimaan fisik kas karcis loket gerbang (Gate Handovers)
   */
  public static async getHandovers(): Promise<GateHandoverItem[]> {
    const response = await apiClient.get<GateHandoverItem[]>(
      API_CONFIG.ENDPOINTS.GATE_TICKETING.HANDOVERS
    );
    return Array.isArray(response) ? response : [];
  }

  /**
   * Tutup dan validasi fisik serah terima kas tiket gerbang ke Bendahara Kasda (Handover Close)
   */
  public static async closeHandover(
    handoverId: number,
    dto: CloseGateHandoverPayload
  ): Promise<GateHandoverItem> {
    return apiClient.post<GateHandoverItem>(
      `/gate-ticketing/handovers/${handoverId}/close`,
      dto
    );
  }

  /**
   * Mengambil daftar manifes penumpang & kendaraan kapal penyeberangan untuk audit retribusi pas dermaga
   */
  public static async getManifests(): Promise<VesselManifestItem[]> {
    const response = await apiClient.get<VesselManifestItem[]>(
      API_CONFIG.ENDPOINTS.GATE_TICKETING.MANIFESTS
    );
    return Array.isArray(response) ? response : [];
  }

  /**
   * Mengambil laporan shift harian pelabuhan
   */
  public static async getDailyReports(): Promise<unknown[]> {
    const response = await apiClient.get<unknown[]>("/daily-reports");
    return Array.isArray(response) ? response : [];
  }

  /**
   * Mengambil daftar master aset sewa pelabuhan (Kios, Gudang, Lapak)
   */
  public static async listAssets(): Promise<PortAsset[]> {
    const response = await apiClient.get<PortAsset[]>("/assets-leases/assets");
    return Array.isArray(response) ? response : [];
  }

  /**
   * Mengambil daftar kontrak sewa aset & tenant pelabuhan
   */
  public static async listLeases(): Promise<AssetLease[]> {
    const response = await apiClient.get<AssetLease[]>("/assets-leases/leases");
    return Array.isArray(response) ? response : [];
  }

  /**
   * Mencatat penerimaan kasda pembayaran sewa tenant (Perda Mimika No. 4/2023)
   */
  public static async recordLeasePayment(
    leaseId: number,
    dto: RecordLeasePaymentDto
  ): Promise<AssetLeasePayment> {
    return apiClient.post<AssetLeasePayment>(`/assets-leases/leases/${leaseId}/payments`, dto);
  }

  /**
   * Mengambil kuitansi e-SSRD resmi pembayaran sewa aset/kios/lahan (Perda Mimika No. 4/2023)
   */
  public static async getLeasePaymentReceipt(
    paymentId: number
  ): Promise<LeasePaymentReceiptPayload> {
    return apiClient.get<LeasePaymentReceiptPayload>(
      API_CONFIG.ENDPOINTS.ASSETS.LEASE_PAYMENT_RECEIPT(paymentId)
    );
  }
}
