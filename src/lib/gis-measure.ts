import { GisCoordinates } from "@/types/gis.types";

interface RainViewerWeatherMapsResponse {
  host?: string;
  radar?: {
    past?: Array<{ time: number; path: string }>;
  };
}

export interface RainViewerFrameInfo {
  tileUrl: string;
  frameTime: number;
}

/**
 * Mengambil info tile & timestamp radar hujan terbaru dari RainViewer API (gratis, tanpa API key).
 */
export async function fetchLatestRainViewerInfo(): Promise<RainViewerFrameInfo | null> {
  try {
    const res = await fetch("https://api.rainviewer.com/public/weather-maps.json", {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = (await res.json()) as RainViewerWeatherMapsResponse;
    const past = json.radar?.past;
    if (!json.host || !past || past.length === 0) return null;
    const latest = past[past.length - 1];
    return {
      tileUrl: `${json.host}${latest.path}/256/{z}/{x}/{y}/2/1_1.png`,
      frameTime: latest.time,
    };
  } catch {
    return null;
  }
}

/**
 * Mengambil URL tile radar hujan terbaru dari RainViewer API (gratis, tanpa API key).
 */
export async function fetchLatestRainViewerTileUrl(): Promise<string | null> {
  const info = await fetchLatestRainViewerInfo();
  return info ? info.tileUrl : null;
}

/**
 * Menghitung jarak Haversine antara dua koordinat dalam meter.
 */
export function haversineDistanceMeters(
  a: GisCoordinates,
  b: GisCoordinates
): number {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h =
    sinLat * sinLat +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sinLng * sinLng;
  return 2 * R * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export function calculateRouteDistance(points: GisCoordinates[]): {
  meters: number;
  nauticalMiles: number;
} {
  if (points.length < 2) {
    return { meters: 0, nauticalMiles: 0 };
  }
  let totalMeters = 0;
  for (let i = 1; i < points.length; i++) {
    totalMeters += haversineDistanceMeters(points[i - 1], points[i]);
  }
  return {
    meters: totalMeters,
    nauticalMiles: totalMeters / 1852,
  };
}
