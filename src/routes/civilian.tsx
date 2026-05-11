import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  CloudRain, Waves, Activity, Thermometer, Droplets, Wind,
  Siren, Phone, MapPin, Navigation, Hospital, Shield,
} from "lucide-react";
import { CommandHeader } from "@/components/command-header";
import { DisasterMap } from "@/components/disaster-map";
import { AlertCard } from "@/components/alert-card";
import { SensorTile } from "@/components/sensor-tile";
import { useSensorStream } from "@/hooks/use-sensor-stream";
import { DISASTERS, SHELTERS } from "@/lib/disaster-data";

export const Route = createFileRoute("/civilian")({
  component: CivilianDashboard,
  head: () => ({ meta: [{ title: "Civilian Console — DAMS" }] }),
});

const TIPS = [
  "Move to higher ground if floodwaters rise; avoid walking in moving water.",
  "During a quake: Drop, Cover, Hold under sturdy furniture.",
  "Keep emergency kit: water, torch, radio, first-aid, documents.",
  "Follow only official alerts. Do not trust unverified social media.",
];

function CivilianDashboard() {
  const { data, latest } = useSensorStream();
  const [sosArmed, setSosArmed] = useState(false);

  const sensorStatus = (v: number, w: number, d: number): "safe" | "warn" | "danger" =>
    v >= d ? "danger" : v >= w ? "warn" : "safe";

  return (
    <div className="min-h-screen pb-12">
      <CommandHeader />
      <div className="mx-auto max-w-[1600px] px-4 pt-6">
        {/* Top bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Civilian Console</div>
            <h1 className="font-display text-2xl md:text-3xl">Your Safety Dashboard</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSosArmed((v) => !v)}
              className={`group inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-sm font-bold uppercase tracking-widest transition ${
                sosArmed ? "bg-danger text-danger-foreground glow-danger animate-pulse" : "bg-danger/90 text-danger-foreground hover:bg-danger"
              }`}
            >
              <Siren className="h-4 w-4" />
              {sosArmed ? "SOS BROADCASTING" : "SOS / PANIC"}
            </button>
            <a
              href="tel:112"
              className="inline-flex items-center gap-2 rounded-md border border-border glass px-4 py-2.5 text-sm font-semibold hover:border-primary"
            >
              <Phone className="h-4 w-4 text-primary" /> 112
            </a>
          </div>
        </div>

        {/* Sensor strip */}
        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          <SensorTile icon={CloudRain}   label="Rainfall"  value={latest.rainfall.toFixed(0)}    unit="mm/h" status={sensorStatus(latest.rainfall, 60, 120)}  trend={data.map(d => d.rainfall)} />
          <SensorTile icon={Waves}       label="River"     value={latest.riverLevel.toFixed(2)}  unit="m"    status={sensorStatus(latest.riverLevel, 7, 9)}    trend={data.map(d => d.riverLevel)} />
          <SensorTile icon={Activity}    label="Seismic"   value={latest.seismic.toFixed(1)}     unit="M"    status={sensorStatus(latest.seismic, 3, 5)}       trend={data.map(d => d.seismic)} />
          <SensorTile icon={Thermometer} label="Temp"      value={latest.temperature.toFixed(1)} unit="°C"   status={sensorStatus(latest.temperature, 38, 42)} trend={data.map(d => d.temperature)} />
          <SensorTile icon={Droplets}    label="Humidity"  value={latest.humidity.toFixed(0)}    unit="%"    status="safe"                                     trend={data.map(d => d.humidity)} />
          <SensorTile icon={Wind}        label="AQI"       value={latest.aqi.toFixed(0)}         unit=""     status={sensorStatus(latest.aqi, 200, 350)}       trend={data.map(d => d.aqi)} />
        </div>

        {/* Main grid */}
        <div className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <div className="glass rounded-xl p-3">
            <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-widest text-muted-foreground">
              <span className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-primary" /> Live Hazard Map · Nearby Shelters</span>
              <button className="inline-flex items-center gap-1 rounded border border-border px-2 py-1 hover:border-primary">
                <Navigation className="h-3 w-3 text-primary" /> Find Safe Route
              </button>
            </div>
            <DisasterMap height="520px" />
          </div>

          <div className="space-y-4">
            {/* Active alerts */}
            <div className="glass rounded-xl p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="font-display text-sm tracking-wider">ACTIVE ALERTS</div>
                <span className="text-[10px] text-danger">● {DISASTERS.length} live</span>
              </div>
              <div className="space-y-2">
                {DISASTERS.slice(0, 4).map((d, i) => <AlertCard key={d.id} d={d} index={i} />)}
              </div>
            </div>

            {/* Shelters */}
            <div className="glass rounded-xl p-4">
              <div className="mb-3 flex items-center gap-2 font-display text-sm tracking-wider">
                <Hospital className="h-4 w-4 text-primary" /> NEAREST SHELTERS
              </div>
              <div className="space-y-2">
                {SHELTERS.slice(0, 4).map((s) => {
                  const pct = (s.occupied / s.capacity) * 100;
                  return (
                    <div key={s.id} className="rounded-md border border-border bg-muted/30 p-3">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium">{s.name}</div>
                        <div className="text-[11px] text-muted-foreground">{s.occupied}/{s.capacity}</div>
                      </div>
                      <div className="mt-2 h-1.5 overflow-hidden rounded bg-secondary">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          className="h-full"
                          style={{ background: pct > 80 ? "var(--color-danger)" : pct > 60 ? "var(--color-warn)" : "var(--color-safe)" }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Tips + Contacts */}
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="glass rounded-xl p-4">
            <div className="mb-3 flex items-center gap-2 font-display text-sm tracking-wider">
              <Shield className="h-4 w-4 text-safe" /> SURVIVAL TIPS
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {TIPS.map((t) => (
                <li key={t} className="flex gap-2"><span className="text-primary">▸</span><span>{t}</span></li>
              ))}
            </ul>
          </div>
          <div className="glass rounded-xl p-4">
            <div className="mb-3 font-display text-sm tracking-wider">EMERGENCY CONTACTS</div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {[
                ["Emergency", "112"],
                ["Police", "100"],
                ["Fire", "101"],
                ["Ambulance", "102"],
                ["Disaster Mgmt", "108"],
                ["Women Helpline", "1091"],
              ].map(([k, v]) => (
                <a key={k} href={`tel:${v}`} className="flex items-center justify-between rounded-md border border-border bg-muted/30 px-3 py-2 hover:border-primary">
                  <span className="text-muted-foreground">{k}</span>
                  <span className="font-mono text-primary">{v}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
