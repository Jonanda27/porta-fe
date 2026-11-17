"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Anchor,
  Compass,
  ShieldCheck,
  ArrowRight,
  Landmark,
  Ship,
  Ticket,
  Waves,
  ChevronRight,
  Sparkles,
  Store,
} from "lucide-react";

export type UserRoleType = "dinas" | "upt" | "kapal" | "penumpang" | "tenant";

interface RoleMetadata {
  id: UserRoleType;
  code: string;
  title: string;
  scope: string;
  summary: string;
  destinationLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  tag: string;
  accentBg: string;
  accentText: string;
  borderHover: string;
}

const ROLES: RoleMetadata[] = [
  {
    id: "dinas",
    code: "01",
    title: "Dinas Perhubungan (Eksekutif)",
    scope: "Pimpinan Wilayah & Bapenda",
    summary: "Monitoring real-time penerimaan PAD retribusi daerah, audit kepatuhan, & analitik performa lintas pelabuhan.",
    destinationLabel: "Dashboard Eksekutif Dinas",
    icon: Landmark,
    tag: "Pengawasan PAD",
    accentBg: "bg-[#0B241E] text-[#D97706]",
    accentText: "text-[#0B241E]",
    borderHover: "hover:border-[#0B241E]",
  },
  {
    id: "upt",
    code: "02",
    title: "Pengelola Pelabuhan (UPT)",
    scope: "Syahbandar & Operasional Dermaga",
    summary: "Pusat komando operasional harian, linimasa sandar, verifikasi manifes SOLAS, kontrol gerbang/tiket, & serah terima sif.",
    destinationLabel: "Portal Operasional UPT",
    icon: Anchor,
    tag: "Otoritas Pelabuhan",
    accentBg: "bg-emerald-800 text-emerald-200",
    accentText: "text-emerald-800",
    borderHover: "hover:border-emerald-700",
  },
  {
    id: "kapal",
    code: "03",
    title: "Perusahaan Kapal (Operator)",
    scope: "Armada Pelayaran & Logistik",
    summary: "Master data armada kapal (GT/LOA), pengajuan jadwal & dermaga, pelaporan manifes muatan, serta pembayaran e-SKRD otomatis.",
    destinationLabel: "Portal Operator Kapal",
    icon: Ship,
    tag: "Operator Armada",
    accentBg: "bg-[#D97706] text-[#0B241E]",
    accentText: "text-[#D97706]",
    borderHover: "hover:border-[#D97706]",
  },
  {
    id: "tenant",
    code: "04",
    title: "Mitra Tenant (Penyewa Aset)",
    scope: "Kios, Kantin, Gudang & Logistik",
    summary: "Katalog sewa tempat usaha, pengajuan sewa BMD, buku kontrak PKS digital, monitoring utilitas, & e-SKRD.",
    destinationLabel: "Portal Tenant",
    icon: Store,
    tag: "Pemanfaatan BMD",
    accentBg: "bg-blue-800 text-blue-100",
    accentText: "text-blue-800",
    borderHover: "hover:border-blue-700",
  },
];

interface AuthPageProps {
  onLoginSuccess: (role: UserRoleType) => void;
}

