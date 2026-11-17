"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  Search,
  CheckCircle2,
  Clock,
  Send,
  FileText,
  User,
  Phone,
  MapPin,
  Camera,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  MessageSquare,
  Sparkles,
  HelpCircle,
  X,
  RefreshCw,
} from "lucide-react";

interface ComplaintTicket {
  ticketNumber: string;
  category: string;
  reporterName: string;
  location: string;
  reportedAt: string;
  status: "submitted" | "verified" | "in_progress" | "resolved";
  statusLabel: string;
  slaDeadline: string;
  description: string;
  resolutionNote?: string;
  assignedOfficer?: string;
}

export default function PenumpangPengaduanPage() {
  const [activeTab, setActiveTab] = useState<"form" | "track">("form");

  // New Complaint Form States
  const [category, setCategory] = useState<string>("facility");
  const [reporterName, setReporterName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [location, setLocation] = useState<string>("Dermaga Reguler 2");
  const [description, setDescription] = useState<string>("");
  const [photoUploaded, setPhotoUploaded] = useState<boolean>(false);
  const [submittedTicket, setSubmittedTicket] = useState<string | null>(null);

  // Tracking Search States
  const [searchTicketInput, setSearchTicketInput] = useState<string>("ADU-MRK-2026-081");
  const [trackedTicket, setTrackedTicket] = useState<ComplaintTicket | null>({
    ticketNumber: "ADU-MRK-2026-081",
    category: "Fasilitas Rusak",
    reporterName: "Bambang Sudirman",
    location: "Ruang Tunggu Lantai 2 (AC Tidak Dingin & Pintu Rusak)",
    reportedAt: "16 Nov 2026, 09:30 WIB",
    status: "in_progress",
    statusLabel: "Dalam Penanganan Teknisi UPT",
    slaDeadline: "17 Nov 2026, 09:30 WIB (Sisa 19 Jam)",
    description: "Pendingin ruangan di ruang tunggu keberangkatan mati sejak pagi, ruangan terasa pengap saat antrean padat.",
    assignedOfficer: "Tim Teknisi Listrik UPTD Merak (Koordinator: Hendra T.)",
    resolutionNote: "Teknisi sedang melakukan pengecekan kompresor outdoor unit AC nomor 3.",
  });

  const handleSubmitComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    const newCode = `ADU-MRK-2026-${Math.floor(100 + Math.random() * 900)}`;
    setSubmittedTicket(newCode);

    // Also update tracked ticket so user can immediately view it
    setTrackedTicket({
      ticketNumber: newCode,
      category:
        category === "facility"
          ? "Fasilitas Fisik Rusak"
          : category === "service"
          ? "Pelayanan Petugas / Antrean"
          : category === "tariff"
          ? "Ketidaksesuaian Tarif"
          : "Keterlambatan Armada",
      reporterName: reporterName || "Masyarakat Pengguna Jasa",
      location: location,
      reportedAt: "Hari ini, Baru saja",
      status: "submitted",
      statusLabel: "Laporan Diterima Sistem",
      slaDeadline: "Dalam 24 Jam ke Depan",
      description: description,
    });
  };

  const handleSearchTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTicketInput.trim()) return;

    // Simulated ticket lookup
    if (searchTicketInput.toUpperCase().includes("081")) {
      setTrackedTicket({
        ticketNumber: "ADU-MRK-2026-081",
        category: "Fasilitas Rusak",
        reporterName: "Bambang Sudirman",
        location: "Ruang Tunggu Lantai 2 (AC Tidak Dingin)",
        reportedAt: "16 Nov 2026, 09:30 WIB",
        status: "in_progress",
        statusLabel: "Dalam Penanganan Teknisi UPT",
        slaDeadline: "17 Nov 2026, 09:30 WIB (Sisa 19 Jam)",
        description: "Pendingin ruangan di ruang tunggu keberangkatan mati sejak pagi.",
        assignedOfficer: "Tim Teknisi Listrik UPTD Merak (Koordinator: Hendra T.)",
        resolutionNote: "Teknisi sedang melakukan pengecekan kompresor outdoor unit AC nomor 3.",
      });
    } else {
      setTrackedTicket({
        ticketNumber: searchTicketInput.toUpperCase(),
        category: "Pelayanan Umum",
        reporterName: "Pengguna Jasa",
        location: "Gerbang Masuk Pelabuhan",
        reportedAt: "16 Nov 2026, 11:15 WIB",
        status: "verified",
        statusLabel: "Diverifikasi Pengawas Dinas",
        slaDeadline: "Maksimal 24 Jam",
        description: "Laporan telah diverifikasi oleh Dinas Perhubungan dan didisposisikan ke UPT terkait.",
        assignedOfficer: "Supervisor Jaga UPTD Merak",
      });
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-[#0A2540] via-[#0F3A5D] to-[#0D9488] text-white p-6 sm:p-8 rounded-2xl shadow-md space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[#67E8F9] text-xs font-semibold">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Layanan Aspirasi & Pengaduan Masyarakat PORTA</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
          Layanan Pengaduan & Pelacakan Tindak Lanjut
        </h1>
        <p className="text-xs sm:text-sm text-[#E0F2FE]/90 max-w-2xl leading-relaxed">
          Sampaikan keluhan terkait fasilitas fisik rusak, pungutan liar, atau mutu pelayanan kepelabuhanan. Setiap aduan dijamin penanganannya dengan standar SLA &lt; 24 jam.
        </p>
      </div>

      {/* Tabs Navigation: Form vs Tracking */}
      <div className="flex items-center gap-2 border-b border-[#CBD5E1] pb-2">
        <button
          onClick={() => {
            setActiveTab("form");
            setSubmittedTicket(null);
          }}
          className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "form"
              ? "bg-[#0A2540] text-white shadow-sm"
              : "text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0A2540]"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Buat Pengaduan Baru</span>
        </button>

        <button
          onClick={() => setActiveTab("track")}
          className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "track"
              ? "bg-[#0A2540] text-white shadow-sm"
              : "text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0A2540]"
          }`}
        >
          <Search className="w-4 h-4" />
          <span>Lacak Status Tiket Aduan</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: FORMULIR PELAPORAN PENGADUAN                           */}
      {/* ============================================================== */}
      {activeTab === "form" && (
        <div className="space-y-6">
          {submittedTicket ? (
            /* Success State After Form Submission */
            <div className="bg-white border border-[#CBD5E1] rounded-2xl p-8 shadow-md text-center space-y-5 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Laporan Berhasil Terkirim
                </span>
                <h3 className="text-2xl font-black text-[#0A2540]">
                  Nomor Tiket Anda: <span className="font-mono text-[#0284C7]">{submittedTicket}</span>
                </h3>
                <p className="text-xs text-[#64748B] max-w-md mx-auto leading-relaxed">
                  Laporan Anda telah diteruskan ke Pengawas Dinas Perhubungan dan Supervisor UPTD Pelabuhan Merak untuk segera ditindaklanjuti.
                </p>
              </div>

              <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] max-w-md mx-auto text-xs space-y-1 text-left">
                <p className="flex justify-between">
                  <span className="text-[#64748B]">Estimasi Waktu Respons:</span>
                  <strong className="text-[#0A2540]">&lt; 24 Jam Kerja</strong>
                </p>
                <p className="flex justify-between">
                  <span className="text-[#64748B]">Notifikasi Progres:</span>
                  <span className="text-emerald-700 font-semibold">Terkirim ke WhatsApp Pelapor</span>
                </p>
              </div>

              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  onClick={() => {
                    setSearchTicketInput(submittedTicket);
                    setActiveTab("track");
                  }}
                  className="px-6 py-2.5 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  <span>Lacak Progres Laporan Sekarang</span>
                </button>
                <button
                  onClick={() => {
                    setSubmittedTicket(null);
                    setDescription("");
                  }}
                  className="px-4 py-2.5 bg-white border border-[#CBD5E1] text-[#0A2540] text-xs font-bold rounded-xl hover:bg-[#F8FAFC] transition-colors cursor-pointer"
                >
                  Buat Laporan Lainnya
                </button>
              </div>
            </div>
          ) : (
            /* Complaint Input Form */
            <form
              onSubmit={handleSubmitComplaint}
              className="bg-white border border-[#CBD5E1] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6"
            >
              <div className="border-b border-[#F1F5F9] pb-4">
                <h2 className="text-lg font-black text-[#0A2540]">
                  Formulir Pengaduan Pelayanan & Kerusakan Fasilitas
                </h2>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Isi informasi dengan jelas agar tim teknis UPT dapat langsung mengidentifikasi lokasi masalah.
                </p>
              </div>

              {/* Category Options */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#475569]">
                  Kategori Masalah:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  <button
                    type="button"
                    onClick={() => setCategory("facility")}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      category === "facility"
                        ? "bg-[#F0F9FF] border-[#0284C7] text-[#0284C7] font-bold shadow-xs"
                        : "bg-white border-[#CBD5E1] text-[#64748B]"
                    }`}
                  >
                    🛠️ Fasilitas Rusak / Kebersihan
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategory("service")}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      category === "service"
                        ? "bg-[#F0F9FF] border-[#0284C7] text-[#0284C7] font-bold shadow-xs"
                        : "bg-white border-[#CBD5E1] text-[#64748B]"
                    }`}
                  >
                    👥 Pelayanan Petugas / Loket
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategory("tariff")}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      category === "tariff"
                        ? "bg-[#F0F9FF] border-[#0284C7] text-[#0284C7] font-bold shadow-xs"
                        : "bg-white border-[#CBD5E1] text-[#64748B]"
                    }`}
                  >
                    💰 Indikasi Pungli / Tarif Tak Sesuai
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategory("delay")}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      category === "delay"
                        ? "bg-[#F0F9FF] border-[#0284C7] text-[#0284C7] font-bold shadow-xs"
                        : "bg-white border-[#CBD5E1] text-[#64748B]"
                    }`}
                  >
                    ⏱️ Keterlambatan Armada Tanpa Info
                  </button>
                </div>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-xs font-bold text-[#475569] mb-1">
                    Nama Pelapor
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nama lengkap Anda..."
                    value={reporterName}
                    onChange={(e) => setReporterName(e.target.value)}
                    className="w-full text-xs font-semibold p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#0284C7]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#475569] mb-1">
                    Nomor WhatsApp / HP Aktif
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 08123456789"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full text-xs font-semibold p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#0284C7]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#475569] mb-1">
                    Lokasi Spesifik Kejadian / Fasilitas
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Dermaga 2, Toilet Lantai 2 Dekat Musala, atau Loket 3 Kendaraan"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full text-xs font-semibold p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#0284C7]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#475569] mb-1">
                    Uraian Masalah / Kronologi Pengaduan
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Tuliskan detail keluhan Anda..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full text-xs font-semibold p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#0284C7]"
                  />
                </div>

                {/* Upload Photo Simulator */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#475569] mb-1">
                    Lampiran Foto Bukti Masalah (Opsional)
                  </label>
                  <div
                    onClick={() => setPhotoUploaded(!photoUploaded)}
                    className={`p-4 rounded-xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                      photoUploaded
                        ? "bg-emerald-50 border-emerald-400 text-emerald-800"
                        : "bg-[#F8FAFC] border-[#CBD5E1] text-[#64748B] hover:border-[#0284C7]"
                    }`}
                  >
                    <Camera className="w-6 h-6 text-[#0284C7]" />
                    {photoUploaded ? (
                      <span className="text-xs font-bold text-emerald-800">
                        ✓ 1 Foto Berhasil Dilampirkan (bukti_kerusakan_dermaga.jpg)
                      </span>
                    ) : (
                      <>
                        <span className="text-xs font-bold">
                          Klik untuk mengambil foto kamera atau unggah berkas
                        </span>
                        <span className="text-[10px] text-[#94A3B8]">
                          Maksimal 5MB (Format JPG, PNG)
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-2 flex items-center justify-between border-t border-[#F1F5F9]">
                <span className="text-xs text-[#64748B] flex items-center gap-1">
                  <ShieldAlert className="w-4 h-4 text-emerald-600" />
                  <span>Identitas pelapor terjamin kerahasiaannya oleh Pemda.</span>
                </span>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-[#0284C7] to-[#06B6D4] hover:from-[#0369A1] hover:to-[#0891B2] text-white text-xs font-extrabold rounded-xl shadow-xs hover:shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Kirim Laporan Pengaduan</span>
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: PELACAKAN STATUS TIKET ADUAN (TRACKING SLA)             */}
      {/* ============================================================== */}
      {activeTab === "track" && (
        <div className="space-y-6">
          {/* Tracking Search Box */}
          <div className="bg-white border border-[#CBD5E1] rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-extrabold text-[#0A2540]">
              Masukkan Nomor Tiket Pengaduan Anda
            </h3>
            <form onSubmit={handleSearchTicket} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Contoh: ADU-MRK-2026-081"
                  value={searchTicketInput}
                  onChange={(e) => setSearchTicketInput(e.target.value)}
                  className="w-full text-xs font-semibold pl-9 pr-3 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#0284C7] uppercase font-mono"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Search className="w-4 h-4" />
                <span>Lacak</span>
              </button>
            </form>
            <p className="text-[11px] text-[#64748B]">
              Nomor tiket telah dikirimkan via SMS / WhatsApp saat Anda mengajukan laporan pertama kali.
            </p>
          </div>

          {/* Ticket Tracking Result Card */}
          {trackedTicket && (
            <div className="bg-white border border-[#CBD5E1] rounded-2xl p-6 sm:p-8 shadow-md space-y-6 animate-fade-in">
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F1F5F9] pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-black text-[#0284C7]">
                      {trackedTicket.ticketNumber}
                    </span>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                      {trackedTicket.category}
                    </span>
                  </div>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    Dilaporkan pada: {trackedTicket.reportedAt} • Oleh: {trackedTicket.reporterName}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold font-mono px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                    {trackedTicket.statusLabel}
                  </span>
                </div>
              </div>

              {/* TIMELINE PROGRESS TRACKER */}
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#64748B] block">
                  Alur Progres Penanganan:
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                  {/* Stage 1 */}
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1">
                    <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>1. Diterima</span>
                    </div>
                    <p className="text-[10px] text-emerald-700">Tercatat di sistem pusat</p>
                  </div>

                  {/* Stage 2 */}
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1">
                    <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>2. Verifikasi Dinas</span>
                    </div>
                    <p className="text-[10px] text-emerald-700">Disposisi ke UPTD Merak</p>
                  </div>

                  {/* Stage 3 */}
                  <div className="p-3 bg-blue-50 rounded-xl border-2 border-[#0284C7] space-y-1">
                    <div className="flex items-center gap-1.5 text-[#0369A1] font-bold">
                      <Clock className="w-4 h-4 text-[#0284C7] animate-spin" />
                      <span>3. Penanganan Lapangan</span>
                    </div>
                    <p className="text-[10px] text-[#0369A1] font-semibold">Sedang dikerjakan teknisi</p>
                  </div>

                  {/* Stage 4 */}
                  <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#CBD5E1] space-y-1 opacity-60">
                    <div className="flex items-center gap-1.5 text-[#64748B] font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>4. Selesai</span>
                    </div>
                    <p className="text-[10px] text-[#94A3B8]">Konfirmasi penyelesaian</p>
                  </div>
                </div>
              </div>

              {/* Detail Box */}
              <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-2 text-xs">
                <div>
                  <span className="text-[#64748B]">Lokasi Kejadian:</span>
                  <p className="font-bold text-[#0A2540]">{trackedTicket.location}</p>
                </div>
                <div>
                  <span className="text-[#64748B]">Uraian Laporan:</span>
                  <p className="text-[#475569]">{trackedTicket.description}</p>
                </div>
                {trackedTicket.assignedOfficer && (
                  <div className="border-t border-[#E2E8F0] pt-2">
                    <span className="text-[#64748B]">Petugas / Unit yang Menangani:</span>
                    <p className="font-semibold text-[#0284C7]">{trackedTicket.assignedOfficer}</p>
                  </div>
                )}
                {trackedTicket.resolutionNote && (
                  <div className="bg-white p-3 rounded-lg border border-[#CBD5E1] mt-2">
                    <span className="text-[#64748B] font-bold block mb-0.5">Catatan Terakhir Petugas:</span>
                    <p className="text-[#0A2540] italic">"{trackedTicket.resolutionNote}"</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
