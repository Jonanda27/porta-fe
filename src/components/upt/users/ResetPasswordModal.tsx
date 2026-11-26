import React from "react";
import { Loader2, X } from "lucide-react";
import { ModalPortal } from "@/components/ui/ModalPortal";
import { UserAccountItem } from "@/types/user.types";

export interface ResetPasswordModalProps {
  resetTarget: UserAccountItem | null;
  resetNewPassword: string;
  onResetNewPasswordChange: (value: string) => void;
  resetMustChange: boolean;
  onResetMustChangeChange: (checked: boolean) => void;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function ResetPasswordModal({
  resetTarget,
  resetNewPassword,
  onResetNewPasswordChange,
  resetMustChange,
  onResetMustChangeChange,
  isSubmitting,
  onClose,
  onSubmit,
}: ResetPasswordModalProps) {
  if (!resetTarget) return null;

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[100] bg-black/55 backdrop-blur-xs flex items-center justify-center p-4">
        <form
          onSubmit={onSubmit}
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
              onClick={onClose}
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
              onChange={(e) => onResetNewPasswordChange(e.target.value)}
              placeholder="Kosongkan agar sistem generate kata sandi acak"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs"
            />
          </div>

          <label className="flex items-center gap-2 text-xs text-[#334155] font-medium cursor-pointer">
            <input
              type="checkbox"
              checked={resetMustChange}
              onChange={(e) => onResetMustChangeChange(e.target.checked)}
              className="rounded border-[#CBD5E1]"
            />
            Wajibkan pengguna mengganti kata sandi setelah login
          </label>

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
              className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Reset & Tampilkan Sandi
            </button>
          </div>
        </form>
      </div>
    </ModalPortal>
  );
}
