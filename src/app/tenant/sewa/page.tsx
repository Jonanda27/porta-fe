"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Store,
  Building2,
  Layers,
  KeyRound,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  CreditCard,
  FileText,
  Upload,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Info,
  ChevronRight,
  Zap,
  Droplet,
  User,
  Check,
  Download,
  X,
  Sparkles,
} from "lucide-react";

// =========================================================================
// TYPES & MOCK DATA (PERBUP MIMIKA 25/2024 & PP 35/2023)
// =========================================================================

interface FacilityUnit {
  id: string;
  name: string;
  zone: "ZONA_A" | "ZONA_B" | "ZONA_C";
  zoneName: string;
  location: string;
  dimensions: string;
  areaM2: number;
  ratePerM2Month: number;
  rateAnnual: number;
  electricityVA: string;
  waterSupply: string;
  status: "AVAILABLE" | "OCCUPIED" | "MAINTENANCE";
  suitableFor: string;
  description: string;
}

const FACILITY_CATALOG: FacilityUnit[] = [
  // ZONA A: Terminal Penumpang
  {
    id: "BLOK-A05",
    name: "Kios Komersial A-05",
    zone: "ZONA_A",
    zoneName: "Zona A (Gedung Terminal)",
    location: "Lantai 1 - Sayap Barat Hall Keberangkatan",
    dimensions: "3.0 m x 4.0 m",
    areaM2: 12,
    ratePerM2Month: 125000,
    rateAnnual: 18000000,
    electricityVA: "2.200 VA (Meter Mandiri)",
    waterSupply: "Instalasi Kran PDAM",
    status: "AVAILABLE",
    suitableFor: "Kios Oleh-Oleh / Cinderamata Khas Papua / Retail",
    description: "Posisi strategis tepat di depan ruang tunggu penumpang pelabuhan penyeberangan, sirkulasi pengunjung tinggi.",
  },
  {
    id: "BLOK-A06",
    name: "Kafetaria & Resto A-06",
    zone: "ZONA_A",
    zoneName: "Zona A (Gedung Terminal)",
    location: "Lantai 1 - Sisi Timur Dekat Pintu Dermaga 1",
    dimensions: "4.0 m x 6.0 m",
    areaM2: 24,
    ratePerM2Month: 125000,
    rateAnnual: 36000000,
    electricityVA: "3.500 VA",
    waterSupply: "Saluran Air Bersih & Wastafel Kitchen",
    status: "AVAILABLE",
    suitableFor: "Kantin, Rumah Makan, Coffee Shop Penumpang",
    description: "Ruang makan luas dengan instalasi exhaust dapur dan saluran air bersih standar sanitasi pelabuhan.",
  },
  {
    id: "BLOK-A02",
    name: "Bilik Loket Agen Tiket A-02",
    zone: "ZONA_A",
    zoneName: "Zona A (Gedung Terminal)",
    location: "Lobby Luar Area Loket Tiket Terpadu",
    dimensions: "3.0 m x 3.0 m",
    areaM2: 9,
    ratePerM2Month: 120000,
    rateAnnual: 12960000,
    electricityVA: "1.300 VA",
    waterSupply: "Akses Toilet Umum",
    status: "OCCUPIED",
    suitableFor: "Biro Perjalanan, Agen Tiket Kapal Cepat, Jasa Wisata",
    description: "Bilik pelayanan pelanggan dengan loket kaca geser dan laci uang kasir pengaman.",
  },

  // ZONA B: Pelataran & Area Komersial Darat
  {
    id: "BLOK-B01",
    name: "Kios Ekspedisi & Logistik B-01",
    zone: "ZONA_B",
    zoneName: "Zona B (Pelataran Komersial)",
    location: "Kawasan Parkir Kendaraan Penyeberangan",
    dimensions: "4.0 m x 5.0 m",
    areaM2: 20,
    ratePerM2Month: 95000,
    rateAnnual: 22800000,
    electricityVA: "2.200 VA",
    waterSupply: "Instalasi Air Bersih Tersedia",
    status: "AVAILABLE",
    suitableFor: "Kantor Ekspedisi Kargo, Jasa Titipan Kilat, Logistik",
    description: "Akses bongkar muat kendaraan pick-up dan truk langsung di depan pintu unit kios.",
  },
  {
    id: "BLOK-B03",
    name: "Stan Kuliner UMKM B-03",
    zone: "ZONA_B",
    zoneName: "Zona B (Pelataran Komersial)",
    location: "Pujasera Pelataran Dermaga",
    dimensions: "3.0 m x 3.0 m",
    areaM2: 9,
    ratePerM2Month: 80000,
    rateAnnual: 8640000,
    electricityVA: "1.300 VA",
    waterSupply: "Kran Bersama Pujasera",
    status: "AVAILABLE",
    suitableFor: "Kios Minuman, Jajanan Tradisional, Roti & Snack",
    description: "Konsep foodcourt terbuka ramah UMKM lokal binaan Dinas Perhubungan dan Bapenda.",
  },

  // ZONA C: Area Lini 1 & Pergudangan Logistik
  {
    id: "GDG-C01",
    name: "Gudang Penumpukan Tertutup C-01",
    zone: "ZONA_C",
    zoneName: "Zona C (Logistik Lini 1)",
    location: "Kawasan Pergudangan Dermaga Logistik",
    dimensions: "10.0 m x 15.0 m",
    areaM2: 150,
    ratePerM2Month: 65000,
    rateAnnual: 117000000,
    electricityVA: "5.500 VA (3 Phase)",
    waterSupply: "Instalasi Pemadam & Air Bersih",
    status: "AVAILABLE",
    suitableFor: "Pergudangan Sembako, Material Konstruksi, Barang Muatan Kapal",
    description: "Bangunan konstruksi baja kokoh dengan pintu rolling door lebar untuk akses forklift dan truk besar.",
  },
  {
    id: "LHN-C02",
    name: "Lahan Terbuka Penumpukan Petikemas",
    zone: "ZONA_C",
    zoneName: "Zona C (Logistik Lini 1)",
    location: "Pelataran Hardstanding Sisi Dermaga 2",
    dimensions: "15.0 m x 20.0 m",
    areaM2: 300,
    ratePerM2Month: 40000,
    rateAnnual: 144000000,
    electricityVA: "Penerangan Sorot Lapangan",
    waterSupply: "Drainase Pelabuhan",
    status: "OCCUPIED",
    suitableFor: "Penumpukan Petikemas 20ft/40ft, Kendaraan Berat, Kayu",
    description: "Lantai beton perkerasan heavy duty menahan beban tonase tinggi dan alat berat crane pelabuhan.",
  },
];

