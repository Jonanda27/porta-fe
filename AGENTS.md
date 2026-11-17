# PORTA Web Frontend - AI Agent Guidelines & Pre-Completion Protocol

## 🚨 MANDATORY PROTOCOL: Zero-Error Verification Before Completion

You must ALWAYS ensure that any code modification, addition, or refactoring in this repository is **100% free of compile, type, and build errors** before concluding your response to the user.

### Verification Checklist (Must Execute Before Answering):

1. **TypeScript Typecheck (`tsc --noEmit`)**:
   Run the typecheck command:
   - `pnpm exec tsc --noEmit` (or `pnpm typecheck`)

2. **Next.js Production Build**:
   Verify that the production build succeeds cleanly without broken routes or import failures:
   - `pnpm build`

3. **Self-Correction Policy**:
   - If ANY error, warning, or broken import occurs, DO NOT ignore it or pass it to the user.
   - Fix the root cause immediately and rerun the check until exit code is `0`.
   - Never use `React.FC` for components (use standard function definitions to prevent React 18/19 type collisions).
   - Project is a standalone Next.js frontend web app (backend is hosted separately).
   - Dilarang melakukan `git commit` atau `git push` kecuali atas instruksi eksplisit pengguna.
   - Dilarang menjalankan dev server (`pnpm dev`) secara otomatis (biarkan user yang menjalankannya).

---

## 📐 ARSITEKTUR INTEGRASI API: 3-Lapis (Types, Services, Store)

Setiap integrasi modul/fitur frontend dengan API backend (`porta-be`) **WAJIB** menerapkan pola arsitektur 3-lapis (*clean code, reusable, separation of concerns*):

1. **`src/types/<module>.types.ts` (Data Contract / Types)**:
   - Wajib mendefinisikan seluruh interface data, request DTO, response DTO, dan enum terkait modul secara terpusat.
   - Dilarang membuat inline interface atau menggunakan `any` di dalam file komponen/halaman (`page.tsx`).

2. **`src/services/<module>.service.ts` (API & Domain Service)**:
   - Wajib memanggil backend melalui `apiClient` (`@/lib/api-client`) dan konstanta endpoint `API_CONFIG.ENDPOINTS` (`@/config/api.config`).
   - Bertanggung jawab atas pemanggilan HTTP, transformasi data, dan logika domain modul.
   - Dilarang melakukan `fetch()` langsung atau menulis hardcoded URL/endpoint di dalam file komponen UI / `page.tsx`.

3. **`src/store/<module>.store.ts` (Client State Management - Zustand)**:
   - Wajib menggunakan Zustand store (`zustand`) untuk mengelola state reaktif (misal: `data`, `isLoading`, `error`, `session`, `activeFilter`).
   - Komponen UI atau halaman (`page.tsx`) hanya memanggil Store (atau Service), menjaga halaman tetap bersih (*clean code*), reaktif, dan mudah di-maintain.

4. **Konfigurasi Port & Host Backend Terpusat**:
   - Seluruh rute dan port backend dikonfigurasi melalui `API_CONFIG.BASE_URL` di `src/config/api.config.ts` (membaca `NEXT_PUBLIC_API_URL` dari `.env.local` / environment hosting).
   - Memudahkan perpindahan lingkungan lokal (port 4000) ke staging maupun production tanpa mengubah kode sumber.
