"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AlertCircle, ArrowRight } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import {
  PartnerRoleType,
  RegisteredUserSummary,
  RegisterOperatorDto,
} from "@/types/auth.types";
import { RegisterTenantPayload } from "@/types/tenant.types";
import {
  getRegisterStepsMetadata,
  INITIAL_REGISTER_FORM_DATA,
  PartnerTypeSelector,
  REG_RECEIPT_KEY,
  RegisterFormData,
  RegisterReceipt,
  RegisterSidebar,
  RegisterStepOne,
  RegisterStepTwo,
  RegisterWizardControls,
} from "@/components/register";

export default function RegisterPage() {
  const { register, registerTenant } = useAuthStore();

  // Kategori Mitra: OPERATOR (Perusahaan Kapal) atau TENANT (Mitra Usaha Kios/Gudang)
  const [partnerType, setPartnerType] = useState<PartnerRoleType>("OPERATOR");

  // Wizard Step State (1: PIC & Akun Login, 2: Badan Usaha & Profil Kemitraan)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [registrationRef, setRegistrationRef] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [copiedRef, setCopiedRef] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [, setRegisteredUser] = useState<RegisteredUserSummary | null>(null);

  // Form State: Terpadu untuk Operator Kapal dan Tenant
  const [formData, setFormData] = useState<RegisterFormData>(
    INITIAL_REGISTER_FORM_DATA
  );

  // Sinkronisasi Query Parameter URL (?type=tenant atau ?type=operator) & Anti-Refresh
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const params = new URLSearchParams(window.location.search);
      const typeParam = params.get("type");
      if (typeParam === "tenant") {
        setPartnerType("TENANT");
      } else if (typeParam === "operator" || typeParam === "kapal") {
        setPartnerType("OPERATOR");
      }

      // Pulihkan data tanda terima dari sessionStorage jika di-refresh setelah submit
      const saved = sessionStorage.getItem(REG_RECEIPT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.registrationRef && parsed?.email) {
          setRegistrationRef(parsed.registrationRef);
          if (parsed.partnerType) setPartnerType(parsed.partnerType);
          setFormData((prev) => ({
            ...prev,
            companyName: parsed.companyName || "",
            picName: parsed.picName || "",
            phone: parsed.phone || "",
            email: parsed.email || "",
            npwpNumber: parsed.npwpNumber || "",
            nib: parsed.nib || "",
            companyAddress: parsed.companyAddress || "",
          }));
          setIsSubmitted(true);
        }
      }
    } catch {
      // Abaikan jika storage korup
    }
  }, []);

  const scrollToFormTop = () => {
    const mainContainer = document.getElementById("form-scroll-container");
    if (mainContainer) mainContainer.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStartNewRegistration = () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(REG_RECEIPT_KEY);
    }
    setFormData(INITIAL_REGISTER_FORM_DATA);
    setRegistrationRef("");
    setRegisteredUser(null);
    setIsSubmitted(false);
    setCurrentStep(1);
    setApiError(null);
  };

  const handleCopyRef = () => {
    const defaultRef =
      partnerType === "OPERATOR" ? "REG-KPL-2026-5978" : "REG-TNT-2026-3841";
    const refToCopy = registrationRef || defaultRef;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(refToCopy);
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2000);
    }
  };

  const stepsMetadata = getRegisterStepsMetadata(partnerType);

  const handleInputChange = <K extends keyof RegisterFormData>(
    field: K,
    value: RegisterFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNextStep = () => {
    setApiError(null);
    if (currentStep === 1) {
      if (!formData.picName.trim()) {
        setApiError("Nama lengkap PIC / penanggung jawab wajib diisi.");
        return;
      }
      if (!formData.email.trim()) {
        setApiError("Alamat email resmi wajib diisi.");
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
      scrollToFormTop();
    }
  };

  const handlePrevStep = () => {
    setApiError(null);
    if (currentStep > 1) {
      setCurrentStep(1);
      scrollToFormTop();
    }
  };

  const handleSubmitRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    // Validasi Step 1
    if (!formData.picName.trim()) {
      setApiError("Nama lengkap penanggung jawab wajib diisi.");
      setCurrentStep(1);
      return;
    }
    if (!formData.email.trim()) {
      setApiError("Alamat email resmi wajib diisi.");
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

    // Validasi Step 2
    if (!formData.companyName.trim()) {
      setApiError(
        partnerType === "OPERATOR"
          ? "Nama resmi badan usaha / perusahaan pelayaran wajib diisi."
          : "Nama usaha / toko / brand tenant wajib diisi."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      let generatedRef = "";

      if (partnerType === "OPERATOR") {
        // Alur Registrasi Operator Kapal (POST /auth/register)
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
        generatedRef = operatorIdStr
          ? `OPR-${operatorIdStr.padStart(4, "0")}`
          : `REG-KPL-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

        setRegisteredUser(res.user);
      } else {
        // Alur Registrasi Tenant & Mitra Usaha (POST /auth/register-tenant)
        const payload: RegisterTenantPayload = {
          fullName: formData.picName.trim(),
          businessName: formData.companyName.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          npwp: formData.npwpNumber.trim() || undefined,
          nib: formData.nib.trim() || undefined,
          phone: formData.phone.trim() || undefined,
          address: formData.companyAddress.trim() || undefined,
        };

        const res = await registerTenant(payload);
        generatedRef = `TNT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

        setRegisteredUser(res.user);
      }

      setRegistrationRef(generatedRef);
      setIsSubmitted(true);

      // Simpan tanda terima ke sessionStorage (Proteksi Anti-Refresh)
      if (typeof window !== "undefined") {
        try {
          const receiptPayload = {
            partnerType,
            registrationRef: generatedRef,
            companyName: formData.companyName,
            picName: formData.picName,
            phone: formData.phone,
            email: formData.email,
            npwpNumber: formData.npwpNumber,
            nib: formData.nib,
            companyAddress: formData.companyAddress,
            submittedAt: new Date().toISOString(),
          };
          sessionStorage.setItem(REG_RECEIPT_KEY, JSON.stringify(receiptPayload));
        } catch {
          // Abaikan jika storage penuh
        }
      }

      scrollToFormTop();
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
      {/* 1. LAYER KIRI: INSTITUTIONAL BRANDING WITH MARITIME BACKGROUND */}
      <RegisterSidebar partnerType={partnerType} />

      {/* 2. LAYER KANAN: FLUID REGISTRATION FORM DENGAN ROLE SWITCHER TERPADU */}
      <main
        id="form-scroll-container"
        className="flex-1 h-full max-h-full overflow-y-auto overflow-x-hidden flex flex-col justify-between p-6 sm:p-8 lg:p-10 relative bg-[#F8FAF9]"
      >
        <div className="w-full max-w-3xl mx-auto space-y-6 sm:space-y-8 my-auto">
          {/* Top Bar Header (Step Breadcrumb + Back to Login Link) */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
              <span className="font-bold text-[#0B241E]">
                LANGKAH {currentStep} DARI 2
              </span>
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

          {isSubmitted ? (
            <RegisterReceipt
              partnerType={partnerType}
              registrationRef={registrationRef}
              formData={formData}
              copiedRef={copiedRef}
              onCopyRef={handleCopyRef}
              onStartNewRegistration={handleStartNewRegistration}
            />
          ) : (
            <form onSubmit={handleSubmitRegistration} className="space-y-4">
              {/* API / Validation Error Banner */}
              {apiError && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start justify-between gap-3 animate-in fade-in duration-200 shadow-sm">
                  <div className="flex items-start gap-3 min-w-0">
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-rose-900">
                        Kendala Pendaftaran
                      </p>
                      <p className="text-xs text-rose-700 mt-0.5 leading-relaxed">
                        {apiError}
                      </p>
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

              {/* SELECTOR KATEGORI MITRA (SINGLE ENTRY POINT) */}
              {currentStep === 1 && (
                <PartnerTypeSelector
                  partnerType={partnerType}
                  onSelect={(type) => {
                    setPartnerType(type);
                    setApiError(null);
                  }}
                />
              )}

              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 lg:p-9 space-y-6">
                {currentStep === 1 && (
                  <RegisterStepOne
                    partnerType={partnerType}
                    formData={formData}
                    showPassword={showPassword}
                    onTogglePassword={() => setShowPassword((prev) => !prev)}
                    onInputChange={handleInputChange}
                  />
                )}

                {currentStep === 2 && (
                  <RegisterStepTwo
                    partnerType={partnerType}
                    formData={formData}
                    onInputChange={handleInputChange}
                    onEditStepOne={() => setCurrentStep(1)}
                  />
                )}

                <RegisterWizardControls
                  currentStep={currentStep}
                  partnerType={partnerType}
                  isSubmitting={isSubmitting}
                  agreeTerms={formData.agreeTerms}
                  onPrevStep={handlePrevStep}
                  onNextStep={handleNextStep}
                />
              </div>
            </form>
          )}

          {/* Minimalist Footer */}
          <div className="pt-2 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-[#64748B] gap-2">
            <p>© 2026 PORTA • Dinas Perhubungan Kabupaten Mimika</p>
            <div className="flex items-center gap-3">
              <span className="text-[#0B241E] font-medium">
                Layanan Bantuan: (0901) 321-008
              </span>
              <span>•</span>
              <span className="text-[#0B241E] font-medium">
                PP No. 35/2023 &amp; Perbup 25/2024
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
