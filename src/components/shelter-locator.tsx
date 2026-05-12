import { useMemo } from "react";
import { motion } from "framer-motion";
import { Hospital, Navigation2, Sparkles } from "lucide-react";
import { SHELTERS, type Shelter } from "@/lib/disaster-data";
import { distanceKm, type LiveDisaster } from "@/hooks/use-live-disasters";

interface Ranked extends Shelter {
  km: number;
  availability: number; // 0-1
  hazardPenalty: number; // 0-100
  score: number; // 0-100 higher = better
}

interface Props {
  user: { lat: number | null; lng: number | null };
  disasters: LiveDisaster[];
  onRoute: (dest: { lat: number; lng: number; label?: string }) => void;
  autoRouted: boolean;
}

const TYPE_LABEL: Record<Shelter["type"], string> = {
  "relief-camp": "Relief Camp",
  hospital: "Hospital",
  school: "School",
};

export function ShelterLocator({ user, disasters, onRoute, autoRouted }: Props) {
  const noLoc = user.lat == null || user.lng == null;

  const ranked = useMemo<Ranked[]>(() => {
    if (noLoc) return [];
    const u = { lat: user.lat!, lng: user.lng! };
    return SHELTERS
      .map((s) => {
        const km = distanceKm(u, s);
        const availability = 1 - s.occupied / s.capacity; // 0..1
        // penalty if extreme/high hazards within 100km of the shelter
        let penalty = 0;
        for (const d of disasters) {
          const hk = distanceKm({ lat: s.lat, lng: s.lng }, d);
          if (hk < 100) {
            const sev = d.severity === "extreme" ? 40 : d.severity === "high" ? 25 : d.severity === "moderate" ? 10 : 3;
            penalty += sev * (1 - hk / 100);
          }
        }
        penalty = Math.min(100, penalty);

        // distance score normalized (closer is better, soft cap 5000km)
        const distScore = Math.max(0, 100 - (km / 5000) * 100);
        const availScore = availability * 100;
        const safetyScore = 100 - penalty;
        const score = distScore * 0.45 + availScore * 0.25 + safetyScore * 0.30;
        return { ...s, km, availability, hazardPenalty: penalty, score };
      })
      .sort((a, b) => b.score - a.score);
  }, [user.lat, user.lng, disasters, noLoc]);

  return (
    <div className="glass rounded-xl p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 font-display text-sm tracking-wider">
          <Hospital className="h-4 w-4 text-safe" /> WORLD SHELTER LOCATOR
        </div>
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
          AI-ranked · capacity + safety
        </span>
      </div>

      {noLoc ? (
        <div className="py-6 text-center text-[11px] text-muted-foreground">Awaiting GPS to rank world shelters…</div>
      ) : (
        <>
          {/* best pick */}
          {ranked[0] && (
            <motion.div
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border border-safe/40 bg-safe/10 p-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-safe">
                  <Sparkles className="h-3 w-3" /> Best evacuation target
                </div>
                <div className="font-mono text-[11px] text-safe">SCORE {ranked[0].score.toFixed(0)}/100</div>
              </div>
              <div className="mt-1 font-display text-base">{ranked[0].name}</div>
              <div className="text-[11px] text-muted-foreground">
                {TYPE_LABEL[ranked[0].type]} · {ranked[0].km.toFixed(0)} km away ·{" "}
                {(ranked[0].availability * 100).toFixed(0)}% beds free · safety {(100 - ranked[0].hazardPenalty).toFixed(0)}%
              </div>
              <button
                onClick={() => onRoute({ lat: ranked[0].lat, lng: ranked[0].lng, label: ranked[0].name })}
                className={`mt-3 inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest ${
                  autoRouted ? "border border-safe text-safe" : "bg-safe text-safe-foreground hover:opacity-90"
                }`}
              >
                <Navigation2 className="h-3.5 w-3.5" /> {autoRouted ? "Route active" : "Auto-route here"}
              </button>
            </motion.div>
          )}

          <div className="mt-3 max-h-72 space-y-2 overflow-y-auto pr-1">
            {ranked.slice(1, 6).map((s) => (
              <button
                key={s.id}
                onClick={() => onRoute({ lat: s.lat, lng: s.lng, label: s.name })}
                className="w-full rounded-md border border-border bg-muted/30 p-2.5 text-left transition hover:border-primary"
              >
                <div className="flex items-center justify-between">
                  <div className="text-xs font-medium truncate">{s.name}</div>
                  <div className="font-mono text-[10px] text-muted-foreground">{s.score.toFixed(0)}</div>
                </div>
                <div className="mt-1 flex items-center gap-3 text-[10px] uppercase tracking-widest text-muted-foreground">
                  <span>{s.km.toFixed(0)} km</span>
                  <span>{(s.availability * 100).toFixed(0)}% free</span>
                  <span className={s.hazardPenalty > 50 ? "text-danger" : s.hazardPenalty > 20 ? "text-warn" : "text-safe"}>
                    safety {(100 - s.hazardPenalty).toFixed(0)}%
                  </span>
                </div>
                <div className="mt-1.5 h-1 overflow-hidden rounded bg-secondary">
                  <div className="h-full" style={{
                    width: `${s.score}%`,
                    background: s.score > 70 ? "var(--color-safe)" : s.score > 45 ? "var(--color-warn)" : "var(--color-danger)",
                  }} />
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
