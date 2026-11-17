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
      REGISTER_TENANT: "/auth/register-tenant",
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
      LEASES: "/assets-leases/leases",
      LEASE_REQUEST: "/assets-leases/leases/request",
      ASSETS: "/assets-leases/assets",
      TENANTS: "/assets-leases/tenants",
      TENANT_ME: "/assets-leases/tenants/me",
      TENANT_DOCUMENTS: "/assets-leases/tenants/me/documents",
    },
    REPORTS: {
      REVENUE_SUMMARY: "/reports/revenue-summary",
      UNBILLED_VISITS: "/reports/unbilled-visits",
      AUDIT_LOGS: "/reports/audit-logs",
    },
    WARNINGS: {
      BASE: "/warnings",
    },
    CARGO_UTILITY: {
      CARGO: "/cargo-utility/cargo",
      EQUIPMENT: "/cargo-utility/equipment",
      UTILITIES: "/cargo-utility/utilities",
    },
    GATE_TICKETING: {
      BOOKS: "/gate-ticketing/books",
      HANDOVERS: "/gate-ticketing/handovers",
      HANDOVERS_OPEN: "/gate-ticketing/handovers/open",
      FERRY_ROUTES: "/gate-ticketing/ferry-routes",
      MANIFESTS: "/gate-ticketing/manifests",
    },
    MAINTENANCE: {
      BASE: "/maintenance",
    },
    DAILY_REPORTS: {
      BASE: "/daily-reports",
    },
    USERS: {
      BASE: "/users",
    },
    PORTS: {
      BASE: "/ports",
      BERTHS: "/ports/berths",
    },
    TARIFFS: {
      BASE: "/tariffs",
      USD_RATE: "/tariffs/exchange-rate/usd",
    },
    PAYMENTS: {
      CONFIG: "/payments/config",
      CHECKOUT: "/payments/checkout",
    },
  },
} as const;
