"use client";

import React from "react";
import {
  Building2,
  AlertTriangle,
  Zap,
  CreditCard,
  ShieldCheck,
  QrCode,
  Loader2,
} from "lucide-react";
import {
  CheckoutPaymentResponse,
  PaymentConfig,
  UnpaidLeaseSummary,
} from "@/types/billing.types";
import { PaymentSideDrawer } from "@/components/ui/PaymentSideDrawer";
import { EmbeddedMidtransPanel } from "@/components/ui/EmbeddedMidtransPanel";
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
  onGatewaySuccess?: () => void;
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
  onGatewaySuccess,
  onCheckStatus,
  onClose,
}: LeasePaymentModalProps) {
  if (!isOpen || !selectedLeaseForPayment) return null;

  const gatewayDisabled = paymentConfig ? !paymentConfig.gatewayEnabled : false;

  const leftColumn = (
    <div className="space-y-4 text-xs">
      {/* Summary */}
      <div className="p-4 bg-white rounded-2xl border border-[#E2E8F0] shadow-2xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-violet-100 text-violet-900 border border-violet-200">
            <Building2 className="w-3 h-3" />
            Sewa Ruangan / Aset
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
        <div className="flex justify-between items-baseline border-t border-[#E2E8F0] pt-3">
          <span className="text-xs font-extrabold text-[#0B241E]">
            Sisa Tagihan Retribusi
          </span>
          <span className="font-mono text-[#D97706] font-black text-lg">
            {formatRupiah(selectedLeaseForPayment.remaining)}
          </span>
        </div>
      </div>

      {/* Pilihan Metode */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-2xs space-y-2.5">
        <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#64748B]">
          Pilih Metode Pembayaran
        </p>

        <button
          type="button"
          onClick={() => {
            onChangeLeasePaymentTab("gateway");
            if (!gatewayDisabled && !activeCheckoutSession && !isCheckingOut) {
              onGatewayCheckout();
            }
          }}
          disabled={gatewayDisabled}
          className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
            leasePaymentTab === "gateway"
              ? "border-[#0B241E] bg-[#0B241E]/5 ring-1 ring-[#0B241E]"
              : "border-[#E2E8F0] hover:border-[#CBD5E1] bg-white"
          }`}
        >
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              leasePaymentTab === "gateway"
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
                ? "Pembayaran online sedang nonaktif."
                : "Setelah lunas, kuitansi resmi e-SSRD sewa ruangan langsung terbit."}
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onChangeLeasePaymentTab("manual")}
          className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${
            leasePaymentTab === "manual"
              ? "border-[#0B241E] bg-[#0B241E]/5 ring-1 ring-[#0B241E]"
              : "border-[#E2E8F0] hover:border-[#CBD5E1] bg-white"
          }`}
        >
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              leasePaymentTab === "manual"
                ? "bg-[#0B241E] text-white"
                : "bg-[#F1F5F9] text-[#64748B]"
            }`}
          >
            <CreditCard className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="font-bold text-[#0B241E] text-xs block">
              Setor RKUD / Loket Bendahara
            </span>
            <p className="text-[11px] text-[#64748B] mt-0.5 leading-relaxed">
              Transfer manual ke rekening Bank Papua RKUD Kab. Mimika.
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
          leasePaymentTab === "gateway"
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
              else onCheckStatus();
            }}
            onPending={() => onCheckStatus()}
            onCheckStatus={onCheckStatus}
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
                  : "Siap Memuat Pembayaran Sewa Aset"}
              </h4>
              <p className="text-[11px] text-[#64748B] leading-relaxed">
                Antarmuka pembayaran QRIS &amp; Virtual Account akan dimuat langsung di
                panel ini.
              </p>
            </div>
            {!isCheckingOut && (
              <button
                type="button"
                onClick={onGatewayCheckout}
                disabled={gatewayDisabled}
                className="px-5 py-2.5 bg-[#0B241E] hover:bg-[#143E33] text-white font-extrabold text-xs rounded-xl shadow-sm inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <QrCode className="w-4 h-4 text-[#D97706]" />
                <span>Muat Layar Pembayaran Midtrans</span>
              </button>
            )}
          </div>
        )}
      </div>

      {leasePaymentTab === "manual" && (
        <div className="space-y-4 text-xs">
        <div className="p-5 bg-[#FAFCFF] border-2 border-dashed border-[#0B241E]/40 rounded-xl space-y-2.5 text-center">
          <span className="text-[10px] uppercase font-bold text-[#64748B] block">
            Rekening Kas Umum Daerah (RKUD) Kab. Mimika — Bank Papua
          </span>
          <p className="font-mono text-xl font-black text-[#0B241E]">
            104-01-01-000123-8
          </p>
          <p className="text-xs font-semibold text-[#0B241E]">
            a.n. RKUD PEMERINTAH KABUPATEN MIMIKA (Retribusi Sewa BMD)
          </p>
          <p className="text-[11px] text-[#64748B] leading-relaxed pt-1">
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
  );

  return (
    <PaymentSideDrawer
      isOpen={isOpen}
      title="Pembayaran e-SKRD Sewa Ruangan / Aset"
      subtitle={`${selectedLeaseForPayment.lease.contractNumber} • ${selectedLeaseForPayment.lease.asset?.name || `Aset #${selectedLeaseForPayment.lease.assetId}`}`}
      icon={<Building2 className="w-5 h-5 text-[#D97706]" />}
      onClose={onClose}
      leftColumn={leftColumn}
      rightColumn={rightColumn}
    />
  );
}
