import { useMemo } from "react";
import { trustFromActivity } from "./activity-trust";
import { discoveryProducers, initialsOf, type DiscoveryProducer } from "./discovery";
import { useSandbox, type SandboxState } from "./sandbox-store";

export const OWN_ID = "me";

/** Demo listings plus the signed-in user's published storefront. */
export function allProducers(s: SandboxState, now: number): DiscoveryProducer[] {
  const live = s.offers.filter(o => !o.paused);
  if (!s.storefront || !live.length) return discoveryProducers;
  const own: DiscoveryProducer = {
    kind: "own", id: OWN_ID, name: s.storefront.name, initials: initialsOf(s.storefront.name), category: s.storefront.category,
    position: s.storefront.position, distance: "Your storefront", trust: trustFromActivity(s.commitments, now), description: s.storefront.description,
    offers: live.map(o => ({ id: o.id, name: o.title, price: o.price, wholesale: o.wholesale, detail: `${o.schedule} · ${o.fulfilment === "delivery" ? "Delivery" : "Pickup"}`, fulfilment: o.fulfilment, photo: o.photo })),
  };
  return [own, ...discoveryProducers];
}
export function useProducers() {
  const s = useSandbox();
  return useMemo(() => allProducers(s, Date.now()), [s]);
}
export function useMyTrust() {
  const s = useSandbox();
  return useMemo(() => trustFromActivity(s.commitments, Date.now()), [s.commitments]);
}
