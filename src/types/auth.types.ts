/**
 * Definisi Tipe & Kontrak Data untuk Autentikasi PORTA
 */

export type UserRole =
  | "SUPERADMIN"
  | "ADMIN_PELABUHAN"
  | "PETUGAS_DERMAGA"
  | "BENDAHARA"
  | "OPERATOR_KAPAL"
  | "TENANT"
  | "DISHUB_EKSEKUTIF";

export interface LoginCredentials {
  identifier?: string;
  email?: string;
  password: string;
}

export interface AuthUser {
  id: number;
  email: string;
  username?: string | null;
  fullName: string;
  role: UserRole;
  portId?: number | null;
  operatorId?: number | null;
  operatorVerificationStatus?: string | null;
  tenantId?: number | null;
  tenantVerificationStatus?: string | null;
  mustChangePassword?: boolean;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

export interface UpdateMyProfilePayload {
  fullName?: string;
  email?: string;
  username?: string | null;
  currentPassword?: string;
}

export interface ChangeMyPasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface ChangeMyPasswordResponse {
  message: string;
  accessToken: string;
}
