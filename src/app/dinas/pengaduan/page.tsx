"use client";

import React, { useState } from "react";
import {
  MessageSquare,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Send,
  Filter,
} from "lucide-react";

export default function DinasPengaduanPage() {
  const [complaintFilter, setComplaintFilter] = useState<string>("all");

  return (
    <div className="space-y-6">
      {/* 1. OVERLAPPING PENGADUAN & LAYANAN KPI CARDS (Spesifik: Pelayanan Publik) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Laporan */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-full">
              -14% vs Okt
            </span>
          </div>
          <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mt-3">
            Total Laporan Masuk
          </p>
          <p className="text-xl font-extrabold text-[#0B241E] font-mono mt-1">
            42 Laporan
          </p>
          <p className="text-[11px] text-[#64748B] mt-1.5">
            Portal publik, loket & posko fisik
          </p>
        </div>

        {/* Card 2: Selesai dalam SLA */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-full">
              SLA 92.8%
            </span>
          </div>
          <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mt-3">
            Selesai Tepat Waktu
          </p>
          <p className="text-xl font-extrabold text-emerald-700 font-mono mt-1">
            39 Kasus
          </p>
          <p className="text-[11px] text-[#64748B] mt-1.5">
            Diselesaikan dalam &lt; 24 jam
          </p>
        </div>

        {/* Card 3: Sedang Ditangani */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Clock className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-100/60 px-2 py-0.5 rounded-full">
              Batas &lt; 4 Jam
            </span>
          </div>
          <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mt-3">
            Dalam Proses UPTD
          </p>
          <p className="text-xl font-extrabold text-amber-700 font-mono mt-1">
            2 Kasus
          </p>
          <p className="text-[11px] text-[#64748B] mt-1.5">
            Petugas lapangan sedang investigasi
          </p>
        </div>

        {/* Card 4: Eskalasi Pimpinan */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-mono font-bold text-rose-700 bg-rose-100/60 px-2 py-0.5 rounded-full">
              Perlu Arahan
            </span>
          </div>
          <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mt-3">
            Disposisi Kadis
          </p>
          <p className="text-xl font-extrabold text-rose-700 font-mono mt-1">
            1 Laporan
          </p>
          <p className="text-[11px] text-rose-700 font-semibold mt-1.5">
            Eskalasi kebijakan fasilitas publik
          </p>
        </div>
      </div>

      {/* 2. Complaints Log Table */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-extrabold text-[#0B241E]">
              Log Laporan & Pengaduan Pelayanan Publik
            </h3>
            <p className="text-xs text-[#64748B]">
              Pengaduan yang masuk dari portal publik, gate ticketing, serta posko pengaduan fisik pelabuhan.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setComplaintFilter("all")}
              className={`px-3 py-1 rounded text-xs font-bold cursor-pointer ${
                complaintFilter === "all" ? "bg-[#0B241E] text-white" : "bg-[#F1F5F9] text-[#64748B]"
              }`}
            >
              Semua
            </button>
            <button
              type="button"
              onClick={() => setComplaintFilter("active")}
              className={`px-3 py-1 rounded text-xs font-bold cursor-pointer ${
                complaintFilter === "active" ? "bg-[#0B241E] text-white" : "bg-[#F1F5F9] text-[#64748B]"
              }`}
            >
              Perlu Tindakan
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] text-[#475569] font-bold border-b border-[#E2E8F0]">
              <tr>
                <th className="py-3 px-4">Tiket ID</th>
                <th className="py-3 px-4">Waktu & Saluran</th>
                <th className="py-3 px-4">Nama Pelapor</th>
                <th className="py-3 px-4">Kategori Kendala</th>
                <th className="py-3 px-4">UPTD Terkait</th>
                <th className="py-3 px-4 text-center">Status SLA</th>
                <th className="py-3 px-4 text-center">Aksi Disposisi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {/* Ticket 1 */}
              <tr className="hover:bg-[#F8FAFC]">
                <td className="py-3.5 px-4 font-mono font-bold text-[#0B241E]">
                  #PGD-2026-118
                </td>
                <td className="py-3.5 px-4">
                  <p className="font-bold text-[#0B241E]">Hari Ini, 09:15</p>
                  <span className="text-[10px] text-[#64748B]">Portal Mobile QR</span>
                </td>
                <td className="py-3.5 px-4 font-medium">Budi Santoso (Penumpang)</td>
                <td className="py-3.5 px-4">
                  <p className="font-bold text-[#0B241E]">Kendala Pindai QR Gate Dermaga 2</p>
                  <p className="text-[11px] text-[#64748B]">Barcode pas masuk tidak terbaca scanner gate otomatis.</p>
                </td>
                <td className="py-3.5 px-4 font-semibold text-[#0B241E]">UPTD Merak</td>
                <td className="py-3.5 px-4 text-center">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                    Sedang Dikerjakan (1 Jam)
                  </span>
                </td>
                <td className="py-3.5 px-4 text-center">
                  <button
                    type="button"
                    onClick={() => alert("Status pengaduan diarahkan ke Teknisi IT UPTD Merak.")}
                    className="px-2.5 py-1 bg-[#0B241E] hover:bg-[#164336] text-white rounded text-[11px] font-bold cursor-pointer"
                  >
                    Pantau Solusi
                  </button>
                </td>
              </tr>

              {/* Ticket 2 */}
              <tr className="hover:bg-[#F8FAFC]">
                <td className="py-3.5 px-4 font-mono font-bold text-[#0B241E]">
                  #PGD-2026-114
                </td>
                <td className="py-3.5 px-4">
                  <p className="font-bold text-[#0B241E]">Hari Ini, 07:30</p>
                  <span className="text-[10px] text-[#64748B]">WhatsApp BOT Layanan</span>
                </td>
                <td className="py-3.5 px-4 font-medium">PT Lintas Bahari (Operator)</td>
                <td className="py-3.5 px-4">
                  <p className="font-bold text-[#0B241E]">Keterlambatan Clearance SPB Dermaga 1</p>
                  <p className="text-[11px] text-[#64748B]">Petugas jaga verifikasi manifes terlambat 25 menit.</p>
                </td>
                <td className="py-3.5 px-4 font-semibold text-[#0B241E]">UPTD Bakauheni</td>
                <td className="py-3.5 px-4 text-center">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                    Eskalasi Kadis
                  </span>
                </td>
                <td className="py-3.5 px-4 text-center">
                  <button
                    type="button"
                    onClick={() => alert("Mengirimkan Nota Disposisi Pembinaan Disiplin Petugas ke Kepala UPTD Bakauheni.")}
                    className="px-2.5 py-1 bg-[#D97706] hover:bg-[#B45309] text-[#0B241E] rounded text-[11px] font-bold cursor-pointer"
                  >
                    Beri Disposisi
                  </button>
                </td>
              </tr>

              {/* Ticket 3 */}
              <tr className="hover:bg-[#F8FAFC]">
                <td className="py-3.5 px-4 font-mono font-bold text-[#0B241E]">
                  #PGD-2026-102
                </td>
                <td className="py-3.5 px-4">
                  <p className="font-bold text-[#0B241E]">Kemarin, 16:40</p>
                  <span className="text-[10px] text-[#64748B]">Posko Layanan Fisik</span>
                </td>
                <td className="py-3.5 px-4 font-medium">Siti Rahma (Supir Logistik)</td>
                <td className="py-3.5 px-4">
                  <p className="font-bold text-[#0B241E]">Klarifikasi Tarif Pas Masuk Truk Gol IVA</p>
                  <p className="text-[11px] text-[#64748B]">Sudah dijelaskan sesuai Perda tarif resmi PP No. 35/2023.</p>
                </td>
                <td className="py-3.5 px-4 font-semibold text-[#0B241E]">UPTD Merak</td>
                <td className="py-3.5 px-4 text-center">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Selesai (Ditutup)
                  </span>
                </td>
                <td className="py-3.5 px-4 text-center">
                  <span className="text-[#64748B] text-[11px]">Tidak ada aksi</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
