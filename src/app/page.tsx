"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Anchor,
  Ship,
  Compass,
  Store,
  Ticket,
  ShieldCheck,
  ArrowRight,
  ChevronRight,
  ChevronDown,
  Calculator,
  FileText,
  Send,
  PhoneCall,
  Coins,
  QrCode,
  Lock,
  UserPlus,
  FileSignature,
  Receipt,
  MapPin,
  Menu,
  X,
  Clock,
} from "lucide-react";
import { TariffCalculatorSection } from "@/components/landing/TariffCalculatorSection";
import { LandingFooter } from "@/components/landing/LandingFooter";

const WORKFLOW_STAGES = [
  {
    step: "01",
    title: "Registrasi & PKS Digital",
    tag: "Pra-Operasional",
    description:
      "Verifikasi legalitas operator kapal & tenant, pengajuan PKS Sandar (tanda tangan basah + TTE Kepala Pelabuhan), serta kontrak sewa aset BMD.",
    detail: "Output: Kontrak PKS Aktif & Kuota Sandar",
    image: "/images/kepala-pelabuhan-hero.jpg",
    imageCaption: "Pengesahan PKS Digital & TTE Kepala Pelabuhan Poumako",
    icon: FileSignature,
  },
  {
    step: "02",
    title: "Alokasi Dermaga & SOLAS",
    tag: "Perencanaan Slot",
    description:
      "Penetapan slot sandar anti-bentrok di dermaga Poumako, validasi manifes penumpang & muatan berenkripsi SHA-256, serta persetujuan SPB.",
    detail: "Output: Penetapan Tambat & Clearance SPB",
    image: "/images/poumako-pier-ops.jpg",
    imageCaption: "Alokasi Slot Dermaga Umum Poumako (WIT)",
    icon: Anchor,
  },
  {
    step: "03",
    title: "Operasional & Utilitas",
    tag: "Lapangan Real-Time",
    description:
      "Pencatatan waktu aktual kapal (ATA/ATB/ATD), aktivitas bongkar muat & sewa alat pelabuhan, serta pembacaan meter air bersih dan listrik.",
    detail: "Output: Log Sandar, Bongkar Muat & Meter Utilitas",
    image: "/images/poumako-solas-ship.jpg",
    imageCaption: "Pemantauan Pergerakan Armada & Keselamatan Pelayaran",
    icon: Ship,
  },
  {
    step: "04",
    title: "e-SKRD & Rekonsiliasi Kasda",
    tag: "Penerimaan Daerah",
    description:
      "Penerbitan tagihan retribusi otomatis sesuai Perbup Mimika 25/2024, verifikasi pembayaran, dan setoran bruto 1x24 jam ke RKUD Bank Papua.",
    detail: "Output: NTPD Terverifikasi & Laporan Kasda",
    image: "/images/register-maritime-bg.jpg",
    imageCaption: "Integrasi Penerimaan Daerah ke RKUD Bank Papua",
    icon: Receipt,
  },
];

