"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  MessageSquare,
  CheckCircle2,
  Clock,
  Search,
  AlertCircle,
  ThumbsUp,
  RefreshCw,
  Building2,
} from "lucide-react";
import { useDinasStore } from "@/store/dinas.store";

function DinasPengaduanContent() {
  const searchParams = useSearchParams();
  const portIdParam = searchParams.get("portId");
  const selectedPortFilter = portIdParam && portIdParam !== "all" ? Number(portIdParam) : undefined;

  const { complaints, isLoading, error, fetchComplaints } = useDinasStore();

  const [complaintFilter, setComplaintFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    fetchComplaints(selectedPortFilter);
  }, [fetchComplaints, selectedPortFilter]);

  const filteredComplaints = complaints.filter((comp) => {
    const matchesSearch =
      comp.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comp.reporterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (comp.port?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (comp.category || "").toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (complaintFilter === "RESOLVED") {
      return comp.status === "RESOLVED" || comp.status === "CLOSED";
    }
    if (complaintFilter !== "ALL" && comp.status !== complaintFilter) {
      return false;
    }
    return true;
  });

  const countTotal = complaints.length;
  const countResolved = complaints.filter(
    (c) => c.status === "RESOLVED" || c.status === "CLOSED"
  ).length;
  const countInProgress = complaints.filter((c) => c.status === "IN_PROGRESS").length;
  const countOpen = complaints.filter((c) => c.status === "OPEN").length;
  const slaCompliance = countTotal > 0 ? ((countResolved / countTotal) * 100).toFixed(1) : "100.0";

  return (
    <div className="space-y-6">
      {/* ========================================================= */}
      {/* 1. OVERLAPPING PENGADUAN & LAYANAN KPI CARDS              */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Pengaduan */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <MessageSquare className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
              Data Riil API
            </span>
          </div>
          <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mt-3">
            Total Laporan Pengaduan
          </p>
          <p className="text-2xl font-extrabold text-[#0B241E] font-mono mt-1">
            {countTotal}{" "}
            <span className="text-xs font-normal text-gray-500">Laporan</span>
          </p>
          <p className="text-[11px] text-[#64748B] mt-1.5">
            Kanal publik, loket gerbang & posko UPTD
          </p>
        </div>

        {/* Card 2: Kepatuhan SLA Penyelesaian (< 24 Jam) */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
              SLA {slaCompliance}%
            </span>
          </div>
          <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mt-3">
            Selesai Tepat Waktu (&lt; 24 Jam)
          </p>
          <p className="text-2xl font-extrabold text-emerald-700 font-mono mt-1">
            {countResolved}{" "}
            <span className="text-xs font-normal text-gray-500">Tuntas</span>
          </p>
          <p className="text-[11px] text-emerald-600 mt-1.5 font-semibold">
            Standar kepatuhan pelayanan prima Ombudsman
          </p>
        </div>

        {/* Card 3: Dalam Penanganan Petugas */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
              {countInProgress} Kasus
            </span>
          </div>
          <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mt-3">
            Dalam Penanganan Petugas
          </p>
          <p className="text-2xl font-extrabold text-amber-600 font-mono mt-1">
            {countInProgress + countOpen}{" "}
            <span className="text-xs font-normal text-gray-500">Proses</span>
          </p>
          <p className="text-[11px] text-amber-700 mt-1.5 font-semibold">
            {countOpen} tiket baru menunggu tindakan
          </p>
        </div>

        {/* Card 4: Indeks Kepuasan Pengguna Jasa */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
              <ThumbsUp className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-mono font-bold text-teal-700 bg-teal-100 px-2 py-0.5 rounded-full">
              Ombudsman
            </span>
          </div>
          <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mt-3">
            Kepatuhan Pelayanan Publik
          </p>
          <p className="text-2xl font-extrabold text-[#0B241E] font-mono mt-1">
            Zona Hijau
          </p>
          <p className="text-[11px] text-[#64748B] mt-1.5">
            Monitoring tanggap darurat & kepatuhan SLA
          </p>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between text-xs text-red-700">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => fetchComplaints(selectedPortFilter)}
            className="flex items-center gap-1 font-bold text-red-800 hover:underline cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Muat Ulang
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. TAB CONTROLS & FILTER TABLE                            */}
      {/* ========================================================= */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nomor tiket, nama pelapor, atau aduan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#0B241E]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
            <span className="text-xs text-gray-400 font-medium">Status:</span>
            <button
              type="button"
              onClick={() => setComplaintFilter("ALL")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                complaintFilter === "ALL"
                  ? "bg-[#0B241E] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Semua ({countTotal})
            </button>
            <button
              type="button"
              onClick={() => setComplaintFilter("RESOLVED")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                complaintFilter === "RESOLVED"
                  ? "bg-emerald-600 text-white"
                  : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              }`}
            >
              Tuntas ({countResolved})
            </button>
            <button
              type="button"
              onClick={() => setComplaintFilter("IN_PROGRESS")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                complaintFilter === "IN_PROGRESS"
                  ? "bg-blue-600 text-white"
                  : "bg-blue-50 text-blue-700 hover:bg-blue-100"
              }`}
            >
              Diproses ({countInProgress})
            </button>
            <button
              type="button"
              onClick={() => setComplaintFilter("OPEN")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                complaintFilter === "OPEN"
                  ? "bg-amber-600 text-white"
                  : "bg-amber-50 text-amber-700 hover:bg-amber-100"
              }`}
            >
              Baru ({countOpen})
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAFBFB] text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-100">
              <tr>
                <th className="py-3 px-4">No. Tiket & Tanggal</th>
                <th className="py-3 px-4">Pelabuhan & Kategori</th>
                <th className="py-3 px-4">Pelapor & Kontak</th>
                <th className="py-3 px-4">Isi Keluhan Masyarakat</th>
                <th className="py-3 px-4">Tindak Lanjut & Disposisi UPTD</th>
                <th className="py-3 px-4 text-center">Status SLA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {isLoading && complaints.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-2 font-mono">
                      <RefreshCw className="w-5 h-5 animate-spin text-gray-400" />
                      <span>Memuat data pengaduan publik dari Backend...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredComplaints.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-1">
                      <MessageSquare className="w-8 h-8 text-gray-300 stroke-[1.5]" />
                      <p className="font-medium text-gray-600 mt-2">Tidak ada laporan pengaduan</p>
                      <p className="text-[11px] text-gray-400">
                        Belum ada tiket pengaduan publik yang sesuai dengan filter pencarian ini.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredComplaints.map((comp) => {
                  const dateStr = comp.createdAt ? comp.createdAt.split("T")[0] : "-";
                  const timeStr = comp.createdAt && comp.createdAt.includes("T")
                    ? comp.createdAt.split("T")[1]?.slice(0, 5) + " WIT"
                    : "";

                  const isCompleted = comp.status === "RESOLVED" || comp.status === "CLOSED";
                  const isProcessing = comp.status === "IN_PROGRESS";

                  return (
                    <tr key={comp.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#0B241E] font-mono">
                          {comp.ticketNumber}
                        </div>
                        <div className="text-[11px] text-gray-400 mt-0.5">
                          {dateStr} {timeStr ? `(${timeStr})` : ""}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {comp.port?.name && (
                          <div className="flex items-center gap-1 text-[11px] font-semibold text-gray-700 mb-1">
                            <Building2 className="w-3 h-3 text-gray-400 shrink-0" />
                            <span>{comp.port.name}</span>
                          </div>
                        )}
                        <span className="font-bold text-gray-800 bg-gray-100 px-2 py-0.5 rounded text-[10px]">
                          {comp.category ? comp.category.replace(/_/g, " ") : "UMUM"}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-gray-900">
                          {comp.reporterName || "Masyarakat Umum"}
                        </div>
                        {comp.reporterPhone ? (
                          <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                            {comp.reporterPhone}
                          </div>
                        ) : (
                          <div className="text-[10px] text-gray-400 italic">Kontak anonim</div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="text-[11px] text-gray-700 line-clamp-3" title={comp.description}>
                          &quot;{comp.description}&quot;
                        </p>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        {comp.resolutionNotes ? (
                          <p className="text-[11px] text-emerald-800 font-medium bg-emerald-50/80 border border-emerald-200/60 rounded-md p-2">
                            {comp.resolutionNotes}
                          </p>
                        ) : (
                          <span className="text-[11px] text-amber-700 italic flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Menunggu disposisi teknisi jaga UPTD
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {isCompleted ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3 h-3" />
                            Tuntas
                          </span>
                        ) : isProcessing ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                            <Clock className="w-3 h-3" />
                            Diproses
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                            <AlertCircle className="w-3 h-3" />
                            Tiket Baru
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
    </div>
  );
}

export default function DinasPengaduanPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs font-mono text-gray-400">
          Memuat Pemantauan Layanan & Pengaduan Publik...
        </div>
      }
    >
      <DinasPengaduanContent />
    </Suspense>
  );
}
