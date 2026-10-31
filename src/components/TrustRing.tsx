import { useId } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { calculateTrustScore, trustTier, type TrustInput } from "@/lib/trust-score";

export function TrustRing({ name, initials, input, large = false, avatar, onSelect, selected = false, source = "Illustrative transaction history", showHelp = false }: { source?: string | undefined; name: string; initials: string; input: TrustInput; large?: boolean; avatar?: string | undefined; onSelect?: () => void; selected?: boolean; showHelp?: boolean }) {
  const gradientId = `trust-${useId().replace(/:/g, "")}`;
  const result = calculateTrustScore(input);
  const tier = trustTier(result.score);
  const trigger = (
        <Button variant="ghost" onClick={onSelect} aria-pressed={onSelect ? selected : undefined} aria-label={`${name} Trust score ${result.score.toFixed(1)} — ${onSelect ? "view offers" : "view breakdown"}`} title={onSelect ? `${name} offers` : "Trust score breakdown"} className={`trust-ring-trigger trust-${tier} ${large ? "trust-ring-large" : "trust-ring-small"} ${selected ? "story-selected" : ""}`}>
          <span className="trust-ring-avatar">
            <svg viewBox="0 0 100 100" aria-hidden="true" className="trust-ring-svg">
              <defs><linearGradient id={gradientId} x1="0" y1="1" x2="1" y2="0"><stop offset="0%" className="trust-gradient-start" /><stop offset="100%" className="trust-gradient-end" /></linearGradient></defs>
              <circle cx="50" cy="50" r="45" fill="none" className="stroke-muted" strokeWidth="5" />
              <circle cx="50" cy="50" r="45" fill="none" stroke={`url(#${gradientId})`} strokeWidth="5" strokeLinecap="round" pathLength="100" strokeDasharray={`${result.score} 100`} transform="rotate(-90 50 50)" className="trust-progress" />
            </svg>
            {avatar ? <img src={avatar} alt="" className="trust-avatar-photo" /> : <span className="trust-initials">{initials}</span>}
            {showHelp && <span aria-hidden="true" className="absolute left-1/2 top-1 -translate-x-1/2 flex h-5 w-5 items-center justify-center rounded-full border border-border bg-background text-xs font-semibold text-muted-foreground">?</span>}
          </span>
          <span className="trust-ring-number tabular-nums">{result.score.toFixed(1)}</span>
          {large && <span className="text-sm font-medium text-muted-foreground">Trust score</span>}
        </Button>
  );
  if (onSelect) return trigger;
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[88dvh] w-[calc(100%-1.5rem)] max-w-md overflow-y-auto rounded-lg p-5">
        <DialogHeader>
          <DialogTitle>Trust score breakdown</DialogTitle>
          <DialogDescription>{name} · {source}</DialogDescription>
        </DialogHeader>
        <div className={`trust-${tier} flex items-end justify-between border-b border-border pb-4`}>
          <div><p className="trust-tone text-4xl font-semibold tabular-nums">{result.score.toFixed(1)}<span className="ml-1 text-sm font-normal text-muted-foreground">/ 100</span></p><p className="mt-1 text-xs text-muted-foreground">{input.completedTransactions} completed transactions</p></div>
          <span className="text-xs text-muted-foreground">Range 15.0–99.9</span>
        </div>
        <dl className="divide-y divide-border text-sm">
          <Factor label="Fulfillment consistency" detail="How reliably commitments are fulfilled." />
          <Factor label="Schedule adherence" detail="How closely settlements follow the agreed schedule." />
          <Factor label="Network reciprocity" detail="The variety of people you transact with." />
          <Factor label="Native performance" detail="Your overall reliability across transactions on QPi." />
          <Factor label="Bureau seed" detail="Your starting score before activity builds up." />
          <Factor label="Effective performance" detail="Your starting score combined with your transaction record." />
          <Factor label="Dispute friction" detail="The impact of disputes and unresolved commitments." />
          <Factor label="Redemption Arc" detail="Reliable activity and time reduce the impact of past disputes." />
          <Factor label="Reputation Armor" detail="An established record of reliability can reduce dispute impact." />
        </dl>
      </DialogContent>
    </Dialog>
  );
}

function Factor({ label, detail }: { label: string; detail: string }) {
  return <div className="py-3"><dt className="font-medium">{label}</dt><dd className="mt-1 text-xs leading-relaxed text-muted-foreground">{detail}</dd></div>;
}