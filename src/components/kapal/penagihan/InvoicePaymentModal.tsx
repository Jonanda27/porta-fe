"use client";

import React from "react";
import {
  CreditCard,
  AlertTriangle,
  Zap,
  ShieldCheck,
  QrCode,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import {
  BillingInvoice,
  CheckoutPaymentResponse,
  PaymentConfig,
} from "@/types/billing.types";
import { PaymentSideDrawer } from "@/components/ui/PaymentSideDrawer";
import { EmbeddedMidtransPanel } from "@/components/ui/EmbeddedMidtransPanel";
import { formatRupiah, getVirtualAccountNo } from "@/lib/kapal-billing";

interface InvoicePaymentModalProps {
  isOpen: boolean;
  selectedInvoice: BillingInvoice | null;
  errorMessage: string | null;
  paymentMethodTab: "gateway" | "manual";
  onChangePaymentMethodTab: (tab: "gateway" | "manual") => void;
  paymentConfig?: PaymentConfig | null;
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
  onGatewaySuccess?: () => void;
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
  paymentConfig,
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
  onGatewaySuccess,
  onCheckPaymentStatus,
  onCopyVA,
  onConfirmPayment,
  onClose,
}: InvoicePaymentModalProps) {
  if (!isOpen || !selectedInvoice) return null;

  const gatewayDisabled = paymentConfig ? !paymentConfig.gatewayEnabled : false;

  const leftColumn = (
    <div className="space-y-4 text-xs">
      {/* Ringkasan Tagihan */}
      <div className="p-4 bg-white rounded-2xl border border-[#E2E8F0] shadow-2xs space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#64748B]">
            Ringkasan e-SKRD
          </span>
          <span className="font-mono font-bold text-[#0B241E] bg-[#F1F5F9] px-2 py-0.5 rounded-md">
            {selectedInvoice.invoiceNumber}
          </span>
        </div>

        <div className="flex justify-between pt-1">
          <span className="text-[#64748B]">Armada / Kapal</span>
          <strong className="text-[#0B241E] text-right">
            {selectedInvoice.visit?.vessel?.name || "Kapal Niaga"} (
            {Number(selectedInvoice.visit?.vessel?.grossTonnage || 0).toLocaleString()} GT)
          </strong>
        </div>

        {selectedInvoice.dueDate && (
          <div className="flex justify-between">
            <span className="text-[#64748B]">Jatuh Tempo</span>
            <span className="font-semibold text-[#0B241E]">
              {new Date(selectedInvoice.dueDate).toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
        )}

        <div className="flex justify-between items-baseline border-t border-[#E2E8F0] pt-3">
          <span className="text-xs font-extrabold text-[#0B241E]">Total Tagihan</span>
          <span className="font-mono font-black text-lg text-[#D97706]">
            {formatRupiah(selectedInvoice.totalAmountIdr)}
          </span>
        </div>
      </div>

      {/* Pilihan Metode Pembayaran (Radio Cards) */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-2xs space-y-2.5">
        <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#64748B]">
          Pilih Metode Pembayaran
        </p>

        <button
          type="button"
          onClick={() => {
            onChangePaymentMethodTab("gateway");
            if (!gatewayDisabled && !activeCheckoutSession && !isCheckingOut) {
              onGatewayCheckout();
            }
          }}
          disabled={gatewayDisabled}
          className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
            paymentMethodTab === "gateway"
              ? "border-[#0B241E] bg-[#0B241E]/5 ring-1 ring-[#0B241E]"
              : "border-[#E2E8F0] hover:border-[#CBD5E1] bg-white"
          }`}
        >
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              paymentMethodTab === "gateway"
                ? "bg-[#0B241E] text-[#D97706]"
                : "bg-[#F1F5F9] text-[#64748B]"
            }`}
          >
            <Zap className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-[#0B241E] text-xs">
                QRIS &amp; Virtual Account Instan
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                Otomatis
              </span>
            </div>
            <p className="text-[11px] text-[#64748B] mt-0.5 leading-relaxed">
              {gatewayDisabled
                ? "Pembayaran online sedang dinonaktifkan oleh admin."
                : "Terverifikasi real-time via Midtrans tanpa perlu upload bukti transfer."}
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onChangePaymentMethodTab("manual")}
          className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${
            paymentMethodTab === "manual"
              ? "border-[#0B241E] bg-[#0B241E]/5 ring-1 ring-[#0B241E]"
              : "border-[#E2E8F0] hover:border-[#CBD5E1] bg-white"
          }`}
        >
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              paymentMethodTab === "manual"
                ? "bg-[#0B241E] text-white"
                : "bg-[#F1F5F9] text-[#64748B]"
            }`}
          >
            <CreditCard className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="font-bold text-[#0B241E] text-xs block">
              Transfer RKUD Manual (Bank Papua / BNI)
            </span>
            <p className="text-[11px] text-[#64748B] mt-0.5 leading-relaxed">
              Transfer ke rekening Kasda lalu unggah nomor referensi / struk setor.
            </p>
          </div>
        </button>
      </div>

      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );

  const rightColumn = (
    <div className="flex flex-col h-full">
      <div
        className={
          paymentMethodTab === "gateway"
            ? "flex flex-col h-full gap-4 text-xs"
            : "hidden"
        }
      >
        {activeCheckoutSession ? (
          <EmbeddedMidtransPanel
            session={activeCheckoutSession}
            clientKey={paymentConfig?.midtransClientKey}
            isProduction={paymentConfig?.isProduction}
            isCheckingStatus={isCheckingOut}
            onSuccess={() => {
              if (onGatewaySuccess) onGatewaySuccess();
              else onCheckPaymentStatus();
            }}
            onPending={() => onCheckPaymentStatus()}
            onCheckStatus={onCheckPaymentStatus}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#0B241E]/5 border border-[#0B241E]/10 flex items-center justify-center">
              {isCheckingOut ? (
                <Loader2 className="w-7 h-7 animate-spin text-[#0B241E]" />
              ) : (
                <ShieldCheck className="w-7 h-7 text-[#0B241E]" />
              )}
            </div>
            <div className="max-w-sm space-y-1.5">
              <h4 className="font-bold text-sm text-[#0B241E]">
                {isCheckingOut
                  ? "Menghubungi Gerbang Pembayaran Midtrans..."
                  : "Siap Memuat Pembayaran Instan"}
              </h4>
              <p className="text-[11px] text-[#64748B] leading-relaxed">
                Tampilan QRIS, Virtual Account, dan E-Wallet akan dimuat langsung di
                panel ini tanpa membuka popup tambahan.
              </p>
            </div>
            {!isCheckingOut && (
              <button
                type="button"
                onClick={onGatewayCheckout}
                disabled={gatewayDisabled}
                className="px-5 py-2.5 bg-[#0B241E] hover:bg-[#143E33] text-white font-extrabold text-xs rounded-xl shadow-sm transition-all inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <QrCode className="w-4 h-4 text-[#D97706]" />
                <span>Muat Layar Pembayaran Midtrans</span>
              </button>
            )}
          </div>
        )}
      </div>

      {paymentMethodTab === "manual" && (
        <div className="space-y-4 text-xs">
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
  );

  return (
    <PaymentSideDrawer
      isOpen={isOpen}
      title="Pembayaran Retribusi e-SKRD Jasa Pelabuhan"
      subtitle={`${selectedInvoice.invoiceNumber} • ${selectedInvoice.visit?.vessel?.name || "Kapal Niaga"}`}
      icon={<CreditCard className="w-5 h-5 text-[#D97706]" />}
      onClose={onClose}
      leftColumn={leftColumn}
      rightColumn={rightColumn}
    />
  );
}
