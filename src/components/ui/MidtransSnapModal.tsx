"use client";

import React, { useEffect, useId, useState } from "react";
import { AlertTriangle, Loader2, RefreshCw, ShieldCheck, X } from "lucide-react";
import { ModalPortal } from "@/components/ui/ModalPortal";
import { embedMidtransSnap, MidtransSnapResult } from "@/lib/midtrans-snap";

export interface MidtransSnapSessionData {
  orderId: string;
  amountIdr: number;
  snapToken?: string | null;
  redirectUrl?: string | null;
}

interface MidtransSnapModalProps {
  isOpen: boolean;
  session: MidtransSnapSessionData | null;
  clientKey?: string | null;
  isProduction?: boolean;
  title?: string;
  onSuccess?: (result: MidtransSnapResult) => void;
  onPending?: (result: MidtransSnapResult) => void;
  onCheckStatus?: () => void;
  onSwitchToManual?: () => void;
  onClose: () => void;
}

export function MidtransSnapModal({
  isOpen,
  session,
  clientKey,
  isProduction,
  title = "Pembayaran Online Midtrans",
  onSuccess,
  onPending,
  onCheckStatus,
  onSwitchToManual,
  onClose,
}: MidtransSnapModalProps) {
  const rawId = useId();
  const embedId = `midtrans-snap-${rawId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const [isLoadingSnap, setIsLoadingSnap] = useState(false);
  const [snapError, setSnapError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !session?.snapToken) return;

    let cancelled = false;
    setIsLoadingSnap(true);
    setSnapError(null);

    const timer = window.setTimeout(() => {
      void embedMidtransSnap({
        snapToken: session.snapToken,
        embedId,
        clientKey,
        isProduction,
        onSuccess: (result) => {
          if (!cancelled) onSuccess?.(result);
        },
        onPending: (result) => {
          if (!cancelled) onPending?.(result);
        },
        onError: () => {
          if (!cancelled) {
            setSnapError("Terjadi kendala saat memproses pembayaran di Midtrans.");
          }
        },
        onClose: () => {
          if (!cancelled) onCheckStatus?.();
        },
      })
        .catch((err: unknown) => {
          if (!cancelled) {
            setSnapError(
              err instanceof Error
                ? err.message
                : "Gagal memuat tampilan pembayaran Midtrans di halaman ini.",
            );
          }
        })
        .finally(() => {
          if (!cancelled) setIsLoadingSnap(false);
        });
    }, 50);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [isOpen, session?.snapToken, embedId, clientKey, isProduction, onSuccess, onPending, onCheckStatus]);

  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow === "hidden" ? "" : prevOverflow;
      document.documentElement.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen || !session) return null;

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[120] bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 overflow-hidden">
        <div className="bg-white rounded-2xl max-w-lg w-full h-[min(740px,calc(100vh-1.5rem))] flex flex-col shadow-2xl border border-[#CBD5E1] overflow-hidden">
          <div className="bg-[#0B241E] text-white px-4 py-2.5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <ShieldCheck className="w-5 h-5 text-[#D97706] shrink-0" />
              <div className="min-w-0">
                <h3 className="font-bold text-sm truncate">{title}</h3>
                <p className="text-[11px] text-[#94A3B8] font-mono truncate">
                  {session.orderId} • Rp {Number(session.amountIdr).toLocaleString("id-ID")}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-[#85A69B] hover:text-white transition-colors cursor-pointer shrink-0"
              aria-label="Tutup jendela pembayaran Midtrans"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 min-h-0 p-3 bg-[#F8FAFC] flex flex-col gap-2 overflow-hidden">
            {snapError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold flex items-start gap-2 shrink-0">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <div className="space-y-1">
                  <p>{snapError}</p>
                  {session.redirectUrl && (
                    <p className="text-[11px] text-rose-700 font-normal">
                      Pastikan server backend & frontend telah di-restart agar `MIDTRANS_CLIENT_KEY` terbaca.
                    </p>
                  )}
                </div>
              </div>
            )}

            {isLoadingSnap && (
              <div className="py-8 flex flex-col items-center justify-center gap-2 text-xs text-[#64748B] shrink-0">
                <Loader2 className="w-6 h-6 animate-spin text-[#0B241E]" />
                <span>Memuat antarmuka pembayaran Midtrans...</span>
              </div>
            )}

            <div
              id={embedId}
              className="flex-1 min-h-0 w-full bg-white rounded-xl border border-[#E2E8F0] overflow-hidden [&>iframe]:w-full [&>iframe]:h-full [&>iframe]:border-0"
            />

            <div className="flex items-center justify-between gap-2 pt-0.5 shrink-0">
              <span className="text-[11px] text-[#64748B]">
                Pembayaran diproses langsung di aplikasi PORTA.
              </span>
              <div className="flex items-center gap-2">
                {onSwitchToManual && (
                  <button
                    type="button"
                    onClick={onSwitchToManual}
                    className="px-3 py-2 rounded-xl border border-[#CBD5E1] bg-white hover:bg-[#F1F5F9] text-[#475569] text-xs font-semibold cursor-pointer"
                  >
                    Transfer Manual
                  </button>
                )}
                {onCheckStatus && (
                  <button
                    type="button"
                    onClick={onCheckStatus}
                    className="px-3.5 py-2 rounded-xl border border-[#CBD5E1] bg-white hover:bg-[#F1F5F9] text-[#0B241E] text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Cek Status
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-2 rounded-xl bg-[#0B241E] hover:bg-[#143E33] text-white text-xs font-bold cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
