import { API_CONFIG } from "@/config/api.config";
import { apiClient } from "@/lib/api-client";
import {
  BillingInvoice,
  InvoicePrintPayload,
  SubmitPaymentProofDto,
} from "@/types/billing.types";

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

    const token = typeof window !== "undefined" ? localStorage.getItem("porta_token") : null;
    const url = `${API_CONFIG.BASE_URL}/billing/invoices/${invoiceId}/submit-payment`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => null);
      throw new Error(errData?.message || "Gagal mengunggah bukti pembayaran.");
    }

    return response.json();
  }
}
