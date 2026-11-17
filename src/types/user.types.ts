import { UserRole } from "./auth.types";

/**
 * Definisi Tipe & Kontrak Data untuk Manajemen Pengguna (Users Management)
 * Selaras dengan DTO porta-be (src/modules/users/dto/users.dto.ts)
 */

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

export interface CreateUserPayload {
  email: string;
  username?: string;
  password: string;
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
  newPassword: string;
  mustChangePassword?: boolean;
}
