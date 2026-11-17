# PORTA — Pedoman Identitas Brand (Brand Guidelines)
*Sistem Pengelolaan Pelabuhan dan Penerimaan Daerah Terintegrasi (PP No. 35/2023 & Standar SOLAS)*

---

## 1. Filosofi & Konsep Brand

Identitas visual resmi PORTA menggunakan **The Sovereign Anchor & Beacon** (*Konsep B*).

```
          ╭───╮
          │ ◯ │      ← Cincin Kedaulatan & Perlindungan Otoritas
       ───┴───┴───   ← Balok Suar Emas (Transparansi PAD & PP 35/2023)
       ◀─── ◆ ───▶   ← Intan Navigasi Keselamatan SOLAS
          │   │
        ╲ │   │ ╱    ← Lengan Penyeimbang Keselamatan Sandar
         ╰─────╯
```

- **Jangkar Kedaulatan Maritim (*The Sovereign Anchor*):** Melambangkan stabilitas, otoritas resmi pelabuhan daerah, dan kekuatan hukum operasional penyeberangan.
- **Balok Suar Emas (*The Beacon Stock*):** Merepresentasikan fungsi penagihan retribusi daerah dan penerimaan PAD kas daerah yang transparan, akuntabel, dan terhubung langsung ke RKUD/Bapenda.
- **Intan Kompas Pusat (*The SOLAS Diamond*):** Titik temu sumbu yang melambangkan navigasi keselamatan berlayar dan verifikasi manifes berstandar SOLAS (*Safety of Life at Sea*).

---

## 2. Palet Warna Resmi (Official Color Palette)

| Nama Warna | Kode HEX | RGB | Penggunaan Utama |
| :--- | :--- | :--- | :--- |
| **Maritime Emerald** | `#0B241E` | `rgb(11, 36, 30)` | Warna primer otoritas, teks utama, dan background sidebar |
| **Sovereign Gold** | `#D97706` | `rgb(217, 119, 6)` | Aksen balok suar, badge status aktif, dan aksen navigasi |
| **Ocean Marine** | `#0284C7` | `rgb(2, 132, 199)` | Aksen kanal layanan publik / penumpang |
| **Crisp White** | `#FFFFFF` | `rgb(255, 255, 255)` | Warna bidang kartu dan varian logo inversi |
| **Authority Slate** | `#64748B` | `rgb(100, 116, 139)` | Subtitle, metadata, dan garis batas sekunder |
| **Deep Lagoon** | `#071914` | `rgb(7, 25, 20)` | Latar belakang hero gelap dan header eksekutif |

---

## 3. Sistem Tipografi (Typography)

1. **Wordmark Utama (`PORTA`):**
   - Karakter: Geometris, kokoh, berjarak seimbang (*custom vector outlines*).
   - 100% kurva vektor murni tanpa tag `<text>` agar tidak terpengaruh ketersediaan font di perangkat pengguna.
2. **Tipografi Antarmuka & Dokumen:**
   - Font Utama: `Inter` / `Plus Jakarta Sans` / `system-ui`
   - Angka & Data Rekapitulasi: `font-mono` / Tabular numbers untuk nominal rupiah retribusi dan kode manifes SOLAS.

---

## 4. Ruang Bebas & Skalabilitas (Clear Space & Sizing)

- **Ruang Bebas Minimum (*Clear Space*):**
  Jarak aman di sekeliling logo minimal sebesar radius cincin mahkota jangkar ($R = 24\text{px}$ pada skala master 256px, atau $10\%$ dari tinggi logo). Tidak boleh ada teks, garis pembatas, atau elemen grafis lain yang memasuki area ruang bebas ini.
- **Ukuran Minimum Penggunaan:**
  - *Media Digital (Layar):* Simbol dapat direduksi hingga **16 × 16 px** (favicon dan status bar mobile) dengan visibilitas taji jangkar tetap terjaga.
  - *Media Cetak:* Tinggi minimal lockup horizontal adalah **12 mm** untuk dokumen resmi e-SKRD, tiket pas masuk, dan kartu kendali dermaga.

---

## 5. Direktori & Manifest Berkas Aset Logo

Semua berkas aset logo siap produksi tersimpan di direktori:
`apps/web/public/brand/`

### A. Simbol Tunggal (Mark Only)
- `symbol.svg`: Warna resmi primer (Emerald `#0B241E` & Gold `#D97706`).
- `symbol-white.svg`: Varian terang untuk latar belakang gelap.
- `symbol-monochrome-black.svg`: Varian hitam 100% untuk stempel cetak & fotokopi.
- `symbol-monochrome-white.svg`: Varian putih 100% untuk sablon atau material khusus.

### B. Horizontal Lockup (Simbol + Wordmark PORTA)
- `lockup-horizontal.svg`: Versi utama untuk kop surat, navbar aplikasi, dan laporan resmi.
- `lockup-horizontal-white.svg`: Versi untuk header berwarna gelap.
- `lockup-horizontal-monochrome-black.svg`: Versi satu warna hitam.
- `lockup-horizontal-monochrome-white.svg`: Versi satu warna putih.

### C. Stacked / Vertical Lockup
- `lockup-stacked.svg`: Versi bertumpuk untuk plang dermaga, cover binder, dan badge kartu identitas.
- `lockup-stacked-white.svg`: Versi bertumpuk warna putih.

### D. Web & App Icons (`apps/web/public/brand/web/`)
- `favicon.ico`: Ikon multi-resolusi (16px, 32px, 48px).
- `favicon-16.png` & `favicon-32.png`: Favicon PNG resolusi standar & retina.
- `apple-touch-icon.png`: Ikon aplikasi iOS (180 × 180 px).
- `icon-192.png` & `icon-512.png`: PWA Android manifest icons.
- `app-icon-tile.svg`: Master ikon aplikasi dengan background persegi membulat.
- `site.webmanifest`: Konfigurasi manifest Progressive Web App.

---

## 6. Aturan Penggunaan & Larangan (Do's & Don'ts)

- **DIBOLEHKAN (DO):**
  - Gunakan `lockup-horizontal-white.svg` saat menempatkan logo di atas latar belakang foto pelabuhan atau warna gelap `#0B241E`.
  - Pertahankan proporsi aspek rasio ($1:1$ untuk simbol, $3:1$ untuk horizontal lockup) saat melakukan resize.
- **DILARANG (DON'T):**
  - Mengubah rasio atau merenggangkan (*stretch/skew*) bentuk jangkar atau tipografi.
  - Mengganti warna balok suar menjadi warna di luar palet resmi (`#D97706`).
  - Menambahkan efek bayangan (*drop shadow*), bevel 3D, atau gradien warna yang merusak kontras resmi.
  - Memotong (*crop*) bagian taji jangkar atau cincin mahkota.
