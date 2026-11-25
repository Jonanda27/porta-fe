export type MapBaseLayerId = "sat" | "map";

export type MapProjectionMode = "3d" | "2d";

export interface MapBaseLayerSpec {
  id: MapBaseLayerId;
  label: string;
  provider: string;
  url: string;
  referenceUrl?: string;
  attribution: string;
  maxZoom: number;
  subdomains?: string | string[];
}

export interface GisCoordinates {
  lat: number;
  lng: number;
}

export type AisScopeId = "poumako" | "papua" | "indonesia";

export interface AisScopeSpec {
  id: AisScopeId;
  label: string;
  boundingBoxes: [[[number, number], [number, number]]];
}

export type AisConnectionStatus = "connecting" | "connected" | "error" | "paused";

export type GisVesselCompliance = "REGISTERED" | "UNREGISTERED";

export interface AisVesselTelemetry {
  mmsi: string;
  shipName: string;
  lat: number;
  lng: number;
  cog: number;
  sog: number;
  heading: number;
  navStatus?: number;
  shipType?: number;
  destination?: string;
  imoNumber?: number;
  callSign?: string;
  lengthMeters?: number;
  beamMeters?: number;
  draughtMeters?: number;
  trail?: Array<[number, number]>;
  sailingRoute?: Array<[number, number]>;
  routeDurationMs?: number;
  updatedAt: string;
  isSimulated?: boolean;
  complianceStatus?: GisVesselCompliance;
  skrdNumber?: string;
}

export type MarineSafetyLevel = "AMAN" | "WASPADA" | "SIAGA";

export type VesselFilterMode = "ALL" | "MOVING" | "ANCHORED" | "UNREGISTERED";

export interface PoumakoMarineWeather {
  waveHeightMeters: number | null;
  wavePeriodSeconds: number | null;
  waveDirectionDeg: number | null;
  currentVelocityMs: number | null;
  windSpeedKnots: number | null;
  windDirectionDeg: number | null;
  visibilityMeters: number | null;
  safetyLevel: MarineSafetyLevel;
  fetchedAt: string;
}

export interface GisBerthPoint {
  id: number;
  code: string;
  name: string;
  authorityType: "PEMDA_DISHUB" | "UPP_KEMENHUB" | "TUKS_TERSUS";
  operationalStatus: "OPEN" | "MAINTENANCE" | "CLOSED";
  maxLengthMeters: number;
  currentVesselName?: string;
  lat: number;
  lng: number;
  bearingDeg?: number;
}

export interface GisAssetPoint {
  id: number;
  code: string;
  name: string;
  assetType: "KIOS" | "GUDANG" | "LAHAN";
  status: "AVAILABLE" | "LEASED" | "MAINTENANCE" | "ARREARS";
  tenantName?: string;
  areaSqm: number;
  annualRateIdr: number;
  lat: number;
  lng: number;
}

export type GisSelectedFeature =
  | { kind: "berth"; data: GisBerthPoint }
  | { kind: "asset"; data: GisAssetPoint }
  | { kind: "vessel"; data: AisVesselTelemetry };

export interface GisFlyToTarget {
  lat: number;
  lng: number;
  zoom?: number;
  signal: number;
}
