"use client";

import React, { useEffect, useState } from "react";
import {
  Users,
  UserPlus,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldAlert,
  RefreshCw,
  Search,
} from "lucide-react";
import { TablePagination } from "@/components/ui/table-pagination";
import { useAuthStore } from "@/store/auth.store";
import { useUserStore } from "@/store/user.store";
import { usePortStore } from "@/store/port.store";
import { useUptStore } from "@/store/upt.store";
import { formatLabel } from "@/lib/format-labels";
import { UserRole } from "@/types/auth.types";

const ROLE_BADGE_MAP: Record<UserRole, string> = {
  SUPERADMIN: "bg-purple-100 text-purple-800 border-purple-200",
  ADMIN_PELABUHAN: "bg-emerald-100 text-emerald-800 border-emerald-200",
  PETUGAS_DERMAGA: "bg-teal-100 text-teal-800 border-teal-200",
  BENDAHARA: "bg-amber-100 text-amber-800 border-amber-200",
  OPERATOR_KAPAL: "bg-blue-100 text-blue-800 border-blue-200",
  TENANT: "bg-indigo-100 text-indigo-800 border-indigo-200",
  DISHUB_EKSEKUTIF: "bg-slate-100 text-slate-800 border-slate-200",
};

const ALL_ROLES: UserRole[] = [
  "SUPERADMIN",
  "ADMIN_PELABUHAN",
  "PETUGAS_DERMAGA",
  "BENDAHARA",
  "DISHUB_EKSEKUTIF",
  "OPERATOR_KAPAL",
  "TENANT",
];

const ADMIN_ALLOWED_ROLES: UserRole[] = ["PETUGAS_DERMAGA", "BENDAHARA"];

