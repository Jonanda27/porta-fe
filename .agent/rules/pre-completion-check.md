# Pre-Completion Verification Rule

Sebelum mengakhiri turn atau menyatakan tugas selesai, agen WAJIB melakukan verifikasi mandiri menggunakan `tsc --noEmit` dan/atau `pnpm build`.
Dilarang membiarkan ada error kompilasi, tipe, atau konfigurasi. Jika ditemukan error, perbaiki saat itu juga hingga keluar dengan kode 0.

Lihat panduan lengkap di: `.agent/skills/pre-completion-check/SKILL.md`
