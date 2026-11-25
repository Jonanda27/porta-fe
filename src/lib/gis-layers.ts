import {
  AisScopeId,
  AisScopeSpec,
  GisCoordinates,
  MapBaseLayerSpec,
} from "@/types/gis.types";

/**
 * Titik koordinat default Pelabuhan Umum Poumako, Kabupaten Mimika, Papua Tengah.
 */
export const POUMAKO_DEFAULT_CENTER: GisCoordinates = {
  lat: -4.8027,
  lng: 136.7709,
};

export const POUMAKO_DEFAULT_ZOOM = 15;

export const GIS_BASE_LAYERS: MapBaseLayerSpec[] = [
  {
    id: "sat",
    label: "SAT",
    provider: "Google Maps Satellite",
    url: "https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
    attribution: "&copy; Google Maps",
    maxZoom: 20,
  },
  {
    id: "map",
    label: "MAP",
    provider: "Esri Dark Gray Canvas",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
    referenceUrl:
      "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri &mdash; Esri, HERE, Garmin, OpenStreetMap contributors",
    maxZoom: 16,
  },
];

export const OPEN_SEAMAP_OVERLAY = {
  url: "https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png",
  attribution: "&copy; OpenSeaMap contributors",
  maxZoom: 18,
} as const;

export const MARITIME_LANES_GEOJSON_URL = "/data/shipping-lanes.geojson";

export function resolveMapLibreTileUrls(spec: MapBaseLayerSpec): string[] {
  if (!spec.subdomains || !spec.url.includes("{s}")) {
    return [spec.url];
  }
  const subs = Array.isArray(spec.subdomains)
    ? spec.subdomains
    : spec.subdomains.split("");
  return subs.map((s) => spec.url.replace("{s}", s));
}

export const AIS_SCOPES: Record<AisScopeId, AisScopeSpec> = {
  poumako: {
    id: "poumako",
    label: "Poumako & Arafura",
    boundingBoxes: [[[-6.8, 134.5], [-3.5, 139.0]]],
  },
  papua: {
    id: "papua",
    label: "Papua & Maluku",
    boundingBoxes: [[[-9.0, 128.0], [1.5, 141.5]]],
  },
  indonesia: {
    id: "indonesia",
    label: "Nusantara",
    boundingBoxes: [[[-11.5, 94.5], [6.5, 141.5]]],
  },
};
