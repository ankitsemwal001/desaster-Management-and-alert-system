import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Shield, AlertCircle, Loader2, Users, Building2, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ROLE_HOME, useAuth, type AppRole } from "@/hooks/use-auth";

export const Route = createFileRoute("/signup")({
  component: SignupPage,
  head: () => ({ meta: [{ title: "Register — DAMS" }] }),
});

const ROLES: { value: AppRole; label: string; desc: string; icon: typeof Users }[] = [
  { value: "civilian",  label: "Civilian",       desc: "Receive alerts & find shelters", icon: Users },
  { value: "authority", label: "Authority",      desc: "District / state command center", icon: Building2 },
  { value: "agency",    label: "Relief Agency",  desc: "Coordinate rescue & supplies",   icon: Heart },
];

function SignupPage() {
  const { user, role: currentRole, loading } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [district, setDistrict] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<AppRole>("civilian");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user && currentRole) navigate({ to: ROLE_HOME[currentRole] });
  }, [loading, user, currentRole, navigate]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const redirect = typeof window !== "undefined" ? window.location.origin : undefined;
    const { error } = await supabase.auth.signUp({
      email, password,
      options: {
        emailRedirectTo: redirect,
        data: { display_name: displayName, district, role },
      },
    });
    setSubmitting(false);
    if (error) setError(error.message);
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <form onSubmit={onSubmit} className="glass w-full max-w-2xl rounded-2xl p-7">
        <div className="mb-6 flex flex-col items-center text-center">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="mt-3 font-display text-2xl tracking-wider text-gradient-cyber">DAMS · Register</h1>
          <p className="mt-1 text-xs text-muted-foreground">Choose your operational role</p>
        </div>

        {error && (
          <div className="mb-4 flex items-start gap-2 rounded-md border border-danger/40 bg-danger/10 p-2 text-xs text-danger">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> <span>{error}</span>
          </div>
        )}

        <div className="mb-4 grid gap-3 sm:grid-cols-3">
          {ROLES.map((r) => {
            const active = role === r.value;
            return (
              <button
                key={r.value} type="button" onClick={() => setRole(r.value)}
                className={`text-left rounded-lg border p-3 transition ${
                  active ? "border-primary bg-primary/10 glow-cyber" : "border-border hover:border-primary/60"
                }`}
              >
                <r.icon className={`h-5 w-5 ${active ? "text-primary" : "text-muted-foreground"}`} />
                <div className="mt-2 text-sm font-semibold">{r.label}</div>
                <div className="text-[11px] text-muted-foreground">{r.desc}</div>
              </button>
            );
          })}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Display name">
            <input required value={displayName} onChange={(e) => setDisplayName(e.target.value)}
              className="input" placeholder="Captain A. Sharma" />
          </Field>
          <Field label="District / Region">
            <input value={district} onChange={(e) => setDistrict(e.target.value)}
              className="input" placeholder="Haridwar, UK" />
          </Field>
          <Field label="Email">
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="input" placeholder="you@agency.gov" />
          </Field>
          <Field label="Password (min 8)">
            <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)}
              className="input" placeholder="••••••••" />
          </Field>
        </div>

        <button
          type="submit" disabled={submitting}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary py-2.5 text-sm font-bold uppercase tracking-widest text-primary-foreground shadow-[var(--shadow-cyber)] hover:opacity-90 disabled:opacity-60"
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />} Create Account
        </button>

        <div className="mt-4 text-center text-xs text-muted-foreground">
          Already registered?{" "}
          <Link to="/login" className="text-primary hover:underline">Sign in</Link>
        </div>

        <style>{`.input { width:100%; border-radius: 6px; border:1px solid var(--color-border); background: oklch(0.16 0.03 250 / 0.6); padding: 8px 12px; font-size: 13px; outline:none; } .input:focus { border-color: var(--color-primary); }`}</style>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] uppercase tracking-widest text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
