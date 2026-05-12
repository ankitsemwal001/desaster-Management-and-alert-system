import { motion } from "framer-motion";
import { AlertTriangle, Waves, Wind, Mountain, Flame, Factory, CloudRain, Activity } from "lucide-react";
import { DISASTER_LABELS, SEVERITY_META, type DisasterEvent } from "@/lib/disaster-data";

const ICONS = {
  flood: Waves,
  earthquake: Activity,
  cyclone: Wind,
  landslide: Mountain,
  fire: Flame,
  "gas-leak": Factory,
  rainfall: CloudRain,
  "flash-flood": Waves,
} as const;

export function AlertCard({ d, index = 0 }: { d: DisasterEvent; index?: number }) {
  const Icon = ICONS[d.type] ?? AlertTriangle;
  const meta = SEVERITY_META[d.severity];
  const isHot = d.severity === "extreme" || d.severity === "high";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`glass relative overflow-hidden rounded-lg p-4 ${isHot ? "glow-danger" : ""}`}
    >
      <div className="flex items-start gap-3">
        <div
          className="rounded-md p-2"
          style={{ background: `color-mix(in oklab, ${meta.color} 18%, transparent)`, color: meta.color }}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-display text-sm tracking-wide text-foreground">{DISASTER_LABELS[d.type]}</span>
            <span
              className="rounded-sm px-1.5 py-0.5 text-[10px] font-bold tracking-wider"
              style={{ background: meta.color, color: "var(--color-cyber-foreground)" }}
            >
              {meta.label}
            </span>
          </div>
          <div className="mt-0.5 truncate text-xs text-muted-foreground">{d.title} • {d.location}</div>
          <div className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground">
            <span>👥 {d.affected.toLocaleString()}</span>
            <span>📡 R {d.radiusKm}km</span>
            <span>⏱ {d.startedAt}</span>
          </div>
        </div>
        {isHot && (
          <span className="pulse-dot mt-1 inline-block h-2 w-2 rounded-full" style={{ color: meta.color, background: meta.color }} />
        )}
      </div>
    </motion.div>
  );
}
