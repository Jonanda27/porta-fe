import { Ship, Store } from "lucide-react";
import { PartnerRoleType } from "@/types/auth.types";

export interface PartnerTypeSelectorProps {
  partnerType: PartnerRoleType;
  onSelect: (type: PartnerRoleType) => void;
}

export function PartnerTypeSelector({
  partnerType,
  onSelect,
}: PartnerTypeSelectorProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-700 uppercase font-mono tracking-wider">
          PILIH KATEGORI KEMITRAAN ANDA:
        </label>
        <span className="text-[11px] text-slate-400">
          Dapat disesuaikan kapan saja
        </span>
      </div>

      <div className="p-1 rounded-2xl bg-slate-100 border border-slate-200/90 grid grid-cols-1 sm:grid-cols-2 gap-1.5 shadow-2xs">
        {/* Opsi 1: Operator Kapal */}
        <button
          type="button"
          onClick={() => onSelect("OPERATOR")}
          className={`p-3.5 rounded-xl text-left transition-all cursor-pointer flex items-center gap-3 ${
            partnerType === "OPERATOR"
              ? "bg-white text-[#0B241E] shadow-sm border border-slate-200 ring-1 ring-slate-200"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
          }`}
        >
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              partnerType === "OPERATOR"
                ? "bg-amber-100 text-[#D97706]"
                : "bg-slate-200 text-slate-500"
            }`}
          >
            <Ship className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-extrabold leading-tight truncate">
              Operator Kapal / Pelayaran
            </p>
            <p className="text-[10.5px] text-slate-500 mt-0.5 leading-snug">
              Izin sandar dermaga, labuh, SKRD &amp; manifes
            </p>
          </div>
        </button>

        {/* Opsi 2: Tenant & Mitra Usaha */}
        <button
          type="button"
          onClick={() => onSelect("TENANT")}
          className={`p-3.5 rounded-xl text-left transition-all cursor-pointer flex items-center gap-3 ${
            partnerType === "TENANT"
              ? "bg-white text-[#0B241E] shadow-sm border border-slate-200 ring-1 ring-slate-200"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
          }`}
        >
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              partnerType === "TENANT"
                ? "bg-emerald-100 text-emerald-800"
                : "bg-slate-200 text-slate-500"
            }`}
          >
            <Store className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-extrabold leading-tight truncate">
              Mitra Usaha / Tenant
            </p>
            <p className="text-[10.5px] text-slate-500 mt-0.5 leading-snug">
              Sewa kios, gudang, lahan &amp; utilitas pelabuhan
            </p>
          </div>
        </button>
      </div>
    </div>
  );
}
