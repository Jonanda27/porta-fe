"use client";

import React, { useState, useEffect } from "react";
import { ModalPortal } from "@/components/ui/ModalPortal";
import {
  X,
  Wrench,
  Zap,
  Droplet,
  Building,
  Trash2,
  ShieldAlert,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Copy,
  Check,
  Search,
} from "lucide-react";
import { useTenantStore } from "@/store/tenant.store";
import { ComplaintService } from "@/services/complaint.service";
import { FacilityIssueCategory } from "@/types/complaint.types";

interface ReportFacilityIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCategory?: FacilityIssueCategory;
  defaultAssetId?: number;
  onSuccessSubmitted?: (ticketNumber: string) => void;
  onOpenTracker?: (ticketNumber?: string) => void;
}

const CATEGORY_OPTIONS: Array<{
  id: FacilityIssueCategory;
  label: string;
  icon: typeof Wrench;
  desc: string;
}> = [
  {
    id: "LISTRIK",
    label: "Kelistrikan & Penerangan",
    icon: Zap,
    desc: "Korsleting listrik, MCB turun terus, atau lampu padam.",
  },
  {
    id: "AIR_BERSIH",
    label: "Suplai Air Bersih & Perpipaan",
    icon: Droplet,
    desc: "Pipa bocor, kran rusak, atau tekanan air mati.",
  },
  {
    id: "FISIK_BANGUNAN",
    label: "Fisik Bangunan & Rolling Door",
    icon: Building,
    desc: "Rolling door macet, atap bocor, pintu/dinding retak.",
  },
  {
    id: "KEBERSIHAN_LINGKUNGAN",
    label: "Kebersihan & Saluran Drainase",
    icon: Trash2,
    desc: "Drainase tersumbat, bau tak sedap, sampah menumpuk.",
  },
  {
    id: "KEAMANAN",
    label: "Keamanan Lingkungan Dermaga",
    icon: ShieldAlert,
    desc: "Kunci gembok rusak, pencurian, atau gangguan keamanan.",
  },
  {
    id: "LAINNYA",
    label: "Kendala Fasilitas Lainnya",
    icon: HelpCircle,
    desc: "Gangguan operasional kios atau fasilitas umum lainnya.",
  },
];

