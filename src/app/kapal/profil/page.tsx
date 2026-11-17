"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Ship,
  Building2,
  FileText,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Edit2,
  Trash2,
  ShieldCheck,
  FileCheck,
  Download,
  X,
  Layers,
  FileUp,
  Clock,
  Calendar,
  AlertCircle,
  FileSignature,
  TrendingUp,
  BarChart3,
  Check,
  Eye,
  RefreshCw,
  Send,
} from "lucide-react";

// Types
interface VesselMaster {
  id: string;
  name: string;
  callSign: string;
  imoNumber: string;
  gt: number;
  loa: number; // Length Overall (m)
  breadth: number; // Lebar (m)
  draft: number; // Sarat (m)
  paxCapacity: number;
  vehicleCapacity: number;
  type: string;
  seaworthyCertExpiry: string;
  status: "verified" | "pending_inspection";
}

interface PksContract {
  id: string;
  contractNumber: string;
  title: string;
  firstParty: string; // UPTD Pelabuhan / Bapenda
  secondParty: string; // ASDP
  legalBasis: string;
  startDate: string;
  endDate: string;
  daysRemaining: number;
  status: "active" | "expiring_soon" | "expired";
  statusLabel: string;
  monthlyQuota: number; // total slot sandar per bulan
  usedQuota: number;
  fileName: string;
  dockAllocation: string;
}

interface FleetQuota {
  vesselId: string;
  vesselName: string;
  gt: number;
  assignedRoute: string;
  monthlyQuota: number;
  usedThisMonth: number;
}

