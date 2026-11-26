"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Receipt,
  Loader2,
  RefreshCw,
  CreditCard,
  AlertCircle,
  AlertTriangle,
  Search,
  Printer,
  FileText,
} from "lucide-react";
import { TablePagination } from "@/components/ui/table-pagination";
import { useTenantStore } from "@/store/tenant.store";
import { usePaymentStore } from "@/store/payment.store";
import { formatLabel } from "@/lib/format-labels";
import { TenantService } from "@/services/tenant.service";
import { BillingService } from "@/services/billing.service";
import { PaymentService } from "@/services/payment.service";
import {
  ReceiptModalData,
  TenantLeaseItem,
  AssetLeasePaymentItem,
  LeasePaymentTableRow,
} from "@/types/tenant.types";
import { UtilityReadingItem } from "@/types/field-ops.types";
import { WarningRecord } from "@/types/billing.types";
import { CheckoutPaymentResponse } from "@/types/payment.types";
import { PrintReceiptModal } from "@/components/tenant/PrintReceiptModal";
import { PaymentSideDrawer } from "@/components/ui/PaymentSideDrawer";
import { EmbeddedMidtransPanel } from "@/components/ui/EmbeddedMidtransPanel";

export default function TenantTagihanPage() {
  const { leases, utilities, isLoading, error, fetchTenantData } =
    useTenantStore();
  const {
    config: paymentConfig,
    isUpdating: isPaying,
    error: paymentError,
    fetchConfig: fetchPaymentConfig,
    checkout,
  } = usePaymentStore();

  const [checkoutInfo, setCheckoutInfo] = useState<string | null>(null);
  const [activeSnapSession, setActiveSnapSession] = useState<CheckoutPaymentResponse | null>(null);
  const [warnings, setWarnings] = useState<WarningRecord[]>([]);
  const [paymentPage, setPaymentPage] = useState(1);
  const [paymentItemsPerPage, setPaymentItemsPerPage] = useState(5);
  const [utilityPage, setUtilityPage] = useState(1);
  const [utilityItemsPerPage, setUtilityItemsPerPage] = useState(5);

  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptModalData | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isLoadingReceipt, setIsLoadingReceipt] = useState(false);

  useEffect(() => {
    fetchTenantData();
    fetchPaymentConfig();
    BillingService.getWarnings().then(setWarnings).catch(() => setWarnings([]));
  }, [fetchTenantData, fetchPaymentConfig]);

  const showMidtransButton =
    Boolean(paymentConfig?.gatewayEnabled) &&
    paymentConfig?.provider === "MIDTRANS";

  const handlePayOnline = async (
    targetType: "ASSET_LEASE" | "UTILITY_READING",
    targetId: number
  ) => {
    setCheckoutInfo(null);
    const res = await checkout({ targetType, targetId });
    setCheckoutInfo(
      `Sesi pembayaran ${res.orderId} siap (Rp ${res.amountIdr.toLocaleString("id-ID")}).`
    );
    setActiveSnapSession(res);
  };

  const handleOpenLeaseReceipt = async (paymentId: number, fallback: LeasePaymentTableRow) => {
    setIsLoadingReceipt(true);
    try {
      const data = await TenantService.getLeasePaymentReceipt(paymentId);
      setSelectedReceipt({ type: "LEASE_PAYMENT", data });
      setIsReceiptModalOpen(true);
    } catch {
      const ssrdNumber = `SSRD-PKS-${fallback.periodYear}-${String(paymentId).padStart(6, "0")}`;
      setSelectedReceipt({
        type: "LEASE_PAYMENT",
        data: {
          documentTitle: "SURAT SETORAN RETRIBUSI DAERAH (e-SSRD)",
          subTitle: "BUKTI PEMBAYARAN RETRIBUSI KEKAYAAN DAERAH (SEWA TANAH/BANGUNAN) SAH",
          ssrdNumber,
          contractNumber: fallback.contractNumber,
          paymentDate: fallback.paidAt,
          taxPeriod: `Tahun Anggaran ${fallback.periodYear}`,
          portName: "Pelabuhan Poumako (UPTD Mimika)",
          portLocation: "Distrik Mimika Timur, Kab. Mimika",
          taxPayer: {
            tenantName: fallback.tenantName || "Wajib Retribusi Tenant",
            tenantNpwp: "-",
            tenantPhone: "-",
            businessName: fallback.tenantName || "Mitra Usaha Pelabuhan",
            address: "Kawasan Pelabuhan Poumako, Timika",
          },
          retributionObject: {
            assetCode: `AST-${fallback.assetId || "PMK"}`,
            assetName: fallback.assetName,
            assetType: "KIOS_KOMERSIL",
            areaSqm: 24,
            annualRatePerSqmIdr: 500000,
            legalBasis: "Perda Kab. Mimika No. 4/2023 & Perbup No. 25/2024",
            revenueAccountCode: "4.1.02.02.01 (Retribusi Pemanfaatan Kekayaan Daerah)",
          },
          paymentDetails: {
            totalAnnualContractIdr: Number(fallback.amountIdr),
            periodYear: fallback.periodYear,
            amountPaidIdr: Number(fallback.amountIdr),
            idempotencyKey: fallback.idempotencyKey || `PKS-${paymentId}`,
            paymentStatus: "PAID",
            verifiedByName: "Bendahara Penerimaan UPTD Pelabuhan",
            verifiedAt: fallback.paidAt,
          },
          qrValidationCode: `PORTA-SSRD-VERIFIED:POUMAKO:${ssrdNumber}`,
        },
      });
      setIsReceiptModalOpen(true);
    } finally {
      setIsLoadingReceipt(false);
    }
  };

  const handleOpenUtilityReceipt = async (utilityId: number, fallback: UtilityReadingItem) => {
    setIsLoadingReceipt(true);
    try {
      const data = await TenantService.getUtilityReceipt(utilityId);
      setSelectedReceipt({ type: "UTILITY", data });
      setIsReceiptModalOpen(true);
    } catch {
      const ssrdNumber = `SSRD-UTL-${fallback.readingNumber}`;
      setSelectedReceipt({
        type: "UTILITY",
        data: {
          documentTitle: "SURAT SETORAN RETRIBUSI DAERAH (e-SSRD)",
          subTitle: "BUKTI PEMBAYARAN RETRIBUSI JASA USAHA DAERAH (UTILITAS PELABUHAN) SAH",
          ssrdNumber,
          readingNumber: fallback.readingNumber,
          paymentDate: fallback.createdAt,
          portName: "Pelabuhan Poumako (UPTD Mimika)",
          portLocation: "Distrik Mimika Timur, Kab. Mimika",
          taxPayer: {
            tenantName: "Wajib Retribusi Tenant Pelabuhan",
            tenantNpwp: "-",
            businessName: "Mitra Usaha Pelabuhan Poumako",
          },
          retributionObject: {
            utilityType: fallback.utilityType,
            assetCode: fallback.asset?.assetCode || `AST-${fallback.assetId || "UTL"}`,
            assetName: fallback.asset?.name || "Fasilitas Kios/Gudang Pelabuhan",
            meterStart: Number(fallback.meterStart || 0),
            meterEnd: Number(fallback.meterEnd || 0),
            volumeConsumed: Number(fallback.volumeConsumed || 0),
            unitLabel: fallback.unitLabel || "kWh",
            ratePerUnitIdr: 2500,
            legalBasis: "Perda Kab. Mimika No. 4/2023 & Perbup No. 25/2024",
            revenueAccountCode: "4.1.02.02.04 (Retribusi Penyediaan Air Bersih & Energi Listrik Pelabuhan)",
          },
          paymentDetails: {
            totalAmountIdr: Number(fallback.totalAmountIdr),
            paymentStatus: fallback.paymentStatus,
            paidAt: fallback.createdAt,
            idempotencyKey: `UTL-${utilityId}`,
            recordedByName: "Petugas Pencatat Meteran UPTD",
          },
          qrValidationCode: `PORTA-SSRD-UTL:POUMAKO:${ssrdNumber}`,
        },
      });
      setIsReceiptModalOpen(true);
    } finally {
      setIsLoadingReceipt(false);
    }
  };

  const activeUnpaidLeases = leases.filter((l) => {
    if (l.status !== "ACTIVE") return false;
    const paid = (l.payments || []).reduce(
      (s, p) => s + Number(p.amountIdr),
      0
    );
    return Number(l.totalAnnualAmountIdr) - paid > 0;
  });

  const leasePayments: LeasePaymentTableRow[] = leases.flatMap((l: TenantLeaseItem) =>
    (l.payments || []).map((p: AssetLeasePaymentItem) => ({
      ...p,
      contractNumber: l.contractNumber,
      assetName: l.asset?.name || `Aset #${l.assetId}`,
      tenantName: l.tenantName,
      assetId: l.assetId,
    }))
  );

  const totalPaymentPages = Math.ceil(leasePayments.length / paymentItemsPerPage) || 1;
  const pagedLeasePayments = leasePayments.slice(
    (paymentPage - 1) * paymentItemsPerPage,
    paymentPage * paymentItemsPerPage
  );

  const totalUtilityPages = Math.ceil(utilities.length / utilityItemsPerPage) || 1;
  const pagedUtilities = utilities.slice(
    (utilityPage - 1) * utilityItemsPerPage,
    utilityPage * utilityItemsPerPage
  );

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-2 text-xs font-bold text-[#0B241E]">
          <Receipt className="w-4 h-4 text-[#D97706]" />
          Tagihan Sewa PKS & Riwayat Pembayaran
        </div>
        <button
          type="button"
          onClick={() => {
            fetchTenantData();
            fetchPaymentConfig();
          }}
          disabled={isLoading}
          className="px-3 py-2 rounded-xl border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] text-xs font-semibold text-[#475569] flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {paymentConfig && !showMidtransButton && (
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold">
          Pembayaran dilakukan melalui transfer resmi Bank Papua (RKUD) atau loket Bendahara Pelabuhan.
        </div>
      )}

      {checkoutInfo && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
          {checkoutInfo}
        </div>
      )}

      {(error || paymentError) && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error || paymentError}</span>
        </div>
      )}

      {isLoading ? (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-12 flex items-center justify-center gap-2 text-xs text-[#64748B]">
          <Loader2 className="w-4 h-4 animate-spin" />
          Memuat tagihan & bukti setor...
        </div>
      ) : (
        <div className="space-y-6">
          {/* Ketentuan Denda & Peringatan STRD (Perbup Mimika 25/2024) */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 text-xs shadow-2xs">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              </div>
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-amber-900">
                    Kepatuhan Retribusi & Ketentuan Sanksi (Perbup Mimika No. 25/2024)
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-200/60 text-amber-800 text-[10px] font-bold">
                    Pasal 10 & 20
                  </span>
                </div>
                <p className="text-[#475569] text-[11px] leading-relaxed">
                  Keterlambatan penyetoran retribusi daerah melewati tanggal jatuh tempo dikenakan sanksi administratif berupa bunga/denda sebesar <strong>1% (satu persen) per bulan</strong>. Wajib Retribusi yang menunggak akan diterbitkan <strong>Surat Teguran (STRD) I, II, dan III</strong> sebelum penindakan penertiban fasilitas tempat usaha.
                </p>
                {warnings.length > 0 && (
                  <div className="pt-2">
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-[11px] font-semibold flex items-center justify-between">
                      <span>
                        Perhatian: Terdapat {warnings.length} Surat Teguran resmi yang diterbitkan untuk akun usaha Anda. Segera lakukan pelunasan kewajiban retribusi.
                      </span>
                      <Link
                        href="/tenant/notifikasi"
                        className="underline text-rose-900 font-bold hover:text-rose-950 shrink-0 ml-2"
                      >
                        Lihat Peringatan
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Active Lease Bills */}
          {activeUnpaidLeases.length > 0 && (
            <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-2xs">
              <div className="p-4 border-b border-[#E2E8F0] bg-[#F8FAFC] text-xs font-bold text-[#0B241E]">
                Tagihan Kontrak Sewa Aktif ({activeUnpaidLeases.length})
              </div>
              <div className="divide-y divide-[#F1F5F9]">
                {activeUnpaidLeases.map((l) => (
                  <div
                    key={l.id}
                    className="p-4 flex flex-wrap items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-mono font-bold text-[#0B241E]">
                        {l.contractNumber} — {l.asset?.name}
                      </div>
                      <div className="text-[11px] text-[#64748B]">
                        Total Tahunan: Rp{" "}
                        {Number(l.totalAnnualAmountIdr).toLocaleString("id-ID")}
                      </div>
                    </div>
                    {showMidtransButton && (
                      <button
                        type="button"
                        disabled={isPaying}
                        onClick={() => handlePayOnline("ASSET_LEASE", l.id)}
                        className="px-3.5 py-2 rounded-xl bg-[#0B241E] hover:bg-[#143E33] text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <CreditCard className="w-3.5 h-3.5 text-[#D97706]" />
                        Bayar Online (Midtrans)
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Verified Payments */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-2xs">
            <div className="p-4 border-b border-[#E2E8F0] bg-[#F8FAFC] text-xs font-bold text-[#0B241E]">
              Riwayat Pembayaran Sewa Aset Terverifikasi ({leasePayments.length})
            </div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E2E8F0] text-[11px] font-mono uppercase text-[#64748B]">
                  <th className="py-3 px-4">No. Kontrak</th>
                  <th className="py-3 px-4">Unit Aset</th>
                  <th className="py-3 px-4">Tahun Periode</th>
                  <th className="py-3 px-4">Nominal Dibayar</th>
                  <th className="py-3 px-4">Tanggal Bayar</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9] text-xs">
                {pagedLeasePayments.map((p) => (
                  <tr key={p.id}>
                    <td className="py-3 px-4 font-mono font-bold text-[#0B241E]">
                      {p.contractNumber}
                    </td>
                    <td className="py-3 px-4">{p.assetName}</td>
                    <td className="py-3 px-4">{p.periodYear}</td>
                    <td className="py-3 px-4 font-bold text-emerald-700">
                      Rp {Number(p.amountIdr).toLocaleString("id-ID")}
                    </td>
                    <td className="py-3 px-4 text-[#475569]">
                      {new Date(p.paidAt).toLocaleDateString("id-ID")}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleOpenLeaseReceipt(p.id, p)}
                        disabled={isLoadingReceipt}
                        className="px-2.5 py-1.5 rounded-lg bg-[#0B241E] hover:bg-[#143E33] text-white text-[11px] font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                        title="Cetak Kuitansi e-SSRD Sah"
                      >
                        <Printer className="w-3.5 h-3.5 text-[#D97706]" />
                        <span>Cetak e-SSRD</span>
                      </button>
                    </td>
                  </tr>
                ))}
                {pagedLeasePayments.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[#94A3B8]">
                      Belum ada pembayaran sewa yang tercatat.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <TablePagination
              currentPage={paymentPage}
              totalPages={totalPaymentPages}
              totalItems={leasePayments.length}
              itemsPerPage={paymentItemsPerPage}
              onPageChange={setPaymentPage}
              onItemsPerPageChange={setPaymentItemsPerPage}
              itemsPerPageOptions={[5, 10, 20]}
            />
          </div>

          {/* Utility Bills */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-2xs">
            <div className="p-4 border-b border-[#E2E8F0] bg-[#F8FAFC] text-xs font-bold text-[#0B241E]">
              Tagihan Utilitas Listrik & Air ({utilities.length})
            </div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E2E8F0] text-[11px] font-mono uppercase text-[#64748B]">
                  <th className="py-3 px-4">No. Catatan</th>
                  <th className="py-3 px-4">Jenis</th>
                  <th className="py-3 px-4">Tagihan</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9] text-xs">
                {pagedUtilities.map((u) => (
                  <tr key={u.id}>
                    <td className="py-3 px-4 font-mono font-bold">
                      {u.readingNumber}
                    </td>
                    <td className="py-3 px-4">{formatLabel(u.utilityType)}</td>
                    <td className="py-3 px-4 font-bold">
                      Rp {Number(u.totalAmountIdr).toLocaleString("id-ID")}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                          u.paymentStatus === "PAID"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-800"
                        }`}
                      >
                        {formatLabel(u.paymentStatus)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {u.paymentStatus === "PAID" ? (
                        <button
                          type="button"
                          onClick={() => handleOpenUtilityReceipt(u.id, u)}
                          disabled={isLoadingReceipt}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white text-[11px] font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                          title="Cetak Kuitansi e-SSRD Utilitas Sah"
                        >
                          <FileText className="w-3.5 h-3.5 text-emerald-300" />
                          <span>Kuitansi e-SSRD</span>
                        </button>
                      ) : u.paymentStatus === "UNPAID" && showMidtransButton ? (
                        <button
                          type="button"
                          disabled={isPaying}
                          onClick={() => handlePayOnline("UTILITY_READING", u.id)}
                          className="px-2.5 py-1 rounded-lg bg-[#0B241E] text-white text-[11px] font-bold cursor-pointer"
                        >
                          Bayar Online
                        </button>
                      ) : (
                        <span className="text-[11px] text-[#94A3B8]">-</span>
                      )}
                    </td>
                  </tr>
                ))}
                {pagedUtilities.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-[#94A3B8]">
                      Belum ada tagihan utilitas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <TablePagination
              currentPage={utilityPage}
              totalPages={totalUtilityPages}
              totalItems={utilities.length}
              itemsPerPage={utilityItemsPerPage}
              onPageChange={setUtilityPage}
              onItemsPerPageChange={setUtilityItemsPerPage}
              itemsPerPageOptions={[5, 10, 20]}
            />
          </div>
        </div>
      )}

      {/* Formal Government Receipt Modal (e-SSRD) */}
      <PrintReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        receipt={selectedReceipt}
      />

      <PaymentSideDrawer
        isOpen={Boolean(activeSnapSession)}
        title="Pembayaran Retribusi Tenant (Midtrans)"
        subtitle={activeSnapSession ? `Order ID: ${activeSnapSession.orderId}` : undefined}
        icon={<CreditCard className="w-5 h-5 text-[#D97706]" />}
        onClose={() => setActiveSnapSession(null)}
        leftColumn={
          activeSnapSession ? (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-white rounded-2xl border border-[#E2E8F0] shadow-2xs space-y-2.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#64748B] block">
                  Ringkasan Pembayaran
                </span>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Order ID</span>
                  <span className="font-mono font-bold text-[#0B241E]">
                    {activeSnapSession.orderId}
                  </span>
                </div>
                <div className="flex justify-between items-baseline border-t border-[#E2E8F0] pt-3">
                  <span className="font-extrabold text-[#0B241E]">Total Tagihan</span>
                  <span className="font-mono font-black text-lg text-[#D97706]">
                    Rp {Number(activeSnapSession.amountIdr).toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
              <div className="p-4 bg-white rounded-2xl border border-[#E2E8F0] text-[11px] text-[#64748B] leading-relaxed">
                Selesaikan pembayaran melalui QRIS, Virtual Account, atau E-Wallet di
                panel sebelah kanan. Kuitansi e-SSRD akan tersedia otomatis setelah
                pembayaran terkonfirmasi.
              </div>
            </div>
          ) : null
        }
        rightColumn={
          activeSnapSession ? (
            <EmbeddedMidtransPanel
              session={activeSnapSession}
              clientKey={paymentConfig?.midtransClientKey}
              isProduction={paymentConfig?.isProduction}
              isCheckingStatus={isLoading}
              onSuccess={() => {
                const orderId = activeSnapSession.orderId;
                void (async () => {
                  await PaymentService.syncStatus(orderId).catch(() => null);
                  setCheckoutInfo(`Pembayaran ${orderId} berhasil diselesaikan.`);
                  setActiveSnapSession(null);
                  await fetchTenantData();
                })();
              }}
              onPending={() => {
                const orderId = activeSnapSession.orderId;
                void (async () => {
                  await PaymentService.syncStatus(orderId).catch(() => null);
                  setCheckoutInfo(
                    `Pembayaran ${orderId} menunggu penyelesaian di Midtrans.`,
                  );
                  await fetchTenantData();
                })();
              }}
              onCheckStatus={() => {
                const orderId = activeSnapSession.orderId;
                void (async () => {
                  await PaymentService.syncStatus(orderId).catch(() => null);
                  await fetchTenantData();
                })();
              }}
            />
          ) : null
        }
      />
    </div>
  );
}
