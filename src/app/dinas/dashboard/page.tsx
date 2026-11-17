"use client";

import React from "react";
import Link from "next/link";
import {
  Ship,
  Ticket,
  Building2,
  Layers,
  ChevronRight,
  AlertTriangle,
  ShieldCheck,
  TrendingUp,
  DollarSign,
  Receipt,
  AlertCircle,
} from "lucide-react";

export default function DinasDashboardPage() {
  return (
    <div className="space-y-6">
      {/* 1. OVERLAPPING EXECUTIVE KPI CARDS (Pusat Ringkasan Eksekutif) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* KPI 1: Penerimaan Periode Berjalan */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <DollarSign className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-full flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" />
              +18.4%
            </span>
          </div>
          <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mt-3">
            Penerimaan PAD
          </p>
          <p className="text-xl font-extrabold text-[#0B241E] font-mono mt-1">
            Rp 148,85 Jt
          </p>
          <p className="text-[11px] text-[#64748B] mt-1.5 flex items-center gap-1">
            <span>Target APBD:</span>
            <strong className="text-emerald-700">88.2% Tercapai</strong>
          </p>
        </div>

        {/* KPI 2: Tagihan Belum Dibayar / Piutang */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Receipt className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-100/60 px-2 py-0.5 rounded-full flex items-center gap-0.5">
              <AlertTriangle className="w-3 h-3" />
              3 Tagihan
            </span>
          </div>
          <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mt-3">
            Piutang Retribusi
          </p>
          <p className="text-xl font-extrabold text-[#0B241E] font-mono mt-1">
            Rp 14,32 Jt
          </p>
          <p className="text-[11px] text-amber-700 font-semibold mt-1.5">
            Jatuh tempo dlm 7 hari
          </p>
        </div>

        {/* KPI 3: Kunjungan Kapal & Utilisasi Dermaga */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Ship className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-100/60 px-2 py-0.5 rounded-full">
              86.4% Kapasitas
            </span>
          </div>
          <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mt-3">
            Kunjungan Kapal
          </p>
          <p className="text-xl font-extrabold text-[#0B241E] font-mono mt-1">
            84 Kapal
          </p>
          <p className="text-[11px] text-[#64748B] mt-1.5">
            Rata-rata sandar: <strong>42 Menit</strong>
          </p>
        </div>

        {/* KPI 4: Kontrak Segera Berakhir */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
              <Building2 className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-mono font-bold text-purple-700 bg-purple-100/60 px-2 py-0.5 rounded-full">
              Sewa Aset
            </span>
          </div>
          <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mt-3">
            Kontrak Aset Kios
          </p>
          <p className="text-xl font-extrabold text-[#0B241E] font-mono mt-1">
            4 Kontrak
          </p>
          <p className="text-[11px] text-purple-700 font-semibold mt-1.5">
            Masa tenggang &lt; 30 hari
          </p>
        </div>

        {/* KPI 5: Pengaduan Belum Selesai */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-mono font-bold text-rose-700 bg-rose-100/60 px-2 py-0.5 rounded-full">
              SLA 94.8%
            </span>
          </div>
          <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mt-3">
            Pengaduan Aktif
          </p>
          <p className="text-xl font-extrabold text-[#0B241E] font-mono mt-1">
            2 Laporan
          </p>
          <p className="text-[11px] text-[#64748B] mt-1.5">
            Rata-rata respons: <strong>1.8 Jam</strong>
          </p>
        </div>
      </div>

      {/* 2. Top Analytical Chart + Breakdown Deck */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 1. Large Analytics Visualizer (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#F1F5F9]">
              <div>
                <h2 className="text-base font-extrabold text-[#0B241E]">
                  Tren Penerimaan Daerah & Arus Penyeberangan
                </h2>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Komparasi realisasi penerimaan retribusi (PP 35/2023) selama 6 bulan terakhir.
                </p>
              </div>

              {/* Legend Pills */}
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-[#0B241E] font-medium">
                  <span className="w-3 h-3 rounded bg-[#0B241E]" />
                  <span>Penerimaan (Jt Rp)</span>
                </span>
                <span className="flex items-center gap-1.5 text-[#D97706] font-medium">
                  <span className="w-3 h-3 rounded bg-[#D97706]" />
                  <span>Penumpang (Ribu Pax)</span>
                </span>
              </div>
            </div>

            {/* CSS/SVG Bar Chart Visualizer */}
            <div className="mt-6 pt-2">
              <div className="h-64 flex items-end justify-between gap-2 sm:gap-6 px-2 border-b border-[#CBD5E1] pb-2">
                {/* Month 1: Jun */}
                <div className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="w-full flex items-end justify-center gap-1 h-48">
                    <div className="w-1/2 bg-[#0B241E] rounded-t hover:bg-[#164336] transition-all h-[58%]" title="Rp 118 Juta" />
                    <div className="w-1/2 bg-[#D97706] rounded-t hover:bg-[#B45309] transition-all h-[45%]" title="18.2k Pax" />
                  </div>
                  <span className="text-[11px] font-mono text-[#64748B]">Jun</span>
                </div>

                {/* Month 2: Jul (Peak Liburan) */}
                <div className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="w-full flex items-end justify-center gap-1 h-48">
                    <div className="w-1/2 bg-[#0B241E] rounded-t hover:bg-[#164336] transition-all h-[82%]" title="Rp 156 Juta" />
                    <div className="w-1/2 bg-[#D97706] rounded-t hover:bg-[#B45309] transition-all h-[76%]" title="28.4k Pax" />
                  </div>
                  <span className="text-[11px] font-mono text-[#64748B]">Jul</span>
                </div>

                {/* Month 3: Agu */}
                <div className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="w-full flex items-end justify-center gap-1 h-48">
                    <div className="w-1/2 bg-[#0B241E] rounded-t hover:bg-[#164336] transition-all h-[64%]" title="Rp 128 Juta" />
                    <div className="w-1/2 bg-[#D97706] rounded-t hover:bg-[#B45309] transition-all h-[52%]" title="20.1k Pax" />
                  </div>
                  <span className="text-[11px] font-mono text-[#64748B]">Agu</span>
                </div>

                {/* Month 4: Sep */}
                <div className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="w-full flex items-end justify-center gap-1 h-48">
                    <div className="w-1/2 bg-[#0B241E] rounded-t hover:bg-[#164336] transition-all h-[70%]" title="Rp 134 Juta" />
                    <div className="w-1/2 bg-[#D97706] rounded-t hover:bg-[#B45309] transition-all h-[58%]" title="22.5k Pax" />
                  </div>
                  <span className="text-[11px] font-mono text-[#64748B]">Sep</span>
                </div>

                {/* Month 5: Okt */}
                <div className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="w-full flex items-end justify-center gap-1 h-48">
                    <div className="w-1/2 bg-[#0B241E] rounded-t hover:bg-[#164336] transition-all h-[74%]" title="Rp 141 Juta" />
                    <div className="w-1/2 bg-[#D97706] rounded-t hover:bg-[#B45309] transition-all h-[62%]" title="24.8k Pax" />
                  </div>
                  <span className="text-[11px] font-mono text-[#64748B]">Okt</span>
                </div>

                {/* Month 6: Nov (Current) */}
                <div className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="w-full flex items-end justify-center gap-1 h-48">
                    <div className="w-1/2 bg-[#0B241E] rounded-t hover:bg-[#164336] transition-all h-[88%] relative" title="Rp 148.8 Juta">
                      <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-mono font-bold text-white bg-[#0B241E] px-1 rounded">
                        148.8M
                      </span>
                    </div>
                    <div className="w-1/2 bg-[#D97706] rounded-t hover:bg-[#B45309] transition-all h-[70%]" title="27.1k Pax" />
                  </div>
                  <span className="text-[11px] font-mono font-bold text-[#0B241E]">Nov*</span>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Bar Below Chart */}
          <div className="mt-4 pt-3 border-t border-[#F1F5F9] flex flex-wrap items-center justify-between text-xs text-[#64748B]">
            <span>Rata-rata Penerimaan Bulanan: <strong className="text-[#0B241E]">Rp 137,6 Jt</strong></span>
            <span className="text-emerald-700 font-bold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              Proyeksi Akhir Tahun: Rp 1,74 Miliar (Surplus APBD)
            </span>
          </div>
        </div>

        {/* 2. Composition & Breakdown Widget (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-extrabold text-[#0B241E] pb-3 border-b border-[#F1F5F9]">
              Proporsi Objek Retribusi
            </h3>

            <div className="mt-5 space-y-4 text-xs">
              {/* Category 1: Jasa Tambat Kapal */}
              <div className="space-y-1">
                <div className="flex items-center justify-between font-semibold">
                  <span className="text-[#0B241E] flex items-center gap-1.5">
                    <Ship className="w-3.5 h-3.5 text-[#0B241E]" />
                    <span>Jasa Tambat & Labuh Kapal</span>
                  </span>
                  <span className="font-mono text-[#0B241E]">42% (Rp 62.5 Jt)</span>
                </div>
                <div className="w-full bg-[#E2E8F0] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#0B241E] h-full rounded-full" style={{ width: "42%" }} />
                </div>
              </div>

              {/* Category 2: Pas Masuk Penumpang */}
              <div className="space-y-1">
                <div className="flex items-center justify-between font-semibold">
                  <span className="text-[#0B241E] flex items-center gap-1.5">
                    <Ticket className="w-3.5 h-3.5 text-[#D97706]" />
                    <span>Pas Penumpang & Kendaraan</span>
                  </span>
                  <span className="font-mono text-[#0B241E]">36% (Rp 53.6 Jt)</span>
                </div>
                <div className="w-full bg-[#E2E8F0] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#D97706] h-full rounded-full" style={{ width: "36%" }} />
                </div>
              </div>

              {/* Category 3: Pemanfaatan Lahan/Kios */}
              <div className="space-y-1">
                <div className="flex items-center justify-between font-semibold">
                  <span className="text-[#0B241E] flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-purple-700" />
                    <span>Sewa Kios & Lahan Aset</span>
                  </span>
                  <span className="font-mono text-[#0B241E]">14% (Rp 20.8 Jt)</span>
                </div>
                <div className="w-full bg-[#E2E8F0] h-2 rounded-full overflow-hidden">
                  <div className="bg-purple-700 h-full rounded-full" style={{ width: "14%" }} />
                </div>
              </div>

              {/* Category 4: Utilitas */}
              <div className="space-y-1">
                <div className="flex items-center justify-between font-semibold">
                  <span className="text-[#0B241E] flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-blue-700" />
                    <span>Utilitas Air & Listrik Sandar</span>
                  </span>
                  <span className="font-mono text-[#0B241E]">8% (Rp 11.9 Jt)</span>
                </div>
                <div className="w-full bg-[#E2E8F0] h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-700 h-full rounded-full" style={{ width: "8%" }} />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Action Button */}
          <div className="mt-6 pt-4 border-t border-[#F1F5F9]">
            <Link
              href="/dinas/monitoring"
              className="w-full py-2.5 px-4 bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#CBD5E1] rounded-lg text-xs font-bold text-[#0B241E] transition-colors flex items-center justify-between cursor-pointer"
            >
              <span>Lihat Rincian Sumber Penerimaan</span>
              <ChevronRight className="w-4 h-4 text-[#64748B]" />
            </Link>
          </div>
        </div>
      </div>

      {/* Lower Section: Real-time Early Warnings & Recent Operational Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Sistem Peringatan Dini Anomali (Early Warning) */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#D97706]" />
              <h3 className="text-sm font-extrabold text-[#0B241E]">
                Peringatan Dini Anomali Penerimaan
              </h3>
            </div>
            <span className="text-[10px] font-mono bg-amber-50 text-amber-800 font-bold px-2 py-0.5 rounded border border-amber-200">
              Sistem Deteksi Otomatis
            </span>
          </div>

          <div className="divide-y divide-[#F1F5F9] text-xs mt-2">
            <div className="py-3 flex items-start gap-3">
              <div className="w-7 h-7 rounded-md bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                !
              </div>
              <div className="flex-1">
                <p className="font-bold text-[#0B241E]">
                  Kunjungan Sandar Tanpa Penagihan Otomatis
                </p>
                <p className="text-[11px] text-[#64748B] mt-0.5">
                  KMP Dharma Rucitra (UPTD Merak, Dermaga 2) telah sandar 180 menit tanpa invoice tambat terbit.
                </p>
              </div>
              <button
                type="button"
                onClick={() => alert("Mengirimkan notifikasi penagihan e-SKRD ke Syahbandar UPTD Merak.")}
                className="px-2.5 py-1 text-[11px] font-bold text-amber-800 bg-amber-100/60 hover:bg-amber-100 rounded cursor-pointer"
              >
                Tegur UPT
              </button>
            </div>

            <div className="py-3 flex items-start gap-3">
              <div className="w-7 h-7 rounded-md bg-purple-100 text-purple-800 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                ⏳
              </div>
              <div className="flex-1">
                <p className="font-bold text-[#0B241E]">
                  Kontrak Sewa Kios Mendekati Jatuh Tempo
                </p>
                <p className="text-[11px] text-[#64748B] mt-0.5">
                  Kios Kuliner B-04 (Pujasera Bakauheni) berakhir dalam 14 hari. Surat perpanjangan belum dikonfirmasi.
                </p>
              </div>
              <button
                type="button"
                onClick={() => alert("Membuka draf Surat Pemberitahuan Jatuh Tempo Sewa Aset.")}
                className="px-2.5 py-1 text-[11px] font-bold text-purple-800 bg-purple-100/60 hover:bg-purple-100 rounded cursor-pointer"
              >
                Kirim SP
              </button>
            </div>
          </div>
        </div>

        {/* 2. Audit Kepatuhan & Rekonsiliasi Kas Daerah */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-extrabold text-[#0B241E]">
                Sinkronisasi Rekening Kas Umum Daerah (RKUD)
              </h3>
            </div>
            <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Sinkron Real-time
            </span>
          </div>

          <div className="mt-3 space-y-3 text-xs">
            <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg flex items-center justify-between">
              <div>
                <p className="text-[11px] text-[#64748B]">Bank Penampung Resmi Pemda</p>
                <p className="font-bold text-[#0B241E] text-sm mt-0.5">Bank Banten (Rekening 010.298.001-9)</p>
              </div>
              <span className="text-emerald-700 font-bold bg-emerald-100/80 px-2.5 py-1 rounded-md text-[11px]">
                Terverifikasi Bapenda
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 border border-[#E2E8F0] rounded-lg">
                <span className="text-[#64748B] text-[10px] block">Transaksi Masuk Hari Ini</span>
                <strong className="text-sm font-mono text-[#0B241E]">1.240 Transaksi</strong>
              </div>
              <div className="p-2.5 border border-[#E2E8F0] rounded-lg">
                <span className="text-[#64748B] text-[10px] block">Nominal Hari Ini (WIB)</span>
                <strong className="text-sm font-mono text-emerald-700">Rp 18.420.000</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
