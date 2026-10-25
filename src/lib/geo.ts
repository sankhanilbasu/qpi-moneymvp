export type LatLng = [number, number];

export function haversineKm(a: LatLng, b: LatLng): number {
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b[0] - a[0]), dLng = rad(b[1] - a[1]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a[0])) * Math.cos(rad(b[0])) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}
export const formatKm = (km: number) => (km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`);

/** Point at a fraction (0–1) of the path's total length. */
export function pointAlong(path: LatLng[], fraction: number): LatLng {
  const first = path[0];
  if (!first) throw new Error("Path is empty.");
  const f = Math.min(1, Math.max(0, fraction));
  const segments = path.slice(1).map((p, i) => haversineKm(path[i]!, p));
  const total = segments.reduce((s, v) => s + v, 0);
  if (total === 0) return first;
  let remaining = f * total;
  for (let i = 0; i < segments.length; i++) {
    const len = segments[i]!;
    if (remaining <= len) {
      const a = path[i]!, b = path[i + 1]!, t = len === 0 ? 0 : remaining / len;
      return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
    }
    remaining -= len;
  }
  return path[path.length - 1]!;
}

/** Simulated trip: the courier reaches pickup by 35%, then travels to the drop-off. */
export const TRIP_DURATION_MS = 90_000;
export type TripStage = "accepted" | "picked_up" | "on_the_way" | "arrived";
export const tripProgress = (startedAt: number, now: number, duration = TRIP_DURATION_MS) => Math.min(1, Math.max(0, (now - startedAt) / duration));
export function tripStage(progress: number): TripStage {
  return progress >= 1 ? "arrived" : progress >= 0.35 ? "on_the_way" : progress >= 0.2 ? "picked_up" : "accepted";
}
/** Fraction of the pickup → drop-off leg the courier has covered. */
export const legFraction = (progress: number) => Math.max(0, (progress - 0.35) / 0.65);
export const etaMinutes = (progress: number, tripMinutes: number) => Math.ceil((1 - progress) * tripMinutes);

let lastSearch = 0;
export interface PlaceResult { label: string; position: LatLng }
/** Free OpenStreetMap search; spaced to respect Nominatim's 1 request/second policy. */
export async function searchPlaces(query: string, near?: LatLng): Promise<PlaceResult[]> {
  const wait = Math.max(0, 1000 - (Date.now() - lastSearch));
  if (wait) await new Promise(r => setTimeout(r, wait));
  lastSearch = Date.now();
  const params = new URLSearchParams({ q: query, format: "json", limit: "5" });
  if (near) params.set("viewbox", `${near[1] - 0.2},${near[0] + 0.2},${near[1] + 0.2},${near[0] - 0.2}`);
  const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error("Address search is unavailable.");
  const rows = (await res.json()) as { display_name: string; lat: string; lon: string }[];
  return rows.map(r => ({ label: r.display_name, position: [Number(r.lat), Number(r.lon)] }));
}

/** Road route from the free OSRM demo server, falling back to a straight line. */
export async function fetchRoute(a: LatLng, b: LatLng): Promise<{ path: LatLng[]; minutes: number; road: boolean }> {
  try {
    const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${a[1]},${a[0]};${b[1]},${b[0]}?overview=full&geometries=geojson`);
    if (!res.ok) throw new Error();
    const data = (await res.json()) as { routes?: { duration: number; geometry: { coordinates: [number, number][] } }[] };
    const route = data.routes?.[0];
    if (!route) throw new Error();
    return { path: route.geometry.coordinates.map(([lng, lat]) => [lat, lng]), minutes: Math.max(1, Math.round(route.duration / 60)), road: true };
  } catch {
    return { path: [a, b], minutes: Math.max(3, Math.round(haversineKm(a, b) * 4)), road: false };
  }
}
