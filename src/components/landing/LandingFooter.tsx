"use client";

import React from "react";
import Link from "next/link";

export function LandingFooter() {
  return (
    <footer className="bg-[#071915] text-white border-t border-[#143E33] pt-14 pb-8 px-4 sm:px-8 text-xs">
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <img
                src="/brand/symbol-white.svg"
                alt="PORTA"
                className="w-8 h-8 object-contain"
              />
              <div>
                <span className="text-base font-extrabold tracking-wider text-white">
                  PORTA
                </span>
                <span className="block text-[9px] font-mono text-[#85A69B]">
                  PELABUHAN UMUM POUMAKO
                </span>
              </div>
            </div>

            <p className="text-slate-400 text-xs leading-relaxed">
              Sistem Pengelolaan Pelabuhan dan Penerimaan Daerah Terintegrasi Kabupaten Mimika untuk pelayanan kapal, penumpang, dan pemanfaatan aset BMD.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase text-[#F59E0B] tracking-wider">
              Navigasi Layanan
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <a href="#alur-layanan" className="hover:text-white transition-colors">
                  Alur Layanan Terintegrasi
                </a>
              </li>
              <li>
                <a href="#live-harbor" className="hover:text-white transition-colors">
                  Papan Jadwal Sandar Poumako
                </a>
              </li>
              <li>
                <a href="#kalkulator-tarif" className="hover:text-white transition-colors">
                  Kalkulator Estimasi Retribusi
                </a>
              </li>
              <li>
                <a href="#keunggulan" className="hover:text-white transition-colors">
                  Tata Kelola &amp; Regulasi
                </a>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  Masuk Portal Petugas &amp; Mitra
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase text-[#F59E0B] tracking-wider">
              Akses Cepat Publik
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <Link href="/penumpang/jadwal" className="hover:text-white transition-colors">
                  Jadwal Keberangkatan Kapal
                </Link>
              </li>
              <li>
                <Link href="/penumpang/tarif" className="hover:text-white transition-colors">
                  Tarif Resmi Retribusi Pelabuhan
                </Link>
              </li>
              <li>
                <Link href="/penumpang/tiket" className="hover:text-white transition-colors">
                  Pemesanan Karcis Terminal
                </Link>
              </li>
              <li>
                <Link href="/penumpang/pengaduan" className="hover:text-white transition-colors">
                  Kanal Pengaduan Layanan
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-white transition-colors">
                  Pendaftaran Mitra Kapal &amp; Tenant
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase text-[#F59E0B] tracking-wider">
              Kantor Otoritas Pelabuhan
            </h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              Gedung Operasional Terpadu Pelabuhan Umum Poumako, Distrik Mimika Timur, Kabupaten Mimika, Papua Tengah.
            </p>
            <div className="space-y-1 font-mono text-[11px] text-[#BED2CA]">
              <p>Radio Maritim: VHF Channel 16</p>
              <p>Email: syahbandar@porta.mimikakab.go.id</p>
              <p>Operasional: 24 Jam (Sif 1 – 3 WIT)</p>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-[#143E33] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>
            © 2026 PORTA — Pemerintah Kabupaten Mimika &amp; Otoritas Pelabuhan Umum Poumako.
          </p>
          <div className="flex items-center gap-3">
            <span>PP 35/2023 Compliant</span>
            <span className="text-white/20">|</span>
            <span>Perbup Mimika 25/2024</span>
            <span className="text-white/20">|</span>
            <span>Bank Papua Integrated</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
