import React from "react";
import { Loader2, Search, X } from "lucide-react";
import { ModalPortal } from "@/components/ui/ModalPortal";
import { RbacRoleMatrixItem } from "@/types/user.types";
import { formatLabel } from "@/lib/format-labels";

export interface RbacPermissionsModalProps {
  editingRbacRole: RbacRoleMatrixItem | null;
  selectedRbacPerms: string[];
  onChangeSelectedRbacPerms: React.Dispatch<React.SetStateAction<string[]>>;
  rbacPermSearch: string;
  onRbacPermSearchChange: (value: string) => void;
  groupedPermissions: Record<string, string[]>;
  isSubmitting: boolean;
  onTogglePermission: (code: string) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function RbacPermissionsModal({
  editingRbacRole,
  selectedRbacPerms,
  onChangeSelectedRbacPerms,
  rbacPermSearch,
  onRbacPermSearchChange,
  groupedPermissions,
  isSubmitting,
  onTogglePermission,
  onClose,
  onSubmit,
}: RbacPermissionsModalProps) {
  if (!editingRbacRole) return null;

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
        <form
          onSubmit={onSubmit}
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
              onClick={onClose}
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
              onChange={(e) => onRbacPermSearchChange(e.target.value)}
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
                          onChangeSelectedRbacPerms((prev) =>
                            prev.filter((p) => !perms.includes(p))
                          );
                        } else {
                          onChangeSelectedRbacPerms((prev) =>
                            Array.from(new Set([...prev, ...perms]))
                          );
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
                          onChange={() => onTogglePermission(perm)}
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
              onClick={onClose}
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
    </ModalPortal>
  );
}