export default function KapalProfilPage() {
  const [activeTab, setActiveTab] = useState<"profil" | "pks" | "armada">("pks");
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isRenewalModalOpen, setIsRenewalModalOpen] = useState<boolean>(false);
  const [selectedPksForRenewal, setSelectedPksForRenewal] = useState<PksContract | null>(null);
  const [renewalYears, setRenewalYears] = useState<number>(1);
  const [renewalNotes, setRenewalNotes] = useState<string>("");
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Legal Documents State
  const [documents] = useState([
    {
      id: "DOC-01",
      name: "Surat Izin Usaha Perusahaan Angkutan Laut (SIUPAL)",
      number: "042/AL.001/DJPL/2021",
      issuedBy: "Kementerian Perhubungan RI",
      validUntil: "15 Agustus 2028",
      status: "verified",
      fileName: "SIUPAL_ASDP_2021_2028.pdf",
    },
    {
      id: "DOC-02",
      name: "Nomor Induk Berusaha (NIB) Berbasis Risiko",
      number: "9120003418291",
      issuedBy: "Kementerian Investasi / BKPM",
      validUntil: "Berlaku Selama Beroperasi",
      status: "verified",
      fileName: "NIB_ASDP_01.pdf",
    },
    {
      id: "DOC-03",
      name: "Surat Persetujuan Izin Trayek (SPIT) Lintas Merak-Bakauheni",
      number: "KP-812/DJPL/2024",
      issuedBy: "Dirjen Perhubungan Darat",
      validUntil: "31 Desember 2026",
      status: "verified",
      fileName: "SPIT_Merak_Bakauheni_2026.pdf",
    },
    {
      id: "DOC-04",
      name: "Sertifikat Manajemen Keselamatan (ISM Code DOC)",
      number: "DOC-SMS-99120",
      issuedBy: "BKI / Hubla",
      validUntil: "10 Oktober 2027",
      status: "verified",
      fileName: "ISM_Code_Safety_Doc.pdf",
    },
  ]);

  // PKS Contracts Dataset (Prioritas 3: Rujukan PDF Hal. 2, 6, 8)
  const [contracts, setContracts] = useState<PksContract[]>([
    {
      id: "PKS-01",
      contractNumber: "PKS/MRK/2026/014-ASDP",
      title: "Perjanjian Kerja Sama Pemanfaatan Fasilitas Dermaga Penyeberangan Lintas Merak - Bakauheni",
      firstParty: "UPTD Pengelolaan Pelabuhan Regional Banten & Bapenda",
      secondParty: "PT ASDP Indonesia Ferry (Persero) Cabang Merak",
      legalBasis: "PP No. 35/2023 & Perda Retribusi Daerah No. 1/2024",
      startDate: "01 Januari 2026",
      endDate: "31 Desember 2026",
      daysRemaining: 45,
      status: "expiring_soon",
      statusLabel: "Masa Berlaku Berakhir < 60 Hari (Perlu Perpanjangan)",
      monthlyQuota: 180,
      usedQuota: 132,
      fileName: "PKS_Dermaga_Merak_ASDP_2026.pdf",
      dockAllocation: "Dermaga 1, Dermaga 2, Dermaga Eksekutif 1",
    },
    {
      id: "PKS-02",
      contractNumber: "PKS/CWD/2025/088-ASDP",
      title: "PKS Penggunaan Dermaga Tambat Khusus Curah & Cadangan Musiman Ciwandan",
      firstParty: "Dinas Perhubungan & UPTD Pelabuhan Ciwandan",
      secondParty: "PT ASDP Indonesia Ferry (Persero)",
      legalBasis: "PP No. 35/2023 & Keputusan Bersama Angkutan Lebaran",
      startDate: "01 Juni 2025",
      endDate: "31 Mei 2027",
      daysRemaining: 196,
      status: "active",
      statusLabel: "Aktif & Beroperasi",
      monthlyQuota: 40,
      usedQuota: 18,
      fileName: "PKS_Ciwandan_Cadangan_ASDP.pdf",
      dockAllocation: "Dermaga Curah & Pelengsengan 2",
    },
  ]);

  // Kuota Slot Sandar per Armada
  const [fleetQuotas] = useState<FleetQuota[]>([
    {
      vesselId: "VES-01",
      vesselName: "KMP Baruna Jaya",
      gt: 1250,
      assignedRoute: "Merak ➔ Bakauheni (Dermaga 1)",
      monthlyQuota: 60,
      usedThisMonth: 46,
    },
    {
      vesselId: "VES-02",
      vesselName: "KMP Mutiara Persada",
      gt: 1800,
      assignedRoute: "Bakauheni ➔ Merak (Dermaga 2)",
      monthlyQuota: 60,
      usedThisMonth: 42,
    },
    {
      vesselId: "VES-03",
      vesselName: "KMP Nusantara Express",
      gt: 2100,
      assignedRoute: "Merak ➔ Bakauheni (Dermaga Eksekutif)",
      monthlyQuota: 45,
      usedThisMonth: 34,
    },
    {
      vesselId: "VES-04",
      vesselName: "KMP Portlink III",
      gt: 5200,
      assignedRoute: "Bakauheni ➔ Merak (Dermaga Eksekutif)",
      monthlyQuota: 15,
      usedThisMonth: 10,
    },
  ]);

  // Vessels Master Dataset
  const [vessels, setVessels] = useState<VesselMaster[]>([
    {
      id: "VES-01",
      name: "KMP Baruna Jaya",
      callSign: "PK-BJ92",
      imoNumber: "9120441",
      gt: 1250,
      loa: 72.5,
      breadth: 14.0,
      draft: 3.8,
      paxCapacity: 350,
      vehicleCapacity: 60,
      type: "Ro-Ro Passenger Ferry",
      seaworthyCertExpiry: "12 Okt 2027",
      status: "verified",
    },
    {
      id: "VES-02",
      name: "KMP Mutiara Persada",
      callSign: "PK-MP44",
      imoNumber: "8890212",
      gt: 1800,
      loa: 85.0,
      breadth: 15.5,
      draft: 4.2,
      paxCapacity: 500,
      vehicleCapacity: 80,
      type: "Ro-Ro Passenger Ferry",
      seaworthyCertExpiry: "04 Mar 2027",
      status: "verified",
    },
    {
      id: "VES-03",
      name: "KMP Nusantara Express",
      callSign: "PK-NE11",
      imoNumber: "9340552",
      gt: 2100,
      loa: 92.0,
      breadth: 16.0,
      draft: 4.5,
      paxCapacity: 650,
      vehicleCapacity: 110,
      type: "Super Ro-Ro Executive",
      seaworthyCertExpiry: "20 Des 2027",
      status: "verified",
    },
    {
      id: "VES-04",
      name: "KMP Samudra Raya",
      callSign: "PK-SR88",
      imoNumber: "8761109",
      gt: 950,
      loa: 64.0,
      breadth: 12.8,
      draft: 3.2,
      paxCapacity: 280,
      vehicleCapacity: 45,
      type: "Ro-Ro Ferry Reguler",
      seaworthyCertExpiry: "18 Agu 2027",
      status: "verified",
    },
  ]);

  // New Vessel Form State
  const [newVessel, setNewVessel] = useState({
    name: "",
    callSign: "",
    imoNumber: "",
    gt: 1500,
    loa: 75.0,
    breadth: 14.5,
    draft: 3.9,
    paxCapacity: 400,
    vehicleCapacity: 65,
    type: "Ro-Ro Passenger Ferry",
    seaworthyCertExpiry: "2027-11-16",
  });

  const handleAddVessel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVessel.name.trim()) return;

    const added: VesselMaster = {
      id: `VES-0${vessels.length + 1}`,
      name: newVessel.name,
      callSign: newVessel.callSign || "PK-NEW",
      imoNumber: newVessel.imoNumber || "9988771",
      gt: Number(newVessel.gt),
      loa: Number(newVessel.loa),
      breadth: Number(newVessel.breadth),
      draft: Number(newVessel.draft),
      paxCapacity: Number(newVessel.paxCapacity),
      vehicleCapacity: Number(newVessel.vehicleCapacity),
      type: newVessel.type,
      seaworthyCertExpiry: newVessel.seaworthyCertExpiry,
      status: "verified",
    };

    setVessels([...vessels, added]);
    setIsAddModalOpen(false);
    setSuccessToast(`Kapal ${newVessel.name} (${newVessel.gt} GT) berhasil didaftarkan ke Master Data Armada!`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const handleOpenRenewalModal = (contract: PksContract) => {
    setSelectedPksForRenewal(contract);
    setIsRenewalModalOpen(true);
  };

  const handleConfirmRenewal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPksForRenewal) return;

    // Simulate submission of renewal request
    setSuccessToast(
      `Permohonan perpanjangan kontrak PKS ${selectedPksForRenewal.contractNumber} berhasil diajukan ke UPTD Pelabuhan & Bapenda!`
    );
    setIsRenewalModalOpen(false);
    setSelectedPksForRenewal(null);
    setTimeout(() => setSuccessToast(null), 5000);
  };

  // Calculations for PKS Quota
  const totalMonthlyQuota = contracts.reduce((acc, c) => acc + c.monthlyQuota, 0);
  const totalUsedQuota = contracts.reduce((acc, c) => acc + c.usedQuota, 0);
  const remainingQuota = totalMonthlyQuota - totalUsedQuota;
  const overallUtilizationPct = ((totalUsedQuota / totalMonthlyQuota) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {successToast && (
        <div className="bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center justify-between animate-fade-in border border-emerald-500">
          <div className="flex items-center gap-3 text-xs font-semibold">
            <CheckCircle2 className="w-5 h-5 text-white" />
            <span>{successToast}</span>
          </div>
          <button
            onClick={() => setSuccessToast(null)}
            className="text-white hover:text-emerald-100 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TOP ELEVATED CONTROL DECK & SUB-MODULE TABS                                */}
      {/* ========================================================================= */}
      <div className="bg-white border border-[#CBD5E1] rounded-2xl p-3 sm:p-3.5 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#F1F5F9] rounded-xl border border-[#E2E8F0]">
          {/* Tab 1: PKS & Kontrak (Prioritas 3) */}
          <button
            type="button"
            onClick={() => setActiveTab("pks")}
            className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "pks"
                ? "bg-[#0B241E] text-white shadow-xs font-extrabold"
                : "text-[#64748B] hover:text-[#0B241E] hover:bg-white/70"
            }`}
          >
            <FileSignature className={`w-4 h-4 ${activeTab === "pks" ? "text-[#D97706]" : "text-[#64748B]"}`} />
            <span>Kontrak PKS & Kuota Sandar</span>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500 text-white">
              H-45
            </span>
          </button>

          {/* Tab 2: Profil & Legalitas */}
          <button
            type="button"
            onClick={() => setActiveTab("profil")}
            className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "profil"
                ? "bg-[#0B241E] text-white shadow-xs font-extrabold"
                : "text-[#64748B] hover:text-[#0B241E] hover:bg-white/70"
            }`}
          >
            <Building2 className={`w-4 h-4 ${activeTab === "profil" ? "text-[#D97706]" : "text-[#64748B]"}`} />
            <span>Legalitas Badan Usaha</span>
          </button>

          {/* Tab 3: Master Data Armada */}
          <button
            type="button"
            onClick={() => setActiveTab("armada")}
            className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "armada"
                ? "bg-[#0B241E] text-white shadow-xs font-extrabold"
                : "text-[#64748B] hover:text-[#0B241E] hover:bg-white/70"
            }`}
          >
            <Ship className={`w-4 h-4 ${activeTab === "armada" ? "text-[#D97706]" : "text-[#64748B]"}`} />
            <span>Master Data Armada ({vessels.length})</span>
          </button>
        </div>

        {/* Sub-header status badge */}
        <div className="flex items-center gap-2 text-xs text-[#64748B] px-2">
          <span className="text-[11px] font-mono text-[#0B241E] font-bold bg-[#F8FAFC] border border-[#CBD5E1] px-2.5 py-1 rounded-lg flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Pola MARS: Kontrak, Permohonan, & Pengingat Perpanjangan</span>
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: KONTRAK PKS & ALOKASI KUOTA SLOT SANDAR (PRIORITAS 3)              */}
      {/* ========================================================================= */}
      {activeTab === "pks" && (
        <div className="space-y-6">
          {/* H-30/H-45 RENEWAL REMINDER BANNER */}
          <div className="bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent border-l-4 border-amber-500 p-5 rounded-2xl bg-white border border-[#CBD5E1] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-800 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black text-[#0B241E]">
                    Peringatan Masa Berlaku PKS (Renewal Reminder)
                  </h3>
                  <span className="bg-amber-100 text-amber-800 text-[10px] font-mono font-bold px-2 py-0.5 rounded">
                    Sisa 45 Hari Kerja
                  </span>
                </div>
                <p className="text-xs text-[#475569] mt-1 max-w-3xl leading-relaxed">
                  Perjanjian Kerja Sama Pemanfaatan Fasilitas Dermaga Merak (<strong>PKS/MRK/2026/014-ASDP</strong>) akan berakhir pada <strong>31 Desember 2026</strong>. Berdasarkan SOP Pelabuhan Pemda, pengajuan addendum / perpanjangan disarankan <strong>H-30</strong> sebelum jatuh tempo agar kuota jadwal sandar 2027 tidak terhenti.
                </p>
              </div>
            </div>

            <button
              onClick={() => handleOpenRenewalModal(contracts[0])}
              className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-extrabold rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer shrink-0 self-start md:self-auto"
            >
              <FileSignature className="w-4 h-4" />
              <span>Ajukan Perpanjangan PKS</span>
            </button>
          </div>

          {/* KPI QUOTA CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* KPI 1: Kontrak PKS Aktif */}
            <div className="bg-white border border-[#CBD5E1] rounded-2xl p-4 shadow-xs">
              <span className="text-[10px] font-mono uppercase font-bold text-[#94A3B8] block">
                Kontrak PKS Terdaftar
              </span>
              <p className="text-2xl font-black text-[#0B241E] mt-1 font-mono">
                {contracts.length} Dokumen
              </p>
              <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Terikat SPIT Kemenhub</span>
              </span>
            </div>

            {/* KPI 2: Total Kuota Bulanan */}
            <div className="bg-white border border-[#CBD5E1] rounded-2xl p-4 shadow-xs">
              <span className="text-[10px] font-mono uppercase font-bold text-[#94A3B8] block">
                Total Kuota Slot Sandar
              </span>
              <p className="text-2xl font-black text-[#0B241E] mt-1 font-mono">
                {totalMonthlyQuota} Slot / Bulan
              </p>
              <span className="text-[10px] text-[#64748B]">Semua armada & dermaga</span>
            </div>

            {/* KPI 3: Realisasi Kuota Terpakai */}
            <div className="bg-white border border-[#CBD5E1] rounded-2xl p-4 shadow-xs">
              <span className="text-[10px] font-mono uppercase font-bold text-[#94A3B8] block">
                Realisasi Pemakaian Bulan Ini
              </span>
              <p className="text-2xl font-black text-[#0284C7] mt-1 font-mono">
                {totalUsedQuota} Slot ({overallUtilizationPct}%)
              </p>
              <span className="text-[10px] text-blue-700 font-semibold">Tercatat di Log ATA/ATD</span>
            </div>

            {/* KPI 4: Sisa Kuota Slot */}
            <div className="bg-white border border-[#CBD5E1] rounded-2xl p-4 shadow-xs">
              <span className="text-[10px] font-mono uppercase font-bold text-[#94A3B8] block">
                Sisa Alokasi Slot Sandar
              </span>
              <p className="text-2xl font-black text-emerald-700 mt-1 font-mono">
                {remainingQuota} Slot
              </p>
              <span className="text-[10px] text-[#64748B]">Hingga akhir November</span>
            </div>
          </div>

          {/* SECTION 1: DAFTAR KONTRAK PKS BERJALAN */}
          <div className="bg-white border border-[#CBD5E1] rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F1F5F9] pb-4">
              <div>
                <h3 className="text-sm font-extrabold text-[#0B241E] uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#D97706]" />
                  <span>Daftar Perjanjian Kerja Sama (PKS) Fasilitas Dermaga</span>
                </h3>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Perikatan hukum antara operator kapal dengan Pengelola Pelabuhan Pemda dan Bapenda untuk jaminan ketersediaan slot sandar.
                </p>
              </div>

              <button
                onClick={() => alert("Mengunduh seluruh arsip naskah PKS dan lampiran teknis (ZIP)...")}
                className="px-3.5 py-2 bg-[#F8FAFC] hover:bg-[#E2E8F0] border border-[#CBD5E1] text-[#0B241E] text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
              >
                <Download className="w-4 h-4 text-[#64748B]" />
                <span>Unduh Semua Berkas PKS</span>
              </button>
            </div>

            {/* Contracts List */}
            <div className="space-y-4">
              {contracts.map((c) => (
                <div
                  key={c.id}
                  className="border border-[#CBD5E1] rounded-xl p-5 hover:border-[#0B241E] transition-all bg-[#F8FAFC]/50 space-y-4"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-[#E2E8F0] pb-3">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-xs font-bold bg-[#0B241E] text-[#D97706] px-2 py-0.5 rounded">
                          {c.contractNumber}
                        </span>
                        <h4 className="font-extrabold text-sm text-[#0B241E]">{c.title}</h4>
                      </div>
                      <p className="text-[11px] text-[#64748B] mt-1">
                        Pihak I: <strong>{c.firstParty}</strong> • Pihak II: <strong>{c.secondParty}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-mono font-bold px-3 py-1 rounded-full ${
                          c.status === "expiring_soon"
                            ? "bg-amber-100 text-amber-900 border border-amber-300"
                            : "bg-emerald-100 text-emerald-800 border border-emerald-300"
                        }`}
                      >
                        {c.statusLabel}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
                    <div>
                      <span className="text-[#94A3B8] block text-[10px] uppercase font-bold">Masa Berlaku PKS</span>
                      <p className="font-mono text-[#0B241E] font-bold mt-0.5">
                        {c.startDate} s/d {c.endDate}
                      </p>
                      <p className="text-[10px] text-[#64748B]">Durasi: 12 Bulan (1 Tahun)</p>
                    </div>

                    <div>
                      <span className="text-[#94A3B8] block text-[10px] uppercase font-bold">Dasar Regulasi Retribusi</span>
                      <p className="text-[#0B241E] font-semibold mt-0.5">{c.legalBasis}</p>
                      <p className="text-[10px] text-[#64748B]">Tarif per GT per Jam Resmi</p>
                    </div>

                    <div>
                      <span className="text-[#94A3B8] block text-[10px] uppercase font-bold">Alokasi Dermaga Terikat</span>
                      <p className="text-[#0284C7] font-bold mt-0.5">{c.dockAllocation}</p>
                      <p className="text-[10px] text-[#64748B]">Berdasarkan SPIT Ditjen Hubdat</p>
                    </div>

                    <div>
                      <span className="text-[#94A3B8] block text-[10px] uppercase font-bold">Realisasi Kuota PKS</span>
                      <div className="mt-1 flex items-center justify-between text-xs font-bold font-mono">
                        <span>{c.usedQuota} / {c.monthlyQuota} Slot</span>
                        <span className="text-[#0284C7]">{Math.round((c.usedQuota / c.monthlyQuota) * 100)}%</span>
                      </div>
                      <div className="w-full h-2 bg-[#E2E8F0] rounded-full overflow-hidden mt-1">
                        <div
                          className="h-full bg-[#0B241E] rounded-full"
                          style={{ width: `${(c.usedQuota / c.monthlyQuota) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions & File Link */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-[#E2E8F0] text-xs">
                    <div className="flex items-center gap-2 text-[#475569]">
                      <FileCheck className="w-4 h-4 text-emerald-600" />
                      <span className="font-mono text-[11px]">{c.fileName}</span>
                      <button
                        onClick={() => alert(`Mengunduh salinan naskah PKS resmi: ${c.fileName}`)}
                        className="text-[#0284C7] hover:underline font-bold ml-2 cursor-pointer"
                      >
                        Lihat Naskah Lengkap
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      {c.status === "expiring_soon" && (
                        <button
                          onClick={() => handleOpenRenewalModal(c)}
                          className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-extrabold rounded-lg shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <FileSignature className="w-3.5 h-3.5" />
                          <span>Ajukan Perpanjangan Sekarang</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 2: PEMANTAUAN KUOTA SLOT PER ARMADA KAPAL */}
          <div className="bg-white border border-[#CBD5E1] rounded-2xl p-6 shadow-xs space-y-4">
            <div className="border-b border-[#F1F5F9] pb-3">
              <h3 className="text-sm font-extrabold text-[#0B241E] uppercase tracking-wider flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#D97706]" />
                <span>Monitoring Realisasi Kuota Slot Sandar Bulanan per Kapal</span>
              </h3>
              <p className="text-xs text-[#64748B] mt-0.5">
                Pengendalian giliran pelayanan untuk mencegah over-slotting dan memastikan kepatuhan jadwal lintasan terpadu.
              </p>
            </div>

            <div className="overflow-x-auto border border-[#E2E8F0] rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#0B241E] text-white text-[11px] font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Nama Armada Kapal</th>
                    <th className="py-3 px-4 text-right">Ukuran GT</th>
                    <th className="py-3 px-4">Lintasan & Dermaga Alokasi</th>
                    <th className="py-3 px-4 text-center">Kuota Bulanan</th>
                    <th className="py-3 px-4 text-center">Terpakai</th>
                    <th className="py-3 px-4">Utilisasi Kuota</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {fleetQuotas.map((fq) => {
                    const pct = Math.round((fq.usedThisMonth / fq.monthlyQuota) * 100);
                    return (
                      <tr key={fq.vesselId} className="hover:bg-[#F8FAFC] transition-colors">
                        <td className="py-3 px-4 font-bold text-[#0B241E]">
                          <div className="flex items-center gap-2">
                            <Ship className="w-4 h-4 text-[#D97706]" />
                            <span>{fq.vesselName}</span>
                          </div>
                        </td>

                        <td className="py-3 px-4 text-right font-mono font-bold text-[#0B241E]">
                          {fq.gt.toLocaleString()} GT
                        </td>

                        <td className="py-3 px-4 text-[#475569]">
                          {fq.assignedRoute}
                        </td>

                        <td className="py-3 px-4 text-center font-mono font-bold text-[#0B241E]">
                          {fq.monthlyQuota} Slot
                        </td>

                        <td className="py-3 px-4 text-center font-mono font-bold text-[#0284C7]">
                          {fq.usedThisMonth} Slot
                        </td>

                        <td className="py-3 px-4 min-w-[140px]">
                          <div className="flex items-center justify-between text-[11px] font-mono font-bold mb-1">
                            <span className="text-[#475569]">{fq.monthlyQuota - fq.usedThisMonth} Sisa</span>
                            <span className={pct > 80 ? "text-amber-700" : "text-emerald-700"}>{pct}%</span>
                          </div>
                          <div className="w-full h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                pct > 80 ? "bg-amber-500" : "bg-[#0B241E]"
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </td>

                        <td className="py-3 px-4 text-center">
                          <span
                            className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full ${
                              pct >= 90
                                ? "bg-amber-100 text-amber-800"
                                : "bg-emerald-100 text-emerald-800"
                            }`}
                          >
                            {pct >= 90 ? "Hampir Penuh" : "Sesuai Jadwal"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PROFIL PERUSAHAAN & LEGALITAS BADAN USAHA                           */}
      {/* ========================================================================= */}
      {activeTab === "profil" && (
        <section className="bg-white border border-[#CBD5E1] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F1F5F9] pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#0B241E] text-[#D97706] flex items-center justify-center font-black text-lg shadow-sm">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-extrabold text-[#0B241E]">
                    PT ASDP Indonesia Ferry (Persero)
                  </h2>
                  <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-700" />
                    <span>Terverifikasi Bapenda & Dinas</span>
                  </span>
                </div>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Operator Resmi Angkutan Penyeberangan Wilayah Regional Banten - Lampung
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setSuccessToast("Dokumen legalitas perusahaan telah disinkronkan dengan database Kemenhub.");
                  setTimeout(() => setSuccessToast(null), 3000);
                }}
                className="px-3.5 py-2 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0B241E] text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <FileUp className="w-4 h-4 text-[#D97706]" />
                <span>Unggah Pembaruan Dokumen</span>
              </button>
            </div>
          </div>

          {/* Company Attributes Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0]">
            <div>
              <span className="text-[#94A3B8] block text-[10px] uppercase font-bold">Nomor SIUPAL</span>
              <strong className="text-[#0B241E] font-mono text-xs">042/AL.001/DJPL/2021</strong>
            </div>
            <div>
              <span className="text-[#94A3B8] block text-[10px] uppercase font-bold">Nomor Induk Berusaha (NIB)</span>
              <strong className="text-[#0B241E] font-mono text-xs">9120003418291</strong>
            </div>
            <div>
              <span className="text-[#94A3B8] block text-[10px] uppercase font-bold">NPWP Badan Usaha</span>
              <strong className="text-[#0B241E] font-mono text-xs">01.234.567.8-012.000</strong>
            </div>
            <div>
              <span className="text-[#94A3B8] block text-[10px] uppercase font-bold">Kantor Operasional Cabang</span>
              <strong className="text-[#0B241E]">Jl. Pelabuhan Merak No. 1, Cilegon</strong>
            </div>
          </div>

          {/* Legal Documents Table */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold text-[#0B241E] uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#D97706]" />
              <span>Dokumen Perizinan & Kelaiklautan Perusahaan</span>
            </h3>

            <div className="overflow-x-auto border border-[#E2E8F0] rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                    <th className="py-2.5 px-4">Nama Dokumen Izin</th>
                    <th className="py-2.5 px-4 font-mono">Nomor Registrasi</th>
                    <th className="py-2.5 px-4">Instansi Penerbit</th>
                    <th className="py-2.5 px-4">Masa Berlaku</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4 text-center">Berkas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {documents.map((doc) => (
                    <tr key={doc.id} className="hover:bg-[#F8FAFC]/80 transition-colors">
                      <td className="py-3 px-4 font-bold text-[#0B241E]">{doc.name}</td>
                      <td className="py-3 px-4 font-mono text-[#475569]">{doc.number}</td>
                      <td className="py-3 px-4 text-[#64748B]">{doc.issuedBy}</td>
                      <td className="py-3 px-4 text-[#64748B] font-mono">{doc.validUntil}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Sah & Aktif
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => alert(`Mengunduh berkas salinan resmi: ${doc.fileName}`)}
                          className="p-1.5 rounded-lg bg-[#F1F5F9] hover:bg-[#0B241E] hover:text-white text-[#475569] transition-colors cursor-pointer"
                          title="Unduh Salinan PDF"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: MASTER DATA ARMADA KAPAL                                           */}
      {/* ========================================================================= */}
      {activeTab === "armada" && (
        <section className="bg-white border border-[#CBD5E1] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F1F5F9] pb-4">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#0B241E] flex items-center gap-2">
                <Ship className="w-4 h-4 text-[#D97706]" />
                <span>Master Data Armada Kapal (Spesifikasi Ukuran & GT)</span>
              </span>
              <p className="text-xs text-[#64748B] mt-0.5">
                Dimensi Gross Tonnage (GT) dan panjang kapal (LOA) menjadi dasar perhitungan tarif retribusi sandar & tambat (PP No. 35/2023).
              </p>
            </div>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2.5 bg-[#0B241E] hover:bg-[#143E33] text-white text-xs font-extrabold rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4 text-[#D97706]" />
              <span>+ Daftarkan Kapal Baru</span>
            </button>
          </div>

          {/* Vessel Table */}
          <div className="overflow-x-auto border border-[#E2E8F0] rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#0B241E] text-white text-[11px] font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Nama Kapal & Tipe</th>
                  <th className="py-3 px-4 font-mono">Call Sign / IMO</th>
                  <th className="py-3 px-4 text-right">Ukuran GT</th>
                  <th className="py-3 px-4 text-right">Dimensi (LOA x B x D)</th>
                  <th className="py-3 px-4 text-center">Kapasitas Muatan</th>
                  <th className="py-3 px-4">Sertifikat Keselamatan</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {vessels.map((v) => (
                  <tr key={v.id} className="hover:bg-[#F8FAFC]/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-[#0B241E]">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#0B241E] text-[#D97706] flex items-center justify-center font-bold text-xs shrink-0">
                          <Ship className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-extrabold text-[#0B241E]">{v.name}</p>
                          <p className="text-[10px] text-[#64748B]">{v.type}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[#475569]">
                      <p>{v.callSign}</p>
                      <p className="text-[10px] text-[#94A3B8]">IMO: {v.imoNumber}</p>
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-extrabold text-[#0B241E] text-sm">
                      {v.gt.toLocaleString()} GT
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono text-[#475569]">
                      <p>{v.loa}m x {v.breadth}m</p>
                      <p className="text-[10px] text-[#94A3B8]">Draft: {v.draft}m</p>
                    </td>

                    <td className="py-3.5 px-4 text-center text-[#475569]">
                      <p className="font-semibold text-[#0B241E]">{v.paxCapacity} Pax</p>
                      <p className="text-[10px] text-[#64748B]">{v.vehicleCapacity} Kendaraan</p>
                    </td>

                    <td className="py-3.5 px-4 text-[#64748B]">
                      <p className="font-mono text-[11px] text-[#0B241E]">Berlaku s/d:</p>
                      <p className="font-mono text-[10px] text-[#0284C7]">{v.seaworthyCertExpiry}</p>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Klaik Laut
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* MODAL: AJUKAN PERPANJANGAN PKS (RENEWAL REQUEST)                          */}
      {/* ========================================================================= */}
      {isRenewalModalOpen && selectedPksForRenewal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-5 border border-[#CBD5E1] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-800 flex items-center justify-center font-bold text-xs">
                  <FileSignature className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-[#0B241E]">
                    Permohonan Perpanjangan Perjanjian Kerja Sama (PKS)
                  </h3>
                  <span className="font-mono text-xs text-[#64748B]">
                    {selectedPksForRenewal.contractNumber}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsRenewalModalOpen(false)}
                className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0B241E]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmRenewal} className="space-y-4 text-xs">
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1">
                <span className="font-bold text-amber-950 block">Perikatan Saat Ini:</span>
                <p className="text-amber-900">{selectedPksForRenewal.title}</p>
                <p className="font-mono text-[11px] text-amber-800">
                  Jatuh tempo: {selectedPksForRenewal.endDate} (Tersisa {selectedPksForRenewal.daysRemaining} Hari)
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0B241E] mb-1">
                  Usulan Durasi Perpanjangan Kontrak
                </label>
                <select
                  value={renewalYears}
                  onChange={(e) => setRenewalYears(Number(e.target.value))}
                  className="w-full text-xs font-semibold p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#0B241E]"
                >
                  <option value={1}>1 Tahun Kalender (1 Jan 2027 s/d 31 Des 2027)</option>
                  <option value={2}>2 Tahun Kalender (1 Jan 2027 s/d 31 Des 2028)</option>
                  <option value={3}>3 Tahun Kalender (Jangka Menengah)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0B241E] mb-1">
                  Usulan Penyesuaian Kuota Slot Sandar Bulanan
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    defaultValue={selectedPksForRenewal.monthlyQuota}
                    className="w-32 text-xs font-bold p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-center"
                  />
                  <span className="text-[#64748B]">Slot per Bulan (Saat ini: {selectedPksForRenewal.monthlyQuota} slot)</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0B241E] mb-1">
                  Catatan Justifikasi / Kebutuhan Operasional Tambahan
                </label>
                <textarea
                  rows={3}
                  value={renewalNotes}
                  onChange={(e) => setRenewalNotes(e.target.value)}
                  placeholder="Contoh: Mengantisipasi penambahan 1 unit armada Super Ro-Ro pada triwulan II 2027..."
                  className="w-full text-xs font-semibold p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#0B241E]"
                />
              </div>

              <div className="p-3 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl space-y-1">
                <span className="font-bold text-[#0B241E] block">Dokumen Wajib yang Disertakan Otomatis:</span>
                <p className="text-[11px] text-[#64748B]">
                  • SPIT Aktif Ditjen Hubdat (KP-812/DJPL/2024)<br />
                  • Rekap Realisasi Kunjungan Kapal 2026 (100% Bebas Tunggakan Retribusi)
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F1F5F9]">
                <button
                  type="button"
                  onClick={() => setIsRenewalModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-[#64748B] hover:text-[#0B241E]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#0B241E] hover:bg-[#143E33] text-white text-xs font-extrabold rounded-xl shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4 text-[#D97706]" />
                  <span>Kirim Permohonan Perpanjangan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DAFTARKAN KAPAL BARU                                               */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-5 border border-[#CBD5E1] shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#0B241E] text-[#D97706] flex items-center justify-center font-bold text-xs">
                  <Ship className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-sm text-[#0B241E]">
                  Registrasi Master Data Armada Kapal Baru
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0B241E]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddVessel} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#0B241E] mb-1">
                    Nama Kapal <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: KMP Dharma Rucitra"
                    value={newVessel.name}
                    onChange={(e) => setNewVessel({ ...newVessel, name: e.target.value })}
                    className="w-full text-xs font-semibold p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#0B241E]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0B241E] mb-1">
                    Call Sign Radio
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: PK-DR99"
                    value={newVessel.callSign}
                    onChange={(e) => setNewVessel({ ...newVessel, callSign: e.target.value })}
                    className="w-full text-xs font-semibold p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#0B241E]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#0B241E] mb-1">
                    Gross Tonnage (GT) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={newVessel.gt}
                    onChange={(e) => setNewVessel({ ...newVessel, gt: Number(e.target.value) })}
                    className="w-full text-xs font-semibold p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#0B241E]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0B241E] mb-1">
                    Panjang LOA (m)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newVessel.loa}
                    onChange={(e) => setNewVessel({ ...newVessel, loa: Number(e.target.value) })}
                    className="w-full text-xs font-semibold p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#0B241E]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0B241E] mb-1">
                    Sarat Draft (m)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newVessel.draft}
                    onChange={(e) => setNewVessel({ ...newVessel, draft: Number(e.target.value) })}
                    className="w-full text-xs font-semibold p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#0B241E]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#0B241E] mb-1">
                    Kapasitas Penumpang (Pax)
                  </label>
                  <input
                    type="number"
                    value={newVessel.paxCapacity}
                    onChange={(e) => setNewVessel({ ...newVessel, paxCapacity: Number(e.target.value) })}
                    className="w-full text-xs font-semibold p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#0B241E]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0B241E] mb-1">
                    Kapasitas Kendaraan Campuran
                  </label>
                  <input
                    type="number"
                    value={newVessel.vehicleCapacity}
                    onChange={(e) => setNewVessel({ ...newVessel, vehicleCapacity: Number(e.target.value) })}
                    className="w-full text-xs font-semibold p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#0B241E]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F1F5F9]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-[#64748B] hover:text-[#0B241E]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#0B241E] hover:bg-[#143E33] text-white text-xs font-extrabold rounded-xl shadow-xs"
                >
                  Simpan Armada Kapal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
