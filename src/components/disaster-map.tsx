import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import { DISASTERS, SHELTERS, SEVERITY_META, DISASTER_LABELS, type DisasterEvent } from "@/lib/disaster-data";

// Fix default icon (we'll use divIcons anyway)
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;

function disasterIcon(d: DisasterEvent) {
  const color =
    d.severity === "extreme" || d.severity === "high"
      ? "oklch(0.65 0.26 25)"
      : d.severity === "moderate"
        ? "oklch(0.83 0.17 80)"
        : "oklch(0.78 0.2 150)";
  return L.divIcon({
    className: "",
    html: `<div style="position:relative;width:18px;height:18px">
      <div style="position:absolute;inset:0;border-radius:9999px;background:${color};box-shadow:0 0 12px ${color}"></div>
      <div style="position:absolute;inset:-6px;border-radius:9999px;border:2px solid ${color};opacity:.6;animation:ping 1.6s cubic-bezier(0,0,0.2,1) infinite"></div>
    </div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

const shelterIcon = L.divIcon({
  className: "",
  html: `<div style="width:14px;height:14px;border-radius:3px;background:oklch(0.82 0.17 200);border:2px solid oklch(0.16 0.03 250);box-shadow:0 0 10px oklch(0.82 0.17 200)"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

function MapResize() {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 100);
    return () => clearTimeout(t);
  }, [map]);
  return null;
}

interface Props {
  height?: string;
  center?: [number, number];
  zoom?: number;
  showShelters?: boolean;
}

export function DisasterMap({ height = "100%", center = [22.9734, 78.6569], zoom = 5, showShelters = true }: Props) {
  return (
    <div className="relative w-full overflow-hidden rounded-lg border border-border" style={{ height }}>
      <MapContainer center={center} zoom={zoom} scrollWheelZoom className="h-full w-full">
        <MapResize />
        <TileLayer
          attribution='&copy; OpenStreetMap &copy; CARTO'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        {DISASTERS.map((d) => {
          const meta = SEVERITY_META[d.severity];
          const ringColor =
            d.severity === "extreme" || d.severity === "high"
              ? "oklch(0.65 0.26 25)"
              : d.severity === "moderate"
                ? "oklch(0.83 0.17 80)"
                : "oklch(0.78 0.2 150)";
          return (
            <div key={d.id}>
              <Circle
                center={[d.lat, d.lng]}
                radius={d.radiusKm * 1000}
                pathOptions={{ color: ringColor, fillColor: ringColor, fillOpacity: 0.12, weight: 1 }}
              />
              <Marker position={[d.lat, d.lng]} icon={disasterIcon(d)}>
                <Popup>
                  <div style={{ fontFamily: "Inter, system-ui", minWidth: 180 }}>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{DISASTER_LABELS[d.type]}</div>
                    <div style={{ fontSize: 12, opacity: 0.8 }}>{d.title}</div>
                    <div style={{ marginTop: 6, fontSize: 11 }}>📍 {d.location}</div>
                    <div style={{ marginTop: 4, fontSize: 11 }}>
                      Severity: <b style={{ color: ringColor }}>{meta.label}</b>
                    </div>
                    <div style={{ fontSize: 11 }}>Affected: {d.affected.toLocaleString()}</div>
                  </div>
                </Popup>
              </Marker>
            </div>
          );
        })}
        {showShelters &&
          SHELTERS.map((s) => (
            <Marker key={s.id} position={[s.lat, s.lng]} icon={shelterIcon}>
              <Popup>
                <div style={{ fontFamily: "Inter, system-ui", minWidth: 160 }}>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{s.name}</div>
                  <div style={{ fontSize: 11, marginTop: 4 }}>Type: {s.type}</div>
                  <div style={{ fontSize: 11 }}>
                    Capacity: {s.occupied}/{s.capacity}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>
      <div className="pointer-events-none absolute inset-0 scan-line" />
    </div>
  );
}
