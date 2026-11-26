"use client";

import React, { useEffect, useState } from "react";
import {
  KeyRound,
  UserCog,
  X,
  Loader2,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import { AuthService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";
import { toast } from "@/store/toast.store";
import { ModalPortal } from "@/components/ui/ModalPortal";

interface AccountSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  forcePasswordChange?: boolean;
  onLogout?: () => void;
}

export function AccountSettingsModal({
  isOpen,
  onClose,
  forcePasswordChange = false,
  onLogout,
}: AccountSettingsModalProps) {
  const { user, initialize } = useAuthStore();
  const isMandatory = Boolean(forcePasswordChange || user?.mustChangePassword);

  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [profileCurrentPassword, setProfileCurrentPassword] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && user) {
      setFullName(user.fullName || "");
      setEmail(user.email || "");
      setUsername(user.username || "");
      setProfileCurrentPassword("");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setErrorMsg(null);
      if (user.mustChangePassword || forcePasswordChange) {
        setActiveTab("password");
      }
    }
  }, [isOpen, user, forcePasswordChange]);

  if (!isOpen || !user) return null;

  const isCredentialChanged =
    email.trim().toLowerCase() !== user.email.toLowerCase() ||
    (username.trim().toLowerCase() || "") !== (user.username || "").toLowerCase();

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await AuthService.updateMyProfile({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        username: username.trim() ? username.trim().toLowerCase() : null,
        ...(isCredentialChanged ? { currentPassword: profileCurrentPassword } : {}),
      });
      initialize();
      setProfileCurrentPassword("");
      toast.success("Profil dan kredensial akun Anda berhasil diperbarui.");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Gagal memperbarui profil.");
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
    if (newPassword === currentPassword) {
      setErrorMsg("Kata sandi baru tidak boleh sama dengan kata sandi sementara saat ini.");
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
      toast.success("Kata sandi berhasil diubah. Sesi perangkat lain otomatis dinonaktifkan.");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Gagal mengubah kata sandi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#E2E8F0]">
        <div className="flex items-start justify-between p-6 border-b border-[#E2E8F0]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0B241E] text-[#D97706] flex items-center justify-center">
              <UserCog className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#0B241E]">
                Pengaturan Akun & Keamanan
              </h3>
              <p className="text-xs text-[#64748B]">
                Kelola email, username login, dan kata sandi pribadi Anda.
              </p>
            </div>
          </div>
          {!isMandatory && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#64748B] hover:bg-[#F1F5F9] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="px-6 pt-4 flex gap-2 border-b border-[#F1F5F9]">
          {!isMandatory && (
            <button
              type="button"
              onClick={() => {
                setActiveTab("profile");
                setErrorMsg(null);
              }}
              className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                activeTab === "profile"
                  ? "border-[#0B241E] text-[#0B241E]"
                  : "border-transparent text-[#64748B] hover:text-[#1E293B]"
              }`}
            >
              Email &amp; Username
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setActiveTab("password");
              setErrorMsg(null);
            }}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === "password"
                ? "border-[#0B241E] text-[#0B241E]"
                : "border-transparent text-[#64748B] hover:text-[#1E293B]"
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            Ubah Kata Sandi
          </button>
        </div>

        <div className="p-6 space-y-4">
          {isMandatory && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-semibold flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" />
              <div>
                <p className="font-extrabold">Wajib Ganti Kata Sandi (Login Pertama)</p>
                <p className="font-medium text-amber-800 mt-0.5">
                  Akun Anda menggunakan kata sandi sementara dari Admin. Anda wajib menggantinya sebelum dapat mengakses fitur PORTA.
                </p>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {activeTab === "profile" ? (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1.5">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1.5">
                  Alamat Email Login
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1.5">
                  Username (Opsional, untuk login tanpa email)
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="contoh: budi.poumako (tanpa @)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs font-mono"
                />
              </div>

              {isCredentialChanged && (
                <div>
                  <label className="block text-xs font-bold text-[#334155] mb-1.5">
                    Konfirmasi Kata Sandi Saat Ini
                  </label>
                  <input
                    type="password"
                    required
                    value={profileCurrentPassword}
                    onChange={(e) => setProfileCurrentPassword(e.target.value)}
                    placeholder="Wajib diisi jika mengubah email atau username"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 bg-amber-50/40 text-xs"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                {isMandatory ? (
                  onLogout && (
                    <button
                      type="button"
                      onClick={onLogout}
                      className="px-4 py-2 rounded-xl border border-rose-200 text-xs font-bold text-rose-700 hover:bg-rose-50 cursor-pointer"
                    >
                      Keluar (Logout)
                    </button>
                  )
                ) : (
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl border border-[#CBD5E1] text-xs font-bold text-[#475569] cursor-pointer"
                  >
                    Tutup
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-[#0B241E] hover:bg-[#143E33] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Simpan Profil
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1.5">
                  Kata Sandi Saat Ini
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1.5">
                  Kata Sandi Baru (min. 6 karakter)
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1.5">
                  Ulangi Kata Sandi Baru
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                {isMandatory ? (
                  onLogout && (
                    <button
                      type="button"
                      onClick={onLogout}
                      className="px-4 py-2 rounded-xl border border-rose-200 text-xs font-bold text-rose-700 hover:bg-rose-50 cursor-pointer"
                    >
                      Keluar (Logout)
                    </button>
                  )
                ) : (
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl border border-[#CBD5E1] text-xs font-bold text-[#475569] cursor-pointer"
                  >
                    Tutup
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-[#0B241E] hover:bg-[#143E33] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Perbarui Kata Sandi
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
    </ModalPortal>
  );
}
