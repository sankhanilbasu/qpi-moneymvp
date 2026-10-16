import { describe, expect, it } from "vitest";
import { calculateTrustScore, redemptionFriction, trustTier, type TrustInput } from "@/lib/trust-score";

const perfect: TrustInput = { completedTransactions: 50, unitsConsumed: 100, unitsDelivered: 100, unitsCommitted: 100, milestones: [{ scheduledDue: 100, actualSettled: 100, window: 10 }], uniqueCounterparties: 20, totalTransactions: 50, rawDisputeFriction: 0, pendingPenalty: 0, escalatedDisputes: [] };

describe("Trust score whitepaper rules", () => {
  it("defaults to a 75 bureau seed with 5 phantom transactions and zero native history", () => {
    expect(calculateTrustScore({ ...perfect, completedTransactions: 0, unitsCommitted: 0, totalTransactions: 0, milestones: [] }).score).toBe(75);
    expect(calculateTrustScore({ ...perfect, completedTransactions: 5 }).effectivePerformance).toBe(87.5);
  });
  it("averages consumed and delivered units over twice the committed units", () => {
    expect(calculateTrustScore({ ...perfect, unitsConsumed: 60, unitsDelivered: 80 }).fulfillment).toBe(0.7);
  });
  it("averages absolute early and late settlement deviations divided by each window", () => {
    expect(calculateTrustScore({ ...perfect, milestones: [{ scheduledDue: 100, actualSettled: 90, window: 20 }, { scheduledDue: 100, actualSettled: 105, window: 20 }] }).schedule).toBe(0.625);
  });
  it("caps three times the unique counterparty ratio at 1", () => {
    expect(calculateTrustScore({ ...perfect, uniqueCounterparties: 5 }).reciprocity).toBeCloseTo(0.3);
    expect(calculateTrustScore(perfect).reciprocity).toBe(1);
  });
  it("weights native ratios 0.5, 0.3 and 0.2 and converts to seed percentage points", () => {
    const result = calculateTrustScore({ ...perfect, unitsConsumed: 60, unitsDelivered: 80, uniqueCounterparties: 5, milestones: [{ scheduledDue: 100, actualSettled: 105, window: 20 }] });
    expect(result.nativePerformance).toBeCloseTo(63.5);
    expect(result.effectivePerformance).toBeCloseTo((5 * 75 + 50 * 63.5) / 55);
  });
  it("clamps raw friction plus pending penalties to -0.25 and 1", () => {
    expect(calculateTrustScore({ ...perfect, rawDisputeFriction: -0.5, pendingPenalty: 0.1 }).disputeFriction).toBe(-0.25);
    expect(calculateTrustScore({ ...perfect, rawDisputeFriction: 0.8, pendingPenalty: 0.4 }).disputeFriction).toBe(1);
  });
  it("redeems over the greater of 12 clean transactions or 180 days", () => {
    expect(redemptionFriction({ initialFriction: 0.24, cleanTransactions: 3, daysElapsed: 90 })).toBe(0.12);
    expect(redemptionFriction({ initialFriction: 0.24, cleanTransactions: 12, daysElapsed: 0 })).toBe(0);
    expect(redemptionFriction({ initialFriction: 0.24, cleanTransactions: 0, daysElapsed: 180 })).toBe(0);
    expect(redemptionFriction({ initialFriction: 0.24, cleanTransactions: 24, daysElapsed: 360 })).toBe(0);
  });
  it("uses decayed escalations once in raw friction before adding pending penalty", () => {
    expect(calculateTrustScore({ ...perfect, rawDisputeFriction: 0.02, pendingPenalty: 0.03, escalatedDisputes: [{ initialFriction: 0.24, cleanTransactions: 6, daysElapsed: 0 }] }).disputeFriction).toBeCloseTo(0.17);
  });
  it("activates armor only at performance >=95 and count >=50, including exact boundaries", () => {
    expect(calculateTrustScore({ ...perfect, bureauSeed: 45 }).effectivePerformance).toBe(95);
    expect(calculateTrustScore({ ...perfect, bureauSeed: 45 }).omega).toBe(0.5);
    expect(calculateTrustScore({ ...perfect, bureauSeed: 44.9 }).omega).toBe(1);
    expect(calculateTrustScore({ ...perfect, bureauSeed: 100, completedTransactions: 49 }).omega).toBe(1);
  });
  it("applies the master penalty and halves it under armor", () => {
    expect(calculateTrustScore({ ...perfect, bureauSeed: 45, rawDisputeFriction: 0.2 }).score).toBe(85.5);
    const result = calculateTrustScore({ ...perfect, completedTransactions: 10, rawDisputeFriction: 0.2 });
    expect(result.score).toBeCloseTo(result.effectivePerformance * 0.8);
  });
  it("clamps the final score at 15.0 and 99.9, including negative friction boosts", () => {
    expect(calculateTrustScore({ ...perfect, completedTransactions: 49, rawDisputeFriction: 1 }).score).toBe(15);
    expect(calculateTrustScore({ ...perfect, bureauSeed: 100 }).score).toBe(99.9);
    expect(calculateTrustScore({ ...perfect, rawDisputeFriction: -0.25 }).score).toBe(99.9);
  });
  it("uses red below 50, amber 50–75, and emerald above 75", () => {
    expect(trustTier(49.9)).toBe("low"); expect(trustTier(50)).toBe("medium");
    expect(trustTier(75)).toBe("medium"); expect(trustTier(75.1)).toBe("high");
  });
  it("rejects zero settlement windows rather than producing non-finite scores", () => {
    expect(() => calculateTrustScore({ ...perfect, milestones: [{ scheduledDue: 1, actualSettled: 1, window: 0 }] })).toThrow();
  });
  it.each([[1,79.1666666667],[4,86.1111111111],[6,88.6363636364]])("blends the 75 bureau seed at %i native transactions", (count, expected) => {
    expect(calculateTrustScore({ ...perfect, completedTransactions: count }).effectivePerformance).toBeCloseTo(expected);
  });
  it("uses a supplied bureau seed, even zero, for cold starts", () => {
    expect(calculateTrustScore({ ...perfect, completedTransactions: 0, bureauSeed: 0 }).effectivePerformance).toBe(0);
    expect(calculateTrustScore({ ...perfect, completedTransactions: 0, bureauSeed: 90 }).score).toBe(90);
  });
  it("defines zero denominators and absent milestones without NaN", () => {
    const result = calculateTrustScore({ ...perfect, unitsCommitted: 0, totalTransactions: 0, milestones: [] });
    expect(result.fulfillment).toBe(0); expect(result.schedule).toBe(0); expect(result.reciprocity).toBe(0); expect(result.score).toBe(15);
  });
  it("preserves the literal fulfillment ratio for over-delivery", () => {
    expect(calculateTrustScore({ ...perfect, unitsConsumed: 120, unitsDelivered: 120 }).fulfillment).toBe(1.2);
  });
  it("preserves negative schedule accuracy beyond the settlement window", () => {
    const result = calculateTrustScore({ ...perfect, milestones: [{ scheduledDue: 100, actualSettled: 130, window: 10 }] });
    expect(result.schedule).toBe(-2); expect(result.nativePerformance).toBeCloseTo(10);
  });
  it("has zero reciprocity without counterparties and saturates at one-third", () => {
    expect(calculateTrustScore({ ...perfect, uniqueCounterparties: 0 }).reciprocity).toBe(0);
    expect(calculateTrustScore({ ...perfect, totalTransactions: 12, uniqueCounterparties: 4 }).reciprocity).toBe(1);
  });
  it("redeems via clean transactions when they outpace time", () => {
    expect(redemptionFriction({ initialFriction: 0.24, cleanTransactions: 9, daysElapsed: 30 })).toBe(0.06);
    expect(redemptionFriction({ initialFriction: 0.24, cleanTransactions: 0, daysElapsed: 0 })).toBe(0.24);
  });
  it("adds multiple decayed escalations exactly once before the friction clamp", () => {
    const result = calculateTrustScore({ ...perfect, rawDisputeFriction: 0.2, pendingPenalty: 0.1, escalatedDisputes: [{ initialFriction: 0.24, cleanTransactions: 6, daysElapsed: 0 }, { initialFriction: 0.4, cleanTransactions: 0, daysElapsed: 90 }] });
    expect(result.remainingEscalatedFriction).toBeCloseTo(0.32); expect(result.disputeFriction).toBeCloseTo(0.62);
  });
  it("clamps escalated friction plus pending penalties at the upper bound", () => {
    expect(calculateTrustScore({ ...perfect, rawDisputeFriction: 0.8, pendingPenalty: 0.2, escalatedDisputes: [{ initialFriction: 0.2, cleanTransactions: 0, daysElapsed: 0 }] }).disputeFriction).toBe(1);
  });
  it("preserves friction at both exact clamp boundaries", () => {
    expect(calculateTrustScore({ ...perfect, rawDisputeFriction: -0.25 }).disputeFriction).toBe(-0.25);
    expect(calculateTrustScore({ ...perfect, rawDisputeFriction: 1 }).disputeFriction).toBe(1);
  });
  it("preserves final Trust scores at exact master clamp boundaries", () => {
    expect(calculateTrustScore({ ...perfect, completedTransactions: 0, bureauSeed: 15 }).score).toBe(15);
    expect(calculateTrustScore({ ...perfect, completedTransactions: 0, bureauSeed: 99.9 }).score).toBe(99.9);
  });
  it("requires the count threshold even with effective performance exactly 95", () => {
    const result = calculateTrustScore({ ...perfect, completedTransactions: 49, bureauSeed: 46, rawDisputeFriction: 0.2 });
    expect(result.effectivePerformance).toBe(95); expect(result.omega).toBe(1); expect(result.score).toBe(76);
  });
  it("armor retains half of performance even at maximum dispute friction", () => {
    expect(calculateTrustScore({ ...perfect, bureauSeed: 45, rawDisputeFriction: 1 }).score).toBe(47.5);
  });
  it.each([-1, NaN, Infinity])("rejects invalid native transaction count %s", value => {
    expect(() => calculateTrustScore({ ...perfect, completedTransactions: value })).toThrow();
  });
  it.each([NaN, Infinity])("rejects non-finite bureau seed %s", value => {
    expect(() => calculateTrustScore({ ...perfect, bureauSeed: value })).toThrow();
  });
  it.each([-10,NaN,Infinity])("rejects invalid settlement window %s", value => {
    expect(() => calculateTrustScore({ ...perfect, milestones: [{ scheduledDue: 1, actualSettled: 1, window: value }] })).toThrow();
  });
  it("rejects invalid redemption progress and non-finite dispute factors", () => {
    expect(() => calculateTrustScore({ ...perfect, escalatedDisputes: [{ initialFriction: 0.2, cleanTransactions: -1, daysElapsed: 0 }] })).toThrow();
    expect(() => calculateTrustScore({ ...perfect, escalatedDisputes: [{ initialFriction: 0.2, cleanTransactions: 0, daysElapsed: Infinity }] })).toThrow();
    expect(() => calculateTrustScore({ ...perfect, rawDisputeFriction: NaN })).toThrow();
    expect(() => calculateTrustScore({ ...perfect, pendingPenalty: Infinity })).toThrow();
  });
  it("rejects overflowed intermediate performance instead of returning NaN", () => {
    expect(() => calculateTrustScore({ ...perfect, completedTransactions: Number.MAX_VALUE })).toThrow();
  });
});