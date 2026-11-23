"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  CheckCircle2,
  Search,
  RefreshCw,
  CreditCard,
  Clock,
  Printer,
  X,
  ExternalLink,
  ShieldCheck,
  Eye,
  QrCode,
  Copy,
} from "lucide-react";
import { useBillingStore } from "@/store/billing.store";
import { BillingInvoice, PaymentMethod } from "@/types/billing.types";

export default function BendaharaVerifikasiPage() {
  const {
    invoices,
    paymentConfig,
    activeCheckoutSession,
    isLoading,
    fetchInvoices,
    fetchPaymentConfig,
    checkoutPayment,
    clearCheckoutSession,
    verifyPayment,
    recordCashPayment,
    fetchPrintPayload,
  } = useBillingStore();

  const [activeTab, setActiveTab] = useState<"pending" | "verified" | "cash">("pending");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedInvoice, setSelectedInvoice] = useState<BillingInvoice | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isGeneratingGateway, setIsGeneratingGateway] = useState<boolean>(false);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  // Form Pembayaran Kasir Loket Tunai/EDC
  const [cashInvoiceId, setCashInvoiceId] = useState<number>(0);
  const [cashAmount, setCashAmount] = useState<number>(0);
  const [cashMethod, setCashMethod] = useState<PaymentMethod>("CASH");
  const [cashRefNo, setCashRefNo] = useState<string>("");

  useEffect(() => {
    fetchInvoices();
    fetchPaymentConfig();
  }, [fetchInvoices, fetchPaymentConfig]);

  const handleCreateCheckoutLink = async (invoiceId: number) => {
    setIsGeneratingGateway(true);
    try {
      await checkoutPayment({ targetType: "INVOICE", targetId: invoiceId });
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Gagal membuat sesi pembayaran digital.");
    } finally {
      setIsGeneratingGateway(false);
    }
  };

  const formatRupiah = (val: number | string) => {
    const num = Number(val) || 0;
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  // Daftar pembayaran yang belum diverifikasi
  const pendingPaymentsList = useMemo(() => {
    const list: { invoice: BillingInvoice; paymentId: number; amount: number; method: string; date: string; refNo?: string; isVerified: boolean }[] = [];
    
    invoices.forEach((inv) => {
      if (inv.payments && inv.payments.length > 0) {
        inv.payments.forEach((p) => {
          if (!p.isVerified) {
            list.push({
              invoice: inv,
              paymentId: p.id,
              amount: Number(p.amountIdr),
              method: p.method,
              date: p.paidAt,
              refNo: p.referenceNo || undefined,
              isVerified: false,
            });
          }
        });
      } else if (inv.status === "ISSUED" || inv.status === "PARTIAL") {
        // Tagihan terbit yang menunggu input setoran
        list.push({
          invoice: inv,
          paymentId: 0,
          amount: Number(inv.totalAmountIdr),
          method: "MENUNGGU_BAYAR",
          date: inv.issuedAt,
          isVerified: false,
        });
      }
    });

    return list.filter((item) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const matchInv = item.invoice.invoiceNumber.toLowerCase().includes(q);
      const matchVessel = item.invoice.visit?.vessel?.name.toLowerCase().includes(q);
      const matchRef = item.refNo?.toLowerCase().includes(q);
      return matchInv || matchVessel || matchRef;
    });
  }, [invoices, searchQuery]);

  // Daftar pembayaran yang sudah lunas & sah terverifikasi
  const verifiedInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const isPaid = inv.status === "PAID" || inv.ssrdNumber || inv.payments?.some((p) => p.isVerified);
      if (!isPaid) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const matchInv = inv.invoiceNumber.toLowerCase().includes(q);
      const matchVessel = inv.visit?.vessel?.name.toLowerCase().includes(q);
      const matchSsrd = inv.ssrdNumber?.toLowerCase().includes(q);
      return matchInv || matchVessel || matchSsrd;
    });
  }, [invoices, searchQuery]);

  const handleVerify = async (paymentId: number, invoiceNumber: string) => {
    if (!paymentId) return;
    setIsVerifying(true);
    try {
      await verifyPayment(paymentId);
      setFeedbackToast(`Pembayaran untuk e-SKRD ${invoiceNumber} berhasil diverifikasi sah! e-SSRD telah terbit.`);
      setSelectedInvoice(null);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Gagal memverifikasi pembayaran.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCashSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cashInvoiceId || cashAmount <= 0) {
      alert("Harap pilih invoice dan masukkan nominal pembayaran yang valid.");
      return;
    }
    setIsVerifying(true);
    try {
      await recordCashPayment(cashInvoiceId, {
        amountIdr: cashAmount,
        method: cashMethod,
        referenceNo: cashRefNo || `LOKET-${Date.now().toString().slice(-6)}`,
        idempotencyKey: `CASH-${cashInvoiceId}-${Date.now()}`,
        paidAt: new Date().toISOString(),
      });
      setFeedbackToast("Pembayaran loket kasir berhasil dicatat dan disahkan ke Kasda!");
      setCashInvoiceId(0);
      setCashAmount(0);
      setCashRefNo("");
      setActiveTab("verified");
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Gagal mencatat pembayaran loket.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {feedbackToast && (
        <div className="bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center justify-between border border-emerald-500 text-xs font-semibold animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-white" />
            <span>{feedbackToast}</span>
          </div>
          <button
            onClick={() => setFeedbackToast(null)}
            className="text-white hover:text-emerald-100 p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. Header Loket & Switcher Tab Mode */}
      <div className="bg-white border border-[#CBD5E1] rounded-2xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("pending")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "pending"
                ? "bg-[#0B241E] text-white shadow-xs font-extrabold"
                : "bg-[#F8FAFC] text-[#64748B] hover:text-[#0B241E] hover:bg-[#F1F5F9] border border-[#E2E8F0]"
            }`}
          >
            <Clock className={`w-4 h-4 ${activeTab === "pending" ? "text-[#D97706]" : "text-[#64748B]"}`} />
            <span>Menunggu Verifikasi Bank</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold">
              {pendingPaymentsList.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("verified")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "verified"
                ? "bg-[#0B241E] text-white shadow-xs font-extrabold"
                : "bg-[#F8FAFC] text-[#64748B] hover:text-[#0B241E] hover:bg-[#F1F5F9] border border-[#E2E8F0]"
            }`}
          >
            <CheckCircle2 className={`w-4 h-4 ${activeTab === "verified" ? "text-emerald-400" : "text-[#64748B]"}`} />
            <span>Pembayaran Sah & e-SSRD Terbit</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-bold">
              {verifiedInvoices.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("cash")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "cash"
                ? "bg-[#0B241E] text-white shadow-xs font-extrabold"
                : "bg-[#F8FAFC] text-[#64748B] hover:text-[#0B241E] hover:bg-[#F1F5F9] border border-[#E2E8F0]"
            }`}
          >
            <CreditCard className={`w-4 h-4 ${activeTab === "cash" ? "text-[#D97706]" : "text-[#64748B]"}`} />
            <span>Kasir Loket Pelabuhan (Tunai / EDC)</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => fetchInvoices()}
          disabled={isLoading}
          className="p-2.5 bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] rounded-xl text-xs font-bold text-[#64748B] hover:text-[#0B241E] transition-colors self-end md:self-auto cursor-pointer"
          title="Segarkan data loket"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-[#D97706]" : ""}`} />
        </button>
      </div>

      {/* 2. TAB A: Antrean Pembayaran Menunggu Verifikasi */}
      {activeTab === "pending" && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Cari nomor e-SKRD, nama kapal, atau nomor referensi bank..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs font-medium pl-10 pr-4 py-2.5 bg-white border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#D97706] text-[#0B241E]"
            />
          </div>

          {pendingPaymentsList.length === 0 ? (
            <div className="p-12 text-center text-xs text-[#64748B] bg-white rounded-2xl border border-[#CBD5E1] shadow-xs">
              <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <h3 className="font-bold text-base text-[#0B241E]">Semua Pembayaran Telah Tervalidasi</h3>
              <p className="mt-1">Tidak ada berkas bukti setoran yang tertahan di antrean verifikasi kasda.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingPaymentsList.map((item, idx) => (
                <div
                  key={`${item.invoice.id}-${item.paymentId}-${idx}`}
                  className="bg-white border border-[#CBD5E1] rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-black bg-[#0B241E] text-white px-2.5 py-1 rounded-lg">
                        {item.invoice.invoiceNumber}
                      </span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border bg-amber-50 text-amber-800 border-amber-300">
                        {item.paymentId > 0 ? "Bukti Bayar Diunggah" : "Menunggu Bayar"}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-black text-[#0B241E]">
                        {item.invoice.visit?.vessel?.name || `Kunjungan #${item.invoice.visitId}`}
                      </h4>
                      <p className="text-xs text-[#64748B] mt-0.5">
                        GT: {item.invoice.visit?.vessel?.grossTonnage} • Rute: {item.invoice.visit?.originPort || "Lokal"} &rarr; {item.invoice.visit?.destinationPort || "Pelabuhan Poumako"}
                      </p>
                    </div>

                    <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[#64748B]">Nominal Tagihan:</span>
                        <strong className="text-[#0B241E]">{formatRupiah(item.invoice.totalAmountIdr)}</strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#64748B]">Metode / Saluran:</span>
                        <span className="font-mono font-bold text-blue-700">{item.method}</span>
                      </div>
                      {item.refNo && (
                        <div className="flex items-center justify-between">
                          <span className="text-[#64748B]">Ref Mutasi Bank:</span>
                          <span className="font-mono font-bold text-[#0B241E]">{item.refNo}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#F1F5F9] flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedInvoice(item.invoice)}
                      className="px-3 py-1.5 bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#CBD5E1] text-[#0B241E] text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#64748B]" />
                      <span>Rincian</span>
                    </button>

                    {item.paymentId > 0 ? (
                      <button
                        type="button"
                        onClick={() => handleVerify(item.paymentId, item.invoice.invoiceNumber)}
                        disabled={isVerifying}
                        className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-extrabold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                        <span>Verifikasi Sah & Terbitkan SSRD</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          disabled={isGeneratingGateway}
                          onClick={() => handleCreateCheckoutLink(item.invoice.id)}
                          className="px-3 py-2 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                          title={`Buat Link / QRIS Pembayaran (${paymentConfig?.provider || "MIDTRANS"})`}
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>{isGeneratingGateway ? "Membuat..." : "QRIS / Link"}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setCashInvoiceId(item.invoice.id);
                            setCashAmount(Number(item.invoice.totalAmountIdr));
                            setActiveTab("cash");
                          }}
                          className="px-3.5 py-2 bg-[#0B241E] hover:bg-[#143E33] text-white text-xs font-extrabold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <CreditCard className="w-4 h-4 text-[#D97706]" />
                          <span>Loket Kasir</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. TAB B: Pembayaran Sah & e-SSRD Terbit */}
      {activeTab === "verified" && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Cari nomor bukti e-SSRD, nama kapal, atau nomor e-SKRD..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs font-medium pl-10 pr-4 py-2.5 bg-white border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#D97706] text-[#0B241E]"
            />
          </div>

          <div className="bg-white border border-[#CBD5E1] rounded-2xl shadow-xs overflow-hidden">
            <div className="p-4 border-b border-[#F1F5F9] bg-[#FAFCFB] flex items-center justify-between text-xs font-bold text-[#64748B]">
              <span>Daftar Surat Setoran Retribusi Daerah (e-SSRD Sah)</span>
              <span>Total: {verifiedInvoices.length} Berkas Lunas</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] font-mono text-[11px] text-[#64748B] uppercase">
                  <tr>
                    <th className="p-3.5">Nomor e-SSRD Sah</th>
                    <th className="p-3.5">No. e-SKRD / Kapal</th>
                    <th className="p-3.5">Nominal Setoran</th>
                    <th className="p-3.5">Metode Bayar</th>
                    <th className="p-3.5">Waktu Lunas</th>
                    <th className="p-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9]">
                  {verifiedInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="p-3.5">
                        <span className="font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
                          {inv.ssrdNumber || `SSRD-2026-${inv.id.toString().padStart(4, "0")}`}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-[#0B241E]">{inv.visit?.vessel?.name || "Armada Kapal"}</div>
                        <div className="text-[11px] font-mono text-[#64748B]">{inv.invoiceNumber}</div>
                      </td>
                      <td className="p-3.5 font-bold text-emerald-700">
                        {formatRupiah(inv.totalAmountIdr)}
                      </td>
                      <td className="p-3.5 font-mono text-[#64748B]">
                        {inv.payments?.[0]?.method || "BANK_TRANSFER (RKUD)"}
                      </td>
                      <td className="p-3.5 text-[#64748B]">
                        {new Date(inv.updatedAt || inv.issuedAt).toLocaleDateString("id-ID")}
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              const payload = await fetchPrintPayload(inv.id);
                              alert(`Mencetak Salinan e-SSRD No: ${payload.ssrdNumber || inv.invoiceNumber}\nStatus: LUNAS KAS DAERAH`);
                            } catch {
                              alert("Gagal memuat dokumen cetak.");
                            }
                          }}
                          className="px-3 py-1.5 bg-[#0B241E] hover:bg-[#143E33] text-white font-bold rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <Printer className="w-3.5 h-3.5 text-[#D97706]" />
                          <span>Cetak SSRD</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. TAB C: Kasir Loket Pelabuhan (Tunai / EDC) */}
      {activeTab === "cash" && (
        <div className="bg-white border border-[#CBD5E1] rounded-2xl p-6 shadow-xs max-w-2xl mx-auto space-y-6">
          <div className="border-b border-[#F1F5F9] pb-4">
            <h3 className="text-base font-black text-[#0B241E] flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#D97706]" />
              <span>Penerimaan Pembayaran Loket Kasir Pelabuhan</span>
            </h3>
            <p className="text-xs text-[#64748B] mt-1">
              Catat setoran pembayaran langsung (Tunai / Mesin EDC / QRIS Kasda) yang dibayarkan di kantor UPT Pelabuhan Poumako.
            </p>
          </div>

          <form onSubmit={handleCashSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-[#0B241E] mb-1.5">
                Pilih Tagihan e-SKRD <span className="text-rose-500">*</span>
              </label>
              <select
                value={cashInvoiceId}
                onChange={(e) => {
                  const id = Number(e.target.value);
                  setCashInvoiceId(id);
                  const found = invoices.find((inv) => inv.id === id);
                  if (found) setCashAmount(Number(found.totalAmountIdr));
                }}
                className="w-full text-xs font-semibold p-3 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#0B241E] cursor-pointer"
                required
              >
                <option value={0}>-- Pilih Tagihan e-SKRD --</option>
                {invoices
                  .filter((inv) => inv.status !== "PAID" && inv.status !== "VOID")
                  .map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      [{inv.invoiceNumber}] {inv.visit?.vessel?.name} — {formatRupiah(inv.totalAmountIdr)}
                    </option>
                  ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-[#0B241E] mb-1.5">
                  Nominal Setoran (Rp) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  value={cashAmount}
                  onChange={(e) => setCashAmount(Number(e.target.value))}
                  className="w-full text-xs font-bold p-3 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#0B241E]"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-[#0B241E] mb-1.5">
                  Saluran Pembayaran Loket <span className="text-rose-500">*</span>
                </label>
                <select
                  value={cashMethod}
                  onChange={(e) => setCashMethod(e.target.value as PaymentMethod)}
                  className="w-full text-xs font-semibold p-3 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#0B241E] cursor-pointer"
                >
                  <option value="CASH">Uang Tunai (Kasir Loket)</option>
                  <option value="QRIS">QRIS Statis/Dinamis Kasda</option>
                  <option value="BANK_TRANSFER">Mesin EDC / Transfer Kasir</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-[#0B241E] mb-1.5">
                Nomor Kuitansi / Bukti Cetak EDC
              </label>
              <input
                type="text"
                placeholder="Contoh: KWT-POUMAKO-00129"
                value={cashRefNo}
                onChange={(e) => setCashRefNo(e.target.value)}
                className="w-full text-xs font-semibold p-3 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#0B241E]"
              />
            </div>

            <div className="pt-4 border-t border-[#F1F5F9] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveTab("pending")}
                className="px-4 py-2.5 rounded-xl border border-[#CBD5E1] text-[#64748B] hover:text-[#0B241E] font-bold transition-colors cursor-pointer"
              >
                Batal
              </button>

              <button
                type="submit"
                disabled={isVerifying || !cashInvoiceId}
                className="px-6 py-2.5 rounded-xl bg-[#0B241E] hover:bg-[#143E33] text-white font-extrabold shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4 text-[#D97706]" />
                <span>Sahkan Pembayaran Loket & Terbitkan SSRD</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 5. Modal Rincian Invoice */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-[#CBD5E1] space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
              <div>
                <span className="font-mono text-xs font-bold bg-[#0B241E] text-white px-2 py-0.5 rounded">
                  {selectedInvoice.invoiceNumber}
                </span>
                <h3 className="font-black text-sm text-[#0B241E] mt-1">
                  Rincian Ketetapan Retribusi Kapal
                </h3>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="p-1.5 text-[#64748B] hover:text-[#0B241E] rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-[#F1F5F9]">
                <span className="text-[#64748B]">Nama Kapal:</span>
                <span className="font-bold text-[#0B241E]">{selectedInvoice.visit?.vessel?.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#F1F5F9]">
                <span className="text-[#64748B]">Tonase Kotor (GT):</span>
                <span className="font-mono font-bold">{selectedInvoice.visit?.vessel?.grossTonnage} GT</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#F1F5F9]">
                <span className="text-[#64748B]">Tahap Ketetapan:</span>
                <span className="font-mono font-bold text-blue-700">{selectedInvoice.billingStage}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#F1F5F9]">
                <span className="text-[#64748B]">Tanggal Terbit:</span>
                <span>{new Date(selectedInvoice.issuedAt).toLocaleDateString("id-ID")}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#F1F5F9]">
                <span className="text-[#64748B]">Jatuh Tempo:</span>
                <span className="text-amber-800 font-bold">{new Date(selectedInvoice.dueDate).toLocaleDateString("id-ID")}</span>
              </div>
              <div className="flex justify-between py-1.5 bg-[#F8FAFC] px-3 rounded-lg font-bold text-sm">
                <span>Total Tagihan:</span>
                <span className="text-emerald-700">{formatRupiah(selectedInvoice.totalAmountIdr)}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-[#F1F5F9] flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedInvoice(null)}
                className="px-4 py-2 bg-[#0B241E] text-white rounded-xl text-xs font-bold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Link / QRIS Pembayaran Digital (POST /payments/checkout) */}
      {activeCheckoutSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-[#CBD5E1] shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-[#0D9488]" />
                <h3 className="text-sm font-black text-[#0B241E]">
                  Sesi Pembayaran Digital ({activeCheckoutSession.provider})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => clearCheckoutSession()}
                className="p-1 text-[#64748B] hover:text-[#0B241E] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4">
              <div className="flex justify-between">
                <span className="text-[#64748B]">Order ID:</span>
                <span className="font-mono font-bold text-[#0B241E]">
                  {activeCheckoutSession.orderId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Nominal Tagihan:</span>
                <span className="font-mono font-extrabold text-emerald-700">
                  {formatRupiah(activeCheckoutSession.amountIdr)}
                </span>
              </div>
              {activeCheckoutSession.snapToken && (
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Snap Token:</span>
                  <span className="font-mono text-[11px] text-[#334155]">
                    {activeCheckoutSession.snapToken}
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
              {activeCheckoutSession.redirectUrl && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(activeCheckoutSession.redirectUrl || "");
                      setFeedbackToast("Link pembayaran digital berhasil disalin!");
                    }}
                    className="px-3.5 py-2 rounded-xl border border-[#CBD5E1] bg-white hover:bg-[#F8FAFC] text-xs font-bold text-[#0B241E] inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin Link</span>
                  </button>
                  <a
                    href={activeCheckoutSession.redirectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-[#0B241E] hover:bg-[#143E33] text-white text-xs font-bold inline-flex items-center gap-1.5"
                  >
                    <span>Buka Halaman Bayar</span>
                    <ExternalLink className="w-3.5 h-3.5 text-[#D97706]" />
                  </a>
                </>
              )}
              <button
                type="button"
                onClick={() => clearCheckoutSession()}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-[#334155] cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
