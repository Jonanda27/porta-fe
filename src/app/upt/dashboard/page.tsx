"use client";

import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth.store";
import { useUptStore } from "@/store/upt.store";
import { usePortStore } from "@/store/port.store";
import { KepalaPelabuhanDashboard } from "@/components/upt/dashboard/KepalaPelabuhanDashboard";
import { PetugasRegistrasiDashboard } from "@/components/upt/dashboard/PetugasRegistrasiDashboard";
import { AdminUptDashboard } from "@/components/upt/dashboard/AdminUptDashboard";

export default function UptDashboardPage() {
  const { user } = useAuthStore();
  const {
    visits,
    unbilledVisits,
    leases,
    invoices,
    warnings,
    revenueSummary,
    operators,
    vessels,
    tenants,
    pendingBerthingContracts,
    myAssignments,
    officerTasks,
    isLoading,
    isSubmitting,
    error,
    fetchDashboardData,
    fetchVerificationData,
    fetchOfficerWorkspaceData,
    issueWarning,
  } = useUptStore();
  const { ports, fetchPorts } = usePortStore();

  const isSuperadmin = user?.role === "SUPERADMIN";
  const isKepalaPelabuhan = user?.role === "KEPALA_PELABUHAN";
  const isPetugasRegistrasi = user?.role === "PETUGAS_REGISTRASI_KONTRAK";
  const canIssueWarning = isSuperadmin || user?.role === "ADMIN_PELABUHAN";

  const [selectedPortId, setSelectedPortId] = useState<string>("");
  const numericPortId = selectedPortId ? Number(selectedPortId) : undefined;
  const activePortId = Number(user?.portId || myAssignments[0]?.portId || 1);

  useEffect(() => {
    if (isPetugasRegistrasi) {
      fetchVerificationData();
      fetchOfficerWorkspaceData(activePortId);
      fetchPorts();
    } else if (isKepalaPelabuhan) {
      fetchDashboardData(numericPortId);
      fetchVerificationData();
      fetchPorts();
    } else {
      fetchDashboardData(numericPortId);
      fetchPorts();
    }
  }, [
    isPetugasRegistrasi,
    isKepalaPelabuhan,
    activePortId,
    numericPortId,
    fetchVerificationData,
    fetchOfficerWorkspaceData,
    fetchDashboardData,
    fetchPorts,
  ]);

  if (isPetugasRegistrasi) {
    return (
      <PetugasRegistrasiDashboard
        operators={operators}
        vessels={vessels}
        tenants={tenants}
        pendingBerthingContracts={pendingBerthingContracts}
        leases={leases}
        myAssignments={myAssignments}
        officerTasks={officerTasks}
        isLoading={isLoading}
        error={error}
        onRefresh={() => {
          fetchVerificationData(true);
          fetchOfficerWorkspaceData(activePortId, true);
        }}
      />
    );
  }

  if (isKepalaPelabuhan) {
    return (
      <KepalaPelabuhanDashboard
        revenueSummary={revenueSummary}
        visits={visits}
        unbilledVisits={unbilledVisits}
        leases={leases}
        pendingBerthingContracts={pendingBerthingContracts}
        invoices={invoices}
        warnings={warnings}
        ports={ports}
        error={error}
      />
    );
  }

  return (
    <AdminUptDashboard
      visits={visits}
      unbilledVisits={unbilledVisits}
      leases={leases}
      invoices={invoices}
      warnings={warnings}
      revenueSummary={revenueSummary}
      ports={ports}
      userPortId={user?.portId}
      isSuperadmin={isSuperadmin}
      canIssueWarning={canIssueWarning}
      selectedPortId={selectedPortId}
      onSelectPortId={setSelectedPortId}
      numericPortId={numericPortId}
      isLoading={isLoading}
      isSubmitting={isSubmitting}
      error={error}
      onRefresh={() => fetchDashboardData(numericPortId)}
      onIssueWarning={issueWarning}
    />
  );
}
