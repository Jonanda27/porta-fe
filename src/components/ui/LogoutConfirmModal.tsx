"use client";

import React, { useEffect, useState } from "react";
import { LogOut, AlertTriangle, Loader2, ShieldCheck, User } from "lucide-react";

export interface LogoutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  userName?: string;
  userRole?: string;
  userEmail?: string;
  title?: string;
  description?: string;
  isLoading?: boolean;
}

export function LogoutConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  userName = "Pengguna Sistem",
  userRole = "Petugas PORTA",
  userEmail,
  title = "Konfirmasi Keluar Sesi",
  description = "Apakah Anda yakin ingin keluar dari sistem PORTA? Sesi kerja aktif Anda akan diakhiri dan seluruh perubahan yang belum tersimpan mungkin akan hilang.",
  isLoading = false,
}: LogoutConfirmModalProps) {
  const [internalLoading, setInternalLoading] = useState(false);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isLoading && !internalLoading) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isLoading, internalLoading, onClose]);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setInternalLoading(true);
    try {
      await onConfirm();
    } finally {
      setInternalLoading(false);
    }
  };

  const isBusy = isLoading || internalLoading;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
    >
      {/* Backdrop */}
      <div
        onClick={() => {
          if (!isBusy) onClose();
        }}
        className="fixed inset-0 bg-[#0B241E]/70 backdrop-blur-xs transition-opacity"
      />

      {/* Modal Dialog Card */}
      <div className="relative bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden z-10 transform transition-all animate-in zoom-in-95 duration-200">
        {/* Top Accent Strip */}
        <div className="h-1.5 bg-gradient-to-r from-amber-500 via-rose-500 to-rose-600" />

        <div className="p-6">
          {/* Header Icon + Titles */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0 shadow-xs">
              <LogOut className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3
                  id="logout-dialog-title"
                  className="text-base sm:text-lg font-bold text-slate-900 tracking-tight"
                >
                  {title}
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                {description}
              </p>
            </div>
          </div>

          {/* User Account Info Pill */}
          <div className="mt-5 p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#0B241E] text-amber-400 flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
              {userName.substring(0, 2).toUpperCase() || "US"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900 truncate">
                {userName}
              </p>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 truncate">
                <span className="font-mono font-medium text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                  {userRole}
                </span>
                {userEmail && (
                  <>
                    <span>•</span>
                    <span className="truncate">{userEmail}</span>
                  </>
                )}
              </div>
            </div>
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          </div>

          {/* Security Note Alert */}
          <div className="mt-3.5 flex items-start gap-2 text-[11px] text-amber-800 bg-amber-50/80 border border-amber-200/80 rounded-lg p-2.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-snug">
              Pastikan Anda telah menuntaskan validasi berkas atau transaksi kasda sebelum mengakhiri sesi untuk mencegah data tidak tersinkronisasi.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              disabled={isBusy}
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors disabled:opacity-50 cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              Batal / Tetap Masuk
            </button>
            <button
              type="button"
              disabled={isBusy}
              onClick={handleConfirm}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 border border-rose-700 shadow-sm transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-1"
            >
              {isBusy ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Mengakhiri Sesi...</span>
                </>
              ) : (
                <>
                  <LogOut className="w-4 h-4" />
                  <span>Ya, Keluar Sesi</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
