import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { BadgeCheck, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { AppShell, Card } from "@/components/AppShell";
import { getRole, signOut } from "@/lib/app-state";
import { TrustRing } from "@/components/TrustRing";
import { profileTrust } from "@/lib/trust-demo";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — QPi.money" },
      { name: "description", content: "Your Trust score, transaction factors, wallet and credentials." },
      { property: "og:title", content: "Profile — QPi.money" },
      { property: "og:description", content: "Your Trust score, transaction factors, wallet and credentials." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Profile,
});

function Profile() {
  const navigate = useNavigate();
  const [role, setRole] = useState<string | null>(null);
  useEffect(() => setRole(getRole()), []);
  return (
    <AppShell title="Profile">
      <section className="flex flex-col items-center gap-2 py-6">
        <TrustRing name="Your profile" initials={role === "producer" ? "PR" : "CO"} input={profileTrust} large />
        <p className="text-xs capitalize text-muted-foreground">{role ?? ""} account</p>
        <span className="mt-1 text-xs text-muted-foreground">Demo profile · Illustrative Trust score</span>
      </section>
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
      <Button variant="outline" onClick={() => { signOut(); navigate({ to: "/" }); }} className="mt-6 h-12 w-full rounded-xl font-medium">
        Log out
      </Button>
    </AppShell>
  );
}
