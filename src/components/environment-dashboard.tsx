import { motion } from "framer-motion";
import {
  Thermometer, Droplets, Wind, CloudRain, Sun, Activity, Gauge, Cloud,
} from "lucide-react";
import { useEnvironment, weatherLabel } from "@/hooks/use-environment";

interface Props { lat: number | null; lng: number | null; }

function aqiColor(a: number | null): string {
  if (a == null) return "var(--color-muted-foreground)";
  if (a <= 50) return "var(--color-safe)";
  if (a <= 100) return "var(--color-warn)";
  if (a <= 150) return "oklch(0.7 0.2 50)";
  return "var(--color-danger)";
}

function aqiLabel(a: number | null): string {
  if (a == null) return "—";
  if (a <= 50) return "Good";
  if (a <= 100) return "Moderate";
  if (a <= 150) return "Unhealthy (SG)";
  if (a <= 200) return "Unhealthy";
  if (a <= 300) return "Very Unhealthy";
  return "Hazardous";
}

function CircleGauge({ value, max, color, label, unit }: { value: number | null; max: number; color: string; label: string; unit?: string }) {
  const pct = value == null ? 0 : Math.min(1, value / max);
  const C = 2 * Math.PI * 42;
  return (
    <div className="relative flex flex-col items-center">
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="42" stroke="oklch(0.3 0.04 250)" strokeWidth="8" fill="none" />
        <motion.circle
          cx="60" cy="60" r="42"
          stroke={color} strokeWidth="8" fill="none" strokeLinecap="round"
          strokeDasharray={C}
          initial={{ strokeDashoffset: C }}
          animate={{ strokeDashoffset: C * (1 - pct) }}
          transition={{ duration: 1, ease: "easeOut" }}
          transform="rotate(-90 60 60)"
          style={{ filter: `drop-shadow(0 0 6px ${color})` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="font-display text-xl">{value == null ? "—" : value.toFixed(value > 10 ? 0 : 1)}</div>
        {unit && <div className="text-[9px] uppercase tracking-widest text-muted-foreground">{unit}</div>}
      </div>
      <div className="mt-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</div>
    </div>
  );
}

export function EnvironmentDashboard({ lat, lng }: Props) {
  const env = useEnvironment(lat, lng);

  return (
    <div className="glass rounded-2xl p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-primary">Personal Environment</div>
          <h2 className="font-display text-lg">AI CLIMATE INTELLIGENCE</h2>
        </div>
        <div className="text-right text-[10px] uppercase tracking-widest text-muted-foreground">
          <div>{weatherLabel(env.weatherCode)}</div>
          <div className="text-safe">● Live · Open-Meteo</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <CircleGauge value={env.temperature} max={50} color="var(--color-warn)" label="Temperature" unit="°C" />
        <CircleGauge value={env.humidity} max={100} color="var(--color-cyber)" label="Humidity" unit="%" />
        <CircleGauge value={env.aqi} max={300} color={aqiColor(env.aqi)} label={`AQI · ${aqiLabel(env.aqi)}`} unit="US" />
        <CircleGauge value={env.uv} max={11} color="oklch(0.78 0.2 100)" label="UV Index" />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4 text-xs">
        {[
          { icon: Wind, label: "Wind", val: env.windSpeed != null ? `${env.windSpeed.toFixed(1)} km/h` : "—" },
          { icon: CloudRain, label: "Rain prob.", val: env.precipitationProb != null ? `${env.precipitationProb}%` : "—" },
          { icon: Gauge, label: "PM2.5", val: env.pm25 != null ? `${env.pm25.toFixed(0)} µg` : "—" },
          { icon: Activity, label: "PM10", val: env.pm10 != null ? `${env.pm10.toFixed(0)} µg` : "—" },
        ].map((m) => (
          <div key={m.label} className="rounded-md border border-border bg-muted/30 p-2.5">
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">
              <m.icon className="h-3 w-3 text-primary" /> {m.label}
            </div>
            <div className="mt-1 font-mono">{m.val}</div>
          </div>
        ))}
      </div>

      {env.hourly && env.hourly.temperature.length > 0 && (
        <div className="mt-5">
          <div className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground">
            <Thermometer className="h-3 w-3 text-primary" /> 24-hour forecast
          </div>
          <Sparkline data={env.hourly.temperature} color="var(--color-warn)" />
          <div className="mt-2 flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground">
            <Cloud className="h-3 w-3 text-primary" /> Precipitation %
          </div>
          <Sparkline data={env.hourly.precipProb} color="var(--color-cyber)" />
        </div>
      )}

      <div className="mt-4 flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground">
        <Sun className="h-3 w-3 text-warn" />
        AI Risk: {env.aqi != null && env.aqi > 150 ? "Air quality hazardous" : env.uv != null && env.uv > 8 ? "High UV exposure" : env.precipitationProb != null && env.precipitationProb > 70 ? "Rainfall imminent" : "Conditions stable"}
      </div>
    </div>
  );
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (!data.length) return null;
  const min = Math.min(...data), max = Math.max(...data) || 1;
  const range = max - min || 1;
  const w = 100, h = 24;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-8 w-full" preserveAspectRatio="none">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="0.8" style={{ filter: `drop-shadow(0 0 1px ${color})` }} />
    </svg>
  );
}
