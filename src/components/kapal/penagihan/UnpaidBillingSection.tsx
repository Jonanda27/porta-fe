"use client";

import React from "react";
import { CheckCircle2, RefreshCw } from "lucide-react";
import { BillingInvoice, UnpaidLeaseSummary } from "@/types/billing.types";
import { UnpaidInvoiceCard } from "./UnpaidInvoiceCard";
import { UnpaidLeaseCard } from "./UnpaidLeaseCard";

export interface UnpaidBillingSectionProps {
  isLoading: boolean;
  totalUnpaidCount: number;
  filteredUnpaid: BillingInvoice[];
  filteredUnpaidLeases: UnpaidLeaseSummary[];
  onOpenPayment: (invoice: BillingInvoice, defaultTab: "gateway" | "manual") => void;
  onOpenLeasePayment: (
    item: UnpaidLeaseSummary,
    defaultTab: "gateway" | "manual"
  ) => void;
}

export function UnpaidBillingSection({
  isLoading,
  totalUnpaidCount,
  filteredUnpaid,
  filteredUnpaidLeases,
  onOpenPayment,
  onOpenLeasePayment,
}: UnpaidBillingSectionProps) {
  return (
    <div className="space-y-4">
      {isLoading && totalUnpaidCount === 0 ? (
        <div className="bg-white border border-[#CBD5E1] rounded-2xl p-10 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-[#0B241E] animate-spin mx-auto" />
          <p className="text-xs text-[#64748B]">
            Memuat tagihan retribusi e-SKRD terkini dari server...
          </p>
        </div>
      ) : filteredUnpaid.length === 0 && filteredUnpaidLeases.length === 0 ? (
        <div className="bg-white border border-[#CBD5E1] rounded-2xl p-8 text-center text-xs text-[#64748B] space-y-2">
          <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
          <p className="font-bold text-[#0B241E] text-sm">Tidak ada tagihan tertunda!</p>
          <p>Seluruh kewajiban retribusi pengajuan dermaga maupun sewa ruangan Anda telah lunas.</p>
        </div>
      ) : (
        <>
          {/* KARTU TAGIHAN PENGAJUAN DERMAGA (e-SKRD KAPAL) */}
          {filteredUnpaid.map((inv) => (
            <UnpaidInvoiceCard
              key={`dermaga-${inv.id}`}
              invoice={inv}
              onOpenPayment={onOpenPayment}
            />
          ))}

          {/* KARTU TAGIHAN PENGAJUAN RUANGAN (SEWA ASET / PKS) */}
          {filteredUnpaidLeases.map((item) => (
            <UnpaidLeaseCard
              key={`ruangan-${item.lease.id}`}
              item={item}
              onOpenLeasePayment={onOpenLeasePayment}
            />
          ))}
        </>
      )}
    </div>
  );
}
