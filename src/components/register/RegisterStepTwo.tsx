import { Building2, Store } from "lucide-react";
import { PartnerRoleType } from "@/types/auth.types";
import { RegisterFormData } from "./constants";

export interface RegisterStepTwoProps {
  partnerType: PartnerRoleType;
  formData: RegisterFormData;
  onInputChange: <K extends keyof RegisterFormData>(
    field: K,
    value: RegisterFormData[K]
  ) => void;
  onEditStepOne: () => void;
}

export function RegisterStepTwo({
  partnerType,
  formData,
  onInputChange,
  onEditStepOne,
}: RegisterStepTwoProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h2 className="text-lg font-black text-[#0B241E] flex items-center gap-2.5">
          {partnerType === "OPERATOR" ? (
            <Building2 className="w-5 h-5 text-[#D97706]" />
          ) : (
            <Store className="w-5 h-5 text-emerald-700" />
          )}
          <span>
            {partnerType === "OPERATOR"
              ? "Badan Usaha Pelayaran & Profil Kemitraan"
              : "Identitas Usaha & Profil Tenant Pelabuhan"}
          </span>
        </h2>
        <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
          {partnerType === "OPERATOR"
            ? "Data badan usaha pelayaran dan armada kapal Anda berdasarkan ketentuan retribusi daerah PP No. 35/2023."
            : "Data toko, kios, atau gudang Anda untuk keperluan kontrak sewa aset dan pencatatan retribusi kekayaan daerah."}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
        {/* Company Name / Business Name */}
        <div className="sm:col-span-2 space-y-1.5">
          <label className="block text-xs font-bold text-[#1E2922]">
            <span>
              {partnerType === "OPERATOR"
                ? "Nama Resmi Perusahaan Pelayaran / Badan Usaha (PT/CV)"
                : "Nama Toko / Badan Usaha / Brand Tenant"}
            </span>
            <span className="text-red-500 font-bold ml-1">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.companyName}
            onChange={(e) => onInputChange("companyName", e.target.value)}
            placeholder={
              partnerType === "OPERATOR"
                ? "Contoh: PT Pelayaran Nusantara Bahari Mandiri"
                : "Contoh: Kios Berkah Pomako / CV Logistik Jaya"
            }
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#0B241E] focus:ring-2 focus:ring-[#0B241E]/10 transition-all bg-white"
          />
        </div>

        {/* NIB (Khusus Tenant) */}
        {partnerType === "TENANT" && (
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#1E2922]">
              <span>Nomor Induk Berusaha (NIB)</span>
              <span className="text-slate-400 font-normal ml-1">(Opsional)</span>
            </label>
            <input
              type="text"
              value={formData.nib}
              onChange={(e) => onInputChange("nib", e.target.value)}
              placeholder="Contoh: 1234567890123"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#0B241E] focus:ring-2 focus:ring-[#0B241E]/10 transition-all bg-white font-mono"
            />
          </div>
        )}

        {/* NPWP / NIK */}
        <div
          className={`space-y-1.5 ${
            partnerType === "OPERATOR" ? "sm:col-span-2" : ""
          }`}
        >
          <label className="block text-xs font-bold text-[#1E2922]">
            <span>
              {partnerType === "OPERATOR"
                ? "NPWP Badan Usaha (16 Digit)"
                : "NPWP / NIK Pemilik Usaha"}
            </span>
            <span className="text-slate-400 font-normal ml-1">(Opsional)</span>
          </label>
          <input
            type="text"
            value={formData.npwpNumber}
            onChange={(e) => onInputChange("npwpNumber", e.target.value)}
            placeholder="00.000.000.0-000.000"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#0B241E] focus:ring-2 focus:ring-[#0B241E]/10 transition-all bg-white font-mono"
          />
        </div>

        {/* Company Address */}
        <div className="sm:col-span-2 space-y-1.5">
          <label className="block text-xs font-bold text-[#1E2922]">
            <span>
              {partnerType === "OPERATOR"
                ? "Alamat Kantor Domisili / Kantor Operasional Cabang"
                : "Alamat / Lokasi Rencana Sewa di Pelabuhan"}
            </span>
            <span className="text-slate-400 font-normal ml-1">(Opsional)</span>
          </label>
          <textarea
            rows={2}
            value={formData.companyAddress}
            onChange={(e) => onInputChange("companyAddress", e.target.value)}
            placeholder={
              partnerType === "OPERATOR"
                ? "Alamat kantor cabang/agen, kota, kode pos..."
                : "Lokasi operasional, nomor kios, atau area pelabuhan yang diminati..."
            }
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#0B241E] focus:ring-2 focus:ring-[#0B241E]/10 transition-all bg-white resize-none"
          />
        </div>

        {/* Quick Summary Preview */}
        <div className="sm:col-span-2 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 text-xs space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-[#D97706] font-bold">
            <span>RINGKASAN DATA AKUN &amp; KATEGORI</span>
            <button
              type="button"
              onClick={onEditStepOne}
              className="hover:underline cursor-pointer text-[#0B241E]"
            >
              Ubah
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
            <div>
              <span className="text-slate-500">Kategori: </span>
              <span className="font-bold text-[#0B241E]">
                {partnerType === "OPERATOR"
                  ? "Operator Kapal"
                  : "Tenant Kios/Gudang"}
              </span>
            </div>
            <div>
              <span className="text-slate-500">Nama PIC: </span>
              <span className="font-bold text-[#0B241E]">{formData.picName}</span>
            </div>
            <div>
              <span className="text-slate-500">Email: </span>
              <span className="font-bold text-[#0B241E] truncate block">
                {formData.email}
              </span>
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
              onChange={(e) => onInputChange("agreeTerms", e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-[#0B241E] border-slate-300 focus:ring-[#0B241E] cursor-pointer"
            />
            <span className="text-xs text-[#1E2922] leading-relaxed">
              {partnerType === "OPERATOR"
                ? "Saya selaku penanggung jawab menyatakan bahwa seluruh data perusahaan pelayaran yang didaftarkan adalah sah dan bersedia mematuhi ketentuan retribusi daerah (PP No. 35/2023) serta standar operasional Pelabuhan PORTA."
                : "Saya selaku pemilik/penanggung jawab usaha menyatakan bahwa seluruh data yang didaftarkan adalah sah dan bersedia mematuhi ketentuan sewa aset pelabuhan serta retribusi pemanfaatan kekayaan daerah."}
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}
