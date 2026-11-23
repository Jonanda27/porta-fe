"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Sparkles,
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
    targetRoute: "/upt/pelabuhan",
  },
  {
    roleLabel: "Operator Kapal (PT Pelayaran Mimika)",
    email: "operator@mimika-shipping.co.id",
    password: "Porta123!",
    targetRoute: "/kapal/dashboard",
  },
  {
    roleLabel: "Admin Pelabuhan (UPT)",
    email: "admin.pomako@porta.mimikakab.go.id",
    password: "Porta123!",
    targetRoute: "/upt/dashboard",
  },
  {
    roleLabel: "Kepala Dinas (Dishub)",
    email: "dishub@porta.mimikakab.go.id",
    password: "Porta123!",
    targetRoute: "/dinas/dashboard",
  },
  {
    roleLabel: "Bendahara Kasda",
    email: "bendahara.pomako@porta.mimikakab.go.id",
    password: "Porta123!",
    targetRoute: "/bendahara/dashboard",
  },
  {
    roleLabel: "Petugas Registrasi & Kontrak",
    email: "petugas.registrasi@porta.mimikakab.go.id",
    password: "Porta123!",
    targetRoute: "/upt/dashboard",
  },
  {
    roleLabel: "Petugas Dermaga",
    email: "petugas.pomako@porta.mimikakab.go.id",
    password: "Porta123!",
    targetRoute: "/upt/kapal",
  },
  {
    roleLabel: "Petugas Ruangan",
    email: "petugas.ruangan@porta.mimikakab.go.id",
    password: "Porta123!",
    targetRoute: "/upt/verifikasi",
  },
  {
    roleLabel: "Kepala Pelabuhan",
    email: "kepala.pelabuhan@porta.mimikakab.go.id",
    password: "Porta123!",
    targetRoute: "/upt/verifikasi",
  },
  {
    roleLabel: "Tenant / Mitra Usaha",
    email: "tenant@sinarpapua.co.id",
    password: "Porta123!",
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

  // Otomatis isi email jika diarahkan dari pendaftaran baru (?email=...)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const emailParam = params.get("email");
      if (emailParam) {
        setEmail(emailParam);
      }
    }
  }, []);

  const handleQuickFill = (acc: (typeof DEMO_ACCOUNTS)[0]) => {
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
                  : matchedDemo.roleLabel.includes("Registrasi")
                  ? "PETUGAS_REGISTRASI_KONTRAK"
                  : matchedDemo.roleLabel.includes("Dermaga")
                  ? "PETUGAS_DERMAGA"
                  : matchedDemo.roleLabel.includes("Ruangan")
                  ? "PETUGAS_RUANGAN"
                  : matchedDemo.roleLabel.includes("Kepala Pelabuhan")
                  ? "KEPALA_PELABUHAN"
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
            "Tidak dapat terhubung ke server backend (port 4000). Pastikan backend porta-be sudah berjalan dengan 'npm run start:dev', atau gunakan akun demo."
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
    <div className="min-h-screen lg:h-screen lg:max-h-screen bg-white text-slate-900 flex flex-col lg:flex-row lg:overflow-hidden font-sans">
      {/* ========================================================= */}
      {/* SISI KIRI: FASILITAS PELABUHAN DENGAN LABEL RESMI (58%)   */}
      {/* ========================================================= */}
      <div className="relative w-full lg:w-[58%] min-h-[380px] lg:min-h-0 lg:h-full bg-[#071914] overflow-hidden shrink-0">
        {/* Background Media: Video Operasional Pelabuhan / Ombak Laut */}
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="w-full h-full object-cover object-center"
        >
          <source
            src="/videos/Ship_battling_rough_ocean_waves_dd7fabd4_1080p.mp4"
            type="video/mp4"
          />
        </video>

        {/* Gradasi Lembut di Bagian Bawah untuk Keterbacaan Teks */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.45) 28%, rgba(0,0,0,0.1) 50%, transparent 70%)",
          }}
        />

        {/* Teks Identitas Fasilitas di Kiri Bawah (Persis seperti "Bandara Mozes Kilangin") */}
        <div className="absolute bottom-8 left-8 sm:bottom-12 sm:left-12 z-10 text-white space-y-1 max-w-xl">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white drop-shadow-md">
            Pelabuhan Poumako
          </h1>
          <p className="text-xs sm:text-sm text-slate-200 font-medium tracking-wide drop-shadow-sm">
            UPTD Pelabuhan Poumako • Dinas Perhubungan Kabupaten Mimika
          </p>
        </div>
      </div>

      {/* ========================================================= */}
      {/* SISI KANAN: FORM LOGIN BERSIH BERLATAR PUTIH (42%)        */}
      {/* ========================================================= */}
      <div className="flex-1 lg:w-[42%] bg-white border-t lg:border-t-0 lg:border-l border-slate-200 flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-16 h-full overflow-y-auto">
        {/* Top Header: Logo Brand di Kiri & Link Beranda di Kanan */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 flex items-center justify-center shrink-0">
              <img
                src="/brand/symbol.svg"
                alt="PORTA Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="font-extrabold text-2xl tracking-wider text-[#0B241E] leading-none">
              PORTA
            </span>
          </div>

          <Link
            href="/"
            className="text-xs font-bold text-slate-500 hover:text-[#0B241E] tracking-widest uppercase transition-colors"
          >
            BERANDA
          </Link>
        </div>

        {/* Center Area: Form Login Portal */}
        <div className="w-full max-w-sm mx-auto my-auto py-6 space-y-5">
          {/* Headline & Subtitle */}
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Login Portal
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Masukkan email dan password Anda.
            </p>
          </div>

          {/* Quick Demo Account Selector (Dev Mode) */}
          <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/90 flex items-center justify-between gap-2 shadow-xs">
            <div className="flex items-center gap-1.5 text-amber-800 text-[11px] font-medium shrink-0 font-mono">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Demo Cepat:</span>
            </div>
            <select
              id="demo-account-dropdown"
              aria-label="Pilih Akun Demo"
              value={DEMO_ACCOUNTS.some((a) => a.email === email) ? email : ""}
              onChange={(e) => {
                const selected = DEMO_ACCOUNTS.find((a) => a.email === e.target.value);
                if (selected) {
                  handleQuickFill(selected);
                }
              }}
              className="text-xs bg-white text-slate-800 border border-amber-300 rounded-md px-2.5 py-1 outline-none cursor-pointer w-full max-w-[190px] truncate font-medium focus:border-amber-500 shadow-xs"
              title="Pilih akun pengujian demo untuk mengisi email & password otomatis"
            >
              <option value="" disabled className="text-slate-400">
                -- Pilih Profil Role --
              </option>
              {DEMO_ACCOUNTS.map((acc) => (
                <option key={acc.email} value={acc.email} className="text-slate-900">
                  {acc.roleLabel}
                </option>
              ))}
            </select>
          </div>

          {/* Alert Error / Sukses */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <p className="leading-relaxed">{errorMessage}</p>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">{successMessage}</p>
            </div>
          )}

          {/* Form Login Utama */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Field Email */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 tracking-wider uppercase font-mono">
                EMAIL
              </label>
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Masukkan email"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B241E] focus:bg-white focus:border-transparent transition-all"
              />
            </div>

            {/* Field Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 tracking-wider uppercase font-mono">
                PASSWORD
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  className="w-full pl-4 pr-11 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B241E] focus:bg-white focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 cursor-pointer transition-colors"
                  title={showPassword ? "Sembunyikan password" : "Lihat password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button (Dark Maritime Green #0B241E) */}
            <button
              type="submit"
              disabled={isStoreLoading}
              className="w-full py-3.5 px-6 rounded-xl bg-[#0B241E] hover:bg-[#143E33] active:bg-[#071914] text-white font-extrabold text-sm tracking-widest uppercase shadow-md shadow-slate-200 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none mt-2"
            >
              {isStoreLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>MEMPROSES...</span>
                </>
              ) : (
                <span>MASUK PORTAL</span>
              )}
            </button>
          </form>

          {/* Link Registrasi Mitra (Satu Pintu Terpadu di /register) */}
          <div className="text-center text-xs text-slate-500 pt-3">
            <span>Belum memiliki akun mitra? </span>
            <Link
              href="/register"
              className="font-bold text-[#0284C7] hover:underline"
            >
              Daftar Sekarang
            </Link>
          </div>
        </div>

        {/* Bottom Footer: Copyright Resmi */}
        <div className="text-center text-xs text-slate-400 pt-4 border-t border-slate-100">
          <span>© 2026 Dinas Perhubungan Kabupaten Mimika</span>
        </div>
      </div>
    </div>
  );
}
