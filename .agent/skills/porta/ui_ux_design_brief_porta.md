# UI & UX Design Brief - PORTA
**Produk:** PORTA (Sistem Pengelolaan Pelabuhan dan Penerimaan Daerah Terintegrasi)
**Peran AI:** Senior Product Designer

---

## 1. Design Principles
Tiga aturan mutlak untuk UI PORTA:
1. **Fungsionalitas di Atas Estetika (Data-First):** Aplikasi ini menangani jadwal, uang (retribusi), dan manifes. Informasi harus padat namun mudah dipindai (*scannable*). Jangan korbankan keterbacaan demi ruang kosong (*whitespace*) yang berlebihan.
2. **Aksi yang Tidak Ambigu:** Tombol aksi utama (Bayar, Setujui, Tolak) harus memiliki hierarki visual yang kontras dan jelas. Kesalahan klik bisa berakibat pada selisih laporan keuangan daerah.
3. **Tangguh di Koneksi Buruk (Resilient):** Pelabuhan sering memiliki *blind spot* sinyal. UI harus merespons interaksi pengguna seketika (menggunakan *optimistic UI*) dan memberikan indikator visual yang jelas jika aplikasi masuk ke mode *offline*.

## 2. Visual Direction
* **Mood:** Profesional, Institusional, Terpercaya, dan Maritim Modern.
* **Referensi:** *Dashboard* operasional logistik modern, sistem manajemen bandara, atau *fintech dashboard* (seperti Stripe).
* **Yang Dihindari:** Template SaaS generik dengan gradien ungu/pink, ilustrasi vektor yang terlalu *playful* (kartun), dan elemen *glassmorphism* (mengurangi keterbacaan data).

## 3. Design Tokens (Keputusan & Alasan)
* **Palet Warna:**
  * **Primary:** Ocean Blue (`#003366`) - *Alasan: Mewakili otoritas pemerintah (institusional) dan laut. Memberikan rasa aman dan terpercaya.*
  * **Accent/Action:** Turquoise (`#00A3A3`) - *Alasan: Kontras yang sangat baik di atas putih dan biru gelap. Memberikan kesan modern dan mengarahkan mata ke CTA utama.*
  * **Background:** Off-white (`#F8FAFC`) - *Alasan: Mengurangi kelelahan mata (eye-strain) bagi petugas UPT yang menatap layar berjam-jam.*
  * **Surface:** White (`#FFFFFF`) untuk *card* data.
  * **Semantic:** Error/Unpaid (`#DC2626`), Success/Paid (`#10B981`), Warning/Pending (`#F59E0B`).
* **Skala Tipografi:** 
  * **Font Keluarga:** `Inter`. *Alasan: Font sans-serif yang didesain khusus untuk UI layar komputer. Angka tabel (tabular figures) sangat rapi sejajar ke bawah, mutlak untuk laporan retribusi.*
  * **Skala:** H1 (32px, Bold), H2 (24px, SemiBold), Body (16px, Regular), Caption/Table Data (14px, Regular).
* **Skala Spacing:** Kelipatan 4px (4, 8, 12, 16, 24, 32).
* **Radius:** `6px`. *Alasan: Sudut yang sedikit membulat memberikan kesan modern tanpa terlihat kekanak-kanakan (menghindari radius pil penuh).*
* **Shadow:** Elevasi minimal (`0 4px 6px -1px rgba(0, 0, 0, 0.1)`) hanya untuk memisahkan *card* utama dari *background*.

## 4. Screen Inventory (MVP)
**Portal Layanan Publik:**
* `Home_Public`: Pencarian jadwal, akses cepat layanan, informasi tarif.
* `Ticketing_Flow`: Pemilihan kelas penumpang/kendaraan, *checkout*.

**Portal Operator Kapal:**
* `Dashboard_Operator`: Ringkasan tagihan tertunggak, jadwal aktif.
* `Permohonan_Dermaga`: Form *wizard* untuk pengajuan sandar.
* `Manifes_Upload`: Area unggah dokumen dan input data muatan terisolasi.
* `Billing_Detail`: Rincian e-SKRD dan kode QRIS/VA.

**Portal UPT (Pengelola):**
* `Dashboard_UPT`: Tampilan *real-time* kapal sandar, antrean.
* `Verifikasi_Sandar`: Tabel *review* permohonan dari operator.
* `Pencatatan_Aktual`: Form konfirmasi jam kedatangan/keberangkatan aktual (memicu *billing*).

