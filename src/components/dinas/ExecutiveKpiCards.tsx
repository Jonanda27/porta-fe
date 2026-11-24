import {
  Activity,
  AlertCircle,
  CheckCircle2,
  DollarSign,
  Receipt,
  TrendingUp,
} from "lucide-react";

interface ExecutiveKpiCardsProps {
  totalVerifiedPad: number;
  apbdTarget2026: number;
  padPercentage: string;
  taskCompletionRate: number;
  activeBerthingsCount: number;
  totalReceivables: number;
  outstandingCount: number;
  unbilledCount: number;
}

/**
 * Menampilkan 4 kartu indikator kinerja utama (KPI) eksekutif Dinas Perhubungan.
 */
export function ExecutiveKpiCards({
  totalVerifiedPad,
  apbdTarget2026,
  padPercentage,
  taskCompletionRate,
  activeBerthingsCount,
  totalReceivables,
  outstandingCount,
  unbilledCount,
}: ExecutiveKpiCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5 sm:gap-4">
      {/* KPI 1: Realisasi PAD vs Target APBD */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold shadow-xs shrink-0">
              <DollarSign className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full flex items-center gap-1 shrink-0">
              <TrendingUp className="w-3 h-3" />
              {padPercentage}% Target
            </span>
          </div>
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-3">
            Realisasi PAD Pelabuhan YTD
          </p>
          <p className="text-xl sm:text-2xl font-black text-[#0B241E] font-mono mt-1 tracking-tight break-words">
            Rp {totalVerifiedPad.toLocaleString("id-ID")}
          </p>
        </div>
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2 text-[11px] text-slate-500">
          <span>Target APBD 2026:</span>
          <span className="font-bold text-slate-800 font-mono">
            Rp {apbdTarget2026.toLocaleString("id-ID")}
          </span>
        </div>
      </div>

      {/* KPI 2: Kepatuhan Tugas Perwira Jaga UPTD */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold shadow-xs shrink-0">
              <Activity className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 border border-blue-200/80 px-2.5 py-0.5 rounded-full shrink-0">
              Kinerja UPTD
            </span>
          </div>
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-3">
            Kepatuhan Tugas Staf UPTD
          </p>
          <p className="text-xl sm:text-2xl font-black text-[#0B241E] font-mono mt-1 tracking-tight">
            {taskCompletionRate}%
          </p>
        </div>
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2 text-[11px] text-slate-500">
          <span>Kapal Aktif Sandar:</span>
          <span className="font-bold text-blue-700 font-mono">
            {activeBerthingsCount} Armada
          </span>
        </div>
      </div>

      {/* KPI 3: Total Piutang Belum Lunas */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold shadow-xs shrink-0">
              <Receipt className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 rounded-full shrink-0">
              {outstandingCount} Tagihan Jatuh Tempo
            </span>
          </div>
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-3">
            Piutang e-SKRD Beredar
          </p>
          <p className="text-xl sm:text-2xl font-black text-amber-600 font-mono mt-1 tracking-tight break-words">
            Rp {totalReceivables.toLocaleString("id-ID")}
          </p>
        </div>
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2 text-[11px] text-slate-500">
          <span>Tindakan:</span>
          <span className="font-bold text-amber-800 text-right">Surat Peringatan & Teguran</span>
        </div>
      </div>

      {/* KPI 4: Kunjungan Kapal Belum Diterbitkan SKRD */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shadow-xs shrink-0 ${
                unbilledCount > 0 ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"
              }`}
            >
              {unbilledCount > 0 ? (
                <AlertCircle className="w-5 h-5 stroke-[2.5]" />
              ) : (
                <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
              )}
            </div>
            <span
              className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border shrink-0 ${
                unbilledCount > 0
                  ? "text-rose-700 bg-rose-50 border-rose-200/80"
                  : "text-emerald-700 bg-emerald-50 border-emerald-200/80"
              }`}
            >
              {unbilledCount > 0 ? "Anti-Kebocoran PAD" : "Tertib e-SKRD"}
            </span>
          </div>
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-3">
            Kapal Berangkat Belum Bayar
          </p>
          <p
            className={`text-xl sm:text-2xl font-black font-mono mt-1 tracking-tight ${
              unbilledCount > 0 ? "text-rose-700" : "text-slate-800"
            }`}
          >
            {unbilledCount}{" "}
            <span className="text-xs font-normal text-slate-500 font-sans">Kapal</span>
          </p>
        </div>
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2 text-[11px] text-slate-500">
          <span>Kepatuhan PP 35/2023:</span>
          <span className={`font-bold ${unbilledCount > 0 ? "text-rose-700" : "text-emerald-700"}`}>
            {unbilledCount > 0 ? "Wajib Tagih e-SKRD" : "100% Tertagih"}
          </span>
        </div>
      </div>
    </div>
  );
}
