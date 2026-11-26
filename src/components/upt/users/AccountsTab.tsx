import React from "react";
import {
  Users,
  UserPlus,
  Loader2,
  RefreshCw,
  Search,
  Edit3,
  KeyRound,
  Power,
} from "lucide-react";
import { TablePagination } from "@/components/ui/table-pagination";
import { StatusDot } from "@/components/ui/status-indicator";
import { UserAccountItem } from "@/types/user.types";
import { PortItem } from "@/types/port.types";
import { AuditLogItem } from "@/types/upt.types";
import { formatLabel } from "@/lib/format-labels";
import { ADMIN_ALLOWED_ROLES, ALL_ROLES } from "./constants";

export interface AccountsTabProps {
  isSuperadmin: boolean;
  isAdminPelabuhan: boolean;
  currentUserId?: number;
  ports: PortItem[];
  portFilter: string;
  onPortFilterChange: (value: string) => void;
  roleFilter: string;
  onRoleFilterChange: (value: string) => void;
  isLoading: boolean;
  isSubmitting: boolean;
  onRefresh: () => void;
  onOpenCreateModal: () => void;
  searchUserQuery: string;
  onSearchUserQueryChange: (value: string) => void;
  filteredUsersCount: number;
  pagedUsers: UserAccountItem[];
  userPage: number;
  totalUserPages: number;
  userItemsPerPage: number;
  onUserPageChange: (page: number) => void;
  onUserItemsPerPageChange: (itemsPerPage: number) => void;
  portNameById: (id?: number | null) => string;
  onOpenEditModal: (user: UserAccountItem) => void;
  onOpenResetPasswordModal: (user: UserAccountItem) => void;
  onToggleStatus: (userId: number, currentActive: boolean) => void;
  auditSearchQuery: string;
  onAuditSearchQueryChange: (value: string) => void;
  filteredAuditLogsCount: number;
  pagedAuditLogs: AuditLogItem[];
  auditPage: number;
  totalAuditPages: number;
  auditItemsPerPage: number;
  onAuditPageChange: (page: number) => void;
  onAuditItemsPerPageChange: (itemsPerPage: number) => void;
}

export function AccountsTab({
  isSuperadmin,
  isAdminPelabuhan,
  currentUserId,
  ports,
  portFilter,
  onPortFilterChange,
  roleFilter,
  onRoleFilterChange,
  isLoading,
  isSubmitting,
  onRefresh,
  onOpenCreateModal,
  searchUserQuery,
  onSearchUserQueryChange,
  filteredUsersCount,
  pagedUsers,
  userPage,
  totalUserPages,
  userItemsPerPage,
  onUserPageChange,
  onUserItemsPerPageChange,
  portNameById,
  onOpenEditModal,
  onOpenResetPasswordModal,
  onToggleStatus,
  auditSearchQuery,
  onAuditSearchQueryChange,
  filteredAuditLogsCount,
  pagedAuditLogs,
  auditPage,
  totalAuditPages,
  auditItemsPerPage,
  onAuditPageChange,
  onAuditItemsPerPageChange,
}: AccountsTabProps) {
  return (
    <>
      {/* Toolbar */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-3 flex-wrap">
          {isSuperadmin && (
            <select
              value={portFilter}
              onChange={(e) => onPortFilterChange(e.target.value)}
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
            onChange={(e) => onRoleFilterChange(e.target.value)}
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
            onClick={onRefresh}
            disabled={isLoading}
            className="px-3 py-2 rounded-xl border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] text-xs font-semibold text-[#475569] flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Muat Ulang
          </button>
        </div>

        <button
          type="button"
          onClick={onOpenCreateModal}
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
            Daftar Akun Terdaftar ({filteredUsersCount})
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchUserQuery}
              onChange={(e) => {
                onSearchUserQueryChange(e.target.value);
                onUserPageChange(1);
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
              ) : filteredUsersCount === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-[#94A3B8]">
                    Belum ada pengguna untuk pilihan ini.
                  </td>
                </tr>
              ) : (
                pagedUsers.map((item) => {
                  const isSelf = item.id === currentUserId;
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
                            onClick={() => onOpenEditModal(item)}
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
                            onClick={() => onOpenResetPasswordModal(item)}
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
                            onClick={() => onToggleStatus(item.id, item.isActive)}
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
          totalItems={filteredUsersCount}
          itemsPerPage={userItemsPerPage}
          onPageChange={onUserPageChange}
          onItemsPerPageChange={onUserItemsPerPageChange}
        />
      </div>

      {/* Audit Log Sistem (SUPERADMIN Only) */}
      {isSuperadmin && (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-2xs">
          <div className="p-4 border-b border-[#E2E8F0] bg-[#F8FAFC] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs font-bold text-[#0B241E]">
              Jejak Audit Sistem Terbaru ({filteredAuditLogsCount})
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={auditSearchQuery}
                onChange={(e) => {
                  onAuditSearchQueryChange(e.target.value);
                  onAuditPageChange(1);
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
                {filteredAuditLogsCount === 0 && (
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
            totalItems={filteredAuditLogsCount}
            itemsPerPage={auditItemsPerPage}
            onPageChange={onAuditPageChange}
            onItemsPerPageChange={onAuditItemsPerPageChange}
          />
        </div>
      )}
    </>
  );
}
