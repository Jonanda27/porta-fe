import { UserRole } from "./auth.types";

/**
 * Definisi Tipe & Kontrak Data untuk Manajemen Pengguna & RBAC (Users Management)
 * Selaras dengan DTO & Controller porta-be (src/modules/users)
 */

export interface GeneratedCredentials {
  username: string;
  temporaryPassword: string;
  mustChangePassword: boolean;
  note: string;
}

export interface UserAccountItem {
  id: number;
  email: string;
  username?: string | null;
  fullName: string;
  role: UserRole;
  portId?: number | null;
  operatorId?: number | null;
  tenantId?: number | null;
  isActive: boolean;
  mustChangePassword?: boolean;
  passwordChangedAt?: string | null;
  createdAt?: string;
}

export interface UserMutationResponse extends UserAccountItem {
  generatedCredentials?: GeneratedCredentials;
}

export interface CreateUserPayload {
  email: string;
  username?: string;
  password?: string;
  fullName: string;
  role: UserRole;
  portId?: number;
  operatorId?: number;
  tenantId?: number;
  mustChangePassword?: boolean;
}

export interface UpdateUserPayload {
  fullName?: string;
  email?: string;
  username?: string | null;
  role?: UserRole;
  portId?: number | null;
  isActive?: boolean;
}

export interface UpdateUserStatusPayload {
  isActive: boolean;
}

export interface ResetUserPasswordPayload {
  newPassword?: string;
  mustChangePassword?: boolean;
}

export interface RbacRoleMatrixItem {
  role: UserRole;
  roleLabel: string;
  operationalDomain: string;
  allowedBerthCategories: string[];
  handledTaskTypes: string[];
  uiCapabilities: string[];
  defaultPermissions: string[];
  databasePermissions: string[];
  effectivePermissions: string[];
  activeUsersCount: number;
}