export default function UsersPage() {
  const { user: currentUser } = useAuthStore();
  const {
    users,
    isLoading,
    isSubmitting,
    error,
    fetchUsers,
    createUser,
    toggleUserStatus,
    clearError,
  } = useUserStore();
  const { ports, fetchPorts } = usePortStore();
  const { auditLogs, fetchAuditLogs } = useUptStore();

  const isSuperadmin = currentUser?.role === "SUPERADMIN";
  const isAdminPelabuhan = currentUser?.role === "ADMIN_PELABUHAN";
  const canAccess = isSuperadmin || isAdminPelabuhan;

  const [portFilter, setPortFilter] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [searchUserQuery, setSearchUserQuery] = useState("");
  const [userPage, setUserPage] = useState(1);
  const [userItemsPerPage, setUserItemsPerPage] = useState(10);

  const [auditSearchQuery, setAuditSearchQuery] = useState("");
  const [auditPage, setAuditPage] = useState(1);
  const [auditItemsPerPage, setAuditItemsPerPage] = useState(10);

  const [feedback, setFeedback] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<UserRole>(
    isSuperadmin ? "ADMIN_PELABUHAN" : "PETUGAS_DERMAGA"
  );
  const [portId, setPortId] = useState<string>("");

  useEffect(() => {
    if (canAccess) {
      const numericPort = portFilter ? Number(portFilter) : undefined;
      fetchUsers(numericPort);
      fetchPorts();
      if (isSuperadmin) fetchAuditLogs();
    }
  }, [canAccess, isSuperadmin, portFilter, fetchUsers, fetchPorts, fetchAuditLogs]);

  if (!canAccess) {
    return (
      <div className="bg-white border border-rose-200 rounded-2xl p-8 text-center">
        <ShieldAlert className="w-10 h-10 text-rose-600 mx-auto mb-3" />
        <h2 className="text-base font-bold text-[#0B241E]">Akses Terbatas</h2>
        <p className="text-xs text-[#64748B] mt-1">
          Manajemen Pengguna hanya tersedia untuk Superadmin dan Admin Pelabuhan.
        </p>
      </div>
    );
  }

  const creatableRoles = isSuperadmin ? ALL_ROLES : ADMIN_ALLOWED_ROLES;
  const requiresPortId =
    role === "ADMIN_PELABUHAN" ||
    role === "PETUGAS_DERMAGA" ||
    role === "BENDAHARA";

  const filteredUsers = users.filter((u) => {
    const matchRole = roleFilter ? u.role === roleFilter : true;
    const matchSearch =
      !searchUserQuery ||
      u.fullName.toLowerCase().includes(searchUserQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchUserQuery.toLowerCase());
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
    setEmail("");
    setPassword("");
    setFullName("");
    setRole(isSuperadmin ? "ADMIN_PELABUHAN" : "PETUGAS_DERMAGA");
    setPortId(
      currentUser?.portId
        ? String(currentUser.portId)
        : ports[0]?.id
        ? String(ports[0].id)
        : ""
    );
    clearError();
    setIsModalOpen(true);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    await createUser(
      {
        email: email.trim(),
        password,
        fullName: fullName.trim(),
        role,
        portId: requiresPortId && portId ? Number(portId) : undefined,
      },
      portFilter ? Number(portFilter) : undefined
    );
    setFeedback(`Akun ${email} berhasil dibuat.`);
    setIsModalOpen(false);
  };

  const handleToggleStatus = async (userId: number, currentActive: boolean) => {
    setFeedback(null);
    await toggleUserStatus(userId, !currentActive);
    setFeedback(
      `Status pengguna #${userId} berhasil diubah menjadi ${
        !currentActive ? "Aktif" : "Nonaktif"
      }.`
    );
  };

  return (
    <div className="space-y-6">
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

      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

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
              placeholder="Cari nama atau email pengguna..."
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-[#CBD5E1] rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-[#133D31]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E2E8F0] text-xs font-semibold text-[#64748B]">
                <th className="py-3.5 px-4">Nama Lengkap</th>
                <th className="py-3.5 px-4">Email</th>
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
                    isAdminPelabuhan &&
                    item.role !== "PETUGAS_DERMAGA" &&
                    item.role !== "BENDAHARA";
                  const disableToggle = isSelf || adminBlocked || isSubmitting;

                  return (
                    <tr key={item.id} className="hover:bg-[#F8FAFC]">
                      <td className="py-3.5 px-4 font-bold text-[#0B241E]">
                        {item.fullName}
                        {isSelf && (
                          <span className="ml-1.5 text-[11px] font-semibold text-[#D97706]">
                            (Anda)
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-[#475569]">{item.email}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center whitespace-nowrap text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                            ROLE_BADGE_MAP[item.role]
                          }`}
                        >
                          {formatLabel(item.role)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-[#475569]">
                        {portNameById(item.portId)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center whitespace-nowrap text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                            item.isActive
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-rose-50 text-rose-700 border-rose-200"
                          }`}
                        >
                          {item.isActive ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          disabled={disableToggle}
                          onClick={() => handleToggleStatus(item.id, item.isActive)}
                          className={`px-3 py-1 rounded-lg border text-[11px] font-semibold transition-colors ${
                            disableToggle
                              ? "opacity-40 cursor-not-allowed border-[#E2E8F0] text-[#94A3B8]"
                              : item.isActive
                              ? "border-rose-200 text-rose-700 hover:bg-rose-50 cursor-pointer"
                              : "border-emerald-200 text-emerald-700 hover:bg-emerald-50 cursor-pointer"
                          }`}
                        >
                          {item.isActive ? "Nonaktifkan" : "Aktifkan"}
                        </button>
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

      {/* Create User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/55 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateUser}
            className="bg-white rounded-3xl border border-[#E2E8F0] w-full max-w-xl p-6 sm:p-8 space-y-5 shadow-2xl"
          >
            <div>
              <h3 className="text-base font-extrabold text-[#0B241E]">
                Tambah Akun Pengguna Baru
              </h3>
              <p className="text-xs text-[#64748B] mt-0.5">
                Daftarkan akun staf pelabuhan atau pengguna beserta wewenang perannya.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1.5">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Andi Petugas Dermaga"
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="petugas.baru@porta.mimikakab.go.id"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1.5">
                  Kata Sandi (min. 6 karakter)
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1.5">
                  Peran & Wewenang (Role)
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs font-semibold"
                >
                  {creatableRoles.map((r) => (
                    <option key={r} value={r}>
                      {formatLabel(r)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {requiresPortId && (
              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1">
                  Pelabuhan Penugasan
                </label>
                <select
                  required
                  disabled={!isSuperadmin && Boolean(currentUser?.portId)}
                  value={portId}
                  onChange={(e) => setPortId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
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

            <div className="flex justify-end gap-2 pt-2">
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
                className="px-4 py-2 rounded-xl bg-[#0B241E] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Buat Akun
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
