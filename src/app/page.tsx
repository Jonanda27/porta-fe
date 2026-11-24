"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Anchor,
  Ship,
  Compass,
  Landmark,
  Store,
  Ticket,
  ShieldCheck,
  Clock,
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  CalendarCheck2,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Search,
  Calculator,
  FileText,
  BadgeAlert,
  Send,
  HelpCircle,
  PhoneCall,
  Radio,
  Layers,
  Sparkles,
  MapPin,
  X,
  Waves,
  Building2,
  Coins,
  QrCode,
  Lock,
} from "lucide-react";
import { TariffCalculatorSection } from "@/components/landing/TariffCalculatorSection";
import { LandingFooter } from "@/components/landing/LandingFooter";
import type {
  LandingUserRoleType as UserRoleType,
  RoleCardItem,
} from "@/types/auth.types";

const PORTAL_ROLES: RoleCardItem[] = [
  {
    id: "dinas",
    code: "01",
    title: "Dinas Perhubungan & Bapenda",
    targetRole: "Eksekutif & Pengambil Kebijakan",
    scope: "Pengendalian PAD & Rekonsiliasi Kasda",
    description:
      "Monitoring real-time penerimaan retribusi daerah, audit kepatuhan PP 35/2023 & Perbup Mimika 25/2024, evaluasi STRD denda 1%, serta rekonsiliasi kasda RKUD Bank Papua.",
    route: "/dinas/dashboard",
    icon: Landmark,
    tag: "Eksekutif & PAD",
    badgeColor: "bg-amber-100 text-amber-900 border-amber-300",
    accentBg: "bg-[#0B241E] text-[#D97706]",
    borderHover: "hover:border-[#D97706]",
    features: [
      "Dashboard PAD Harian/Bulanan/Tahunan",
      "Rekonsiliasi NTPD Bank Papua 1x24 Jam",
      "Persetujuan Angsuran SPARD (Maks 6 Bulan)",
      "Audit Kepatuhan Perbup Mimika 25/2024",
    ],
  },
  {
    id: "upt",
    code: "02",
    title: "Otoritas Pelabuhan (UPTD)",
    targetRole: "Syahbandar & Supervisor Sif",
    scope: "Pusat Komando Operasional Dermaga",
    description:
      "Manajemen alokasi dermaga otomatis, verifikasi manifes SOLAS berenkripsi, pencatatan waktu aktual kapal (ATA/ATB/ATD), gate scanner tiket porporasi, serta BAST tutup sif 1x24 jam.",
    route: "/upt/dashboard",
    icon: Anchor,
    tag: "Operasional UPTD",
    badgeColor: "bg-emerald-100 text-emerald-900 border-emerald-300",
    accentBg: "bg-emerald-800 text-emerald-200",
    borderHover: "hover:border-emerald-600",
    features: [
      "Buku Log Sandar Digital & Validasi SOLAS",
      "Alokasi Slot Dermaga 1 - 4 Bebas Bentrok",
      "Gate Scanner Tiket QR Anti-Passback",
      "BAST Sif Jaga & Setoran Kasda 1x24 Jam",
    ],
  },
  {
    id: "kapal",
    code: "03",
    title: "Perusahaan Pelayaran / Kapal",
    targetRole: "Operator Armada & Keagenan Kapal",
    scope: "Izin Sandar & Penagihan e-SKRD",
    description:
      "Pengajuan permohonan tambat-labuh kapal online, verifikasi SIUPAL dan Surat Ukur GT, input manifes penumpang terenkripsi, penerbitan izin berlayar (SPB), dan pembayaran billing e-SKRD.",
    route: "/kapal/dashboard",
    icon: Ship,
    tag: "Mitra Operator",
    badgeColor: "bg-blue-100 text-blue-900 border-blue-300",
    accentBg: "bg-blue-900 text-blue-200",
    borderHover: "hover:border-blue-600",
    features: [
      "Permohonan Sandar Online & Jadwal RPK",
      "Upload Manifes SOLAS Ber-Hash SHA-256",
      "Billing e-SKRD Jasa Labuh/Tambat Otomatis",
      "Izin Persetujuan Berlayar (SPB) Digital",
    ],
  },
  {
    id: "tenant",
    code: "04",
    title: "Mitra Tenant (Penyewa Aset)",
    targetRole: "Pelaku Usaha Kios, Los & Lahan BMD",
    scope: "Pemanfaatan Barang Milik Daerah",
    description:
      "Katalog sewa unit usaha di pelabuhan (Terminal, Pelataran, Gudang Lini 1), penandatanganan kontrak PKS digital, monitoring meteran utilitas riil (listrik & air), serta pembayaran retribusi berkala.",
    route: "/tenant",
    icon: Store,
    tag: "Sewa BMD Pelabuhan",
    badgeColor: "bg-purple-100 text-purple-900 border-purple-300",
    accentBg: "bg-purple-900 text-purple-200",
    borderHover: "hover:border-purple-600",
    features: [
      "Katalog Sewa Unit Usaha & Kios BMD",
      "Buku Kontrak PKS Digital & Perpanjangan",
      "Monitoring Meteran Listrik & Air Riil",
      "Tagihan e-SKRD Sewa & Pengajuan SPARD",
    ],
  },
  {
    id: "penumpang",
    code: "05",
    title: "Masyarakat / Penumpang",
    targetRole: "Penumpang Umum & Kendaraan",
    scope: "Layanan Publik & Tiket Penyeberangan",
    description:
      "Akses jadwal keberangkatan kapal penyeberangan real-time, pembelian karcis penumpang & kendaraan golongan I–VIII resmi berporporasi Bapenda, cek tarif retribusi, serta pengaduan fasilitas.",
    route: "/penumpang/beranda",
    icon: Ticket,
    tag: "Layanan Publik",
    badgeColor: "bg-teal-100 text-teal-900 border-teal-300",
    accentBg: "bg-teal-800 text-teal-200",
    borderHover: "hover:border-teal-600",
    features: [
      "Jadwal Penyeberangan Kapal Terkini",
      "Karcis Masuk Terminal Berporporasi QR",
      "Tarif Kendaraan Golongan I s/d VIII",
      "Kanal Pengaduan & Bantuan 24 Jam",
    ],
  },
];

