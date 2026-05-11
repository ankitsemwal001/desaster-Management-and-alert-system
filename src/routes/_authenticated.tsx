import { createFileRoute, Outlet, Navigate, Link } from "@tanstack/react-router";
import { Loader2, ShieldAlert } from "lucide-react";
import { useAuth, type AppRole, ROLE_LABELS } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authenticated")({
  component: AuthGate,
});

function AuthGate() {
  const { loading, user } = useAuth();
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" />;
  return <Outlet />;
}

/** Reusable role-gate UI for nested role-protected routes. */
export function RoleGate({ allow, children }: { allow: AppRole; children: React.ReactNode }) {
  const { role, loading } = useAuth();
  if (loading || role === null) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }
  if (role !== allow) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="glass max-w-md rounded-2xl p-8 text-center">
          <ShieldAlert className="mx-auto h-10 w-10 text-danger" />
          <h2 className="mt-3 font-display text-xl">ACCESS DENIED</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            This console requires the <b className="text-primary">{ROLE_LABELS[allow]}</b> role.
            Your account is registered as <b>{ROLE_LABELS[role]}</b>.
          </p>
          <Link to="/" className="mt-5 inline-block rounded-md border border-primary px-4 py-2 text-xs uppercase tracking-widest text-primary hover:bg-primary hover:text-primary-foreground">
            Return to overview
          </Link>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}
