"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  FileText,
  Ship,
  Building2,
  User,
  Phone,
  Mail,
  FileCheck2,
  Eye,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Check,
  X,
  FileUp,
  Download,
  AlertCircle,
  Sparkles,
  RefreshCw,
  Lock,
} from "lucide-react";

interface RegistrationEntity {
  id: string;
  regNumber: string;
  submittedAt: string;
  status: "PENDING" | "VERIFIED" | "REJECTED";
  // PIC
  picName: string;
  picRole: string;
  email: string;
  phone: string;
  // Perusahaan
  companyName: string;
  businessType: string;
  siupalNumber: string;
  nibNumber: string;
  npwpNumber: string;
  companyAddress: string;
  siupalFile: string;
  npwpFile: string;
  // Kapal
  vesselName: string;
  callSign: string;
  imoNumber: string;
  vesselType: string;
  gt: number;
  loa: number;
  draft: number;
  paxCapacity: number;
  vehicleCapacity: number;
  suratUkurFile: string;
  pasKapalFile: string;
  // Audit & Notes
  verifiedAt?: string;
  verifiedBy?: string;
  rejectionReason?: string;
  officerNotes?: string;
}

const INITIAL_REGISTRATIONS: RegistrationEntity[] = [
  {
    id: "reg-1",
    regNumber: "REG-KPL-2026-5978",
    submittedAt: "Hari ini, 15:30 WIB",
    status: "PENDING",
    picName: "Capt. M. Farhan Hidayat",
    picRole: "Kepala Cabang & Operasional Armada",
    email: "ops@pelayaran-nusantara.co.id",
    phone: "0812-9840-2911",
    companyName: "PT Pelayaran Nusantara Bahari Mandiri",
    businessType: "Perseroan Terbatas (PT)",
    siupalNumber: "SIUPAL/198/AL.001/PHB-2024",
    nibNumber: "9120003418291",
    npwpNumber: "01.234.567.8-012.000",
    companyAddress: "Jl. Pelabuhan Penyeberangan No. 45, Dermaga Utama",
    siupalFile: "SIUPAL_Resmi_Kemenhub_2024.pdf",
    npwpFile: "NPWP_Badan_Usaha_PT_PNBM.pdf",
    vesselName: "KMP Baruna Perkasa I",
    callSign: "PK-BP01",
    imoNumber: "9120489",
    vesselType: "Ro-Ro Passenger Ferry",
    gt: 1450,
    loa: 74.0,
    draft: 3.9,
    paxCapacity: 380,
    vehicleCapacity: 65,
    suratUkurFile: "Surat_Ukur_No_3892_DJPL.pdf",
    pasKapalFile: "Pas_Besar_Kelaiklautan_2024.pdf",
    officerNotes: "Uji fisik GT kapal sesuai dengan manifes uji petik Ditjen Hubla.",
  },
  {
    id: "reg-2",
    regNumber: "REG-KPL-2026-4819",
    submittedAt: "Hari ini, 11:15 WIB",
    status: "PENDING",
    picName: "H. Bambang Sugiarto",
    picRole: "Direktur Operasional",
    email: "ops@samudera-logistik.co.id",
    phone: "0813-8821-4402",
    companyName: "PT Samudera Logistik Maritim Indonesia",
    businessType: "Perseroan Terbatas (PT)",
    siupalNumber: "SIUPAL/412/AL.002/PHB-2023",
    nibNumber: "8120009841103",
    npwpNumber: "02.891.234.5-014.000",
    companyAddress: "Kawasan Industri Maritim Blok C No. 12",
    siupalFile: "SIUPAL_Samudera_Logistik.pdf",
    npwpFile: "NPWP_Badan_SLM.pdf",
    vesselName: "KM Samudera Sejahtera IV",
    callSign: "PK-SS04",
    imoNumber: "8914022",
    vesselType: "General Cargo / Klotok",
    gt: 820,
    loa: 58.5,
    draft: 3.2,
    paxCapacity: 12,
    vehicleCapacity: 0,
    suratUkurFile: "Surat_Ukur_KM_Samudera.pdf",
    pasKapalFile: "Pas_Besar_KM_Samudera.pdf",
    officerNotes: "",
  },
  {
    id: "reg-3",
    regNumber: "REG-KPL-2026-3201",
    submittedAt: "Kemarin, 16:45 WIB",
    status: "PENDING",
    picName: "Suryadi Pratama",
    picRole: "Manajer Armada Koperasi",
    email: "koperasi.selatsunda@gmail.com",
    phone: "0857-1123-9988",
    companyName: "Koperasi Jasa Angkutan Laut Selat Sunda",
    businessType: "Koperasi Jasa Angkutan Laut",
    siupalNumber: "SIOPSUS/088/PELRA/2024",
    nibNumber: "0220005519821",
    npwpNumber: "03.441.789.0-019.000",
    companyAddress: "Dermaga Rakyat Pesisir Barat No. 8",
    siupalFile: "SIOPSUS_Koperasi_2024.pdf",
    npwpFile: "NPWP_Koperasi_SelatSunda.pdf",
    vesselName: "KM Selat Berkah 02",
    callSign: "PK-SB02",
    imoNumber: "-",
    vesselType: "Fast Ferry / Speedboat",
    gt: 450,
    loa: 38.0,
    draft: 2.1,
    paxCapacity: 180,
    vehicleCapacity: 0,
    suratUkurFile: "Surat_Ukur_Selat_Berkah.pdf",
    pasKapalFile: "Pas_Kecil_Selat_Berkah.pdf",
    officerNotes: "",
  },
  {
    id: "reg-4",
    regNumber: "REG-KPL-2026-1104",
    submittedAt: "14 Nov 2026, 09:20 WIB",
    status: "VERIFIED",
    picName: "Ir. Hendra Gunawan",
    picRole: "General Manager Cabang Utama",
    email: "operasional@asdp-ferry.co.id",
    phone: "0811-9201-8841",
    companyName: "PT ASDP Indonesia Ferry (Persero)",
    businessType: "BUMN / BUMD Perhubungan",
    siupalNumber: "SIUPAL/001/BUMN/PHB-2020",
    nibNumber: "0100001000001",
    npwpNumber: "01.000.123.4-001.000",
    companyAddress: "Jl. Jenderal Ahmad Yani No. 1, Jakarta Pusat",
    siupalFile: "SIUPAL_ASDP_Induk.pdf",
    npwpFile: "NPWP_ASDP_Pusat.pdf",
    vesselName: "KMP Portlink III",
    callSign: "PK-PL03",
    imoNumber: "9518042",
    vesselType: "Ro-Ro Passenger Ferry",
    gt: 5200,
    loa: 122.5,
    draft: 4.8,
    paxCapacity: 950,
    vehicleCapacity: 180,
    suratUkurFile: "Surat_Ukur_Portlink_III.pdf",
    pasKapalFile: "Pas_Besar_Portlink_III.pdf",
    verifiedAt: "14 Nov 2026, 11:00 WIB",
    verifiedBy: "Capt. Ridwan Hakim (NIP: 19780412 200212 1 003)",
    officerNotes: "Legalitas BUMN valid dan telah diverifikasi silang dengan Ditjen Hubla.",
  },
  {
    id: "reg-5",
    regNumber: "REG-KPL-2026-0922",
    submittedAt: "12 Nov 2026, 14:10 WIB",
    status: "REJECTED",
    picName: "Rustam Efendi",
    picRole: "Pemilik Usaha",
    email: "rustam.bahari@yahoo.co.id",
    phone: "0821-4455-6677",
    companyName: "CV Sumber Rejeki Bahari",
    businessType: "Commanditaire Vennootschap (CV)",
    siupalNumber: "SIUPAL/044/AL.001/PHB-2019",
    nibNumber: "9120001188220",
    npwpNumber: "04.551.980.2-021.000",
    companyAddress: "Jl. Nelayan Bahari No. 19",
    siupalFile: "SIUPAL_Lama_2019.pdf",
    npwpFile: "NPWP_CV_SRB.pdf",
    vesselName: "KM Bintang Timur",
    callSign: "PK-BT09",
    imoNumber: "-",
    vesselType: "General Cargo / Klotok",
    gt: 240,
    loa: 28.0,
    draft: 1.8,
    paxCapacity: 8,
    vehicleCapacity: 0,
    suratUkurFile: "Surat_Ukur_BT.pdf",
    pasKapalFile: "Pas_Kecil_BT.pdf",
    rejectionReason:
      "Masa berlaku SIUPAL telah kedaluwarsa per 31 Oktober 2026. Harap unggah perpanjangan SIUPAL resmi dari OSS RBA / Kemenhub.",
    verifiedAt: "13 Nov 2026, 10:30 WIB",
    verifiedBy: "Capt. Ridwan Hakim (Supervisor Sif 1)",
  },
];

