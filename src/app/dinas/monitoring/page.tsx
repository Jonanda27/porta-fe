"use client";

import React from "react";
import {
  Download,
  Receipt,
  FileCheck2,
  ShieldCheck,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Scale,
} from "lucide-react";

export default function DinasMonitoringPage() {
  return (
    <div className="space-y-6">
      {/* 1. OVERLAPPING MONITORING KPI CARDS (Spesifik: Realisasi & Piutang) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Target APBD */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <DollarSign className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-100/60 px-2 py-0.5 rounded-full">
              Perda No. 1/2026
            </span>
          </div>
          <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mt-3">
            Target APBD 2026
          </p>
          <p className="text-xl font-extrabold text-[#0B241E] font-mono mt-1">
            Rp 2,45 Miliar
          </p>
          <p className="text-[11px] text-[#64748B] mt-1.5">
            Alokasi 4 UPTD Pelabuhan Daerah
          </p>
        </div>

        {/* Card 2: Realisasi PAD YTD */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-full">
              75.1% Tercapai
            </span>
          </div>
          <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mt-3">
            Realisasi Kumulatif
          </p>
          <p className="text-xl font-extrabold text-emerald-700 font-mono mt-1">
            Rp 1,84 Miliar
          </p>
          <p className="text-[11px] text-[#64748B] mt-1.5">
            Tersinkronisasi Host-to-Host Kasda
          </p>
        </div>

        {/* Card 3: Piutang Tertunggak */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Receipt className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-100/60 px-2 py-0.5 rounded-full flex items-center gap-0.5">
              <AlertTriangle className="w-3 h-3" />
              3 SKRD
            </span>
          </div>
          <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mt-3">
            Piutang Tertunggak
          </p>
          <p className="text-xl font-extrabold text-amber-700 font-mono mt-1">
            Rp 14,32 Jt
          </p>
          <p className="text-[11px] text-amber-700 font-semibold mt-1.5">
            Denda berjalan 2% / bln (PP 35)
          </p>
        </div>

        {/* Card 4: Kepatuhan Segregasi PP 35/2023 */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
              <Scale className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-mono font-bold text-purple-700 bg-purple-100/60 px-2 py-0.5 rounded-full">
              PP 35/2023
            </span>
          </div>
          <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mt-3">
            Segregasi 3-Pihak
          </p>
          <p className="text-xl font-extrabold text-[#0B241E] font-mono mt-1">
            100% Sesuai
          </p>
          <p className="text-[11px] text-[#64748B] mt-1.5">
            Hak Pemda, Operator & Mitra klir
          </p>
        </div>
      </div>

      {/* 2. Header Box */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-extrabold text-[#0B241E]">
            Rekapitulasi Sumber Pendapatan Asli Daerah (PAD)
          </h2>
          <p className="text-xs text-[#64748B] mt-1">
            Pengawasan rincian objek retribusi sesuai regulasi PP No. 35/2023 dan pemisahan hak bagi hasil pelabuhan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => alert("Mengekspor Berita Acara Rekonsiliasi Piutang Retribusi...")}
            className="px-3.5 py-2 bg-[#0B241E] hover:bg-[#164336] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Unduh Rekapitulasi (Excel)</span>
          </button>
        </div>
      </div>

      {/* Data Table: Rincian Objek Retribusi */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-[#0B241E]">
            Matriks Objek Retribusi Pelabuhan (PP No. 35/2023)
          </h3>
          <span className="text-xs font-mono text-[#64748B]">Tahun Anggaran 2026</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] text-[#475569] font-bold border-b border-[#E2E8F0]">
              <tr>
                <th className="py-3 px-4">Objek Retribusi</th>
                <th className="py-3 px-4">Dasar Regulasi</th>
                <th className="py-3 px-4 text-right">Target APBD (Thn)</th>
                <th className="py-3 px-4 text-right">Realisasi (YTD)</th>
                <th className="py-3 px-4 text-center">Capaian</th>
                <th className="py-3 px-4 text-right">Piutang Berjalan</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-[#1E2922]">
              <tr className="hover:bg-[#F8FAFC]">
                <td className="py-3.5 px-4 font-bold text-[#0B241E]">
                  Jasa Tambat Kapal (Dermaga Pelabuhan)
                </td>
                <td className="py-3.5 px-4 font-mono text-[11px] text-[#64748B]">PP 35/2023 Ps. 88 (a)</td>
                <td className="py-3.5 px-4 text-right font-mono">Rp 650.000.000</td>
                <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-700">Rp 582.400.000</td>
                <td className="py-3.5 px-4 text-center font-bold text-emerald-700">89.6%</td>
                <td className="py-3.5 px-4 text-right font-mono text-amber-700">Rp 5.450.000</td>
                <td className="py-3.5 px-4 text-center">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Sangat Baik
                  </span>
                </td>
              </tr>

              <tr className="hover:bg-[#F8FAFC]">
                <td className="py-3.5 px-4 font-bold text-[#0B241E]">
                  Jasa Labuh & Pemanduan Perairan
                </td>
                <td className="py-3.5 px-4 font-mono text-[11px] text-[#64748B]">PP 35/2023 Ps. 88 (b)</td>
                <td className="py-3.5 px-4 text-right font-mono">Rp 220.000.000</td>
                <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-700">Rp 195.800.000</td>
                <td className="py-3.5 px-4 text-center font-bold text-emerald-700">89.0%</td>
                <td className="py-3.5 px-4 text-right font-mono text-[#64748B]">Rp 0</td>
                <td className="py-3.5 px-4 text-center">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Lunas
                  </span>
                </td>
              </tr>

              <tr className="hover:bg-[#F8FAFC]">
                <td className="py-3.5 px-4 font-bold text-[#0B241E]">
                  Pas Masuk Pelabuhan (Penumpang Orang)
                </td>
                <td className="py-3.5 px-4 font-mono text-[11px] text-[#64748B]">PP 35/2023 Ps. 91</td>
                <td className="py-3.5 px-4 text-right font-mono">Rp 480.000.000</td>
                <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-700">Rp 421.300.000</td>
                <td className="py-3.5 px-4 text-center font-bold text-emerald-700">87.7%</td>
                <td className="py-3.5 px-4 text-right font-mono text-[#64748B]">Rp 0 (Cashless)</td>
                <td className="py-3.5 px-4 text-center">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Otomatis QR
                  </span>
                </td>
              </tr>

              <tr className="hover:bg-[#F8FAFC]">
                <td className="py-3.5 px-4 font-bold text-[#0B241E]">
                  Pas Masuk Kendaraan (Gol IV - VIII)
                </td>
                <td className="py-3.5 px-4 font-mono text-[11px] text-[#64748B]">PP 35/2023 Ps. 92</td>
                <td className="py-3.5 px-4 text-right font-mono">Rp 340.000.000</td>
                <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-700">Rp 298.600.000</td>
                <td className="py-3.5 px-4 text-center font-bold text-emerald-700">87.8%</td>
                <td className="py-3.5 px-4 text-right font-mono text-amber-700">Rp 2.100.000</td>
                <td className="py-3.5 px-4 text-center">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                    1 Truk Tertunda
                  </span>
                </td>
              </tr>

              <tr className="hover:bg-[#F8FAFC]">
                <td className="py-3.5 px-4 font-bold text-[#0B241E]">
                  Pemanfaatan Kios Kuliner & Retail
                </td>
                <td className="py-3.5 px-4 font-mono text-[11px] text-[#64748B]">PP 35/2023 Ps. 95 (Aset)</td>
                <td className="py-3.5 px-4 text-right font-mono">Rp 120.000.000</td>
                <td className="py-3.5 px-4 text-right font-mono font-bold text-[#0B241E]">Rp 96.500.000</td>
                <td className="py-3.5 px-4 text-center font-bold text-amber-700">80.4%</td>
                <td className="py-3.5 px-4 text-right font-mono text-rose-700">Rp 6.770.000</td>
                <td className="py-3.5 px-4 text-center">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                    Butuh Teguran
                  </span>
                </td>
              </tr>

              <tr className="hover:bg-[#F8FAFC]">
                <td className="py-3.5 px-4 font-bold text-[#0B241E]">
                  Utilitas Pelabuhan (Air Bersih & Listrik Sandar)
                </td>
                <td className="py-3.5 px-4 font-mono text-[11px] text-[#64748B]">PP 35/2023 Ps. 98 (Utilitas)</td>
                <td className="py-3.5 px-4 text-right font-mono">Rp 180.000.000</td>
                <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-700">Rp 152.400.000</td>
                <td className="py-3.5 px-4 text-center font-bold text-emerald-700">84.7%</td>
                <td className="py-3.5 px-4 text-right font-mono text-[#64748B]">Rp 0</td>
                <td className="py-3.5 px-4 text-center">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    e-Meter Valid
                  </span>
                </td>
              </tr>

              <tr className="hover:bg-[#F8FAFC]">
                <td className="py-3.5 px-4 font-bold text-[#0B241E]">
                  Kerja Sama Pemanfaatan Usaha (KSP / Reklame)
                </td>
                <td className="py-3.5 px-4 font-mono text-[11px] text-[#64748B]">PP 35/2023 Ps. 102 (KSP)</td>
                <td className="py-3.5 px-4 text-right font-mono">Rp 90.000.000</td>
                <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-700">Rp 76.500.000</td>
                <td className="py-3.5 px-4 text-center font-bold text-emerald-700">85.0%</td>
                <td className="py-3.5 px-4 text-right font-mono text-[#64748B]">Rp 0</td>
                <td className="py-3.5 px-4 text-center">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Kontrak Aktif
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Peringatan Dini Pendapatan (Fitur Nilai Tambah: Deteksi Anomali Otomatis) */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#D97706]" />
            <div>
              <h3 className="text-sm font-extrabold text-[#0B241E]">
                Peringatan Dini Pendapatan (Deteksi Anomali Otomatis)
              </h3>
              <p className="text-xs text-[#64748B] mt-0.5">
                Sistem PORTA secara proaktif mendeteksi potensi kebocoran penerimaan sebelum terjadi kerugian PAD.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-md font-bold">
            3 Anomali Terdeteksi
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Anomali 1 */}
          <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-800 font-mono text-[10px] bg-amber-100 px-2 py-0.5 rounded">
                OPERASIONAL KAPAL
              </span>
              <span className="text-[10px] text-amber-700 font-semibold">Tersisa 30 Mnt</span>
            </div>
            <p className="font-bold text-[#0B241E] text-xs">Kunjungan Kapal Tanpa Tagihan</p>
            <p className="text-[#64748B] text-[11px] leading-relaxed">
              KMP Dharma Rucitra di UPTD Merak (Dermaga 2) telah sandar 180 menit tanpa invoice jasa tambat terbit di e-SKRD.
            </p>
            <div className="pt-2 border-t border-amber-200/60 flex justify-end">
              <button
                type="button"
                onClick={() => alert("Mengirimkan notifikasi tagihan paksa ke Syahbandar UPTD Merak.")}
                className="text-[11px] font-bold text-amber-800 hover:underline cursor-pointer"
              >
                Terbitkan Tagihan →
              </button>
            </div>
          </div>

          {/* Anomali 2 */}
          <div className="p-4 bg-purple-50/50 border border-purple-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-purple-800 font-mono text-[10px] bg-purple-100 px-2 py-0.5 rounded">
                ASET & KIOS
              </span>
              <span className="text-[10px] text-purple-700 font-semibold">H-14 Jatuh Tempo</span>
            </div>
            <p className="font-bold text-[#0B241E] text-xs">Kontrak Aktif Tanpa Penagihan</p>
            <p className="text-[#64748B] text-[11px] leading-relaxed">
              Kios Kuliner B-04 (Pujasera Bakauheni) berakhir masa sewanya dalam 14 hari. Sistem belum menerima bukti perpanjangan sewa.
            </p>
            <div className="pt-2 border-t border-purple-200/60 flex justify-end">
              <button
                type="button"
                onClick={() => alert("Menerbitkan Surat Pemberitahuan (SP-1) ke Penyewa Kios B-04.")}
                className="text-[11px] font-bold text-purple-800 hover:underline cursor-pointer"
              >
                Kirim SP-1 →
              </button>
            </div>
          </div>

          {/* Anomali 3 */}
          <div className="p-4 bg-rose-50/50 border border-rose-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-rose-800 font-mono text-[10px] bg-rose-100 px-2 py-0.5 rounded">
                UTILITAS DERMAGA
              </span>
              <span className="text-[10px] text-rose-700 font-semibold">Belum Terbayar</span>
            </div>
            <p className="font-bold text-[#0B241E] text-xs">Penggunaan Utilitas Tanpa Bayar</p>
            <p className="text-[#64748B] text-[11px] leading-relaxed">
              Bunkering air tawar Dermaga 3 Ketapang mencatat pemakaian 12 Ton air oleh kapal swasta belum diverifikasi status e-SKRD-nya.
            </p>
            <div className="pt-2 border-t border-rose-200/60 flex justify-end">
              <button
                type="button"
                onClick={() => alert("Memblokir pengisian utilitas otomatis dan menerbitkan invoice pembayaran.")}
                className="text-[11px] font-bold text-rose-800 hover:underline cursor-pointer"
              >
                Klarifikasi UPTD →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Pemantauan Hak Penerimaan (PP 35/2023 Segregation) */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
          <div>
            <h3 className="text-sm font-extrabold text-[#0B241E]">
              Transparansi Pemisahan Hak Penerimaan (PP 35/2023)
            </h3>
            <p className="text-xs text-[#64748B] mt-0.5">
              Pemisahan otomatis antara penerimaan kas daerah (Pemda), hak operator kapal, dan mitra perbankan.
            </p>
          </div>
          <span className="text-xs font-mono bg-emerald-50 text-emerald-800 px-3 py-1 rounded-md font-bold">
            Audit Clean (Zero Leakage)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg">
            <p className="text-xs font-bold text-[#0B241E]">1. Hak Kas Daerah (Pemda Banten)</p>
            <p className="text-xl font-extrabold font-mono text-emerald-700 mt-2">100% Retribusi</p>
            <p className="text-[11px] text-[#64748B] mt-1">
              Pas masuk orang, pas kendaraan, dan jasa labuh/tambat langsung masuk ke RKUD.
            </p>
          </div>

          <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg">
            <p className="text-xs font-bold text-[#0B241E]">2. Hak Operator Kapal (ASDP/Swasta)</p>
            <p className="text-xl font-extrabold font-mono text-[#0B241E] mt-2">Tarif Angkutan</p>
            <p className="text-[11px] text-[#64748B] mt-1">
              Komponen tiket penyeberangan murni displit langsung ke escrow account perusahaan kapal.
            </p>
          </div>

          <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg">
            <p className="text-xs font-bold text-[#0B241E]">3. Iuran Wajib Asuransi (Jasa Raharja)</p>
            <p className="text-xl font-extrabold font-mono text-[#0B241E] mt-2">Premi Terlindungi</p>
            <p className="text-[11px] text-[#64748B] mt-1">
              Asuransi jiwa penumpang resmi disalurkan otomatis per manifes clearance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
