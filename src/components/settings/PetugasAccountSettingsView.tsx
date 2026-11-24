"use client";

import React, { useEffect, useState } from "react";
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Mail,
  ShieldCheck,
  User,
  UserCog,
} from "lucide-react";
import { AuthService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";
import { toast } from "@/store/toast.store";
import { formatLabel } from "@/lib/format-labels";

export function PetugasAccountSettingsView() {
  const { user, initialize } = useAuthStore();

  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");

  // Form Profil & Kredensial
  const [fullName, setFullName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [profileCurrentPassword, setProfileCurrentPassword] = useState<string>("");
  const [showProfilePassword, setShowProfilePassword] = useState<boolean>(false);

  // Form Ganti Kata Sandi
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showCurrentPw, setShowCurrentPw] = useState<boolean>(false);
  const [showNewPw, setShowNewPw] = useState<boolean>(false);
  const [showConfirmPw, setShowConfirmPw] = useState<boolean>(false);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setFullName(user.fullName || "");
    setEmail(user.email || "");
    setUsername(user.username || "");
    setProfileCurrentPassword("");
    setErrorMsg(null);
    if (user.mustChangePassword) {
      setActiveTab("password");
    }
  }, [user]);

  if (!user) {
    return (
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-8 text-center text-xs text-[#64748B]">
        Memuat informasi akun petugas...
      </div>
    );
  }

  const initials = (user.fullName || user.email || "PT")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  const isCredentialChanged =
    email.trim().toLowerCase() !== user.email.toLowerCase() ||
    (username.trim().toLowerCase() || "") !== (user.username || "").toLowerCase();

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!fullName.trim()) {
      setErrorMsg("Nama lengkap tidak boleh kosong.");
      return;
    }
    if (isCredentialChanged && !profileCurrentPassword) {
      setErrorMsg("Masukkan kata sandi saat ini untuk mengonfirmasi perubahan email atau username.");
      return;
    }

    setIsSubmitting(true);
    try {
      await AuthService.updateMyProfile({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        username: username.trim() ? username.trim().toLowerCase() : null,
        ...(isCredentialChanged ? { currentPassword: profileCurrentPassword } : {}),
      });
      initialize();
      setProfileCurrentPassword("");
      toast.success("Profil Diperbarui", "Profil dan kredensial akun Anda berhasil disimpan.");
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Gagal memperbarui profil akun.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (newPassword.length < 6) {
      setErrorMsg("Kata sandi baru minimal 6 karakter.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg("Konfirmasi kata sandi baru tidak cocok.");
      return;
    }

    setIsSubmitting(true);
    try {
      await AuthService.changeMyPassword({
        currentPassword,
        newPassword,
      });
      initialize();
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success(
        "Kata Sandi Diubah",
        "Kata sandi baru aktif. Sesi pada perangkat lain otomatis dinonaktifkan."
      );
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Gagal mengubah kata sandi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Kolom Kiri: Ringkasan Identitas Kedinasan Petugas */}
      <aside className="lg:col-span-4 space-y-4">
        <div className="bg-white border border-[#CBD5E1] rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-[#0B241E] text-[#FBBF24] flex items-center justify-center font-black text-lg shrink-0 shadow-xs">
              {initials}
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-black text-[#0B241E] truncate">
                {user.fullName}
              </h2>
              <span className="inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <ShieldCheck className="w-3 h-3" />
                {formatLabel(user.role)}
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-[#F1F5F9] space-y-3 text-xs">
            <div className="flex items-start gap-2.5">
              <Mail className="w-4 h-4 text-[#64748B] shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                  Email Kedinasan
                </p>
                <p className="font-semibold text-[#0B241E] break-all">{user.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <User className="w-4 h-4 text-[#64748B] shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                  Username Login
                </p>
                <p className="font-mono font-semibold text-[#0B241E]">
                  {user.username || "-"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Building2 className="w-4 h-4 text-[#64748B] shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                  Unit Kerja
                </p>
                <p className="font-semibold text-[#0B241E]">
                  UPTD Pelabuhan Poumako • Kab. Mimika
                </p>
              </div>
            </div>
          </div>

          <div
            className={`p-3 rounded-xl border text-[11px] flex items-start gap-2 ${
              user.mustChangePassword
                ? "bg-amber-50 border-amber-200 text-amber-900"
                : "bg-emerald-50/70 border-emerald-200 text-emerald-900"
            }`}
          >
            {user.mustChangePassword ? (
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-bold">
                {user.mustChangePassword ? "Wajib Ganti Kata Sandi" : "Keamanan Akun Aktif"}
              </p>
              <p className="mt-0.5 leading-relaxed opacity-90">
                {user.mustChangePassword
                  ? "Segera perbarui kata sandi bawaan Anda pada tab Keamanan."
                  : "Perubahan kata sandi otomatis menutup sesi di perangkat lain."}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Kolom Kanan: Tab Profil & Keamanan */}
      <section className="lg:col-span-8 bg-white border border-[#CBD5E1] rounded-2xl shadow-xs overflow-hidden">
        <div className="flex border-b border-[#E2E8F0] bg-[#F8FAFC] px-6 pt-4 gap-2">
          <button
            type="button"
            onClick={() => {
              setActiveTab("profile");
              setErrorMsg(null);
            }}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl border border-b-0 transition-colors inline-flex items-center gap-2 cursor-pointer ${
              activeTab === "profile"
                ? "bg-white text-[#0B241E] border-[#CBD5E1]"
                : "bg-transparent text-[#64748B] border-transparent hover:text-[#0B241E]"
            }`}
          >
            <UserCog className="w-4 h-4 text-[#D97706]" />
            <span>Profil &amp; Kredensial</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("password");
              setErrorMsg(null);
            }}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl border border-b-0 transition-colors inline-flex items-center gap-2 cursor-pointer ${
              activeTab === "password"
                ? "bg-white text-[#0B241E] border-[#CBD5E1]"
                : "bg-transparent text-[#64748B] border-transparent hover:text-[#0B241E]"
            }`}
          >
            <KeyRound className="w-4 h-4 text-[#D97706]" />
            <span>Keamanan &amp; Kata Sandi</span>
          </button>
        </div>

        <div className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {activeTab === "profile" ? (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#0B241E] mb-1.5">
                  Nama Lengkap &amp; Gelar Petugas
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-sm font-medium text-[#0B241E] focus:outline-none focus:ring-2 focus:ring-[#0B241E]/20 focus:border-[#0B241E]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#0B241E] mb-1.5">
                    Email Login
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-sm font-medium text-[#0B241E] focus:outline-none focus:ring-2 focus:ring-[#0B241E]/20 focus:border-[#0B241E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0B241E] mb-1.5">
                    Username Login (Opsional)
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Contoh: bendahara.poumako"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-sm font-mono text-[#0B241E] focus:outline-none focus:ring-2 focus:ring-[#0B241E]/20 focus:border-[#0B241E]"
                  />
                </div>
              </div>

              {isCredentialChanged && (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-2">
                  <label className="block text-xs font-bold text-amber-900">
                    Konfirmasi Kata Sandi Saat Ini (Wajib karena Email/Username berubah)
                  </label>
                  <div className="relative">
                    <input
                      type={showProfilePassword ? "text" : "password"}
                      value={profileCurrentPassword}
                      onChange={(e) => setProfileCurrentPassword(e.target.value)}
                      required
                      placeholder="Masukkan kata sandi saat ini"
                      className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-amber-300 bg-white text-sm text-[#0B241E] focus:outline-none focus:border-[#0B241E]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowProfilePassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0B241E] cursor-pointer"
                      aria-label="Tampilkan atau sembunyikan kata sandi"
                    >
                      {showProfilePassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-[#F1F5F9] flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-[#0B241E] hover:bg-[#143E33] text-white text-xs font-extrabold inline-flex items-center gap-2 disabled:opacity-60 cursor-pointer shadow-xs"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Simpan Perubahan Profil</span>
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs text-[#475569] flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <span>
                  Setelah kata sandi diubah, token sesi pada perangkat lain akan otomatis
                  dicabut demi keamanan akses data retribusi.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0B241E] mb-1.5">
                  Kata Sandi Saat Ini
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPw ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-[#CBD5E1] text-sm text-[#0B241E] focus:outline-none focus:ring-2 focus:ring-[#0B241E]/20 focus:border-[#0B241E]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0B241E] cursor-pointer"
                    aria-label="Toggle kata sandi saat ini"
                  >
                    {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#0B241E] mb-1.5">
                    Kata Sandi Baru (Min. 6 Karakter)
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPw ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-[#CBD5E1] text-sm text-[#0B241E] focus:outline-none focus:ring-2 focus:ring-[#0B241E]/20 focus:border-[#0B241E]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPw((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0B241E] cursor-pointer"
                      aria-label="Toggle kata sandi baru"
                    >
                      {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0B241E] mb-1.5">
                    Konfirmasi Kata Sandi Baru
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPw ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-[#CBD5E1] text-sm text-[#0B241E] focus:outline-none focus:ring-2 focus:ring-[#0B241E]/20 focus:border-[#0B241E]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPw((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0B241E] cursor-pointer"
                      aria-label="Toggle konfirmasi kata sandi"
                    >
                      {showConfirmPw ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#F1F5F9] flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-[#D97706] hover:bg-[#B45309] text-white text-xs font-extrabold inline-flex items-center gap-2 disabled:opacity-60 cursor-pointer shadow-xs"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Perbarui Kata Sandi</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
