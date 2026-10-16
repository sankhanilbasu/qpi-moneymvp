import type { TrustInput } from "./trust-score";

// Phase 1 still uses mocked authentication. These are illustrative inputs, not
// bureau records, verified credentials, or real transaction histories.
const baseline: TrustInput = {
  bureauSeed: 75, completedTransactions: 30,
  unitsConsumed: 98, unitsDelivered: 100, unitsCommitted: 100,
  milestones: [{ scheduledDue: 100, actualSettled: 102, window: 100 }, { scheduledDue: 200, actualSettled: 200, window: 100 }],
  uniqueCounterparties: 12, totalTransactions: 30,
  rawDisputeFriction: 0, pendingPenalty: 0, escalatedDisputes: [],
};

export const profileTrust: TrustInput = {
  ...baseline, completedTransactions: 60, totalTransactions: 60, uniqueCounterparties: 24,
  pendingPenalty: 0.04,
  escalatedDisputes: [{ initialFriction: 0.12, cleanTransactions: 8, daysElapsed: 45 }],
};

export const demoProducers = [
  { name: "Riverside Bakery", initials: "RB", dist: "0.4 km", category: "Bakery", trust: baseline },
  { name: "Copperleaf Farm", initials: "CF", dist: "1.2 km", category: "Farm", trust: { ...baseline, completedTransactions: 12, totalTransactions: 12, uniqueCounterparties: 3, unitsConsumed: 85, unitsDelivered: 90, rawDisputeFriction: 0.12 } },
  { name: "Atlas Repair Co.", initials: "AR", dist: "2.7 km", category: "Repairs", trust: { ...baseline, rawDisputeFriction: 0.38, pendingPenalty: 0.15, escalatedDisputes: [{ initialFriction: 0.1, cleanTransactions: 3, daysElapsed: 60 }] } },
] satisfies Array<{ name: string; initials: string; dist: string; category: string; trust: TrustInput }>;