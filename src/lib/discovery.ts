import { demoProducers, profileTrust } from "./trust-demo";
import type { TrustInput } from "./trust-score";
import type { Fulfilment } from "./commitments";
import type { LatLng } from "./geo";
import type { OfferPricing } from "./offer-pricing";

export const categories = [
  { id: "kitchen", label: "Cloud Kitchen", mcc: "5812" },
  { id: "courier", label: "Courier", mcc: "4215" },
  { id: "cab", label: "Cab", mcc: "4121" },
  { id: "music", label: "Music Lessons", mcc: "8299" },
  { id: "crafts", label: "Handmade Crafts", mcc: "5970" },
  { id: "yoga", label: "Yoga Studio", mcc: "7997" },
  { id: "beauty", label: "Beauty Salon", mcc: "7230" },
  { id: "therapy", label: "Therapy Sessions", mcc: "8099" },
  { id: "fitness", label: "Gym Trainer", mcc: "7941" },
  { id: "florist", label: "Florist", mcc: "5992" },
] as const;
export type CategoryId = typeof categories[number]["id"];
export interface ProducerOffer extends OfferPricing { id: string; name: string; detail: string; fulfilment: Fulfilment; photo?: string | undefined }
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
// Fictional upmarket Mumbai storefronts, locations, offers, and distances (INR), not live listings.
export const discoveryProducers: DiscoveryProducer[] = [
  { kind: "demo", id: "riverside", name: "The Bombay Tiffin Room", initials: "BT", category: "kitchen", position: [19.0612,72.8355], distance: "0.4 km", trust: bakery.trust, description: "Gourmet home-style tiffins from a Bandra West cloud kitchen, cooked fresh every morning.", offers: [o("lunch", "Signature veg thali", 450, "Dal makhani, seasonal sabzi, 3 phulkas, jeera rice & salad", "delivery"), o("brunch", "Sunday brunch for two", 1400, "Akuri, misal pav & filter coffee · collection", "pickup")] },
  { kind: "demo", id: "swift", name: "Swift Delivery", initials: "SD", category: "courier", position: [19.0645,72.8402], distance: "0.8 km", trust: profileTrust, description: "Same-hour e-scooter deliveries across Bandra, Khar and Santacruz.", offers: [o("parcel", "Express parcel delivery", 149, "Up to 5 kg · within 5 km · e-scooter", "delivery"), o("weekly", "Weekly business run", 999, "Ten local pickups per week", "delivery")] },
  { kind: "demo", id: "northline", name: "Northline Cabs", initials: "NC", category: "cab", position: [19.0598,72.8298], distance: "0.9 km", trust: farm.trust, description: "Chauffeured Toyota Innova Crysta rides across the western suburbs, booked in chat.", offers: [o("ride", "City ride", 450, "Up to 6 passengers · within 10 km", "delivery"), o("airport", "Airport transfer", 1200, "Mumbai T2 · luggage included", "delivery")] },
  { kind: "demo", id: "studio", name: "Carter Road Keys", initials: "CK", category: "music", position: [19.0555,72.8420], distance: "1.2 km", trust: farm.trust, description: "Trinity-graded piano and keyboard lessons in a sea-facing studio.", offers: [o("piano", "Keyboard lesson", 1500, "45 minutes · all levels", "pickup"), o("grade", "Trinity grade prep", 2500, "60 minutes · exam coaching", "pickup")] },
  { kind: "demo", id: "clay", name: "Clay & Kin, Pali Hill", initials: "CK", category: "crafts", position: [19.0520,72.8340], distance: "1.0 km", trust: bakery.trust, description: "Hand-thrown terracotta, studio ceramics and handmade gifts.", offers: [o("mug", "Terracotta kulhad set", 1200, "Set of 4 · hand-glazed", "delivery"), o("workshop", "Pottery workshop", 3500, "Two hours · materials included", "pickup")] },
  { kind: "demo", id: "copperleaf", name: "Copperleaf Konkan Kitchen", initials: "CK", category: "kitchen", position: [19.0680,72.8330], distance: "1.4 km", trust: farm.trust, description: "Coastal Konkani dinners from a chef-led Khar kitchen.", offers: [o("supper", "Surmai curry rice bowl", 650, "Kingfish curry, red rice & sol kadhi", "delivery")] },
  { kind: "demo", id: "atlas", name: "Atlas Dispatch", initials: "AD", category: "courier", position: [19.0590,72.8460], distance: "1.5 km", trust: repair.trust, description: "EV van pickups and small-business dispatch across Mumbai.", offers: [o("collection", "Neighbourhood pickup", 199, "One parcel · up to 10 kg", "delivery")] },
  { kind: "demo", id: "yoga", name: "Prana Loft Yoga", initials: "PL", category: "yoga", position: [19.0632,72.8288], distance: "0.7 km", trust: bakery.trust, description: "Vinyasa and Hatha classes in a sunlit loft off Bandstand.", offers: [o("drop", "Drop-in class", 900, "60 minutes · mats provided", "pickup"), o("private", "Private session at home", 3000, "75 minutes · certified instructor", "delivery")] },
  { kind: "demo", id: "salon", name: "Pali Hill Beauty Lounge", initials: "PH", category: "beauty", position: [19.0668,72.8270], distance: "1.1 km", trust: farm.trust, description: "Hair, skin and bridal styling by senior stylists.", offers: [o("blow", "Wash & blow-dry", 1800, "45 minutes · senior stylist", "pickup"), o("facial", "Signature hydra facial", 4500, "60 minutes · all skin types", "pickup")] },
  { kind: "demo", id: "therapy", name: "Stillwater Therapy", initials: "ST", category: "therapy", position: [19.0575,72.8378], distance: "0.9 km", trust: bakery.trust, description: "Confidential counselling with a licensed clinical psychologist.", offers: [o("session", "Individual therapy session", 3000, "50 minutes · in-studio or video", "pickup"), o("couples", "Couples session", 4500, "75 minutes", "pickup")] },
  { kind: "demo", id: "trainer", name: "Kabir Fit Coaching", initials: "KF", category: "fitness", position: [19.0702,72.8395], distance: "1.6 km", trust: profileTrust, description: "Certified strength and conditioning coach at a Khar gym or your building.", offers: [o("pt", "Personal training session", 1500, "60 minutes · gym or home", "delivery"), o("pack", "12-session transformation pack", 15000, "Plan, nutrition & check-ins", "pickup")] },
  { kind: "demo", id: "guitar", name: "Strum Studio Bandra", initials: "SS", category: "music", position: [19.0548,72.8312], distance: "1.3 km", trust: farm.trust, description: "Acoustic and electric guitar classes for beginners to performers.", offers: [o("guitar", "Guitar class", 1200, "45 minutes · guitar provided", "pickup"), o("month", "Monthly guitar plan", 4000, "Four weekly classes", "pickup")] },
  { kind: "demo", id: "florist", name: "Bloom & Bough", initials: "BB", category: "florist", position: [19.0620,72.8445], distance: "1.0 km", trust: bakery.trust, description: "Luxury bouquets, marigold décor and same-day flower delivery.", offers: [o("bouquet", "Signature rose bouquet", 2200, "24 stems · hand-tied", "delivery"), o("decor", "Pooja marigold décor", 3500, "Home setup included", "delivery")] },
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
