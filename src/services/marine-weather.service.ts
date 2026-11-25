import { POUMAKO_DEFAULT_CENTER } from "@/lib/gis-layers";
import { MarineSafetyLevel, PoumakoMarineWeather } from "@/types/gis.types";

interface OpenMeteoMarineResponse {
  current?: {
    wave_height?: number;
    wave_direction?: number;
    wave_period?: number;
    ocean_current_velocity?: number;
  };
}

interface OpenMeteoForecastResponse {
  current?: {
    wind_speed_10m?: number;
    wind_direction_10m?: number;
    visibility?: number;
  };
}

function resolveSafetyLevel(
  waveHeight: number | null,
  windSpeedKn: number | null
): MarineSafetyLevel {
  if ((waveHeight !== null && waveHeight >= 2.0) || (windSpeedKn !== null && windSpeedKn >= 25)) {
    return "SIAGA";
  }
  if ((waveHeight !== null && waveHeight >= 1.2) || (windSpeedKn !== null && windSpeedKn >= 15)) {
    return "WASPADA";
  }
  return "AMAN";
}

/**
 * Mengambil kondisi cuaca maritim real-time di Pelabuhan Poumako dari Open-Meteo (tanpa API key).
 */
export async function fetchPoumakoMarineWeather(): Promise<PoumakoMarineWeather> {
  const { lat, lng } = POUMAKO_DEFAULT_CENTER;
  const marineUrl = `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lng}&current=wave_height,wave_direction,wave_period,ocean_current_velocity&timezone=Asia%2FJayapura`;
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=wind_speed_10m,wind_direction_10m,visibility&wind_speed_unit=kn&timezone=Asia%2FJayapura`;

  const [marineRes, weatherRes] = await Promise.all([
    fetch(marineUrl, { cache: "no-store" }),
    fetch(weatherUrl, { cache: "no-store" }),
  ]);

  if (!marineRes.ok && !weatherRes.ok) {
    throw new Error("Gagal mengambil data cuaca maritim Open-Meteo.");
  }

  const marineJson = marineRes.ok
    ? ((await marineRes.json()) as OpenMeteoMarineResponse)
    : {};
  const weatherJson = weatherRes.ok
    ? ((await weatherRes.json()) as OpenMeteoForecastResponse)
    : {};

  const waveHeightMeters =
    typeof marineJson.current?.wave_height === "number"
      ? marineJson.current.wave_height
      : null;
  const windSpeedKnots =
    typeof weatherJson.current?.wind_speed_10m === "number"
      ? weatherJson.current.wind_speed_10m
      : null;

  return {
    waveHeightMeters,
    wavePeriodSeconds:
      typeof marineJson.current?.wave_period === "number"
        ? marineJson.current.wave_period
        : null,
    waveDirectionDeg:
      typeof marineJson.current?.wave_direction === "number"
        ? marineJson.current.wave_direction
        : null,
    currentVelocityMs:
      typeof marineJson.current?.ocean_current_velocity === "number"
        ? marineJson.current.ocean_current_velocity
        : null,
    windSpeedKnots,
    windDirectionDeg:
      typeof weatherJson.current?.wind_direction_10m === "number"
        ? weatherJson.current.wind_direction_10m
        : null,
    visibilityMeters:
      typeof weatherJson.current?.visibility === "number"
        ? weatherJson.current.visibility
        : null,
    safetyLevel: resolveSafetyLevel(waveHeightMeters, windSpeedKnots),
    fetchedAt: new Date().toISOString(),
  };
}
