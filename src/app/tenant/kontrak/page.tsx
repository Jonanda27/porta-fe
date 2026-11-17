"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileCheck2,
  Building2,
  Calendar,
  Clock,
  Printer,
  Download,
  CheckCircle2,
  ShieldCheck,
  FileText,
  MapPin,
  Store,
  ExternalLink,
  Lock,
  AlertTriangle,
  RotateCcw,
  Check,
  X,
  ChevronRight,
  Eye,
  Info,
  BadgeAlert,
  ArrowRight,
  Sparkles,
} from "lucide-react";

// =========================================================================
// TYPES & MOCK DATA (PERBUP MIMIKA 25/2024 & PP 35/2023)
// =========================================================================

interface ContractClause {
  article: string;
  title: string;
  summary: string;
}

interface ContractPKS {
  contractNumber: string;
  registrationNumber: string;
  unitId: string;
  unitName: string;
  zoneName: string;
  tenantName: string;
  tenantCompany: string;
  npwpd: string;
  nib: string;
  periodStart: string;
  periodEnd: string;
  daysRemaining: number;
  durationMonths: number;
  annualRentRate: number;
  status: "ACTIVE" | "EXPIRING_SOON" | "RENEWAL_SUBMITTED" | "ARCHIVED";
  officialFirstParty: string; // Pihak Pertama (UPTD / Bupati)
  officialFirstPartyNip: string;
}

const ACTIVE_CONTRACT: ContractPKS = {
  contractNumber: "552.1/PKS-ASET/UPTD/2026/014",
  registrationNumber: "REG-PKS-MMK-2026-0042",
  unitId: "BLOK-A04",
  unitName: "Kios Komersial A-04 (Lantai 1 Hall Terminal)",
  zoneName: "Zona A - Gedung Terminal Penumpang Penyeberangan",
  tenantName: "Ny. Martha Kogoya",
  tenantCompany: "Kios Cendrawasih Souvenir",
  npwpd: "03.182.901.4-951.000",
  nib: "0220008912345",
  periodStart: "01 Januari 2026",
  periodEnd: "31 Desember 2026",
  daysRemaining: 142,
  durationMonths: 12,
  annualRentRate: 18000000,
  status: "ACTIVE",
  officialFirstParty: "Capt. Ridwan Hakim, M.Mar (Kepala UPTD Pelabuhan an. Bupati Mimika)",
  officialFirstPartyNip: "19780521 200212 1 001",
};

const ARCHIVED_CONTRACTS = [
  {
    contractNumber: "552.1/PKS-ASET/UPTD/2025/009",
    unitName: "Kios Komersial A-04 (Terminal Penumpang)",
    period: "01 Jan 2025 - 31 Des 2025 (12 Bulan)",
    annualRentRate: 16500000,
    status: "SELESAI (LUNAS PENUH)",
  },
  {
    contractNumber: "552.1/PKS-ASET/UPTD/2024/007",
    unitName: "Kios Komersial A-04 (Terminal Penumpang)",
    period: "01 Jan 2024 - 31 Des 2024 (12 Bulan)",
    annualRentRate: 15000000,
    status: "SELESAI (LUNAS PENUH)",
  },
];