## 5. User Flow (Alur Utama MVP)
**Journey: Permohonan Dermaga hingga Penagihan**
1. **Operator** klik "Ajukan Sandar" -> Pilih Kapal -> Input estimasi tiba/berangkat -> Submit.
2. Sistem menandai status `Menunggu Verifikasi`.
3. **Admin UPT** menerima notifikasi -> Buka detil permohonan -> Klik "Setujui Alokasi".
4. Kapal tiba. **Petugas UPT** klik "Catat Waktu Sandar" (Mulai argo).
5. Kapal berangkat. **Petugas UPT** klik "Catat Keberangkatan" (Argo berhenti).
6. Sistem **otomatis** *generate* tagihan (Tarif PP 35/2023 x Durasi).
7. **Operator** menerima tagihan di dasbor -> Klik "Bayar" -> Muncul Modal VA -> Status menjadi `Lunas`.

## 6. Layout per Screen (Contoh: Dashboard Operator)
* **Hierarki:** 
  1. *Top Navigation:* Logo PORTA (Kiri), Profil & Notif (Kanan).
  2. *Top Section (Alert):* Banner merah jika ada tagihan *overdue*.
  3. *Middle Section (Metrics):* 4 Kartu metrik berjejer horizontal (Total Kapal, Jadwal Hari Ini, Tagihan Belum Dibayar).
  4. *Main Section:* Data Table "Jadwal Mendatang".
* **Primary Action:** Tombol *Turquoise* solid "Ajukan Layanan" di kanan atas tabel.
* **Komponen yang dipakai:** `TopBar`, `MetricCard`, `DataTable`, `StatusBadge`, `Button`.

## 7. Component Library
* **Button:** 
  * `Primary` (Solid Turquoise).
  * `Secondary` (Outline Ocean Blue).
  * `Ghost` (Text only, untuk aksi minor).
  * *States:* Default, Hover (lebih gelap), Disabled (Abu-abu, kursor *not-allowed*).
* **Data Table:** Header dengan ikon *sortable*, baris dengan efek *hover*, kolom aksi statis di ujung kanan (*sticky right*).
* **Status Badge (Pill-shaped):** 
  * `Pending`: *Background* kuning muda, teks kuning gelap.
  * `Approved/Paid`: *Background* hijau muda, teks hijau gelap.
  * `Unpaid/Rejected`: *Background* merah muda, teks merah gelap.

## 8. State
* **Empty State:** Di halaman Tagihan kosong, tampilkan ilustrasi minimalis "Tidak ada tagihan tertunggak" dengan CTA "Lihat Riwayat Lunas". Hindari ruang kosong yang membingungkan.
* **Loading State:** Gunakan *Skeleton Loader* berbentuk baris tabel. Jangan gunakan *spinner* besar yang memblokir seluruh layar (*layout shift*).
* **Error State:** Pesan *toast* spesifik (misal: "Gagal menyimpan jadwal: Kapal sedang dalam perbaikan") bukan "Terjadi kesalahan sistem".
* **Offline State:** Banner lengket (*sticky*) berwarna kuning di bagian atas: "Koneksi terputus. Pencatatan akan disinkronkan otomatis saat *online*." Tombol *submit* tetap bisa diklik (simpan di `IndexedDB`).

## 9. Responsive Behaviour
* **Desktop (1024px+):** Layout optimal dengan *sidebar* kiri untuk navigasi UPT. Tabel data tampil penuh dengan 8+ kolom.
* **Tablet (768px - 1023px):** *Sidebar* menyusut menjadi *icon-only*. Tabel data menggunakan *horizontal scroll* agar kolom tidak bertumpuk/terjepit.
* **Mobile (320px - 767px):** Mutlak untuk Portal Publik (Penumpang) dan Petugas Lapangan. Tabel diubah menjadi format `Card List` (Tumpukan kartu per data). Navigasi menggunakan *Bottom Navigation Bar*.

## 10. Accessibility (A11y)
* **Rasio Kontras:** Teks putih di atas *Ocean Blue* (`#003366`) memiliki rasio > 7:1 (Lulus WCAG AAA). Teks Turquoise hanya untuk aksen tombol berlatar gelap, jangan gunakan untuk teks paragraf panjang.
* **Focus Order & Keyboard Nav:** Petugas UPT yang bekerja cepat harus bisa menavigasi form menggunakan tombol `Tab`. Komponen yang sedang fokus harus memiliki cincin fokus (*focus ring*) 2px berwarna Turquoise padat.
* **ARIA Needs:** Formulir "Catat Kedatangan" mutlak menggunakan `aria-live="polite"` untuk memberikan umpan balik (feedback) sukses/gagal pada *screen reader* karena tidak me-refresh halaman.