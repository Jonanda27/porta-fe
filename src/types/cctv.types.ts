export type CctvZone = "ALL" | "DERMAGA" | "TERMINAL" | "LAUT";

export type CctvStatus = "ONLINE" | "DEGRADED" | "OFFLINE";

export interface CctvCameraItem {
  id: string;
  code: string;
  name: string;
  zone: Exclude<CctvZone, "ALL">;
  location: string;
  berthCode?: string;
  status: CctvStatus;
  resolution: string;
  fps: number;
  bitrateKbps: number;
  ptzSupported: boolean;
  nightVision: boolean;
  activeVessel?: string;
  ipAddress: string;
  protocol: string;
  videoSrc?: string;
  hlsUrl?: string;
  webrtcUrl?: string;
  posterSrc: string;
  offlineReason?: string;
}

export type CctvEventSeverity = "INFO" | "WARNING" | "ALERT";

export interface CctvEventItem {
  id: string;
  cameraId: string;
  cameraCode: string;
  berthCode?: string;
  title: string;
  detail: string;
  timestamp: string;
  severity: CctvEventSeverity;
}
