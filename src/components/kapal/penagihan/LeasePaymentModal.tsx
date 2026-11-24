"use client";

import React from "react";
import {
  Building2,
  X,
  AlertTriangle,
  Zap,
  CreditCard,
  ShieldCheck,
  ExternalLink,
  RefreshCw,
  QrCode,
} from "lucide-react";
import {
  CheckoutPaymentResponse,
  PaymentConfig,
  UnpaidLeaseSummary,
} from "@/types/billing.types";
import { formatRupiah } from "@/lib/kapal-billing";

interface LeasePaymentModalProps {
  isOpen: boolean;
  selectedLeaseForPayment: UnpaidLeaseSummary | null;
  errorMessage: string | null;
  leasePaymentTab: "gateway" | "manual";
  onChangeLeasePaymentTab: (tab: "gateway" | "manual") => void;
  paymentConfig: PaymentConfig | null;
  activeCheckoutSession: CheckoutPaymentResponse | null;
  isCheckingOut: boolean;
  onGatewayCheckout: () => void;
  onCheckStatus: () => void;
  onClose: () => void;
}

export function LeasePaymentModal({
  isOpen,
  selectedLeaseForPayment,
  errorMessage,
  leasePaymentTab,
  onChangeLeasePaymentTab,
  paymentConfig,
  activeCheckoutSession,
  isCheckingOut,
  onGatewayCheckout,
  onCheckStatus,
  onClose,
}: LeasePaymentModalProps) {
  if (!isOpen || !selectedLeaseForPayment) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-[#CBD5E1] overflow-hidden my-8">
        <div className="bg-[#0B241E] text-white p-4 px-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Building2 className="w-5 h-5 text-[#D97706]" />
            <h3 className="font-bold text-sm">
              Pembayaran e-SKRD Sewa Ruangan / Aset
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#85A69B] hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 text-xs">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Summary */}
          <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-violet-100 text-violet-900 border border-violet-200">
                <Building2 className="w-3 h-3" />
                Pengajuan Ruangan
              </span>
              <span className="font-mono font-bold text-[#0B241E]">
                {selectedLeaseForPayment.lease.contractNumber}
              </span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-[#64748B]">Objek Aset:</span>
              <strong className="text-[#0B241E] text-right">
                {selectedLeaseForPayment.lease.asset?.name ||
                  `Aset #${selectedLeaseForPayment.lease.assetId}`}
              </strong>
            </div>
            <div className="flex justify-between border-t border-[#E2E8F0] pt-2 text-sm font-extrabold text-[#0B241E]">
              <span>Sisa Tagihan Retribusi:</span>
              <span className="font-mono text-[#D97706] text-base">
                {formatRupiah(selectedLeaseForPayment.remaining)}
              </span>
            </div>
          </div>

          {/* Metode Switcher */}
          <div className="grid grid-cols-2 gap-2 bg-[#F1F5F9] p-1 rounded-xl border border-[#E2E8F0]">
            <button
              type="button"
              onClick={() => onChangeLeasePaymentTab("gateway")}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                leasePaymentTab === "gateway"
                  ? "bg-[#0B241E] text-white shadow-xs font-extrabold"
                  : "text-[#64748B] hover:text-[#0B241E]"
              }`}
            >
              <Zap
                className={`w-3.5 h-3.5 ${
                  leasePaymentTab === "gateway" ? "text-[#D97706]" : ""
                }`}
              />
              <span>QRIS &amp; VA Instan</span>
            </button>
            <button
              type="button"
              onClick={() => onChangeLeasePaymentTab("manual")}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                leasePaymentTab === "manual"
                  ? "bg-[#0B241E] text-white shadow-xs font-extrabold"
                  : "text-[#64748B] hover:text-[#0B241E]"
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Setor RKUD / Bendahara</span>
            </button>
          </div>

          {leasePaymentTab === "gateway" && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Pembayaran Online ({paymentConfig?.provider || "Midtrans"} •{" "}
                    {paymentConfig?.gatewayEnabled ? "Aktif" : "Mode Bank Papua / Loket"})
                  </span>
                </div>
                <p className="text-[11px] text-emerald-700 leading-relaxed">
                  Klik tombol di bawah untuk membuat sesi pembayaran otomatis QRIS /
                  Virtual Account. Setelah berhasil, e-SSRD sewa ruangan langsung terbit.
                </p>
              </div>

              {activeCheckoutSession ? (
                <div className="p-4 bg-[#FAFCFF] border-2 border-dashed border-[#0B241E]/40 rounded-xl space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#64748B] font-bold">Order ID:</span>
                    <span className="font-mono font-bold text-[#0B241E]">
                      {activeCheckoutSession.orderId}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#64748B] font-bold">Nominal:</span>
                    <span className="font-mono font-black text-base text-[#D97706]">
                      {formatRupiah(activeCheckoutSession.amountIdr)}
                    </span>
                  </div>
                  <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
                    {activeCheckoutSession.redirectUrl && (
                      <a
                        href={activeCheckoutSession.redirectUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2.5 px-4 bg-[#0B241E] hover:bg-[#143E33] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2"
                      >
                        <ExternalLink className="w-4 h-4 text-[#D97706]" />
                        <span>Buka Halaman Pembayaran</span>
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={onCheckStatus}
                      disabled={isCheckingOut}
                      className="w-full sm:w-auto py-2.5 px-4 bg-white border border-[#CBD5E1] hover:bg-[#F8FAFC] text-[#0B241E] font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <RefreshCw
                        className={`w-3.5 h-3.5 ${isCheckingOut ? "animate-spin" : ""}`}
                      />
                      <span>Cek Status</span>
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={onGatewayCheckout}
                  disabled={isCheckingOut}
                  className="w-full py-3 bg-[#0B241E] hover:bg-[#143E33] text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isCheckingOut ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Memproses Sesi Pembayaran...</span>
                    </>
                  ) : (
                    <>
                      <QrCode className="w-4 h-4 text-[#D97706]" />
                      <span>Buat Sesi Bayar QRIS / VA Sewa Ruangan</span>
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          {leasePaymentTab === "manual" && (
            <div className="space-y-4">
              <div className="p-4 bg-[#FAFCFF] border-2 border-dashed border-[#0B241E]/40 rounded-xl space-y-2 text-center">
                <span className="text-[10px] uppercase font-bold text-[#64748B] block">
                  Rekening Kas Umum Daerah (RKUD) Kab. Mimika — Bank Papua
                </span>
                <p className="font-mono text-lg font-black text-[#0B241E]">
                  104-01-01-000123-8
                </p>
                <p className="text-[11px] font-semibold text-[#0B241E]">
                  a.n. RKUD PEMERINTAH KABUPATEN MIMIKA (Retribusi Sewa BMD)
                </p>
                <p className="text-[10px] text-[#64748B]">
                  Cantumkan nomor kontrak{" "}
                  <strong className="font-mono text-[#0B241E]">
                    {selectedLeaseForPayment.lease.contractNumber}
                  </strong>{" "}
                  pada berita transfer, lalu tunjukkan bukti setor ke Bendahara Penerimaan
                  UPTD Pelabuhan untuk pencatatan &amp; penerbitan kuitansi e-SSRD.
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 bg-[#0B241E] hover:bg-[#143E33] text-white font-bold rounded-xl text-xs cursor-pointer"
                >
                  Mengerti &amp; Tutup
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
