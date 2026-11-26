"use client";

export interface CctvHeaderProps {
  onlineCount: number;
  offlineCount: number;
  clockText: string;
}

export function CctvHeader({
  onlineCount,
  offlineCount,
  clockText,
}: CctvHeaderProps) {
  return (
    <header className="px-4 pt-3.5 pb-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
      {/* Top-Left PORTA Brand */}
      <div className="flex items-start gap-3">
        <img
          src="/brand/symbol-white.svg"
          alt="PORTA Logo"
          className="w-10 h-10 object-contain shrink-0 mt-0.5 drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]"
        />
        <div className="flex flex-col">
          <span className="text-xl font-black tracking-[0.35em] text-[#F59E0B] uppercase leading-none">
            PORTA
          </span>
          <p className="text-[11px] font-mono font-medium tracking-[0.26em] text-[#D97706]/90 uppercase mt-1 leading-none">
            MARITIME CCTV SURVEILLANCE
          </p>
          <p className="text-[9px] font-mono tracking-[0.22em] text-[#E2E8F0]/50 uppercase mt-1.5 leading-none hidden sm:block">
            SIMULASI NVR • PELABUHAN UMUM POUMAKO • 6 DERMAGA
          </p>
        </div>
      </div>

      {/* Top-Right Minimalist Telemetry (Boxless) */}
      <div className="hidden sm:flex items-center gap-2 text-[10.5px] font-mono tracking-wider drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
        <span className="text-emerald-300 font-bold">{onlineCount} ONLINE</span>
        <span className="text-[#1E4D40]">|</span>
        <span className="text-rose-300 font-bold">{offlineCount} GANGGUAN</span>
        <span className="text-[#1E4D40]">|</span>
        <span className="text-[#A3BFB5] tabular-nums">
          {clockText || "--:--:--"} WIT
        </span>
      </div>
    </header>
  );
}
