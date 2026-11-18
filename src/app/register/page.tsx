"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  FileText,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Check,
  Lock,
  Mail,
  Phone,
  User,
  Info,
  Clock,
  Eye,
  EyeOff,
  Copy,
  LogIn,
  RotateCcw,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { RegisterOperatorDto } from "@/types/auth.types";

const REG_RECEIPT_KEY = "porta_reg_receipt";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuthStore();

  // Wizard Step State (1: PIC & Akun Login, 2: Badan Usaha & Profil Pelayaran)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [registrationRef, setRegistrationRef] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [copiedRef, setCopiedRef] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [registeredUser, setRegisteredUser] = useState<{
    id: number | string;
    email: string;
    fullName: string;
    role: string;
    operatorId: number | string;
    operatorVerificationStatus: string;
  } | null>(null);

  // Form State: Formulir bersih (siap diisi oleh pengguna secara mandiri)
  const [formData, setFormData] = useState({
    // Step 1: PIC & Akun Login
    picName: "",
    email: "",
    phone: "",
    password: "",
    passwordConfirm: "",

    // Step 2: Badan Usaha & Kemitraan
    companyName: "",
    npwpNumber: "",
    companyAddress: "",
    agreeTerms: false,
  });

  // Proteksi Anti-Refresh: Pulihkan data tanda terima dari sessionStorage jika pengguna me-refresh halaman
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = sessionStorage.getItem(REG_RECEIPT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.registrationRef && parsed?.email) {
          setRegistrationRef(parsed.registrationRef);
          setFormData((prev) => ({
            ...prev,
            companyName: parsed.companyName || "",
            picName: parsed.picName || "",
            phone: parsed.phone || "",
            email: parsed.email || "",
            npwpNumber: parsed.npwpNumber || "",
            companyAddress: parsed.companyAddress || "",
          }));
          setIsSubmitted(true);
        }
      }
    } catch {
      // Abaikan jika storage korup
    }
  }, []);

  const handleStartNewRegistration = () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(REG_RECEIPT_KEY);
    }
    setFormData({
      picName: "",
      email: "",
      phone: "",
      password: "",
      passwordConfirm: "",
      companyName: "",
      npwpNumber: "",
      companyAddress: "",
      agreeTerms: false,
    });
    setRegistrationRef("");
    setRegisteredUser(null);
    setIsSubmitted(false);
    setCurrentStep(1);
    setApiError(null);
  };

  const handleCopyRef = () => {
    const refToCopy = registrationRef || "REG-KPL-2026-5978";
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(refToCopy);
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2000);
    }
  };

  const stepsMetadata = [
    {
      step: 1,
      title: "PIC & Akun Login",
      subtitle: "Kredensial Penanggung Jawab",
      icon: User,
    },
    {
      step: 2,
      title: "Badan Usaha & Kemitraan",
      subtitle: "Identitas Perusahaan & Alamat",
      icon: Building2,
    },
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNextStep = () => {
    setApiError(null);
    if (currentStep === 1) {
      if (!formData.picName.trim()) {
        setApiError("Nama lengkap PIC wajib diisi.");
        return;
      }
      if (!formData.email.trim()) {
        setApiError("Email resmi perusahaan wajib diisi.");
        return;
      }
      if (formData.password.length < 6) {
        setApiError("Kata sandi harus minimal 6 karakter.");
        return;
      }
      if (formData.password !== formData.passwordConfirm) {
        setApiError("Konfirmasi kata sandi tidak cocok dengan kata sandi akun.");
        return;
      }
      setCurrentStep(2);
      const mainContainer = document.getElementById("form-scroll-container");
      if (mainContainer) mainContainer.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevStep = () => {
    setApiError(null);
    if (currentStep > 1) {
      setCurrentStep(1);
      const mainContainer = document.getElementById("form-scroll-container");
      if (mainContainer) mainContainer.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSubmitRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    // Validasi input wajib DTO backend
    if (!formData.picName.trim()) {
      setApiError("Nama lengkap PIC wajib diisi.");
      setCurrentStep(1);
      return;
    }
    if (!formData.email.trim()) {
      setApiError("Email resmi perusahaan wajib diisi.");
      setCurrentStep(1);
      return;
    }
    if (formData.password.length < 6) {
      setApiError("Kata sandi harus minimal 6 karakter.");
      setCurrentStep(1);
      return;
    }
    if (formData.password !== formData.passwordConfirm) {
      setApiError("Konfirmasi kata sandi tidak cocok.");
      setCurrentStep(1);
      return;
    }
    if (!formData.companyName.trim()) {
      setApiError("Nama resmi badan usaha / perusahaan pelayaran wajib diisi.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: RegisterOperatorDto = {
        fullName: formData.picName.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        companyName: formData.companyName.trim(),
        npwp: formData.npwpNumber.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        address: formData.companyAddress.trim() || undefined,
      };

      const res = await register(payload);

      const operatorIdStr =
        res.user?.operatorId != null ? String(res.user.operatorId) : "";
      const generatedRef = operatorIdStr
        ? `OPR-${operatorIdStr.padStart(4, "0")}`
        : `REG-KPL-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

      setRegistrationRef(generatedRef);
      setRegisteredUser(res.user);
      setIsSubmitted(true);

      // Simpan tanda terima ke sessionStorage (Proteksi Anti-Refresh)
      if (typeof window !== "undefined") {
        try {
          const receiptPayload = {
            registrationRef: generatedRef,
            companyName: formData.companyName,
            picName: formData.picName,
            phone: formData.phone,
            email: formData.email,
            npwpNumber: formData.npwpNumber,
            companyAddress: formData.companyAddress,
            submittedAt: new Date().toISOString(),
          };
          sessionStorage.setItem(REG_RECEIPT_KEY, JSON.stringify(receiptPayload));
        } catch {
          // ignore storage error
        }
      }

      const mainContainer = document.getElementById("form-scroll-container");
      if (mainContainer) mainContainer.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Gagal memproses pendaftaran. Silakan periksa kembali data Anda.";

      if (
        msg.toLowerCase().includes("already registered") ||
        msg.toLowerCase().includes("conflict") ||
        msg.toLowerCase().includes("terdaftar")
      ) {
        setApiError(
          "Email ini sudah terdaftar di sistem PORTA. Silakan gunakan alamat email lain atau masuk dengan akun yang sudah ada."
        );
      } else {
        setApiError(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 w-full h-full max-h-screen overflow-hidden bg-[#F8FAF9] text-[#1E2922] font-sans flex flex-col lg:flex-row antialiased selection:bg-[#D97706]/20 selection:text-[#0B241E]">
      {/* ========================================================================= */}
      {/* 1. LAYER KIRI: INSTITUTIONAL BRANDING WITH MARITIME BACKGROUND            */}
      {/* ========================================================================= */}
      <aside className="w-full lg:w-[38%] xl:w-[35%] text-white relative shrink-0 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#143E33] shadow-2xl z-20 overflow-hidden select-none bg-[#0B241E]">
        {/* Background Maritime Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-105"
          style={{ backgroundImage: `url('/images/register-maritime-bg.jpg')` }}
        />

        {/* Cinematic Deep Emerald Scrim Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#071914]/96 via-[#0B241E]/90 to-[#040E0B]/98 backdrop-blur-[1px] pointer-events-none" />

        {/* Ambient Radial Lighting */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-[#133D31]/35 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-[#D97706]/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 p-6 sm:p-8 lg:p-10 pb-8 lg:pb-10 flex-1 flex flex-col justify-between h-full max-h-screen">
          {/* Top: Official Brand Lockup */}
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

          {/* Bottom Area: Info Registrasi */}
          <div className="space-y-3">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#143E33]/80 border border-[#1E5748] text-[#85A69B] text-xs font-semibold">
              <span>Portal Kemitraan Pelayaran</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight tracking-tight">
              Pendaftaran Operator Kapal
            </h1>
            <p className="text-xs sm:text-[13px] text-emerald-100/90 leading-relaxed max-w-sm">
              Daftarkan badan usaha pelayaran dan kredensial akun penanggung jawab Anda untuk
              mendapatkan akses resmi ke portal operasional pelabuhan, pengajuan jadwal sandar, dan
              penerbitan e-SKRD otomatis terintegrasi PP No. 35/2023.
            </p>
          </div>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 2. LAYER KANAN: FLUID REGISTRATION FORM (2 LANGKAH RAMPING)               */}
      {/* ========================================================================= */}
      <main
        id="form-scroll-container"
        className="flex-1 h-full max-h-full overflow-y-auto overflow-x-hidden flex flex-col justify-between p-6 sm:p-8 lg:p-10 relative bg-[#F8FAF9]"
      >
        <div className="w-full max-w-3xl mx-auto space-y-6 sm:space-y-8 my-auto">
          {/* Top Bar Header (Step Breadcrumb + Back to Login Link) */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
              <span className="font-bold text-[#0B241E]">LANGKAH {currentStep} DARI 2</span>
              <span>•</span>
              <span className="text-[#D97706] font-semibold">
                {stepsMetadata[currentStep - 1]?.title}
              </span>
            </div>

            <Link
              href="/login"
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
              {/* Header: Centered Icon & Status Badge */}
              <div className="flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-18 h-18 rounded-3xl bg-amber-50 border border-amber-200 text-[#D97706] shadow-sm flex items-center justify-center">
                  <Clock className="w-9 h-9 animate-pulse stroke-[2.2]" />
                </div>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-mono font-bold uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping inline-block" />
                  <span>Status Awal: PENDING Verifikasi UPT</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-[#0B241E] tracking-tight pt-1">
                  Pendaftaran Operator Berhasil Diajukan!
                </h2>
                <p className="text-xs sm:text-sm text-[#52635B] max-w-xl mx-auto leading-relaxed">
                  Data badan usaha pelayaran dan kredensial akun penanggung jawab Anda telah berhasil
                  terdaftar di sistem PORTA. Petugas UPT Pelabuhan akan memvalidasi data Anda sebelum
                  fitur permohonan sandar dermaga online diaktifkan penuh.
                </p>
              </div>

              {/* 3-Step Verification Visual Tracker */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#F8FAF9] border border-slate-200 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-[#0B241E]">
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#D97706]" />
                    <span>Tahapan Proses Pengesahan Mitra Pelayaran</span>
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
                      <p className="text-xs font-extrabold text-emerald-950">1. Akun Terdaftar</p>
                      <p className="text-[10.5px] text-emerald-700 leading-snug">
                        Kredensial PIC &amp; entitas tersimpan di server
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
                        Validasi data legalitas &amp; profil kemitraan
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-start gap-2.5 opacity-60">
                    <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      3
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-slate-800">3. Izin Operasional</p>
                      <p className="text-[10.5px] text-slate-500 leading-snug">
                        Pendaftaran armada kapal &amp; tambat aktif
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
                      Nomor Registrasi Operator (ID Resmi Backend)
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

                {/* Company & PIC Detail Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Nama Perusahaan:</span>
                    <span className="font-bold text-[#0B241E]">{formData.companyName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Status Kemitraan:</span>
                    <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-block font-mono text-[10px]">
                      PENDING VERIFIKASI UPT
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">PIC Operasional:</span>
                    <span className="font-bold text-[#0B241E]">
                      {formData.picName} ({formData.phone})
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Email Akun Login:</span>
                    <span className="font-bold text-[#0B241E]">{formData.email}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">NPWP Badan Usaha:</span>
                    <span className="font-bold text-[#0B241E] font-mono">
                      {formData.npwpNumber || "Belum dilampirkan"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Alamat Kantor:</span>
                    <span className="font-bold text-[#0B241E] truncate">
                      {formData.companyAddress || "Pelabuhan Poumako, Mimika"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Panduan Pemantauan Status Akun */}
              <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/90 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-950">
                  <Info className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Cara Memantau Status Persetujuan &amp; Aktivasi Akun Anda</span>
                </div>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  Akun Anda <strong>telah aktif terdaftar di database server PORTA</strong>. Anda dapat langsung
                  masuk ke <strong>Portal Operator Kapal</strong> menggunakan email{" "}
                  <strong className="font-mono text-emerald-950">{formData.email}</strong> dan kata sandi yang telah Anda buat.
                  Status persetujuan verifikasi berkas oleh Petugas UPT Pelabuhan dapat dipantau secara real-time
                  langsung melalui dashboard akun Anda.
                </p>
              </div>

              {/* Action Buttons: 1 Tombol Utama + Aksi Sekunder Ringkas */}
              <div className="space-y-3 pt-1">
                <div className="flex justify-center">
                  <Link
                    href={`/login?email=${encodeURIComponent(formData.email)}`}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl text-xs font-bold bg-[#D97706] hover:bg-[#B45309] text-[#0B241E] hover:text-white transition-all shadow-md shadow-amber-900/20 cursor-pointer text-center"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Masuk ke Portal Operator Sekarang</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                {/* Secondary Actions */}
                <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs font-medium text-slate-500 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1.5 hover:text-[#0B241E] transition-colors cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    <span>Cetak Bukti (PDF)</span>
                  </button>
                  <span className="text-slate-300">•</span>
                  <a
                    href={`https://wa.me/6281298402911?text=Halo%20Admin%20UPT%20PORTA,%20saya%20PIC%20dari%20${encodeURIComponent(
                      formData.companyName
                    )}%20ingin%20konfirmasi%20pendaftaran%20operator%20nomor%20${encodeURIComponent(
                      registrationRef || "REG-KPL-2026-5978"
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 hover:text-emerald-700 transition-colors cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Bantuan WhatsApp UPT</span>
                  </a>
                  <span className="text-slate-300">•</span>
                  <button
                    type="button"
                    onClick={handleStartNewRegistration}
                    className="inline-flex items-center gap-1.5 hover:text-[#0B241E] transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                    <span>Daftarkan Entitas Lain</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* =================================================================== */
            /* B. 2-STEP REGISTRATION FORM                                         */
            /* =================================================================== */
            <form onSubmit={handleSubmitRegistration} className="space-y-4">
              {/* API / Validation Error Banner */}
              {apiError && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start justify-between gap-3 animate-in fade-in duration-200 shadow-sm">
                  <div className="flex items-start gap-3 min-w-0">
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-rose-900">Kendala Pendaftaran Operator</p>
                      <p className="text-xs text-rose-700 mt-0.5 leading-relaxed">{apiError}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setApiError(null)}
                    className="p-1 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer text-xs font-bold shrink-0"
                    title="Tutup pesan error"
                  >
                    ✕
                  </button>
                </div>
              )}

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
                        Kredensial ini akan digunakan untuk masuk ke Portal Kapal PORTA serta mengelola
                        jadwal sandar dermaga dan manifes digital.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                      {/* PIC Name */}
                      <div className="sm:col-span-2 space-y-1.5">
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

                      {/* Official Email */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-[#1E2922]">
                          <span>Email Resmi Perusahaan / PIC</span>
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
                          <span className="text-slate-400 font-normal ml-1">(Opsional)</span>
                        </label>
                        <div className="relative">
                          <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => handleInputChange("phone", e.target.value)}
                            placeholder="0812-xxxx-xxxx"
                            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#0B241E] focus:ring-2 focus:ring-[#0B241E]/10 transition-all bg-white font-mono"
                          />
                        </div>
                      </div>

                      {/* Password */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-[#1E2922]">
                          <span>Kata Sandi Akun</span>
                          <span className="text-red-500 font-bold ml-1">* (Min. 6 Karakter)</span>
                        </label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            type={showPassword ? "text" : "password"}
                            required
                            minLength={6}
                            placeholder="Masukkan kata sandi (min. 6 karakter)"
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
                            minLength={6}
                            placeholder="Ulangi kata sandi akun"
                            value={formData.passwordConfirm}
                            onChange={(e) => handleInputChange("passwordConfirm", e.target.value)}
                            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#0B241E] focus:ring-2 focus:ring-[#0B241E]/10 transition-all bg-white font-mono"
                          />
                        </div>
                      </div>

                      {/* Full-width Helper for Email & Phone */}
                      <div className="sm:col-span-2 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-[#64748B] flex items-center gap-2">
                        <Info className="w-4 h-4 text-[#0B241E] shrink-0" />
                        <span>
                          Email ini akan digunakan sebagai username login utama serta penerima bukti
                          e-SKRD dan surat izin tambat resmi.
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* ----------------------------------------------------------------- */}
                {/* STEP 2: BADAN USAHA PELAYARAN & PROFIL KEMITRAAN                  */}
                {/* ----------------------------------------------------------------- */}
                {currentStep === 2 && (
                  <div className="space-y-6 animate-in fade-in duration-200">
                    <div>
                      <h2 className="text-lg font-black text-[#0B241E] flex items-center gap-2.5">
                        <Building2 className="w-5 h-5 text-[#D97706]" />
                        <span>Badan Usaha Pelayaran &amp; Profil Kemitraan</span>
                      </h2>
                      <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                        Data badan usaha pelayaran dan kategori operasional kapal Anda berdasarkan
                        ketentuan retribusi daerah PP No. 35/2023.
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

                      {/* NPWP Badan Usaha */}
                      <div className="sm:col-span-2 space-y-1.5">
                        <label className="block text-xs font-bold text-[#1E2922]">
                          <span>NPWP Badan Usaha (16 Digit)</span>
                          <span className="text-slate-400 font-normal ml-1">(Opsional)</span>
                        </label>
                        <input
                          type="text"
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
                          <span className="text-slate-400 font-normal ml-1">(Opsional)</span>
                        </label>
                        <textarea
                          rows={2}
                          value={formData.companyAddress}
                          onChange={(e) => handleInputChange("companyAddress", e.target.value)}
                          placeholder="Alamat kantor lengkap, kota, kode pos..."
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#0B241E] focus:ring-2 focus:ring-[#0B241E]/10 transition-all bg-white resize-none"
                        />
                      </div>

                      {/* Quick Summary Preview */}
                      <div className="sm:col-span-2 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 text-xs space-y-2">
                        <div className="flex items-center justify-between text-[11px] font-mono text-[#D97706] font-bold">
                          <span>RINGKASAN DATA AKUN LOGIN</span>
                          <button
                            type="button"
                            onClick={() => setCurrentStep(1)}
                            className="hover:underline cursor-pointer text-[#0B241E]"
                          >
                            Ubah
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                          <div>
                            <span className="text-slate-500">Nama PIC: </span>
                            <span className="font-bold text-[#0B241E]">{formData.picName}</span>
                          </div>
                          <div>
                            <span className="text-slate-500">Email Login: </span>
                            <span className="font-bold text-[#0B241E]">{formData.email}</span>
                          </div>
                        </div>
                      </div>

                      {/* Pakta Integritas Checkbox */}
                      <div className="sm:col-span-2">
                        <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-[#0B241E] cursor-pointer transition-colors shadow-2xs">
                          <input
                            type="checkbox"
                            required
                            checked={formData.agreeTerms}
                            onChange={(e) => handleInputChange("agreeTerms", e.target.checked)}
                            className="mt-0.5 w-4 h-4 rounded text-[#0B241E] border-slate-300 focus:ring-[#0B241E] cursor-pointer"
                          />
                          <span className="text-xs text-[#1E2922] leading-relaxed">
                            Saya selaku penanggung jawab menyatakan bahwa seluruh data perusahaan yang
                            didaftarkan adalah sah dan bersedia mematuhi ketentuan retribusi daerah (PP No. 35/2023)
                            serta standar operasional Pelabuhan PORTA.
                          </span>
                        </label>
                      </div>
                    </div>
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

                  {currentStep === 1 ? (
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-[#0B241E] hover:bg-[#133D31] text-white transition-all cursor-pointer shadow-md shadow-emerald-950/20"
                    >
                      <span>Lanjutkan ke Badan Usaha</span>
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
                          <span>Mendaftarkan Operator...</span>
                        </>
                      ) : (
                        <>
                          <span>Kirim Pendaftaran Operator Kapal</span>
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
