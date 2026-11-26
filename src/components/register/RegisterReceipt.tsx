import Link from "next/link";
import {
  ArrowRight,
  Check,
  Clock,
  Copy,
  FileText,
  LogIn,
  Phone,
  RotateCcw,
  ShieldCheck,
  Store,
} from "lucide-react";
import { PartnerRoleType } from "@/types/auth.types";
import { RegisterFormData } from "./constants";

export interface RegisterReceiptProps {
  partnerType: PartnerRoleType;
  registrationRef: string;
  formData: RegisterFormData;
  copiedRef: boolean;
  onCopyRef: () => void;
  onStartNewRegistration: () => void;
}

export function RegisterReceipt({
  partnerType,
  registrationRef,
  formData,
  copiedRef,
  onCopyRef,
  onStartNewRegistration,
}: RegisterReceiptProps) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden p-6 sm:p-9 space-y-7 animate-in fade-in zoom-in-95 duration-300">
      {/* Header: Centered Icon & Status Badge */}
      <div className="flex flex-col items-center justify-center text-center space-y-3">
        <div
          className={`w-18 h-18 rounded-3xl border shadow-sm flex items-center justify-center ${
            partnerType === "OPERATOR"
              ? "bg-amber-50 border-amber-200 text-[#D97706]"
              : "bg-emerald-50 border-emerald-200 text-emerald-700"
          }`}
        >
          {partnerType === "OPERATOR" ? (
            <Clock className="w-9 h-9 animate-pulse stroke-[2.2]" />
          ) : (
            <Check className="w-9 h-9 stroke-[2.5]" />
          )}
        </div>

        <div
          className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider border ${
            partnerType === "OPERATOR"
              ? "bg-amber-100 text-amber-900 border-amber-300"
              : "bg-emerald-100 text-emerald-900 border-emerald-300"
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full inline-block ${
              partnerType === "OPERATOR"
                ? "bg-amber-500 animate-ping"
                : "bg-emerald-500"
            }`}
          />
          <span>
            {partnerType === "OPERATOR"
              ? "Status Awal: Menunggu Verifikasi Petugas"
              : "Status: Akun Tenant Aktif"}
          </span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-[#0B241E] tracking-tight pt-1">
          {partnerType === "OPERATOR"
            ? "Pendaftaran Operator Berhasil Diajukan!"
            : "Pendaftaran Akun Tenant Berhasil!"}
        </h2>
        <p className="text-xs sm:text-sm text-[#52635B] max-w-xl mx-auto leading-relaxed">
          {partnerType === "OPERATOR"
            ? "Data badan usaha pelayaran dan kredensial akun PIC Anda telah tersimpan di sistem PORTA. Petugas Registrasi & Kontrak akan memvalidasi data Anda sebelum fitur permohonan sandar dermaga online diaktifkan penuh."
            : "Akun tenant Anda telah aktif terdaftar di sistem PORTA. Anda dapat langsung menjelajahi katalog kios/gudang yang tersedia dan mengajukan permohonan sewa aset pelabuhan."}
        </p>
      </div>

      {/* 3-Step Verification Visual Tracker */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#F8FAF9] border border-slate-200 space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-[#0B241E]">
          <span className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#D97706]" />
            <span>
              {partnerType === "OPERATOR"
                ? "Tahapan Proses Pengesahan Mitra Pelayaran"
                : "Tahapan Aktivasi Kemitraan Tenant"}
            </span>
          </span>
          <span className="text-[11px] font-mono text-slate-500 font-semibold">
            {partnerType === "OPERATOR"
              ? "Estimasi SLA: < 24 Jam Kerja"
              : "Aktivasi Instan"}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Step 1 */}
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200/90 flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
            <div>
              <p className="text-xs font-extrabold text-emerald-950">
                1. Akun Terdaftar
              </p>
              <p className="text-[10.5px] text-emerald-700 leading-snug">
                Kredensial PIC &amp; entitas tersimpan
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div
            className={`p-3 rounded-xl border flex items-start gap-2.5 ${
              partnerType === "OPERATOR"
                ? "bg-amber-50 border-amber-200"
                : "bg-emerald-50 border-emerald-200/90"
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                partnerType === "OPERATOR" ? "bg-[#D97706]" : "bg-emerald-600"
              }`}
            >
              {partnerType === "OPERATOR" ? (
                <Clock className="w-3.5 h-3.5 stroke-[2.5]" />
              ) : (
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <p
                  className={`text-xs font-extrabold ${
                    partnerType === "OPERATOR"
                      ? "text-amber-950"
                      : "text-emerald-950"
                  }`}
                >
                  {partnerType === "OPERATOR"
                    ? "2. Verifikasi Petugas"
                    : "2. Profil Usaha Aktif"}
                </p>
                {partnerType === "OPERATOR" && (
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-200 text-amber-900">
                    Sedang Berjalan
                  </span>
                )}
              </div>
              <p
                className={`text-[10.5px] leading-snug ${
                  partnerType === "OPERATOR"
                    ? "text-amber-800"
                    : "text-emerald-700"
                }`}
              >
                {partnerType === "OPERATOR"
                  ? "Validasi legalitas & profil kemitraan"
                  : "Sesi login berhasil diaktifkan"}
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div
            className={`p-3 rounded-xl border flex items-start gap-2.5 ${
              partnerType === "OPERATOR"
                ? "bg-white border-slate-200 opacity-60"
                : "bg-amber-50 border-amber-200"
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                partnerType === "OPERATOR"
                  ? "bg-slate-200 text-slate-600"
                  : "bg-[#D97706] text-white"
              }`}
            >
              {partnerType === "OPERATOR" ? (
                "3"
              ) : (
                <Store className="w-3.5 h-3.5" />
              )}
            </div>
            <div>
              <p
                className={`text-xs font-extrabold ${
                  partnerType === "OPERATOR"
                    ? "text-slate-800"
                    : "text-amber-950"
                }`}
              >
                {partnerType === "OPERATOR"
                  ? "3. Izin Operasional"
                  : "3. Pengajuan Sewa Aset"}
              </p>
              <p
                className={`text-[10.5px] leading-snug ${
                  partnerType === "OPERATOR"
                    ? "text-slate-500"
                    : "text-amber-800"
                }`}
              >
                {partnerType === "OPERATOR"
                  ? "Pendaftaran armada kapal & jadwal sandar"
                  : "Pilih kios/gudang & tanda tangani kontrak"}
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
              Nomor Registrasi Resmi PORTA
            </span>
            <div className="flex items-center gap-3 mt-1">
              <p className="text-xl sm:text-2xl font-mono font-black text-[#0B241E] tracking-wider">
                {registrationRef}
              </p>
              <button
                type="button"
                onClick={onCopyRef}
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
              {partnerType === "OPERATOR"
                ? "Kanal 02: Operator Armada & Pelayaran"
                : "Kanal 04: Mitra Usaha & Tenant Pelabuhan"}
            </p>
          </div>
        </div>

        {/* Detail Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">
              {partnerType === "OPERATOR"
                ? "Nama Perusahaan:"
                : "Nama Usaha / Toko:"}
            </span>
            <span className="font-bold text-[#0B241E]">
              {formData.companyName}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">
              Status Kemitraan:
            </span>
            <span
              className={`font-bold px-2 py-0.5 rounded border inline-block font-mono text-[10px] ${
                partnerType === "OPERATOR"
                  ? "text-amber-700 bg-amber-50 border-amber-200"
                  : "text-emerald-700 bg-emerald-50 border-emerald-200"
              }`}
            >
              {partnerType === "OPERATOR"
                ? "MENUNGGU VERIFIKASI PETUGAS"
                : "AKTIF (SIAP SEWA)"}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">
              PIC Penanggung Jawab:
            </span>
            <span className="font-bold text-[#0B241E]">
              {formData.picName} ({formData.phone || "-"})
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">
              Email Akun Login:
            </span>
            <span className="font-bold text-[#0B241E] font-mono">
              {formData.email}
            </span>
          </div>
          {formData.npwpNumber && (
            <div>
              <span className="text-slate-400 block text-[11px]">
                NPWP / NIK:
              </span>
              <span className="font-bold text-[#0B241E] font-mono">
                {formData.npwpNumber}
              </span>
            </div>
          )}
          {formData.nib && (
            <div>
              <span className="text-slate-400 block text-[11px]">
                NIB Usaha:
              </span>
              <span className="font-bold text-[#0B241E] font-mono">
                {formData.nib}
              </span>
            </div>
          )}
          <div className="sm:col-span-2">
            <span className="text-slate-400 block text-[11px]">
              Alamat / Lokasi Operasional:
            </span>
            <span className="font-bold text-[#0B241E]">
              {formData.companyAddress || "Pelabuhan Poumako, Kabupaten Mimika"}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 pt-1">
        <div className="flex justify-center">
          {partnerType === "OPERATOR" ? (
            <Link
              href={`/login?email=${encodeURIComponent(formData.email)}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl text-xs font-bold bg-[#D97706] hover:bg-[#B45309] text-[#0B241E] hover:text-white transition-all shadow-md shadow-amber-900/20 cursor-pointer text-center"
            >
              <LogIn className="w-4 h-4" />
              <span>Masuk ke Portal Operator Sekarang</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <Link
              href="/tenant"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl text-xs font-bold bg-[#0B241E] hover:bg-[#143E33] text-white transition-all shadow-md shadow-emerald-950/20 cursor-pointer text-center"
            >
              <Store className="w-4 h-4 text-[#D97706]" />
              <span>Buka Portal Tenant &amp; Lihat Aset Sewa</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
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
            )}%20ingin%20konfirmasi%20pendaftaran%20${
              partnerType === "OPERATOR" ? "operator" : "tenant"
            }%20nomor%20${encodeURIComponent(registrationRef)}`}
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
            onClick={onStartNewRegistration}
            className="inline-flex items-center gap-1.5 hover:text-[#0B241E] transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Daftarkan Entitas Lain</span>
          </button>
        </div>
      </div>
    </div>
  );
}