export default function UptVerifikasiPage() {
  const [registrations, setRegistrations] = useState<RegistrationEntity[]>(INITIAL_REGISTRATIONS);
  const [activeTab, setActiveTab] = useState<"ALL" | "PENDING" | "VERIFIED" | "REJECTED">("PENDING");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedEntity, setSelectedEntity] = useState<RegistrationEntity | null>(null);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState<boolean>(false);
  const [rejectionInput, setRejectionInput] = useState<string>("");
  const [notification, setNotification] = useState<string | null>(null);

  // Filter Data
  const filteredData = registrations.filter((item) => {
    const matchesTab = activeTab === "ALL" || item.status === activeTab;
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      item.companyName.toLowerCase().includes(q) ||
      item.regNumber.toLowerCase().includes(q) ||
      item.picName.toLowerCase().includes(q) ||
      item.vesselName.toLowerCase().includes(q) ||
      item.siupalNumber.toLowerCase().includes(q);
    return matchesTab && matchesQuery;
  });

  const pendingCount = registrations.filter((r) => r.status === "PENDING").length;
  const verifiedCount = registrations.filter((r) => r.status === "VERIFIED").length;
  const rejectedCount = registrations.filter((r) => r.status === "REJECTED").length;

  const triggerToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4500);
  };

  // Action: Approve
  const handleApprove = (id: string) => {
    setRegistrations((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: "VERIFIED",
              verifiedAt: "Hari ini, " + new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB",
              verifiedBy: "Capt. Ridwan Hakim (Supervisor Jaga Sif 1)",
            }
          : item
      )
    );

    const approvedItem = registrations.find((r) => r.id === id);
    if (selectedEntity && selectedEntity.id === id) {
      setSelectedEntity((prev) =>
        prev
          ? {
              ...prev,
              status: "VERIFIED",
              verifiedAt: "Hari ini, " + new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB",
              verifiedBy: "Capt. Ridwan Hakim (Supervisor Jaga Sif 1)",
            }
          : null
      );
    }

    triggerToast(
      `Pendaftaran ${approvedItem?.companyName || "Operator"} berhasil disahkan! Akun telah diaktifkan dan notifikasi resmi terkirim ke email PIC.`
    );
  };

  // Action: Reject
  const handleConfirmReject = () => {
    if (!selectedEntity) return;
    const reason = rejectionInput.trim() || "Dokumen belum memenuhi persyaratan legalitas PP No. 35/2023.";

    setRegistrations((prev) =>
      prev.map((item) =>
        item.id === selectedEntity.id
          ? {
              ...item,
              status: "REJECTED",
              rejectionReason: reason,
              verifiedAt: "Hari ini, " + new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB",
              verifiedBy: "Capt. Ridwan Hakim (Supervisor Jaga Sif 1)",
            }
          : item
      )
    );

    setSelectedEntity((prev) =>
      prev
        ? {
            ...prev,
            status: "REJECTED",
            rejectionReason: reason,
            verifiedAt: "Hari ini, " + new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB",
            verifiedBy: "Capt. Ridwan Hakim (Supervisor Jaga Sif 1)",
          }
        : null
    );

    setIsRejectModalOpen(false);
    setRejectionInput("");
    triggerToast(
      `Pendaftaran ${selectedEntity.companyName} ditolak. Pemberitahuan alasan perbaikan telah dikirim ke PIC operasional.`
    );
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 bg-[#0B241E] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-emerald-500/40 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 max-w-md">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <p className="text-xs leading-relaxed text-emerald-100">{notification}</p>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-white ml-auto"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. Header Banner & Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
              Menunggu Verifikasi
            </span>
            <p className="text-2xl font-black text-[#D97706] mt-1">{pendingCount} Entitas</p>
            <span className="text-[10px] text-slate-500">Antrean berkas baru pendaftar</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-[#D97706] flex items-center justify-center">
            <Clock className="w-6 h-6 animate-pulse" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
              Disahkan (Aktif)
            </span>
            <p className="text-2xl font-black text-emerald-700 mt-1">{verifiedCount} Operator</p>
            <span className="text-[10px] text-slate-500">Akses izin sandar terbuka</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
              Ditolak / Revisi
            </span>
            <p className="text-2xl font-black text-rose-700 mt-1">{rejectedCount} Berkas</p>
            <span className="text-[10px] text-slate-500">Dokumen kedaluwarsa/buram</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center">
            <XCircle className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
              SLA Verifikasi Fisik
            </span>
            <p className="text-2xl font-black text-[#0B241E] mt-1">4.2 Jam</p>
            <span className="text-[10px] text-emerald-600 font-bold">Target SLA &lt; 24 Jam Kerja</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 text-[#0B241E] flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-[#D97706]" />
          </div>
        </div>
      </div>

      {/* 2. Control Bar: Tabs & Search */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab("PENDING")}
            className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "PENDING"
                ? "bg-[#0B241E] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>Menunggu Verifikasi</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-amber-400 text-[#0B241E]">
              {pendingCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("VERIFIED")}
            className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "VERIFIED"
                ? "bg-[#0B241E] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>Disahkan (Aktif)</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-emerald-100 text-emerald-800">
              {verifiedCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("REJECTED")}
            className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "REJECTED"
                ? "bg-[#0B241E] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>Ditolak / Revisi</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-rose-100 text-rose-800">
              {rejectedCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("ALL")}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "ALL"
                ? "bg-[#0B241E] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Semua ({registrations.length})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari PT, No. Registrasi, Kapal..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#0B241E] focus:ring-2 focus:ring-[#0B241E]/10 transition-all bg-white"
          />
        </div>
      </div>

      {/* 3. Main Data Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-mono uppercase text-[#64748B]">
                <th className="py-3.5 px-4 font-bold">No. Registrasi &amp; Waktu</th>
                <th className="py-3.5 px-4 font-bold">Perusahaan Pelayaran &amp; NIB</th>
                <th className="py-3.5 px-4 font-bold">Kapal Perdana &amp; Nilai GT</th>
                <th className="py-3.5 px-4 font-bold">PIC Operasional</th>
                <th className="py-3.5 px-4 font-bold text-center">Status Berkas</th>
                <th className="py-3.5 px-4 font-bold text-right">Tindakan Petugas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <FileText className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    <p className="font-bold text-slate-600">Tidak ada data pendaftaran yang sesuai</p>
                    <p className="text-[11px] mt-0.5">Ubah kata kunci pencarian atau ganti filter tab di atas.</p>
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    onClick={() => setSelectedEntity(item)}
                  >
                    {/* Reg Number */}
                    <td className="py-4 px-4 font-mono">
                      <span className="font-extrabold text-[#0B241E] block text-[13px]">
                        {item.regNumber}
                      </span>
                      <span className="text-[10.5px] text-slate-400 block mt-0.5">
                        {item.submittedAt}
                      </span>
                    </td>

                    {/* Company */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-[#D97706] shrink-0" />
                        <div>
                          <p className="font-extrabold text-[#0B241E] leading-snug">
                            {item.companyName}
                          </p>
                          <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                            {item.siupalNumber}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Vessel */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Ship className="w-4 h-4 text-emerald-700 shrink-0" />
                        <div>
                          <p className="font-extrabold text-[#0B241E] leading-snug">
                            {item.vesselName}
                          </p>
                          <p className="text-[11px] font-mono font-bold text-emerald-800 mt-0.5">
                            {item.gt.toLocaleString()} GT • {item.vesselType}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* PIC */}
                    <td className="py-4 px-4">
                      <p className="font-bold text-slate-800">{item.picName}</p>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">{item.phone}</p>
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-4 text-center">
                      {item.status === "PENDING" && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[10.5px] font-mono font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                          <span>PENDING</span>
                        </span>
                      )}
                      {item.status === "VERIFIED" && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10.5px] font-mono font-bold">
                          <Check className="w-3.5 h-3.5 text-emerald-700 stroke-[3]" />
                          <span>VERIFIED</span>
                        </span>
                      )}
                      {item.status === "REJECTED" && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-100 text-rose-900 border border-rose-300 text-[10.5px] font-mono font-bold">
                          <X className="w-3.5 h-3.5 text-rose-700 stroke-[3]" />
                          <span>DITOLAK</span>
                        </span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="py-4 px-4 text-right">
                      <div
                        className="inline-flex items-center gap-1.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => setSelectedEntity(item)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#0B241E] hover:bg-[#133D31] text-white transition-all shadow-2xs cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#D97706]" />
                          <span>Uji Berkas</span>
                        </button>

                        {item.status === "PENDING" && (
                          <button
                            type="button"
                            onClick={() => handleApprove(item.id)}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 transition-colors cursor-pointer"
                            title="Setujui Cepat"
                          >
                            <Check className="w-4 h-4 stroke-[3]" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 4. DETAIL VERIFICATION MODAL / DRAWER                                 */}
      {/* ===================================================================== */}
      {selectedEntity && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col justify-between">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 flex items-start justify-between bg-slate-50/70 sticky top-0 z-10">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0B241E] text-[#D97706] font-bold">
                    {selectedEntity.regNumber}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    Diajukan: {selectedEntity.submittedAt}
                  </span>
                </div>
                <h2 className="text-xl font-black text-[#0B241E]">
                  {selectedEntity.companyName}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Bentuk Usaha: <strong>{selectedEntity.businessType}</strong>
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedEntity(null)}
                className="w-9 h-9 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Status Banner */}
              <div
                className={`p-4 rounded-2xl border flex items-center justify-between ${
                  selectedEntity.status === "PENDING"
                    ? "bg-amber-50 border-amber-200 text-amber-950"
                    : selectedEntity.status === "VERIFIED"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-950"
                    : "bg-rose-50 border-rose-200 text-rose-950"
                }`}
              >
                <div className="flex items-center gap-3">
                  {selectedEntity.status === "PENDING" && <Clock className="w-5 h-5 text-[#D97706]" />}
                  {selectedEntity.status === "VERIFIED" && <ShieldCheck className="w-5 h-5 text-emerald-600" />}
                  {selectedEntity.status === "REJECTED" && <XCircle className="w-5 h-5 text-rose-600" />}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide">
                      Status Permohonan: {selectedEntity.status}
                    </p>
                    <p className="text-[11px] opacity-80 mt-0.5">
                      {selectedEntity.status === "PENDING" &&
                        "Menunggu pemeriksaan fisik Surat Ukur dan keabsahan SIUPAL oleh Petugas Loket UPT."}
                      {selectedEntity.status === "VERIFIED" &&
                        `Telah disahkan oleh ${selectedEntity.verifiedBy} pada ${selectedEntity.verifiedAt}.`}
                      {selectedEntity.status === "REJECTED" &&
                        `Ditolak dengan alasan: "${selectedEntity.rejectionReason}".`}
                    </p>
                  </div>
                </div>
              </div>

              {/* 3 Sections: PIC, Company, Vessel */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* PIC Card */}
                <div className="p-4 rounded-2xl bg-[#F8FAF9] border border-slate-200 space-y-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#D97706] block">
                    Penanggung Jawab (PIC Operasional)
                  </span>
                  <p className="text-xs font-black text-[#0B241E]">{selectedEntity.picName}</p>
                  <p className="text-[11px] text-slate-600">{selectedEntity.picRole}</p>
                  <p className="text-[11px] font-mono text-slate-600 flex items-center gap-1.5 pt-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{selectedEntity.phone}</span>
                  </p>
                  <p className="text-[11px] text-slate-600 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{selectedEntity.email}</span>
                  </p>
                </div>

                {/* Company Card */}
                <div className="p-4 rounded-2xl bg-[#F8FAF9] border border-slate-200 space-y-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#D97706] block">
                    Legalitas Badan Usaha
                  </span>
                  <p className="text-xs font-black text-[#0B241E]">{selectedEntity.companyName}</p>
                  <p className="text-[11px] font-mono text-slate-600">
                    SIUPAL: <strong>{selectedEntity.siupalNumber}</strong>
                  </p>
                  <p className="text-[11px] font-mono text-slate-600">
                    NIB OSS: <strong>{selectedEntity.nibNumber}</strong>
                  </p>
                  <p className="text-[11px] font-mono text-slate-600">
                    NPWP: <strong>{selectedEntity.npwpNumber}</strong>
                  </p>
                  <p className="text-[11px] text-slate-600 truncate">{selectedEntity.companyAddress}</p>
                </div>
              </div>

              {/* Vessel Specifications & GT */}
              <div className="p-4 rounded-2xl bg-[#F8FAF9] border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#D97706]">
                    Spesifikasi Armada Perdana (Dasar Retribusi PP 35/2023)
                  </span>
                  <span className="text-xs font-mono font-extrabold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-md">
                    {selectedEntity.gt.toLocaleString()} GT
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Nama Kapal:</span>
                    <strong className="text-[#0B241E]">{selectedEntity.vesselName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Call Sign:</span>
                    <strong className="text-[#0B241E] font-mono">{selectedEntity.callSign}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Jenis Kapal:</span>
                    <strong className="text-[#0B241E]">{selectedEntity.vesselType}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Dimensi (LOA / Draft):</span>
                    <strong className="text-[#0B241E] font-mono">
                      {selectedEntity.loa} M / {selectedEntity.draft} M
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Kapasitas Pax:</span>
                    <strong className="text-[#0B241E]">{selectedEntity.paxCapacity} Jiwa</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Kapasitas Kendaraan:</span>
                    <strong className="text-[#0B241E]">{selectedEntity.vehicleCapacity} Unit</strong>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 block text-[10px]">Tarif Labuh Terhitung (Simulasi):</span>
                    <strong className="text-emerald-700 font-mono">
                      Rp {(selectedEntity.gt * 150).toLocaleString("id-ID")} / Kunjungan Labuh
                    </strong>
                  </div>
                </div>
              </div>

              {/* Uploaded Documents Inspection Checklist */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
                  Verifikasi Berkas Fisik &amp; Digital:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {/* Doc 1 */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2 truncate">
                      <FileCheck2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div className="truncate">
                        <p className="font-bold text-[#0B241E] truncate">{selectedEntity.siupalFile}</p>
                        <span className="text-[10px] text-slate-400">SIUPAL / SIOPSUS Aktif</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-emerald-700 font-mono font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shrink-0">
                      Tersimpan
                    </span>
                  </div>

                  {/* Doc 2 */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2 truncate">
                      <FileCheck2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div className="truncate">
                        <p className="font-bold text-[#0B241E] truncate">{selectedEntity.suratUkurFile}</p>
                        <span className="text-[10px] text-slate-400">Surat Ukur Kapal Resmi (GT)</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-emerald-700 font-mono font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shrink-0">
                      Tersimpan
                    </span>
                  </div>

                  {/* Doc 3 */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2 truncate">
                      <FileCheck2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div className="truncate">
                        <p className="font-bold text-[#0B241E] truncate">{selectedEntity.npwpFile}</p>
                        <span className="text-[10px] text-slate-400">NPWP Badan Usaha</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-emerald-700 font-mono font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shrink-0">
                      Tersimpan
                    </span>
                  </div>

                  {/* Doc 4 */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2 truncate">
                      <FileCheck2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div className="truncate">
                        <p className="font-bold text-[#0B241E] truncate">{selectedEntity.pasKapalFile}</p>
                        <span className="text-[10px] text-slate-400">Pas Besar / Kelaiklautan</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-emerald-700 font-mono font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shrink-0">
                      Tersimpan
                    </span>
                  </div>
                </div>
              </div>

              {/* Officer Notes */}
              {selectedEntity.officerNotes && (
                <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Catatan Verifikator Syahbandar:</span>
                    <span className="text-[11.5px] text-emerald-800 leading-relaxed">
                      {selectedEntity.officerNotes}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Controls */}
            <div className="p-6 border-t border-slate-200 bg-slate-50/80 flex flex-col sm:flex-row items-center justify-between gap-3 sticky bottom-0">
              <button
                type="button"
                onClick={() => setSelectedEntity(null)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-200 border border-slate-300 transition-colors cursor-pointer"
              >
                Tutup Jendela
              </button>

              <div className="w-full sm:w-auto flex items-center gap-2.5">
                {selectedEntity.status !== "REJECTED" && (
                  <button
                    type="button"
                    onClick={() => setIsRejectModalOpen(true)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-rose-700 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-300 transition-all cursor-pointer shadow-2xs"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Tolak / Minta Revisi</span>
                  </button>
                )}

                {selectedEntity.status !== "VERIFIED" && (
                  <button
                    type="button"
                    onClick={() => handleApprove(selectedEntity.id)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white transition-all cursor-pointer shadow-md shadow-emerald-950/20"
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Setujui &amp; Terbitkan Akun (VERIFIED)</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 5. REJECTION INPUT DIALOG MODAL                                       */}
      {/* ===================================================================== */}
      {isRejectModalOpen && selectedEntity && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0B241E]">
                  Tolak / Minta Revisi Pendaftaran
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedEntity.companyName} ({selectedEntity.regNumber})
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Tuliskan alasan penolakan secara spesifik. Informasi ini akan langsung dikirimkan ke
              email dan WhatsApp PIC resmi perusahaan untuk perbaikan berkas.
            </p>

            <textarea
              rows={3}
              value={rejectionInput}
              onChange={(e) => setRejectionInput(e.target.value)}
              placeholder="Contoh: Lampiran Surat Ukur Kapal buram/tidak terbaca. Harap unggah ulang dokumen asli yang telah disahkan Ditjen Hubla."
              className="w-full p-3.5 rounded-2xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-rose-600 focus:ring-2 focus:ring-rose-600/10 transition-all resize-none bg-slate-50"
            />

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsRejectModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition-all cursor-pointer shadow-md shadow-rose-900/20"
              >
                Kirim Penolakan &amp; Notifikasi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
