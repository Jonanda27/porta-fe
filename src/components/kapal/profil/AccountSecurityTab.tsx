"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  AlertTriangle,
  Building2,
  Loader2,
  User,
  KeyRound,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "@/store/toast.store";
import {
  AuthUser,
  ChangeMyPasswordPayload,
  ChangeMyPasswordResponse,
  UpdateMyProfilePayload,
} from "@/types/auth.types";
import { ShipOperator, UpdateOperatorPayload } from "@/types/kapal.types";

export interface AccountSecurityTabProps {
  user: AuthUser | null;
  operator: ShipOperator | null;
  onUpdateOperatorProfile: (
    operatorId: number,
    payload: UpdateOperatorPayload
  ) => Promise<ShipOperator>;
  onUpdateMyProfile: (payload: UpdateMyProfilePayload) => Promise<AuthUser>;
  onChangeMyPassword: (
    payload: ChangeMyPasswordPayload
  ) => Promise<ChangeMyPasswordResponse>;
}

export function AccountSecurityTab({
  user,
  operator,
  onUpdateOperatorProfile,
  onUpdateMyProfile,
  onChangeMyPassword,
}: AccountSecurityTabProps) {
  const [operatorFormData, setOperatorFormData] = useState({
    name: "",
    npwp: "",
    phone: "",
    email: "",
    address: "",
    operatorProfile: "REGULAR_SCHEDULED" as "REGULAR_SCHEDULED" | "INCIDENTAL",
  });
  const [isSavingCompany, setIsSavingCompany] = useState<boolean>(false);
  const [companyError, setCompanyError] = useState<string | null>(null);

  const [accountForm, setAccountForm] = useState({
    fullName: "",
    email: "",
    username: "",
    currentPassword: "",
  });
  const [isSavingProfile, setIsSavingProfile] = useState<boolean>(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [showCurrentPwd, setShowCurrentPwd] = useState<boolean>(false);
  const [showNewPwd, setShowNewPwd] = useState<boolean>(false);
  const [isSavingPassword, setIsSavingPassword] = useState<boolean>(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setAccountForm({
        fullName: user.fullName || "",
        email: user.email || "",
        username: user.username || "",
        currentPassword: "",
      });
    }
  }, [user]);

  useEffect(() => {
    if (operator) {
      setOperatorFormData({
        name: operator.name || "",
        npwp: operator.npwp || "",
        phone: operator.phone || "",
        email: operator.email || "",
        address: operator.address || "",
        operatorProfile: operator.operatorProfile || "REGULAR_SCHEDULED",
      });
    }
  }, [operator]);

  const isChangingLoginCredential = useMemo(() => {
    if (!user) return false;
    const nextEmail = accountForm.email.trim().toLowerCase();
    const curEmail = (user.email || "").trim().toLowerCase();
    const nextUsername = accountForm.username.trim().toLowerCase();
    const curUsername = (user.username || "").trim().toLowerCase();
    return nextEmail !== curEmail || nextUsername !== curUsername;
  }, [user, accountForm.email, accountForm.username]);

  const handleSubmitEditOperator = async (e: React.FormEvent) => {
    e.preventDefault();
    const opId = operator?.id || user?.operatorId;
    if (!opId) {
      setCompanyError("ID perusahaan operator tidak ditemukan.");
      return;
    }
    if (!operatorFormData.name.trim()) {
      setCompanyError("Nama perusahaan badan usaha wajib diisi.");
      return;
    }

    setIsSavingCompany(true);
    setCompanyError(null);
    try {
      await onUpdateOperatorProfile(Number(opId), {
        name: operatorFormData.name.trim(),
        npwp: operatorFormData.npwp.trim() || undefined,
        phone: operatorFormData.phone.trim() || undefined,
        email: operatorFormData.email.trim() || undefined,
        address: operatorFormData.address.trim() || undefined,
        operatorProfile: operatorFormData.operatorProfile,
      });
      toast.success(
        "Profil Usaha Diperbarui",
        "Profil badan usaha perusahaan pelayaran berhasil diperbarui."
      );
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Gagal memperbarui profil badan usaha.";
      setCompanyError(msg);
    } finally {
      setIsSavingCompany(false);
    }
  };

  const handleSubmitAccountProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);

    const trimmedName = accountForm.fullName.trim();
    const trimmedEmail = accountForm.email.trim().toLowerCase();
    const trimmedUsername = accountForm.username.trim();

    if (!trimmedName) {
      setProfileError("Nama lengkap akun tidak boleh kosong.");
      return;
    }
    if (!trimmedEmail) {
      setProfileError("Alamat email login wajib diisi.");
      return;
    }
    if (trimmedUsername && !/^[a-zA-Z0-9._-]{4,50}$/.test(trimmedUsername)) {
      setProfileError(
        "Username harus 4–50 karakter (hanya huruf, angka, titik, garis bawah, atau strip)."
      );
      return;
    }
    if (isChangingLoginCredential && !accountForm.currentPassword) {
      setProfileError(
        "Kata sandi saat ini wajib diisi untuk memverifikasi perubahan email atau username."
      );
      return;
    }

    setIsSavingProfile(true);
    try {
      const updated = await onUpdateMyProfile({
        fullName: trimmedName,
        email: trimmedEmail,
        username: trimmedUsername ? trimmedUsername : null,
        ...(isChangingLoginCredential
          ? { currentPassword: accountForm.currentPassword }
          : {}),
      });
      setAccountForm({
        fullName: updated.fullName || "",
        email: updated.email || "",
        username: updated.username || "",
        currentPassword: "",
      });
      toast.success("Profil Akun Diperbarui", "Data profil akun login berhasil disimpan.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal memperbarui profil akun.";
      setProfileError(msg);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSubmitChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (!passwordForm.currentPassword) {
      setPasswordError("Harap masukkan kata sandi saat ini.");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordError("Kata sandi baru minimal 6 karakter.");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      setPasswordError("Konfirmasi kata sandi baru tidak cocok.");
      return;
    }
    if (passwordForm.newPassword === passwordForm.currentPassword) {
      setPasswordError("Kata sandi baru harus berbeda dari kata sandi saat ini.");
      return;
    }

    setIsSavingPassword(true);
    try {
      const res = await onChangeMyPassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
      toast.success("Kata Sandi Diperbarui", res.message || "Kata sandi berhasil diperbarui!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal mengganti kata sandi.";
      setPasswordError(msg);
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <section className="space-y-5">
      {user?.mustChangePassword && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl flex items-start gap-3 text-xs text-amber-950">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-extrabold text-sm text-amber-950">
              Disarankan Segera Mengganti Kata Sandi Awal
            </p>
            <p className="text-amber-900 mt-0.5 leading-relaxed">
              Akun Anda masih menggunakan kata sandi awal yang dibuat oleh sistem/admin. Demi
              keamanan operasional armada, silakan perbarui kata sandi Anda di bawah ini.
            </p>
          </div>
        </div>
      )}

      {/* Card 0: Profil Badan Usaha Perusahaan Pelayaran (PATCH /operators/:id) */}
      <div className="bg-white border border-[#CBD5E1] rounded-2xl p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-3 border-b border-[#F1F5F9] pb-4">
          <div className="w-10 h-10 rounded-xl bg-[#0B241E] text-[#D97706] flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-[#0B241E]">
              Profil Badan Usaha Perusahaan Pelayaran
            </h3>
            <p className="text-xs text-[#64748B]">
              Perbarui identitas resmi perusahaan, NPWP, kontak operasional, dan alamat kantor
              cabang pelabuhan.
            </p>
          </div>
        </div>

        {companyError && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{companyError}</span>
          </div>
        )}

        <form onSubmit={handleSubmitEditOperator} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="block font-bold text-[#0B241E] mb-1">
                Nama Badan Usaha / Perusahaan <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={operatorFormData.name}
                onChange={(e) =>
                  setOperatorFormData({ ...operatorFormData, name: e.target.value })
                }
                placeholder="Contoh: PT Pelayaran Mimika Sejahtera"
                className="w-full p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl font-semibold focus:border-[#0B241E] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-bold text-[#0B241E] mb-1">NPWP Perusahaan</label>
              <input
                type="text"
                value={operatorFormData.npwp}
                onChange={(e) =>
                  setOperatorFormData({ ...operatorFormData, npwp: e.target.value })
                }
                placeholder="01.234.567.8-954.000"
                className="w-full p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl font-mono focus:border-[#0B241E] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-bold text-[#0B241E] mb-1">
                Profil Operasional Pelayaran
              </label>
              <select
                value={operatorFormData.operatorProfile}
                onChange={(e) =>
                  setOperatorFormData({
                    ...operatorFormData,
                    operatorProfile: e.target.value as "REGULAR_SCHEDULED" | "INCIDENTAL",
                  })
                }
                className="w-full p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl font-semibold focus:border-[#0B241E] focus:outline-hidden"
              >
                <option value="REGULAR_SCHEDULED">Rutin Terjadwal</option>
                <option value="INCIDENTAL">Insidental / Non-Reguler</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-[#0B241E] mb-1">
                Nomor Telepon Operasional
              </label>
              <input
                type="text"
                value={operatorFormData.phone}
                onChange={(e) =>
                  setOperatorFormData({ ...operatorFormData, phone: e.target.value })
                }
                placeholder="0811-4800-291"
                className="w-full p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl font-mono focus:border-[#0B241E] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-bold text-[#0B241E] mb-1">
                Email Resmi Perusahaan
              </label>
              <input
                type="email"
                value={operatorFormData.email}
                onChange={(e) =>
                  setOperatorFormData({ ...operatorFormData, email: e.target.value })
                }
                placeholder="ops@perusahaan.co.id"
                className="w-full p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl font-mono focus:border-[#0B241E] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-bold text-[#0B241E] mb-1">
                Alamat Kantor Pelabuhan
              </label>
              <input
                type="text"
                value={operatorFormData.address}
                onChange={(e) =>
                  setOperatorFormData({ ...operatorFormData, address: e.target.value })
                }
                placeholder="Alamat lengkap kantor cabang pelabuhan"
                className="w-full p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl font-medium focus:border-[#0B241E] focus:outline-hidden"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end border-t border-[#F1F5F9]">
            <button
              type="submit"
              disabled={isSavingCompany}
              className="px-5 py-2.5 bg-[#0B241E] hover:bg-[#143E33] text-white font-extrabold rounded-xl shadow-xs cursor-pointer disabled:opacity-50 inline-flex items-center gap-2"
            >
              {isSavingCompany && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{isSavingCompany ? "Menyimpan..." : "Simpan Profil Perusahaan"}</span>
            </button>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Card 1: Identitas Akun Login */}
        <div className="bg-white border border-[#CBD5E1] rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-3 border-b border-[#F1F5F9] pb-4">
            <div className="w-10 h-10 rounded-xl bg-[#0B241E] text-[#D97706] flex items-center justify-center shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-[#0B241E]">Identitas Akun Login</h3>
              <p className="text-xs text-[#64748B]">
                Perbarui nama PIC akun, alamat email login, atau username portal.
              </p>
            </div>
          </div>

          {profileError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{profileError}</span>
            </div>
          )}

          <form onSubmit={handleSubmitAccountProfile} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-[#0B241E] mb-1">
                Nama Lengkap Akun / PIC <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={accountForm.fullName}
                onChange={(e) =>
                  setAccountForm({ ...accountForm, fullName: e.target.value })
                }
                placeholder="Contoh: Budi Santoso"
                className="w-full p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl font-semibold focus:border-[#0B241E] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-bold text-[#0B241E] mb-1">
                Alamat Email Login <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={accountForm.email}
                onChange={(e) => setAccountForm({ ...accountForm, email: e.target.value })}
                placeholder="operator@perusahaan.co.id"
                className="w-full p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl font-mono focus:border-[#0B241E] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-bold text-[#0B241E] mb-1">
                Username Alternatif (Opsional)
              </label>
              <input
                type="text"
                value={accountForm.username}
                onChange={(e) =>
                  setAccountForm({ ...accountForm, username: e.target.value })
                }
                placeholder="Contoh: mimika.shipping (4–50 karakter, tanpa @)"
                className="w-full p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl font-mono focus:border-[#0B241E] focus:outline-hidden"
              />
              <p className="text-[10.5px] text-[#64748B] mt-1">
                Hanya huruf, angka, titik (.), garis bawah (_), atau strip (-).
              </p>
            </div>

            {isChangingLoginCredential && (
              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1.5">
                <label className="block font-bold text-amber-950">
                  Kata Sandi Saat Ini (Verifikasi Perubahan Email/Username){" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={accountForm.currentPassword}
                  onChange={(e) =>
                    setAccountForm({
                      ...accountForm,
                      currentPassword: e.target.value,
                    })
                  }
                  placeholder="Masukkan kata sandi saat ini"
                  className="w-full p-2.5 bg-white border border-amber-300 rounded-xl font-semibold focus:border-[#0B241E] focus:outline-hidden"
                />
              </div>
            )}

            <div className="pt-2 flex justify-end border-t border-[#F1F5F9]">
              <button
                type="submit"
                disabled={isSavingProfile}
                className="px-5 py-2.5 bg-[#0B241E] hover:bg-[#143E33] text-white font-extrabold rounded-xl shadow-xs cursor-pointer disabled:opacity-50 inline-flex items-center gap-2"
              >
                {isSavingProfile && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{isSavingProfile ? "Menyimpan..." : "Simpan Profil Akun"}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Card 2: Ganti Kata Sandi */}
        <div className="bg-white border border-[#CBD5E1] rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-3 border-b border-[#F1F5F9] pb-4">
            <div className="w-10 h-10 rounded-xl bg-[#0B241E] text-[#D97706] flex items-center justify-center shrink-0">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-[#0B241E]">
                Keamanan &amp; Ganti Kata Sandi
              </h3>
              <p className="text-xs text-[#64748B]">
                Gunakan kata sandi kuat minimal 6 karakter. Sesi token diperbarui otomatis.
              </p>
            </div>
          </div>

          {passwordError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}

          <form onSubmit={handleSubmitChangePassword} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-[#0B241E] mb-1">
                Kata Sandi Saat Ini <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showCurrentPwd ? "text" : "password"}
                  required
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      currentPassword: e.target.value,
                    })
                  }
                  placeholder="Masukkan kata sandi saat ini"
                  className="w-full p-2.5 pr-10 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl font-semibold focus:border-[#0B241E] focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPwd((prev) => !prev)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0B241E] p-1 cursor-pointer"
                  title={showCurrentPwd ? "Sembunyikan" : "Tampilkan"}
                >
                  {showCurrentPwd ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block font-bold text-[#0B241E] mb-1">
                Kata Sandi Baru <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showNewPwd ? "text" : "password"}
                  required
                  minLength={6}
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      newPassword: e.target.value,
                    })
                  }
                  placeholder="Minimal 6 karakter"
                  className="w-full p-2.5 pr-10 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl font-semibold focus:border-[#0B241E] focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPwd((prev) => !prev)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0B241E] p-1 cursor-pointer"
                  title={showNewPwd ? "Sembunyikan" : "Tampilkan"}
                >
                  {showNewPwd ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block font-bold text-[#0B241E] mb-1">
                Konfirmasi Kata Sandi Baru <span className="text-red-500">*</span>
              </label>
              <input
                type={showNewPwd ? "text" : "password"}
                required
                minLength={6}
                value={passwordForm.confirmNewPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    confirmNewPassword: e.target.value,
                  })
                }
                placeholder="Ulangi kata sandi baru"
                className="w-full p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl font-semibold focus:border-[#0B241E] focus:outline-hidden"
              />
            </div>

            <div className="pt-2 flex justify-end border-t border-[#F1F5F9]">
              <button
                type="submit"
                disabled={isSavingPassword}
                className="px-5 py-2.5 bg-[#0B241E] hover:bg-[#143E33] text-white font-extrabold rounded-xl shadow-xs cursor-pointer disabled:opacity-50 inline-flex items-center gap-2"
              >
                {isSavingPassword && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{isSavingPassword ? "Memperbarui..." : "Perbarui Kata Sandi"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
