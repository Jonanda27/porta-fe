/**
 * Definisi Tipe & Kontrak Data untuk Autentikasi PORTA
 * Selaras dengan enum UserRole di porta-be (prisma/schema.prisma)
 */

export type UserRole =
  | "SUPERADMIN"
  | "KEPALA_DINAS"
  | "DISHUB_EKSEKUTIF"
  | "KEPALA_BIDANG"
  | "KEPALA_UPTD"
  | "KEPALA_PELABUHAN"
  | "ADMIN_PELABUHAN"
  | "PETUGAS_REGISTRASI_KONTRAK"
  | "PETUGAS_DERMAGA_BARANG"
  | "PETUGAS_DERMAGA_PENUMPANG"
  | "PETUGAS_RUANGAN"
  | "PETUGAS_TAGIHAN"
  | "PETUGAS_DERMAGA"
  | "BENDAHARA"
  | "OPERATOR_KAPAL"
  | "TENANT";

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
  effectivePermissions?: string[];
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
  user?: AuthUser;
}
