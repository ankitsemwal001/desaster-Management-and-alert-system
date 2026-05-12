import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Radar } from "lucide-react";
import { distanceKm, type LiveDisaster, type LiveSeverity } from "@/hooks/use-live-disasters";

interface Props {
  user: { lat: number | null; lng: number | null };
  disasters: LiveDisaster[];
  rangeKm?: number;
}

const SEV_COLOR: Record<LiveSeverity, string> = {
  extreme: "oklch(0.65 0.26 25)",
  high: "oklch(0.7 0.22 35)",
  moderate: "oklch(0.83 0.17 80)",
  low: "oklch(0.78 0.2 200)",
};

const ALL_SEV: LiveSeverity[] = ["extreme", "high", "moderate", "low"];

// project hazard coords to polar (relative to user) → SVG x,y
function project(user: { lat: number; lng: number }, d: LiveDisaster, rangeKm: number, R: number) {
  const km = distanceKm(user, d);
  if (km > rangeKm) return null;
  // bearing in radians (0 = north). Use simple equirectangular delta.
  const dLat = d.lat - user.lat;
  const dLng = (d.lng - user.lng) * Math.cos((user.lat * Math.PI) / 180);
  const angle = Math.atan2(dLng, dLat); // 0 = north
  const r = (km / rangeKm) * R;
  const x = R + r * Math.sin(angle);
  const y = R - r * Math.cos(angle);
  return { x, y, km };
}

export function HazardRadar({ user, disasters, rangeKm = 800 }: Props) {
  const [enabled, setEnabled] = useState<Set<LiveSeverity>>(new Set(ALL_SEV));
  const [range, setRange] = useState(rangeKm);
  const R = 130; // svg radius
  const SIZE = R * 2;

  const points = useMemo(() => {
    if (user.lat == null || user.lng == null) return [];
    const u = { lat: user.lat, lng: user.lng };
    return disasters
      .filter((d) => enabled.has(d.severity))
      .map((d) => {
        const p = project(u, d, range, R);
        return p ? { d, ...p } : null;
      })
      .filter(Boolean) as { d: LiveDisaster; x: number; y: number; km: number }[];
  }, [disasters, user.lat, user.lng, enabled, range]);

  const toggle = (s: LiveSeverity) => {
    setEnabled((prev) => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s); else next.add(s);
      return next;
    });
  };

  const noLoc = user.lat == null || user.lng == null;

  return (
    <div className="glass rounded-xl p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 font-display text-sm tracking-wider">
          <Radar className="h-4 w-4 text-primary" /> NEARBY HAZARD RADAR
        </div>
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
          {points.length} in range · {range} km
        </div>
      </div>

      <div className="relative mx-auto" style={{ width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE} className="block">
          <defs>
            <radialGradient id="radarBg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="oklch(0.3 0.08 200 / 0.5)" />
              <stop offset="100%" stopColor="oklch(0.16 0.03 250 / 0)" />
            </radialGradient>
            <linearGradient id="sweepG" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="oklch(0.82 0.17 200 / 0)" />
              <stop offset="100%" stopColor="oklch(0.82 0.17 200 / 0.55)" />
            </linearGradient>
          </defs>

          {/* base circle */}
          <circle cx={R} cy={R} r={R - 2} fill="url(#radarBg)" stroke="oklch(0.7 0.1 210 / 0.25)" />
          {[0.25, 0.5, 0.75, 1].map((p) => (
            <circle key={p} cx={R} cy={R} r={(R - 2) * p} fill="none" stroke="oklch(0.82 0.17 200 / 0.18)" strokeDasharray="2,4" />
          ))}
          {/* crosshairs */}
          <line x1={R} y1={2} x2={R} y2={SIZE - 2} stroke="oklch(0.82 0.17 200 / 0.2)" />
          <line x1={2} y1={R} x2={SIZE - 2} y2={R} stroke="oklch(0.82 0.17 200 / 0.2)" />

          {/* sweeping cone */}
          <g style={{ transformOrigin: `${R}px ${R}px`, animation: "radar-sweep 3.5s linear infinite" }}>
            <path
              d={`M ${R} ${R} L ${R} ${2} A ${R - 2} ${R - 2} 0 0 1 ${R + (R - 2) * Math.sin(Math.PI / 3)} ${R - (R - 2) * Math.cos(Math.PI / 3)} Z`}
              fill="url(#sweepG)"
              opacity={0.55}
            />
          </g>

          {/* user dot */}
          <circle cx={R} cy={R} r={4} fill="oklch(0.82 0.17 200)" style={{ filter: "drop-shadow(0 0 6px oklch(0.82 0.17 200))" }} />

          {/* hazard dots */}
          {points.map(({ d, x, y }) => (
            <g key={d.id}>
              <circle cx={x} cy={y} r={4.5} fill={SEV_COLOR[d.severity]} style={{ filter: `drop-shadow(0 0 6px ${SEV_COLOR[d.severity]})` }}>
                <title>{`${d.category.toUpperCase()} · ${d.title}`}</title>
              </circle>
              <circle cx={x} cy={y} r={9} fill="none" stroke={SEV_COLOR[d.severity]} strokeWidth="1" opacity="0.5">
                <animate attributeName="r" values="4;14;4" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.6;0;0.6" dur="2s" repeatCount="indefinite" />
              </circle>
            </g>
          ))}
        </svg>

        {noLoc && (
          <div className="absolute inset-0 flex items-center justify-center text-[10px] uppercase tracking-widest text-muted-foreground">
            Awaiting GPS…
          </div>
        )}

        <style>{`@keyframes radar-sweep { from { transform: rotate(0); } to { transform: rotate(360deg); } }`}</style>
      </div>

      {/* severity filters */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {ALL_SEV.map((s) => {
          const active = enabled.has(s);
          return (
            <button
              key={s}
              onClick={() => toggle(s)}
              className={`rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-widest transition ${
                active ? "border-transparent text-foreground" : "border-border text-muted-foreground opacity-60"
              }`}
              style={active ? { background: SEV_COLOR[s], color: "oklch(0.15 0.04 250)" } : undefined}
            >
              {s}
            </button>
          );
        })}
        <div className="ml-auto flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground">
          Range
          <input
            type="range" min={100} max={3000} step={100} value={range}
            onChange={(e) => setRange(Number(e.target.value))}
            className="h-1 w-24 accent-primary"
          />
          <span className="font-mono text-foreground">{range}km</span>
        </div>
      </div>

      {/* nearest list */}
      <div className="mt-3 space-y-1.5">
        {points.sort((a, b) => a.km - b.km).slice(0, 4).map(({ d, km }) => (
          <motion.div
            key={d.id}
            initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
            className="flex items-center justify-between rounded-md border border-border bg-muted/30 px-2.5 py-1.5 text-[11px]"
          >
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ background: SEV_COLOR[d.severity], boxShadow: `0 0 6px ${SEV_COLOR[d.severity]}` }} />
              <span className="uppercase">{d.category}</span>
              <span className="truncate text-muted-foreground">· {d.title}</span>
            </span>
            <span className="font-mono text-muted-foreground">{km.toFixed(0)} km</span>
          </motion.div>
        ))}
        {!noLoc && points.length === 0 && (
          <div className="text-center text-[11px] text-muted-foreground">No hazards detected within {range} km.</div>
        )}
      </div>
    </div>
  );
}
