"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Ship,
  MapPin,
  Calendar,
  Search,
  Clock,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Ticket,
  DollarSign,
  Building2,
  Waves,
  Sparkles,
  Info,
  Car,
  User,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Zap,
} from "lucide-react";

export default function PenumpangBerandaPage() {
  const router = useRouter();

  // Search State
  const [originPort, setOriginPort] = useState<string>("merak");
  const [destPort, setDestPort] = useState<string>("bakauheni");
  const [departureDate, setDepartureDate] = useState<string>("2026-11-16");
  const [passengerCategory, setPassengerCategory] = useState<string>("pax");

  // Selected Port for Real-Time Schedule Tab
  const [activePortFilter, setActivePortFilter] = useState<string>("merak");

  // Real-Time Schedule Departures Mock Data
  const recentDepartures = [
    {
      id: "DEP-01",
      shipName: "KMP Portlink III",
      route: "Merak ➔ Bakauheni",
      time: "08:00 WIB",
      dock: "Dermaga Eksekutif 1",
      status: "Tepat Waktu",
      statusColor: "emerald",
      quotaPax: "92% Terisi",
      quotaVehicle: "45/50 Mobil",
      delayReason: null,
    },
    {
      id: "DEP-02",
      shipName: "KMP Batumandi",
      route: "Merak ➔ Bakauheni",
      time: "09:15 WIB",
      dock: "Dermaga Reguler 2",
      status: "Boarding",
      statusColor: "blue",
      quotaPax: "80% Terisi",
      quotaVehicle: "62/70 Mobil",
      delayReason: null,
    },
    {
      id: "DEP-03",
      shipName: "KMP Sebuku",
      route: "Merak ➔ Bakauheni",
      time: "10:30 WIB",
      dock: "Dermaga Reguler 3",
      status: "Perubahan Jadwal",
      statusColor: "amber",
      quotaPax: "Tersedia",
      quotaVehicle: "Standby Antrean",
      delayReason: "Penyesuaian arus pasang surut dermaga (+15 menit)",
    },
    {
      id: "DEP-04",
      shipName: "KMP Legundi",
      route: "Merak ➔ Bakauheni",
      time: "11:45 WIB",
      dock: "Dermaga Eksekutif 2",
      status: "Terjadwal",
      statusColor: "emerald",
      quotaPax: "Tersedia",
      quotaVehicle: "Tersedia",
      delayReason: null,
    },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(
      `/penumpang/jadwal?origin=${originPort}&dest=${destPort}&date=${departureDate}&cat=${passengerCategory}`
    );
  };

  return (
    <div className="space-y-10">
      {/* 1. HERO BANNER WITH INTEGRATED SCHEDULE SEARCH */}
      <section className="relative bg-gradient-to-br from-[#0A2540] via-[#0F3A5D] to-[#0D9488] text-white pt-12 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Decorative Rings & Maritime Glow */}
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 bg-[#06B6D4]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-[#0284C7]/20 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10 space-y-8">
          {/* Header Title */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#67E8F9] text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Portal Resmi Penyeberangan & Penerimaan Daerah</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              Penyeberangan Nyaman, <br className="hidden sm:inline" />
              Retribusi Daerah Transparan
            </h1>
            <p className="text-sm sm:text-base text-[#E0F2FE]/90 leading-relaxed font-normal">
              Pesan tiket kapal dan pas masuk pelabuhan secara terpadu. Terintegrasi penuh dengan sistem gerbang tiket otomatis UPT dan regulasi retribusi resmi PP No. 35/2023.
            </p>
          </div>

          {/* INTERACTIVE QUICK SEARCH FORM (Visual Utama) */}
          <div className="bg-white text-[#0F172A] rounded-2xl p-6 sm:p-8 shadow-2xl border border-white/40 max-w-4xl mx-auto">
            <form onSubmit={handleSearch} className="space-y-5">
              <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#0A2540] flex items-center gap-2">
                  <Search className="w-4 h-4 text-[#0284C7]" />
                  <span>Pencarian Cepat Jadwal & Tiket Kapal</span>
                </span>
                <span className="text-[11px] text-[#64748B]">
                  Pilih asal & tanggal keberangkatan
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Asal */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#475569]">
                    Pelabuhan Asal
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-[#0284C7] absolute left-3 top-3 pointer-events-none" />
                    <select
                      value={originPort}
                      onChange={(e) => setOriginPort(e.target.value)}
                      className="w-full text-xs font-semibold pl-9 pr-3 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#0284C7] text-[#0F172A]"
                    >
                      <option value="merak">Pelabuhan Merak (Banten)</option>
                      <option value="bakauheni">Pelabuhan Bakauheni (Lampung)</option>
                      <option value="ketapang">Pelabuhan Ketapang (Banyuwangi)</option>
                      <option value="gilimanuk">Pelabuhan Gilimanuk (Bali)</option>
                    </select>
                  </div>
                </div>

                {/* Tujuan */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#475569]">
                    Pelabuhan Tujuan
                  </label>
                  <div className="relative">
                    <Ship className="w-4 h-4 text-[#06B6D4] absolute left-3 top-3 pointer-events-none" />
                    <select
                      value={destPort}
                      onChange={(e) => setDestPort(e.target.value)}
                      className="w-full text-xs font-semibold pl-9 pr-3 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#0284C7] text-[#0F172A]"
                    >
                      <option value="bakauheni">Pelabuhan Bakauheni (Lampung)</option>
                      <option value="merak">Pelabuhan Merak (Banten)</option>
                      <option value="gilimanuk">Pelabuhan Gilimanuk (Bali)</option>
                      <option value="ketapang">Pelabuhan Ketapang (Banyuwangi)</option>
                    </select>
                  </div>
                </div>

                {/* Tanggal */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#475569]">
                    Tanggal Keberangkatan
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-[#0284C7] absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="date"
                      value={departureDate}
                      onChange={(e) => setDepartureDate(e.target.value)}
                      className="w-full text-xs font-semibold pl-9 pr-3 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#0284C7] text-[#0F172A]"
                    />
                  </div>
                </div>

                {/* Kategori Pengguna Jasa */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#475569]">
                    Kategori Pengguna Jasa
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#06B6D4] absolute left-3 top-3 pointer-events-none" />
                    <select
                      value={passengerCategory}
                      onChange={(e) => setPassengerCategory(e.target.value)}
                      className="w-full text-xs font-semibold pl-9 pr-3 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#0284C7] text-[#0F172A]"
                    >
                      <option value="pax">Pejalan Kaki (Dewasa / Anak)</option>
                      <option value="motor">Sepeda Motor (Golongan II)</option>
                      <option value="car">Mobil Pribadi (Golongan IV A)</option>
                      <option value="truck">Truk Logistik / Bus (Gol V-VII)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-[#64748B]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Kupon Pas Pelabuhan Pemda langsung terbit otomatis dalam tiket digital.</span>
                </div>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-[#0284C7] to-[#0D9488] hover:from-[#0369A1] hover:to-[#0F766E] text-white font-extrabold text-xs rounded-xl shadow-lg shadow-cyan-600/20 hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                  <span>Cari Jadwal & Pesan Tiket</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* 2. OPERATIONAL REAL-TIME SCHEDULE & WEATHER ANNOUNCEMENTS */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-14 relative z-20">
        <div className="bg-white border border-[#CBD5E1] rounded-2xl shadow-lg p-6 space-y-6">
          {/* Header Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <h2 className="text-base font-extrabold text-[#0A2540]">
                  Informasi Operasional Real-Time Dermaga
                </h2>
                <span className="text-[10px] font-mono bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                  Live Dispatch
                </span>
              </div>
              <p className="text-xs text-[#64748B] mt-0.5">
                Pantau pergerakan kapal, penundaan jadwal, dan pengumuman keselamatan maritim
              </p>
            </div>

            {/* Port Filter Tabs */}
            <div className="flex items-center gap-1.5 bg-[#F1F5F9] p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => setActivePortFilter("merak")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activePortFilter === "merak"
                    ? "bg-white text-[#0A2540] shadow-xs"
                    : "text-[#64748B] hover:text-[#0A2540]"
                }`}
              >
                Pelabuhan Merak
              </button>
              <button
                onClick={() => setActivePortFilter("bakauheni")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activePortFilter === "bakauheni"
                    ? "bg-white text-[#0A2540] shadow-xs"
                    : "text-[#64748B] hover:text-[#0A2540]"
                }`}
              >
                Pelabuhan Bakauheni
              </button>
            </div>
          </div>

          {/* Announcement Alert Banner (Peringatan Cuaca & Operasional) */}
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-xs text-amber-900">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">
                Peringatan Operasional & Keselamatan BMKG (Update 13:00 WIB)
              </p>
              <p className="text-amber-800/90 leading-relaxed">
                Kondisi laut Selat Sunda terpantau bersahabat dengan gelombang 1.0 meter. Seluruh dermaga (Reguler 1–3 dan Eksekutif 1–2) beroperasi normal. Bagi penumpang kendaraan golongan IV–VII diharapkan tiba 60 menit sebelum waktu keberangkatan untuk proses validasi gate.
              </p>
            </div>
          </div>

          {/* Real-Time Departure Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentDepartures.map((dep) => (
              <div
                key={dep.id}
                className="p-4 rounded-xl border border-[#E2E8F0] hover:border-[#0284C7] bg-[#FAFCFF] hover:bg-white transition-all space-y-3 shadow-xs hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#E0F2FE] text-[#0369A1] flex items-center justify-center font-bold">
                      <Ship className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs text-[#0A2540]">
                        {dep.shipName}
                      </h4>
                      <p className="text-[10px] text-[#64748B]">{dep.dock}</p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                      dep.statusColor === "emerald"
                        ? "bg-emerald-100 text-emerald-800"
                        : dep.statusColor === "blue"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {dep.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-[11px] bg-white p-2.5 rounded-lg border border-[#F1F5F9]">
                  <div>
                    <span className="text-[#94A3B8] block text-[9px] uppercase">Rute</span>
                    <strong className="text-[#0A2540]">{dep.route}</strong>
                  </div>
                  <div>
                    <span className="text-[#94A3B8] block text-[9px] uppercase">Jam Berangkat</span>
                    <strong className="text-[#0284C7] font-mono">{dep.time}</strong>
                  </div>
                  <div>
                    <span className="text-[#94A3B8] block text-[9px] uppercase">Ketersediaan</span>
                    <strong className="text-[#0D9488]">{dep.quotaPax}</strong>
                  </div>
                </div>

                {dep.delayReason && (
                  <p className="text-[10px] text-amber-700 bg-amber-50 p-2 rounded border border-amber-200">
                    ℹ️ {dep.delayReason}
                  </p>
                )}

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-[#64748B]">
                    Kendaraan: {dep.quotaVehicle}
                  </span>
                  <Link
                    href={`/penumpang/tiket?ship=${encodeURIComponent(dep.shipName)}`}
                    className="text-xs font-bold text-[#0284C7] hover:text-[#0369A1] flex items-center gap-1 group cursor-pointer"
                  >
                    <span>Pilih Kapal</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. QUICK ACCESS FEATURE SHORTCUTS (Kartu Layanan Publik) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <h2 className="text-xl font-black text-[#0A2540]">
            Akses Cepat Layanan Kepelabuhanan
          </h2>
          <p className="text-xs text-[#64748B]">
            Pilih menu layanan terpadu yang Anda butuhkan secara cepat dan transparan
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Card 1: Penggunaan Dermaga & Tiket Digital */}
          <Link
            href="/penumpang/tiket"
            className="group p-6 rounded-2xl bg-white border border-[#E2E8F0] hover:border-[#0284C7] shadow-xs hover:shadow-lg transition-all space-y-4 cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0284C7] to-[#06B6D4] text-white flex items-center justify-center font-bold shadow-md shadow-cyan-500/20 group-hover:scale-110 transition-transform">
              <Ticket className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-[#0A2540] group-hover:text-[#0284C7] transition-colors">
                Tiket Digital & Pas Masuk Dermaga
              </h3>
              <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">
                Beli pas masuk orang atau tiket kendaraan golongan I–VII secara instan via QRIS dan dapatkan kode QR boarding gate.
              </p>
            </div>
            <div className="pt-2 flex items-center text-xs font-bold text-[#0284C7] gap-1 group-hover:gap-2 transition-all">
              <span>Pesan Pas Masuk</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          {/* Card 2: Jadwal & Asisten AI */}
          <Link
            href="/penumpang/jadwal"
            className="group p-6 rounded-2xl bg-white border border-[#E2E8F0] hover:border-[#0284C7] shadow-xs hover:shadow-lg transition-all space-y-4 cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0F3A5D] to-[#0369A1] text-white flex items-center justify-center font-bold shadow-md shadow-blue-900/20 group-hover:scale-110 transition-transform">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-[#0A2540] group-hover:text-[#0284C7] transition-colors">
                Jadwal Kapal & Asisten Cerdas
              </h3>
              <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">
                Lihat rute keberangkatan terperinci atau tanyakan aturan bagasi dan syarat penyeberangan pada Asisten Virtual PORTA.
              </p>
            </div>
            <div className="pt-2 flex items-center text-xs font-bold text-[#0284C7] gap-1 group-hover:gap-2 transition-all">
              <span>Cek Jadwal & Chatbot</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          {/* Card 3: Katalog Tarif Resmi PP 35/2023 */}
          <Link
            href="/penumpang/tarif"
            className="group p-6 rounded-2xl bg-white border border-[#E2E8F0] hover:border-[#0284C7] shadow-xs hover:shadow-lg transition-all space-y-4 cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0D9488] to-[#14B8A6] text-white flex items-center justify-center font-bold shadow-md shadow-teal-500/20 group-hover:scale-110 transition-transform">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-[#0A2540] group-hover:text-[#0D9488] transition-colors">
                Katalog Tarif Resmi Retribusi Daerah
              </h3>
              <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">
                Transparansi penuh komponen retribusi daerah, jasa kepelabuhanan, dan sewa fasilitas sesuai PP No. 35/2023.
              </p>
            </div>
            <div className="pt-2 flex items-center text-xs font-bold text-[#0D9488] gap-1 group-hover:gap-2 transition-all">
              <span>Buka Katalog Tarif</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          {/* Card 4: Fasilitas & Denah Kawasan */}
          <Link
            href="/penumpang/tarif#fasilitas"
            className="group p-6 rounded-2xl bg-white border border-[#E2E8F0] hover:border-[#0284C7] shadow-xs hover:shadow-lg transition-all space-y-4 cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#475569] to-[#64748B] text-white flex items-center justify-center font-bold shadow-md shadow-slate-500/20 group-hover:scale-110 transition-transform">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-[#0A2540] group-hover:text-[#0284C7] transition-colors">
                Profil Pelabuhan & Denah Kawasan
              </h3>
              <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">
                Peta lokasi toilet, ruang laktasi ibu & bayi, musala, charging station, dan zona parkir inap kendaraan.
              </p>
            </div>
            <div className="pt-2 flex items-center text-xs font-bold text-[#475569] gap-1 group-hover:gap-2 transition-all">
              <span>Eksplorasi Denah</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          {/* Card 5: Pengaduan Publik & Tracking SLA */}
          <Link
            href="/penumpang/pengaduan"
            className="group p-6 rounded-2xl bg-white border border-[#E2E8F0] hover:border-[#0284C7] shadow-xs hover:shadow-lg transition-all space-y-4 cursor-pointer sm:col-span-2 lg:col-span-2"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-amber-500 text-white flex items-center justify-center font-bold shadow-md shadow-rose-500/20 group-hover:scale-110 transition-transform shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-[#0A2540] group-hover:text-rose-600 transition-colors">
                    Layanan Pengaduan & Tracking Tindak Lanjut
                  </h3>
                  <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                    Sampaikan keluhan fasilitas rusak, ketidaksesuaian tarif, atau kendala pelayanan. Pantau status penanganan oleh UPT dan Dinas secara transparan dengan nomor tiket aduan.
                  </p>
                </div>
              </div>
              <div className="shrink-0 flex items-center text-xs font-bold text-rose-600 gap-1 group-hover:gap-2 transition-all">
                <span>Formulir Aduan</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* 4. TRANSPARENCY NOTICE (Amanat PP 35/2023) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 rounded-2xl bg-gradient-to-r from-[#F0FDF4] via-[#ECFDF5] to-[#E0F2FE] border border-emerald-200 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0 shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-emerald-950">
                Penerimaan Daerah untuk Kemajuan Fasilitas Pelabuhan
              </h4>
              <p className="text-xs text-emerald-800/90 mt-0.5">
                Setiap pembayaran retribusi pas masuk pelabuhan tercatat secara digital dan langsung masuk ke Kas Daerah (RKUD) untuk mendanai pemeliharaan fasilitas dermaga, ruang tunggu ber-AC, dan keamanan penyeberangan Anda.
              </p>
            </div>
          </div>
          <Link
            href="/penumpang/tarif"
            className="shrink-0 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span>Pelajari Alokasi PAD</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
