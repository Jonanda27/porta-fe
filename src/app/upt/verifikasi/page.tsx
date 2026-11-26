"use client";

import React, { useEffect, useState } from "react";
import { AlertCircle, Loader2, ShieldAlert } from "lucide-react";
import { getBackendFileUrl } from "@/lib/file-url";
import { TablePagination } from "@/components/ui/table-pagination";
import { BerthingContractPrintModal } from "@/components/contracts/BerthingContractPrintModal";
import { ElectronicSignatureModal } from "@/components/contracts/ElectronicSignatureModal";
import { OperatorBerthingContract } from "@/types/kapal.types";
import { useAuthStore } from "@/store/auth.store";
import { useUptStore } from "@/store/upt.store";
import { toast } from "@/store/toast.store";
import {
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
import { VerifikasiToolbar } from "@/components/upt/verifikasi/VerifikasiToolbar";
import { OperatorVerificationTab } from "@/components/upt/verifikasi/OperatorVerificationTab";
import { VesselVerificationTab } from "@/components/upt/verifikasi/VesselVerificationTab";
import { TenantVerificationTab } from "@/components/upt/verifikasi/TenantVerificationTab";
import { BerthingContractVerificationTab } from "@/components/upt/verifikasi/BerthingContractVerificationTab";
import { RoomLeaseVerificationTab } from "@/components/upt/verifikasi/RoomLeaseVerificationTab";

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
    (l) =>
      l.status === "REQUESTED" ||
      l.status === "PENDING_ROOM_OFFICER" ||
      l.status === "PENDING_HEAD_OF_PORT"
  ).length;

  const query = searchQuery.toLowerCase();

  const filteredOperators = operators.filter((o) => {
    const matchStatus = statusFilter ? o.verificationStatus === statusFilter : true;
    const matchSearch =
      !query ||
      o.name.toLowerCase().includes(query) ||
      (o.npwp && o.npwp.toLowerCase().includes(query));
    return matchStatus && matchSearch;
  });

  const filteredVessels = vessels.filter((v) => {
    const matchStatus = statusFilter ? v.verificationStatus === statusFilter : true;
    const matchSearch =
      !query ||
      v.name.toLowerCase().includes(query) ||
      v.registrationNumber.toLowerCase().includes(query) ||
      (v.operator?.name && v.operator.name.toLowerCase().includes(query));
    return matchStatus && matchSearch;
  });

  const filteredTenants = tenants.filter((t) => {
    const matchStatus = statusFilter ? t.verificationStatus === statusFilter : true;
    const matchSearch =
      !query ||
      t.name.toLowerCase().includes(query) ||
      (t.nib && t.nib.toLowerCase().includes(query));
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
      !query ||
      c.contractNumber.toLowerCase().includes(query) ||
      c.title.toLowerCase().includes(query) ||
      (c.operator?.name && c.operator.name.toLowerCase().includes(query));
    return matchStatus && matchSearch;
  });

  const filteredRoomLeases = leases.filter((l) => {
    const matchStatus = statusFilter
      ? statusFilter === "PENDING"
        ? l.status === "REQUESTED" ||
          l.status === "PENDING_ROOM_OFFICER" ||
          l.status === "PENDING_HEAD_OF_PORT"
        : l.status === statusFilter
      : true;
    const matchSearch =
      !query ||
      l.contractNumber.toLowerCase().includes(query) ||
      l.tenantName.toLowerCase().includes(query) ||
      (l.asset?.name && l.asset.name.toLowerCase().includes(query));
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
  const startIdx = (currentPage - 1) * itemsPerPage;
  const endIdx = currentPage * itemsPerPage;

  const pagedOperators = filteredOperators.slice(startIdx, endIdx);
  const pagedVessels = filteredVessels.slice(startIdx, endIdx);
  const pagedTenants = filteredTenants.slice(startIdx, endIdx);
  const pagedBerthingContracts = filteredBerthingContracts.slice(startIdx, endIdx);
  const pagedRoomLeases = filteredRoomLeases.slice(startIdx, endIdx);

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
    } else if (type === "pks_sandar" && user?.role === "PETUGAS_REGISTRASI_KONTRAK") {
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
      toast.success(
        "Kontrak PKS Didaftarkan",
        "Kontrak PKS Sandar baru berhasil didaftarkan untuk operator!"
      );
    } catch {
      // handled in store
    }
  };

  return (
    <div className="space-y-6">
      <VerifikasiToolbar
        isSinglePageMode={isSinglePageMode}
        activeTab={activeTab}
        currentListLength={currentListLength}
        pendingOps={pendingOps}
        pendingVessels={pendingVessels}
        pendingTenants={pendingTenants}
        pendingBerthing={pendingBerthing}
        pendingRoomLeases={pendingRoomLeases}
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        isLoading={isLoading}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setCurrentPage(1);
        }}
        onChangeSearch={(q) => {
          setSearchQuery(q);
          setCurrentPage(1);
        }}
        onChangeStatusFilter={(status) => {
          setStatusFilter(status);
          setCurrentPage(1);
        }}
        onRefresh={() => fetchVerificationData(true)}
        onOpenCreatePks={() => {
          setPksOperatorId(operators[0]?.id ? String(operators[0].id) : "");
          setIsCreatePksModalOpen(true);
        }}
      />

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

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
          {activeTab === "operators" && (
            <OperatorVerificationTab
              operators={pagedOperators}
              isSubmitting={isSubmitting}
              onInspectDocs={setInspectDocsTarget}
              onApprove={(id, name) => handleApprove("operators", id, name)}
              onReject={setRejectTarget}
            />
          )}

          {activeTab === "vessels" && (
            <VesselVerificationTab
              vessels={pagedVessels}
              isSubmitting={isSubmitting}
              onInspectDocs={setInspectDocsTarget}
              onApprove={(id, name) => handleApprove("vessels", id, name)}
              onReject={setRejectTarget}
            />
          )}

          {activeTab === "tenants" && (
            <TenantVerificationTab
              tenants={pagedTenants}
              isSubmitting={isSubmitting}
              onInspectDocs={setInspectDocsTarget}
              onApprove={(id, name) => handleApprove("tenants", id, name)}
              onReject={setRejectTarget}
            />
          )}

          {activeTab === "pks_sandar" && (
            <BerthingContractVerificationTab
              contracts={pagedBerthingContracts}
              userRole={user?.role}
              isSubmitting={isSubmitting}
              onApproveStage1={(id, contractNumber) =>
                handleApprove("pks_sandar", id, contractNumber)
              }
              onOpenTte={setTteContractTarget}
              onOpenPrint={setPrintContractTarget}
              onReject={setRejectTarget}
            />
          )}

          {activeTab === "pks_ruangan" && (
            <RoomLeaseVerificationTab
              leases={pagedRoomLeases}
              userRole={user?.role}
              isSubmitting={isSubmitting}
              onVerifyRoomLease={handleVerifyRoomLease}
              onApproveHeadOfPort={handleApproveHeadOfPortLease}
              onReject={setRejectTarget}
            />
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

      <InspectDocumentsModal
        target={inspectDocsTarget}
        getBackendFileUrl={getBackendFileUrl}
        onClose={() => setInspectDocsTarget(null)}
      />

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

      <RejectVerifikasiModal
        target={rejectTarget}
        rejectionReason={rejectionReason}
        onChangeReason={setRejectionReason}
        isSubmitting={isSubmitting}
        onSubmit={handleConfirmReject}
        onClose={() => setRejectTarget(null)}
      />

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
