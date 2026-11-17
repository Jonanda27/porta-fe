"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Anchor,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import { AuthService } from "@/services/auth.service";
import { UserRole } from "@/types/auth.types";
import { useAuthStore } from "@/store/auth.store";
import { ApiException } from "@/lib/api-client";

const DEMO_ACCOUNTS = [
  {
    roleLabel: "Superadmin PORTA Mimika",
    email: "superadmin@porta.mimikakab.go.id",
    password: "Porta123!",
    badge: "bg-purple-900/60 text-purple-200 border-purple-700",
    targetRoute: "/upt/pelabuhan",
  },
  {
    roleLabel: "Operator Kapal (PT Pelayaran Mimika)",
    email: "operator@mimika-shipping.co.id",
    password: "Porta123!",
    badge: "bg-blue-900/60 text-blue-200 border-blue-700",
    targetRoute: "/kapal/dashboard",
  },
  {
    roleLabel: "Admin Pelabuhan (UPT)",
    email: "admin.pomako@porta.mimikakab.go.id",
    password: "Porta123!",
    badge: "bg-emerald-800 text-emerald-200 border-emerald-700",
    targetRoute: "/upt/dashboard",
  },
  {
    roleLabel: "Kepala Dinas (Dishub)",
    email: "dishub@porta.mimikakab.go.id",
    password: "Porta123!",
    badge: "bg-[#0B241E] text-[#D97706] border-[#1E5748]",
    targetRoute: "/dinas/dashboard",
  },
  {
    roleLabel: "Bendahara Kasda",
    email: "bendahara.pomako@porta.mimikakab.go.id",
    password: "Porta123!",
    badge: "bg-amber-900/60 text-amber-200 border-amber-700",
    targetRoute: "/upt/dashboard",
  },
  {
    roleLabel: "Petugas Dermaga",
    email: "petugas.pomako@porta.mimikakab.go.id",
    password: "Porta123!",
    badge: "bg-teal-900/60 text-teal-200 border-teal-700",
    targetRoute: "/upt/kapal",
  },
  {
    roleLabel: "Tenant / Mitra Usaha",
    email: "tenant@sinarpapua.co.id",
    password: "Porta123!",
    badge: "bg-indigo-900/60 text-indigo-200 border-indigo-700",
    targetRoute: "/tenant",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const { login: storeLogin, isLoading: isStoreLoading } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleQuickFill = (acc: typeof DEMO_ACCOUNTS[0]) => {
    setEmail(acc.email);
    setPassword(acc.password);
    setErrorMessage(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email || !password) {
      setErrorMessage("Silakan masukkan email dan kata sandi Anda.");
      return;
    }

    try {
      // Panggil store terpusat (Store -> Service -> ApiClient -> Backend)
      const data = await storeLogin({ identifier: email.trim(), email: email.trim(), password });

      setSuccessMessage(
        `Login berhasil! Mengalihkan ke portal ${data.user?.fullName || ""}...`
      );

      // Arahkan ke rute yang sesuai berdasarkan role wewenang backend
      const targetRoute = AuthService.getRedirectRouteByRole(data.user?.role);
      setTimeout(() => {
        router.push(targetRoute);
      }, 700);
    } catch (err: unknown) {
      if (err instanceof ApiException) {
        // Jika server backend belum dinyalakan (status code 0 / network failure)
        if (err.statusCode === 0) {
          const matchedDemo = DEMO_ACCOUNTS.find(
            (d) => d.email.toLowerCase() === email.toLowerCase() && d.password === password
          );

          if (matchedDemo) {
            setSuccessMessage(
              "Backend offline (Mode Pratinjau Frontend). Mengalihkan langsung ke dashboard..."
            );
            AuthService.saveSession({
              accessToken: "demo_offline_token",
              user: {
                id: 999,
                email: matchedDemo.email,
                fullName: matchedDemo.roleLabel,
                role: (matchedDemo.roleLabel.includes("Superadmin")
                  ? "SUPERADMIN"
                  : matchedDemo.roleLabel.includes("Dishub")
                  ? "DISHUB_EKSEKUTIF"
                  : matchedDemo.roleLabel.includes("Dermaga")
                  ? "PETUGAS_DERMAGA"
                  : matchedDemo.roleLabel.includes("Bendahara")
                  ? "BENDAHARA"
                  : matchedDemo.roleLabel.includes("Operator Kapal")
                  ? "OPERATOR_KAPAL"
                  : matchedDemo.roleLabel.includes("Tenant")
                  ? "TENANT"
                  : "ADMIN_PELABUHAN") as UserRole,
              },
            });
            setTimeout(() => {
              router.push(matchedDemo.targetRoute);
            }, 800);
            return;
          }

          setErrorMessage(
            "Tidak dapat terhubung ke server backend (port 4000). Pastikan backend porta-be sudah berjalan dengan 'npm run start:dev', atau gunakan akun demo di bawah."
          );
        } else {
          setErrorMessage(err.message || "Email atau kata sandi tidak valid.");
        }
      } else {
        setErrorMessage(
          err instanceof Error ? err.message : "Terjadi kesalahan saat memproses login."
        );
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#071914] text-white flex flex-col lg:flex-row selection:bg-[#D97706]/30 selection:text-white">
      {/* ========================================================= */}
      {/* 1. SISI KIRI: BRANDING & IDENTITAS OTORITAS PELABUHAN      */}
      {/* ========================================================= */}
      <div className="relative w-full lg:w-[48%] xl:w-[45%] p-6 sm:p-10 lg:p-16 flex flex-col justify-between overflow-hidden bg-[#0B241E]">
        {/* Background Visual Pelabuhan */}
        <div className="absolute inset-0 z-0">
          <img
            src="/port-hero.jpg"
            alt="Pelabuhan Poumako"
            className="w-full h-full object-cover object-center opacity-25 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#071914] via-[#0B241E]/90 to-[#0B241E]/80" />
        </div>

        {/* Header Branding */}
        <div className="relative z-10 space-y-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-mono text-emerald-200/80 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            <span>Kembali ke Beranda Publik</span>
          </Link>

          <div className="flex items-center gap-3.5 pt-2">
            <img
              src="/brand/symbol-white.svg"
              alt="PORTA"
              className="w-11 h-11 object-contain drop-shadow-md"
            />
            <div>
              <span className="text-2xl font-black tracking-tight text-white block leading-none">
                PORTA
              </span>
              <p className="text-[10px] text-emerald-300/80 uppercase font-mono tracking-wider mt-1">
                Pelabuhan & Penerimaan Daerah
              </p>
            </div>
          </div>
        </div>

        {/* Core Authority Message */}
        <div className="relative z-10 my-auto py-12 space-y-6 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 border border-white/10 text-[11px] font-mono text-[#F59E0B]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Satu Pintu Akses Seluruh Pemangku Kepentingan</span>
          </div>

          <h1 className="text-3xl sm:text-4xl xl:text-5xl font-black tracking-tight text-white leading-[1.15] [text-wrap:balance]">
            Otoritas Layanan Maritim & Transparansi Penerimaan Daerah
          </h1>

          <p className="text-sm text-emerald-100/80 leading-relaxed font-normal">
            Platform operasional terpadu untuk Dinas Perhubungan, UPTD Syahbandar, Operator Armada Kapal, dan Mitra Pemanfaatan Aset BMD Kabupaten Mimika.
          </p>

          <div className="pt-2 grid grid-cols-2 gap-4 text-xs font-mono text-emerald-200/80">
            <div className="p-3.5 rounded-xl bg-black/30 border border-white/10">
              <span className="text-slate-400 block text-[10px] uppercase">Dasar Hukum Retribusi</span>
              <strong className="text-white block mt-0.5 font-semibold">PP 35/2023 & Perbup 25/2024</strong>
            </div>
            <div className="p-3.5 rounded-xl bg-black/30 border border-white/10">
              <span className="text-slate-400 block text-[10px] uppercase">Standar Keamanan</span>
              <strong className="text-white block mt-0.5 font-semibold">Validasi SOLAS 1974</strong>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 pt-6 border-t border-white/10 text-[11px] font-mono text-emerald-300/60 flex items-center justify-between">
          <span>Otoritas UPTD Pelabuhan Poumako</span>
          <span>Keamanan Sesi Terenkripsi</span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. SISI KANAN: FORM LOGIN OTENTIKASI TUNGGAL               */}
      {/* ========================================================= */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 lg:p-16 bg-[#071914]">
        <div className="w-full max-w-md space-y-8">
          {/* Headline Form */}
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Masuk ke Portal Layanan
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Masukkan alamat email dan kata sandi akun resmi Anda. Sistem akan mengarahkan modul secara otomatis berdasarkan wewenang peran Anda.
            </p>
          </div>

          {/* Alert Error / Sukses */}
          {errorMessage && (
            <div className="p-4 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-200 text-xs flex items-start gap-3 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">{errorMessage}</p>
            </div>
          )}

          {successMessage && (
            <div className="p-4 rounded-xl bg-emerald-950/70 border border-emerald-800 text-emerald-200 text-xs flex items-start gap-3 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">{successMessage}</p>
            </div>
          )}

          {/* Form Login */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Field Email atau Username */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
                Email atau Username
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email atau username Anda"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.06] border border-white/15 focus:border-[#D97706] focus:bg-black/40 text-white placeholder-slate-500 text-sm outline-none transition-all font-sans"
                />
              </div>
            </div>

            {/* Field Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
                  Kata Sandi
                </label>
                <button
                  type="button"
                  onClick={() =>
                    alert(
                      "Untuk reset kata sandi akun resmi pelabuhan, hubungi Administrator Dishub / IT Pelabuhan di: syahbandar@porta.go.id"
                    )
                  }
                  className="text-xs text-[#F59E0B] hover:underline cursor-pointer"
                >
                  Lupa kata sandi?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-11 py-3 rounded-xl bg-white/[0.06] border border-white/15 focus:border-[#D97706] focus:bg-black/40 text-white placeholder-slate-500 text-sm outline-none transition-all font-sans"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between text-xs text-slate-300">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-700 bg-white/10 text-[#D97706] focus:ring-0 focus:ring-offset-0 cursor-pointer"
                />
                <span>Ingat sesi masuk di perangkat ini</span>
              </label>
            </div>

            {/* Tombol Submit */}
            <button
              type="submit"
              disabled={isStoreLoading}
              className="w-full py-3.5 px-6 rounded-xl bg-[#D97706] hover:bg-[#B45309] text-[#0B241E] font-bold text-sm tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-amber-950/40 transition-all cursor-pointer active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none"
            >
              {isStoreLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memverifikasi Akun...</span>
                </>
              ) : (
                <>
                  <span>Masuk ke Portal Layanan</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Fill Box */}
          <div className="pt-4 border-t border-white/10 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span>Akun Demo Cepat (Klik untuk Isi):</span>
              <span className="text-[#F59E0B]">Pass: Porta123!</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => handleQuickFill(acc)}
                  className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.09] border border-white/10 hover:border-[#D97706]/50 text-left transition-all cursor-pointer group"
                >
                  <span className="text-[11px] font-bold text-white group-hover:text-[#F59E0B] transition-colors block">
                    {acc.roleLabel}
                  </span>
                  <span className="text-[9.5px] font-mono text-slate-400 truncate block mt-0.5">
                    {acc.email}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Register Link Footer */}
          <div className="text-center text-xs text-slate-400 pt-2 space-y-1">
            <div>
              <span>Operator Kapal baru? </span>
              <Link href="/register" className="text-[#F59E0B] font-bold hover:underline">
                Registrasi Perusahaan Kapal
              </Link>
            </div>
            <div>
              <span>Mitra / Penyewa Kios & Gudang? </span>
              <Link href="/register-tenant" className="text-[#F59E0B] font-bold hover:underline">
                Registrasi Tenant Usaha
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
