import { UserRole } from "@/types/auth.types";

export const AUTH_COOKIE_KEYS = {
  TOKEN: "porta_token",
  ROLE: "porta_role",
} as const;

export const PROTECTED_PORTAL_PREFIXES = [
  "/kapal",
  "/bendahara",
  "/upt",
  "/dinas",
  "/tenant",
] as const;

/**
 * Mengecek apakah pathname termasuk rute portal terproteksi yang mewajibkan login.
 */
export function isProtectedPortalPath(pathname: string): boolean {
  return PROTECTED_PORTAL_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

/**
 * Menentukan daftar prefix portal yang boleh diakses oleh masing-masing role.
 */
export function getAllowedPrefixesForRole(role?: UserRole | string | null): string[] {
  switch (role) {
    case "OPERATOR_KAPAL":
      return ["/kapal"];
    case "BENDAHARA":
      return ["/bendahara"];
    case "TENANT":
      return ["/tenant"];
    case "DISHUB_EKSEKUTIF":
    case "KEPALA_DINAS":
    case "KEPALA_BIDANG":
      return ["/dinas"];
    case "SUPERADMIN":
      return ["/upt", "/bendahara", "/dinas"];
    case "ADMIN_PELABUHAN":
    case "KEPALA_PELABUHAN":
    case "PETUGAS_PELABUHAN":
    case "PETUGAS_REGISTRASI_KONTRAK":
    case "PETUGAS_DERMAGA":
    case "PETUGAS_DERMAGA_BARANG":
    case "PETUGAS_DERMAGA_PENUMPANG":
    case "PETUGAS_RUANGAN":
    case "PETUGAS_TAGIHAN":
      return ["/upt"];
    default:
      return [];
  }
}

/**
 * Menentukan apakah suatu role diizinkan mengakses pathname tertentu.
 */
export function isRoleAllowedForPath(
  role: UserRole | string | undefined | null,
  pathname: string
): boolean {
  if (!isProtectedPortalPath(pathname)) return true;
  if (!role) return false;
  const allowedPrefixes = getAllowedPrefixesForRole(role);
  return allowedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

/**
 * Menentukan rute beranda resmi berdasarkan role pengguna.
 */
export function getHomeRouteForRole(role?: UserRole | string | null): string {
  switch (role) {
    case "DISHUB_EKSEKUTIF":
    case "KEPALA_DINAS":
    case "KEPALA_BIDANG":
      return "/dinas/dashboard";
    case "OPERATOR_KAPAL":
      return "/kapal/dashboard";
    case "BENDAHARA":
      return "/bendahara/dashboard";
    case "TENANT":
      return "/tenant";
    case "SUPERADMIN":
      return "/upt/pelabuhan";
    case "ADMIN_PELABUHAN":
    case "PETUGAS_REGISTRASI_KONTRAK":
      return "/upt/dashboard";
    case "PETUGAS_DERMAGA":
    case "PETUGAS_DERMAGA_BARANG":
    case "PETUGAS_DERMAGA_PENUMPANG":
      return "/upt/kapal";
    case "PETUGAS_RUANGAN":
    case "KEPALA_PELABUHAN":
      return "/upt/verifikasi";
    default:
      return "/upt/dashboard";
  }
}
