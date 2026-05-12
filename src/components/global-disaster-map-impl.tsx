import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, GeoJSON } from "react-leaflet";
import L from "leaflet";
import "leaflet.heat";
import type { LiveDisaster } from "@/hooks/use-live-disasters";

delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;

const SEVERITY_COLOR: Record<string, string> = {
  extreme: "oklch(0.65 0.26 25)",
  high: "oklch(0.7 0.22 35)",
  moderate: "oklch(0.83 0.17 80)",
  low: "oklch(0.78 0.2 200)",
};

function hazardIcon(d: LiveDisaster) {
  const color = SEVERITY_COLOR[d.severity];
  const size = d.severity === "extreme" ? 22 : d.severity === "high" ? 18 : 14;
  return L.divIcon({
    className: "",
    html: `<div style="position:relative;width:${size}px;height:${size}px">
      <div style="position:absolute;inset:0;border-radius:9999px;background:${color};box-shadow:0 0 14px ${color}"></div>
      <div style="position:absolute;inset:-7px;border-radius:9999px;border:2px solid ${color};opacity:.55;animation:ping 1.6s cubic-bezier(0,0,0.2,1) infinite"></div>
    </div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function userIcon() {
  return L.divIcon({
    className: "",
    html: `<div style="position:relative;width:18px;height:18px">
      <div style="position:absolute;inset:0;border-radius:9999px;background:oklch(0.82 0.17 200);box-shadow:0 0 16px oklch(0.82 0.17 200)"></div>
      <div style="position:absolute;inset:-10px;border-radius:9999px;border:2px solid oklch(0.82 0.17 200);opacity:.5;animation:ping 1.8s cubic-bezier(0,0,0.2,1) infinite"></div>
    </div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

function HeatLayer({ points }: { points: [number, number, number][] }) {
  const map = useMap();
  const ref = useRef<L.Layer | null>(null);
  useEffect(() => {
    if (ref.current) { map.removeLayer(ref.current); ref.current = null; }
    if (!points.length) return;
    // @ts-expect-error leaflet.heat plugin
    const layer = L.heatLayer(points, { radius: 25, blur: 30, maxZoom: 6, gradient: { 0.2: "#06b6d4", 0.4: "#fde047", 0.7: "#f97316", 1: "#ef4444" } });
    layer.addTo(map);
    ref.current = layer;
    return () => { if (ref.current) map.removeLayer(ref.current); };
  }, [map, points]);
  return null;
}

function FlyTo({ lat, lng, zoom }: { lat: number | null; lng: number | null; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    if (lat != null && lng != null) map.flyTo([lat, lng], zoom, { duration: 1.2 });
  }, [map, lat, lng, zoom]);
  return null;
}

function MapResize() {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 150);
    return () => clearTimeout(t);
  }, [map]);
  return null;
}

interface Props {
  disasters: LiveDisaster[];
  user: { lat: number | null; lng: number | null };
  height?: string;
  route?: GeoJSON.LineString | null;
  destination?: { lat: number; lng: number; label?: string } | null;
  flyToUser?: boolean;
}

export function GlobalDisasterMap({ disasters, user, height = "100%", route, destination, flyToUser }: Props) {
  const center: [number, number] = user.lat != null && user.lng != null ? [user.lat, user.lng] : [20, 0];
  const [zoom] = useState(user.lat != null ? 5 : 2);
  const heatPoints = useMemo<[number, number, number][]>(
    () => disasters.map((d) => [d.lat, d.lng, d.severity === "extreme" ? 1 : d.severity === "high" ? 0.8 : d.severity === "moderate" ? 0.5 : 0.3]),
    [disasters]
  );

  return (
    <div className="relative w-full overflow-hidden rounded-lg border border-border" style={{ height }}>
      <MapContainer center={center} zoom={zoom} scrollWheelZoom worldCopyJump className="h-full w-full">
        <MapResize />
        <TileLayer
          attribution='&copy; OpenStreetMap &copy; CARTO'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <HeatLayer points={heatPoints} />
        {flyToUser && <FlyTo lat={user.lat} lng={user.lng} zoom={6} />}

        {disasters.map((d) => {
          const ringColor = SEVERITY_COLOR[d.severity];
          const radius = (d.severity === "extreme" ? 80 : d.severity === "high" ? 50 : 30) * 1000;
          return (
            <div key={d.id}>
              <Circle center={[d.lat, d.lng]} radius={radius}
                pathOptions={{ color: ringColor, fillColor: ringColor, fillOpacity: 0.1, weight: 1 }} />
              <Marker position={[d.lat, d.lng]} icon={hazardIcon(d)}>
                <Popup>
                  <div style={{ fontFamily: "Inter, system-ui", minWidth: 200 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, textTransform: "uppercase" }}>{d.category}</div>
                    <div style={{ fontSize: 12, opacity: 0.9 }}>{d.title}</div>
                    {d.place && <div style={{ marginTop: 4, fontSize: 11 }}>📍 {d.place}</div>}
                    <div style={{ marginTop: 4, fontSize: 11 }}>
                      Severity: <b style={{ color: ringColor }}>{d.severity.toUpperCase()}</b>
                    </div>
                    <div style={{ fontSize: 11, opacity: 0.7 }}>
                      Source: {d.source} · {new Date(d.time).toLocaleString()}
                    </div>
                    {d.url && <a href={d.url} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: "#06b6d4" }}>Details ↗</a>}
                  </div>
                </Popup>
              </Marker>
            </div>
          );
        })}

        {user.lat != null && user.lng != null && (
          <Marker position={[user.lat, user.lng]} icon={userIcon()}>
            <Popup>You are here</Popup>
          </Marker>
        )}

        {destination && (
          <Marker position={[destination.lat, destination.lng]} icon={L.divIcon({
            className: "",
            html: `<div style="width:14px;height:14px;border-radius:3px;background:oklch(0.78 0.2 150);border:2px solid oklch(0.16 0.03 250);box-shadow:0 0 12px oklch(0.78 0.2 150)"></div>`,
            iconSize: [14, 14], iconAnchor: [7, 7],
          })}>
            <Popup>{destination.label || "Safe shelter"}</Popup>
          </Marker>
        )}

        {route && (
          <GeoJSON
            key={JSON.stringify(route).slice(0, 80)}
            data={route as unknown as GeoJSON.GeoJsonObject}
            style={{ color: "oklch(0.78 0.2 150)", weight: 4, opacity: 0.9, dashArray: "6,6" }}
          />
        )}
      </MapContainer>
      <div className="pointer-events-none absolute inset-0 scan-line" />
    </div>
  );
}
