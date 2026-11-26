import { Eye, EyeOff, Info, Lock, Mail, Phone, User } from "lucide-react";
import { PartnerRoleType } from "@/types/auth.types";
import { RegisterFormData } from "./constants";

export interface RegisterStepOneProps {
  partnerType: PartnerRoleType;
  formData: RegisterFormData;
  showPassword: boolean;
  onTogglePassword: () => void;
  onInputChange: <K extends keyof RegisterFormData>(
    field: K,
    value: RegisterFormData[K]
  ) => void;
}

export function RegisterStepOne({
  partnerType,
  formData,
  showPassword,
  onTogglePassword,
  onInputChange,
}: RegisterStepOneProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h2 className="text-lg font-black text-[#0B241E] flex items-center gap-2.5">
          <User className="w-5 h-5 text-[#D97706]" />
          <span>Identitas Penanggung Jawab &amp; Kredensial Akun</span>
        </h2>
        <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
          {partnerType === "OPERATOR"
            ? "Kredensial ini digunakan untuk masuk ke Portal Kapal PORTA serta mengelola jadwal sandar dermaga dan manifes digital."
            : "Kredensial ini digunakan untuk masuk ke Portal Tenant PORTA untuk mengelola sewa kios/gudang dan pembayaran utilitas."}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
        {/* PIC Name */}
        <div className="sm:col-span-2 space-y-1.5">
          <label className="block text-xs font-bold text-[#1E2922]">
            <span>Nama Lengkap PIC / Penanggung Jawab</span>
            <span className="text-red-500 font-bold ml-1">*</span>
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              required
              value={formData.picName}
              onChange={(e) => onInputChange("picName", e.target.value)}
              placeholder={
                partnerType === "OPERATOR"
                  ? "Contoh: Capt. M. Farhan Hidayat"
                  : "Contoh: Bpk. Ahmad Dahlan"
              }
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#0B241E] focus:ring-2 focus:ring-[#0B241E]/10 transition-all bg-white"
            />
          </div>
        </div>

        {/* Official Email */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-[#1E2922]">
            <span>Email Resmi PIC / Akun Login</span>
            <span className="text-red-500 font-bold ml-1">*</span>
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => onInputChange("email", e.target.value)}
              placeholder={
                partnerType === "OPERATOR"
                  ? "ops@perusahaan-pelayaran.co.id"
                  : "kontak@usaha-tenant.id"
              }
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#0B241E] focus:ring-2 focus:ring-[#0B241E]/10 transition-all bg-white"
            />
          </div>
        </div>

        {/* WhatsApp / Phone */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-[#1E2922]">
            <span>Nomor Telepon / WhatsApp</span>
            <span className="text-slate-400 font-normal ml-1">(Opsional)</span>
          </label>
          <div className="relative">
            <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => onInputChange("phone", e.target.value)}
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
              onChange={(e) => onInputChange("password", e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#0B241E] focus:ring-2 focus:ring-[#0B241E]/10 transition-all bg-white font-mono"
            />
            <button
              type="button"
              onClick={onTogglePassword}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
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
              onChange={(e) => onInputChange("passwordConfirm", e.target.value)}
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#0B241E] focus:ring-2 focus:ring-[#0B241E]/10 transition-all bg-white font-mono"
            />
          </div>
        </div>

        {/* Full-width Helper */}
        <div className="sm:col-span-2 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-[#64748B] flex items-center gap-2">
          <Info className="w-4 h-4 text-[#0B241E] shrink-0" />
          <span>
            Email ini akan digunakan sebagai username login utama serta penerima
            bukti resmi e-SKRD, tagihan sewa, dan notifikasi permohonan.
          </span>
        </div>
      </div>
    </div>
  );
}
