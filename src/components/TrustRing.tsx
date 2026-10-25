import { useId } from "react";
import { Shield, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { calculateTrustScore, trustTier, type TrustInput } from "@/lib/trust-score";

const percent = (value: number) => `${(value * 100).toFixed(1)}%`;

export function TrustRing({ name, initials, input, large = false, avatar, onSelect, selected = false, source = "Illustrative transaction history" }: { source?: string | undefined; name: string; initials: string; input: TrustInput; large?: boolean; avatar?: string | undefined; onSelect?: () => void; selected?: boolean }) {
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
          <Factor label="Fulfillment consistency · Fc" value={percent(result.fulfillment)} detail={`${input.unitsConsumed} consumed + ${input.unitsDelivered} delivered ÷ (2 × ${input.unitsCommitted} committed). Weight: 50%.`} />
          <Factor label="Schedule adherence · Sa" value={percent(result.schedule)} detail={`Mean of 1 − |due − settled| ÷ window, across ${input.milestones.length} milestones. Early and late deviations count equally. Weight: 30%.`} />
          <Factor label="Network reciprocity · Rnet" value={percent(result.reciprocity)} detail={`min((${input.uniqueCounterparties} unique counterparties ÷ ${input.totalTransactions} transactions) × 3, 1). Weight: 20%.`} />
          <Factor label="Native performance" value={result.nativePerformance.toFixed(1)} detail="Weighted native ratios × 100, on the same percentage-point scale as the bureau seed." />
          <Factor label="Bureau Seed" value={result.bureauSeed.toFixed(1)} detail={`Default proxy: 75.0. Five phantom transactions blend the seed with ${input.completedTransactions} native transactions.`} />
          <Factor label="Effective performance · A_eff" value={result.effectivePerformance.toFixed(1)} detail={`(5 × ${result.bureauSeed.toFixed(1)} + ${input.completedTransactions} × ${result.nativePerformance.toFixed(1)}) ÷ (5 + ${input.completedTransactions}).`} />
          <Factor label="Dispute friction · D_r" value={percent(result.disputeFriction)} detail={`Raw friction ${percent(result.rawFriction)} + pending penalty ${percent(input.pendingPenalty)}, clamped from −25% to 100%. Negative friction can boost the score.`} />
        </dl>
        <section className="border-t border-border pt-4 text-sm">
          <h3 className="font-semibold">Redemption Arc</h3>
          {input.escalatedDisputes.length ? input.escalatedDisputes.map((dispute, index) => (
            <p key={index} className="mt-2 text-xs leading-relaxed text-muted-foreground">Dispute {index + 1}: {percent(dispute.initialFriction)} initial friction · {dispute.cleanTransactions}/12 clean transactions · {dispute.daysElapsed}/180 days.</p>
          )) : <p className="mt-1 text-xs text-muted-foreground">No escalated disputes.</p>}
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">Remaining escalated friction: {percent(result.remainingEscalatedFriction)}. Decay uses the greater of clean transactions ÷ 12 or elapsed days ÷ 180, never below zero.</p>
        </section>
        <section className="border-t border-border pt-4 text-sm">
          <div className="flex items-center justify-between gap-2"><h3 className="flex items-center gap-2 font-semibold">{result.armorActive ? <ShieldCheck className="h-4 w-4 text-trust-high" /> : <Shield className="h-4 w-4 text-muted-foreground" />}Reputation Armor</h3><span className="text-xs font-medium">{result.armorActive ? "Active" : "Inactive"}</span></div>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">Requires effective performance ≥ 95.0 and ≥ 50 completed transactions. Ω = {result.omega.toFixed(1)}{result.armorActive ? "; dispute impact is halved." : "; full dispute impact applies."}</p>
        </section>
        <div className="border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground"><p className="font-medium text-foreground">Final Trust score</p><p className="mt-1">{result.effectivePerformance.toFixed(2)} × (1 − {result.omega.toFixed(1)} × {result.disputeFriction.toFixed(3)}) = {result.unclampedScore.toFixed(2)} → {result.score.toFixed(1)} after clamping to 15.0–99.9.</p></div>
      </DialogContent>
    </Dialog>
  );
}

function Factor({ label, value, detail }: { label: string; value: string; detail: string }) {
  return <div className="py-3"><div className="flex items-start justify-between gap-3"><dt className="font-medium">{label}</dt><dd className="shrink-0 font-semibold tabular-nums">{value}</dd></div><p className="mt-1 text-xs leading-relaxed text-muted-foreground">{detail}</p></div>;
}