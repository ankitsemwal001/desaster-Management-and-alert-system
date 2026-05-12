import { useEffect, useState, useCallback } from "react";

export type LiveSeverity = "low" | "moderate" | "high" | "extreme";
export type LiveCategory =
  | "earthquake" | "wildfire" | "storm" | "flood" | "volcano"
  | "drought" | "landslide" | "iceberg" | "other";

export interface LiveDisaster {
  id: string;
  source: "USGS" | "EONET";
  category: LiveCategory;
  title: string;
  lat: number;
  lng: number;
  severity: LiveSeverity;
  magnitude?: number;
  time: number; // epoch ms
  url?: string;
  place?: string;
}

const EONET_CAT: Record<string, LiveCategory> = {
  wildfires: "wildfire",
  severeStorms: "storm",
  floods: "flood",
  volcanoes: "volcano",
  drought: "drought",
  landslides: "landslide",
  seaLakeIce: "iceberg",
  earthquakes: "earthquake",
};

function magToSeverity(m: number): LiveSeverity {
  if (m >= 6) return "extreme";
  if (m >= 5) return "high";
  if (m >= 4) return "moderate";
  return "low";
}

async function fetchUSGS(): Promise<LiveDisaster[]> {
  const r = await fetch("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson");
  if (!r.ok) return [];
  const j = await r.json();
  return (j.features || []).map((f: any) => {
    const [lng, lat] = f.geometry.coordinates;
    const mag = f.properties.mag ?? 0;
    return {
      id: `usgs-${f.id}`,
      source: "USGS" as const,
      category: "earthquake" as LiveCategory,
      title: f.properties.title || `M${mag} Earthquake`,
      lat, lng,
      severity: magToSeverity(mag),
      magnitude: mag,
      time: f.properties.time,
      url: f.properties.url,
      place: f.properties.place,
    };
  });
}

async function fetchEONET(): Promise<LiveDisaster[]> {
  const r = await fetch("https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=200");
  if (!r.ok) return [];
  const j = await r.json();
  const out: LiveDisaster[] = [];
  for (const e of j.events || []) {
    const cat = EONET_CAT[e.categories?.[0]?.id as string] || "other";
    const last = e.geometry?.[e.geometry.length - 1];
    if (!last) continue;
    let coords = last.coordinates;
    // polygons → take first point
    if (Array.isArray(coords[0])) coords = Array.isArray(coords[0][0]) ? coords[0][0] : coords[0];
    const [lng, lat] = coords;
    if (typeof lat !== "number" || typeof lng !== "number") continue;
    const sev: LiveSeverity = cat === "wildfire" || cat === "volcano" || cat === "storm" ? "high" : "moderate";
    out.push({
      id: `eonet-${e.id}`,
      source: "EONET",
      category: cat,
      title: e.title,
      lat, lng,
      severity: sev,
      time: new Date(last.date).getTime(),
      url: e.sources?.[0]?.url,
      place: e.title,
    });
  }
  return out;
}

export function useLiveDisasters(refreshMs = 120_000) {
  const [data, setData] = useState<LiveDisaster[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [a, b] = await Promise.all([fetchUSGS().catch(() => []), fetchEONET().catch(() => [])]);
      setData([...a, ...b]);
      setUpdatedAt(Date.now());
      setError(null);
    } catch (e: any) {
      setError(e?.message || "fetch failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, refreshMs);
    return () => clearInterval(id);
  }, [refresh, refreshMs]);

  return { data, loading, updatedAt, error, refresh };
}

// Haversine distance in km
export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}
