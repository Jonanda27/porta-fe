"use client";

import React from "react";
import {
  CreditCard,
  X,
  AlertTriangle,
  Zap,
  ShieldCheck,
  ExternalLink,
  RefreshCw,
  QrCode,
  CheckCircle2,
} from "lucide-react";
import { BillingInvoice, CheckoutPaymentResponse } from "@/types/billing.types";
import { formatRupiah, getVirtualAccountNo } from "@/lib/kapal-billing";

interface InvoicePaymentModalProps {
  isOpen: boolean;
  selectedInvoice: BillingInvoice | null;
  errorMessage: string | null;
  paymentMethodTab: "gateway" | "manual";
  onChangePaymentMethodTab: (tab: "gateway" | "manual") => void;
  activeCheckoutSession: CheckoutPaymentResponse | null;
  isCheckingOut: boolean;
  isProcessing: boolean;
  selectedBank: string;
  onSelectBank: (bank: string) => void;
  isCopied: boolean;
  refNumberInput: string;
  onChangeRefNumber: (val: string) => void;
  onChangePaymentFile: (file: File | null) => void;
  onGatewayCheckout: () => void;
  onCheckPaymentStatus: () => void;
  onCopyVA: () => void;
  onConfirmPayment: () => void;
  onClose: () => void;
}

