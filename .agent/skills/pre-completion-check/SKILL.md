---
name: pre-completion-check
description: >-
  Prosedur verifikasi pra-penyelesaian tugas untuk repositori PORTA Monorepo.
  Wajib dijalankan sebelum menyerahkan hasil kode atau menyatakan tugas selesai
  agar tidak ada error tipe, kompilasi, atau dependensi saat user menguji.
---

# Pre-Completion Verification & Zero-Error Protocol (PORTA Monorepo)

Dokumen ini adalah prosedur verifikasi mutu wajib yang harus dijalankan oleh agen kecerdasan buatan (AI) sebelum mengakhiri respons prompt atau menyatakan suatu tugas/fitur telah selesai di repositori **PORTA**.

Tujuan utama: **Menjamin 100% Zero-Error** ketika pengguna menjalankan pengujian lokal (`pnpm dev`, `pnpm build`, atau saat membuka kode di VS Code/IDE).

---

## 1. Zero-Error Mandate (Aturan Mutlak)

Setiap kali agen membuat atau memodifikasi berkas dalam monorepo, agen **DILARANG KERAS** menyatakan tugas telah selesai tanpa melakukan verifikasi mandiri menggunakan *tools* terminal (`run_command`).

Jika ditemukan error atau peringatan diagnostik:
1. **Dilarang mengabaikan error** atau meminta pengguna memperbaikinya sendiri.
2. Identifikasi akar penyebab (tipe, dependensi, sintaks, konfigurasi JSON).
3. Terapkan perbaikan langsung pada kode.
4. Jalankan ulang pemeriksaan hingga keluaran bernilai `exit code 0` (clean).

---

## 2. Checklist & Eksekusi Verifikasi Terarah

Jalankan perintah verifikasi sesuai cakupan kode yang dimodifikasi:

### A. Jika Mengubah Kode TypeScript / Komponen UI (`apps/*` atau `packages/*`)
Jalankan typecheck non-emitting pada paket yang terdampak:

```powershell
# Web Frontend (Next.js App Router)
pnpm --filter @porta/web exec tsc --noEmit

# Backend API Gateway (Fastify)
pnpm --filter @porta/api exec tsc --noEmit

# Mobile Frontend (React Native Expo)
pnpm --filter @porta/mobile exec tsc --noEmit

# Shared UI Library
pnpm --filter @porta/ui exec tsc --noEmit

# Background Workers (BullMQ)
pnpm --filter @porta/jobs exec tsc --noEmit

# Database Package
pnpm --filter @porta/db exec tsc --noEmit
```
> **Standar Kelulusan:** Semua perintah di atas harus menghasilkan **0 error** dan keluar dengan kode `0`.

---

### B. Jika Mengubah Skema Database (`packages/db/prisma/schema.prisma`)
1. Generate ulang Prisma Client:
   ```powershell
   pnpm db:generate
   ```
2. Pastikan `@prisma/client` tersinkronisasi tanpa ada *missing model types* di `@porta/api` atau paket lainnya.

---

### C. Jika Menambahkan Dependensi Baru atau Mengubah `package.json`
1. Pastikan paket terpasang di workspace yang tepat (`apps/*` atau `packages/*`).
2. Pastikan binary native (seperti esbuild, prisma, sharp) terdaftar di `allowBuilds` pada [pnpm-workspace.yaml](file:///c:/Users/Geocitra1/Documents/Github/PORTA/pnpm-workspace.yaml).
3. Jalankan instalasi:
   ```powershell
   pnpm install
   ```

---

### D. Verifikasi Menyeluruh Pipeline Turborepo (Sebelum Penyelesaian Fitur Besar)
Jalankan build terpadu di seluruh workspace:
```powershell
pnpm build
```
Pastikan seluruh task Turborepo bertanda `successful`:
```
Tasks: X successful, X total
```

---

## 3. Titik Rawan Error Umum di Monorepo PORTA & Cara Mengatasinya

| Gejala Error | Akar Masalah | Solusi Cepat |
| :--- | :--- | :--- |
| `File '@porta/typescript-config/...' not found` | Language server IDE belum memetakan symlink `node_modules` | Gunakan path relatif pada `extends` di `tsconfig.json` (misal: `"../../packages/typescript-config/nextjs.json"`). |
| `'Badge/Button' cannot be used as a JSX component... Type 'FC' is not assignable` | Konflik tipe React 18 vs React 19 dengan `React.FC` | Jangan gunakan `React.FC`. Tulis komponen sebagai fungsi standar: `export function Button(props: ButtonProps)`. |
| `The inferred type cannot be named without a reference... TS2742` | Aplikasi Next.js mengekspor `.d.ts` secara tidak perlu | Tambahkan `"declaration": false` dan `"declarationMap": false` pada `packages/typescript-config/nextjs.json`. |
| `Unable to parse content from https://... Parse error` | Dokumen JSON memuat `$schema` mengarah ke halaman HTML | Hapus `$schema` atau ganti dengan schema JSON mentah yang valid. |
| `Cannot find name 'process'` | Paket Node tidak memiliki type definitions | Pasang `@types/node` pada `devDependencies` paket terkait. |

---

## 4. Protokol Pelaporan ke Pengguna

Saat menyelesaikan tugas, berikan ringkasan verifikasi ringkas:
1. Sebutkan berkas apa saja yang telah diubah/dibuat.
2. Laporkan hasil pengujian mandiri (misal: *`pnpm build` sukses 5/5 tasks, typecheck 0 error*).
3. Berikan instruksi pengujian yang jelas kepada pengguna (misal: *`pnpm dev` buka di port 3000*).
