import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { QpiMark } from "@/components/QpiMark";
import { signIn, type Role } from "@/lib/app-state";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "QPi.money — Welcome" },
      { name: "description", content: "Sign in to QPi.money, the trust platform for consumers and producers." },
      { property: "og:title", content: "QPi.money — Welcome" },
      { property: "og:description", content: "Sign in to QPi.money, the trust platform for consumers and producers." },
    ],
  }),
  component: Welcome,
});

function Welcome() {
  const [role, setRole] = useState<Role>("consumer");
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-muted">
      <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-8 bg-background px-6 py-12">
        <div className="flex flex-col items-center gap-4 text-center">
          <QpiMark size={88} />
          <h1 className="text-3xl font-semibold tracking-tight">QPi.money</h1>
          <p className="text-sm text-muted-foreground">Trust, commitments and commerce — in your pocket.</p>
        </div>
        <div className="w-full">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">I am a</p>
          <div className="grid grid-cols-2 gap-1 rounded-xl bg-muted p-1">
            {(["consumer", "producer"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`rounded-lg py-2.5 text-sm font-medium capitalize transition ${
                  role === r ? "bg-background text-foreground shadow" : "text-muted-foreground"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
        <div className="flex w-full flex-col gap-3">
          <button
            onClick={() => {
              signIn(role);
              navigate({ to: "/discover" });
            }}
            className="rounded-xl bg-primary py-3.5 text-base font-semibold text-primary-foreground shadow-copper transition active:scale-[0.98]"
          >
            Login
          </button>
          <button disabled className="rounded-xl border border-border py-3.5 text-base font-semibold text-muted-foreground opacity-50">
            Sign Up
          </button>
          <p className="text-center text-xs text-muted-foreground">Sign up opens soon.</p>
        </div>
      </div>
    </div>
  );
}
