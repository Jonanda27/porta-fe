"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Download,
  FileCheck2,
  FileSpreadsheet,
  Info,
  RefreshCw,
  Search,
  ShieldCheck,
  Ship,
  Users,
  X,
} from "lucide-react";
import { useManifestStore } from "@/store/manifest.store";
import { useKapalStore } from "@/store/kapal.store";
import { VesselManifestItem } from "@/types/manifest.types";
import { ModalPortal } from "@/components/ui/ModalPortal";

export default function KapalManifesPage() {
  const { visits, fetchVisits, isLoading: isLoadingVisits } = useKapalStore();
  const {
    manifests,
    isLoading: isLoadingManifests,
    error,
    fetchManifests,
    clearError,
  } = useManifestStore();

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedManifest, setSelectedManifest] = useState<VesselManifestItem | null>(null);

  useEffect(() => {
    fetchVisits();
    fetchManifests();
  }, [fetchVisits, fetchManifests]);

  const issuedVisitIds = useMemo(() => {
    return new Set(manifests.map((m) => m.visitId));
  }, [manifests]);

  const pendingManifestVisits = useMemo(() => {
    return visits.filter(
      (v) =>
        ["APPROVED", "SCHEDULED", "ARRIVED", "BERTHED"].includes(v.status) &&
        !issuedVisitIds.has(v.id)
    );
  }, [visits, issuedVisitIds]);

  const filteredManifests = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return manifests;
    return manifests.filter((m) => {
      const vesselName = m.visit?.vessel?.name?.toLowerCase() || "";
      const visitNo = m.visit?.visitNumber?.toLowerCase() || "";
      const mnfNo = m.manifestNumber.toLowerCase();
      const dest = m.ferryRoute?.destinationName?.toLowerCase() || "";
      return (
        mnfNo.includes(q) ||
        vesselName.includes(q) ||
        visitNo.includes(q) ||
        dest.includes(q)
      );
    });
  }, [manifests, searchQuery]);

  const totalPassengers = useMemo(() => {
    return manifests.reduce(
      (sum, m) => sum + m.adultCount + m.childCount + m.infantCount,
      0
    );
  }, [manifests]);

  const handleDownloadSummary = (mnf: VesselManifestItem) => {
    const vesselName = mnf.visit?.vessel?.name || `Visit #${mnf.visitId}`;
    const visitNumber = mnf.visit?.visitNumber || `#${mnf.visitId}`;
    const destination = mnf.ferryRoute?.destinationName || "Pelayaran Domestik";
    const totalPax = mnf.adultCount + mnf.childCount + mnf.infantCount;

    const lines = [
      "=======================================================",
      "   DOKUMEN MANIFES RESMI PELAYARAN (PORTA - UPT)      ",
      "=======================================================",
      `Nomor Manifes      : ${mnf.manifestNumber}`,
      `Nomor Kunjungan    : ${visitNumber}`,
      `Nama Kapal         : ${vesselName}`,
      `Trayek Tujuan      : ${destination}`,
      `Kelas Terminal     : ${mnf.terminalClass}`,
      `Waktu Terbit       : ${new Date(mnf.createdAt).toLocaleString("id-ID", { timeZone: "Asia/Jayapura" })} WIT`,
      "-------------------------------------------------------",
      `Penumpang Dewasa   : ${mnf.adultCount} Orang`,
      `Penumpang Anak     : ${mnf.childCount} Orang`,
      `Penumpang Bayi     : ${mnf.infantCount} Orang`,
      `Total Penumpang    : ${totalPax} Orang`,
      `Pengantar/Penjemput: ${mnf.greeterCount} Orang`,
      `Total Kendaraan    : ${mnf.vehicleCount} Unit`,
      `Muatan Kargo       : ${mnf.cargoTons} Ton`,
      `Biaya Pas Terminal : Rp ${Number(mnf.terminalFeeIdr || 0).toLocaleString("id-ID")}`,
      "-------------------------------------------------------",
      `Catatan Petugas    : ${mnf.notes || "-"}`,
      "=======================================================",
      "Diterbitkan resmi oleh Petugas Pelabuhan (UPT).",
    ].join("\n");

    const blob = new Blob([lines], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${mnf.manifestNumber}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={clearError}
            className="text-rose-600 hover:text-rose-900 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Banner SOP Penerbitan Manifes oleh Petugas UPT */}
      <div className="bg-white border border-[#CBD5E1] rounded-2xl p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0B241E] text-[#D97706] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-[#0B241E]">
              Manifes Resmi Pelayaran dari Petugas Pelabuhan (UPT)
            </h2>
            <p className="text-xs text-[#64748B] mt-0.5 leading-relaxed max-w-3xl">
              Sesuai SOP operasional pelabuhan, rekap manifes penumpang, kendaraan, dan muatan diterbitkan secara resmi oleh{" "}
              <strong className="text-[#0B241E]">Petugas UPT</strong> berdasarkan pencatatan gerbang/terminal untuk diserahkan kepada Operator Kapal sebagai kelengkapan{" "}
              <strong className="text-[#0B241E]">Clearance SPB</strong>.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            fetchVisits();
            fetchManifests();
          }}
          disabled={isLoadingVisits || isLoadingManifests}
          className="px-3.5 py-2 text-xs font-bold text-[#0B241E] bg-[#F8FAFC] hover:bg-[#F1F5F9] rounded-xl border border-[#CBD5E1] flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${isLoadingVisits || isLoadingManifests ? "animate-spin" : ""}`}
          />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Ringkasan KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
              Manifes Terbit (UPT)
            </span>
            <FileCheck2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-[#0B241E] font-mono mt-1">
            {manifests.length} Dokumen
          </p>
          <p className="text-[11px] text-[#64748B] mt-1">
            Diterbitkan resmi untuk armada Anda
          </p>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
              Total Penumpang Tercatat
            </span>
            <Users className="w-4 h-4 text-[#0284C7]" />
          </div>
          <p className="text-2xl font-extrabold text-[#0B241E] font-mono mt-1">
            {totalPassengers.toLocaleString("id-ID")} Orang
          </p>
          <p className="text-[11px] text-[#64748B] mt-1">
            Akumulasi seluruh pelayaran tercatat
          </p>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
              Menunggu Terbit UPT
            </span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-extrabold text-[#0B241E] font-mono mt-1">
            {pendingManifestVisits.length} Kunjungan
          </p>
          <p className="text-[11px] text-[#64748B] mt-1">
            Jadwal aktif menunggu rilis manifes UPT
          </p>
        </div>
      </div>

      {/* Antrean Kunjungan Aktif yang Menunggu Penerbitan Manifes dari UPT */}
      {pendingManifestVisits.length > 0 && (
        <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-700 shrink-0" />
            <h3 className="text-xs font-extrabold text-amber-950 uppercase tracking-wide">
              Kunjungan Aktif Menunggu Penerbitan Manifes oleh Petugas UPT ({pendingManifestVisits.length})
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pendingManifestVisits.map((v) => (
              <div
                key={v.id}
                className="bg-white border border-amber-200/80 rounded-xl p-3.5 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="text-xs font-extrabold text-[#0B241E] truncate">
                    {v.vessel?.name || `Kapal #${v.vesselId}`}
                  </p>
                  <p className="text-[11px] font-mono text-[#64748B] mt-0.5">
                    {v.visitNumber} • ETA:{" "}
                    {new Date(v.eta).toLocaleString("id-ID", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                      timeZone: "Asia/Jayapura",
                    })}{" "}
                    WIT
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 whitespace-nowrap shrink-0">
                  Menunggu Petugas UPT
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Daftar Manifes Resmi yang Diterbitkan Petugas UPT */}
      <div className="bg-white border border-[#CBD5E1] rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F1F5F9] pb-4">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-[#0B241E]" />
            <div>
              <h3 className="text-sm font-extrabold text-[#0B241E]">
                Daftar Manifes Resmi Diterbitkan Petugas UPT
              </h3>
              <p className="text-[11px] text-[#64748B]">
                Total {filteredManifests.length} dokumen manifes diterima oleh operator kapal
              </p>
            </div>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari no. manifes, kapal, atau tujuan..."
              className="w-full pl-8 pr-3 py-2 text-xs bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#0B241E]"
            />
          </div>
        </div>

        {isLoadingManifests && manifests.length === 0 ? (
          <div className="py-10 text-center text-xs text-[#64748B] flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-[#0B241E]" />
            <span>Memuat manifes resmi dari server backend...</span>
          </div>
        ) : filteredManifests.length === 0 ? (
          <div className="py-10 text-center text-xs text-[#64748B]">
            <Info className="w-6 h-6 text-[#94A3B8] mx-auto mb-2" />
            <p className="font-semibold text-[#0B241E]">
              {manifests.length === 0
                ? "Belum Ada Manifes Diterbitkan oleh Petugas UPT"
                : "Data Manifes Tidak Ditemukan"}
            </p>
            <p className="text-[11px] mt-1 max-w-md mx-auto">
              {manifests.length === 0
                ? "Manifes akan muncul secara otomatis di sini setelah Petugas Pelabuhan (UPT) menerbitkan rekap penumpang dan muatan untuk kunjungan kapal Anda."
                : "Coba ubah kata kunci pencarian Anda."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] uppercase text-[10px] font-mono">
                <tr>
                  <th className="p-3">No. Manifes</th>
                  <th className="p-3">Kapal &amp; Kunjungan</th>
                  <th className="p-3">Trayek Tujuan</th>
                  <th className="p-3 text-center">Penumpang</th>
                  <th className="p-3 text-center">Kendaraan</th>
                  <th className="p-3 text-center">Muatan</th>
                  <th className="p-3">Pas Terminal</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {filteredManifests.map((mnf) => (
                  <tr key={mnf.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="p-3 font-mono font-bold text-[#0B241E] whitespace-nowrap">
                      {mnf.manifestNumber}
                    </td>
                    <td className="p-3">
                      <p className="font-bold text-[#0B241E]">
                        {mnf.visit?.vessel?.name || "Armada Pelayaran"}
                      </p>
                      <p className="text-[10px] font-mono text-[#64748B]">
                        {mnf.visit?.visitNumber || `Visit #${mnf.visitId}`}
                      </p>
                    </td>
                    <td className="p-3">
                      <span className="font-medium text-[#0B241E]">
                        {mnf.ferryRoute?.destinationName
                          ? `Tujuan ${mnf.ferryRoute.destinationName}`
                          : "Pelayaran Domestik"}
                      </span>
                    </td>
                    <td className="p-3 text-center font-mono">
                      <span className="font-bold text-[#0B241E]">
                        {mnf.adultCount + mnf.childCount + mnf.infantCount} Orang
                      </span>
                      <p className="text-[9.5px] text-[#64748B]">
                        (D: {mnf.adultCount}, A: {mnf.childCount}, B: {mnf.infantCount})
                      </p>
                    </td>
                    <td className="p-3 text-center font-mono font-bold text-[#0B241E]">
                      {mnf.vehicleCount} Unit
                    </td>
                    <td className="p-3 text-center font-mono font-semibold text-[#334155]">
                      {mnf.cargoTons} Ton
                    </td>
                    <td className="p-3 font-mono font-bold text-emerald-800 whitespace-nowrap">
                      Rp {Number(mnf.terminalFeeIdr || 0).toLocaleString("id-ID")}
                    </td>
                    <td className="p-3 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 whitespace-nowrap">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Diterbitkan UPT</span>
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedManifest(mnf)}
                          className="px-2.5 py-1.5 rounded-lg border border-[#CBD5E1] text-[11px] font-bold text-[#0B241E] hover:bg-[#F1F5F9] cursor-pointer"
                        >
                          Detail
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDownloadSummary(mnf)}
                          className="px-2.5 py-1.5 rounded-lg bg-[#0B241E] text-white text-[11px] font-bold hover:bg-[#13382F] inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Download className="w-3 h-3" />
                          <span>Unduh</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Detail Manifes */}
      {selectedManifest && (
        <ModalPortal>
          <div className="fixed inset-0 z-[100] bg-[#0B241E]/55 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#0B241E] text-[#D97706] flex items-center justify-center">
                  <Ship className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-[#0B241E]">
                    Detail Manifes Resmi
                  </h4>
                  <p className="text-[11px] font-mono text-[#64748B]">
                    {selectedManifest.manifestNumber}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedManifest(null)}
                className="p-1.5 rounded-lg text-[#64748B] hover:bg-[#E2E8F0] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3.5">
                <div>
                  <span className="text-[10px] font-bold text-[#94A3B8] uppercase">
                    Kapal
                  </span>
                  <p className="font-extrabold text-[#0B241E] mt-0.5">
                    {selectedManifest.visit?.vessel?.name || "-"}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#94A3B8] uppercase">
                    No. Kunjungan
                  </span>
                  <p className="font-mono font-bold text-[#0B241E] mt-0.5">
                    {selectedManifest.visit?.visitNumber || `#${selectedManifest.visitId}`}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#94A3B8] uppercase">
                    Trayek Tujuan
                  </span>
                  <p className="font-semibold text-[#0B241E] mt-0.5">
                    {selectedManifest.ferryRoute?.destinationName || "Pelayaran Domestik"}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#94A3B8] uppercase">
                    Waktu Terbit
                  </span>
                  <p className="font-mono font-semibold text-[#0B241E] mt-0.5">
                    {new Date(selectedManifest.createdAt).toLocaleString("id-ID", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      timeZone: "Asia/Jayapura",
                    })}{" "}
                    WIT
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5 text-center">
                <div className="border border-[#E2E8F0] rounded-xl p-2.5">
                  <span className="text-[10px] text-[#64748B] block">Dewasa</span>
                  <strong className="text-sm font-mono text-[#0B241E]">
                    {selectedManifest.adultCount}
                  </strong>
                </div>
                <div className="border border-[#E2E8F0] rounded-xl p-2.5">
                  <span className="text-[10px] text-[#64748B] block">Anak</span>
                  <strong className="text-sm font-mono text-[#0B241E]">
                    {selectedManifest.childCount}
                  </strong>
                </div>
                <div className="border border-[#E2E8F0] rounded-xl p-2.5">
                  <span className="text-[10px] text-[#64748B] block">Bayi</span>
                  <strong className="text-sm font-mono text-[#0B241E]">
                    {selectedManifest.infantCount}
                  </strong>
                </div>
                <div className="border border-[#E2E8F0] rounded-xl p-2.5">
                  <span className="text-[10px] text-[#64748B] block">Kendaraan</span>
                  <strong className="text-sm font-mono text-[#0B241E]">
                    {selectedManifest.vehicleCount} Unit
                  </strong>
                </div>
                <div className="border border-[#E2E8F0] rounded-xl p-2.5">
                  <span className="text-[10px] text-[#64748B] block">Muatan</span>
                  <strong className="text-sm font-mono text-[#0B241E]">
                    {selectedManifest.cargoTons} Ton
                  </strong>
                </div>
                <div className="border border-[#E2E8F0] rounded-xl p-2.5">
                  <span className="text-[10px] text-[#64748B] block">Pas Terminal</span>
                  <strong className="text-xs font-mono text-emerald-700">
                    Rp {Number(selectedManifest.terminalFeeIdr || 0).toLocaleString("id-ID")}
                  </strong>
                </div>
              </div>

              {selectedManifest.notes && (
                <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3">
                  <span className="text-[10px] font-bold text-[#64748B] uppercase block mb-1">
                    Catatan Petugas UPT
                  </span>
                  <p className="text-[#334155] leading-relaxed">{selectedManifest.notes}</p>
                </div>
              )}
            </div>

            <div className="px-5 py-3.5 bg-[#F8FAFC] border-t border-[#E2E8F0] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedManifest(null)}
                className="px-4 py-2 rounded-xl border border-[#CBD5E1] text-xs font-bold text-[#334155] hover:bg-white cursor-pointer"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => handleDownloadSummary(selectedManifest)}
                className="px-4 py-2 rounded-xl bg-[#0B241E] text-white text-xs font-bold hover:bg-[#13382F] inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Ringkasan Manifes</span>
              </button>
            </div>
          </div>
        </div>
        </ModalPortal>
      )}
    </div>
  );
}
