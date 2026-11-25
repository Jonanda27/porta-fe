"use client";

import React, { useEffect, useState } from "react";
import {
  Users,
  UserPlus,
  AlertCircle,
  Loader2,
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  Search,
  Edit3,
  KeyRound,
  Copy,
  Check,
  Sparkles,
  Power,
  X,
} from "lucide-react";
import { TablePagination } from "@/components/ui/table-pagination";
import { StatusDot } from "@/components/ui/status-indicator";
import {
  GeneratedCredentials,
  RbacRoleMatrixItem,
  UserAccountItem,
} from "@/types/user.types";
import { useAuthStore } from "@/store/auth.store";
import { useUserStore } from "@/store/user.store";
import { usePortStore } from "@/store/port.store";
import { useUptStore } from "@/store/upt.store";
import { toast } from "@/store/toast.store";
import { formatLabel } from "@/lib/format-labels";
import { UserRole } from "@/types/auth.types";

const ROLE_BADGE_MAP: Record<UserRole, string> = {
  SUPERADMIN: "bg-purple-100 text-purple-800 border-purple-200",
  KEPALA_DINAS: "bg-slate-200 text-slate-900 border-slate-300",
  DISHUB_EKSEKUTIF: "bg-slate-100 text-slate-800 border-slate-200",
  KEPALA_BIDANG: "bg-sky-100 text-sky-800 border-sky-200",
  KEPALA_UPTD: "bg-cyan-100 text-cyan-800 border-cyan-200",
  KEPALA_PELABUHAN: "bg-emerald-200 text-emerald-900 border-emerald-300",
  ADMIN_PELABUHAN: "bg-emerald-100 text-emerald-800 border-emerald-200",
  PETUGAS_PELABUHAN: "bg-teal-100 text-teal-800 border-teal-200",
  PETUGAS_REGISTRASI_KONTRAK: "bg-teal-100 text-teal-800 border-teal-200",
  PETUGAS_DERMAGA: "bg-teal-50 text-teal-700 border-teal-200",
  PETUGAS_DERMAGA_BARANG: "bg-teal-100 text-teal-800 border-teal-200",
  PETUGAS_DERMAGA_PENUMPANG: "bg-teal-100 text-teal-800 border-teal-200",
  PETUGAS_RUANGAN: "bg-sky-100 text-sky-800 border-sky-200",
  PETUGAS_TAGIHAN: "bg-amber-100 text-amber-800 border-amber-200",
  BENDAHARA: "bg-amber-100 text-amber-800 border-amber-200",
  OPERATOR_KAPAL: "bg-blue-100 text-blue-800 border-blue-200",
  TENANT: "bg-indigo-100 text-indigo-800 border-indigo-200",
};

const ALL_ROLES: UserRole[] = [
  "SUPERADMIN",
  "KEPALA_DINAS",
  "DISHUB_EKSEKUTIF",
  "KEPALA_BIDANG",
  "KEPALA_UPTD",
  "KEPALA_PELABUHAN",
  "ADMIN_PELABUHAN",
  "PETUGAS_REGISTRASI_KONTRAK",
  "PETUGAS_PELABUHAN",
  "PETUGAS_DERMAGA",
  "PETUGAS_DERMAGA_BARANG",
  "PETUGAS_DERMAGA_PENUMPANG",
  "PETUGAS_RUANGAN",
  "PETUGAS_TAGIHAN",
  "BENDAHARA",
  "OPERATOR_KAPAL",
  "TENANT",
];

const ADMIN_ALLOWED_ROLES: UserRole[] = [
  "PETUGAS_REGISTRASI_KONTRAK",
  "PETUGAS_DERMAGA_BARANG",
  "PETUGAS_DERMAGA_PENUMPANG",
  "PETUGAS_RUANGAN",
  "PETUGAS_TAGIHAN",
  "PETUGAS_DERMAGA",
  "PETUGAS_PELABUHAN",
  "BENDAHARA",
];

