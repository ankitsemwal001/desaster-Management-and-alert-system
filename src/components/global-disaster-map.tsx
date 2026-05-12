import { lazy, Suspense, useEffect, useState } from "react";
import type { LiveDisaster } from "@/hooks/use-live-disasters";

const LazyImpl = lazy(() => import("./global-disaster-map-impl").then((m) => ({ default: m.GlobalDisasterMap })));

interface Props {
  disasters: LiveDisaster[];
  user: { lat: number | null; lng: number | null };
  height?: string;
  route?: GeoJSON.LineString | null;
  destination?: { lat: number; lng: number; label?: string } | null;
  flyToUser?: boolean;
}

export function GlobalDisasterMap(props: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const skeleton = (
    <div
      className="flex w-full items-center justify-center rounded-lg border border-border bg-muted/40 text-xs text-muted-foreground"
      style={{ height: props.height ?? "100%", minHeight: 320 }}
    >
      <span className="animate-pulse">Booting global hazard grid…</span>
    </div>
  );
  if (!mounted) return skeleton;
  return <Suspense fallback={skeleton}>{<LazyImpl {...props} />}</Suspense>;
}