// Data Video Hero Section
const HERO_VIDEOS = [
  {
    src: "/videos/Ferry_docking_at_port_pier_16795dc8_1080p.mp4",
    title: "Operasional Sandar Dermaga",
    subtitle: "Aktivitas manuver sandar dan olah gerak kapal penyeberangan di dermaga pelabuhan regional.",
    tag: "Dermaga 1 - 4 Aktif",
  },
  {
    src: "/videos/Ferry_sailing_down_tropical_river_211b9468_1080p.mp4",
    title: "Pelayaran Alur Perairan",
    subtitle: "Kelancaran rute pelayaran perintis dan logistik menghubungkan wilayah pesisir Mimika.",
    tag: "Alur Pelayaran Aman",
  },
];

// Mock Live Harbor Vessels
const LIVE_VESSELS = [
  {
    name: "KMP Dharma Rucitra VII",
    operator: "PT Dharma Lautan Utama",
    gt: 3450,
    route: "Merak - Bakauheni",
    dock: "Dermaga 2 (Eksekutif)",
    eta: "08:15",
    atb: "08:24",
    status: "Sandar Bongkar Muat",
    statusColor: "bg-emerald-100 text-emerald-800 border-emerald-300",
    spbStatus: "Dalam Clearance",
  },
  {
    name: "KM Sabuk Nusantara 75",
    operator: "PT Pelni (Persero)",
    gt: 1280,
    route: "Pomako - Agats - Merauke",
    dock: "Dermaga 1 (Reguler)",
    eta: "09:30",
    atb: "09:42",
    status: "Siap Bertolak",
    statusColor: "bg-blue-100 text-blue-800 border-blue-300",
    spbStatus: "SPB Terbit",
  },
  {
    name: "KMP Portlink III",
    operator: "PT ASDP Indonesia Ferry",
    gt: 5200,
    route: "Lintasan Utama",
    dock: "Dermaga 3 (Reguler)",
    eta: "11:00",
    atb: "-",
    status: "Menuju Alur Sandar",
    statusColor: "bg-amber-100 text-amber-800 border-amber-300",
    spbStatus: "Permohonan Disetujui",
  },
  {
    name: "KM Dobonsolo",
    operator: "PT Pelni (Persero)",
    gt: 14685,
    route: "Trayek Tol Laut Nusantara",
    dock: "Dermaga 4 (Kargo)",
    eta: "14:15",
    atb: "-",
    status: "Dijadwalkan Hari Ini",
    statusColor: "bg-slate-100 text-slate-800 border-slate-300",
    spbStatus: "Alokasi Siap",
  },
];

