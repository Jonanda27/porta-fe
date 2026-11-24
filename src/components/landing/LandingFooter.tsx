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
                  UPTD PELABUHAN REGIONAL
                </span>
              </div>
            </div>

            <p className="text-slate-400 text-xs leading-relaxed">
              Sistem Pengelolaan Pelabuhan dan Penerimaan Daerah Terintegrasi berbasis cloud
              untuk pelabuhan penyeberangan, logistik perintis, dan pemanfaatan barang milik
              daerah.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase text-[#D97706] tracking-wider">
              Portal Pemangku Kepentingan
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <Link href="/dinas/dashboard" className="hover:text-white transition-colors">
                  Dinas Perhubungan &amp; Bapenda
                </Link>
              </li>
              <li>
                <Link href="/upt/dashboard" className="hover:text-white transition-colors">
                  Otoritas Pelabuhan (UPTD)
                </Link>
              </li>
              <li>
                <Link href="/kapal/dashboard" className="hover:text-white transition-colors">
                  Perusahaan Pelayaran &amp; Operator
                </Link>
              </li>
              <li>
                <Link href="/tenant" className="hover:text-white transition-colors">
                  Mitra Tenant &amp; Sewa BMD
                </Link>
              </li>
              <li>
                <Link href="/penumpang/beranda" className="hover:text-white transition-colors">
                  Portal Masyarakat &amp; Tiket
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase text-[#D97706] tracking-wider">
              Layanan Operasional
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <Link href="/upt/alokasi" className="hover:text-white transition-colors">
                  Meja Alokasi Slot Dermaga
                </Link>
              </li>
              <li>
                <Link href="/upt/kapal" className="hover:text-white transition-colors">
                  Buku Log Sandar &amp; Manifes
                </Link>
              </li>
              <li>
                <Link href="/upt/tiket" className="hover:text-white transition-colors">
                  Gerbang Tiket QR Porporasi
                </Link>
              </li>
              <li>
                <Link href="/upt/shift" className="hover:text-white transition-colors">
                  Rekonsiliasi Sif &amp; BAST 1x24 Jam
                </Link>
              </li>
              <li>
                <Link href="/tenant/sewa" className="hover:text-white transition-colors">
                  Katalog Ruang Usaha Terminal
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase text-[#D97706] tracking-wider">
              Kantor Otoritas Pelabuhan
            </h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              Gedung Operasional Terpadu UPTD Pelabuhan Penyeberangan Merak, Banten /
              Pomako, Mimika.
            </p>
            <div className="space-y-1 font-mono text-[11px] text-[#BED2CA]">
              <p>Radio Maritim: VHF Channel 16</p>
              <p>Email: syahbandar@porta.go.id</p>
              <p>Jam Operasional: 24 Jam (Sif 1 - 3)</p>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-[#143E33] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>
            © 2026 PORTA • Hak Cipta Dilindungi Undang-Undang. Pemerintah Daerah &amp;
            Otoritas Pelabuhan.
          </p>
          <div className="flex items-center gap-4">
            <span>PP 35/2023 Compliant</span>
            <span>•</span>
            <span>Perbup Mimika 25/2024</span>
            <span>•</span>
            <span>Bank Papua Integrated</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
