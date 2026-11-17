"use client";

import React, { useState } from "react";
import {
  Sliders,
  Award,
  Anchor,
  TrendingUp,
  Building2,
} from "lucide-react";

export default function DinasEvaluasiPage() {
  // Simulation Calculator State
  const [simVolumeGrowth, setSimVolumeGrowth] = useState<number>(10); // +10%
  const [simTarifIncrease, setSimTarifIncrease] = useState<number>(2000); // +Rp 2.000 pas masuk
  const [simKiosOccupancy, setSimKiosOccupancy] = useState<number>(85); // 85%

  const baseMonthlyRevenue = 148850000;
  const simulatedVolumeGain = baseMonthlyRevenue * 0.42 * (simVolumeGrowth / 100);
  const simulatedTarifGain = 12000 * simTarifIncrease; // 12,000 monthly passengers * increase
  const simulatedKiosGain = (simKiosOccupancy - 70) * 450000; // incremental kiosk revenue
  const totalSimulatedRevenue =
    baseMonthlyRevenue + simulatedVolumeGain + simulatedTarifGain + Math.max(0, simulatedKiosGain);
  const revenueDelta = totalSimulatedRevenue - baseMonthlyRevenue;

  return (
    <div className="space-y-6">
      {/* 1. OVERLAPPING EVALUASI & SIMULASI KPI CARDS (Spesifik: Komparasi & Simulasi) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Top UPTD */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Award className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-full">
              Grade A (96.2)
            </span>
          </div>
          <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mt-3">
            UPTD Kinerja Tertinggi
          </p>
          <p className="text-xl font-extrabold text-[#0B241E] font-mono mt-1">
            UPTD Merak
          </p>
          <p className="text-[11px] text-[#64748B] mt-1.5">
            PAD Rp 78,4 Jt/bln (Utilisasi 92%)
          </p>
        </div>

        {/* Card 2: Rata-rata Utilisasi */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Anchor className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-100/60 px-2 py-0.5 rounded-full">
              +6.2% vs Sem I
            </span>
          </div>
          <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mt-3">
            Rata-rata Utilisasi
          </p>
          <p className="text-xl font-extrabold text-blue-700 font-mono mt-1">
            84.5% Kapasitas
          </p>
          <p className="text-[11px] text-[#64748B] mt-1.5">
            Waktu sandar efisien (42 menit)
          </p>
        </div>

        {/* Card 3: Hasil Simulasi PAD */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-100/60 px-2 py-0.5 rounded-full">
              Skenario Interaktif
            </span>
          </div>
          <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mt-3">
            Potensi Kenaikan PAD
          </p>
          <p className="text-xl font-extrabold text-amber-700 font-mono mt-1">
            +{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(revenueDelta)}
          </p>
          <p className="text-[11px] text-[#64748B] mt-1.5">
            Dari tarif pas & okupansi sewa aset
          </p>
        </div>

        {/* Card 4: Aset Peluang Usaha */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
              <Building2 className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-mono font-bold text-purple-700 bg-purple-100/60 px-2 py-0.5 rounded-full">
              GIS Pelabuhan
            </span>
          </div>
          <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mt-3">
            Peluang Investasi Aset
          </p>
          <p className="text-xl font-extrabold text-[#0B241E] font-mono mt-1">
            28 Unit Aset
          </p>
          <p className="text-[11px] text-purple-700 font-semibold mt-1.5">
            4 lahan & 2 gudang siap dikerjasamakan
          </p>
        </div>
      </div>

      {/* 2. Evaluasi Komparasi Antar-UPTD */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#F1F5F9]">
          <div>
            <h2 className="text-base font-extrabold text-[#0B241E]">
              Perbandingan Kinerja Antar-Pelabuhan (Benchmarking UPTD)
            </h2>
            <p className="text-xs text-[#64748B] mt-0.5">
              Evaluasi efisiensi pendapatan, utilisasi dermaga, dan indeks kepuasan publik lintas 4 UPTD.
            </p>
          </div>
          <span className="text-xs font-mono bg-blue-50 text-blue-800 font-bold px-3 py-1 rounded-md">
            Evaluasi Semester II
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-5">
          {/* UPTD 1: Merak */}
          <div className="p-4 bg-[#F8FAFC] border border-emerald-200 rounded-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-bl">
              Kinerja Tertinggi
            </div>
            <p className="text-sm font-extrabold text-[#0B241E]">UPTD Merak</p>
            <p className="text-xs text-[#64748B]">Dermaga 1 s/d 4</p>
            <div className="mt-3 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-[#64748B]">Penerimaan:</span>
                <strong className="font-mono text-[#0B241E]">Rp 78,4 Jt/bln</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Utilisasi:</span>
                <strong className="text-emerald-700">92% (Tinggi)</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Mutu Layanan:</span>
                <strong className="text-[#0B241E]">Grade A (96.2)</strong>
              </div>
            </div>
          </div>

          {/* UPTD 2: Bakauheni */}
          <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl">
            <p className="text-sm font-extrabold text-[#0B241E]">UPTD Bakauheni</p>
            <p className="text-xs text-[#64748B]">Dermaga Reguler & Eks.</p>
            <div className="mt-3 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-[#64748B]">Penerimaan:</span>
                <strong className="font-mono text-[#0B241E]">Rp 51,2 Jt/bln</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Utilisasi:</span>
                <strong className="text-emerald-700">84% (Stabil)</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Mutu Layanan:</span>
                <strong className="text-[#0B241E]">Grade A- (91.8)</strong>
              </div>
            </div>
          </div>

          {/* UPTD 3: Ketapang */}
          <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl">
            <p className="text-sm font-extrabold text-[#0B241E]">UPTD Ketapang</p>
            <p className="text-xs text-[#64748B]">Dermaga LCM & Ponton</p>
            <div className="mt-3 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-[#64748B]">Penerimaan:</span>
                <strong className="font-mono text-[#0B241E]">Rp 34,6 Jt/bln</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Utilisasi:</span>
                <strong className="text-amber-700">78% (Menengah)</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Mutu Layanan:</span>
                <strong className="text-[#0B241E]">Grade B+ (88.4)</strong>
              </div>
            </div>
          </div>

          {/* UPTD 4: Gilimanuk */}
          <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl">
            <p className="text-sm font-extrabold text-[#0B241E]">UPTD Gilimanuk</p>
            <p className="text-xs text-[#64748B]">Dermaga Penyeberangan</p>
            <div className="mt-3 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-[#64748B]">Penerimaan:</span>
                <strong className="font-mono text-[#0B241E]">Rp 28,1 Jt/bln</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Utilisasi:</span>
                <strong className="text-amber-700">72% (Waspada)</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Mutu Layanan:</span>
                <strong className="text-[#0B241E]">Grade B (84.1)</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Interactive Calculator: Simulasi Proyeksi Potensi Pendapatan */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#F1F5F9]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#D97706]/10 text-[#D97706] flex items-center justify-center">
              <Sliders className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#0B241E]">
                Kalkulator Simulasi Kebijakan & Proyeksi Skenario PAD
              </h2>
              <p className="text-xs text-[#64748B]">
                Uji coba dampak penyesuaian tarif, pertumbuhan arus mudik/libur, dan optimalisasi sewa kios pelabuhan.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setSimVolumeGrowth(10);
              setSimTarifIncrease(2000);
              setSimKiosOccupancy(85);
            }}
            className="text-xs text-[#D97706] hover:underline cursor-pointer font-bold"
          >
            Reset Parameter
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Slider Controls (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            {/* Control 1: Volume Growth */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <label className="font-bold text-[#0B241E]">
                  1. Proyeksi Pertumbuhan Arus Penyeberangan (Nataru / Libur)
                </label>
                <span className="font-mono font-bold text-[#D97706]">+{simVolumeGrowth}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="40"
                step="5"
                value={simVolumeGrowth}
                onChange={(e) => setSimVolumeGrowth(Number(e.target.value))}
                className="w-full accent-[#0B241E] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#94A3B8] font-mono">
                <span>Normal (0%)</span>
                <span>+20% (Sedang)</span>
                <span>+40% (Peak Season)</span>
              </div>
            </div>

            {/* Control 2: Penyesuaian Tarif Pas Masuk */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <label className="font-bold text-[#0B241E]">
                  2. Rencana Penyesuaian Tarif Pas Masuk Daerah (Perda)
                </label>
                <span className="font-mono font-bold text-[#D97706]">
                  +Rp {simTarifIncrease.toLocaleString("id-ID")} / Orang
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="5000"
                step="500"
                value={simTarifIncrease}
                onChange={(e) => setSimTarifIncrease(Number(e.target.value))}
                className="w-full accent-[#0B241E] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#94A3B8] font-mono">
                <span>Rp 0 (Tetap)</span>
                <span>+Rp 2.500</span>
                <span>+Rp 5.000 (Maksimal)</span>
              </div>
            </div>

            {/* Control 3: Okupansi Kios & Aset */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <label className="font-bold text-[#0B241E]">
                  3. Target Okupansi Kios Pujasera & Gudang Logistik
                </label>
                <span className="font-mono font-bold text-[#D97706]">{simKiosOccupancy}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="100"
                step="5"
                value={simKiosOccupancy}
                onChange={(e) => setSimKiosOccupancy(Number(e.target.value))}
                className="w-full accent-[#0B241E] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#94A3B8] font-mono">
                <span>50% (Rendah)</span>
                <span>75% (Eksisting)</span>
                <span>100% (Penuh)</span>
              </div>
            </div>
          </div>

          {/* Real-time Calculation Result Box (5 cols) */}
          <div className="lg:col-span-5 bg-[#0B241E] text-white rounded-xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs pb-3 border-b border-[#184438]">
                <span className="text-[#85A69B]">Hasil Proyeksi Skenario</span>
                <span className="font-mono text-[#D97706] font-bold">PP 35/2023 Sim</span>
              </div>

              <div className="mt-4 space-y-3">
                <div>
                  <span className="text-[11px] text-[#BED2CA]">Estimasi Penerimaan Bulanan Baru</span>
                  <p className="text-2xl font-extrabold font-mono text-emerald-400 mt-0.5">
                    Rp {(totalSimulatedRevenue / 1000000).toFixed(2)} Juta
                  </p>
                </div>

                <div className="p-3 bg-[#12362C] border border-[#1C4D3F] rounded-lg space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#85A69B]">Kenaikan Pendapatan:</span>
                    <span className="font-mono font-bold text-emerald-400">
                      +Rp {(revenueDelta / 1000000).toFixed(2)} Jt / bln
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-[#85A69B]">Persentase Lonjakan:</span>
                    <span className="font-mono font-bold text-[#D97706]">
                      +{((revenueDelta / baseMonthlyRevenue) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>

                <p className="text-[10px] text-[#85A69B] leading-relaxed pt-1">
                  *Proyeksi tahunan berpotensi menyentuh <strong>Rp {((totalSimulatedRevenue * 12) / 1000000000).toFixed(2)} Miliar</strong>, memperkuat ruang fiskal APBD untuk revitalisasi fasilitas sandar.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => alert("Menyimpan simulasi skenario ke Dokumen Rencana Kerja Anggaran (RKA) Dinas.")}
              className="w-full mt-4 py-2 px-3 bg-[#D97706] hover:bg-[#B45309] text-[#0B241E] font-bold text-xs rounded-lg transition-colors cursor-pointer"
            >
              Simpan Rekomendasi Kebijakan
            </button>
          </div>
        </div>
      </div>

      {/* 3. Peta Peluang Usaha Pelabuhan (GIS Asset Explorer) */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
          <div>
            <h3 className="text-sm font-extrabold text-[#0B241E]">
              Peta Spasial Peluang Usaha & Investasi Aset Pelabuhan (GIS)
            </h3>
            <p className="text-xs text-[#64748B] mt-0.5">
              Visualisasi lahan kosong, ruang komersial, dan fasilitas dermaga yang siap ditawarkan kepada investor/mitra.
            </p>
          </div>
          <span className="text-xs font-mono text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md font-bold">
            3 Lahan Siap Tender
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Asset 1 */}
          <div className="p-4 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl hover:border-[#0B241E] transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                SIAP SEWA
              </span>
              <span className="text-[11px] text-[#64748B] font-mono">Zona Komersial A</span>
            </div>
            <p className="font-extrabold text-[#0B241E] text-sm mt-2">
              Gudang Logistik & Cold Storage
            </p>
            <p className="text-[#64748B] text-[11px] mt-1">
              Luas: <strong>450 m²</strong> • Depan Dermaga 1 Merak. Cocok untuk rantai pasok ikan & sembako antar pulau.
            </p>
            <div className="mt-3 pt-2 border-t border-[#E2E8F0] flex justify-between items-center">
              <span className="font-mono font-bold text-[#0B241E]">Rp 45 Jt / Thn</span>
              <button
                type="button"
                onClick={() => alert("Membuka Dokumen Kerangka Investasi Gudang Logistik.")}
                className="text-[11px] text-[#D97706] font-bold hover:underline cursor-pointer"
              >
                Detail Aset →
              </button>
            </div>
          </div>

          {/* Asset 2 */}
          <div className="p-4 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl hover:border-[#0B241E] transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                SIAP SEWA
              </span>
              <span className="text-[11px] text-[#64748B] font-mono">Ruang Tunggu Eksekutif</span>
            </div>
            <p className="font-extrabold text-[#0B241E] text-sm mt-2">
              Kios F&B / Franchise Tenant
            </p>
            <p className="text-[#64748B] text-[11px] mt-1">
              Luas: <strong>60 m²</strong> (2 Unit) • Foot-traffic 4.500 penumpang/hari. Listrik 3-fasa siap pakai.
            </p>
            <div className="mt-3 pt-2 border-t border-[#E2E8F0] flex justify-between items-center">
              <span className="font-mono font-bold text-[#0B241E]">Rp 24 Jt / Thn</span>
              <button
                type="button"
                onClick={() => alert("Membuka Dokumen Kerangka Investasi Kios F&B.")}
                className="text-[11px] text-[#D97706] font-bold hover:underline cursor-pointer"
              >
                Detail Aset →
              </button>
            </div>
          </div>

          {/* Asset 3 */}
          <div className="p-4 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl hover:border-[#0B241E] transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold font-mono bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                PROSES TENDER
              </span>
              <span className="text-[11px] text-[#64748B] font-mono">Bunkering Dermaga 3</span>
            </div>
            <p className="font-extrabold text-[#0B241E] text-sm mt-2">
              Instalasi Pengisian Air Tawar Kapal
            </p>
            <p className="text-[#64748B] text-[11px] mt-1">
              Kapasitas: <strong>50 Ton/Hari</strong> • Sistem perpipaan terotomatisasi e-Meter host-to-host PORTA.
            </p>
            <div className="mt-3 pt-2 border-t border-[#E2E8F0] flex justify-between items-center">
              <span className="font-mono font-bold text-[#0B241E]">Kerja Sama KSP</span>
              <button
                type="button"
                onClick={() => alert("Membuka Dokumen Kerangka Kerjasama Bunkering.")}
                className="text-[11px] text-[#D97706] font-bold hover:underline cursor-pointer"
              >
                Detail Aset →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
