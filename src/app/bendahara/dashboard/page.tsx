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
import { formatRupiah } from "@/lib/kapal-billing";

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
      {/* 1. Empat Kartu KPI Utama Finansial (Overlapping Hero Banner) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total PAD Masuk */}
        <div className="bg-white border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4.5 h-4.5" />
              </div>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 truncate">
                {verifiedCount} SSRD Lunas
              </span>
            </div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-4">
              Total PAD Masuk Kasda
            </p>
            <p className="text-2xl font-extrabold text-[#0B241E] mt-1 tracking-tight">
              {formatRupiah(totalVerifiedPAD)}
            </p>
          </div>
          <p className="text-xs text-[#64748B] mt-3 pt-2.5 border-t border-[#F1F5F9] flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">Setoran Sah RKUD Bank Papua</span>
          </p>
        </div>

        {/* KPI 2: Piutang e-SKRD Berjalan */}
        <Link
          href="/bendahara/skrd"
          className="bg-white border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
        >
          <div>
            <div className="flex items-center justify-between gap-2">
              <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <Clock className="w-4.5 h-4.5" />
              </div>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200/80 truncate">
                {revenueSummary?.outstandingInvoiceCount ?? invoices.length} SKRD Aktif
              </span>
            </div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-4">
              Piutang e-SKRD Aktif
            </p>
            <p className="text-2xl font-extrabold text-[#0B241E] mt-1 tracking-tight">
              {formatRupiah(totalReceivables)}
            </p>
          </div>
          <p className="text-xs text-[#D97706] font-semibold mt-3 pt-2.5 border-t border-[#F1F5F9] flex items-center justify-between">
            <span>Menunggu Pelunasan Operator</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </p>
        </Link>

        {/* KPI 3: Kunjungan Belum Ditagih (Anti-Kebocoran PAD) */}
        <Link
          href="/bendahara/skrd"
          className="bg-white border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
        >
          <div>
            <div className="flex items-center justify-between gap-2">
              <div
                className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${
                  unbilledCount > 0
                    ? "bg-rose-50 border-rose-100 text-rose-700"
                    : "bg-emerald-50 border-emerald-100 text-emerald-700"
                }`}
              >
                <AlertTriangle className="w-4.5 h-4.5" />
              </div>
              <span
                className={`text-[11px] font-bold px-2.5 py-1 rounded-full border truncate ${
                  unbilledCount > 0
                    ? "bg-rose-50 text-rose-700 border-rose-200/80"
                    : "bg-emerald-50 text-emerald-700 border-emerald-200/80"
                }`}
              >
                {unbilledCount > 0 ? "Perlu Terbit SKRD" : "Aman Terkendali"}
              </span>
            </div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-4">
              Belum Diterbitkan SKRD
            </p>
            <p className="text-2xl font-extrabold text-[#0B241E] mt-1 tracking-tight">
              {unbilledCount} Kapal
            </p>
          </div>
          <p className="text-xs text-rose-700 font-semibold mt-3 pt-2.5 border-t border-[#F1F5F9] flex items-center justify-between">
            <span>Terbitkan Tagihan Rampung</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </p>
        </Link>

        {/* KPI 4: Antrean Verifikasi Bukti Setor */}
        <Link
          href="/bendahara/verifikasi"
          className="bg-white border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
        >
          <div>
            <div className="flex items-center justify-between gap-2">
              <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <CreditCard className="w-4.5 h-4.5" />
              </div>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80 truncate">
                Validasi Bank
              </span>
            </div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-4">
              Loket Verifikasi Bayar
            </p>
            <p className="text-2xl font-extrabold text-[#0B241E] mt-1 tracking-tight">
              {pendingVerificationInvoices.length} Berkas
            </p>
          </div>
          <p className="text-xs text-[#0B241E] font-semibold mt-3 pt-2.5 border-t border-[#F1F5F9] flex items-center justify-between">
            <span>Buka Loket Verifikasi</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </p>
        </Link>
      </div>

      {/* 2. Header Ringkasan & Tombol Sinkronisasi Kasda */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-xs">
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
