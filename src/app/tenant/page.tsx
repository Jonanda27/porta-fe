"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Store,
  Building2,
  FileCheck2,
  CreditCard,
  Zap,
  Droplet,
  Calendar,
  Clock,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Receipt,
  Download,
  ExternalLink,
  ShieldCheck,
  MapPin,
  ChevronRight,
  Plus,
  HelpCircle,
  FileText,
  BadgeAlert,
} from "lucide-react";

export default function TenantDashboardPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<string>("2026");

  // Format IDR
  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* 1. TOP WELCOME & LEASE VALIDITY BANNER                                   */}
      {/* ========================================================================= */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#0B241E] text-[#D97706] flex items-center justify-center font-bold text-lg shrink-0 shadow-xs">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-[#0B241E]">
                Selamat Datang, Kios Cendrawasih Souvenir
              </h2>
              <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                PKS Aktif & Sah
              </span>
            </div>
            <p className="text-xs text-[#64748B] mt-1 max-w-2xl">
              Unit Sewa: <strong>Blok A-04 (Lantai 1 Gedung Terminal Penumpang)</strong> • Nomor PKS: <span className="font-mono text-[#0B241E]">552.1/PKS-ASET/UPTD/2026/014</span> • Masa Berlaku Kontrak s.d. <strong>31 Desember 2026</strong>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            href="/tenant/sewa"
            className="px-4 py-2.5 bg-[#0B241E] hover:bg-[#143E33] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#D97706]" />
            <span>Ajukan Unit Tambahan</span>
          </Link>
          <Link
            href="/tenant/kontrak"
            className="px-4 py-2.5 bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#475569] border border-[#CBD5E1] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FileText className="w-4 h-4 text-[#0B241E]" />
            <span>Lihat PKS Digital</span>
          </Link>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. OPERATIONAL KPI SUMMARY CARDS (PERBUP MIMIKA 25/2024 & PP 35/2023)    */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Unit Sewa Aktif */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
              Unit Kios Dikelola
            </span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Store className="w-5 h-5 stroke-[2.5]" />
            </div>
          </div>
          <p className="text-xl font-extrabold text-[#0B241E] font-mono mt-2">
            1 Unit <span className="text-xs font-sans font-normal text-[#64748B]">(12 m²)</span>
          </p>
          <p className="text-[11px] text-[#64748B] mt-1.5 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 inline" />
            <span>Zona A - Terminal Penumpang</span>
          </p>
        </div>

        {/* KPI 2: Masa Berlaku Kontrak */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
              Sisa Masa Sewa PKS
            </span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Calendar className="w-5 h-5 stroke-[2.5]" />
            </div>
          </div>
          <p className="text-xl font-extrabold text-[#0B241E] font-mono mt-2">
            142 Hari <span className="text-xs font-sans font-normal text-emerald-700 font-bold">(Aktif)</span>
          </p>
          <p className="text-[11px] text-[#64748B] mt-1.5">
            Jatuh tempo perpanjangan: 31 Des 2026
          </p>
        </div>

        {/* KPI 3: Status Retribusi Daerah */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
              Status Retribusi (e-SKRD)
            </span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
            </div>
          </div>
          <p className="text-xl font-extrabold text-emerald-700 font-mono mt-2">
            LUNAS <span className="text-xs font-sans font-normal text-[#64748B]">s.d. Nov 2026</span>
          </p>
          <p className="text-[11px] text-[#64748B] mt-1.5 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline" />
            <span>Nihil tunggakan (Bebas Denda STRD)</span>
          </p>
        </div>

        {/* KPI 4: Konsumsi Utilitas Bulan Ini */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
              Utilitas Terakhir
            </span>
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Zap className="w-5 h-5 stroke-[2.5]" />
            </div>
          </div>
          <p className="text-xl font-extrabold text-[#0B241E] font-mono mt-2">
            340 kWh <span className="text-xs font-sans font-normal text-[#64748B]">& 14 m³</span>
          </p>
          <p className="text-[11px] text-[#64748B] mt-1.5">
            Tagihan listrik & air: {formatRupiah(612000)}
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. MAIN DASHBOARD CONTENT (2 COLUMNS)                                     */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Detail Unit Kios & Utilitas (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card A: Unit Kios Aktif Detail */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
              <div className="flex items-center gap-2.5">
                <Store className="w-5 h-5 text-[#D97706]" />
                <h3 className="text-sm font-extrabold text-[#0B241E]">
                  Rincian Fasilitas Tempat Usaha Aktif
                </h3>
              </div>
              <span className="text-[10px] font-mono bg-blue-50 text-blue-800 font-bold px-2 py-0.5 rounded border border-blue-200">
                Pemanfaatan BMD (Pasal 4 Perbup)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl space-y-2">
                <p className="text-[11px] font-bold text-[#64748B] uppercase">Spesifikasi Fisik Unit</p>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Nomor Blok:</span>
                  <strong className="text-[#0B241E] font-mono">Blok A-04</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Peruntukan Usaha:</span>
                  <span className="font-bold text-[#0B241E]">Kios Cinderamata & Makanan Khas</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Dimensi Ruang:</span>
                  <span className="font-mono text-[#0B241E]">3.0 m x 4.0 m (12 m²)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Lokasi Penempatan:</span>
                  <span className="text-[#0B241E]">Hall Keberangkatan Terminal</span>
                </div>
              </div>

              <div className="p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl space-y-2">
                <p className="text-[11px] font-bold text-[#64748B] uppercase">Fasilitas & Utilitas Dasar</p>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Daya Listrik PLN:</span>
                  <span className="font-mono text-[#0B241E]">2.200 VA (Meter Mandiri)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Suplai Air Bersih:</span>
                  <span className="text-[#0B241E]">Instalasi Kran PDAM Aktif</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Fasilitas Bersama:</span>
                  <span className="text-[#0B241E]">Keamanan 24 Jam & TPS Sampah</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Nilai Sewa Tahunan:</span>
                  <strong className="font-mono text-emerald-800">{formatRupiah(18000000)} / Tahun</strong>
                </div>
              </div>
            </div>

            {/* Quick Actions inside Card */}
            <div className="pt-2 flex flex-wrap items-center gap-2">
              <Link
                href="/tenant/utilitas"
                className="px-3.5 py-2 text-xs font-bold text-[#0B241E] bg-[#F1F5F9] hover:bg-[#E2E8F0] rounded-lg inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-amber-600" />
                <span>Lihat Riwayat Meteran Listrik</span>
              </Link>
              <Link
                href="/tenant/tagihan"
                className="px-3.5 py-2 text-xs font-bold text-[#0B241E] bg-[#F1F5F9] hover:bg-[#E2E8F0] rounded-lg inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Receipt className="w-3.5 h-3.5 text-emerald-600" />
                <span>Riwayat e-SKRD & SSRD</span>
              </Link>
            </div>
          </div>

          {/* Card B: Riwayat Pembayaran Retribusi Terakhir */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#FAFCFB]">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-[#D97706]" />
                <h3 className="text-xs font-extrabold text-[#0B241E] uppercase tracking-wider">
                  Riwayat Surat Ketetapan Retribusi (e-SKRD) Terakhir
                </h3>
              </div>
              <Link
                href="/tenant/tagihan"
                className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
              >
                <span>Lihat Semua</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                    <th className="py-2.5 px-4">No. SKRD</th>
                    <th className="py-2.5 px-4">Masa Retribusi</th>
                    <th className="py-2.5 px-4">Uraian Retribusi</th>
                    <th className="py-2.5 px-4 text-right">Jumlah</th>
                    <th className="py-2.5 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  <tr className="hover:bg-[#F8FAFC]/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#0B241E]">
                      SKRD-AST/2026/0482
                    </td>
                    <td className="py-3 px-4 text-[#475569]">
                      November 2026
                    </td>
                    <td className="py-3 px-4 text-[#0B241E]">
                      Sewa Kios Blok A-04 + Utilitas Listrik
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-[#0B241E]">
                      {formatRupiah(2112000)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3 h-3" />
                        Lunas
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-[#F8FAFC]/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#0B241E]">
                      SKRD-AST/2026/0431
                    </td>
                    <td className="py-3 px-4 text-[#475569]">
                      Oktober 2026
                    </td>
                    <td className="py-3 px-4 text-[#0B241E]">
                      Sewa Kios Blok A-04 + Utilitas Listrik
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-[#0B241E]">
                      {formatRupiah(2095000)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3 h-3" />
                        Lunas
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Tracking Permohonan & Info Regulasi (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Status Pipeline Pengajuan Tambahan Kios */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
              <h4 className="text-xs font-extrabold text-[#0B241E] uppercase tracking-wider">
                Status Permohonan Sewa Berjalan
              </h4>
              <span className="text-[10px] font-mono text-[#64748B]">Reg: REQ-T2026-089</span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-[#64748B]">Objek Diajukan:</span>
                <strong className="text-[#0B241E]">Kios Kuliner Blok B-02 (Zona B)</strong>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#64748B]">Luas Rencana:</span>
                <span className="font-mono text-[#0B241E]">4.0 m x 6.0 m (24 m²)</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#64748B]">Durasi Diajukan:</span>
                <span className="font-bold text-[#0B241E]">1 Tahun (2027)</span>
              </div>
            </div>

            {/* Stepper Timeline */}
            <div className="space-y-3 pt-1">
              {[
                { title: "1. Pengajuan Formulir & Dokumen", desc: "Telah diunggah lengkap (NIB & KTP)", date: "12 Nov 2026", status: "completed" },
                { title: "2. Verifikasi Berkas UPTD", desc: "Disetujui Tim Verifikasi Aset Pelabuhan", date: "14 Nov 2026", status: "completed" },
                { title: "3. Penilaian Lapangan & Kesesuaian Zonasi", desc: "Sedang dalam proses survei teknis", date: "Hari ini", status: "current" },
                { title: "4. Penerbitan Kontrak PKS Kepala Dinas", desc: "Menunggu hasil survei lapangan", date: "Estimasi 2 hari", status: "upcoming" },
              ].map((step, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs">
                  <div className="mt-0.5">
                    {step.status === "completed" && (
                      <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px]">
                        ✓
                      </div>
                    )}
                    {step.status === "current" && (
                      <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-[10px] animate-pulse">
                        ●
                      </div>
                    )}
                    {step.status === "upcoming" && (
                      <div className="w-5 h-5 rounded-full bg-[#E2E8F0] text-[#94A3B8] flex items-center justify-center font-bold text-[10px]">
                        ○
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`font-bold ${step.status === "current" ? "text-amber-800" : "text-[#0B241E]"}`}>
                      {step.title}
                    </p>
                    <p className="text-[11px] text-[#64748B]">{step.desc}</p>
                  </div>
                  <span className="text-[10px] text-[#94A3B8] font-mono shrink-0">{step.date}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Legal Notice Perbup Mimika 25/2024 */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-xs space-y-2">
            <div className="flex items-center gap-2 text-emerald-900 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Ketentuan Pemanfaatan Barang Milik Daerah (BMD)</span>
            </div>
            <p className="text-[11px] text-emerald-800 leading-relaxed">
              Sesuai <strong>Perbup Mimika No. 25 Tahun 2024 Pasal 10 & 16</strong>:
            </p>
            <ul className="text-[11px] text-emerald-800 space-y-1 list-disc pl-4">
              <li>Pemanfaatan kios/los wajib ditetapkan dengan <strong>SKRD</strong>.</li>
              <li>Jatuh tempo pembayaran adalah <strong>30 hari kalender</strong> sejak SKRD terbit.</li>
              <li>Keterlambatan pembayaran dikenakan sanksi bunga <strong>1% per bulan</strong> (Pasal 21 ayat 8).</li>
              <li>Penyewa berhak mengajukan angsuran <strong>SPARD maks. 6 bulan</strong> jika nilai tagihan besar (Pasal 19).</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
