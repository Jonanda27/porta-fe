"use client";

import React, { useEffect, useState } from "react";
import {
  ShieldCheck,
  Ship,
  Store,
  Building2,
  XCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  FileText,
  ShieldAlert,
  Search,
  FileSignature,
  ExternalLink,
  Eye,
  X,
  Lock,
  Plus,
  Upload,
  PenTool,
  Printer,
} from "lucide-react";
import { API_CONFIG } from "@/config/api.config";
import { TablePagination } from "@/components/ui/table-pagination";
import { BerthingContractPrintModal } from "@/components/contracts/BerthingContractPrintModal";
import { ElectronicSignatureModal } from "@/components/contracts/ElectronicSignatureModal";
import { OperatorBerthingContract } from "@/types/kapal.types";
import { useAuthStore } from "@/store/auth.store";
import { useUptStore } from "@/store/upt.store";
import { toast } from "@/store/toast.store";
import { formatLabel } from "@/lib/format-labels";
import {
  DocumentItem,
  InspectDocsTarget,
  RejectVerifikasiTarget,
  VerifikasiPageProps,
  VerifikasiTabType as TabType,
} from "@/types/upt.types";
import {
  CreatePksContractModal,
  InspectDocumentsModal,
  RejectVerifikasiModal,
} from "@/components/upt/verifikasi/VerifikasiModals";

const STATUS_BADGE: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-800 border-amber-200",
  PENDING_VERIFICATION: "bg-amber-50 text-amber-800 border-amber-200",
  WAITING_OPERATOR_SIGNATURE: "bg-sky-50 text-sky-800 border-sky-200",
  REQUESTED: "bg-amber-50 text-amber-800 border-amber-200",
  PENDING_ROOM_OFFICER: "bg-amber-50 text-amber-800 border-amber-200",
  PENDING_HEAD_OF_PORT: "bg-blue-50 text-blue-800 border-blue-200",
  VERIFIED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-200",
  REJECTED: "bg-rose-50 text-rose-700 border-rose-200",
  EXPIRED: "bg-slate-100 text-slate-700 border-slate-200",
  TERMINATED: "bg-slate-100 text-slate-700 border-slate-200",
};

