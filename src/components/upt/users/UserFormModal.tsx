import React from "react";
import { Loader2, X } from "lucide-react";
import { ModalPortal } from "@/components/ui/ModalPortal";
import { UserAccountItem } from "@/types/user.types";
import { PortItem } from "@/types/port.types";
import { UserRole } from "@/types/auth.types";
import { formatLabel } from "@/lib/format-labels";
import { UserFormState } from "./constants";

export interface UserFormModalProps {
  isOpen: boolean;
  editingUser: UserAccountItem | null;
  userForm: UserFormState;
  onChangeForm: React.Dispatch<React.SetStateAction<UserFormState>>;
  isSuperadmin: boolean;
  currentUserPortId?: number | null;
  creatableRoles: UserRole[];
  requiresPortId: boolean;
  ports: PortItem[];
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function UserFormModal({
  isOpen,
  editingUser,
  userForm,
  onChangeForm,
  isSuperadmin,
  currentUserPortId,
  creatableRoles,
  requiresPortId,
  ports,
  isSubmitting,
  onClose,
  onSubmit,
}: UserFormModalProps) {
  if (!isOpen) return null;

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[100] bg-black/55 backdrop-blur-xs flex items-center justify-center p-4">
        <form
          onSubmit={onSubmit}
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
              onClick={onClose}
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
                  onChangeForm((prev) => ({ ...prev, fullName: e.target.value }))
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
                  onChangeForm((prev) => ({ ...prev, email: e.target.value }))
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
                  onChangeForm((prev) => ({ ...prev, username: e.target.value }))
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
                    onChangeForm((prev) => ({ ...prev, password: e.target.value }))
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
                  onChangeForm((prev) => ({
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
                  disabled={!isSuperadmin && Boolean(currentUserPortId)}
                  value={userForm.portId}
                  onChange={(e) =>
                    onChangeForm((prev) => ({ ...prev, portId: e.target.value }))
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
                  onChangeForm((prev) => ({
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
              onClick={onClose}
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
    </ModalPortal>
  );
}
