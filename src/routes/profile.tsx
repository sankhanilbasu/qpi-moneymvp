import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { BadgeCheck, Mail, Pause, Pencil, Play, Store, Trash2, Wallet } from "lucide-react";
import { AppShell, Card } from "@/components/AppShell";
import { IdUpload } from "@/components/IdUpload";
import { TrustRing } from "@/components/TrustRing";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/app-state";
import { categories, formatPrice, initialsOf } from "@/lib/discovery";
import { heldTotal } from "@/lib/escrow";
import { useMyTrust } from "@/lib/marketplace";
import { deleteOffer, saveOffer, useSandbox } from "@/lib/sandbox-store";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — QPi.money" },
      { name: "description", content: "Your Trust score, storefront, wallet and credentials." },
      { property: "og:title", content: "Profile — QPi.money" },
      { property: "og:description", content: "Your Trust score, storefront, wallet and credentials." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Profile,
});

function Profile() {
  const navigate = useNavigate();
  const { user, storefront, offers, wallet, commitments } = useSandbox();
  const trust = useMyTrust();
  const name = user?.name ?? "Guest";
  return (
    <AppShell title="Profile">
      <section className="flex flex-col items-center gap-1 py-4">
        <TrustRing name={name} initials={initialsOf(name)} input={trust} avatar={user?.avatar} source="Your sandbox activity" large />
        <p className="mt-1 font-semibold">{name}</p>
        <span className="text-xs text-muted-foreground">{commitments.filter(c => c.status === "completed").length} completed · {trust.completedTransactions ? "Built from your activity" : "Starting from the bureau seed"}</span>
      </section>
      <Link to="/wallet"><Card className="bg-gradient-copper text-primary-foreground">
        <div className="flex items-center gap-2 text-sm opacity-90"><Wallet className="h-4 w-4" /> Wallet · Sandbox</div>
        <p className="mt-2 text-3xl font-semibold tabular-nums">{formatPrice(wallet.balance)}</p>
        <p className="text-xs opacity-80">{formatPrice(heldTotal(wallet))} in escrow · view history</p>
      </Card></Link>

      <div className="mb-2 mt-5 flex items-center justify-between"><h2 className="text-sm font-semibold text-muted-foreground">Storefront</h2>{storefront && <Button asChild size="sm" variant="link"><Link to="/create">Add offer</Link></Button>}</div>
      {!storefront ? <Card className="flex flex-col items-start gap-2"><p className="flex items-center gap-2 text-sm"><Store className="h-4 w-4 text-primary" />Anyone can sell on QPi.</p><Button asChild size="sm"><Link to="/create">Set up a storefront</Link></Button></Card> : <>
        <Card className="mb-2"><p className="font-medium">{storefront.name}</p><p className="text-xs text-muted-foreground">{categories.find(c => c.id === storefront.category)?.label} · {storefront.description}</p></Card>
        {!offers.length && <p className="text-sm text-muted-foreground">No offers yet.</p>}
        <div className="flex flex-col gap-2">{offers.map(o => (
          <Card key={o.id} className="flex items-center gap-3 py-3">
            {o.photo && <img src={o.photo} alt="" className="h-12 w-12 rounded-lg object-cover" />}
            <div className="min-w-0 flex-1"><p className="truncate font-medium">{o.title}</p><p className="text-xs text-muted-foreground">{formatPrice(o.price)} · {o.paused ? "Paused" : "Live"}</p></div>
            <Button asChild size="icon" variant="ghost" aria-label={`Edit ${o.title}`}><Link to="/create" search={{ edit: o.id }}><Pencil /></Link></Button>
            <Button size="icon" variant="ghost" aria-label={o.paused ? `Resume ${o.title}` : `Pause ${o.title}`} onClick={() => saveOffer({ ...o, paused: !o.paused })}>{o.paused ? <Play /> : <Pause />}</Button>
            <Button size="icon" variant="ghost" aria-label={`Delete ${o.title}`} onClick={() => { if (confirm(`Delete "${o.title}"?`)) deleteOffer(o.id); }}><Trash2 /></Button>
          </Card>
        ))}</div>
      </>}

      <h2 className="mb-2 mt-5 text-sm font-semibold text-muted-foreground">Credentials</h2>
      <div className="flex flex-col gap-2">
        <Card className="flex items-center gap-2 py-3 text-sm"><Mail className="h-4 w-4 text-primary" />{user?.email}<span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground"><BadgeCheck className="h-3.5 w-3.5" />Sandbox</span></Card>
        <IdUpload />
      </div>
      <Button variant="outline" onClick={() => { signOut(); navigate({ to: "/" }); }} className="mt-6 h-12 w-full rounded-xl font-medium">Log out & clear sandbox data</Button>
    </AppShell>
  );
}