const CONTRACT_CLAUSES: ContractClause[] = [
  {
    article: "Pasal 1",
    title: "Maksud dan Objek Pemanfaatan",
    summary: "PIHAK PERTAMA memberikan hak sewa pemanfaatan Barang Milik Daerah (BMD) kepada PIHAK KEDUA berupa 1 (satu) unit Kios Komersial Blok A-04 seluas 12 m² di lingkungan Pelabuhan Penyeberangan untuk kegiatan usaha penjualan cinderamata dan makanan khas daerah.",
  },
  {
    article: "Pasal 2",
    title: "Jangka Waktu dan Perpanjangan",
    summary: "Perjanjian berlaku selama 1 (satu) tahun terhitung sejak tanggal 01 Januari 2026 sampai dengan 31 Desember 2026. Permohonan perpanjangan sewa wajib diajukan paling lambat 30 (tiga puluh) hari kalender sebelum masa berlaku berakhir.",
  },
  {
    article: "Pasal 3",
    title: "Besaran Retribusi dan Tata Cara Pembayaran (Perbup 25/2024)",
    summary: "Besaran retribusi pemanfaatan tempat usaha ditetapkan sebesar Rp 18.000.000,- per tahun berdasarkan Surat Ketetapan Retribusi Daerah (SKRD). Penyetoran dilakukan ke Rekening Kas Umum Daerah (RKUD) Mimika pada PT Bank Papua selambat-lambatnya 30 hari kalender sejak SKRD diterbitkan.",
  },
  {
    article: "Pasal 4",
    title: "Konsumsi Utilitas Listrik dan Air Bersih",
    summary: "PIHAK KEDUA wajib membayar biaya konsumsi listrik dan air bersih yang dihitung berdasarkan pencatatan meteran riil bulanan yang ditetapkan bersama dengan petugas UPTD Pelabuhan.",
  },
  {
    article: "Pasal 5",
    title: "Larangan Pemindahtanganan (Sublease Prohibition)",
    summary: "PIHAK KEDUA dilarang keras mengalihkan, menyewakan kembali, atau memindahtangankan hak pemanfaatan kios kepada pihak ketiga tanpa persetujuan tertulis dari Bupati Mimika melalui Kepala Dinas Perhubungan.",
  },
  {
    article: "Pasal 6",
    title: "Sanksi Keterlambatan dan Pemutusan Perjanjian",
    summary: "Keterlambatan pembayaran retribusi dikenakan sanksi bunga administratif sebesar 1% (satu persen) per bulan sesuai Pasal 21 ayat (8) Perbup Mimika 25/2024. Apabila tunggakan melebihi 3 bulan setelah STRD diterbitkan, UPTD berhak menyegel dan membatalkan sewa.",
  },
];

