"use client";

import { useEffect, useRef, useState } from "react";
import { API_CONFIG } from "@/config/api.config";
import {
  AisConnectionStatus,
  AisScopeId,
  AisVesselTelemetry,
} from "@/types/gis.types";

const MAX_TRACKED_VESSELS = 300;

export function useAisStream(enabled: boolean, scope: AisScopeId) {
  const [vessels, setVessels] = useState<AisVesselTelemetry[]>([]);
  const [status, setStatus] = useState<AisConnectionStatus>(
    enabled ? "connecting" : "paused"
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const vesselMapRef = useRef<Map<string, AisVesselTelemetry>>(new Map());

  useEffect(() => {
    vesselMapRef.current.clear();
    setVessels([]);
    setErrorMessage(null);

    if (!enabled) {
      setStatus("paused");
      return;
    }

    setStatus("connecting");
    const streamUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AIS.STREAM}?scope=${scope}`;
    const eventSource = new EventSource(streamUrl);

    eventSource.addEventListener("status", (evt: MessageEvent) => {
      try {
        const payload = JSON.parse(evt.data) as {
          status?: AisConnectionStatus;
          message?: string;
        };
        if (payload.status) setStatus(payload.status);
        if (payload.message) setErrorMessage(payload.message);
      } catch {
        // ignore malformed status payload
      }
    });

    eventSource.addEventListener("vessel", (evt: MessageEvent) => {
      try {
        const incoming = JSON.parse(evt.data) as Partial<AisVesselTelemetry>;
        if (!incoming.mmsi || typeof incoming.lat !== "number" || typeof incoming.lng !== "number") {
          return;
        }

        const existing = vesselMapRef.current.get(incoming.mmsi);
        const prevTrail = existing?.trail ?? [];
        const lastPt = prevTrail[prevTrail.length - 1];
        const movedEnough =
          !lastPt ||
          Math.abs(lastPt[0] - incoming.lng) > 0.0001 ||
          Math.abs(lastPt[1] - incoming.lat) > 0.0001;
        const nextTrail = movedEnough
          ? [...prevTrail, [incoming.lng, incoming.lat] as [number, number]].slice(-30)
          : prevTrail;

        const merged: AisVesselTelemetry = {
          mmsi: incoming.mmsi,
          shipName:
            incoming.shipName && !incoming.shipName.startsWith("KAPAL ")
              ? incoming.shipName
              : existing?.shipName || incoming.shipName || `KAPAL ${incoming.mmsi}`,
          lat: incoming.lat,
          lng: incoming.lng,
          cog: incoming.cog ?? existing?.cog ?? 0,
          sog: incoming.sog ?? existing?.sog ?? 0,
          heading: incoming.heading ?? existing?.heading ?? 0,
          navStatus: incoming.navStatus ?? existing?.navStatus,
          shipType: incoming.shipType ?? existing?.shipType,
          destination: incoming.destination ?? existing?.destination,
          imoNumber: incoming.imoNumber ?? existing?.imoNumber,
          callSign: incoming.callSign ?? existing?.callSign,
          lengthMeters: incoming.lengthMeters ?? existing?.lengthMeters,
          beamMeters: incoming.beamMeters ?? existing?.beamMeters,
          draughtMeters: incoming.draughtMeters ?? existing?.draughtMeters,
          trail: nextTrail,
          updatedAt: incoming.updatedAt || new Date().toISOString(),
        };

        vesselMapRef.current.set(merged.mmsi, merged);

        if (vesselMapRef.current.size > MAX_TRACKED_VESSELS) {
          const oldestKey = vesselMapRef.current.keys().next().value;
          if (oldestKey) vesselMapRef.current.delete(oldestKey);
        }

        setVessels(Array.from(vesselMapRef.current.values()));
      } catch {
        // ignore malformed vessel payload
      }
    });

    eventSource.onerror = () => {
      setStatus("error");
    };

    return () => {
      eventSource.close();
    };
  }, [enabled, scope]);

  return { vessels, status, errorMessage };
}
