"use client";

import React from "react";
import Link from "next/link";
import { Calendar, ChevronRight, ShieldCheck } from "lucide-react";
import { formatRupiah } from "@/lib/kapal-billing";

interface FleetAlertsSummaryProps {
  isVerifiedOperator: boolean;
  pendingVisitsCount: number;
  scheduledVisitsCount: number;
  unpaidInvoicesCount: number;
  paidInvoicesCount: number;
  totalUnpaidIdr: number;
}

export function FleetAlertsSummary({
  isVerifiedOperator,
  pendingVisitsCount,
  scheduledVisitsCount,
  unpaidInvoicesCount,
  paidInvoicesCount,
  totalUnpaidIdr,
}: FleetAlertsSummaryProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-extrabold text-[#0B241E] uppercase tracking-wider flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#D97706]" />
            <span>Status Alokasi &amp; Permohonan Sandar (PPK)</span>
          </h4>
          <span
            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
              pendingVisitsCount > 0
                ? "bg-amber-100 text-amber-900 border border-amber-200"
                : scheduledVisitsCount > 0
                ? "bg-blue-100 text-blue-800"
                : "bg-slate-100 text-slate-700"
            }`}
          >
            {!isVerifiedOperator
              ? "Menunggu Verifikasi Petugas"
              : pendingVisitsCount > 0
              ? `${pendingVisitsCount} Verifikasi Petugas`
              : scheduledVisitsCount > 0
              ? `${scheduledVisitsCount} Siap Tambat`
              : "Operasional Normal"}
          </span>
        </div>
        <p className="text-xs text-[#64748B] leading-relaxed">
          {!isVerifiedOperator
            ? "Fitur pengajuan jadwal sandar dermaga akan terbuka otomatis setelah akun badan usaha Anda diverifikasi oleh Petugas Registrasi & Kontrak."
            : pendingVisitsCount > 0
            ? `Terdapat ${pendingVisitsCount} permohonan sandar baru sedang menunggu peninjauan dan penetapan dermaga oleh petugas pelabuhan.`
            : scheduledVisitsCount > 0
            ? `Terdapat ${scheduledVisitsCount} jadwal sandar kapal telah terverifikasi/disetujui dan siap memasuki tambatan dermaga.`
            : "Seluruh permohonan sandar kapal telah terproses. Permohonan baru wajib diajukan minimal 4 jam sebelum estimasi kedatangan (ETA)."}
        </p>
        <div className="pt-2">
          <Link
            href={isVerifiedOperator ? "/kapal/permohonan" : "/kapal/profil"}
            className="text-xs font-bold text-[#0B241E] hover:text-[#D97706] flex items-center gap-1 group"
          >
            <span>
              {isVerifiedOperator
                ? "Buka Formulir Pengajuan Jadwal"
                : "Lengkapi Dokumen Legalitas di Profil"}
            </span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>

      <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-extrabold text-[#0B241E] uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Kewajiban Retribusi Daerah (PP 35/2023)</span>
          </h4>
          <span
            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
              unpaidInvoicesCount > 0
                ? "bg-red-100 text-red-900 border border-red-200"
                : "bg-emerald-100 text-emerald-800"
            }`}
          >
            {unpaidInvoicesCount > 0 ? "Menunggu Setoran" : "Kepatuhan Penuh"}
          </span>
        </div>
        <p className="text-xs text-[#64748B] leading-relaxed">
          {unpaidInvoicesCount > 0
            ? `Terdapat ${unpaidInvoicesCount} tagihan e-SKRD aktif senilai ${formatRupiah(
                totalUnpaidIdr
              )} yang menunggu pelunasan ke Kas Daerah (RKUD) Kab. Mimika via Virtual Account / QRIS.`
            : `Seluruh ${paidInvoicesCount} tagihan retribusi e-SKRD telah lunas terbayar dan tersinkronisasi ke Kas Daerah (RKUD) Kabupaten Mimika.`}
        </p>
        <div className="pt-2">
          <Link
            href={isVerifiedOperator ? "/kapal/penagihan" : "/kapal/profil"}
            className="text-xs font-bold text-[#0B241E] hover:text-[#D97706] flex items-center gap-1 group"
          >
            <span>
              {isVerifiedOperator
                ? "Cek Tagihan e-SKRD & Rekening RKUD"
                : "Buka Halaman Profil & Master Kapal"}
            </span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
