"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Ship,
  Calendar,
  Truck,
  Clock,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Radio,
  ChevronRight,
  Anchor,
  ShieldCheck,
  Waves,
  ArrowUpRight,
  Eye,
  FileCheck2,
} from "lucide-react";

export default function UptDashboardPage() {
  const [selectedDock, setSelectedDock] = useState<string>("all");

  return (
    <div className="space-y-6">
      {/* 1. OVERLAPPING OPERATIONAL KPI CARDS (Pusat Komando UPT) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Jadwal Hari Ini */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Calendar className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-100/60 px-2 py-0.5 rounded-full">
              18 Tepat Waktu
            </span>
          </div>
          <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mt-3">
            Jadwal Pelayaran Hari Ini
          </p>
          <p className="text-xl font-extrabold text-[#0B241E] font-mono mt-1">
            24 Jadwal
          </p>
          <p className="text-[11px] text-[#64748B] mt-1.5 flex items-center gap-1">
            <span>Delay Cuaca:</span>
            <strong className="text-amber-700">1 Kapal</strong>
          </p>
        </div>

        {/* KPI 2: Kapal Bersandar */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Ship className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-full">
              80% Dermaga Terisi
            </span>
          </div>
          <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mt-3">
            Kapal Sandar Real-Time
          </p>
          <p className="text-xl font-extrabold text-[#0B241E] font-mono mt-1">
            4 Kapal Aktif
          </p>
          <p className="text-[11px] text-[#64748B] mt-1.5">
            Dermaga 1, 2, 3 terisi • Dermaga 4 standby
          </p>
        </div>

        {/* KPI 3: Antrean Kendaraan */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Truck className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-100/60 px-2 py-0.5 rounded-full">
              Waktu Tunggu 18 Mnt
            </span>
          </div>
          <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mt-3">
            Antrean Kendaraan Kantong Parkir
          </p>
          <p className="text-xl font-extrabold text-[#0B241E] font-mono mt-1">
            142 Unit
          </p>
          <p className="text-[11px] text-[#64748B] mt-1.5">
            86 Gol IV (Mobil) • 56 Gol V-VII (Truk)
          </p>
        </div>

        {/* KPI 4: Laporan Sif Aktif */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
              <Clock className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-mono font-bold text-purple-700 bg-purple-100/60 px-2 py-0.5 rounded-full">
              Sif 1 Berjalan
            </span>
          </div>
          <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mt-3">
            Personil & Status Sif
          </p>
          <p className="text-xl font-extrabold text-[#0B241E] font-mono mt-1">
            14 Personil
          </p>
          <p className="text-[11px] text-purple-700 font-semibold mt-1.5">
            Berakhir pukul 15:00 WIB
          </p>
        </div>
      </div>

      {/* 2. LINIMASA ALOKASI DERMAGA (VISUAL GANTT CHART) */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#F1F5F9]">
          <div>
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-[#D97706] animate-pulse" />
              <h2 className="text-base font-extrabold text-[#0B241E]">
                Linimasa Alokasi & Penjadwalan Dermaga (Gantt Chart Real-Time)
              </h2>
            </div>
            <p className="text-xs text-[#64748B] mt-0.5">
              Visualisasi alokasi blok waktu sandar kapal per dermaga untuk mencegah tabrakan jadwal (*zero collision*).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-[#64748B]">Filter Dermaga:</span>
            <select
              value={selectedDock}
              onChange={(e) => setSelectedDock(e.target.value)}
              className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg px-2.5 py-1 text-xs font-semibold text-[#0B241E] focus:outline-none cursor-pointer"
            >
              <option value="all">Semua Dermaga (1-4)</option>
              <option value="1">Dermaga 1</option>
              <option value="2">Dermaga 2</option>
              <option value="3">Dermaga 3</option>
              <option value="4">Dermaga 4</option>
            </select>
          </div>
        </div>

        {/* Visual Timeline Hours Header */}
        <div className="overflow-x-auto">
          <div className="min-w-[800px] space-y-3">
            {/* Hour Markers */}
            <div className="grid grid-cols-9 text-center text-[11px] font-mono font-bold text-[#64748B] border-b border-[#CBD5E1] pb-2">
              <span>07:00</span>
              <span>08:00</span>
              <span>09:00</span>
              <span>10:00</span>
              <span>11:00</span>
              <span>12:00</span>
              <span>13:00</span>
              <span>14:00</span>
              <span>15:00</span>
            </div>

            {/* Row Dermaga 1 */}
            {(selectedDock === "all" || selectedDock === "1") && (
              <div className="flex items-center gap-3">
                <div className="w-24 shrink-0 font-extrabold text-xs text-[#0B241E] flex items-center gap-1.5">
                  <Anchor className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Dermaga 1</span>
                </div>
                <div className="flex-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg h-12 relative p-1">
                  {/* Ship Schedule Block 1: 08:00 - 09:30 */}
                  <div
                    className="absolute left-[12.5%] w-[18.75%] top-1 bottom-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-md p-1.5 text-xs shadow-xs cursor-pointer transition-all flex flex-col justify-center"
                    title="KMP Baruna Jaya (08:00 - 09:30) - Status: Sandar Aktif Bongkar Muat"
                    onClick={() => alert("KMP Baruna Jaya: Sandar aktif di Dermaga 1. Manifes 210 pax, 42 kendaraan.")}
                  >
                    <span className="font-bold truncate text-[11px] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-ping" />
                      KMP Baruna Jaya
                    </span>
                    <span className="text-[9px] text-emerald-200 truncate">08:00 - 09:30 (Sandar)</span>
                  </div>

                  {/* Ship Schedule Block 2: 12:30 - 14:00 */}
                  <div
                    className="absolute left-[68.75%] w-[18.75%] top-1 bottom-1 bg-[#0B241E] hover:bg-[#164336] text-white rounded-md p-1.5 text-xs shadow-xs cursor-pointer transition-all flex flex-col justify-center"
                    title="KMP Sebuku (12:30 - 14:00) - Status: Terjadwal Sesuai SPB"
                    onClick={() => alert("KMP Sebuku: Jadwal sandar siang 12:30 WIB. Manifes terverifikasi.")}
                  >
                    <span className="font-bold truncate text-[11px]">KMP Sebuku</span>
                    <span className="text-[9px] text-[#BED2CA] truncate">12:30 - 14:00 (Terjadwal)</span>
                  </div>
                </div>
              </div>
            )}

            {/* Row Dermaga 2 */}
            {(selectedDock === "all" || selectedDock === "2") && (
              <div className="flex items-center gap-3">
                <div className="w-24 shrink-0 font-extrabold text-xs text-[#0B241E] flex items-center gap-1.5">
                  <Anchor className="w-3.5 h-3.5 text-blue-600" />
                  <span>Dermaga 2</span>
                </div>
                <div className="flex-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg h-12 relative p-1">
                  {/* Ship Schedule Block: 09:00 - 11:00 */}
                  <div
                    className="absolute left-[25%] w-[25%] top-1 bottom-1 bg-amber-600 hover:bg-amber-700 text-white rounded-md p-1.5 text-xs shadow-xs cursor-pointer transition-all flex flex-col justify-center"
                    title="KMP Dharma Rucitra (09:00 - 11:00) - Status: Memuat Kendaraan Berat"
                    onClick={() => alert("KMP Dharma Rucitra: Proses muat truk ekspedisi logistik.")}
                  >
                    <span className="font-bold truncate text-[11px] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-200 animate-ping" />
                      KMP Dharma Rucitra
                    </span>
                    <span className="text-[9px] text-amber-100 truncate">09:00 - 11:00 (Memuat)</span>
                  </div>
                </div>
              </div>
            )}

            {/* Row Dermaga 3 */}
            {(selectedDock === "all" || selectedDock === "3") && (
              <div className="flex items-center gap-3">
                <div className="w-24 shrink-0 font-extrabold text-xs text-[#0B241E] flex items-center gap-1.5">
                  <Anchor className="w-3.5 h-3.5 text-purple-600" />
                  <span>Dermaga 3</span>
                </div>
                <div className="flex-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg h-12 relative p-1">
                  {/* Ship Schedule Block: 10:00 - 12:00 */}
                  <div
                    className="absolute left-[37.5%] w-[25%] top-1 bottom-1 bg-blue-700 hover:bg-blue-800 text-white rounded-md p-1.5 text-xs shadow-xs cursor-pointer transition-all flex flex-col justify-center"
                    title="KMP Portlink III (10:00 - 12:00) - Status: Menunggu Giliran Sandar di Perairan"
                    onClick={() => alert("KMP Portlink III: Kapal labuh di perairan luar, menunggu Dermaga 3 kosong.")}
                  >
                    <span className="font-bold truncate text-[11px]">KMP Portlink III</span>
                    <span className="text-[9px] text-blue-200 truncate">10:00 - 12:00 (Antre Sandar)</span>
                  </div>
                </div>
              </div>
            )}

            {/* Row Dermaga 4 */}
            {(selectedDock === "all" || selectedDock === "4") && (
              <div className="flex items-center gap-3">
                <div className="w-24 shrink-0 font-extrabold text-xs text-[#0B241E] flex items-center gap-1.5">
                  <Anchor className="w-3.5 h-3.5 text-rose-600" />
                  <span>Dermaga 4</span>
                </div>
                <div className="flex-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg h-12 relative p-1">
                  {/* Maintenance Block: 11:30 - 14:30 */}
                  <div
                    className="absolute left-[56.25%] w-[37.5%] top-1 bottom-1 bg-rose-50 border border-rose-300 text-rose-800 rounded-md p-1.5 text-xs flex flex-col justify-center font-bold"
                    title="Inspeksi Karet Fender & Trestle - Dermaga Tidak Dapat Digunakan"
                  >
                    <span className="text-[11px] flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                      Maintenance Fender (Blokir Sementara)
                    </span>
                    <span className="text-[9px] text-rose-600 font-normal">11:30 - 14:30 WIB</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Legend and Quick Approval Bar */}
        <div className="pt-3 border-t border-[#F1F5F9] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4 text-[11px] text-[#64748B]">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-700" />
              <span>Sandar Aktif</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-amber-600" />
              <span>Sedang Memuat</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-blue-700" />
              <span>Antre di Perairan</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-rose-200 border border-rose-400" />
              <span>Pemeliharaan</span>
            </span>
          </div>

          <Link
            href="/upt/kapal"
            className="px-3.5 py-1.5 bg-[#0B241E] hover:bg-[#164336] text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span>Buka Formulir Izin Sandar (ATB)</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 3. SISTEM PERINGATAN GANGGUAN & ALERT OPERASIONAL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Warning 1: Cuaca & Gelombang (BMKG) */}
        <div className="bg-white border border-rose-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-rose-100">
              <div className="flex items-center gap-1.5 text-rose-700 font-bold text-xs">
                <Waves className="w-4 h-4" />
                <span>Peringatan Cuaca Maritim</span>
              </div>
              <span className="text-[10px] font-mono bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded">
                BMKG Selat Sunda
              </span>
            </div>
            <div className="mt-3 space-y-1">
              <p className="font-extrabold text-[#0B241E] text-sm">Angin 22 Knot • Ombak 1.8 Meter</p>
              <p className="text-[11px] text-[#64748B] leading-relaxed">
                Diperkirakan terjadi peningkatan turbulensi arus laut pukul 13:00 - 16:00 WIB. Nahkoda diwajibkan ekstra hati-hati saat olah gerak sandar Dermaga 3.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => alert("Menyiarkan Maklumat Pelayaran Cuaca ke Seluruh Radio Kapal (VHF Saluran 16).")}
            className="mt-4 w-full py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg cursor-pointer transition-colors"
          >
            Siarkan Peringatan Radio VHF →
          </button>
        </div>

        {/* Warning 2: Masalah Fasilitas Lapangan */}
        <div className="bg-white border border-amber-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-amber-100">
              <div className="flex items-center gap-1.5 text-amber-800 font-bold text-xs">
                <AlertTriangle className="w-4 h-4" />
                <span>Sensor Gate 2 Bermasalah</span>
              </div>
              <span className="text-[10px] font-mono bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded">
                Gate Truk
              </span>
            </div>
            <div className="mt-3 space-y-1">
              <p className="font-extrabold text-[#0B241E] text-sm">Barcode Scanner Mengalami Penurunan Akurasi</p>
              <p className="text-[11px] text-[#64748B] leading-relaxed">
                Kamera reader gate kendaraan logistik tertutup debu dermaga. 15% truk dialihkan ke verifikasi manual handheld oleh petugas pos 2.
              </p>
            </div>
          </div>
          <Link
            href="/upt/pemeliharaan"
            className="mt-4 w-full py-1.5 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-lg cursor-pointer transition-colors text-center block"
          >
            Buka Tiket Perbaikan Fasilitas →
          </Link>
        </div>

        {/* Status 3: Konektivitas Host-to-Host */}
        <div className="bg-white border border-emerald-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-emerald-100">
              <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs">
                <ShieldCheck className="w-4 h-4" />
                <span>Integrasi e-SKRD Bapenda</span>
              </div>
              <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                Online (Latensi 38ms)
              </span>
            </div>
            <div className="mt-3 space-y-1">
              <p className="font-extrabold text-[#0B241E] text-sm">Host-to-Host Kasda 100% Aktif</p>
              <p className="text-[11px] text-[#64748B] leading-relaxed">
                Penerbitan nomor bayar e-SKRD otomatis tersinkronisasi ke Kas Daerah tanpa antrean antrian data (*zero queue backlog*).
              </p>
            </div>
          </div>
          <Link
            href="/upt/shift"
            className="mt-4 w-full py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg cursor-pointer transition-colors text-center block"
          >
            Lihat Rekonsiliasi Kasir Sif 1 →
          </Link>
        </div>
      </div>
    </div>
  );
}
