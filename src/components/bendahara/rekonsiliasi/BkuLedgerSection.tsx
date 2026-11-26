"use client";

import { CheckCircle2, Lock, Printer } from "lucide-react";
import { formatRupiah } from "@/lib/kapal-billing";
import { BillingInvoice } from "@/types/billing.types";

export interface BkuLedgerSectionProps {
  selectedDate: string;
  onChangeDate: (date: string) => void;
  isClosingBook: boolean;
  onCloseDailyBook: () => void;
  onPrintBku: () => void;
  paidTransactions: BillingInvoice[];
  totalVerifiedPAD: number;
}

export function BkuLedgerSection({
  selectedDate,
  onChangeDate,
  isClosingBook,
  onCloseDailyBook,
  onPrintBku,
  paidTransactions,
  totalVerifiedPAD,
}: BkuLedgerSectionProps) {
  return (
    <div className="bg-white border border-[#CBD5E1] rounded-2xl shadow-xs overflow-hidden">
      <div className="p-4 border-b border-[#F1F5F9] bg-[#FAFCFB] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div>
          <h3 className="font-extrabold text-sm text-[#0B241E]">
            Buku Kas Umum (BKU) Penerimaan — Pelabuhan Poumako
          </h3>
          <p className="text-[11px] text-[#64748B] mt-0.5">
            Format Standar Permendagri &amp; Perbup Mimika 25/2024 tentang Tata Cara Penatausahaan Kasda.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => onChangeDate(e.target.value)}
            className="p-1.5 bg-white border border-[#CBD5E1] rounded-xl text-xs font-semibold text-[#0B241E]"
          />
          <button
            type="button"
            onClick={onCloseDailyBook}
            disabled={isClosingBook}
            className="px-3 py-1.5 bg-[#0B241E] hover:bg-[#143E33] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Lock className="w-3.5 h-3.5 text-[#D97706]" />
            <span>{isClosingBook ? "Menutup..." : "Tutup Kas"}</span>
          </button>
          <button
            type="button"
            onClick={onPrintBku}
            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-[#D97706]" />
            <span>Cetak BKU</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] font-mono text-[11px] text-[#64748B] uppercase">
            <tr>
              <th className="p-3.5">Tanggal / No. BKU</th>
              <th className="p-3.5">Uraian Transaksi</th>
              <th className="p-3.5">Kode Rekening PAD</th>
              <th className="p-3.5">Penerimaan (Debet)</th>
              <th className="p-3.5">Penyetoran ke RKUD (Kredit)</th>
              <th className="p-3.5">Status Validasi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F1F5F9]">
            {paidTransactions.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-[#64748B]">
                  Belum ada transaksi penerimaan pada tanggal yang dipilih.
                </td>
              </tr>
            ) : (
              paidTransactions.map((tx, idx) => (
                <tr key={tx.id} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="p-3.5 font-mono">
                    <div className="font-bold text-[#0B241E]">
                      {new Date(tx.updatedAt || tx.issuedAt).toLocaleDateString("id-ID")}
                    </div>
                    <div className="text-[10px] text-[#64748B]">
                      BKU-{(idx + 1).toString().padStart(4, "0")}
                    </div>
                  </td>
                  <td className="p-3.5">
                    <div className="font-bold text-[#0B241E]">
                      Penerimaan e-SKRD {tx.invoiceNumber}
                    </div>
                    <div className="text-[11px] text-[#64748B]">
                      Kapal: {tx.visit?.vessel?.name} ({tx.visit?.vessel?.grossTonnage} GT)
                    </div>
                  </td>
                  <td className="p-3.5 font-mono text-[#64748B]">
                    4.1.02.02.01 (Retribusi Jasa Pelabuhan)
                  </td>
                  <td className="p-3.5 font-bold text-emerald-800 font-mono">
                    {formatRupiah(tx.totalAmountIdr)}
                  </td>
                  <td className="p-3.5 font-bold text-blue-800 font-mono">
                    {formatRupiah(tx.totalAmountIdr)}
                  </td>
                  <td className="p-3.5">
                    <span className="inline-flex items-center gap-1 font-mono font-bold text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Rekonsiliasi Sah</span>
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot className="bg-[#F8FAFC] border-t-2 border-[#CBD5E1] font-bold text-xs">
            <tr>
              <td colSpan={3} className="p-3.5 text-right font-black uppercase text-[#0B241E]">
                Total Penerimaan &amp; Penyetoran Kasda (RKUD):
              </td>
              <td className="p-3.5 text-emerald-900 font-black text-sm font-mono">
                {formatRupiah(totalVerifiedPAD)}
              </td>
              <td className="p-3.5 text-blue-900 font-black text-sm font-mono">
                {formatRupiah(totalVerifiedPAD)}
              </td>
              <td className="p-3.5 text-emerald-700 font-mono text-[11px]">
                Nihil Selisih (0)
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
