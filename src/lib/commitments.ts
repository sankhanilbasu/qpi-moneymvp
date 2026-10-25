import type { LatLng } from "./geo";

export type CommitmentStatus = "proposed" | "countered" | "accepted" | "delivered" | "completed" | "declined" | "disputed" | "refunded";
export type Fulfilment = "delivery" | "pickup";
export interface Dispute { raisedAt: number; state: "open" | "resolved" | "escalated"; settledAt?: number | undefined; reason: string }
export interface Commitment {
  id: string; threadId: string; producerId: string; sellerName: string;
  item: string; quantity: number; unitPrice: number; total: number;
  scheduledFor: number; fulfilment: Fulfilment;
  pickup?: LatLng | undefined; dropoff?: LatLng | undefined;
  status: CommitmentStatus; counterTotal?: number | undefined;
  createdAt: number; acceptedAt?: number | undefined; deliveredAt?: number | undefined; completedAt?: number | undefined;
  dispute?: Dispute | undefined;
}
export type CommitmentAction =
  | { type: "accept" } | { type: "decline" } | { type: "counter"; total: number } | { type: "acceptCounter" }
  | { type: "deliver" } | { type: "complete" } | { type: "dispute"; reason: string } | { type: "resolve" } | { type: "escalate" };

/** Escrow effect the store must apply alongside each transition. */
export type EscrowEffect = "hold" | "release" | "refund" | "none";

export function transition(c: Commitment, action: CommitmentAction, now: number): { next: Commitment; escrow: EscrowEffect } {
  const fail = () => { throw new Error(`Cannot ${action.type} a ${c.status} commitment.`); };
  switch (action.type) {
    case "accept": if (c.status !== "proposed") fail(); return { next: { ...c, status: "accepted", acceptedAt: now }, escrow: "hold" };
    case "decline": if (c.status !== "proposed" && c.status !== "countered") fail(); return { next: { ...c, status: "declined" }, escrow: "none" };
    case "counter":
      if (c.status !== "proposed") fail();
      if (!Number.isFinite(action.total) || action.total <= 0) throw new Error("Counter offer must be positive.");
      return { next: { ...c, status: "countered", counterTotal: action.total }, escrow: "none" };
    case "acceptCounter":
      if (c.status !== "countered" || c.counterTotal === undefined) fail();
      return { next: { ...c, status: "accepted", total: c.counterTotal ?? c.total, acceptedAt: now }, escrow: "hold" };
    case "deliver": if (c.status !== "accepted") fail(); return { next: { ...c, status: "delivered", deliveredAt: now }, escrow: "none" };
    case "complete":
      if (c.status !== "delivered" && !(c.status === "accepted" && c.fulfilment === "pickup")) fail();
      return { next: { ...c, status: "completed", deliveredAt: c.deliveredAt ?? now, completedAt: now }, escrow: "release" };
    case "dispute":
      if (c.status !== "accepted" && c.status !== "delivered") fail();
      return { next: { ...c, status: "disputed", dispute: { raisedAt: now, state: "open", reason: action.reason } }, escrow: "none" };
    case "resolve":
      if (c.status !== "disputed" || c.dispute?.state !== "open") fail();
      return { next: { ...c, status: "completed", deliveredAt: c.deliveredAt ?? now, completedAt: now, dispute: { ...c.dispute!, state: "resolved", settledAt: now } }, escrow: "release" };
    case "escalate":
      if (c.status !== "disputed" || c.dispute?.state !== "open") fail();
      return { next: { ...c, status: "refunded", dispute: { ...c.dispute!, state: "escalated", settledAt: now } }, escrow: "refund" };
  }
}

export const isActive = (c: Commitment) => ["proposed", "countered", "accepted", "delivered", "disputed"].includes(c.status);
