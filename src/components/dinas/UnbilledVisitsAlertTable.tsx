import Link from "next/link";
import { AlertCircle, AlertTriangle, ArrowRight } from "lucide-react";
import type { UnbilledVisit } from "@/types/billing.types";

interface UnbilledVisitsAlertTableProps {
  unbilledVisits: UnbilledVisit[];
}

/**
 * Tabel peringatan audit pimpinan untuk kunjungan kapal berangkat yang belum diterbitkan e-SKRD.
 */
export function UnbilledVisitsAlertTable({ unbilledVisits }: UnbilledVisitsAlertTableProps) {
  if (unbilledVisits.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-rose-200 shadow-xs overflow-hidden">
      <div className="p-5 bg-rose-50/60 border-b border-rose-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center font-bold">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-rose-950 text-sm">
              Peringatan Pimpinan: {unbilledVisits.length} Kapal Berangkat Belum Diterbitkan e-SKRD
            </h3>
            <p className="text-xs text-rose-800 mt-0.5">
              Terdeteksi ketidaksesuaian prosedur penagihan retribusi jasa labuh &amp; tambat (Potensi kebocoran PAD)
            </p>
          </div>
        </div>
        <Link
          href="/dinas/monitoring"
          className="px-3 py-1.5 bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
        >
          <span>Tindak Lanjuti di Modul Monitoring</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-xs">
          <thead className="bg-[#F8FAFC] text-slate-500 uppercase tracking-wider text-[11px] font-bold border-b border-rose-100">
            <tr>
              <th className="py-3.5 px-5">No. Kunjungan</th>
              <th className="py-3.5 px-5">Nama Kapal &amp; GT</th>
              <th className="py-3.5 px-5">Kategori Kapal</th>
              <th className="py-3.5 px-5">Dermaga Sandar</th>
              <th className="py-3.5 px-5">Waktu Berangkat</th>
              <th className="py-3.5 px-5 text-center">Status Tagihan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-rose-100 text-slate-700">
            {unbilledVisits.map((visit) => (
              <tr key={visit.id} className="hover:bg-rose-50/50 transition-colors">
                <td className="py-3.5 px-5 font-mono font-bold text-[#0B241E]">
                  {visit.visitNumber}
                </td>
                <td className="py-3.5 px-5">
                  <div className="font-bold text-slate-900">{visit.vessel?.name || "Kapal Niaga"}</div>
                  <div className="text-[11px] text-slate-500">
                    GT: {Number(visit.vessel?.grossTonnage || 0).toLocaleString("id-ID")}
                  </div>
                </td>
                <td className="py-3.5 px-5">
                  <span className="inline-block font-semibold bg-white text-slate-700 border border-slate-200 px-2 py-0.5 rounded text-[10px]">
                    {visit.vessel?.vesselCategory || "BARANG"}
                  </span>
                </td>
                <td className="py-3.5 px-5 text-slate-800 font-medium">
                  {visit.berth?.name || "-"}
                </td>
                <td className="py-3.5 px-5 text-slate-600 font-mono text-[11px]">
                  {visit.actualDepartureTime || visit.etd}
                </td>
                <td className="py-3.5 px-5 text-center">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                    <AlertCircle className="w-3 h-3" />
                    Belum Diterbitkan SKRD
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
