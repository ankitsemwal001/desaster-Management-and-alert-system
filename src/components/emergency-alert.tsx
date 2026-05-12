import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X, Volume2, VolumeX, Navigation2 } from "lucide-react";
import { useEffect, useState } from "react";
import { playSiren, stopSiren } from "@/lib/alert-siren";
import type { LiveDisaster } from "@/hooks/use-live-disasters";

interface Props {
  hazard: LiveDisaster | null;
  distanceKm: number | null;
  onDismiss: () => void;
  onRoute?: () => void;
}

export function EmergencyAlert({ hazard, distanceKm, onDismiss, onRoute }: Props) {
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    if (!hazard) return;
    if (!muted) playSiren(7000, hazard.severity === "extreme" ? "extreme" : "high");
    return () => stopSiren();
  }, [hazard, muted]);

  return (
    <AnimatePresence>
      {hazard && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-[92%] max-w-lg overflow-hidden rounded-2xl border-2 border-danger glass p-6 shadow-[0_0_80px_oklch(0.65_0.26_25/0.6)]"
          >
            {/* flashing border */}
            <motion.div
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.2, repeat: Infinity }}
              className="pointer-events-none absolute inset-0 rounded-2xl border-2 border-danger"
            />
            <div className="relative">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-danger/20"
                  >
                    <AlertTriangle className="h-7 w-7 text-danger" />
                  </motion.div>
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.3em] text-danger">
                      {hazard.severity.toUpperCase()} ALERT
                    </div>
                    <h2 className="font-display text-xl">{hazard.category.toUpperCase()} DETECTED</h2>
                  </div>
                </div>
                <button onClick={onDismiss} className="rounded p-1 hover:bg-muted" aria-label="Dismiss">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-5 space-y-2 text-sm">
                <div className="text-muted-foreground">{hazard.title}</div>
                {distanceKm != null && (
                  <div className="rounded-md border border-danger/40 bg-danger/10 p-3 font-mono text-danger">
                    DANGER ZONE · {distanceKm.toFixed(1)} KM from your location
                  </div>
                )}
                <div className="text-xs text-muted-foreground">
                  {hazard.severity === "extreme"
                    ? "Move immediately to nearest shelter. Avoid danger zone."
                    : "Stay alert. Follow official advisories and prepare for possible evacuation."}
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-2">
                {onRoute && (
                  <button
                    onClick={onRoute}
                    className="inline-flex items-center gap-2 rounded-md bg-danger px-4 py-2 text-sm font-bold uppercase tracking-widest text-danger-foreground hover:opacity-90"
                  >
                    <Navigation2 className="h-4 w-4" /> Find Safe Route
                  </button>
                )}
                <button
                  onClick={() => { setMuted((v) => !v); if (!muted) stopSiren(); }}
                  className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-xs uppercase tracking-widest hover:border-primary"
                >
                  {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  {muted ? "Unmute" : "Mute"}
                </button>
                <button
                  onClick={onDismiss}
                  className="ml-auto text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground"
                >
                  Acknowledge
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
