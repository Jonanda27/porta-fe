"use client";

import React, { useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import type { StyleSpecification } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  GIS_BASE_LAYERS,
  MARITIME_LANES_GEOJSON_URL,
  OPEN_SEAMAP_OVERLAY,
  POUMAKO_DEFAULT_CENTER,
  POUMAKO_DEFAULT_ZOOM,
  resolveMapLibreTileUrls,
} from "@/lib/gis-layers";
import { buildPoumakoGeofenceGeoJson } from "@/lib/gis-dummy-data";
import { fetchLatestRainViewerInfo } from "@/lib/gis-measure";
import {
  AisVesselTelemetry,
  GisAssetPoint,
  GisBerthPoint,
  GisCoordinates,
  GisFlyToTarget,
  GisSelectedFeature,
  MapBaseLayerId,
  MapProjectionMode,
} from "@/types/gis.types";

export interface RainRadarStatus {
  state: "idle" | "loading" | "ready" | "error";
  frameTime?: number;
}

interface PoumakoGisMapProps {
  activeLayerId: MapBaseLayerId;
  projectionMode: MapProjectionMode;
  showSeamarkOverlay: boolean;
  showMaritimeLines: boolean;
  showRainRadar: boolean;
  showVesselTrails: boolean;
  showGeofence: boolean;
  isMeasureMode: boolean;
  measurePoints: GisCoordinates[];
  berths: GisBerthPoint[];
  assets: GisAssetPoint[];
  vessels: AisVesselTelemetry[];
  recenterSignal: number;
  globeViewSignal: number;
  zoomInSignal: number;
  zoomOutSignal: number;
  flyToTarget: GisFlyToTarget | null;
  onSelectFeature: (feature: GisSelectedFeature) => void;
  onAddMeasurePoint?: (coords: GisCoordinates) => void;
  onViewportChange?: (coords: GisCoordinates, zoom: number) => void;
  onRainRadarStatusChange?: (status: RainRadarStatus) => void;
}

function buildInitialStyle(
  initialLayerId: MapBaseLayerId,
  showSeamarkOverlay: boolean
): StyleSpecification {
  const sources: StyleSpecification["sources"] = {};
  const layers: StyleSpecification["layers"] = [];

  GIS_BASE_LAYERS.forEach((spec) => {
    const sourceId = `base-src-${spec.id}`;
    sources[sourceId] = {
      type: "raster",
      tiles: resolveMapLibreTileUrls(spec),
      tileSize: 256,
      maxzoom: spec.maxZoom,
      attribution: spec.attribution,
    };
    layers.push({
      id: `base-layer-${spec.id}`,
      type: "raster",
      source: sourceId,
      layout: {
        visibility: spec.id === initialLayerId ? "visible" : "none",
      },
    });

    if (spec.referenceUrl) {
      const refSourceId = `base-ref-src-${spec.id}`;
      sources[refSourceId] = {
        type: "raster",
        tiles: [spec.referenceUrl],
        tileSize: 256,
        maxzoom: spec.maxZoom,
      };
      layers.push({
        id: `base-ref-layer-${spec.id}`,
        type: "raster",
        source: refSourceId,
        layout: {
          visibility: spec.id === initialLayerId ? "visible" : "none",
        },
      });
    }
  });

  sources["seamark-src"] = {
    type: "raster",
    tiles: [OPEN_SEAMAP_OVERLAY.url],
    tileSize: 256,
    maxzoom: OPEN_SEAMAP_OVERLAY.maxZoom,
    attribution: OPEN_SEAMAP_OVERLAY.attribution,
  };
  layers.push({
    id: "seamark-layer",
    type: "raster",
    source: "seamark-src",
    layout: {
      visibility: showSeamarkOverlay ? "visible" : "none",
    },
  });

  return {
    version: 8,
    sources,
    layers,
  };
}

