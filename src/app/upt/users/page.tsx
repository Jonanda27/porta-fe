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
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { useUserStore } from "@/store/user.store";
import { usePortStore } from "@/store/port.store";
import { useUptStore } from "@/store/upt.store";
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

  const filteredUsers = users.filter((u) =>
    roleFilter ? u.role === roleFilter : true
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
            className="px-3 py-2 rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] text-xs font-semibold text-[#0B241E]"
          >
            <option value="">Semua Role</option>
            {ALL_ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
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
        <div className="p-4 border-b border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-[#0B241E]">
            <Users className="w-4 h-4 text-[#D97706]" />
            Daftar Akun Terdaftar ({filteredUsers.length})
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E2E8F0] text-[11px] font-mono uppercase text-[#64748B]">
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Nama Lengkap</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Pelabuhan</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9] text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-[#64748B]">
                    <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                    Memuat daftar pengguna...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-[#94A3B8]">
                    Tidak ada akun pengguna yang sesuai filter.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((item) => {
                  const isSelf = item.id === currentUser?.id;
                  const adminBlocked =
                    isAdminPelabuhan &&
                    item.role !== "PETUGAS_DERMAGA" &&
                    item.role !== "BENDAHARA";
                  const disableToggle = isSelf || adminBlocked || isSubmitting;

                  return (
                    <tr key={item.id} className="hover:bg-[#F8FAFC]">
                      <td className="py-3 px-4 font-mono text-[#64748B]">
                        #{item.id}
                      </td>
                      <td className="py-3 px-4 font-bold text-[#0B241E]">
                        {item.fullName}
                        {isSelf && (
                          <span className="ml-1.5 text-[10px] font-mono text-[#D97706]">
                            (Anda)
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-[#475569]">{item.email}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            ROLE_BADGE_MAP[item.role]
                          }`}
                        >
                          {item.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[#475569]">
                        {portNameById(item.portId)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            item.isActive
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-rose-50 text-rose-700 border-rose-200"
                          }`}
                        >
                          {item.isActive ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          disabled={disableToggle}
                          onClick={() => handleToggleStatus(item.id, item.isActive)}
                          className={`px-3 py-1 rounded-lg border text-[11px] font-bold transition-colors ${
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
      </div>

      {/* Audit Log Sistem (SUPERADMIN Only) */}
      {isSuperadmin && (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-2xs">
          <div className="p-4 border-b border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between">
            <div className="text-xs font-bold text-[#0B241E]">
              Jejak Audit Sistem Terbaru ({auditLogs.length})
            </div>
          </div>
          <div className="overflow-x-auto max-h-80 overflow-y-auto">
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
                {auditLogs.map((log) => (
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
                {auditLogs.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-[#94A3B8]">
                      Belum ada catatan audit log.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateUser}
            className="bg-white rounded-2xl border border-[#E2E8F0] w-full max-w-md p-6 space-y-4 shadow-xl"
          >
            <h3 className="text-base font-extrabold text-[#0B241E]">
              Tambah Akun Pengguna Baru
            </h3>

            <div>
              <label className="block text-xs font-bold text-[#334155] mb-1">
                Nama Lengkap
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Andi Petugas Dermaga"
                className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#334155] mb-1">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="petugas.baru@porta.mimikakab.go.id"
                className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#334155] mb-1">
                Kata Sandi (min. 6 karakter)
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#334155] mb-1">
                Role Wewenang
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
              >
                {creatableRoles.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
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
