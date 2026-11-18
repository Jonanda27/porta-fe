"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Store,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { AuthService } from "@/services/auth.service";
import { TenantService } from "@/services/tenant.service";
import { useAuthStore } from "@/store/auth.store";

export default function RegisterTenantPage() {
  const router = useRouter();
  const { initialize } = useAuthStore();

  const [fullName, setFullName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [npwp, setNpwp] = useState("");
  const [nib, setNib] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      const response = await TenantService.registerTenant({
        fullName: fullName.trim(),
        businessName: businessName.trim(),
        email: email.trim(),
        password,
        npwp: npwp.trim() || undefined,
        nib: nib.trim() || undefined,
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
      });

      AuthService.saveSession(response);
      initialize();
      setSuccess(
        "Pendaftaran tenant berhasil! Mengalihkan ke Portal Tenant..."
      );
      setTimeout(() => {
        router.push("/tenant");
      }, 700);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal memproses pendaftaran tenant."
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#071914] text-white flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-xl bg-white text-[#0B241E] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0B241E] text-[#D97706] flex items-center justify-center">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold">
                Pendaftaran Tenant & Mitra Usaha
              </h1>
              <p className="text-xs text-[#64748B]">
                Portal Sewa Kios, Gudang, & Lahan Komersial Pelabuhan
              </p>
            </div>
          </div>
          <Link
            href="/login"
            className="text-xs font-bold text-[#0B241E] hover:underline flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Masuk
          </Link>
        </div>

        {success && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold mb-1">
                Nama Penanggung Jawab
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Siti Aminah"
                className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">
                Nama Usaha / Badan
              </label>
              <input
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="CV Sinar Papua Mandiri"
                className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tenant@usaha.co.id"
                className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">
                Kata Sandi (min. 6 karakter)
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold mb-1">NPWP</label>
              <input
                type="text"
                value={npwp}
                onChange={(e) => setNpwp(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">NIB</label>
              <input
                type="text"
                value={nib}
                onChange={(e) => setNib(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">No. Telepon</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold mb-1">Alamat Usaha</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Jl. Pelabuhan Poumako, Mimika"
              className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 rounded-xl bg-[#0B241E] hover:bg-[#143E33] text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Daftar sebagai Tenant
          </button>
        </form>
      </div>
    </div>
  );
}
