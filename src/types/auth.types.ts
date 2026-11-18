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

export type OperatorProfile = "REGULAR_SCHEDULED" | "INCIDENTAL";

export interface LoginCredentials {
  identifier?: string;
  email?: string;
  password: string;
}

export interface AuthUser {
  id: number | string;
  email: string;
  username?: string | null;
  fullName: string;
  role: UserRole;
  portId?: number | string | null;
  operatorId?: number | string | null;
  operatorVerificationStatus?: string | null;
  tenantId?: number | null;
  tenantVerificationStatus?: string | null;
  mustChangePassword?: boolean;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

export interface RegisterOperatorDto {
  email: string;
  password: string;
  fullName: string;
  companyName: string;
  npwp?: string;
  phone?: string;
  address?: string;
  operatorProfile?: OperatorProfile;
}

export interface RegisterOperatorResponse {
  accessToken: string;
  user: {
    id: number | string;
    email: string;
    fullName: string;
    role: string;
    operatorId: number | string;
    operatorVerificationStatus: string;
  };
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
