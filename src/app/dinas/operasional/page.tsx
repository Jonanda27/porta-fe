"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Anchor,
  Ship,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Calendar,
  Search,
  Users,
  ShieldCheck,
  FileText,
  ChevronRight,
  AlertCircle,
  Eye,
  CheckSquare,
  Activity,
} from "lucide-react";
import { useDinasStore } from "@/store/dinas.store";
import { toast } from "@/store/toast.store";

function DinasOperasionalContent() {
  const searchParams = useSearchParams();
  const portIdParam = searchParams.get("portId");
  const selectedPortFilter = portIdParam && portIdParam !== "all" ? Number(portIdParam) : undefined;

  const {
    dailyReports,
    maintenanceTickets,
    obligationsRecap,
    manifests,
    isLoading,
    isLoadingObligations,
    isLoadingManifests,
    error,
    fetchDailyReports,
    fetchMaintenanceTickets,
    fetchDailyObligations,
    fetchManifests,
    acknowledgeDailyReport,
  } = useDinasStore();

  const [activeTab, setActiveTab] = useState<"REPORTS" | "OBLIGATIONS" | "MANIFESTS" | "MAINTENANCE">("REPORTS");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isProcessingAck, setIsProcessingAck] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchDailyReports(selectedPortFilter);
    fetchMaintenanceTickets(selectedPortFilter);
    fetchDailyObligations(selectedPortFilter);
    fetchManifests(selectedPortFilter);
  }, [fetchDailyReports, fetchMaintenanceTickets, fetchDailyObligations, fetchManifests, selectedPortFilter]);

  // Filter reports (100% Data Riil dari API Backend)
  const filteredReports = dailyReports.filter((rep) => {
    return (
      rep.officer?.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (rep.generalNotes || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      rep.reportDate.includes(searchQuery)
    );
  });

  // Filter maintenance (100% Data Riil dari API Backend)
  const filteredMaintenance = maintenanceTickets.filter((mnt) => {
    return (
      mnt.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mnt.facilityType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mnt.issueDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (mnt.berth?.name || "").toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Filter obligations (Data Riil API Backend)
  const officersRecap = obligationsRecap?.officers || [];
  const filteredObligations = officersRecap.filter((item) => {
    return (
      item.officer.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.officer.role || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.officer.port?.name || "").toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Filter manifests (Data Riil API Backend: GET /gate-ticketing/manifests)
  const filteredManifests = manifests.filter((mnf) => {
    const vesselName = mnf.visit?.vessel?.name || "";
    const manifestNumber = mnf.manifestNumber || "";
    const destination = mnf.ferryRoute?.destinationName || "";
    return (
      vesselName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      manifestNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      destination.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const totalPassengers = manifests.reduce(
    (sum, m) => sum + (m.adultCount || 0) + (m.childCount || 0) + (m.infantCount || 0),
    0
  );
  const totalVehicles = manifests.reduce((sum, m) => sum + (m.vehicleCount || 0), 0);
  const totalCargoTons = manifests.reduce((sum, m) => sum + Number(m.cargoTons || 0), 0);

  // Metrik KPI dari data riil API
  const countReportsSubmitted = dailyReports.filter((r) => r.status === "SUBMITTED").length;
  const countCriticalMaintenance = maintenanceTickets.filter(
    (m) => (m.severity === "CRITICAL" || m.severity === "HIGH") && m.status !== "RESOLVED"
  ).length;
  const totalStayingVessels = dailyReports[0]?.totalVesselsStaying || 0;
  const totalObligationsCount = obligationsRecap?.portTotals?.totalObligated || 0;
  const completedObligationsCount =
    (obligationsRecap?.portTotals?.headVerified || 0) +
    (obligationsRecap?.portTotals?.completed || 0);

  // Handler Disposisi Pimpinan
  const handleAcknowledge = async (reportId: number) => {
    setIsProcessingAck(true);
    setFeedbackMsg(null);
    try {
      await acknowledgeDailyReport(reportId);
      setFeedbackMsg("Laporan shift tutup hari berhasil disahkan dan didisposisi.");
      setTimeout(() => {
        setFeedbackMsg(null);
      }, 2500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal mengesahkan laporan.";
      setFeedbackMsg(msg);
    } finally {
      setIsProcessingAck(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ========================================================= */}
      {/* 1. OPERATIONAL KPI SUMMARY CARDS                          */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Laporan Shift Tutup Hari */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
              Harian UPTD
            </span>
          </div>
          <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mt-3">
            Laporan Tutup Hari (Shift)
          </p>
          <p className="text-2xl font-extrabold text-[#0B241E] font-mono mt-1">
            {dailyReports.length}{" "}
            <span className="text-xs font-normal text-gray-500">Berkas</span>
          </p>
          <p className="text-[11px] text-amber-700 mt-1.5 font-semibold">
            {countReportsSubmitted} laporan menunggu disposisi pimpinan
          </p>
        </div>

        {/* Card 2: Kepatuhan Kewajiban Petugas Jaga (Obligations) */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
              Kepatuhan Shift
            </span>
          </div>
          <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mt-3">
            Kewajiban Shift Tutup Hari
          </p>
          <p className="text-2xl font-extrabold text-[#0B241E] font-mono mt-1">
            {completedObligationsCount} / {totalObligationsCount}{" "}
            <span className="text-xs font-normal text-gray-500">Selesai</span>
          </p>
          <p className="text-[11px] text-emerald-700 mt-1.5 font-semibold">
            {obligationsRecap?.portTotals?.overdue || 0} tugas shift overdue
          </p>
        </div>

        {/* Card 3: Armada Kapal Menginap di Kolam Pelabuhan */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
              <Ship className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-mono font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
              Kolam Pelabuhan
            </span>
          </div>
          <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mt-3">
            Armada Menginap / Sandar
          </p>
          <p className="text-2xl font-extrabold text-[#0B241E] font-mono mt-1">
            {totalStayingVessels}{" "}
            <span className="text-xs font-normal text-gray-500">Kapal</span>
          </p>
          <p className="text-[11px] text-[#64748B] mt-1.5 font-medium">
            Terekam dalam log serah terima perwira jaga
          </p>
        </div>

        {/* Card 4: Inspeksi Fasilitas Dermaga */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <Wrench className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
              Fasilitas Fisik
            </span>
          </div>
          <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mt-3">
            Inspeksi Kelaikan Dermaga
          </p>
          <p className="text-2xl font-extrabold text-[#0B241E] font-mono mt-1">
            {maintenanceTickets.length}{" "}
            <span className="text-xs font-normal text-gray-500">Tiket Log</span>
          </p>
          <p className="text-[11px] text-rose-700 mt-1.5 font-semibold">
            {countCriticalMaintenance} fasilitas butuh perbaikan segera
          </p>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. TAB CONTROLS                                           */}
      {/* ========================================================= */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("REPORTS")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "REPORTS"
                ? "bg-[#0B241E] text-white shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-[#D97706]" />
            Laporan Shift Tutup Hari ({dailyReports.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("OBLIGATIONS")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "OBLIGATIONS"
                ? "bg-[#0B241E] text-white shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#D97706]" />
            Kepatuhan Shift Tutup Hari ({officersRecap.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("MANIFESTS")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "MANIFESTS"
                ? "bg-[#0B241E] text-white shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <Ship className="w-3.5 h-3.5 text-[#D97706]" />
            Audit Manifes SOLAS ({manifests.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("MAINTENANCE")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "MAINTENANCE"
                ? "bg-[#0B241E] text-white shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <Wrench className="w-3.5 h-3.5 text-[#D97706]" />
            Kelaikan & Fasilitas ({maintenanceTickets.length})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari log, kapal, atau fasilitas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#0B241E]"
          />
        </div>
      </div>

      {feedbackMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {feedbackMsg}
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. TAB 1: LAPORAN SHIFT TUTUP HARI UPTD                   */}
      {/* ========================================================= */}
      {activeTab === "REPORTS" && (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h3 className="font-bold text-[#0B241E] text-base">
              Laporan Shift Harian & Catatan Kondisi Lapangan (UPTD Pelabuhan)
            </h3>
            <p className="text-xs text-gray-500">
              Pengawasan kondisi pasang surut, cuaca perairan muara, pergerakan kapal sandar, dan serah terima jaga shift
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAFBFB] text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-100">
                <tr>
                  <th className="py-3 px-4">Tanggal & Waktu Input</th>
                  <th className="py-3 px-4">Perwira Jaga UPTD</th>
                  <th className="py-3 px-4">Armada Sandar</th>
                  <th className="py-3 px-4">Catatan Cuaca & Dinamika Alur Muara</th>
                  <th className="py-3 px-4 text-center">Status Disposisi</th>
                  <th className="py-3 px-4 text-center">Aksi Pimpinan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {filteredReports.map((rep) => {
                  const isPending = rep.status === "SUBMITTED";

                  return (
                    <tr key={rep.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-[#0B241E] font-mono">
                          {rep.reportDate}
                        </div>
                        <div className="text-[11px] text-gray-400 mt-0.5">
                          {rep.createdAt.split("T")[1]?.slice(0, 5) || "20:00"} WIT
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-gray-900">
                          {rep.officer?.fullName || "Petugas Jaga UPT"}
                        </div>
                        <div className="text-[10px] text-gray-500">Petugas Operasional Dermaga</div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                          {rep.totalVesselsStaying} Kapal Menginap
                        </span>
                        <div className="text-[10px] text-gray-500 mt-1">
                          {rep.items?.map((it) => it.vesselName).join(", ") || "Kapal Niaga"}
                        </div>
                      </td>

                      <td className="py-3 px-4 max-w-sm">
                        <p className="text-[11px] text-gray-700 line-clamp-2" title={rep.generalNotes || ""}>
                          {rep.generalNotes || "Kondisi operasional normal dan aman."}
                        </p>
                      </td>

                      <td className="py-3 px-4 text-center">
                        {isPending ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                            <Clock className="w-3 h-3" />
                            Menunggu Disposisi
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3 h-3" />
                            Disahkan Pimpinan
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        {isPending ? (
                          <button
                            onClick={() => handleAcknowledge(rep.id)}
                            disabled={isProcessingAck}
                            className="px-3 py-1.5 bg-[#0B241E] hover:bg-[#133D31] text-white font-bold rounded-lg text-xs transition-colors flex items-center gap-1 shadow-xs cursor-pointer mx-auto disabled:opacity-50"
                            title="Sahkan Laporan Tutup Hari"
                          >
                            <CheckSquare className="w-3.5 h-3.5 text-[#D97706]" />
                            <span>Sahkan</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              toast.info(
                                `Laporan Shift ${rep.reportDate}`,
                                `Perwira: ${rep.officer?.fullName || "-"} • Catatan: ${rep.generalNotes || "-"} • Status: Telah Disahkan`
                              );
                            }}
                            className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer mx-auto flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5 text-gray-500" />
                            <span>Lihat Rincian</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. TAB 2: KEPATUHAN KEWAJIBAN PETUGAS JAGA (OBLIGATIONS)    */}
      {/* ========================================================= */}
      {activeTab === "OBLIGATIONS" && (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h3 className="font-bold text-[#0B241E] text-base flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              Rekapitulasi Kepatuhan Shift & Kewajiban Tutup Hari Perwira Jaga UPT
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Monitoring kewajiban harian staf pelabuhan: dermaga barang, terminal penumpang, kasir retribusi, dan pintu gerbang (Perda Mimika No. 4/2023)
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAFBFB] text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-100">
                <tr>
                  <th className="py-3 px-4">Nama Petugas Jaga</th>
                  <th className="py-3 px-4">Peran & Lokasi UPTD</th>
                  <th className="py-3 px-4 text-center">Total Tugas Shift</th>
                  <th className="py-3 px-4 text-center">Telah Diserahkan</th>
                  <th className="py-3 px-4 text-center">Status Terlambat</th>
                  <th className="py-3 px-4 text-center">Status Kepatuhan Tutup Hari</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {filteredObligations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-400">
                      Tidak ada data kewajiban perwira jaga pada filter ini.
                    </td>
                  </tr>
                ) : (
                  filteredObligations.map((item) => {
                    const isHeadVerified = item.overallObligationStatus === "HEAD_VERIFIED";
                    const isPending =
                      item.overallObligationStatus === "SUBMITTED" ||
                      item.overallObligationStatus === "ADMIN_CHECKED";
                    const isReturned = item.overallObligationStatus === "INCOMPLETE_RETURNED";

                    return (
                      <tr key={item.officer.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-[#0B241E]">{item.officer.fullName}</div>
                          <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                            {item.officer.email}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-semibold text-gray-800">
                            {item.officer.role.replace(/_/g, " ")}
                          </div>
                          <div className="text-[10px] text-emerald-700 font-medium">
                            {item.officer.port?.name || "UPTD Muara Mimika"}
                          </div>
                        </td>

                        <td className="py-3 px-4 text-center font-bold text-gray-900 font-mono">
                          {item.metrics.totalObligated}
                        </td>

                        <td className="py-3 px-4 text-center font-mono">
                          <span className="font-bold text-emerald-700">
                            {item.metrics.completed + item.metrics.headVerified}
                          </span>
                          <span className="text-gray-400 text-[10px] ml-1">
                            / {item.metrics.totalObligated}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-center">
                          {item.metrics.overdue > 0 ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 font-mono">
                              <AlertTriangle className="w-3 h-3 text-rose-600" />
                              {item.metrics.overdue} Overdue
                            </span>
                          ) : (
                            <span className="text-gray-400 font-mono text-[11px]">-</span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-center">
                          {isHeadVerified ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              <CheckCircle2 className="w-3 h-3" />
                              Tutup Hari Sah
                            </span>
                          ) : isReturned ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                              <AlertCircle className="w-3 h-3" />
                              Berkas Dikembalikan
                            </span>
                          ) : isPending ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                              <Clock className="w-3 h-3" />
                              Menunggu Verifikasi
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                              <Clock className="w-3 h-3" />
                              Shift Berjalan
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. TAB 3: AUDIT MANIFES PENUMPANG & MUATAN (SOLAS)         */}
      {/* ========================================================= */}
      {activeTab === "MANIFESTS" && (
        <div className="space-y-4">
          {/* Banner Regulasi SOLAS & Anti-Kebocoran */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-blue-950">
                  Audit Manifes SOLAS & Rekonsiliasi Pas Masuk Gerbang
                </h4>
                <p className="text-xs text-blue-800 mt-0.5">
                  Pengawasan manifes pelayaran rakyat & ferry penyeberangan sesuai standar SOLAS (Safety of Life at Sea) untuk mencegah kebocoran penerimaan karcis pas masuk peron/gerbang (PP No. 35/2023).
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="px-3 py-1 bg-white border border-blue-200 text-blue-800 text-[11px] font-bold rounded-lg shadow-2xs">
                Sesuai SOLAS Bab III
              </span>
              <span className="px-3 py-1 bg-blue-600 text-white text-[11px] font-bold rounded-lg shadow-2xs">
                Kepatuhan Data Terenkripsi
              </span>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-white border border-gray-200 rounded-xl">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Total Manifes</p>
              <p className="text-lg font-extrabold text-[#0B241E] font-mono mt-0.5">{manifests.length} Berkas</p>
            </div>
            <div className="p-3 bg-white border border-gray-200 rounded-xl">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Total Penumpang</p>
              <p className="text-lg font-extrabold text-blue-700 font-mono mt-0.5">{totalPassengers.toLocaleString("id-ID")} Jiwa</p>
            </div>
            <div className="p-3 bg-white border border-gray-200 rounded-xl">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Total Kendaraan</p>
              <p className="text-lg font-extrabold text-purple-700 font-mono mt-0.5">{totalVehicles.toLocaleString("id-ID")} Unit</p>
            </div>
            <div className="p-3 bg-white border border-gray-200 rounded-xl">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Muatan Kargo</p>
              <p className="text-lg font-extrabold text-amber-700 font-mono mt-0.5">{totalCargoTons.toLocaleString("id-ID")} Ton</p>
            </div>
          </div>

          {/* Manifest Table */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-[#E2E8F0] flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-2">
                <Ship className="w-4 h-4 text-[#D97706]" />
                <h3 className="font-bold text-sm text-[#0B241E]">
                  Daftar Manifes Keberangkatan / Kedatangan Kapal ({filteredManifests.length})
                </h3>
              </div>
              <span className="text-xs text-gray-500 font-mono">
                {isLoadingManifests ? "Menyinkronkan data..." : "Data Riil API Backend"}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#E2E8F0] bg-gray-50 text-[#64748B] font-bold uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4">No. Manifes & Tanggal</th>
                    <th className="py-3 px-4">Kapal & Kunjungan</th>
                    <th className="py-3 px-4">Rute Penyeberangan</th>
                    <th className="py-3 px-4 text-center">Komposisi Penumpang</th>
                    <th className="py-3 px-4 text-center">Kendaraan & Kargo</th>
                    <th className="py-3 px-4 text-center">Kelas Terminal</th>
                    <th className="py-3 px-4">Catatan Perwira Jaga</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {filteredManifests.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-gray-400">
                        Tidak ada berkas manifes kapal yang sesuai kriteria pencarian.
                      </td>
                    </tr>
                  ) : (
                    filteredManifests.map((mnf) => {
                      const totalPsg =
                        (mnf.adultCount || 0) + (mnf.childCount || 0) + (mnf.infantCount || 0);
                      return (
                        <tr key={mnf.id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-bold font-mono text-[#0B241E]">
                              {mnf.manifestNumber}
                            </div>
                            <div className="text-[10px] text-gray-500 mt-0.5">
                              {new Date(mnf.createdAt).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <div className="font-bold text-[#0B241E]">
                              {mnf.visit?.vessel?.name || "Kapal Tidak Dikenal"}
                            </div>
                            <div className="text-[10px] text-gray-500 font-mono">
                              Visit: {mnf.visit?.visitNumber || `#${mnf.visitId}`}
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <div className="font-semibold text-gray-800">
                              {mnf.ferryRoute?.destinationName || "Pelayaran Lokal"}
                            </div>
                            {mnf.ferryRoute?.distanceMiles ? (
                              <div className="text-[10px] text-gray-500 font-mono">
                                {mnf.ferryRoute.distanceMiles} Mil Laut
                              </div>
                            ) : (
                              <div className="text-[10px] text-gray-400">Rute Reguler</div>
                            )}
                          </td>

                          <td className="py-3 px-4 text-center">
                            <div className="font-bold font-mono text-blue-700 text-sm">
                              {totalPsg} Jiwa
                            </div>
                            <div className="text-[10px] text-gray-500 mt-0.5">
                              {mnf.adultCount} Dws • {mnf.childCount} Ank • {mnf.infantCount} By
                            </div>
                            {mnf.greeterCount ? (
                              <div className="text-[10px] text-purple-600">
                                +{mnf.greeterCount} Pengantar
                              </div>
                            ) : null}
                          </td>

                          <td className="py-3 px-4 text-center">
                            <div className="font-bold font-mono text-purple-700">
                              {mnf.vehicleCount || 0} Unit
                            </div>
                            <div className="text-[10px] text-amber-700 font-semibold mt-0.5">
                              {Number(mnf.cargoTons || 0)} Ton Kargo
                            </div>
                          </td>

                          <td className="py-3 px-4 text-center">
                            <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                              {mnf.terminalClass?.replace("_", " ") || "KELAS B"}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-gray-600 max-w-[200px] truncate">
                            {mnf.notes || <span className="text-gray-400 italic">Tidak ada catatan</span>}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. TAB 4: LOG PEMELIHARAAN & KELAIKAN FASILITAS           */}
      {/* ========================================================= */}
      {activeTab === "MAINTENANCE" && (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h3 className="font-bold text-[#0B241E] text-base">
              Pengawasan Kelaikan Fasilitas Fisik Dermaga & Catatan Pemeliharaan
            </h3>
            <p className="text-xs text-gray-500">
              Monitoring kondisi rubber fender, bollard tambat kapal, dolphin bressing, dan lampu penerangan dermaga
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAFBFB] text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-100">
                <tr>
                  <th className="py-3 px-4">No. Tiket & Tanggal</th>
                  <th className="py-3 px-4">Fasilitas & Dermaga</th>
                  <th className="py-3 px-4">Deskripsi Kerusakan / Temuan</th>
                  <th className="py-3 px-4">Tingkat Kerawanan</th>
                  <th className="py-3 px-4">Status Perbaikan</th>
                  <th className="py-3 px-4">Pelapor Lapangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {filteredMaintenance.map((mnt) => (
                  <tr key={mnt.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#0B241E] font-mono">
                        {mnt.ticketNumber}
                      </div>
                      <div className="text-[11px] text-gray-400 mt-0.5">
                        {mnt.createdAt.split("T")[0]}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-gray-900">
                        {mnt.facilityType.replace(/_/g, " ")}
                      </div>
                      <div className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                        <Anchor className="w-3 h-3 text-[#D97706]" />
                        {mnt.berth?.name || "Dermaga Pemda Poumako"}
                      </div>
                    </td>

                    <td className="py-3 px-4 max-w-sm">
                      <p className="text-[11px] text-gray-700">{mnt.issueDescription}</p>
                    </td>

                    <td className="py-3 px-4">
                      {mnt.severity === "CRITICAL" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                          <AlertTriangle className="w-3 h-3 text-rose-600" />
                          KRITIS
                        </span>
                      ) : mnt.severity === "HIGH" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                          TINGGI
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-800">
                          {mnt.severity}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      {mnt.status === "RESOLVED" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3" />
                          Selesai Diperbaiki
                        </span>
                      ) : mnt.status === "IN_PROGRESS" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                          <Clock className="w-3 h-3" />
                          Dalam Pengerjaan
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                          <AlertCircle className="w-3 h-3" />
                          Belum Ditangani
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-gray-900">
                        {mnt.reportedBy?.fullName || "Petugas UPT"}
                      </div>
                      <div className="text-[10px] text-gray-400">Inspektur Dermaga</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DinasOperasionalPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs font-mono text-gray-400">
          Memuat Log Operasional & Fasilitas...
        </div>
      }
    >
      <DinasOperasionalContent />
    </Suspense>
  );
}