export default function TenantKontrakPage() {
  const [activeTab, setActiveTab] = useState<"active" | "renewal" | "archive">("active");
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);
  const [renewalMonths, setRenewalMonths] = useState<number>(12);
  const [renewalNotes, setRenewalNotes] = useState<string>(
    "Kami bermaksud memperpanjang sewa kios Blok A-04 untuk periode tahun 2027 dengan komoditas usaha yang sama."
  );
  const [agreeTerms, setAgreeTerms] = useState<boolean>(true);
  const [renewalSubmitted, setRenewalSubmitted] = useState<boolean>(false);

  // Format IDR
  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleRenewalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRenewalSubmitted(true);
  };

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* 1. TOP BANNER & CONTRACT STATUS SUMMARY                                   */}
      {/* ========================================================================= */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#0B241E] text-[#D97706] flex items-center justify-center font-bold text-lg shadow-xs shrink-0">
            <FileCheck2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-extrabold text-[#0B241E]">
                Buku Perjanjian Kerja Sama (PKS) & Kontrak Sewa Digital
              </h2>
              <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                1 Kontrak Aktif Sah
              </span>
            </div>
            <p className="text-xs text-[#64748B] mt-0.5 max-w-2xl">
              Payung hukum pemanfaatan Barang Milik Daerah (BMD) di kawasan pelabuhan sesuai <strong>PP No. 35/2023</strong> dan <strong>Perbup Mimika No. 25/2024</strong>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("renewal")}
            className="px-4 py-2.5 bg-[#D97706] hover:bg-[#B45309] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Ajukan Perpanjangan PKS</span>
          </button>
          <button
            type="button"
            onClick={() => setIsPrintModalOpen(true)}
            className="px-4 py-2.5 bg-[#0B241E] hover:bg-[#143E33] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-[#D97706]" />
            <span>Cetak Naskah PKS</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. NAVIGATION TABS                                                        */}
      {/* ========================================================================= */}
      <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("active")}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "active"
              ? "bg-[#0B241E] text-white shadow-xs"
              : "text-[#64748B] hover:text-[#0B241E] hover:bg-white"
          }`}
        >
          <FileText className="w-4 h-4 text-[#D97706]" />
          <span>1. Dokumen Kontrak PKS Aktif (Tahun 2026)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("renewal")}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "renewal"
              ? "bg-[#0B241E] text-white shadow-xs"
              : "text-[#64748B] hover:text-[#0B241E] hover:bg-white"
          }`}
        >
          <RotateCcw className="w-4 h-4 text-[#D97706]" />
          <span>2. Meja Perpanjangan Sewa (Tahun 2027)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("archive")}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "archive"
              ? "bg-[#0B241E] text-white shadow-xs"
              : "text-[#64748B] hover:text-[#0B241E] hover:bg-white"
          }`}
        >
          <Clock className="w-4 h-4 text-[#D97706]" />
          <span>3. Arsip Kontrak Lampau ({ARCHIVED_CONTRACTS.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: DOKUMEN KONTRAK PKS AKTIF & KLAUSUL HUKUM                          */}
      {/* ========================================================================= */}
      {activeTab === "active" && (
        <div className="space-y-6">
          {/* Main Contract Card */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#F1F5F9] gap-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#64748B] uppercase">
                  Nomor Kontrak Perjanjian Kerja Sama:
                </span>
                <h3 className="text-base font-extrabold text-[#0B241E] font-mono mt-0.5">
                  {ACTIVE_CONTRACT.contractNumber}
                </h3>
                <p className="text-[11px] text-[#64748B] font-mono">
                  Register Bapenda: {ACTIVE_CONTRACT.registrationNumber}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold font-mono px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                  PKS Sah s.d. 31 Des 2026
                </span>
                <span className="text-xs font-bold font-mono px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                  Sisa {ACTIVE_CONTRACT.daysRemaining} Hari
                </span>
              </div>
            </div>

            {/* Contract Two Sides */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              {/* Pihak I & II */}
              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3">
                <h4 className="font-bold text-[#0B241E] uppercase text-[11px] pb-1 border-b border-[#E2E8F0] flex items-center justify-between">
                  <span>Pihak yang Mengikat Perjanjian</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                </h4>
                <div className="space-y-1">
                  <span className="text-[#64748B] font-bold">PIHAK PERTAMA (Pemberi Hak Sewa):</span>
                  <p className="font-bold text-[#0B241E]">{ACTIVE_CONTRACT.officialFirstParty}</p>
                  <p className="text-[10px] text-[#64748B] font-mono">NIP: {ACTIVE_CONTRACT.officialFirstPartyNip}</p>
                  <p className="text-[11px] text-[#64748B]">Instansi: UPTD Pelabuhan Penyeberangan Dinas Perhubungan</p>
                </div>
                <div className="space-y-1 pt-2.5 border-t border-[#E2E8F0]">
                  <span className="text-[#64748B] font-bold">PIHAK KEDUA (Penyewa / Wajib Retribusi):</span>
                  <p className="font-bold text-[#0B241E]">{ACTIVE_CONTRACT.tenantName} ({ACTIVE_CONTRACT.tenantCompany})</p>
                  <p className="text-[10px] text-[#64748B] font-mono">
                    NPWPD: {ACTIVE_CONTRACT.npwpd} • NIB: {ACTIVE_CONTRACT.nib}
                  </p>
                  <p className="text-[11px] text-[#64748B]">Bidang Usaha: Retail Souvenir & Kerajinan Khas Mimika</p>
                </div>
              </div>

              {/* Objek Sewa & Ketentuan Retribusi */}
              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3">
                <h4 className="font-bold text-[#0B241E] uppercase text-[11px] pb-1 border-b border-[#E2E8F0] flex items-center justify-between">
                  <span>Spesifikasi Objek & Ketetapan Retribusi</span>
                  <Store className="w-4 h-4 text-[#D97706]" />
                </h4>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Unit Objek:</span>
                  <strong className="text-[#0B241E]">{ACTIVE_CONTRACT.unitName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Zonasi Lokasi:</span>
                  <span className="text-[#0B241E]">{ACTIVE_CONTRACT.zoneName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Luas Area:</span>
                  <span className="font-mono font-bold text-[#0B241E]">3.0 m x 4.0 m (12 m²)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Masa Sewa:</span>
                  <span className="font-mono text-[#0B241E]">{ACTIVE_CONTRACT.periodStart} s.d. {ACTIVE_CONTRACT.periodEnd}</span>
                </div>
                <div className="flex justify-between border-t border-[#E2E8F0] pt-2">
                  <span className="text-[#64748B]">Ketetapan Retribusi Sewa:</span>
                  <strong className="font-mono text-emerald-800 text-sm">{formatRupiah(ACTIVE_CONTRACT.annualRentRate)} / Tahun</strong>
                </div>
              </div>
            </div>

            {/* Klausul Resmi Perjanjian */}
            <div className="space-y-3 pt-2 border-t border-[#F1F5F9]">
              <h4 className="text-xs font-extrabold text-[#0B241E] uppercase tracking-wider flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-[#D97706]" />
                <span>Klausul Penting Perjanjian Pemanfaatan BMD (Perbup Mimika 25/2024)</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {CONTRACT_CLAUSES.map((clause, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
                    <p className="font-extrabold text-[#0B241E] text-[11px]">
                      <span className="text-[#D97706] font-mono mr-1.5">{clause.article}:</span>
                      {clause.title}
                    </p>
                    <p className="text-[11px] text-[#475569] leading-relaxed">
                      {clause.summary}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Action */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-[#F1F5F9]">
              <span className="text-xs text-[#64748B] flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-700" />
                <span>Naskah PKS telah ditandatangani secara digital dengan sertifikat elektronik Pemkab Mimika.</span>
              </span>

              <button
                type="button"
                onClick={() => setIsPrintModalOpen(true)}
                className="px-4 py-2 bg-[#0B241E] hover:bg-[#143E33] text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs transition-colors shrink-0"
              >
                <Eye className="w-4 h-4 text-[#D97706]" />
                <span>Lihat Dokumen Formal Lengkap</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: MEJA PENGAJUAN PERPANJANGAN KONTRAK PKS DARING                     */}
      {/* ========================================================================= */}
      {activeTab === "renewal" && (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs space-y-6">
          <div className="pb-3 border-b border-[#F1F5F9]">
            <div className="flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-[#D97706]" />
              <h3 className="text-sm font-extrabold text-[#0B241E]">
                Pengajuan Perpanjangan Kontrak PKS Sewa Aset
              </h3>
            </div>
            <p className="text-xs text-[#64748B] mt-1">
              Sesuai <strong>Pasal 2 Perjanjian Kerja Sama</strong>: permohonan perpanjangan masa pemanfaatan kios diajukan sebelum jatuh tempo untuk diteruskan kepada Kepala Dinas Perhubungan.
            </p>
          </div>

          {renewalSubmitted ? (
            <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3 max-w-lg mx-auto">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-extrabold text-[#0B241E]">
                Permohonan Perpanjangan PKS Berhasil Diajukan!
              </h4>
              <p className="text-xs text-[#475569] leading-relaxed">
                Nomor Tiket Perpanjangan: <strong className="font-mono text-[#0B241E]">RNW-PKS-2027-0012</strong>.
                Tim UPTD Pelabuhan akan melakukan verifikasi kepatuhan pembayaran retribusi tahun berjalan sebelum penerbitan addendum/kontrak baru.
              </p>
              <button
                type="button"
                onClick={() => setRenewalSubmitted(false)}
                className="px-4 py-2 bg-[#0B241E] text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Kembali ke Ringkasan Kontrak
              </button>
            </div>
          ) : (
            <form onSubmit={handleRenewalSubmit} className="space-y-5 max-w-2xl">
              {/* Unit Info Box */}
              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Objek yang Diperpanjang:</span>
                  <strong className="text-[#0B241E]">{ACTIVE_CONTRACT.unitName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Kontrak Induk:</span>
                  <span className="font-mono text-[#0B241E]">{ACTIVE_CONTRACT.contractNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Sisa Masa Berlaku Saat Ini:</span>
                  <strong className="text-amber-700">{ACTIVE_CONTRACT.daysRemaining} Hari Lagi (s.d. 31 Des 2026)</strong>
                </div>
              </div>

              {/* Pilihan Durasi Perpanjangan */}
              <div>
                <label className="text-xs font-bold text-[#0B241E] block mb-2">
                  Pilih Jangka Waktu Perpanjangan Baru:
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "1 Tahun (2027)", months: 12 },
                    { label: "2 Tahun (2027-2028)", months: 24 },
                    { label: "3 Tahun (2027-2029)", months: 36 },
                  ].map((dur) => (
                    <button
                      key={dur.months}
                      type="button"
                      onClick={() => setRenewalMonths(dur.months)}
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                        renewalMonths === dur.months
                          ? "bg-[#0B241E] text-white border-[#0B241E] shadow-sm font-extrabold"
                          : "bg-[#F8FAFC] text-[#475569] border-[#E2E8F0] hover:bg-[#F1F5F9] font-bold"
                      }`}
                    >
                      <p className="text-xs">{dur.label}</p>
                      <p className={`text-[10px] mt-0.5 ${renewalMonths === dur.months ? "text-[#D97706]" : "text-[#64748B]"}`}>
                        {dur.months} Bulan
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Estimasi Tarif Periode Perpanjangan */}
              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-emerald-900 uppercase">
                    Estimasi Pokok Retribusi Perpanjangan:
                  </span>
                  <p className="text-base font-extrabold text-emerald-800 font-mono mt-0.5">
                    {formatRupiah((ACTIVE_CONTRACT.annualRentRate / 12) * renewalMonths)}
                  </p>
                  <p className="text-[10px] text-emerald-700">
                    Sesuai tarif dasar retribusi sewa kios Rp 125.000 / m² / bulan (Perbup 25/2024)
                  </p>
                </div>
                <span className="font-mono text-xs font-bold bg-white text-emerald-800 px-3 py-1 rounded-lg border border-emerald-300">
                  {renewalMonths} Bulan
                </span>
              </div>

              {/* Catatan / Alasan */}
              <div>
                <label className="text-xs font-bold text-[#0B241E] block mb-1">
                  Catatan atau Keterangan Tambahan:
                </label>
                <textarea
                  value={renewalNotes}
                  onChange={(e) => setRenewalNotes(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 text-xs bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg text-[#0B241E] focus:outline-none focus:border-[#0B241E]"
                />
              </div>

              {/* Checkbox Persetujuan */}
              <div className="flex items-start gap-2.5 pt-1">
                <input
                  type="checkbox"
                  id="agreeTerms"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 cursor-pointer"
                />
                <label htmlFor="agreeTerms" className="text-xs text-[#475569] cursor-pointer">
                  Saya menyatakan bahwa seluruh kewajiban retribusi sewa kios dan utilitas tahun 2026 telah diselesaikan, dan bersedia mentaati seluruh ketentuan pemanfaatan BMD pelabuhan yang berlaku.
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={!agreeTerms}
                className="w-full py-3 bg-[#0B241E] hover:bg-[#143E33] disabled:bg-[#CBD5E1] text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
              >
                <RotateCcw className="w-4 h-4 text-[#D97706]" />
                <span>Kirim Permohonan Perpanjangan Sewa ke UPTD</span>
              </button>
            </form>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: ARSIP KONTRAK SEWA LAMPAU                                          */}
      {/* ========================================================================= */}
      {activeTab === "archive" && (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-xs space-y-4">
          <div className="p-4 border-b border-[#E2E8F0] bg-[#FAFCFB] flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-[#0B241E]">
                Riwayat Kontrak PKS Sewa Periode Sebelumnya
              </h3>
              <p className="text-[11px] text-[#64748B]">
                Arsip naskah perjanjian kerja sama dan bukti pelunasan retribusi tahun-tahun lampau
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-[#0B241E] bg-[#F1F5F9] px-2.5 py-1 rounded-lg border border-[#CBD5E1]">
              {ARCHIVED_CONTRACTS.length} Arsip
            </span>
          </div>

          <div className="divide-y divide-[#E2E8F0]">
            {ARCHIVED_CONTRACTS.map((arc, idx) => (
              <div key={idx} className="p-4 hover:bg-[#F8FAFC]/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#0B241E]">{arc.contractNumber}</span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {arc.status}
                    </span>
                  </div>
                  <p className="font-bold text-[#0B241E]">{arc.unitName}</p>
                  <p className="text-[#64748B] text-[11px]">{arc.period}</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] text-[#64748B] uppercase">Nilai Kontrak</span>
                    <p className="font-mono font-bold text-emerald-800 text-sm">
                      {formatRupiah(arc.annualRentRate)}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => alert(`Mengunduh salinan arsip ${arc.contractNumber}`)}
                    className="p-2 border border-[#CBD5E1] rounded-lg text-[#0B241E] hover:bg-[#F1F5F9] cursor-pointer"
                    title="Unduh Salinan PDF"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL PRATINJAU NASKAH FORMAL PKS (BERSTANDAR PEMERINTAH DAERAH)          */}
      {/* ========================================================================= */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-[#CBD5E1] overflow-hidden my-8">
            {/* Modal Header */}
            <div className="bg-[#0B241E] text-white p-4 px-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-[#D97706]" />
                <div>
                  <h3 className="font-bold text-sm">
                    Naskah Perjanjian Kerja Sama (PKS) Pemanfaatan BMD
                  </h3>
                  <p className="text-[11px] text-[#85A69B]">
                    Format Resmi Pemerintah Kabupaten Mimika (Perbup No. 25 Tahun 2024)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPrintModalOpen(false)}
                className="text-[#85A69B] hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document Content */}
            <div className="p-8 space-y-6 text-[#0B241E] bg-[#FAFAFA] max-h-[75vh] overflow-y-auto font-sans text-xs leading-relaxed">
              {/* Kop Surat */}
              <div className="text-center border-b-2 border-[#0B241E] pb-4">
                <p className="text-[11px] uppercase font-bold tracking-widest text-[#475569]">
                  PEMERINTAH KABUPATEN MIMIKA • DINAS PERHUBUNGAN
                </p>
                <h4 className="text-base font-extrabold tracking-tight uppercase mt-0.5">
                  UPTD PENGELOLAAN PELABUHAN REGIONAL POMAKO / MERAK
                </h4>
                <p className="text-[10px] text-[#64748B] mt-0.5">
                  Jl. Pelabuhan Pomako, Distrik Mimika Timur, Kabupaten Mimika, Papua Tengah
                </p>
                <div className="mt-3 inline-block px-3 py-1 bg-[#F1F5F9] rounded border border-[#CBD5E1] text-[11px] font-mono font-bold">
                  PERJANJIAN KERJA SAMA NOMOR: {ACTIVE_CONTRACT.contractNumber}
                </div>
              </div>

              {/* Title */}
              <div className="text-center space-y-1">
                <h5 className="font-extrabold uppercase text-xs tracking-wider">
                  TENTANG
                </h5>
                <h5 className="font-extrabold uppercase text-xs tracking-wide max-w-xl mx-auto">
                  PEMANFAATAN TEMPAT USAHA KIOS KOMERSIAL DI LINGKUNGAN PELABUHAN REGIONAL TAHUN ANGGARAN 2026
                </h5>
              </div>

              {/* Opening Statement */}
              <div className="space-y-3 text-justify">
                <p>
                  Pada hari ini, <strong>Kamis</strong> tanggal <strong>01 Januari 2026</strong>, bertempat di Kantor UPTD Pelabuhan, yang bertanda tangan di bawah ini:
                </p>

                <div className="space-y-2 pl-4 border-l-2 border-[#CBD5E1] text-[11px]">
                  <p>
                    <strong>I. {ACTIVE_CONTRACT.officialFirstParty}</strong>, bertindak untuk dan atas nama Pemerintah Kabupaten Mimika, yang selanjutnya disebut sebagai <strong>PIHAK PERTAMA</strong>.
                  </p>
                  <p>
                    <strong>II. {ACTIVE_CONTRACT.tenantName}</strong>, bertindak selaku Pimpinan dari <strong>{ACTIVE_CONTRACT.tenantCompany}</strong>, berkedudukan di Kabupaten Mimika, NPWPD: {ACTIVE_CONTRACT.npwpd}, yang selanjutnya disebut sebagai <strong>PIHAK KEDUA</strong>.
                  </p>
                </div>

                <p>
                  Kedua belah pihak sepakat untuk mengikatkan diri dalam Perjanjian Kerja Sama Sewa Pemanfaatan Barang Milik Daerah (BMD) dengan ketentuan sebagai berikut:
                </p>

                {/* Articles List */}
                <div className="space-y-3 pt-2">
                  {CONTRACT_CLAUSES.map((clause, idx) => (
                    <div key={idx} className="space-y-0.5">
                      <p className="font-bold text-[#0B241E]">
                        {clause.article} : {clause.title}
                      </p>
                      <p className="text-[#475569] text-[11px] pl-3">
                        {clause.summary}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Signatures */}
                <div className="grid grid-cols-2 gap-8 pt-6 text-center text-[11px]">
                  <div className="border border-[#CBD5E1] p-3 rounded-xl bg-white space-y-1">
                    <p className="text-[#64748B] font-bold">PIHAK KEDUA (Penyewa)</p>
                    <div className="h-12 flex items-center justify-center font-serif italic text-emerald-800 font-bold">
                      [Tanda Tangan Elektronik Sah]
                    </div>
                    <p className="font-bold border-t border-[#E2E8F0] pt-1">{ACTIVE_CONTRACT.tenantName}</p>
                    <p className="text-[#94A3B8]">{ACTIVE_CONTRACT.tenantCompany}</p>
                  </div>

                  <div className="border border-[#CBD5E1] p-3 rounded-xl bg-white space-y-1">
                    <p className="text-[#64748B] font-bold">PIHAK PERTAMA (UPTD Pelabuhan)</p>
                    <div className="h-12 flex items-center justify-center font-serif italic text-[#0B241E] font-bold">
                      [Tanda Tangan & Cap Digital UPTD]
                    </div>
                    <p className="font-bold border-t border-[#E2E8F0] pt-1">{ACTIVE_CONTRACT.officialFirstParty.split("(")[0]}</p>
                    <p className="text-[#94A3B8]">NIP. {ACTIVE_CONTRACT.officialFirstPartyNip}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="bg-[#F1F5F9] border-t border-[#E2E8F0] p-4 px-6 flex items-center justify-between">
              <span className="text-xs text-[#64748B] flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-700" />
                <span>Dokumen legal resmi tersimpan di server audit log PORTA.</span>
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-white hover:bg-[#E2E8F0] text-[#0B241E] border border-[#CBD5E1] rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-[#D97706]" />
                  <span>Cetak Dokumen PKS</span>
                </button>
                <button
                  onClick={() => setIsPrintModalOpen(false)}
                  className="px-4 py-2 bg-[#0B241E] hover:bg-[#143E33] text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
