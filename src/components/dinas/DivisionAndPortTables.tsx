import Link from "next/link";
import { Anchor, Building2, CheckCircle2, ChevronRight, Layers, Ship } from "lucide-react";
import type { DivisionPerformance, PortPerformanceSummary } from "@/types/dinas.types";

interface DivisionAndPortTablesProps {
  divisionData: DivisionPerformance[];
  portComparisonData: PortPerformanceSummary[];
}

/**
 * Menampilkan matriks evaluasi kinerja bidang (Kabid) dan tabel status operasional
 * serta utilisasi dermaga seluruh pelabuhan daerah.
 */
export function DivisionAndPortTables({
  divisionData,
  portComparisonData,
}: DivisionAndPortTablesProps) {
  return (
    <>
      {divisionData.length > 1 ? (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#0B241E] text-white flex items-center justify-center font-bold">
                <Layers className="w-4 h-4 text-[#D97706]" />
              </div>
              <div>
                <h3 className="font-bold text-[#0B241E] text-sm">
                  Evaluasi Kinerja Bidang Kepelabuhanan (Kabid) & Multi-UPTD
                </h3>
                <p className="text-xs text-gray-500">
                  Agregasi hierarkis pengawasan operasional, tugas staf, dan kontribusi PAD per divisi
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-[#D97706] bg-[#0B241E] px-3 py-1 rounded-full">
              Oversight Kadis
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-xs">
              <thead className="bg-[#F8FAFC] text-slate-500 uppercase tracking-wider text-[11px] font-bold border-b border-[#E2E8F0]">
                <tr>
                  <th className="py-3.5 px-5">Kode & Nama Bidang</th>
                  <th className="py-3.5 px-5">Pejabat Kabid Penanggung Jawab</th>
                  <th className="py-3.5 px-5 text-center">Wilayah Pelabuhan</th>
                  <th className="py-3.5 px-5 text-center">Kepatuhan Tugas (%)</th>
                  <th className="py-3.5 px-5 text-center">Tugas Overdue</th>
                  <th className="py-3.5 px-5 text-right">Kontribusi PAD Terverifikasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {divisionData.map((div) => {
                  const kabidName =
                    div.kabidOfficers && div.kabidOfficers.length > 0
                      ? div.kabidOfficers.map((o) => o.fullName).join(", ")
                      : "Kepala Bidang Pelabuhan";

                  return (
                    <tr key={div.divisionId} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-5 font-bold text-slate-900">
                        <span className="font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] mr-2">
                          {div.code}
                        </span>
                        {div.name}
                      </td>
                      <td className="py-3.5 px-5 text-slate-800 font-medium">{kabidName}</td>
                      <td className="py-3.5 px-5 text-center font-mono font-bold text-slate-800">
                        {div.portCount} UPTD
                      </td>
                      <td className="py-3.5 px-5 text-center">
                        <span
                          className={`font-mono font-bold px-2.5 py-0.5 rounded-full text-[10px] ${
                            div.completionRatePercent >= 90
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              : "bg-amber-50 text-amber-800 border border-amber-200"
                          }`}
                        >
                          {div.completionRatePercent}%
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-center font-mono font-bold">
                        {div.overdueTasks > 0 ? (
                          <span className="text-rose-600 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full text-[10px]">
                            {div.overdueTasks} Tertunda
                          </span>
                        ) : (
                          <span className="text-emerald-700 flex items-center justify-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Nihil
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-5 text-right font-mono font-bold text-emerald-700 text-sm">
                        Rp {div.totalRevenueIdr.toLocaleString("id-ID")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : divisionData.length === 1 ? (
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E2E8F0] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0B241E] text-white flex items-center justify-center font-bold shrink-0">
              <Layers className="w-4 h-4 text-[#D97706]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-bold">
                  {divisionData[0].code}
                </span>
                <h4 className="font-bold text-[#0B241E] text-sm">{divisionData[0].name}</h4>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Pejabat Teknis:{" "}
                <span className="font-semibold text-slate-700">
                  {divisionData[0].kabidOfficers?.[0]?.fullName || "Kepala Bidang Perhubungan Laut & ASDP"}
                </span>{" "}
                &bull; Membina {divisionData[0].portCount} Pelabuhan Daerah
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 self-end sm:self-center">
            <div className="text-right text-xs">
              <span className="text-slate-500 block text-[10px]">Kepatuhan Bidang:</span>
              <span className="font-mono font-bold text-emerald-700">
                {divisionData[0].completionRatePercent}% Selesai
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-[#D97706] bg-[#0B241E] px-3 py-1 rounded-full">
              Pendelegasian Tugas
            </span>
          </div>
        </div>
      ) : null}

      {portComparisonData.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold shadow-xs">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-[#0B241E] text-sm">
                  Status Operasional & Utilisasi Dermaga Seluruh Pelabuhan Daerah
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Monitoring real-time aktivitas dermaga, kepatuhan perwira jaga, dan kelaikan fasilitas UPTD
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              {portComparisonData.length} Pelabuhan Terdaftar
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-xs">
              <thead className="bg-[#F8FAFC] text-slate-500 uppercase tracking-wider text-[11px] font-bold border-b border-[#E2E8F0]">
                <tr>
                  <th className="py-3.5 px-5">Nama Pelabuhan & Wilayah</th>
                  <th className="py-3.5 px-5">Klasifikasi</th>
                  <th className="py-3.5 px-5 text-center">Armada Sandar</th>
                  <th className="py-3.5 px-5 text-center">Kepatuhan Tugas Staf</th>
                  <th className="py-3.5 px-5 text-center">Status Layanan Dermaga</th>
                  <th className="py-3.5 px-5 text-right">Aksi & Pengawasan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {portComparisonData.map((port) => {
                  const activeBerthings = port.vesselActivity?.activeBerthings ?? 0;
                  const completionRate = port.taskPerformance?.completionRatePercent ?? 0;

                  return (
                    <tr key={port.portId} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                          <Anchor className="w-3.5 h-3.5 text-[#D97706]" />
                          {port.name}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          Kode UPT: {port.code}
                        </div>
                      </td>
                      <td className="py-3.5 px-5">
                        <span className="inline-block font-semibold bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-0.5 rounded text-[10px]">
                          {port.portCategory || "PELABUHAN DAERAH"}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-center font-mono font-bold">
                        <span className="inline-flex items-center gap-1 text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full text-[11px]">
                          <Ship className="w-3 h-3" />
                          {activeBerthings} Kapal Sandar
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-center font-mono font-bold">
                        <span
                          className={`inline-block font-mono font-bold px-2.5 py-0.5 rounded-full text-[10px] ${
                            completionRate >= 90
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              : "bg-amber-50 text-amber-800 border border-amber-200"
                          }`}
                        >
                          {completionRate}% Selesai
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-center">
                        <span className="inline-flex items-center gap-1 text-emerald-700 text-[11px] font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Operasional Normal
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-right font-medium">
                        <Link
                          href={`/dinas/operasional?portId=${port.portId}`}
                          className="inline-flex items-center gap-1 text-xs text-[#0B241E] hover:text-[#D97706] font-bold py-1 px-2.5 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                          <span>Log Fasilitas</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
