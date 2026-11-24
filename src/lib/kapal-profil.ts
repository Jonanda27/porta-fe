import { LegalDocSlotSpec } from "@/types/kapal.types";

export function formatVesselType(
  shipType?: string | null,
  vesselCategory?: string | null
): string {
  const typeLabel = shipType === "NON_NIAGA" ? "Non-Niaga" : "Niaga";
  const categoryLabel =
    vesselCategory === "PENUMPANG"
      ? "Penumpang"
      : vesselCategory === "CAMPURAN"
      ? "Campuran"
      : "Barang / Kargo";
  return `${typeLabel} • ${categoryLabel}`;
}

export function formatDocCategory(category?: string | null): string {
  switch (category) {
    case "SURAT_UKUR":
      return "Surat Ukur";
    case "PAS_BESAR_KECIL":
      return "Pas Besar/Kecil";
    case "SIUPAL_NIB":
      return "SIUPAL / NIB";
    case "NPWP":
      return "NPWP";
    default:
      return "Sertifikat";
  }
}

export const COMPANY_LEGAL_DOC_SLOTS: LegalDocSlotSpec[] = [
  {
    slotKey: "SIUPAL",
    title: "SIUPAL / SIUPPER (Surat Izin Usaha Perusahaan Angkutan Laut)",
    shortBadge: "Wajib Utama",
    required: true,
    category: "SIUPAL_NIB",
    description:
      "Izin resmi penyelenggaraan angkutan laut (SIUPAL) atau pelayaran rakyat (SIUPPER) dari Ditjen Perhubungan Laut Kemenhub RI.",
    placeholderNumber: "Contoh: SIUPAL-042/AL.001/DJPL/2026",
  },
  {
    slotKey: "NIB",
    title: "Nomor Induk Berusaha (NIB) OSS RBA — KBLI Angkutan Laut",
    shortBadge: "Wajib Utama",
    required: true,
    category: "SIUPAL_NIB",
    description:
      "Sertifikat NIB 13 digit berbasis risiko dari lembaga OSS dengan KBLI 5011 / 5013 (Angkutan Laut Dalam Negeri Penumpang/Barang).",
    placeholderNumber: "Contoh: NIB-9120304857123",
  },
  {
    slotKey: "NPWP",
    title: "NPWP Badan Usaha & Surat Keterangan Terdaftar (SKT) Pajak",
    shortBadge: "Wajib Utama",
    required: true,
    category: "NPWP",
    description:
      "Kartu NPWP 16 digit atas nama perusahaan pelayaran sebagai identitas subjek wajib retribusi daerah (e-SKRD) sesuai PP No. 35/2023.",
    placeholderNumber: "Contoh: 01.234.567.8-954.000",
  },
  {
    slotKey: "AKTA_AHU",
    title: "Akta Pendirian Badan Usaha & SK Pengesahan Kemenkumham (AHU)",
    shortBadge: "Wajib Utama",
    required: true,
    category: "LAINNYA",
    description:
      "Akta notaris pendirian/perubahan terakhir PT/CV/Koperasi beserta SK Pengesahan Badan Hukum dari Kementerian Hukum dan HAM.",
    placeholderNumber: "Contoh: AHU-0048291.AH.01.01.TAHUN 2024",
  },
  {
    slotKey: "DOMISILI_CABANG",
    title: "Surat Keterangan Domisili / Izin Pembukaan Kantor Cabang Mimika",
    shortBadge: "Wajib Operasional",
    required: true,
    category: "LAINNYA",
    description:
      "Bukti domisili kantor operasional atau surat pemberitahuan pembukaan kantor cabang perusahaan pelayaran di kawasan Pelabuhan Poumako, Kab. Mimika.",
    placeholderNumber: "Contoh: 503/DOM-PMK/II/2026",
  },
  {
    slotKey: "KTP_PENUNJUKAN_PIC",
    title: "KTP Direksi / Surat Kuasa Penunjukan Kepala Cabang / Keagenan (PIC)",
    shortBadge: "Pendukung",
    required: false,
    category: "LAINNYA",
    description:
      "Identitas Direktur Utama atau Surat Penunjukan Resmi Kepala Cabang / Agen Pelayaran yang berwenang menandatangani PKS Sandar & e-SKRD.",
    placeholderNumber: "Contoh: SK-PIC/018/PMS/2026",
  },
];
