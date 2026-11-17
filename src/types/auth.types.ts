/**
 * Definisi Tipe & Kontrak Data untuk Autentikasi PORTA
 */

export type UserRole =
  | "SUPERADMIN"
  | "ADMIN_PELABUHAN"
  | "PETUGAS_DERMAGA"
  | "BENDAHARA"
  | "OPERATOR_KAPAL"
  | "DISHUB_EKSEKUTIF";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthUser {
  id: number;
  email: string;
  fullName: string;
  role: UserRole;
  portId?: number | null;
  operatorId?: number | null;
  operatorVerificationStatus?: string | null;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}