export function ReportFacilityIssueModal({
  isOpen,
  onClose,
  defaultCategory = "LISTRIK",
  defaultAssetId,
  onSuccessSubmitted,
  onOpenTracker,
}: ReportFacilityIssueModalProps) {
  const { profile, leases } = useTenantStore();

  const activeLeases = leases.filter((l) => l.status === "ACTIVE");

  const [selectedCategory, setSelectedCategory] =
    useState<FacilityIssueCategory>(defaultCategory);
  const [selectedLeaseId, setSelectedLeaseId] = useState<number>(0);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [reporterName, setReporterName] = useState("");
  const [reporterPhone, setReporterPhone] = useState("");
  const [reporterEmail, setReporterEmail] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedTicket, setSubmittedTicket] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedCategory(defaultCategory);
      setSubject("");
      setDescription("");
      setError(null);
      setSubmittedTicket(null);
      setCopied(false);

      if (profile) {
        setReporterName(profile.name || "");
        setReporterPhone(profile.phone || "");
        setReporterEmail(profile.email || "");
      }

      if (defaultAssetId) {
        const found = activeLeases.find((l) => l.assetId === defaultAssetId);
        if (found) setSelectedLeaseId(found.id);
        else if (activeLeases.length > 0) setSelectedLeaseId(activeLeases[0].id);
      } else if (activeLeases.length > 0) {
        setSelectedLeaseId(activeLeases[0].id);
      }
    }
  }, [isOpen, defaultCategory, defaultAssetId, profile]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!subject.trim()) {
      setError("Silakan isi judul ringkas kendala.");
      return;
    }
    if (!description.trim()) {
      setError("Silakan deskripsikan kerusakan atau kendala fasilitas.");
      return;
    }
    if (!reporterName.trim()) {
      setError("Nama penanggung jawab pelapor wajib diisi.");
      return;
    }

    // Determine portId
    let portId = 1;
    let assetName = "";
    if (selectedLeaseId) {
      const lease = activeLeases.find((l) => l.id === selectedLeaseId);
      if (lease) {
        portId = lease.portId;
        assetName = lease.asset?.name || `Kios #${lease.assetId}`;
      }
    } else if (activeLeases.length > 0) {
      portId = activeLeases[0].portId;
    }

    const fullSubject = assetName ? `[${assetName}] ${subject.trim()}` : subject.trim();

    try {
      setIsSubmitting(true);
      const res = await ComplaintService.submitComplaint({
        portId,
        reporterName: reporterName.trim(),
        reporterPhone: reporterPhone.trim() || undefined,
        reporterEmail: reporterEmail.trim() || undefined,
        category: selectedCategory,
        subject: fullSubject,
        description: description.trim(),
      });

      setSubmittedTicket(res.ticketNumber);
      if (onSuccessSubmitted) {
        onSuccessSubmitted(res.ticketNumber);
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Gagal mengirim laporan kendala fasilitas.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyTicket = () => {
    if (!submittedTicket) return;
    navigator.clipboard.writeText(submittedTicket);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-[#0B241E] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#D97706]/20 border border-[#D97706]/40 flex items-center justify-center text-[#D97706]">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Lapor Kendala Fasilitas Kios</h2>
              <p className="text-xs text-[#BED2CA]">
                Petugas teknis UPTD Pelabuhan akan menindaklanjuti laporan Anda
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
          {submittedTicket ? (
            /* Success Screen */
            <div className="space-y-5 text-center py-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h3 className="text-lg font-extrabold text-[#0B241E]">
                  Laporan Kendala Berhasil Dikirim!
                </h3>
                <p className="text-xs text-[#64748B] mt-1 max-w-md mx-auto">
                  Laporan Anda telah tercatat pada sistem UPTD Pelabuhan. Simpan nomor tiket berikut untuk memantau proses penanganan.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 max-w-sm mx-auto">
                <span className="text-[11px] font-mono uppercase text-[#64748B] block mb-1">
                  Nomor Tiket Pengaduan
                </span>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-base font-mono font-extrabold text-[#0B241E]">
                    {submittedTicket}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyTicket}
                    className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-[#475569] transition-colors cursor-pointer"
                    title="Salin nomor tiket"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs text-left">
                <span className="font-bold block mb-0.5">Tahapan Penanganan:</span>
                Teknisi pelabuhan akan meninjau kondisi fisik lokasi dalam waktu maksimal 1x24 jam kerja sesuai SOP pemeliharaan fasilitas UPTD.
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                {onOpenTracker && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenTracker(submittedTicket);
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#0B241E] hover:bg-[#143E33] text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    <Search className="w-4 h-4 text-[#D97706]" />
                    <span>Lacak Status Tiket</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-[#475569] text-xs font-semibold cursor-pointer"
                >
                  Selesai & Tutup
                </button>
              </div>
            </div>
          ) : (
            /* Complaint Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Unit Aset / Kios */}
              {activeLeases.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-[#0B241E] mb-1.5">
                    Unit Fasilitas / Kios yang Mengalami Kendala
                  </label>
                  <select
                    value={selectedLeaseId}
                    onChange={(e) => setSelectedLeaseId(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-[#0B241E] focus:outline-none focus:ring-2 focus:ring-[#0B241E]/20"
                  >
                    {activeLeases.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.asset?.name || `Kios #${l.assetId}`} ({l.contractNumber || "PKS Aktif"})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Kategori Kendala */}
              <div>
                <label className="block text-xs font-bold text-[#0B241E] mb-1.5">
                  Kategori Kerusakan / Kendala
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CATEGORY_OPTIONS.map((cat) => {
                    const IconComp = cat.icon;
                    const isSelected = selectedCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                          isSelected
                            ? "border-[#D97706] bg-amber-50/60 ring-2 ring-[#D97706]/20"
                            : "border-slate-200 hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <IconComp
                            className={`w-4 h-4 ${
                              isSelected ? "text-[#D97706]" : "text-slate-500"
                            }`}
                          />
                          <span
                            className={`text-[11px] font-bold leading-tight ${
                              isSelected ? "text-[#0B241E]" : "text-slate-800"
                            }`}
                          >
                            {cat.label}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 leading-tight">
                          {cat.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Judul Kendala */}
              <div>
                <label className="block text-xs font-bold text-[#0B241E] mb-1.5">
                  Judul Singkat Kendala <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Contoh: Pipa Saluran Air Bersih Bocor di Belakang Kios"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-[#0B241E] focus:outline-none focus:ring-2 focus:ring-[#0B241E]/20"
                  required
                />
              </div>

              {/* Deskripsi Lengkap */}
              <div>
                <label className="block text-xs font-bold text-[#0B241E] mb-1.5">
                  Deskripsi Lengkap & Titik Lokasi <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Jelaskan kondisi kerusakan secara rinci, sejak kapan terjadi, dan apakah menghambat operasional..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-[#0B241E] focus:outline-none focus:ring-2 focus:ring-[#0B241E]/20"
                  required
                />
              </div>

              {/* Kontak Pelapor */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-[#475569] mb-1">
                    Nama Pelapor / PIC <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={reporterName}
                    onChange={(e) => setReporterName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-[#0B241E]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#475569] mb-1">
                    No. WhatsApp / HP
                  </label>
                  <input
                    type="text"
                    value={reporterPhone}
                    onChange={(e) => setReporterPhone(e.target.value)}
                    placeholder="0812xxxx"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-[#0B241E]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#475569] mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={reporterEmail}
                    onChange={(e) => setReporterEmail(e.target.value)}
                    placeholder="penyewa@gmail.com"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-[#0B241E]"
                  />
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-[#475569] text-xs font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-[#D97706] hover:bg-[#B45309] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Mengirim Laporan...</span>
                    </>
                  ) : (
                    <>
                      <Wrench className="w-4 h-4" />
                      <span>Kirim Laporan Kerusakan</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
    </ModalPortal>
  );
}
