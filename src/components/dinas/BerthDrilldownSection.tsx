import { Anchor, ShieldCheck, Ship } from "lucide-react";
import type { KabidDrilldownResult } from "@/types/dinas.types";

interface BerthDrilldownSectionProps {
  drilldownData: KabidDrilldownResult | null;
  isLoadingDrilldown: boolean;
  selectedDrilldownPortId?: number;
  selectedTerminalId?: number;
  selectedBerthId?: number;
  onSelectPort: (portId: number | undefined) => void;
  onSelectTerminal: (terminalId: number | undefined) => void;
  onSelectBerth: (berthId: number | undefined) => void;
}

/**
 * Panel inspeksi analitik hierarkis Pelabuhan → Terminal → Dermaga Sandar
 * beserta riwayat kapal tambat dan tugas pengawasan petugas jaga.
 */
export function BerthDrilldownSection({
  drilldownData,
  isLoadingDrilldown,
  selectedDrilldownPortId,
  selectedTerminalId,
  selectedBerthId,
  onSelectPort,
  onSelectTerminal,
  onSelectBerth,
}: BerthDrilldownSectionProps) {
  const portsList = drilldownData?.ports || [];
  const activePort =
    portsList.find((p) => p.id === (selectedDrilldownPortId || portsList[0]?.id)) || portsList[0];
  const terminalsList = activePort?.terminals || [];
  const activeTerminal = selectedTerminalId
    ? terminalsList.find((t) => t.id === selectedTerminalId)
    : undefined;
  const berthsList = activeTerminal ? activeTerminal.berths || [] : activePort?.berths || [];
  const displayedBerths = selectedBerthId
    ? berthsList.filter((b) => b.id === selectedBerthId)
    : berthsList;
  const totalBerthingVessels = berthsList.reduce(
    (acc, b) => acc + (b.berthingRecords?.length || 0),
    0
  );
  const relatedTasks = drilldownData?.tasks || [];

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 border border-[#E2E8F0] shadow-xs space-y-5">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 pb-4 border-b border-gray-100">
        <div>
          <h3 className="text-base font-bold text-[#0B241E] flex items-center gap-2">
            <Anchor className="w-5 h-5 text-[#D97706]" />
            Inspeksi Analitik Hierarkis: Pelabuhan → Terminal → Dermaga Sandar
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Drilldown mendalam kondisi fisik fasilitas tambat, riwayat kapal sandar terkini, dan tugas operasional lapangan
          </p>
        </div>
        <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-lg">
          {isLoadingDrilldown ? "Menyinkronkan..." : "Drilldown Aktif"}
        </span>
      </div>

      {/* Hierarchical Filter Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
        <div>
          <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
            Pilih Pelabuhan UPTD:
          </label>
          <select
            value={selectedDrilldownPortId || activePort?.id || ""}
            onChange={(e) => {
              onSelectPort(Number(e.target.value));
              onSelectTerminal(undefined);
              onSelectBerth(undefined);
            }}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-[#0B241E] focus:outline-none focus:border-[#0B241E]"
          >
            {portsList.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.code})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
            Pilih Terminal:
          </label>
          <select
            value={selectedTerminalId || ""}
            onChange={(e) => {
              onSelectTerminal(e.target.value ? Number(e.target.value) : undefined);
              onSelectBerth(undefined);
            }}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-[#0B241E] focus:outline-none focus:border-[#0B241E]"
          >
            <option value="">Semua Terminal ({terminalsList.length} Terdaftar)</option>
            {terminalsList.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.code})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
            Pilih Fasilitas Dermaga:
          </label>
          <select
            value={selectedBerthId || ""}
            onChange={(e) => onSelectBerth(e.target.value ? Number(e.target.value) : undefined)}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-[#0B241E] focus:outline-none focus:border-[#0B241E]"
          >
            <option value="">Semua Dermaga ({berthsList.length} Fasilitas)</option>
            {berthsList.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-white border border-gray-200 rounded-xl">
          <span className="text-[10px] font-bold text-gray-500 uppercase">Pelabuhan Aktif</span>
          <p className="text-sm font-bold text-[#0B241E] truncate">{activePort?.name || "-"}</p>
        </div>
        <div className="p-3 bg-white border border-gray-200 rounded-xl">
          <span className="text-[10px] font-bold text-gray-500 uppercase">Fasilitas Dermaga</span>
          <p className="text-sm font-bold text-blue-700 font-mono">
            {displayedBerths.length} Unit Terpantau
          </p>
        </div>
        <div className="p-3 bg-white border border-gray-200 rounded-xl">
          <span className="text-[10px] font-bold text-gray-500 uppercase">Aktivitas Sandar</span>
          <p className="text-sm font-bold text-purple-700 font-mono">
            {totalBerthingVessels} Riwayat Sandar
          </p>
        </div>
        <div className="p-3 bg-white border border-gray-200 rounded-xl">
          <span className="text-[10px] font-bold text-gray-500 uppercase">Tugas Lapangan Terkait</span>
          <p className="text-sm font-bold text-emerald-700 font-mono">
            {relatedTasks.length} Tugas Petugas
          </p>
        </div>
      </div>

      {/* Berths Grid */}
      <div className="space-y-4">
        {displayedBerths.length === 0 ? (
          <div className="p-8 text-center text-gray-400 border border-dashed border-gray-200 rounded-xl text-xs">
            Tidak ada dermaga yang terdaftar pada kriteria hierarkis ini.
          </div>
        ) : (
          displayedBerths.map((berth) => {
            const records = berth.berthingRecords || [];
            const berthTasks = berth.tasks || [];

            return (
              <div
                key={berth.id}
                className="p-5 border border-gray-200 rounded-xl bg-gray-50/40 hover:bg-gray-50 transition-colors space-y-4"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                      <Anchor className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-[#0B241E]">{berth.name}</h4>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-gray-200 text-gray-700">
                          {berth.code}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Tipe: {berth.berthType?.replace(/_/g, " ") || "-"} • Maks. LOA:{" "}
                        <strong className="text-gray-900 font-mono">
                          {berth.maxLengthMeters ? `${berth.maxLengthMeters} m` : "-"}
                        </strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        berth.operationalStatus === "OPEN"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {berth.operationalStatus || "OPEN"}
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                      {berth.authorityType === "PEMDA_DISHUB"
                        ? "Pemda Mimika (PP 35/2023)"
                        : "Non-Retribusi Pemda"}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="bg-white p-3.5 rounded-xl border border-gray-200 space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold text-gray-700 pb-2 border-b border-gray-100">
                      <span className="flex items-center gap-1.5">
                        <Ship className="w-4 h-4 text-blue-600" />
                        Kapal Sandar & Riwayat Tambat ({records.length})
                      </span>
                      <span className="text-[10px] font-normal text-gray-400">Real-time Kunjungan</span>
                    </div>

                    {records.length === 0 ? (
                      <p className="text-[11px] text-gray-400 italic py-3 text-center">
                        Tidak ada catatan kapal sandar di dermaga ini saat ini.
                      </p>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {records.slice(0, 4).map((rec) => (
                          <div
                            key={rec.id}
                            className="p-2.5 bg-gray-50 rounded-lg text-xs flex justify-between items-center"
                          >
                            <div>
                              <div className="font-bold text-[#0B241E]">
                                {rec.visit?.vessel?.name || "Kapal Niaga"}
                              </div>
                              <div className="text-[10px] text-gray-500 font-mono">
                                Visit: {rec.visit?.visitNumber || `#${rec.visitId}`} •{" "}
                                {rec.visit?.vessel?.vesselCategory || "BARANG"}
                              </div>
                              {rec.berthTime ? (
                                <div className="text-[10px] text-emerald-700 mt-0.5">
                                  Sandar:{" "}
                                  {new Date(rec.berthTime).toLocaleTimeString("id-ID", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}{" "}
                                  WIT
                                </div>
                              ) : null}
                            </div>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                              {rec.berthingStatus || "BERTHED"}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-gray-200 space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold text-gray-700 pb-2 border-b border-gray-100">
                      <span className="flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        Tugas Pengawasan & Pemeliharaan ({berthTasks.length})
                      </span>
                      <span className="text-[10px] font-normal text-gray-400">Petugas Jaga UPT</span>
                    </div>

                    {berthTasks.length === 0 ? (
                      <p className="text-[11px] text-gray-400 italic py-3 text-center">
                        Seluruh tugas pemeliharaan pada dermaga ini telah terpenuhi.
                      </p>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {berthTasks.slice(0, 4).map((t) => (
                          <div
                            key={t.id}
                            className="p-2.5 bg-gray-50 rounded-lg text-xs flex justify-between items-center"
                          >
                            <div>
                              <div className="font-semibold text-gray-900">{t.title}</div>
                              <div className="text-[10px] text-gray-500 font-mono">
                                {t.taskNumber} • Petugas: {t.assignee?.fullName || "Perwira Jaga"}
                              </div>
                            </div>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                t.executionStatus === "COMPLETED"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {t.executionStatus}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
