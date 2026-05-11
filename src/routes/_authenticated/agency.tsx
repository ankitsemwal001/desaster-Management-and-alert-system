import { createFileRoute } from "@tanstack/react-router";
import { CommandHeader } from "@/components/command-header";
import { Heart, Package, Users, Utensils, Droplet, Pill } from "lucide-react";
import { SHELTERS } from "@/lib/disaster-data";
import { motion } from "framer-motion";

import { RoleGate } from "@/routes/_authenticated";

export const Route = createFileRoute("/_authenticated/agency")({
  component: () => <RoleGate allow="agency"><AgencyDashboard /></RoleGate>,
  head: () => ({ meta: [{ title: "Relief Agency — DAMS" }] }),
});

const SUPPLIES = [
  { icon: Utensils, label: "Food Packets", stock: 18420, target: 25000, color: "var(--color-warn)" },
  { icon: Droplet,  label: "Water (L)",    stock: 92000, target: 100000, color: "var(--color-cyber)" },
  { icon: Pill,     label: "Medkits",      stock: 1240,  target: 2000,  color: "var(--color-danger)" },
  { icon: Package,  label: "Blankets",     stock: 7800,  target: 8000,  color: "var(--color-safe)" },
];

const REQUESTS = [
  { id: "RQ-101", type: "Medical", location: "Haridwar Camp 2", priority: "high" },
  { id: "RQ-102", type: "Food",    location: "Puri Shelter A",  priority: "moderate" },
  { id: "RQ-103", type: "Rescue",  location: "Sikkim Zone 4",   priority: "high" },
  { id: "RQ-104", type: "Water",   location: "Vizag Plant 7",   priority: "low" },
];

function AgencyDashboard() {
  return (
    <div className="min-h-screen pb-12">
      <CommandHeader />
      <div className="mx-auto max-w-[1600px] px-4 pt-6">
        <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Relief Agency</div>
        <h1 className="font-display text-2xl md:text-3xl">Operations & Supply Chain</h1>

        <div className="mt-5 grid gap-3 md:grid-cols-4">
          {SUPPLIES.map((s, i) => {
            const pct = Math.round((s.stock / s.target) * 100);
            return (
              <motion.div key={s.label} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.05 }}
                className="glass rounded-lg p-4">
                <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-muted-foreground">
                  <span className="flex items-center gap-2"><s.icon className="h-3.5 w-3.5" style={{ color: s.color }} />{s.label}</span>
                  <span style={{ color: s.color }}>{pct}%</span>
                </div>
                <div className="mt-1 font-display text-xl">{s.stock.toLocaleString()} <span className="text-xs text-muted-foreground">/ {s.target.toLocaleString()}</span></div>
                <div className="mt-2 h-1.5 overflow-hidden rounded bg-secondary">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} className="h-full" style={{ background: s.color }} />
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <div className="glass rounded-xl p-4">
            <div className="mb-3 flex items-center gap-2 font-display text-sm tracking-wider">
              <Heart className="h-4 w-4 text-danger" /> RESCUE REQUESTS
            </div>
            <div className="space-y-2">
              {REQUESTS.map((r) => (
                <div key={r.id} className="flex items-center justify-between rounded-md border border-border bg-muted/30 px-3 py-2 text-sm">
                  <div>
                    <div className="font-mono text-xs text-primary">{r.id} · {r.type}</div>
                    <div className="text-muted-foreground text-[11px]">{r.location}</div>
                  </div>
                  <span className={`rounded px-2 py-0.5 text-[10px] uppercase ${
                    r.priority === "high" ? "bg-danger/20 text-danger" :
                    r.priority === "moderate" ? "bg-warn/20 text-warn" : "bg-safe/20 text-safe"
                  }`}>{r.priority}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass rounded-xl p-4">
            <div className="mb-3 flex items-center gap-2 font-display text-sm tracking-wider">
              <Users className="h-4 w-4 text-primary" /> SHELTER MANAGEMENT
            </div>
            <div className="space-y-2">
              {SHELTERS.map((s) => {
                const pct = (s.occupied / s.capacity) * 100;
                return (
                  <div key={s.id} className="rounded-md border border-border bg-muted/30 p-3">
                    <div className="flex items-center justify-between text-sm">
                      <div>
                        <div>{s.name}</div>
                        <div className="text-[11px] text-muted-foreground capitalize">{s.type}</div>
                      </div>
                      <div className="font-mono text-xs text-muted-foreground">{s.occupied}/{s.capacity}</div>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded bg-secondary">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} className="h-full"
                        style={{ background: pct > 80 ? "var(--color-danger)" : pct > 60 ? "var(--color-warn)" : "var(--color-safe)" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
