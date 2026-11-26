import { API_CONFIG } from "@/config/api.config";

const BACKEND_ORIGIN = API_CONFIG.BASE_URL.replace(/\/api\/v1\/?$/, "");

/**
 * Mengubah path berkas relatif dari backend menjadi URL lengkap yang dapat diakses browser.
 */
export function getBackendFileUrl(filePath?: string | null): string | null {
  if (!filePath) return null;
  if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
    return filePath;
  }
  return `${BACKEND_ORIGIN}/${filePath.replace(/^\/+/, "")}`;
}
