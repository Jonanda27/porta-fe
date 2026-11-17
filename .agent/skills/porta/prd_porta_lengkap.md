# Product Requirements Document (PRD) - PORTA

**Produk:** PORTA (Sistem Pengelolaan Pelabuhan dan Penerimaan Daerah Terintegrasi)

## 1. Problem Statement

Pemerintah Daerah (Pemda) sering kehilangan potensi Pendapatan Asli Daerah (PAD) dari retribusi pelabuhan penyeberangan karena sistem yang belum terintegrasi. Proses pencatatan operasional (kapal sandar, antrean), pelayanan penumpang (pas masuk/tiket), pengelolaan aset produktif, dan penagihan masih berjalan sendiri-sendiri atau manual. Akibatnya, sulit menelusuri hubungan antara pelayanan aktual dengan penerimaan daerah, serta pimpinan kesulitan mendapatkan data *real-time* untuk pengambilan keputusan.

## 2. Target User + 2 Persona

**Target User Utama:**
1. **Dinas (Kepala Dishub/Pimpinan Daerah):** Pemantau kinerja dan penerimaan.
2. **Pengelola Pelabuhan (UPTD/Petugas):** Verifikator, pengendali operasional, dan admin aset.
3. **Perusahaan Kapal (Operator):** Pengguna layanan dermaga dan penyetor retribusi kapal/manifes.
4. **Penumpang:** Pengguna jasa pelabuhan (pembeli tiket & pembayar retribusi pas masuk).
*(Catatan: Terdapat user tambahan "Penyewa/Tenant" untuk penyewaan aset sesuai dokumen).*

* **Persona 1: Budi (Kepala UPTD / Pengelola Pelabuhan)**
  Budi kesulitan memantau kapal mana yang sudah membayar retribusi sandar dan sering menghadapi penumpukan antrean karena pencatatan alokasi dermaga masih menggunakan papan tulis/kertas.
* **Persona 2: Kapten Andi (Perusahaan Kapal)**
  Andi ingin proses pengajuan jadwal sandar, penyerahan dokumen kelengkapan (termasuk manifes), dan pembayaran tagihan layanan kapal bisa dilakukan dari satu portal mandiri tanpa harus bolak-balik ke kantor UPT pelabuhan.

## 3. Goals dan Non-goals

* **Goals (Sesuai Konsep PORTA):**
  * **Meningkatkan pelayanan publik:** Jadwal, tarif, tiket digital (QR), dan pengaduan mudah diakses.
  * **Menertibkan operasional:** Kedatangan, sandar, alokasi dermaga, dan pencatatan manifes terpusat.
  * **Mengoptimalkan penerimaan:** Menghubungkan layanan berbayar dengan e-SKRD, tagihan, dan *payment gateway* (PP 35/2023).
  * **Mendukung pengambilan keputusan:** Menyediakan *dashboard* analitik untuk Dinas membandingkan kinerja antar-pelabuhan.
* **Non-goals:**
  * Tidak menggantikan sistem tiket eksternal milik operator kapal yang sudah berjalan (sistem akan menggunakan integrasi API untuk menerima data tiket angkutan, dan PORTA fokus pada komponen retribusi Pemda).
  * Tidak untuk memonitor radar navigasi lalu lintas laut terbuka (*Vessel Traffic Service*).

## 4. User Stories

* *Sebagai* **Penumpang**, *saya ingin* melihat jadwal penyeberangan dan mendapatkan tiket/pas digital (QR Code) *supaya* saya bisa memvalidasi akses masuk di gerbang pelabuhan secara cepat.
* *Sebagai* **Perusahaan Kapal**, *saya ingin* mengajukan jadwal penggunaan dermaga dan mengunggah dokumen via Portal Mandiri *supaya* saya otomatis menerima *invoice* tagihan retribusi yang bisa langsung dibayar.
* *Sebagai* **Pengelola Pelabuhan (UPT)**, *saya ingin* mencatat realisasi pelayanan aktual (jam datang-sandar-berangkat) di sistem *supaya* tagihan yang dihitung ke operator kapal benar-benar akurat sesuai durasi.
* *Sebagai* **Pimpinan Dinas**, *saya ingin* membuka Dashboard Eksekutif *supaya* saya bisa melihat grafik penerimaan harian, piutang, dan utilisasi dermaga dari seluruh pelabuhan di bawah wewenang saya.

## 5. Daftar Fitur (Tahap Pengembangan Sesuai Dokumen)

* **MVP (Tahap 1 - Administrasi & Penerimaan):**
  * Manajemen Data Induk (Pelabuhan, Kapal, Mitra, Tarif PP 35/2023).
  * Portal Operator Kapal (Pengajuan jadwal & unggah dokumen/manifes).
  * Sistem Penagihan & Pembayaran (Pembuatan *invoice* e-SKRD, rekonsiliasi, piutang).
  * Dashboard Pimpinan (Dinas).