export function PoumakoGisMap({
  activeLayerId,
  projectionMode,
  showSeamarkOverlay,
  showMaritimeLines,
  showRainRadar,
  showVesselTrails,
  showGeofence,
  isMeasureMode,
  measurePoints,
  berths,
  assets,
  vessels,
  recenterSignal,
  globeViewSignal,
  zoomInSignal,
  zoomOutSignal,
  flyToTarget,
  onSelectFeature,
  onAddMeasurePoint,
  onViewportChange,
  onRainRadarStatusChange,
}: PoumakoGisMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const berthMarkersRef = useRef<Map<number, maplibregl.Marker>>(new Map());
  const assetMarkersRef = useRef<Map<number, maplibregl.Marker>>(new Map());
  const vesselMarkersRef = useRef<Map<string, maplibregl.Marker>>(new Map());
  const portBeaconMarkerRef = useRef<maplibregl.Marker | null>(null);
  const isStyleLoadedRef = useRef<boolean>(false);
  const rainRadarFrameTimeRef = useRef<number | undefined>(undefined);
  const onRainRadarStatusChangeRef = useRef(onRainRadarStatusChange);
  onRainRadarStatusChangeRef.current = onRainRadarStatusChange;
  const berthsRef = useRef<GisBerthPoint[]>(berths);
  berthsRef.current = berths;
  const onSelectFeatureRef = useRef(onSelectFeature);
  onSelectFeatureRef.current = onSelectFeature;
  const berthLayerListenersAttachedRef = useRef<boolean>(false);
  const isMeasureModeRef = useRef<boolean>(isMeasureMode);
  const onAddMeasurePointRef = useRef(onAddMeasurePoint);
  const [isMapReady, setIsMapReady] = useState<boolean>(false);
  const [currentZoom, setCurrentZoom] = useState<number>(POUMAKO_DEFAULT_ZOOM);

  useEffect(() => {
    isMeasureModeRef.current = isMeasureMode;
  }, [isMeasureMode]);

  useEffect(() => {
    onAddMeasurePointRef.current = onAddMeasurePoint;
  }, [onAddMeasurePoint]);

  // Inisialisasi MapLibre GL JS sekali saat mount
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    maplibregl.setWorkerUrl("/maplibre/maplibre-gl-worker.mjs");

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: buildInitialStyle(activeLayerId, showSeamarkOverlay),
      center: [POUMAKO_DEFAULT_CENTER.lng, POUMAKO_DEFAULT_CENTER.lat],
      zoom: POUMAKO_DEFAULT_ZOOM,
      pitch: projectionMode === "3d" ? 35 : 0,
      bearing: 0,
      attributionControl: false,
    });

    map.addControl(
      new maplibregl.AttributionControl({ compact: true }),
      "bottom-right"
    );

    map.on("style.load", () => {
      isStyleLoadedRef.current = true;
      map.setProjection({
        type: projectionMode === "3d" ? "globe" : "mercator",
      });

      // Layer Maritime Lines (jalur pelayaran global dari /data/shipping-lanes.geojson)
      if (!map.getSource("maritime-lanes")) {
        map.addSource("maritime-lanes", {
          type: "geojson",
          data: MARITIME_LANES_GEOJSON_URL,
        });
        map.addLayer({
          id: "maritime-lanes-layer",
          type: "line",
          source: "maritime-lanes",
          layout: {
            "line-cap": "round",
            "line-join": "round",
            visibility: showMaritimeLines ? "visible" : "none",
          },
          paint: {
            "line-color": "#38bdf8",
            "line-width": ["match", ["get", "Type"], "Major", 2, "Middle", 1.2, 0.7],
            "line-opacity": [
              "match",
              ["get", "Type"],
              "Major",
              0.75,
              "Middle",
              0.5,
              0.3,
            ],
          },
        });
      }

      // Tambah layer geofence zona wajib retribusi labuh Poumako (1 NM)
      if (!map.getSource("poumako-geofence")) {
        map.addSource("poumako-geofence", {
          type: "geojson",
          data: buildPoumakoGeofenceGeoJson(1.852),
        });
        map.addLayer({
          id: "poumako-geofence-fill",
          type: "fill",
          source: "poumako-geofence",
          paint: {
            "fill-color": "#10B981",
            "fill-opacity": 0.08,
          },
          layout: {
            visibility: showGeofence ? "visible" : "none",
          },
        });
        map.addLayer({
          id: "poumako-geofence-line",
          type: "line",
          source: "poumako-geofence",
          paint: {
            "line-color": "#34D399",
            "line-width": 2,
            "line-dasharray": [4, 3],
            "line-opacity": 0.75,
          },
          layout: {
            visibility: showGeofence ? "visible" : "none",
          },
        });
      }
    });

    const handleMoveOrZoom = () => {
      const center = map.getCenter();
      const nextZoom = Number(map.getZoom().toFixed(1));
      setCurrentZoom(nextZoom);
      onViewportChange?.({ lat: center.lat, lng: center.lng }, nextZoom);
    };

    map.on("moveend", handleMoveOrZoom);
    map.on("zoomend", handleMoveOrZoom);
    map.on("click", (e) => {
      if (isMeasureModeRef.current && onAddMeasurePointRef.current) {
        onAddMeasurePointRef.current({ lat: e.lngLat.lat, lng: e.lngLat.lng });
      }
    });
    mapRef.current = map;
    setIsMapReady(true);

    return () => {
      map.off("moveend", handleMoveOrZoom);
      map.off("zoomend", handleMoveOrZoom);
      portBeaconMarkerRef.current?.remove();
      portBeaconMarkerRef.current = null;
      berthMarkersRef.current.forEach((m) => m.remove());
      berthMarkersRef.current.clear();
      assetMarkersRef.current.forEach((m) => m.remove());
      assetMarkersRef.current.clear();
      vesselMarkersRef.current.forEach((m) => m.remove());
      vesselMarkersRef.current.clear();
      if (map.getLayer("poumako-berths-dash")) {
        map.removeLayer("poumako-berths-dash");
      }
      if (map.getLayer("poumako-berths-line")) {
        map.removeLayer("poumako-berths-line");
      }
      if (map.getLayer("poumako-berths-casing")) {
        map.removeLayer("poumako-berths-casing");
      }
      if (map.getSource("poumako-berths-src")) {
        map.removeSource("poumako-berths-src");
      }
      berthLayerListenersAttachedRef.current = false;
      if (map.getLayer("maritime-lanes-layer")) {
        map.removeLayer("maritime-lanes-layer");
      }
      if (map.getSource("maritime-lanes")) {
        map.removeSource("maritime-lanes");
      }
      map.remove();
      mapRef.current = null;
      isStyleLoadedRef.current = false;
      setIsMapReady(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Switch proyeksi 3D Globe <-> 2D Mercator
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isStyleLoadedRef.current) return;

    map.setProjection({
      type: projectionMode === "3d" ? "globe" : "mercator",
    });

    if (projectionMode === "3d") {
      map.easeTo({ pitch: map.getZoom() > 6 ? 40 : 15, duration: 600 });
    } else {
      map.easeTo({ pitch: 0, bearing: 0, duration: 500 });
    }
  }, [projectionMode]);

  // Switch base layer peta
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isStyleLoadedRef.current) return;

    GIS_BASE_LAYERS.forEach((spec) => {
      const visibility = spec.id === activeLayerId ? "visible" : "none";
      const layerId = `base-layer-${spec.id}`;
      if (map.getLayer(layerId)) {
        map.setLayoutProperty(layerId, "visibility", visibility);
      }
      const refLayerId = `base-ref-layer-${spec.id}`;
      if (map.getLayer(refLayerId)) {
        map.setLayoutProperty(refLayerId, "visibility", visibility);
      }
    });
  }, [activeLayerId]);

  // Toggle overlay rambu laut OpenSeaMap
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isStyleLoadedRef.current) return;

    if (map.getLayer("seamark-layer")) {
      map.setLayoutProperty(
        "seamark-layer",
        "visibility",
        showSeamarkOverlay ? "visible" : "none"
      );
    }
  }, [showSeamarkOverlay]);

  // Toggle layer Maritime Lines (jalur pelayaran cyan)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isStyleLoadedRef.current) return;

    if (map.getLayer("maritime-lanes-layer")) {
      map.setLayoutProperty(
        "maritime-lanes-layer",
        "visibility",
        showMaritimeLines ? "visible" : "none"
      );
    }
  }, [showMaritimeLines]);

  // Toggle layer Radar Hujan Real-Time (RainViewer)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isStyleLoadedRef.current || !isMapReady) return;

    if (!showRainRadar) {
      if (map.getLayer("rainviewer-layer")) {
        map.setLayoutProperty("rainviewer-layer", "visibility", "none");
      }
      onRainRadarStatusChangeRef.current?.({ state: "idle" });
      return;
    }

    let cancelled = false;
    (async () => {
      if (map.getLayer("rainviewer-layer")) {
        map.setLayoutProperty("rainviewer-layer", "visibility", "visible");
        onRainRadarStatusChangeRef.current?.({
          state: "ready",
          frameTime: rainRadarFrameTimeRef.current,
        });
        return;
      }

      onRainRadarStatusChangeRef.current?.({ state: "loading" });
      const info = await fetchLatestRainViewerInfo();
      if (cancelled || !mapRef.current) return;

      if (!info) {
        onRainRadarStatusChangeRef.current?.({ state: "error" });
        return;
      }

      rainRadarFrameTimeRef.current = info.frameTime;

      if (!map.getSource("rainviewer-src")) {
        map.addSource("rainviewer-src", {
          type: "raster",
          tiles: [info.tileUrl],
          tileSize: 256,
          maxzoom: 7,
        });
      }
      if (!map.getLayer("rainviewer-layer")) {
        map.addLayer(
          {
            id: "rainviewer-layer",
            type: "raster",
            source: "rainviewer-src",
            paint: {
              "raster-opacity": 0.6,
            },
          },
          map.getLayer("maritime-lanes-layer") ? "maritime-lanes-layer" : undefined
        );
      }
      onRainRadarStatusChangeRef.current?.({
        state: "ready",
        frameTime: info.frameTime,
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [showRainRadar, isMapReady]);

  // Sinkronisasi garis & titik Alat Ukur Jarak Nautika
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isStyleLoadedRef.current || !isMapReady) return;

    map.getCanvas().style.cursor = isMeasureMode ? "crosshair" : "";

    const lineGeoJson: Parameters<maplibregl.GeoJSONSource["setData"]>[0] = {
      type: "FeatureCollection",
      features:
        measurePoints.length >= 2
          ? [
              {
                type: "Feature",
                properties: {},
                geometry: {
                  type: "LineString",
                  coordinates: measurePoints.map((p) => [p.lng, p.lat]),
                },
              },
            ]
          : [],
    };

    const pointsGeoJson: Parameters<maplibregl.GeoJSONSource["setData"]>[0] = {
      type: "FeatureCollection",
      features: measurePoints.map((p, index) => ({
        type: "Feature",
        properties: { index: index + 1 },
        geometry: {
          type: "Point",
          coordinates: [p.lng, p.lat],
        },
      })),
    };

    const existingLine = map.getSource("measure-line-src") as
      | maplibregl.GeoJSONSource
      | undefined;
    if (existingLine) {
      existingLine.setData(lineGeoJson);
    } else {
      map.addSource("measure-line-src", {
        type: "geojson",
        data: lineGeoJson,
      });
      map.addLayer({
        id: "measure-line-layer",
        type: "line",
        source: "measure-line-src",
        paint: {
          "line-color": "#F59E0B",
          "line-width": 2.5,
          "line-dasharray": [3, 2],
        },
      });
    }

    const existingPoints = map.getSource("measure-points-src") as
      | maplibregl.GeoJSONSource
      | undefined;
    if (existingPoints) {
      existingPoints.setData(pointsGeoJson);
    } else {
      map.addSource("measure-points-src", {
        type: "geojson",
        data: pointsGeoJson,
      });
      map.addLayer({
        id: "measure-points-layer",
        type: "circle",
        source: "measure-points-src",
        paint: {
          "circle-radius": 5,
          "circle-color": "#F59E0B",
          "circle-stroke-width": 2,
          "circle-stroke-color": "#0B241E",
        },
      });
    }
  }, [measurePoints, isMeasureMode, isMapReady]);

  // Sinkronisasi Jejak Lintasan Kapal (Vessel Breadcrumb Trail)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isStyleLoadedRef.current || !isMapReady) return;

    const trailsVisible = showVesselTrails && currentZoom >= 10;
    const trailsGeoJson: Parameters<maplibregl.GeoJSONSource["setData"]>[0] = {
      type: "FeatureCollection",
      features: trailsVisible
        ? vessels
            .filter((v) => v.trail && v.trail.length >= 2)
            .map((v) => ({
              type: "Feature",
              properties: {
                mmsi: v.mmsi,
                unregistered: v.complianceStatus === "UNREGISTERED" ? 1 : 0,
              },
              geometry: {
                type: "LineString",
                coordinates: v.trail as Array<[number, number]>,
              },
            }))
        : [],
    };

    const existing = map.getSource("vessel-trails-src") as
      | maplibregl.GeoJSONSource
      | undefined;
    if (existing) {
      existing.setData(trailsGeoJson);
    } else {
      map.addSource("vessel-trails-src", {
        type: "geojson",
        data: trailsGeoJson,
      });
      map.addLayer({
        id: "vessel-trails-layer",
        type: "line",
        source: "vessel-trails-src",
        paint: {
          "line-color": [
            "case",
            ["==", ["get", "unregistered"], 1],
            "#F43F5E",
            "#10B981",
          ],
          "line-width": 1.8,
          "line-dasharray": [2, 2],
          "line-opacity": 0.75,
        },
      });
    }
  }, [vessels, showVesselTrails, currentZoom, isMapReady]);

  // Toggle geofence zona wajib retribusi labuh (tampil hanya saat zoom >= 11)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isStyleLoadedRef.current) return;

    const vis = showGeofence && currentZoom >= 11 ? "visible" : "none";
    if (map.getLayer("poumako-geofence-fill")) {
      map.setLayoutProperty("poumako-geofence-fill", "visibility", vis);
    }
    if (map.getLayer("poumako-geofence-line")) {
      map.setLayoutProperty("poumako-geofence-line", "visibility", vis);
    }
  }, [showGeofence, currentZoom]);

  // Zoom-Adaptive Port Beacon: sembunyi saat zoom dekat (>= 13.5), tampil minimalis saat zoom jauh
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isMapReady) return;

    portBeaconMarkerRef.current?.remove();
    portBeaconMarkerRef.current = null;

    if (currentZoom >= 13.5) return;

    const beaconEl = document.createElement("div");
    beaconEl.style.cursor = "pointer";
    beaconEl.title = "Klik untuk fokus ke Pelabuhan Poumako";
    beaconEl.innerHTML = `
      <div style="display:flex;align-items:center;gap:6px;white-space:nowrap;">
        <span style="position:relative;width:14px;height:14px;display:inline-flex;align-items:center;justify-content:center;">
          <span style="position:absolute;inset:0;border-radius:9999px;border:1.5px solid rgba(245,158,11,0.75);box-shadow:0 0 10px rgba(245,158,11,0.55);"></span>
          <span style="width:6px;height:6px;border-radius:9999px;background:#F59E0B;box-shadow:0 0 6px #F59E0B;"></span>
        </span>
        <span style="color:#F59E0B;font-size:10px;font-weight:800;font-family:monospace;letter-spacing:0.16em;text-shadow:0 1px 4px rgba(0,0,0,0.95),0 0 2px #061612;">
          POUMAKO
        </span>
      </div>
    `;
    beaconEl.addEventListener("click", (e) => {
      e.stopPropagation();
      map.flyTo({
        center: [POUMAKO_DEFAULT_CENTER.lng, POUMAKO_DEFAULT_CENTER.lat],
        zoom: POUMAKO_DEFAULT_ZOOM,
        pitch: map.getProjection()?.type === "globe" ? 38 : 0,
        duration: 900,
      });
    });

    portBeaconMarkerRef.current = new maplibregl.Marker({
      element: beaconEl,
      anchor: "center",
    })
      .setLngLat([POUMAKO_DEFAULT_CENTER.lng, POUMAKO_DEFAULT_CENTER.lat])
      .addTo(map);
  }, [isMapReady, currentZoom]);

  // Sinkronisasi Garis Struktur Dermaga Poumako + label teks tipis tanpa card
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isMapReady || !isStyleLoadedRef.current) return;

    const getBerthColor = (berth: GisBerthPoint) =>
      berth.operationalStatus === "MAINTENANCE"
        ? "#F59E0B"
        : berth.authorityType === "PEMDA_DISHUB"
          ? "#10B981"
          : "#38BDF8";

    const geojson: Parameters<maplibregl.GeoJSONSource["setData"]>[0] = {
      type: "FeatureCollection",
      features: berths.map((berth) => {
        const bearingRad = ((berth.bearingDeg ?? 25) * Math.PI) / 180;
        const halfMeters = Math.min(Math.max(berth.maxLengthMeters || 80, 55), 95) / 2;
        const dLat = (halfMeters * Math.cos(bearingRad)) / 111320;
        const dLng =
          (halfMeters * Math.sin(bearingRad)) /
          (111320 * Math.cos((berth.lat * Math.PI) / 180));
        return {
          type: "Feature",
          properties: {
            berthId: berth.id,
            code: berth.code,
            color: getBerthColor(berth),
          },
          geometry: {
            type: "LineString",
            coordinates: [
              [berth.lng - dLng, berth.lat - dLat],
              [berth.lng + dLng, berth.lat + dLat],
            ],
          },
        };
      }),
    };

    const existingSrc = map.getSource("poumako-berths-src") as
      | maplibregl.GeoJSONSource
      | undefined;
    if (existingSrc) {
      existingSrc.setData(geojson);
    } else {
      map.addSource("poumako-berths-src", {
        type: "geojson",
        data: geojson,
      });

      const beforeLayerId = map.getLayer("poumako-geofence-line")
        ? "poumako-geofence-line"
        : undefined;

      map.addLayer(
        {
          id: "poumako-berths-casing",
          type: "line",
          source: "poumako-berths-src",
          layout: {
            "line-cap": "butt",
            "line-join": "round",
          },
          paint: {
            "line-color": "#061612",
            "line-width": ["interpolate", ["linear"], ["zoom"], 11, 5, 15, 11],
            "line-opacity": 0.92,
          },
        },
        beforeLayerId
      );

      map.addLayer(
        {
          id: "poumako-berths-line",
          type: "line",
          source: "poumako-berths-src",
          layout: {
            "line-cap": "butt",
            "line-join": "round",
          },
          paint: {
            "line-color": ["get", "color"],
            "line-width": ["interpolate", ["linear"], ["zoom"], 11, 2.5, 15, 5.5],
            "line-opacity": 0.95,
          },
        },
        beforeLayerId
      );

      map.addLayer(
        {
          id: "poumako-berths-dash",
          type: "line",
          source: "poumako-berths-src",
          layout: {
            "line-cap": "butt",
          },
          paint: {
            "line-color": "#FFFFFF",
            "line-width": 1.5,
            "line-dasharray": [2, 3],
            "line-opacity": 0.7,
          },
        },
        beforeLayerId
      );
    }

    if (!berthLayerListenersAttachedRef.current) {
      berthLayerListenersAttachedRef.current = true;
      const handleBerthClick = (e: maplibregl.MapLayerMouseEvent) => {
        const clickedId = e.features?.[0]?.properties?.berthId;
        const found = berthsRef.current.find((b) => b.id === Number(clickedId));
        if (found) {
          onSelectFeatureRef.current({ kind: "berth", data: found });
        }
      };
      const handleBerthEnter = () => {
        map.getCanvas().style.cursor = "pointer";
      };
      const handleBerthLeave = () => {
        map.getCanvas().style.cursor = isMeasureModeRef.current ? "crosshair" : "";
      };
      map.on("click", "poumako-berths-casing", handleBerthClick);
      map.on("mouseenter", "poumako-berths-casing", handleBerthEnter);
      map.on("mouseleave", "poumako-berths-casing", handleBerthLeave);
    }

    const vis = currentZoom >= 11 && berths.length > 0 ? "visible" : "none";
    ["poumako-berths-casing", "poumako-berths-line", "poumako-berths-dash"].forEach(
      (layerId) => {
        if (map.getLayer(layerId)) {
          map.setLayoutProperty(layerId, "visibility", vis);
        }
      }
    );

    // Label teks tipis tanpa kotak card (tampil saat zoom >= 13.8)
    berthMarkersRef.current.forEach((m) => m.remove());
    berthMarkersRef.current.clear();

    if (currentZoom < 13.8) return;

    berths.forEach((berth) => {
      const badgeColor = getBerthColor(berth);
      const el = document.createElement("div");
      el.style.cursor = "pointer";
      el.title = `${berth.code} — ${berth.name}`;
      el.innerHTML = `
        <div style="display:flex;align-items:center;gap:4px;color:#F8FAFC;font-size:10px;font-weight:800;font-family:monospace;letter-spacing:0.03em;white-space:nowrap;text-shadow:0 1px 4px rgba(0,0,0,0.95),0 0 2px #061612;">
          <span style="width:5px;height:5px;border-radius:9999px;background:${badgeColor};box-shadow:0 0 6px ${badgeColor};display:inline-block;"></span>
          <span>${berth.code}</span>
        </div>
      `;
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        onSelectFeatureRef.current({ kind: "berth", data: berth });
      });

      const marker = new maplibregl.Marker({
        element: el,
        anchor: "left",
        offset: [10, 0],
      })
        .setLngLat([berth.lng, berth.lat])
        .addTo(map);
      berthMarkersRef.current.set(berth.id, marker);
    });
  }, [berths, isMapReady, currentZoom]);

  // Sinkronisasi marker Aset, Kios & Lahan Sewa (LOD: tampil saat zoom >= 12)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isMapReady) return;

    assetMarkersRef.current.forEach((m) => m.remove());
    assetMarkersRef.current.clear();

    if (currentZoom < 12) return;

    assets.forEach((asset) => {
      const color =
        asset.status === "ARREARS"
          ? "#F43F5E"
          : asset.status === "AVAILABLE"
            ? "#10B981"
            : asset.status === "MAINTENANCE"
              ? "#F59E0B"
              : "#60A5FA";

      const el = document.createElement("div");
      el.style.cursor = "pointer";
      el.innerHTML = `
        <div style="width:14px;height:14px;border-radius:4px;background:${color};border:2px solid #FFFFFF;box-shadow:0 2px 8px rgba(0,0,0,0.45);" title="${asset.name}"></div>
      `;
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        onSelectFeature({ kind: "asset", data: asset });
      });

      const marker = new maplibregl.Marker({ element: el, anchor: "center" })
        .setLngLat([asset.lng, asset.lat])
        .addTo(map);
      assetMarkersRef.current.set(asset.id, marker);
    });
  }, [assets, onSelectFeature, isMapReady, currentZoom]);

  // Sinkronisasi marker kapal AIS (LOD: glowing dot saat zoom < 10, panah kapal saat zoom >= 10)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isMapReady) return;

    const isDetailedMode = currentZoom >= 10;

    // Reset marker ketika mode LOD berubah (dot <-> arrow) agar ikon ter-render ulang bersih
    vesselMarkersRef.current.forEach((marker) => marker.remove());
    vesselMarkersRef.current.clear();

    vessels.forEach((vessel) => {
      // Pada mode globe jauh (< 10), sembunyikan kapal simulasi lokal agar tidak menumpuk di bawah pin Poumako
      if (!isDetailedMode && vessel.isSimulated) return;

      const isUnregistered = vessel.complianceStatus === "UNREGISTERED";
      const color = isUnregistered
        ? "#F43F5E"
        : vessel.sog > 0.5
          ? "#10B981"
          : "#FBBF24";
      const rotation = Number.isFinite(vessel.heading) ? vessel.heading : vessel.cog;

      const el = document.createElement("div");
      el.style.cursor = "pointer";
      el.title = vessel.shipName;
      el.innerHTML = isDetailedMode
        ? `
          <div style="position:relative;display:flex;align-items:center;justify-content:center;">
            ${
              isUnregistered
                ? `<span style="position:absolute;width:28px;height:28px;border-radius:9999px;border:2px solid #F43F5E;opacity:0.75;animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></span>`
                : ""
            }
            <svg width="20" height="20" viewBox="0 0 24 24" fill="${color}" stroke="#061612" stroke-width="1.8" style="filter:drop-shadow(0 2px 4px rgba(0,0,0,0.55));">
              <path d="M12 2L19 20L12 16L5 20L12 2Z" />
            </svg>
          </div>
        `
        : `<div style="width:8px;height:8px;border-radius:9999px;background:${color};box-shadow:0 0 8px ${color};border:1px solid rgba(6,22,18,0.8);"></div>`;

      el.addEventListener("click", (e) => {
        e.stopPropagation();
        onSelectFeature({ kind: "vessel", data: vessel });
      });

      const marker = new maplibregl.Marker({
        element: el,
        rotation: isDetailedMode ? rotation : 0,
        rotationAlignment: isDetailedMode ? "map" : "viewport",
        pitchAlignment: isDetailedMode ? "map" : "viewport",
      })
        .setLngLat([vessel.lng, vessel.lat])
        .addTo(map);

      vesselMarkersRef.current.set(vessel.mmsi, marker);
    });

    // Animasi halus kapal simulasi berlayar menuju dermaga / alur sungai (60fps tanpa re-render React)
    const animatedVessels = vessels.filter(
      (v) => isDetailedMode && v.sailingRoute && v.sailingRoute.length >= 2
    );
    if (animatedVessels.length === 0) return;

    const interpolateRoute = (
      route: Array<[number, number]>,
      progress: number
    ): { lng: number; lat: number; bearing: number } => {
      const segments: Array<{
        start: [number, number];
        end: [number, number];
        len: number;
      }> = [];
      let totalLen = 0;
      for (let i = 0; i < route.length - 1; i++) {
        const dx = route[i + 1][0] - route[i][0];
        const dy = route[i + 1][1] - route[i][1];
        const len = Math.hypot(dx, dy);
        segments.push({ start: route[i], end: route[i + 1], len });
        totalLen += len;
      }
      if (totalLen === 0) {
        return { lng: route[0][0], lat: route[0][1], bearing: 0 };
      }

      const targetDist = Math.min(Math.max(progress, 0), 1) * totalLen;
      let acc = 0;
      for (const seg of segments) {
        if (acc + seg.len >= targetDist || seg === segments[segments.length - 1]) {
          const localT = seg.len > 0 ? (targetDist - acc) / seg.len : 1;
          const lng = seg.start[0] + (seg.end[0] - seg.start[0]) * localT;
          const lat = seg.start[1] + (seg.end[1] - seg.start[1]) * localT;
          const dx = seg.end[0] - seg.start[0];
          const dy = seg.end[1] - seg.start[1];
          const bearing = ((Math.atan2(dx, dy) * 180) / Math.PI + 360) % 360;
          return { lng, lat, bearing };
        }
        acc += seg.len;
      }
      return { lng: route[0][0], lat: route[0][1], bearing: 0 };
    };

    let rafId = 0;
    const startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startTime;
      animatedVessels.forEach((vessel, idx) => {
        const marker = vesselMarkersRef.current.get(vessel.mmsi);
        const route = vessel.sailingRoute;
        if (!marker || !route || route.length < 2) return;

        const duration = vessel.routeDurationMs ?? 24000;
        const phaseOffset = idx * 0.23;
        const rawCycle = ((elapsed / duration + phaseOffset) % 1 + 1) % 1;
        // 0..0.82 berlayar mendekati dermaga (dengan perlambatan halus), 0.82..1.0 sandar sebentar
        const sailProgress =
          rawCycle < 0.82
            ? 1 - Math.pow(1 - rawCycle / 0.82, 1.35)
            : 1;

        const pos = interpolateRoute(route, sailProgress);
        marker.setLngLat([pos.lng, pos.lat]);
        marker.setRotation(pos.bearing);
      });
      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [vessels, onSelectFeature, isMapReady, currentZoom]);

  // Fokus kembali ke Pelabuhan Poumako
  useEffect(() => {
    if (recenterSignal === 0 || !mapRef.current) return;
    mapRef.current.flyTo({
      center: [POUMAKO_DEFAULT_CENTER.lng, POUMAKO_DEFAULT_CENTER.lat],
      zoom: POUMAKO_DEFAULT_ZOOM,
      pitch: projectionMode === "3d" ? 38 : 0,
      bearing: 0,
      duration: 900,
    });
  }, [recenterSignal, projectionMode]);

  // Zoom keluar ke tampilan Globe 3D penuh
  useEffect(() => {
    if (globeViewSignal === 0 || !mapRef.current) return;
    mapRef.current.flyTo({
      center: [POUMAKO_DEFAULT_CENTER.lng, POUMAKO_DEFAULT_CENTER.lat],
      zoom: 2.3,
      pitch: 0,
      bearing: 0,
      duration: 1000,
    });
  }, [globeViewSignal]);

  // FlyTo ke objek terpilih dari pencarian atau badge anomali
  useEffect(() => {
    if (!flyToTarget || flyToTarget.signal === 0 || !mapRef.current) return;
    mapRef.current.flyTo({
      center: [flyToTarget.lng, flyToTarget.lat],
      zoom: flyToTarget.zoom ?? 16.5,
      pitch: projectionMode === "3d" ? 45 : 0,
      duration: 850,
    });
  }, [flyToTarget, projectionMode]);

  // Kontrol zoom dari HUD
  useEffect(() => {
    if (zoomInSignal === 0 || !mapRef.current) return;
    mapRef.current.zoomIn({ duration: 250 });
  }, [zoomInSignal]);

  useEffect(() => {
    if (zoomOutSignal === 0 || !mapRef.current) return;
    mapRef.current.zoomOut({ duration: 250 });
  }, [zoomOutSignal]);

  return <div ref={containerRef} className="w-full h-full z-0 bg-[#040908]" />;
}
