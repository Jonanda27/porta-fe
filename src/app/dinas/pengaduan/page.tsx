"use client";

import React, { useState } from "react";
import {
  MessageSquare,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Send,
  Filter,
  Search,
  ShieldCheck,
  AlertCircle,
  ThumbsUp,
  FileCheck2,
} from "lucide-react";
import { PublicComplaint } from "@/types/dinas.types";

export default function DinasPengaduanPage() {
  const [complaintFilter, setComplaintFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Sample data pengaduan publik pelabuhan
  const sampleComplaints: PublicComplaint[] = [
    {
      id: 1,
      ticketNumber: "TKT-PMK-2026-042",
      portId: 1,
      category: "TARIF_PUNGLI",
      description:
        "Ada oknum meminta biaya parkir tambahan Rp 10.000 di luar karcis resmi pas gerbang saat menurunkan muatan sayur di dermaga rakyat.",
      reporterName: "Stefanus Wamang",
      reporterPhone: "0812-4899-1122",
      status: "RESOLVED",
      resolutionNotes:
        "Petugas jaga UPT telah menertibkan oknum porter tidak terdaftar dan memasang spanduk peringatan bebas pungli.",
      createdAt: "2026-11-15T09:30:00Z",
      resolvedAt: "2026-11-15T14:15:00Z",
    },
    {
      id: 2,
      ticketNumber: "TKT-PMK-2026-041",
      portId: 1,
      category: "ANTREAN_LOKET",
      description:
        "Antrean tiket pas masuk gerbang kendaraan roda 4 macet panjang hingga 200 meter menjelang keberangkatan KM Sabuk Nusantara 75.",
      reporterName: "Hendra Wijaya (Ekspedisi Timika)",
      reporterPhone: "0811-4922-3344",
      status: "RESOLVED",
      resolutionNotes:
        "UPTD telah membuka loket cadangan kedua (Gate 2) untuk mempercepat tapping karcis dan arus kendaraan logistik.",
      createdAt: "2026-11-14T11:00:00Z",
      resolvedAt: "2026-11-14T13:40:00Z",
    },
    {
      id: 3,
      ticketNumber: "TKT-PMK-2026-040",
      portId: 1,
      category: "FASILITAS_DERMAGA",
      description:
        "Kran air bersih di toilet ruang tunggu penumpang terminal lantai 1 mati dan tidak mengalir sejak kemarin sore.",
      reporterName: "Ibu Maria Ohee (Calon Penumpang)",
      reporterPhone: "0813-4411-9988",
      status: "IN_PROGRESS",
      resolutionNotes:
        "Teknisi UPTD sedang mengganti pompa hisap cadangan dan pembersihan tandon air utama.",
      createdAt: "2026-11-16T08:15:00Z",
    },
    {
      id: 4,
      ticketNumber: "TKT-PMK-2026-039",
      portId: 1,
      category: "KEBERSIHAN_TERMINAL",
      description:
        "Sampah plastik sisa logistik bongkar muat menumpuk di sisi selatan dermaga beton dan belum diangkut truk kebersihan.",
      reporterName: "Marten Kogoya",
      reporterPhone: "0821-9900-5566",
      status: "OPEN",
      createdAt: "2026-11-16T14:00:00Z",
    },
  ];

  const filteredComplaints = sampleComplaints.filter((comp) => {
    const matchesSearch =
      comp.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comp.reporterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comp.description.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (complaintFilter !== "ALL" && comp.status !== complaintFilter) return false;
    return true;
  });

  const countTotal = sampleComplaints.length;
  const countResolved = sampleComplaints.filter((c) => c.status === "RESOLVED").length;
  const countInProgress = sampleComplaints.filter((c) => c.status === "IN_PROGRESS").length;
  const countOpen = sampleComplaints.filter((c) => c.status === "OPEN").length;
  const slaCompliance = ((countResolved / countTotal) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* ========================================================= */}
      {/* 1. OVERLAPPING PENGADUAN & LAYANAN KPI CARDS              */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Pengaduan */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <MessageSquare className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
              Bulan Berjalan
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
            Kanal publik, loket gerbang & posko UPT
          </p>
        </div>

        {/* Card 2: Kepatuhan SLA Penyelesaian (< 24 Jam) */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm">
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
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm">
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
            {countOpen} tiket baru belum ditindaklanjuti
          </p>
        </div>

        {/* Card 4: Indeks Kepuasan Pengguna Jasa */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
              <ThumbsUp className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-mono font-bold text-teal-700 bg-teal-100 px-2 py-0.5 rounded-full">
              Sangat Baik
            </span>
          </div>
          <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mt-3">
            Indeks Kepuasan Masyarakat (IKM)
          </p>
          <p className="text-2xl font-extrabold text-[#0B241E] font-mono mt-1">
            91.4 / 100
          </p>
          <p className="text-[11px] text-[#64748B] mt-1.5">
            Survei kepuasan penumpang & agen kapal
          </p>
        </div>
      </div>

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
                <th className="py-3 px-4">Kategori & Pelapor</th>
                <th className="py-3 px-4">Isi Keluhan Masyarakat</th>
                <th className="py-3 px-4">Tindak Lanjut & Solusi UPT</th>
                <th className="py-3 px-4 text-center">Status SLA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {filteredComplaints.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400">
                    Tidak ada laporan pengaduan yang cocok dengan kriteria.
                  </td>
                </tr>
              ) : (
                filteredComplaints.map((comp) => (
                  <tr key={comp.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#0B241E] font-mono">
                        {comp.ticketNumber}
                      </div>
                      <div className="text-[11px] text-gray-400 mt-0.5">
                        {comp.createdAt.split("T")[0]} ({comp.createdAt.split("T")[1]?.slice(0, 5)} WIT)
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded text-[10px]">
                        {comp.category.replace(/_/g, " ")}
                      </span>
                      <div className="font-medium text-gray-800 mt-1">
                        {comp.reporterName}
                      </div>
                      {comp.reporterPhone && (
                        <div className="text-[10px] text-gray-400 font-mono">
                          {comp.reporterPhone}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4 max-w-xs">
                      <p className="text-[11px] text-gray-700 line-clamp-2" title={comp.description}>
                        &quot;{comp.description}&quot;
                      </p>
                    </td>

                    <td className="py-3 px-4 max-w-xs">
                      {comp.resolutionNotes ? (
                        <p className="text-[11px] text-emerald-800 font-medium">
                          {comp.resolutionNotes}
                        </p>
                      ) : (
                        <span className="text-[11px] text-amber-700 italic">
                          Menunggu disposisi teknisi jaga pelabuhan
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center">
                      {comp.status === "RESOLVED" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3" />
                          Tuntas Tepat Waktu
                        </span>
                      ) : comp.status === "IN_PROGRESS" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                          <Clock className="w-3 h-3" />
                          Sedang Dikerjakan
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          <AlertCircle className="w-3 h-3" />
                          Menunggu Tindakan
                        </span>
                      )}
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
