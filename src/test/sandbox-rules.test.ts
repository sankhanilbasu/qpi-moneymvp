import { describe, expect, it } from "vitest";
import { emptyWallet, heldTotal, hold, refund, release, STARTING_BALANCE, topUp } from "@/lib/escrow";
import { transition, type Commitment } from "@/lib/commitments";
import { DISPUTE_RULES, trustFromActivity } from "@/lib/activity-trust";
import { calculateTrustScore, TRUST_RULES } from "@/lib/trust-score";
import { legFraction, pointAlong, tripProgress, tripStage } from "@/lib/geo";

const base: Commitment = { id: "c1", threadId: "t1", producerId: "swift", sellerName: "Swift", item: "Parcel", quantity: 2, unitPrice: 8, total: 16, scheduledFor: 0, fulfilment: "delivery", status: "proposed", createdAt: 0 };

describe("Sandbox escrow", () => {
  it("starts with a ₹5,000 balance", () => expect(emptyWallet().balance).toBe(STARTING_BALANCE));
  it("hold moves funds out of the balance into escrow", () => {
    const w = hold(emptyWallet(), "c1", 16, 1);
    expect(w.balance).toBe(4984); expect(heldTotal(w)).toBe(16);
  });
  it("release pays the seller without returning funds", () => {
    const w = release(hold(emptyWallet(), "c1", 16, 1), "c1", 2);
    expect(w.balance).toBe(4984); expect(heldTotal(w)).toBe(0); expect(w.ledger[0]?.kind).toBe("release");
  });
  it("refund returns the held amount", () => expect(refund(hold(emptyWallet(), "c1", 16, 1), "c1", 2).balance).toBe(5000));
  it("rejects holds above the balance — no negative balance", () => expect(() => hold(emptyWallet(), "c1", 5000.01, 1)).toThrow());
  it("rejects double holds and settling without a hold", () => {
    expect(() => hold(hold(emptyWallet(), "c1", 1, 1), "c1", 1, 2)).toThrow();
    expect(() => release(emptyWallet(), "c1", 1)).toThrow();
  });
  it("top-ups must be positive", () => {
    expect(topUp(emptyWallet(), 50, 1).balance).toBe(5050);
    expect(() => topUp(emptyWallet(), 0, 1)).toThrow();
  });
});

describe("Commitment transitions", () => {
  it("accept holds escrow; delivery then completion releases it", () => {
    const a = transition(base, { type: "accept" }, 1);
    expect(a.escrow).toBe("hold");
    const d = transition(a.next, { type: "deliver" }, 2);
    expect(transition(d.next, { type: "complete" }, 3).escrow).toBe("release");
  });
  it("counter offers replace the total when accepted", () => {
    const c = transition(base, { type: "counter", total: 14 }, 1).next;
    expect(transition(c, { type: "acceptCounter" }, 2).next.total).toBe(14);
  });
  it("disputes freeze escrow (no effect) until resolved or escalated", () => {
    const disputed = transition(transition(base, { type: "accept" }, 1).next, { type: "dispute", reason: "Late" }, 2);
    expect(disputed.escrow).toBe("none");
    expect(() => transition(disputed.next, { type: "complete" }, 3)).toThrow();
    expect(transition(disputed.next, { type: "resolve" }, 3).escrow).toBe("release");
    expect(transition(disputed.next, { type: "escalate" }, 3).escrow).toBe("refund");
  });
  it("delivery commitments cannot complete before delivery", () => {
    expect(() => transition(transition(base, { type: "accept" }, 1).next, { type: "complete" }, 2)).toThrow();
  });
});

describe("Activity → Trust inputs", () => {
  const HOUR = 3_600_000;
  const done = (id: string, producerId: string, lateHours = 0): Commitment => ({ ...base, id, producerId, status: "completed", scheduledFor: 10 * HOUR, deliveredAt: (10 + lateHours) * HOUR, completedAt: (10 + lateHours) * HOUR, acceptedAt: 0 });
  it("no activity starts from the bureau seed", () => {
    expect(calculateTrustScore(trustFromActivity([], 0)).score).toBe(TRUST_RULES.defaultSeed);
  });
  it("counts units, counterparties and schedule adherence", () => {
    const t = trustFromActivity([done("a", "swift"), done("b", "atlas", 12)], 0);
    expect(t.completedTransactions).toBe(2);
    expect(t.unitsCommitted).toBe(4); expect(t.unitsConsumed).toBe(4); expect(t.unitsDelivered).toBe(4);
    expect(t.uniqueCounterparties).toBe(2);
    expect(calculateTrustScore(t).schedule).toBe(0.75);
  });
  it("open disputes add a pending penalty; escalations decay with later clean transactions", () => {
    const open: Commitment = { ...base, id: "o", status: "disputed", acceptedAt: 0, dispute: { raisedAt: 0, state: "open", reason: "x" } };
    expect(trustFromActivity([open], 0).pendingPenalty).toBe(DISPUTE_RULES.openPenalty);
    const esc: Commitment = { ...base, id: "e", status: "refunded", acceptedAt: 0, dispute: { raisedAt: 0, state: "escalated", reason: "x", settledAt: 1 } };
    const t = trustFromActivity([esc, done("a", "swift"), done("b", "atlas")], 1);
    expect(t.escalatedDisputes).toEqual([{ initialFriction: DISPUTE_RULES.escalatedFriction, cleanTransactions: 2, daysElapsed: 0 }]);
  });
});

describe("Simulated tracking", () => {
  it("moves through stages over 90 seconds", () => {
    expect(tripStage(tripProgress(0, 0))).toBe("accepted");
    expect(tripStage(tripProgress(0, 20_000))).toBe("picked_up");
    expect(tripStage(tripProgress(0, 45_000))).toBe("on_the_way");
    expect(tripStage(tripProgress(0, 90_000))).toBe("arrived");
  });
  it("courier stays at pickup until 35% and reaches the drop-off at 100%", () => {
    expect(legFraction(0.3)).toBe(0); expect(legFraction(1)).toBe(1);
    expect(pointAlong([[0, 0], [0, 2]], 0.5)).toEqual([0, 1]);
  });
});
