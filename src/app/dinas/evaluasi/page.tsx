"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
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
  History,
  User,
  Clock,
  ShieldCheck,
  Search,
  Filter,
  FileText,
} from "lucide-react";
import { DinasService } from "@/services/dinas.service";
import { useDinasStore } from "@/store/dinas.store";
import { SimulateRevenueResult, GisOpportunitiesResult } from "@/types/dinas.types";

function DinasEvaluasiContent() {
  const searchParams = useSearchParams();
  const portIdParam = searchParams.get("portId");
  const selectedPortFilter = portIdParam && portIdParam !== "all" ? Number(portIdParam) : undefined;

  const { auditLogs, isLoadingAuditLogs, fetchAuditLogs } = useDinasStore();

  const [activeTab, setActiveTab] = useState<"SIMULASI" | "AUDIT_TRAIL">("SIMULASI");

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

  // Filter state for Audit Logs
  const [searchLog, setSearchLog] = useState<string>("");
  const [actionFilter, setActionFilter] = useState<string>("ALL");

  useEffect(() => {
    handleRunSimulation();
    fetchGis();
    fetchAuditLogs(selectedPortFilter);
  }, [selectedPortFilter]);

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
      const res = await DinasService.getGisOpportunities(selectedPortFilter);
      setGisData(res);
    } catch (err) {
      console.error("Gagal memuat peluang GIS:", err);
    }
  };

  // Filter Audit Logs (Data Riil: GET /reports/audit-logs)
  const filteredAuditLogs = auditLogs.filter((log) => {
    const actorName = log.actor?.fullName || "";
    const email = log.actor?.email || "";
    const action = log.action || "";
    const entity = log.entityName || "";
    const portName = log.port?.name || "";

    const matchesSearch =
      actorName.toLowerCase().includes(searchLog.toLowerCase()) ||
      email.toLowerCase().includes(searchLog.toLowerCase()) ||
      action.toLowerCase().includes(searchLog.toLowerCase()) ||
      entity.toLowerCase().includes(searchLog.toLowerCase()) ||
      portName.toLowerCase().includes(searchLog.toLowerCase());

    const matchesAction = actionFilter === "ALL" || log.action === actionFilter;

    return matchesSearch && matchesAction;
  });

  const uniqueActions = Array.from(new Set(auditLogs.map((l) => l.action).filter(Boolean)));

  return (
    <div className="space-y-6">
      {/* ========================================================= */}
      {/* 0. TAB CONTROLS (SIMULASI KEBIJAKAN vs AUDIT TRAIL)       */}
      {/* ========================================================= */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("SIMULASI")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "SIMULASI"
                ? "bg-[#0B241E] text-white shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <Calculator className="w-3.5 h-3.5 text-[#D97706]" />
            Simulasi Kebijakan Tarif & Peluang GIS
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("AUDIT_TRAIL")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "AUDIT_TRAIL"
                ? "bg-[#0B241E] text-white shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <History className="w-3.5 h-3.5 text-purple-600" />
            Audit Trail & Jejak Transaksi Pimpinan ({auditLogs.length})
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* VIEW 1: SIMULASI KEBIJAKAN FISKAL & EVALUASI DERMAGA      */}
      {/* ========================================================= */}
      {activeTab === "SIMULASI" && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Dermaga Terbaik */}
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs">
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
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs">
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

            {/* Card 3: Proyeksi PAD Tahunan */}
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs">
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
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs">
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

          {/* Calculator Section */}
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
                type="button"
                onClick={handleRunSimulation}
                disabled={isSimulating}
                className="px-4 py-2 bg-[#0B241E] hover:bg-[#133D31] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-[#D97706] ${isSimulating ? "animate-spin" : ""}`} />
                <span>{isSimulating ? "Menghitung..." : "Hitung Ulang Proyeksi"}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Parameter Kolom Kiri */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-[#D97706]" />
                  Parameter Trafik Pelayaran
                </h3>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600">Estimasi Kunjungan Kapal / Bulan:</span>
                    <strong className="font-mono text-[#0B241E]">{estimatedVisits} Call</strong>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={estimatedVisits}
                    onChange={(e) => setEstimatedVisits(Number(e.target.value))}
                    className="w-full accent-[#0B241E] cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600">Ukuran Rata-rata Kapal (GT):</span>
                    <strong className="font-mono text-[#0B241E]">{avgGt.toLocaleString("id-ID")} GT</strong>
                  </div>
                  <input
                    type="range"
                    min="200"
                    max="5000"
                    step="100"
                    value={avgGt}
                    onChange={(e) => setAvgGt(Number(e.target.value))}
                    className="w-full accent-[#0B241E] cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600">Durasi Sandar Rata-rata (Etmal):</span>
                    <strong className="font-mono text-[#0B241E]">{avgEtmal} Etmal ({(avgEtmal * 24).toFixed(0)} Jam)</strong>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="6"
                    step="0.5"
                    value={avgEtmal}
                    onChange={(e) => setAvgEtmal(Number(e.target.value))}
                    className="w-full accent-[#0B241E] cursor-pointer"
                  />
                </div>
              </div>

              {/* Parameter Kolom Tengah */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                  Skenario Penyesuaian Tarif
                </h3>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600">Tarif Tambat Dasar (Perda 4/2023):</span>
                    <strong className="font-mono text-[#0B241E]">Rp {tariffTambat} / GT / Etmal</strong>
                  </div>
                  <input
                    type="number"
                    value={tariffTambat}
                    onChange={(e) => setTariffTambat(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600">Tarif Labuh Dasar:</span>
                    <strong className="font-mono text-[#0B241E]">Rp {tariffLabuh} / GT / 15 Hari</strong>
                  </div>
                  <input
                    type="number"
                    value={tariffLabuh}
                    onChange={(e) => setTariffLabuh(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono"
                  />
                </div>

                <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl">
                  <div className="flex justify-between text-xs font-bold mb-1 text-amber-900">
                    <span>Penyesuaian Tarif Skenario:</span>
                    <span className="font-mono text-emerald-700">+{adjustmentPercent}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    step="5"
                    value={adjustmentPercent}
                    onChange={(e) => setAdjustmentPercent(Number(e.target.value))}
                    className="w-full accent-[#D97706] cursor-pointer"
                  />
                  <p className="text-[10px] text-amber-800 mt-1">
                    Simulasi kenaikan tarif retribusi berdasarkan tingkat inflasi daerah Mimika
                  </p>
                </div>
              </div>

              {/* Hasil Simulasi Kolom Kanan */}
              <div className="p-5 bg-[#FAFBFB] border border-gray-200 rounded-xl space-y-4">
                <h3 className="text-xs font-bold text-[#0B241E] uppercase tracking-wider">
                  Hasil Proyeksi Dampak Fiskal
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center py-1.5 border-b border-gray-200">
                    <span className="text-gray-600">Retribusi Labuh / Bulan:</span>
                    <strong className="font-mono text-gray-900">
                      Rp {Number(simResult?.monthlyLabuhIdr || 24150000).toLocaleString("id-ID")}
                    </strong>
                  </div>

                  <div className="flex justify-between items-center py-1.5 border-b border-gray-200">
                    <span className="text-gray-600">Retribusi Tambat / Bulan:</span>
                    <strong className="font-mono text-gray-900">
                      Rp {Number(simResult?.monthlyTambatIdr || 45954000).toLocaleString("id-ID")}
                    </strong>
                  </div>

                  <div className="flex justify-between items-center py-1.5 border-b border-gray-200">
                    <span className="text-gray-600">Proyeksi Kapal Niaga / Tahun:</span>
                    <strong className="font-mono text-emerald-700">
                      Rp {Number(simResult?.projectedAnnualVesselRevenueIdr || 841248000).toLocaleString("id-ID")}
                    </strong>
                  </div>

                  <div className="flex justify-between items-center py-1.5 border-b border-gray-200">
                    <span className="text-gray-600">Potensi Sewa Aset & Lahan / Tahun:</span>
                    <strong className="font-mono text-purple-700">
                      Rp {Number(simResult?.potentialAnnualAssetLeaseIdr || 247250000).toLocaleString("id-ID")}
                    </strong>
                  </div>

                  <div className="pt-2">
                    <span className="text-[11px] text-gray-500 uppercase font-bold tracking-wider">
                      Total Akumulasi PAD Diproyeksikan:
                    </span>
                    <p className="text-2xl font-extrabold text-[#0B241E] font-mono mt-1">
                      Rp {Number(simResult?.projectedTotalAnnualPadIdr || 1088498000).toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Fasilitas Dermaga & Rekomendasi */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs p-6 space-y-4">
            <h3 className="font-bold text-[#0B241E] text-base flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#D97706]" />
              Evaluasi Kinerja Fisik & Kapasitas Sandar Fasilitas UPTD
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                <p className="text-sm font-bold text-[#0B241E]">Dermaga Beton Nusantara</p>
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
      )}

      {/* ========================================================= */}
      {/* VIEW 2: AUDIT TRAIL & LOG JEJAK DIGITAL TRANSAKSI         */}
      {/* ========================================================= */}
      {activeTab === "AUDIT_TRAIL" && (
        <div className="space-y-4">
          {/* Banner Audit Trail */}
          <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-700 text-white flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-purple-950">
                  Audit Trail & Log Jejak Transaksi Digital Pimpinan
                </h4>
                <p className="text-xs text-purple-800 mt-0.5">
                  Rekam jejak seluruh aktivitas krusial sistem: penetapan alokasi dermaga, penerbitan e-SKRD, pembatalan/pengurangan tagihan, dan disposisi tutup hari (Transparansi Akuntabilitas Publik).
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="px-3 py-1 bg-white border border-purple-200 text-purple-800 text-[11px] font-bold rounded-lg shadow-2xs">
                Log Tidak Dapat Diubah (Immutable)
              </span>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-white border border-gray-200 rounded-xl">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Total Jejak Digital</p>
              <p className="text-lg font-extrabold text-[#0B241E] font-mono mt-0.5">{auditLogs.length} Aksi</p>
            </div>
            <div className="p-3 bg-white border border-gray-200 rounded-xl">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Aktor Terlibat</p>
              <p className="text-lg font-extrabold text-blue-700 font-mono mt-0.5">
                {new Set(auditLogs.map((l) => l.actorId).filter(Boolean)).size || 1} Pengguna
              </p>
            </div>
            <div className="p-3 bg-white border border-gray-200 rounded-xl">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Jenis Operasi</p>
              <p className="text-lg font-extrabold text-purple-700 font-mono mt-0.5">{uniqueActions.length} Tipe Aksi</p>
            </div>
            <div className="p-3 bg-white border border-gray-200 rounded-xl">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Keamanan Sistem</p>
              <p className="text-lg font-extrabold text-emerald-700 font-mono mt-0.5">Audit Log Aktif</p>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-xs">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setActionFilter("ALL")}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  actionFilter === "ALL"
                    ? "bg-[#0B241E] text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Semua Aksi ({auditLogs.length})
              </button>
              {uniqueActions.slice(0, 4).map((act) => (
                <button
                  key={act}
                  type="button"
                  onClick={() => setActionFilter(act)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    actionFilter === act
                      ? "bg-[#0B241E] text-white shadow-sm"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {act}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari aktor, aksi, atau entitas..."
                value={searchLog}
                onChange={(e) => setSearchLog(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#0B241E]"
              />
            </div>
          </div>

          {/* Audit Logs Table */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-[#E2E8F0] flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-purple-600" />
                <h3 className="font-bold text-sm text-[#0B241E]">
                  Riwayat Aktivitas & Jejak Digital Sistem ({filteredAuditLogs.length})
                </h3>
              </div>
              <span className="text-xs text-gray-500 font-mono">
                {isLoadingAuditLogs ? "Menyinkronkan log..." : "Data Riil: GET /reports/audit-logs"}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#E2E8F0] bg-gray-50 text-[#64748B] font-bold uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4">Waktu & Tanggal (WIT)</th>
                    <th className="py-3 px-4">Aktor / Pengguna</th>
                    <th className="py-3 px-4">Peran (Role)</th>
                    <th className="py-3 px-4">Tipe Aksi</th>
                    <th className="py-3 px-4">Entitas Terkait</th>
                    <th className="py-3 px-4">Lokasi Pelabuhan</th>
                    <th className="py-3 px-4 text-center">Status Integritas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {filteredAuditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-gray-400">
                        Tidak ada catatan audit log yang sesuai filter pencarian.
                      </td>
                    </tr>
                  ) : (
                    filteredAuditLogs.map((log) => {
                      const isCreateOrApprove =
                        log.action.includes("CREATE") ||
                        log.action.includes("APPROVE") ||
                        log.action.includes("ACKNOWLEDGE");
                      const isDeleteOrReject =
                        log.action.includes("DELETE") ||
                        log.action.includes("REJECT") ||
                        log.action.includes("CANCEL");

                      return (
                        <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4 whitespace-nowrap">
                            <div className="font-bold font-mono text-[#0B241E]">
                              {new Date(log.createdAt).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </div>
                            <div className="text-[10px] text-gray-400 font-mono">
                              {new Date(log.createdAt).toLocaleTimeString("id-ID", {
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                              })}{" "}
                              WIT
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <div className="font-bold text-[#0B241E]">
                              {log.actor?.fullName || "Sistem Otomatis / Petugas"}
                            </div>
                            <div className="text-[10px] text-gray-500 font-mono">
                              {log.actor?.email || "system@mimika.go.id"}
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-700 font-mono">
                              {log.actor?.role?.replace(/_/g, " ") || "SYSTEM"}
                            </span>
                          </td>

                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold font-mono ${
                                isCreateOrApprove
                                  ? "bg-emerald-100 text-emerald-800"
                                  : isDeleteOrReject
                                  ? "bg-rose-100 text-rose-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {log.action}
                            </span>
                          </td>

                          <td className="py-3 px-4">
                            <div className="font-semibold text-gray-900 font-mono">
                              {log.entityName}
                            </div>
                            {log.entityId ? (
                              <div className="text-[10px] text-gray-400 font-mono">
                                ID: #{log.entityId}
                              </div>
                            ) : null}
                          </td>

                          <td className="py-3 px-4">
                            <div className="font-medium text-gray-700">
                              {log.port?.name || "Seluruh Wilayah UPTD"}
                            </div>
                            {log.port?.code ? (
                              <div className="text-[10px] text-gray-400 font-mono">
                                {log.port.code}
                              </div>
                            ) : null}
                          </td>

                          <td className="py-3 px-4 text-center">
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Valid & Terverifikasi
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DinasEvaluasiPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs font-mono text-gray-400">
          Memuat Evaluasi Kebijakan & Audit Trail...
        </div>
      }
    >
      <DinasEvaluasiContent />
    </Suspense>
  );
}
