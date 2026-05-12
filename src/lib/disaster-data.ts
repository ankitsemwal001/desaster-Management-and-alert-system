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
  // India
  { id: "s1",  name: "Govt Relief Camp 2",     lat: 29.9600,  lng: 78.1500,   capacity: 1200, occupied: 870, type: "relief-camp" },
  { id: "s2",  name: "AIIMS Field Hospital",   lat: 19.8200,  lng: 85.8200,   capacity: 600,  occupied: 410, type: "hospital" },
  { id: "s3",  name: "Govt School Shelter",    lat: 27.5200,  lng: 88.5000,   capacity: 800,  occupied: 320, type: "school" },
  { id: "s4",  name: "Red Cross Camp",         lat: 11.6900,  lng: 76.1400,   capacity: 400,  occupied: 180, type: "relief-camp" },
  { id: "s5",  name: "Medical Camp Alpha",     lat: 17.6900,  lng: 83.2100,   capacity: 500,  occupied: 350, type: "hospital" },
  // Asia
  { id: "s6",  name: "Tokyo Disaster Center",  lat: 35.6762,  lng: 139.6503,  capacity: 2500, occupied: 900, type: "relief-camp" },
  { id: "s7",  name: "Manila Evac Hub",        lat: 14.5995,  lng: 120.9842,  capacity: 1800, occupied: 1500,type: "school" },
  { id: "s8",  name: "Jakarta Safe Zone",      lat: -6.2088,  lng: 106.8456,  capacity: 1400, occupied: 700, type: "relief-camp" },
  // Europe
  { id: "s9",  name: "Berlin Civil Shelter",   lat: 52.5200,  lng: 13.4050,   capacity: 2200, occupied: 600, type: "relief-camp" },
  { id: "s10", name: "Rome Red Cross",         lat: 41.9028,  lng: 12.4964,   capacity: 900,  occupied: 350, type: "hospital" },
  { id: "s11", name: "London Crisis Centre",   lat: 51.5074,  lng: -0.1278,   capacity: 1600, occupied: 800, type: "relief-camp" },
  // Americas
  { id: "s12", name: "NYC Emergency Center",   lat: 40.7128,  lng: -74.0060,  capacity: 3000, occupied: 1100,type: "hospital" },
  { id: "s13", name: "LA County Shelter",      lat: 34.0522,  lng: -118.2437, capacity: 2400, occupied: 1900,type: "school" },
  { id: "s14", name: "Mexico City Refuge",     lat: 19.4326,  lng: -99.1332,  capacity: 1700, occupied: 1300,type: "relief-camp" },
  { id: "s15", name: "São Paulo Civil Hub",    lat: -23.5505, lng: -46.6333,  capacity: 2000, occupied: 800, type: "relief-camp" },
  // Africa & Oceania
  { id: "s16", name: "Nairobi Aid Camp",       lat: -1.2921,  lng: 36.8219,   capacity: 1300, occupied: 950, type: "relief-camp" },
  { id: "s17", name: "Cape Town Shelter",      lat: -33.9249, lng: 18.4241,   capacity: 1100, occupied: 400, type: "hospital" },
  { id: "s18", name: "Sydney Emergency Hub",   lat: -33.8688, lng: 151.2093,  capacity: 1900, occupied: 700, type: "relief-camp" },
];

export function severityScore(s: Severity): number {
  return { low: 1, moderate: 2, high: 3, extreme: 4 }[s];
}
