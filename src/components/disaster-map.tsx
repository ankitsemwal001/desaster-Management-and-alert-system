import { lazy, Suspense, useEffect, useState } from "react";

// Leaflet uses `window` at import time → load only in the browser
const LazyImpl = lazy(() =>
  import("./disaster-map-impl").then((m) => ({ default: m.DisasterMap })),
);

interface Props {
  height?: string;
  center?: [number, number];
  zoom?: number;
  showShelters?: boolean;
}

export function DisasterMap(props: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const skeleton = (
    <div
      className="flex w-full items-center justify-center rounded-lg border border-border bg-muted/40 text-xs text-muted-foreground"
      style={{ height: props.height ?? "100%", minHeight: 200 }}
    >
      <span className="animate-pulse">Loading hazard grid…</span>
    </div>
  );

  if (!mounted) return skeleton;
  return (
    <Suspense fallback={skeleton}>
      <LazyImpl {...props} />
    </Suspense>
  );
}
