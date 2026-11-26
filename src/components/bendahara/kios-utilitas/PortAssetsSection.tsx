"use client";

import { Search, ShieldCheck, Store, CheckCircle2 } from "lucide-react";
import { PortAsset } from "@/types/asset.types";

export interface PortAssetsSectionProps {
  assets: PortAsset[];
  searchQuery: string;
  onSearchChange: (value: string) => void;
  assetTypeFilter: string;
  onAssetTypeFilterChange: (type: string) => void;
}

const ASSET_TYPES = ["ALL", "KIOS", "GUDANG", "KANTOR", "LAPAK_TERBUKA"] as const;

export function PortAssetsSection({
  assets,
  searchQuery,
  onSearchChange,
  assetTypeFilter,
  onAssetTypeFilterChange,
}: PortAssetsSectionProps) {
  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      asset.assetCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (assetTypeFilter !== "ALL" && asset.assetType !== assetTypeFilter) return false;
    return true;
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
      <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari kode aset atau nama fasilitas..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#0B241E] focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          <span className="text-xs text-gray-400 font-medium">Jenis Aset:</span>
          {ASSET_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => onAssetTypeFilterChange(type)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                assetTypeFilter === type
                  ? "bg-[#0B241E] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {type === "ALL" ? "Semua Jenis" : type.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#FAFBFB] text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-100">
            <tr>
              <th className="py-3 px-4">Kode & Nama Aset</th>
              <th className="py-3 px-4">Klasifikasi Fasilitas</th>
              <th className="py-3 px-4">Luas Fisik (m²)</th>
              <th className="py-3 px-4">Tarif Perda (Rp/m²/Tahun)</th>
              <th className="py-3 px-4">Estimasi PAD (Per Tahun)</th>
              <th className="py-3 px-4">Kelayakan Tagih</th>
              <th className="py-3 px-4">Status Keterisian</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-700">
            {filteredAssets.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-gray-400">
                  Tidak ada data aset pelabuhan yang cocok dengan kriteria.
                </td>
              </tr>
            ) : (
              filteredAssets.map((asset) => {
                const annualEstimatedPad =
                  Number(asset.areaSqm || 0) * Number(asset.annualRatePerSqmIdr || 0);

                return (
                  <tr key={asset.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#0B241E] flex items-center gap-1.5">
                        <span className="font-mono bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-[11px]">
                          {asset.assetCode}
                        </span>
                      </div>
                      <div className="font-medium text-gray-800 mt-1">{asset.name}</div>
                      {asset.legalBasis && (
                        <div className="text-[10px] text-gray-400 mt-0.5">
                          {asset.legalBasis}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-gray-100 text-gray-800">
                        {asset.assetType.replace("_", " ")}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono font-medium text-gray-800">
                      {Number(asset.areaSqm).toLocaleString("id-ID")} m²
                    </td>

                    <td className="py-3 px-4 font-mono font-medium text-gray-800">
                      Rp {Number(asset.annualRatePerSqmIdr).toLocaleString("id-ID")}
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                      Rp {annualEstimatedPad.toLocaleString("id-ID")}
                    </td>

                    <td className="py-3 px-4">
                      {asset.billingEligibility === "BILLABLE" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          <ShieldCheck className="w-3 h-3" />
                          Sah Pemda
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          Verifikasi Syahbandar
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      {asset.status === "LEASED" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                          <Store className="w-3 h-3" />
                          Tersewa
                        </span>
                      ) : asset.status === "AVAILABLE" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3" />
                          Tersedia
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700">
                          Pemeliharaan
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