export function VerifikasiModuleView({ forcedTab }: VerifikasiPageProps) {
  const { user } = useAuthStore();
  const {
    operators,
    vessels,
    tenants,
    pendingBerthingContracts,
    leases,
    isLoading,
    isSubmitting,
    error,
    fetchVerificationData,
    verifyOperator,
    verifyVessel,
    verifyTenant,
    verifyBerthingContract,
    reviewBerthingContractByOfficer,
    createBerthingContractForOperator,
    verifyRoomLease,
    approveLease,
    rejectLease,
    clearError,
  } = useUptStore();

  const canAccess =
    user?.role === "ADMIN_PELABUHAN" ||
    user?.role === "PETUGAS_REGISTRASI_KONTRAK" ||
    user?.role === "KEPALA_PELABUHAN" ||
    user?.role === "PETUGAS_RUANGAN" ||
    user?.role === "SUPERADMIN";

  const isSinglePageMode =
    Boolean(forcedTab) ||
    user?.role === "PETUGAS_REGISTRASI_KONTRAK" ||
    user?.role === "KEPALA_PELABUHAN";

  const [activeTab, setActiveTab] = useState<TabType>(() => {
    if (forcedTab) return forcedTab;
    if (user?.role === "KEPALA_PELABUHAN") return "pks_sandar";
    if (user?.role === "PETUGAS_RUANGAN") return "pks_ruangan";
    return "operators";
  });
  const [statusFilter, setStatusFilter] = useState<string>("PENDING");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Reject modal state
  const [rejectTarget, setRejectTarget] = useState<RejectVerifikasiTarget | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // Inspect Documents modal state
  const [inspectDocsTarget, setInspectDocsTarget] = useState<InspectDocsTarget | null>(null);

  // TTE & Print Contract modal state
  const [tteContractTarget, setTteContractTarget] = useState<OperatorBerthingContract | null>(null);
  const [printContractTarget, setPrintContractTarget] = useState<OperatorBerthingContract | null>(null);

  // Create Berthing Contract modal state (POST /operators/:id/contracts)
  const [isCreatePksModalOpen, setIsCreatePksModalOpen] = useState(false);
  const [pksOperatorId, setPksOperatorId] = useState<string>("");
  const [pksTitle, setPksTitle] = useState("PKS Pelayanan Sandar & Tambat Armada");
  const [pksStartDate, setPksStartDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [pksEndDate, setPksEndDate] = useState(
    new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10)
  );
  const [pksMonthlyQuota, setPksMonthlyQuota] = useState<string>("8");
  const [pksDockAllocation, setPksDockAllocation] = useState("Dermaga Umum Poumako");
  const [pksFile, setPksFile] = useState<File | null>(null);

  const backendOrigin = API_CONFIG.BASE_URL.replace(/\/api\/v1\/?$/, "");
  const getBackendFileUrl = (filePath?: string | null): string | null => {
    if (!filePath) return null;
    if (filePath.startsWith("http://") || filePath.startsWith("https://")) return filePath;
    return `${backendOrigin}/${filePath.replace(/^\/+/, "")}`;
  };

  // Helper: Filter hanya dokumen level perusahaan (bukan dokumen unit kapal)
  const getCompanyOnlyDocs = (docs?: DocumentItem[]) => {
    return (docs || []).filter(
      (d) =>
        !d.vesselId &&
        d.category !== "SURAT_UKUR" &&
        d.category !== "PAS_BESAR_KECIL" &&
        d.notes !== "FOTO_KAPAL" &&
        d.documentNumber !== "FOTO-KAPAL"
    );
  };

  // Helper: Cek apakah operator sudah mengunggah dokumen wajib (minimal SIUPAL/NIB & NPWP)
  const checkOperatorMandatoryDocs = (docs?: DocumentItem[]) => {
    const companyDocs = getCompanyOnlyDocs(docs);
    const hasSiupalOrNib = companyDocs.some((d) => d.category === "SIUPAL_NIB");
    const hasNpwp = companyDocs.some((d) => d.category === "NPWP");
    const isReadyToVerify = hasSiupalOrNib && hasNpwp;
    const missingList: string[] = [];
    if (!hasSiupalOrNib) missingList.push("SIUPAL / NIB");
    if (!hasNpwp) missingList.push("NPWP Badan Usaha");
    return {
      companyDocs,
      hasSiupalOrNib,
      hasNpwp,
      isReadyToVerify,
      missingText:
        missingList.length > 0
          ? `Belum unggah berkas wajib: ${missingList.join(" & ")}`
          : null,
    };
  };

  // Helper: Cek apakah kapal sudah memiliki minimal 1 dokumen pendukung teknis (Surat Ukur / Pas Besar)
  const checkVesselMandatoryDocs = (docs?: DocumentItem[]) => {
    const legalVesselDocs = (docs || []).filter(
      (d) => d.notes !== "FOTO_KAPAL" && d.documentNumber !== "FOTO-KAPAL"
    );
    return {
      legalVesselDocs,
      isReadyToVerify: legalVesselDocs.length > 0,
      missingText:
        legalVesselDocs.length === 0
          ? "Belum unggah Surat Ukur / Pas Kapal"
          : null,
    };
  };

  useEffect(() => {
    if (canAccess) {
      fetchVerificationData();
    }
  }, [canAccess, fetchVerificationData]);

  useEffect(() => {
    if (forcedTab) {
      setActiveTab(forcedTab);
      return;
    }
    if (user?.role === "KEPALA_PELABUHAN") {
      setActiveTab("pks_sandar");
    } else if (user?.role === "PETUGAS_RUANGAN") {
      setActiveTab("pks_ruangan");
    }
  }, [forcedTab, user?.role]);

  if (!canAccess) {
    return (
      <div className="bg-white border border-rose-200 rounded-2xl p-8 text-center">
        <ShieldAlert className="w-10 h-10 text-rose-600 mx-auto mb-3" />
        <h2 className="text-base font-bold text-[#0B241E]">Akses Terbatas</h2>
        <p className="text-xs text-[#64748B] mt-1">
          Verifikasi mitra, kapal, dan kontrak PKS dikelola oleh Petugas Registrasi &amp; Kontrak, Admin Pelabuhan, Petugas Ruangan, dan Kepala Pelabuhan.
        </p>
      </div>
    );
  }

  const pendingOps = operators.filter((o) => o.verificationStatus === "PENDING").length;
  const pendingVessels = vessels.filter((v) => v.verificationStatus === "PENDING").length;
  const pendingTenants = tenants.filter((t) => t.verificationStatus === "PENDING").length;
  const pendingBerthing = pendingBerthingContracts.filter(
    (c) =>
      c.status === "PENDING_VERIFICATION" ||
      c.status === "WAITING_OPERATOR_SIGNATURE" ||
      c.status === "PENDING_HEAD_OF_PORT"
  ).length;
  const pendingRoomLeases = leases.filter(
    (l) => l.status === "REQUESTED" || l.status === "PENDING_ROOM_OFFICER" || l.status === "PENDING_HEAD_OF_PORT"
  ).length;

  const filteredOperators = operators.filter((o) => {
    const matchStatus = statusFilter ? o.verificationStatus === statusFilter : true;
    const matchSearch =
      !searchQuery ||
      o.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.npwp && o.npwp.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchStatus && matchSearch;
  });

  const filteredVessels = vessels.filter((v) => {
    const matchStatus = statusFilter ? v.verificationStatus === statusFilter : true;
    const matchSearch =
      !searchQuery ||
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.operator?.name && v.operator.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchStatus && matchSearch;
  });

  const filteredTenants = tenants.filter((t) => {
    const matchStatus = statusFilter ? t.verificationStatus === statusFilter : true;
    const matchSearch =
      !searchQuery ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.nib && t.nib.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchStatus && matchSearch;
  });

  const filteredBerthingContracts = pendingBerthingContracts.filter((c) => {
    const matchStatus = statusFilter
      ? statusFilter === "PENDING"
        ? c.status === "PENDING_VERIFICATION" ||
          c.status === "WAITING_OPERATOR_SIGNATURE" ||
          c.status === "PENDING_HEAD_OF_PORT"
        : statusFilter === "VERIFIED"
        ? c.status === "ACTIVE"
        : c.status === statusFilter
      : true;
    const matchSearch =
      !searchQuery ||
      c.contractNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.operator?.name && c.operator.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchStatus && matchSearch;
  });

  const filteredRoomLeases = leases.filter((l) => {
    const matchStatus = statusFilter
      ? statusFilter === "PENDING"
        ? l.status === "REQUESTED" || l.status === "PENDING_ROOM_OFFICER" || l.status === "PENDING_HEAD_OF_PORT"
        : l.status === statusFilter
      : true;
    const matchSearch =
      !searchQuery ||
      l.contractNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.tenantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.asset?.name && l.asset.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchStatus && matchSearch;
  });

  const currentListLength =
    activeTab === "operators"
      ? filteredOperators.length
      : activeTab === "vessels"
      ? filteredVessels.length
      : activeTab === "tenants"
      ? filteredTenants.length
      : activeTab === "pks_sandar"
      ? filteredBerthingContracts.length
      : filteredRoomLeases.length;

  const totalPages = Math.ceil(currentListLength / itemsPerPage) || 1;
  const pagedOperators = filteredOperators.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const pagedVessels = filteredVessels.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const pagedTenants = filteredTenants.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const pagedBerthingContracts = filteredBerthingContracts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const pagedRoomLeases = filteredRoomLeases.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleApprove = async (type: TabType, id: number, name: string) => {
    clearError();
    if (type === "operators") {
      await verifyOperator(id, { status: "VERIFIED" });
      toast.success("Operator Diverifikasi", `Operator ${name} berhasil diverifikasi (VERIFIED)!`);
    } else if (type === "vessels") {
      await verifyVessel(id, { status: "VERIFIED" });
      toast.success("Kapal Diverifikasi", `Kapal ${name} berhasil diverifikasi (VERIFIED)!`);
    } else if (type === "tenants") {
      await verifyTenant(id, { verificationStatus: "VERIFIED" });
      toast.success("Tenant Diverifikasi", `Tenant ${name} berhasil diverifikasi (VERIFIED)!`);
    } else if (type === "pks_sandar") {
      if (user?.role === "PETUGAS_REGISTRASI_KONTRAK") {
        await reviewBerthingContractByOfficer(
          id,
          "APPROVE",
          "Prasyarat legalitas & permohonan PKS Sandar dinyatakan lengkap. Surat kontrak otomatis dikirim ke operator kapal untuk TTD basah."
        );
        toast.success(
          "Surat Kontrak Dikirim",
          `Tahap 1 PKS Sandar (${name}) disetujui. Surat kontrak otomatis digenerate & dikirim ke operator kapal untuk tanda tangan basah!`
        );
      }
    }
  };

  const handleVerifyRoomLease = async (leaseId: number, code: string) => {
    clearError();
    try {
      await verifyRoomLease(leaseId);
      toast.success(
        "Verifikasi Ruangan Disetujui",
        `Tahap 1 Verifikasi Ruangan (${code}) berhasil disetujui. Nomor PKS resmi diterbitkan dan diteruskan ke Kepala Pelabuhan!`
      );
    } catch {
      // handled in store
    }
  };

  const handleApproveHeadOfPortLease = async (leaseId: number, code: string) => {
    clearError();
    try {
      await approveLease(leaseId);
      toast.success(
        "PKS Ruangan Disahkan",
        `Tahap 2 Pengesahan PKS Ruangan (${code}) berhasil disahkan Kepala Pelabuhan. Status sewa kini AKTIF!`
      );
    } catch {
      // handled in store
    }
  };

  const handleConfirmReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectTarget) return;
    clearError();

    try {
      if (rejectTarget.type === "operators") {
        await verifyOperator(rejectTarget.id, {
          status: "REJECTED",
          rejectionReason: rejectionReason.trim(),
        });
      } else if (rejectTarget.type === "vessels") {
        await verifyVessel(rejectTarget.id, {
          status: "REJECTED",
          rejectionReason: rejectionReason.trim(),
        });
      } else if (rejectTarget.type === "tenants") {
        await verifyTenant(rejectTarget.id, {
          verificationStatus: "REJECTED",
          rejectionReason: rejectionReason.trim(),
        });
      } else if (rejectTarget.type === "pks_sandar") {
        if (user?.role === "PETUGAS_REGISTRASI_KONTRAK") {
          await reviewBerthingContractByOfficer(
            rejectTarget.id,
            "REJECT",
            rejectionReason.trim()
          );
        } else {
          await verifyBerthingContract(
            rejectTarget.id,
            "REJECTED",
            rejectionReason.trim()
          );
        }
      } else if (rejectTarget.type === "pks_ruangan") {
        await rejectLease(rejectTarget.id, rejectionReason.trim());
      }

      toast.success("Pengajuan Ditolak", `${rejectTarget.name} telah ditolak (REJECTED).`);
      setRejectTarget(null);
      setRejectionReason("");
    } catch {
      // handled in store
    }
  };

  const handleCreateBerthingContract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pksOperatorId) return;
    clearError();
    try {
      await createBerthingContractForOperator(Number(pksOperatorId), {
        title: pksTitle.trim(),
        portId: Number(user?.portId || 1),
        startDate: pksStartDate,
        endDate: pksEndDate,
        monthlyQuota: pksMonthlyQuota ? Number(pksMonthlyQuota) : undefined,
        dockAllocation: pksDockAllocation.trim() || undefined,
        file: pksFile || undefined,
      });
      setIsCreatePksModalOpen(false);
      setPksFile(null);
      toast.success("Kontrak PKS Didaftarkan", "Kontrak PKS Sandar baru berhasil didaftarkan untuk operator!");
    } catch {
      // handled in store
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Tabs & Filter */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-2xs">
        {isSinglePageMode ? (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#0B241E] text-[#D97706] flex items-center justify-center shrink-0">
              {activeTab === "operators" ? (
                <Building2 className="w-4 h-4" />
              ) : activeTab === "vessels" ? (
                <Ship className="w-4 h-4" />
              ) : activeTab === "tenants" ? (
                <Store className="w-4 h-4" />
              ) : activeTab === "pks_sandar" ? (
                <FileSignature className="w-4 h-4" />
              ) : (
                <Building2 className="w-4 h-4" />
              )}
            </div>
            <div>
              <h2 className="text-xs font-extrabold text-[#0B241E]">
                {activeTab === "operators"
                  ? "Daftar Verifikasi Operator Kapal"
                  : activeTab === "vessels"
                  ? "Daftar Verifikasi Armada Kapal"
                  : activeTab === "tenants"
                  ? "Daftar Verifikasi Tenant & Mitra Usaha"
                  : activeTab === "pks_sandar"
                  ? "Daftar Verifikasi Kontrak PKS Sandar"
                  : "Daftar Verifikasi PKS Sewa Ruangan (2-Tahap)"}
              </h2>
              <p className="text-[11px] text-[#64748B]">
                Menampilkan{" "}
                <strong className="text-[#0B241E]">{currentListLength}</strong>{" "}
                data pada filter ini
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => {
                setActiveTab("operators");
                setCurrentPage(1);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors ${
                activeTab === "operators"
                  ? "bg-[#0B241E] text-white"
                  : "bg-[#F8FAFC] text-[#475569] hover:bg-[#F1F5F9]"
              }`}
            >
              <Building2 className="w-4 h-4 text-[#D97706]" />
              Operator Kapal
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-800">
                {pendingOps}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("vessels");
                setCurrentPage(1);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors ${
                activeTab === "vessels"
                  ? "bg-[#0B241E] text-white"
                  : "bg-[#F8FAFC] text-[#475569] hover:bg-[#F1F5F9]"
              }`}
            >
              <Ship className="w-4 h-4 text-[#D97706]" />
              Armada Kapal
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-800">
                {pendingVessels}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("tenants");
                setCurrentPage(1);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors ${
                activeTab === "tenants"
                  ? "bg-[#0B241E] text-white"
                  : "bg-[#F8FAFC] text-[#475569] hover:bg-[#F1F5F9]"
              }`}
            >
              <Store className="w-4 h-4 text-[#D97706]" />
              Tenant Mitra
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-800">
                {pendingTenants}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("pks_sandar");
                setCurrentPage(1);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors ${
                activeTab === "pks_sandar"
                  ? "bg-[#0B241E] text-white"
                  : "bg-[#F8FAFC] text-[#475569] hover:bg-[#F1F5F9]"
              }`}
            >
              <FileSignature className="w-4 h-4 text-[#D97706]" />
              PKS Sandar (Kepala Pelabuhan)
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-800">
                {pendingBerthing}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("pks_ruangan");
                setCurrentPage(1);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors ${
                activeTab === "pks_ruangan"
                  ? "bg-[#0B241E] text-white"
                  : "bg-[#F8FAFC] text-[#475569] hover:bg-[#F1F5F9]"
              }`}
            >
              <Building2 className="w-4 h-4 text-[#D97706]" />
              PKS Sewa Ruangan (2-Tahap)
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-800">
                {pendingRoomLeases}
              </span>
            </button>
          </div>
        )}

        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative w-full sm:w-60">
            <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari nama, registrasi, nomor PKS..."
              className="w-full pl-8 pr-3 py-2 rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] text-xs focus:outline-none focus:ring-1 focus:ring-[#133D31]"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] text-xs font-semibold text-[#0B241E]"
          >
            <option value="PENDING">Menunggu Verifikasi</option>
            <option value="VERIFIED">Terverifikasi / Aktif</option>
            <option value="REJECTED">Ditolak</option>
            <option value="">Semua Status</option>
          </select>

          <button
            type="button"
            onClick={() => fetchVerificationData(true)}
            disabled={isLoading}
            className="px-3 py-2 rounded-xl border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] text-xs font-semibold text-[#475569] flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>

          {activeTab === "pks_sandar" && (
            <button
              type="button"
              onClick={() => {
                setPksOperatorId(operators[0]?.id ? String(operators[0].id) : "");
                setIsCreatePksModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-[#0B241E] hover:bg-[#143E33] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5 text-[#D97706]" />
              <span>Daftarkan PKS Sandar</span>
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Content (Only show full blocking spinner on initial cold load when memory is empty) */}
      {isLoading &&
      operators.length === 0 &&
      vessels.length === 0 &&
      leases.length === 0 ? (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-12 flex items-center justify-center gap-2 text-xs text-[#64748B]">
          <Loader2 className="w-4 h-4 animate-spin" />
          Memuat antrean verifikasi...
        </div>
      ) : (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-2xs">
          {/* TAB 1: OPERATORS */}
          {activeTab === "operators" && (
            <div className="w-full overflow-x-hidden">
              <table className="w-full text-left border-collapse table-fixed">
                <thead>
                  <tr className="border-b border-[#E2E8F0] text-xs font-semibold text-[#64748B] bg-[#F8FAFC]">
                    <th className="py-3 px-3.5 w-[22%]">Perusahaan / Operator</th>
                    <th className="py-3 px-3 w-[23%]">NPWP &amp; Kontak</th>
                    <th className="py-3 px-2.5 w-[13%]">Profil</th>
                    <th className="py-3 px-2.5 w-[15%]">Dokumen</th>
                    <th className="py-3 px-2.5 w-[10%]">Status</th>
                    <th className="py-3 px-3.5 text-right w-[17%]">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9] text-xs">
                  {pagedOperators.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-[#94A3B8]">
                        Tidak ada data operator untuk filter ini.
                      </td>
                    </tr>
                  ) : (
                    pagedOperators.map((op) => {
                      const docCheck = checkOperatorMandatoryDocs(op.documents);
                      return (
                        <tr key={op.id} className="hover:bg-[#F8FAFC] transition-colors">
                          <td className="py-3 px-3.5 font-bold text-[#0B241E] align-middle">
                            <div className="leading-snug truncate" title={op.name}>
                              {op.name}
                            </div>
                            {op.rejectionReason && (
                              <p
                                className="text-[11px] font-normal text-rose-600 mt-0.5 truncate"
                                title={op.rejectionReason}
                              >
                                Alasan: {op.rejectionReason}
                              </p>
                            )}
                          </td>
                          <td className="py-3 px-3 text-[#475569] align-middle">
                            <div className="font-mono text-[11px] font-semibold text-[#0B241E] truncate">
                              NPWP: {op.npwp || "-"}
                            </div>
                            <div
                              className="text-[11px] text-[#64748B] mt-0.5 truncate"
                              title={`${op.email || "-"} • ${op.phone || "-"}`}
                            >
                              {op.email || "-"} • {op.phone || "-"}
                            </div>
                          </td>
                          <td className="py-3 px-2.5 align-middle">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-[#F1F5F9] text-[#334155] font-semibold text-[11px] whitespace-nowrap">
                              {op.operatorProfile === "REGULAR_SCHEDULED"
                                ? "Rutin Terjadwal"
                                : "Insidental"}
                            </span>
                          </td>
                          <td className="py-3 px-2.5 align-middle">
                            <div className="flex flex-col items-start gap-0.5">
                              <button
                                type="button"
                                onClick={() =>
                                  setInspectDocsTarget({
                                    title: `Berkas Legalitas — ${op.name}`,
                                    subtitle: `NPWP: ${op.npwp || "-"} • ${op.email || "-"}`,
                                    docs: docCheck.companyDocs,
                                    missingWarning: docCheck.missingText,
                                  })
                                }
                                title={docCheck.missingText || "Klik untuk melihat berkas"}
                                className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg border transition-colors cursor-pointer whitespace-nowrap ${
                                  docCheck.companyDocs.length > 0
                                    ? "bg-[#F8FAFC] hover:bg-[#0B241E] text-[#0B241E] hover:text-white border-[#CBD5E1]"
                                    : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                                }`}
                              >
                                <FileText className="w-3 h-3 text-[#D97706] shrink-0" />
                                <span>{docCheck.companyDocs.length} Berkas</span>
                                {docCheck.companyDocs.length > 0 && (
                                  <Eye className="w-3 h-3 opacity-75 shrink-0" />
                                )}
                              </button>
                              {!docCheck.isReadyToVerify && op.verificationStatus !== "VERIFIED" && (
                                <span
                                  className="text-[10px] font-medium text-rose-600 truncate max-w-full"
                                  title={docCheck.missingText || undefined}
                                >
                                  Belum unggah wajib
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-2.5 align-middle">
                            <span
                              className={`text-[11px] font-bold px-2 py-0.5 rounded-full border inline-block whitespace-nowrap ${
                                STATUS_BADGE[op.verificationStatus] || "bg-slate-50 text-slate-700"
                              }`}
                            >
                              {formatLabel(op.verificationStatus)}
                            </span>
                          </td>
                          <td className="py-3 px-3.5 text-right align-middle">
                            <div className="inline-flex items-center justify-end gap-1.5">
                              {op.verificationStatus !== "VERIFIED" && (
                                <button
                                  type="button"
                                  disabled={isSubmitting || !docCheck.isReadyToVerify}
                                  title={
                                    docCheck.isReadyToVerify
                                      ? `Verifikasi & aktifkan akun ${op.name}`
                                      : `Tidak dapat diverifikasi: ${docCheck.missingText}`
                                  }
                                  onClick={() => handleApprove("operators", op.id, op.name)}
                                  className={`px-2 py-1 rounded-lg text-[11px] font-bold inline-flex items-center gap-1 transition-colors whitespace-nowrap ${
                                    docCheck.isReadyToVerify
                                      ? "bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-2xs"
                                      : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                                  }`}
                                >
                                  {docCheck.isReadyToVerify ? (
                                    <ShieldCheck className="w-3 h-3 shrink-0" />
                                  ) : (
                                    <Lock className="w-3 h-3 shrink-0" />
                                  )}
                                  <span>Verifikasi</span>
                                </button>
                              )}
                              {op.verificationStatus !== "REJECTED" && (
                                <button
                                  type="button"
                                  disabled={isSubmitting}
                                  onClick={() =>
                                    setRejectTarget({ type: "operators", id: op.id, name: op.name })
                                  }
                                  className="px-2 py-1 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                                >
                                  <XCircle className="w-3 h-3 shrink-0" />
                                  <span>Tolak</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 2: VESSELS */}
          {activeTab === "vessels" && (
            <div className="w-full overflow-x-hidden">
              <table className="w-full text-left border-collapse table-fixed">
                <thead>
                  <tr className="border-b border-[#E2E8F0] text-xs font-semibold text-[#64748B] bg-[#F8FAFC]">
                    <th className="py-3 px-3.5 w-[19%]">Nama Kapal</th>
                    <th className="py-3 px-3 w-[18%]">Operator</th>
                    <th className="py-3 px-2.5 w-[14%]">No. Registrasi / IMO</th>
                    <th className="py-3 px-2.5 w-[11%]">GT &amp; Kategori</th>
                    <th className="py-3 px-2.5 w-[11%]">Dokumen</th>
                    <th className="py-3 px-2.5 w-[10%]">Status</th>
                    <th className="py-3 px-3.5 text-right w-[17%]">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9] text-xs">
                  {pagedVessels.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-[#94A3B8]">
                        Tidak ada data armada kapal untuk filter ini.
                      </td>
                    </tr>
                  ) : (
                    pagedVessels.map((v) => {
                      const vDocCheck = checkVesselMandatoryDocs(v.documents);
                      return (
                        <tr key={v.id} className="hover:bg-[#F8FAFC]">
                          <td className="py-3 px-3.5 font-bold text-[#0B241E] align-middle">
                            <div className="truncate" title={v.name}>
                              {v.name}
                            </div>
                            {v.rejectionReason && (
                              <p className="text-[11px] font-normal text-rose-600 mt-0.5 truncate">
                                Alasan: {v.rejectionReason}
                              </p>
                            )}
                          </td>
                          <td className="py-3 px-3 text-[#475569] align-middle truncate" title={v.operator?.name || "-"}>
                            {v.operator?.name || "-"}
                          </td>
                          <td className="py-3 px-2.5 text-[#475569] font-mono align-middle">
                            <div className="truncate">{v.registrationNumber}</div>
                            {v.imoNumber && (
                              <div className="text-[11px] text-[#94A3B8] truncate">IMO: {v.imoNumber}</div>
                            )}
                          </td>
                          <td className="py-3 px-2.5 text-[#475569] align-middle">
                            <div className="font-bold text-[#0B241E]">{v.grossTonnage} GT</div>
                            <div className="text-[11px] text-[#64748B] truncate">{formatLabel(v.shippingCategory)}</div>
                          </td>
                          <td className="py-3 px-2.5 align-middle">
                            <button
                              type="button"
                              onClick={() =>
                                setInspectDocsTarget({
                                  title: `Dokumen Teknis Kapal — ${v.name}`,
                                  subtitle: `No. Registrasi: ${v.registrationNumber} • ${v.grossTonnage} GT`,
                                  docs: v.documents || [],
                                  missingWarning: vDocCheck.missingText,
                                })
                              }
                              className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg border transition-colors cursor-pointer whitespace-nowrap ${
                                (v.documents?.length ?? 0) > 0
                                  ? "bg-[#F8FAFC] hover:bg-[#0B241E] text-[#0B241E] hover:text-white border-[#CBD5E1]"
                                  : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                              }`}
                            >
                              <FileText className="w-3 h-3 text-[#D97706] shrink-0" />
                              <span>{v.documents?.length ?? 0} Berkas</span>
                              {(v.documents?.length ?? 0) > 0 && (
                                <Eye className="w-3 h-3 opacity-75 shrink-0" />
                              )}
                            </button>
                          </td>
                          <td className="py-3.5 px-2 align-middle">
                            <span
                              className={`text-[11px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap ${
                                STATUS_BADGE[v.verificationStatus] || "bg-slate-50 text-slate-700"
                              }`}
                            >
                              {formatLabel(v.verificationStatus)}
                            </span>
                          </td>
                          <td className="py-3.5 px-3.5 text-right align-middle whitespace-nowrap">
                            <div className="inline-flex items-center justify-end gap-1.5">
                              {v.verificationStatus !== "VERIFIED" && (
                                <button
                                  type="button"
                                  disabled={isSubmitting || !vDocCheck.isReadyToVerify}
                                  title={
                                    vDocCheck.isReadyToVerify
                                      ? `Verifikasi GT & dokumen ${v.name}`
                                      : `Tidak dapat diverifikasi: ${vDocCheck.missingText}`
                                  }
                                  onClick={() => handleApprove("vessels", v.id, v.name)}
                                  className={`px-2 py-1 rounded-lg text-[11px] font-bold inline-flex items-center gap-1 transition-colors whitespace-nowrap ${
                                    vDocCheck.isReadyToVerify
                                      ? "bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                                      : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                                  }`}
                                >
                                  {vDocCheck.isReadyToVerify ? (
                                    <ShieldCheck className="w-3 h-3 shrink-0" />
                                  ) : (
                                    <Lock className="w-3 h-3 shrink-0" />
                                  )}
                                  <span>Verifikasi</span>
                                </button>
                              )}
                              {v.verificationStatus !== "REJECTED" && (
                                <button
                                  type="button"
                                  disabled={isSubmitting}
                                  onClick={() =>
                                    setRejectTarget({ type: "vessels", id: v.id, name: v.name })
                                  }
                                  className="px-2 py-1 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                                >
                                  <XCircle className="w-3 h-3 shrink-0" />
                                  <span>Tolak</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 3: TENANTS */}
          {activeTab === "tenants" && (
            <div className="w-full overflow-x-hidden">
              <table className="w-full text-left border-collapse table-fixed">
                <thead>
                  <tr className="border-b border-[#E2E8F0] text-xs font-semibold text-[#64748B] bg-[#F8FAFC]">
                    <th className="py-3 px-3.5 w-[22%]">Nama Usaha / Tenant</th>
                    <th className="py-3 px-3 w-[19%]">NIB / NPWP</th>
                    <th className="py-3 px-3 w-[18%]">Kontak</th>
                    <th className="py-3 px-2.5 w-[12%]">Dokumen</th>
                    <th className="py-3 px-2.5 w-[11%]">Status</th>
                    <th className="py-3 px-3.5 text-right w-[18%]">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9] text-xs">
                  {pagedTenants.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-[#94A3B8]">
                        Belum ada data tenant mitra untuk filter ini.
                      </td>
                    </tr>
                  ) : (
                    pagedTenants.map((t) => {
                      const hasTenantDocs = (t.documents?.length ?? 0) > 0;
                      return (
                        <tr key={t.id} className="hover:bg-[#F8FAFC]">
                          <td className="py-3 px-3.5 font-bold text-[#0B241E] align-middle">
                            <div className="truncate" title={t.name}>{t.name}</div>
                            {t.rejectionReason && (
                              <p className="text-[11px] font-normal text-rose-600 mt-0.5 truncate">
                                Alasan: {t.rejectionReason}
                              </p>
                            )}
                          </td>
                          <td className="py-3 px-3 text-[#475569] font-mono text-[11px] align-middle">
                            <div className="truncate">NIB: {t.nib || "-"}</div>
                            <div className="text-[#64748B] truncate">NPWP: {t.npwp || "-"}</div>
                          </td>
                          <td className="py-3 px-3 text-[#475569] align-middle">
                            <div className="truncate">{t.email || "-"}</div>
                            <div className="text-[11px] text-[#64748B] truncate">{t.phone || "-"}</div>
                          </td>
                          <td className="py-3 px-2.5 align-middle">
                            <button
                              type="button"
                              onClick={() =>
                                setInspectDocsTarget({
                                  title: `Dokumen Usaha Tenant — ${t.name}`,
                                  subtitle: `NIB: ${t.nib || "-"} • NPWP: ${t.npwp || "-"}`,
                                  docs: t.documents || [],
                                })
                              }
                              className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg border transition-colors cursor-pointer whitespace-nowrap ${
                                hasTenantDocs
                                  ? "border-[#CBD5E1] bg-[#F8FAFC] hover:bg-[#0B241E] text-[#0B241E] hover:text-white"
                                  : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                              }`}
                            >
                              <FileText className="w-3 h-3 text-[#D97706] shrink-0" />
                              <span>{t.documents?.length ?? 0} Berkas</span>
                            </button>
                          </td>
                          <td className="py-3.5 px-2.5 align-middle">
                            <span
                              className={`text-[11px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap ${
                                STATUS_BADGE[t.verificationStatus] || "bg-slate-50 text-slate-700"
                              }`}
                            >
                              {formatLabel(t.verificationStatus)}
                            </span>
                          </td>
                          <td className="py-3.5 px-3.5 text-right align-middle whitespace-nowrap">
                            <div className="inline-flex items-center justify-end gap-1.5">
                              {t.verificationStatus !== "VERIFIED" && (
                                <button
                                  type="button"
                                  disabled={isSubmitting}
                                  onClick={() => handleApprove("tenants", t.id, t.name)}
                                  className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                                >
                                  <ShieldCheck className="w-3 h-3 shrink-0" />
                                  <span>Verifikasi</span>
                                </button>
                              )}
                              {t.verificationStatus !== "REJECTED" && (
                                <button
                                  type="button"
                                  disabled={isSubmitting}
                                  onClick={() =>
                                    setRejectTarget({ type: "tenants", id: t.id, name: t.name })
                                  }
                                  className="px-2 py-1 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                                >
                                  <XCircle className="w-3 h-3 shrink-0" />
                                  <span>Tolak</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 4: PKS SANDAR KAPAL */}
          {activeTab === "pks_sandar" && (
            <div className="w-full overflow-x-hidden">
              <table className="w-full text-left border-collapse table-fixed">
                <thead>
                  <tr className="border-b border-[#E2E8F0] text-xs font-semibold text-[#64748B] bg-[#F8FAFC]">
                    <th className="py-3 px-3.5 w-[22%]">No. PKS &amp; Judul</th>
                    <th className="py-3 px-3 w-[17%]">Operator Kapal</th>
                    <th className="py-3 px-3 w-[15%]">Pelabuhan &amp; Alokasi</th>
                    <th className="py-3 px-2.5 w-[13%]">Masa Berlaku</th>
                    <th className="py-3 px-2 w-[8%]">Kuota</th>
                    <th className="py-3 px-2.5 w-[10%]">Status</th>
                    <th className="py-3 px-3.5 text-right w-[15%]">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9] text-xs">
                  {pagedBerthingContracts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-[#94A3B8]">
                        Belum ada permohonan PKS Sandar Kapal dalam antrean verifikasi.
                      </td>
                    </tr>
                  ) : (
                    pagedBerthingContracts.map((c) => (
                      <tr key={c.id} className="hover:bg-[#F8FAFC]">
                        <td className="py-3 px-3.5 align-middle">
                          <span className="font-mono text-[10px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded inline-block">
                            {c.contractNumber}
                          </span>
                          <p className="font-bold text-[#0B241E] mt-1 truncate" title={c.title}>
                            {c.title}
                          </p>
                          {c.filePath && (
                            <a
                              href={getBackendFileUrl(c.filePath) || "#"}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0284C7] hover:underline mt-0.5 mr-2"
                            >
                              <FileText className="w-3 h-3 shrink-0" />
                              <span className="truncate">Permohonan</span>
                              <ExternalLink className="w-3 h-3 shrink-0" />
                            </a>
                          )}
                          {c.signedFilePath && (
                            <a
                              href={getBackendFileUrl(c.signedFilePath) || "#"}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:underline mt-0.5"
                            >
                              <FileText className="w-3 h-3 shrink-0" />
                              <span className="truncate">Scan TTD Basah</span>
                              <ExternalLink className="w-3 h-3 shrink-0" />
                            </a>
                          )}
                          {c.rejectionReason && (
                            <p className="text-[11px] font-normal text-rose-600 mt-0.5 truncate">
                              Alasan: {c.rejectionReason}
                            </p>
                          )}
                        </td>
                        <td className="py-3 px-3 font-semibold text-[#0B241E] align-middle truncate" title={c.operator?.name || "-"}>
                          {c.operator?.name || "-"}
                        </td>
                        <td className="py-3 px-3 text-[#475569] align-middle">
                          <div className="font-medium text-[#0B241E] truncate">
                            {c.port?.name || "Pelabuhan Poumako"}
                          </div>
                          <div className="text-[11px] text-[#64748B] truncate">
                            {c.dockAllocation || "Dermaga Umum"}
                          </div>
                        </td>
                        <td className="py-3 px-2.5 font-mono text-[11px] text-[#475569] align-middle">
                          <div>{new Date(c.startDate).toLocaleDateString("id-ID")}</div>
                          <div className="text-[#64748B]">
                            s/d {new Date(c.endDate).toLocaleDateString("id-ID")}
                          </div>
                        </td>
                        <td className="py-3 px-2 font-bold text-[#0B241E] align-middle whitespace-nowrap">
                          {c.usedQuota} / {c.monthlyQuota || "-"}
                        </td>
                        <td className="py-3.5 px-2.5 align-middle">
                          <span
                            className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full border inline-block whitespace-nowrap ${
                              STATUS_BADGE[c.status] || "bg-slate-50 text-slate-700"
                            }`}
                          >
                            {c.status === "ACTIVE"
                              ? "Aktif (TTE)"
                              : c.status === "PENDING_HEAD_OF_PORT"
                              ? "Tahap 3 (TTE)"
                              : c.status === "WAITING_OPERATOR_SIGNATURE"
                              ? "Tahap 2 (TTD)"
                              : c.status === "PENDING_VERIFICATION"
                              ? "Tahap 1"
                              : c.status === "REJECTED"
                              ? "Ditolak"
                              : "Kedaluwarsa"}
                          </span>
                        </td>
                        <td className="py-3.5 px-3.5 text-right align-middle whitespace-nowrap">
                          <div className="inline-flex items-center justify-end gap-1.5">
                            {c.status === "PENDING_VERIFICATION" &&
                              user?.role !== "KEPALA_PELABUHAN" && (
                                <>
                                  <button
                                    type="button"
                                    disabled={isSubmitting}
                                    onClick={() => handleApprove("pks_sandar", c.id, c.contractNumber)}
                                    className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                                  >
                                    <ShieldCheck className="w-3 h-3 shrink-0" />
                                    <span>Verifikasi</span>
                                  </button>
                                  <button
                                    type="button"
                                    disabled={isSubmitting}
                                    onClick={() =>
                                      setRejectTarget({
                                        type: "pks_sandar",
                                        id: c.id,
                                        name: c.contractNumber,
                                      })
                                    }
                                    className="px-2 py-1 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                                  >
                                    <XCircle className="w-3 h-3 shrink-0" />
                                    <span>Tolak</span>
                                  </button>
                                </>
                              )}
                            {c.status === "PENDING_HEAD_OF_PORT" &&
                              user?.role !== "PETUGAS_REGISTRASI_KONTRAK" && (
                                <>
                                  <button
                                    type="button"
                                    disabled={isSubmitting}
                                    onClick={() => setTteContractTarget(c)}
                                    className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                                  >
                                    <PenTool className="w-3 h-3 shrink-0" />
                                    <span>TTE &amp; Sahkan</span>
                                  </button>
                                  <button
                                    type="button"
                                    disabled={isSubmitting}
                                    onClick={() =>
                                      setRejectTarget({
                                        type: "pks_sandar",
                                        id: c.id,
                                        name: c.contractNumber,
                                      })
                                    }
                                    className="px-2 py-1 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                                  >
                                    <XCircle className="w-3 h-3 shrink-0" />
                                    <span>Tolak</span>
                                  </button>
                                </>
                              )}
                            {c.status === "PENDING_VERIFICATION" &&
                              user?.role === "KEPALA_PELABUHAN" && (
                                <span className="text-[11px] text-amber-700 font-bold">
                                  Menunggu Verifikasi Petugas
                                </span>
                              )}
                            {c.status === "WAITING_OPERATOR_SIGNATURE" && (
                              <span className="text-[11px] text-sky-700 font-bold">
                                Menunggu Upload TTD Operator
                              </span>
                            )}
                            {c.status === "PENDING_HEAD_OF_PORT" &&
                              user?.role === "PETUGAS_REGISTRASI_KONTRAK" && (
                                <span className="text-[11px] text-blue-700 font-bold">
                                  Menunggu TTE Ka. UPT
                                </span>
                              )}
                            {(c.status === "WAITING_OPERATOR_SIGNATURE" ||
                              c.status === "PENDING_HEAD_OF_PORT" ||
                              c.status === "ACTIVE") && (
                              <button
                                type="button"
                                onClick={() => setPrintContractTarget(c)}
                                title="Lihat / Cetak Surat Kontrak"
                                className="p-1 rounded-lg border border-slate-200 text-[#0B241E] hover:bg-slate-100 cursor-pointer"
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {c.status === "ACTIVE" && (
                              <span className="text-[11px] text-emerald-700 font-bold">
                                ✓ Disahkan TTE
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 5: PKS SEWA RUANGAN / BMD (2-TAHAP) */}
          {activeTab === "pks_ruangan" && (
            <div className="w-full overflow-x-hidden">
              <table className="w-full text-left border-collapse table-fixed">
                <thead>
                  <tr className="border-b border-[#E2E8F0] text-xs font-semibold text-[#64748B] bg-[#F8FAFC]">
                    <th className="py-3 px-3.5 w-[16%]">No. PKS / Pengajuan</th>
                    <th className="py-3 px-3 w-[15%]">Penyewa / Pemohon</th>
                    <th className="py-3 px-3 w-[16%]">Ruangan / Aset BMD</th>
                    <th className="py-3 px-2.5 w-[14%]">Masa Sewa &amp; Nilai</th>
                    <th className="py-3 px-2.5 w-[15%]">Verifikator (2-Tahap)</th>
                    <th className="py-3 px-2 w-[8%]">Status</th>
                    <th className="py-3 px-3.5 text-right w-[16%]">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9] text-xs">
                  {pagedRoomLeases.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-[#94A3B8]">
                        Belum ada permohonan sewa ruangan/aset dalam antrean verifikasi.
                      </td>
                    </tr>
                  ) : (
                    pagedRoomLeases.map((l) => (
                      <tr key={l.id} className="hover:bg-[#F8FAFC] transition-colors">
                        <td className="py-3 px-3.5 align-middle">
                          <span
                            className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded inline-block truncate max-w-full ${
                              l.contractNumber.startsWith("PKS-SWA")
                                ? "text-emerald-900 bg-emerald-100"
                                : "text-amber-900 bg-amber-100"
                            }`}
                            title={l.contractNumber}
                          >
                            {l.contractNumber}
                          </span>
                          {l.rejectionReason && (
                            <p className="text-[11px] font-normal text-rose-600 mt-0.5 truncate">
                              Alasan: {l.rejectionReason}
                            </p>
                          )}
                        </td>
                        <td className="py-3 px-3 align-middle">
                          <div className="font-bold text-[#0B241E] truncate" title={l.tenantName}>
                            {l.tenantName}
                          </div>
                          <span className="text-[10px] text-[#64748B] block mt-0.5">
                            {l.operator ? "Operator Kapal" : "Tenant Mitra"}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-[#475569] align-middle">
                          <div className="font-semibold text-[#0B241E] truncate" title={l.asset?.name || "Kios / Ruangan"}>
                            {l.asset?.name || "Kios / Ruangan"}
                          </div>
                          <div className="text-[11px] text-[#64748B] font-mono truncate mt-0.5">
                            {l.asset?.assetCode} • {l.asset?.areaSqm || "-"} m²
                          </div>
                        </td>
                        <td className="py-3 px-2.5 text-[#475569] align-middle">
                          <div className="font-mono text-[10.5px] truncate">
                            {new Date(l.startDate).toLocaleDateString("id-ID")} -{" "}
                            {new Date(l.endDate).toLocaleDateString("id-ID")}
                          </div>
                          <div className="font-bold text-[#0B241E] mt-0.5 truncate">
                            Rp {Number(l.totalAnnualAmountIdr).toLocaleString("id-ID")}/thn
                          </div>
                        </td>
                        <td className="py-3 px-2.5 align-middle text-[11px]">
                          <div className="truncate" title={l.verifiedByRoomOfficer?.fullName || "Menunggu Tahap 1"}>
                            <span className="text-[#64748B]">T1: </span>
                            {l.verifiedByRoomOfficer ? (
                              <span className="text-emerald-700 font-semibold">
                                {l.verifiedByRoomOfficer.fullName}
                              </span>
                            ) : (
                              <span className="text-amber-700 font-semibold">Menunggu</span>
                            )}
                          </div>
                          <div className="truncate mt-0.5" title={l.verifiedByHeadOfPort?.fullName || "Menunggu Tahap 2"}>
                            <span className="text-[#64748B]">T2: </span>
                            {l.verifiedByHeadOfPort ? (
                              <span className="text-emerald-700 font-semibold">
                                {l.verifiedByHeadOfPort.fullName}
                              </span>
                            ) : (
                              <span className="text-blue-700 font-semibold">
                                {l.status === "PENDING_HEAD_OF_PORT" ? "Menunggu Ka.UPT" : "-"}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-2 align-middle">
                          <span
                            className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full border inline-block whitespace-nowrap ${
                              STATUS_BADGE[l.status] || "bg-slate-50 text-slate-700"
                            }`}
                          >
                            {l.status === "REQUESTED" || l.status === "PENDING_ROOM_OFFICER"
                              ? "Tahap 1"
                              : l.status === "PENDING_HEAD_OF_PORT"
                              ? "Tahap 2"
                              : l.status === "ACTIVE"
                              ? "Aktif"
                              : l.status === "REJECTED"
                              ? "Ditolak"
                              : l.status}
                          </span>
                        </td>
                        <td className="py-3 px-3.5 text-right align-middle whitespace-nowrap">
                          <div className="inline-flex items-center justify-end gap-1.5">
                            {/* Tahap 1 Action */}
                            {(l.status === "REQUESTED" || l.status === "PENDING_ROOM_OFFICER") && (
                              <>
                                <button
                                  type="button"
                                  disabled={isSubmitting}
                                  onClick={() => handleVerifyRoomLease(l.id, l.contractNumber)}
                                  className="px-2 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer shadow-2xs transition-colors whitespace-nowrap"
                                  title="Verifikasi ketersediaan ruangan & terbitkan draft PKS-SWA"
                                >
                                  <ShieldCheck className="w-3 h-3 shrink-0" />
                                  <span>Verifikasi</span>
                                </button>
                                <button
                                  type="button"
                                  disabled={isSubmitting}
                                  onClick={() =>
                                    setRejectTarget({
                                      type: "pks_ruangan",
                                      id: l.id,
                                      name: l.contractNumber,
                                    })
                                  }
                                  className="px-2 py-1 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer transition-colors whitespace-nowrap"
                                >
                                  <XCircle className="w-3 h-3 shrink-0" />
                                  <span>Tolak</span>
                                </button>
                              </>
                            )}

                            {/* Tahap 2 Action (Kepala Pelabuhan / Admin) */}
                            {l.status === "PENDING_HEAD_OF_PORT" &&
                              user?.role !== "PETUGAS_REGISTRASI_KONTRAK" &&
                              user?.role !== "PETUGAS_RUANGAN" && (
                              <>
                                <button
                                  type="button"
                                  disabled={isSubmitting}
                                  onClick={() => handleApproveHeadOfPortLease(l.id, l.contractNumber)}
                                  className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer shadow-2xs transition-colors whitespace-nowrap"
                                  title="Pengesahan akhir kontrak PKS oleh Kepala Pelabuhan"
                                >
                                  <FileSignature className="w-3 h-3 shrink-0" />
                                  <span>Sahkan</span>
                                </button>
                                <button
                                  type="button"
                                  disabled={isSubmitting}
                                  onClick={() =>
                                    setRejectTarget({
                                      type: "pks_ruangan",
                                      id: l.id,
                                      name: l.contractNumber,
                                    })
                                  }
                                  className="px-2 py-1 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer transition-colors whitespace-nowrap"
                                >
                                  <XCircle className="w-3 h-3 shrink-0" />
                                  <span>Tolak</span>
                                </button>
                              </>
                            )}
                            {l.status === "PENDING_HEAD_OF_PORT" &&
                              (user?.role === "PETUGAS_REGISTRASI_KONTRAK" ||
                                user?.role === "PETUGAS_RUANGAN") && (
                                <span className="text-[11px] text-blue-700 font-bold">
                                  Menunggu Ka. UPT
                                </span>
                              )}

                            {l.status === "ACTIVE" && (
                              <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                ✓ Sewa Aktif
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={currentListLength}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        </div>
      )}

      {/* Modal Pratinjau Berkas Dokumen yang Diunggah Mitra */}
      <InspectDocumentsModal
        target={inspectDocsTarget}
        getBackendFileUrl={getBackendFileUrl}
        onClose={() => setInspectDocsTarget(null)}
      />

      {/* Modal Daftarkan Kontrak PKS Sandar Baru (POST /operators/:id/contracts) */}
      <CreatePksContractModal
        isOpen={isCreatePksModalOpen}
        isSubmitting={isSubmitting}
        operators={operators}
        pksOperatorId={pksOperatorId}
        onChangeOperatorId={setPksOperatorId}
        pksTitle={pksTitle}
        onChangeTitle={setPksTitle}
        pksStartDate={pksStartDate}
        onChangeStartDate={setPksStartDate}
        pksEndDate={pksEndDate}
        onChangeEndDate={setPksEndDate}
        pksMonthlyQuota={pksMonthlyQuota}
        onChangeMonthlyQuota={setPksMonthlyQuota}
        pksDockAllocation={pksDockAllocation}
        onChangeDockAllocation={setPksDockAllocation}
        onChangeFile={setPksFile}
        onSubmit={handleCreateBerthingContract}
        onClose={() => setIsCreatePksModalOpen(false)}
      />

      {/* Reject Reason Modal */}
      <RejectVerifikasiModal
        target={rejectTarget}
        rejectionReason={rejectionReason}
        onChangeReason={setRejectionReason}
        isSubmitting={isSubmitting}
        onSubmit={handleConfirmReject}
        onClose={() => setRejectTarget(null)}
      />

      {/* Tanda Tangan Elektronik (TTE) Kepala Pelabuhan Modal */}
      <ElectronicSignatureModal
        contract={tteContractTarget}
        signedFileUrl={getBackendFileUrl(tteContractTarget?.signedFilePath)}
        isSubmitting={isSubmitting}
        onClose={() => setTteContractTarget(null)}
        onConfirm={async (signatureData) => {
          if (!tteContractTarget) return;
          clearError();
          try {
            await verifyBerthingContract(
              tteContractTarget.id,
              "ACTIVE",
              undefined,
              signatureData
            );
            toast.success(
              "PKS Sandar Disahkan (TTE)",
              `PKS Sandar (${tteContractTarget.contractNumber}) resmi ditandatangani secara elektronik oleh Kepala Pelabuhan dan berstatus AKTIF!`
            );
            setTteContractTarget(null);
          } catch {
            // handled in store
          }
        }}
      />

      {/* Pratinjau & Cetak Surat Kontrak PKS Sandar */}
      <BerthingContractPrintModal
        contract={printContractTarget}
        onClose={() => setPrintContractTarget(null)}
      />
    </div>
  );
}

export default function VerifikasiPage() {
  return <VerifikasiModuleView />;
}
