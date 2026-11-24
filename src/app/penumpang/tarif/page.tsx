"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  DollarSign,
  Building2,
  MapPin,
  Search,
  Filter,
  CheckCircle2,
  ShieldCheck,
  Info,
  ExternalLink,
  Zap,
  Coffee,
  HeartPulse,
  Baby,
  Car,
  Wifi,
  Navigation,
  FileText,
} from "lucide-react";
import { formatRupiah } from "@/lib/kapal-billing";
import type { TariffItem } from "@/types/penumpang.types";

export default function PenumpangTarifPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeZone, setActiveZone] = useState<string>("all");

  const tariffs: TariffItem[] = [
    // 1. Pas Penumpang
    {
      id: "TAR-01",
      category: "pax",
      serviceName: "Pas Masuk Penumpang Dewasa (Reguler)",
      rate: 10000,
      unit: "Per Orang / Sekali Masuk",
      legalBasis: "PP No. 35/2023 Ps. 88 & Perda Prov. No. 1/2024",
      effectiveDate: "01 Januari 2024",
      notes: "Hak retribusi daerah kas Pemda untuk pemeliharaan fasilitas terminal",
    },
    {
      id: "TAR-02",
      category: "pax",
      serviceName: "Pas Masuk Terminal Eksekutif (Lounge Ber-AC)",
      rate: 15000,
      unit: "Per Orang / Sekali Masuk",
      legalBasis: "PP No. 35/2023 Ps. 88 & Kepgub No. 44/2024",
      effectiveDate: "01 Januari 2024",
      notes: "Termasuk akses garbarata langsung ke kapal & Wi-Fi gratis",
    },
    {
      id: "TAR-03",
      category: "pax",
      serviceName: "Pas Masuk Anak-anak (< 5 tahun)",
      rate: 0,
      unit: "Per Orang (Gratis)",
      legalBasis: "SOP Dinas Perhubungan & PP 35/2023",
      effectiveDate: "01 Januari 2024",
      notes: "Pembebasan retribusi bagi balita yang didampingi orang tua",
    },

    // 2. Kendaraan
    {
      id: "TAR-04",
      category: "vehicle",
      serviceName: "Pas Masuk Kendaraan Golongan I (Sepeda)",
      rate: 5000,
      unit: "Per Unit",
      legalBasis: "PP No. 35/2023 Ps. 92 & Perda No. 1/2024",
      effectiveDate: "01 Januari 2024",
      notes: "Kupon pas pelabuhan resmi Pemda",
    },
    {
      id: "TAR-05",
      category: "vehicle",
      serviceName: "Pas Masuk Sepeda Motor Golongan II (< 500cc)",
      rate: 15000,
      unit: "Per Unit Termasuk Pengendara",
      legalBasis: "PP No. 35/2023 Ps. 92",
      effectiveDate: "01 Januari 2024",
      notes: "Sudah mencakup retribusi kebersihan & ketertiban dermaga",
    },
    {
      id: "TAR-06",
      category: "vehicle",
      serviceName: "Pas Masuk Mobil Pribadi Golongan IV A",
      rate: 45000,
      unit: "Per Kendaraan",
      legalBasis: "PP No. 35/2023 Ps. 92",
      effectiveDate: "01 Januari 2024",
      notes: "Termasuk pemanfaatan kantong parkir antrean steril dermaga",
    },
    {
      id: "TAR-07",
      category: "vehicle",
      serviceName: "Pas Masuk Bus & Truk Sedang Golongan V",
      rate: 80000,
      unit: "Per Kendaraan",
      legalBasis: "PP No. 35/2023 Ps. 92",
      effectiveDate: "01 Januari 2024",
      notes: "Termasuk pemeriksaan timbangan muatan axel load di tollgate",
    },
    {
      id: "TAR-08",
      category: "vehicle",
      serviceName: "Pas Masuk Truk Tronton / Gandengan Golongan VII",
      rate: 130000,
      unit: "Per Kendaraan",
      legalBasis: "PP No. 35/2023 Ps. 92",
      effectiveDate: "01 Januari 2024",
      notes: "Sesuai regulasi tonase berat muatan pelabuhan regional",
    },

    // 3. Jasa Dermaga & Utilitas
    {
      id: "TAR-09",
      category: "dock",
      serviceName: "Jasa Tambat & Sandar Kapal (Mooring)",
      rate: 120,
      unit: "Per GT / Jam",
      legalBasis: "PP No. 35/2023 Ps. 90",
      effectiveDate: "01 Januari 2024",
      notes: "Dikenakan kepada operator kapal per jam waktu aktual sandar",
    },
    {
      id: "TAR-10",
      category: "utility",
      serviceName: "Penyaluran Air Bersih Kapal / Tenant",
      rate: 28000,
      unit: "Per Meter Kubik (m³)",
      legalBasis: "PP No. 35/2023 Ps. 98",
      effectiveDate: "01 Januari 2024",
      notes: "Retribusi pemanfaatan utilitas instalasi air bersih pelabuhan",
    },
    {
      id: "TAR-11",
      category: "utility",
      serviceName: "Parkir Inap Kendaraan Roda Empat",
      rate: 35000,
      unit: "Per 24 Jam",
      legalBasis: "Perda Pajak & Retribusi Daerah No. 1/2024",
      effectiveDate: "01 Januari 2024",
      notes: "Kawasan parkir terlindung berkanopi dengan pos jaga sekuriti 24 jam",
    },
  ];

  const filteredTariffs = tariffs.filter((t) => {
    if (selectedCategory !== "all" && t.category !== selectedCategory) return false;
    if (
      searchQuery &&
      !t.serviceName.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !t.legalBasis.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });


  const facilities = [
    {
      id: "fac-1",
      title: "Ruang Tunggu Ber-AC & Lounge",
      location: "Lantai 1 & 2 Gedung Utama",
      icon: Coffee,
      status: "Beroperasi 24 Jam",
      description: "Dilengkapi kursi ergonomis, stopkontak, layar informasi jadwal, dan Wi-Fi gratis.",
    },
    {
      id: "fac-2",
      title: "Ruang Laktasi & Ibu Menyusui",
      location: "Zona Keberangkatan Terminal",
      icon: Baby,
      status: "Tersedia & Higienis",
      description: "Fasilitas steril khusus ibu dan balita dengan sofa nyaman, wastafel, dan lemari pendingin.",
    },
    {
      id: "fac-3",
      title: "Posko Kesehatan & Pertolongan P3K",
      location: "Samping Loket Pembelian Tiket",
      icon: HeartPulse,
      status: "Petugas Siaga",
      description: "Tenaga medis UPTD siap menangani keluhan kesehatan darurat calon penumpang.",
    },
    {
      id: "fac-4",
      title: "Area Parkir Inap Aman (CCTV 24 Jam)",
      location: "Kawasan Parkir Timur Pelabuhan",
      icon: Car,
      status: "Kapasitas 350 Mobil",
      description: "Dilengkapi portal tiket otomatis, pos sekuriti, dan kamera pengawas 24 jam.",
    },
    {
      id: "fac-5",
      title: "Stasiun Pengisian Daya Mobil Listrik (SPKLU)",
      location: "Kantong Parkir Eksekutif",
      icon: Zap,
      status: "2 Unit Fast Charging",
      description: "Dukungan pengisian daya kendaraan listrik ramah lingkungan sebelum menyeberang.",
    },
    {
      id: "fac-6",
      title: "Pusat Pujasera & Oleh-oleh Khas UMKM",
      location: "Lantai 2 Koridor Penghubung",
      icon: Building2,
      status: "28 Kios Aktif",
      description: "Menyediakan makanan khas daerah, minuman hangat, dan gerai oleh-oleh binaan Pemda.",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-[#0A2540] via-[#0F3A5D] to-[#0D9488] text-white p-6 sm:p-8 rounded-2xl shadow-md space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[#67E8F9] text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Keterbukaan Informasi Publik (UU No. 14/2008 & PP 35/2023)</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
          Transparansi Tarif Retribusi & Fasilitas Kawasan
        </h1>
        <p className="text-xs sm:text-sm text-[#E0F2FE]/90 max-w-2xl leading-relaxed">
          Ketahui rincian resmi biaya retribusi kepelabuhanan yang sah sebelum bepergian. Bebas dari pungutan liar (pungli) berkat sistem pembayaran nontunai digital PORTA.
        </p>
      </div>

      {/* ============================================================== */}
      {/* 1. KATALOG TARIF RESMI DAERAH                                  */}
      {/* ============================================================== */}
      <section className="bg-white border border-[#CBD5E1] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#F1F5F9] pb-4">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#0A2540] flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-[#0284C7]" />
              <span>Katalog Tarif Resmi Retribusi Daerah</span>
            </span>
            <p className="text-xs text-[#64748B] mt-0.5">
              Rincian tarif jasa kepelabuhanan, pas masuk, dan pemanfaatan utilitas daerah
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari jenis layanan / regulasi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs font-semibold pl-9 pr-3 p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#0284C7]"
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedCategory === "all"
                ? "bg-[#0A2540] text-white shadow-xs"
                : "bg-[#F1F5F9] text-[#64748B] hover:text-[#0A2540]"
            }`}
          >
            Semua Objek ({tariffs.length})
          </button>
          <button
            onClick={() => setSelectedCategory("pax")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedCategory === "pax"
                ? "bg-[#0A2540] text-white shadow-xs"
                : "bg-[#F1F5F9] text-[#64748B] hover:text-[#0A2540]"
            }`}
          >
            Pas Penumpang (Orang)
          </button>
          <button
            onClick={() => setSelectedCategory("vehicle")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedCategory === "vehicle"
                ? "bg-[#0A2540] text-white shadow-xs"
                : "bg-[#F1F5F9] text-[#64748B] hover:text-[#0A2540]"
            }`}
          >
            Pas Kendaraan (Gol I - VII)
          </button>
          <button
            onClick={() => setSelectedCategory("utility")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedCategory === "utility"
                ? "bg-[#0A2540] text-white shadow-xs"
                : "bg-[#F1F5F9] text-[#64748B] hover:text-[#0A2540]"
            }`}
          >
            Utilitas & Parkir Inap
          </button>
          <button
            onClick={() => setSelectedCategory("dock")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedCategory === "dock"
                ? "bg-[#0A2540] text-white shadow-xs"
                : "bg-[#F1F5F9] text-[#64748B] hover:text-[#0A2540]"
            }`}
          >
            Jasa Dermaga (Kapal)
          </button>
        </div>

        {/* Tariff Table */}
        <div className="overflow-x-auto border border-[#E2E8F0] rounded-xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                <th className="py-3 px-4">Jenis Layanan Retribusi</th>
                <th className="py-3 px-4 text-right">Besaran Tarif (Rp)</th>
                <th className="py-3 px-4">Satuan Hitung</th>
                <th className="py-3 px-4">Dasar Penetapan Hukum</th>
                <th className="py-3 px-4">Berlaku Sejak</th>
                <th className="py-3 px-4">Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {filteredTariffs.map((item) => (
                <tr key={item.id} className="hover:bg-[#F8FAFC]/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-[#0A2540]">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[9px] bg-[#E0F2FE] text-[#0369A1] px-1.5 py-0.5 rounded">
                        {item.id}
                      </span>
                      <span>{item.serviceName}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-extrabold text-[#0284C7] text-sm">
                    {item.rate === 0 ? "GRATIS" : formatRupiah(item.rate)}
                  </td>
                  <td className="py-3.5 px-4 text-[#475569]">{item.unit}</td>
                  <td className="py-3.5 px-4 text-[#64748B] text-[11px] font-medium">
                    {item.legalBasis}
                  </td>
                  <td className="py-3.5 px-4 text-[#64748B] font-mono text-[11px]">
                    {item.effectiveDate}
                  </td>
                  <td className="py-3.5 px-4 text-[#64748B] text-[11px] max-w-xs">
                    {item.notes}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 2. PROFIL FASILITAS PELABUHAN & PETA KAWASAN                    */}
      {/* ============================================================== */}
      <section id="fasilitas" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-black text-[#0A2540]">
              Fasilitas Pelayanan Publik Pelabuhan
            </h2>
            <p className="text-xs text-[#64748B]">
              Berbagai fasilitas terstandar untuk kenyamanan perjalanan penyeberangan Anda
            </p>
          </div>
          <div className="text-xs text-[#0284C7] font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Memenuhi Standar Pelayanan Minimal (SPM) Perhubungan</span>
          </div>
        </div>

        {/* Facilities Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {facilities.map((fac) => {
            const Icon = fac.icon;
            return (
              <div
                key={fac.id}
                className="bg-white border border-[#CBD5E1] rounded-2xl p-5 shadow-xs hover:shadow-md transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0284C7] to-[#06B6D4] text-white flex items-center justify-center font-bold shadow-xs">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {fac.status}
                  </span>
                </div>

                <div>
                  <h3 className="font-extrabold text-xs text-[#0A2540]">
                    {fac.title}
                  </h3>
                  <p className="text-[11px] text-[#0284C7] font-medium flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span>{fac.location}</span>
                  </p>
                </div>

                <p className="text-xs text-[#64748B] leading-relaxed">
                  {fac.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* PETA KAWASAN PELABUHAN (Interactive Spatial Layout Diagram) */}
        <div className="bg-white border border-[#CBD5E1] rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F1F5F9] pb-3">
            <div>
              <h3 className="font-extrabold text-sm text-[#0A2540] flex items-center gap-2">
                <Navigation className="w-4 h-4 text-[#0284C7]" />
                <span>Denah Spasial Kawasan Pelabuhan Regional Merak</span>
              </h3>
              <p className="text-xs text-[#64748B]">
                Klik zona fasilitas untuk melihat petunjuk arah di area pelabuhan
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold">
              <button
                onClick={() => setActiveZone("all")}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  activeZone === "all" ? "bg-[#0A2540] text-white" : "bg-[#F1F5F9] text-[#64748B]"
                }`}
              >
                Semua Zona
              </button>
              <button
                onClick={() => setActiveZone("dermaga")}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  activeZone === "dermaga" ? "bg-[#0A2540] text-white" : "bg-[#F1F5F9] text-[#64748B]"
                }`}
              >
                Dermaga Kapal
              </button>
              <button
                onClick={() => setActiveZone("terminal")}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  activeZone === "terminal" ? "bg-[#0A2540] text-white" : "bg-[#F1F5F9] text-[#64748B]"
                }`}
              >
                Gedung Terminal
              </button>
            </div>
          </div>

          {/* Interactive Visual Map Layout */}
          <div className="bg-gradient-to-br from-[#0F3A5D]/10 via-[#0284C7]/5 to-[#06B6D4]/10 rounded-xl p-6 border-2 border-dashed border-[#CBD5E1] relative min-h-[320px] flex flex-col justify-between">
            {/* Top Area: Sea & Docks */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-[#0369A1] font-bold">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#0284C7] animate-pulse" />
                  <span>Area Perairan Sandar (Selat Sunda)</span>
                </span>
                <span className="text-[11px] font-mono">Kedalaman: -9.5 m LWS</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-white rounded-xl border-2 border-[#0284C7] shadow-sm text-center">
                  <span className="text-[10px] font-mono font-bold text-[#0284C7]">DERMAGA 1</span>
                  <p className="text-xs font-bold text-[#0A2540]">Layanan Eksekutif</p>
                  <p className="text-[10px] text-emerald-700 font-semibold">● Aktif Beroperasi</p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-[#CBD5E1] shadow-xs text-center">
                  <span className="text-[10px] font-mono font-bold text-[#64748B]">DERMAGA 2</span>
                  <p className="text-xs font-bold text-[#0A2540]">Layanan Reguler</p>
                  <p className="text-[10px] text-emerald-700 font-semibold">● Aktif Beroperasi</p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-[#CBD5E1] shadow-xs text-center">
                  <span className="text-[10px] font-mono font-bold text-[#64748B]">DERMAGA 3</span>
                  <p className="text-xs font-bold text-[#0A2540]">Layanan Reguler</p>
                  <p className="text-[10px] text-emerald-700 font-semibold">● Aktif Beroperasi</p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-[#CBD5E1] shadow-xs text-center">
                  <span className="text-[10px] font-mono font-bold text-[#64748B]">DERMAGA 4</span>
                  <p className="text-xs font-bold text-[#0A2540]">Standby / Cadangan</p>
                  <p className="text-[10px] text-blue-700 font-semibold">● Siap Sandar</p>
                </div>
              </div>
            </div>

            {/* Middle Area: Terminal Building & Passenger Flow */}
            <div className="my-6 p-4 bg-white/90 backdrop-blur-sm rounded-xl border border-[#CBD5E1] shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center text-xs">
                <div className="p-2.5 bg-[#F0F9FF] rounded-lg border border-[#BAE6FD]">
                  <p className="font-bold text-[#0369A1]">Lantai 1: Gerbang Masuk & Posko Medis</p>
                  <p className="text-[10px] text-[#64748B]">Loket Validasi QR Code & Check-in Fisik</p>
                </div>
                <div className="p-2.5 bg-[#F0F9FF] rounded-lg border border-[#BAE6FD]">
                  <p className="font-bold text-[#0369A1]">Lantai 2: Ruang Tunggu AC & Pujasera</p>
                  <p className="text-[10px] text-[#64748B]">Akses Garbarata, Musala, & Ruang Laktasi</p>
                </div>
                <div className="p-2.5 bg-[#F0FDF4] rounded-lg border border-emerald-200">
                  <p className="font-bold text-emerald-800">Jalur Khusus Difabel & Lansia</p>
                  <p className="text-[10px] text-emerald-700">Ramp landai & lift menuju kapal</p>
                </div>
              </div>
            </div>

            {/* Bottom Area: Tollgates & Parking Lots */}
            <div className="space-y-2">
              <div className="text-xs text-[#475569] font-bold">
                Akses Masuk Gerbang Tol Kendaraan (Tollgate) & Parkir Inap:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-2.5 bg-white rounded-lg border border-[#CBD5E1] flex items-center justify-between">
                  <div>
                    <strong className="text-[#0A2540]">Gate 1 & 2</strong>
                    <p className="text-[10px] text-[#64748B]">Sepeda Motor (Gol II)</p>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                    Lancar
                  </span>
                </div>

                <div className="p-2.5 bg-white rounded-lg border border-[#CBD5E1] flex items-center justify-between">
                  <div>
                    <strong className="text-[#0A2540]">Gate 3 & 4</strong>
                    <p className="text-[10px] text-[#64748B]">Mobil Pribadi (Gol IV A)</p>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                    Lancar
                  </span>
                </div>

                <div className="p-2.5 bg-white rounded-lg border border-[#CBD5E1] flex items-center justify-between">
                  <div>
                    <strong className="text-[#0A2540]">Gate 5 (Jembatan Timbang)</strong>
                    <p className="text-[10px] text-[#64748B]">Truk & Bus Logistik (Gol V-VII)</p>
                  </div>
                  <span className="text-[10px] font-mono text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded">
                    Antrean 10 Mnt
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