export default function AuthPage({ onLoginSuccess }: AuthPageProps) {
  const [navigatingRole, setNavigatingRole] = useState<UserRoleType | null>(null);

  // Body Scroll Lock for Desktop
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const handleSelectRole = (role: UserRoleType) => {
    setNavigatingRole(role);
    setTimeout(() => {
      onLoginSuccess(role);
    }, 250);
  };

  return (
    <div className="fixed inset-0 w-screen h-screen max-h-screen overflow-hidden bg-[#F8FAF9] text-[#111C18] font-sans flex flex-col md:flex-row antialiased select-none selection:bg-[#D97706]/20 selection:text-[#0B241E]">
      {/* ========================================================= */}
      {/* 1. LAYER KIRI: VISUAL PELABUHAN & IDENTITAS RESMI PORTA   */}
      {/* ========================================================= */}
      <aside className="w-full md:w-[42%] lg:w-[40%] xl:w-[38%] text-white relative overflow-hidden shrink-0 h-44 sm:h-56 md:h-full flex flex-col justify-between">
        {/* Real Harbor Image Background with Cinematic Vignette Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="/port-hero.jpg"
            alt="Pelabuhan dan Kapal Maritim PORTA"
            className="w-full h-full object-cover object-center scale-105 transform hover:scale-100 transition-transform duration-1000 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#071914] via-[#0B241E]/75 to-[#0B241E]/50" />
          <div className="absolute inset-0 bg-[#0B241E]/20 backdrop-blur-[1px]" />
        </div>

        {/* Top Header & Brand Anchor */}
        <div className="relative z-10 p-6 md:p-8 lg:p-10 space-y-3">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#0B241E]/90 border border-[#2A6553] p-1.5 flex items-center justify-center shadow-lg shadow-black/40 backdrop-blur-xs shrink-0">
              <img
                src="/brand/symbol-white.svg"
                alt="Logo Resmi PORTA"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <span className="font-black text-2xl tracking-wider text-white drop-shadow-sm font-sans">
                PORTA
              </span>
              <span className="block text-[9.5px] font-mono tracking-widest text-[#A3BFB5] uppercase -mt-0.5">
                Sistem Pengelolaan Pelabuhan &amp; Penerimaan Daerah
              </span>
            </div>
          </div>
        </div>

        {/* Center / Middle: High-Impact Typography & Mission */}
        <div className="relative z-10 p-6 md:p-8 lg:p-10 space-y-3 my-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/15 text-[#67E8F9] text-xs font-semibold shadow-xs">
            <Waves className="w-3.5 h-3.5 text-[#06B6D4] animate-pulse" />
            <span>Integrasi Pelabuhan Regional & Kas Daerah</span>
          </div>
          <h1 className="text-2xl lg:text-3xl xl:text-4xl font-black tracking-tight text-white leading-tight drop-shadow-md">
            Gerbang Terpadu Otoritas Pelabuhan & Penerimaan Daerah.
          </h1>
          <p className="text-xs lg:text-sm text-[#E2E8F0]/90 leading-relaxed max-w-md drop-shadow">
            Sistem terintegrasi tata kelola armada, verifikasi keselamatan manifes SOLAS, alokasi dermaga, dan kepatuhan retribusi daerah amanat PP No. 35/2023.
          </p>
        </div>
      </aside>

      {/* ========================================================= */}
      {/* 2. LAYER KANAN: 3 KANAL AKSES OTORITAS & OPERATOR          */}
      {/* ========================================================= */}
      <main className="flex-1 h-full max-h-full overflow-y-auto flex flex-col justify-between p-6 sm:p-8 lg:p-10 relative bg-[#F8FAF9]">
        <div className="w-full max-w-4xl mx-auto space-y-6 my-auto">
          {/* Section Header */}
          <div className="border-b border-slate-200/80 pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#0B241E]/10 text-[#0B241E] text-[10px] font-mono font-bold uppercase tracking-wider mb-2">
                <Sparkles className="w-3 h-3 text-[#D97706]" />
                <span>Pintu Masuk Otoritas &amp; Operator</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[#0B241E] tracking-tight">
                Pilih Kanal Akses Otoritas
              </h2>
              <p className="text-xs sm:text-sm text-[#52635B] mt-1 leading-relaxed">
                Klik salah satu kanal peran di bawah ini untuk langsung masuk ke antarmuka dan dashboard yang dituju.
              </p>
            </div>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#D97706] hover:bg-[#B45309] text-[#0B241E] hover:text-white transition-all shadow-sm shrink-0 cursor-pointer self-start sm:self-auto group"
            >
              <Ship className="w-4 h-4 stroke-[2.2] group-hover:scale-105 transition-transform" />
              <span>Daftar Perusahaan Kapal</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* 4 Interactive Direct Access Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {ROLES.map((role) => {
              const IconComponent = role.icon;
              const isSelected = navigatingRole === role.id;

              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => handleSelectRole(role.id)}
                  disabled={navigatingRole !== null}
                  className={`text-left p-5 rounded-2xl transition-all cursor-pointer flex flex-col justify-between group relative border bg-white ${
                    isSelected
                      ? "border-[#0B241E] shadow-xl ring-2 ring-[#0B241E]/20 scale-[0.99]"
                      : "border-slate-200/90 hover:border-[#0B241E] hover:shadow-lg hover:scale-[1.01] shadow-xs"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between w-full">
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold shrink-0 shadow-sm transition-transform group-hover:scale-105 ${role.accentBg}`}
                      >
                        <IconComponent className="w-5 h-5 stroke-[2.2]" />
                      </div>
                      <span className="text-[10px] font-mono font-bold text-[#64748B] bg-slate-100 px-2 py-0.5 rounded-full">
                        KANAL {role.code}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-mono uppercase font-bold text-[#D97706] tracking-wider block">
                        {role.tag}
                      </span>
                      <h3 className="text-sm font-extrabold text-[#0B241E] group-hover:text-[#0B241E] transition-colors mt-0.5">
                        {role.title}
                      </h3>
                      <p className="text-[11px] font-semibold text-[#0284C7] mt-0.5">
                        {role.scope}
                      </p>
                    </div>

                    <p className="text-xs text-[#64748B] leading-relaxed line-clamp-3">
                      {role.summary}
                    </p>
                  </div>

                  <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#0B241E]">
                    <span className="text-[11px] group-hover:underline">
                      {isSelected ? "Membuka Portal..." : `Masuk ke ${role.destinationLabel}`}
                    </span>
                    <div className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-[#0B241E] group-hover:text-white flex items-center justify-center transition-colors">
                      {isSelected ? (
                        <span className="w-3.5 h-3.5 border-2 border-[#0B241E] border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Layanan Penumpang / Publik Access Link */}
          <div className="pt-2 pb-1 text-center">
            <p className="text-xs text-[#64748B]">
              Mencari jadwal penyeberangan atau tiket kapal publik?{" "}
              <button
                type="button"
                onClick={() => handleSelectRole("penumpang")}
                className="font-bold text-[#0284C7] hover:underline cursor-pointer inline-flex items-center gap-1"
              >
                <span>Buka Portal Penumpang</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </p>
          </div>

          {/* Minimalist Footer */}
          <div className="pt-4 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-[#64748B] gap-2">
            <p>© 2026 PORTA • Kementerian Perhubungan & Bapenda</p>
            <div className="flex items-center gap-3">
              <span className="text-[#0B241E] font-medium">Helpdesk: (0254) 571-008</span>
              <span>•</span>
              <span className="text-[#0B241E] font-medium">PP No. 35/2023</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