export function InvoicePaymentModal({
  isOpen,
  selectedInvoice,
  errorMessage,
  paymentMethodTab,
  onChangePaymentMethodTab,
  activeCheckoutSession,
  isCheckingOut,
  isProcessing,
  selectedBank,
  onSelectBank,
  isCopied,
  refNumberInput,
  onChangeRefNumber,
  onChangePaymentFile,
  onGatewayCheckout,
  onCheckPaymentStatus,
  onCopyVA,
  onConfirmPayment,
  onClose,
}: InvoicePaymentModalProps) {
  if (!isOpen || !selectedInvoice) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-[#CBD5E1] overflow-hidden my-8">
        <div className="bg-[#0B241E] text-white p-4 px-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <CreditCard className="w-5 h-5 text-[#D97706]" />
            <h3 className="font-bold text-sm">
              Pembayaran Retribusi e-SKRD Jasa Pelabuhan
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
            <div className="flex justify-between">
              <span className="text-[#64748B]">Nomor e-SKRD:</span>
              <span className="font-mono font-bold text-[#0B241E]">
                {selectedInvoice.invoiceNumber}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748B]">Armada:</span>
              <strong className="text-[#0B241E]">
                {selectedInvoice.visit?.vessel?.name || "Kapal Niaga"} (
                {Number(selectedInvoice.visit?.vessel?.grossTonnage || 0).toLocaleString()} GT)
              </strong>
            </div>
            <div className="flex justify-between border-t border-[#E2E8F0] pt-2 text-sm font-extrabold text-[#0B241E]">
              <span>Total Tagihan:</span>
              <span className="font-mono text-[#D97706] text-base">
                {formatRupiah(selectedInvoice.totalAmountIdr)}
              </span>
            </div>
          </div>

          {/* Metode Pembayaran Switcher */}
          <div className="grid grid-cols-2 gap-2 bg-[#F1F5F9] p-1 rounded-xl border border-[#E2E8F0]">
            <button
              type="button"
              onClick={() => onChangePaymentMethodTab("gateway")}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                paymentMethodTab === "gateway"
                  ? "bg-[#0B241E] text-white shadow-xs font-extrabold"
                  : "text-[#64748B] hover:text-[#0B241E]"
              }`}
            >
              <Zap
                className={`w-3.5 h-3.5 ${
                  paymentMethodTab === "gateway" ? "text-[#D97706]" : ""
                }`}
              />
              <span>QRIS &amp; VA Instan (Online)</span>
            </button>
            <button
              type="button"
              onClick={() => onChangePaymentMethodTab("manual")}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                paymentMethodTab === "manual"
                  ? "bg-[#0B241E] text-white shadow-xs font-extrabold"
                  : "text-[#64748B] hover:text-[#0B241E]"
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Transfer RKUD Manual</span>
            </button>
          </div>

          {/* TAB 1: PEMBAYARAN GATEWAY ONLINE REAL-TIME */}
          {paymentMethodTab === "gateway" && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Gerbang Pembayaran Resmi Midtrans / Bank Papua Online</span>
                </div>
                <p className="text-[11px] text-emerald-700 leading-relaxed">
                  Bayar langsung menggunakan{" "}
                  <strong>QRIS (BCA, GoPay, OVO, Dana, LinkAja)</strong> atau{" "}
                  <strong>Virtual Account Bank Otomatis</strong>. Pelunasan e-SKRD
                  terverifikasi secara real-time ke kas daerah tanpa upload resi manual.
                </p>
              </div>

              {activeCheckoutSession ? (
                <div className="p-4 bg-[#FAFCFF] border-2 border-dashed border-[#0B241E]/40 rounded-xl space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#64748B] font-bold">Order ID Gateway:</span>
                    <span className="font-mono font-bold text-[#0B241E]">
                      {activeCheckoutSession.orderId}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#64748B] font-bold">Total Pembayaran:</span>
                    <span className="font-mono font-black text-base text-[#D97706]">
                      {formatRupiah(activeCheckoutSession.amountIdr)}
                    </span>
                  </div>

                  {activeCheckoutSession.snapToken && (
                    <div className="text-left bg-slate-100 p-2.5 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-[#64748B] block font-mono">
                        Snap Session Token:
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-800 break-all select-all">
                        {activeCheckoutSession.snapToken}
                      </span>
                    </div>
                  )}

                  <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
                    {activeCheckoutSession.redirectUrl && (
                      <a
                        href={activeCheckoutSession.redirectUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2.5 px-4 bg-[#0B241E] hover:bg-[#143E33] text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
                      >
                        <ExternalLink className="w-4 h-4 text-[#D97706]" />
                        <span>Buka Layar Pembayaran Midtrans</span>
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={onCheckPaymentStatus}
                      disabled={isCheckingOut}
                      className="w-full sm:w-auto py-2.5 px-4 bg-white border border-[#CBD5E1] hover:bg-[#F8FAFC] text-[#0B241E] font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw
                        className={`w-3.5 h-3.5 ${isCheckingOut ? "animate-spin" : ""}`}
                      />
                      <span>Cek Status Lunas</span>
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={onGatewayCheckout}
                  disabled={isCheckingOut}
                  className="w-full py-3 bg-[#0B241E] hover:bg-[#143E33] text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isCheckingOut ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Menghubungi Payment Gateway Midtrans...</span>
                    </>
                  ) : (
                    <>
                      <QrCode className="w-4 h-4 text-[#D97706]" />
                      <span>Buat Sesi Bayar QRIS / VA Otomatis</span>
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          {/* TAB 2: TRANSFER MANUAL BANK KASDA */}
          {paymentMethodTab === "manual" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#0B241E]">
                  Pilih Bank Rekening Kas Umum Daerah (RKUD) Kab. Mimika:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => onSelectBank("bank_papua")}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer font-bold ${
                      selectedBank === "bank_papua"
                        ? "bg-[#0B241E] text-white border-[#0B241E]"
                        : "bg-white border-[#CBD5E1] text-[#64748B]"
                    }`}
                  >
                    Bank Papua (RKUD Utama)
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectBank("bank_bni")}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer font-bold ${
                      selectedBank === "bank_bni"
                        ? "bg-[#0B241E] text-white border-[#0B241E]"
                        : "bg-white border-[#CBD5E1] text-[#64748B]"
                    }`}
                  >
                    Bank BNI (Kasda Mitra)
                  </button>
                </div>
              </div>

              <div className="p-5 bg-[#FAFCFF] border-2 border-dashed border-[#0B241E]/40 rounded-xl text-center space-y-3">
                <span className="text-[10px] uppercase font-bold text-[#64748B] block">
                  Nomor Virtual Account Kasda Host-to-Host:
                </span>
                <p className="font-mono text-xl font-black text-[#0B241E] tracking-wider">
                  {getVirtualAccountNo(selectedInvoice, selectedBank)}
                </p>
                <button
                  type="button"
                  onClick={onCopyVA}
                  className="text-xs font-bold text-[#0284C7] hover:underline cursor-pointer"
                >
                  {isCopied ? "✓ Nomor VA Berhasil Disalin!" : "Salin Nomor VA"}
                </button>
                <p className="text-[10px] text-[#64748B]">
                  Penyetoran dapat dilakukan via Teller, Mobile Banking, atau Antarbank
                  Kliring/BI-FAST.
                </p>
              </div>

              <div className="space-y-3 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-[#0B241E] mb-1">
                    Nomor Referensi Setor / Resi Bank:
                  </label>
                  <input
                    type="text"
                    value={refNumberInput}
                    onChange={(e) => onChangeRefNumber(e.target.value)}
                    placeholder="Contoh: REF-BAP-20261117-0921"
                    className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs font-mono focus:border-[#0B241E] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#0B241E] mb-1">
                    Upload File Bukti Setor / Struk (Opsional):
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={(e) => onChangePaymentFile(e.target.files?.[0] || null)}
                    className="w-full text-xs text-[#64748B] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#0B241E] file:text-white cursor-pointer"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={onConfirmPayment}
                disabled={isProcessing}
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Merekonsiliasi Status Pembayaran Bank Kasda...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Kirim Bukti Pembayaran ke Kasda Pemkab Mimika</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
