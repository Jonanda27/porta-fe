"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Ship,
  Building2,
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Check,
  Lock,
  Mail,
  Phone,
  User,
  Landmark,
  FileCheck2,
  Info,
  Clock,
  Eye,
  EyeOff,
  HelpCircle,
  FileUp,
  ExternalLink,
  ChevronRight,
  Anchor,
  Copy,
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  // Wizard Step State (1: PIC, 2: Badan Usaha, 3: Armada Kapal, 4: Review & Submit)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [registrationRef, setRegistrationRef] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [copiedRef, setCopiedRef] = useState<boolean>(false);

  const handleCopyRef = () => {
    const refToCopy = registrationRef || "REG-KPL-2026-5978";
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(refToCopy);
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2000);
    }
  };

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: PIC & Akun
    picName: "Capt. M. Farhan Hidayat",
    picRole: "Kepala Cabang & Operasional Armada",
    email: "ops@pelayaran-nusantara.co.id",
    phone: "0812-9840-2911",
    password: "PasswordSuperAman123!",
    passwordConfirm: "PasswordSuperAman123!",

    // Step 2: Legalitas Perusahaan
    companyName: "PT Pelayaran Nusantara Bahari Mandiri",
    businessType: "PT",
    siupalNumber: "SIUPAL/198/AL.001/PHB-2024",
    nibNumber: "9120003418291",
    npwpNumber: "01.234.567.8-012.000",
    companyAddress: "Jl. Pelabuhan Penyeberangan No. 45, Dermaga Utama",
    siupalFile: "SIUPAL_Resmi_Kemenhub_2024.pdf",
    npwpFile: "NPWP_Badan_Usaha_PT_PNBM.pdf",

    // Step 3: Armada Kapal Perdana
    vesselName: "KMP Baruna Perkasa I",
    callSign: "PK-BP01",
    imoNumber: "9120489",
    vesselType: "Ro-Ro Passenger Ferry",
    gt: 1450,
    loa: 74.0, // Length Overall (m)
    draft: 3.9, // Sarat Air (m)
    paxCapacity: 380,
    vehicleCapacity: 65,
    suratUkurFile: "Surat_Ukur_No_3892_DJPL.pdf",
    pasKapalFile: "Pas_Besar_Kelaiklautan_2024.pdf",

    // Step 4: Integrity
    agreeTerms: true,
  });

  const stepsMetadata = [
    {
      step: 1,
      title: "PIC & Akun Login",
      subtitle: "Kredensial Penanggung Jawab",
      icon: User,
    },
    {
      step: 2,
      title: "Badan Usaha Pelayaran",
      subtitle: "SIUPAL, NIB & NPWP Badan",
      icon: Building2,
    },
    {
      step: 3,
      title: "Armada Kapal Perdana",
      subtitle: "Spesifikasi GT & Surat Ukur",
      icon: Ship,
    },
    {
      step: 4,
      title: "Pakta Integritas & Review",
      subtitle: "Kepatuhan PP No. 35/2023",
      icon: ShieldCheck,
    },
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNextStep = () => {
    if (currentStep < 4) {
      setCurrentStep((prev) => prev + 1);
      const mainContainer = document.getElementById("form-scroll-container");
      if (mainContainer) mainContainer.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      const mainContainer = document.getElementById("form-scroll-container");
      if (mainContainer) mainContainer.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSubmitRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate Network Request POST /auth/register
    setTimeout(() => {
      const generatedRef = `REG-KPL-${new Date().getFullYear()}-${Math.floor(
        1000 + Math.random() * 9000
      )}`;
      setRegistrationRef(generatedRef);
      setIsSubmitting(false);
      setIsSubmitted(true);
      const mainContainer = document.getElementById("form-scroll-container");
      if (mainContainer) mainContainer.scrollTo({ top: 0, behavior: "smooth" });
    }, 1200);
  };

  return (
    <div className="fixed inset-0 w-full h-full max-h-screen overflow-hidden bg-[#F8FAF9] text-[#1E2922] font-sans flex flex-col lg:flex-row antialiased selection:bg-[#D97706]/20 selection:text-[#0B241E]">
      {/* ========================================================================= */}
      {/* 1. LAYER KIRI: INSTITUTIONAL BRANDING WITH MARITIME BACKGROUND            */}
      {/*    CLEAN, MINIMALIST & ATMOSPHERIC (TIDAK TERLALU RAME)                   */}
      {/* ========================================================================= */}
      <aside className="w-full lg:w-[38%] xl:w-[35%] text-white relative shrink-0 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#143E33] shadow-2xl z-20 overflow-hidden select-none bg-[#0B241E]">
        {/* Background Maritime Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-105"
          style={{ backgroundImage: `url('/images/register-maritime-bg.jpg')` }}
        />

        {/* Cinematic Deep Emerald Scrim Overlay (High Contrast & Legibility) */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#071914]/96 via-[#0B241E]/90 to-[#040E0B]/98 backdrop-blur-[1px] pointer-events-none" />

        {/* Subtle Ambient Radial Lighting */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-[#133D31]/35 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-[#D97706]/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 p-6 sm:p-8 lg:p-10 pb-8 lg:pb-10 flex-1 flex flex-col justify-between h-full max-h-screen">
          {/* Top: Official Brand Lockup Only */}
          <div>
            <Link href="/" className="inline-flex items-center gap-3.5 group cursor-pointer">
              <div className="w-11 h-11 rounded-xl bg-[#143E33]/90 border border-[#1E5748] p-1 flex items-center justify-center shadow-lg shadow-black/50 group-hover:scale-105 transition-transform shrink-0">
                <img
                  src="/brand/symbol-white.svg"
                  alt="PORTA Official Anchor"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <span className="font-black text-2xl tracking-wider text-white">PORTA</span>
                <span className="block text-[9px] font-mono tracking-widest text-[#85A69B] uppercase -mt-0.5">
                  Tata Kelola Pelabuhan &amp; Pendapatan Daerah
                </span>
              </div>
            </Link>
          </div>

          {/* Bottom Area: Pendaftaran Operator Kapal */}
          <div className="space-y-3">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#143E33]/80 border border-[#1E5748] text-[#85A69B] text-xs font-semibold">
              <span>Portal Kemitraan Pelayaran</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight tracking-tight">
              Pendaftaran Operator Kapal &amp; Registrasi Armada
            </h1>
            <p className="text-xs sm:text-[13px] text-emerald-100/90 leading-relaxed max-w-sm">
              Registrasi resmi badan usaha pelayaran dan armada kapal Anda untuk mendapatkan akses
              izin sandar dermaga, pelaporan manifes digital terenkripsi SOLAS, serta penerbitan
              e-SKRD otomatis terintegrasi PP No. 35/2023.
            </p>
          </div>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 2. LAYER KANAN: FLUID, SYMMETRICAL & INTUITIVE REGISTRATION FORM          */}
      {/* ========================================================================= */}
      <main
        id="form-scroll-container"
        className="flex-1 h-full max-h-full overflow-y-auto overflow-x-hidden flex flex-col justify-between p-6 sm:p-8 lg:p-10 relative bg-[#F8FAF9]"
      >
        <div className="w-full max-w-3xl mx-auto space-y-6 sm:space-y-8 my-auto">
          {/* Top Bar Header (Step Progress Breadcrumb + Back to Login Link) */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
              <span className="font-bold text-[#0B241E]">LANGKAH {currentStep} DARI 4</span>
              <span>•</span>
              <span className="text-[#D97706] font-semibold">
                {stepsMetadata[currentStep - 1]?.title}
              </span>
            </div>

            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0B241E] hover:text-[#D97706] transition-colors cursor-pointer"
            >
              <span>Sudah terdaftar? Masuk ke Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* ===================================================================== */}
          {/* A. SUCCESS SCREEN (STATUS AWAL: PENDING VERIFIKASI UPT)               */}
          {/* ===================================================================== */}
          {isSubmitted ? (
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden p-6 sm:p-9 space-y-7 animate-in fade-in zoom-in-95 duration-300">
              {/* Header: Centered Icon & Status Badge (Clean Vertical Stack) */}
              <div className="flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-18 h-18 rounded-3xl bg-amber-50 border border-amber-200 text-[#D97706] shadow-sm flex items-center justify-center">
                  <Clock className="w-9 h-9 animate-pulse stroke-[2.2]" />
                </div>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-mono font-bold uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping inline-block" />
                  <span>Status Awal: PENDING Verifikasi UPT</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-[#0B241E] tracking-tight pt-1">
                  Pendaftaran Berhasil Diajukan!
                </h2>
                <p className="text-xs sm:text-sm text-[#52635B] max-w-xl mx-auto leading-relaxed">
                  Berkas legalitas perusahaan pelayaran dan data armada kapal perdana Anda telah
                  diterima oleh sistem PORTA. Petugas UPT Pelabuhan akan memeriksa keabsahan dokumen
                  Anda sebelum izin pengajuan kunjungan dermaga online diaktifkan.
                </p>
              </div>

              {/* 3-Step Verification Visual Tracker */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#F8FAF9] border border-slate-200 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-[#0B241E]">
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#D97706]" />
                    <span>Tahapan Proses Pengesahan Mitra &amp; Armada</span>
                  </span>
                  <span className="text-[11px] font-mono text-slate-500 font-semibold">
                    Estimasi SLA: &lt; 24 Jam Kerja
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Step 1 */}
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200/90 flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-emerald-950">1. Formulir Masuk</p>
                      <p className="text-[10.5px] text-emerald-700 leading-snug">
                        Data PIC &amp; entitas lengkap tersimpan
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-[#D97706] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      <Clock className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-extrabold text-amber-950">2. Verifikasi UPT</p>
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-200 text-amber-900">
                          Sedang Berjalan
                        </span>
                      </div>
                      <p className="text-[10.5px] text-amber-800 leading-snug">
                        Uji keabsahan SIUPAL &amp; fisik GT kapal
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-start gap-2.5 opacity-60">
                    <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      3
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-slate-800">3. Izin Sandar Terbuka</p>
                      <p className="text-[10.5px] text-slate-500 leading-snug">
                        Akses pengajuan tambat &amp; e-SKRD aktif
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Registration Reference Card */}
              <div className="bg-[#F8FAF9] rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
                  <div>
                    <span className="text-[11px] font-mono text-[#64748B] uppercase block">
                      Nomor Registrasi Entitas (ID Tiket Resmi)
                    </span>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-xl sm:text-2xl font-mono font-black text-[#0B241E] tracking-wider">
                        {registrationRef || "REG-KPL-2026-5978"}
                      </p>
                      <button
                        type="button"
                        onClick={handleCopyRef}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer border border-slate-300 shadow-2xs"
                        title="Salin Nomor Registrasi"
                      >
                        {copiedRef ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                            <span className="text-emerald-700">Tersalin!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-slate-500" />
                            <span>Salin ID</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="text-[11px] font-mono text-[#64748B] uppercase block">
                      Kanal Akses Didaftarkan
                    </span>
                    <p className="text-xs font-bold text-[#0B241E] mt-1">
                      Kanal 02: Operator Armada &amp; Pelayaran
                    </p>
                  </div>
                </div>

                {/* Company & Vessel Detail Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Nama Perusahaan:</span>
                    <span className="font-bold text-[#0B241E]">{formData.companyName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Kapal Perdana:</span>
                    <span className="font-bold text-[#0B241E]">
                      {formData.vesselName} ({formData.gt} GT • {formData.vesselType})
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">PIC Operasional:</span>
                    <span className="font-bold text-[#0B241E]">
                      {formData.picName} ({formData.phone})
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Email Notifikasi:</span>
                    <span className="font-bold text-[#0B241E]">{formData.email}</span>
                  </div>
                </div>

                {/* Attached Files Confirmation Grid */}
                <div className="border-t border-slate-200/80 pt-3">
                  <span className="text-[11px] font-mono text-[#64748B] uppercase block mb-2">
                    Berkas Legalitas &amp; Dokumen Kapal Terlampir:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200">
                      <FileCheck2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-mono text-slate-800 text-[11px] truncate">
                        {formData.siupalFile}
                      </span>
                      <span className="ml-auto text-[10px] text-emerald-700 font-bold shrink-0 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        Valid
                      </span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200">
                      <FileCheck2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-mono text-slate-800 text-[11px] truncate">
                        {formData.suratUkurFile}
                      </span>
                      <span className="ml-auto text-[10px] text-emerald-700 font-bold shrink-0 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        Valid
                      </span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200">
                      <FileCheck2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-mono text-slate-800 text-[11px] truncate">
                        {formData.npwpFile}
                      </span>
                      <span className="ml-auto text-[10px] text-emerald-700 font-bold shrink-0 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        Valid
                      </span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200">
                      <FileCheck2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-mono text-slate-800 text-[11px] truncate">
                        {formData.pasKapalFile}
                      </span>
                      <span className="ml-auto text-[10px] text-emerald-700 font-bold shrink-0 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        Valid
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
                <Link
                  href="/"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-[#0B241E] hover:bg-[#133D31] text-white transition-all shadow-md shadow-emerald-950/20 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 text-[#D97706]" />
                  <span>Kembali ke Beranda PORTA</span>
                </Link>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 text-[#0B241E] border border-slate-300 transition-all cursor-pointer shadow-2xs"
                >
                  <FileText className="w-4 h-4 text-slate-500" />
                  <span>Cetak Tanda Terima Registrasi (PDF)</span>
                </button>
                <a
                  href={`https://wa.me/6281298402911?text=Halo%20Admin%20UPT%20PORTA,%20saya%20PIC%20dari%20${encodeURIComponent(
                    formData.companyName
                  )}%20ingin%20konfirmasi%20pendaftaran%20kapal%20nomor%20${encodeURIComponent(
                    registrationRef || "REG-KPL-2026-5978"
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 transition-all cursor-pointer"
                >
                  <Phone className="w-4 h-4 text-emerald-600" />
                  <span>Bantuan Cepat WhatsApp UPT</span>
                </a>
              </div>
            </div>
          ) : (
            /* =================================================================== */
            /* B. MULTI-STEP WIZARD FORM                                           */
            /* =================================================================== */
            <form onSubmit={handleSubmitRegistration}>
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 lg:p-9 space-y-6">
                {/* ----------------------------------------------------------------- */}
                {/* STEP 1: PIC & AKUN LOGIN OPERATOR                                 */}
                {/* ----------------------------------------------------------------- */}
                {currentStep === 1 && (
                  <div className="space-y-6 animate-in fade-in duration-200">
                    <div>
                      <h2 className="text-lg font-black text-[#0B241E] flex items-center gap-2.5">
                        <User className="w-5 h-5 text-[#D97706]" />
                        <span>Identitas Penanggung Jawab (PIC) &amp; Kredensial Akun</span>
                      </h2>
                      <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                        Akun ini akan menjadi administrator utama perusahaan pelayaran untuk
                        mengajukan jadwal sandar dan mengelola dokumen manifes.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                      {/* PIC Name */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-[#1E2922]">
                          <span>Nama Lengkap PIC Operasional</span>
                          <span className="text-red-500 font-bold ml-1">*</span>
                        </label>
                        <div className="relative">
                          <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            type="text"
                            required
                            value={formData.picName}
                            onChange={(e) => handleInputChange("picName", e.target.value)}
                            placeholder="Contoh: Capt. M. Farhan Hidayat"
                            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#0B241E] focus:ring-2 focus:ring-[#0B241E]/10 transition-all bg-white"
                          />
                        </div>
                      </div>

                      {/* PIC Role */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-[#1E2922]">
                          <span>Jabatan di Perusahaan</span>
                          <span className="text-red-500 font-bold ml-1">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.picRole}
                          onChange={(e) => handleInputChange("picRole", e.target.value)}
                          placeholder="Contoh: Kepala Operasional Armada"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#0B241E] focus:ring-2 focus:ring-[#0B241E]/10 transition-all bg-white"
                        />
                      </div>

                      {/* Official Email */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-[#1E2922]">
                          <span>Email Resmi Perusahaan</span>
                          <span className="text-red-500 font-bold ml-1">*</span>
                        </label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => handleInputChange("email", e.target.value)}
                            placeholder="ops@perusahaan-pelayaran.co.id"
                            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#0B241E] focus:ring-2 focus:ring-[#0B241E]/10 transition-all bg-white"
                          />
                        </div>
                      </div>

                      {/* WhatsApp / Phone */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-[#1E2922]">
                          <span>Nomor Telepon / WhatsApp PIC</span>
                          <span className="text-red-500 font-bold ml-1">*</span>
                        </label>
                        <div className="relative">
                          <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            type="tel"
                            required
                            value={formData.phone}
                            onChange={(e) => handleInputChange("phone", e.target.value)}
                            placeholder="0812-xxxx-xxxx"
                            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#0B241E] focus:ring-2 focus:ring-[#0B241E]/10 transition-all bg-white font-mono"
                          />
                        </div>
                      </div>

                      {/* Full-width Helper for Email & Phone */}
                      <div className="sm:col-span-2 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-[#64748B] flex items-center gap-2">
                        <Info className="w-4 h-4 text-[#0B241E] shrink-0" />
                        <span>
                          Tagihan e-SKRD resmi, surat izin sandar (SPB), dan pemberitahuan teguran
                          akan dikirimkan ke email dan nomor telepon resmi di atas.
                        </span>
                      </div>

                      {/* Password */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-[#1E2922]">
                          <span>Kata Sandi Akun</span>
                          <span className="text-red-500 font-bold ml-1">*</span>
                        </label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            type={showPassword ? "text" : "password"}
                            required
                            value={formData.password}
                            onChange={(e) => handleInputChange("password", e.target.value)}
                            className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#0B241E] focus:ring-2 focus:ring-[#0B241E]/10 transition-all bg-white font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Password Confirm */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-[#1E2922]">
                          <span>Konfirmasi Kata Sandi</span>
                          <span className="text-red-500 font-bold ml-1">*</span>
                        </label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            type={showPassword ? "text" : "password"}
                            required
                            value={formData.passwordConfirm}
                            onChange={(e) => handleInputChange("passwordConfirm", e.target.value)}
                            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#0B241E] focus:ring-2 focus:ring-[#0B241E]/10 transition-all bg-white font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ----------------------------------------------------------------- */}
                {/* STEP 2: LEGALITAS BADAN USAHA PELAYARAN                           */}
                {/* ----------------------------------------------------------------- */}
                {currentStep === 2 && (
                  <div className="space-y-6 animate-in fade-in duration-200">
                    <div>
                      <h2 className="text-lg font-black text-[#0B241E] flex items-center gap-2.5">
                        <Building2 className="w-5 h-5 text-[#D97706]" />
                        <span>Legalitas Badan Usaha Pelayaran (Kemenhub &amp; OSS RBA)</span>
                      </h2>
                      <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                        Data legalitas wajib terdaftar aktif di Kementerian Perhubungan RI atau instansi
                        penyelenggara perizinan terpadu satu pintu.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                      {/* Company Name */}
                      <div className="sm:col-span-2 space-y-1.5">
                        <label className="block text-xs font-bold text-[#1E2922]">
                          <span>Nama Resmi Badan Usaha / Perusahaan Pelayaran</span>
                          <span className="text-red-500 font-bold ml-1">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.companyName}
                          onChange={(e) => handleInputChange("companyName", e.target.value)}
                          placeholder="Contoh: PT Pelayaran Nusantara Bahari Mandiri"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#0B241E] focus:ring-2 focus:ring-[#0B241E]/10 transition-all bg-white"
                        />
                      </div>

                      {/* Business Entity Type */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-[#1E2922]">
                          <span>Bentuk Badan Usaha</span>
                          <span className="text-red-500 font-bold ml-1">*</span>
                        </label>
                        <select
                          value={formData.businessType}
                          onChange={(e) => handleInputChange("businessType", e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#0B241E] focus:ring-2 focus:ring-[#0B241E]/10 transition-all bg-white cursor-pointer"
                        >
                          <option value="PT">Perseroan Terbatas (PT)</option>
                          <option value="BUMN_BUMD">BUMN / BUMD Perhubungan</option>
                          <option value="CV">Commanditaire Vennootschap (CV)</option>
                          <option value="KOPERASI">Koperasi Jasa Angkutan Laut</option>
                          <option value="PERORANGAN">Pelayaran Rakyat (Perorangan)</option>
                        </select>
                      </div>

                      {/* SIUPAL Number */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-[#1E2922]">
                          <span>Nomor Izin SIUPAL / SIOPSUS</span>
                          <span className="text-red-500 font-bold ml-1">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.siupalNumber}
                          onChange={(e) => handleInputChange("siupalNumber", e.target.value)}
                          placeholder="SIUPAL/xxx/AL.001/..."
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#0B241E] focus:ring-2 focus:ring-[#0B241E]/10 transition-all bg-white font-mono"
                        />
                      </div>

                      {/* NIB OSS */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-[#1E2922]">
                          <span>Nomor Induk Berusaha (NIB OSS 13 Digit)</span>
                          <span className="text-red-500 font-bold ml-1">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.nibNumber}
                          onChange={(e) => handleInputChange("nibNumber", e.target.value)}
                          placeholder="13 Digit NIB"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#0B241E] focus:ring-2 focus:ring-[#0B241E]/10 transition-all bg-white font-mono"
                        />
                      </div>

                      {/* NPWP Badan */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-[#1E2922]">
                          <span>NPWP Badan Usaha (16 Digit)</span>
                          <span className="text-red-500 font-bold ml-1">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.npwpNumber}
                          onChange={(e) => handleInputChange("npwpNumber", e.target.value)}
                          placeholder="00.000.000.0-000.000"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#0B241E] focus:ring-2 focus:ring-[#0B241E]/10 transition-all bg-white font-mono"
                        />
                      </div>

                      {/* Company Address */}
                      <div className="sm:col-span-2 space-y-1.5">
                        <label className="block text-xs font-bold text-[#1E2922]">
                          <span>Alamat Kantor Domisili / Kantor Operasional Cabang</span>
                          <span className="text-red-500 font-bold ml-1">*</span>
                        </label>
                        <textarea
                          rows={2}
                          required
                          value={formData.companyAddress}
                          onChange={(e) => handleInputChange("companyAddress", e.target.value)}
                          placeholder="Alamat kantor lengkap, kota, kode pos..."
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#0B241E] focus:ring-2 focus:ring-[#0B241E]/10 transition-all bg-white resize-none"
                        />
                      </div>

                      {/* Dropzone 1: SIUPAL */}
                      <div className="space-y-1.5">
                        <label className="flex items-center justify-between text-xs font-bold text-[#1E2922]">
                          <span>
                            Unggah Berkas SIUPAL / NIB <span className="text-red-500 font-bold ml-1">*</span>
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">PDF Maks. 5 MB</span>
                        </label>
                        <div className="border-2 border-dashed border-slate-200 hover:border-[#0B241E] rounded-2xl p-4 text-center transition-all bg-slate-50/70 hover:bg-emerald-50/30 cursor-pointer">
                          <FileUp className="w-6 h-6 text-[#D97706] mx-auto mb-1.5" />
                          <span className="text-xs font-bold text-[#0B241E] block truncate">
                            {formData.siupalFile}
                          </span>
                          <span className="text-[10.5px] text-slate-400 block mt-0.5">
                            Klik untuk mengganti berkas PDF
                          </span>
                        </div>
                      </div>

                      {/* Dropzone 2: NPWP */}
                      <div className="space-y-1.5">
                        <label className="flex items-center justify-between text-xs font-bold text-[#1E2922]">
                          <span>
                            Unggah Berkas NPWP Badan Usaha <span className="text-red-500 font-bold ml-1">*</span>
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">PDF/JPG Maks. 5 MB</span>
                        </label>
                        <div className="border-2 border-dashed border-slate-200 hover:border-[#0B241E] rounded-2xl p-4 text-center transition-all bg-slate-50/70 hover:bg-emerald-50/30 cursor-pointer">
                          <FileUp className="w-6 h-6 text-[#D97706] mx-auto mb-1.5" />
                          <span className="text-xs font-bold text-[#0B241E] block truncate">
                            {formData.npwpFile}
                          </span>
                          <span className="text-[10.5px] text-slate-400 block mt-0.5">
                            Klik untuk mengganti berkas PDF/JPG
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ----------------------------------------------------------------- */}
                {/* STEP 3: ARMADA KAPAL PERDANA                                      */}
                {/* ----------------------------------------------------------------- */}
                {currentStep === 3 && (
                  <div className="space-y-6 animate-in fade-in duration-200">
                    <div>
                      <h2 className="text-lg font-black text-[#0B241E] flex items-center gap-2.5">
                        <Ship className="w-5 h-5 text-[#D97706]" />
                        <span>Pendaftaran Armada Kapal Perdana</span>
                      </h2>
                      <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                        Nilai <strong>Gross Tonnage (GT)</strong> kapal ini akan menjadi parameter dasar
                        penghitungan tarif resmi retribusi sandar dan labuh daerah (PP No. 35/2023).
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-4">
                      {/* Vessel Name */}
                      <div className="sm:col-span-2 space-y-1.5">
                        <label className="block text-xs font-bold text-[#1E2922]">
                          <span>Nama Kapal Lengkap</span>
                          <span className="text-red-500 font-bold ml-1">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.vesselName}
                          onChange={(e) => handleInputChange("vesselName", e.target.value)}
                          placeholder="Contoh: KMP Baruna Perkasa I"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#0B241E] focus:ring-2 focus:ring-[#0B241E]/10 transition-all bg-white"
                        />
                      </div>

                      {/* Call Sign */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-[#1E2922]">
                          <span>Call Sign Radio</span>
                          <span className="text-red-500 font-bold ml-1">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.callSign}
                          onChange={(e) => handleInputChange("callSign", e.target.value)}
                          placeholder="PK-xxxx"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#0B241E] focus:ring-2 focus:ring-[#0B241E]/10 transition-all bg-white font-mono"
                        />
                      </div>

                      {/* Vessel Type */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-[#1E2922]">
                          <span>Tipe / Jenis Kapal</span>
                          <span className="text-red-500 font-bold ml-1">*</span>
                        </label>
                        <select
                          value={formData.vesselType}
                          onChange={(e) => handleInputChange("vesselType", e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#0B241E] focus:ring-2 focus:ring-[#0B241E]/10 transition-all bg-white cursor-pointer"
                        >
                          <option value="Ro-Ro Passenger Ferry">Ro-Ro Ferry Penumpang &amp; Kendaraan</option>
                          <option value="Fast Ferry / Speedboat">Fast Ferry / Speedboat Cepat</option>
                          <option value="General Cargo / Klotok">Kapal Kargo / Barang Rakyat</option>
                          <option value="Landing Craft Tank (LCT)">Landing Craft Tank (LCT)</option>
                          <option value="Tugboat / Tongkang">Tugboat &amp; Tongkang</option>
                        </select>
                      </div>

                      {/* GT (Gross Tonnage) */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-[#1E2922]">
                          <span>Gross Tonnage (GT)</span>
                          <span className="text-red-500 font-bold ml-1">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            required
                            min={1}
                            value={formData.gt}
                            onChange={(e) => handleInputChange("gt", Number(e.target.value))}
                            className="w-full pl-3.5 pr-12 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#0B241E] focus:ring-2 focus:ring-[#0B241E]/10 transition-all bg-white font-mono font-bold"
                          />
                          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-400">
                            GT
                          </span>
                        </div>
                      </div>

                      {/* LOA (Length Overall) */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-[#1E2922]">
                          <span>Panjang Kapal (LOA)</span>
                          <span className="text-red-500 font-bold ml-1">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            required
                            step="0.1"
                            value={formData.loa}
                            onChange={(e) => handleInputChange("loa", Number(e.target.value))}
                            className="w-full pl-3.5 pr-12 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#0B241E] focus:ring-2 focus:ring-[#0B241E]/10 transition-all bg-white font-mono"
                          />
                          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-400">
                            M
                          </span>
                        </div>
                      </div>

                      {/* Pax Capacity */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-[#1E2922]">
                          <span>Kapasitas Penumpang (Jiwa)</span>
                          <span className="text-red-500 font-bold ml-1">*</span>
                        </label>
                        <input
                          type="number"
                          required
                          value={formData.paxCapacity}
                          onChange={(e) => handleInputChange("paxCapacity", Number(e.target.value))}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#0B241E] focus:ring-2 focus:ring-[#0B241E]/10 transition-all bg-white font-mono"
                        />
                      </div>

                      {/* Vehicle Capacity */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-[#1E2922]">
                          <span>Kapasitas Kendaraan (Unit)</span>
                          <span className="text-red-500 font-bold ml-1">*</span>
                        </label>
                        <input
                          type="number"
                          required
                          value={formData.vehicleCapacity}
                          onChange={(e) =>
                            handleInputChange("vehicleCapacity", Number(e.target.value))
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#0B241E] focus:ring-2 focus:ring-[#0B241E]/10 transition-all bg-white font-mono"
                        />
                      </div>

                      {/* Draft */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-[#1E2922]">
                          <span>Sarat Air / Draft (Meter)</span>
                          <span className="text-red-500 font-bold ml-1">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            required
                            step="0.1"
                            value={formData.draft}
                            onChange={(e) => handleInputChange("draft", Number(e.target.value))}
                            className="w-full pl-3.5 pr-12 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#0B241E] focus:ring-2 focus:ring-[#0B241E]/10 transition-all bg-white font-mono"
                          />
                          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-400">
                            M
                          </span>
                        </div>
                      </div>

                      {/* Dropzone Surat Ukur */}
                      <div className="sm:col-span-2 space-y-1.5">
                        <label className="flex items-center justify-between text-xs font-bold text-[#1E2922]">
                          <span>
                            Unggah Surat Ukur Kapal Resmi <span className="text-red-500 font-bold ml-1">*</span>
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">Ditjen Hubla</span>
                        </label>
                        <div className="border-2 border-dashed border-slate-200 hover:border-[#0B241E] rounded-2xl p-4 text-center transition-all bg-slate-50/70 hover:bg-emerald-50/30 cursor-pointer">
                          <FileCheck2 className="w-6 h-6 text-[#D97706] mx-auto mb-1.5" />
                          <span className="text-xs font-bold text-[#0B241E] block truncate">
                            {formData.suratUkurFile}
                          </span>
                          <span className="text-[10.5px] text-slate-400 block mt-0.5">
                            Lampiran resmi penetapan nilai GT kapal
                          </span>
                        </div>
                      </div>

                      {/* Dropzone Pas Kapal */}
                      <div className="space-y-1.5">
                        <label className="flex items-center justify-between text-xs font-bold text-[#1E2922]">
                          <span>
                            Unggah Pas Besar / Kecil <span className="text-red-500 font-bold ml-1">*</span>
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">Kelaiklautan</span>
                        </label>
                        <div className="border-2 border-dashed border-slate-200 hover:border-[#0B241E] rounded-2xl p-4 text-center transition-all bg-slate-50/70 hover:bg-emerald-50/30 cursor-pointer">
                          <FileCheck2 className="w-6 h-6 text-[#D97706] mx-auto mb-1.5" />
                          <span className="text-xs font-bold text-[#0B241E] block truncate">
                            {formData.pasKapalFile}
                          </span>
                          <span className="text-[10.5px] text-slate-400 block mt-0.5">
                            Bukti Kelaiklautan Kapal
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ----------------------------------------------------------------- */}
                {/* STEP 4: REVIEW & PAKTA INTEGRITAS KEPATUHAN                       */}
                {/* ----------------------------------------------------------------- */}
                {currentStep === 4 && (
                  <div className="space-y-6 animate-in fade-in duration-200">
                    <div>
                      <h2 className="text-lg font-black text-[#0B241E] flex items-center gap-2.5">
                        <ShieldCheck className="w-5 h-5 text-[#D97706]" />
                        <span>Tinjau Data Pendaftaran &amp; Pakta Integritas</span>
                      </h2>
                      <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                        Periksa kembali keabsahan data sebelum diajukan ke meja verifikasi Petugas UPT
                        Pelabuhan.
                      </p>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Summary PIC */}
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                        <span className="text-[10px] font-mono font-bold text-[#D97706] uppercase tracking-wider block">
                          PIC &amp; Akun Login
                        </span>
                        <p className="text-xs font-extrabold text-[#0B241E]">{formData.picName}</p>
                        <p className="text-[11px] text-slate-600 truncate">{formData.email}</p>
                        <p className="text-[11px] text-slate-600 font-mono">{formData.phone}</p>
                      </div>

                      {/* Summary Company */}
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                        <span className="text-[10px] font-mono font-bold text-[#D97706] uppercase tracking-wider block">
                          Badan Usaha
                        </span>
                        <p className="text-xs font-extrabold text-[#0B241E] truncate">
                          {formData.companyName}
                        </p>
                        <p className="text-[11px] text-slate-600 font-mono truncate">
                          SIUPAL: {formData.siupalNumber}
                        </p>
                        <p className="text-[11px] text-slate-600 font-mono truncate">
                          NPWP: {formData.npwpNumber}
                        </p>
                      </div>

                      {/* Summary Vessel */}
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                        <span className="text-[10px] font-mono font-bold text-[#D97706] uppercase tracking-wider block">
                          Armada Perdana
                        </span>
                        <p className="text-xs font-extrabold text-[#0B241E] truncate">
                          {formData.vesselName}
                        </p>
                        <p className="text-[11px] font-mono font-bold text-emerald-800">
                          {formData.gt} GT • {formData.loa} M • {formData.draft} M
                        </p>
                        <p className="text-[11px] text-slate-600">
                          {formData.paxCapacity} Pax • {formData.vehicleCapacity} Kendaraan
                        </p>
                      </div>
                    </div>

                    {/* Important Legal Callout Box */}
                    <div className="p-4 rounded-2xl bg-[#0B241E]/5 border border-[#0B241E]/15 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#0B241E]">
                        <Info className="w-4 h-4 text-[#D97706] shrink-0" />
                        <span>Ketentuan Operasional &amp; Verifikasi Awal (PP No. 35/2023)</span>
                      </div>
                      <ul className="text-xs text-[#52635B] space-y-1.5 list-disc list-inside leading-relaxed">
                        <li>
                          Setelah formulir ini dikirim, status entitas Anda adalah{" "}
                          <strong className="text-[#0B241E]">PENDING</strong> hingga Petugas UPT
                          memverifikasi fisik berkas SIUPAL dan Surat Ukur Kapal.
                        </li>
                        <li>
                          Fitur permohonan alokasi sandar dermaga online baru akan aktif secara otomatis
                          setelah status menjadi <strong className="text-emerald-700">VERIFIED</strong>.
                        </li>
                        <li>
                          Kepatuhan penuh pada standar keselamatan manifes SOLAS serta penyelesaian
                          seluruh kewajiban retribusi jasa labuh/tambat sesuai tarif daerah resmi.
                        </li>
                      </ul>
                    </div>

                    {/* Integrity Statement Checkbox */}
                    <label className="flex items-start gap-3.5 p-4 rounded-2xl bg-white border border-slate-200 hover:border-[#0B241E] cursor-pointer transition-colors shadow-2xs">
                      <input
                        type="checkbox"
                        required
                        checked={formData.agreeTerms}
                        onChange={(e) => handleInputChange("agreeTerms", e.target.checked)}
                        className="mt-1 w-4 h-4 rounded text-[#0B241E] border-slate-300 focus:ring-[#0B241E] cursor-pointer"
                      />
                      <span className="text-xs text-[#1E2922] leading-relaxed">
                        Saya selaku penanggung jawab menyatakan bahwa seluruh data perusahaan dan armada kapal
                        yang dilampirkan adalah benar, sah secara hukum, dan bersedia tunduk pada SOP
                        Pelabuhan serta ketentuan retribusi kas daerah yang berlaku.
                      </span>
                    </label>
                  </div>
                )}

                {/* ----------------------------------------------------------------- */}
                {/* WIZARD CONTROLS (SEBELUMNYA / LANJUTKAN / SUBMIT)                 */}
                {/* ----------------------------------------------------------------- */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  {currentStep > 1 ? (
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Sebelumnya</span>
                    </button>
                  ) : (
                    <Link
                      href="/"
                      className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Kembali ke Beranda</span>
                    </Link>
                  )}

                  {currentStep < 4 ? (
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-[#0B241E] hover:bg-[#133D31] text-white transition-all cursor-pointer shadow-md shadow-emerald-950/20"
                    >
                      <span>Lanjutkan ke {stepsMetadata[currentStep]?.title}</span>
                      <ArrowRight className="w-4 h-4 text-[#D97706]" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isSubmitting || !formData.agreeTerms}
                      className={`inline-flex items-center gap-2 px-8 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-lg shadow-amber-900/20 ${
                        isSubmitting || !formData.agreeTerms
                          ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                          : "bg-[#D97706] hover:bg-[#B45309] text-[#0B241E] hover:text-white"
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="w-4 h-4 border-2 border-[#0B241E] border-t-transparent rounded-full animate-spin" />
                          <span>Mendaftarkan Entitas...</span>
                        </>
                      ) : (
                        <>
                          <span>Kirim Pendaftaran Badan Usaha &amp; Armada</span>
                          <Check className="w-4 h-4 stroke-[2.5]" />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </form>
          )}

          {/* Minimalist Footer */}
          <div className="pt-2 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-[#64748B] gap-2">
            <p>© 2026 PORTA • Kementerian Perhubungan &amp; Bapenda</p>
            <div className="flex items-center gap-3">
              <span className="text-[#0B241E] font-medium">Bantuan Registrasi: (0254) 571-008</span>
              <span>•</span>
              <span className="text-[#0B241E] font-medium">PP No. 35/2023 &amp; SOLAS</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
