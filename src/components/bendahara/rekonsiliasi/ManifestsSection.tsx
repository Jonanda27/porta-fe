"use client";

import { MapPin, Search, Ship } from "lucide-react";
import { FerryRouteItem } from "@/types/field-ops.types";
import { VesselManifestItem } from "@/types/manifest.types";

export interface ManifestsSectionProps {
  manifests: VesselManifestItem[];
  ferryRoutes: FerryRouteItem[];
  searchQuery: string;
  onChangeSearchQuery: (query: string) => void;
}

export function ManifestsSection({
  manifests,
  ferryRoutes,
  searchQuery,
  onChangeSearchQuery,
}: ManifestsSectionProps) {
  return (
    <div className="space-y-5">
      <div className="bg-white border border-[#CBD5E1] rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#F1F5F9] bg-[#FAFCFB] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <h3 className="font-extrabold text-sm text-[#0B241E]">
              Rekonsiliasi Manifes Penumpang &amp; Kendaraan Kapal Ferry
            </h3>
            <p className="text-[11px] text-[#64748B] mt-0.5">
              Pencocokan kuota manifes keberangkatan kapal penyeberangan dengan penerimaan retribusi jasa terminal pelabuhan.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari manifes, kapal, atau rute..."
              value={searchQuery}
              onChange={(e) => onChangeSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#0B241E]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] font-mono text-[11px] text-[#64748B] uppercase">
              <tr>
                <th className="p-3.5">Nomor Manifes &amp; Tanggal</th>
                <th className="p-3.5">Armada Kapal Ferry</th>
                <th className="p-3.5">Rute Penyeberangan</th>
                <th className="p-3.5">Jumlah Penumpang</th>
                <th className="p-3.5">Kendaraan &amp; Kargo</th>
                <th className="p-3.5">Retribusi Terminal (PAD)</th>
                <th className="p-3.5">Kelas Terminal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {manifests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[#64748B]">
                    Belum ada data manifes kapal penyeberangan yang tercatat.
                  </td>
                </tr>
              ) : (
                manifests.map((m) => (
                  <tr key={m.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="p-3.5">
                      <div className="font-mono font-bold text-[#0B241E] flex items-center gap-1.5">
                        <Ship className="w-3.5 h-3.5 text-blue-600" />
                        {m.manifestNumber}
                      </div>
                      <div className="text-[10px] text-gray-400 mt-0.5">
                        {new Date(m.createdAt).toLocaleDateString("id-ID")}
                      </div>
                    </td>

                    <td className="p-3.5">
                      <div className="font-semibold text-gray-900">
                        {m.visit?.vessel?.name || "KMP. Poumako Ferry"}
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono">
                        {m.visit?.visitNumber || "VIST-REG"}
                      </div>
                    </td>

                    <td className="p-3.5 font-medium text-gray-800">
                      {m.ferryRoute?.destinationName || "Poumako - Agats (PP)"}
                    </td>

                    <td className="p-3.5 text-gray-800">
                      <div>
                        Dewasa: <span className="font-bold">{m.adultCount}</span> Org
                      </div>
                      <div className="text-[11px] text-gray-500">
                        Anak: {m.childCount} | Pengantar: {m.greeterCount}
                      </div>
                    </td>

                    <td className="p-3.5 text-gray-800">
                      <div>
                        Kendaraan: <span className="font-bold">{m.vehicleCount}</span> Unit
                      </div>
                      <div className="text-[11px] text-gray-500">
                        Kargo: {Number(m.cargoTons)} Ton
                      </div>
                    </td>

                    <td className="p-3.5 font-mono font-black text-emerald-800 text-sm">
                      Rp {Number(m.terminalFeeIdr).toLocaleString("id-ID")}
                    </td>

                    <td className="p-3.5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                        {m.terminalClass.replace(/_/g, " ")}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rute Penyeberangan Resmi (GET /gate-ticketing/ferry-routes) */}
      <div className="bg-white border border-[#CBD5E1] rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#F1F5F9] bg-[#FAFCFB] flex items-center justify-between text-xs">
          <div>
            <h3 className="font-extrabold text-sm text-[#0B241E] flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#D97706]" />
              <span>Daftar Rute Penyeberangan &amp; Tarif Penumpang ({ferryRoutes.length})</span>
            </h3>
            <p className="text-[11px] text-[#64748B] mt-0.5">
              Referensi jarak mil laut dan tarif resmi penumpang dewasa/anak sesuai Perda Kab. Mimika No. 4/2023.
            </p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] font-mono text-[11px] text-[#64748B] uppercase">
              <tr>
                <th className="p-3.5">Tujuan Penyeberangan</th>
                <th className="p-3.5">Jarak Tempuh</th>
                <th className="p-3.5">Tarif Penumpang Dewasa</th>
                <th className="p-3.5">Tarif Penumpang Anak</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {ferryRoutes.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-[#64748B]">
                    Belum ada rute penyeberangan terdaftar.
                  </td>
                </tr>
              ) : (
                ferryRoutes.map((r) => (
                  <tr key={r.id} className="hover:bg-[#F8FAFC]">
                    <td className="p-3.5 font-bold text-[#0B241E]">{r.destinationName}</td>
                    <td className="p-3.5 font-mono text-[#475569]">{r.distanceMiles} Mil Laut</td>
                    <td className="p-3.5 font-mono font-bold text-emerald-800">
                      Rp {Number(r.adultFareIdr).toLocaleString("id-ID")}
                    </td>
                    <td className="p-3.5 font-mono font-semibold text-[#0B241E]">
                      Rp {Number(r.childFareIdr).toLocaleString("id-ID")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
