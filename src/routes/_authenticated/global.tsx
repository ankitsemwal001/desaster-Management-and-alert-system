import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Globe, Radar, RefreshCcw, MapPin, Activity, Navigation2, Shield } from "lucide-react";
import { CommandHeader } from "@/components/command-header";
import { GlobalDisasterMap } from "@/components/global-disaster-map";
import { EnvironmentDashboard } from "@/components/environment-dashboard";
import { EmergencyAlert } from "@/components/emergency-alert";
import { HazardRadar } from "@/components/hazard-radar";
import { ShelterLocator } from "@/components/shelter-locator";
import { useLiveDisasters, distanceKm, type LiveDisaster } from "@/hooks/use-live-disasters";
import { useGeolocation } from "@/hooks/use-geolocation";
import { SHELTERS } from "@/lib/disaster-data";

export const Route = createFileRoute("/_authenticated/global")({
  component: GlobalConsole,
  head: () => ({ meta: [
    { title: "Global Disaster Intelligence — DAMS" },
    { name: "description", content: "Real-time global hazard monitoring with AI risk analysis, live geolocation, and evacuation routing." },
  ]}),
});

const ALERT_RADIUS_KM = 250;

function GlobalConsole() {
  const { data, loading, updatedAt, refresh } = useLiveDisasters(120_000);
  const geo = useGeolocation(true);
  const [active, setActive] = useState<LiveDisaster | null>(null);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [route, setRoute] = useState<GeoJSON.LineString | null>(null);
  const [routeTo, setRouteTo] = useState<{ lat: number; lng: number; label?: string } | null>(null);

  // sort hazards by distance to user
  const ranked = useMemo(() => {
    if (geo.lat == null || geo.lng == null) return data.slice(0, 50);
    return data
      .map((d) => ({ d, km: distanceKm({ lat: geo.lat!, lng: geo.lng! }, d) }))
      .sort((a, b) => a.km - b.km)
      .map((x) => ({ ...x.d, _km: x.km } as LiveDisaster & { _km: number }));
  }, [data, geo.lat, geo.lng]);

  // auto-trigger alert when high-severity hazard nearby
  useEffect(() => {
    if (geo.lat == null || geo.lng == null) return;
    const nearest = (ranked as (LiveDisaster & { _km?: number })[])[0];
    if (!nearest || dismissed.has(nearest.id)) return;
    const km = nearest._km ?? distanceKm({ lat: geo.lat, lng: geo.lng }, nearest);
    const isCritical = (nearest.severity === "extreme" || nearest.severity === "high") && km <= ALERT_RADIUS_KM;
    if (isCritical) setActive(nearest);
  }, [ranked, geo.lat, geo.lng, dismissed]);

  const computeRoute = async (dest: { lat: number; lng: number; label?: string }) => {
    if (geo.lat == null || geo.lng == null) return;
    setRouteTo(dest);
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${geo.lng},${geo.lat};${dest.lng},${dest.lat}?overview=full&geometries=geojson`;
      const r = await fetch(url);
      const j = await r.json();
      const line = j?.routes?.[0]?.geometry as GeoJSON.LineString | undefined;
      if (line) setRoute(line);
    } catch { /* ignore */ }
  };

  const findSafeShelter = () => {
    if (geo.lat == null || geo.lng == null) return;
    const u = { lat: geo.lat, lng: geo.lng };
    const ranked = SHELTERS.map((s) => {
      const km = distanceKm(u, s);
      const availability = 1 - s.occupied / s.capacity;
      let penalty = 0;
      for (const d of data) {
        const hk = distanceKm({ lat: s.lat, lng: s.lng }, d);
        if (hk < 100) {
          const sev = d.severity === "extreme" ? 40 : d.severity === "high" ? 25 : d.severity === "moderate" ? 10 : 3;
          penalty += sev * (1 - hk / 100);
        }
      }
      penalty = Math.min(100, penalty);
      const distScore = Math.max(0, 100 - (km / 5000) * 100);
      const score = distScore * 0.45 + availability * 100 * 0.25 + (100 - penalty) * 0.30;
      return { s, score };
    }).sort((a, b) => b.score - a.score);
    if (ranked[0]) computeRoute({ lat: ranked[0].s.lat, lng: ranked[0].s.lng, label: ranked[0].s.name });
  };

  const counts = useMemo(() => {
    const c = { extreme: 0, high: 0, moderate: 0, low: 0 };
    for (const d of data) c[d.severity]++;
    return c;
  }, [data]);

  return (
    <div className="min-h-screen pb-12">
      <CommandHeader />
      <EmergencyAlert
        hazard={active}
        distanceKm={active && geo.lat != null && geo.lng != null ? distanceKm({ lat: geo.lat, lng: geo.lng }, active) : null}
        onDismiss={() => { if (active) setDismissed((s) => new Set([...s, active.id])); setActive(null); }}
        onRoute={() => { findSafeShelter(); setActive(null); }}
      />

      <div className="mx-auto max-w-[1600px] px-4 pt-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-primary">Global Intelligence</div>
            <h1 className="font-display text-2xl md:text-3xl flex items-center gap-2">
              <Globe className="h-7 w-7 text-primary" /> WORLD HAZARD GRID
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="rounded-md border border-border glass px-3 py-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">
              {updatedAt ? `Updated ${new Date(updatedAt).toLocaleTimeString()}` : "Awaiting data…"}
            </div>
            <button
              onClick={refresh}
              className="inline-flex items-center gap-2 rounded-md border border-border glass px-3 py-1.5 text-xs hover:border-primary"
            >
              <RefreshCcw className="h-3.5 w-3.5 text-primary" /> Refresh
            </button>
          </div>
        </div>

        {/* severity counters */}
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {([
            ["EXTREME", counts.extreme, "var(--color-danger)"],
            ["HIGH", counts.high, "oklch(0.7 0.22 35)"],
            ["MODERATE", counts.moderate, "var(--color-warn)"],
            ["LOW / WEATHER", counts.low, "var(--color-cyber)"],
          ] as const).map(([label, n, color]) => (
            <div key={label} className="glass rounded-md p-3">
              <div className="text-[10px] uppercase tracking-widest" style={{ color }}>{label}</div>
              <div className="font-display text-2xl">{n}</div>
            </div>
          ))}
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
          <div className="glass rounded-xl p-3">
            <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-widest text-muted-foreground">
              <span className="flex items-center gap-2"><Radar className="h-3.5 w-3.5 text-primary" /> Live Global Map · USGS · NASA EONET</span>
              <span className="flex items-center gap-2">
                <MapPin className="h-3 w-3 text-primary" />
                {geo.loading ? "locating…" : geo.fallback ? "fallback location" : `${geo.lat?.toFixed(2)}, ${geo.lng?.toFixed(2)}`}
              </span>
            </div>
            <GlobalDisasterMap
              disasters={data}
              user={{ lat: geo.lat, lng: geo.lng }}
              route={route}
              destination={routeTo}
              flyToUser={!geo.fallback}
              height="600px"
            />
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <button
                onClick={findSafeShelter}
                disabled={geo.lat == null}
                className="inline-flex items-center gap-2 rounded-md bg-safe/90 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-safe-foreground hover:bg-safe disabled:opacity-50"
              >
                <Navigation2 className="h-3.5 w-3.5" /> Generate Evacuation Route
              </button>
              {route && (
                <button
                  onClick={() => { setRoute(null); setRouteTo(null); }}
                  className="rounded-md border border-border px-3 py-1.5 text-[10px] uppercase tracking-widest hover:border-danger hover:text-danger"
                >
                  Clear Route
                </button>
              )}
              <span className="ml-auto text-[10px] uppercase tracking-widest text-muted-foreground">
                {loading ? "Streaming live feeds…" : `${data.length} active hazards worldwide`}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <EnvironmentDashboard lat={geo.lat} lng={geo.lng} />

            <HazardRadar user={{ lat: geo.lat, lng: geo.lng }} disasters={data} />

            <ShelterLocator
              user={{ lat: geo.lat, lng: geo.lng }}
              disasters={data}
              onRoute={(dest) => computeRoute(dest)}
              autoRouted={!!route && !!routeTo}
            />

            {/* AI risk panel */}
            <div className="glass rounded-xl p-4">
              <div className="mb-3 flex items-center gap-2 font-display text-sm tracking-wider">
                <Activity className="h-4 w-4 text-primary" /> AI RISK ANALYSIS
              </div>
              {(() => {
                const nearest = ranked[0] as (LiveDisaster & { _km?: number }) | undefined;
                if (!nearest) return <div className="text-xs text-muted-foreground">No live hazards detected.</div>;
                const km = nearest._km ?? 0;
                const score = Math.max(0, Math.min(100, Math.round(100 - km / 50 + (nearest.severity === "extreme" ? 30 : nearest.severity === "high" ? 20 : 0))));
                return (
                  <>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Personal Risk Index</span>
                      <span className="font-mono text-foreground">{score}/100</span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded bg-secondary">
                      <motion.div
                        initial={{ width: 0 }} animate={{ width: `${score}%` }}
                        className="h-full"
                        style={{ background: score > 70 ? "var(--color-danger)" : score > 40 ? "var(--color-warn)" : "var(--color-safe)" }}
                      />
                    </div>
                    <div className="mt-3 flex items-start gap-2 text-xs text-muted-foreground">
                      <Shield className="mt-0.5 h-3.5 w-3.5 text-safe" />
                      <span>
                        {score > 70
                          ? `${nearest.category} ${km.toFixed(0)} km away — prepare to evacuate. Identify safe shelter and emergency kit.`
                          : score > 40
                            ? `Elevated risk from ${nearest.category}. Stay informed and avoid affected areas.`
                            : "Conditions stable. Continue routine activity, monitor official advisories."}
                      </span>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
