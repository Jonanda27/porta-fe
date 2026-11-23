"use client";

import React, { useEffect, useState } from "react";
import {
  TrendingUp,
  Calculator,
  MapPin,
  RefreshCw,
  Loader2,
  AlertCircle,
  Building2,
  Anchor,
} from "lucide-react";
import { useDinasStore } from "@/store/dinas.store";
import { formatLabel } from "@/lib/format-labels";

export default function BendaharaProyeksiPage() {
  const {
    gisOpportunities,
    simulationResult,
    isLoading,
    isSimulating,
    error,
    fetchGisOpportunities,
    simulateRevenue,
    clearError,
  } = useDinasStore();

  const [estimatedMonthlyVisits, setEstimatedMonthlyVisits] = useState<number>(30);
  const [averageGt, setAverageGt] = useState<number>(1200);
  const [averageEtmal, setAverageEtmal] = useState<number>(2);
  const [tariffPerGtEtmalIdr, setTariffPerGtEtmalIdr] = useState<number>(200);
  const [labuhTariffPerGtIdr, setLabuhTariffPerGtIdr] = useState<number>(115);
  const [tariffAdjustmentPercent, setTariffAdjustmentPercent] = useState<number>(0);

  useEffect(() => {
    fetchGisOpportunities();
  }, [fetchGisOpportunities]);

  const handleSimulate = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    await simulateRevenue({
      estimatedMonthlyVisits,
      averageGt,
      averageEtmal,
      tariffPerGtEtmalIdr,
      labuhTariffPerGtIdr,
      tariffAdjustmentPercent,
    });
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={clearError}
            className="font-bold text-rose-600 hover:text-rose-800"
          >
            Tutup
          </button>
        </div>
      )}

      {/* 1. Simulasi & Proyeksi PAD */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <form
          onSubmit={handleSimulate}
          className="xl:col-span-5 bg-white border border-[#CBD5E1] rounded-2xl shadow-xs overflow-hidden"
        >
          <div className="p-4 border-b border-[#F1F5F9] bg-[#FAFCFB]">
            <h2 className="font-extrabold text-sm text-[#0B241E] flex items-center gap-2">
              <Calculator className="w-4 h-4 text-[#D97706]" />
              <span>Simulator Proyeksi Pendapatan Daerah (PAD)</span>
            </h2>
            <p className="text-[11px] text-[#64748B] mt-0.5">
              Hitung proyeksi penerimaan tahunan berdasarkan proyeksi kunjungan kapal dan penyesuaian tarif.
            </p>
          </div>

          <div className="p-5 space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-[#0B241E]">
                  Kunjungan Kapal / Bulan
                </label>
                <input
                  type="number"
                  min={0}
                  required
                  value={estimatedMonthlyVisits}
                  onChange={(e) => setEstimatedMonthlyVisits(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-[#0B241E]">Rata-rata GT Kapal</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={averageGt}
                  onChange={(e) => setAverageGt(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-[#0B241E]">Rata-rata Etmal</label>
                <input
                  type="number"
                  step="0.5"
                  min={0.5}
                  required
                  value={averageEtmal}
                  onChange={(e) => setAverageEtmal(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-[#0B241E]">
                  Penyesuaian Tarif (%)
                </label>
                <input
                  type="number"
                  value={tariffAdjustmentPercent}
                  onChange={(e) => setTariffAdjustmentPercent(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-[#0B241E]">
                  Tarif Tambat (Rp/GT/Etmal)
                </label>
                <input
                  type="number"
                  min={0}
                  required
                  value={tariffPerGtEtmalIdr}
                  onChange={(e) => setTariffPerGtEtmalIdr(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-[#0B241E]">
                  Tarif Labuh (Rp/GT)
                </label>
                <input
                  type="number"
                  min={0}
                  required
                  value={labuhTariffPerGtIdr}
                  onChange={(e) => setLabuhTariffPerGtIdr(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSimulating}
              className="w-full py-2.5 rounded-xl bg-[#0B241E] hover:bg-[#143E33] text-white font-bold inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSimulating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <TrendingUp className="w-4 h-4 text-[#D97706]" />
              )}
              <span>{isSimulating ? "Menghitung..." : "Hitung Proyeksi PAD"}</span>
            </button>
          </div>
        </form>

        {/* Hasil Simulasi */}
        <div className="xl:col-span-7 bg-white border border-[#CBD5E1] rounded-2xl shadow-xs overflow-hidden flex flex-col">
          <div className="p-4 border-b border-[#F1F5F9] bg-[#FAFCFB]">
            <h2 className="font-extrabold text-sm text-[#0B241E]">
              Hasil Proyeksi Penerimaan Kas Daerah
            </h2>
            <p className="text-[11px] text-[#64748B] mt-0.5">
              Estimasi pendapatan jasa labuh, tambat, serta potensi sewa aset tahunan di pelabuhan.
            </p>
          </div>

          <div className="p-5 flex-1 flex flex-col justify-center">
            {!simulationResult ? (
              <div className="text-center py-8 text-xs text-[#64748B]">
                Sesuaikan parameter di sebelah kiri lalu tekan{" "}
                <span className="font-bold text-[#0B241E]">Hitung Proyeksi PAD</span>{" "}
                untuk melihat estimasi pendapatan daerah.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                  <p className="text-[11px] font-bold text-[#64748B] uppercase">
                    Proyeksi Jasa Labuh / Bulan
                  </p>
                  <p className="text-lg font-extrabold font-mono text-[#0B241E] mt-1">
                    Rp {Number(simulationResult.monthlyLabuhIdr).toLocaleString("id-ID")}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                  <p className="text-[11px] font-bold text-[#64748B] uppercase">
                    Proyeksi Jasa Tambat / Bulan
                  </p>
                  <p className="text-lg font-extrabold font-mono text-[#0B241E] mt-1">
                    Rp {Number(simulationResult.monthlyTambatIdr).toLocaleString("id-ID")}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                  <p className="text-[11px] font-bold text-[#64748B] uppercase">
                    Proyeksi Kapal / Tahun
                  </p>
                  <p className="text-lg font-extrabold font-mono text-blue-800 mt-1">
                    Rp{" "}
                    {Number(simulationResult.projectedAnnualVesselRevenueIdr).toLocaleString(
                      "id-ID"
                    )}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                  <p className="text-[11px] font-bold text-[#64748B] uppercase">
                    Potensi Sewa Aset / Tahun
                  </p>
                  <p className="text-lg font-extrabold font-mono text-amber-800 mt-1">
                    Rp{" "}
                    {Number(simulationResult.potentialAnnualAssetLeaseIdr).toLocaleString(
                      "id-ID"
                    )}
                  </p>
                </div>
                <div className="sm:col-span-2 p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                  <p className="text-[11px] font-bold text-emerald-800 uppercase">
                    Total Proyeksi PAD Tahunan (Penyesuaian{" "}
                    {simulationResult.tariffAdjustmentPercent}%)
                  </p>
                  <p className="text-2xl font-extrabold font-mono text-emerald-900 mt-1">
                    Rp{" "}
                    {Number(simulationResult.projectedTotalAnnualPadIdr).toLocaleString(
                      "id-ID"
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Potensi GIS Aset & Dermaga */}
      <div className="bg-white border border-[#CBD5E1] rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#F1F5F9] bg-[#FAFCFB] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-extrabold text-sm text-[#0B241E] flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#D97706]" />
              <span>Potensi Monetisasi Aset Lahan &amp; Dermaga (GIS)</span>
            </h2>
            <p className="text-[11px] text-[#64748B] mt-0.5">
              Inventarisasi aset tersedia ({gisOpportunities?.availableAssetsCount ?? 0}), tersewa (
              {gisOpportunities?.leasedAssetsCount ?? 0}), serta dermaga berpotensi retribusi.
            </p>
          </div>

          <button
            type="button"
            onClick={() => fetchGisOpportunities()}
            disabled={isLoading}
            className="px-3 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-semibold text-[#0B241E] inline-flex items-center gap-1.5 cursor-pointer self-start sm:self-center"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Segarkan Data GIS</span>
          </button>
        </div>

        <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tabel Aset */}
          <div className="border border-[#E2E8F0] rounded-xl overflow-hidden">
            <div className="px-4 py-2.5 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center gap-2 text-xs font-bold text-[#0B241E]">
              <Building2 className="w-4 h-4 text-[#D97706]" />
              <span>Aset Lahan &amp; Kios ({gisOpportunities?.assets.length ?? 0})</span>
            </div>
            <div className="overflow-x-auto max-h-80">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] font-mono text-[10px] text-[#64748B] uppercase">
                  <tr>
                    <th className="p-3">Kode</th>
                    <th className="p-3">Nama Aset</th>
                    <th className="p-3">Luas</th>
                    <th className="p-3">Tarif / m² / Thn</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9]">
                  {(gisOpportunities?.assets ?? []).length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-[#64748B]">
                        {isLoading ? "Memuat aset GIS..." : "Belum ada data aset GIS."}
                      </td>
                    </tr>
                  ) : (
                    gisOpportunities?.assets.map((asset) => (
                      <tr key={asset.id} className="hover:bg-[#F8FAFC]">
                        <td className="p-3 font-mono font-bold text-[#0B241E]">
                          {asset.assetCode}
                        </td>
                        <td className="p-3">
                          <p className="font-semibold text-[#0B241E]">{asset.name}</p>
                          <p className="text-[10px] text-[#64748B]">
                            {formatLabel(asset.assetType)}
                          </p>
                        </td>
                        <td className="p-3 font-mono text-[#475569]">
                          {asset.areaSqm} m²
                        </td>
                        <td className="p-3 font-mono font-bold text-emerald-800">
                          Rp {Number(asset.annualRatePerSqmIdr).toLocaleString("id-ID")}
                        </td>
                        <td className="p-3">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              asset.status === "AVAILABLE"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {formatLabel(asset.status)}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tabel Dermaga */}
          <div className="border border-[#E2E8F0] rounded-xl overflow-hidden">
            <div className="px-4 py-2.5 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center gap-2 text-xs font-bold text-[#0B241E]">
              <Anchor className="w-4 h-4 text-[#D97706]" />
              <span>Dermaga &amp; Kelayakan Tagih ({gisOpportunities?.berths.length ?? 0})</span>
            </div>
            <div className="overflow-x-auto max-h-80">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] font-mono text-[10px] text-[#64748B] uppercase">
                  <tr>
                    <th className="p-3">Kode</th>
                    <th className="p-3">Nama Dermaga</th>
                    <th className="p-3">Tipe</th>
                    <th className="p-3">Otoritas</th>
                    <th className="p-3">Kelayakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9]">
                  {(gisOpportunities?.berths ?? []).length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-[#64748B]">
                        {isLoading ? "Memuat dermaga GIS..." : "Belum ada data dermaga GIS."}
                      </td>
                    </tr>
                  ) : (
                    gisOpportunities?.berths.map((berth) => (
                      <tr key={berth.id} className="hover:bg-[#F8FAFC]">
                        <td className="p-3 font-mono font-bold text-[#0B241E]">
                          {berth.code}
                        </td>
                        <td className="p-3 font-semibold text-[#0B241E]">{berth.name}</td>
                        <td className="p-3 text-[#475569]">
                          {formatLabel(berth.berthType)}
                        </td>
                        <td className="p-3 text-[#475569]">
                          {formatLabel(berth.authorityType)}
                        </td>
                        <td className="p-3">
                          <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                            {formatLabel(berth.billingEligibility)}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
