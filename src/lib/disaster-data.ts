export type Severity = "low" | "moderate" | "high" | "extreme";
export type DisasterType =
  | "flood" | "earthquake" | "cyclone" | "landslide"
  | "fire" | "gas-leak" | "rainfall" | "flash-flood";

export interface DisasterEvent {
  id: string;
  type: DisasterType;
  title: string;
  location: string;
  lat: number;
  lng: number;
  radiusKm: number;
  severity: Severity;
  affected: number;
  startedAt: string;
}

export interface Shelter {
  id: string;
  name: string;
  lat: number;
  lng: number;
  capacity: number;
  occupied: number;
  type: "relief-camp" | "hospital" | "school";
}

export const SEVERITY_META: Record<Severity, { label: string; color: string; ring: string }> = {
  low:      { label: "LOW",      color: "var(--color-safe)",   ring: "ring-safe/40" },
  moderate: { label: "MODERATE", color: "var(--color-warn)",   ring: "ring-warn/40" },
  high:     { label: "HIGH",     color: "var(--color-danger)", ring: "ring-danger/40" },
  extreme:  { label: "EXTREME",  color: "var(--color-danger)", ring: "ring-danger/60" },
};

export const DISASTER_LABELS: Record<DisasterType, string> = {
  flood: "Flood",
  earthquake: "Earthquake",
  cyclone: "Cyclone",
  landslide: "Landslide",
  fire: "Forest Fire",
  "gas-leak": "Gas Leak",
  rainfall: "Heavy Rainfall",
  "flash-flood": "Flash Flood",
};

export const DISASTERS: DisasterEvent[] = [
  { id: "d1", type: "flood",       title: "Ganga overflow",        location: "Haridwar, UK",   lat: 29.9457, lng: 78.1642, radiusKm: 18, severity: "extreme", affected: 48200, startedAt: "2h ago" },
  { id: "d2", type: "cyclone",     title: "Cyclone Vayu-II",       location: "Puri, Odisha",   lat: 19.8135, lng: 85.8312, radiusKm: 60, severity: "high",    affected: 121400, startedAt: "5h ago" },
  { id: "d3", type: "earthquake",  title: "M5.8 Tremor",           location: "Sikkim",         lat: 27.5330, lng: 88.5122, radiusKm: 25, severity: "high",    affected: 8700,  startedAt: "32m ago" },
  { id: "d4", type: "landslide",   title: "Slope failure NH-7",    location: "Wayanad, KL",    lat: 11.6854, lng: 76.1320, radiusKm: 6,  severity: "moderate",affected: 1240,  startedAt: "1h ago" },
  { id: "d5", type: "fire",        title: "Forest fire spread",    location: "Uttarakhand",    lat: 30.0668, lng: 79.0193, radiusKm: 12, severity: "moderate",affected: 320,   startedAt: "6h ago" },
  { id: "d6", type: "gas-leak",    title: "Industrial leak",       location: "Vizag, AP",      lat: 17.6868, lng: 83.2185, radiusKm: 4,  severity: "high",    affected: 2100,  startedAt: "18m ago" },
  { id: "d7", type: "flash-flood", title: "Cloudburst",            location: "Leh, Ladakh",    lat: 34.1526, lng: 77.5770, radiusKm: 8,  severity: "extreme", affected: 540,   startedAt: "45m ago" },
];

export const SHELTERS: Shelter[] = [
  { id: "s1", name: "Govt Relief Camp 2",   lat: 29.9600, lng: 78.1500, capacity: 1200, occupied: 870, type: "relief-camp" },
  { id: "s2", name: "AIIMS Field Hospital", lat: 19.8200, lng: 85.8200, capacity: 600,  occupied: 410, type: "hospital" },
  { id: "s3", name: "Govt School Shelter",  lat: 27.5200, lng: 88.5000, capacity: 800,  occupied: 320, type: "school" },
  { id: "s4", name: "Red Cross Camp",       lat: 11.6900, lng: 76.1400, capacity: 400,  occupied: 180, type: "relief-camp" },
  { id: "s5", name: "Medical Camp Alpha",   lat: 17.6900, lng: 83.2100, capacity: 500,  occupied: 350, type: "hospital" },
];

export function severityScore(s: Severity): number {
  return { low: 1, moderate: 2, high: 3, extreme: 4 }[s];
}
