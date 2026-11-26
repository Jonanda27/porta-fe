import React from "react";
import { Sparkles, Copy, Check } from "lucide-react";
import { ModalPortal } from "@/components/ui/ModalPortal";
import { GeneratedCredentialModalData } from "./constants";

export interface GeneratedCredentialsModalProps {
  modalData: GeneratedCredentialModalData | null;
  copiedKey: "all" | "password" | null;
  onCopy: (mode: "all" | "password") => void;
  onClose: () => void;
}

export function GeneratedCredentialsModal({
  modalData,
  copiedKey,
  onCopy,
  onClose,
}: GeneratedCredentialsModalProps) {
  if (!modalData) return null;

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[100] bg-black/65 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl border border-amber-300 w-full max-w-lg p-6 sm:p-7 space-y-5 shadow-2xl">
          <div className="flex items-start gap-3 pb-3 border-b border-[#F1F5F9]">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#0B241E]">
                {modalData.title}
              </h3>
              <p className="text-xs text-[#64748B] mt-0.5">
                Salin kredensial di bawah ini dan kirimkan secara aman kepada{" "}
                <strong>{modalData.fullName}</strong>.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#0B241E] text-white space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[#85A69B]">Email Login</span>
              <span className="font-mono font-bold">{modalData.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#85A69B]">Username</span>
              <span className="font-mono font-bold">
                {modalData.credentials.username}
              </span>
            </div>
            <div className="pt-2 border-t border-[#1C4D3F] flex items-center justify-between gap-2">
              <div>
                <span className="block text-[11px] text-[#D97706] font-bold">
                  Password Sementara (One-Time)
                </span>
                <span className="font-mono text-base font-black tracking-wider text-white">
                  {modalData.credentials.temporaryPassword}
                </span>
              </div>
              <button
                type="button"
                onClick={() => onCopy("password")}
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
              onClick={() => onCopy("all")}
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
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-[#0B241E] hover:bg-[#143E33] text-white text-xs font-bold cursor-pointer"
            >
              Saya Sudah Menyalin
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
