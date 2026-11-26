"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { formatRupiah } from "@/lib/kapal-billing";
import {
  Ship,
  Clock,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Search,
  Download,
  Printer,
  Eye,
  Anchor,
  TrendingUp,
  Receipt,
  X,
  Building2,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  MapPin,
  ArrowRight,
} from "lucide-react";
import { useKapalStore } from "@/store/kapal.store";
import { useAuthStore } from "@/store/auth.store";
import { VesselVisit } from "@/types/kapal.types";
import { ModalPortal } from "@/components/ui/ModalPortal";

export default function KapalRiwayatPage() {
  const { user } = useAuthStore();
  const {
    visits,
    vessels,
    isLoading,
    error,
    fetchVisits,
    fetchVessels,
    fetchVisitDetail,
    selectedVisitDetail,
  } = useKapalStore();

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedVesselFilter, setSelectedVesselFilter] = useState<string>("all");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("all");
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [activeVisit, setActiveVisit] = useState<VesselVisit | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState<boolean>(false);

  useEffect(() => {
    fetchVisits();
    fetchVessels();
  }, [fetchVisits, fetchVessels]);

  const filteredVisits = useMemo(() => {
    return visits.filter((v) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        v.visitNumber.toLowerCase().includes(q) ||
        (v.vessel?.name && v.vessel.name.toLowerCase().includes(q)) ||
        (v.originPort && v.originPort.toLowerCase().includes(q)) ||
        (v.destinationPort && v.destinationPort.toLowerCase().includes(q));

      const matchVessel =
        selectedVesselFilter === "all" ||
        v.vesselId.toString() === selectedVesselFilter;

      const matchStatus =
        selectedStatusFilter === "all" || v.status === selectedStatusFilter;

      return matchSearch && matchVessel && matchStatus;
    });
  }, [visits, searchQuery, selectedVesselFilter, selectedStatusFilter]);

  // KPI Calculations
  const totalCalls = visits.length;
  const completedCalls = visits.filter((v) => v.status === "DEPARTED").length;
  const activeCalls = visits.filter(
    (v) => v.status === "BERTHED" || v.status === "ARRIVED" || v.status === "APPROVED"
  ).length;

  const handleOpenDetail = async (visit: VesselVisit) => {
    setActiveVisit(visit);
    setIsDetailModalOpen(true);
    setIsLoadingDetail(true);
    try {
      await fetchVisitDetail(visit.id);
    } catch {
      // Fallback to activeVisit
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const formatDateTime = (dateStr?: string | null) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return d.toLocaleString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }) + " WIT";
  };


  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DEPARTED":
        return {
          label: "Selesai (Bertolak)",
          className: "bg-emerald-100 text-emerald-800 border-emerald-300",
        };
      case "BERTHED":
        return {
          label: "Sedang Sandar",
          className: "bg-blue-100 text-blue-800 border-blue-300",
        };
      case "ARRIVED":
        return {
          label: "Tiba di Kolam Labuh",
          className: "bg-cyan-100 text-cyan-800 border-cyan-300",
        };
      case "APPROVED":
        return {
          label: "Izin Disetujui",
          className: "bg-amber-100 text-amber-800 border-amber-300",
        };
      case "REQUESTED":
        return {
          label: "Menunggu Verifikasi",
          className: "bg-slate-100 text-slate-800 border-slate-300",
        };
      default:
        return {
          label: status,
          className: "bg-gray-100 text-gray-800 border-gray-300",
        };
    }
  };

  const calculateDwellHours = (ata?: string | null, atd?: string | null) => {
    if (!ata || !atd) return "-";
    const start = new Date(ata).getTime();
    const end = new Date(atd).getTime();
    const diffHours = (end - start) / (1000 * 60 * 60);
    return diffHours > 0 ? `${diffHours.toFixed(1)} Jam` : "-";
  };

  return (
    <div className="space-y-6">
      {/* Global Error Banner */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => fetchVisits()}
            className="underline font-bold hover:text-rose-950 cursor-pointer"
          >
            Muat Ulang
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. TOP KPI SUMMARY DECK                                                   */}
      {/* ========================================================================= */}
      <div className="bg-white border border-[#CBD5E1] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F1F5F9] pb-3">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#D97706] bg-[#0B241E] px-2.5 py-0.5 rounded">
              BUKU LOG KUNJUNGAN REALISASI PELABUHAN POUMAKO
            </span>
            <h2 className="text-base sm:text-lg font-black text-[#0B241E] mt-1">
              Catatan Riwayat Pelayanan Sandar Armada Kapal
            </h2>
            <p className="text-xs text-[#64748B] mt-0.5">
              Operator: {user?.fullName || "PT Pelayaran Mimika Sejahtera"} • Sesuai Ketetapan Waktu Layanan & Perda Mimika No. 4/2023
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 bg-[#F8FAFC] hover:bg-[#E2E8F0] border border-[#CBD5E1] text-[#0B241E] text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-[#D97706]" />
              <span>Cetak Rekap Riwayat</span>
            </button>
            <button
              onClick={() => fetchVisits()}
              disabled={isLoading}
              className="p-2 border border-[#CBD5E1] bg-white rounded-xl hover:bg-[#F8FAFC] text-[#64748B] hover:text-[#0B241E] cursor-pointer disabled:opacity-50"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* 4 Cards Metrik KPI */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-[#64748B] uppercase">Total Kunjungan Tercatat</p>
              <p className="text-2xl font-black text-[#0B241E] font-mono mt-0.5">{totalCalls} Call</p>
              <p className="text-[10px] text-[#94A3B8] mt-0.5">Sejak Pelayaran Perdana</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-200/60 text-[#0B241E] flex items-center justify-center">
              <Ship className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-[#64748B] uppercase">Pelayaran Selesai (Departed)</p>
              <p className="text-2xl font-black text-emerald-700 font-mono mt-0.5">{completedCalls} Kunjungan</p>
              <p className="text-[10px] text-emerald-800 mt-0.5">Buku Log Sandar Ditutup</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-[#64748B] uppercase">Operasi Berjalan / Aktif</p>
              <p className="text-2xl font-black text-blue-700 font-mono mt-0.5">{activeCalls} Kunjungan</p>
              <p className="text-[10px] text-blue-800 mt-0.5">Dalam Siklus Layanan</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
              <Anchor className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-[#64748B] uppercase">Rata-rata Waktu Sandar</p>
              <p className="text-2xl font-black text-[#0B241E] font-mono mt-0.5">~6.0 Jam</p>
              <p className="text-[10px] text-emerald-700 font-bold mt-0.5">Efisien (1 Etmal Bulat)</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. FILTER & SEARCH CONTROL DECK                                           */}
      {/* ========================================================================= */}
      <div className="bg-white border border-[#CBD5E1] rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Input Search */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nomor kunjungan, kapal, rute..."
              className="w-full pl-9 pr-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs focus:border-[#0B241E] focus:outline-hidden"
            />
          </div>

          {/* Filter Dropdown Armada */}
          <select
            value={selectedVesselFilter}
            onChange={(e) => setSelectedVesselFilter(e.target.value)}
            className="p-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs font-semibold focus:border-[#0B241E]"
          >
            <option value="all">Semua Armada Kapal</option>
            {vessels.map((v) => (
              <option key={v.id} value={v.id.toString()}>
                {v.name} ({v.grossTonnage} GT)
              </option>
            ))}
          </select>

          {/* Filter Dropdown Status */}
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="p-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs font-semibold focus:border-[#0B241E]"
          >
            <option value="all">Semua Status Kunjungan</option>
            <option value="DEPARTED">Selesai (DEPARTED)</option>
            <option value="BERTHED">Sedang Sandar (BERTHED)</option>
            <option value="APPROVED">Disetujui (APPROVED)</option>
            <option value="REQUESTED">Permohonan (REQUESTED)</option>
          </select>
        </div>

        <div className="text-xs font-mono font-bold text-[#64748B] shrink-0">
          Menampilkan {filteredVisits.length} dari {visits.length} Kunjungan
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. TABEL LOG KUNJUNGAN REALISASI                                          */}
      {/* ========================================================================= */}
      <div className="bg-white border border-[#CBD5E1] rounded-2xl overflow-hidden shadow-xs">
        {isLoading && visits.length === 0 ? (
          <div className="p-10 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-[#0B241E] animate-spin mx-auto" />
            <p className="text-xs text-[#64748B]">Memuat buku log kunjungan kapal dari server...</p>
          </div>
        ) : filteredVisits.length === 0 ? (
          <div className="p-10 text-center space-y-2 text-xs text-[#64748B]">
            <FileText className="w-10 h-10 text-[#94A3B8] mx-auto" />
            <p className="font-bold text-[#0B241E] text-sm">Tidak ada riwayat kunjungan yang sesuai kriteria.</p>
            <p>Silakan sesuaikan kata kunci pencarian atau filter status Anda.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                  <th className="py-3 px-4">No. Kunjungan (PPK)</th>
                  <th className="py-3 px-4">Armada Kapal</th>
                  <th className="py-3 px-4">Rute Pelayaran</th>
                  <th className="py-3 px-4">Jadwal ETA / ETD</th>
                  <th className="py-3 px-4">Waktu Sandar (ATA/ATD)</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Detail Buku Log</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {filteredVisits.map((visit) => {
                  const badge = getStatusBadge(visit.status);
                  const vesselName = visit.vessel?.name || "Kapal Niaga";
                  const gt = visit.vessel?.grossTonnage || 0;
                  const dwell = calculateDwellHours(visit.ataAnchorage, visit.atdPort);

                  return (
                    <tr key={visit.id} className="hover:bg-[#F8FAFC]/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono">
                        <p className="font-bold text-[#0B241E]">{visit.visitNumber}</p>
                        <p className="text-[10px] text-[#94A3B8]">
                          {visit.visitOrigin === "OPERATOR_REQUEST" ? "Permohonan Operator" : "Insidentil UPT"}
                        </p>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-bold text-[#0B241E] flex items-center gap-1.5">
                          <Ship className="w-3.5 h-3.5 text-[#0B241E]" />
                          <span>{vesselName}</span>
                        </p>
                        <p className="text-[10px] text-[#64748B] font-mono">
                          {Number(gt).toLocaleString()} GT • {visit.vessel?.shippingCategory || "DALAM_NEGERI"}
                        </p>
                      </td>

                      <td className="py-3.5 px-4 text-[#475569]">
                        <div className="flex items-center gap-1 font-semibold text-[#0B241E]">
                          <span>{visit.originPort || "Dobo"}</span>
                          <ArrowRight className="w-3 h-3 text-[#94A3B8]" />
                          <span>{visit.destinationPort || "Poumako"}</span>
                        </div>
                        <p className="text-[10px] text-[#94A3B8]">Pelabuhan Poumako (UPTD Pomako)</p>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px] text-[#64748B]">
                        <p><span className="text-[#94A3B8]">ETA:</span> {formatDateTime(visit.eta)}</p>
                        <p><span className="text-[#94A3B8]">ETD:</span> {formatDateTime(visit.etd)}</p>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px]">
                        <p className="text-[#0B241E] font-semibold">
                          <span className="text-[#94A3B8]">ATA:</span> {formatDateTime(visit.ataAnchorage)}
                        </p>
                        <p className="text-[#0B241E]">
                          <span className="text-[#94A3B8]">ATD:</span> {formatDateTime(visit.atdPort)}
                        </p>
                        {dwell !== "-" && (
                          <span className="inline-block mt-0.5 text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-[#0B241E]">
                            Durasi: {dwell}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.className}`}
                        >
                          {badge.label}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleOpenDetail(visit)}
                          className="px-3 py-1.5 rounded-lg bg-[#F1F5F9] hover:bg-[#0B241E] hover:text-white text-[#0B241E] text-xs font-bold transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Buku Log</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 4. MODAL DETAIL BUKU LOG KUNJUNGAN REALISASI                              */}
      {/* ========================================================================= */}
      {isDetailModalOpen && activeVisit && (
        <ModalPortal>
          <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-[#CBD5E1] overflow-hidden my-8">
            <div className="bg-[#0B241E] text-white p-4 px-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#D97706]" />
                <div>
                  <h3 className="font-bold text-sm">
                    Buku Catatan Log Sandar & Pelayanan Kapal
                  </h3>
                  <p className="text-[11px] text-[#85A69B] font-mono">
                    Nomor Registrasi: {activeVisit.visitNumber}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="text-[#85A69B] hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs bg-[#FAFAFA]">
              {isLoadingDetail ? (
                <div className="py-8 text-center space-y-2">
                  <RefreshCw className="w-6 h-6 text-[#0B241E] animate-spin mx-auto" />
                  <p className="text-xs text-[#64748B]">Memuat detail catatan operasional dermaga...</p>
                </div>
              ) : (
                <>
                  {/* Summary Kunjungan */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-4 rounded-xl border border-[#E2E8F0]">
                    <div className="space-y-1.5">
                      <span className="text-[10px] uppercase font-bold text-[#94A3B8]">Armada & Operator</span>
                      <p className="font-extrabold text-[#0B241E] text-sm">
                        {selectedVisitDetail?.vessel?.name || activeVisit.vessel?.name} (
                        {Number(selectedVisitDetail?.vessel?.grossTonnage || activeVisit.vessel?.grossTonnage || 0).toLocaleString()} GT)
                      </p>
                      <p className="text-[11px] text-[#64748B]">
                        Operator: {selectedVisitDetail?.operator?.name || activeVisit.operator?.name || "PT Pelayaran Mimika Sejahtera"}
                      </p>
                      <p className="text-[11px] text-[#64748B] font-mono">
                        Registrasi: {selectedVisitDetail?.vessel?.registrationNumber || "-"}
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[10px] uppercase font-bold text-[#94A3B8]">Rute & Lokasi Pelabuhan</span>
                      <p className="font-bold text-[#0B241E]">
                        {selectedVisitDetail?.originPort || activeVisit.originPort || "Dobo"} ➔{" "}
                        {selectedVisitDetail?.destinationPort || activeVisit.destinationPort || "Poumako"}
                      </p>
                      <p className="text-[11px] text-[#64748B]">
                        Pelabuhan: {selectedVisitDetail?.port?.name || "Pelabuhan Poumako"}
                      </p>
                      <p className="text-[11px] text-[#64748B]">
                        Status: <strong className="text-emerald-800 uppercase">{selectedVisitDetail?.status || activeVisit.status}</strong>
                      </p>
                    </div>
                  </div>

                  {/* Realisasi Waktu Sandar (ATA/ATD Log) */}
                  <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] space-y-2">
                    <span className="text-[10px] uppercase font-bold text-[#94A3B8] block">
                      Realisasi Buku Waktu Layanan (Stempel Syahbandar / Petugas Dermaga):
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                      <div className="bg-[#F8FAFC] p-2.5 rounded-lg border border-[#E2E8F0]">
                        <span className="text-[9px] uppercase font-bold text-[#94A3B8] block">Rencana Tiba (ETA)</span>
                        <span className="font-mono font-bold text-[#0B241E] text-[11px]">
                          {formatDateTime(selectedVisitDetail?.eta || activeVisit.eta)}
                        </span>
                      </div>

                      <div className="bg-[#F8FAFC] p-2.5 rounded-lg border border-[#E2E8F0]">
                        <span className="text-[9px] uppercase font-bold text-[#94A3B8] block">Rencana Tolak (ETD)</span>
                        <span className="font-mono font-bold text-[#0B241E] text-[11px]">
                          {formatDateTime(selectedVisitDetail?.etd || activeVisit.etd)}
                        </span>
                      </div>

                      <div className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                        <span className="text-[9px] uppercase font-bold text-emerald-800 block">Aktual Tiba (ATA)</span>
                        <span className="font-mono font-bold text-emerald-950 text-[11px]">
                          {formatDateTime(selectedVisitDetail?.ataAnchorage || activeVisit.ataAnchorage)}
                        </span>
                      </div>

                      <div className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                        <span className="text-[9px] uppercase font-bold text-emerald-800 block">Aktual Tolak (ATD)</span>
                        <span className="font-mono font-bold text-emerald-950 text-[11px]">
                          {formatDateTime(selectedVisitDetail?.atdPort || activeVisit.atdPort)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Tagihan Retribusi (e-SKRD) Terkait Kunjungan Ini */}
                  <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-[#94A3B8]">
                        Status e-SKRD & Penagihan Retribusi (PP 35/2023):
                      </span>
                      {selectedVisitDetail?.invoices && selectedVisitDetail.invoices.length > 0 && (
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          {selectedVisitDetail.invoices[0].invoiceNumber} • {selectedVisitDetail.invoices[0].status}
                        </span>
                      )}
                    </div>

                    {selectedVisitDetail?.invoices && selectedVisitDetail.invoices.length > 0 ? (
                      <div className="space-y-1.5 pt-1">
                        {selectedVisitDetail.invoices[0].items?.map((item) => (
                          <div key={item.id} className="flex justify-between text-[#64748B] text-[11px]">
                            <span>{item.description}</span>
                            <span className="font-mono font-bold text-[#0B241E]">
                              {formatRupiah(item.subtotalIdr)}
                            </span>
                          </div>
                        ))}
                        <div className="border-t border-[#E2E8F0] pt-1.5 flex justify-between font-bold text-[#0B241E]">
                          <span>Total Retribusi Daerah:</span>
                          <span className="font-mono text-emerald-800 text-sm">
                            {formatRupiah(selectedVisitDetail.invoices[0].totalAmountIdr)}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-[11px] text-[#64748B] italic">
                        Belum ada tagihan e-SKRD final yang diterbitkan untuk kunjungan ini.
                      </p>
                    )}
                  </div>

                  {/* Catatan Petugas Pelabuhan */}
                  {selectedVisitDetail?.notes && (
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-[#475569]">
                      <span className="font-bold text-[#0B241E] block mb-0.5">Catatan Log Syahbandar:</span>
                      <span>{selectedVisitDetail.notes}</span>
                    </div>
                  )}

                  {/* Modal Footer Buttons */}
                  <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#E2E8F0]">
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="px-4 py-2 bg-white border border-[#CBD5E1] hover:bg-[#F1F5F9] text-[#0B241E] font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Cetak Berita Acara Sandar</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsDetailModalOpen(false)}
                      className="px-4 py-2 bg-[#0B241E] text-white font-extrabold rounded-xl hover:bg-[#143E33] cursor-pointer"
                    >
                      Tutup
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        </ModalPortal>
      )}
    </div>
  );
}
