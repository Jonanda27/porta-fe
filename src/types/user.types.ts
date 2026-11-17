import { UserRole } from "./auth.types";

/**
 * Definisi Tipe & Kontrak Data untuk Manajemen Pengguna (Users Management)
 * Selaras dengan DTO porta-be (src/modules/users/dto/users.dto.ts)
 */

export interface UserAccountItem {
  id: number;
  email: string;
  fullName: string;
  role: UserRole;
  portId?: number | null;
  operatorId?: number | null;
  isActive: boolean;
  createdAt?: string;
}

export interface CreateUserPayload {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
  portId?: number;
  operatorId?: number;
}

export interface UpdateUserStatusPayload {
  isActive: boolean;
}
