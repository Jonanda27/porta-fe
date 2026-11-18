/**
 * Konfigurasi Terpusat Endpoint & URL Backend PORTA
 * 
 * Pengaturan ini dapat disesuaikan melalui environment variable:
 * NEXT_PUBLIC_API_URL
 * 
 * Untuk deployment, cukup ubah NEXT_PUBLIC_API_URL di .env.production atau platform hosting.
 */

const getApiBaseUrl = (): string => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    // Normalisasi agar tidak berakhiran slash
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/+$/, "");
  }
  // Default port lokal backend NestJS (porta-be)
  return "http://localhost:4000/api/v1";
};

export const API_CONFIG = {
  BASE_URL: getApiBaseUrl(),
  TIMEOUT_MS: 15000,
  ENDPOINTS: {
    AUTH: {
      LOGIN: "/auth/login",
      REGISTER: "/auth/register",
      ME: "/auth/me",
    },
    // Modul endpoint backend lainnya akan ditempatkan di sini
    PUBLIC: {
      SCHEDULES: "/public/schedules",
      TARIFFS: "/public/tariffs",
      COMPLAINTS: "/public/complaints",
    },
    VESSELS: {
      LIST: "/vessels",
      OPERATORS: "/vessels/operators",
      VISITS: "/visits",
    },
    BILLING: {
      INVOICES: "/billing/invoices",
      PAYMENT_STATUS: "/billing/status",
    },
    ASSETS: {
      LEASES: "/assets-leases",
    },
    NOTIFICATIONS: {
      LIST: "/notifications",
      READ: (id: number | string) => `/notifications/${id}/read`,
    },
    PORTS: {
      LIST: "/ports",
      BERTHS: (portId: number | string) => `/ports/${portId}/berths`,
    },
  },
} as const;
