"use client";

import React, { useEffect, useState } from "react";
import { Users, AlertCircle, ShieldAlert, ShieldCheck } from "lucide-react";
import { RbacRoleMatrixItem, UserAccountItem } from "@/types/user.types";
import { UserRole } from "@/types/auth.types";
import { useAuthStore } from "@/store/auth.store";
import { useUserStore } from "@/store/user.store";
import { usePortStore } from "@/store/port.store";
import { useUptStore } from "@/store/upt.store";
import { toast } from "@/store/toast.store";
import {
  ADMIN_ALLOWED_ROLES,
  ALL_ROLES,
  GeneratedCredentialModalData,
  PORT_BOUND_ROLES,
  UserFormState,
} from "@/components/upt/users/constants";
import { AccountsTab } from "@/components/upt/users/AccountsTab";
import { RbacMatrixTab } from "@/components/upt/users/RbacMatrixTab";
import { UserFormModal } from "@/components/upt/users/UserFormModal";
import { ResetPasswordModal } from "@/components/upt/users/ResetPasswordModal";
import { GeneratedCredentialsModal } from "@/components/upt/users/GeneratedCredentialsModal";
import { RbacPermissionsModal } from "@/components/upt/users/RbacPermissionsModal";

export default function UsersPage() {
  const { user: currentUser } = useAuthStore();
  const {
    users,
    rbacRoles,
    isLoading,
    isLoadingRbac,
    isSubmitting,
    error,
    fetchUsers,
    fetchRbacRoles,
    createUser,
    updateUser,
    toggleUserStatus,
    resetUserPassword,
    updateRolePermissions,
    clearError,
  } = useUserStore();
  const { ports, fetchPorts } = usePortStore();
  const { auditLogs, fetchAuditLogs } = useUptStore();

  const isSuperadmin = currentUser?.role === "SUPERADMIN";
  const isAdminPelabuhan =
    currentUser?.role === "ADMIN_PELABUHAN" || currentUser?.role === "KEPALA_PELABUHAN";
  const canAccess = isSuperadmin || isAdminPelabuhan;

  const [activeTab, setActiveTab] = useState<"accounts" | "rbac">("accounts");
  const [portFilter, setPortFilter] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [searchUserQuery, setSearchUserQuery] = useState("");
  const [userPage, setUserPage] = useState(1);
  const [userItemsPerPage, setUserItemsPerPage] = useState(10);

  const [auditSearchQuery, setAuditSearchQuery] = useState("");
  const [auditPage, setAuditPage] = useState(1);
  const [auditItemsPerPage, setAuditItemsPerPage] = useState(10);

  // Create / Edit User modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccountItem | null>(null);
  const [userForm, setUserForm] = useState<UserFormState>({
    email: "",
    username: "",
    password: "",
    fullName: "",
    role: (isSuperadmin ? "ADMIN_PELABUHAN" : "PETUGAS_DERMAGA_BARANG") as UserRole,
    portId: "",
    mustChangePassword: true,
  });

  // Reset Password modal state
  const [resetTarget, setResetTarget] = useState<UserAccountItem | null>(null);
  const [resetNewPassword, setResetNewPassword] = useState("");
  const [resetMustChange, setResetMustChange] = useState(true);

  // One-Time Generated Credentials Copy Modal
  const [generatedCredModal, setGeneratedCredModal] =
    useState<GeneratedCredentialModalData | null>(null);
  const [copiedKey, setCopiedKey] = useState<"all" | "password" | null>(null);

  // RBAC Edit Modal state (Interactive Grouped Checkboxes)
  const [editingRbacRole, setEditingRbacRole] = useState<RbacRoleMatrixItem | null>(null);
  const [selectedRbacPerms, setSelectedRbacPerms] = useState<string[]>([]);
  const [rbacPermSearch, setRbacPermSearch] = useState("");

  useEffect(() => {
    if (canAccess) {
      const numericPort = portFilter ? Number(portFilter) : undefined;
      fetchUsers(numericPort);
      fetchPorts();
      if (isSuperadmin) {
        fetchAuditLogs();
        fetchRbacRoles();
      }
    }
  }, [canAccess, isSuperadmin, portFilter, fetchUsers, fetchPorts, fetchAuditLogs, fetchRbacRoles]);

  if (!canAccess) {
    return (
      <div className="bg-white border border-rose-200 rounded-2xl p-8 text-center">
        <ShieldAlert className="w-10 h-10 text-rose-600 mx-auto mb-3" />
        <h2 className="text-base font-bold text-[#0B241E]">Akses Terbatas</h2>
        <p className="text-xs text-[#64748B] mt-1">
          Manajemen Pengguna hanya tersedia untuk Superadmin, Kepala Pelabuhan, dan Admin Pelabuhan.
        </p>
      </div>
    );
  }

  const creatableRoles = isSuperadmin ? ALL_ROLES : ADMIN_ALLOWED_ROLES;
  const requiresPortId = PORT_BOUND_ROLES.includes(userForm.role);

  const filteredUsers = users.filter((u) => {
    const matchRole = roleFilter ? u.role === roleFilter : true;
    const matchSearch =
      !searchUserQuery ||
      u.fullName.toLowerCase().includes(searchUserQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchUserQuery.toLowerCase()) ||
      (u.username && u.username.toLowerCase().includes(searchUserQuery.toLowerCase()));
    return matchRole && matchSearch;
  });

  const totalUserPages = Math.ceil(filteredUsers.length / userItemsPerPage) || 1;
  const pagedUsers = filteredUsers.slice(
    (userPage - 1) * userItemsPerPage,
    userPage * userItemsPerPage
  );

  const filteredAuditLogs = auditLogs.filter((l) => {
    if (!auditSearchQuery) return true;
    const q = auditSearchQuery.toLowerCase();
    return (
      (l.action && l.action.toLowerCase().includes(q)) ||
      (l.entityName && l.entityName.toLowerCase().includes(q)) ||
      (l.actor?.fullName && l.actor.fullName.toLowerCase().includes(q))
    );
  });
  const totalAuditPages = Math.ceil(filteredAuditLogs.length / auditItemsPerPage) || 1;
  const pagedAuditLogs = filteredAuditLogs.slice(
    (auditPage - 1) * auditItemsPerPage,
    auditPage * auditItemsPerPage
  );

  const portNameById = (id?: number | null) => {
    if (!id) return "-";
    const found = ports.find((p) => p.id === id);
    return found ? `${found.code} - ${found.name}` : `Port #${id}`;
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setUserForm({
      email: "",
      username: "",
      password: "",
      fullName: "",
      role: isSuperadmin ? "ADMIN_PELABUHAN" : "PETUGAS_DERMAGA_BARANG",
      portId: currentUser?.portId
        ? String(currentUser.portId)
        : ports[0]?.id
        ? String(ports[0].id)
        : "",
      mustChangePassword: true,
    });
    clearError();
    setIsModalOpen(true);
  };

  const openEditModal = (u: UserAccountItem) => {
    setEditingUser(u);
    setUserForm({
      email: u.email,
      username: u.username || "",
      password: "",
      fullName: u.fullName,
      role: u.role,
      portId: u.portId ? String(u.portId) : "",
      mustChangePassword: true,
    });
    clearError();
    setIsModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const activeFilter = portFilter ? Number(portFilter) : undefined;

    if (editingUser) {
      await updateUser(
        editingUser.id,
        {
          fullName: userForm.fullName.trim(),
          email: userForm.email.trim().toLowerCase(),
          username: userForm.username.trim()
            ? userForm.username.trim().toLowerCase()
            : null,
          ...(isSuperadmin
            ? {
                role: userForm.role,
                portId:
                  requiresPortId && userForm.portId ? Number(userForm.portId) : null,
              }
            : {}),
        },
        activeFilter
      );
      toast.success("Akun Diperbarui", `Data akun ${userForm.email} berhasil diperbarui.`);
    } else {
      const created = await createUser(
        {
          email: userForm.email.trim().toLowerCase(),
          username: userForm.username.trim()
            ? userForm.username.trim().toLowerCase()
            : undefined,
          password: userForm.password.trim() ? userForm.password.trim() : undefined,
          fullName: userForm.fullName.trim(),
          role: userForm.role,
          portId: requiresPortId && userForm.portId ? Number(userForm.portId) : undefined,
          mustChangePassword: userForm.mustChangePassword,
        },
        activeFilter
      );
      toast.success("Akun Dibuat", `Akun ${created.email} berhasil dibuat.`);
      if (created.generatedCredentials) {
        setGeneratedCredModal({
          title: "Kredensial Login Sementara (Akun Baru)",
          fullName: created.fullName,
          email: created.email,
          credentials: created.generatedCredentials,
        });
        setCopiedKey(null);
      }
    }
    setIsModalOpen(false);
  };

  const openResetPasswordModal = (u: UserAccountItem) => {
    setResetTarget(u);
    setResetNewPassword("");
    setResetMustChange(true);
    clearError();
  };

  const handleConfirmResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTarget) return;
    const updated = await resetUserPassword(resetTarget.id, {
      newPassword: resetNewPassword.trim() ? resetNewPassword.trim() : undefined,
      mustChangePassword: resetMustChange,
    });
    toast.success("Kata Sandi Direset", `Kata sandi akun ${resetTarget.email} berhasil direset.`);
    if (updated.generatedCredentials) {
      setGeneratedCredModal({
        title: "Kredensial Sementara (Reset Kata Sandi)",
        fullName: resetTarget.fullName,
        email: resetTarget.email,
        credentials: updated.generatedCredentials,
      });
      setCopiedKey(null);
    }
    setResetTarget(null);
  };

  const handleCopyCredentials = async (mode: "all" | "password") => {
    if (!generatedCredModal) return;
    const text =
      mode === "password"
        ? generatedCredModal.credentials.temporaryPassword
        : `Akun PORTA Mimika\nNama: ${generatedCredModal.fullName}\nEmail: ${generatedCredModal.email}\nUsername: ${generatedCredModal.credentials.username}\nPassword Sementara: ${generatedCredModal.credentials.temporaryPassword}\nCatatan: Wajib ganti password saat login pertama kali.`;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(mode);
      setTimeout(() => setCopiedKey(null), 2500);
    } catch {
      // fallback ignored
    }
  };

  const handleToggleStatus = async (userId: number, currentActive: boolean) => {
    await toggleUserStatus(userId, !currentActive);
    toast.success(
      "Status Diperbarui",
      `Status pengguna #${userId} berhasil diubah menjadi ${
        !currentActive ? "Aktif" : "Nonaktif"
      }.`
    );
  };

  const safeRbacRoles = Array.isArray(rbacRoles) ? rbacRoles : [];
  const allKnownPermissions = Array.from(
    new Set(
      safeRbacRoles.flatMap((r) => [
        ...(r.defaultPermissions ?? []),
        ...(r.databasePermissions ?? []),
        ...(r.effectivePermissions ?? []),
      ])
    )
  ).sort();

  const groupedPermissions = allKnownPermissions.reduce<Record<string, string[]>>((acc, code) => {
    const q = rbacPermSearch.trim().toLowerCase();
    if (q && !code.toLowerCase().includes(q)) return acc;
    const prefix = code.includes(":") ? code.split(":")[0] : "general";
    if (!acc[prefix]) acc[prefix] = [];
    acc[prefix].push(code);
    return acc;
  }, {});

  const openRbacEditModal = (item: RbacRoleMatrixItem) => {
    setEditingRbacRole(item);
    setSelectedRbacPerms([...item.effectivePermissions]);
    setRbacPermSearch("");
    clearError();
  };

  const toggleRbacPermission = (code: string) => {
    setSelectedRbacPerms((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const handleSaveRbacPermissions = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRbacRole) return;
    await updateRolePermissions(editingRbacRole.role, selectedRbacPerms);
    toast.success(
      "Hak Akses RBAC Diperbarui",
      `Hak akses RBAC untuk peran ${editingRbacRole.roleLabel} berhasil diperbarui.`
    );
    setEditingRbacRole(null);
  };

  return (
    <div className="space-y-6">
      {/* Sub-navigation Tabs (SUPERADMIN can switch between Accounts & Dynamic RBAC Matrix) */}
      {isSuperadmin && (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-2 inline-flex items-center gap-1.5 shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveTab("accounts")}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === "accounts"
                ? "bg-[#0B241E] text-white shadow-xs"
                : "text-[#64748B] hover:text-[#0B241E] hover:bg-[#F8FAFC]"
            }`}
          >
            <Users className="w-3.5 h-3.5 text-[#D97706]" />
            Manajemen Akun Pengguna ({users.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("rbac")}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === "rbac"
                ? "bg-[#0B241E] text-white shadow-xs"
                : "text-[#64748B] hover:text-[#0B241E] hover:bg-[#F8FAFC]"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#D97706]" />
            Matriks Role & Hak Akses (RBAC) ({rbacRoles.length})
          </button>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {activeTab === "rbac" && isSuperadmin ? (
        <RbacMatrixTab
          rbacRoles={rbacRoles}
          isLoadingRbac={isLoadingRbac}
          onRefresh={() => fetchRbacRoles()}
          onOpenRbacEditModal={openRbacEditModal}
        />
      ) : (
        <AccountsTab
          isSuperadmin={isSuperadmin}
          isAdminPelabuhan={isAdminPelabuhan}
          currentUserId={currentUser?.id ? Number(currentUser.id) : undefined}
          ports={ports}
          portFilter={portFilter}
          onPortFilterChange={setPortFilter}
          roleFilter={roleFilter}
          onRoleFilterChange={setRoleFilter}
          isLoading={isLoading}
          isSubmitting={isSubmitting}
          onRefresh={() => fetchUsers(portFilter ? Number(portFilter) : undefined)}
          onOpenCreateModal={openCreateModal}
          searchUserQuery={searchUserQuery}
          onSearchUserQueryChange={setSearchUserQuery}
          filteredUsersCount={filteredUsers.length}
          pagedUsers={pagedUsers}
          userPage={userPage}
          totalUserPages={totalUserPages}
          userItemsPerPage={userItemsPerPage}
          onUserPageChange={setUserPage}
          onUserItemsPerPageChange={setUserItemsPerPage}
          portNameById={portNameById}
          onOpenEditModal={openEditModal}
          onOpenResetPasswordModal={openResetPasswordModal}
          onToggleStatus={handleToggleStatus}
          auditSearchQuery={auditSearchQuery}
          onAuditSearchQueryChange={setAuditSearchQuery}
          filteredAuditLogsCount={filteredAuditLogs.length}
          pagedAuditLogs={pagedAuditLogs}
          auditPage={auditPage}
          totalAuditPages={totalAuditPages}
          auditItemsPerPage={auditItemsPerPage}
          onAuditPageChange={setAuditPage}
          onAuditItemsPerPageChange={setAuditItemsPerPage}
        />
      )}

      <UserFormModal
        isOpen={isModalOpen}
        editingUser={editingUser}
        userForm={userForm}
        onChangeForm={setUserForm}
        isSuperadmin={isSuperadmin}
        currentUserPortId={currentUser?.portId ? Number(currentUser.portId) : undefined}
        creatableRoles={creatableRoles}
        requiresPortId={requiresPortId}
        ports={ports}
        isSubmitting={isSubmitting}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveUser}
      />

      <ResetPasswordModal
        resetTarget={resetTarget}
        resetNewPassword={resetNewPassword}
        onResetNewPasswordChange={setResetNewPassword}
        resetMustChange={resetMustChange}
        onResetMustChangeChange={setResetMustChange}
        isSubmitting={isSubmitting}
        onClose={() => setResetTarget(null)}
        onSubmit={handleConfirmResetPassword}
      />

      <GeneratedCredentialsModal
        modalData={generatedCredModal}
        copiedKey={copiedKey}
        onCopy={handleCopyCredentials}
        onClose={() => setGeneratedCredModal(null)}
      />

      <RbacPermissionsModal
        editingRbacRole={editingRbacRole}
        selectedRbacPerms={selectedRbacPerms}
        onChangeSelectedRbacPerms={setSelectedRbacPerms}
        rbacPermSearch={rbacPermSearch}
        onRbacPermSearchChange={setRbacPermSearch}
        groupedPermissions={groupedPermissions}
        isSubmitting={isSubmitting}
        onTogglePermission={toggleRbacPermission}
        onClose={() => setEditingRbacRole(null)}
        onSubmit={handleSaveRbacPermissions}
      />
    </div>
  );
}
