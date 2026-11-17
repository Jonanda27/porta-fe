"use client";

import React, { useState } from "react";
import {
  Wrench,
  AlertTriangle,
  Camera,
  MapPin,
  CheckCircle2,
  Clock,
  Send,
  Building2,
  Anchor,
  Layers,
  Zap,
  Droplet,
  UploadCloud,
  FileCheck2,
} from "lucide-react";

interface DamageReport {
  id: string;
  facility: string;
  damageType: string;
  severity: "critical" | "moderate" | "minor";
  reportedAt: string;
  status: "pending" | "in_progress" | "resolved";
  reportedBy: string;
}

export default function UptPemeliharaanPage() {
  // New Report Form State
  const [facility, setFacility] = useState<string>("Dermaga 4 (Mooring Dolphin)");
  const [damageType, setDamageType] = useState<string>("Karet Fender Lepas / Terbentur Lambung Kapal");
  const [severity, setSeverity] = useState<"critical" | "moderate" | "minor">("critical");
  const [description, setDescription] = useState<string>("Karet fender dermaga 4 lepas setelah benturan KMP Sebuku saat arus deras.");
  const [hasPhoto, setHasPhoto] = useState<boolean>(true);

  // Active Reports List
  const [reports, setReports] = useState<DamageReport[]>([
    {
      id: "REP-2026-081",
      facility: "Dermaga 4 (Mooring Dolphin)",
      damageType: "Karet Fender Lepas",
      severity: "critical",
      reportedAt: "Hari ini, 07:40 WIB",
      status: "in_progress",
      reportedBy: "Sdr. Danang (Petugas Patroli Dermaga)",
    },
    {
      id: "REP-2026-079",
      facility: "Jalur Utilitas Bunkering Air Dermaga 2",
      damageType: "Pipa Saluran Air Bocor",
      severity: "moderate",
      reportedAt: "Kemarin, 14:20 WIB",
      status: "pending",
      reportedBy: "Sdr. Irfan (Teknisi Utilitas)",
    },
    {
      id: "REP-2026-065",
      facility: "Lampu Navigasi Trestle Selatan",
      damageType: "Bohlam Lampu Suar Redup",
      severity: "minor",
      reportedAt: "14 Nov 2026",
      status: "resolved",
      reportedBy: "Capt. Ridwan H. (Syahbandar)",
    },
  ]);

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    const newReport: DamageReport = {
      id: `REP-2026-0${Math.floor(Math.random() * 80) + 82}`,
      facility,
      damageType,
      severity,
      reportedAt: "Baru saja",
      status: "pending",
      reportedBy: "Capt. Ridwan H. (Petugas UPT)",
    };

    setReports([newReport, ...reports]);
    alert("Laporan kerusakan berhasil dikirim ke Dinas Perhubungan & Tim Teknisi Lapangan.");
  };

  return (
    <div className="space-y-6">
      {/* 1. TOP METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm">
          <span className="text-xs font-bold text-[#64748B] uppercase">Total Aset Dermaga</span>
          <p className="text-2xl font-extrabold text-[#0B241E] font-mono mt-1">28 Unit</p>
          <p className="text-[11px] text-[#64748B] mt-1">4 Dermaga • 14 Kios • 2 Gudang • 8 Utilitas</p>
        </div>

        <div className="bg-white border border-rose-200 rounded-xl p-5 shadow-sm">
          <span className="text-xs font-bold text-rose-700 uppercase">Gangguan Kritis</span>
          <p className="text-2xl font-extrabold text-rose-700 font-mono mt-1">1 Titik</p>
          <p className="text-[11px] text-[#64748B] mt-1">Dermaga 4 sedang diblokir sementara</p>
        </div>

        <div className="bg-white border border-amber-200 rounded-xl p-5 shadow-sm">
          <span className="text-xs font-bold text-amber-800 uppercase">Dalam Pengerjaan</span>
          <p className="text-2xl font-extrabold text-amber-700 font-mono mt-1">2 Tiket</p>
          <p className="text-[11px] text-[#64748B] mt-1">Teknisi sedang berada di lokasi</p>
        </div>

        <div className="bg-white border border-emerald-200 rounded-xl p-5 shadow-sm">
          <span className="text-xs font-bold text-emerald-800 uppercase">Tingkat Kesiapan Aset</span>
          <p className="text-2xl font-extrabold text-emerald-700 font-mono mt-1">92.4%</p>
          <p className="text-[11px] text-[#64748B] mt-1">Operasional penyeberangan lancar</p>
        </div>
      </div>

      {/* 2. MAIN WORKSPACE: FORMULIR LAPORAN KERUSAKAN & PETA FASILITAS GIS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Module A: Formulir Laporan Kerusakan Lapangan (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-[#D97706]" />
              <h3 className="text-sm font-extrabold text-[#0B241E]">
                Formulir Laporan Kerusakan Fisik
              </h3>
            </div>
            <span className="text-[10px] font-mono bg-rose-50 text-rose-800 font-bold px-2 py-0.5 rounded">
              Inspeksi Lapangan
            </span>
          </div>

          <form onSubmit={handleSubmitReport} className="space-y-3.5 text-xs">
            {/* Lokasi Fasilitas */}
            <div>
              <label className="font-bold text-[#0B241E] block mb-1">
                Lokasi Fasilitas Pelabuhan
              </label>
              <select
                value={facility}
                onChange={(e) => setFacility(e.target.value)}
                className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg text-[#0B241E] font-semibold focus:outline-none focus:border-[#D97706]"
              >
                <option value="Dermaga 1 (Dermaga Utama)">Dermaga 1 (Dermaga Utama)</option>
                <option value="Dermaga 2 (Dermaga Truk)">Dermaga 2 (Dermaga Truk)</option>
                <option value="Dermaga 3 (Dermaga Cepat)">Dermaga 3 (Dermaga Cepat)</option>
                <option value="Dermaga 4 (Mooring Dolphin)">Dermaga 4 (Mooring Dolphin)</option>
                <option value="Kios Pujasera B-04">Kios Pujasera B-04</option>
                <option value="Jalur Utilitas Bunkering Air">Jalur Utilitas Bunkering Air</option>
              </select>
            </div>

            {/* Jenis Kerusakan */}
            <div>
              <label className="font-bold text-[#0B241E] block mb-1">
                Gejala / Jenis Kerusakan
              </label>
              <input
                type="text"
                value={damageType}
                onChange={(e) => setDamageType(e.target.value)}
                placeholder="Contoh: Karet fender lepas, beton retak..."
                className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg text-[#0B241E] font-medium focus:outline-none focus:border-[#D97706]"
                required
              />
            </div>

            {/* Tingkat Kritis / Severity */}
            <div>
              <label className="font-bold text-[#0B241E] block mb-1">
                Tingkat Keparahan (Severity Level)
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSeverity("critical")}
                  className={`py-2 px-1 rounded-lg font-bold text-center border cursor-pointer ${
                    severity === "critical"
                      ? "bg-rose-700 text-white border-rose-700 shadow-xs"
                      : "bg-[#F8FAFC] text-rose-700 border-rose-200 hover:bg-rose-50"
                  }`}
                >
                  Kritis (Stop)
                </button>
                <button
                  type="button"
                  onClick={() => setSeverity("moderate")}
                  className={`py-2 px-1 rounded-lg font-bold text-center border cursor-pointer ${
                    severity === "moderate"
                      ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                      : "bg-[#F8FAFC] text-amber-700 border-amber-200 hover:bg-amber-50"
                  }`}
                >
                  Sedang (Waspada)
                </button>
                <button
                  type="button"
                  onClick={() => setSeverity("minor")}
                  className={`py-2 px-1 rounded-lg font-bold text-center border cursor-pointer ${
                    severity === "minor"
                      ? "bg-emerald-700 text-white border-emerald-700 shadow-xs"
                      : "bg-[#F8FAFC] text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                  }`}
                >
                  Ringan (Rutin)
                </button>
              </div>
            </div>

            {/* Deskripsi Kronologi */}
            <div>
              <label className="font-bold text-[#0B241E] block mb-1">
                Kronologi & Deskripsi Detail
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg text-[#0B241E] focus:outline-none focus:border-[#D97706]"
              />
            </div>

            {/* Foto Bukti Kerusakan */}
            <div className="p-3 bg-[#F8FAFC] border border-dashed border-[#CBD5E1] rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-[#D97706]" />
                <div>
                  <span className="font-bold text-[#0B241E] block">Foto Kamera Lapangan</span>
                  <span className="text-[10px] text-[#64748B]">IMG_Dermaga4_Fender.jpg (1.8 MB)</span>
                </div>
              </div>
              <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded">
                Terlampir
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-[#0B241E] hover:bg-[#164336] text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <Send className="w-4 h-4 text-[#D97706]" />
              <span>Kirim Laporan ke Tim Teknisi Dinas</span>
            </button>
          </form>
        </div>

        {/* Module B: Peta Fasilitas & Status Aset GIS (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#D97706]" />
                <h3 className="text-sm font-extrabold text-[#0B241E]">
                  Peta Spasial Fasilitas & Status Aset Pelabuhan (GIS)
                </h3>
              </div>
              <span className="text-xs font-mono text-[#64748B]">UPTD Merak</span>
            </div>

            {/* GIS Interactive Visual Mockup */}
            <div className="mt-4 bg-[#0F2620] border border-[#1B4B3D] rounded-xl p-5 relative overflow-hidden min-h-[250px] text-white">
              {/* Sea Wave Lines */}
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#BED2CA_1px,transparent_1px)] [background-size:16px_16px]" />

              <div className="relative z-10 space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-mono text-[#D97706] font-bold">ZONA PERAIRAN DERMAGA UTAMA</span>
                  <span className="text-[10px] bg-[#174338] px-2 py-0.5 rounded border border-[#2B7A67]/40">
                    Kedalaman Kolam: -8.5m LWS
                  </span>
                </div>

                {/* 4 Docks Visual Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center text-xs">
                  <div className="p-3 bg-[#133D31] border border-emerald-400/50 rounded-lg">
                    <Anchor className="w-4 h-4 text-emerald-400 mx-auto" />
                    <strong className="block text-[11px] mt-1">Dermaga 1</strong>
                    <span className="text-[9px] text-emerald-300 font-mono">AKTIF SANDAR</span>
                  </div>

                  <div className="p-3 bg-[#133D31] border border-emerald-400/50 rounded-lg">
                    <Anchor className="w-4 h-4 text-emerald-400 mx-auto" />
                    <strong className="block text-[11px] mt-1">Dermaga 2</strong>
                    <span className="text-[9px] text-emerald-300 font-mono">AKTIF SANDAR</span>
                  </div>

                  <div className="p-3 bg-[#133D31] border border-blue-400/50 rounded-lg">
                    <Anchor className="w-4 h-4 text-blue-400 mx-auto" />
                    <strong className="block text-[11px] mt-1">Dermaga 3</strong>
                    <span className="text-[9px] text-blue-300 font-mono">SIAP MASUK</span>
                  </div>

                  <div className="p-3 bg-rose-950/80 border border-rose-500 rounded-lg">
                    <AlertTriangle className="w-4 h-4 text-rose-400 mx-auto" />
                    <strong className="block text-[11px] mt-1">Dermaga 4</strong>
                    <span className="text-[9px] text-rose-400 font-mono font-bold">RUSAK (FENDER)</span>
                  </div>
                </div>

                {/* Land Assets Map */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 text-xs">
                  <div className="p-2.5 bg-[#174338] rounded-lg flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#D97706] shrink-0" />
                    <div className="truncate">
                      <span className="block font-bold text-[11px]">Kios Pujasera</span>
                      <span className="text-[9px] text-[#BED2CA]">12/14 Tersewa</span>
                    </div>
                  </div>

                  <div className="p-2.5 bg-[#174338] rounded-lg flex items-center gap-2">
                    <Droplet className="w-4 h-4 text-blue-400 shrink-0" />
                    <div className="truncate">
                      <span className="block font-bold text-[11px]">Bunkering Air</span>
                      <span className="text-[9px] text-[#BED2CA]">Meteran Aktif</span>
                    </div>
                  </div>

                  <div className="p-2.5 bg-[#174338] rounded-lg flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                    <div className="truncate">
                      <span className="block font-bold text-[11px]">Listrik Sandar</span>
                      <span className="text-[9px] text-[#BED2CA]">380V Standby</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* List of Recent Reports */}
            <div className="mt-4 space-y-2">
              <span className="text-xs font-bold text-[#0B241E] block">
                Riwayat Tiket Kerusakan Terkini
              </span>
              <div className="divide-y divide-[#F1F5F9] text-xs">
                {reports.map((r) => (
                  <div key={r.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-[#0B241E]">{r.facility}: {r.damageType}</p>
                      <p className="text-[11px] text-[#64748B]">Pelapor: {r.reportedBy} • {r.reportedAt}</p>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                        r.status === "in_progress"
                          ? "bg-amber-100 text-amber-800"
                          : r.status === "resolved"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {r.status === "in_progress" ? "Dikerjakan" : r.status === "resolved" ? "Selesai" : "Pending"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
