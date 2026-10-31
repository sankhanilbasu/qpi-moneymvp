import { demoProducers, profileTrust } from "./trust-demo";
import type { TrustInput } from "./trust-score";
import type { Fulfilment } from "./commitments";
import type { LatLng } from "./geo";

export const categories = [
  { id: "kitchen", label: "Cloud Kitchen", mcc: "5812" },
  { id: "courier", label: "Courier", mcc: "4215" },
  { id: "cab", label: "Cab", mcc: "4121" },
  { id: "music", label: "Music Lessons", mcc: "8299" },
  { id: "crafts", label: "Handmade Crafts", mcc: "5970" },
] as const;
export type CategoryId = typeof categories[number]["id"];
export interface ProducerOffer { id: string; name: string; price: number; detail: string; fulfilment: Fulfilment; photo?: string | undefined }
export interface DiscoveryProducer {
  id: string; name: string; initials: string; category: CategoryId;
  position: LatLng; distance: string; trust: TrustInput;
  description: string; offers: ProducerOffer[];
  /** Demo listings carry illustrative Trust histories; "me" uses sandbox activity. */
  kind: "demo" | "own";
}
export const formatPrice = (value: number) => `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
export const SANDBOX_CENTER: LatLng = [19.06, 72.836];

const bakery = demoProducers[0];
const farm = demoProducers[1];
const repair = demoProducers[2];
if (!bakery || !farm || !repair) throw new Error("Missing illustrative Trust histories.");
const o = (id: string, name: string, price: number, detail: string, fulfilment: Fulfilment): ProducerOffer => ({ id, name, price, detail, fulfilment });
// Fictional Mumbai producers, locations, offers, and distances (INR), not live listings.
export const discoveryProducers: DiscoveryProducer[] = [
  { kind: "demo", id: "riverside", name: "Riverside Kitchen", initials: "RK", category: "kitchen", position: [19.0612,72.8355], distance: "0.4 km", trust: bakery.trust, description: "Home-style tiffins cooked fresh every morning in Bandra West.", offers: [o("lunch", "Veg thali tiffin", 180, "Dal, sabzi, 3 rotis, rice & salad", "delivery"), o("brunch", "Sunday brunch for two", 650, "Misal pav, poha & masala chai · collection", "pickup")] },
  { kind: "demo", id: "swift", name: "Swift Cycle", initials: "SC", category: "courier", position: [19.0645,72.8402], distance: "0.8 km", trust: profileTrust, description: "Same-day neighbourhood deliveries across Bandra and Khar.", offers: [o("parcel", "Local parcel delivery", 80, "Up to 3 kg · within 3 km", "delivery"), o("weekly", "Weekly delivery run", 450, "Five local pickups", "delivery")] },
  { kind: "demo", id: "northline", name: "Northline Cabs", initials: "NC", category: "cab", position: [19.0598,72.8298], distance: "0.9 km", trust: farm.trust, description: "AC cab rides around the western suburbs, booked in chat.", offers: [o("ride", "City ride", 250, "Up to 4 passengers · within 8 km", "delivery"), o("airport", "Airport transfer", 600, "Mumbai T2 · luggage included", "delivery")] },
  { kind: "demo", id: "studio", name: "Little Sound Studio", initials: "LS", category: "music", position: [19.0555,72.8420], distance: "1.2 km", trust: farm.trust, description: "Patient one-to-one keyboard, guitar and tabla lessons for all ages.", offers: [o("piano", "Keyboard lesson", 800, "45 minutes · all levels", "pickup"), o("guitar", "Guitar starter session", 600, "30 minutes · instrument provided", "pickup")] },
  { kind: "demo", id: "clay", name: "Clay & Thread", initials: "CT", category: "crafts", position: [19.0520,72.8340], distance: "1.0 km", trust: bakery.trust, description: "Hand-thrown terracotta, block prints and handmade gifts.", offers: [o("mug", "Terracotta kulhad set", 550, "Set of 4 · hand-glazed", "delivery"), o("workshop", "Pottery workshop", 1500, "Two hours · materials included", "pickup")] },
  { kind: "demo", id: "copperleaf", name: "Copperleaf Table", initials: "CT", category: "kitchen", position: [19.0680,72.8330], distance: "1.4 km", trust: farm.trust, description: "Coastal Konkani dinners from a small home kitchen.", offers: [o("supper", "Fish curry rice bowl", 320, "Surmai curry, rice & sol kadhi", "delivery")] },
  { kind: "demo", id: "atlas", name: "Atlas Dispatch", initials: "AD", category: "courier", position: [19.0590,72.8460], distance: "1.5 km", trust: repair.trust, description: "Parcel pickups and small-business dispatch across Mumbai.", offers: [o("collection", "Neighbourhood pickup", 120, "One parcel · up to 5 kg", "delivery")] },
];

export const initialsOf = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]?.toUpperCase()).join("") || "QP";

export function filterProducers(producers: DiscoveryProducer[], category: CategoryId | "all", search: string) {
  const query = search.trim().toLowerCase();
  return producers.filter(producer => (category === "all" || producer.category === category) && `${producer.name} ${producer.description} ${categories.find(c => c.id === producer.category)?.label} ${producer.offers.map(o => o.name).join(" ")}`.toLowerCase().includes(query));
}

/** Demo-only live presence, deterministic per producer and hour. Not real viewer data. */
export function liveStatus(id: string, now: number) {
  const hour = Math.floor(now / 3_600_000);
  let h = hour; for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return { live: h % 4 !== 0, viewers: 3 + (h % 37) };
}
