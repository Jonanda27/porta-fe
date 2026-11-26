"use client";

import React from "react";
import Link from "next/link";
import {
  Ship,
  Clock,
  CheckCircle2,
  Eye,
  DollarSign,
  ShieldCheck,
  ArrowRight,
  Search,
  Loader2,
  Anchor,
} from "lucide-react";
import { formatRupiah } from "@/lib/kapal-billing";
import { DockRequest } from "@/types/kapal.types";

export interface VisitRequestsStatusCounts {
  submitted: number;
  verified: number;
  approved: number;
}

export interface VisitRequestsSectionProps {
  requests: DockRequest[];
  filteredRequests: DockRequest[];
  statusCounts: VisitRequestsStatusCounts;
  searchFilter: string;
  onSearchFilterChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  estimatingVisitId: number | null;
  onGenerateOfficialEstimate: (visitId: number) => void;
  onSelectDetailRequest: (req: DockRequest) => void;
}

export function VisitRequestsSection({
  requests,
  filteredRequests,
  statusCounts,
  searchFilter,
  onSearchFilterChange,
  statusFilter,
  onStatusFilterChange,
  estimatingVisitId,
  onGenerateOfficialEstimate,
  onSelectDetailRequest,
}: VisitRequestsSectionProps) {
  return (
    <div className="space-y-6">
      {/* Filter Bar & Counters */}
      <div className="bg-white border border-[#CBD5E1] rounded-2xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Cari nomor permohonan, nama kapal, atau rute..."
            value={searchFilter}
            onChange={(e) => onSearchFilterChange(e.target.value)}
            className="w-full text-xs font-semibold pl-9 pr-4 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#0B241E]"
          />
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 text-xs">
          <button
            type="button"
            onClick={() => onStatusFilterChange("all")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
              statusFilter === "all"
                ? "bg-[#0B241E] text-white"
                : "bg-[#F1F5F9] text-[#64748B] hover:text-[#0B241E]"
            }`}
          >
            Semua ({requests.length})
          </button>
          <button
            type="button"
            onClick={() => onStatusFilterChange("submitted")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
              statusFilter === "submitted"
                ? "bg-amber-600 text-white"
                : "bg-amber-50 text-amber-800 hover:bg-amber-100"
            }`}
          >
            Diajukan ({statusCounts.submitted})
          </button>
          <button
            type="button"
            onClick={() => onStatusFilterChange("verified")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
              statusFilter === "verified"
                ? "bg-blue-600 text-white"
                : "bg-blue-50 text-blue-800 hover:bg-blue-100"
            }`}
          >
            Diverifikasi ({statusCounts.verified})
          </button>
          <button
            type="button"
            onClick={() => onStatusFilterChange("approved")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
              statusFilter === "approved"
                ? "bg-emerald-600 text-white"
                : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
            }`}
          >
            Disetujui UPT ({statusCounts.approved})
          </button>
        </div>
      </div>

      {/* Cards List */}
      <div className="space-y-4">
        {filteredRequests.map((req, idx) => (
          <div
            key={req.id ? `${req.id}-${idx}` : `req-${idx}`}
            className="bg-white border border-[#CBD5E1] rounded-2xl p-6 shadow-xs hover:shadow-md transition-all space-y-4"
          >
            {/* Header Card */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F1F5F9] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0B241E] text-[#D97706] flex items-center justify-center font-bold shrink-0">
                  <Ship className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#D97706] bg-[#0B241E] px-2 py-0.5 rounded">
                      {req.id}
                    </span>
                    <h3 className="font-extrabold text-sm text-[#0B241E]">
                      {req.vesselName} ({req.gt.toLocaleString()} GT)
                    </h3>
                  </div>
                  <p className="text-[11px] text-[#64748B] mt-0.5">
                    Diajukan: {req.submittedAt} • Rute: {req.route} • {req.port}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-mono font-bold px-3 py-1 rounded-full ${
                    req.status === "approved"
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                      : req.status === "verified"
                      ? "bg-blue-100 text-blue-800 border border-blue-200"
                      : "bg-amber-100 text-amber-800 border border-amber-200"
                  }`}
                >
                  {req.statusLabel}
                </span>

                <button
                  type="button"
                  onClick={() => onSelectDetailRequest(req)}
                  className="p-1.5 rounded-lg border border-[#CBD5E1] text-[#64748B] hover:text-[#0B241E] hover:bg-slate-50 cursor-pointer"
                  title="Lihat Detail Permohonan"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* SIKLUS STEPPER MINI (Permohonan ➔ Verifikasi ➔ Persetujuan) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              {/* Step 1 */}
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <p className="font-bold text-emerald-950">1. Permohonan Masuk</p>
                  <p className="text-[10px] text-emerald-800">Dokumen &amp; utilitas tercatat</p>
                </div>
              </div>

              {/* Step 2 */}
              <div
                className={`p-3 rounded-xl border flex items-center gap-2.5 ${
                  req.status === "verified" || req.status === "approved"
                    ? "bg-emerald-50 border-emerald-200"
                    : "bg-blue-50 border-blue-200"
                }`}
              >
                {req.status === "verified" || req.status === "approved" ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <Clock className="w-4 h-4 text-blue-600 shrink-0 animate-spin" />
                )}
                <div>
                  <p className="font-bold text-[#0B241E]">2. Verifikasi Jadwal</p>
                  <p className="text-[10px] text-[#64748B]">Pemeriksaan fisik dermaga</p>
                </div>
              </div>

              {/* Step 3 */}
              <div
                className={`p-3 rounded-xl border flex items-center gap-2.5 ${
                  req.status === "approved"
                    ? "bg-emerald-50 border-emerald-300"
                    : "bg-[#F8FAFC] border-[#E2E8F0] opacity-60"
                }`}
              >
                <CheckCircle2
                  className={`w-4 h-4 shrink-0 ${
                    req.status === "approved" ? "text-emerald-600" : "text-[#94A3B8]"
                  }`}
                />
                <div>
                  <p className="font-bold text-[#0B241E]">3. Alokasi Dermaga Terbit</p>
                  <p className="text-[10px] text-[#64748B]">Izin sandar disahkan UPT</p>
                </div>
              </div>
            </div>

            {/* Detail Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-[#F8FAFC] p-3.5 rounded-xl border border-[#E2E8F0] text-xs">
              <div>
                <span className="text-[#94A3B8] block text-[10px] uppercase font-bold">
                  Rencana Sandar (ETA)
                </span>
                <p className="font-mono font-bold text-[#0B241E] mt-0.5">{req.eta}</p>
                <p className="font-mono text-[#64748B] text-[11px]">s/d {req.etd}</p>
              </div>

              <div>
                <span className="text-[#94A3B8] block text-[10px] uppercase font-bold">
                  Alokasi Dermaga
                </span>
                {req.status === "submitted" || req.allocatedDock?.includes("Menunggu") ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10.5px] font-bold bg-amber-50 text-amber-800 border border-amber-200 mt-1">
                    <Clock className="w-3 h-3 text-amber-600 shrink-0" />
                    <span className="truncate">Menunggu Petugas</span>
                  </span>
                ) : (
                  <p className="font-bold text-emerald-800 flex items-center gap-1 mt-0.5 truncate">
                    <Anchor className="w-3.5 h-3.5 text-[#D97706] shrink-0" />
                    <span>{req.allocatedDock}</span>
                  </p>
                )}
                <p className="text-[10px] text-[#64748B] mt-0.5">{req.route}</p>
              </div>

              <div>
                <span className="text-[#94A3B8] block text-[10px] uppercase font-bold">
                  Utilitas Dipesan
                </span>
                <div className="flex items-center gap-1.5 mt-1">
                  {req.utilities.freshWater && (
                    <span
                      className="bg-blue-100 text-blue-800 text-[10px] px-2 py-0.5 rounded font-bold"
                      title="Air Bersih"
                    >
                      Air {req.utilities.waterVolume} m³
                    </span>
                  )}
                  {req.utilities.shorePower && (
                    <span
                      className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded font-bold"
                      title="Listrik Darat"
                    >
                      Listrik {req.utilities.powerKwh} kWh
                    </span>
                  )}
                  {req.utilities.wasteDisposal && (
                    <span
                      className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded font-bold"
                      title="Sampah"
                    >
                      Limbah
                    </span>
                  )}
                  {!req.utilities.freshWater &&
                    !req.utilities.shorePower &&
                    !req.utilities.wasteDisposal && (
                      <span className="text-[#94A3B8] text-[11px]">-</span>
                    )}
                </div>
              </div>

              <div>
                <span className="text-[#94A3B8] block text-[10px] uppercase font-bold">
                  {req.officialInvoice ? "Estimasi / e-SKRD Resmi" : "Estimasi Retribusi"}
                </span>
                <p className="font-mono font-extrabold text-[#0B241E] text-sm mt-0.5">
                  {formatRupiah(req.costBreakdown.total)}
                </p>
                {req.officialInvoice ? (
                  <Link
                    href="/kapal/penagihan"
                    className="inline-flex items-center gap-1 text-[10px] text-emerald-700 hover:underline font-mono font-bold mt-0.5"
                  >
                    <span>{req.officialInvoice.invoiceNumber}</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                ) : req.visitId &&
                  req.backendStatus &&
                  req.backendStatus !== "REQUESTED" &&
                  req.backendStatus !== "CANCELLED" ? (
                  <button
                    type="button"
                    disabled={estimatingVisitId === req.visitId}
                    onClick={() => onGenerateOfficialEstimate(req.visitId!)}
                    className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#0B241E] hover:bg-[#143E33] text-white text-[10px] font-bold cursor-pointer disabled:opacity-50"
                  >
                    {estimatingVisitId === req.visitId ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <DollarSign className="w-3 h-3 text-[#D97706]" />
                    )}
                    <span>Hitung Estimasi Resmi</span>
                  </button>
                ) : (
                  <p className="text-[10px] text-emerald-700 font-semibold">
                    Tarif Perda 4/2023
                  </p>
                )}
              </div>
            </div>

            {/* Officer Notes if available */}
            {req.officerNotes && (
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-950 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#0284C7] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[11px] block font-bold">
                    Catatan Verifikator UPT Pelabuhan:
                  </strong>
                  <p className="text-[#334155] mt-0.5 leading-relaxed">{req.officerNotes}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
