"use client";

import React, { useEffect, useId, useState } from "react";
import { AlertTriangle, ExternalLink, Loader2, RefreshCw, ShieldCheck } from "lucide-react";
import {
  embedMidtransSnap,
  hideMidtransSnap,
  MidtransSnapResult,
} from "@/lib/midtrans-snap";

export interface EmbeddedMidtransSession {
  orderId: string;
  amountIdr: number;
  snapToken?: string | null;
  redirectUrl?: string | null;
}

interface EmbeddedMidtransPanelProps {
  session: EmbeddedMidtransSession;
  clientKey?: string | null;
  isProduction?: boolean;
  isCheckingStatus?: boolean;
  onSuccess?: (result: MidtransSnapResult) => void;
  onPending?: (result: MidtransSnapResult) => void;
  onCheckStatus?: () => void;
}

export function EmbeddedMidtransPanel({
  session,
  clientKey,
  isProduction,
  isCheckingStatus = false,
  onSuccess,
  onPending,
  onCheckStatus,
}: EmbeddedMidtransPanelProps) {
  const rawId = useId();
  const embedId = `midtrans-embed-${rawId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const [isLoadingSnap, setIsLoadingSnap] = useState(false);
  const [snapError, setSnapError] = useState<string | null>(null);

  useEffect(() => {
    if (!session.snapToken) return;

    let cancelled = false;
    setIsLoadingSnap(true);
    setSnapError(null);

    const timer = window.setTimeout(() => {
      hideMidtransSnap();
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
                : "Gagal memuat tampilan pembayaran Midtrans di panel ini.",
            );
          }
        })
        .finally(() => {
          if (!cancelled) setIsLoadingSnap(false);
        });
    }, 60);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      hideMidtransSnap();
    };
  }, [session.snapToken, embedId, clientKey, isProduction, onSuccess, onPending, onCheckStatus]);

  return (
    <div className="flex flex-col h-full min-h-[540px] gap-3">
      <div className="px-3.5 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-emerald-900 truncate">
              Sesi Midtrans Aktif • <span className="font-mono">{session.orderId}</span>
            </p>
            <p className="text-[10px] text-emerald-700">
              Pilih QRIS, Virtual Account, atau E-Wallet langsung di bawah ini.
            </p>
          </div>
        </div>
        {onCheckStatus && (
          <button
            type="button"
            onClick={onCheckStatus}
            disabled={isCheckingStatus}
            className="px-3 py-1.5 rounded-lg bg-white border border-emerald-300 hover:bg-emerald-100/60 text-emerald-900 text-[11px] font-bold inline-flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${isCheckingStatus ? "animate-spin" : ""}`} />
            <span>Cek Status</span>
          </button>
        )}
      </div>

      {snapError && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold flex items-start justify-between gap-3 shrink-0">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <div className="space-y-1">
              <p>{snapError}</p>
              <p className="text-[11px] font-normal text-rose-700">
                Jika tampilan embed terblokir browser, gunakan tautan pembayaran langsung.
              </p>
            </div>
          </div>
          {session.redirectUrl && (
            <a
              href={session.redirectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-800 text-white text-[11px] font-bold inline-flex items-center gap-1 shrink-0"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Buka Link</span>
            </a>
          )}
        </div>
      )}

      <div className="relative flex-1 min-h-[460px] w-full bg-white rounded-xl border border-[#CBD5E1] overflow-hidden shadow-2xs">
        {isLoadingSnap && (
          <div className="absolute inset-0 z-10 bg-white/90 flex flex-col items-center justify-center gap-2 text-xs text-[#64748B]">
            <Loader2 className="w-6 h-6 animate-spin text-[#0B241E]" />
            <span>Menyiapkan antarmuka pembayaran Midtrans...</span>
          </div>
        )}
        <div
          id={embedId}
          className="w-full h-full min-h-[460px] [&>iframe]:w-full [&>iframe]:h-full [&>iframe]:min-h-[460px] [&>iframe]:border-0"
        />
      </div>
    </div>
  );
}
