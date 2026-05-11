import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Activity, ArrowRight, Brain, Radar, Satellite, Siren, Waves, Wind } from "lucide-react";
import { CommandHeader } from "@/components/command-header";
import { DisasterMap } from "@/components/disaster-map";
import { AlertCard } from "@/components/alert-card";
import { DISASTERS } from "@/lib/disaster-data";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "DAMS — AI Disaster Alert & Management System" },
      { name: "description", content: "Real-time multi-hazard disaster monitoring, AI prediction, IoT sensors, GIS mapping, and emergency response." },
    ],
  }),
});

const STATS = [
  { label: "Active Alerts", value: "27", trend: "+4 today", color: "var(--color-danger)" },
  { label: "Sensors Online", value: "18,420", trend: "99.7% uptime", color: "var(--color-safe)" },
  { label: "Lives Protected", value: "12.4M", trend: "across 31 districts", color: "var(--color-cyber)" },
  { label: "Avg Response", value: "2.4m", trend: "−18% MoM", color: "var(--color-warn)" },
];

function Landing() {
  return (
    <div className="min-h-screen">
      <CommandHeader />

      {/* HERO */}
      <section className="mx-auto max-w-[1600px] px-4 pt-10 md:pt-16">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_1fr] lg:items-center">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 rounded-full border border-border glass px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-muted-foreground"
            >
              <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-danger text-danger" />
              National Operations Center · LIVE
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="mt-5 font-display text-4xl leading-[1.05] sm:text-5xl md:text-6xl"
            >
              Protecting Lives with{" "}
              <span className="text-gradient-cyber">AI &amp; IoT</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="mt-4 max-w-xl text-sm text-muted-foreground md:text-base"
            >
              DAMS fuses live IoT sensor streams, satellite feeds, and AI prediction models to detect
              floods, earthquakes, cyclones and more — and dispatches geo-targeted alerts and evacuation
              routes in seconds.
            </motion.p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/civilian"
                className="group inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-cyber)] transition hover:scale-[1.02]"
              >
                Open Civilian Console <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </Link>
              <Link
                to="/authority"
                className="inline-flex items-center gap-2 rounded-md border border-border glass px-5 py-2.5 text-sm font-semibold text-foreground hover:border-primary"
              >
                Authority Command
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4">
              {STATS.map((s) => (
                <div key={s.label} className="glass rounded-lg p-3">
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{s.label}</div>
                  <div className="mt-1 font-display text-2xl" style={{ color: s.color }}>{s.value}</div>
                  <div className="text-[10px] text-muted-foreground">{s.trend}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Map preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="relative"
          >
            <div className="absolute -inset-4 rounded-2xl bg-[var(--gradient-cyber)] opacity-20 blur-2xl" />
            <div className="relative glass rounded-xl p-3">
              <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-widest text-muted-foreground">
                <span className="flex items-center gap-2"><Radar className="h-3.5 w-3.5 text-primary" /> Live Hazard Grid · IN</span>
                <span className="text-safe">● STREAMING</span>
              </div>
              <DisasterMap height="420px" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* CAPABILITIES */}
      <section className="mx-auto mt-20 max-w-[1600px] px-4">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Capabilities</div>
            <h2 className="font-display text-2xl md:text-3xl">A unified emergency response stack</h2>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Satellite, title: "Multi-Source Ingestion", body: "IoT gateways, weather APIs, satellite & seismic feeds — fused into one stream." },
            { icon: Brain,     title: "AI Prediction Engine",   body: "Severity scoring, flood probability, landslide & rainfall forecasts." },
            { icon: Siren,     title: "Geo-Targeted Alerts",    body: "Push, SMS, email & in-app — multilingual, with offline fallback." },
            { icon: Activity,  title: "Real-Time Command",      body: "Dashboards for civilians, authorities, and relief agencies." },
          ].map((c, i) => (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="glass group rounded-xl p-5 transition hover:border-primary"
            >
              <c.icon className="h-6 w-6 text-primary" />
              <div className="mt-3 font-display text-base">{c.title}</div>
              <div className="mt-1 text-sm text-muted-foreground">{c.body}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* LIVE FEED */}
      <section className="mx-auto my-20 max-w-[1600px] px-4">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Live Feed</div>
            <h2 className="font-display text-2xl md:text-3xl">Active disaster events</h2>
          </div>
          <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest text-muted-foreground">
            <span className="flex items-center gap-1 text-danger"><Waves className="h-3 w-3" /> Hydro</span>
            <span className="flex items-center gap-1 text-warn"><Wind className="h-3 w-3" /> Atmos</span>
            <span className="flex items-center gap-1 text-safe"><Activity className="h-3 w-3" /> Seismic</span>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {DISASTERS.map((d, i) => <AlertCard key={d.id} d={d} index={i} />)}
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        DAMS · Disaster Alert &amp; Management System · Powered by AI &amp; IoT
      </footer>
    </div>
  );
}