const GOVERNANCE_PILLARS = [
  {
    id: "kasda",
    label: "Zero-Leakage Kasda",
    eyebrow: "PASAL 18 PERBUP MIMIKA 25/2024",
    title: "Setoran Bruto 1x24 Jam ke RKUD Bank Papua",
    description:
      "Seluruh penerimaan tunai loket maupun billing e-SKRD wajib disetor bruto maksimal 1x24 jam melalui Berita Acara Serah Terima (BAST) tutup sif dan rekonsiliasi NTPD real-time.",
    metric: "1x24 Jam",
    metricLabel: "Batas Maksimal Rekonsiliasi Kasda",
    image: "/images/register-maritime-bg.jpg",
    icon: Coins,
  },
  {
    id: "tte",
    label: "PKS Digital & TTE",
    eyebrow: "TATA KELOLA KONTRAK BERJENJANG",
    title: "Tanda Tangan Basah & TTE Kepala Pelabuhan",
    description:
      "Pengajuan PKS Sandar dan Sewa Ruangan BMD diproses berjenjang mulai verifikasi petugas, scan tanda tangan basah operator, hingga pengesahan Tanda Tangan Elektronik (TTE) ber-hash SHA-256.",
    metric: "SHA-256",
    metricLabel: "Validasi Integritas Dokumen PKS",
    image: "/images/kepala-pelabuhan-hero.jpg",
    icon: FileSignature,
  },
  {
    id: "solas",
    label: "Manifes SOLAS",
    eyebrow: "KESELAMATAN MARITIM INTERNASIONAL",
    title: "Validasi Manifes Penumpang & Batas Tonase",
    description:
      "Mencegah kelebihan muatan (overcapacity) melalui verifikasi identitas penumpang terenkripsi, pengecekan kapasitas alat apung, serta penerbitan Surat Persetujuan Berlayar (SPB).",
    metric: "100%",
    metricLabel: "Kepatuhan Clearance Pra-Berlayar",
    image: "/images/poumako-solas-ship.jpg",
    icon: ShieldCheck,
  },
  {
    id: "gate",
    label: "Tiket QR Porporasi",
    eyebrow: "GERBANG TERMINAL ANTI-PASSBACK",
    title: "Karcis Masuk Terminal Berporporasi Bapenda",
    description:
      "Sistem gerbang QR sekali pakai menutup celah kebocoran retribusi pas masuk penumpang dan kendaraan golongan I–VIII dengan dukungan sinkronisasi saat sinyal terbatas.",
    metric: "Gol I–VIII",
    metricLabel: "Cakupan Tarif Penumpang & Kendaraan",
    image: "/images/poumako-terminal-gate.jpg",
    icon: QrCode,
  },
];

const PUBLIC_QUICK_CHANNELS = [
  {
    title: "Operator Kapal & Keagenan",
    subtitle: "Daftar & ajukan PKS Sandar, slot dermaga, serta manifes.",
    href: "/register",
    cta: "Daftar Mitra",
    icon: Ship,
  },
  {
    title: "Pelaku Usaha & Tenant BMD",
    subtitle: "Ajukan sewa kios, gudang, atau lahan terminal pelabuhan.",
    href: "/register-tenant",
    cta: "Daftar Tenant",
    icon: Store,
  },
  {
    title: "Masyarakat & Penumpang",
    subtitle: "Cek jadwal keberangkatan kapal, tarif resmi, dan tiket.",
    href: "/penumpang/beranda",
    cta: "Buka Portal",
    icon: Ticket,
  },
];

const HERO_VIDEOS = [
  { src: "/videos/Ferry_docking_at_port_pier_16795dc8_1080p.mp4" },
  { src: "/videos/Ferry_sailing_down_tropical_river_211b9468_1080p.mp4" },
];

const HARBOR_SCHEDULE_PREVIEW = [
  {
    name: "KM Mimika PACE",
    operator: "PT Mimika Bahari Nusantara",
    gt: 1850,
    route: "Dobo — Pelabuhan Umum Poumako",
    dock: "DRM-PEMDA-01",
    eta: "08:15 WIT",
    atb: "08:25 WIT",
    status: "Sandar Bongkar Muat",
    category: "SANDAR" as const,
    statusColor: "bg-emerald-50 text-emerald-800 border-emerald-200",
    spbStatus: "Dalam Clearance",
  },
  {
    name: "KM Sabuk Nusantara 75",
    operator: "PT Pelni (Persero)",
    gt: 1280,
    route: "Poumako — Agats — Merauke",
    dock: "DRM-UPP-01",
    eta: "09:30 WIT",
    atb: "09:42 WIT",
    status: "Siap Bertolak",
    category: "SANDAR" as const,
    statusColor: "bg-blue-50 text-blue-800 border-blue-200",
    spbStatus: "SPB Terbit",
  },
  {
    name: "KM Meratus Kampar",
    operator: "PT Meratus Line",
    gt: 4200,
    route: "Makassar — Poumako — Jayapura",
    dock: "DOL-PEMDA-01",
    eta: "11:10 WIT",
    atb: "-",
    status: "Menuju Alur Sandar",
    category: "MENUJU" as const,
    statusColor: "bg-amber-50 text-amber-800 border-amber-200",
    spbStatus: "Alokasi Disetujui",
  },
  {
    name: "KLM Putri Kamoro",
    operator: "Pelayaran Rakyat Mimika",
    gt: 480,
    route: "Poumako — Kokonao — Potowai",
    dock: "TLD-PEMDA-01",
    eta: "14:00 WIT",
    atb: "-",
    status: "Dijadwalkan Hari Ini",
    category: "JADWAL" as const,
    statusColor: "bg-slate-100 text-slate-700 border-slate-200",
    spbStatus: "Alokasi Siap",
  },
];

