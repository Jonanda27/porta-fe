# PORTA (Sistem Pengelolaan Pelabuhan dan Penerimaan Daerah Terintegrasi)

Arsitektur Monorepo terpusat berbasis **Turborepo** dan **pnpm Workspaces** untuk tata kelola pelabuhan penyeberangan, retribusi daerah (PP No. 35/2023), manifes muatan berkeamanan tinggi, dan operasional pelabuhan.

---

## 🏗️ Struktur Arsitektur Monorepo

```
PORTA/
├── .agent/skills/porta/     # Panduan Skill, PRD lengkap, & UI/UX Design Brief PORTA
├── apps/
│   ├── web/                 # Next.js 15 (App Router) + Tailwind CSS (Dashboard Eksekutif Dinas, UPT, & Operator Kapal)
│   ├── mobile/              # React Native + Expo (Aplikasi Penumpang & Pemindai QR Petugas Gate)
│   └── api/                 # Fastify REST API Gateway & Layanan Sentralisasi Bisnis PORTA
│
├── packages/
│   ├── db/                  # PostgreSQL Database Layer & Prisma ORM (RBAC, Relasi Manifes Terisolasi)
│   ├── jobs/                # Background Workers (BullMQ + Redis) untuk e-SKRD PDF & Validasi Manifes
│   ├── ui/                  # Shared UI Component Library (Tailwind CSS, siap sinkron Figma Design Tokens)
│   └── typescript-config/   # Shared tsconfig (Base, Next.js, React Native)
│
├── turbo.json               # Konfigurasi Turborepo Pipeline (Build, Dev, Lint, DB Task Cache)
├── pnpm-workspace.yaml      # Definisi Workspace pnpm
└── package.json             # Root Orchestration & Scripts
```

---

## 🚀 Panduan Memulai Cepat (Quick Start)

### 1. Prasyarat Sistem
- **Node.js**: `>= 20.0.0`
- **pnpm**: `>= 9.0.0` (Direkomendasikan versi 10+)
- **PostgreSQL**: `>= 15.0`
- **Redis Server**: `>= 6.0` (Untuk BullMQ job queue)

### 2. Salin Konfigurasi Environment
```bash
cp .env.example .env
```
Sesuaikan `DATABASE_URL` dan konfigurasi Redis pada `.env`.

### 3. Instalasi Dependensi Seluruh Workspace
```bash
pnpm install
```

### 4. Inisialisasi Database & Prisma Client
```bash
# Generate Prisma Client ke seluruh workspace
pnpm db:generate

# Push schema ke database PostgreSQL (Mode Dev)
pnpm db:push
```

### 5. Menjalankan Seluruh Aplikasi Secara Serentak (Dev Mode)
```bash
pnpm dev
```
Turborepo akan menjalankan secara paralel:
- **Web Dashboard**: `http://localhost:3005`
- **API Gateway**: `http://localhost:4000`
- **Mobile Expo**: Metro bundler pada terminal port `8081`
- **Background Jobs**: Listener worker

---

## 🛡️ Kebijakan Privasi Manifes Kapal (High Security)
Entitas `Manifest` diklasifikasikan sebagai data berkeamanan tinggi (SOLAS). Dibatasi dengan **Row-Level Security (RLS)** pada API Gateway:
- **Role DINAS & PENUMPANG**: Dilarang mengakses data detail manifes penumpang & kargo.
- **Role KAPAL**: Hanya berhak membaca dan mengunggah manifes kapal milik perusahaannya sendiri (`company_id`).
- **Role UPT**: Memiliki hak verifikasi dan approval manifes seluruh pelabuhan untuk keselamatan berlayar.
