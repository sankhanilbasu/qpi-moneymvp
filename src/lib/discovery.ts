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
export const formatPrice = (value: number) => `£${value % 1 === 0 ? value : value.toFixed(2)}`;
export const SANDBOX_CENTER: LatLng = [51.52, -0.077];

const bakery = demoProducers[0];
const farm = demoProducers[1];
const repair = demoProducers[2];
if (!bakery || !farm || !repair) throw new Error("Missing illustrative Trust histories.");
const o = (id: string, name: string, price: number, detail: string, fulfilment: Fulfilment): ProducerOffer => ({ id, name, price, detail, fulfilment });
// Fictional London producers, locations, offers, and distances, not live listings.
export const discoveryProducers: DiscoveryProducer[] = [
  { kind: "demo", id: "riverside", name: "Riverside Kitchen", initials: "RK", category: "kitchen", position: [51.521,-0.077], distance: "0.4 km", trust: bakery.trust, description: "Small-batch lunches, baked fresh in Shoreditch.", offers: [o("lunch", "Seasonal lunch box", 12, "Roasted vegetables, grains & sourdough", "delivery"), o("brunch", "Weekend brunch for two", 28, "Two brunch boxes · collection", "pickup")] },
  { kind: "demo", id: "swift", name: "Swift Cycle", initials: "SC", category: "courier", position: [51.524,-0.071], distance: "0.8 km", trust: profileTrust, description: "Independent cycle courier for neighbourhood deliveries.", offers: [o("parcel", "Local parcel delivery", 8, "Up to 3 kg · within 3 km", "delivery"), o("weekly", "Weekly delivery run", 35, "Five local collections", "delivery")] },
  { kind: "demo", id: "northline", name: "Northline Cabs", initials: "NC", category: "cab", position: [51.523,-0.084], distance: "0.9 km", trust: farm.trust, description: "Licensed neighbourhood minicab rides, booked in chat.", offers: [o("ride", "City ride", 14, "Up to 4 passengers · within 5 km", "delivery"), o("airport", "Airport transfer", 55, "City Airport · luggage included", "delivery")] },
  { kind: "demo", id: "studio", name: "Little Sound Studio", initials: "LS", category: "music", position: [51.517,-0.066], distance: "1.2 km", trust: farm.trust, description: "Patient, one-to-one music lessons for all levels.", offers: [o("piano", "Piano lesson", 30, "45 minutes · all levels", "pickup"), o("guitar", "Guitar starter session", 25, "30 minutes · instrument provided", "pickup")] },
  { kind: "demo", id: "clay", name: "Clay & Thread", initials: "CT", category: "crafts", position: [51.514,-0.08], distance: "1.0 km", trust: bakery.trust, description: "Hand-thrown ceramics and considered handmade pieces.", offers: [o("mug", "Stoneware mug", 22, "Hand-glazed · made to order", "delivery"), o("workshop", "Pottery workshop", 45, "Two hours · materials included", "pickup")] },
  { kind: "demo", id: "copperleaf", name: "Copperleaf Table", initials: "CT", category: "kitchen", position: [51.527,-0.081], distance: "1.4 km", trust: farm.trust, description: "Plant-forward suppers from a small independent kitchen.", offers: [o("supper", "Supper bowl", 14, "Seasonal vegetables & house dressing", "delivery")] },
  { kind: "demo", id: "atlas", name: "Atlas Dispatch", initials: "AD", category: "courier", position: [51.52,-0.089], distance: "1.5 km", trust: repair.trust, description: "Local parcel collections and small-business dispatch.", offers: [o("collection", "Neighbourhood collection", 10, "One parcel · up to 5 kg", "delivery")] },
];

export const initialsOf = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]?.toUpperCase()).join("") || "QP";

export function filterProducers(producers: DiscoveryProducer[], category: CategoryId | "all", search: string) {
  const query = search.trim().toLowerCase();
  return producers.filter(producer => (category === "all" || producer.category === category) && `${producer.name} ${producer.description} ${categories.find(c => c.id === producer.category)?.label} ${producer.offers.map(o => o.name).join(" ")}`.toLowerCase().includes(query));
}
