"use client";

import React, { useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Landmark,
  Receipt,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  CreditCard,
  Building2,
  Ship,
  TrendingUp,
  FileCheck2,
  Users,
  Clock,
  ShieldAlert,
  ShieldCheck,
  Droplets,
  Package,
} from "lucide-react";
import { useBillingStore } from "@/store/billing.store";

export default function BendaharaDashboardPage() {
  const {
    revenueSummary,
    invoices,
    unbilledVisits,
    isLoading,
    fetchRevenueSummary,
    fetchInvoices,
    fetchUnbilledVisits,
  } = useBillingStore();

  useEffect(() => {
    fetchRevenueSummary();
    fetchInvoices();
    fetchUnbilledVisits();
  }, [fetchRevenueSummary, fetchInvoices, fetchUnbilledVisits]);

  const formatRupiah = (val: number | string) => {
    const num = Number(val) || 0;
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  // Tagihan yang menunggu verifikasi bukti pembayaran
  const pendingVerificationInvoices = useMemo(() => {
    return invoices.filter((inv) =>
      inv.payments?.some((p) => !p.isVerified) || inv.status === "ISSUED"
    );
  }, [invoices]);

  const totalVerifiedPAD = revenueSummary?.totalVerifiedRevenueIdr ?? 0;
  const totalReceivables = revenueSummary?.outstandingReceivablesIdr ?? 0;
  const unbilledCount = revenueSummary?.unbilledDepartedVisitsCount ?? unbilledVisits.length;
  const verifiedCount = revenueSummary?.verifiedPaymentCount ?? 0;

  return (
    <div className="space-y-6">
      {/* 1. Header Ringkasan & Tombol Sinkronisasi Kasda */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#CBD5E1] shadow-xs">
        <div>
          <h2 className="text-sm font-extrabold text-[#0B241E] flex items-center gap-2">
            <Landmark className="w-4 h-4 text-[#D97706]" />
            <span>Rekapitulasi Penerimaan Kasda (Bank RKUD Papua)</span>
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Dasar Pemungutan: PP No. 35/2023 & Perda Kabupaten Mimika No. 4/2023 tentang Pajak & Retribusi Daerah
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            fetchRevenueSummary();
            fetchInvoices();
            fetchUnbilledVisits();
          }}
          disabled={isLoading}
          className="px-3.5 py-2 bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#CBD5E1] rounded-xl text-xs font-bold text-[#0B241E] transition-colors flex items-center gap-2 cursor-pointer self-start sm:self-auto shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#D97706] ${isLoading ? "animate-spin" : ""}`} />
          <span>Sinkronisasi Data Real</span>
        </button>
      </div>

      {/* 2. Empat Kartu KPI Utama Finansial */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total PAD Masuk */}
        <div className="bg-white p-5 rounded-2xl border border-[#CBD5E1] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold text-[#64748B] uppercase tracking-wider">
                Total PAD Masuk Kasda
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-emerald-800 mt-2">
              {formatRupiah(totalVerifiedPAD)}
            </p>
            <p className="text-[11px] text-[#64748B] mt-1">
              Setoran Sah RKUD Bank Papua
            </p>
          </div>
          <div className="pt-3 border-t border-[#F1F5F9] mt-3 text-[11px] text-emerald-700 font-bold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{verifiedCount} Transaksi Lunas Terbit SSRD</span>
          </div>
        </div>

        {/* Piutang e-SKRD Berjalan */}
        <div className="bg-white p-5 rounded-2xl border border-[#CBD5E1] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold text-[#64748B] uppercase tracking-wider">
                Piutang e-SKRD Aktif
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-amber-900 mt-2">
              {formatRupiah(totalReceivables)}
            </p>
            <p className="text-[11px] text-[#64748B] mt-1">
              Menunggu Pelunasan Operator
            </p>
          </div>
          <div className="pt-3 border-t border-[#F1F5F9] mt-3">
            <Link
              href="/bendahara/skrd"
              className="text-[11px] text-[#D97706] hover:underline font-bold flex items-center justify-between"
            >
              <span>{revenueSummary?.outstandingInvoiceCount ?? invoices.length} Dokumen SKRD Aktif</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Peringatan Kunjungan Belum Ditagih (Anti-Kebocoran PAD) */}
        <div className="bg-white p-5 rounded-2xl border border-rose-200 shadow-xs flex flex-col justify-between bg-gradient-to-br from-white to-rose-50/30">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                <span>Anti-Bocor: Belum Diterbitkan SKRD</span>
              </span>
              <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 border border-rose-300 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-rose-800 mt-2">
              {unbilledCount} Kapal Selesai
            </p>
            <p className="text-[11px] text-rose-600 mt-1">
              Selesai Sandar Tapi Belum Terbit SKRD
            </p>
          </div>
          <div className="pt-3 border-t border-rose-100 mt-3">
            <Link
              href="/bendahara/skrd"
              className="text-[11px] text-rose-700 hover:underline font-bold flex items-center justify-between"
            >
              <span>Terbitkan Tagihan Rampung &rarr;</span>
            </Link>
          </div>
        </div>

        {/* Antrean Verifikasi Bukti Setor */}
        <div className="bg-white p-5 rounded-2xl border border-[#CBD5E1] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold text-[#64748B] uppercase tracking-wider">
                Loket Verifikasi Bayar
              </span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-[#0B241E] mt-2">
              {pendingVerificationInvoices.length} Berkas
            </p>
            <p className="text-[11px] text-[#64748B] mt-1">
              Bukti Transfer Perlu Validasi Bank
            </p>
          </div>
          <div className="pt-3 border-t border-[#F1F5F9] mt-3">
            <Link
              href="/bendahara/verifikasi"
              className="text-[11px] text-[#0B241E] hover:underline font-bold flex items-center justify-between"
            >
              <span>Buka Loket Verifikasi &rarr;</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 3. Breakdown Penerimaan Berdasarkan Objek Retribusi (Perda 4/2023) */}
      <div className="bg-white border border-[#CBD5E1] rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
          <div>
            <h3 className="text-sm font-extrabold text-[#0B241E] flex items-center gap-2">
              <Receipt className="w-4 h-4 text-[#D97706]" />
              <span>Penerimaan Kasda Berdasarkan Objek Retribusi Pelabuhan</span>
            </h3>
            <p className="text-xs text-[#64748B] mt-0.5">
              Rincian pos retribusi daerah yang telah tervalidasi masuk ke Kas Daerah (RKUD).
            </p>
          </div>
          <span className="text-[10px] font-mono bg-[#0B241E] text-white px-2.5 py-1 rounded-md font-bold">
            TA 2026
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          {/* Pos 1: Jasa Kapal (Tambat & Labuh) */}
          <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#0B241E] flex items-center gap-1.5">
                <Ship className="w-4 h-4 text-[#D97706]" />
                Jasa Tambat & Labuh Kapal
              </span>
              <span className="text-[10px] font-mono text-[#64748B]">PP 35/2023</span>
            </div>
            <p className="text-lg font-black text-[#0B241E]">
              {formatRupiah(revenueSummary?.vesselRevenueIdr ?? 0)}
            </p>
            <p className="text-[11px] text-[#64748B]">
              Retribusi pemakaian dermaga & perairan pelabuhan
            </p>
          </div>

          {/* Pos 2: Pas Pelabuhan & Tiket Gerbang */}
          <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#0B241E] flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-600" />
                Pas Masuk & Tiket Gerbang
              </span>
              <span className="text-[10px] font-mono text-[#64748B]">Loket UPT</span>
            </div>
            <p className="text-lg font-black text-[#0B241E]">
              {formatRupiah(revenueSummary?.gateTicketingRevenueIdr ?? 0)}
            </p>
            <p className="text-[11px] text-[#64748B]">
              Pas penumpang, kendaraan pengantar, & karcis gerbang
            </p>
          </div>

          {/* Pos 3: Sewa Kios & Lahan Tenant */}
          <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#0B241E] flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-blue-600" />
                Sewa Kios & Pemanfaatan Lahan
              </span>
              <span className="text-[10px] font-mono text-[#64748B]">Kontrak Tenant</span>
            </div>
            <p className="text-lg font-black text-[#0B241E]">
              {formatRupiah(revenueSummary?.assetLeaseRevenueIdr ?? 0)}
            </p>
            <p className="text-[11px] text-[#64748B]">
              Sewa kios ruko pelabuhan & lahan penumpukan
            </p>
          </div>

          {/* Pos 4: Kargo & Sewa Alat */}
          <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#0B241E] flex items-center gap-1.5">
                <Package className="w-4 h-4 text-purple-600" />
                Pelayanan Barang & Sewa Alat
              </span>
              <span className="text-[10px] font-mono text-[#64748B]">Kargo Pelabuhan</span>
            </div>
            <p className="text-lg font-black text-[#0B241E]">
              {formatRupiah(revenueSummary?.cargoEquipmentRevenueIdr ?? 0)}
            </p>
            <p className="text-[11px] text-[#64748B]">
              Alat bongkar muat, forklift, & forklift dermaga
            </p>
          </div>

          {/* Pos 5: Utilitas Air Bersih */}
          <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#0B241E] flex items-center gap-1.5">
                <Droplets className="w-4 h-4 text-cyan-600" />
                Penyaluran Air Bersih Kapal
              </span>
              <span className="text-[10px] font-mono text-[#64748B]">Rp 28.000 / m³</span>
            </div>
            <p className="text-lg font-black text-[#0B241E]">
              {formatRupiah(revenueSummary?.utilityRevenueIdr ?? 0)}
            </p>
            <p className="text-[11px] text-[#64748B]">
              Bunkering air tawar pipa hydrant dermaga
            </p>
          </div>

          {/* Pos 6: Ringkasan Total PAD Sah */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-[#0B241E] to-[#143E33] text-white space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#D97706] flex items-center gap-1.5">
                <Landmark className="w-4 h-4" />
                Total Realisasi PAD Masuk
              </span>
              <span className="text-[10px] font-mono bg-white/20 px-2 py-0.5 rounded text-white">
                Sah RKUD
              </span>
            </div>
            <p className="text-xl font-black text-white">
              {formatRupiah(totalVerifiedPAD)}
            </p>
            <p className="text-[11px] text-[#A0C4B8]">
              Akumulasi seluruh objek retribusi resmi
            </p>
          </div>
        </div>
      </div>

      {/* 4. Dua Tabel Cepat: Antrean Verifikasi & Kunjungan Siap SKRD */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Kolom Kiri: Antrean Verifikasi Bukti Setor */}
        <div className="bg-white border border-[#CBD5E1] rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
            <div>
              <h3 className="text-sm font-extrabold text-[#0B241E] flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#D97706]" />
                <span>Antrean Verifikasi Bukti Pembayaran</span>
              </h3>
              <p className="text-xs text-[#64748B] mt-0.5">
                Setoran yang diunggah operator menunggu pengesahan e-SSRD.
              </p>
            </div>
            <Link
              href="/bendahara/verifikasi"
              className="text-xs font-bold text-[#D97706] hover:underline"
            >
              Lihat Semua &rarr;
            </Link>
          </div>

          {pendingVerificationInvoices.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#64748B] bg-[#F8FAFC] rounded-xl border border-dashed border-[#E2E8F0]">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="font-bold text-[#0B241E]">Semua Bukti Setor Telah Terverifikasi</p>
              <p className="mt-0.5">Tidak ada antrean pembayaran yang tertahan saat ini.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {pendingVerificationInvoices.slice(0, 4).map((inv) => (
                <div
                  key={inv.id}
                  className="p-3.5 rounded-xl border border-[#E2E8F0] hover:border-[#CBD5E1] bg-[#FAFCFB] flex items-center justify-between gap-3 text-xs transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#0B241E] bg-slate-200/80 px-2 py-0.5 rounded text-[11px]">
                        {inv.invoiceNumber}
                      </span>
                      <span className="font-bold text-[#0B241E]">
                        {inv.visit?.vessel?.name || `Kunjungan #${inv.visitId}`}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#64748B] mt-1">
                      Nominal: <strong className="text-emerald-700">{formatRupiah(inv.totalAmountIdr)}</strong> • Jatuh Tempo: {new Date(inv.dueDate).toLocaleDateString("id-ID")}
                    </p>
                  </div>

                  <Link
                    href={`/bendahara/verifikasi?invoiceId=${inv.id}`}
                    className="px-3 py-1.5 bg-[#0B241E] hover:bg-[#143E33] text-white text-xs font-bold rounded-lg transition-colors shrink-0 shadow-xs cursor-pointer"
                  >
                    Verifikasi
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Kolom Kanan: Kunjungan Kapal Selesai Butuh e-SKRD Rampung */}
        <div className="bg-white border border-[#CBD5E1] rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
            <div>
              <h3 className="text-sm font-extrabold text-[#0B241E] flex items-center gap-2">
                <Receipt className="w-4 h-4 text-rose-600" />
                <span>Kunjungan Butuh e-SKRD Rampung</span>
              </h3>
              <p className="text-xs text-[#64748B] mt-0.5">
                Kapal selesai sandar dari UPT yang belum memiliki invoice tagihan resmi.
              </p>
            </div>
            <Link
              href="/bendahara/skrd"
              className="text-xs font-bold text-rose-700 hover:underline"
            >
              Kelola SKRD &rarr;
            </Link>
          </div>

          {unbilledVisits.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#64748B] bg-[#F8FAFC] rounded-xl border border-dashed border-[#E2E8F0]">
              <ShieldCheck className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <p className="font-bold text-[#0B241E]">Semua Kunjungan Selesai Telah Ditagihkan</p>
              <p className="mt-0.5">Nihil potensi kebocoran retribusi sandar kapal.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {unbilledVisits.slice(0, 4).map((vis) => (
                <div
                  key={vis.id}
                  className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/30 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded text-[11px]">
                        {vis.visitNumber}
                      </span>
                      <span className="font-bold text-[#0B241E]">
                        {vis.vessel?.name || "Kapal Tanpa Nama"} ({vis.vessel?.grossTonnage} GT)
                      </span>
                    </div>
                    <p className="text-[11px] text-[#64748B] mt-1">
                      Dermaga: <strong>{vis.berth?.code || "Dermaga Pemda"}</strong> • Waktu Berangkat: {vis.actualDepartureTime ? new Date(vis.actualDepartureTime).toLocaleString("id-ID") : "Selesai Pelayanan"}
                    </p>
                  </div>

                  <Link
                    href={`/bendahara/skrd?visitId=${vis.id}`}
                    className="px-3 py-1.5 bg-[#D97706] hover:bg-[#B45309] text-[#0B241E] text-xs font-extrabold rounded-lg transition-colors shrink-0 shadow-xs cursor-pointer"
                  >
                    Terbitkan SKRD
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
