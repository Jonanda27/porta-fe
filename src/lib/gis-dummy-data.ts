import { POUMAKO_DEFAULT_CENTER } from "@/lib/gis-layers";
import {
  AisVesselTelemetry,
  GisAssetPoint,
  GisBerthPoint,
} from "@/types/gis.types";

export const DUMMY_POUMAKO_BERTHS: GisBerthPoint[] = [
  {
    id: 1,
    code: "DRM-PEMDA-01",
    name: "Dermaga Beton Nusantara Pemda",
    authorityType: "PEMDA_DISHUB",
    operationalStatus: "OPEN",
    maxLengthMeters: 120,
    currentVesselName: "KM Mimika PACE (500 GT)",
    lat: -4.8041,
    lng: 136.7685,
    bearingDeg: 25,
  },
  {
    id: 2,
    code: "TLD-PEMDA-01",
    name: "Tambatan Talud Cenderawasih",
    authorityType: "PEMDA_DISHUB",
    operationalStatus: "OPEN",
    maxLengthMeters: 80,
    currentVesselName: "KM Carstensz Express",
    lat: -4.7979,
    lng: 136.7724,
    bearingDeg: 128,
  },
  {
    id: 3,
    code: "DRM-UPP-01",
    name: "Dermaga Penumpang UPP Kemenhub",
    authorityType: "UPP_KEMENHUB",
    operationalStatus: "MAINTENANCE",
    maxLengthMeters: 100,
    lat: -4.8027,
    lng: 136.7691,
    bearingDeg: 25,
  },
];

export const DUMMY_POUMAKO_ASSETS: GisAssetPoint[] = [
  {
    id: 101,
    code: "AST-KIOS-01",
    name: "Kios Kuliner & Tiket Blok A",
    assetType: "KIOS",
    status: "LEASED",
    tenantName: "UD Papua Mandiri",
    areaSqm: 24,
    annualRateIdr: 18000000,
    lat: -4.8018,
    lng: 136.7721,
  },
  {
    id: 102,
    code: "AST-GDG-01",
    name: "Gudang Logistik Pelabuhan 01",
    assetType: "GUDANG",
    status: "LEASED",
    tenantName: "PT Mimika Logistik",
    areaSqm: 250,
    annualRateIdr: 95000000,
    lat: -4.8006,
    lng: 136.7728,
  },
  {
    id: 103,
    code: "AST-LHN-02",
    name: "Lahan Penumpukan Kontainer Timur",
    assetType: "LAHAN",
    status: "AVAILABLE",
    areaSqm: 600,
    annualRateIdr: 120000000,
    lat: -4.8041,
    lng: 136.7734,
  },
  {
    id: 104,
    code: "AST-KIOS-04",
    name: "Kios Perbekalan Kapal Blok B",
    assetType: "KIOS",
    status: "ARREARS",
    tenantName: "CV Cenderawasih",
    areaSqm: 30,
    annualRateIdr: 22500000,
    lat: -4.8029,
    lng: 136.7726,
  },
];

