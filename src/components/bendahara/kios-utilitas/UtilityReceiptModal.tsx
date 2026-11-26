"use client";

import React from "react";
import { Receipt, X, Printer } from "lucide-react";
import { UtilityReceiptPayload } from "@/types/cargo-utility.types";
import { ModalPortal } from "@/components/ui/ModalPortal";

interface UtilityReceiptModalProps {
  isOpen: boolean;
  isLoading: boolean;
  activeReceipt: UtilityReceiptPayload | null;
  onClose: () => void;
}

export function UtilityReceiptModal({
  isOpen,
  isLoading,
  activeReceipt,
  onClose,
}: UtilityReceiptModalProps) {
  if (!isOpen) return null;

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-[#D97706]" />
            <h3 className="font-bold text-[#0B241E] text-base">
              Surat Setoran Retribusi Daerah (e-SSRD)
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isLoading || !activeReceipt ? (
          <div className="py-12 text-center text-gray-400">
            Memuat dokumen resmi e-SSRD...
          </div>
        ) : (
          <div className="py-5 space-y-4 text-xs font-sans">
            <div className="border border-gray-200 rounded-xl p-4 bg-gray-50 text-center space-y-1">
              <h4 className="font-bold text-sm text-[#0B241E] uppercase">
                {activeReceipt.documentTitle}
              </h4>
              <p className="text-[11px] text-gray-500 font-medium">
                {activeReceipt.subTitle}
              </p>
              <div className="font-mono font-bold text-xs text-[#D97706] pt-1">
                No. Bukti: {activeReceipt.ssrdNumber}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 bg-white border border-gray-200 rounded-xl">
              <div>
                <span className="text-gray-400 block text-[10px] uppercase font-bold">
                  Pelabuhan &amp; Lokasi
                </span>
                <span className="font-semibold text-gray-800">
                  {activeReceipt.portName} ({activeReceipt.portLocation})
                </span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px] uppercase font-bold">
                  Tanggal Pembayaran
                </span>
                <span className="font-mono font-semibold text-gray-800">
                  {new Date(activeReceipt.paymentDate).toLocaleDateString("id-ID", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>

            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="bg-[#FAFBFB] px-4 py-2 font-bold text-gray-700 border-b border-gray-200">
                Rincian Objek Retribusi Jasa Usaha
              </div>
              <div className="p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Jenis Utilitas:</span>
                  <span className="font-semibold text-gray-900">
                    {activeReceipt.retributionObject.utilityType.replace("_", " ")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Fasilitas Pelabuhan:</span>
                  <span className="font-medium text-gray-800">
                    {activeReceipt.retributionObject.assetName} (
                    {activeReceipt.retributionObject.assetCode})
                  </span>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-gray-500">Angka Meteran:</span>
                  <span>
                    Awal: {activeReceipt.retributionObject.meterStart} s.d. Akhir:{" "}
                    {activeReceipt.retributionObject.meterEnd}
                  </span>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-gray-500">Volume Terpakai:</span>
                  <span className="font-bold">
                    {activeReceipt.retributionObject.volumeConsumed}{" "}
                    {activeReceipt.retributionObject.unitLabel}
                  </span>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-gray-500">Tarif Satuan Perda:</span>
                  <span>
                    Rp{" "}
                    {activeReceipt.retributionObject.ratePerUnitIdr.toLocaleString(
                      "id-ID"
                    )}{" "}
                    / {activeReceipt.retributionObject.unitLabel}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="text-gray-500">Kode Rekening Pendapatan:</span>
                  <span className="font-mono text-gray-700 text-[11px]">
                    {activeReceipt.retributionObject.revenueAccountCode}
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
                  Rp {activeReceipt.paymentDetails.totalAmountIdr.toLocaleString("id-ID")}
                </span>
              </div>
              <span className="px-3 py-1 bg-emerald-200 text-emerald-900 font-bold rounded-full text-xs">
                LUNAS TERVERIFIKASI
              </span>
            </div>

            <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl font-mono text-[10px] text-gray-500 flex items-center justify-between">
              <span>Kode Validasi Digital: {activeReceipt.qrValidationCode}</span>
              <span className="text-gray-400">
                Kasir: {activeReceipt.paymentDetails.recordedByName}
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
