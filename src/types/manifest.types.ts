/**
 * Definisi Tipe Data & Kontrak API Modul Manifes Kapal (SOLAS & Penyeberangan)
 */

export type TerminalClass = "KELAS_A" | "KELAS_B" | "KELAS_C";

export interface FerryRouteItem {
  id: number;
  portId: number;
  destinationName: string;
  distanceMiles: number;
  adultFareIdr: string | number;
  childFareIdr: string | number;
  infantFareIdr: string | number;
  cargoPerTonIdr: string | number;
  legalBasis: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VesselManifestItem {
  id: number;
  manifestNumber: string;
  portId: number;
  visitId: number;
  ferryRouteId: number | null;
  terminalClass: TerminalClass;
  adultCount: number;
  childCount: number;
  infantCount: number;
  greeterCount: number;
  vehicleCount: number;
  cargoTons: number | string;
  terminalFeeIdr: number | string;
  notes: string | null;
  recordedById: number;
  createdAt: string;
  updatedAt: string;
  visit?: {
    id: number;
    visitNumber: string;
    operatorId?: number;
    vessel?: {
      id: number;
      name: string;
      vesselCategory: string;
      registrationNumber: string;
    };
  };
  ferryRoute?: {
    id: number;
    destinationName: string;
    distanceMiles?: number;
  } | null;
}

export interface CreateVesselManifestPayload {
  portId: number;
  visitId: number;
  ferryRouteId?: number;
  terminalClass?: TerminalClass;
  adultCount: number;
  childCount?: number;
  infantCount?: number;
  greeterCount?: number;
  vehicleCount?: number;
  cargoTons?: number;
  notes?: string;
}
