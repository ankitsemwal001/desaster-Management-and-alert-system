import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Shield, AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ROLE_HOME, useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({ meta: [{ title: "Sign in — DAMS" }] }),
});

function LoginPage() {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user && role) navigate({ to: ROLE_HOME[role] });
  }, [loading, user, role, navigate]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);
    if (error) setError(error.message);
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form onSubmit={onSubmit} className="glass relative w-full max-w-md rounded-2xl p-7">
        <div className="mb-6 flex flex-col items-center text-center">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="mt-3 font-display text-2xl tracking-wider text-gradient-cyber">DAMS · Sign In</h1>
          <p className="mt-1 text-xs text-muted-foreground">Authorized personnel & civilians only</p>
        </div>

        {error && (
          <div className="mb-4 flex items-start gap-2 rounded-md border border-danger/40 bg-danger/10 p-2 text-xs text-danger">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> <span>{error}</span>
          </div>
        )}

        <label className="mb-1 block text-[10px] uppercase tracking-widest text-muted-foreground">Email</label>
        <input
          type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
          className="mb-3 w-full rounded-md border border-border bg-background/60 px-3 py-2 text-sm outline-none focus:border-primary"
          placeholder="you@agency.gov"
        />

        <label className="mb-1 block text-[10px] uppercase tracking-widest text-muted-foreground">Password</label>
        <input
          type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
          className="mb-5 w-full rounded-md border border-border bg-background/60 px-3 py-2 text-sm outline-none focus:border-primary"
          placeholder="••••••••"
        />

        <button
          type="submit" disabled={submitting}
          className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary py-2.5 text-sm font-bold uppercase tracking-widest text-primary-foreground shadow-[var(--shadow-cyber)] hover:opacity-90 disabled:opacity-60"
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />} Authenticate
        </button>

        <div className="mt-4 text-center text-xs text-muted-foreground">
          New to DAMS?{" "}
          <Link to="/signup" className="text-primary hover:underline">Create an account</Link>
        </div>
      </form>
    </div>
  );
}