export const DUMMY_POUMAKO_VESSELS: AisVesselTelemetry[] = [
  {
    mmsi: "525019281",
    shipName: "KM MIMIKA PACE",
    lat: -4.8025,
    lng: 136.7699,
    cog: 15,
    sog: 0.1,
    heading: 15,
    destination: "POUMAKO TIMIKA",
    imoNumber: 9412810,
    callSign: "YDQP2",
    lengthMeters: 54,
    beamMeters: 11,
    draughtMeters: 3.4,
    trail: [
      [136.7706, -4.8072],
      [136.7701, -4.8052],
      [136.7695, -4.8037],
      [136.7693, -4.8027],
    ],
    sailingRoute: [
      [136.7706, -4.8072],
      [136.7701, -4.8052],
      [136.7695, -4.8037],
      [136.7693, -4.8027],
    ],
    routeDurationMs: 22000,
    updatedAt: new Date().toISOString(),
    isSimulated: true,
    complianceStatus: "REGISTERED",
    skrdNumber: "SKRD-PMK-2026-0014",
  },
  {
    mmsi: "525024110",
    shipName: "KM CARSTENSZ EXPRESS",
    lat: -4.8039,
    lng: 136.7708,
    cog: 20,
    sog: 0.0,
    heading: 20,
    destination: "POUMAKO TIMIKA",
    imoNumber: 9583104,
    callSign: "YDCR8",
    lengthMeters: 48,
    beamMeters: 10,
    draughtMeters: 2.9,
    trail: [
      [136.7712, -4.8022],
      [136.7718, -4.8002],
      [136.7723, -4.7988],
      [136.7724, -4.7982],
    ],
    sailingRoute: [
      [136.7712, -4.8022],
      [136.7718, -4.8002],
      [136.7723, -4.7988],
      [136.7724, -4.7982],
    ],
    routeDurationMs: 26000,
    updatedAt: new Date().toISOString(),
    isSimulated: true,
    complianceStatus: "REGISTERED",
    skrdNumber: "SKRD-PMK-2026-0019",
  },
  {
    mmsi: "525088312",
    shipName: "TB ARAFURA JAYA 03",
    lat: -4.8085,
    lng: 136.7685,
    cog: 12,
    sog: 6.4,
    heading: 12,
    destination: "POUMAKO PORT",
    callSign: "POAF3",
    lengthMeters: 29,
    beamMeters: 8,
    draughtMeters: 3.1,
    trail: [
      [136.7702, -4.8145],
      [136.7698, -4.8112],
      [136.7693, -4.8078],
      [136.769, -4.8052],
      [136.7688, -4.8042],
    ],
    sailingRoute: [
      [136.7702, -4.8145],
      [136.7698, -4.8112],
      [136.7693, -4.8078],
      [136.769, -4.8052],
      [136.7688, -4.8042],
    ],
    routeDurationMs: 24000,
    updatedAt: new Date().toISOString(),
    isSimulated: true,
    complianceStatus: "REGISTERED",
    skrdNumber: "EST-1-1795486851254-33EC",
  },
  {
    mmsi: "525991044",
    shipName: "KM SINAR TIMIKA (TANPA IZIN)",
    lat: -4.8062,
    lng: 136.7694,
    cog: 350,
    sog: 0.3,
    heading: 350,
    destination: "TIMIKA ANCHORAGE",
    imoNumber: 8914420,
    callSign: "YDST4",
    lengthMeters: 62,
    beamMeters: 12,
    draughtMeters: 4.1,
    trail: [
      [136.7699, -4.8095],
      [136.7697, -4.8078],
      [136.7694, -4.8062],
    ],
    updatedAt: new Date().toISOString(),
    isSimulated: true,
    complianceStatus: "UNREGISTERED",
  },
  {
    mmsi: "525041209",
    shipName: "LCT PAPUA PERMAI",
    lat: -4.8134,
    lng: 136.7672,
    cog: 192,
    sog: 8.2,
    heading: 192,
    destination: "ASMAT",
    callSign: "YDPP9",
    lengthMeters: 45,
    beamMeters: 12,
    draughtMeters: 2.4,
    trail: [
      [136.769, -4.8055],
      [136.7694, -4.8085],
      [136.7699, -4.8118],
      [136.7705, -4.815],
    ],
    sailingRoute: [
      [136.769, -4.8055],
      [136.7694, -4.8085],
      [136.7699, -4.8118],
      [136.7705, -4.815],
    ],
    routeDurationMs: 20000,
    updatedAt: new Date().toISOString(),
    isSimulated: true,
    complianceStatus: "REGISTERED",
    skrdNumber: "SKRD-PMK-2026-0011",
  },
];

/**
 * Menghasilkan GeoJSON Polygon lingkaran geofence zona wajib retribusi labuh Pelabuhan Poumako.
 */
export function buildPoumakoGeofenceGeoJson(radiusKm = 1.852): {
  type: "FeatureCollection";
  features: Array<{
    type: "Feature";
    properties: { name: string };
    geometry: {
      type: "Polygon";
      coordinates: [number, number][][];
    };
  }>;
} {
  const steps = 64;
  const coords: [number, number][] = [];
  const { lat, lng } = POUMAKO_DEFAULT_CENTER;
  const earthRadiusKm = 6371;

  for (let i = 0; i <= steps; i++) {
    const angle = (i * 2 * Math.PI) / steps;
    const dLat = (radiusKm / earthRadiusKm) * (180 / Math.PI) * Math.sin(angle);
    const dLng =
      ((radiusKm / earthRadiusKm) * (180 / Math.PI) * Math.cos(angle)) /
      Math.cos((lat * Math.PI) / 180);
    coords.push([lng + dLng, lat + dLat]);
  }

  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {
          name: "Zona Wajib Retribusi Labuh Pelabuhan Poumako (1 NM)",
        },
        geometry: {
          type: "Polygon",
          coordinates: [coords],
        },
      },
    ],
  };
}
