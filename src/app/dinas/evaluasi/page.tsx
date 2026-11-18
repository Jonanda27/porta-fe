"use client";

import React, { useEffect, useState } from "react";
import {
  Sliders,
  Award,
  Anchor,
  TrendingUp,
  Building2,
  Calculator,
  RefreshCw,
  Ship,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Layers,
  MapPin,
} from "lucide-react";
import { DinasService } from "@/services/dinas.service";
import { SimulateRevenueResult, GisOpportunitiesResult } from "@/types/dinas.types";

export default function DinasEvaluasiPage() {
  // Simulation Inputs (Struktur Perda No. 4/2023)
  const [estimatedVisits, setEstimatedVisits] = useState<number>(35); // 35 call kapal/bulan
  const [avgGt, setAvgGt] = useState<number>(1200); // 1.200 GT rata-rata
  const [avgEtmal, setAvgEtmal] = useState<number>(2.5); // 2.5 Etmal
  const [tariffTambat, setTariffTambat] = useState<number>(38); // Rp 38 / GT / Etmal
  const [tariffLabuh, setTariffLabuh] = useState<number>(50); // Rp 50 / GT / 15 hari
  const [adjustmentPercent, setAdjustmentPercent] = useState<number>(15); // +15% penyesuaian tarif

  const [simResult, setSimResult] = useState<SimulateRevenueResult | null>(null);
  const [gisData, setGisData] = useState<GisOpportunitiesResult | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Jalankan simulasi awal saat mount
  useEffect(() => {
    handleRunSimulation();
    fetchGis();
  }, []);

  const handleRunSimulation = async () => {
    setIsSimulating(true);
    try {
      const res = await DinasService.simulateRevenue({
        estimatedMonthlyVisits: Number(estimatedVisits),
        averageGt: Number(avgGt),
        averageEtmal: Number(avgEtmal),
        tariffPerGtEtmalIdr: Number(tariffTambat),
        labuhTariffPerGtIdr: Number(tariffLabuh),
        tariffAdjustmentPercent: Number(adjustmentPercent),
      });
      setSimResult(res);
    } catch (err: unknown) {
      console.error("Gagal menjalankan simulasi PAD:", err);
      // Fallback kalkulasi manual jika backend offline
      const multiplier = 1 + adjustmentPercent / 100;
      const mLabuh = Math.round(estimatedVisits * avgGt * tariffLabuh * multiplier);
      const mTambat = Math.round(estimatedVisits * avgGt * avgEtmal * tariffTambat * multiplier);
      const annualVessel = (mLabuh + mTambat) * 12;
      const annualAsset = 215000000 * multiplier;
      setSimResult({
        portId: "ALL",
        tariffAdjustmentPercent: adjustmentPercent,
        monthlyLabuhIdr: mLabuh,
        monthlyTambatIdr: mTambat,
        projectedAnnualVesselRevenueIdr: annualVessel,
        potentialAnnualAssetLeaseIdr: annualAsset,
        projectedTotalAnnualPadIdr: annualVessel + annualAsset,
      });
    } finally {
      setIsSimulating(false);
    }
  };

  const fetchGis = async () => {
    try {
      const res = await DinasService.getGisOpportunities();
      setGisData(res);
    } catch (err) {
      console.error("Gagal memuat peluang GIS:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* ========================================================= */}
      {/* 1. KPI CARDS: HASIL EVALUASI & SIMULASI                   */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Dermaga Terbaik */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Award className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
              Grade A (96.4)
            </span>
          </div>
          <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mt-3">
            Dermaga Utilisasi Tertinggi
          </p>
          <p className="text-xl font-extrabold text-[#0B241E] font-mono mt-1">
            Dermaga Beton Pemda
          </p>
          <p className="text-[11px] text-[#64748B] mt-1.5">
            Pelabuhan Poumako (Kapasitas 92%)
          </p>
        </div>

        {/* Card 2: Utilisasi Rata-rata Pelabuhan */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <Anchor className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
              +8.4% YoY
            </span>
          </div>
          <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mt-3">
            Tingkat Keterisian Tambatan
          </p>
          <p className="text-xl font-extrabold text-blue-700 font-mono mt-1">
            86.5% Rata-rata
          </p>
          <p className="text-[11px] text-[#64748B] mt-1.5">
            Waktu sandar efektif: 36 Jam / Call
          </p>
        </div>

        {/* Card 3: Proyeksi PAD Tahunan (Hasil Simulasi) */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
              Proyeksi Skenario
            </span>
          </div>
          <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mt-3">
            Proyeksi Total PAD / Tahun
          </p>
          <p className="text-xl font-extrabold text-amber-700 font-mono mt-1">
            Rp {Number(simResult?.projectedTotalAnnualPadIdr || 2650000000).toLocaleString("id-ID")}
          </p>
          <p className="text-[11px] text-[#64748B] mt-1.5 font-semibold text-emerald-700">
            Penyesuaian tarif: +{adjustmentPercent}%
          </p>
        </div>

        {/* Card 4: Peluang Kerjasama Aset GIS */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-mono font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
              Peluang Investasi
            </span>
          </div>
          <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mt-3">
            Aset Lahan Tersedia
          </p>
          <p className="text-xl font-extrabold text-[#0B241E] font-mono mt-1">
            {gisData?.availableAssetsCount || 4}{" "}
            <span className="text-xs font-normal text-gray-500">Kavling</span>
          </p>
          <p className="text-[11px] text-purple-700 font-semibold mt-1.5">
            Lahan depo kontainer & kios siap sewa
          </p>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. KALKULATOR SIMULASI KEBIJAKAN FISKAL PAD               */}
      {/* ========================================================= */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-[#0B241E] flex items-center gap-2">
              <Calculator className="w-4 h-4 text-[#D97706]" />
              Kalkulator Simulasi Kebijakan Tarif & Proyeksi PAD (Kabupaten Mimika)
            </h2>
            <p className="text-xs text-gray-500">
              Analisis elastisitas penyesuaian tarif Perda No. 4/2023 terhadap potensi penerimaan kas daerah pelabuhan
            </p>
          </div>
          <button
            onClick={handleRunSimulation}
            disabled={isSimulating}
            className="px-4 py-2 bg-[#0B241E] hover:bg-[#133D31] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#D97706] ${isSimulating ? "animate-spin" : ""}`} />
            <span>{isSimulating ? "Menghitung..." : "Hitung Ulang Proyeksi"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Kolom Slider & Input Parameter */}
          <div className="lg:col-span-2 space-y-4">
            {/* Input 1: Estimasi Kunjungan Kapal / Bulan */}
            <div>
              <div className="flex justify-between items-center text-xs font-bold text-gray-700 mb-1.5">
                <span>Frekuensi Kunjungan Kapal per Bulan</span>
                <span className="font-mono text-[#0B241E] bg-gray-100 px-2 py-0.5 rounded">
                  {estimatedVisits} Call / Bulan
                </span>
              </div>
              <input
                type="range"
                min={10}
                max={100}
                value={estimatedVisits}
                onChange={(e) => setEstimatedVisits(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#0B241E]"
              />
              <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                <span>10 call (Minimal)</span>
                <span>50 call (Normal)</span>
                <span>100 call (Puncak)</span>
              </div>
            </div>

            {/* Input 2: Rata-rata Gross Tonnage (GT) */}
            <div>
              <div className="flex justify-between items-center text-xs font-bold text-gray-700 mb-1.5">
                <span>Rata-rata Bobot Kapal (Gross Tonnage)</span>
                <span className="font-mono text-[#0B241E] bg-gray-100 px-2 py-0.5 rounded">
                  {avgGt.toLocaleString("id-ID")} GT
                </span>
              </div>
              <input
                type="range"
                min={500}
                max={5000}
                step={100}
                value={avgGt}
                onChange={(e) => setAvgGt(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#0B241E]"
              />
              <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                <span>500 GT (LCT / Tongkang)</span>
                <span>2.500 GT (Kargo Kontainer)</span>
                <span>5.000 GT (Kapal Penumpang Pelni)</span>
              </div>
            </div>

            {/* Input 3: Penyesuaian Tarif Retribusi (%) */}
            <div>
              <div className="flex justify-between items-center text-xs font-bold text-gray-700 mb-1.5">
                <span>Rencana Penyesuaian Tarif Retribusi (Perda Revisi)</span>
                <span className={`font-mono px-2 py-0.5 rounded font-bold ${
                  adjustmentPercent > 0 ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-800"
                }`}>
                  {adjustmentPercent > 0 ? `+${adjustmentPercent}%` : `${adjustmentPercent}%`}
                </span>
              </div>
              <input
                type="range"
                min={-20}
                max={100}
                step={5}
                value={adjustmentPercent}
                onChange={(e) => setAdjustmentPercent(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#D97706]"
              />
              <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                <span>-20% (Diskon Keringanan)</span>
                <span>0% (Tarif Saat Ini)</span>
                <span>+100% (Kenaikan Maksimal)</span>
              </div>
            </div>
          </div>

          {/* Kolom Hasil Ringkasan Simulasi */}
          <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl flex flex-col justify-between space-y-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-2">
                Output Proyeksi Kasda
              </span>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between pb-2 border-b border-gray-200">
                  <span className="text-gray-600">Retribusi Labuh / Bulan:</span>
                  <span className="font-mono font-bold text-gray-900">
                    Rp {Number(simResult?.monthlyLabuhIdr || 0).toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex justify-between pb-2 border-b border-gray-200">
                  <span className="text-gray-600">Retribusi Tambat / Bulan:</span>
                  <span className="font-mono font-bold text-gray-900">
                    Rp {Number(simResult?.monthlyTambatIdr || 0).toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex justify-between pb-2 border-b border-gray-200">
                  <span className="text-gray-600">Jasa Kapal per Tahun:</span>
                  <span className="font-mono font-bold text-blue-700">
                    Rp {Number(simResult?.projectedAnnualVesselRevenueIdr || 0).toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-gray-800 font-bold">Total Estimasi PAD / Thn:</span>
                  <span className="font-mono font-extrabold text-emerald-700 text-sm">
                    Rp {Number(simResult?.projectedTotalAnnualPadIdr || 0).toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-gray-500 bg-white p-2.5 rounded-lg border border-gray-200">
              💡 <strong>Rekomendasi Kebijakan:</strong> Penyesuaian tarif sebesar +{adjustmentPercent}% berpotensi menambah kas daerah sebesar{" "}
              <strong>
                Rp{" "}
                {Number(
                  (simResult?.projectedTotalAnnualPadIdr || 0) * (adjustmentPercent / 100)
                ).toLocaleString("id-ID")}
              </strong>{" "}
              per tahun untuk mendanai pemeliharaan alur pelayaran.
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. BENCHMARKING KINERJA ANTAR-DERMAGA KAB. MIMIKA         */}
      {/* ========================================================= */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-gray-100">
          <div>
            <h3 className="font-bold text-[#0B241E] text-base">
              Evaluasi Kinerja Komparasi Antar-Fasilitas Dermaga (Kabupaten Mimika)
            </h3>
            <p className="text-xs text-gray-500">
              Benchmarking efisiensi operasional, penerimaan retribusi, dan kelaikan fasilitas di wilayah kerja Poumako & sekitarnya
            </p>
          </div>
          <span className="text-xs font-mono bg-emerald-50 text-emerald-800 font-bold px-3 py-1 rounded-md">
            Semester II Berjalan
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Fasilitas 1: Dermaga Beton Pemda */}
          <div className="p-4 bg-gray-50 border border-emerald-300 rounded-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-bl">
              Kinerja Tertinggi
            </div>
            <p className="text-sm font-bold text-[#0B241E]">Dermaga Beton Pemda</p>
            <p className="text-xs text-gray-500">Pelabuhan Poumako (150m)</p>
            <div className="mt-3 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Penerimaan:</span>
                <strong className="font-mono text-[#0B241E]">Rp 98,5 Jt/bln</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Utilisasi:</span>
                <strong className="text-emerald-700">92% (Optimal)</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Kelaikan:</span>
                <strong className="text-emerald-700">Laik Sandar</strong>
              </div>
            </div>
          </div>

          {/* Fasilitas 2: Dolphin MB Ferry */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
            <p className="text-sm font-bold text-[#0B241E]">Dolphin MB Ferry</p>
            <p className="text-xs text-gray-500">Penyeberangan ASDP (80m)</p>
            <div className="mt-3 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Penerimaan:</span>
                <strong className="font-mono text-[#0B241E]">Rp 42,8 Jt/bln</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Utilisasi:</span>
                <strong className="text-blue-700">84% (Stabil)</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Kelaikan:</span>
                <strong className="text-blue-700">Perbaikan Trafo</strong>
              </div>
            </div>
          </div>

          {/* Fasilitas 3: Dermaga Rakyat PPI */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
            <p className="text-sm font-bold text-[#0B241E]">Dermaga Rakyat (PPI)</p>
            <p className="text-xs text-gray-500">Pendaratan Ikan Poumako</p>
            <div className="mt-3 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Penerimaan:</span>
                <strong className="font-mono text-[#0B241E]">Rp 28,4 Jt/bln</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Utilisasi:</span>
                <strong className="text-amber-700">76% (Menengah)</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Kelaikan:</span>
                <strong className="text-emerald-700">Laik Operasi</strong>
              </div>
            </div>
          </div>

          {/* Fasilitas 4: Dermaga Kokonao */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
            <p className="text-sm font-bold text-[#0B241E]">Dermaga Kokonao</p>
            <p className="text-xs text-gray-500">Distrik Mimika Barat</p>
            <div className="mt-3 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Penerimaan:</span>
                <strong className="font-mono text-[#0B241E]">Rp 14,8 Jt/bln</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Utilisasi:</span>
                <strong className="text-gray-700">62% (Rendah)</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Kelaikan:</span>
                <strong className="text-amber-700">Perlu Peremajaan</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
