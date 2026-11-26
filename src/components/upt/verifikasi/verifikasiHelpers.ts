import { DocumentItem } from "@/types/upt.types";

export const VERIFIKASI_STATUS_BADGE: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-800 border-amber-200",
  PENDING_VERIFICATION: "bg-amber-50 text-amber-800 border-amber-200",
  WAITING_OPERATOR_SIGNATURE: "bg-sky-50 text-sky-800 border-sky-200",
  REQUESTED: "bg-amber-50 text-amber-800 border-amber-200",
  PENDING_ROOM_OFFICER: "bg-amber-50 text-amber-800 border-amber-200",
  PENDING_HEAD_OF_PORT: "bg-blue-50 text-blue-800 border-blue-200",
  VERIFIED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-200",
  REJECTED: "bg-rose-50 text-rose-700 border-rose-200",
  EXPIRED: "bg-slate-100 text-slate-700 border-slate-200",
  TERMINATED: "bg-slate-100 text-slate-700 border-slate-200",
};

/** Filter hanya dokumen level perusahaan (bukan dokumen unit kapal). */
export function getCompanyOnlyDocs(docs?: DocumentItem[]): DocumentItem[] {
  return (docs || []).filter(
    (d) =>
      !d.vesselId &&
      d.category !== "SURAT_UKUR" &&
      d.category !== "PAS_BESAR_KECIL" &&
      d.notes !== "FOTO_KAPAL" &&
      d.documentNumber !== "FOTO-KAPAL"
  );
}

/** Cek apakah operator sudah mengunggah dokumen wajib (minimal SIUPAL/NIB & NPWP). */
export function checkOperatorMandatoryDocs(docs?: DocumentItem[]) {
  const companyDocs = getCompanyOnlyDocs(docs);
  const hasSiupalOrNib = companyDocs.some((d) => d.category === "SIUPAL_NIB");
  const hasNpwp = companyDocs.some((d) => d.category === "NPWP");
  const isReadyToVerify = hasSiupalOrNib && hasNpwp;
  const missingList: string[] = [];
  if (!hasSiupalOrNib) missingList.push("SIUPAL / NIB");
  if (!hasNpwp) missingList.push("NPWP Badan Usaha");
  return {
    companyDocs,
    hasSiupalOrNib,
    hasNpwp,
    isReadyToVerify,
    missingText:
      missingList.length > 0
        ? `Belum unggah berkas wajib: ${missingList.join(" & ")}`
        : null,
  };
}

/** Cek apakah kapal sudah memiliki minimal 1 dokumen pendukung teknis (Surat Ukur / Pas Besar). */
export function checkVesselMandatoryDocs(docs?: DocumentItem[]) {
  const legalVesselDocs = (docs || []).filter(
    (d) => d.notes !== "FOTO_KAPAL" && d.documentNumber !== "FOTO-KAPAL"
  );
  return {
    legalVesselDocs,
    isReadyToVerify: legalVesselDocs.length > 0,
    missingText:
      legalVesselDocs.length === 0
        ? "Belum unggah Surat Ukur / Pas Kapal"
        : null,
  };
}