export default function LandingPage() {
  const router = useRouter();
  const [currentVideoIndex, setCurrentVideoIndex] = useState<number>(0);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [activeStageIdx, setActiveStageIdx] = useState<number>(0);
  const [activePillarIdx, setActivePillarIdx] = useState<number>(0);
  const [harborFilter, setHarborFilter] = useState<"ALL" | "SANDAR" | "MENUJU" | "JADWAL">("ALL");
  const [selectedVessel, setSelectedVessel] = useState<(typeof HARBOR_SCHEDULE_PREVIEW)[number] | null>(
    null
  );
  const [witTime, setWitTime] = useState<string>("");
  const videoRef0 = useRef<HTMLVideoElement | null>(null);
  const videoRef1 = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const updateClock = () => {
      setWitTime(
        new Date().toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "Asia/Jayapura",
        })
      );
    };
    updateClock();
    const timer = setInterval(updateClock, 30000);
    return () => clearInterval(timer);
  }, []);

  const handleVideoEnded = (endedIndex: number) => {
    if (endedIndex === currentVideoIndex) {
      setCurrentVideoIndex((currentVideoIndex + 1) % HERO_VIDEOS.length);
    }
  };

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

  const filteredVessels = useMemo(() => {
    if (harborFilter === "ALL") return HARBOR_SCHEDULE_PREVIEW;
    return HARBOR_SCHEDULE_PREVIEW.filter((v) => v.category === harborFilter);
  }, [harborFilter]);

  const currentStage = WORKFLOW_STAGES[activeStageIdx] || WORKFLOW_STAGES[0];
  const currentPillar = GOVERNANCE_PILLARS[activePillarIdx] || GOVERNANCE_PILLARS[0];
  const CurrentPillarIcon = currentPillar.icon;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E2922] font-sans flex flex-col selection:bg-[#D97706]/20 selection:text-[#0B241E]">
      {/* 1. FULL-VIEWPORT VIDEO HERO + TRANSPARENT-TO-GREEN NAVBAR */}
      <div className="min-h-[100dvh] lg:h-[100dvh] lg:min-h-[640px] flex flex-col relative overflow-hidden bg-[#051310] text-white">
        <header
          className={`fixed top-0 inset-x-0 z-40 text-white transition-all duration-300 ${
            isScrolled || isMobileMenuOpen
              ? "bg-[#071D17]/95 backdrop-blur-md border-b border-white/15 shadow-lg"
              : "bg-gradient-to-b from-black/50 via-black/20 to-transparent border-b border-white/10"
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 sm:h-20 flex items-center justify-between gap-3">
            <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
              <img
                src="/brand/symbol-white.svg"
                alt="PORTA"
                className="w-8 h-8 sm:w-10 sm:h-10 object-contain drop-shadow-md group-hover:scale-105 transition-transform"
              />
              <div>
                <span className="text-lg sm:text-2xl font-black tracking-tight text-white block leading-none">
                  PORTA
                </span>
                <p className="hidden sm:block text-[10px] text-[#85A69B] uppercase font-mono tracking-wider mt-1">
                  Pelabuhan &amp; Penerimaan Daerah
                </p>
              </div>
            </Link>

            <nav className="hidden lg:flex items-center gap-7 text-xs font-semibold text-emerald-100/85 tracking-wide">
              <a href="#alur-layanan" className="hover:text-white transition-colors">
                Alur Layanan
              </a>
              <a href="#live-harbor" className="hover:text-white transition-colors">
                Jadwal Sandar
              </a>
              <a href="#kalkulator-tarif" className="hover:text-white transition-colors">
                Estimasi Tarif
              </a>
              <a href="#keunggulan" className="hover:text-white transition-colors">
                Tata Kelola
              </a>
              <a href="#pengaduan" className="hover:text-white transition-colors">
                Pengaduan
              </a>
            </nav>

            <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
              <Link
                href="/register"
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-white/[0.08] hover:bg-white/[0.15] border border-white/15 transition-all whitespace-nowrap"
              >
                <UserPlus className="w-3.5 h-3.5 text-[#F59E0B]" />
                <span>Daftar Mitra</span>
              </Link>

              <Link
                href="/login"
                className="px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs font-bold text-[#0B241E] bg-[#D97706] hover:bg-[#B45309] shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer active:scale-95 whitespace-nowrap"
              >
                <Lock className="w-3.5 h-3.5 shrink-0" />
                <span>Masuk Portal</span>
              </Link>

              <button
                type="button"
                onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                aria-label={isMobileMenuOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
                className="lg:hidden p-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white cursor-pointer"
              >
                {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {isMobileMenuOpen && (
            <div className="lg:hidden border-t border-white/10 bg-[#071D17] px-4 py-4 space-y-3">
              <nav className="grid grid-cols-2 gap-2 text-xs font-semibold text-emerald-100">
                {[
                  { href: "#alur-layanan", label: "Alur Layanan" },
                  { href: "#live-harbor", label: "Jadwal Sandar" },
                  { href: "#kalkulator-tarif", label: "Estimasi Tarif" },
                  { href: "#keunggulan", label: "Tata Kelola" },
                  { href: "#pengaduan", label: "Pengaduan" },
                ].map((navItem) => (
                  <a
                    key={navItem.href}
                    href={navItem.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-white"
                  >
                    {navItem.label}
                  </a>
                ))}
                <Link
                  href="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-xl bg-[#D97706]/20 border border-[#D97706]/40 text-[#F59E0B] font-bold"
                >
                  Daftar Mitra
                </Link>
              </nav>
            </div>
          )}
        </header>

        <section className="relative flex-1 min-h-0 flex flex-col justify-between overflow-hidden bg-[#051310] text-white">
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

          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-transparent z-10 pointer-events-none" />
          <div className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-black/80 via-black/25 to-transparent z-10 pointer-events-none" />

          <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-8 pt-24 pb-8 lg:pt-28 lg:pb-12 w-full flex-1 flex flex-col justify-between">
            <div className="max-w-3xl space-y-5 my-auto">
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/[0.08] border border-white/15 backdrop-blur-md text-[11px] font-mono text-emerald-100">
                <MapPin className="w-3.5 h-3.5 text-[#F59E0B]" />
                <span>Pelabuhan Umum Poumako — Kabupaten Mimika</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-[4rem] font-extrabold tracking-[-0.03em] text-white leading-[1.08] [text-wrap:balance] drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)]">
                Kendali Terpadu{" "}
                <span className="text-[#F59E0B]">Operasional Pelabuhan</span>{" "}
                &amp; Penerimaan Daerah
              </h1>

              <p className="text-sm sm:text-base lg:text-lg text-emerald-100/90 leading-relaxed max-w-[54ch] font-normal [text-wrap:pretty] drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)]">
                Platform maritim terintegrasi untuk manajemen sandar dermaga, validasi manifes keselamatan SOLAS, tata kelola aset BMD, dan pelaporan retribusi daerah secara akuntabel.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3.5">
                <Link
                  href="/login"
                  className="px-7 py-3.5 rounded-xl bg-[#D97706] hover:bg-[#B45309] text-[#0B241E] font-bold text-sm tracking-wide flex items-center gap-2.5 shadow-xl shadow-amber-950/40 transition-all cursor-pointer active:scale-[0.98]"
                >
                  <span>Masuk Portal Layanan</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </Link>

                <a
                  href="#kalkulator-tarif"
                  className="px-6 py-3.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-white font-semibold text-sm border border-white/20 hover:border-white/40 backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer active:scale-[0.98]"
                >
                  <Calculator className="w-4 h-4 text-[#F59E0B]" />
                  <span>Simulasi Tarif Retribusi</span>
                </a>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/10">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1.5 text-[11px] font-mono text-emerald-200/85">
                <span>PP No. 35 Tahun 2023</span>
                <span className="hidden sm:inline text-white/25">|</span>
                <span>Perbup Mimika No. 25 Tahun 2024</span>
                <span className="hidden sm:inline text-white/25">|</span>
                <span>Rekonsiliasi RKUD Bank Papua</span>
              </div>

              <a
                href="#alur-layanan"
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.08] hover:bg-white/[0.15] border border-white/15 text-xs font-mono text-emerald-100 hover:text-white transition-all group"
              >
                <span>Eksplorasi Alur Sistem</span>
                <ChevronDown className="w-4 h-4 text-[#F59E0B] group-hover:translate-y-0.5 transition-transform" />
              </a>
            </div>
          </div>
        </section>
      </div>

      {/* 2. INTERACTIVE SPLIT STAGE: ALUR OPERASIONAL (NON-CARD EDITORIAL LAYOUT) */}
      <section id="alur-layanan" className="scroll-mt-24 py-24 px-4 sm:px-8 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="max-w-2xl space-y-3">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#D97706]">
                Alur Operasional End-to-End
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0B241E] tracking-tight leading-tight">
                Dari Permohonan Sandar hingga Setoran Kasda
              </h2>
            </div>
            <p className="text-sm text-slate-600 max-w-md leading-relaxed">
              Pilih setiap tahapan di bawah untuk melihat bagaimana proses kepelabuhanan di Poumako berjalan terhubung secara digital.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Interactive Typographic Selector (No Heavy Boxes) */}
            <div className="lg:col-span-5 divide-y divide-slate-200 border-y border-slate-200">
              {WORKFLOW_STAGES.map((stage, idx) => {
                const isActive = activeStageIdx === idx;
                const IconComp = stage.icon;
                return (
                  <button
                    key={stage.step}
                    type="button"
                    onClick={() => setActiveStageIdx(idx)}
                    className={`w-full text-left py-5 px-4 transition-all flex items-start gap-4 cursor-pointer relative ${
                      isActive ? "bg-slate-50/90" : "hover:bg-slate-50/50"
                    }`}
                  >
                    <span
                      className={`absolute left-0 top-0 bottom-0 w-1 transition-all ${
                        isActive ? "bg-[#D97706]" : "bg-transparent"
                      }`}
                    />
                    <span
                      className={`font-mono text-xs font-black pt-0.5 ${
                        isActive ? "text-[#D97706]" : "text-slate-400"
                      }`}
                    >
                      {stage.step}
                    </span>
                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <h3
                          className={`text-base font-extrabold transition-colors ${
                            isActive ? "text-[#0B241E]" : "text-slate-600"
                          }`}
                        >
                          {stage.title}
                        </h3>
                        <IconComp
                          className={`w-4 h-4 shrink-0 ${
                            isActive ? "text-[#D97706]" : "text-slate-400"
                          }`}
                        />
                      </div>
                      {isActive && (
                        <div className="space-y-2 pt-1">
                          <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed">
                            {stage.description}
                          </p>
                          <span className="inline-block text-[11px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md">
                            {stage.detail}
                          </span>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right Full-Bleed Dynamic Photo Stage */}
            <div className="lg:col-span-7">
              <div className="relative rounded-3xl overflow-hidden aspect-[16/10] shadow-2xl bg-[#0B241E]">
                <img
                  key={currentStage.image}
                  src={currentStage.image}
                  alt={currentStage.imageCaption}
                  className="w-full h-full object-cover transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-white">
                  <div className="space-y-1">
                    <span className="text-[10.5px] font-mono uppercase tracking-widest text-[#F59E0B] font-bold">
                      Tahap {currentStage.step} — {currentStage.tag}
                    </span>
                    <h4 className="text-lg sm:text-xl font-extrabold">
                      {currentStage.imageCaption}
                    </h4>
                  </div>
                  <Link
                    href="/login"
                    className="px-4 py-2.5 rounded-xl bg-white text-[#0B241E] hover:bg-[#F59E0B] text-xs font-bold inline-flex items-center gap-1.5 shrink-0 transition-colors"
                  >
                    <span>Akses Modul</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Clean Hairline 3-Column Quick Access Strip (No Boxed Cards) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-10 border-t border-slate-200">
            {PUBLIC_QUICK_CHANNELS.map((channel) => {
              const IconComp = channel.icon;
              return (
                <Link
                  key={channel.href}
                  href={channel.href}
                  className="group flex items-start justify-between gap-4 py-2 transition-colors"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-full bg-slate-100 group-hover:bg-[#0B241E] text-[#0B241E] group-hover:text-[#F59E0B] flex items-center justify-center shrink-0 transition-colors">
                      <IconComp className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-[#0B241E] group-hover:text-[#D97706] transition-colors">
                        {channel.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {channel.subtitle}
                      </p>
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-[#0B241E] group-hover:text-[#D97706] mt-2">
                        <span>{channel.cta}</span>
                        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. OPEN TIMETABLE: PAPAN JADWAL SANDAR POUMAKO */}
      <section id="live-harbor" className="scroll-mt-24 py-24 px-4 sm:px-8 bg-[#F4F6F8] border-b border-slate-200">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2.5 mb-2">
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#0B241E]">
                  Lalu Lintas Kapal Poumako
                </span>
                {witTime && (
                  <span className="text-[11px] font-mono font-bold text-[#0B241E] bg-white px-2.5 py-0.5 rounded-full border border-slate-200 inline-flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-[#D97706]" />
                    <span>{witTime} WIT</span>
                  </span>
                )}
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0B241E] tracking-tight">
                Papan Jadwal Sandar Pelabuhan
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1.5 max-w-2xl">
                Klik salah satu kapal untuk memeriksa detail alokasi dermaga dan status clearance keberangkatan.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {(
                [
                  { id: "ALL", label: `Semua (${HARBOR_SCHEDULE_PREVIEW.length})` },
                  {
                    id: "SANDAR",
                    label: `Sedang Sandar (${
                      HARBOR_SCHEDULE_PREVIEW.filter((v) => v.category === "SANDAR").length
                    })`,
                  },
                  {
                    id: "MENUJU",
                    label: `Menuju Alur (${
                      HARBOR_SCHEDULE_PREVIEW.filter((v) => v.category === "MENUJU").length
                    })`,
                  },
                  {
                    id: "JADWAL",
                    label: `Dijadwalkan (${
                      HARBOR_SCHEDULE_PREVIEW.filter((v) => v.category === "JADWAL").length
                    })`,
                  },
                ] as const
              ).map((pill) => (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => setHarborFilter(pill.id)}
                  className={`px-3.5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    harborFilter === pill.id
                      ? "bg-[#0B241E] text-white"
                      : "bg-white text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {pill.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => router.push("/penumpang/jadwal")}
                className="px-4 py-2 rounded-full text-xs font-bold bg-[#D97706] hover:bg-[#B45309] text-[#0B241E] inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Jadwal Penuh</span>
              </button>
            </div>
          </div>

          <div className="border-y border-slate-300 bg-white/75 backdrop-blur-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-300 text-[11px] font-mono uppercase tracking-wider text-slate-500">
                    <th className="py-4 px-4 font-bold">Armada &amp; Operator</th>
                    <th className="py-4 px-4 font-bold">Tonase</th>
                    <th className="py-4 px-4 font-bold">Lintasan Pelayaran</th>
                    <th className="py-4 px-4 font-bold">Dermaga</th>
                    <th className="py-4 px-4 font-bold">ETA / ATB</th>
                    <th className="py-4 px-4 font-bold">Status</th>
                    <th className="py-4 px-4 font-bold text-right">Clearance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredVessels.map((vessel, idx) => (
                    <tr
                      key={idx}
                      onClick={() => setSelectedVessel(vessel)}
                      className="hover:bg-white transition-colors cursor-pointer group"
                    >
                      <td className="py-4 px-4 font-bold text-[#0B241E]">
                        <div className="flex items-center gap-3">
                          <Ship className="w-4 h-4 text-[#D97706] shrink-0" />
                          <div>
                            <span className="block text-xs font-extrabold text-[#0B241E] group-hover:text-[#D97706] transition-colors">
                              {vessel.name}
                            </span>
                            <span className="text-[11px] text-slate-500 block font-normal">
                              {vessel.operator}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 font-mono font-semibold text-slate-700 whitespace-nowrap">
                        {vessel.gt.toLocaleString("id-ID")} GT
                      </td>

                      <td className="py-4 px-4 text-slate-700 font-medium">
                        {vessel.route}
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="font-mono font-bold text-[#0B241E]">
                          {vessel.dock}
                        </span>
                      </td>

                      <td className="py-4 px-4 font-mono text-slate-600 whitespace-nowrap">
                        <span>{vessel.eta}</span>
                        <span className="block text-[10px] text-slate-400">
                          ATB: {vessel.atb}
                        </span>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10.5px] font-bold border font-mono ${vessel.statusColor}`}
                        >
                          {vessel.status}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <span className="text-[11px] font-mono font-bold text-blue-800">
                          {vessel.spbStatus} →
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
            <span>
              Ilustrasi jadwal harian di bawah pengawasan Syahbandar &amp; Otoritas Pelabuhan Umum Poumako.
            </span>
            <Link
              href="/login"
              className="text-[#0B241E] hover:text-[#D97706] font-bold inline-flex items-center gap-1"
            >
              <FileText className="w-3.5 h-3.5 text-[#D97706]" />
              <span>Masuk untuk Kelola Log Sandar</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 4. INTERACTIVE TARIFF CALCULATOR */}
      <TariffCalculatorSection />

      {/* 5. FULL-BLEED PHOTOGRAPHIC SHOWCASE: TATA KELOLA & REGULASI (NO BENTO CARDS) */}
      <section
        id="keunggulan"
        className="scroll-mt-24 relative overflow-hidden bg-[#090D10] text-white py-24 px-4 sm:px-8"
      >
        <img
          key={currentPillar.image}
          src={currentPillar.image}
          alt={currentPillar.title}
          className="absolute inset-0 w-full h-full object-cover opacity-55 transition-all duration-700 pointer-events-none"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/65 to-black/45 pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto space-y-12">
          {/* Top Switcher Bar */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-white/15 pb-8">
            <div className="space-y-2 max-w-2xl">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#F59E0B]">
                Tata Kelola &amp; Kepastian Hukum
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Arsitektur Anti-Kebocoran PAD &amp; Keselamatan
              </h2>
            </div>

            <div className="flex flex-wrap gap-2">
              {GOVERNANCE_PILLARS.map((pillar, idx) => {
                const active = activePillarIdx === idx;
                return (
                  <button
                    key={pillar.id}
                    type="button"
                    onClick={() => setActivePillarIdx(idx)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      active
                        ? "bg-[#D97706] text-[#0B241E]"
                        : "bg-white/10 hover:bg-white/20 text-white border border-white/15 backdrop-blur-md"
                    }`}
                  >
                    {pillar.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Open Editorial Spotlight */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 text-xs font-mono text-emerald-300">
                <CurrentPillarIcon className="w-4 h-4 text-[#F59E0B]" />
                <span>{currentPillar.eyebrow}</span>
              </div>
              <h3 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight">
                {currentPillar.title}
              </h3>
              <p className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-2xl">
                {currentPillar.description}
              </p>

              <div className="pt-4 flex items-baseline gap-4">
                <span className="text-4xl sm:text-5xl font-black font-mono text-[#F59E0B]">
                  {currentPillar.metric}
                </span>
                <span className="text-xs font-mono uppercase tracking-wider text-slate-300">
                  {currentPillar.metricLabel}
                </span>
              </div>
            </div>

            {/* Clean Hairline Legal Basis List */}
            <div className="lg:col-span-5 divide-y divide-white/15 border-t border-white/15">
              {[
                {
                  code: "PP 35/2023",
                  title: "Ketentuan Umum Pajak & Retribusi Daerah",
                  desc: "Standardisasi tarif jasa kepelabuhanan & batas sanksi administratif.",
                },
                {
                  code: "PERBUP 25/2024",
                  title: "Tata Cara Pemungutan Retribusi Mimika",
                  desc: "Kewajiban e-SKRD, BAST sif, porporasi karcis, dan denda STRD 1%/bln.",
                },
                {
                  code: "SOLAS 1974",
                  title: "Safety of Life at Sea Convention",
                  desc: "Integritas manifes penumpang terenkripsi dan izin clearance SPB.",
                },
              ].map((law) => (
                <div key={law.code} className="py-4 flex items-start justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-extrabold text-white">{law.title}</h4>
                    <p className="text-[11.5px] text-slate-300 mt-0.5">{law.desc}</p>
                  </div>
                  <span className="font-mono text-[10.5px] font-bold text-[#F59E0B] shrink-0">
                    {law.code}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6. FULL-BLEED EDITORIAL BANNER: KANAL PENGADUAN */}
      <section
        id="pengaduan"
        className="scroll-mt-24 relative overflow-hidden bg-[#11181E] text-white py-20 px-4 sm:px-8 border-t border-white/10"
      >
        <img
          src="/images/poumako-harbor-patrol.jpg"
          alt="Dermaga dan Terminal Penumpang Pelabuhan Poumako"
          className="absolute inset-0 w-full h-full object-cover opacity-90 pointer-events-none"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="max-w-2xl space-y-3">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#F59E0B]">
              Layanan Suara Warga &amp; Pengawasan
            </span>
            <h3 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Kanal Pengaduan Pungli &amp; Gangguan Fasilitas
            </h3>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              Laporkan pungutan tidak resmi di luar karcis porporasi atau kerusakan fasilitas dermaga Pelabuhan Poumako untuk ditindaklanjuti Tim Reaksi Cepat UPTD dan Dinas Perhubungan.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3.5 shrink-0">
            <Link
              href="/penumpang/pengaduan"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#D97706] hover:bg-[#B45309] text-[#0B241E] font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span>Kirim Laporan Pengaduan</span>
            </Link>

            <a
              href="tel:08114900000"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-black/60 hover:bg-black/80 text-white font-bold text-xs border border-white/25 backdrop-blur-md flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <PhoneCall className="w-4 h-4 text-[#F59E0B]" />
              <span>Hotline Radio VHF Ch 16</span>
            </a>
          </div>
        </div>
      </section>

      <LandingFooter />

      {/* Interactive Vessel Detail Modal */}
      {selectedVessel && (
        <div
          onClick={() => setSelectedVessel(null)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl border border-slate-200 w-full max-w-md p-6 space-y-5 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0B241E] text-[#F59E0B] flex items-center justify-center shrink-0">
                  <Ship className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-[#0B241E]">
                    {selectedVessel.name}
                  </h4>
                  <p className="text-xs text-slate-500">{selectedVessel.operator}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedVessel(null)}
                aria-label="Tutup detail kapal"
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-[#F8FAFC] p-4 rounded-2xl border border-slate-200">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 block">
                  Kode Dermaga
                </span>
                <span className="font-mono font-bold text-[#0B241E]">
                  {selectedVessel.dock}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 block">
                  Tonase Kotor
                </span>
                <span className="font-mono font-bold text-[#0B241E]">
                  {selectedVessel.gt.toLocaleString("id-ID")} GT
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-[10px] font-mono uppercase text-slate-400 block">
                  Lintasan Pelayaran
                </span>
                <span className="font-semibold text-[#0B241E]">
                  {selectedVessel.route}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 block">
                  ETA / ATB
                </span>
                <span className="font-mono font-semibold text-slate-700">
                  {selectedVessel.eta} / {selectedVessel.atb}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 block">
                  Clearance
                </span>
                <span className="font-mono font-bold text-blue-700">
                  {selectedVessel.spbStatus}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedVessel(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Tutup
              </button>
              <Link
                href="/login"
                className="px-4 py-2 rounded-xl bg-[#0B241E] hover:bg-[#143E33] text-white text-xs font-bold inline-flex items-center gap-1.5"
              >
                <span>Masuk Portal Operasional</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
