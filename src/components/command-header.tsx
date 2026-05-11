import { Link } from "@tanstack/react-router";
import { Shield, Radio } from "lucide-react";

export function CommandHeader() {
  return (
    <header className="sticky top-0 z-40 glass border-b border-border">
      <div className="mx-auto flex h-14 max-w-[1600px] items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="relative">
            <Shield className="h-6 w-6 text-primary" />
            <span className="absolute -right-1 -top-1 pulse-dot h-1.5 w-1.5 rounded-full bg-danger text-danger" />
          </div>
          <div className="leading-tight">
            <div className="font-display text-sm tracking-widest text-gradient-cyber">DAMS</div>
            <div className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">Disaster Alert & Mgmt</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 text-xs md:flex">
          {[
            { to: "/", label: "Overview" },
            { to: "/civilian", label: "Civilian" },
            { to: "/authority", label: "Authority" },
            { to: "/agency", label: "Agency" },
          ].map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded px-3 py-1.5 uppercase tracking-wider text-muted-foreground hover:bg-muted hover:text-foreground"
              activeProps={{ className: "rounded px-3 py-1.5 uppercase tracking-wider bg-muted text-primary" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest text-muted-foreground">
          <Radio className="h-3.5 w-3.5 text-safe" />
          <span>
            <span className="text-safe">●</span> SYSTEM ONLINE
          </span>
          <span className="hidden font-mono text-foreground sm:inline">{new Date().toUTCString().slice(17, 25)} UTC</span>
        </div>
      </div>
    </header>
  );
}
