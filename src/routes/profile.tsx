import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { BadgeCheck, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { AppShell, Card } from "@/components/AppShell";
import { getRole, signOut } from "@/lib/app-state";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — QPi.money" },
      { name: "description", content: "Your confidence score, wallet and credentials." },
      { property: "og:title", content: "Profile — QPi.money" },
      { property: "og:description", content: "Your confidence score, wallet and credentials." },
    ],
  }),
  component: Profile,
});

function Profile() {
  const navigate = useNavigate();
  const [role, setRole] = useState<string | null>(null);
  useEffect(() => setRole(getRole()), []);
  const score = 87;
  return (
    <AppShell title="Profile">
      <Card className="flex flex-col items-center gap-2 py-6">
        <div className="relative h-32 w-32">
          <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
            <circle cx="18" cy="18" r="16" fill="none" className="stroke-muted" strokeWidth="3" />
            <circle cx="18" cy="18" r="16" fill="none" className="stroke-primary" strokeWidth="3" strokeLinecap="round" strokeDasharray={`${score} 100`} pathLength={100} />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-3xl font-semibold">{score}</span>
        </div>
        <p className="font-medium">Confidence score</p>
        <p className="text-xs capitalize text-muted-foreground">{role ?? ""} account</p>
      </Card>
      <Card className="mt-3 bg-gradient-copper text-primary-foreground">
        <div className="flex items-center gap-2 text-sm opacity-90"><Wallet className="h-4 w-4" /> Wallet</div>
        <p className="mt-2 text-3xl font-semibold">$1,248.50</p>
        <p className="text-xs opacity-80">2 commitments in escrow</p>
      </Card>
      <h2 className="mb-2 mt-5 text-sm font-semibold text-muted-foreground">Credentials</h2>
      <div className="flex flex-col gap-2">
        {["Email verified", "Phone verified", "Identity check"].map((c) => (
          <Card key={c} className="flex items-center gap-2 py-3"><BadgeCheck className="h-5 w-5 text-primary" />{c}</Card>
        ))}
      </div>
      <button onClick={() => { signOut(); navigate({ to: "/" }); }} className="mt-6 w-full rounded-xl border border-border py-3 font-medium">
        Log out
      </button>
    </AppShell>
  );
}