export default function LandingPage() {
  const router = useRouter();

  // State Video Hero Switcher (Dual Background Silent Auto-Crossfade)
  const [currentVideoIndex, setCurrentVideoIndex] = useState<number>(0);
  const videoRef0 = useRef<HTMLVideoElement | null>(null);
  const videoRef1 = useRef<HTMLVideoElement | null>(null);

  // Effect Pergantian Video Otomatis saat Video Selesai
  const handleVideoEnded = (endedIndex: number) => {
    if (endedIndex === currentVideoIndex) {
      const nextIndex = (currentVideoIndex + 1) % HERO_VIDEOS.length;
      setCurrentVideoIndex(nextIndex);
    }
  };

  // Sinkronisasi Video Playback saat Index Berganti (Muted Auto-Play)
  useEffect(() => {
    const activeRef = currentVideoIndex === 0 ? videoRef0.current : videoRef1.current;
    const inactiveRef = currentVideoIndex === 0 ? videoRef1.current : videoRef0.current;

    if (activeRef) {
      activeRef.currentTime = 0;
      activeRef.play().catch(() => {});
    }
    if (inactiveRef) {
      inactiveRef.pause();
    }
  }, [currentVideoIndex]);

  return (
    <div className="min-h-screen bg-[#F4F6F8] text-[#1E2922] font-sans flex flex-col selection:bg-[#D97706]/20 selection:text-[#0B241E]">
      {/* ========================================================= */}
      {/* FULL-SCREEN VIEWPORT WRAPPER (Navbar + Hero)              */}
      {/* ========================================================= */}
      <div className="min-h-screen lg:h-screen flex flex-col relative overflow-hidden bg-[#0B241E] text-white">
        {/* PUBLIC HEADER / NAVBAR                                    */}
        <header className="sticky top-0 z-30 bg-[#071915]/85 backdrop-blur-md border-b border-white/10 text-white shrink-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
            {/* Logo & Portal Identity */}
            <Link href="/" className="flex items-center gap-3 group">
              <img
                src="/brand/symbol-white.svg"
                alt="PORTA"
                className="w-9 h-9 sm:w-10 sm:h-10 object-contain drop-shadow-md group-hover:scale-105 transition-transform"
              />
              <div>
                <span className="text-xl sm:text-2xl font-black tracking-tight text-white block leading-none">
                  PORTA
                </span>
                <p className="text-[10px] text-[#85A69B] uppercase font-mono tracking-wider mt-1">
                  Pelabuhan & Penerimaan Daerah
                </p>
              </div>
            </Link>

            {/* Nav Links */}
            <nav className="hidden lg:flex items-center gap-8 text-xs font-semibold text-emerald-100/75 tracking-wide">
              <a href="#portal-gateway" className="hover:text-white transition-colors">
                Portal Layanan
              </a>
              <a href="#live-harbor" className="hover:text-white transition-colors">
                Jadwal Sandar
              </a>
              <a href="#kalkulator-tarif" className="hover:text-white transition-colors">
                Estimasi Tarif
              </a>
              <a href="#keunggulan" className="hover:text-white transition-colors">
                Kepatuhan & Tata Kelola
              </a>
              <a href="#pengaduan" className="hover:text-white transition-colors">
                Pengaduan
              </a>
            </nav>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <a
                href="#kalkulator-tarif"
                className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-white/[0.08] hover:bg-white/[0.14] border border-white/15 transition-all"
              >
                <Calculator className="w-3.5 h-3.5 text-[#F59E0B]" />
                <span>Cek Estimasi</span>
              </a>

              <Link
                href="/login"
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-[#0B241E] bg-[#D97706] hover:bg-[#B45309] shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <Lock className="w-4 h-4" />
                <span>Masuk Portal</span>
              </Link>
            </div>
          </div>
        </header>

        {/* 3. HERO SECTION (Fills Remaining Height to Complete 100vh) */}
        <section className="relative flex-1 min-h-0 flex flex-col justify-between overflow-hidden bg-[#0B241E] text-white">
          {/* Layer Video 1 (Muted Auto-Play, No Audio) */}
          <video
            ref={videoRef0}
            src={HERO_VIDEOS[0].src}
            muted
            playsInline
            autoPlay
            preload="auto"
            onEnded={() => handleVideoEnded(0)}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out pointer-events-none ${
              currentVideoIndex === 0 ? "opacity-100 z-0" : "opacity-0 -z-10"
            }`}
          />

          {/* Layer Video 2 (Muted Auto-Play, No Audio) */}
          <video
            ref={videoRef1}
            src={HERO_VIDEOS[1].src}
            muted
            playsInline
            preload="auto"
            onEnded={() => handleVideoEnded(1)}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out pointer-events-none ${
              currentVideoIndex === 1 ? "opacity-100 z-0" : "opacity-0 -z-10"
            }`}
          />

          {/* Directional Maritime Vignette: Protects Left Copy While Keeping Video Right Luminously Visible */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#04120E]/90 via-[#071914]/55 to-transparent z-10 pointer-events-none" />
          <div className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-[#0B241E] via-[#0B241E]/30 to-transparent z-10 pointer-events-none" />

          {/* Content Container (Padded nicely for full-screen display) */}
          <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-8 py-6 lg:py-10 w-full flex-1 flex flex-col justify-between">
            {/* Main Headline & Value Proposition */}
            <div className="max-w-3xl space-y-5 my-auto">
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-[-0.03em] text-white leading-[1.08] [text-wrap:balance] drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)]">
                Sistem Terpadu{" "}
                <span className="text-[#F59E0B]">
                  Operasional Pelabuhan
                </span>{" "}
                & Penerimaan Daerah
              </h1>

              <p className="text-base sm:text-lg text-emerald-100/90 leading-relaxed max-w-[56ch] font-normal [text-wrap:pretty] drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)]">
                Platform tata kelola maritim terintegrasi untuk percepatan alokasi dermaga, validasi manifes keselamatan SOLAS, pemanfaatan aset BMD, dan kepatuhan retribusi daerah secara transparan dan akuntabel.
              </p>

              {/* Quick CTAs */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Link
                  href="/login"
                  className="px-8 py-4 rounded-xl bg-[#D97706] hover:bg-[#B45309] text-[#0B241E] font-bold text-sm tracking-wide flex items-center gap-2.5 shadow-xl shadow-amber-950/40 transition-all cursor-pointer active:scale-[0.98]"
                >
                  <span>Akses Portal Layanan</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </Link>

                <a
                  href="#live-harbor"
                  className="px-7 py-4 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-white font-semibold text-sm border border-white/20 hover:border-white/40 backdrop-blur-md transition-all flex items-center gap-2.5 cursor-pointer shadow-sm active:scale-[0.98]"
                >
                  <Compass className="w-4 h-4 text-[#F59E0B]" />
                  <span>Papan Sandar Kapal Hari Ini</span>
                </a>
              </div>

              {/* Regulatory Trust Footnote */}
              <div className="pt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] font-mono text-emerald-300/70">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  PP No. 35 Tahun 2023
                </span>
                <span className="text-emerald-500/40">•</span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
                  Perbup Mimika No. 25 Tahun 2024
                </span>
                <span className="text-emerald-500/40">•</span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                  Manifes Terverifikasi SOLAS
                </span>
              </div>
            </div>

            {/* Bottom Floating Bar (Scroll Cue & Port Status) */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/10">
              <div className="flex items-center gap-2.5 text-xs font-mono text-emerald-200/80 drop-shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Otoritas UPTD Pelabuhan Merak • Operasional Aktif 24/7</span>
              </div>

              {/* Scroll Down Prompt */}
              <a
                href="#portal-gateway"
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.08] hover:bg-white/[0.15] border border-white/15 text-xs font-mono text-emerald-100 hover:text-white transition-all group"
              >
                <span>Jelajahi Portal Layanan</span>
                <ChevronDown className="w-4 h-4 text-[#F59E0B] group-hover:translate-y-0.5 transition-transform" />
              </a>
            </div>
          </div>
        </section>
      </div>

      {/* ========================================================= */}
      {/* 4. GATEWAY 5 PORTAL STAKEHOLDER (INTERACTIVE ROLE CARDS) */}
      {/* ========================================================= */}
      <section id="portal-gateway" className="py-20 px-4 sm:px-8 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Section Heading */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#D97706] bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              Gateway Pemangku Kepentingan
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0B241E]">
              Pilih Kanal Layanan Berdasarkan Peran Anda
            </h2>
            <p className="text-sm text-slate-600">
              Setiap pihak memiliki hak akses, alur kerja digital, dan tanggung jawab tata kelola pelabuhan yang disesuaikan secara terenkripsi.
            </p>
          </div>

          {/* 5 Role Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PORTAL_ROLES.map((role) => {
              const IconComp = role.icon;
              return (
                <div
                  key={role.id}
                  className={`bg-[#F8FAFC] rounded-2xl border border-slate-200/90 p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group ${role.borderHover}`}
                >
                  <div className="space-y-4">
                    {/* Top Row: Icon & Tag */}
                    <div className="flex items-center justify-between">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-xs ${role.accentBg}`}
                      >
                        <IconComp className="w-6 h-6" />
                      </div>
                      <span
                        className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border ${role.badgeColor}`}
                      >
                        {role.tag}
                      </span>
                    </div>

                    {/* Titles */}
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 font-bold block uppercase tracking-wider">
                        Kanal {role.code} • {role.targetRole}
                      </span>
                      <h3 className="text-lg font-extrabold text-[#0B241E] mt-0.5 group-hover:text-[#D97706] transition-colors">
                        {role.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                        {role.description}
                      </p>
                    </div>

                    {/* Features List */}
                    <div className="pt-2 border-t border-slate-200/60 space-y-1.5">
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                        Fitur Utama:
                      </span>
                      {role.features.map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Access Button */}
                  <div className="pt-6 mt-4 border-t border-slate-200/60">
                    <Link
                      href="/login"
                      className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-[#0B241E] group-hover:bg-[#D97706] group-hover:text-[#0B241E] transition-all flex items-center justify-between cursor-pointer shadow-xs active:scale-95"
                    >
                      <span>Masuk ke {role.title.split(" ")[0]} Portal</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 5. LIVE HARBOR BOARD & SCHEDULE REAL-TIME                 */}
      {/* ========================================================= */}
      <section id="live-harbor" className="py-20 px-4 sm:px-8 bg-[#F4F6F8] border-b border-slate-200">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#0B241E] bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200 inline-block mb-2">
                Pusat Informasi Sandar & Log Kapal
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B241E]">
                Papan Pelayaran & Alokasi Dermaga Real-Time
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
                Transparansi pergerakan armada kapal penyeberangan dan perintis di pelabuhan regional, diverifikasi oleh Syahbandar UPTD Merak.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-slate-500">
                Pembaruan: <strong className="text-[#0B241E]">10 Detik Lalu</strong>
              </span>
              <button
                type="button"
                onClick={() => router.push("/upt/kapal")}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white text-[#0B241E] border border-slate-300 hover:bg-slate-50 shadow-2xs flex items-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-4 h-4 text-[#D97706]" />
                <span>Buku Log Sandar</span>
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#0B241E] text-white text-[11px] font-mono uppercase tracking-wider">
                    <th className="py-3.5 px-4 font-bold">Armada & Operator</th>
                    <th className="py-3.5 px-4 font-bold">Tonase (GT)</th>
                    <th className="py-3.5 px-4 font-bold">Lintasan Pelayaran</th>
                    <th className="py-3.5 px-4 font-bold">Dermaga</th>
                    <th className="py-3.5 px-4 font-bold">Jadwal (ETA / ATB)</th>
                    <th className="py-3.5 px-4 font-bold">Status Operasional</th>
                    <th className="py-3.5 px-4 font-bold text-right">Clearance SPB</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {LIVE_VESSELS.map((vessel, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-[#0B241E]">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200">
                            <Ship className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="block text-xs font-bold text-[#0B241E]">
                              {vessel.name}
                            </span>
                            <span className="text-[10px] text-slate-400 block font-normal">
                              {vessel.operator}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-700">
                        {vessel.gt.toLocaleString("id-ID")} GT
                      </td>

                      <td className="py-3.5 px-4 text-slate-700 font-medium">
                        {vessel.route}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-[#0B241E] px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                          {vessel.dock}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        <span>ETA: {vessel.eta}</span>
                        <span className="block text-[10px] text-slate-400">
                          ATB: {vessel.atb}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border font-mono ${vessel.statusColor}`}
                        >
                          {vessel.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 font-bold">
                          {vessel.spbStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-2">
              <span>
                Menampilkan data kapal resmi dalam pengawasan Syahbandar UPTD Pelabuhan Merak.
              </span>
              <Link
                href="/penumpang/jadwal"
                className="text-[#D97706] hover:underline font-bold flex items-center gap-1"
              >
                <span>Lihat Seluruh Jadwal Penyeberangan Penumpang</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 6. KALKULATOR ESTIMASI TARIF RETRIBUSI RESMI              */}
      {/* 6. KALKULATOR RETRIBUSI INTERAKTIF */}
      <TariffCalculatorSection />

      {/* ========================================================= */}
      {/* 7. EMPAT PILAR KEUNGGULAN SISTEM PORTA                    */}
      {/* ========================================================= */}
      <section id="keunggulan" className="py-20 px-4 sm:px-8 bg-[#0B241E] text-white border-b border-[#143E33]">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#D97706] bg-[#143E33] px-3 py-1 rounded-full border border-[#1E5748]">
              Keunggulan Arsitektur Sistem
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
              Empat Pilar Transparansi & Kepatuhan Tata Kelola
            </h2>
            <p className="text-sm text-[#BED2CA]">
              Dirancang khusus mengatasi celah kebocoran pendapatan asli daerah dan menjamin standar keselamatan maritim internasional.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Pilar 1 */}
            <div className="p-6 rounded-2xl bg-[#12362C]/70 border border-[#1C4D3F] space-y-4 hover:border-[#D97706] transition-colors">
              <div className="w-12 h-12 rounded-xl bg-[#0B241E] text-[#D97706] flex items-center justify-center border border-[#1E5748]">
                <Coins className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-white">
                Zero-Leakage Kasda 1x24 Jam
              </h3>
              <p className="text-xs text-[#BED2CA] leading-relaxed">
                Kepatuhan mutlak Pasal 18 huruf e Perbup Mimika 25/2024. Seluruh penerimaan tunai loket wajib disetor bruto maksimal 1x24 jam ke RKUD Bank Papua melalui BAST resmi.
              </p>
            </div>

            {/* Pilar 2 */}
            <div className="p-6 rounded-2xl bg-[#12362C]/70 border border-[#1C4D3F] space-y-4 hover:border-[#D97706] transition-colors">
              <div className="w-12 h-12 rounded-xl bg-[#0B241E] text-emerald-400 flex items-center justify-center border border-[#1E5748]">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-white">
                Validasi Manifes SOLAS Berenkripsi
              </h3>
              <p className="text-xs text-[#BED2CA] leading-relaxed">
                Pencegahan muatan berlebih (*overcapacity*) melalui verifikasi identitas penumpang ber-hash SHA-256, batas beban tonase, serta clearance izin berlayar (SPB) terintegrasi.
              </p>
            </div>

            {/* Pilar 3 */}
            <div className="p-6 rounded-2xl bg-[#12362C]/70 border border-[#1C4D3F] space-y-4 hover:border-[#D97706] transition-colors">
              <div className="w-12 h-12 rounded-xl bg-[#0B241E] text-blue-400 flex items-center justify-center border border-[#1E5748]">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-white">
                Gerbang Kontrol Anti-Passback
              </h3>
              <p className="text-xs text-[#BED2CA] leading-relaxed">
                Karcis porporasi berbarcode dinamis yang mencegah pemakaian tiket ganda. Sistem loket gate tetap dapat beroperasi secara *offline resilience* di blind spot sinyal dermaga.
              </p>
            </div>

            {/* Pilar 4 */}
            <div className="p-6 rounded-2xl bg-[#12362C]/70 border border-[#1C4D3F] space-y-4 hover:border-[#D97706] transition-colors">
              <div className="w-12 h-12 rounded-xl bg-[#0B241E] text-purple-400 flex items-center justify-center border border-[#1E5748]">
                <Store className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-white">
                Tertib Aset BMD & PKS Digital
              </h3>
              <p className="text-xs text-[#BED2CA] leading-relaxed">
                Pengelolaan sewa kios dan lahan terminal secara legal melalui buku kontrak PKS digital, larangan *sublease* bawah tangan, dan rekonsiliasi meteran utilitas riil.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 8. LANDASAN HUKUM & REGULASI FORMAL                       */}
      {/* ========================================================= */}
      <section className="py-16 px-4 sm:px-8 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Kepastian Hukum & Regulasi
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#0B241E]">
              Landasan Kebijakan & Kepatuhan Formal
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-slate-200 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 font-bold font-mono">
                PP
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#0B241E]">
                  PP No. 35 Tahun 2023
                </h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Ketentuan Umum Pajak Daerah dan Retribusi Daerah, standardisasi tarif jasa kepelabuhanan dan batas sanksi denda bunga administratif.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-slate-200 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 font-bold font-mono">
                PB
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#0B241E]">
                  Perbup Mimika No. 25 Tahun 2024
                </h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Tata Cara Pemungutan Retribusi Daerah, kewajiban SKRD, BAST sif jaga, porporasi karcis Bapenda, dan sanksi denda 1% STRD per bulan.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-slate-200 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center shrink-0 font-bold font-mono">
                SL
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#0B241E]">
                  Konvensi SOLAS 1974
                </h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  International Convention for the Safety of Life at Sea mengenai integritas manifes penumpang, kapasitas alat apung, dan izin clearance SPB.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 9. KANAL PENGADUAN & BANTUAN LAPANGAN                     */}
      {/* ========================================================= */}
      <section id="pengaduan" className="py-16 px-4 sm:px-8 bg-[#F4F6F8]">
        <div className="max-w-7xl mx-auto bg-gradient-to-r from-[#0B241E] to-[#143E33] rounded-3xl p-8 sm:p-12 text-white border border-[#1E5748] shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="max-w-2xl space-y-3">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#D97706] bg-[#071915] px-3 py-1 rounded-full border border-[#1E5748]">
              Layanan Suara Warga & Bantuan
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              Kanal Pengaduan Pungli & Gangguan Fasilitas
            </h3>
            <p className="text-xs sm:text-sm text-[#BED2CA] leading-relaxed">
              Temukan pungutan tidak resmi di luar karcis porporasi atau kerusakan fasilitas dermaga? Laporkan langsung secara anonim untuk ditindaklanjuti Tim Reaksi Cepat UPTD dan Inspektorat Dishub.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
            <Link
              href="/penumpang/pengaduan"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#D97706] hover:bg-[#B45309] text-[#0B241E] font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span>Kirim Laporan Pengaduan</span>
            </Link>

            <a
              href="tel:08114900000"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#0B241E] hover:bg-[#071915] text-white font-bold text-xs border border-[#1E5748] flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <PhoneCall className="w-4 h-4 text-[#D97706]" />
              <span>Hotline Radio VHF Ch 16</span>
            </a>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 10. PUBLIC FOOTER */}
      <LandingFooter />
    </div>
  );
}
