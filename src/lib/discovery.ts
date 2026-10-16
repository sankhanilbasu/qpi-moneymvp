import { demoProducers, profileTrust } from "./trust-demo";
import type { TrustInput } from "./trust-score";

export const categories = [
  { id: "kitchen", label: "Cloud Kitchen", mcc: "5812" },
  { id: "courier", label: "Courier", mcc: "4215" },
  { id: "music", label: "Music Lessons", mcc: "8299" },
  { id: "crafts", label: "Handmade Crafts", mcc: "5970" },
] as const;
export type CategoryId = typeof categories[number]["id"];
export interface DiscoveryProducer {
  id: string; name: string; initials: string; category: CategoryId;
  position: [number, number]; distance: string; trust: TrustInput;
  description: string; offers: { name: string; price: string; detail: string }[];
}
const bakery = demoProducers[0];
const farm = demoProducers[1];
const repair = demoProducers[2];
if (!bakery || !farm || !repair) throw new Error("Missing illustrative Trust histories.");
// Fictional London producers, locations, offers, and distances, not live listings.
export const discoveryProducers: DiscoveryProducer[] = [
  { id: "riverside", name: "Riverside Kitchen", initials: "RK", category: "kitchen", position: [51.521,-0.077], distance: "0.4 km", trust: bakery.trust, description: "Small-batch lunches, baked fresh in Shoreditch.", offers: [{ name: "Seasonal lunch box", price: "£12", detail: "Roasted vegetables, grains & sourdough" }, { name: "Weekend brunch for two", price: "£28", detail: "Two brunch boxes · collection" }] },
  { id: "swift", name: "Swift Cycle", initials: "SC", category: "courier", position: [51.524,-0.071], distance: "0.8 km", trust: profileTrust, description: "Independent cycle courier for neighbourhood deliveries.", offers: [{ name: "Local parcel delivery", price: "£8", detail: "Up to 3 kg · within 3 km" }, { name: "Weekly delivery run", price: "£35", detail: "Five local collections" }] },
  { id: "studio", name: "Little Sound Studio", initials: "LS", category: "music", position: [51.517,-0.066], distance: "1.2 km", trust: farm.trust, description: "Patient, one-to-one music lessons for all levels.", offers: [{ name: "Piano lesson", price: "£30", detail: "45 minutes · all levels" }, { name: "Guitar starter session", price: "£25", detail: "30 minutes · instrument provided" }] },
  { id: "clay", name: "Clay & Thread", initials: "CT", category: "crafts", position: [51.514,-0.08], distance: "1.0 km", trust: bakery.trust, description: "Hand-thrown ceramics and considered handmade pieces.", offers: [{ name: "Stoneware mug", price: "£22", detail: "Hand-glazed · made to order" }, { name: "Pottery workshop", price: "£45", detail: "Two hours · materials included" }] },
  { id: "copperleaf", name: "Copperleaf Table", initials: "CT", category: "kitchen", position: [51.527,-0.081], distance: "1.4 km", trust: farm.trust, description: "Plant-forward suppers from a small independent kitchen.", offers: [{ name: "Supper bowl", price: "£14", detail: "Seasonal vegetables & house dressing" }] },
  { id: "atlas", name: "Atlas Dispatch", initials: "AD", category: "courier", position: [51.52,-0.089], distance: "1.5 km", trust: repair.trust, description: "Local parcel collections and small-business dispatch.", offers: [{ name: "Neighbourhood collection", price: "£10", detail: "One parcel · up to 5 kg" }] },
];

export function filterProducers(producers: DiscoveryProducer[], category: CategoryId | "all", search: string) {
  const query = search.trim().toLowerCase();
  return producers.filter(producer => (category === "all" || producer.category === category) && `${producer.name} ${producer.description} ${categories.find(c => c.id === producer.category)?.label} ${producer.offers.map(o => o.name).join(" ")}`.toLowerCase().includes(query));
}