interface ApplicationRecord {
  id: string;
  unitId: string;
  unitName: string;
  applicantName: string;
  businessName: string;
  entityType: "PERORANGAN" | "BADAN_USAHA";
  nikOrNib: string;
  npwpd: string;
  durationMonths: number;
  startDate: string;
  calculatedAnnualTarif: number;
  submissionDate: string;
  status: "DRAFT" | "VERIFIKASI_UPTD" | "SURVEI_LAPANGAN" | "DISETUJUI_KADIS" | "DITOLAK";
  statusNotes: string;
}

export default function TenantSewaPage() {
  const [activeTab, setActiveTab] = useState<"catalog" | "form" | "tracking">("catalog");
  const [selectedZone, setSelectedZone] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Selected Unit for Application Form
  const [selectedUnit, setSelectedUnit] = useState<FacilityUnit>(FACILITY_CATALOG[0]);
  const [leaseDurationMonths, setLeaseDurationMonths] = useState<number>(12); // Default 1 Year

  // Form Applicant States (Pasal 6-8 Perbup 25/2024)
  const [entityType, setEntityType] = useState<"PERORANGAN" | "BADAN_USAHA">("BADAN_USAHA");
  const [applicantName, setApplicantName] = useState<string>("Ny. Martha Kogoya");
  const [businessName, setBusinessName] = useState<string>("Kios Cendrawasih Souvenir");
  const [nikKtp, setNikKtp] = useState<string>("9101014508820003");
  const [nibOss, setNibOss] = useState<string>("0220008912345");
  const [npwpd, setNpwpd] = useState<string>("03.182.901.4-951.000");
  const [businessType, setBusinessType] = useState<string>("Retail Cinderamata & Hasil Kerajinan Daerah");
  const [planStartDate, setPlanStartDate] = useState<string>("2027-01-01");
  const [submissionModal, setSubmissionModal] = useState<ApplicationRecord | null>(null);

  // Existing Applications (Tab 3)
  const [applications, setApplications] = useState<ApplicationRecord[]>([
    {
      id: "REQ-T2026-089",
      unitId: "BLOK-B01",
      unitName: "Kios Ekspedisi & Logistik B-01 (Zona B)",
      applicantName: "Ny. Martha Kogoya",
      businessName: "Kios Cendrawasih Souvenir (Ekspansi Usaha)",
      entityType: "BADAN_USAHA",
      nikOrNib: "0220008912345",
      npwpd: "03.182.901.4-951.000",
      durationMonths: 12,
      startDate: "01 Januari 2027",
      calculatedAnnualTarif: 22800000,
      submissionDate: "12 November 2026",
      status: "SURVEI_LAPANGAN",
      statusNotes: "Tim survei aset UPTD menjadwalkan pengecekan fisik lokasi pada 18 Nov 2026.",
    },
    {
      id: "REQ-T2025-014",
      unitId: "BLOK-A04",
      unitName: "Kios Komersial A-04 (Terminal Penumpang)",
      applicantName: "Ny. Martha Kogoya",
      businessName: "Kios Cendrawasih Souvenir",
      entityType: "BADAN_USAHA",
      nikOrNib: "0220008912345",
      npwpd: "03.182.901.4-951.000",
      durationMonths: 12,
      startDate: "01 Januari 2026",
      calculatedAnnualTarif: 18000000,
      submissionDate: "15 Desember 2025",
      status: "DISETUJUI_KADIS",
      statusNotes: "Kontrak PKS No. 552.1/PKS-ASET/UPTD/2026/014 telah diterbitkan resmi.",
    },
  ]);

  // Format IDR
  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Filter Catalog
  const filteredCatalog = FACILITY_CATALOG.filter((unit) => {
    const matchZone = selectedZone === "ALL" || unit.zone === selectedZone;
    const matchSearch =
      unit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      unit.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      unit.suitableFor.toLowerCase().includes(searchQuery.toLowerCase());
    return matchZone && matchSearch;
  });

  // Calculate Retribution Formula: Luas m2 x Tarif dasar x Durasi bulan
  const calculatedEstimatedRent = (selectedUnit.ratePerM2Month * selectedUnit.areaM2 * leaseDurationMonths);
  const securityDeposit = calculatedEstimatedRent * 0.1; // 10% jaminan utilitas

  // Handle Form Submission
  const handleSubmitLease = (e: React.FormEvent) => {
    e.preventDefault();

    if (!applicantName || !businessName || !npwpd) {
      alert("Harap lengkapi semua kolom identitas dan nomor NPWPD.");
      return;
    }

    const newReqId = `REQ-T2026-${String(Math.floor(Math.random() * 899) + 100)}`;
    const newRecord: ApplicationRecord = {
      id: newReqId,
      unitId: selectedUnit.id,
      unitName: `${selectedUnit.name} (${selectedUnit.zoneName})`,
      applicantName,
      businessName,
      entityType,
      nikOrNib: entityType === "PERORANGAN" ? nikKtp : nibOss,
      npwpd,
      durationMonths: leaseDurationMonths,
      startDate: planStartDate,
      calculatedAnnualTarif: calculatedEstimatedRent,
      submissionDate: "Hari ini, 16 Nov 2026",
      status: "VERIFIKASI_UPTD",
      statusNotes: "Berkas berhasil diunggah. Menunggu pemeriksaan administrasi oleh Tim Pengelola Aset UPTD.",
    };

    setApplications([newRecord, ...applications]);
    setSubmissionModal(newRecord);
  };

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* 1. TOP BANNER & STATS                                                     */}
      {/* ========================================================================= */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#0B241E] text-[#D97706] flex items-center justify-center font-bold text-lg shadow-xs shrink-0">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-extrabold text-[#0B241E]">
                Meja Pengajuan Sewa & Pemanfaatan Aset Daerah (BMD)
              </h2>
              <span className="text-[10px] font-mono bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                PP 35/2023 & Perbup Mimika 25/2024
              </span>
            </div>
            <p className="text-xs text-[#64748B] mt-0.5 max-w-2xl">
              Fasilitas kios, kantin, loket agen, gudang, dan lahan terbuka milik Pemerintah Daerah untuk optimalisasi pendapatan asli daerah (PAD) kepelabuhanan.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("tracking")}
            className="px-3.5 py-2 bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#475569] border border-[#CBD5E1] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Clock className="w-4 h-4 text-[#0B241E]" />
            <span>Riwayat Pengajuan ({applications.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("form")}
            className="px-4 py-2 bg-[#0B241E] hover:bg-[#143E33] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <KeyRound className="w-4 h-4 text-[#D97706]" />
            <span>Formulir Sewa Baru</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SUB-NAVIGATION TABS                                                    */}
      {/* ========================================================================= */}
      <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("catalog")}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "catalog"
              ? "bg-[#0B241E] text-white shadow-xs"
              : "text-[#64748B] hover:text-[#0B241E] hover:bg-white"
          }`}
        >
          <Layers className="w-4 h-4 text-[#D97706]" />
          <span>1. Katalog Unit Fasilitas & Zonasi ({FACILITY_CATALOG.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("form")}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "form"
              ? "bg-[#0B241E] text-white shadow-xs"
              : "text-[#64748B] hover:text-[#0B241E] hover:bg-white"
          }`}
        >
          <FileText className="w-4 h-4 text-[#D97706]" />
          <span>2. Formulir Permohonan & Upload Legalitas (Pasal 6-8)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("tracking")}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "tracking"
              ? "bg-[#0B241E] text-white shadow-xs"
              : "text-[#64748B] hover:text-[#0B241E] hover:bg-white"
          }`}
        >
          <Clock className="w-4 h-4 text-[#D97706]" />
          <span>3. Pelacakan Status Permohonan ({applications.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: KATALOG UNIT FASILITAS & ZONASI ASET PELABUHAN                    */}
      {/* ========================================================================= */}
      {activeTab === "catalog" && (
        <div className="space-y-5">
          {/* Filter Bar */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-[#64748B]">Zonasi Aset:</span>
              {[
                { label: "Semua Zona", value: "ALL" },
                { label: "Zona A (Terminal)", value: "ZONA_A" },
                { label: "Zona B (Pelataran)", value: "ZONA_B" },
                { label: "Zona C (Logistik Lini 1)", value: "ZONA_C" },
              ].map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setSelectedZone(filter.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedZone === filter.value
                      ? "bg-[#0B241E] text-white shadow-xs"
                      : "bg-[#F1F5F9] text-[#64748B] hover:text-[#0B241E]"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama unit / lokasi / peruntukan..."
                className="text-xs p-2 pl-8 border border-[#CBD5E1] rounded-lg focus:outline-none focus:border-[#0B241E] w-64 text-[#0B241E] bg-[#F8FAFC]"
              />
              <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-2.5 top-2.5" />
            </div>
          </div>

          {/* Unit Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCatalog.map((unit) => {
              const isAvailable = unit.status === "AVAILABLE";
              return (
                <div
                  key={unit.id}
                  className={`bg-white border rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between ${
                    isAvailable ? "border-[#E2E8F0]" : "border-rose-200 bg-[#FAFAFA]"
                  }`}
                >
                  <div>
                    {/* Unit Header Badge */}
                    <div className="p-4 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-extrabold bg-[#0B241E] text-white px-2 py-0.5 rounded">
                          {unit.id}
                        </span>
                        <span className="text-[10px] font-bold text-[#64748B]">
                          {unit.zoneName}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                          isAvailable
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {isAvailable ? "TERSEDIA" : "TERISI SEWA"}
                      </span>
                    </div>

                    {/* Unit Content */}
                    <div className="p-5 space-y-3">
                      <div>
                        <h4 className="text-sm font-extrabold text-[#0B241E]">{unit.name}</h4>
                        <p className="text-xs text-[#64748B] flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-[#D97706] shrink-0" />
                          <span>{unit.location}</span>
                        </p>
                      </div>

                      <p className="text-[11px] text-[#475569] leading-relaxed line-clamp-2">
                        {unit.description}
                      </p>

                      {/* Specs */}
                      <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1.5 text-[11px]">
                        <div className="flex justify-between">
                          <span className="text-[#64748B]">Dimensi / Luas:</span>
                          <strong className="text-[#0B241E] font-mono">{unit.dimensions} ({unit.areaM2} m²)</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#64748B]">Listrik PLN:</span>
                          <span className="text-[#0B241E] flex items-center gap-1">
                            <Zap className="w-3 h-3 text-amber-600" />
                            {unit.electricityVA}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#64748B]">Suplai Air:</span>
                          <span className="text-[#0B241E] flex items-center gap-1">
                            <Droplet className="w-3 h-3 text-blue-600" />
                            {unit.waterSupply}
                          </span>
                        </div>
                      </div>

                      <div className="text-[11px] text-[#64748B]">
                        <span>Cocok untuk: </span>
                        <strong className="text-[#0B241E]">{unit.suitableFor}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Unit Footer & Price Action */}
                  <div className="p-4 bg-[#F8FAFC] border-t border-[#E2E8F0] flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-[#64748B] uppercase font-bold">Tarif Retribusi BMD</p>
                      <p className="text-sm font-extrabold text-emerald-800 font-mono">
                        {formatRupiah(unit.rateAnnual)} <span className="text-[10px] font-sans font-normal text-[#64748B]">/ Tahun</span>
                      </p>
                    </div>

                    {isAvailable ? (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedUnit(unit);
                          setActiveTab("form");
                        }}
                        className="px-3.5 py-2 bg-[#0B241E] hover:bg-[#143E33] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                      >
                        <span>Pilih Unit</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#D97706]" />
                      </button>
                    ) : (
                      <button
                        disabled
                        className="px-3 py-1.5 bg-[#E2E8F0] text-[#94A3B8] rounded-lg text-xs font-bold cursor-not-allowed"
                      >
                        Sedang Disewa
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: FORMULIR PENGAJUAN SEWA & LEGALITAS (PASAL 6-8 PERBUP 25/2024)     */}
      {/* ========================================================================= */}
      {activeTab === "form" && (
        <form onSubmit={handleSubmitLease} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Form (7 cols) */}
          <div className="lg:col-span-7 bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-xs space-y-6">
            <div className="pb-3 border-b border-[#F1F5F9]">
              <h3 className="text-sm font-extrabold text-[#0B241E]">
                Formulir Pendaftaran & Permohonan Sewa Aset Daerah
              </h3>
              <p className="text-xs text-[#64748B] mt-1">
                Kewajiban pendaftaran dan pendataan subjek retribusi sesuai <strong>Pasal 6, 7, dan 8 Perbup Mimika 25/2024</strong>.
              </p>
            </div>

            {/* Step 1: Objek Sewa Terpilih */}
            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-900 uppercase">
                  Objek Fasilitas Terpilih:
                </span>
                <span className="font-mono text-xs font-extrabold bg-[#0B241E] text-white px-2 py-0.5 rounded">
                  {selectedUnit.id}
                </span>
              </div>
              <p className="text-sm font-extrabold text-[#0B241E]">{selectedUnit.name}</p>
              <p className="text-xs text-[#64748B]">{selectedUnit.location} • Luas: {selectedUnit.areaM2} m²</p>
            </div>

            {/* Durasi Sewa Selector */}
            <div>
              <label className="text-xs font-bold text-[#0B241E] block mb-2">
                Pilih Durasi Jangka Waktu Sewa PKS:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { label: "6 Bulan", months: 6 },
                  { label: "1 Tahun", months: 12 },
                  { label: "2 Tahun", months: 24 },
                  { label: "3 Tahun", months: 36 },
                ].map((dur) => (
                  <button
                    key={dur.months}
                    type="button"
                    onClick={() => setLeaseDurationMonths(dur.months)}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      leaseDurationMonths === dur.months
                        ? "bg-[#0B241E] text-white border-[#0B241E] shadow-sm font-extrabold"
                        : "bg-[#F8FAFC] text-[#475569] border-[#E2E8F0] hover:bg-[#F1F5F9] font-bold"
                    }`}
                  >
                    <p className="text-xs">{dur.label}</p>
                    <p className={`text-[10px] mt-0.5 ${leaseDurationMonths === dur.months ? "text-[#D97706]" : "text-[#64748B]"}`}>
                      {dur.months} Bulan PKS
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Legalitas Pemohon (Pasal 7 Perbup) */}
            <div className="space-y-4 pt-2 border-t border-[#F1F5F9]">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold text-[#0B241E] uppercase tracking-wider">
                  Data Identitas Pemohon (Wajib Retribusi)
                </h4>
                <div className="flex items-center gap-1 bg-[#F1F5F9] p-0.5 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setEntityType("BADAN_USAHA")}
                    className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                      entityType === "BADAN_USAHA" ? "bg-white text-[#0B241E] shadow-xs" : "text-[#64748B]"
                    }`}
                  >
                    Badan Usaha / PT / CV
                  </button>
                  <button
                    type="button"
                    onClick={() => setEntityType("PERORANGAN")}
                    className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                      entityType === "PERORANGAN" ? "bg-white text-[#0B241E] shadow-xs" : "text-[#64748B]"
                    }`}
                  >
                    Perorangan / UMKM
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-[#0B241E] mb-1">
                    Nama Penanggung Jawab / Pimpinan:
                  </label>
                  <input
                    type="text"
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    required
                    className="w-full p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg text-[#0B241E] font-bold focus:outline-none focus:border-[#0B241E]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#0B241E] mb-1">
                    Nama Badan Usaha / Merk Toko:
                  </label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    required
                    className="w-full p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg text-[#0B241E] font-bold focus:outline-none focus:border-[#0B241E]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#0B241E] mb-1">
                    {entityType === "PERORANGAN" ? "Nomor NIK KTP:" : "Nomor NIB OSS (Nomor Induk Berusaha):"}
                  </label>
                  <input
                    type="text"
                    value={entityType === "PERORANGAN" ? nikKtp : nibOss}
                    onChange={(e) =>
                      entityType === "PERORANGAN" ? setNikKtp(e.target.value) : setNibOss(e.target.value)
                    }
                    required
                    className="w-full p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg text-[#0B241E] font-mono focus:outline-none focus:border-[#0B241E]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#0B241E] mb-1">
                    Nomor Pokok Wajib Retribusi Daerah (NPWPD):
                  </label>
                  <input
                    type="text"
                    value={npwpd}
                    onChange={(e) => setNpwpd(e.target.value)}
                    required
                    className="w-full p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg text-[#0B241E] font-mono font-bold focus:outline-none focus:border-[#0B241E]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0B241E] mb-1">
                  Rencana Jenis Usaha / Komoditas yang Diperdagangkan:
                </label>
                <textarea
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  rows={2}
                  required
                  className="w-full p-2.5 text-xs bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg text-[#0B241E] focus:outline-none focus:border-[#0B241E]"
                  placeholder="Jelaskan jenis makanan, cinderamata, atau jasa logistik yang akan dijalankan..."
                />
              </div>
            </div>

            {/* Step 3: Unggah Berkas Persyaratan */}
            <div className="space-y-3 pt-2 border-t border-[#F1F5F9]">
              <h4 className="text-xs font-extrabold text-[#0B241E] uppercase tracking-wider">
                Unggah Dokumen Legalitas (PDF / Gambar)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 border-2 border-dashed border-[#CBD5E1] rounded-xl text-center bg-[#FAFAFA] hover:bg-[#F1F5F9] transition-colors cursor-pointer">
                  <Upload className="w-5 h-5 text-[#64748B] mx-auto mb-1" />
                  <p className="font-bold text-[#0B241E] text-[11px]">1. KTP / Akta Pendirian</p>
                  <p className="text-[9px] text-emerald-700 font-mono mt-0.5">TERUNGGAH (ktp.pdf)</p>
                </div>

                <div className="p-3 border-2 border-dashed border-[#CBD5E1] rounded-xl text-center bg-[#FAFAFA] hover:bg-[#F1F5F9] transition-colors cursor-pointer">
                  <Upload className="w-5 h-5 text-[#64748B] mx-auto mb-1" />
                  <p className="font-bold text-[#0B241E] text-[11px]">2. Kartu NPWPD / NPWP</p>
                  <p className="text-[9px] text-emerald-700 font-mono mt-0.5">TERUNGGAH (npwpd.pdf)</p>
                </div>

                <div className="p-3 border-2 border-dashed border-[#CBD5E1] rounded-xl text-center bg-[#FAFAFA] hover:bg-[#F1F5F9] transition-colors cursor-pointer">
                  <Upload className="w-5 h-5 text-[#64748B] mx-auto mb-1" />
                  <p className="font-bold text-[#0B241E] text-[11px]">3. NIB OSS / Izin Usaha</p>
                  <p className="text-[9px] text-emerald-700 font-mono mt-0.5">TERUNGGAH (nib_oss.pdf)</p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3.5 bg-[#0B241E] hover:bg-[#143E33] text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all active:scale-[0.99]"
            >
              <KeyRound className="w-4 h-4 text-[#D97706]" />
              <span>Kirim Permohonan Sewa Aset Daerah ke UPTD</span>
            </button>
          </div>

          {/* Right Summary (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            {/* Kalkulator Retribusi Daerah */}
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-xs space-y-4">
              <div className="pb-3 border-b border-[#F1F5F9]">
                <h4 className="text-xs font-extrabold text-[#0B241E] uppercase tracking-wider">
                  Kalkulator Estimasi Retribusi Daerah
                </h4>
                <p className="text-[10px] text-[#64748B] mt-0.5">
                  Berdasarkan rumus penetapan SKRD Perbup Mimika No. 25 Tahun 2024
                </p>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Unit Objek:</span>
                  <span className="font-bold text-[#0B241E]">{selectedUnit.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Luas Lantai:</span>
                  <span className="font-mono text-[#0B241E]">{selectedUnit.areaM2} m²</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Tarif Dasar Perbup:</span>
                  <span className="font-mono text-[#0B241E]">{formatRupiah(selectedUnit.ratePerM2Month)} / m² / bln</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Durasi Periode:</span>
                  <span className="font-bold text-[#0B241E]">{leaseDurationMonths} Bulan</span>
                </div>

                <div className="border-t border-[#E2E8F0] pt-2.5 flex justify-between">
                  <span className="text-[#64748B]">Estimasi Pokok Retribusi:</span>
                  <strong className="font-mono text-emerald-800 text-sm">
                    {formatRupiah(calculatedEstimatedRent)}
                  </strong>
                </div>

                <div className="flex justify-between text-[11px] text-[#64748B]">
                  <span>Jaminan Utilitas (10%):</span>
                  <span className="font-mono">{formatRupiah(securityDeposit)}</span>
                </div>

                <div className="border-t-2 border-[#0B241E] pt-3 flex justify-between items-center">
                  <span className="font-extrabold text-[#0B241E]">Total SKRD Pertama:</span>
                  <strong className="text-base font-extrabold text-[#0B241E] font-mono">
                    {formatRupiah(calculatedEstimatedRent + securityDeposit)}
                  </strong>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[11px] text-[#64748B] space-y-1">
                <p className="font-bold text-[#0B241E]">Catatan Pembayaran:</p>
                <p>• Diterbitkan dalam bentuk SKRD resmi dengan jatuh tempo 30 hari kalender.</p>
                <p>• Pembayaran dapat diangsur maksimal 6 bulan melalui skema SPARD (Pasal 19).</p>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: PELACAKAN STATUS PERMOHONAN                                        */}
      {/* ========================================================================= */}
      {activeTab === "tracking" && (
        <div className="space-y-4">
          <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-[#E2E8F0] bg-[#FAFCFB] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-[#0B241E]">
                  Riwayat & Status Permohonan Sewa Aset
                </h3>
                <p className="text-[11px] text-[#64748B]">
                  Pantau perkembangan verifikasi berkas, survei zonasi, dan penerbitan kontrak PKS
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-[#0B241E] bg-[#F1F5F9] px-2.5 py-1 rounded-lg border border-[#CBD5E1]">
                {applications.length} Pengajuan Tercatat
              </span>
            </div>

            <div className="divide-y divide-[#E2E8F0]">
              {applications.map((app) => (
                <div key={app.id} className="p-5 hover:bg-[#F8FAFC]/80 transition-colors space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs font-extrabold bg-[#0B241E] text-[#D97706] px-2 py-0.5 rounded">
                        {app.id}
                      </span>
                      <h4 className="text-sm font-extrabold text-[#0B241E]">{app.unitName}</h4>
                    </div>

                    <span
                      className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1 w-fit ${
                        app.status === "DISETUJUI_KADIS"
                          ? "bg-emerald-100 text-emerald-800"
                          : app.status === "SURVEI_LAPANGAN"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {app.status === "DISETUJUI_KADIS" && <CheckCircle2 className="w-3 h-3" />}
                      {app.status === "SURVEI_LAPANGAN" && <Clock className="w-3 h-3 animate-spin" />}
                      {app.status === "VERIFIKASI_UPTD" && <FileText className="w-3 h-3" />}
                      <span>{app.status.replace("_", " ")}</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0]">
                    <div>
                      <span className="text-[#64748B]">Pemohon:</span>
                      <p className="font-bold text-[#0B241E]">{app.applicantName} ({app.businessName})</p>
                    </div>
                    <div>
                      <span className="text-[#64748B]">Durasi Kontrak:</span>
                      <p className="font-bold text-[#0B241E]">{app.durationMonths} Bulan (Mulai {app.startDate})</p>
                    </div>
                    <div>
                      <span className="text-[#64748B]">Estimasi Retribusi:</span>
                      <p className="font-mono font-extrabold text-emerald-800">{formatRupiah(app.calculatedAnnualTarif)}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-[#64748B] pt-1">
                    <p className="italic">
                      <strong>Catatan Petugas UPTD:</strong> {app.statusNotes}
                    </p>
                    <span className="text-[10px] font-mono shrink-0">Diajukan: {app.submissionDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL SUKSES PENGAJUAN PERMOHONAN SEWA                                    */}
      {/* ========================================================================= */}
      {submissionModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#CBD5E1] space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-extrabold text-[#0B241E]">
                Permohonan Sewa Berhasil Dikirim!
              </h3>
              <p className="text-xs text-[#64748B] mt-1">
                Nomor Registrasi Tiket Permohonan Anda:
              </p>
              <div className="mt-2 inline-block px-4 py-1.5 bg-[#0B241E] text-[#D97706] rounded-xl font-mono text-sm font-extrabold">
                {submissionModal.id}
              </div>
            </div>

            <p className="text-xs text-[#475569] leading-relaxed bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0] text-left">
              Tim Pengelola Aset UPTD Pelabuhan akan memeriksa kelengkapan NIB, NPWPD, dan kesesuaian zonasi unit dalam <strong>1x24 jam kerja</strong>. Anda dapat memantau perkembangannya pada tab Pelacakan.
            </p>

            <button
              type="button"
              onClick={() => {
                setSubmissionModal(null);
                setActiveTab("tracking");
              }}
              className="w-full py-2.5 bg-[#0B241E] hover:bg-[#143E33] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Lihat Status di Tab Pelacakan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
