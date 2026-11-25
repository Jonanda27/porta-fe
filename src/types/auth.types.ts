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
  | "PETUGAS_PELABUHAN"
  | "PETUGAS_REGISTRASI_KONTRAK"
  | "PETUGAS_DERMAGA"
  | "PETUGAS_DERMAGA_BARANG"
  | "PETUGAS_DERMAGA_PENUMPANG"
  | "PETUGAS_RUANGAN"
  | "PETUGAS_TAGIHAN"
  | "BENDAHARA"
  | "OPERATOR_KAPAL"
  | "TENANT";

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
  effectivePermissions?: string[];
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

export interface RegisteredUserSummary {
  id: number | string;
  email: string;
  fullName: string;
  role?: string;
  operatorId?: number | string | null;
  operatorVerificationStatus?: string | null;
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
  user?: AuthUser;
}

export type LandingUserRoleType = "dinas" | "upt" | "kapal" | "penumpang" | "tenant";

export type PartnerRoleType = "OPERATOR" | "TENANT";

export interface RoleCardItem {
  id: LandingUserRoleType;
  code: string;
  title: string;
  targetRole: string;
  scope: string;
  description: string;
  route: string;
  icon: import("react").ComponentType<{ className?: string }>;
  tag: string;
  badgeColor: string;
  accentBg: string;
  borderHover: string;
  features: string[];
}