* **v2 (Tahap 2 - Operasional & Pelayanan Publik):**
  * Portal Layanan Publik & Penumpang (Jadwal keberangkatan, informasi fasilitas).
  * Tiket/Pas Digital dengan Validasi QR Scanner di gerbang/loket.
  * Modul Tenant & Mitra (Penyewaan aset, penagihan utilitas).
  * Pencatatan operasional UPT (Antrean, inspeksi fasilitas, pengaduan).
* **Nanti (Tahap 3 - Usaha & Analitik Lanjutan):**
  * Peta peluang usaha pelabuhan berbasis GIS.
  * Simulasi potensi pendapatan dan *Alert* penerimaan belum tertagih.
  * Integrasi *hardware* (Gerbang akses otomatis, timbangan, CCTV).
  * Fitur *offline-sync* saat koneksi terganggu.

## 6. Functional Requirement Detail (Fitur MVP)

* **Alur Penggunaan Dermaga (Core):** Operator (Perusahaan Kapal) *mengajukan* jadwal -> UPT *memverifikasi* -> Alokasi *disetujui* -> Waktu aktual sandar *dicatat* UPT -> Sistem *menghitung tagihan* otomatis berdasarkan tarif yang berlaku -> Pembayaran *direkonsiliasi*.
* **Manajemen Tiket & Pas Masuk:** Pas masuk digital wajib menghasilkan QR Code unik. Saat dipindai di gerbang, statusnya berubah dan otomatis tercatat di Laporan Penerimaan.
* **Isolasi Dokumen Manifes (Security):** Dokumen manifes yang diunggah oleh Perusahaan Kapal diklasifikasikan sebagai dokumen operasional sensitif. Hanya akun Perusahaan Kapal pengunggah dan Admin UPT yang berhak melihat dan memverifikasinya.
* **Penagihan Terpusat:** Sistem wajib mendukung konfirmasi pelunasan berdasarkan konfirmasi bank/VA atau unggah bukti transfer yang diverifikasi petugas.

## 7. Sketsa Data Model

* **Users:** `id`, `role` (dinas, upt, perusahaan_kapal, penumpang, tenant), `company_id`
* **Ports & Facilities:** `port_id`, `name`, `location`, `gis_data`
* **Ships (Kapal):** `ship_id`, `company_id`, `name`, `type`, `capacity`
* **Schedules & Operations:** `schedule_id`, `ship_id`, `port_id`, `req_arrival`, `req_departure`, `actual_arrival`, `actual_departure`, `status`
* **Tickets (Penumpang):** `ticket_id`, `schedule_id`, `user_id`, `vehicle_class`, `retribution_amount`, `qr_code`, `payment_status`
* **Billing & Invoices:** `invoice_id`, `object_type` (sandar/tiket/sewa), `amount`, `payment_method` (VA/QRIS), `status` (paid/unpaid)

## 8. Edge Case dan Failure State

* **Koneksi Internet Pelabuhan Terganggu (Blank Spot):** Petugas pemeriksa (UPT) gagal memindai QR tiket ke server pusat.
  * *Solusi:* Aplikasi portal lokal memiliki mode tanggap *offline* yang mencatat log *scan* sementara dan otomatis menyinkronkan data dengan kontrol duplikasi saat koneksi pulih.
* **Perubahan Jadwal Mendadak (Cuaca Buruk):** Kapal gagal berangkat sesuai jadwal yang sudah dibayar retribusinya.
  * *Solusi:* Menyediakan alur pembatalan atau *reschedule* pada portal UPT yang akan menyesuaikan ulang/memindahkan kredit tagihan tanpa menghapus riwayat dokumen awal.

## 9. Success Metrics

* 100% *traceability* transaksi: Setiap Rp 1 penerimaan bisa ditelusuri kembali ke dasar tarif, bukti pelayanan, pengguna, dan objeknya.
* Peningkatan efisiensi waktu siklus permohonan hingga persetujuan dermaga bagi Perusahaan Kapal.
* Penurunan rasio piutang tak tertagih karena adanya *dashboard warning* tagihan tertunda dan integrasi *payment gateway*.

## 10. Open Questions

* \[ \] Untuk modul tiket penumpang, apakah kita akan membangun *booking engine* dari nol, atau prioritas saat ini hanya menarik data manifes/tiket via API dari platform pihak ketiga yang sudah dipakai operator kapal?
* \[ \] Pada Tahap 1 (MVP), apakah integrasi bank penerima (RKUD) untuk *Virtual Account*/QRIS dilakukan secara *direct API* ke bank BUMD setempat, atau menggunakan agregator *payment gateway* pihak ketiga?