"use client";

import React, { useState, useEffect } from "react";
import { ModalPortal } from "@/components/ui/ModalPortal";
import {
  X,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Loader2,
  Building,
  Wrench,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { ComplaintService } from "@/services/complaint.service";
import { ComplaintItem, ComplaintStatus } from "@/types/complaint.types";

interface TrackComplaintModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTicketNumber?: string;
  onOpenReportModal?: () => void;
}

export function TrackComplaintModal({
  isOpen,
  onClose,
  initialTicketNumber = "",
  onOpenReportModal,
}: TrackComplaintModalProps) {
  const [ticketInput, setTicketInput] = useState(initialTicketNumber);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [complaint, setComplaint] = useState<ComplaintItem | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTicketInput(initialTicketNumber);
      setError(null);
      if (initialTicketNumber.trim()) {
        handleTrack(initialTicketNumber.trim());
      } else {
        setComplaint(null);
      }
    }
  }, [isOpen, initialTicketNumber]);

  if (!isOpen) return null;

  const handleTrack = async (ticket: string) => {
    if (!ticket.trim()) {
      setError("Silakan masukkan nomor tiket pengaduan.");
      return;
    }
    setError(null);
    setIsLoading(true);

    try {
      const data = await ComplaintService.trackComplaint(ticket.trim());
      setComplaint(data);
    } catch (err: unknown) {
      setComplaint(null);
      const msg =
        err instanceof Error
          ? err.message
          : `Tiket "${ticket}" tidak ditemukan pada sistem UPTD.`;
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: ComplaintStatus) => {
    switch (status) {
      case "RESOLVED":
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Selesai Ditangani
          </span>
        );
      case "IN_PROGRESS":
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" />
            Sedang Dikerjakan Teknisi
          </span>
        );
      case "CLOSED":
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            Ditutup
          </span>
        );
      case "OPEN":
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-100 text-sky-800 border border-sky-200 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-sky-600" />
            Laporan Diterima
          </span>
        );
    }
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case "LISTRIK":
        return "Kelistrikan & MCB";
      case "AIR_BERSIH":
        return "Perpipaan & Air Bersih";
      case "FISIK_BANGUNAN":
        return "Fisik Bangunan & Rolling Door";
      case "KEBERSIHAN_LINGKUNGAN":
        return "Kebersihan & Drainase";
      case "KEAMANAN":
        return "Keamanan Lingkungan";
      default:
        return cat || "Fasilitas Kios";
    }
  };

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-[#0B241E] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Lacak Status Aduan Fasilitas</h2>
              <p className="text-xs text-[#BED2CA]">
                Cek progres perbaikan teknis fasilitas pelabuhan
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Search Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleTrack(ticketInput);
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={ticketInput}
                onChange={(e) => setTicketInput(e.target.value)}
                placeholder="Masukkan Nomor Tiket (misal: ADU-POM-...)"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-[#0B241E] font-mono focus:outline-none focus:ring-2 focus:ring-[#0B241E]/20"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2.5 rounded-xl bg-[#0B241E] hover:bg-[#143E33] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-2xs"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <span>Lacak</span>
              )}
            </button>
          </form>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {complaint && (
            <div className="space-y-4">
              {/* Ticket Card Header */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-mono font-extrabold text-[#0B241E]">
                    {complaint.ticketNumber}
                  </span>
                  {getStatusBadge(complaint.status)}
                </div>
                <h3 className="text-sm font-bold text-[#0B241E]">
                  {complaint.subject}
                </h3>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[#64748B]">
                  <span>
                    Kategori: <strong>{getCategoryLabel(complaint.category)}</strong>
                  </span>
                  <span>
                    Pelabuhan: <strong>{complaint.port?.name || "Pomako"}</strong>
                  </span>
                  <span>
                    Dilaporkan:{" "}
                    {new Date(complaint.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>

              {/* Progress Stepper */}
              <div className="py-2">
                <div className="text-[11px] font-mono uppercase text-[#64748B] mb-3">
                  Tahapan Penanganan Teknis UPTD
                </div>
                <div className="space-y-3">
                  {/* Step 1: Diterima */}
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[#0B241E]">
                        Laporan Diterima Sistem
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Tiket aduan resmi tercatat dan masuk antrean unit pemeliharaan UPTD.
                      </p>
                    </div>
                  </div>

                  {/* Step 2: In Progress */}
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                        complaint.status === "IN_PROGRESS" ||
                        complaint.status === "RESOLVED" ||
                        complaint.status === "CLOSED"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {complaint.status === "IN_PROGRESS" ? (
                        <Wrench className="w-4 h-4 animate-pulse text-[#D97706]" />
                      ) : complaint.status === "RESOLVED" ||
                        complaint.status === "CLOSED" ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <Clock className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[#0B241E]">
                        Penanganan & Perbaikan di Lokasi
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {complaint.status === "IN_PROGRESS"
                          ? "Teknisi operasional UPTD saat ini sedang melakukan perbaikan di lapangan."
                          : complaint.status === "RESOLVED" ||
                            complaint.status === "CLOSED"
                          ? "Perbaikan telah selesai dilaksanakan oleh teknisi."
                          : "Menunggu giliran penugasan teknisi lapangan."}
                      </p>
                    </div>
                  </div>

                  {/* Step 3: Resolved */}
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                        complaint.status === "RESOLVED" ||
                        complaint.status === "CLOSED"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[#0B241E]">
                        Selesai & Verifikasi Operasional
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {complaint.status === "RESOLVED" ||
                        complaint.status === "CLOSED"
                          ? "Kendala telah tuntas ditangani dan fasilitas dapat digunakan kembali."
                          : "Tahap akhir setelah seluruh perbaikan fisik tuntas."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Resolution Notes Box */}
              {complaint.resolutionNote && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1.5">
                  <span className="text-[11px] font-bold text-emerald-900 block flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    Catatan Penyelesaian Tim Teknisi:
                  </span>
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    {complaint.resolutionNote}
                  </p>
                  {complaint.resolvedAt && (
                    <span className="text-[10px] font-mono text-emerald-700 block pt-1">
                      Waktu Selesai:{" "}
                      {new Date(complaint.resolvedAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
            {onOpenReportModal && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenReportModal();
                }}
                className="text-xs text-[#D97706] hover:text-[#B45309] font-bold flex items-center gap-1 cursor-pointer"
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>Lapor Kendala Baru</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-[#475569] text-xs font-semibold cursor-pointer ml-auto"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
    </ModalPortal>
  );
}
