import type { Commitment } from "./commitments";
import type { TrustInput } from "./trust-score";

const HOUR = 3_600_000, DAY = 86_400_000;
/** Friction contributions for sandbox disputes. */
export const DISPUTE_RULES = { resolvedFriction: 0.03, openPenalty: 0.05, escalatedFriction: 0.1, scheduleWindowHours: 24 } as const;

/** Converts commitment history into Trust score inputs. No activity → bureau seed only. */
export function trustFromActivity(commitments: Commitment[], now: number): TrustInput {
  const counted = commitments.filter(c => ["accepted", "delivered", "completed", "disputed", "refunded"].includes(c.status));
  const completed = counted.filter(c => c.status === "completed" && c.completedAt !== undefined);
  const sum = (list: Commitment[]) => list.reduce((s, c) => s + c.quantity, 0);
  const escalated = counted.filter(c => c.dispute?.state === "escalated");
  return {
    completedTransactions: completed.length,
    unitsCommitted: sum(counted),
    unitsDelivered: sum(counted.filter(c => c.deliveredAt !== undefined)),
    unitsConsumed: sum(completed),
    milestones: completed.map(c => ({ scheduledDue: c.scheduledFor / HOUR, actualSettled: c.deliveredAt! / HOUR, window: DISPUTE_RULES.scheduleWindowHours })),
    uniqueCounterparties: new Set(counted.map(c => c.producerId)).size,
    totalTransactions: counted.length,
    rawDisputeFriction: counted.filter(c => c.dispute?.state === "resolved").length * DISPUTE_RULES.resolvedFriction,
    pendingPenalty: counted.filter(c => c.dispute?.state === "open").length * DISPUTE_RULES.openPenalty,
    escalatedDisputes: escalated.map(c => {
      const settledAt = c.dispute!.settledAt ?? now;
      return { initialFriction: DISPUTE_RULES.escalatedFriction, cleanTransactions: completed.filter(x => x.completedAt! > settledAt && !x.dispute).length, daysElapsed: Math.max(0, (now - settledAt) / DAY) };
    }),
  };
}
