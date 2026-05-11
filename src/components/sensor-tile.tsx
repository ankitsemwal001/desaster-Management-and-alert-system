import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

interface Props {
  icon: LucideIcon;
  label: string;
  value: string | number;
  unit?: string;
  status?: "safe" | "warn" | "danger";
  trend?: number[];
}

export function SensorTile({ icon: Icon, label, value, unit, status = "safe", trend = [] }: Props) {
  const color =
    status === "danger" ? "var(--color-danger)" : status === "warn" ? "var(--color-warn)" : "var(--color-safe)";

  const max = Math.max(...trend, 1);
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass relative overflow-hidden rounded-lg p-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Icon className="h-4 w-4" style={{ color }} />
          <span className="uppercase tracking-wider">{label}</span>
        </div>
        <span className="pulse-dot h-1.5 w-1.5 rounded-full" style={{ color, background: color }} />
      </div>
      <div className="mt-3 flex items-baseline gap-1">
        <span className="font-display text-2xl text-foreground">{value}</span>
        {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
      </div>
      {trend.length > 0 && (
        <svg viewBox="0 0 100 24" className="mt-2 h-6 w-full" preserveAspectRatio="none">
          <polyline
            fill="none"
            stroke={color}
            strokeWidth={1.5}
            points={trend
              .map((v, i) => `${(i / (trend.length - 1)) * 100},${24 - (v / max) * 22}`)
              .join(" ")}
          />
        </svg>
      )}
    </motion.div>
  );
}
