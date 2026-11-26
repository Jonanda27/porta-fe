"use client";

import React from "react";
import { Receipt, X, Printer } from "lucide-react";
import { LeasePaymentReceiptPayload } from "@/types/asset.types";
import { ModalPortal } from "@/components/ui/ModalPortal";

interface LeaseReceiptModalProps {
  isOpen: boolean;
  isLoading: boolean;
  activeLeaseReceipt: LeasePaymentReceiptPayload | null;
  onClose: () => void;
}

export function LeaseReceiptModal({
  isOpen,
  isLoading,
  activeLeaseReceipt,
  onClose,
}: LeaseReceiptModalProps) {
  if (!isOpen) return null;

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-gray-200 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-[#D97706]" />
            <h3 className="font-bold text-sm text-[#0B241E]">
              Kuitansi Resmi e-SSRD Sewa Aset Daerah
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isLoading && (
          <div className="py-12 text-center text-xs text-gray-500 space-y-2">
            <div className="w-6 h-6 border-2 border-[#0B241E] border-t-transparent rounded-full animate-spin mx-auto" />
            <p>Memuat kuitansi e-SSRD Kas Daerah...</p>
          </div>
        )}

        {!isLoading && activeLeaseReceipt && (
          <div className="space-y-4 text-xs">
            <div className="text-center border-b border-dashed border-gray-200 pb-3 space-y-1">
              <span className="font-mono text-[10px] text-gray-400 tracking-widest uppercase block">
                PEMERINTAH KABUPATEN MIMIKA • BADAN PENDAPATAN DAERAH
              </span>
              <h4 className="font-black text-sm text-[#0B241E] tracking-tight">
                {activeLeaseReceipt.documentTitle ||
                  "SURAT SETORAN RETRIBUSI DAERAH (e-SSRD)"}
              </h4>
              <p className="text-[11px] text-gray-500">
                {activeLeaseReceipt.subTitle ||
                  "BUKTI PEMBAYARAN RETRIBUSI KEKAYAAN DAERAH (SEWA TANAH/BANGUNAN) SAH"}
              </p>
              <p className="text-[10px] text-gray-400">
                {activeLeaseReceipt.portName} • {activeLeaseReceipt.portLocation}
              </p>
            </div>

            <div className="bg-[#FAFBFB] border border-gray-100 rounded-xl p-3 grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-gray-400 text-[10px] block font-medium">
                  Nomor e-SSRD
                </span>
                <span className="font-mono font-bold text-[#0B241E]">
                  {activeLeaseReceipt.ssrdNumber}
                </span>
              </div>
              <div>
                <span className="text-gray-400 text-[10px] block font-medium">
                  Nomor Kontrak PKS
                </span>
                <span className="font-mono font-bold text-gray-800">
                  {activeLeaseReceipt.contractNumber}
                </span>
              </div>
              <div>
                <span className="text-gray-400 text-[10px] block font-medium">
                  Tanggal Pembayaran
                </span>
                <span className="font-semibold text-gray-800">
                  {new Date(activeLeaseReceipt.paymentDate).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div>
                <span className="text-gray-400 text-[10px] block font-medium">
                  Tahun Anggaran Retribusi
                </span>
                <span className="font-semibold text-gray-800">
                  {activeLeaseReceipt.taxPeriod}
                </span>
              </div>
            </div>

            <div className="border border-gray-100 rounded-xl p-3 space-y-2">
              <h5 className="font-bold text-[11px] text-gray-600 uppercase tracking-wider">
                Wajib Retribusi Daerah (Penyewa/Tenant)
              </h5>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-400 text-[10px] block">
                    Nama Penyewa / Pemohon
                  </span>
                  <span className="font-bold text-gray-900">
                    {activeLeaseReceipt.taxPayer.tenantName}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 text-[10px] block">
                    Nama Usaha / Tenant
                  </span>
                  <span className="font-medium text-gray-800">
                    {activeLeaseReceipt.taxPayer.businessName}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 text-[10px] block">
                    NPWP / Identitas Pajak
                  </span>
                  <span className="font-mono text-gray-700">
                    {activeLeaseReceipt.taxPayer.tenantNpwp || "-"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 text-[10px] block">
                    Kontak / Telepon
                  </span>
                  <span className="text-gray-700">
                    {activeLeaseReceipt.taxPayer.tenantPhone || "-"}
                  </span>
                </div>
              </div>
            </div>

            <div className="border border-gray-100 rounded-xl p-3 space-y-2">
              <h5 className="font-bold text-[11px] text-gray-600 uppercase tracking-wider">
                Objek Retribusi Pemanfaatan Kekayaan Daerah
              </h5>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Nama Aset / Lokasi Ruangan:</span>
                  <span className="font-bold text-gray-900">
                    {activeLeaseReceipt.retributionObject.assetName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Kode Barang / Tipe:</span>
                  <span className="font-mono text-gray-800">
                    {activeLeaseReceipt.retributionObject.assetCode} (
                    {activeLeaseReceipt.retributionObject.assetType})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Luas Bangunan / Lahan:</span>
                  <span className="font-semibold text-gray-800">
                    {Number(activeLeaseReceipt.retributionObject.areaSqm)} m²
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Dasar Hukum Ketetapan Tarif:</span>
                  <span className="text-gray-700 text-right">
                    {activeLeaseReceipt.retributionObject.legalBasis}
                  </span>
                </div>
                <div className="flex justify-between border-t border-gray-100 pt-1">
                  <span className="text-gray-500">Kode Rekening Penerimaan PAD:</span>
                  <span className="font-mono text-gray-700 text-[11px]">
                    {activeLeaseReceipt.retributionObject.revenueAccountCode}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-emerald-800 block text-xs font-semibold">
                  Total Setoran Kas Daerah
                </span>
                <span className="font-mono font-black text-xl text-emerald-950">
                  Rp{" "}
                  {Number(
                    activeLeaseReceipt.paymentDetails.amountPaidIdr
                  ).toLocaleString("id-ID")}
                </span>
                <span className="text-[10px] text-emerald-700 block mt-0.5">
                  Nilai Kontrak Tahunan: Rp{" "}
                  {Number(
                    activeLeaseReceipt.paymentDetails.totalAnnualContractIdr
                  ).toLocaleString("id-ID")}
                </span>
              </div>
              <span className="px-3 py-1 bg-emerald-200 text-emerald-900 font-bold rounded-full text-xs">
                LUNAS TERVERIFIKASI
              </span>
            </div>

            <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl font-mono text-[10px] text-gray-500 flex items-center justify-between">
              <span>
                ID Transaksi Kasda: {activeLeaseReceipt.paymentDetails.idempotencyKey}
              </span>
              <span className="text-gray-400">
                Status: {activeLeaseReceipt.paymentDetails.paymentStatus}
              </span>
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
          >
            Tutup
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="px-5 py-2 bg-[#0B241E] hover:bg-[#133D31] text-white font-semibold rounded-xl text-xs shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-[#D97706]" />
            Cetak Dokumen
          </button>
        </div>
      </div>
    </div>
    </ModalPortal>
  );
}