const PORT_BOUND_ROLES: UserRole[] = [
  "KEPALA_PELABUHAN",
  "ADMIN_PELABUHAN",
  ...ADMIN_ALLOWED_ROLES,
];

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
  const [userForm, setUserForm] = useState({
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
  const [generatedCredModal, setGeneratedCredModal] = useState<{
    title: string;
    fullName: string;
    email: string;
    credentials: GeneratedCredentials;
  } | null>(null);
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
        /* ========================================================= */
        /* TAB 2: DYNAMIC RBAC MANAGEMENT PLANE                      */
        /* ========================================================= */
        <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-2xs">
          <div className="p-4 border-b border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between gap-3">
            <div>
              <h3 className="text-xs font-extrabold text-[#0B241E] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#D97706]" />
                Katalog 16 Peran & Hak Akses Dinamis (Database-Backed RBAC)
              </h3>
              <p className="text-[11px] text-[#64748B] mt-0.5">
                Perubahan izin langsung tersimpan ke tabel <code>role_permissions</code> dan berlaku real-time pada sesi JWT pengguna.
              </p>
            </div>
            <button
              type="button"
              onClick={() => fetchRbacRoles()}
              disabled={isLoadingRbac}
              className="px-3 py-1.5 rounded-xl border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] text-xs font-semibold text-[#475569] flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingRbac ? "animate-spin" : ""}`} />
              Muat Ulang
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E2E8F0] text-xs font-semibold text-[#64748B]">
                  <th className="py-3.5 px-4">Peran (Role)</th>
                  <th className="py-3.5 px-4">Domain Operasional</th>
                  <th className="py-3.5 px-4">Akun Aktif</th>
                  <th className="py-3.5 px-4">Hak Akses Efektif (Permissions)</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9] text-xs">
                {isLoadingRbac ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-[#64748B]">
                      <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                      Memuat matriks RBAC...
                    </td>
                  </tr>
                ) : (
                  rbacRoles.map((item) => (
                    <tr key={item.role} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{item.roleLabel}</div>
                        <div className="font-mono text-[11px] text-slate-400 mt-0.5">
                          {item.role}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 hidden md:table-cell">
                        {formatLabel(item.operationalDomain)}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800 whitespace-nowrap">
                        {item.activeUsersCount} akun
                      </td>
                      <td className="py-3.5 px-4 hidden sm:table-cell">
                        <div className="text-xs text-slate-600">
                          <span className="font-semibold text-slate-900">
                            {item.effectivePermissions.length}
                          </span>{" "}
                          izin aktif
                        </div>
                        <div className="font-mono text-[10px] text-slate-400 truncate max-w-sm mt-0.5">
                          {item.effectivePermissions.slice(0, 4).join(", ")}
                          {item.effectivePermissions.length > 4 ? " ..." : ""}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => openRbacEditModal(item)}
                          title="Atur Hak Akses RBAC"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ========================================================= */
        /* TAB 1: ACCOUNTS TABLE & AUDIT LOGS                        */
        /* ========================================================= */
        <>
          {/* Toolbar */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-2xs">
            <div className="flex items-center gap-3 flex-wrap">
              {isSuperadmin && (
                <select
                  value={portFilter}
                  onChange={(e) => setPortFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] text-xs font-semibold text-[#0B241E]"
                >
                  <option value="">Semua Pelabuhan</option>
                  {ports.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.code} - {p.name}
                    </option>
                  ))}
                </select>
              )}

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] text-xs font-semibold text-[#0B241E]"
              >
                <option value="">Semua Peran</option>
                {(isSuperadmin ? ALL_ROLES : ADMIN_ALLOWED_ROLES).map((r) => (
                  <option key={r} value={r}>
                    {formatLabel(r)}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => fetchUsers(portFilter ? Number(portFilter) : undefined)}
                disabled={isLoading}
                className="px-3 py-2 rounded-xl border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] text-xs font-semibold text-[#475569] flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
                Muat Ulang
              </button>
            </div>

            <button
              type="button"
              onClick={openCreateModal}
              className="px-4 py-2.5 rounded-xl bg-[#0B241E] hover:bg-[#143E33] text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <UserPlus className="w-4 h-4 text-[#D97706]" />
              Tambah Akun Pengguna
            </button>
          </div>

          {/* Users Table */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-2xs">
            <div className="p-4 border-b border-[#E2E8F0] bg-[#F8FAFC] flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#0B241E]">
                <Users className="w-4 h-4 text-[#D97706]" />
                Daftar Akun Terdaftar ({filteredUsers.length})
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchUserQuery}
                  onChange={(e) => {
                    setSearchUserQuery(e.target.value);
                    setUserPage(1);
                  }}
                  placeholder="Cari nama, username, atau email..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs border border-[#CBD5E1] rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-[#133D31]"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E2E8F0] text-xs font-semibold text-[#64748B]">
                    <th className="py-3.5 px-4">Nama Lengkap</th>
                    <th className="py-3.5 px-4">Email & Username</th>
                    <th className="py-3.5 px-4">Peran</th>
                    <th className="py-3.5 px-4">Pelabuhan</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9] text-xs">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-[#64748B]">
                        <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                        Memuat daftar pengguna...
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-[#94A3B8]">
                        Belum ada pengguna untuk pilihan ini.
                      </td>
                    </tr>
                  ) : (
                    pagedUsers.map((item) => {
                      const isSelf = item.id === currentUser?.id;
                      const adminBlocked =
                        isAdminPelabuhan && !ADMIN_ALLOWED_ROLES.includes(item.role);
                      const disableToggle = isSelf || adminBlocked || isSubmitting;

                      return (
                        <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-slate-900">
                              {item.fullName}
                              {isSelf && (
                                <span className="ml-1.5 text-[11px] font-medium text-amber-600">
                                  (Anda)
                                </span>
                              )}
                            </div>
                            {item.mustChangePassword && (
                              <div className="text-[11px] text-amber-600 mt-0.5">
                                Wajib ganti sandi saat login
                              </div>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">
                            <div>{item.email}</div>
                            {item.username && (
                              <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                                @{item.username}
                              </div>
                            )}
                          </td>
                          <td className="py-3.5 px-4 font-medium text-slate-800">
                            {formatLabel(item.role)}
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 hidden md:table-cell">
                            {portNameById(item.portId)}
                          </td>
                          <td className="py-3.5 px-4">
                            <StatusDot
                              status={item.isActive ? "ACTIVE" : "INACTIVE"}
                              label={item.isActive ? "Aktif" : "Nonaktif"}
                            />
                          </td>
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="inline-flex items-center justify-end gap-0.5">
                              <button
                                type="button"
                                disabled={disableToggle}
                                onClick={() => openEditModal(item)}
                                className={`p-1.5 rounded-lg transition-colors ${
                                  disableToggle
                                    ? "opacity-30 cursor-not-allowed text-slate-400"
                                    : "text-slate-400 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
                                }`}
                                title="Ubah Akun & Peran"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                disabled={disableToggle}
                                onClick={() => openResetPasswordModal(item)}
                                className={`p-1.5 rounded-lg transition-colors ${
                                  disableToggle
                                    ? "opacity-30 cursor-not-allowed text-slate-400"
                                    : "text-slate-400 hover:text-amber-600 hover:bg-amber-50 cursor-pointer"
                                }`}
                                title="Reset Kata Sandi (Auto-Generate)"
                              >
                                <KeyRound className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                disabled={disableToggle}
                                onClick={() => handleToggleStatus(item.id, item.isActive)}
                                className={`p-1.5 rounded-lg transition-colors ${
                                  disableToggle
                                    ? "opacity-30 cursor-not-allowed text-slate-400"
                                    : item.isActive
                                    ? "text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                                    : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 cursor-pointer"
                                }`}
                                title={item.isActive ? "Nonaktifkan Akun" : "Aktifkan Akun"}
                              >
                                <Power className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <TablePagination
              currentPage={userPage}
              totalPages={totalUserPages}
              totalItems={filteredUsers.length}
              itemsPerPage={userItemsPerPage}
              onPageChange={setUserPage}
              onItemsPerPageChange={setUserItemsPerPage}
            />
          </div>

          {/* Audit Log Sistem (SUPERADMIN Only) */}
          {isSuperadmin && (
            <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-2xs">
              <div className="p-4 border-b border-[#E2E8F0] bg-[#F8FAFC] flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs font-bold text-[#0B241E]">
                  Jejak Audit Sistem Terbaru ({filteredAuditLogs.length})
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={auditSearchQuery}
                    onChange={(e) => {
                      setAuditSearchQuery(e.target.value);
                      setAuditPage(1);
                    }}
                    placeholder="Cari aksi, entitas, pengguna..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs border border-[#CBD5E1] rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-[#133D31]"
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#E2E8F0] text-[11px] font-mono uppercase text-[#64748B]">
                      <th className="py-2.5 px-4">Waktu</th>
                      <th className="py-2.5 px-4">Aktor</th>
                      <th className="py-2.5 px-4">Aksi</th>
                      <th className="py-2.5 px-4">Entitas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1F5F9] text-xs">
                    {pagedAuditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-[#F8FAFC]">
                        <td className="py-2.5 px-4 font-mono text-[11px] text-[#64748B]">
                          {new Date(log.createdAt).toLocaleString("id-ID")}
                        </td>
                        <td className="py-2.5 px-4 font-semibold text-[#0B241E]">
                          {log.actor?.fullName || `User #${log.actorId ?? "-"}`}
                        </td>
                        <td className="py-2.5 px-4 font-mono text-[11px] font-bold text-[#0B241E]">
                          {log.action}
                        </td>
                        <td className="py-2.5 px-4 text-[#475569]">
                          {log.entityName} #{log.entityId ?? "-"}
                        </td>
                      </tr>
                    ))}
                    {filteredAuditLogs.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-[#94A3B8]">
                          Belum ada catatan audit log yang sesuai.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <TablePagination
                currentPage={auditPage}
                totalPages={totalAuditPages}
                totalItems={filteredAuditLogs.length}
                itemsPerPage={auditItemsPerPage}
                onPageChange={setAuditPage}
                onItemsPerPageChange={setAuditItemsPerPage}
              />
            </div>
          )}
        </>
      )}

      {/* Create / Edit User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/55 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveUser}
            className="bg-white rounded-3xl border border-[#E2E8F0] w-full max-w-2xl p-6 sm:p-8 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-start justify-between gap-4 pb-3 border-b border-[#F1F5F9]">
              <div>
                <h3 className="text-base font-extrabold text-[#0B241E]">
                  {editingUser
                    ? `Ubah Akun: ${editingUser.fullName}`
                    : "Tambah Akun Pengguna Baru"}
                </h3>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Kosongkan Username atau Kata Sandi untuk <strong>auto-generate random aman</strong> dari sistem.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-[#64748B] hover:bg-[#F1F5F9] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1.5">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  value={userForm.fullName}
                  onChange={(e) =>
                    setUserForm((prev) => ({ ...prev, fullName: e.target.value }))
                  }
                  placeholder="Barnabas Kapiyau"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1.5">
                  Alamat Email Resmi
                </label>
                <input
                  type="email"
                  required
                  value={userForm.email}
                  onChange={(e) =>
                    setUserForm((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="barnabas.kapiyau@porta.mimikakab.go.id"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1.5">
                  Username Login (Kosongkan = Auto-Generate)
                </label>
                <input
                  type="text"
                  value={userForm.username}
                  onChange={(e) =>
                    setUserForm((prev) => ({ ...prev, username: e.target.value }))
                  }
                  placeholder="Otomatis dibuat sistem jika kosong"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs font-mono"
                />
              </div>

              {!editingUser && (
                <div>
                  <label className="block text-xs font-bold text-[#334155] mb-1.5">
                    Kata Sandi Awal (Kosongkan = Auto-Generate Random)
                  </label>
                  <input
                    type="password"
                    minLength={6}
                    value={userForm.password}
                    onChange={(e) =>
                      setUserForm((prev) => ({ ...prev, password: e.target.value }))
                    }
                    placeholder="Otomatis dibuat acak oleh sistem jika kosong"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1.5">
                  Peran &amp; Wewenang (Role)
                </label>
                <select
                  disabled={Boolean(editingUser && !isSuperadmin)}
                  value={userForm.role}
                  onChange={(e) =>
                    setUserForm((prev) => ({
                      ...prev,
                      role: e.target.value as UserRole,
                    }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs font-semibold disabled:bg-slate-100"
                >
                  {creatableRoles.map((r) => (
                    <option key={r} value={r}>
                      {formatLabel(r)}
                    </option>
                  ))}
                </select>
              </div>

              {requiresPortId && (
                <div>
                  <label className="block text-xs font-bold text-[#334155] mb-1.5">
                    Pelabuhan Penugasan
                  </label>
                  <select
                    required
                    disabled={!isSuperadmin && Boolean(currentUser?.portId)}
                    value={userForm.portId}
                    onChange={(e) =>
                      setUserForm((prev) => ({ ...prev, portId: e.target.value }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs disabled:bg-slate-100"
                  >
                    <option value="">-- Pilih Pelabuhan --</option>
                    {ports.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.code} - {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {!editingUser && (
              <label className="flex items-center gap-2 text-xs text-[#334155] font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={userForm.mustChangePassword}
                  onChange={(e) =>
                    setUserForm((prev) => ({
                      ...prev,
                      mustChangePassword: e.target.checked,
                    }))
                  }
                  className="rounded border-[#CBD5E1]"
                />
                Wajibkan pengguna mengganti kata sandi saat login pertama kali
              </label>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-[#F1F5F9]">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-[#CBD5E1] text-xs font-bold text-[#475569] cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-[#0B241E] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {editingUser ? "Simpan Perubahan" : "Buat Akun & Generate Kredensial"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetTarget && (
        <div className="fixed inset-0 z-50 bg-black/55 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleConfirmResetPassword}
            className="bg-white rounded-3xl border border-[#E2E8F0] w-full max-w-lg p-6 sm:p-8 space-y-5 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4 pb-3 border-b border-[#F1F5F9]">
              <div>
                <h3 className="text-base font-extrabold text-[#0B241E]">
                  Reset Kata Sandi Pengguna
                </h3>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Atur ulang kata sandi untuk <strong>{resetTarget.fullName}</strong> ({resetTarget.email}).
                </p>
              </div>
              <button
                type="button"
                onClick={() => setResetTarget(null)}
                className="p-1.5 rounded-lg text-[#64748B] hover:bg-[#F1F5F9] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#334155] mb-1.5">
                Kata Sandi Baru (Kosongkan untuk Auto-Generate Random)
              </label>
              <input
                type="password"
                minLength={6}
                value={resetNewPassword}
                onChange={(e) => setResetNewPassword(e.target.value)}
                placeholder="Kosongkan agar sistem generate kata sandi acak"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs"
              />
            </div>

            <label className="flex items-center gap-2 text-xs text-[#334155] font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={resetMustChange}
                onChange={(e) => setResetMustChange(e.target.checked)}
                className="rounded border-[#CBD5E1]"
              />
              Wajibkan pengguna mengganti kata sandi setelah login
            </label>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#F1F5F9]">
              <button
                type="button"
                onClick={() => setResetTarget(null)}
                className="px-4 py-2 rounded-xl border border-[#CBD5E1] text-xs font-bold text-[#475569] cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Reset & Tampilkan Sandi
              </button>
            </div>
          </form>
        </div>
      )}

      {/* One-Time Generated Credentials Modal (WAJIB SALIN) */}
      {generatedCredModal && (
        <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-amber-300 w-full max-w-lg p-6 sm:p-7 space-y-5 shadow-2xl">
            <div className="flex items-start gap-3 pb-3 border-b border-[#F1F5F9]">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[#0B241E]">
                  {generatedCredModal.title}
                </h3>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Salin kredensial di bawah ini dan kirimkan secara aman kepada{" "}
                  <strong>{generatedCredModal.fullName}</strong>.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#0B241E] text-white space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#85A69B]">Email Login</span>
                <span className="font-mono font-bold">{generatedCredModal.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#85A69B]">Username</span>
                <span className="font-mono font-bold">
                  {generatedCredModal.credentials.username}
                </span>
              </div>
              <div className="pt-2 border-t border-[#1C4D3F] flex items-center justify-between gap-2">
                <div>
                  <span className="block text-[11px] text-[#D97706] font-bold">
                    Password Sementara (One-Time)
                  </span>
                  <span className="font-mono text-base font-black tracking-wider text-white">
                    {generatedCredModal.credentials.temporaryPassword}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyCredentials("password")}
                  className="px-3 py-1.5 rounded-lg bg-[#143E33] hover:bg-[#1E5748] text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey === "password" ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      Tersalin
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Salin Sandi
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-medium">
              <strong>Penting:</strong> Kata sandi sementara ini hanya ditampilkan <strong>satu kali</strong> dan tidak disimpan dalam bentuk teks biasa di database maupun audit log. Pengguna akan otomatis diwajibkan mengganti kata sandi saat login pertama.
            </div>

            <div className="flex items-center justify-between gap-2 pt-2">
              <button
                type="button"
                onClick={() => handleCopyCredentials("all")}
                className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                {copiedKey === "all" ? (
                  <>
                    <Check className="w-4 h-4" />
                    Semua Kredensial Tersalin!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Salin Semua Kredensial
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setGeneratedCredModal(null)}
                className="px-5 py-2.5 rounded-xl bg-[#0B241E] hover:bg-[#143E33] text-white text-xs font-bold cursor-pointer"
              >
                Saya Sudah Menyalin
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RBAC Edit Permissions Modal (Interactive Grouped Checkbox Matrix — Anti-Typo) */}
      {editingRbacRole && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveRbacPermissions}
            className="bg-white rounded-2xl border border-slate-200 w-full max-w-2xl p-6 space-y-4 shadow-xl max-h-[90vh] flex flex-col"
          >
            <div className="flex items-start justify-between gap-4 pb-3 border-b border-slate-100 shrink-0">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Atur Hak Akses RBAC: {editingRbacRole.roleLabel}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 font-mono">
                  {editingRbacRole.role} • {selectedRbacPerms.length} izin terpilih
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingRbacRole(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative shrink-0">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={rbacPermSearch}
                onChange={(e) => setRbacPermSearch(e.target.value)}
                placeholder="Cari kode izin (mis. vessel, visit, billing)..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-[#0B241E]"
              />
            </div>

            <div className="overflow-y-auto flex-1 space-y-4 pr-1">
              {Object.entries(groupedPermissions).map(([groupName, perms]) => {
                const allSelected = perms.every((p) => selectedRbacPerms.includes(p));
                return (
                  <div key={groupName} className="border border-slate-200 rounded-xl p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        {formatLabel(groupName)}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          if (allSelected) {
                            setSelectedRbacPerms((prev) => prev.filter((p) => !perms.includes(p)));
                          } else {
                            setSelectedRbacPerms((prev) => Array.from(new Set([...prev, ...perms])));
                          }
                        }}
                        className="text-[11px] font-semibold text-[#0B241E] hover:underline cursor-pointer"
                      >
                        {allSelected ? "Hapus Semua" : "Pilih Semua"}
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {perms.map((perm) => (
                        <label
                          key={perm}
                          className="flex items-center gap-2 text-xs text-slate-700 py-1 px-2 rounded-lg hover:bg-slate-50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedRbacPerms.includes(perm)}
                            onChange={() => toggleRbacPermission(perm)}
                            className="rounded border-slate-300 text-[#0B241E] focus:ring-[#0B241E]"
                          />
                          <span className="font-mono text-[11px]">{perm}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 shrink-0">
              <button
                type="button"
                onClick={() => setEditingRbacRole(null)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 rounded-lg bg-[#0B241E] hover:bg-[#143E33] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Simpan Hak Akses
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
