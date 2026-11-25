"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Ship } from "lucide-react";
import { ShipVisitItem, UptInvoiceItem } from "@/types/upt.types";

export interface ExecutiveApprovalItem {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  href: string;
}

interface ExecutiveQueueSectionProps {
  pendingApprovals: ExecutiveApprovalItem[];
  unbilledVisits: ShipVisitItem[];
  unpaidInvoices: UptInvoiceItem[];
}

export function ExecutiveQueueSection({
  pendingApprovals,
  unbilledVisits,
  unpaidInvoices,
}: ExecutiveQueueSectionProps) {
  const receivablesTotal = unpaidInvoices.length + unbilledVisits.length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* Antrean Pengesahan Kepala Pelabuhan */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-2xs">
        <div className="px-5 py-3.5 border-b border-[#E2E8F0] flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-[#0B241E]">
            Antrean Pengesahan Kepala Pelabuhan
          </h3>
          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
            {pendingApprovals.length} Dokumen
          </span>
        </div>
        <div className="divide-y divide-[#F1F5F9]">
          {pendingApprovals.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#64748B] flex flex-col items-center gap-1.5">
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              <span>Seluruh PKS &amp; izin sandar sudah diselesaikan.</span>
            </div>
          ) : (
            pendingApprovals.slice(0, 5).map((item) => (
              <div
                key={item.id}
                className="px-5 py-3 flex items-center justify-between gap-3 hover:bg-[#F8FAFC]"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#0B241E]/10 text-[#0B241E]">
                      {item.badge}
                    </span>
                    <p className="text-xs font-bold text-[#0B241E] truncate">
                      {item.title}
                    </p>
                  </div>
                  <p className="text-[11px] text-[#64748B] truncate mt-0.5">
                    {item.subtitle}
                  </p>
                </div>
                <Link
                  href={item.href}
                  className="px-3 py-1.5 rounded-lg bg-[#0B241E] hover:bg-[#143E33] text-[11px] font-bold text-white inline-flex items-center gap-1 shrink-0"
                >
                  <span>Tinjau</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Pengawasan Tagihan & Kunjungan Belum SKRD */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-2xs">
        <div className="px-5 py-3.5 border-b border-[#E2E8F0] flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-[#0B241E]">
            Pengawasan Tagihan &amp; Kunjungan Belum SKRD
          </h3>
          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
            {receivablesTotal} Item
          </span>
        </div>
        <div className="divide-y divide-[#F1F5F9]">
          {receivablesTotal === 0 ? (
            <div className="p-8 text-center text-xs text-[#64748B] flex flex-col items-center gap-1.5">
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              <span>Tidak ada piutang SKRD atau kunjungan belum tertagih.</span>
            </div>
          ) : (
            <>
              {unbilledVisits.slice(0, 3).map((v) => (
                <div
                  key={`unbilled-${v.id}`}
                  className="px-5 py-3 flex items-center justify-between gap-3 hover:bg-[#F8FAFC]"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                        Belum SKRD
                      </span>
                      <p className="text-xs font-bold text-[#0B241E] truncate">
                        {v.visitNumber}
                      </p>
                    </div>
                    <p className="text-[11px] text-[#64748B] truncate mt-0.5">
                      {v.vessel?.name || "Kapal"} — {v.operator?.name || "-"}
                    </p>
                  </div>
                  <Link
                    href="/upt/kapal"
                    className="text-[11px] font-bold text-[#D97706] hover:underline inline-flex items-center gap-1 shrink-0"
                  >
                    <Ship className="w-3 h-3" />
                    <span>Cek</span>
                  </Link>
                </div>
              ))}
              {unpaidInvoices.slice(0, 3).map((inv) => (
                <div
                  key={`inv-${inv.id}`}
                  className="px-5 py-3 flex items-center justify-between gap-3 hover:bg-[#F8FAFC]"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#0B241E] truncate">
                      {inv.documentNumber}
                    </p>
                    <p className="text-[11px] text-[#64748B] truncate mt-0.5">
                      {inv.operator?.name || "Operator"} —{" "}
                      <span className="font-mono font-bold text-[#0B241E]">
                        Rp {Number(inv.totalAmountIdr).toLocaleString("id-ID")}
                      </span>
                    </p>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 shrink-0">
                    {inv.status}
                  </span>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
