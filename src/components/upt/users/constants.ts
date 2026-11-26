import { UserRole } from "@/types/auth.types";

export const ALL_ROLES: UserRole[] = [
  "SUPERADMIN",
  "KEPALA_DINAS",
  "DISHUB_EKSEKUTIF",
  "KEPALA_BIDANG",
  "KEPALA_UPTD",
  "KEPALA_PELABUHAN",
  "ADMIN_PELABUHAN",
  "PETUGAS_REGISTRASI_KONTRAK",
  "PETUGAS_PELABUHAN",
  "PETUGAS_DERMAGA",
  "PETUGAS_DERMAGA_BARANG",
  "PETUGAS_DERMAGA_PENUMPANG",
  "PETUGAS_RUANGAN",
  "PETUGAS_TAGIHAN",
  "BENDAHARA",
  "OPERATOR_KAPAL",
  "TENANT",
];

export const ADMIN_ALLOWED_ROLES: UserRole[] = [
  "PETUGAS_REGISTRASI_KONTRAK",
  "PETUGAS_DERMAGA_BARANG",
  "PETUGAS_DERMAGA_PENUMPANG",
  "PETUGAS_RUANGAN",
  "PETUGAS_TAGIHAN",
  "PETUGAS_DERMAGA",
  "PETUGAS_PELABUHAN",
  "BENDAHARA",
];

export const PORT_BOUND_ROLES: UserRole[] = [
  "KEPALA_PELABUHAN",
  "ADMIN_PELABUHAN",
  ...ADMIN_ALLOWED_ROLES,
];

export interface UserFormState {
  email: string;
  username: string;
  password: string;
  fullName: string;
  role: UserRole;
  portId: string;
  mustChangePassword: boolean;
}

export interface GeneratedCredentialModalData {
  title: string;
  fullName: string;
  email: string;
  credentials: {
    username: string;
    temporaryPassword: string;
    mustChangePassword: boolean;
    note: string;
  };
}
