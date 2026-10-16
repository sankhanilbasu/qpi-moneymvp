/** Native factors are ratios; convert their weighted sum to percentage points
 * before blending with the bureau seed, which is already on a 0–100 scale. */
export const TRUST_RULES = { seedWeight: 5, defaultSeed: 75, fulfillmentWeight: 0.5, scheduleWeight: 0.3, reciprocityWeight: 0.2 } as const;

export interface TrustMilestone { scheduledDue: number; actualSettled: number; window: number }
export interface TrustDispute { initialFriction: number; cleanTransactions: number; daysElapsed: number }
export interface TrustInput {
  bureauSeed?: number;
  completedTransactions: number;
  unitsConsumed: number;
  unitsDelivered: number;
  unitsCommitted: number;
  milestones: TrustMilestone[];
  uniqueCounterparties: number;
  totalTransactions: number;
  rawDisputeFriction: number;
  pendingPenalty: number;
  escalatedDisputes: TrustDispute[];
}

export const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function redemptionFriction(dispute: TrustDispute): number {
  return dispute.initialFriction * Math.max(0, 1 - Math.max(dispute.cleanTransactions / 12, dispute.daysElapsed / 180));
}

export function calculateTrustScore(input: TrustInput) {
  const counts = [input.completedTransactions, input.unitsConsumed, input.unitsDelivered, input.unitsCommitted, input.uniqueCounterparties, input.totalTransactions];
  if (counts.some(value => !Number.isFinite(value) || value < 0)) throw new Error("Trust counts must be finite and non-negative.");
  const bureauSeed = input.bureauSeed ?? TRUST_RULES.defaultSeed;
  if (![bureauSeed, input.rawDisputeFriction, input.pendingPenalty].every(Number.isFinite)) throw new Error("Trust factors must be finite.");
  for (const milestone of input.milestones) {
    if (![milestone.scheduledDue, milestone.actualSettled, milestone.window].every(Number.isFinite) || milestone.window <= 0) throw new Error("Settlement windows must be positive and finite.");
  }
  for (const dispute of input.escalatedDisputes) {
    if (![dispute.initialFriction, dispute.cleanTransactions, dispute.daysElapsed].every(Number.isFinite) || dispute.cleanTransactions < 0 || dispute.daysElapsed < 0) throw new Error("Redemption progress must be finite and non-negative.");
  }
  const fulfillment = input.unitsCommitted === 0 ? 0 : (input.unitsConsumed + input.unitsDelivered) / (2 * input.unitsCommitted);
  const schedule = input.milestones.length === 0 ? 0 : input.milestones.reduce((sum, milestone) => sum + 1 - Math.abs(milestone.scheduledDue - milestone.actualSettled) / milestone.window, 0) / input.milestones.length;
  const reciprocity = input.totalTransactions === 0 ? 0 : Math.min(input.uniqueCounterparties / input.totalTransactions * 3, 1);
  const nativePerformance = 100 * (TRUST_RULES.fulfillmentWeight * fulfillment + TRUST_RULES.scheduleWeight * schedule + TRUST_RULES.reciprocityWeight * reciprocity);
  const effectivePerformance = (TRUST_RULES.seedWeight * bureauSeed + input.completedTransactions * nativePerformance) / (TRUST_RULES.seedWeight + input.completedTransactions);
  const remainingEscalatedFriction = input.escalatedDisputes.reduce((sum, dispute) => sum + redemptionFriction(dispute), 0);
  // rawDisputeFriction excludes escalated disputes, which enter only after decay.
  const rawFriction = input.rawDisputeFriction + remainingEscalatedFriction;
  const disputeFriction = clamp(rawFriction + input.pendingPenalty, -0.25, 1);
  const armorActive = effectivePerformance >= 95 && input.completedTransactions >= 50;
  const omega = armorActive ? 0.5 : 1;
  const unclampedScore = effectivePerformance * (1 - omega * disputeFriction);
  return { score: clamp(unclampedScore, 15, 99.9), unclampedScore, bureauSeed, fulfillment, schedule, reciprocity, nativePerformance, effectivePerformance, rawFriction, remainingEscalatedFriction, disputeFriction, armorActive, omega };
}

export function trustTier(score: number): "low" | "medium" | "high" {
  return score < 50 ? "low" : score <= 75 ? "medium" : "high";
}