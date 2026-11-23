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
      ME_PROFILE: "/auth/me/profile",
      ME_PASSWORD: "/auth/me/password",
    },
    // Modul endpoint backend lainnya akan ditempatkan di sini
    PUBLIC: {
      SCHEDULES: "/public/schedules",
      TARIFFS: "/public/tariffs",
      COMPLAINTS: "/public/complaints",
    },
    VESSELS: {
      LIST: "/vessels",
      OPERATORS: "/operators",
      VISITS: "/visits",
    },
    OPERATORS: {
      BASE: "/operators",
      DETAIL: (id: number | string) => `/operators/${id}`,
      VESSELS: (id: number | string) => `/operators/${id}/vessels`,
      DOCUMENTS: (id: number | string) => `/operators/${id}/documents`,
      CONTRACTS: (id: number | string) => `/operators/${id}/contracts`,
      PENDING_CONTRACTS: "/operators/contracts/pending",
      REVIEW_CONTRACT: (contractId: number | string) => `/operators/contracts/${contractId}/review`,
      VERIFY_CONTRACT: (contractId: number | string) => `/operators/contracts/${contractId}/verify`,
    },
    BILLING: {
      INVOICES: "/billing/invoices",
      PAYMENT_STATUS: "/billing/status",
      ESTIMATE: (visitId: number | string) => `/billing/visits/${visitId}/estimate`,
      SUBMIT_PAYMENT: (invoiceId: number | string) => `/billing/invoices/${invoiceId}/submit-payment`,
    },
    ASSETS: {
      LEASES: "/assets-leases/leases",
      LEASE_REQUEST: "/assets-leases/leases/request",
      VERIFY_ROOM: (id: number | string) => `/assets-leases/leases/${id}/verify-room`,
      APPROVE_LEASE: (id: number | string) => `/assets-leases/leases/${id}/approve`,
      REJECT_LEASE: (id: number | string) => `/assets-leases/leases/${id}/reject`,
      LEASE_PAYMENT_RECEIPT: (paymentId: number | string) => `/assets-leases/payments/${paymentId}/receipt`,
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
      CARGO_PAY: (id: number | string) => `/cargo-utility/cargo/${id}/pay`,
      EQUIPMENT: "/cargo-utility/equipment",
      EQUIPMENT_PAY: (id: number | string) => `/cargo-utility/equipment/${id}/pay`,
      UTILITIES: "/cargo-utility/utilities",
      UTILITY_PAY: (id: number | string) => `/cargo-utility/utilities/${id}/pay`,
      UTILITY_RECEIPT: (id: number | string) => `/cargo-utility/utilities/${id}/receipt`,
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
      OBLIGATIONS: "/daily-reports/obligations",
    },
    ASSIGNMENTS: {
      BASE: "/assignments",
      MY: "/assignments/my",
      PERMISSIONS: "/assignments/permissions",
    },
    TASKS: {
      BASE: "/tasks",
      TEMPLATES: "/tasks/templates",
      DETAIL: (id: number | string) => `/tasks/${id}`,
      START: (id: number | string) => `/tasks/${id}/start`,
      CHECKLIST: (id: number | string) => `/tasks/${id}/checklist`,
      ATTACHMENTS: (id: number | string) => `/tasks/${id}/attachments`,
      SUBMIT: (id: number | string) => `/tasks/${id}/submit`,
      SUBMISSIONS: "/task-submissions",
    },
    USERS: {
      BASE: "/users",
    },
    PORTS: {
      BASE: "/ports",
      LIST: "/ports",
      BERTHS: "/ports/berths",
      PORT_BERTHS: (portId: number | string) => `/ports/${portId}/berths`,
      PORT_TERMINALS: (portId: number | string) => `/ports/${portId}/terminals`,
      PORT_ZONES: (portId: number | string) => `/ports/${portId}/zones`,
      PORT_FACILITIES: (portId: number | string) => `/ports/${portId}/facilities`,
    },
    TARIFFS: {
      BASE: "/tariffs",
      USD_RATE: "/tariffs/exchange-rate/usd",
    },
    PAYMENTS: {
      CONFIG: "/payments/config",
      CHECKOUT: "/payments/checkout",
    },
    NOTIFICATIONS: {
      LIST: "/notifications",
      READ: (id: number | string) => `/notifications/${id}/read`,
      READ_ALL: "/notifications/read-all",
      PREFERENCES: "/notifications/preferences",
    },
    COMPLAINTS: {
      SUBMIT: "/public/complaints",
      TRACK: "/public/complaints/track",
      MY: "/complaints/my",
    },
  },
} as const;
