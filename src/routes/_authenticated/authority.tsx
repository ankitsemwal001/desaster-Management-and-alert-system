import { createFileRoute } from "@tanstack/react-router";
import { CommandHeader } from "@/components/command-header";
import { DisasterMap } from "@/components/disaster-map";
import { AlertCard } from "@/components/alert-card";
import { DISASTERS, severityScore } from "@/lib/disaster-data";
import { Brain, Radio, Users, Truck, Lock, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

import { RoleGate } from "@/routes/_authenticated";

export const Route = createFileRoute("/_authenticated/authority")({
  component: () => <RoleGate allow="authority"><AuthorityDashboard /></RoleGate>,
  head: () => ({ meta: [{ title: "Authority Command — DAMS" }] }),
});

const TEAMS = [
  { id: "T-01", name: "NDRF Alpha", deployed: "Haridwar", status: "active" },
  { id: "T-02", name: "Coast Guard 7", deployed: "Puri", status: "active" },
  { id: "T-03", name: "Mountain Rescue", deployed: "Sikkim", status: "standby" },
  { id: "T-04", name: "HAZMAT Unit 3", deployed: "Vizag", status: "active" },
];

function AuthorityDashboard() {
  const total = DISASTERS.reduce((a, d) => a + d.affected, 0);
  const avgRisk = DISASTERS.reduce((a, d) => a + severityScore(d.severity), 0) / DISASTERS.length;

  return (
    <div className="min-h-screen pb-12">
      <CommandHeader />
      <div className="mx-auto max-w-[1600px] px-4 pt-6">
        <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Authority Command</div>
        <h1 className="font-display text-2xl md:text-3xl">National Operations Center</h1>

        <div className="mt-5 grid gap-3 md:grid-cols-4">
          {[
            { icon: Radio,      label: "Active Incidents", val: DISASTERS.length, sub: "live", color: "var(--color-danger)" },
            { icon: Users,      label: "People Affected",  val: total.toLocaleString(), sub: "across districts", color: "var(--color-warn)" },
            { icon: Brain,      label: "AI Risk Index",    val: avgRisk.toFixed(2), sub: "/ 4.00", color: "var(--color-cyber)" },
            { icon: TrendingUp, label: "Predicted Surge",  val: "+18%", sub: "next 6h", color: "var(--color-warn)" },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.05 }}
              className="glass rounded-lg p-4">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground">
                <s.icon className="h-3.5 w-3.5" style={{ color: s.color }} /> {s.label}
              </div>
              <div className="mt-1 font-display text-2xl" style={{ color: s.color }}>{s.val}</div>
              <div className="text-[10px] text-muted-foreground">{s.sub}</div>
            </motion.div>
          ))}
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
          <div className="glass rounded-xl p-3">
            <div className="mb-2 text-[10px] uppercase tracking-widest text-muted-foreground">National Hazard Grid</div>
            <DisasterMap height="540px" />
          </div>
          <div className="space-y-4">
            <div className="glass rounded-xl p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="font-display text-sm tracking-wider">INCIDENT QUEUE</div>
                <button className="rounded border border-primary px-2 py-1 text-[10px] uppercase tracking-widest text-primary hover:bg-primary hover:text-primary-foreground">
                  Broadcast Alert
                </button>
              </div>
              <div className="max-h-[420px] space-y-2 overflow-auto pr-1">
                {DISASTERS.map((d, i) => <AlertCard key={d.id} d={d} index={i} />)}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="glass rounded-xl p-4">
            <div className="mb-3 flex items-center gap-2 font-display text-sm tracking-wider">
              <Truck className="h-4 w-4 text-primary" /> RESCUE TEAMS
            </div>
            <div className="overflow-hidden rounded-md border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-[10px] uppercase tracking-widest text-muted-foreground">
                  <tr><th className="px-3 py-2 text-left">ID</th><th className="px-3 py-2 text-left">Team</th><th className="px-3 py-2 text-left">Deployed</th><th className="px-3 py-2 text-left">Status</th></tr>
                </thead>
                <tbody>
                  {TEAMS.map((t) => (
                    <tr key={t.id} className="border-t border-border">
                      <td className="px-3 py-2 font-mono text-primary">{t.id}</td>
                      <td className="px-3 py-2">{t.name}</td>
                      <td className="px-3 py-2 text-muted-foreground">{t.deployed}</td>
                      <td className="px-3 py-2">
                        <span className={`rounded px-2 py-0.5 text-[10px] uppercase ${t.status === "active" ? "bg-danger/20 text-danger" : "bg-muted text-muted-foreground"}`}>
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="glass rounded-xl p-4">
            <div className="mb-3 flex items-center gap-2 font-display text-sm tracking-wider">
              <Lock className="h-4 w-4 text-warn" /> ZONE LOCKDOWN
            </div>
            <div className="space-y-2 text-sm">
              {DISASTERS.slice(0, 4).map((d) => (
                <div key={d.id} className="flex items-center justify-between rounded-md border border-border bg-muted/30 px-3 py-2">
                  <div>
                    <div className="text-foreground">{d.location}</div>
                    <div className="text-[11px] text-muted-foreground">{d.title}</div>
                  </div>
                  <button className="rounded border border-danger/60 px-3 py-1 text-[10px] uppercase tracking-widest text-danger hover:bg-danger hover:text-danger-foreground">
                    Lockdown
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
