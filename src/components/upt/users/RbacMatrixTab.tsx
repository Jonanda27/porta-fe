import React from "react";
import { ShieldCheck, RefreshCw, Loader2, Edit3 } from "lucide-react";
import { RbacRoleMatrixItem } from "@/types/user.types";
import { formatLabel } from "@/lib/format-labels";

export interface RbacMatrixTabProps {
  rbacRoles: RbacRoleMatrixItem[];
  isLoadingRbac: boolean;
  onRefresh: () => void;
  onOpenRbacEditModal: (item: RbacRoleMatrixItem) => void;
}

export function RbacMatrixTab({
  rbacRoles,
  isLoadingRbac,
  onRefresh,
  onOpenRbacEditModal,
}: RbacMatrixTabProps) {
  return (
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
          onClick={onRefresh}
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
                      onClick={() => onOpenRbacEditModal(item)}
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
  );
}
