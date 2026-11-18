/**
 * Kamus Terpusat Label Singkat & Umum (Human-Readable Indonesian Labels)
 * Mencegah tampilan string variabel/enum mentah (SNAKE_CASE) ke pengguna.
 */

const LABEL_DICTIONARY: Record<string, string> = {
  // Peran Pengguna (Roles)
  SUPERADMIN: "Superadmin",
  ADMIN_PELABUHAN: "Admin Pelabuhan",
  PETUGAS_DERMAGA: "Petugas Dermaga",
  BENDAHARA: "Bendahara",
  OPERATOR_KAPAL: "Operator Kapal",
  TENANT: "Penyewa (Tenant)",
  DISHUB_EKSEKUTIF: "Pimpinan Dishub",

  // Kategori Pelabuhan & Dermaga
  BARANG: "Barang",
  PENUMPANG: "Penumpang",
  CAMPURAN: "Campuran",
  DERMAGA_BARANG: "Dermaga Barang",
  DERMAGA_PENUMPANG: "Dermaga Penumpang",
  DERMAGA_CAMPURAN: "Dermaga Campuran",

  // Konstruksi Dermaga
  DERMAGA_BESI_BETON_KAYU: "Beton / Besi / Kayu",
  BRESSING_DOLPHIN_PELAMPUNG: "Dolphin / Pelampung",
  PINGGIRAN_TALUD: "Pinggiran Talud",

  // Pengelola & Status Retribusi
  PEMDA_DISHUB: "Pemda / Dishub",
  UPP_KEMENHUB: "UPP Kemenhub",
  TUKS_TERSUS: "Terminal Khusus (TUKS)",
  BILLABLE: "Kena Retribusi",
  NOT_BILLABLE: "Bebas Retribusi",
  PENDING_VERIFICATION: "Perlu Cek",

  // Status Operasional Dermaga & Aset
  OPEN: "Aktif",
  CLOSED: "Tutup",
  MAINTENANCE: "Perbaikan",
  AVAILABLE: "Tersedia",
  LEASED: "Disewa",

  // Jenis Layanan & Tarif
  JASA_LABUH: "Jasa Labuh",
  KEGIATAN_TUKS_TERSUS: "Kegiatan TUKS",
  JASA_TAMBAT_UMUM: "Jasa Tambat Umum",
  JASA_TAMBAT_KHUSUS: "Jasa Tambat Khusus",
  DALAM_NEGERI: "Dalam Negeri",
  LUAR_NEGERI: "Luar Negeri",
  PELRA_PERINTIS: "Pelayaran Rakyat",
  NIAGA: "Kapal Niaga",
  NON_NIAGA: "Non-Niaga",
  NORMAL: "Kunjungan Biasa",
  FIXED_ACTIVITY: "Kegiatan Tetap",
  GT_PER_ETMAL: "Per GT / Hari",
  GT_PER_15_DAYS: "Per GT / 15 Hari",
  GT_PER_MONTH: "Per GT / Bulan",

  // Status Verifikasi & Persetujuan
  PENDING: "Menunggu",
  VERIFIED: "Terverifikasi",
  REJECTED: "Ditolak",
  APPROVED: "Disetujui",
  AUTO_APPROVED: "Otomatis Disetujui",
  ALLOW: "Sesuai",
  WARNING: "Perlu Izin Khusus",
  BLOCK: "Tidak Sesuai",
  MATCH: "Cocok",
  MISMATCH: "Beda Kategori",

  // Status Kunjungan Kapal & Kontrak Sewa
  REQUESTED: "Menunggu",
  ANCHORED: "Berlabuh",
  BERTHED: "Sedang Sandar",
  DEPARTED: "Selesai Berangkat",
  BILLED: "Sudah Ditagih",
  SETTLED: "Selesai",
  CANCELLED: "Dibatalkan",
  DRAFT: "Draf",
  ACTIVE: "Aktif",
  EXPIRED: "Berakhir",
  TERMINATED: "Dihentikan",

  // Bongkar Muat, Alat, & Utilitas
  ANTARPULAU: "Muatan Antarpulau",
  IMPOR_EKSPOR: "Ekspor / Impor",
  BULOG_PUPUK: "Beras / Pupuk",
  HEWAN_TERNAK: "Hewan Ternak",
  PETI_KEMAS_20FT: "Peti Kemas 20 Feet",
  PETI_KEMAS_40FT: "Peti Kemas 40 Feet",
  PETI_KEMAS_OVER_40FT: "Peti Kemas > 40 Feet",
  FORKLIFT: "Forklift",
  CRANE_LISTRIK_DIESEL: "Crane",
  MOTOR_LONG_BOAT: "Long Boat",
  GEROBAK_DORONG: "Gerobak Dorong",
  AIR_BERSIH: "Air Bersih",
  LISTRIK: "Listrik",
  UNPAID: "Belum Bayar",
  PAID: "Lunas",
  ISSUED: "Belum Bayar",
  PARTIAL: "Cicilan",

  // Tiket, Pemeliharaan, & Laporan
  STOK: "Tersedia",
  HABIS: "Habis",
  DISTRIBUTED: "Sedang Berjalan",
  DISCREPANCY: "Selisih",
  KELAS_A: "Kelas A",
  KELAS_B: "Kelas B",
  KELAS_C: "Kelas C",
  LOW: "Rendah",
  MEDIUM: "Sedang",
  HIGH: "Tinggi",
  CRITICAL: "Darurat",
  REPORTED: "Dilaporkan",
  IN_PROGRESS: "Dikerjakan",
  RESOLVED: "Selesai",
  SUBMITTED: "Menunggu Sahkan",
  ACKNOWLEDGED: "Disahkan",
  TEGURAN_1: "Teguran 1",
  TEGURAN_2: "Teguran 2",
  TEGURAN_3: "Teguran 3",
  SENT: "Terkirim",
  REGULAR_SCHEDULED: "Rutin Terjadwal",
  INCIDENTAL: "Insidental",
  UMUM: "Dermaga Umum",
  KHUSUS_TUKS: "Dermaga Khusus (TUKS)",
  SIUPAL_NIB: "SIUPAL / NIB",
  NPWP: "NPWP",
  SURAT_UKUR: "Surat Ukur",
  PAS_BESAR_KECIL: "Pas Kapal",
  LAINNYA: "Dokumen Lain",
  PAS_PENUMPANG: "Pas Penumpang",
  PAS_KENDARAAN: "Pas Kendaraan",
};

export function formatLabel(raw?: string | null): string {
  if (!raw) return "-";
  if (LABEL_DICTIONARY[raw]) return LABEL_DICTIONARY[raw];
  return raw
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
